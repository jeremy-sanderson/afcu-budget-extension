import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Window as HappyDomWindow } from 'happy-dom';
import {
    ACCOUNT_HISTORY_MESSAGE_SOURCE,
    isAccountHistoryRequest,
    mapHistoryTransaction,
    parseAccountHistoryUrl,
    requestCapturedTransactions,
    type AccountHistoryTransaction,
    type CapturedTransaction,
} from './accountHistory';

const PAGE_URL = 'https://digital.americafirst.com/americafirstdigitalbanking/uux.aspx';
const HISTORY_BASE = 'https://digital.americafirst.com/americafirstdigitalbanking/mobilews';

describe('parseAccountHistoryUrl', () => {
    it('reads the account ID and page number', () => {
        expect(
            parseAccountHistoryUrl(
                `${HISTORY_BASE}/accountHistory/1234567?page[number]=2&page[size]=100&sort=postedDate%1Fd`,
            ),
        ).toEqual({ accountId: '1234567', pageNumber: 2 });
    });

    it('decodes an encoded page parameter', () => {
        expect(
            parseAccountHistoryUrl(`${HISTORY_BASE}/accountHistory/1234567?page%5Bnumber%5D=3`),
        ).toEqual({ accountId: '1234567', pageNumber: 3 });
    });

    it('resolves a relative URL against the page URL and defaults to page 1', () => {
        expect(
            parseAccountHistoryUrl(
                '/americafirstdigitalbanking/mobilews/accountHistory/1234567',
                PAGE_URL,
            ),
        ).toEqual({ accountId: '1234567', pageNumber: 1 });
    });

    it('returns null for other endpoints', () => {
        expect(parseAccountHistoryUrl(`${HISTORY_BASE}/keepalive`)).toBeNull();
    });

    it('returns null for an unparseable URL', () => {
        expect(parseAccountHistoryUrl('not a url')).toBeNull();
    });
});

describe('mapHistoryTransaction', () => {
    function raw(overrides: Partial<AccountHistoryTransaction> = {}): AccountHistoryTransaction {
        return {
            transactionId: '9000000001',
            transactionType: 'History',
            postedDate: '2026-08-24T00:00:00.000-06:00',
            amount: '-21.48',
            description: 'Netflix',
            statementDescription: 'VISA - 08/22 NETFLIX.COM NETFLIX.COM CA 000000',
            ...overrides,
        };
    }

    it('uses the statement description instead of the shortened name', () => {
        expect(mapHistoryTransaction(raw())).toEqual({
            id: '9000000001',
            pending: false,
            date: '8/24/2026',
            description: 'VISA - 08/22 NETFLIX.COM NETFLIX.COM CA 000000',
            amount: -21.48,
        });
    });

    it('takes the calendar date from the posted date without converting time zones', () => {
        expect(
            mapHistoryTransaction(raw({ postedDate: '2026-09-09T23:30:00.000-06:00' }))?.date,
        ).toBe('9/9/2026');
    });

    it('falls back to the description when the statement description is blank', () => {
        expect(mapHistoryTransaction(raw({ statementDescription: '   ' }))?.description).toBe(
            'Netflix',
        );
        expect(mapHistoryTransaction(raw({ statementDescription: null }))?.description).toBe(
            'Netflix',
        );
    });

    it('trims trailing whitespace and removes commas', () => {
        expect(
            mapHistoryTransaction(
                raw({ statementDescription: 'AUTOMATIC WITHDRAWAL, PAYPAL, INC      ' }),
            )?.description,
        ).toBe('AUTOMATIC WITHDRAWAL PAYPAL INC');
    });

    it('marks memo transactions as pending', () => {
        expect(mapHistoryTransaction(raw({ transactionType: 'Memo' }))?.pending).toBe(true);
    });

    it('converts numeric transaction IDs to strings', () => {
        expect(mapHistoryTransaction(raw({ transactionId: 12345670 }))?.id).toBe('12345670');
    });

    it('returns null when the posted date or amount is missing', () => {
        expect(mapHistoryTransaction(raw({ postedDate: null }))).toBeNull();
        expect(mapHistoryTransaction(raw({ amount: '' }))).toBeNull();
        expect(mapHistoryTransaction(raw({ amount: null }))).toBeNull();
    });
});

describe('requestCapturedTransactions', () => {
    let happyWindow: HappyDomWindow;
    let win: Window;

    beforeEach(() => {
        happyWindow = new HappyDomWindow({ url: PAGE_URL });
        win = happyWindow as unknown as Window;
    });

    afterEach(async () => {
        await happyWindow.happyDOM.close();
    });

    function replyWith(transactions: CapturedTransaction[] | null, requestId?: string) {
        win.addEventListener('message', (event) => {
            if (!isAccountHistoryRequest(event.data)) return;
            win.postMessage(
                {
                    source: ACCOUNT_HISTORY_MESSAGE_SOURCE,
                    type: 'reply',
                    requestId: requestId ?? event.data.requestId,
                    transactions,
                },
                win.location.origin,
            );
        });
    }

    const netflix: CapturedTransaction = {
        id: '9000000001',
        pending: false,
        date: '8/24/2026',
        description: 'VISA - 08/22 NETFLIX.COM NETFLIX.COM CA 000000',
        amount: -21.48,
    };

    it('resolves with the transactions the capture script replies with', async () => {
        replyWith([netflix]);
        expect(await requestCapturedTransactions('1234567', win, 50)).toEqual([netflix]);
    });

    it('ignores replies to other requests', async () => {
        replyWith([netflix], 'someone-else');
        expect(await requestCapturedTransactions('1234567', win, 20)).toBeNull();
    });

    it('resolves null when no capture script replies', async () => {
        expect(await requestCapturedTransactions('1234567', win, 20)).toBeNull();
    });
});

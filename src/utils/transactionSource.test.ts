import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { readRowTransaction, readTransactions } from './transactionSource';
import { requestCapturedTransactions, type CapturedTransaction } from './accountHistory';
import { getAccountIdFromHash } from './route';
import { transactionSourceSetting } from './settings';
import { createTransactionRow, setupTransactionTable } from '../test/transactionRow';

vi.mock('./accountHistory', async (importOriginal) => ({
    ...(await importOriginal<typeof import('./accountHistory')>()),
    requestCapturedTransactions: vi.fn(),
}));

vi.mock('./route', () => ({
    getAccountIdFromHash: vi.fn(),
}));

const ACCOUNT_ID = '1234567';
const STATEMENT_DESCRIPTION = 'VISA - 08/22 NETFLIX.COM NETFLIX.COM CA 000000';
const pageNetflix = { date: '8/24/2026', description: 'Netflix', amount: -21.48 };
const apiNetflix = { date: '8/24/2026', description: STATEMENT_DESCRIPTION, amount: -21.48 };

function captured(overrides: Partial<CapturedTransaction> = {}): CapturedTransaction {
    return { id: '9000000001', pending: false, ...apiNetflix, ...overrides };
}

function netflixRow(id?: string) {
    return createTransactionRow({
        id,
        date: 'Aug 24 2026',
        description: 'Netflix',
        amount: '($21.48)',
    });
}

beforeEach(() => {
    fakeBrowser.reset();
    document.body.innerHTML = '';
    vi.mocked(getAccountIdFromHash).mockReturnValue(ACCOUNT_ID);
});

describe('readTransactions', () => {
    it('reads the page when the page source is selected', async () => {
        setupTransactionTable([netflixRow()]);
        expect(await readTransactions('page')).toEqual({
            transactions: [pageNetflix],
            usedPageFallback: false,
        });
        expect(requestCapturedTransactions).not.toHaveBeenCalled();
    });

    it('returns captured posted transactions for the API source', async () => {
        vi.mocked(requestCapturedTransactions).mockResolvedValue([
            captured(),
            captured({ id: '9000000002', pending: true, description: '09/09 - PENDING' }),
        ]);
        expect(await readTransactions('api')).toEqual({
            transactions: [apiNetflix],
            usedPageFallback: false,
        });
        expect(requestCapturedTransactions).toHaveBeenCalledWith(ACCOUNT_ID);
    });

    it('falls back to the page when nothing was captured', async () => {
        vi.mocked(requestCapturedTransactions).mockResolvedValue(null);
        setupTransactionTable([netflixRow()]);
        expect(await readTransactions('api')).toEqual({
            transactions: [pageNetflix],
            usedPageFallback: true,
        });
    });

    it('falls back to the page when the capture is empty', async () => {
        vi.mocked(requestCapturedTransactions).mockResolvedValue([]);
        setupTransactionTable([netflixRow()]);
        expect(await readTransactions('api')).toEqual({
            transactions: [pageNetflix],
            usedPageFallback: true,
        });
    });

    it('falls back to the page when the URL has no account ID', async () => {
        vi.mocked(getAccountIdFromHash).mockReturnValue(null);
        setupTransactionTable([netflixRow()]);
        expect((await readTransactions('api')).usedPageFallback).toBe(true);
        expect(requestCapturedTransactions).not.toHaveBeenCalled();
    });

    it('uses the API source by default', async () => {
        vi.mocked(requestCapturedTransactions).mockResolvedValue([captured()]);
        expect((await readTransactions()).transactions).toEqual([apiNetflix]);
    });

    it('uses the stored source when none is given', async () => {
        await transactionSourceSetting.setValue('page');
        setupTransactionTable([netflixRow()]);
        expect((await readTransactions()).transactions).toEqual([pageNetflix]);
        expect(requestCapturedTransactions).not.toHaveBeenCalled();
    });
});

describe('readRowTransaction', () => {
    it('returns the captured transaction matching the row ID', async () => {
        vi.mocked(requestCapturedTransactions).mockResolvedValue([captured()]);
        expect(await readRowTransaction(netflixRow('9000000001'), 'api')).toEqual(apiNetflix);
    });

    it('falls back to the row text when the row was not captured', async () => {
        vi.mocked(requestCapturedTransactions).mockResolvedValue([captured({ id: '9000000099' })]);
        expect(await readRowTransaction(netflixRow('9000000001'), 'api')).toEqual(pageNetflix);
    });

    it('reads the row text for the page source', async () => {
        expect(await readRowTransaction(netflixRow('9000000001'), 'page')).toEqual(pageNetflix);
        expect(requestCapturedTransactions).not.toHaveBeenCalled();
    });
});

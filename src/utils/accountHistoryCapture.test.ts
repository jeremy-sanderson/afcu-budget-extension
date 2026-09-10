import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Window as HappyDomWindow } from 'happy-dom';
import {
    installAccountHistoryCapture,
    recordAccountHistory,
    type AccountHistoryStore,
} from './accountHistoryCapture';
import { requestCapturedTransactions, type AccountHistoryTransaction } from './accountHistory';

const PAGE_URL = 'https://digital.americafirst.com/americafirstdigitalbanking/uux.aspx';
const ACCOUNT_ID = '1234567';

function historyUrl(page = 1): string {
    return `https://digital.americafirst.com/americafirstdigitalbanking/mobilews/accountHistory/${ACCOUNT_ID}?page[number]=${page}&page[size]=100&sort=postedDate%1Fd`;
}

function historyTransaction(id: string): AccountHistoryTransaction {
    return {
        transactionId: id,
        transactionType: 'History',
        postedDate: '2026-08-24T00:00:00.000-06:00',
        amount: '-21.48',
        description: 'Netflix',
        statementDescription: 'VISA - 08/22 NETFLIX.COM NETFLIX.COM CA 000000',
    };
}

function historyBody(...ids: string[]) {
    return { errorReturnCode: 0, data: { transactions: ids.map(historyTransaction) } };
}

function capturedIds(store: AccountHistoryStore): string[] {
    return [...(store.get(ACCOUNT_ID)?.keys() ?? [])];
}

describe('recordAccountHistory', () => {
    let store: AccountHistoryStore;

    beforeEach(() => {
        store = new Map();
    });

    it('stores mapped transactions under the account ID', () => {
        recordAccountHistory(store, historyUrl(), JSON.stringify(historyBody('1', '2')));
        expect(capturedIds(store)).toEqual(['1', '2']);
        expect(store.get(ACCOUNT_ID)?.get('1')?.description).toBe(
            'VISA - 08/22 NETFLIX.COM NETFLIX.COM CA 000000',
        );
    });

    it('starts over when page 1 is loaded again', () => {
        recordAccountHistory(store, historyUrl(1), historyBody('1', '2'));
        recordAccountHistory(store, historyUrl(1), historyBody('3'));
        expect(capturedIds(store)).toEqual(['3']);
    });

    it('adds later pages to the existing capture', () => {
        recordAccountHistory(store, historyUrl(1), historyBody('1'));
        recordAccountHistory(store, historyUrl(2), historyBody('2'));
        expect(capturedIds(store)).toEqual(['1', '2']);
    });

    it('ignores error responses', () => {
        recordAccountHistory(store, historyUrl(), { errorReturnCode: -5, data: null });
        expect(store.size).toBe(0);
    });

    it('ignores other endpoints', () => {
        recordAccountHistory(
            store,
            'https://digital.americafirst.com/americafirstdigitalbanking/mobilews/keepalive',
            historyBody('1'),
        );
        expect(store.size).toBe(0);
    });
});

describe('installAccountHistoryCapture', () => {
    let happyWindow: HappyDomWindow;
    let win: Window & typeof globalThis;

    beforeEach(() => {
        happyWindow = new HappyDomWindow({ url: PAGE_URL });
        win = happyWindow as unknown as Window & typeof globalThis;
    });

    afterEach(async () => {
        await happyWindow.happyDOM.close();
    });

    const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('captures history loaded with fetch and leaves the response readable by the page', async () => {
        const body = historyBody('1');
        win.fetch = vi.fn(async () => new Response(JSON.stringify(body)));
        installAccountHistoryCapture(win);

        const response = await win.fetch(
            `/americafirstdigitalbanking/mobilews/accountHistory/${ACCOUNT_ID}?page[number]=1`,
        );
        expect(await response.json()).toEqual(body);

        await settle();
        const captured = await requestCapturedTransactions(ACCOUNT_ID, win, 50);
        expect(captured?.map((t) => t.id)).toEqual(['1']);
    });

    it('ignores fetches to other endpoints', async () => {
        win.fetch = vi.fn(async () => new Response(JSON.stringify(historyBody('1'))));
        installAccountHistoryCapture(win);

        await win.fetch('/americafirstdigitalbanking/mobilews/keepalive');
        await settle();
        expect(await requestCapturedTransactions(ACCOUNT_ID, win, 50)).toBeNull();
    });

    it('captures history loaded with XMLHttpRequest', async () => {
        class FakeXhr extends EventTarget {
            responseURL = '';
            responseType = '';
            responseText = '';
            response: unknown = null;
            open() {}
        }
        win.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
        installAccountHistoryCapture(win);

        const xhr = new win.XMLHttpRequest() as unknown as FakeXhr;
        xhr.open();
        xhr.responseURL = historyUrl();
        xhr.responseText = JSON.stringify(historyBody('7'));
        xhr.dispatchEvent(new Event('load'));

        const captured = await requestCapturedTransactions(ACCOUNT_ID, win, 50);
        expect(captured?.map((t) => t.id)).toEqual(['7']);
    });
});

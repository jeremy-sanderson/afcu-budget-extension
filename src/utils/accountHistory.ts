import type { Transaction } from './types';
import { formatDate, sanitizeDescription } from './data';

export interface AccountHistoryTransaction {
    transactionId: string | number;
    transactionType?: string | null;
    postedDate?: string | null;
    amount?: string | number | null;
    description?: string | null;
    statementDescription?: string | null;
}

export interface AccountHistoryResponse {
    errorReturnCode?: number;
    data?: { transactions?: AccountHistoryTransaction[] | null } | null;
}

export interface CapturedTransaction extends Transaction {
    id: string;
    pending: boolean;
}

export const ACCOUNT_HISTORY_MESSAGE_SOURCE = 'afcu-budget:account-history';

export interface AccountHistoryRequest {
    source: typeof ACCOUNT_HISTORY_MESSAGE_SOURCE;
    type: 'request';
    requestId: string;
    accountId: string;
}

export interface AccountHistoryReply {
    source: typeof ACCOUNT_HISTORY_MESSAGE_SOURCE;
    type: 'reply';
    requestId: string;
    transactions: CapturedTransaction[] | null;
}

const ACCOUNT_HISTORY_PATH = /\/mobilews\/accountHistory\/(\d+)\/?$/;
const POSTED_DATE = /^(\d{4})-(\d{2})-(\d{2})/;
const PENDING_TRANSACTION_TYPE = 'Memo';
const REQUEST_TIMEOUT_MS = 500;

export function parseAccountHistoryUrl(
    url: string,
    base?: string,
): { accountId: string; pageNumber: number } | null {
    let parsed: URL;
    try {
        parsed = new URL(url, base);
    } catch {
        return null;
    }
    const accountId = ACCOUNT_HISTORY_PATH.exec(parsed.pathname)?.[1];
    if (!accountId) return null;
    const pageNumber = Number(parsed.searchParams.get('page[number]') ?? 1);
    return {
        accountId,
        pageNumber: Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1,
    };
}

function parseAmount(amount: AccountHistoryTransaction['amount']): number | null {
    if (amount === null || amount === undefined || amount === '') return null;
    const value = Number(amount);
    return Number.isFinite(value) ? value : null;
}

// The posted date carries the bank's UTC offset. Reading the calendar date straight from the
// string keeps a late-evening posting from shifting to the next day in other time zones.
export function mapHistoryTransaction(raw: AccountHistoryTransaction): CapturedTransaction | null {
    const dateMatch = POSTED_DATE.exec(raw.postedDate ?? '');
    const amount = parseAmount(raw.amount);
    const description = raw.statementDescription?.trim() || raw.description?.trim();
    if (!dateMatch || amount === null || !description) return null;

    const [, year, month, day] = dateMatch;
    return {
        id: String(raw.transactionId),
        pending: raw.transactionType === PENDING_TRANSACTION_TYPE,
        date: formatDate(Number(month), Number(day), Number(year)),
        description: sanitizeDescription(description),
        amount,
    };
}

function isHistoryMessage(data: unknown): data is Record<string, unknown> {
    return (
        typeof data === 'object' &&
        data !== null &&
        (data as Record<string, unknown>).source === ACCOUNT_HISTORY_MESSAGE_SOURCE
    );
}

export function isAccountHistoryRequest(data: unknown): data is AccountHistoryRequest {
    return (
        isHistoryMessage(data) &&
        data.type === 'request' &&
        typeof data.requestId === 'string' &&
        typeof data.accountId === 'string'
    );
}

export function isAccountHistoryReply(data: unknown): data is AccountHistoryReply {
    return isHistoryMessage(data) && data.type === 'reply' && typeof data.requestId === 'string';
}

// Captured history lives in the page's MAIN world (see history-capture.content.ts), which the
// extension's isolated scripts can only reach through window messages.
export function requestCapturedTransactions(
    accountId: string,
    win: Window = window,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<CapturedTransaction[] | null> {
    const requestId = crypto.randomUUID();
    return new Promise((resolve) => {
        const onMessage = (event: MessageEvent) => {
            if (event.source !== win || !isAccountHistoryReply(event.data)) return;
            if (event.data.requestId !== requestId) return;
            finish(event.data.transactions);
        };
        const finish = (transactions: CapturedTransaction[] | null) => {
            clearTimeout(timeout);
            win.removeEventListener('message', onMessage);
            resolve(transactions);
        };
        const timeout = setTimeout(() => finish(null), timeoutMs);
        win.addEventListener('message', onMessage);

        const request: AccountHistoryRequest = {
            source: ACCOUNT_HISTORY_MESSAGE_SOURCE,
            type: 'request',
            requestId,
            accountId,
        };
        win.postMessage(request, win.location.origin);
    });
}

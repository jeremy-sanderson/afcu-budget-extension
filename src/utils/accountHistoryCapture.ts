import {
    ACCOUNT_HISTORY_MESSAGE_SOURCE,
    isAccountHistoryRequest,
    mapHistoryTransaction,
    parseAccountHistoryUrl,
    type AccountHistoryReply,
    type AccountHistoryResponse,
    type CapturedTransaction,
} from './accountHistory';

export type AccountHistoryStore = Map<string, Map<string, CapturedTransaction>>;

export function recordAccountHistory(
    store: AccountHistoryStore,
    url: string,
    body: unknown,
    base?: string,
): void {
    const target = parseAccountHistoryUrl(url, base);
    if (!target) return;

    const response = (
        typeof body === 'string' ? JSON.parse(body) : body
    ) as AccountHistoryResponse | null;
    if (!response || (response.errorReturnCode ?? 0) !== 0) return;

    // The page requests page 1 again whenever its list resets (account switch, new filter), so
    // page 1 starts a fresh capture instead of mixing in rows the page no longer shows.
    const records =
        target.pageNumber === 1
            ? new Map<string, CapturedTransaction>()
            : (store.get(target.accountId) ?? new Map<string, CapturedTransaction>());
    for (const raw of response.data?.transactions ?? []) {
        const transaction = mapHistoryTransaction(raw);
        if (transaction) records.set(transaction.id, transaction);
    }
    store.set(target.accountId, records);
}

function requestUrl(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    return 'url' in input ? input.url : input.href;
}

function readXhrBody(xhr: XMLHttpRequest): unknown {
    if (xhr.responseType === 'json') return xhr.response;
    if (xhr.responseType === '' || xhr.responseType === 'text') return xhr.responseText;
    return null;
}

export function installAccountHistoryCapture(win: Window & typeof globalThis = window): void {
    const store: AccountHistoryStore = new Map();
    const isHistoryUrl = (url: string) => parseAccountHistoryUrl(url, win.location.href) !== null;
    const capture = (url: string, body: unknown) => {
        try {
            recordAccountHistory(store, url, body, win.location.href);
        } catch (error) {
            console.error('[afcu-budget] Failed to capture account history response:', error);
        }
    };

    const originalFetch = win.fetch.bind(win);
    win.fetch = async (...args: Parameters<typeof fetch>) => {
        const response = await originalFetch(...args);
        const url = response.url || requestUrl(args[0]);
        if (isHistoryUrl(url)) {
            response
                .clone()
                .text()
                .then((text) => capture(url, text))
                .catch((error: unknown) => {
                    console.error('[afcu-budget] Failed to read account history response:', error);
                });
        }
        return response;
    };

    const watchedRequests = new WeakSet<XMLHttpRequest>();
    const originalOpen = win.XMLHttpRequest.prototype.open;
    win.XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, ...args: unknown[]) {
        if (!watchedRequests.has(this)) {
            watchedRequests.add(this);
            this.addEventListener('load', () => {
                if (isHistoryUrl(this.responseURL)) capture(this.responseURL, readXhrBody(this));
            });
        }
        Reflect.apply(originalOpen, this, args);
    };

    win.addEventListener('message', (event: MessageEvent) => {
        if (event.source !== win || !isAccountHistoryRequest(event.data)) return;
        const records = store.get(event.data.accountId);
        const reply: AccountHistoryReply = {
            source: ACCOUNT_HISTORY_MESSAGE_SOURCE,
            type: 'reply',
            requestId: event.data.requestId,
            transactions: records ? [...records.values()] : null,
        };
        win.postMessage(reply, win.location.origin);
    });
}

import type { FetchAccountDetailsRequest, FetchAccountDetailsResponse } from '../utils/messages';
import type { SummaryData } from '../utils/types';

const TAB_LOAD_TIMEOUT_MS = 30000;
const SCRAPE_SCRIPT = '/scrape-details.js';

export default defineBackground(() => {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (typeof message !== 'object' || message === null) return;
        const request = message as FetchAccountDetailsRequest;
        if (request.type !== 'fetchAccountDetails') return;

        const respond = (response: FetchAccountDetailsResponse) =>
            (sendResponse as (response: FetchAccountDetailsResponse) => void)(response);

        scrapeAccountSummary(request.url)
            .then((data) => respond({ ok: true, data }))
            .catch((error) => {
                respond({
                    ok: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            });

        return true;
    });
});

async function scrapeAccountSummary(url: string): Promise<SummaryData> {
    const tab = await browser.tabs.create({ url, active: false });
    const tabId = tab.id;
    if (tabId == null) throw new Error('Failed to create background tab');

    try {
        await waitForTabComplete(tabId);

        const [injection] = await browser.scripting.executeScript({
            target: { tabId },
            files: [SCRAPE_SCRIPT],
        });

        const result = injection?.result as SummaryData | { error: string } | undefined;
        if (!result) throw new Error('No result from scraper');
        if ('error' in result) throw new Error(result.error);
        return result;
    } finally {
        try {
            await browser.tabs.remove(tabId);
        } catch (error) {
            console.error('Error removing scrape tab:', error);
        }
    }
}

function waitForTabComplete(tabId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error?: Error) => {
            if (settled) return;
            settled = true;
            browser.tabs.onUpdated.removeListener(listener);
            browser.tabs.onRemoved.removeListener(removedListener);
            clearTimeout(timeout);
            if (error) reject(error);
            else resolve();
        };

        const listener = (id: number, info: { status?: string }) => {
            if (id === tabId && info.status === 'complete') finish();
        };
        const removedListener = (id: number) => {
            if (id === tabId) finish(new Error('Scrape tab was closed before loading'));
        };
        const timeout = setTimeout(
            () => finish(new Error('Scrape tab load timed out')),
            TAB_LOAD_TIMEOUT_MS,
        );

        browser.tabs.onUpdated.addListener(listener);
        browser.tabs.onRemoved.addListener(removedListener);

        browser.tabs.get(tabId).then(
            (current) => {
                if (current.status === 'complete') finish();
            },
            (error: unknown) => finish(error instanceof Error ? error : new Error(String(error))),
        );
    });
}

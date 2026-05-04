import { gatherDebitsByDate, getAvailableBalance, getCurrentBalance } from '../utils/data';
import type { SummaryData } from '../utils/types';

const TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 200;

type ScrapeResult = SummaryData | { error: string };

async function waitFor(predicate: () => boolean, deadline: number): Promise<boolean> {
    while (Date.now() < deadline) {
        if (predicate()) return true;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    return predicate();
}

async function scrape(): Promise<ScrapeResult> {
    const deadline = Date.now() + TIMEOUT_MS;

    const gridFound = await waitFor(
        () => document.querySelector('#PastTransactionsGrid') !== null,
        deadline,
    );
    if (!gridFound) {
        return { error: 'Past transactions grid not found' };
    }

    await waitFor(() => {
        const grid = document.querySelector('#PastTransactionsGrid');
        if (!grid) return false;
        if (grid.querySelector('.k-loading-mask')) return false;
        return (grid.querySelector('table tbody tr') ?? null) !== null;
    }, deadline);

    return {
        currentBalance: getCurrentBalance(),
        availableBalance: getAvailableBalance(),
        debitsByDate: gatherDebitsByDate(),
    };
}

export default defineUnlistedScript(() => scrape());

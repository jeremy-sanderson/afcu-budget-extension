import {
    getAccountDescription,
    getAvailableBalance,
    getCurrentBalance,
    groupTransactionsByDate,
} from '../utils/data';
import { AccountDetails } from '../utils/selectors';
import { readTransactions } from '../utils/transactionSource';
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

    const listFound = await waitFor(
        () => document.querySelector(AccountDetails.transactionList) !== null,
        deadline,
    );
    if (!listFound) {
        return { error: 'Transaction list not found' };
    }

    await waitFor(
        () =>
            document.querySelectorAll(
                `${AccountDetails.transactionList} ${AccountDetails.transactionRow}`,
            ).length > 0,
        deadline,
    );

    const { transactions } = await readTransactions();
    return {
        currentBalance: getCurrentBalance(),
        availableBalance: getAvailableBalance(),
        transactionsByDate: groupTransactionsByDate(transactions),
        accountDescription: getAccountDescription(),
    };
}

export default defineUnlistedScript(() => scrape());

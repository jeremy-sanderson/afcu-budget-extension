import type { Transaction, TransactionsForDate } from './types';

export function getRowData(row: Element): Transaction | null {
    try {
        const dateValue = row.querySelector('td.column-date')?.textContent?.trim() ?? '';
        const description = row.querySelector('td.column-description')?.textContent?.trim() ?? '';
        const amountElement = row.querySelector('td.column-amount span.transaction-');

        if (!dateValue || !description || !amountElement) {
            return null;
        }

        const amount = amountElement.textContent?.trim() ?? '';
        return {
            date: dateValue,
            description: description.replace(',', '').replace('\n', ''),
            amount: Number(amount.replace('$', '').replace(',', '')),
        };
    } catch (error) {
        console.error('Error parsing row data:', error);
        return null;
    }
}

export function convertTransactionToTSV(transaction: Transaction): string {
    return `${transaction.date}\t${transaction.description}\t${transaction.amount}`;
}

export function getAllRowsInPastTransactionTable(root: ParentNode = document): Element[] {
    return [...root.querySelectorAll('#PastTransactionsGrid table tbody tr')];
}

export function gatherDebitTransactionsInViewSortedByDate(
    root: ParentNode = document,
): Transaction[] {
    return getAllRowsInPastTransactionTable(root)
        .map((row) => getRowData(row))
        .filter((t): t is Transaction => t !== null && t.amount < 0)
        .map((t) => ({ ...t, amount: Math.abs(t.amount) }))
        .sort((a, b) => {
            const dateComparison = Date.parse(a.date) - Date.parse(b.date);
            return dateComparison === 0
                ? a.description.localeCompare(b.description)
                : dateComparison;
        });
}

function sortByDescription(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => a.description.localeCompare(b.description));
}

export function gatherTransactionsByDate(root: ParentNode = document): TransactionsForDate[] {
    const byDate = new Map<string, { debits: Transaction[]; credits: Transaction[] }>();
    for (const row of getAllRowsInPastTransactionTable(root)) {
        const data = getRowData(row);
        if (!data) continue;
        const entry = byDate.get(data.date) ?? { debits: [], credits: [] };
        if (data.amount < 0) {
            entry.debits.push({ ...data, amount: Math.abs(data.amount) });
        } else if (data.amount > 0) {
            entry.credits.push(data);
        }
        byDate.set(data.date, entry);
    }
    return [...byDate.entries()]
        .map(([date, { debits, credits }]) => ({
            date,
            debits: sortByDescription(debits),
            credits: sortByDescription(credits),
        }))
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

export function getCurrentBalance(root: ParentNode = document): string | null {
    const accountDetails = root.querySelector('div.account-details');
    if (!accountDetails) return null;

    const balanceRow = [...accountDetails.querySelectorAll('.row')].find((row) =>
        row.querySelector('.detail-label-col span')?.textContent?.includes('Balance'),
    );

    if (!balanceRow) return null;

    const balanceText =
        balanceRow.querySelector('.detail-item-col span')?.textContent?.trim() ?? '';
    return balanceText.replace('$', '').replace(',', '') || null;
}

export function getAvailableBalance(root: ParentNode = document): string | null {
    const el = root.querySelector('.primary-label-amount') as HTMLElement | null;
    if (!el) return null;

    return el.title.replace('$', '').replace(',', '') || null;
}

export function getAccountDescription(root: ParentNode = document): string | null {
    const name = root.querySelector('.account-name')?.textContent?.trim() ?? '';
    const number = root.querySelector('.account-number')?.textContent?.trim() ?? '';
    const description = [name, number].filter(Boolean).join(' ');
    return description || null;
}

import type { Transaction } from './types';

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

export function getAllRowsInPastTransactionTable(): Element[] {
    return [...document.querySelectorAll('#PastTransactionsGrid table tbody tr')];
}

export function gatherDebitTransactionsInViewSortedByDate(): Transaction[] {
    return getAllRowsInPastTransactionTable()
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

export function getCurrentBalance(): string | null {
    const accountDetails = document.querySelector('div.account-details');
    if (!accountDetails) return null;

    const balanceRow = [...accountDetails.querySelectorAll('.row')].find((row) =>
        row.querySelector('.detail-label-col span')?.textContent?.includes('Balance'),
    );

    if (!balanceRow) return null;

    const balanceText =
        balanceRow.querySelector('.detail-item-col span')?.textContent?.trim() ?? '';
    return balanceText.replace('$', '').replace(',', '') || null;
}

export function getAvailableBalance(): string | null {
    const el = document.querySelector('.primary-label-amount') as HTMLElement | null;
    if (!el) return null;

    return el.title.replace('$', '').replace(',', '') || null;
}

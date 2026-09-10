import type { Transaction, TransactionsForDate } from './types';
import { AccountDetails } from './selectors';

export function stripCurrencyFormatting(text: string): string {
    const trimmed = text.trim();
    const isNegative = /^\(.*\)$/.test(trimmed);
    const digits = trimmed.replace(/[()$,]/g, '');
    return isNegative ? `-${digits}` : digits;
}

export function formatDate(month: number, day: number, year: number): string {
    return `${month}/${day}/${year}`;
}

export function sanitizeDescription(text: string): string {
    return text.trim().replaceAll(',', '').replaceAll('\n', '');
}

export function convertTransactionToTSV(transaction: Transaction): string {
    return `${transaction.date}\t${transaction.description}\t${transaction.amount}`;
}

function compareByDateThenDescription(a: Transaction, b: Transaction): number {
    const dateComparison = Date.parse(a.date) - Date.parse(b.date);
    return dateComparison === 0 ? a.description.localeCompare(b.description) : dateComparison;
}

export function toSortedDebits(transactions: Transaction[]): Transaction[] {
    return transactions
        .filter((t) => t.amount < 0)
        .map((t) => ({ ...t, amount: Math.abs(t.amount) }))
        .sort(compareByDateThenDescription);
}

function sortByDescription(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => a.description.localeCompare(b.description));
}

export function groupTransactionsByDate(transactions: Transaction[]): TransactionsForDate[] {
    const byDate = new Map<string, { debits: Transaction[]; credits: Transaction[] }>();
    for (const transaction of transactions) {
        const entry = byDate.get(transaction.date) ?? { debits: [], credits: [] };
        if (transaction.amount < 0) {
            entry.debits.push({ ...transaction, amount: Math.abs(transaction.amount) });
        } else if (transaction.amount > 0) {
            entry.credits.push(transaction);
        }
        byDate.set(transaction.date, entry);
    }
    return [...byDate.entries()]
        .map(([date, { debits, credits }]) => ({
            date,
            debits: sortByDescription(debits),
            credits: sortByDescription(credits),
        }))
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

function getHadeValue(root: ParentNode, label: string): string | null {
    const dt = [...root.querySelectorAll(AccountDetails.balanceLabel)].find(
        (el) => el.textContent?.trim() === label,
    );
    const container = dt?.closest('.featured-hade');
    const amount = container?.querySelector(AccountDetails.balanceValue);
    return amount?.textContent?.trim() ?? null;
}

export function getCurrentBalance(root: ParentNode = document): string | null {
    const text = getHadeValue(root, 'Balance');
    return text ? stripCurrencyFormatting(text) || null : null;
}

export function getAvailableBalance(root: ParentNode = document): string | null {
    const text = getHadeValue(root, 'Available Balance');
    return text ? stripCurrencyFormatting(text) || null : null;
}

export function getAccountDescription(root: ParentNode = document): string | null {
    return root.querySelector(AccountDetails.accountName)?.textContent?.trim() || null;
}

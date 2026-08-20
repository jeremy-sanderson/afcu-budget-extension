import type { Transaction, TransactionsForDate } from './types';
import { AccountDetails } from './selectors';

const PENDING_DESCRIPTION_PREFIX = /^(\d{1,2})\/(\d{1,2})\s*-\s*(.*)$/;

function stripCurrencyFormatting(text: string): string {
    const trimmed = text.trim();
    const isNegative = /^\(.*\)$/.test(trimmed);
    const digits = trimmed.replace(/[()$,]/g, '');
    return isNegative ? `-${digits}` : digits;
}

function parseAmountToNumber(text: string): number {
    return Number(stripCurrencyFormatting(text));
}

function formatDate(month: number, day: number, year: number): string {
    return `${month}/${day}/${year}`;
}

// Pending transactions are always recent. If the parsed MM/DD would land in the future
// relative to today, it must actually belong to last year (e.g. a 12/31 pending item viewed
// on 1/1).
function resolvePendingYear(month: number, day: number): number {
    const now = new Date();
    const candidate = new Date(now.getFullYear(), month - 1, day);
    return candidate.getTime() > now.getTime() ? now.getFullYear() - 1 : now.getFullYear();
}

function resolveDateAndDescription(row: Element): { date: string; description: string } | null {
    const dateCellText = row.querySelector(AccountDetails.dateCell)?.textContent?.trim() ?? '';
    const rawDescription =
        row.querySelector(AccountDetails.descriptionCell)?.textContent?.trim() ?? '';

    if (!dateCellText) return null;

    if (dateCellText.toLowerCase() === 'pending') {
        const match = rawDescription.match(PENDING_DESCRIPTION_PREFIX);
        if (!match) return null;
        const [, month, day, description] = match;
        const year = resolvePendingYear(Number(month), Number(day));
        return { date: formatDate(Number(month), Number(day), year), description };
    }

    const parsed = new Date(dateCellText);
    if (Number.isNaN(parsed.getTime())) {
        return { date: dateCellText, description: rawDescription };
    }
    return {
        date: formatDate(parsed.getMonth() + 1, parsed.getDate(), parsed.getFullYear()),
        description: rawDescription,
    };
}

export function getRowData(row: Element): Transaction | null {
    try {
        const resolved = resolveDateAndDescription(row);
        const amountText = row.querySelector(AccountDetails.amountValue)?.textContent;

        if (!resolved || !amountText) {
            return null;
        }

        return {
            date: resolved.date,
            description: resolved.description.replace(',', '').replace('\n', ''),
            amount: parseAmountToNumber(amountText),
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
    return [
        ...root.querySelectorAll(
            `${AccountDetails.transactionList} ${AccountDetails.transactionRow}`,
        ),
    ];
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

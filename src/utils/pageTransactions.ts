import type { Transaction } from './types';
import { AccountDetails } from './selectors';
import { formatDate, sanitizeDescription, stripCurrencyFormatting } from './data';

const PENDING_DESCRIPTION_PREFIX = /^(\d{1,2})\/(\d{1,2})\s*-\s*(.*)$/;

function parseAmountToNumber(text: string): number {
    return Number(stripCurrencyFormatting(text));
}

// Pending transactions are always recent. If the parsed MM/DD would land in the future
// relative to today, it must actually belong to last year (e.g. a 12/31 pending item viewed
// on 1/1).
function resolvePendingYear(month: number, day: number): number {
    const now = new Date();
    const candidate = new Date(now.getFullYear(), month - 1, day);
    return candidate.getTime() > now.getTime() ? now.getFullYear() - 1 : now.getFullYear();
}

export function isPendingRow(row: Element): boolean {
    return (
        row.querySelector(AccountDetails.dateCell)?.textContent?.trim().toLowerCase() === 'pending'
    );
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
        if (month === undefined || day === undefined || description === undefined) return null;
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
            description: sanitizeDescription(resolved.description),
            amount: parseAmountToNumber(amountText),
        };
    } catch (error) {
        console.error('Error parsing row data:', error);
        return null;
    }
}

export function getRowTransactionId(row: Element): string | null {
    return (
        row
            .querySelector(AccountDetails.transactionActions)
            ?.getAttribute(AccountDetails.transactionIdAttr) || null
    );
}

export function getAllRowsInPastTransactionTable(root: ParentNode = document): Element[] {
    return [
        ...root.querySelectorAll(
            `${AccountDetails.transactionList} ${AccountDetails.transactionRow}`,
        ),
    ];
}

export function readPageTransactions(root: ParentNode = document): Transaction[] {
    return getAllRowsInPastTransactionTable(root)
        .filter((row) => !isPendingRow(row))
        .map((row) => getRowData(row))
        .filter((t): t is Transaction => t !== null);
}

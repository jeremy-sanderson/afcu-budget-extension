import type { Transaction } from './types';
import { requestCapturedTransactions, type CapturedTransaction } from './accountHistory';
import { getRowData, getRowTransactionId, readPageTransactions } from './pageTransactions';
import { getAccountIdFromHash } from './route';
import { transactionSourceSetting, type TransactionSource } from './settings';
import { debugLog } from './logger';

export interface TransactionsResult {
    transactions: Transaction[];
    usedPageFallback: boolean;
}

function toTransaction({ date, description, amount }: CapturedTransaction): Transaction {
    return { date, description, amount };
}

async function resolveSource(source?: TransactionSource): Promise<TransactionSource> {
    return source ?? (await transactionSourceSetting.getValue());
}

async function readCapturedTransactions(): Promise<CapturedTransaction[] | null> {
    const accountId = getAccountIdFromHash();
    if (!accountId) return null;
    const captured = await requestCapturedTransactions(accountId);
    return captured?.length ? captured : null;
}

export async function readTransactions(source?: TransactionSource): Promise<TransactionsResult> {
    if ((await resolveSource(source)) === 'page') {
        return { transactions: readPageTransactions(), usedPageFallback: false };
    }

    const captured = await readCapturedTransactions();
    if (!captured) {
        debugLog('[afcu-budget] No captured account history, reading transactions from the page');
        return { transactions: readPageTransactions(), usedPageFallback: true };
    }
    return {
        transactions: captured.filter((t) => !t.pending).map(toTransaction),
        usedPageFallback: false,
    };
}

export async function readRowTransaction(
    row: Element,
    source?: TransactionSource,
): Promise<Transaction | null> {
    if ((await resolveSource(source)) === 'page') return getRowData(row);

    const id = getRowTransactionId(row);
    const match = id ? (await readCapturedTransactions())?.find((t) => t.id === id) : undefined;
    if (!match) {
        debugLog('[afcu-budget] Row missing from captured account history, reading the page', {
            id,
        });
        return getRowData(row);
    }
    return toTransaction(match);
}

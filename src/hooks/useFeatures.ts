import { useCallback } from 'react';
import type { DialogAPI } from './useDialog';
import {
    convertTransactionToTSV,
    getAvailableBalance,
    getCurrentBalance,
    toSortedDebits,
} from '../utils/data';
import { readTransactions } from '../utils/transactionSource';

const PAGE_FALLBACK_NOTE =
    "Full statement descriptions weren't available, so the shortened descriptions shown on the page were used.";

async function copyTransactionsToClipboard(filterDate: number, dialog: DialogAPI) {
    try {
        const { transactions, usedPageFallback } = await readTransactions();
        const rows = toSortedDebits(transactions)
            .filter((t) => Date.parse(t.date) >= filterDate)
            .map((t) => convertTransactionToTSV(t));

        if (rows.length === 0) {
            dialog.showAlert('No transactions found for the selected date range.');
            return;
        }

        await navigator.clipboard.writeText(rows.join('\n'));
        const message = `${rows.length} transactions copied to clipboard`;
        dialog.showAlert(usedPageFallback ? `${message}. ${PAGE_FALLBACK_NOTE}` : message);
    } catch (error) {
        console.error('Error filtering transactions:', error);
        dialog.showAlert('Error filtering transactions. Please try again.');
    }
}

export default function useFeatures(dialog: DialogAPI) {
    const debitTransactionsFromYesterday = useCallback(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        copyTransactionsToClipboard(Date.parse(yesterday.toLocaleDateString()), dialog);
    }, [dialog]);

    const debitTransactionsFromToday = useCallback(() => {
        copyTransactionsToClipboard(Date.parse(new Date().toLocaleDateString()), dialog);
    }, [dialog]);

    const debitTransactionsWithDate = useCallback(() => {
        dialog.showPrompt('Enter start date (blank for today)', (selectedDate) => {
            if (selectedDate === null) return;

            const today = new Date().toLocaleDateString();
            const filterDate = selectedDate ? Date.parse(selectedDate) : Date.parse(today);
            copyTransactionsToClipboard(filterDate, dialog);
        });
    }, [dialog]);

    const copyCurrentBalance = useCallback(() => {
        const balance = getCurrentBalance();
        if (!balance) {
            dialog.showAlert('Error: Current balance not found');
            return;
        }

        navigator.clipboard
            .writeText(balance)
            .then(() => {
                dialog.showAlert('Current balance copied to clipboard');
            })
            .catch((error) => {
                console.error('Error copying current balance:', error);
                dialog.showAlert('Error copying current balance. Please try again.');
            });
    }, [dialog]);

    const copyAvailableBalance = useCallback(() => {
        const balance = getAvailableBalance();
        if (!balance) {
            dialog.showAlert('Error: Available balance not found');
            return;
        }

        navigator.clipboard
            .writeText(balance)
            .then(() => {
                dialog.showAlert('Available balance copied to clipboard');
            })
            .catch((error) => {
                console.error('Error copying available balance:', error);
                dialog.showAlert('Error copying available balance. Please try again.');
            });
    }, [dialog]);

    return {
        debitTransactionsFromYesterday,
        debitTransactionsFromToday,
        debitTransactionsWithDate,
        copyCurrentBalance,
        copyAvailableBalance,
    };
}

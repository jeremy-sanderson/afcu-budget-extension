import { useCallback } from 'react';
import type { DialogAPI } from './useDialog';
import {
    gatherDebitTransactionsInViewSortedByDate,
    convertTransactionToTSV,
    getCurrentBalance,
    getAvailableBalance,
} from '../utils/data';

async function filterDebitsByDate(filterDate: number, dialog: DialogAPI) {
    try {
        const transactions = gatherDebitTransactionsInViewSortedByDate()
            .filter(t => Date.parse(t.date) >= filterDate)
            .map(t => convertTransactionToTSV(t));

        if (transactions.length === 0) {
            await dialog.alert('No transactions found for the selected date range.');
            return;
        }

        await navigator.clipboard.writeText(transactions.join('\n'));
        await dialog.alert(`${transactions.length} transactions copied to clipboard`);
    } catch (error) {
        console.error('Error filtering transactions:', error);
        await dialog.alert('Error filtering transactions. Please try again.');
    }
}

export default function useFeatures(dialog: DialogAPI) {
    const debitTransactionsFromYesterday = useCallback(async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await filterDebitsByDate(Date.parse(yesterday.toLocaleDateString()), dialog);
    }, [dialog]);

    const debitTransactionsFromToday = useCallback(async () => {
        await filterDebitsByDate(Date.parse(new Date().toLocaleDateString()), dialog);
    }, [dialog]);

    const debitTransactionsWithDate = useCallback(async () => {
        const selectedDate = await dialog.prompt('Enter start date (blank for today)');
        if (selectedDate === null) return;

        const today = new Date().toLocaleDateString();
        const filterDate = selectedDate ? Date.parse(selectedDate) : Date.parse(today);
        await filterDebitsByDate(filterDate, dialog);
    }, [dialog]);

    const copyCurrentBalance = useCallback(async () => {
        const balance = getCurrentBalance();
        if (!balance) {
            await dialog.alert('Error: Current balance not found');
            return;
        }

        try {
            await navigator.clipboard.writeText(balance);
            await dialog.alert('Current balance copied to clipboard');
        } catch (error) {
            console.error('Error copying current balance:', error);
            await dialog.alert('Error copying current balance. Please try again.');
        }
    }, [dialog]);

    const copyAvailableBalance = useCallback(async () => {
        const balance = getAvailableBalance();
        if (!balance) {
            await dialog.alert('Error: Available balance not found');
            return;
        }

        try {
            await navigator.clipboard.writeText(balance);
            await dialog.alert('Available balance copied to clipboard');
        } catch (error) {
            console.error('Error copying available balance:', error);
            await dialog.alert('Error copying available balance. Please try again.');
        }
    }, [dialog]);

    return {
        debitTransactionsFromYesterday,
        debitTransactionsFromToday,
        debitTransactionsWithDate,
        copyCurrentBalance,
        copyAvailableBalance,
    };
}

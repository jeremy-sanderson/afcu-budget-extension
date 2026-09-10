import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFeatures from './useFeatures';
import type { DialogAPI } from './useDialog';
import * as data from '../utils/data';
import { readTransactions } from '../utils/transactionSource';
import type { Transaction } from '../utils/types';

vi.mock('../utils/data', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils/data')>()),
    getCurrentBalance: vi.fn(),
    getAvailableBalance: vi.fn(),
}));

vi.mock('../utils/transactionSource', () => ({
    readTransactions: vi.fn(),
}));

function createMockDialog(): DialogAPI {
    return {
        dialogState: { type: null },
        showAlert: vi.fn(),
        showConfirm: vi.fn(),
        showPrompt: vi.fn(),
        close: vi.fn(),
    };
}

function mockTransactions(transactions: Transaction[], usedPageFallback = false) {
    vi.mocked(readTransactions).mockResolvedValue({ transactions, usedPageFallback });
}

const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
    mockWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
    });
});

async function flushMicrotasks() {
    await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('useFeatures', () => {
    describe('debitTransactionsFromYesterday', () => {
        it('copies debits since yesterday as TSV', async () => {
            const mockDialog = createMockDialog();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDate = yesterday.toLocaleDateString();
            mockTransactions([
                { date: yesterdayDate, description: 'WALMART', amount: -50 },
                { date: '1/1/2020', description: 'OLD', amount: -10 },
            ]);

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.debitTransactionsFromYesterday());
            await flushMicrotasks();

            expect(mockWriteText).toHaveBeenCalledWith(`${yesterdayDate}\tWALMART\t50`);
            expect(mockDialog.showAlert).toHaveBeenCalledWith('1 transactions copied to clipboard');
        });
    });

    describe('debitTransactionsFromToday', () => {
        it('copies debits from today as TSV', async () => {
            const mockDialog = createMockDialog();
            const today = new Date().toLocaleDateString();
            mockTransactions([{ date: today, description: 'GOOGLE', amount: -10 }]);

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.debitTransactionsFromToday());
            await flushMicrotasks();

            expect(mockWriteText).toHaveBeenCalledWith(`${today}\tGOOGLE\t10`);
            expect(mockDialog.showAlert).toHaveBeenCalledWith('1 transactions copied to clipboard');
        });
    });

    describe('debitTransactionsWithDate', () => {
        it('copies debits on or after the entered date, oldest first', async () => {
            const mockDialog = createMockDialog();
            vi.mocked(mockDialog.showPrompt).mockImplementation((_msg, onResult) => {
                onResult('4/9/2025');
            });
            mockTransactions([
                { date: '4/12/2025', description: 'WALMART', amount: -50 },
                { date: '4/9/2025', description: 'GOOGLE', amount: -10 },
                { date: '4/8/2025', description: 'EARLIER', amount: -5 },
            ]);

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.debitTransactionsWithDate());
            await flushMicrotasks();

            expect(mockDialog.showPrompt).toHaveBeenCalledWith(
                'Enter start date (blank for today)',
                expect.any(Function),
            );
            expect(mockWriteText).toHaveBeenCalledWith(
                '4/9/2025\tGOOGLE\t10\n4/12/2025\tWALMART\t50',
            );
        });

        it('defaults to today when blank input', async () => {
            const mockDialog = createMockDialog();
            vi.mocked(mockDialog.showPrompt).mockImplementation((_msg, onResult) => {
                onResult('');
            });
            const today = new Date().toLocaleDateString();
            mockTransactions([{ date: today, description: 'TEST', amount: -10 }]);

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.debitTransactionsWithDate());
            await flushMicrotasks();

            expect(mockWriteText).toHaveBeenCalledWith(`${today}\tTEST\t10`);
        });
    });

    describe('copying debits', () => {
        it('skips credits and reports when nothing matches', async () => {
            const mockDialog = createMockDialog();
            const today = new Date().toLocaleDateString();
            mockTransactions([{ date: today, description: 'PAYCHECK', amount: 500 }]);

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.debitTransactionsFromToday());
            await flushMicrotasks();

            expect(mockWriteText).not.toHaveBeenCalled();
            expect(mockDialog.showAlert).toHaveBeenCalledWith(
                'No transactions found for the selected date range.',
            );
        });

        it('notes when the page text was used instead of bank data', async () => {
            const mockDialog = createMockDialog();
            const today = new Date().toLocaleDateString();
            mockTransactions([{ date: today, description: 'Netflix', amount: -21.48 }], true);

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.debitTransactionsFromToday());
            await flushMicrotasks();

            expect(mockDialog.showAlert).toHaveBeenCalledWith(
                "1 transactions copied to clipboard. Full statement descriptions weren't available, so the shortened descriptions shown on the page were used.",
            );
        });

        it('shows an error when transactions cannot be read', async () => {
            const mockDialog = createMockDialog();
            vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.mocked(readTransactions).mockRejectedValue(new Error('storage unavailable'));

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.debitTransactionsFromToday());
            await flushMicrotasks();

            expect(mockDialog.showAlert).toHaveBeenCalledWith(
                'Error filtering transactions. Please try again.',
            );
        });

        it('shows alert with transaction count after copy', async () => {
            const mockDialog = createMockDialog();
            const today = new Date().toLocaleDateString();
            mockTransactions([
                { date: today, description: 'A', amount: -10 },
                { date: today, description: 'B', amount: -20 },
            ]);

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.debitTransactionsFromToday());
            await flushMicrotasks();

            expect(mockDialog.showAlert).toHaveBeenCalledWith('2 transactions copied to clipboard');
        });
    });

    describe('copyCurrentBalance', () => {
        it('copies balance string to clipboard', async () => {
            const mockDialog = createMockDialog();
            vi.mocked(data.getCurrentBalance).mockReturnValue('36.00');

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.copyCurrentBalance());
            await flushMicrotasks();

            expect(mockWriteText).toHaveBeenCalledWith('36.00');
            expect(mockDialog.showAlert).toHaveBeenCalledWith(
                'Current balance copied to clipboard',
            );
        });
    });

    describe('copyAvailableBalance', () => {
        it('copies available balance to clipboard', async () => {
            const mockDialog = createMockDialog();
            vi.mocked(data.getAvailableBalance).mockReturnValue('36.00');

            const { result } = renderHook(() => useFeatures(mockDialog));
            act(() => result.current.copyAvailableBalance());
            await flushMicrotasks();

            expect(mockWriteText).toHaveBeenCalledWith('36.00');
            expect(mockDialog.showAlert).toHaveBeenCalledWith(
                'Available balance copied to clipboard',
            );
        });
    });

    it('shows error alert when clipboard write fails', async () => {
        const mockDialog = createMockDialog();
        vi.mocked(data.getCurrentBalance).mockReturnValue('36.00');
        mockWriteText.mockRejectedValue(new Error('denied'));

        const { result } = renderHook(() => useFeatures(mockDialog));
        act(() => result.current.copyCurrentBalance());
        await flushMicrotasks();

        expect(mockDialog.showAlert).toHaveBeenCalledWith(
            'Error copying current balance. Please try again.',
        );
    });
});

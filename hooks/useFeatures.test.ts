import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFeatures from './useFeatures';
import type { DialogAPI } from './useDialog';
import * as data from '../utils/data';

vi.mock('../utils/data', () => ({
    gatherDebitTransactionsInViewSortedByDate: vi.fn(),
    convertTransactionToTSV: vi.fn(),
    getCurrentBalance: vi.fn(),
    getAvailableBalance: vi.fn(),
}));

function createMockDialog(): DialogAPI {
    return {
        dialogState: { type: null, message: '' },
        alert: vi.fn().mockResolvedValue(undefined),
        confirm: vi.fn().mockResolvedValue(true),
        prompt: vi.fn().mockResolvedValue(''),
        closeDialog: vi.fn(),
        resolveDialog: vi.fn(),
    };
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

describe('useFeatures', () => {
    describe('debitTransactionsFromYesterday', () => {
        it('filters to yesterday and copies to clipboard', async () => {
            const mockDialog = createMockDialog();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            vi.mocked(data.gatherDebitTransactionsInViewSortedByDate).mockReturnValue([
                { date: yesterday.toLocaleDateString(), description: 'WALMART', amount: 50 },
                { date: '1/1/2020', description: 'OLD', amount: 10 },
            ]);
            vi.mocked(data.convertTransactionToTSV).mockReturnValue('tsv-line');

            const { result } = renderHook(() => useFeatures(mockDialog));
            await act(() => result.current.debitTransactionsFromYesterday());

            expect(mockWriteText).toHaveBeenCalledWith('tsv-line');
            expect(mockDialog.alert).toHaveBeenCalledWith('1 transactions copied to clipboard');
        });
    });

    describe('debitTransactionsFromToday', () => {
        it('filters to today and copies to clipboard', async () => {
            const mockDialog = createMockDialog();
            const today = new Date().toLocaleDateString();

            vi.mocked(data.gatherDebitTransactionsInViewSortedByDate).mockReturnValue([
                { date: today, description: 'GOOGLE', amount: 10 },
            ]);
            vi.mocked(data.convertTransactionToTSV).mockReturnValue('today-tsv');

            const { result } = renderHook(() => useFeatures(mockDialog));
            await act(() => result.current.debitTransactionsFromToday());

            expect(mockWriteText).toHaveBeenCalledWith('today-tsv');
            expect(mockDialog.alert).toHaveBeenCalledWith('1 transactions copied to clipboard');
        });
    });

    describe('debitTransactionsWithDate', () => {
        it('prompts for date input and filters accordingly', async () => {
            const mockDialog = createMockDialog();
            vi.mocked(mockDialog.prompt).mockResolvedValue('4/9/2025');

            vi.mocked(data.gatherDebitTransactionsInViewSortedByDate).mockReturnValue([
                { date: '4/9/2025', description: 'GOOGLE', amount: 10 },
                { date: '4/12/2025', description: 'WALMART', amount: 50 },
            ]);
            vi.mocked(data.convertTransactionToTSV).mockReturnValue('tsv');

            const { result } = renderHook(() => useFeatures(mockDialog));
            await act(() => result.current.debitTransactionsWithDate());

            expect(mockDialog.prompt).toHaveBeenCalledWith('Enter start date (blank for today)');
            expect(mockWriteText).toHaveBeenCalled();
        });

        it('defaults to today when blank input', async () => {
            const mockDialog = createMockDialog();
            vi.mocked(mockDialog.prompt).mockResolvedValue('');

            const today = new Date().toLocaleDateString();
            vi.mocked(data.gatherDebitTransactionsInViewSortedByDate).mockReturnValue([
                { date: today, description: 'TEST', amount: 10 },
            ]);
            vi.mocked(data.convertTransactionToTSV).mockReturnValue('tsv');

            const { result } = renderHook(() => useFeatures(mockDialog));
            await act(() => result.current.debitTransactionsWithDate());

            expect(mockWriteText).toHaveBeenCalled();
        });
    });

    describe('copyCurrentBalance', () => {
        it('copies balance string to clipboard', async () => {
            const mockDialog = createMockDialog();
            vi.mocked(data.getCurrentBalance).mockReturnValue('36.00');

            const { result } = renderHook(() => useFeatures(mockDialog));
            await act(() => result.current.copyCurrentBalance());

            expect(mockWriteText).toHaveBeenCalledWith('36.00');
            expect(mockDialog.alert).toHaveBeenCalledWith('Current balance copied to clipboard');
        });
    });

    describe('copyAvailableBalance', () => {
        it('copies available balance to clipboard', async () => {
            const mockDialog = createMockDialog();
            vi.mocked(data.getAvailableBalance).mockReturnValue('36.00');

            const { result } = renderHook(() => useFeatures(mockDialog));
            await act(() => result.current.copyAvailableBalance());

            expect(mockWriteText).toHaveBeenCalledWith('36.00');
            expect(mockDialog.alert).toHaveBeenCalledWith('Available balance copied to clipboard');
        });
    });

    it('shows alert with transaction count after copy', async () => {
        const mockDialog = createMockDialog();
        vi.mocked(data.gatherDebitTransactionsInViewSortedByDate).mockReturnValue([
            { date: new Date().toLocaleDateString(), description: 'A', amount: 10 },
            { date: new Date().toLocaleDateString(), description: 'B', amount: 20 },
        ]);
        vi.mocked(data.convertTransactionToTSV).mockImplementation(
            (t) => `${t.date}\t${t.description}\t${t.amount}`,
        );

        const { result } = renderHook(() => useFeatures(mockDialog));
        await act(() => result.current.debitTransactionsFromToday());

        expect(mockDialog.alert).toHaveBeenCalledWith('2 transactions copied to clipboard');
    });

    it('shows error alert when clipboard write fails', async () => {
        const mockDialog = createMockDialog();
        vi.mocked(data.getCurrentBalance).mockReturnValue('36.00');
        mockWriteText.mockRejectedValue(new Error('denied'));

        const { result } = renderHook(() => useFeatures(mockDialog));
        await act(() => result.current.copyCurrentBalance());

        expect(mockDialog.alert).toHaveBeenCalledWith(
            'Error copying current balance. Please try again.',
        );
    });
});

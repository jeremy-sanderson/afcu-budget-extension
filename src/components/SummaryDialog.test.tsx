import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SummaryDialog from './SummaryDialog';
import type { DebitsForDate } from '../utils/types';

const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
    mockWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
    });
});

const sampleDebits: DebitsForDate[] = [
    {
        date: '4/9/2025',
        count: 2,
        transactions: [
            { date: '4/9/2025', description: 'GOOGLE', amount: 10.73 },
            { date: '4/9/2025', description: 'VENMO', amount: 45 },
        ],
    },
    {
        date: '4/12/2025',
        count: 1,
        transactions: [{ date: '4/12/2025', description: 'WALMART', amount: 203.07 }],
    },
];

describe('SummaryDialog', () => {
    it('renders both balances and per-date counts', () => {
        render(
            <SummaryDialog
                currentBalance="100.00"
                availableBalance="80.00"
                debitsByDate={sampleDebits}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('Current balance')).toBeInTheDocument();
        expect(screen.getByText('100.00')).toBeInTheDocument();
        expect(screen.getByText('Available balance')).toBeInTheDocument();
        expect(screen.getByText('80.00')).toBeInTheDocument();
        expect(screen.getByText('4/9/2025')).toBeInTheDocument();
        expect(screen.getByText('2 transactions')).toBeInTheDocument();
        expect(screen.getByText('4/12/2025')).toBeInTheDocument();
        expect(screen.getByText('1 transaction')).toBeInTheDocument();
    });

    it('formats balances with thousands separators', () => {
        render(
            <SummaryDialog
                currentBalance="1234567.8"
                availableBalance="1000"
                debitsByDate={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('1,234,567.80')).toBeInTheDocument();
        expect(screen.getByText('1,000.00')).toBeInTheDocument();
    });

    it('still copies the raw balance string without formatting', async () => {
        render(
            <SummaryDialog
                currentBalance="1234567.8"
                availableBalance="1000"
                debitsByDate={[]}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy current balance'));
        });
        expect(mockWriteText).toHaveBeenCalledWith('1234567.8');
    });

    it('copies the current balance to the clipboard', async () => {
        render(
            <SummaryDialog
                currentBalance="100.00"
                availableBalance="80.00"
                debitsByDate={[]}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy current balance'));
        });
        expect(mockWriteText).toHaveBeenCalledWith('100.00');
    });

    it('copies the day debits as TSV', async () => {
        render(
            <SummaryDialog
                currentBalance="100.00"
                availableBalance="80.00"
                debitsByDate={sampleDebits}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy debits from 4/9/2025'));
        });
        expect(mockWriteText).toHaveBeenCalledWith('4/9/2025\tGOOGLE\t10.73\n4/9/2025\tVENMO\t45');
    });

    it('shows an empty state when there are no debits', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                debitsByDate={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('No debit transactions on this page.')).toBeInTheDocument();
    });

    it('hides the copy button when a balance is missing', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance="80.00"
                debitsByDate={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.queryByLabelText('Copy current balance')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Copy available balance')).toBeInTheDocument();
    });

    it('orders debit dates newest first', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                debitsByDate={sampleDebits}
                onClose={() => {}}
            />,
        );

        const dateCells = screen.getAllByText(/^\d+\/\d+\/\d+$/);
        expect(dateCells.map((el) => el.textContent)).toEqual(['4/12/2025', '4/9/2025']);
    });

    it('shows only the 5 most recent dates and a Load more button', () => {
        const sevenDays: DebitsForDate[] = Array.from({ length: 7 }, (_, i) => {
            const date = `4/${i + 1}/2025`;
            return {
                date,
                count: 1,
                transactions: [{ date, description: 'X', amount: 1 }],
            };
        });

        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                debitsByDate={sevenDays}
                onClose={() => {}}
            />,
        );

        const dateCells = screen.getAllByText(/^\d+\/\d+\/\d+$/);
        expect(dateCells.map((el) => el.textContent)).toEqual([
            '4/7/2025',
            '4/6/2025',
            '4/5/2025',
            '4/4/2025',
            '4/3/2025',
        ]);
        expect(screen.getByRole('button', { name: 'Load 2 more' })).toBeInTheDocument();
    });

    it('loads the next page of dates when Load more is clicked', () => {
        const sevenDays: DebitsForDate[] = Array.from({ length: 7 }, (_, i) => {
            const date = `4/${i + 1}/2025`;
            return {
                date,
                count: 1,
                transactions: [{ date, description: 'X', amount: 1 }],
            };
        });

        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                debitsByDate={sevenDays}
                onClose={() => {}}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Load 2 more' }));

        const dateCells = screen.getAllByText(/^\d+\/\d+\/\d+$/);
        expect(dateCells).toHaveLength(7);
        expect(screen.queryByRole('button', { name: /Load \d+ more/ })).not.toBeInTheDocument();
    });

    it('does not show Load more when 5 or fewer dates exist', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                debitsByDate={sampleDebits}
                onClose={() => {}}
            />,
        );

        expect(screen.queryByRole('button', { name: /Load \d+ more/ })).not.toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <SummaryDialog
                currentBalance="100.00"
                availableBalance="80.00"
                debitsByDate={[]}
                onClose={onClose}
            />,
        );

        await user.click(screen.getByText('Close'));
        expect(onClose).toHaveBeenCalled();
    });
});

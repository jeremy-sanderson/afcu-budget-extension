import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SummaryDialog from './SummaryDialog';
import type { TransactionsForDate } from '../utils/types';

const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
    mockWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
    });
});

const sampleByDate: TransactionsForDate[] = [
    {
        date: '4/9/2025',
        debits: [
            { date: '4/9/2025', description: 'GOOGLE', amount: 10.73 },
            { date: '4/9/2025', description: 'VENMO', amount: 45 },
        ],
        credits: [{ date: '4/9/2025', description: 'PAYCHECK', amount: 500 }],
    },
    {
        date: '4/12/2025',
        debits: [{ date: '4/12/2025', description: 'WALMART', amount: 203.07 }],
        credits: [],
    },
];

describe('SummaryDialog', () => {
    it('renders both balances and per-date debit and credit totals', () => {
        render(
            <SummaryDialog
                currentBalance="100.00"
                availableBalance="80.00"
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('Current balance')).toBeInTheDocument();
        expect(screen.getByText('$100.00')).toBeInTheDocument();
        expect(screen.getByText('Available balance')).toBeInTheDocument();
        expect(screen.getByText('$80.00')).toBeInTheDocument();
        expect(screen.getByText('4/9/2025')).toBeInTheDocument();
        expect(screen.getByText('4/12/2025')).toBeInTheDocument();
        expect(screen.getByText('$55.73')).toBeInTheDocument();
        expect(screen.getByText('$500.00')).toBeInTheDocument();
        expect(screen.getByText('$203.07')).toBeInTheDocument();
    });

    it('renders Debits and Credits column headers', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('Debits')).toBeInTheDocument();
        expect(screen.getByText('Credits')).toBeInTheDocument();
    });

    it('formats balances with thousands separators', () => {
        render(
            <SummaryDialog
                currentBalance="1234567.8"
                availableBalance="1000"
                transactionsByDate={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('$1,234,567.80')).toBeInTheDocument();
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    });

    it('still copies the raw balance string without formatting', async () => {
        render(
            <SummaryDialog
                currentBalance="1234567.8"
                availableBalance="1000"
                transactionsByDate={[]}
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
                transactionsByDate={[]}
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
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy debits from 4/9/2025'));
        });
        expect(mockWriteText).toHaveBeenCalledWith('4/9/2025\tGOOGLE\t10.73\n4/9/2025\tVENMO\t45');
    });

    it('copies the day credits as TSV', async () => {
        render(
            <SummaryDialog
                currentBalance="100.00"
                availableBalance="80.00"
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy credits from 4/9/2025'));
        });
        expect(mockWriteText).toHaveBeenCalledWith('4/9/2025\tPAYCHECK\t500');
    });

    it('hides the credit copy button when a date has no credits', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        expect(screen.queryByLabelText('Copy credits from 4/12/2025')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Copy debits from 4/12/2025')).toBeInTheDocument();
    });

    it('shows an empty state when there are no transactions', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('No transactions on this page.')).toBeInTheDocument();
    });

    it('hides the copy button when a balance is missing', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance="80.00"
                transactionsByDate={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.queryByLabelText('Copy current balance')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Copy available balance')).toBeInTheDocument();
    });

    it('orders dates newest first', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        const dateCells = screen.getAllByText(/^\d+\/\d+\/\d+$/);
        expect(dateCells.map((el) => el.textContent)).toEqual(['4/12/2025', '4/9/2025']);
    });

    it('shows only the 5 most recent dates and a Load more button', () => {
        const sevenDays: TransactionsForDate[] = Array.from({ length: 7 }, (_, i) => {
            const date = `4/${i + 1}/2025`;
            return {
                date,
                debits: [{ date, description: 'X', amount: 1 }],
                credits: [],
            };
        });

        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sevenDays}
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
        const sevenDays: TransactionsForDate[] = Array.from({ length: 7 }, (_, i) => {
            const date = `4/${i + 1}/2025`;
            return {
                date,
                debits: [{ date, description: 'X', amount: 1 }],
                credits: [],
            };
        });

        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sevenDays}
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
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        expect(screen.queryByRole('button', { name: /Load \d+ more/ })).not.toBeInTheDocument();
    });

    it('opens a debit-only dialog when the debit pop-out is clicked', async () => {
        const user = userEvent.setup();
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        await user.click(screen.getByLabelText('View debits for 4/9/2025'));

        expect(screen.getByText('Debits on 4/9/2025')).toBeInTheDocument();
        expect(screen.getByText('GOOGLE')).toBeInTheDocument();
        expect(screen.getByText('VENMO')).toBeInTheDocument();
        expect(screen.queryByText('PAYCHECK')).not.toBeInTheDocument();
    });

    it('opens a credit-only dialog when the credit pop-out is clicked', async () => {
        const user = userEvent.setup();
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        await user.click(screen.getByLabelText('View credits for 4/9/2025'));

        expect(screen.getByText('Credits on 4/9/2025')).toBeInTheDocument();
        expect(screen.getByText('PAYCHECK')).toBeInTheDocument();
        expect(screen.queryByText('GOOGLE')).not.toBeInTheDocument();
    });

    it('does not render a credit pop-out when a date has no credits', () => {
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        expect(screen.queryByLabelText('View credits for 4/12/2025')).not.toBeInTheDocument();
        expect(screen.getByLabelText('View debits for 4/12/2025')).toBeInTheDocument();
    });

    it('closes the debit dialog when its Close button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <SummaryDialog
                currentBalance={null}
                availableBalance={null}
                transactionsByDate={sampleByDate}
                onClose={() => {}}
            />,
        );

        await user.click(screen.getByLabelText('View debits for 4/9/2025'));
        expect(screen.getByText('Debits on 4/9/2025')).toBeInTheDocument();

        const closeButtons = screen.getAllByText('Close');
        await user.click(closeButtons[closeButtons.length - 1]);

        expect(screen.queryByText('Debits on 4/9/2025')).not.toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <SummaryDialog
                currentBalance="100.00"
                availableBalance="80.00"
                transactionsByDate={[]}
                onClose={onClose}
            />,
        );

        await user.click(screen.getByText('Close'));
        expect(onClose).toHaveBeenCalled();
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionsDialog from './TransactionsDialog';
import type { Transaction } from '../utils/types';

const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
    mockWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
    });
});

const sampleTransactions: Transaction[] = [
    { date: '4/9/2025', description: 'GOOGLE', amount: 10.73 },
    { date: '4/9/2025', description: 'VENMO', amount: 45 },
];

describe('TransactionsDialog', () => {
    it('renders the date in the title', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                transactions={sampleTransactions}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('Transactions on 4/9/2025')).toBeInTheDocument();
    });

    it('lists each transaction with its description and formatted amount', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                transactions={sampleTransactions}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('GOOGLE')).toBeInTheDocument();
        expect(screen.getByText('$10.73')).toBeInTheDocument();
        expect(screen.getByText('VENMO')).toBeInTheDocument();
        expect(screen.getByText('$45.00')).toBeInTheDocument();
    });

    it('shows the total of all transaction amounts', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                transactions={sampleTransactions}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('$55.73')).toBeInTheDocument();
    });

    it('shows an empty state when there are no transactions', () => {
        render(<TransactionsDialog date="4/9/2025" transactions={[]} onClose={() => {}} />);

        expect(screen.getByText('No transactions for this date.')).toBeInTheDocument();
        expect(screen.queryByText('Total')).not.toBeInTheDocument();
    });

    it('copies all transactions as TSV when the copy-all button is clicked', async () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                transactions={sampleTransactions}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy all transactions for 4/9/2025'));
        });

        expect(mockWriteText).toHaveBeenCalledWith('4/9/2025\tGOOGLE\t10.73\n4/9/2025\tVENMO\t45');
    });

    it('copies a single transaction as TSV when its row copy button is clicked', async () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                transactions={sampleTransactions}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy VENMO'));
        });

        expect(mockWriteText).toHaveBeenCalledWith('4/9/2025\tVENMO\t45');
    });

    it('renders a copy button for every transaction row', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                transactions={sampleTransactions}
                onClose={() => {}}
            />,
        );

        expect(screen.getByLabelText('Copy GOOGLE')).toBeInTheDocument();
        expect(screen.getByLabelText('Copy VENMO')).toBeInTheDocument();
    });

    it('does not render any copy buttons when there are no transactions', () => {
        render(<TransactionsDialog date="4/9/2025" transactions={[]} onClose={() => {}} />);

        expect(
            screen.queryByLabelText('Copy all transactions for 4/9/2025'),
        ).not.toBeInTheDocument();
    });

    it('calls onClose when Close is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <TransactionsDialog
                date="4/9/2025"
                transactions={sampleTransactions}
                onClose={onClose}
            />,
        );

        await user.click(screen.getByText('Close'));
        expect(onClose).toHaveBeenCalled();
    });
});

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

const sampleDebits: Transaction[] = [
    { date: '4/9/2025', description: 'GOOGLE', amount: 10.73 },
    { date: '4/9/2025', description: 'VENMO', amount: 45 },
];

const sampleCredits: Transaction[] = [{ date: '4/9/2025', description: 'PAYCHECK', amount: 500 }];

describe('TransactionsDialog (debits)', () => {
    it('renders the date in the title', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="debit"
                transactions={sampleDebits}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('Debits on 4/9/2025')).toBeInTheDocument();
    });

    it('lists each transaction with its description and formatted amount', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="debit"
                transactions={sampleDebits}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('GOOGLE')).toBeInTheDocument();
        expect(screen.getByText('$10.73')).toBeInTheDocument();
        expect(screen.getByText('VENMO')).toBeInTheDocument();
        expect(screen.getByText('$45.00')).toBeInTheDocument();
    });

    it('shows the total of all debit amounts', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="debit"
                transactions={sampleDebits}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('$55.73')).toBeInTheDocument();
    });

    it('shows the debit-specific empty state', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="debit"
                transactions={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('No debits for this date.')).toBeInTheDocument();
        expect(screen.queryByText('Total')).not.toBeInTheDocument();
    });

    it('copies all debits as TSV when the copy-all button is clicked', async () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="debit"
                transactions={sampleDebits}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy all debits for 4/9/2025'));
        });

        expect(mockWriteText).toHaveBeenCalledWith('4/9/2025\tGOOGLE\t10.73\n4/9/2025\tVENMO\t45');
    });

    it('copies a single transaction as TSV when its row copy button is clicked', async () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="debit"
                transactions={sampleDebits}
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
                kind="debit"
                transactions={sampleDebits}
                onClose={() => {}}
            />,
        );

        expect(screen.getByLabelText('Copy GOOGLE')).toBeInTheDocument();
        expect(screen.getByLabelText('Copy VENMO')).toBeInTheDocument();
    });

    it('calls onClose when Close is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="debit"
                transactions={sampleDebits}
                onClose={onClose}
            />,
        );

        await user.click(screen.getByText('Close'));
        expect(onClose).toHaveBeenCalled();
    });
});

describe('TransactionsDialog (credits)', () => {
    it('renders the credit title and credit copy-all label', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="credit"
                transactions={sampleCredits}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('Credits on 4/9/2025')).toBeInTheDocument();
        expect(screen.getByLabelText('Copy all credits for 4/9/2025')).toBeInTheDocument();
    });

    it('shows the credit-specific empty state', () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="credit"
                transactions={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('No credits for this date.')).toBeInTheDocument();
    });

    it('copies all credits as TSV when the copy-all button is clicked', async () => {
        render(
            <TransactionsDialog
                date="4/9/2025"
                kind="credit"
                transactions={sampleCredits}
                onClose={() => {}}
            />,
        );

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Copy all credits for 4/9/2025'));
        });

        expect(mockWriteText).toHaveBeenCalledWith('4/9/2025\tPAYCHECK\t500');
    });
});

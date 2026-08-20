import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BudgetMenu from './BudgetMenu';

const mockItems = [
    { text: 'Debits from Yesterday', onClick: vi.fn() },
    { text: 'Debits from Today', onClick: vi.fn() },
    { text: 'Current Balance', onClick: vi.fn() },
];

describe('BudgetMenu', () => {
    it('renders button with "Budgeting" text', () => {
        render(<BudgetMenu items={mockItems} />);
        expect(screen.getByText('Budgeting')).toBeInTheDocument();
    });

    it('dropdown is hidden by default', () => {
        render(<BudgetMenu items={mockItems} />);
        expect(screen.getByRole('menu', { hidden: true })).toHaveAttribute('data-state', 'closed');
    });

    it('dropdown appears on button click', async () => {
        const user = userEvent.setup();
        render(<BudgetMenu items={mockItems} />);

        await user.click(screen.getByText('Budgeting'));
        expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'open');
        expect(screen.getByText('Debits from Yesterday')).toBeInTheDocument();
        expect(screen.getByText('Debits from Today')).toBeInTheDocument();
        expect(screen.getByText('Current Balance')).toBeInTheDocument();
    });

    it('dropdown closes on second button click', async () => {
        const user = userEvent.setup();
        render(<BudgetMenu items={mockItems} />);

        await user.click(screen.getByText('Budgeting'));
        expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'open');

        await user.click(screen.getByText('Budgeting'));
        expect(screen.getByRole('menu', { hidden: true })).toHaveAttribute('data-state', 'closed');
    });

    it('menu items render with correct text', async () => {
        const user = userEvent.setup();
        render(<BudgetMenu items={mockItems} />);

        await user.click(screen.getByText('Budgeting'));
        mockItems.forEach((item) => {
            expect(screen.getByText(item.text)).toBeInTheDocument();
        });
    });

    it('menu item onClick fires when clicked', async () => {
        render(<BudgetMenu items={mockItems} />);

        // Ark UI's menu machine processes events via queueMicrotask, so pointerdown and
        // click need a real tick between them (userEvent.click's built-in sequencing isn't
        // enough) and the resulting onSelect callback must be awaited via waitFor.
        fireEvent.click(screen.getByText('Budgeting'));
        const item = screen.getByText('Current Balance');
        await act(async () => {
            fireEvent.pointerDown(item);
            await new Promise((r) => setTimeout(r, 0));
        });
        fireEvent.click(item);
        await waitFor(() => expect(mockItems[2].onClick).toHaveBeenCalled());
    });
});

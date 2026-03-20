import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
        expect(screen.queryByText('Debits from Yesterday')).not.toBeInTheDocument();
    });

    it('dropdown appears on button click', async () => {
        const user = userEvent.setup();
        render(<BudgetMenu items={mockItems} />);

        await user.click(screen.getByText('Budgeting'));
        expect(screen.getByText('Debits from Yesterday')).toBeInTheDocument();
        expect(screen.getByText('Debits from Today')).toBeInTheDocument();
        expect(screen.getByText('Current Balance')).toBeInTheDocument();
    });

    it('dropdown closes on second button click', async () => {
        const user = userEvent.setup();
        render(<BudgetMenu items={mockItems} />);

        await user.click(screen.getByText('Budgeting'));
        expect(screen.getByText('Debits from Yesterday')).toBeInTheDocument();

        await user.click(screen.getByText('Budgeting'));
        expect(screen.queryByText('Debits from Yesterday')).not.toBeInTheDocument();
    });

    it('menu items render with correct text', async () => {
        const user = userEvent.setup();
        render(<BudgetMenu items={mockItems} />);

        await user.click(screen.getByText('Budgeting'));
        mockItems.forEach(item => {
            expect(screen.getByText(item.text)).toBeInTheDocument();
        });
    });

    it('menu item onClick fires when clicked', async () => {
        const user = userEvent.setup();
        render(<BudgetMenu items={mockItems} />);

        await user.click(screen.getByText('Budgeting'));
        await user.click(screen.getByText('Current Balance'));
        expect(mockItems[2].onClick).toHaveBeenCalled();
    });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BudgetPanel from './BudgetPanel';

const mockItems = [
    { text: 'Debits from Yesterday', onClick: vi.fn() },
    { text: 'Debits from Today', onClick: vi.fn() },
    { text: 'Current Balance', onClick: vi.fn() },
];

describe('BudgetPanel', () => {
    it('renders "Budgeting" header', () => {
        render(<BudgetPanel items={mockItems} />);
        expect(screen.getByText('Budgeting', { selector: 'div' })).toBeInTheDocument();
    });

    it('renders all items as buttons with correct text', () => {
        render(<BudgetPanel items={mockItems} />);
        mockItems.forEach((item) => {
            expect(
                screen.getByRole('button', { name: item.text, hidden: true }),
            ).toBeInTheDocument();
        });
    });

    it('item onClick fires when clicked', async () => {
        const user = userEvent.setup();
        render(<BudgetPanel items={mockItems} />);
        await user.click(screen.getByRole('button', { name: 'Current Balance', hidden: true }));
        expect(mockItems[2].onClick).toHaveBeenCalled();
    });
});

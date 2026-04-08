import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptDialog from './PromptDialog';

describe('PromptDialog', () => {
    it('renders message and input', () => {
        render(<PromptDialog message="Enter value:" onSubmit={() => {}} onCancel={() => {}} />);
        expect(screen.getByText('Enter value:')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('submits input value on OK click', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<PromptDialog message="Enter:" onSubmit={onSubmit} onCancel={() => {}} />);

        await user.type(screen.getByRole('textbox'), '4/10/2025');
        await user.click(screen.getByText('OK'));
        expect(onSubmit).toHaveBeenCalledWith('4/10/2025');
    });

    it('calls onCancel on Cancel click', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        render(<PromptDialog message="Enter:" onSubmit={() => {}} onCancel={onCancel} />);

        await user.click(screen.getByText('Cancel'));
        expect(onCancel).toHaveBeenCalled();
    });

    it('handles empty input submission', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<PromptDialog message="Enter:" onSubmit={onSubmit} onCancel={() => {}} />);

        await user.click(screen.getByText('OK'));
        expect(onSubmit).toHaveBeenCalledWith('');
    });
});

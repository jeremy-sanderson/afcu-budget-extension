import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptDialog from './PromptDialog';

beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
});

describe('PromptDialog', () => {
    it('renders message and input when open', () => {
        render(
            <PromptDialog message="Enter value:" open={true} onSubmit={() => {}} onCancel={() => {}} />
        );
        expect(screen.getByText('Enter value:')).toBeInTheDocument();
        // Dialog content is inaccessible in happy-dom since dialog isn't truly "open"
        expect(screen.getByRole('textbox', { hidden: true })).toBeInTheDocument();
    });

    it('submits input value on OK click', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(
            <PromptDialog message="Enter:" open={true} onSubmit={onSubmit} onCancel={() => {}} />
        );

        const input = screen.getByRole('textbox', { hidden: true });
        await user.type(input, '4/10/2025');
        await user.click(screen.getByText('OK'));
        expect(onSubmit).toHaveBeenCalledWith('4/10/2025');
    });

    it('calls onCancel on Cancel click', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        render(
            <PromptDialog message="Enter:" open={true} onSubmit={() => {}} onCancel={onCancel} />
        );

        await user.click(screen.getByText('Cancel'));
        expect(onCancel).toHaveBeenCalled();
    });

    it('handles empty input submission', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(
            <PromptDialog message="Enter:" open={true} onSubmit={onSubmit} onCancel={() => {}} />
        );

        await user.click(screen.getByText('OK'));
        expect(onSubmit).toHaveBeenCalledWith('');
    });
});

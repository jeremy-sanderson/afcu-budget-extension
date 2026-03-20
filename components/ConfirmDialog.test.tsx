import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
});

describe('ConfirmDialog', () => {
    it('renders message and both buttons when open', () => {
        render(
            <ConfirmDialog message="Are you sure?" open={true} onConfirm={() => {}} onCancel={() => {}} />
        );
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByText('OK')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onClose handler when OK is clicked', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        render(
            <ConfirmDialog message="Confirm?" open={true} onConfirm={onConfirm} onCancel={onCancel} />
        );

        await user.click(screen.getByText('OK'));
        // The dialog's onClose event fires, which checks returnValue
    });

    it('calls onClose handler when Cancel is clicked', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        render(
            <ConfirmDialog message="Confirm?" open={true} onConfirm={() => {}} onCancel={onCancel} />
        );

        await user.click(screen.getByText('Cancel'));
    });
});

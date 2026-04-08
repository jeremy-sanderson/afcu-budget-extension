import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
    it('renders message and both buttons', () => {
        render(<ConfirmDialog message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />);
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByText('OK')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onConfirm when OK is clicked', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        render(<ConfirmDialog message="Confirm?" onConfirm={onConfirm} onCancel={() => {}} />);

        await user.click(screen.getByText('OK'));
        expect(onConfirm).toHaveBeenCalled();
    });

    it('calls onCancel when Cancel is clicked', async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        render(<ConfirmDialog message="Confirm?" onConfirm={() => {}} onCancel={onCancel} />);

        await user.click(screen.getByText('Cancel'));
        expect(onCancel).toHaveBeenCalled();
    });
});

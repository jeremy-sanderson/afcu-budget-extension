import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlertDialog from './AlertDialog';

beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
});

describe('AlertDialog', () => {
    it('renders with message text when open', () => {
        render(<AlertDialog message="Test message" open={true} onClose={() => {}} />);
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('calls showModal when open is true', () => {
        render(<AlertDialog message="Test" open={true} onClose={() => {}} />);
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });

    it('does not call showModal when open is false', () => {
        render(<AlertDialog message="Test" open={false} onClose={() => {}} />);
        expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });

    it('calls onClose when OK button is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(<AlertDialog message="Test" open={true} onClose={onClose} />);

        const dialog = document.querySelector('dialog')!;
        // Simulate native close event since happy-dom doesn't support dialog form submission
        await user.click(screen.getByText('OK'));
        dialog.dispatchEvent(new Event('close'));
        expect(onClose).toHaveBeenCalled();
    });

    it('OK button has AFCU blue styling', () => {
        render(<AlertDialog message="Test" open={true} onClose={() => {}} />);
        const button = screen.getByText('OK');
        expect(button.className).toContain('bg-[#00548e]');
    });
});

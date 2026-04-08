import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlertDialog from './AlertDialog';

describe('AlertDialog', () => {
    it('renders with message text', () => {
        render(<AlertDialog message="Test message" onClose={() => {}} />);
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders OK button', () => {
        render(<AlertDialog message="Test" onClose={() => {}} />);
        expect(screen.getByText('OK')).toBeInTheDocument();
    });

    it('calls onClose when OK button is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(<AlertDialog message="Test" onClose={onClose} />);

        await user.click(screen.getByText('OK'));
        expect(onClose).toHaveBeenCalled();
    });

    it('OK button has AFCU blue styling', () => {
        render(<AlertDialog message="Test" onClose={() => {}} />);
        const button = screen.getByText('OK');
        expect(button.className).toContain('bg-[#00548e]');
    });
});

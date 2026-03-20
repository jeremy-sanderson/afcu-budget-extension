import { useRef, useEffect } from 'react';

interface ConfirmDialogProps {
    message: string;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ message, open, onConfirm, onCancel }: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    const handleClose = () => {
        const dialog = dialogRef.current;
        if (dialog?.returnValue === 'ok') {
            onConfirm();
        } else {
            onCancel();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={handleClose}
            className="rounded-lg p-5 min-w-[300px] max-w-[80%] shadow-lg backdrop:bg-black/50"
        >
            <form method="dialog">
                <div className="mb-5 text-base text-gray-800 whitespace-pre-wrap break-words">
                    {message}
                </div>
                <div className="text-right mt-5">
                    <button
                        type="submit"
                        value="cancel"
                        className="bg-gray-500 text-white border-none rounded px-3 py-2 text-sm cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        value="ok"
                        className="bg-[#00548e] text-white border-none rounded px-3 py-2 text-sm cursor-pointer ml-2"
                    >
                        OK
                    </button>
                </div>
            </form>
        </dialog>
    );
}

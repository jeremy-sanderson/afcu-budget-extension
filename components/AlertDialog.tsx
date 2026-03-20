import { useRef, useEffect } from 'react';

interface AlertDialogProps {
    message: string;
    open: boolean;
    onClose: () => void;
}

export default function AlertDialog({ message, open, onClose }: AlertDialogProps) {
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

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 min-w-[400px] max-w-[80%] shadow-lg backdrop:bg-black/50"
        >
            <form method="dialog">
                <div className="mb-5 text-lg text-gray-800 whitespace-pre-wrap break-words">
                    {message}
                </div>
                <div className="text-right mt-5">
                    <button
                        type="submit"
                        value="ok"
                        className="bg-[#00548e] text-white border-none rounded px-4 py-2 text-base cursor-pointer"
                    >
                        OK
                    </button>
                </div>
            </form>
        </dialog>
    );
}

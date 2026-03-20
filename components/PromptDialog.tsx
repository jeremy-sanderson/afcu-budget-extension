import { useRef, useEffect, useState } from 'react';

interface PromptDialogProps {
    message: string;
    open: boolean;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}

export default function PromptDialog({ message, open, onSubmit, onCancel }: PromptDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState('');

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
            inputRef.current?.focus();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(value);
        setValue('');
    };

    const handleCancel = () => {
        onCancel();
        setValue('');
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={handleCancel}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 min-w-[400px] max-w-[80%] shadow-lg backdrop:bg-black/50"
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-5 text-lg text-gray-800 whitespace-pre-wrap break-words">
                    {message}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full box-border p-2 text-base mb-5 rounded border border-gray-300"
                />
                <div className="text-right mt-5">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-500 text-white border-none rounded px-4 py-2 text-base cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-[#00548e] text-white border-none rounded px-4 py-2 text-base cursor-pointer ml-2"
                    >
                        OK
                    </button>
                </div>
            </form>
        </dialog>
    );
}

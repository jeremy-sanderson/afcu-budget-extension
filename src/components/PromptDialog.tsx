import { useState } from 'react';
import { Dialog } from '@ark-ui/react';

interface PromptDialogProps {
    message: string;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}

export default function PromptDialog({ message, onSubmit, onCancel }: PromptDialogProps) {
    const [value, setValue] = useState('');

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
        <Dialog.Root open={true} onOpenChange={(e) => !e.open && handleCancel()}>
            <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
            <Dialog.Positioner className="fixed inset-0 flex items-center justify-center">
                <Dialog.Content className="rounded-lg p-6 min-w-[400px] max-w-[80%] shadow-lg bg-white">
                    <form onSubmit={handleSubmit}>
                        <Dialog.Description className="mb-5 text-lg text-gray-800 whitespace-pre-wrap break-words">
                            {message}
                        </Dialog.Description>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            autoFocus
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
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}

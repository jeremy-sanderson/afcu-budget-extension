import { Dialog } from '@ark-ui/react';

interface ConfirmDialogProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
    return (
        <Dialog.Root open={true} onOpenChange={(e) => !e.open && onCancel()} role="alertdialog">
            <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
            <Dialog.Positioner className="fixed inset-0 flex items-center justify-center">
                <Dialog.Content className="rounded-lg p-6 min-w-[400px] max-w-[80%] shadow-lg bg-white">
                    <Dialog.Description className="mb-5 text-lg text-gray-800 whitespace-pre-wrap break-words">
                        {message}
                    </Dialog.Description>
                    <div className="text-right mt-5">
                        <Dialog.CloseTrigger className="bg-gray-500 text-white border-none rounded px-4 py-2 text-base cursor-pointer">
                            Cancel
                        </Dialog.CloseTrigger>
                        <button
                            onClick={() => {
                                onConfirm();
                            }}
                            className="bg-[#00548e] text-white border-none rounded px-4 py-2 text-base cursor-pointer ml-2"
                        >
                            OK
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}

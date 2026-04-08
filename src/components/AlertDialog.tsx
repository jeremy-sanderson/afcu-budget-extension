import { Dialog } from '@ark-ui/react';

interface AlertDialogProps {
    message: string;
    onClose: () => void;
}

export default function AlertDialog({ message, onClose }: AlertDialogProps) {
    return (
        <Dialog.Root open={true} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
            <Dialog.Positioner className="fixed inset-0 flex items-center justify-center">
                <Dialog.Content className="rounded-lg p-6 min-w-[400px] max-w-[80%] shadow-lg bg-white">
                    <Dialog.Description className="mb-5 text-lg text-gray-800 whitespace-pre-wrap break-words">
                        {message}
                    </Dialog.Description>
                    <div className="text-right mt-5">
                        <Dialog.CloseTrigger className="bg-[#00548e] text-white border-none rounded px-4 py-2 text-base cursor-pointer">
                            OK
                        </Dialog.CloseTrigger>
                    </div>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}

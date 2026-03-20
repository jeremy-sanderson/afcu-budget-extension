import { useState, useCallback } from 'react';

interface DialogState {
    type: 'alert' | 'confirm' | 'prompt' | null;
    message: string;
    resolve: ((value: any) => void) | null;
}

export interface DialogAPI {
    dialogState: DialogState;
    alert: (message: string) => Promise<void>;
    confirm: (message: string) => Promise<boolean>;
    prompt: (message: string) => Promise<string | null>;
    closeDialog: () => void;
    resolveDialog: (value: any) => void;
}

export default function useDialog(): DialogAPI {
    const [dialogState, setDialogState] = useState<DialogState>({
        type: null,
        message: '',
        resolve: null,
    });

    const alert = useCallback((message: string): Promise<void> => {
        return new Promise((resolve) => {
            setDialogState({ type: 'alert', message, resolve });
        });
    }, []);

    const confirm = useCallback((message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({ type: 'confirm', message, resolve });
        });
    }, []);

    const prompt = useCallback((message: string): Promise<string | null> => {
        return new Promise((resolve) => {
            setDialogState({ type: 'prompt', message, resolve });
        });
    }, []);

    const closeDialog = useCallback(() => {
        dialogState.resolve?.(undefined);
        setDialogState({ type: null, message: '', resolve: null });
    }, [dialogState.resolve]);

    const resolveDialog = useCallback(
        (value: any) => {
            dialogState.resolve?.(value);
            setDialogState({ type: null, message: '', resolve: null });
        },
        [dialogState.resolve],
    );

    return { dialogState, alert, confirm, prompt, closeDialog, resolveDialog };
}

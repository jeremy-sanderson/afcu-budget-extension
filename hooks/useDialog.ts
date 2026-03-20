import { useState, useCallback, useRef } from 'react';

type DialogValue = void | boolean | string | null;

interface DialogState {
    type: 'alert' | 'confirm' | 'prompt' | null;
    message: string;
}

export interface DialogAPI {
    dialogState: DialogState;
    alert: (message: string) => Promise<void>;
    confirm: (message: string) => Promise<boolean>;
    prompt: (message: string) => Promise<string | null>;
    closeDialog: () => void;
    resolveDialog: (value: DialogValue) => void;
}

export default function useDialog(): DialogAPI {
    const [dialogState, setDialogState] = useState<DialogState>({
        type: null,
        message: '',
    });
    const resolveRef = useRef<((value: DialogValue) => void) | null>(null);

    const alert = useCallback((message: string): Promise<void> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve as (value: DialogValue) => void;
            setDialogState({ type: 'alert', message });
        });
    }, []);

    const confirm = useCallback((message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve as (value: DialogValue) => void;
            setDialogState({ type: 'confirm', message });
        });
    }, []);

    const prompt = useCallback((message: string): Promise<string | null> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve as (value: DialogValue) => void;
            setDialogState({ type: 'prompt', message });
        });
    }, []);

    const closeDialog = useCallback(() => {
        resolveRef.current?.(undefined);
        resolveRef.current = null;
        setDialogState({ type: null, message: '' });
    }, []);

    const resolveDialog = useCallback((value: DialogValue) => {
        resolveRef.current?.(value);
        resolveRef.current = null;
        setDialogState({ type: null, message: '' });
    }, []);

    return { dialogState, alert, confirm, prompt, closeDialog, resolveDialog };
}

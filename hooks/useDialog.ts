import { useState, useCallback } from 'react';

interface AlertState {
    type: 'alert';
    message: string;
}

interface ConfirmState {
    type: 'confirm';
    message: string;
    onResult: (confirmed: boolean) => void;
}

interface PromptState {
    type: 'prompt';
    message: string;
    onResult: (value: string | null) => void;
}

interface ClosedState {
    type: null;
}

type DialogState = AlertState | ConfirmState | PromptState | ClosedState;

export interface DialogAPI {
    dialogState: DialogState;
    showAlert: (message: string) => void;
    showConfirm: (message: string, onResult: (confirmed: boolean) => void) => void;
    showPrompt: (message: string, onResult: (value: string | null) => void) => void;
    close: () => void;
}

export default function useDialog(): DialogAPI {
    const [dialogState, setDialogState] = useState<DialogState>({ type: null });

    const showAlert = useCallback((message: string) => {
        setDialogState({ type: 'alert', message });
    }, []);

    const showConfirm = useCallback(
        (message: string, onResult: (confirmed: boolean) => void) => {
            setDialogState({ type: 'confirm', message, onResult });
        },
        [],
    );

    const showPrompt = useCallback(
        (message: string, onResult: (value: string | null) => void) => {
            setDialogState({ type: 'prompt', message, onResult });
        },
        [],
    );

    const close = useCallback(() => {
        setDialogState({ type: null });
    }, []);

    return { dialogState, showAlert, showConfirm, showPrompt, close };
}

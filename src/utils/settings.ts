import { storage } from '#imports';
import { useEffect, useState } from 'react';

export type TransactionSource = 'api' | 'page';

export const generateSummariesSetting = storage.defineItem<boolean>('sync:generateSummaries', {
    fallback: false,
});

export const debugLoggingSetting = storage.defineItem<boolean>('sync:debugLogging', {
    fallback: false,
});

export const transactionSourceSetting = storage.defineItem<TransactionSource>(
    'sync:transactionSource',
    { fallback: 'api' },
);

interface StorageSetting<T> {
    fallback: T;
    getValue(): Promise<T>;
    setValue(value: T): Promise<void>;
    watch(callback: (value: T) => void): () => void;
}

function useStorageSetting<T>(setting: StorageSetting<T>): [T, (value: T) => Promise<void>] {
    const [value, setValue] = useState<T>(setting.fallback);

    useEffect(() => {
        let active = true;
        setting.getValue().then((stored) => {
            if (active) setValue(stored);
        });
        const unwatch = setting.watch((next) => setValue(next));
        return () => {
            active = false;
            unwatch();
        };
    }, [setting]);

    const update = async (next: T) => {
        await setting.setValue(next);
        setValue(next);
    };

    return [value, update];
}

export function useGenerateSummaries(): [boolean, (value: boolean) => Promise<void>] {
    return useStorageSetting(generateSummariesSetting);
}

export function useDebugLogging(): [boolean, (value: boolean) => Promise<void>] {
    return useStorageSetting(debugLoggingSetting);
}

export function useTransactionSource(): [
    TransactionSource,
    (value: TransactionSource) => Promise<void>,
] {
    return useStorageSetting(transactionSourceSetting);
}

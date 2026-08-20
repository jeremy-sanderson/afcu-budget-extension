import { storage } from '#imports';
import { useEffect, useState } from 'react';

export const generateSummariesSetting = storage.defineItem<boolean>('sync:generateSummaries', {
    fallback: false,
});

export const debugLoggingSetting = storage.defineItem<boolean>('sync:debugLogging', {
    fallback: false,
});

function useStorageSetting(
    setting: typeof generateSummariesSetting,
): [boolean, (value: boolean) => Promise<void>] {
    const [value, setValue] = useState(false);

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

    const update = async (next: boolean) => {
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

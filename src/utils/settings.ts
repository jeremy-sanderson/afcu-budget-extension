import { storage } from '#imports';
import { useEffect, useState } from 'react';

export const generateSummariesSetting = storage.defineItem<boolean>('sync:generateSummaries', {
    fallback: false,
});

export function useGenerateSummaries(): [boolean, (value: boolean) => Promise<void>] {
    const [value, setValue] = useState(false);

    useEffect(() => {
        let active = true;
        generateSummariesSetting.getValue().then((stored) => {
            if (active) setValue(stored);
        });
        const unwatch = generateSummariesSetting.watch((next) => setValue(next));
        return () => {
            active = false;
            unwatch();
        };
    }, []);

    const update = async (next: boolean) => {
        await generateSummariesSetting.setValue(next);
        setValue(next);
    };

    return [value, update];
}

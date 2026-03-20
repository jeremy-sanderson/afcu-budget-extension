import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- WXT and vitest bundle different vite versions with incompatible plugin types
    plugins: [WxtVitest() as any],
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./test/setup.ts'],
        mockReset: true,
        restoreMocks: true,
        passWithNoTests: true,
    },
});

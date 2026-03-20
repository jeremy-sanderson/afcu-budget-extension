import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
    plugins: [WxtVitest()],
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./test/setup.ts'],
        mockReset: true,
        restoreMocks: true,
        passWithNoTests: true,
    },
});

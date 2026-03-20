import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    manifest: {
        name: 'AFCU Budget (beta)',
        description: 'Clipboard functionality for AFCU banking website budgeting',
        permissions: ['clipboardWrite'],
    },
    vite: () => ({
        plugins: [tailwindcss()],
    }),
});

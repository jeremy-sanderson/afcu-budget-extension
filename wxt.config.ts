import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-react'],
    manifest: {
        name: 'AFCU Budget (beta)',
        description: 'Clipboard functionality for AFCU banking website budgeting',
        permissions: ['clipboardWrite', 'storage', 'tabs', 'scripting'],
        host_permissions: ['https://webaccess45.americafirst.com/*'],
    },
    vite: () => ({
        plugins: [tailwindcss()],
    }),
});

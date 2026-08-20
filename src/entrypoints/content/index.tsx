import './style.css';
import ReactDOM from 'react-dom/client';
import { EnvironmentProvider } from '@ark-ui/react';
import App from './App';
import { isAccountDetailsRoute } from '../../utils/route';

export default defineContentScript({
    matches: [
        'https://webaccess45.americafirst.com/banking/Accounts/Details/Index/*',
        'https://digital.americafirst.com/americafirstdigitalbanking/uux.aspx*',
    ],
    cssInjectionMode: 'ui',

    async main(ctx) {
        let ui: Awaited<ReturnType<typeof createShadowRootUi>> | null = null;
        let mounting = false;

        const sync = async () => {
            if (mounting) return;
            if (!isAccountDetailsRoute()) {
                if (ui) {
                    ui.remove();
                    ui = null;
                }
                return;
            }
            if (ui) return;

            mounting = true;
            try {
                ui = await createShadowRootUi(ctx, {
                    name: 'afcu-budget',
                    position: 'inline',
                    anchor: 'body',
                    onMount(container) {
                        const wrapper = document.createElement('div');
                        container.append(wrapper);
                        const root = ReactDOM.createRoot(wrapper);
                        const shadowRoot = container.getRootNode() as ShadowRoot;
                        root.render(
                            <EnvironmentProvider value={() => shadowRoot}>
                                <App />
                            </EnvironmentProvider>,
                        );
                        return root;
                    },
                    onRemove(root) {
                        root?.unmount();
                    },
                });
                ui.mount();
            } catch (err) {
                console.error('[afcu-budget] mount failed', err);
            } finally {
                mounting = false;
            }
        };

        await sync();
        ctx.addEventListener(window, 'wxt:locationchange', () => sync());

        // The banking SPA passes through intermediate hashes (e.g. a dashboard route) mid-transition,
        // and wxt:locationchange doesn't reliably fire again once it settles on the final hash. Poll
        // as a fallback so the UI still converges to the correct state even when the event is missed.
        ctx.setInterval(sync, 1000);
    },
});

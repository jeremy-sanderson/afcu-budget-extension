import './style.css';
import ReactDOM from 'react-dom/client';
import { EnvironmentProvider } from '@ark-ui/react';
import App from './App';

export default defineContentScript({
    matches: ['https://webaccess45.americafirst.com/banking/Accounts/Details/Index/*'],
    cssInjectionMode: 'ui',

    async main(ctx) {
        const ui = await createShadowRootUi(ctx, {
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
    },
});

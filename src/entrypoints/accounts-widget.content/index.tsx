import './style.css';
import ReactDOM from 'react-dom/client';
import { EnvironmentProvider } from '@ark-ui/react';
import AccountsWidgetApp from './AccountsWidgetApp';

export default defineContentScript({
    matches: ['https://sdk-cdn.onlineaccess1.com/*'],
    allFrames: true,
    cssInjectionMode: 'ui',

    async main(ctx) {
        const ui = await createShadowRootUi(ctx, {
            name: 'afcu-budget-accounts-widget',
            position: 'inline',
            anchor: 'body',
            onMount(container) {
                const wrapper = document.createElement('div');
                container.append(wrapper);
                const root = ReactDOM.createRoot(wrapper);
                const shadowRoot = container.getRootNode() as ShadowRoot;
                root.render(
                    <EnvironmentProvider value={() => shadowRoot}>
                        <AccountsWidgetApp />
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

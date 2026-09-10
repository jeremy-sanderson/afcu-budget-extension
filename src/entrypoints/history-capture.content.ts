import { installAccountHistoryCapture } from '../utils/accountHistoryCapture';

// Q2 rejects account history requests that lack the page's session token, so the extension
// can't fetch transactions itself. Instead it observes the responses the page already loads,
// which requires running in the page's MAIN world and patching fetch/XHR before the app starts.
export default defineContentScript({
    matches: ['https://digital.americafirst.com/americafirstdigitalbanking/uux.aspx*'],
    world: 'MAIN',
    runAt: 'document_start',
    main() {
        installAccountHistoryCapture();
    },
});

const HIGHLIGHT_COLOR = '#fff59d';

export default defineContentScript({
    matches: ['*://*.americafirst.com/*'],

    main(_ctx) {
        setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>('#txtUserID');
            if (!input) return;
            input.style.backgroundColor = HIGHLIGHT_COLOR;
            input.focus();
        }, 2000);
    },
});

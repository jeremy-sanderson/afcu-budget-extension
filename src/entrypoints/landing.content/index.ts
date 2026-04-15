export default defineContentScript({
    matches: ['*://americafirst.com/*'],

    async main(_ctx) {
        console.log("trying to focus on username input");
        document.querySelector<HTMLInputElement>('#txtUserID')?.focus();
    },
});

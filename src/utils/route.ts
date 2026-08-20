const ACCOUNT_DETAILS_HASH = /^#\/account\/\d+/;
const LEGACY_HOST = 'webaccess45.americafirst.com';

export function isAccountDetailsRoute(): boolean {
    // The old host has no hash routing at all — matches already scopes that content script
    // to the details page exclusively, so it's always "yes, this is the page" there.
    // On the new SPA, an empty hash occurs transiently between routes (e.g. while a different
    // page is loading) and must NOT be treated as a match, or the UI flashes on every navigation.
    if (location.hostname === LEGACY_HOST) return true;
    return ACCOUNT_DETAILS_HASH.test(location.hash);
}

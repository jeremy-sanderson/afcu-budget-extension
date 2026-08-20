import { debugLoggingSetting } from './settings';

let debugLoggingEnabled = false;

debugLoggingSetting.getValue().then((value) => {
    debugLoggingEnabled = value;
});
debugLoggingSetting.watch((value) => {
    debugLoggingEnabled = value;
});

export function debugLog(...args: unknown[]): void {
    if (debugLoggingEnabled) console.debug(...args);
}

import type { FetchAccountDetailsRequest, FetchAccountDetailsResponse } from './messages';
import type { SummaryData } from './types';

export async function fetchAccountSummary(url: string): Promise<SummaryData> {
    const request: FetchAccountDetailsRequest = { type: 'fetchAccountDetails', url };
    const response = (await browser.runtime.sendMessage(request)) as
        | FetchAccountDetailsResponse
        | undefined;
    if (!response || !response.ok) {
        throw new Error(response?.error ?? 'No response from background');
    }
    return response.data;
}

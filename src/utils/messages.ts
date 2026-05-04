import type { SummaryData } from './types';

export interface FetchAccountDetailsRequest {
    type: 'fetchAccountDetails';
    url: string;
}

export type FetchAccountDetailsResponse =
    | { ok: true; data: SummaryData }
    | { ok: false; error: string };

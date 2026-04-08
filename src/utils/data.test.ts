import { describe, it, expect, beforeEach } from 'vitest';
import {
    getRowData,
    convertTransactionToTSV,
    gatherDebitTransactionsInViewSortedByDate,
    getCurrentBalance,
    getAvailableBalance,
} from './data';

function createTransactionRow({
    date = '4/12/2025',
    description = 'WALMART PURCHASE',
    amount = '-$203.07',
    omitDate = false,
    omitAmount = false,
}: {
    date?: string;
    description?: string;
    amount?: string;
    omitDate?: boolean;
    omitAmount?: boolean;
} = {}): HTMLTableRowElement {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="transaction-id">some-id</td>
        ${omitDate ? '<td></td>' : `<td class="column-date">${date}</td>`}
        <td class="column-description">${description}</td>
        <td class="column-amount"></td>
        <td class="column-amount">
            ${omitAmount ? '' : `<span class="transaction-">${amount}</span>`}
        </td>
        <td class="column-balance"><span>$36.00</span></td>
    `;
    return tr;
}

function setupTransactionTable(rows: HTMLTableRowElement[]) {
    document.body.innerHTML = `
        <div id="PastTransactionsGrid">
            <table>
                <tbody></tbody>
            </table>
        </div>
    `;
    const tbody = document.querySelector('#PastTransactionsGrid table tbody')!;
    rows.forEach((row) => tbody.appendChild(row));
}

describe('getRowData', () => {
    it('parses a valid transaction row with negative amount', () => {
        const row = createTransactionRow();
        const result = getRowData(row);
        expect(result).toEqual({
            date: '4/12/2025',
            description: 'WALMART PURCHASE',
            amount: -203.07,
        });
    });

    it('parses a row with positive (credit) amount', () => {
        const row = createTransactionRow({ amount: '$204.00' });
        const result = getRowData(row);
        expect(result).toEqual({
            date: '4/12/2025',
            description: 'WALMART PURCHASE',
            amount: 204,
        });
    });

    it('returns null when date cell is missing', () => {
        const row = createTransactionRow({ omitDate: true });
        expect(getRowData(row)).toBeNull();
    });

    it('returns null when amount span is missing', () => {
        const row = createTransactionRow({ omitAmount: true });
        expect(getRowData(row)).toBeNull();
    });

    it('strips commas and newlines from description', () => {
        const row = createTransactionRow({
            description: 'PURCHASE, WALMART STORE',
        });
        const result = getRowData(row);
        expect(result?.description).toBe('PURCHASE WALMART STORE');
    });

    it('strips $ and , from amount and converts to number', () => {
        const row = createTransactionRow({ amount: '-$1,203.07' });
        const result = getRowData(row);
        expect(result?.amount).toBe(-1203.07);
    });

    it('handles the span.transaction- selector', () => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="column-date">4/12/2025</td>
            <td class="column-description">TEST</td>
            <td class="column-amount"><span class="transaction-">-$50.00</span></td>
        `;
        const result = getRowData(tr);
        expect(result?.amount).toBe(-50);
    });
});

describe('convertTransactionToTSV', () => {
    it('formats transaction as tab-separated string', () => {
        const result = convertTransactionToTSV({
            date: '4/12/2025',
            description: 'WALMART',
            amount: 203.07,
        });
        expect(result).toBe('4/12/2025\tWALMART\t203.07');
    });

    it('handles decimal amounts', () => {
        const result = convertTransactionToTSV({
            date: '4/9/2025',
            description: 'GOOGLE',
            amount: 10.73,
        });
        expect(result).toBe('4/9/2025\tGOOGLE\t10.73');
    });
});

describe('gatherDebitTransactionsInViewSortedByDate', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('returns only debit transactions with amounts flipped to positive', () => {
        setupTransactionTable([
            createTransactionRow({ date: '4/12/2025', description: 'WALMART', amount: '-$203.07' }),
            createTransactionRow({ date: '4/11/2025', description: 'TRANSFER', amount: '$204.00' }),
            createTransactionRow({ date: '4/9/2025', description: 'GOOGLE', amount: '-$10.73' }),
        ]);

        const result = gatherDebitTransactionsInViewSortedByDate();
        expect(result).toHaveLength(2);
        result.forEach((t) => expect(t.amount).toBeGreaterThan(0));
    });

    it('sorts by date ascending', () => {
        setupTransactionTable([
            createTransactionRow({ date: '4/12/2025', description: 'WALMART', amount: '-$203.07' }),
            createTransactionRow({ date: '4/9/2025', description: 'GOOGLE', amount: '-$10.73' }),
        ]);

        const result = gatherDebitTransactionsInViewSortedByDate();
        expect(result[0].date).toBe('4/9/2025');
        expect(result[1].date).toBe('4/12/2025');
    });

    it('sorts alphabetically by description when dates are equal', () => {
        setupTransactionTable([
            createTransactionRow({ date: '4/9/2025', description: 'VENMO', amount: '-$45.00' }),
            createTransactionRow({ date: '4/9/2025', description: 'GOOGLE', amount: '-$10.73' }),
        ]);

        const result = gatherDebitTransactionsInViewSortedByDate();
        expect(result[0].description).toBe('GOOGLE');
        expect(result[1].description).toBe('VENMO');
    });

    it('returns empty array when no transactions exist', () => {
        setupTransactionTable([]);
        expect(gatherDebitTransactionsInViewSortedByDate()).toEqual([]);
    });

    it('filters out credit transactions', () => {
        setupTransactionTable([
            createTransactionRow({ date: '4/11/2025', description: 'TRANSFER', amount: '$204.00' }),
        ]);

        expect(gatherDebitTransactionsInViewSortedByDate()).toEqual([]);
    });
});

describe('getCurrentBalance', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    function setupAccountDetails(balanceLabel: string, balanceValue: string) {
        document.body.innerHTML = `
            <div class="account-details">
                <div class="row">
                    <div class="col-xs-6 detail-label-col">
                        <span class="detail-label">Account Type:</span>
                    </div>
                    <div class="col-xs-6 detail-item-col">
                        <span class="detail-item">Checking</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-6 detail-label-col">
                        <span class="detail-label">${balanceLabel}</span>
                    </div>
                    <div class="col-xs-6 detail-item-col">
                        <span class="detail-item">${balanceValue}</span>
                    </div>
                </div>
            </div>
        `;
    }

    it('extracts balance from account details section', () => {
        setupAccountDetails('Current Balance:', '$36.00');
        expect(getCurrentBalance()).toBe('36.00');
    });

    it('returns null when account details section is missing', () => {
        expect(getCurrentBalance()).toBeNull();
    });

    it('returns null when no row contains Balance label', () => {
        setupAccountDetails('Account Type:', 'Checking');
        expect(getCurrentBalance()).toBeNull();
    });

    it('strips $ and , from balance string', () => {
        setupAccountDetails('Current Balance:', '$1,036.00');
        expect(getCurrentBalance()).toBe('1036.00');
    });
});

describe('getAvailableBalance', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('reads balance from .primary-label-amount title attribute', () => {
        document.body.innerHTML = `
            <div class="primary-label-amount" title="$36.00"></div>
        `;
        expect(getAvailableBalance()).toBe('36.00');
    });

    it('returns null when element is missing', () => {
        expect(getAvailableBalance()).toBeNull();
    });

    it('strips $ and ,', () => {
        document.body.innerHTML = `
            <div class="primary-label-amount" title="$1,036.00"></div>
        `;
        expect(getAvailableBalance()).toBe('1036.00');
    });
});

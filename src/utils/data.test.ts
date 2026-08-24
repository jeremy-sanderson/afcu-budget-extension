import { describe, it, expect, beforeEach } from 'vitest';
import {
    getRowData,
    convertTransactionToTSV,
    gatherDebitTransactionsInViewSortedByDate,
    gatherTransactionsByDate,
    getCurrentBalance,
    getAvailableBalance,
    getAccountDescription,
} from './data';

function createTransactionRow({
    date = 'Apr 12 2025',
    description = 'WALMART PURCHASE',
    amount = '($203.07)',
    pending = false,
    omitDate = false,
    omitAmount = false,
}: {
    date?: string;
    description?: string;
    amount?: string;
    pending?: boolean;
    omitDate?: boolean;
    omitAmount?: boolean;
} = {}): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'transaction-history-item';
    const dateCell = pending ? 'Pending' : date;
    li.innerHTML = `
        <a class="datatable-row parent-template pointer ${pending ? 'pending' : ''}">
            <div class="row-content flex">
                ${omitDate ? '' : `<div class="col-date">${dateCell}</div>`}
                <div class="col-desc">
                    <div test-id="historyItemDescription" class="description-text">${description}</div>
                </div>
                <div class="col-amount">
                    ${omitAmount ? '' : `<span test-id="lblAmount" class="amount"><span class="numAmount">${amount}</span></span>`}
                </div>
            </div>
        </a>
    `;
    return li;
}

function setupTransactionTable(rows: HTMLLIElement[]) {
    document.body.innerHTML = '<ul id="historyItems"></ul>';
    const list = document.querySelector('#historyItems')!;
    rows.forEach((row) => list.appendChild(row));
}

describe('getRowData', () => {
    it('parses a posted row with a negative (parenthesized) amount', () => {
        const row = createTransactionRow();
        const result = getRowData(row);
        expect(result).toEqual({
            date: '4/12/2025',
            description: 'WALMART PURCHASE',
            amount: -203.07,
        });
    });

    it('parses a posted row with a positive (credit) amount', () => {
        const row = createTransactionRow({ amount: '$204.00' });
        const result = getRowData(row);
        expect(result).toEqual({
            date: '4/12/2025',
            description: 'WALMART PURCHASE',
            amount: 204,
        });
    });

    it('parses a pending row, reading the date from the description prefix', () => {
        const row = createTransactionRow({
            pending: true,
            description: '08/19 - MAVERIK #683',
            amount: '($1.90)',
        });
        const result = getRowData(row);
        expect(result?.description).toBe('MAVERIK #683');
        expect(result?.amount).toBe(-1.9);
        expect(result?.date).toMatch(/^8\/19\/\d{4}$/);
    });

    it('returns null for a pending row whose description has no date prefix', () => {
        const row = createTransactionRow({ pending: true, description: 'MAVERIK #683' });
        expect(getRowData(row)).toBeNull();
    });

    it('returns null when the date cell is missing', () => {
        const row = createTransactionRow({ omitDate: true });
        expect(getRowData(row)).toBeNull();
    });

    it('returns null when the amount span is missing', () => {
        const row = createTransactionRow({ omitAmount: true });
        expect(getRowData(row)).toBeNull();
    });

    it('strips commas and newlines from description', () => {
        const row = createTransactionRow({ description: 'PURCHASE, WALMART STORE' });
        expect(getRowData(row)?.description).toBe('PURCHASE WALMART STORE');
    });

    it('strips $, commas, and parentheses from amount and converts to a negative number', () => {
        const row = createTransactionRow({ amount: '($1,203.07)' });
        expect(getRowData(row)?.amount).toBe(-1203.07);
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
});

describe('gatherDebitTransactionsInViewSortedByDate', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('returns only debit transactions with amounts flipped to positive', () => {
        setupTransactionTable([
            createTransactionRow({
                date: 'Apr 12 2025',
                description: 'WALMART',
                amount: '($203.07)',
            }),
            createTransactionRow({
                date: 'Apr 11 2025',
                description: 'TRANSFER',
                amount: '$204.00',
            }),
            createTransactionRow({ date: 'Apr 9 2025', description: 'GOOGLE', amount: '($10.73)' }),
        ]);

        const result = gatherDebitTransactionsInViewSortedByDate();
        expect(result).toHaveLength(2);
        result.forEach((t) => expect(t.amount).toBeGreaterThan(0));
    });

    it('sorts by date ascending', () => {
        setupTransactionTable([
            createTransactionRow({ date: 'Apr 12 2025', amount: '($203.07)' }),
            createTransactionRow({ date: 'Apr 9 2025', description: 'GOOGLE', amount: '($10.73)' }),
        ]);

        const result = gatherDebitTransactionsInViewSortedByDate();
        expect(result[0].date).toBe('4/9/2025');
        expect(result[1].date).toBe('4/12/2025');
    });

    it('sorts alphabetically by description when dates are equal', () => {
        setupTransactionTable([
            createTransactionRow({ date: 'Apr 9 2025', description: 'VENMO', amount: '($45.00)' }),
            createTransactionRow({ date: 'Apr 9 2025', description: 'GOOGLE', amount: '($10.73)' }),
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
            createTransactionRow({
                date: 'Apr 11 2025',
                description: 'TRANSFER',
                amount: '$204.00',
            }),
        ]);
        expect(gatherDebitTransactionsInViewSortedByDate()).toEqual([]);
    });

    it('excludes pending transactions', () => {
        setupTransactionTable([
            createTransactionRow({
                date: 'Apr 12 2025',
                description: 'WALMART',
                amount: '($203.07)',
            }),
            createTransactionRow({
                pending: true,
                description: '08/19 - MAVERIK #683',
                amount: '($1.90)',
            }),
        ]);

        const result = gatherDebitTransactionsInViewSortedByDate();
        expect(result).toHaveLength(1);
        expect(result[0].description).toBe('WALMART');
    });
});

describe('gatherTransactionsByDate', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('groups debits and credits by date with positive amounts', () => {
        setupTransactionTable([
            createTransactionRow({ date: 'Apr 9 2025', description: 'GOOGLE', amount: '($10.73)' }),
            createTransactionRow({ date: 'Apr 9 2025', description: 'VENMO', amount: '($45.00)' }),
            createTransactionRow({
                date: 'Apr 9 2025',
                description: 'PAYCHECK',
                amount: '$500.00',
            }),
            createTransactionRow({
                date: 'Apr 12 2025',
                description: 'WALMART',
                amount: '($203.07)',
            }),
        ]);

        const result = gatherTransactionsByDate();
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ date: '4/9/2025' });
        expect(result[0].debits).toHaveLength(2);
        expect(result[0].credits).toEqual([
            { date: '4/9/2025', description: 'PAYCHECK', amount: 500 },
        ]);
        expect(result[1].debits[0].amount).toBe(203.07);
    });

    it('sorts groups by date ascending', () => {
        setupTransactionTable([
            createTransactionRow({ date: 'Apr 12 2025', amount: '($203.07)' }),
            createTransactionRow({ date: 'Apr 9 2025', description: 'GOOGLE', amount: '($10.73)' }),
        ]);
        expect(gatherTransactionsByDate().map((d) => d.date)).toEqual(['4/9/2025', '4/12/2025']);
    });

    it('returns an empty array when there are no transactions', () => {
        setupTransactionTable([]);
        expect(gatherTransactionsByDate()).toEqual([]);
    });

    it('excludes pending transactions', () => {
        setupTransactionTable([
            createTransactionRow({
                date: 'Apr 12 2025',
                description: 'WALMART',
                amount: '($203.07)',
            }),
            createTransactionRow({
                pending: true,
                description: '08/19 - MAVERIK #683',
                amount: '($1.90)',
            }),
        ]);

        const result = gatherTransactionsByDate();
        expect(result).toHaveLength(1);
        expect(result[0].debits).toEqual([
            { date: '4/12/2025', description: 'WALMART', amount: 203.07 },
        ]);
    });
});

function setupBalances(rows: Array<{ label: string; amount: string }>) {
    document.body.innerHTML = `
        <dl class="featured-hade-list">
            ${rows
                .map(
                    ({ label, amount }) => `
                <div class="featured-hade hade-detail">
                    <dt test-id="hade-detail">${label}</dt>
                    <dd test-id="hade-value">
                        <span test-id="accountCurrency">
                            <span class="numAmount">${amount}</span>
                        </span>
                    </dd>
                </div>`,
                )
                .join('')}
        </dl>
    `;
}

describe('getCurrentBalance', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('extracts balance from the "Balance" hade row', () => {
        setupBalances([
            { label: 'Available Balance', amount: '$4,404.22' },
            { label: 'Balance', amount: '$4,435.32' },
        ]);
        expect(getCurrentBalance()).toBe('4435.32');
    });

    it('returns null when no hade row has the Balance label', () => {
        setupBalances([{ label: 'Available Balance', amount: '$4,404.22' }]);
        expect(getCurrentBalance()).toBeNull();
    });

    it('returns null when the balance list is missing', () => {
        expect(getCurrentBalance()).toBeNull();
    });
});

describe('getAvailableBalance', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('extracts balance from the "Available Balance" hade row', () => {
        setupBalances([
            { label: 'Available Balance', amount: '$4,404.22' },
            { label: 'Balance', amount: '$4,435.32' },
        ]);
        expect(getAvailableBalance()).toBe('4404.22');
    });

    it('returns null when the balance list is missing', () => {
        expect(getAvailableBalance()).toBeNull();
    });
});

describe('getAccountDescription', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('returns the account header title', () => {
        document.body.innerHTML = `
            <span test-id="acctHeaderTitle" class="account-header-ellipsize">Classic Checking</span>
        `;
        expect(getAccountDescription()).toBe('Classic Checking');
    });

    it('returns null when the title element is missing', () => {
        expect(getAccountDescription()).toBeNull();
    });
});

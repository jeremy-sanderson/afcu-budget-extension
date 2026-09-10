import { describe, it, expect, beforeEach } from 'vitest';
import {
    convertTransactionToTSV,
    getAccountDescription,
    getAvailableBalance,
    getCurrentBalance,
    groupTransactionsByDate,
    sanitizeDescription,
    toSortedDebits,
} from './data';
import type { Transaction } from './types';

function transaction(date: string, description: string, amount: number): Transaction {
    return { date, description, amount };
}

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

describe('sanitizeDescription', () => {
    it('removes every comma and trims surrounding whitespace', () => {
        expect(sanitizeDescription('  AUTOMATIC WITHDRAWAL, PAYPAL, INC WEB (S)\n')).toBe(
            'AUTOMATIC WITHDRAWAL PAYPAL INC WEB (S)',
        );
    });
});

describe('toSortedDebits', () => {
    it('keeps only debits, with amounts flipped to positive, sorted by date', () => {
        expect(
            toSortedDebits([
                transaction('4/12/2025', 'WALMART', -203.07),
                transaction('4/11/2025', 'TRANSFER', 204),
                transaction('4/9/2025', 'GOOGLE', -10.73),
            ]),
        ).toEqual([
            transaction('4/9/2025', 'GOOGLE', 10.73),
            transaction('4/12/2025', 'WALMART', 203.07),
        ]);
    });

    it('sorts alphabetically by description when dates are equal', () => {
        const result = toSortedDebits([
            transaction('4/9/2025', 'VENMO', -45),
            transaction('4/9/2025', 'GOOGLE', -10.73),
        ]);
        expect(result.map((t) => t.description)).toEqual(['GOOGLE', 'VENMO']);
    });

    it('returns an empty array when there are no debits', () => {
        expect(toSortedDebits([transaction('4/11/2025', 'TRANSFER', 204)])).toEqual([]);
    });
});

describe('groupTransactionsByDate', () => {
    it('groups debits and credits by date with positive amounts', () => {
        const result = groupTransactionsByDate([
            transaction('4/9/2025', 'VENMO', -45),
            transaction('4/9/2025', 'GOOGLE', -10.73),
            transaction('4/9/2025', 'PAYCHECK', 500),
            transaction('4/12/2025', 'WALMART', -203.07),
        ]);
        expect(result).toEqual([
            {
                date: '4/9/2025',
                debits: [
                    transaction('4/9/2025', 'GOOGLE', 10.73),
                    transaction('4/9/2025', 'VENMO', 45),
                ],
                credits: [transaction('4/9/2025', 'PAYCHECK', 500)],
            },
            {
                date: '4/12/2025',
                debits: [transaction('4/12/2025', 'WALMART', 203.07)],
                credits: [],
            },
        ]);
    });

    it('sorts groups by date ascending', () => {
        const result = groupTransactionsByDate([
            transaction('4/12/2025', 'WALMART', -203.07),
            transaction('4/9/2025', 'GOOGLE', -10.73),
        ]);
        expect(result.map((d) => d.date)).toEqual(['4/9/2025', '4/12/2025']);
    });

    it('returns an empty array when there are no transactions', () => {
        expect(groupTransactionsByDate([])).toEqual([]);
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

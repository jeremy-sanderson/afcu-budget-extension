import { describe, it, expect, beforeEach } from 'vitest';
import { getRowData, getRowTransactionId, readPageTransactions } from './pageTransactions';
import { createTransactionRow, setupTransactionTable } from '../test/transactionRow';

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

    it('strips every comma from the description', () => {
        const row = createTransactionRow({ description: 'PURCHASE, WALMART, STORE' });
        expect(getRowData(row)?.description).toBe('PURCHASE WALMART STORE');
    });

    it('strips $, commas, and parentheses from amount and converts to a negative number', () => {
        const row = createTransactionRow({ amount: '($1,203.07)' });
        expect(getRowData(row)?.amount).toBe(-1203.07);
    });
});

describe('getRowTransactionId', () => {
    it('reads the transaction ID from the row actions dropdown', () => {
        expect(getRowTransactionId(createTransactionRow({ id: '9000000001' }))).toBe('9000000001');
    });

    it('returns null when the row has no actions dropdown', () => {
        expect(getRowTransactionId(createTransactionRow())).toBeNull();
    });
});

describe('readPageTransactions', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('returns every posted row with signed amounts', () => {
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
        ]);
        expect(readPageTransactions()).toEqual([
            { date: '4/12/2025', description: 'WALMART', amount: -203.07 },
            { date: '4/11/2025', description: 'TRANSFER', amount: 204 },
        ]);
    });

    it('excludes pending rows', () => {
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
        expect(readPageTransactions().map((t) => t.description)).toEqual(['WALMART']);
    });

    it('returns an empty array when the transaction list is missing', () => {
        expect(readPageTransactions()).toEqual([]);
    });
});

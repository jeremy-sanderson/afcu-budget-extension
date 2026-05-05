import { describe, it, expect } from 'vitest';
import { formatAmount, formatBalance } from './currency';

describe('formatAmount', () => {
    it('formats integers with two decimal places', () => {
        expect(formatAmount(45)).toBe('45.00');
    });

    it('formats decimal values to two decimal places', () => {
        expect(formatAmount(10.73)).toBe('10.73');
    });

    it('inserts thousands separators', () => {
        expect(formatAmount(1234567.8)).toBe('1,234,567.80');
    });

    it('formats zero as 0.00', () => {
        expect(formatAmount(0)).toBe('0.00');
    });
});

describe('formatBalance', () => {
    it('formats numeric strings with thousands separators and two decimals', () => {
        expect(formatBalance('1234567.8')).toBe('1,234,567.80');
        expect(formatBalance('1000')).toBe('1,000.00');
    });

    it('returns the original string when the value is not a finite number', () => {
        expect(formatBalance('not-a-number')).toBe('not-a-number');
    });
});

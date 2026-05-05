const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatAmount(value: number): string {
    return currencyFormatter.format(value);
}

export function formatBalance(value: string): string {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? currencyFormatter.format(numeric) : value;
}

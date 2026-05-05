export interface Transaction {
    date: string;
    description: string;
    amount: number;
}

export interface TransactionsForDate {
    date: string;
    debits: Transaction[];
    credits: Transaction[];
}

export interface SummaryData {
    currentBalance: string | null;
    availableBalance: string | null;
    transactionsByDate: TransactionsForDate[];
}

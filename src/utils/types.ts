export interface Transaction {
    date: string;
    description: string;
    amount: number;
}

export interface DebitsForDate {
    date: string;
    count: number;
    transactions: Transaction[];
}

export interface SummaryData {
    currentBalance: string | null;
    availableBalance: string | null;
    debitsByDate: DebitsForDate[];
}

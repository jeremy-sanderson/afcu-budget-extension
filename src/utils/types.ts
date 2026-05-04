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

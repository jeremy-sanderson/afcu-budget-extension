import { useState } from 'react';
import { Dialog } from '@ark-ui/react';
import { convertTransactionToTSV } from '../utils/data';
import type { Transaction } from '../utils/types';
import CopyIcon from './CopyIcon';
import CheckIcon from './CheckIcon';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatAmount(value: number): string {
    return currencyFormatter.format(value);
}

interface TransactionsDialogProps {
    date: string;
    transactions: Transaction[];
    onClose: () => void;
}

export default function TransactionsDialog({
    date,
    transactions,
    onClose,
}: TransactionsDialogProps) {
    const [isCopied, setIsCopied] = useState(false);
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    const copyAll = () => {
        const tsv = transactions.map((t) => convertTransactionToTSV(t)).join('\n');
        navigator.clipboard
            .writeText(tsv)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1500);
            })
            .catch((error) => {
                console.error('Error copying to clipboard:', error);
            });
    };

    return (
        <Dialog.Root open={true} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
            <Dialog.Positioner className="fixed inset-0 flex items-center justify-center">
                <Dialog.Content className="rounded-lg p-6 min-w-[400px] max-w-[80%] max-h-[80vh] overflow-y-auto shadow-lg bg-white">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                            Transactions on {date}
                        </Dialog.Title>
                        {transactions.length > 0 && (
                            <button
                                type="button"
                                onClick={copyAll}
                                aria-label={`Copy all transactions for ${date}`}
                                title={`Copy all transactions for ${date}`}
                                className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-600 bg-transparent border-none cursor-pointer hover:bg-gray-100 hover:text-[#00548e]"
                            >
                                {isCopied ? <CheckIcon /> : <CopyIcon />}
                            </button>
                        )}
                    </div>

                    {transactions.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                            No transactions for this date.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-200 border border-gray-200 rounded">
                            {transactions.map((t, i) => (
                                <li
                                    key={`${t.date}-${t.description}-${i}`}
                                    className="flex items-center justify-between gap-3 px-3 py-2"
                                >
                                    <span className="text-sm text-gray-900 break-words">
                                        {t.description}
                                    </span>
                                    <span className="text-sm text-gray-900 font-medium whitespace-nowrap">
                                        ${formatAmount(t.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {transactions.length > 0 && (
                        <div className="flex items-center justify-between gap-3 px-3 py-2 mt-3 border-t border-gray-200">
                            <span className="text-sm font-semibold text-gray-700">Total</span>
                            <span className="text-sm font-semibold text-gray-900">
                                ${formatAmount(total)}
                            </span>
                        </div>
                    )}

                    <div className="text-right mt-5">
                        <Dialog.CloseTrigger className="bg-[#00548e] text-white border-none rounded px-4 py-2 text-base cursor-pointer">
                            Close
                        </Dialog.CloseTrigger>
                    </div>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}

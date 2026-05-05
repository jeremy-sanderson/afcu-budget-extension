import { useMemo, useState } from 'react';
import { Dialog } from '@ark-ui/react';
import { convertTransactionToTSV } from '../utils/data';
import { formatAmount, formatBalance } from '../utils/currency';
import type { Transaction, TransactionsForDate } from '../utils/types';
import CopyButton from './CopyButton';
import PopOutIcon from './PopOutIcon';
import TransactionsDialog, { type TransactionKind } from './TransactionsDialog';

const DATES_PAGE_SIZE = 5;

interface SummaryDialogProps {
    currentBalance: string | null;
    availableBalance: string | null;
    transactionsByDate: TransactionsForDate[];
    onClose: () => void;
}

interface DetailsRequest {
    date: string;
    kind: TransactionKind;
}

function sumAmounts(transactions: Transaction[]): number {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
}

function tsvFor(transactions: Transaction[]): string {
    return transactions.map((t) => convertTransactionToTSV(t)).join('\n');
}

export default function SummaryDialog({
    currentBalance,
    availableBalance,
    transactionsByDate,
    onClose,
}: SummaryDialogProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [visibleDateCount, setVisibleDateCount] = useState(DATES_PAGE_SIZE);
    const [details, setDetails] = useState<DetailsRequest | null>(null);

    const transactionsNewestFirst = useMemo(
        () => [...transactionsByDate].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
        [transactionsByDate],
    );
    const visibleEntries = transactionsNewestFirst.slice(0, visibleDateCount);
    const remainingCount = transactionsNewestFirst.length - visibleEntries.length;

    const copy = (key: string, text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopiedKey(key);
                setTimeout(() => {
                    setCopiedKey((current) => (current === key ? null : current));
                }, 1500);
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
                    <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                        Summary
                    </Dialog.Title>

                    <div className="space-y-2 mb-5">
                        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded border border-gray-200">
                            <span className="text-sm font-medium text-gray-700">
                                Current balance
                            </span>
                            <div className="flex items-center gap-2">
                                {currentBalance ? (
                                    <>
                                        <span className="text-base text-gray-900">
                                            ${formatBalance(currentBalance)}
                                        </span>
                                        <CopyButton
                                            label="Copy current balance"
                                            isCopied={copiedKey === 'current'}
                                            onClick={() => copy('current', currentBalance)}
                                        />
                                    </>
                                ) : (
                                    <span className="text-base text-gray-900">—</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded border border-gray-200">
                            <span className="text-sm font-medium text-gray-700">
                                Available balance
                            </span>
                            <div className="flex items-center gap-2">
                                {availableBalance ? (
                                    <>
                                        <span className="text-base text-gray-900">
                                            ${formatBalance(availableBalance)}
                                        </span>
                                        <CopyButton
                                            label="Copy available balance"
                                            isCopied={copiedKey === 'available'}
                                            onClick={() => copy('available', availableBalance)}
                                        />
                                    </>
                                ) : (
                                    <span className="text-base text-gray-900">—</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Transactions by date
                    </h3>
                    {transactionsNewestFirst.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                            No transactions on this page.
                        </p>
                    ) : (
                        <>
                            <ul className="grid grid-cols-[minmax(80px,auto)_minmax(0,1fr)_auto_auto_minmax(0,1fr)_auto_auto] gap-x-3 divide-y divide-gray-200 border border-gray-200 rounded">
                                <li className="col-span-7 grid grid-cols-subgrid items-center px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <span>Date</span>
                                    <span className="col-span-3">Debits</span>
                                    <span className="col-span-3">Credits</span>
                                </li>
                                {visibleEntries.map((entry) => {
                                    const debitKey = `debits-${entry.date}`;
                                    const creditKey = `credits-${entry.date}`;
                                    const debitTotal = sumAmounts(entry.debits);
                                    const creditTotal = sumAmounts(entry.credits);
                                    const debitTsv = tsvFor(entry.debits);
                                    const creditTsv = tsvFor(entry.credits);
                                    return (
                                        <li
                                            key={entry.date}
                                            className="col-span-7 grid grid-cols-subgrid items-center px-3 py-2"
                                        >
                                            <span className="text-sm text-gray-900">
                                                {entry.date}
                                            </span>
                                            {entry.debits.length === 0 ? (
                                                <span className="col-span-3 text-sm text-gray-400">
                                                    —
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-sm text-gray-900 whitespace-nowrap">
                                                        <span className="font-medium">
                                                            ${formatAmount(debitTotal)}
                                                        </span>
                                                        <span className="text-xs text-gray-600 ml-1">
                                                            ({entry.debits.length})
                                                        </span>
                                                    </span>
                                                    <CopyButton
                                                        label={`Copy debits from ${entry.date}`}
                                                        isCopied={copiedKey === debitKey}
                                                        onClick={() => copy(debitKey, debitTsv)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDetails({
                                                                date: entry.date,
                                                                kind: 'debit',
                                                            })
                                                        }
                                                        aria-label={`View debits for ${entry.date}`}
                                                        title={`View debits for ${entry.date}`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-600 bg-transparent border-none cursor-pointer hover:bg-gray-100 hover:text-[#00548e]"
                                                    >
                                                        <PopOutIcon />
                                                    </button>
                                                </>
                                            )}
                                            {entry.credits.length === 0 ? (
                                                <span className="col-span-3 text-sm text-gray-400">
                                                    —
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-sm text-gray-900 whitespace-nowrap">
                                                        <span className="font-medium">
                                                            ${formatAmount(creditTotal)}
                                                        </span>
                                                        <span className="text-xs text-gray-600 ml-1">
                                                            ({entry.credits.length})
                                                        </span>
                                                    </span>
                                                    <CopyButton
                                                        label={`Copy credits from ${entry.date}`}
                                                        isCopied={copiedKey === creditKey}
                                                        onClick={() => copy(creditKey, creditTsv)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDetails({
                                                                date: entry.date,
                                                                kind: 'credit',
                                                            })
                                                        }
                                                        aria-label={`View credits for ${entry.date}`}
                                                        title={`View credits for ${entry.date}`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-600 bg-transparent border-none cursor-pointer hover:bg-gray-100 hover:text-[#00548e]"
                                                    >
                                                        <PopOutIcon />
                                                    </button>
                                                </>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            {remainingCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisibleDateCount((count) => count + DATES_PAGE_SIZE)
                                    }
                                    className="mt-3 w-full px-3 py-2 text-sm text-[#00548e] bg-white border border-[#00548e] rounded cursor-pointer hover:bg-[#f1f1f1]"
                                >
                                    Load {Math.min(DATES_PAGE_SIZE, remainingCount)} more
                                </button>
                            )}
                        </>
                    )}

                    <div className="text-right mt-5">
                        <Dialog.CloseTrigger className="bg-[#00548e] text-white border-none rounded px-4 py-2 text-base cursor-pointer">
                            Close
                        </Dialog.CloseTrigger>
                    </div>
                </Dialog.Content>
            </Dialog.Positioner>
            {details &&
                (() => {
                    const entry = transactionsNewestFirst.find((d) => d.date === details.date);
                    if (!entry) return null;
                    const transactions = details.kind === 'debit' ? entry.debits : entry.credits;
                    return (
                        <TransactionsDialog
                            date={entry.date}
                            kind={details.kind}
                            transactions={transactions}
                            onClose={() => setDetails(null)}
                        />
                    );
                })()}
        </Dialog.Root>
    );
}

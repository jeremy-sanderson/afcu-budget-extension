import { useMemo, useState } from 'react';
import { Dialog } from '@ark-ui/react';
import { convertTransactionToTSV } from '../utils/data';
import type { DebitsForDate } from '../utils/types';
import CopyIcon from './CopyIcon';
import CheckIcon from './CheckIcon';

const DATES_PAGE_SIZE = 5;

const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatBalance(value: string): string {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? currencyFormatter.format(numeric) : value;
}

interface SummaryDialogProps {
    currentBalance: string | null;
    availableBalance: string | null;
    debitsByDate: DebitsForDate[];
    onClose: () => void;
}

interface CopyButtonProps {
    label: string;
    isCopied: boolean;
    onClick: () => void;
}

function CopyButton({ label, isCopied, onClick }: CopyButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-600 bg-transparent border-none cursor-pointer hover:bg-gray-100 hover:text-[#00548e]"
        >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
        </button>
    );
}

export default function SummaryDialog({
    currentBalance,
    availableBalance,
    debitsByDate,
    onClose,
}: SummaryDialogProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [visibleDateCount, setVisibleDateCount] = useState(DATES_PAGE_SIZE);

    const debitsNewestFirst = useMemo(
        () => [...debitsByDate].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
        [debitsByDate],
    );
    const visibleDebits = debitsNewestFirst.slice(0, visibleDateCount);
    const remainingCount = debitsNewestFirst.length - visibleDebits.length;

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
                                        <span className="text-base text-gray-900 before:content-['$']">
                                            {formatBalance(currentBalance)}
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
                                        <span className="text-base text-gray-900 before:content-['$']">
                                            {formatBalance(availableBalance)}
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

                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Debits by date</h3>
                    {debitsNewestFirst.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                            No debit transactions on this page.
                        </p>
                    ) : (
                        <>
                            <ul className="divide-y divide-gray-200 border border-gray-200 rounded">
                                {visibleDebits.map((entry) => {
                                    const key = `date-${entry.date}`;
                                    const tsv = entry.transactions
                                        .map((t) => convertTransactionToTSV(t))
                                        .join('\n');
                                    return (
                                        <li
                                            key={entry.date}
                                            className="flex items-center justify-between gap-3 px-3 py-2"
                                        >
                                            <span className="text-sm text-gray-900">
                                                {entry.date}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600">
                                                    {entry.count}{' '}
                                                    {entry.count === 1
                                                        ? 'transaction'
                                                        : 'transactions'}
                                                </span>
                                                <CopyButton
                                                    label={`Copy debits from ${entry.date}`}
                                                    isCopied={copiedKey === key}
                                                    onClick={() => copy(key, tsv)}
                                                />
                                            </div>
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
        </Dialog.Root>
    );
}

import { useState } from 'react';
import useDialog from '../../hooks/useDialog';
import useFeatures from '../../hooks/useFeatures';
import useRowClickToCopy from '../../hooks/useRowClickToCopy';
import BudgetMenu from '../../components/BudgetMenu';
import BudgetPanel from '../../components/BudgetPanel';
import AlertDialog from '../../components/AlertDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import PromptDialog from '../../components/PromptDialog';
import SummaryDialog from '../../components/SummaryDialog';
import { gatherTransactionsByDate, getAvailableBalance, getCurrentBalance } from '../../utils/data';
import type { SummaryData } from '../../utils/types';
import { useGenerateSummaries } from '../../utils/settings';

export default function App() {
    const dialog = useDialog();
    const features = useFeatures(dialog);
    const [generateSummaries] = useGenerateSummaries();
    const [summary, setSummary] = useState<SummaryData | null>(null);
    useRowClickToCopy();

    const openSummary = () => {
        setSummary({
            currentBalance: getCurrentBalance(),
            availableBalance: getAvailableBalance(),
            transactionsByDate: gatherTransactionsByDate(),
        });
    };

    const menuItems = [
        { text: 'Debits from Yesterday', onClick: features.debitTransactionsFromYesterday },
        { text: 'Debits from Today', onClick: features.debitTransactionsFromToday },
        { text: 'Debits from Date', onClick: features.debitTransactionsWithDate },
        { text: 'Current Balance', onClick: features.copyCurrentBalance },
        { text: 'Available Balance', onClick: features.copyAvailableBalance },
        ...(generateSummaries ? [{ text: 'Summary', onClick: openSummary }] : []),
    ];

    return (
        <>
            <BudgetMenu items={menuItems} />
            <BudgetPanel items={menuItems} />
            {dialog.dialogState.type === 'alert' && (
                <AlertDialog message={dialog.dialogState.message} onClose={dialog.close} />
            )}
            {dialog.dialogState.type === 'confirm' && (
                <ConfirmDialog
                    message={dialog.dialogState.message}
                    onConfirm={() => {
                        if (dialog.dialogState.type === 'confirm') {
                            dialog.dialogState.onResult(true);
                        }
                        dialog.close();
                    }}
                    onCancel={() => {
                        if (dialog.dialogState.type === 'confirm') {
                            dialog.dialogState.onResult(false);
                        }
                        dialog.close();
                    }}
                />
            )}
            {dialog.dialogState.type === 'prompt' && (
                <PromptDialog
                    message={dialog.dialogState.message}
                    onSubmit={(value) => {
                        if (dialog.dialogState.type === 'prompt') {
                            dialog.dialogState.onResult(value);
                        }
                        dialog.close();
                    }}
                    onCancel={() => {
                        if (dialog.dialogState.type === 'prompt') {
                            dialog.dialogState.onResult(null);
                        }
                        dialog.close();
                    }}
                />
            )}
            {summary && (
                <SummaryDialog
                    currentBalance={summary.currentBalance}
                    availableBalance={summary.availableBalance}
                    transactionsByDate={summary.transactionsByDate}
                    onClose={() => setSummary(null)}
                />
            )}
        </>
    );
}

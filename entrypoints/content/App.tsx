import useDialog from '../../hooks/useDialog';
import useFeatures from '../../hooks/useFeatures';
import useRowClickToCopy from '../../hooks/useRowClickToCopy';
import BudgetMenu from '../../components/BudgetMenu';
import AlertDialog from '../../components/AlertDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import PromptDialog from '../../components/PromptDialog';

export default function App() {
    const dialog = useDialog();
    const features = useFeatures(dialog);
    useRowClickToCopy();

    const menuItems = [
        { text: 'Debits from Yesterday', onClick: features.debitTransactionsFromYesterday },
        { text: 'Debits from Today', onClick: features.debitTransactionsFromToday },
        { text: 'Debits from Date', onClick: features.debitTransactionsWithDate },
        { text: 'Current Balance', onClick: features.copyCurrentBalance },
        { text: 'Available Balance', onClick: features.copyAvailableBalance },
    ];

    return (
        <>
            <BudgetMenu items={menuItems} />
            {dialog.dialogState.type === 'alert' && (
                <AlertDialog
                    message={dialog.dialogState.message}
                    open={true}
                    onClose={dialog.closeDialog}
                />
            )}
            {dialog.dialogState.type === 'confirm' && (
                <ConfirmDialog
                    message={dialog.dialogState.message}
                    open={true}
                    onConfirm={() => dialog.resolveDialog(true)}
                    onCancel={() => dialog.resolveDialog(false)}
                />
            )}
            {dialog.dialogState.type === 'prompt' && (
                <PromptDialog
                    message={dialog.dialogState.message}
                    open={true}
                    onSubmit={(value) => dialog.resolveDialog(value)}
                    onCancel={() => dialog.resolveDialog(null)}
                />
            )}
        </>
    );
}

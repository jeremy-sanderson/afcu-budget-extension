import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AlertDialog from '../../components/AlertDialog';
import SummaryDialog from '../../components/SummaryDialog';
import SummaryButton from '../../components/SummaryButton';
import useDialog from '../../hooks/useDialog';
import { useGenerateSummaries } from '../../utils/settings';
import { fetchAccountSummary } from '../../utils/fetchAccountSummary';
import { buildAccountDetailsUrl } from '../../utils/accountUrl';
import { AccountsWidget } from '../../utils/selectors';
import type { SummaryData } from '../../utils/types';

interface AccountTileRow {
    mount: HTMLElement;
    accountId: string;
}

const MOUNT_ATTR = 'data-budget-summary-mount';

function findAccountTiles(): AccountTileRow[] {
    const container = document.querySelector(AccountsWidget.tileList);
    if (!container) return [];

    const rows: AccountTileRow[] = [];
    for (const tile of container.querySelectorAll<HTMLElement>(AccountsWidget.tile)) {
        const testId = tile.getAttribute(AccountsWidget.tileIdAttr) ?? '';
        if (!testId.startsWith(AccountsWidget.tileIdPrefix)) continue;
        const accountId = testId.slice(AccountsWidget.tileIdPrefix.length);

        const existing = tile.querySelector<HTMLElement>(`[${MOUNT_ATTR}]`);
        if (existing) {
            rows.push({ mount: existing, accountId });
            continue;
        }

        if (getComputedStyle(tile).position === 'static') {
            tile.style.position = 'relative';
        }

        const mount = document.createElement('span');
        mount.setAttribute(MOUNT_ATTR, '');
        mount.style.position = 'absolute';
        mount.style.top = '6px';
        mount.style.right = '6px';
        mount.style.display = 'inline-flex';
        mount.style.zIndex = '1';
        tile.appendChild(mount);
        rows.push({ mount, accountId });
    }
    return rows;
}

function clearMounts() {
    for (const mount of document.querySelectorAll(`[${MOUNT_ATTR}]`)) {
        mount.remove();
    }
}

export default function AccountsWidgetApp() {
    const dialog = useDialog();
    const [generateSummaries] = useGenerateSummaries();
    const [rows, setRows] = useState<AccountTileRow[]>([]);
    const [summary, setSummary] = useState<{ data: SummaryData; accountId: string } | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    useEffect(() => {
        if (!generateSummaries) return;

        const update = () => setRows(findAccountTiles());
        update();

        const container = document.querySelector(AccountsWidget.tileList);
        if (!container) return;

        const observer = new MutationObserver(update);
        observer.observe(container, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
            clearMounts();
            setRows([]);
        };
    }, [generateSummaries]);

    const handleClick = async (accountId: string) => {
        if (loadingId) return;
        setLoadingId(accountId);
        try {
            const data = await fetchAccountSummary(buildAccountDetailsUrl(accountId));
            setSummary({ data, accountId });
        } catch (error) {
            console.error('Error fetching account details:', error);
            dialog.showAlert(
                `Error fetching account details: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        } finally {
            setLoadingId(null);
        }
    };

    if (!generateSummaries) return null;

    return (
        <>
            {rows.map((row) =>
                createPortal(
                    <SummaryButton
                        onClick={() => handleClick(row.accountId)}
                        isLoading={loadingId === row.accountId}
                    />,
                    row.mount,
                    row.accountId,
                ),
            )}
            {dialog.dialogState.type === 'alert' && (
                <AlertDialog message={dialog.dialogState.message} onClose={dialog.close} />
            )}
            {summary && (
                <SummaryDialog
                    currentBalance={summary.data.currentBalance}
                    availableBalance={summary.data.availableBalance}
                    transactionsByDate={summary.data.transactionsByDate}
                    accountDescription={summary.data.accountDescription}
                    accountUrl={buildAccountDetailsUrl(summary.accountId)}
                    onClose={() => setSummary(null)}
                />
            )}
        </>
    );
}

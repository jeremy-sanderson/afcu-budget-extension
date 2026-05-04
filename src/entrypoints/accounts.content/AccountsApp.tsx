import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AlertDialog from '../../components/AlertDialog';
import SummaryDialog from '../../components/SummaryDialog';
import useDialog from '../../hooks/useDialog';
import { useGenerateSummaries } from '../../utils/settings';
import type { SummaryData } from '../../utils/types';
import type { FetchAccountDetailsRequest, FetchAccountDetailsResponse } from '../../utils/messages';

interface DepositRow {
    mount: HTMLElement;
    href: string;
}

const MOUNT_ATTR = 'data-budget-summary-mount';
const CELL_ATTR = 'data-budget-summary-cell';

function findDepositTable(): HTMLTableElement | null {
    const container = document.getElementById('account-lists-container');
    if (!container) return null;

    for (const heading of container.querySelectorAll('h3')) {
        if (!heading.textContent?.trim().toLowerCase().includes('deposit')) continue;
        let sibling = heading.nextElementSibling;
        while (sibling && sibling.tagName !== 'TABLE') {
            sibling = sibling.nextElementSibling;
        }
        return sibling instanceof HTMLTableElement ? sibling : null;
    }
    return null;
}

function buildMounts(): DepositRow[] {
    const table = findDepositTable();
    if (!table) return [];

    const rows: DepositRow[] = [];
    for (const tr of table.querySelectorAll<HTMLTableRowElement>('tbody tr')) {
        const cell = tr.querySelector<HTMLTableCellElement>('td.column-account-name');
        const link = cell?.querySelector<HTMLAnchorElement>('a.datagrid-link');
        if (!cell || !link) continue;

        const existing = cell.querySelector<HTMLElement>(`[${MOUNT_ATTR}]`);
        if (existing) {
            rows.push({ mount: existing, href: link.href });
            continue;
        }

        cell.setAttribute(CELL_ATTR, '');
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.gap = '8px';

        const mount = document.createElement('span');
        mount.setAttribute(MOUNT_ATTR, '');
        mount.style.display = 'inline-flex';
        cell.prepend(mount);
        rows.push({ mount, href: link.href });
    }
    return rows;
}

function clearMounts() {
    for (const mount of document.querySelectorAll(`[${MOUNT_ATTR}]`)) {
        mount.remove();
    }
    for (const cell of document.querySelectorAll<HTMLElement>(`[${CELL_ATTR}]`)) {
        cell.removeAttribute(CELL_ATTR);
        cell.style.removeProperty('display');
        cell.style.removeProperty('align-items');
        cell.style.removeProperty('gap');
    }
}

interface SummaryButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

function SummaryButton({ onClick, isLoading }: SummaryButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading}
            aria-label="Generate summary"
            title="Generate summary"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: '#00548e',
                cursor: isLoading ? 'progress' : 'pointer',
                opacity: isLoading ? 0.4 : 1,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="16"
                height="16"
                aria-hidden="true"
            >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
                <line x1="8" y1="9" x2="10" y2="9" />
            </svg>
        </button>
    );
}

async function fetchSummary(url: string): Promise<SummaryData> {
    const request: FetchAccountDetailsRequest = { type: 'fetchAccountDetails', url };
    const response = (await browser.runtime.sendMessage(request)) as
        | FetchAccountDetailsResponse
        | undefined;
    if (!response || !response.ok) {
        throw new Error(response?.error ?? 'No response from background');
    }
    return response.data;
}

export default function AccountsApp() {
    const dialog = useDialog();
    const [generateSummaries] = useGenerateSummaries();
    const [rows, setRows] = useState<DepositRow[]>([]);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loadingHref, setLoadingHref] = useState<string | null>(null);

    useEffect(() => {
        if (!generateSummaries) return;

        const update = () => setRows(buildMounts());
        update();

        const container = document.getElementById('account-lists-container');
        if (!container) return;

        const observer = new MutationObserver(update);
        observer.observe(container, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
            clearMounts();
            setRows([]);
        };
    }, [generateSummaries]);

    const handleClick = async (href: string) => {
        if (loadingHref) return;
        setLoadingHref(href);
        try {
            const data = await fetchSummary(href);
            setSummary(data);
        } catch (error) {
            console.error('Error fetching account details:', error);
            dialog.showAlert(
                `Error fetching account details: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        } finally {
            setLoadingHref(null);
        }
    };

    if (!generateSummaries) return null;

    return (
        <>
            {rows.map((row) =>
                createPortal(
                    <SummaryButton
                        onClick={() => handleClick(row.href)}
                        isLoading={loadingHref === row.href}
                    />,
                    row.mount,
                    row.href,
                ),
            )}
            {dialog.dialogState.type === 'alert' && (
                <AlertDialog message={dialog.dialogState.message} onClose={dialog.close} />
            )}
            {summary && (
                <SummaryDialog
                    currentBalance={summary.currentBalance}
                    availableBalance={summary.availableBalance}
                    debitsByDate={summary.debitsByDate}
                    onClose={() => setSummary(null)}
                />
            )}
        </>
    );
}

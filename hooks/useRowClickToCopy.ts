import { useEffect } from 'react';
import {
    getAllRowsInPastTransactionTable,
    getRowData,
    convertTransactionToTSV,
} from '../utils/data';

const HANDLED_ATTR = 'data-click-to-copy';

function setupRowClickHandlers() {
    getAllRowsInPastTransactionTable().forEach((row) => {
        const el = row as HTMLElement;
        if (el.hasAttribute(HANDLED_ATTR)) return;

        const transaction = getRowData(row);
        if (transaction && transaction.amount < 0) {
            const debitTransaction = { ...transaction, amount: Math.abs(transaction.amount) };
            el.setAttribute(HANDLED_ATTR, '');
            el.style.cursor = 'pointer';

            el.addEventListener('mouseover', () => {
                el.style.color = 'blue';
            });

            el.addEventListener('mouseout', () => {
                el.style.color = 'unset';
            });

            el.addEventListener('click', () => {
                navigator.clipboard
                    .writeText(convertTransactionToTSV(debitTransaction))
                    .then(() => console.log('Saved to clipboard', debitTransaction))
                    .catch((error) => console.error('Error copying transaction:', error));
            });
        }
    });
}

export default function useRowClickToCopy() {
    useEffect(() => {
        setupRowClickHandlers();

        const grid = document.querySelector('#PastTransactionsGrid');
        if (!grid) return;

        const observer = new MutationObserver(() => {
            setupRowClickHandlers();
        });

        observer.observe(grid, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);
}

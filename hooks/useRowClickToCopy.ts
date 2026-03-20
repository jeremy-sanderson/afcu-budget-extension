import { useEffect } from 'react';
import { getAllRowsInPastTransactionTable, getRowData, convertTransactionToTSV } from '../utils/data';

function setupRowClickHandlers() {
    getAllRowsInPastTransactionTable().forEach(row => {
        const transaction = getRowData(row);
        if (transaction && transaction.amount < 0) {
            const debitTransaction = { ...transaction, amount: Math.abs(transaction.amount) };
            const el = row as HTMLElement;
            el.style.cursor = 'pointer';

            const newRow = row.cloneNode(true) as HTMLElement;
            row.parentNode?.replaceChild(newRow, row);

            newRow.addEventListener('mouseover', () => {
                newRow.style.color = 'blue';
            });

            newRow.addEventListener('mouseout', () => {
                newRow.style.color = 'unset';
            });

            newRow.addEventListener('click', () => {
                navigator.clipboard.writeText(convertTransactionToTSV(debitTransaction))
                    .then(() => console.log('Saved to clipboard', debitTransaction))
                    .catch(error => console.error('Error copying transaction:', error));
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

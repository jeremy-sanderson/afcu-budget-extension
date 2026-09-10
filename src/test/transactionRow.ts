export interface TransactionRowOptions {
    date?: string;
    description?: string;
    amount?: string;
    pending?: boolean;
    omitDate?: boolean;
    omitAmount?: boolean;
    id?: string;
}

export function createTransactionRow({
    date = 'Apr 12 2025',
    description = 'WALMART PURCHASE',
    amount = '($203.07)',
    pending = false,
    omitDate = false,
    omitAmount = false,
    id,
}: TransactionRowOptions = {}): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'transaction-history-item';
    const dateCell = pending ? 'Pending' : date;
    li.innerHTML = `
        <a class="datatable-row parent-template pointer ${pending ? 'pending' : ''}">
            <div class="row-content flex">
                ${omitDate ? '' : `<div class="col-date">${dateCell}</div>`}
                <div class="col-desc">
                    <div test-id="historyItemDescription" class="description-text">${description}</div>
                </div>
                <div class="col-amount">
                    ${omitAmount ? '' : `<span test-id="lblAmount" class="amount"><span class="numAmount">${amount}</span></span>`}
                </div>
                ${id ? `<div class="col-actions"><q2-dropdown test-id="transactionActionsDropDown" context-value="${id}"></q2-dropdown></div>` : ''}
            </div>
        </a>
    `;
    return li;
}

export function setupTransactionTable(rows: HTMLLIElement[]): void {
    document.body.innerHTML = '<ul id="historyItems"></ul>';
    const list = document.querySelector('#historyItems')!;
    rows.forEach((row) => list.appendChild(row));
}

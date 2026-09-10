export const AccountDetails = {
    transactionList: '#historyItems',
    transactionRow: 'li.transaction-history-item',
    dateCell: '.col-date',
    descriptionCell: '[test-id="historyItemDescription"]',
    amountValue: '[test-id="lblAmount"] .numAmount',
    transactionActions: '[test-id="transactionActionsDropDown"]',
    transactionIdAttr: 'context-value',
    balanceList: 'dl.featured-hade-list',
    balanceLabel: '[test-id="hade-detail"]',
    balanceValue: '[test-id="hade-value"] .numAmount',
    accountName: '[test-id="acctHeaderTitle"]',
} as const;

export const AccountsWidget = {
    tileList: 'q2-list.condensed-account-list',
    tile: '.condensed-account-tile',
    tileIdAttr: 'test-id',
    tileIdPrefix: 'widget-tile-',
} as const;

'use strict';

// ========================
// DATA HANDLING
// ========================

/**
 * Extracts data from a transaction row
 */
function getRowData(row) {
    try {
        const dateValue = row.querySelector('td.column-date')?.outerText || '';
        const description = row.querySelector('td.column-description')?.outerText || '';
        const amountElement = row.querySelector('td.column-amount span.transaction-');
        
        if (!dateValue || !description || !amountElement) {
            console.error('Missing elements in transaction row');
            return null;
        }
        
        const amount = amountElement.outerText;
        return { 
            'date': dateValue,
            'description': description.replace(",", "").replace("\n", ""),
            'amount': Number(amount.replace("$", "").replace(",", ""))
        };
    } catch (error) {
        console.error('Error parsing row data:', error);
        return null;
    }
}

/**
 * Converts a transaction object to tab-separated values format
 */
function convertTransactionToTSV(transaction) {
    return `${transaction.date}\t${transaction.description}\t${transaction.amount}`;
}

/**
 * Gets all transaction rows from the accounts page
 */
function getAllRowsInPastTransactionTable() {
    try {
        return [...document.querySelectorAll('#PastTransactionsGrid table tbody tr')];
    } catch (error) {
        console.error('Error getting transaction rows:', error);
        return [];
    }
}

/**
 * Gets all debit transactions sorted by date
 */
function gatherDebitTransactionsInViewSortedByDate() {
    try {
        return getAllRowsInPastTransactionTable()
            .map(row => getRowData(row))
            .filter(transaction => transaction && transaction.amount < 0)
            .map(transaction => ({...transaction, amount: Math.abs(transaction.amount)}))
            .sort((a, b) => {
                const dateComparison = Date.parse(a.date) - Date.parse(b.date);
                return dateComparison === 0 ? a.description.localeCompare(b.description) : dateComparison;
            });
    } catch (error) {
        console.error('Error gathering transactions:', error);
        return [];
    }
}

/**
 * Gets the available balance from the account details section
 */
function getAvailableBalance() {
    try {
        const accountDetails = document.querySelector("div.account-details");
        if (!accountDetails) {
            throw new Error('Account details section not found');
        }
        
        const balanceRow = [...accountDetails.querySelectorAll(".row")].find(
            row => row.querySelector(".detail-label-col span")?.innerText.includes('Available Balance')
        );
        
        if (!balanceRow) {
            throw new Error('Available balance not found');
        }
        
        return balanceRow.querySelector(".detail-item-col span").innerText.replace("$", "").replace(",", "");
    } catch (error) {
        console.error('Error getting available balance:', error);
        Prompts.alert(`Error: ${error.message}`);
        return null;
    }
}

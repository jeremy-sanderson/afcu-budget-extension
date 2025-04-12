'use strict';

// ========================
// FEATURE FUNCTIONS
// ========================

/**
 * Feature to select transactions from a specific date
 */
function debitTransactionsWithDate() {
    try {
        Prompts.prompt("Enter start date (blank for today)").then(selectedDate => {
            const today = new Date().toLocaleDateString();
            const filterDate = selectedDate ? Date.parse(selectedDate) : Date.parse(today);
            filterDebitsByDate(filterDate);
        });
    } catch (error) {
        console.error('Error in transaction date selection:', error);
        Prompts.alert('Error selecting date. Please try again.');
    }
}

/**
 * Feature to select transactions from yesterday
 */
function debitTransactionsFromYesterday() {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        filterDebitsByDate(Date.parse(yesterday.toLocaleDateString()));
    } catch (error) {
        console.error('Error getting yesterday\'s transactions:', error);
        Prompts.alert('Error retrieving yesterday\'s transactions.');
    }
}

/**
 * Feature to select transactions from today
 */
function debitTransactionsFromToday() {
    try {
        filterDebitsByDate(Date.parse(new Date().toLocaleDateString()));
    } catch (error) {
        console.error('Error getting today\'s transactions:', error);
        Prompts.alert('Error retrieving today\'s transactions.');
    }
}

/**
 * Filters and copies debit transactions by date
 */
function filterDebitsByDate(filterDate) {
    try {
        const transactions = gatherDebitTransactionsInViewSortedByDate()
            .filter(transaction => Date.parse(transaction.date) >= filterDate)
            .map(t => convertTransactionToTSV(t))
            .join('\n');
            
        if (!transactions) {
            Prompts.alert("No transactions found for the selected date range.");
            return;
        }
        
        navigator.clipboard.writeText(transactions)
            .then(() => Prompts.alert("Transactions copied to clipboard"))
            .catch(error => {
                console.error('Error copying to clipboard:', error);
                Prompts.alert("Error copying to clipboard. Please try again.");
            });
    } catch (error) {
        console.error('Error filtering transactions by date:', error);
        Prompts.alert('Error filtering transactions. Please try again.');
    }
}

/**
 * Feature to copy the available balance
 */
function availableBalance() {
    try {
        const balance = getAvailableBalance();
        if (balance) {
            navigator.clipboard.writeText(balance)
                .then(() => Prompts.alert("Available balance copied to clipboard"))
                .catch(error => {
                    console.error('Error copying balance to clipboard:', error);
                    Prompts.alert("Error copying balance. Please try again.");
                });
        }
    } catch (error) {
        console.error('Error with available balance:', error);
        Prompts.alert('Error retrieving balance. Please try again.');
    }
}

/**
 * Sets up click-to-copy functionality for individual transactions
 */
function setupIndividualDebitTransactionLinks() {
    try {
        getAllRowsInPastTransactionTable().forEach(row => {
            const transaction = getRowData(row);
            if (transaction && transaction.amount < 0) {
                const debitTransaction = {...transaction, amount: Math.abs(transaction.amount)};
                row.style.cursor = 'pointer';
                
                // Remove previous event listeners if the row was already processed
                const newRow = row.cloneNode(true);
                row.parentNode.replaceChild(newRow, row);
                
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
    } catch (error) {
        console.error('Error setting up transaction links:', error);
    }
}

/**
 * Delays the setup of transaction links to ensure the page has loaded
 */
function delayedIndividualDebitTransactionLinks() {
    setTimeout(setupIndividualDebitTransactionLinks, 2000);
}

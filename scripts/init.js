'use strict';

// ========================
// EVENT MANAGEMENT
// ========================

/**
 * Sets up event listeners for page elements
 */
function setupEventListeners() {
    try {
        const dateRangeDropdown = document.querySelector('#TransactionFilter_TransactionDatePeriod');
        if (dateRangeDropdown) {
            dateRangeDropdown.addEventListener('change', delayedIndividualDebitTransactionLinks);
        }
        
        const filterSubmitButton = document.querySelector('#SubmitFilter');
        if (filterSubmitButton) {
            filterSubmitButton.addEventListener('click', delayedIndividualDebitTransactionLinks);
        }
        
        const form = document.querySelector("form#TransactionFilter");
        if (form) {
            form.addEventListener('submit', delayedIndividualDebitTransactionLinks);
        }
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// ========================
// INITIALIZATION
// ========================

/**
 * Initializes the budgeting features
 */
function initBudgetingFeatures() {
    try {
        // Create main menu
        const dropdownMenu = createMenuButtonAndContainer('Budgeting');
        if (!dropdownMenu) {
            throw new Error('Failed to create budgeting menu');
        }
        
        // Add menu items
        createMenuItem(dropdownMenu, 'Debits from Yesterday', debitTransactionsFromYesterday);
        createMenuItem(dropdownMenu, 'Debits from Today', debitTransactionsFromToday);
        createMenuItem(dropdownMenu, 'Debits from Date', debitTransactionsWithDate);
        createMenuItem(dropdownMenu, 'Balance', availableBalance);
        
        // Setup transaction links and event listeners
        delayedIndividualDebitTransactionLinks();
        setupEventListeners();
        
        console.log('AFCU Budgeting extension initialized');
    } catch (error) {
        console.error('Error initializing budgeting features:', error);
    }
}

// Start the extension
initBudgetingFeatures();

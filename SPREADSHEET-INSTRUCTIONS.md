# Spreadsheet setup

Copy this [template][google-sheet-template] from Google spreadsheets

## Initial setup

### Template Sheet
- The `Category` column contains the category for the expense
  - This must match a value from the `Categories` sheet, add any categories you need to that sheet
- The template is setup for twice monthly budgeting, so it is divided into a first half of month and second half of 
month sections
- Edit the categories to match what you need for your budgeting
  - The categories can be as broad or as specific as you'd like
- The `Budget` column is where the planned amount to spend on that category is set
- The `Scheduled` column is to track if a payment has been scheduled yet, for example when you schedule a payment it doesn't come out right away, this column can help track if it has been scheduled already
- The `Checking` column is auto populated with the amount that has cleared the checking account for the category
- The `Needed` column is auto populated with how much more is currently needed for the category
  - For example if $200 has been spent so far on groceries, but $500 was the Budget amount then $300 will show up in the `Needed` column
  - This can be manually set to $0 during the budget period if you know you've already spent everything for that category
    - For example if you estimated $150 for auto insurance, but your rates went down that month you can make a manual adjustment here
  - The `Over/Under` column is auto populated to show how much over the budget the category went, for future planning

#### Calculations section
This section is used for balancing the budget, there are a few values that need to be filled out, the rest is calculated


##### Input values
- `Start Date` - the start date for the budget period
- `End Date` - the end date for the budget period
- `Starting` - the amount of dollars you start the budget period with, probably your paycheck amount
- `Account balance` - the current balance of the checking account

##### Calculated values
- `Budgeted` - the total value of all of the budgeted categories for the budget period
- `Planned Diff` - the difference between the starting amount and the budgeted amount
  - If this is a positive number, then that is money you could put in savings or pay extra on debts
  - If this is a negative number, then you are over budget, you need to cut back on spending to get it to balance
- `Actual Spent` - the total amount spent (the sum of the `Checking` column)
- `Needed now` - the amount of money needed now for the budget
- `Difference` - the difference between the `Account balance` and the `Needed now` amount
  - If this is negative, then you are projected to go over budget, adjust what you can in budgeting for categories
  - If this is positive, then you are under budget

##### Category Balancing
These are all calculated values, it is the sum of everything spent in the budget period compared to the sum 
of all of the categories in the budget period.
- If the `Should be 0` value is not zero that means you are missing a category or have uncategorized debits
- Check that you have all of the categories in your `Category` column that appear in the `Debits_AFCU_XXXX` sheet
  - A duplicate category value in the `Category` column can also affect this


### Debits_AFCU_XXXX Sheet
This sheet is where you will paste debits from the extension. You can rename it, the `XXXX` is intended to be the last
four digits of your account for readability.
- The extension puts the debits in a tab separated value format in the paste buffer, so that they will paste directly into the columns
- Column D is for setting the category that the debit belongs to 
- Column E is if you want to manually split a debit into more than one category
  - You would copy the debit line and paste for as many lines as needed to match the number of categories
  - Mark it as a split debit so that it makes sense if  you review it later
- Column F is for optional notes about the debit

## Monthly setup

- Copy the `Template` sheet and rename the copy to match the month (e.g. January)
- Make any adjustments to the categories in the `Category` column
- Update the `Start Date`, `End Date` and `Starting` inputs

## Budgeting instructions

- Sign into [AFCU][afcu-sign-in]
- Open the transactions for the checking account by clicking on the Checking account link
- There is a `Budget` button in the top right corner (this is the extension)
  - Clicking it reveals several menu options
    - Debits from Yesterday
      - Copies all debits from yesterday's date to the current date into the paste buffer (like pressing Ctrl+C)
    - Debits from Today
      - Copies all debits from today only into the paste buffer
    - Debits from Date
      - Copies all debits from a date you provide to the current date into the paste buffer
    - Current Balance
      - Copies the current balance of the account into the paste buffer
    - Available Balance
      - Copies the available balance into the paste buffer - the current balance minus any pending debits
- Copy the current balance for the account into the `Account balance` cell in the spreadsheet
- Go to the `Debits_AFCU_XXXX` sheet and determine which debits you need copied
  - Count the number of debits on the sheet for the last day recorded
  - If that matches the debits on the AFCU transaction page for that date then use the `Budget` menu to copy debits starting with the next day
    - For example - if the spreadsheet has 5 debits recorded on 8/1/2025 and the AFCU transaction page also has 5 debits (not counting deposits or refunds) then you should use the `Budget` menu to copy all debits starting from 8/2/2025
  - If the AFCU transactions sheet has more debits than the spreadsheet, then copy from that date and overwrite the debits on the spreadsheet starting with that day
    - For example if the spreadsheet shows 5 debits on 8/1/2025, but the AFCU transactions page shows 10 debits - use the `Budget` menu to copy debits starting on 8/1/2025. Remove the existing debits in the spreadsheet and replace it with all of the debits starting on 8/1/2025


[google-sheet-template]: https://docs.google.com/spreadsheets/d/1_U6l67RL_8QgysgdPo5TCILUEtk0YAcFW0EMWPVUm4A/edit?gid=1006411934#gid=1006411934
[afcu-sign-in]: https:///www.americafirst.com
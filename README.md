# AFCU Budget Chrome Extension

A Chrome extension that enhances the America First Credit Union (AFCU) banking website by adding clipboard functionality for transaction data. This extension makes it easy to copy transaction information for budgeting and accounting purposes.

## Features

- Adds copy functionality to transaction data on AFCU banking pages
- Formats transaction data for easy import into spreadsheets or budgeting applications
- Works seamlessly with the AFCU banking interface at webaccess45.americafirst.com
- Auto-expanded menu on wide browser viewports — the budgeting menu pins to the left side of the page at 1550px and wider, with no click required to open it
- Optional account summary view (off by default) that surfaces current/available balances and copyable debits grouped by date, available both from the account details page and as a per-account button on the Accounts page

## Installation

Chrome only permits installing packaged extensions from the Chrome Web Store, so this extension is distributed as an unpacked build attached to each GitHub release.

1. Go to the [Releases page][releases] and download `afcu-budget-v<version>.zip` from the latest release's **Assets**.
2. Unzip the file into a folder you'll keep around (e.g. `~/chrome-extensions/afcu-budget/`). Chrome loads the extension from that folder — don't delete it.
3. Open `chrome://extensions/` in Chrome.
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** and select the unzipped folder.
6. The extension will now be active when you visit your AFCU banking account.

To update to a newer release, download the new zip, overwrite the contents of the existing folder, then click the reload icon on the extension's card in `chrome://extensions/`.

> Chrome will display a "disable developer mode extensions" banner on startup while this extension is loaded. That's expected for unpacked extensions.

## Usage

Once installed, the extension automatically activates when you visit your AFCU account details page. You'll see additional copy functionality integrated into the banking interface to help you export your transaction data.

There will be a new button in the upper right corner that has several options in it for extracting tab delimited transaction data. It matches the shape of the data found in a google spreadsheet. See [instructions][spreadsheet-instructions-md] here.

On wide browser viewports (1550px and wider), the menu auto-expands as a panel pinned to the left side of the page so all options are visible without clicking. On narrower viewports it stays collapsed as a button in the upper right corner.

### Options

Click the extension's toolbar icon to open the popup, or open the full options page from there. Available settings:

- **Generate summaries** (off by default) — when enabled, adds a `Summary` item to the budgeting menu on the account details page and a summary button next to each deposit account on the Accounts page. The summary shows the current balance, available balance, and debits grouped by date, each with a one-click copy button.

## Development

Built with WXT + React + Tailwind CSS 4, rendering inside a Shadow DOM for style isolation.

- `npm run dev` — Start dev server with hot reload
- `npm run build` — Build to `.output/chrome-mv3/`
- `npm test` — Run unit tests
- Load `.output/chrome-mv3` as unpacked extension in Chrome
- Use `test/sample.html` as a DOM structure reference

## Icons

Icons by: [Icon by FACH][icon-attribution]

[releases]: https://github.com/jeremy-sanderson/afcu-budget-extension/releases
[spreadsheet-instructions-md]: SPREADSHEET-INSTRUCTIONS.md
[icon-attribution]: https://www.freepik.com/icon/financial_15769437#fromView=keyword&page=1&position=0&uuid=3adade23-a318-4da1-abc2-90e263724313

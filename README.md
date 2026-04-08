# AFCU Budget Chrome Extension

A Chrome extension that enhances the America First Credit Union (AFCU) banking website by adding clipboard functionality for transaction data. This extension makes it easy to copy transaction information for budgeting and accounting purposes.

## Features

- Adds copy functionality to transaction data on AFCU banking pages
- Formats transaction data for easy import into spreadsheets or budgeting applications
- Works seamlessly with the AFCU banking interface at webaccess45.americafirst.com
-

## Installation

1. Clone this repository or download the source code
2. Install npm modules and build the code

- `npm run install && npm run build`

3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked" and select the .output/ directory
6. The extension will now be active when you visit your AFCU banking account

## Usage

Once installed, the extension automatically activates when you visit your AFCU account details page. You'll see additional copy functionality integrated into the banking interface to help you export your transaction data.

There will be a new button in the upper right corner that has several options in it for extracting tab delimited transaction data. It matches the shape of the data found in a google spreadsheet. See [instructions][spreadsheet-instructions-md] here.

## Development

Built with WXT + React + Tailwind CSS 4, rendering inside a Shadow DOM for style isolation.

- `npm run dev` — Start dev server with hot reload
- `npm run build` — Build to `.output/chrome-mv3/`
- `npm test` — Run unit tests
- Load `.output/chrome-mv3` as unpacked extension in Chrome
- Use `test/sample.html` as a DOM structure reference

## Icons

Icons by: [Icon by FACH][icon-attribution]

[spreadsheet-instructions-md]: SPREADSHEET-INSTRUCTIONS.md
[icon-attribution]: https://www.freepik.com/icon/financial_15769437#fromView=keyword&page=1&position=0&uuid=3adade23-a318-4da1-abc2-90e263724313

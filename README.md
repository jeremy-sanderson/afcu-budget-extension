# AFCU Budget Chrome Extension

A Chrome extension that enhances the America First Credit Union (AFCU) banking website by adding clipboard functionality for transaction data. This extension makes it easy to copy transaction information for budgeting and accounting purposes.

## Features

- Adds copy functionality to transaction data on AFCU banking pages
- Formats transaction data for easy import into spreadsheets or budgeting applications
- Works seamlessly with the AFCU banking interface at webaccess45.americafirst.com
- 

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select this project directory
5. The extension will now be active when you visit your AFCU banking account

## Usage

Once installed, the extension automatically activates when you visit your AFCU account details page. You'll see additional copy functionality integrated into the banking interface to help you export your transaction data.

There will be a new button in the upper right corner that has several options in it for extracting tab delimited transaction data. It matches the shape of the data found in a google spreadsheet. See [instructions][spreadsheet-instructions-md] here.

## Development

For development and testing:
- Use `test/sample.html` to simulate the banking interface without needing to log into your account
- The extension follows strict mode JavaScript with ES6+ features
- All scripts are organized modularly in the `scripts/` directory

## Icons

Icons by: [Icon by FACH][icon-attribution]


[spreadsheet-instructions-md]: SPREADSHEET-INSTRUCTIONS.md
[icon-attribution]: https://www.freepik.com/icon/financial_15769437#fromView=keyword&page=1&position=0&uuid=3adade23-a318-4da1-abc2-90e263724313
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.3.0] - 2026-05-06

### Added

- Pop-out icon next to the "Summary" heading in the summary dialog (Accounts page) that opens the underlying account-details page in a new tab.

## [3.2.0] - 2026-05-05

### Added

- Pop-out icon in the summary dialog that opens a per-date `TransactionsDialog`, listing all transactions on a selected day.
- Per-row copy button on each line in the transactions dialog, alongside the existing copy-all button.
- Credits column in the summary dialog: each date row now shows debit and credit totals (with their counts) side-by-side, each with its own copy button.
- Separate per-date debit and credit pop-out dialogs, so positive transactions can be reviewed and copied independently of debits.
- Summary buttons on every account in the Accounts page list view (loans, credit cards, etc.), matching the existing tile-view coverage.

### Changed

- Refactored shared currency and date formatting helpers for reuse across components.
- Extracted shared `CopyButton` component so the transactions and summary dialogs use the same copy affordance.
- `SummaryData` now exposes a single `transactionsByDate` field (with grouped `debits` and `credits` per date) in place of the previous debit-only `debitsByDate`.

## [3.1.0] - 2026-05-04

### Added

- Summary icon on each account tile in the Accounts page tile view, providing one-click access to the account summary dialog without navigating into the account.

### Changed

- Updated README and spreadsheet instructions to reflect the summary generation workflow.

## [3.0.0] - 2026-05-04

### Added

- Account summary generation: a new `SummaryDialog` aggregates transactions by date and produces a copyable summary for an account.
- Background script (`background.ts`) and a dedicated `scrape-details` entrypoint to fetch account detail pages without leaving the current view.
- Options page and popup entrypoints for managing extension settings, with an option flag controlling summary generation.
- Accounts page content script (`accounts.content`) that injects summary controls into the AFCU accounts list.
- Settings utility module and message-passing types shared between background, content scripts, and UI surfaces.

## [2.1.0] - 2026-04-19

### Added

- `BudgetPanel` component and styling for wide browser viewports, rendering the menu in an auto-expanded panel layout instead of a collapsed dropdown when there is room for it.

## [2.0.2] - 2026-04-19

### Changed

- GitHub Actions workflow configuration adjustments for the release pipeline.

## [2.0.1] - 2026-04-19

### Added

- Auto-focus and highlight on the username field of the AFCU landing page after a short delay, via a new `landing.content` entrypoint.
- GitHub Actions workflows for pull-request validation and tagged releases (build, package, and publish a `.zip` artifact).
- Color-coded transaction rows in the account details view to make debits and credits easier to scan at a glance.

### Changed

- Source files relocated from the repository root into `src/` for a cleaner project layout.

### Fixed

- Infinite loop that locked up the browser by disconnecting the `MutationObserver` before attaching click handlers to transaction rows, then reconnecting it once handlers were wired up.

## [2.0.0] - 2026-03-27

Full rewrite of the extension as a WXT + React + TypeScript + Tailwind CSS 4 project, rendered inside a Shadow DOM for style isolation.

### Added

- WXT build toolchain with React 19, TypeScript (strict mode), and Tailwind CSS 4.
- Pure TypeScript data-scraping utilities (transaction parsing, balance extraction, TSV conversion) backed by unit tests.
- React component library: `BudgetMenu`, `AlertDialog`, `ConfirmDialog`, `PromptDialog`, plus the `useDialog`, `useFeatures`, and `useRowClickToCopy` hooks.
- Ark UI integration: dropdown menu and dialog primitives wired through an `EnvironmentProvider` so headless components resolve correctly inside the Shadow DOM.
- `MutationObserver`-based row click-to-copy, replacing the previous `setTimeout` polling approach.

### Changed

- All vanilla-JS implementations of menu, dialogs, and feature actions replaced with their React/Ark UI equivalents while preserving existing user-facing behavior.

## [1.0.0] - 2026-03-20

Initial tagged release of the pure-JavaScript content script.

### Added

- Chrome extension that injects a budgeting menu into the AFCU banking site, with menu actions for filtering debits, copying balances, and copying transactions to the clipboard as TSV.
- Menu items for current and available balance.
- Transaction count included in the post-copy alert.
- Sample HTML snapshot of the AFCU page for local testing.
- `README.md` documentation and spreadsheet usage instructions.

[Unreleased]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v3.3.0...HEAD
[3.3.0]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v2.1.0...v3.0.0
[2.1.0]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/jeremy-sanderson/afcu-budget-extension/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/jeremy-sanderson/afcu-budget-extension/releases/tag/v1.0.0

# AFCU Budget Chrome Extension

## Project Overview

Chrome extension (WXT + React + Tailwind CSS 4) that adds clipboard functionality to the AFCU banking website for budgeting purposes. Renders inside a Shadow DOM for style isolation.

## Development Commands

- `npm run dev` — Start WXT dev server with hot reload
- `npm run build` — Build for production to `.output/chrome-mv3/`
- `npm test` — Run unit tests
- `npm run test:watch` — Run tests in watch mode

## Manual Testing

Load `.output/chrome-mv3` as unpacked extension in Chrome.
Navigate to AFCU banking site to test.

## Project Structure

- `src/entrypoints/content/` — Content script entrypoint (Shadow DOM + React mount)
- `src/components/` — React UI components (BudgetMenu, dialogs)
- `src/hooks/` — React hooks (useDialog, useFeatures, useRowClickToCopy)
- `src/utils/` — Data scraping utilities and types
- `src/public/icon/` — Extension icons
- `src/test/sample.html` — Captured AFCU page snapshot for reference

## Code Style Guidelines

- TypeScript with strict mode
- 4-space indentation
- camelCase for variable and function names
- Use arrow functions for callbacks
- Use const/let (avoid var)
- Clean logic with early returns
- Organize related functionality into discrete functions
- Use descriptive variable names
- Use optional chaining and nullish coalescing for safe property access
- Colocate test files next to source files

## Error Handling

- Use try/catch for async operations
- Show user feedback via dialog components (AlertDialog, PromptDialog, ConfirmDialog)
- Log errors to console with detailed messages

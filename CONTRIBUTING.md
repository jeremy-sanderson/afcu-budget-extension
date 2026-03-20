# Contributing to AFCU Budget Chrome Extension

Thank you for your interest in contributing to the AFCU Budget Chrome Extension! This document explains how the code is organized and provides guidelines for contributing.

## Code Organization

The extension is built with WXT + React + Tailwind CSS 4, rendering inside a Shadow DOM for style isolation.

### Source Structure

- **`entrypoints/content/`** — Content script entrypoint
    - `index.tsx` — Shadow DOM setup and React mount
    - `App.tsx` — Root component wiring hooks, menu, and dialogs
    - `style.css` — Tailwind CSS import

- **`components/`** — React UI components
    - `BudgetMenu.tsx` — Fixed-position dropdown menu button
    - `MenuItem.tsx` — Individual menu item
    - `AlertDialog.tsx` — Alert modal (replaces vendored Prompts library)
    - `ConfirmDialog.tsx` — Confirm modal
    - `PromptDialog.tsx` — Prompt modal with text input

- **`hooks/`** — React hooks
    - `useDialog.ts` — Async dialog state management
    - `useFeatures.ts` — Menu action handlers (clipboard, date filtering)
    - `useRowClickToCopy.ts` — Individual transaction row click-to-copy via MutationObserver

- **`utils/`** — Pure utility functions
    - `types.ts` — Transaction type definition
    - `data.ts` — DOM scraping and data transformation

### Supporting Files

- **`public/icon/`** — Extension icons in various sizes
- **`test/sample.html`** — Captured AFCU page snapshot for reference
- **`wxt.config.ts`** — WXT configuration
- **`vitest.config.ts`** — Test configuration

## Development Guidelines

### Code Style

- TypeScript with strict mode
- 4-space indentation
- camelCase for variables and functions
- Arrow functions for callbacks
- Use `const`/`let` (avoid `var`)
- Early returns for cleaner logic
- Descriptive variable names
- Optional chaining and nullish coalescing for safe property access
- Colocate test files next to source files

### Testing

- `npm test` — Run all unit tests
- `npm run test:watch` — Run tests in watch mode
- Tests use Vitest + happy-dom + Testing Library
- Load `.output/chrome-mv3` as unpacked extension for manual testing
- Use `test/sample.html` as a DOM structure reference

### Making Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes following the code style guidelines
4. Run `npm test` to verify all tests pass
5. Run `npm run build` to verify the build succeeds
6. Test on the actual AFCU banking site
7. Commit with clear, descriptive messages
8. Push to your fork and create a pull request

### Pull Request Guidelines

- Describe what changes you've made and why
- Include any relevant issue numbers
- Ensure all existing functionality still works
- Add comments only when necessary for complex logic
- Keep changes focused and atomic

## Security Considerations

- Never log sensitive banking information
- Ensure clipboard operations only copy intended data
- Follow Chrome extension security best practices
- Don't add unnecessary permissions to the manifest

## Questions?

If you have questions about the codebase or contribution process, please open an issue for discussion.

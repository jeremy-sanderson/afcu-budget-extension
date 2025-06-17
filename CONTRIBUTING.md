# Contributing to AFCU Budget Chrome Extension

Thank you for your interest in contributing to the AFCU Budget Chrome Extension! This document explains how the code is organized and provides guidelines for contributing.

## Code Organization

The extension is organized into modular JavaScript files, each handling specific functionality:

### Core Scripts (loaded in order)

1. **`scripts/config.js`** - Configuration and constants
   - Color schemes and styling constants
   - Global configuration values

2. **`scripts/prompts.js`** - User interaction utilities
   - Alert and confirmation dialogs
   - Date input prompts
   - User feedback mechanisms

3. **`scripts/ui.js`** - UI component creation
   - Menu button and container creation
   - Menu item generation
   - DOM manipulation helpers

4. **`scripts/data.js`** - Data extraction and processing
   - Transaction data parsing
   - Balance information extraction
   - Data formatting for clipboard

5. **`scripts/features.js`** - Main feature implementations
   - Transaction filtering by date
   - Clipboard operations
   - Individual transaction link creation

6. **`scripts/init.js`** - Extension initialization
   - Event listener setup
   - Feature initialization
   - Entry point for the extension

### Supporting Files

- **`manifest.json`** - Chrome extension configuration
- **`icons/`** - Extension icons in various sizes
- **`test/sample.html`** - Testing interface for development

## Development Guidelines

### Code Style

- Use strict mode (`'use strict'`) in all JavaScript files
- 4-space indentation
- camelCase for variables and functions
- Arrow functions for callbacks
- Use `const`/`let` (avoid `var`)
- Prefix private functions with underscore
- Early returns for cleaner logic
- Descriptive variable names
- Optional chaining and nullish coalescing for safe property access

### Code Structure

- Group related functionality with comment headers
- Keep functions focused and single-purpose
- Handle errors with try/catch blocks
- Provide user feedback via `Prompts.alert()` for errors
- Log errors to console with detailed messages

### Testing

1. Load the extension in Chrome Developer Mode
2. Test on the actual AFCU banking site
3. Use `test/sample.html` for offline testing
4. Verify clipboard functionality works correctly
5. Check console for any errors

### Making Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes following the code style guidelines
4. Test thoroughly on both the sample page and actual banking site
5. Commit with clear, descriptive messages
6. Push to your fork and create a pull request

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
- Don't add unnecessary permissions to manifest.json

## Questions?

If you have questions about the codebase or contribution process, please open an issue for discussion.
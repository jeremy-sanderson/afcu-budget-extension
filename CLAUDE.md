# Budget Chrome Extension Reference

## Project Overview
Chrome extension that adds clipboard functionality to AFCU banking website for budgeting purposes.

## Development Commands
```
# Manual testing
Open Chrome's extension page (chrome://extensions/), enable Developer mode
Click "Load unpacked" and select this directory
Navigate to AFCU banking site to test

# Testing with sample
Open test/sample.html in browser to simulate banking interface
```

## Code Style Guidelines
- Use JavaScript strict mode ('use strict')
- 4-space indentation
- camelCase for variable and function names
- Use arrow functions for callbacks
- Use const/let (avoid var)
- Prefix private functions with underscore
- Clean logic with early returns
- Organize related functionality into discrete functions
- Replace inline styles with Object.assign when possible
- Use descriptive variable names
- Use optional chaining and nullish coalescing for safe property access

## Error Handling
- Use try/catch for async operations
- Provide user feedback via Prompts.alert() for errors
- Log errors to console with detailed messages
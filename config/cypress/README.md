# Cypress Testing Configuration

This directory contains configuration and test files for Cypress, our end-to-end testing framework.

## Directory Structure

- **e2e/**: End-to-end test files
- **fixtures/**: Test data files
- **support/**: Support files (commands, plugins, etc.)

## Running Tests

Cypress tests can be run using the following npm commands:

```bash
# Open Cypress UI for interactive testing
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run

# Run end-to-end tests
npm run test:e2e
```

## Configuration

The main Cypress configuration file is located at `config/cypress/cypress.config.js`. It contains settings for:

- Base URL for tests
- Browser settings
- Viewport dimensions
- Retry settings
- Screenshot and video behavior
- Custom commands
- Plugin configuration

## Adding New Tests

When adding new tests:

1. Place end-to-end tests in the `e2e/` directory
2. Add test data to the `fixtures/` directory
3. Add shared commands to `support/commands.js`
4. Add plugins to `support/plugins.js`

All tests should follow the project's testing guidelines and naming conventions. 
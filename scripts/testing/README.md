# Testing Scripts

This directory contains scripts for testing various aspects of the application.

## Scripts Overview

- **test-algolia-search.js**: Tests Algolia search integration
- **measure-bundle-size.js**: Measures and reports JavaScript bundle sizes
- **test-api-endpoints.js**: Tests API endpoints for functionality and performance
- **test-transaction-manager.js**: Tests database transaction management
- **test-auth.ts**: TypeScript utility for testing authentication
- **test-discovery.ts**: TypeScript utility for testing discovery services

## Usage

JavaScript scripts can be run directly with Node.js:

```bash
node scripts/testing/[script-name].js
```

For TypeScript scripts, use ts-node:

```bash
npx ts-node scripts/testing/test-auth.ts
```

Or import through the main scripts index:

```javascript
const { testing } = require('../index');
testing.testApiEndpoints();
``` 
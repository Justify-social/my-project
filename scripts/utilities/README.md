# Utility Scripts

This directory contains general utility scripts for various development tasks.

## Scripts Overview

- **algolia-client.js**: Utilities for working with Algolia search
- **copy-doc-files.js**: Copies and processes documentation files
- **create-test-data.js**: Creates test data for development environments
- **seed-campaign.ts**: TypeScript utility for seeding campaign data

## Usage

JavaScript scripts can be run directly with Node.js:

```bash
node scripts/utilities/[script-name].js
```

For TypeScript scripts, use ts-node:

```bash
npx ts-node scripts/utilities/seed-campaign.ts
```

Or import through the main scripts index:

```javascript
const { utilities } = require('../index');
utilities.createTestData();
``` 
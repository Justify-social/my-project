# Database Scripts

This directory contains scripts for database operations, validation, and administration.

## Scripts Overview

- **set-admin.js**: Sets up admin privileges for a user
- **check-db.js**: Validates database connection and schema
- **validate-database.ts**: TypeScript utility for database validation
- **test-database-operations.js**: Tests various database operations

## Usage

JavaScript scripts can be run directly with Node.js:

```bash
node scripts/database/[script-name].js
```

For TypeScript scripts, use ts-node:

```bash
npx ts-node scripts/database/validate-database.ts
```

Or import through the main scripts index:

```javascript
const { database } = require('../index');
database.setAdmin();
``` 
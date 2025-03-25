# Script Organization

This directory contains various scripts organized by functionality to help with development, testing, and maintenance of the application.

## Directory Structure

- **icon-management/**: Scripts for icon system management, validation, and fixes
- **database/**: Database-related scripts for seeding, validation, and admin operations
- **campaign/**: Campaign-related scripts for indexing, testing, and creation
- **testing/**: Scripts for testing various parts of the application
- **validation/**: Code validation, linting, and code quality scripts
- **utilities/**: Utility scripts for various development tasks
- **analytics/**: Analytics-related scripts

## Running Scripts

Most scripts can be run using Node.js:

```bash
node scripts/[directory]/[script-name].js
```

TypeScript scripts may require compilation or can be run with ts-node:

```bash
npx ts-node scripts/[directory]/[script-name].ts
```

## Contributing

When adding new scripts:
1. Place them in the appropriate directory based on functionality
2. Add proper documentation within the script explaining its purpose and usage
3. Update this README if you're adding a new category of scripts 
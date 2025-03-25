# Scripts Have Moved

**IMPORTANT**: The scripts that were in this directory have been moved to a new organized structure in the project root.

Please use the following directories instead:

- **Linter & Validation Scripts**: `/scripts/validation/`
- **Database Scripts**: `/scripts/database/`
- **Campaign Scripts**: `/scripts/campaign/`
- **Testing Scripts**: `/scripts/testing/`
- **Icon Management Scripts**: `/scripts/icon-management/`
- **Utility Scripts**: `/scripts/utilities/`

Each directory contains a README.md with details about the scripts it contains.

For a complete overview of available scripts, see `/scripts/README.md`.

## Script Index

For programmatic usage, there is a centralized index.js file at `/scripts/index.js` that exports all scripts by category.

```javascript
// Import the entire scripts collection
const scripts = require('./scripts');

// Use a specific script category
const { validation } = require('./scripts');

// Use a specific script
const findAnyTypes = require('./scripts').validation.findAnyTypes;
```

# Linter Fix Scripts

This directory contains utility scripts to help identify and fix common linter issues in the codebase.

## Available Scripts

### 1. `fix-linter-issues.js`

A general-purpose script that can automatically fix several common linter issues.

```bash
# Run with default options (fix all issues in src/)
node src/scripts/fix-linter-issues.js

# Run in dry-run mode (show what would be fixed without making changes)
node src/scripts/fix-linter-issues.js --dry-run

# Fix only specific types of issues
node src/scripts/fix-linter-issues.js --fix-type=unused  # Fix unused imports and variables
node src/scripts/fix-linter-issues.js --fix-type=imports  # Fix require() style imports
node src/scripts/fix-linter-issues.js --fix-type=display-names  # Fix missing display names
node src/scripts/fix-linter-issues.js --fix-type=entities  # Fix unescaped entities in JSX

# Generate a report of linter issues
node src/scripts/fix-linter-issues.js --fix-type=report

# Target a specific directory or file
node src/scripts/fix-linter-issues.js --path=src/components/
```

### 2. `fix-any-types.js`

A specialized script to help identify and fix `any` type usage in TypeScript files.

```bash
# Generate a report of 'any' type usage
node src/scripts/fix-any-types.js

# Run in interactive fix mode
node src/scripts/fix-any-types.js --fix

# Focus on a specific file
node src/scripts/fix-any-types.js --file=src/types/prisma-extensions.ts

# Target a specific directory
node src/scripts/fix-any-types.js --path=src/lib/
```

### 3. `fix-img-tags.js`

A specialized script to help replace HTML `<img>` tags with Next.js `<Image>` components.

```bash
# Generate a report of <img> tag usage
node src/scripts/fix-img-tags.js

# Run in interactive fix mode
node src/scripts/fix-img-tags.js --fix

# Focus on a specific file
node src/scripts/fix-img-tags.js --file=src/components/AssetPreview/index.tsx

# Target a specific directory
node src/scripts/fix-img-tags.js --path=src/components/
```

### 4. `find-any-types.js`

A simple script that uses grep to find `any` type usage in TypeScript files and generate a report.

```bash
# Run with default options (scan src/)
node src/scripts/find-any-types.js

# Scan a specific directory
node src/scripts/find-any-types.js src/lib/
```

### 5. `find-img-tags.js`

A simple script that uses grep to find `<img>` tag usage in React components and generate a report.

```bash
# Run with default options (scan src/)
node src/scripts/find-img-tags.js

# Scan a specific directory
node src/scripts/find-img-tags.js src/components/
```

### 6. `find-hook-issues.js`

A script that analyzes React Hook dependency arrays to find potentially missing dependencies.

```bash
# Run with default options (scan src/)
node src/scripts/find-hook-issues.js

# Scan a specific directory
node src/scripts/find-hook-issues.js src/components/
```

## Best Practices

1. **Always review changes**: While these scripts can automate many fixes, always review the changes they make to ensure they don't introduce new issues.

2. **Run tests after fixes**: After applying fixes, run tests to ensure the changes don't break existing functionality.

3. **Commit changes in small batches**: When fixing linter issues, commit changes in small, focused batches to make code review easier.

4. **Start with automatic fixes**: Begin with the automatic fixes provided by these scripts, then address more complex issues manually.

5. **Update types carefully**: When replacing `any` types, choose the most specific type that accurately represents the data structure.

## Adding New Scripts

If you need to add a new script to fix other types of linter issues:

1. Create a new script file in this directory
2. Make it executable with `chmod +x src/scripts/your-script.js`
3. Update this README with documentation for your script
4. Add your script to the PROGRESS.md file in the project root 

# Campaign Wizard Scripts

This directory contains utility scripts for the Campaign Wizard application.

## Available Scripts

### API Testing

#### `test-api-endpoints.js`

A comprehensive test script for validating API endpoints. This script tests campaign creation, retrieval, updating, and deletion, as well as error handling and database health.

**Usage**:

```bash
# Run from the project root
npm run test:api

# Or run directly
node src/scripts/test-api-endpoints.js
```

**Environment Variables**:

- `API_BASE_URL`: The base URL for the API (default: `http://localhost:3000/api`)
- `AUTH_TOKEN`: Authentication token for API requests (default: `test-token`)
- `NODE_ENV`: Set to `test` for CI environments

**Example**:

```bash
# Run against a specific API endpoint
API_BASE_URL=https://staging-api.example.com/api AUTH_TOKEN=your-token npm run test:api
```

### Campaign Creation

#### `test-campaign-creation.js`

A script to test the campaign creation process.

**Usage**:

```bash
# Run from the project root
node src/scripts/test-campaign-creation.js
```

### Database Operations

#### `test-database-operations.js`

A script to test database operations such as transactions, error handling, and batch operations.

**Usage**:

```bash
# Run from the project root
node src/scripts/test-database-operations.js
```

## Adding New Scripts

When adding new scripts to this directory, please follow these guidelines:

1. Use descriptive filenames that indicate the script's purpose
2. Include a comment header at the top of the file explaining what the script does
3. Add the script to this README with usage instructions
4. If the script is run frequently, add an npm script to package.json

Example script header:

```javascript
/**
 * Script Name: example-script.js
 * 
 * Description: This script does something useful for the Campaign Wizard application.
 * 
 * Usage: node src/scripts/example-script.js [arguments]
 * 
 * Arguments:
 *   --arg1 - Description of argument 1
 *   --arg2 - Description of argument 2
 * 
 * Environment Variables:
 *   ENV_VAR1 - Description of environment variable 1
 *   ENV_VAR2 - Description of environment variable 2
 */
```

## Best Practices

1. **Error Handling**: Include proper error handling in all scripts
2. **Logging**: Use console.log with colorful output for better readability
3. **Configuration**: Use environment variables for configuration
4. **Exit Codes**: Use appropriate exit codes (0 for success, non-zero for failure)
5. **Cleanup**: Clean up any resources created by the script
6. **Documentation**: Document the script's purpose, usage, and any special considerations 
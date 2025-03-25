# Validation Scripts

This directory contains scripts for code validation, linting, and quality assurance.

## Scripts Overview

- **fix-typescript-errors.js**: Fixes common TypeScript errors
- **find-any-types.js**: Locates and reports any TypeScript `any` types
- **find-hook-issues.js**: Identifies React hook implementation issues
- **find-img-tags.js**: Finds improper use of img tags that should use Next.js Image
- **fix-any-types.js**: Replaces `any` types with proper type definitions
- **fix-img-tags.js**: Fixes img tags to use Next.js Image component
- **fix-linter-issues.js**: Resolves common linter warnings and errors
- **schema-audit.js**: Audits database schema for best practices
- **verify-icon-fix.js**: Verifies icon fixes were properly applied
- **update-icon-imports.js**: Updates icon imports to the new system
- **verify-font-awesome-fix.js**: Validates FontAwesome implementation fixes
- **validate-build.js**: Validates the build process and output

## Usage

JavaScript scripts can be run directly with Node.js:

```bash
node scripts/validation/[script-name].js
```

Or import through the main scripts index:

```javascript
const { validation } = require('../index');
validation.findAnyTypes();
``` 
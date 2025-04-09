# Scripts Reference Guide

This guide provides an overview of the scripts available in our codebase, organised by category.

*Last updated: 2025-03-27*

## Quick Links to Script Categories

- [Build Scripts](#build-scripts)
- [Cleanup Scripts](#cleanup-scripts)
- [Documentation Scripts](#documentation-scripts)
- [Icon Management Scripts](#icon-management-scripts)
- [Linting Scripts](#linting-scripts)
- [Testing Scripts](#testing-scripts)
- [Utility Scripts](#utility-scripts)

## How to Run Scripts

Most scripts can be run using Node.js:

```bash
node scripts/consolidated/category/script-name.js [options]
```

Many scripts also have npm shortcuts defined in `package.json`, for example:

```bash
npm run lint
npm run test
npm run build
```

## Build Scripts

Scripts related to building, bundling and deployment.

| Script Name | Description | Location |
|-------------|-------------|----------|
| `build.js` | Main application build script | `scripts/consolidated/build/build.js` |
| `bundle-analyzer.js` | Analyses bundle size | `scripts/consolidated/build/bundle-analyzer.js` |
| `deploy.js` | Deployment automation | `scripts/consolidated/build/deploy.js` |

## Cleanup Scripts

Scripts for codebase maintenance and cleanup.

| Script Name | Description | Location |
|-------------|-------------|----------|
| `consolidate-scripts.js` | Identifies and consolidates duplicate scripts | `scripts/consolidated/cleanup/consolidate-scripts.js` |
| `find-backups.js` | Locates backup files | `scripts/consolidated/cleanup/find-backups.js` |
| `remove-backups.js` | Safely removes identified backup files | `scripts/consolidated/cleanup/remove-backups.js` |
| `update-references.js` | Updates deprecated component references | `scripts/consolidated/cleanup/update-references.js` |

## Documentation Scripts

Scripts for generating and managing documentation.

| Script Name | Description | Location |
|-------------|-------------|----------|
| `generate-scripts-docs.js` | Generates script documentation | `scripts/consolidated/documentation/generate-scripts-docs.js` |
| `copy-doc-files.js` | Copies documentation files | `scripts/consolidated/documentation/copy-doc-files.js` |
| `update-progress.js` | Updates progress reports | `scripts/consolidated/documentation/update-progress.js` |

## Icon Management Scripts

Scripts for managing the icon system.

| Script Name | Description | Location |
|-------------|-------------|----------|
| `audit-icons.js` | Audits icon usage | `scripts/consolidated/icons/audit-icons.js` |
| `backup-icon-files.js` | Creates backups of icon files | `scripts/consolidated/icons/backup-icon-files.js` |
| `download-icons.js` | Downloads icons from source | `scripts/consolidated/icons/download-icons.js` |
| `fix-icon-issues.js` | Fixes common icon issues | `scripts/consolidated/icons/fix-icon-issues.js` |

## Linting Scripts

Scripts for code quality and linting.

| Script Name | Description | Location |
|-------------|-------------|----------|
| `eslint-fix.js` | Automatically fixes ESLint issues | `scripts/consolidated/linting/eslint-fix.js` |
| `find-any-types.js` | Locates TypeScript 'any' usages | `scripts/consolidated/linting/find-any-types.js` |
| `find-hook-issues.js` | Identifies React hook issues | `scripts/consolidated/linting/find-hook-issues.js` |
| `fix-any-types.js` | Helps fix TypeScript 'any' types | `scripts/consolidated/linting/fix-any-types.js` |

## Testing Scripts

Scripts for testing and validation.

| Script Name | Description | Location |
|-------------|-------------|----------|
| `run-all-tests.js` | Runs the complete test suite | `scripts/consolidated/testing/run-all-tests.js` |
| `integration-tests.js` | Runs integration tests | `scripts/consolidated/testing/integration-tests.js` |
| `component-tests.js` | Runs component tests | `scripts/consolidated/testing/component-tests.js` |
| `create-test-data.js` | Generates test data | `scripts/consolidated/testing/create-test-data.js` |

## Utility Scripts

General utility scripts.

| Script Name | Description | Location |
|-------------|-------------|----------|
| `database-cleanup.js` | Cleans up database records | `scripts/consolidated/utils/database-cleanup.js` |
| `set-admin.js` | Sets admin privileges | `scripts/consolidated/utils/set-admin.js` |
| `migration-helper.js` | Assists with data migrations | `scripts/consolidated/utils/migration-helper.js` |

## For More Details

For a complete listing of all scripts and detailed documentation, please run:

```bash
npm run docs:scripts
```

This will generate a comprehensive document with all script details.


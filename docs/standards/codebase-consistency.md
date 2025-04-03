# Codebase Consistency Guidelines

## Overview

This document outlines our standards for maintaining a clean, consistent, and well-organized codebase. It addresses issues we've resolved through our cleanup efforts and establishes guidelines to prevent similar issues in the future.

## Resolved Issues

### 1. Backup Files Removed

We've removed all `.bak` files from the codebase, which were creating clutter and potential confusion. These backup files were likely created during refactoring or development and were never cleaned up.

### 2. Consolidated Icon Utilities

We've consolidated duplicated icon utility files:
- Removed `src/lib/icon-utils.ts` and migrated all functionality to `src/components/ui/atoms/icon/IconUtils.ts`
- Updated all imports to reference the consolidated utility file
- Ensured type consistency across icon-related utilities

### 3. Standardized Test Files

We've addressed inconsistencies in test file structure:
- Fixed incorrectly named test directories (using proper `__tests__` naming)
- Ensured test files use the standard `.test.tsx` extension
- Created documentation for test file organization

### 4. Removed Unnecessary Exports

We've cleaned up barrel files to remove unnecessary or outdated exports:
- Removed `export * from './examples'` from various component index files
- Ensured barrel files only export what's necessary

## Guidelines for Maintaining Consistency

### File Naming Conventions

1. **Component Files**: Use PascalCase for component files (e.g., `Button.tsx`, `IconUtils.ts`)
2. **Utility Files**: Use kebab-case for utility files (e.g., `file-utils.ts`, `string-helpers.ts`)
3. **Test Files**: Use `[filename].test.tsx` for component tests and `[filename].test.ts` for non-component tests
4. **Index Files**: Use `index.ts` for barrel exports, not `index.tsx` unless the file itself contains a component
5. **No Duplicate Names**: Avoid having files with the same name but different casing (e.g., `utils.ts` and `Utils.ts`)

### Directory Structure

1. **Tests**: Place tests in a `__tests__` directory adjacent to the files being tested
2. **Examples**: Place component examples in an `examples` directory adjacent to the component
3. **Components**: Follow the Atomic Design pattern with atoms, molecules, and organisms
4. **Utilities**: Place shared utilities in the appropriate directory based on their scope

### File Management

1. **No Backup Files**: Never commit backup files (.bak, .old, etc.) to the repository
2. **Clean Up Temporary Files**: Delete temporary files after they're no longer needed
3. **Use Git**: Rely on Git for versioning rather than keeping backup copies
4. **Consolidate Duplicates**: If you find duplicate functionality, consolidate it

### Import Standards

1. **Use Path Aliases**: Use the `@/` prefix for imports where appropriate (e.g., `@/components/ui/button`)
2. **Consistent Naming**: Use consistent names for imports across the codebase
3. **Barrel Exports**: Use barrel files (`index.ts`) to simplify imports
4. **No Circular Dependencies**: Avoid circular dependencies between modules

## Maintenance Scripts

We've created several maintenance scripts to help enforce these guidelines:

- `scripts/cleanup-codebase.sh`: Removes backup files and identifies inconsistencies
- `scripts/update-icon-imports.sh`: Updates imports to reference the consolidated icon utilities
- `scripts/standardize-tests.sh`: Identifies test files that don't follow our standards

Run these scripts periodically to ensure codebase consistency.

## Conclusion

Following these guidelines will help us maintain a clean, consistent codebase that's easier to navigate, understand, and extend. It will reduce confusion, prevent errors, and improve overall developer productivity. 
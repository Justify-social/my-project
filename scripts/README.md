# Project Scripts - Comprehensive Toolkit

This directory contains a consolidated set of utilities and scripts for managing various aspects of the project. The scripts have been intentionally organized into a streamlined, logical structure to minimize duplication and maximize power and flexibility.

## Master Toolkit

The centerpiece of our script organization is the `master-toolkit.js` script, which provides a unified interface to all script functionality across categories. This master script coordinates the execution of specialized scripts in each category, presenting a coherent and consistent user experience.

### Usage

```bash
node scripts/master-toolkit.js <category> <command> [options]
```

### Available Categories

- **components** - UI component management tools
- **linting** - Code quality and linting tools
- **icons** - Icon management tools
- **docs** - Documentation tools
- **cleanup** - Cleanup utilities
- **utils** - Utility tools

For detailed help on each category:

```bash
node scripts/master-toolkit.js <category> help
```

## Component Management

The component management tools are now consolidated into a single powerful script (`master-component-manager.sh`) that can:

- Find duplicate components
- Consolidate components into their canonical directories
- Remove duplicate component directories
- Clean up component structure and fix imports
- Run a full component management cycle

```bash
# Example: Find duplicate components
node scripts/master-toolkit.js components find

# Example: Consolidate components 
node scripts/master-toolkit.js components consolidate

# Example: Run full cycle
node scripts/master-toolkit.js components full-cycle
```

## Linting and Code Quality

The linting tools provide comprehensive code quality management:

- Fix linting issues automatically
- Fix explicit 'any' types
- Find common linting issues
- Generate lint fix execution plans
- Execute bulk lint fixes

```bash
# Example: Fix linting issues in a specific file
node scripts/master-toolkit.js linting fix --file src/components/SomeComponent.tsx

# Example: Generate a lint fix plan
node scripts/master-toolkit.js linting plan
```

## Icon Management

Icon management tools provide a complete workflow for managing icons:

- Audit icons for issues
- Download and update icons
- Verify icon structure
- Update icon imports
- Fix common icon issues
- Generate icon data

```bash
# Example: Audit icons
node scripts/master-toolkit.js icons audit

# Example: Update icon imports
node scripts/master-toolkit.js icons update-imports
```

## Documentation

Documentation tools help maintain project documentation:

- Update documentation
- Generate script documentation
- Clean up documentation files

```bash
# Example: Generate script documentation
node scripts/master-toolkit.js docs generate-scripts
```

## Cleanup Utilities

Cleanup tools help maintain a clean codebase:

- Update import paths
- Find and remove backup files
- Clean up deprecated files

```bash
# Example: Update import paths
node scripts/master-toolkit.js cleanup import-paths

# Example: Find backup files
node scripts/master-toolkit.js cleanup find-backups
```

## Utility Tools

General utility functions:

- Verify no backup files exist
- Generate final verification reports

```bash
# Example: Generate verification report
node scripts/master-toolkit.js utils final-report
```

## Directory Structure

The script directory is organized by function:

- `/scripts/components/` - UI component management
- `/scripts/linting/` - Linting and code quality
- `/scripts/icons/` - Icon management
- `/scripts/docs/` - Documentation
- `/scripts/cleanup/` - Cleanup utilities
- `/scripts/utils/` - General utilities

Each specialized subdirectory contains scripts focused on a specific domain of functionality, while the master toolkit provides a unified interface to all functionality.

## Design Philosophy

This script architecture follows several key principles:

1. **Centralized Control**: The master toolkit provides a single entry point
2. **Specialized Execution**: Domain-specific scripts handle specialized logic
3. **Minimal Duplication**: Common functionality is consolidated
4. **Progressive Enhancement**: Simple operations are easy, complex operations are possible
5. **Consistent Interface**: Command structure and options follow consistent patterns

# Consolidated Scripts

This directory contains scripts that have been consolidated as part of the codebase unification project.

## Directory Structure

- `icons/`: Scripts related to icon management, validation, and migration
- `testing/`: Scripts for testing, validation, and verification
- `linting/`: Scripts for code quality and linting
- `documentation/`: Scripts for generating and managing documentation
- `build/`: Scripts related to building, bundling, and deployment
- `utils/`: Utility scripts that support other functionality

## Consolidation Process

The consolidation was performed using the `consolidate-scripts.js` tool, which:
1. Analyzed 180 JavaScript scripts across the codebase
2. Identified 57 exact duplicates, which were removed
3. Found 65 scripts with identical functionality but different locations
4. Categorized scripts by their primary function

For the complete analysis and details, see `scripts-consolidation-report.md`.

## Usage

When using these scripts, be sure to:
1. Check the script header for documentation
2. Use relative imports for any dependencies
3. Add any new scripts to the appropriate category directory 
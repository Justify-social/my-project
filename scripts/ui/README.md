# UI Component Scripts

This directory contains scripts for managing UI Components with the Single Source of Truth (SSOT) pattern.

## SSOT Validation Scripts

- **validate-ssot.sh**: Validates compliance with SSOT principles
  - Usage: `bash scripts/ui/validate-ssot.sh`
  - Checks for direct imports, missing exports, and duplicate components

## Import Management Scripts

- **fix-imports.sh**: Automatically fixes non-compliant imports
  - Usage: `bash scripts/ui/fix-imports.sh`
  - Converts direct component imports to use the central index.ts

## Organization Scripts

- **reorganize-examples.sh**: Restructures example files by category
  - Usage: `bash scripts/ui/reorganize-examples.sh`
  - Organizes examples into basics, layouts, data, forms, themes, and patterns

## Cleanup Scripts

- **cleanup-old-directories.sh**: Removes old UI component directories

  - Usage: `bash scripts/ui/cleanup-old-directories.sh`
  - Safely removes deprecated component directories

- **tree-shake.sh**: Tree-shakes the scripts/ui directory
  - Usage: `bash scripts/ui/tree-shake.sh`
  - Removes deprecated script files

## Usage

To run these scripts:

```bash
# Basic usage
bash scripts/ui/[script-name].sh

# Or make executable first
chmod +x scripts/ui/[script-name].sh
./scripts/ui/[script-name].sh
```

## SSOT Implementation Guidelines

1. **Define Once**: Each component is defined in a single file
2. **Export Once**: All components are exported from index.ts
3. **Import Once**: All imports use the central index.ts

See full documentation in `docs/ui-components-usage.md`

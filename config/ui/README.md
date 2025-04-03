# UI Component Configuration

This directory contains configuration files and utilities for UI components following the Single Source of Truth (SSOT) principles.

## Component Registry

The UI Component Registry is the central source of truth for all UI components in the application. It is managed by the `component-registry-manager.mjs` script, which provides commands for generating, validating, and cleaning up the component registry.

### Usage

```bash
# Generate the component registry
node config/ui/component-registry-manager.mjs generate

# Validate components against the registry
node config/ui/component-registry-manager.mjs validate

# Clean up deprecated registry files
node config/ui/component-registry-manager.mjs cleanup
```

## Utility Scripts

The `scripts` directory contains utility scripts for managing UI components:

### Fix Duplicate Exports

This script scans UI component files for duplicate default exports and fixes them following a consistent pattern.

```bash
# Dry run (show what would be fixed without making changes)
node config/ui/scripts/fix-duplicate-exports.mjs --dry-run

# Fix duplicate exports
node config/ui/scripts/fix-duplicate-exports.mjs
```

## Configuration Files

- `components.json` - Shadcn UI configuration
- `feature-components.json` - Feature component categorization

## Component Registry Files

The following files are generated and managed by the component registry system:

- `/public/static/component-registry.json` - Runtime component registry
- `/public/static/icon-registry.json` - Icon registry
- `/public/static/icon-url-map.json` - Icon URL map

## Design Principles

1. **Canonical Configurations**: All UI component configurations have a single canonical location
2. **Automated Validation**: Registry validates components automatically
3. **Developer Experience**: Clear error messages and helpful diagnostics
4. **Build-time Verification**: Components are verified during build time
5. **Runtime Availability**: Registry is available at runtime for dynamic components 
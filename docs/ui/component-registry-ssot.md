# UI Component Registry: Single Source of Truth

This document outlines the Single Source of Truth (SSOT) approach for UI component registries in our project.

## Current Component Registry Files

The project currently has multiple component registry files:

1. **Primary Registry Files (CANONICAL)**
   - `/config/ui/components.json` - Shadcn UI component configuration
   - `/config/ui/feature-components.json` - Feature component categorization for organization
   - `/public/static/component-registry.json` - Runtime component registry for discovery system

2. **Deprecated/Backup Files (TO BE REMOVED)**
   - `/public/static/component-registry.backup.json`
   - `/public/ui-icons/icon-registry.json` 
   - `/public/ui-icons/icon-url-map.json`
   - Any duplicate component registry outside canonical paths

## Single Source of Truth Principles

1. **Canonical Locations**
   - Configuration files belong in `/config/ui/`
   - Runtime registries belong in `/public/static/`
   - All other locations are considered deprecated

2. **File Purpose**
   - `components.json`: Shadcn UI configuration (styles, paths, aliases)
   - `feature-components.json`: Feature component categorization
   - `component-registry.json`: Runtime component discovery and metadata

3. **Update Workflow**
   - All updates should be made to canonical files only
   - Scripts should read from and write to canonical locations
   - Deprecated locations should be treated as read-only

## Implementation Details

### Generation Process

The component registry is generated through the following process:

1. **Shadcn Configuration**: `config/ui/components.json` is used by the Shadcn CLI to add components
2. **Feature Categorization**: `config/ui/feature-components.json` helps organize components by domain/feature
3. **Runtime Discovery**: The static registry generator creates `public/static/component-registry.json`

```
┌─────────────────┐     ┌───────────────────────┐     ┌─────────────────────────┐
│ components.json ├────►│ component-registry.js ├────►│ component-registry.json │
└─────────────────┘     └───────────────────────┘     └─────────────────────────┘
        ▲                         ▲
        │                         │
┌───────┴──────────┐    ┌────────┴───────────┐
│ Shadcn CLI       │    │ UI Debug Tools     │
└──────────────────┘    └────────────────────┘
```

### Scripts & Tools

The following scripts manage the component registry:

1. **Static Registry Generator**: `src/app/(admin)/debug-tools/ui-components/registry/generate-static-registry.ts`
   - Builds the runtime component registry during development
   - Outputs to the canonical location: `/public/static/component-registry.json`

2. **Config Migration**: `scripts/config/migrate-config.mjs`
   - Updates references to component registries throughout the codebase
   - Ensures all imports point to canonical locations

3. **Component Path Validator**: `scripts/ui/validate-component-paths.mjs`
   - Validates that component paths in the registry match actual implementations
   - Ensures registry integrity

## Migration Plan

To maintain a clean SSOT approach, the following actions should be taken:

1. **Remove Duplicate Files**
   - Run the tree-shake script to remove deprecated registry files
   - `node scripts/master/master-toolkit.mjs cleanup tree-shake`

2. **Update Import References**
   - Run the config migration script to update all import paths
   - `node scripts/master/master-toolkit.mjs config migrate`

3. **Fix Registry Generation Scripts**
   - Ensure all scripts only write to canonical locations
   - Remove any code that creates files in deprecated locations

## Conclusion

By following this SSOT approach, we ensure that:

1. Component registries are well-organized and easily discoverable
2. Scripts operate on a consistent set of canonical files
3. The codebase remains clean, without duplicated metadata
4. Shadcn UI components are properly integrated into our atomic design system

Any deviation from these principles should be considered a bug and fixed promptly. 
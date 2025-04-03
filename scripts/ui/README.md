# UI Component Scripts

This directory contains scripts related to UI component management, validation, and processing.

## Available Scripts

| Script | Description |
|--------|-------------|
| `validate-component-paths.mjs` | Validates component paths and references in the registry |
| `analyze-component-usage.cjs` | Analyzes the usage of UI components across the codebase |
| `ComponentRegistryPlugin.cjs` | Webpack plugin for component registry management |
| `cleanup-redundant-files.js` | Removes redundant component files |
| `check-naming-consistency.js` | Checks naming consistency across components |
| `cleanup-backups.mjs` | Manages component backup files |
| `backup-ui-components.js` | Creates backups of UI components before modifications |

## File Format Preferences

- `.mjs` files are preferred for ECMAScript modules
- `.cjs` files are used for CommonJS modules (especially for webpack plugins)
- `.js` files are maintained for backward compatibility where needed

## Usage

Scripts should be run from the project root using npm:

```bash
npm run ui:validate-paths     # Runs validate-component-paths.mjs
npm run ui:analyze-usage      # Runs analyze-component-usage.cjs
npm run ui:backup             # Runs backup-ui-components.js
npm run ui:cleanup-backups    # Runs cleanup-backups.mjs
```

## Component Registry

These scripts interact with the component registry located at:
- `config/ui/component-registry.json` - Primary component registry

## Guidelines

- All UI component-related scripts should be placed in this directory
- Always maintain backward compatibility with existing component usage
- Follow the [file organization preferences](/docs/preferences/file-organization.md)
- Document any script changes in relevant documentation
- When refactoring UI scripts, update this README

# Cleanup Scripts

Cleanup and maintenance scripts.

## Available Scripts

- `consolidate-scripts.js`: Scripts Directory Consolidation Tool
- `debug-tools-unification.js`: Debug Tools Unification Script
- `deprecation-warnings.js`: This script modifies re-export files in legacy directories to include console.warn
- `examples-circular-dep-fix.js`: Examples Circular Dependency Fix Script
- `find-backups.js`: No description available
- `import-path-updater.js`: Import Path Updater Script
- `index-campaigns.js`: No description available
- `remove-backups.js`: Backup File Removal Tool
- `stray-utilities-consolidation.js`: Stray Utilities Consolidation Script

## Usage

You can import individual scripts directly:

```js
const scriptName = require('./scripts/consolidated/cleanup/script-name');
```

Or import all scripts in this category using the index:

```js
const { scriptName } = require('./scripts/consolidated/cleanup');
```

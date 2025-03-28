# Db Scripts

Database operations and migration scripts.

## Available Scripts

- `feature-component-migration.js`: Feature Component Migration Script
- `migrate-card.js`: Card Component Migration Script
- `migrate-layouts.js`: Layout Components Migration Script
- `migrate-legacy-feature-components.js`: Legacy Feature Components Migration Script
- `migrate-navigation.js`: Navigation Components Migration Script
- `migrate-standalone-components.js`: Standalone Components Migration Script
- `migrate-table.js`: Table Component Migration Script
- `migrate-tabs.js`: Tabs Component Migration Script
- `migrate-ui-component.js`: UI Component Migration Script
- `set-admin.js`: No description available
- `update-imports-campaigns.js`: Import Path Updater for campaigns components
- `update-imports-settings.js`: Import Path Updater for settings components

## Usage

You can import individual scripts directly:

```js
const scriptName = require('./scripts/consolidated/db/script-name');
```

Or import all scripts in this category using the index:

```js
const { scriptName } = require('./scripts/consolidated/db');
```

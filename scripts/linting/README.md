# Linting Scripts

Code quality, linting, and formatting scripts.

## Available Scripts

- `check-db.js`: No description available
- `component-dependency-analyzer.js`: Component Dependency Analyzer
- `find-any-types.js`: Find 'any' Type Usage
- `find-hook-issues.js`: Find React Hook Dependency Issues
- `find-img-tags.js`: Find <img> Tag Usage
- `fix-any-types.js`: Fix 'any' Type Usage Script
- `fix-img-tags.js`: Fix <img> Tags Script
- `generate-scripts-docs.js`: Script Documentation Generator

## Usage

You can import individual scripts directly:

```js
const scriptName = require('./scripts/consolidated/linting/script-name');
```

Or import all scripts in this category using the index:

```js
const { scriptName } = require('./scripts/consolidated/linting');
```

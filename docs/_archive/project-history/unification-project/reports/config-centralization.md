# Configuration Centralization Manifest

## Overview

This document lists all configuration files that have been centralized into the `config/` directory.

## Migrated Files

- `.eslintrc.js` -> `config/eslint/eslintrc.js`
- `.eslintrc.json` -> `config/eslint/eslintrc.json`
- `.prettierrc.json` -> `config/prettier/prettierrc.json`
- `jest.config.js` -> `config/jest/jest.config.js`
- `jest.setup.js` -> `config/jest/jest.setup.js`
- `next.config.js` -> `config/next/next.config.js`
- `tailwind.config.js` -> `config/tailwind/tailwind.config.js`
- `tailwind.config.ts` -> `config/tailwind/tailwind.config.ts`
- `postcss.config.mjs` -> `config/postcss/postcss.config.mjs`
- `cypress.config.js` -> `config/cypress/cypress.config.js`
- `tsconfig.json` -> `config/typescript/tsconfig.json`

## Skipped Files (Not Found)

## Failed Migrations

## Package.json Updates

The script has updated references in package.json to point to the new configuration locations.

## Usage Instructions

### ESLint

```
npx eslint --config config/eslint/eslintrc.js
```

### Prettier

```
npx prettier --config config/prettier/prettierrc.json
```

### Jest

```
npx jest --config=config/jest/jest.config.js
```

### TypeScript

```
tsc --project config/typescript/tsconfig.json
```

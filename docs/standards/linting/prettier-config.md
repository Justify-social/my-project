# Prettier Configuration

This document details our Prettier setup and configuration used for consistent code formatting across the project.

## Configuration

We use Prettier with the following configuration:

```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true
}
```

## Usage

The following scripts are available for formatting:

- `npm run format`: Run Prettier to format all files
- `npm run format:check`: Check if files are formatted without making changes

## Integration with ESLint

We use `eslint-config-prettier` and `eslint-plugin-prettier` to integrate Prettier with ESLint:

```json
// .eslintrc.json (snippet)
{
  "extends": [
    // ... other extends
    "prettier"
  ],
  "plugins": [
    // ... other plugins
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error"
    // ... other rules
  }
}
```

## Pre-commit Hooks

We use Husky and lint-staged to run Prettier checks before each commit:

```json
// .husky/pre-commit
"lint-staged": {
  "*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write"]
}
```

## Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `.prettierrc.json` | Main configuration | `config/prettier/.prettierrc.json` |
| `.prettierignore` | Files to exclude | `config/prettier/.prettierignore` |

## Related Documentation

- [ESLint Configuration](./eslint-config.md)
- [Code Style Guide](../README.md) 
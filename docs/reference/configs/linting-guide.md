# Linting Configuration Guide

This document provides a comprehensive guide to the linting configuration used in the project.

## Configuration Location

Linting configuration is centralized in the `/config` directory:

- `/config/eslint/` - ESLint configuration
- `/config/prettier/` - Prettier configuration

## ESLint Configuration

The project uses ESLint for JavaScript and TypeScript linting with a hierarchical configuration:

### Base Configuration

The base configuration in `/config/eslint/base.js` includes:

- ECMAScript 2021 support
- React plugin integration
- TypeScript support
- Import sorting rules
- Error prevention rules

### Extended Configurations

Several specialized configurations extend the base:

- `/config/eslint/next.js` - Next.js specific rules
- `/config/eslint/react.js` - React specific rules
- `/config/eslint/typescript.js` - TypeScript specific rules

## Prettier Configuration

Prettier is used for code formatting with configuration in `/config/prettier/index.js`:

```javascript
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'avoid',
};
```

## Integration with IDE

### VS Code

The project includes VS Code settings for optimal linting integration:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### Other IDEs

Configuration for other popular IDEs is available in `/docs/guides/editor-setup.md`.

## Pre-commit Hooks

Husky is configured to run linting checks before commits:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Custom Rules

The project includes custom linting rules for project-specific standards:

- Import organization
- Component naming conventions
- Type definition requirements
- Component structure consistency

## Troubleshooting

### Common Issues

1. **ESLint and Prettier conflicts**: Resolved with `eslint-config-prettier`
2. **Import sorting issues**: Check `.eslintrc.js` import/order rules
3. **Next.js specific rules**: Ensure using `/config/eslint/next.js`

### Disabling Rules

Rules can be disabled in specific cases with proper documentation:

```javascript
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  // Complex effect with known dependency exclusions
}, [dependencies]);
```

## Adding Custom Rules

To add new custom rules:

1. Update the appropriate config file in `/config/eslint/`
2. Document the rule in this guide
3. Add examples of correct/incorrect usage
4. Run linting on the entire codebase to check impact 
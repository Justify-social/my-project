# Linting Overview

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Development Team

## Overview

The Justify.social platform uses a comprehensive linting setup to ensure code quality, consistency, and to catch potential issues early in the development process. This document provides an overview of our linting approach, tools, and configuration.

## Key Components

### ESLint

ESLint is our primary tool for static code analysis. It helps identify problematic patterns in JavaScript and TypeScript code.

**Key Features**:
- TypeScript integration
- React-specific rules
- Accessibility (a11y) checks
- Import order enforcement
- Code style consistency

### TypeScript

TypeScript's type checking serves as an additional layer of linting, ensuring type safety throughout the codebase.

**Key Features**:
- Strict type checking
- Interface enforcement
- Type inference
- Null and undefined checks

### Prettier

Prettier handles code formatting, ensuring consistent style across the codebase.

**Key Features**:
- Automatic formatting
- Integration with ESLint
- Configurable style rules
- Pre-commit hooks

## Configuration

### ESLint Configuration

Our ESLint configuration is defined in `.eslintrc.js` and includes:

```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import'
  ],
  rules: {
    // Custom rules
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': ['error', { 
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
    }]
  }
};
```

### TypeScript Configuration

Our TypeScript configuration in `tsconfig.json` enforces strict type checking:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Prettier Configuration

Our Prettier configuration in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

## Integration with Development Workflow

### Pre-commit Hooks

We use Husky and lint-staged to run linting checks before commits:

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
}
```

### CI/CD Integration

Linting checks are run as part of our CI/CD pipeline:

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
```

## Linting Scripts

The following npm scripts are available for linting:

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\""
  }
}
```

## Improvement Plan

We have an ongoing [Linting Improvement Plan](./improvement-plan.md) to address existing issues and enhance our linting setup over time.

## Related Documentation

- [Linting Improvement Plan](./improvement-plan.md)
- [Development Workflow](../../guides/developer/workflow.md)
- [Code Quality Standards](../../guides/developer/code-quality.md) 
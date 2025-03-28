# Linting Guide

## Overview

This guide documents our linting setup, rules, and processes for maintaining code quality across the project.

## Linting Setup

### ESLint Configuration

We use ESLint with the following configuration:

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "plugins": ["react", "@typescript-eslint", "import", "jsx-a11y"],
  "rules": {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc", "caseInsensitive": true }
    }]
  }
}
```

### Prettier Configuration

We use Prettier for consistent code formatting:

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

## Scripts

The following scripts are available for linting and formatting:

- `npm run lint`: Run ESLint on the codebase
- `npm run lint:fix`: Run ESLint with automatic fixes
- `npm run format`: Run Prettier to format all files

## Common Issues and Solutions

### Unused Variables

**Issue:**
```tsx
const [value, setValue] = useState(''); // 'value' is defined but never used
```

**Solution:**
```tsx
const [, setValue] = useState(''); // Use empty destructuring for unused variables
```

### Missing Dependencies in useEffect

**Issue:**
```tsx
function Component({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData(id).then(setData);
  }, []); // Missing dependency: 'id'
}
```

**Solution:**
```tsx
function Component({ id }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData(id).then(setData);
  }, [id]); // Added 'id' to the dependency array
}
```

### Import Ordering

**Issue:**
```tsx
import { useState } from 'react';
import styles from './styles.module.css';
import axios from 'axios';
import { MyComponent } from '../components';
```

**Solution:**
```tsx
// External dependencies first
import axios from 'axios';
import { useState } from 'react';

// Internal dependencies next
import { MyComponent } from '../components';

// Local imports last
import styles from './styles.module.css';
```

### Accessibility Issues

**Issue:**
```tsx
<div onClick={handleClick}>Click me</div>
```

**Solution:**
```tsx
<button type="button" onClick={handleClick}>Click me</button>
```

## CI/CD Integration

Our CI pipeline includes linting checks that run on every pull request. Pull requests with linting errors will be blocked from merging until the issues are resolved.

## Pre-commit Hooks

We use Husky and lint-staged to run linting and formatting checks before each commit. This ensures that code quality is maintained throughout the development process.

## Best Practices

1. **Fix issues as you go**: Don't accumulate linting errors
2. **Use IDE integrations**: Configure your editor to show linting errors in real-time
3. **Run `npm run lint:fix`** before submitting a PR
4. **Understand the rules**: Don't just fix errors blindly, understand why they exist

## Contact

If you have questions about our linting setup or need help resolving issues, contact the DevOps team.

# Auto-fixable Linting Issues

This document covers the linting issues that can be automatically fixed using our tooling.

## Using Auto-fix

You can automatically fix many linting issues using:

```bash
# Fix all auto-fixable ESLint issues
npm run lint:fix

# Fix formatting issues with Prettier
npm run format
```

## Common Auto-fixable Issues

### Imports Ordering

ESLint with `import` plugin can automatically sort imports:

**Before:**
```typescript
import styles from './styles.module.css';
import { useState } from 'react';
import axios from 'axios';
import { MyComponent } from '../components';
```

**After running `lint:fix`:**
```typescript
import axios from 'axios';
import { useState } from 'react';

import { MyComponent } from '../components';

import styles from './styles.module.css';
```

### Whitespace & Formatting

Prettier can automatically fix:

- Indentation
- Line length
- Trailing commas
- Quotes (single vs double)
- Semicolons
- Spacing around operators

### Missing or Extra Semicolons

**Before:**
```typescript
const name = 'John'
const age = 30;
```

**After running `lint:fix`:**
```typescript
const name = 'John';
const age = 30;
```

### Props Spreading

**Before:**
```tsx
function Component(props) {
  return <div {...props}>Content</div>;
}
```

**After running `lint:fix`:**
```tsx
function Component({ children, ...props }) {
  return <div {...props}>Content</div>;
}
```

## Bulk Fixing Script

For larger codebases, we have a script to batch fix common issues:

```bash
# Run the bulk fixer script
node scripts/consolidated/linting/lint-fixer.js
```

This script will:

1. Fix all import ordering issues
2. Remove unused imports
3. Standardize quotation marks
4. Fix simple spacing issues

## Related Documentation

- [ESLint Configuration](../eslint-config.md)
- [Prettier Configuration](../prettier-config.md)
- [Manual Fix Guidelines](./manual-fixes.md) 
# ESLint Cleanup Guidance

## Overview

This document provides detailed guidance on addressing and fixing the remaining ESLint issues in the codebase to achieve zero errors with Husky pre-commit hooks.

## Current Status

Based on the latest tracking report (March 27, 2025), the codebase has:

- **Error Count**: 340 (down from 633, a 46% reduction)
- **Warning Count**: 1160 (down from 1183)
- **Files with Issues**: 381 of 815 (47%)
- **Total Issues**: 1500

## Priority Issues

### 1. CommonJS `require()` Imports (280 remaining)

These must be converted to ES module imports to comply with `@typescript-eslint/no-require-imports`.

**Fix Strategy**:

1. Continue running the `lint-fixer.js` script on remaining files:

   ```bash
   node scripts/consolidated/linting/lint-fixer.js --file path/to/file.js
   ```

2. For more complex scenarios, manually convert:

   ```javascript
   // From
   const module = require('module');

   // To
   import module from 'module';
   ```

3. For destructured imports:

   ```javascript
   // From
   const { method1, method2 } = require('module');

   // To
   import { method1, method2 } from 'module';
   ```

### 2. Syntax Errors (15 remaining)

These are critical parsing errors that must be fixed manually.

**Fix Strategy**:

1. Identify the specific syntax issue in each file
2. Look for:
   - Missing parentheses
   - Invalid characters
   - Unclosed strings or template literals

### 3. Unsafe Function Types (14 remaining)

Replace generic `Function` type with explicit function signatures.

**Fix Strategy**:

```typescript
// From
const handler: Function = event => {};

// To
const handler = (event: Event): void => {};
```

### 4. Unused Expressions (10 remaining)

Expression statements that don't have side effects.

**Fix Strategy**:

```typescript
// From
someValue;

// To
console.log(someValue);
// or
void someValue;
// or
let _ = someValue;
```

## Implementation Steps

### Phase 1: Critical Error Elimination

1. **Run bulk-fix script**:

   ```bash
   bash scripts/consolidated/linting/bulk-fix.sh
   ```

2. **Check progress with tracking summary**:

   ```bash
   node scripts/consolidated/cleanup/tracking-summary.js
   ```

3. **Manual fixes for complex issues**:
   - Review syntax errors individually
   - Address React Hooks violations
   - Fix function types with proper TypeScript signatures

### Phase 2: Remaining Errors

1. **Address undefined component errors**:

   - Add proper imports for components used in JSX
   - Use the `lint-fixer.js` script with `--file` option

2. **Fix empty object types**:
   - Replace `{}` with appropriate types (`Record<string, unknown>`, `object`, etc.)

### Phase 3: Warnings Cleanup

Once all errors are eliminated, focus on warnings:

1. **Unused variables**: Prefix with underscore or remove
2. **Explicit `any` types**: Replace with proper TypeScript types
3. **Missing dependencies in hooks**: Add all dependencies to useEffect arrays

## Verification Process

After implementing fixes, verify with:

1. **Full ESLint check**:

   ```bash
   npx eslint --config eslint.config.mjs .
   ```

2. **Test pre-commit hooks**:

   ```bash
   git add .
   git commit -m "Test commit with lint fixes"
   ```

3. **Generate updated tracking report**:
   ```bash
   node scripts/consolidated/cleanup/tracking-summary.js --save
   ```

## Common Patterns and Solutions

### React Hook Dependencies

For React hooks dependency warnings:

```typescript
// From
useEffect(() => {
  fetchData(id);
}, []); // Missing dependency warning

// To
useEffect(() => {
  fetchData(id);
}, [id]); // Include all dependencies
```

### No-Img-Element Warnings

For Next.js image optimization:

```tsx
// From
<img src="/image.jpg" alt="Description" />;

// To
import Image from 'next/image';

<Image src="/image.jpg" alt="Description" width={500} height={300} />;
```

## Recommended Tools

1. **lint-fixer.js**: Automates common fixes
2. **tracking-summary.js**: Tracks progress over time
3. **bulk-fix-planner.js**: Generates execution plans for batches of files
4. **bulk-fix.sh**: Executes fixes in sequence

## Conclusion

By systematically addressing these issues in the priority order listed, we can achieve a lint-free codebase that passes all pre-commit checks, ensuring clean uploads to Git. The tools in `scripts/consolidated/linting/` provide powerful automation to facilitate this process.

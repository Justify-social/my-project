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

## Bulk Fix Guide

This guide provides detailed instructions for efficiently applying ESLint fixes in bulk across the codebase. The automated bulk fix process allows for systematic correction of common linting issues while minimizing the risk of breaking changes.

The bulk-fix.sh script in `scripts/consolidated/linting/` automates the process of fixing multiple lint issues across many files.

```bash
bash scripts/consolidated/linting/bulk-fix.sh

bash scripts/consolidated/linting/bulk-fix.sh > fix-log.txt
```

You can manually modify the script to focus on specific sections:

1. Open `bulk-fix.sh` in your editor
2. Comment out sections you want to skip with `#`
3. Save and run the modified script

Before running bulk fixes:

- Commit or stash any unrelated changes
- Create a dedicated branch: `git checkout -b lint-fixes`
- Ensure you're working with the latest code: `git pull origin main`

Apply fixes incrementally to minimize risk:

- Fix one rule type at a time
- Start with critical errors before warnings
- Commit after each successful batch: `git commit -m "Fix: Convert require() imports"`

Always verify changes after applying fixes:

```bash
node scripts/consolidated/cleanup/tracking-summary.js

npm run dev

npm test
```

The bulk fix script processes issues in the following sequence:

1. **CommonJS require() imports**: Converted to ES module imports
2. **Unused variables**: Prefixed with underscore
3. **Undefined JSX components**: Missing imports added
4. **React hooks rule violations**: Fixed when possible
5. **Function types**: Generic `Function` types addressed
6. **Empty object types**: Replaced with appropriate types
7. **Other automatically fixable issues**: Applied with ESLint's --fix

8. **Identify the problematic files**:

   ```bash
   git diff
   ```

9. **Revert specific problematic files**:

   ```bash
   git checkout HEAD -- path/to/problem/file.js
   ```

10. **Manually fix the issues**:

    ```bash
    # Open in editor and fix manually
    code path/to/problem/file.js

    # Apply specific rules only
    npx eslint --config eslint.config.mjs --fix --rule 'specific-rule: error' path/to/problem/file.js
    ```

If module import conversions cause conflicts:

```javascript
// Before: Working code with CommonJS
const fs = require('fs');

// After: Problematic conversion
import fs from 'fs';
// Error: Module not found

// Solution: Use correct import path
import fs from 'node:fs';
// or keep as require() and disable the rule for that line
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
```

If component imports are not found:

```javascript
// Error: Cannot find module 'components/LoadingSpinner'
import LoadingSpinner from 'components/LoadingSpinner';

// Solution: Correct the import path
import LoadingSpinner from 'src/components/ui/LoadingSpinner';
// or import using relative path
import LoadingSpinner from '../../components/ui/LoadingSpinner';
```

If function type conversions cause issues:

```typescript
// Error after conversion
const handler: (event: Event) => void = event => {
  // Function body references properties not in standard Event
};

// Solution: Use more specific event type
const handler: (event: CustomEvent) => void = event => {
  // ...
};
```

You can create targeted fix scripts for specific rule types:

```bash

echo "Fixing CommonJS require() imports..."

FILES=$(npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); \
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-require-imports')).map(f => f.filePath); \
  console.log(files.join(' '))");

for file in $FILES; do
  echo "Fixing $file"
  node scripts/consolidated/linting/lint-fixer.js --file "$file"
done
```

For very large codebases, you can process files in parallel:

```bash

FILES=$(npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); \
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-require-imports')).map(f => f.filePath); \
  console.log(files.join('\n'))");

echo "$FILES" | xargs -P 4 -I{} node scripts/consolidated/linting/lint-fixer.js --file "{}"
```

The bulk fix system provides a powerful way to systematically address ESLint issues across the codebase. By following the practices in this guide, you can efficiently clean up linting errors while minimizing risk to the application's functionality.

## Manual Fix Guide

This guide provides detailed examples and solutions for common ESLint errors that require manual intervention. Reference this document when the automated tools can't fully resolve an issue.

```tsx
// ❌ INCORRECT
function Component() {
  const [isLoading, setIsLoading] = useState(false);

  if (someCondition) {
    // Error: React Hook "useState" cannot be called conditionally
    const [data, setData] = useState([]);
  }

  return <div>{/* ... */}</div>;
}

// ✅ CORRECT
function Component() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(someCondition ? [] : null);

  return <div>{/* ... */}</div>;
}
```

```tsx
// ❌ INCORRECT
function Component() {
  const handleClick = () => {
    // Error: React Hook "useState" cannot be called inside a callback
    const [count, setCount] = useState(0);
  };

  return <button onClick={handleClick}>Click me</button>;
}

// ✅ CORRECT
function Component() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

```tsx
// ❌ INCORRECT
interface ComponentProps {
  onSubmit: Function; // Error: The `Function` type accepts any function-like value
}

// ✅ CORRECT
interface ComponentProps {
  onSubmit: (data: FormData) => void;
}
```

```tsx
// ❌ INCORRECT
function DataTable({ onRowSelect }: { onRowSelect: Function }) {
  // ...
}

// ✅ CORRECT
interface RowData {
  id: string;
  name: string;
}

function DataTable({ onRowSelect }: { onRowSelect: (row: RowData) => void }) {
  // ...
}
```

```tsx
// ❌ INCORRECT
function UserProfile({ user }: { user: {} }) {
  // Error: The `{}` type allows any non-nullish value
  return <div>{user.name}</div>;
}

// ✅ CORRECT - Option 1: Define a proper interface
interface User {
  name: string;
  email: string;
}

function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ✅ CORRECT - Option 2: Use Record type for flexible objects
function UserProfile({ user }: { user: Record<string, unknown> }) {
  return <div>{user.name as string}</div>;
}

// ✅ CORRECT - Option 3: Use unknown with type guards
function UserProfile({ user }: { user: unknown }) {
  // Type guard
  if (user && typeof user === 'object' && 'name' in user) {
    return <div>{user.name as string}</div>;
  }
  return <div>Invalid user</div>;
}
```

```tsx
// ❌ INCORRECT
function Component() {
  useEffect(() => {
    isValid && doSomething(); // Error: Expected an assignment or function call
  }, [isValid]);

  return <div>{/* ... */}</div>;
}

// ✅ CORRECT - Option 1: Use if statement
function Component() {
  useEffect(() => {
    if (isValid) {
      doSomething();
    }
  }, [isValid]);

  return <div>{/* ... */}</div>;
}

// ✅ CORRECT - Option 2: Use the void operator
function Component() {
  useEffect(() => {
    void (isValid && doSomething());
  }, [isValid]);

  return <div>{/* ... */}</div>;
}
```

```tsx
// ❌ INCORRECT
const value = "This has "smart quotes" that cause errors";

// ✅ CORRECT
const value = "This has \"straight quotes\" that work correctly";
```

```tsx
// ❌ INCORRECT
const Component = props => <div>{props.value}</div>;

// ✅ CORRECT
const Component = props => <div>{props.value}</div>;
```

```tsx
// ❌ INCORRECT
// @ts-ignore
const result = someFunction();

// ✅ CORRECT
// @ts-expect-error Type is incompatible
const result = someFunction();
```

```tsx
// ❌ INCORRECT
function Dashboard() {
  return (
    <div>
      <LoadingSpinner /> {/* Error: 'LoadingSpinner' is not defined */}
    </div>
  );
}

// ✅ CORRECT
import LoadingSpinner from 'components/ui/LoadingSpinner';

function Dashboard() {
  return (
    <div>
      <LoadingSpinner />
    </div>
  );
}
```

```tsx
// ❌ INCORRECT
function Navigation() {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a> {/* Error: Do not use <a> for internal links */}
    </nav>
  );
}

// ✅ CORRECT
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
  );
}
```

1. Apply fixes incrementally, commit after each successful batch
2. Prioritize fixing one rule type at a time
3. Always run tests after significant changes
4. For complex files, consider fixing warnings separately from errors

5. Use the React DevTools to examine component re-renders
6. Extract complex logic into useMemo or useCallback hooks
7. Consider using the exhaustive-deps ESLint rule to automatically suggest fixes

8. Identify the source of the circular dependency
9. Consider restructuring your component hierarchy
10. Extract shared logic to utility functions
11. Use React Context for deeply nested prop sharing

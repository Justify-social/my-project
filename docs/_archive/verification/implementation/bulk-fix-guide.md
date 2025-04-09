# Bulk ESLint Fix Guide

## Overview

This guide provides detailed instructions for efficiently applying ESLint fixes in bulk across the codebase. The automated bulk fix process allows for systematic correction of common linting issues while minimizing the risk of breaking changes.

## Using the Bulk Fix Script

The bulk-fix.sh script in `scripts/consolidated/linting/` automates the process of fixing multiple lint issues across many files.

### Basic Usage

```bash
# Run the entire bulk fix script
bash scripts/consolidated/linting/bulk-fix.sh

# Run with output redirection for logging
bash scripts/consolidated/linting/bulk-fix.sh > fix-log.txt
```

### Selective Execution

You can manually modify the script to focus on specific sections:

1. Open `bulk-fix.sh` in your editor
2. Comment out sections you want to skip with `#`
3. Save and run the modified script

## Best Practices for Bulk Fixes

### 1. Prepare Your Environment

Before running bulk fixes:

- Commit or stash any unrelated changes
- Create a dedicated branch: `git checkout -b lint-fixes`
- Ensure you're working with the latest code: `git pull origin main`

### 2. Incremental Approach

Apply fixes incrementally to minimize risk:

- Fix one rule type at a time
- Start with critical errors before warnings
- Commit after each successful batch: `git commit -m "Fix: Convert require() imports"`

### 3. Verification After Fixes

Always verify changes after applying fixes:

```bash
# Check lint status after fixes
node scripts/consolidated/cleanup/tracking-summary.js

# Test the application still runs
npm run dev

# Run tests to ensure nothing broke
npm test
```

## Understanding the Bulk Fix Process

The bulk fix script processes issues in the following sequence:

1. **CommonJS require() imports**: Converted to ES module imports
2. **Unused variables**: Prefixed with underscore
3. **Undefined JSX components**: Missing imports added
4. **React hooks rule violations**: Fixed when possible
5. **Function types**: Generic `Function` types addressed
6. **Empty object types**: Replaced with appropriate types
7. **Other automatically fixable issues**: Applied with ESLint's --fix

## Managing Potential Issues

### If Fixes Break the Build

1. **Identify the problematic files**:
   ```bash
   git diff
   ```

2. **Revert specific problematic files**:
   ```bash
   git checkout HEAD -- path/to/problem/file.js
   ```

3. **Manually fix the issues**:
   ```bash
   # Open in editor and fix manually
   code path/to/problem/file.js
   
   # Apply specific rules only
   npx eslint --config eslint.config.mjs --fix --rule 'specific-rule: error' path/to/problem/file.js
   ```

### Common Challenges

#### 1. Module Import Conflicts

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

#### 2. React Component Import Issues

If component imports are not found:

```javascript
// Error: Cannot find module 'components/LoadingSpinner'
import LoadingSpinner from 'components/LoadingSpinner';

// Solution: Correct the import path
import LoadingSpinner from 'src/components/ui/LoadingSpinner';
// or import using relative path
import LoadingSpinner from '../../components/ui/LoadingSpinner';
```

#### 3. Type Conversion Problems

If function type conversions cause issues:

```typescript
// Error after conversion
const handler: (event: Event) => void = (event) => {
  // Function body references properties not in standard Event
};

// Solution: Use more specific event type
const handler: (event: CustomEvent) => void = (event) => {
  // ...
};
```

## Advanced Usage

### Creating Custom Fix Scripts

You can create targeted fix scripts for specific rule types:

```bash
#!/bin/bash
# Example: fix-imports.sh

# Targeted fix for import issues only
echo "Fixing CommonJS require() imports..."

# Get list of files with require() issues
FILES=$(npx eslint --config eslint.config.mjs --format json . | 
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); \
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-require-imports')).map(f => f.filePath); \
  console.log(files.join(' '))");

# Fix each file
for file in $FILES; do
  echo "Fixing $file"
  node scripts/consolidated/linting/lint-fixer.js --file "$file"
done
```

### Parallel Processing for Large Codebases

For very large codebases, you can process files in parallel:

```bash
#!/bin/bash
# Example: parallel-fix.sh

FILES=$(npx eslint --config eslint.config.mjs --format json . | 
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); \
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-require-imports')).map(f => f.filePath); \
  console.log(files.join('\n'))");

# Process up to 4 files simultaneously
echo "$FILES" | xargs -P 4 -I{} node scripts/consolidated/linting/lint-fixer.js --file "{}"
```

## Conclusion

The bulk fix system provides a powerful way to systematically address ESLint issues across the codebase. By following the practices in this guide, you can efficiently clean up linting errors while minimizing risk to the application's functionality. 
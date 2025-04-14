# Automated ESLint Fixing Strategy

## Overview

This document outlines a systematic, automated approach to fixing ESLint issues across the codebase. By leveraging existing scripts and tools intelligently, we can dramatically reduce the manual effort required to achieve a lint-free codebase.

## Batched Fixing Approach

Rather than attempting to fix all issues at once, a batched approach prioritizes:

1. High-impact errors first
2. Similar issue types in batches
3. Files grouped by feature or module
4. Balance between automation and manual review

## Automated Fixing Scripts

### Core Tools

| Tool                  | Purpose                                 | Command                                                                  |
| --------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `lint-fixer.js`       | Fix common patterns in individual files | `node scripts/consolidated/linting/lint-fixer.js --file path/to/file.js` |
| `bulk-fix.sh`         | Run batch fixes on multiple issues      | `bash scripts/consolidated/linting/bulk-fix.sh`                          |
| ESLint autofix        | Fix simple issues automatically         | `npx eslint --config eslint.config.mjs --fix path/to/file.js`            |
| `tracking-summary.js` | Monitor progress                        | `node scripts/consolidated/cleanup/tracking-summary.js`                  |

## Strategy by Error Type

### 1. CommonJS Require Imports (280 errors)

**Automation Approach**:

```bash
# Option 1: Use bulk-fix.sh (recommended)
bash scripts/consolidated/linting/bulk-fix.sh

# Option 2: Generate a list of files with require() imports
FILES=$(npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-require-imports'))
  .map(f => f.filePath); console.log(files.join('\n'))");

# Process each file
echo "$FILES" | xargs -I{} node scripts/consolidated/linting/lint-fixer.js --file "{}"
```

**Verification**:

```bash
# Count remaining require() errors after fixes
npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const count = data.reduce((acc, f) => acc + f.messages.filter(m => m.ruleId === '@typescript-eslint/no-require-imports').length, 0);
  console.log('Remaining require() errors:', count);"
```

### 2. Unused Variables (465 warnings)

**Automation Approach**:

```bash
# Generate files with unused variables
FILES=$(npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-unused-vars'))
  .map(f => f.filePath); console.log(files.join('\n'))");

# Apply ESLint fix (prefixes with underscore)
echo "$FILES" | xargs -I{} npx eslint --config eslint.config.mjs --fix --rule '@typescript-eslint/no-unused-vars: warn' "{}"
```

### 3. Next.js Image Components (110 warnings)

This requires more manual attention but can be semi-automated:

```bash
# Generate list of files with img elements
FILES=$(npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@next/next/no-img-element'))
  .map(f => f.filePath); console.log(files.join('\n'))");

# Create a script to process these files
cat > fix-images.js << 'EOL'
const fs = require('fs');

// Read file paths from stdin
const files = process.argv.slice(2);

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Check if file already imports Image
  const hasImageImport = /import\s+Image\s+from\s+['"]next\/image['"]/g.test(content);

  // Add import if needed
  let newContent = content;
  if (!hasImageImport && content.includes('<img')) {
    // Add import at top, being careful with other imports
    if (content.includes('import ')) {
      const lastImportIndex = content.lastIndexOf('import ');
      const endOfImportLine = content.indexOf('\n', lastImportIndex);
      if (endOfImportLine !== -1) {
        newContent = content.slice(0, endOfImportLine + 1) +
          "import Image from 'next/image';\n" +
          content.slice(endOfImportIndex + 1);
      }
    } else {
      newContent = "import Image from 'next/image';\n\n" + content;
    }

    console.log(`Added Image import to ${file}`);
  }

  // Write back to file
  fs.writeFileSync(file, newContent, 'utf8');

  console.log(`Processed ${file}`);
});
EOL

# Run the image fix script (creates annotations only)
node fix-images.js $FILES
```

After running this script, you'll need to manually replace `<img>` tags with `<Image>` components.

## Batched Execution Plan

### Batch 1: CommonJS Imports & Function Types

```bash
# Step 1: Run bulk-fix script first
bash scripts/consolidated/linting/bulk-fix.sh

# Step 2: Fix function types in prisma-extensions.ts
node scripts/consolidated/linting/lint-fixer.js --file src/types/prisma-extensions.ts

# Step 3: Verify progress
node scripts/consolidated/cleanup/tracking-summary.js
```

### Batch 2: Syntax Errors & React Hook Rules

```bash
# Step 1: Fix SvgIcon.tsx conditionally called hooks
node scripts/consolidated/linting/lint-fixer.js --file src/components/ui/icons/core/SvgIcon.tsx

# Step 2: Fix syntax errors in problematic files
npx eslint --config eslint.config.mjs --fix src/components/ui/examples.tsx
npx eslint --config eslint.config.mjs --fix src/components/ui/examples/ColorPaletteLogosExamples.tsx
npx eslint --config eslint.config.mjs --fix src/types/routes.ts

# Step 3: Verify progress
node scripts/consolidated/cleanup/tracking-summary.js
```

### Batch 3: Unused Variables & Other Auto-fixable Warnings

```bash
# Step 1: Fix unused variables
npx eslint --config eslint.config.mjs --fix --rule '@typescript-eslint/no-unused-vars: warn' .

# Step 2: Fix prefer-const and other simple warnings
npx eslint --config eslint.config.mjs --fix --rule 'prefer-const: warn' .
npx eslint --config eslint.config.mjs --fix --rule 'import/no-anonymous-default-export: warn' .

# Step 3: Verify progress
node scripts/consolidated/cleanup/tracking-summary.js
```

## Parallel Processing for Large Codebases

For faster execution on larger codebases, use parallel processing:

```bash
# Process up to 4 files simultaneously
echo "$FILES" | xargs -P 4 -I{} node scripts/consolidated/linting/lint-fixer.js --file "{}"
```

## Safety Measures

1. **Always work in a dedicated branch**:

   ```bash
   git checkout -b lint-fixes
   ```

2. **Commit after each successful batch**:

   ```bash
   git add .
   git commit -m "Fix: CommonJS require imports (batch 1/3)"
   ```

3. **Periodic testing**:

   ```bash
   npm test
   ```

4. **Revert problematic files**:
   ```bash
   git checkout HEAD -- path/to/problem/file.js
   ```

## Monitoring & Reporting

1. **Regular progress tracking**:

   ```bash
   node scripts/consolidated/cleanup/tracking-summary.js
   ```

2. **Save baselines after major milestones**:

   ```bash
   node scripts/consolidated/cleanup/tracking-summary.js --save
   ```

3. **Create a progress report**:
   ```bash
   # Generate a simple progress report
   npx eslint --config eslint.config.mjs --format json . |
     node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
     const errorCount = data.reduce((acc, f) => acc + f.errorCount, 0);
     const warningCount = data.reduce((acc, f) => acc + f.warningCount, 0);
     console.log('Current Status:');
     console.log('- Errors:', errorCount);
     console.log('- Warnings:', warningCount);
     console.log('- Total:', errorCount + warningCount);"
   ```

## Conclusion

This automated approach allows us to efficiently address the vast majority of ESLint issues in the codebase. By applying fixes in batches and utilizing automated scripts, we can achieve a clean codebase with minimal manual intervention. Regular verification and tracking ensure that progress is measurable and sustainable.

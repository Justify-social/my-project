# Linting Strategy

This document outlines the comprehensive linting strategy implemented for this project to ensure consistent code quality and maintainability.

## Goals

Our linting strategy aims to achieve the following goals:

1. **Type Safety**: Eliminate all `any` types in TypeScript code
2. **Clean Code**: Remove unused variables and imports
3. **React Best Practices**: Ensure proper hook dependencies and patterns
4. **Consistency**: Maintain uniform code style across the codebase
5. **Automation**: Integrate linting checks with Git workflow to prevent issues

## Tools & Infrastructure

### Core Tools

1. **ESLint**: Primary linting tool with TypeScript and React plugin support
2. **Husky**: Git hooks manager for pre-commit and pre-push validation
3. **lint-staged**: Runs linters on staged Git files

### Custom Scripts

We've developed specialized scripts to streamline the linting process:

1. **codebase-lint-cleaner.mjs**: Comprehensive scan and fix tool
2. **fix-specific-rule.js**: Focuses on fixing one ESLint rule at a time
3. **fix-unused-vars.js**: Automatically prefixes unused variables
4. **update-eslint-config.js**: Helps migrate to modern ESLint configuration

For detailed usage instructions, see [Linting Tools README](../../scripts/linting-tools/README.md).

## Implementation Approach

Our linting strategy follows a layered approach:

### 1. Preventative Measures

- **Pre-commit Hooks**: Prevents committing code with linting issues
- **Pre-push Hooks**: Additional verification before pushing to remote
- **IDE Integration**: ESLint configured for real-time linting in editors

### 2. Batch Fixing

For existing issues or periodic maintenance:

- **Category-Specific Fixes**: Tools to address specific categories (e.g., `any` types)
- **Directory-Focused Approach**: Ability to target specific directories for focused fixes
- **Reporting**: Generates detailed reports to track progress

### 3. Verification

- **Lint Status Reports**: Regular reports in `docs/verification/lint-fix-progress/`
- **Audit Files**: Documentation of linting progress and strategies

## Prioritized Rules

While all ESLint rules are important, we prioritize fixing issues in this order:

1. **Parsing Errors**: Critical issues that prevent proper code analysis
2. **Type Safety**: Especially eliminating `any` types
3. **Unused Code**: Variables, imports, and unreachable code
4. **React Hooks**: Dependency array issues
5. **Accessibility & Performance**: Image optimization, a11y concerns

## Developer Workflow

Developers should follow this workflow to maintain code quality:

1. **Setup**: Ensure Husky is installed by running `npm install`
2. **Day-to-Day**: Let pre-commit hooks handle automatic fixes
3. **New Features**: Use IDE linting to fix issues as you code
4. **Periodic Cleanup**:
   - Run `node scripts/linting-tools/codebase-lint-cleaner.mjs` monthly
   - Check status reports and fix any systematic issues

## ESLint Configuration

Our ESLint configuration:

- Located in `eslint.config.mjs` (modern format)
- Includes TypeScript and React specific rules
- Has customized rules based on project needs

Key extensions:

- `@typescript-eslint` for TypeScript-specific rules
- `eslint-plugin-react` for React best practices
- `eslint-plugin-react-hooks` for React Hooks rules
- `@next/eslint-plugin-next` for Next.js specific optimizations

## Customization

The linting strategy can be customized:

- Adjust rule severity in `eslint.config.mjs`
- Modify `.lintstagedrc` for different pre-commit behavior
- Add directories to ignore patterns for specific scenarios

## Monitoring & Improvement

To continuously improve code quality:

1. **Regular Reviews**: Check lint status reports monthly
2. **Update Tools**: Keep ESLint and plugins updated
3. **Adapt Rules**: Refine rules based on evolving project needs
4. **Team Training**: Ensure all developers understand the linting strategy

## Conclusion

This comprehensive linting strategy provides both automated enforcement and specialized tools for maintaining high code quality. By following this approach, we ensure:

- Consistent code style across the codebase
- Reduced bugs through static analysis
- Improved maintainability through cleaner code
- Streamlined development with automated fixes
- Better onboarding through enforced standards

The combination of preventative measures, targeted fixing tools, and ongoing verification creates a sustainable approach to code quality that scales with the project.

## Current Lint Priorities

- **Generated**: 3/27/2025, 1:52:03 PM
- **Total Files Analyzed**: 815
- **Files with Issues**: 377 (46%)
- **Total Errors**: 323
- **Total Warnings**: 1167
- **Unique Rules Violated**: 18

These errors must be fixed before commits can be made successfully:

- **Description**: A `require()` style import is forbidden.
- **Occurrences**: 282 across 282 files
- **Fixable by Tool**: No

**Examples**:

- `.eslintrc.js` (line 3): A `require()` style import is forbidden.
- `config/cypress/cypress.config.js` (line 3): A `require()` style import is forbidden.
- `config/eslint/eslintrc.js` (line 3): A `require()` style import is forbidden.

- **Description**: Expected an assignment or function call and instead saw an expression.
- **Occurrences**: 8 across 8 files
- **Fixable by Tool**: No

**Examples**:

- `cypress/e2e/layout/branding.cy.js` (line 34): Expected an assignment or function call and instead saw an expression.
- `cypress/e2e/layout/no-hydration-error-cy.js` (line 22): Expected an assignment or function call and instead saw an expression.
- `src/app/(admin)/admin/page.tsx` (line 5): Expected an assignment or function call and instead saw an expression.

- **Description**: 'LoadingSpinner' is not defined.
- **Occurrences**: 6 across 6 files
- **Fixable by Tool**: No

**Examples**:

- `src/app/(campaigns)/campaigns/ServerCampaigns.tsx` (line 13): 'LoadingSpinner' is not defined.
- `src/app/(campaigns)/influencer-marketplace/[id]/page.tsx` (line 99): 'LoadingSpinner' is not defined.
- `src/app/(campaigns)/influencer-marketplace/campaigns/page.tsx` (line 186): 'LoadingSpinner' is not defined.

- **Description**: The `{}` ("empty object") type allows any non-nullish value, including literals like `0` and `""`.
- If that's what you want, disable this lint rule with an inline comment or configure the 'allowObjectTypes' rule option.
- If you want a type meaning "any object", you probably want `object` instead.
- If you want a type meaning "any value", you probably want `unknown` instead.
- **Occurrences**: 4 across 4 files
- **Fixable by Tool**: No

**Examples**:

- `src/app/(campaigns)/campaigns/[id]/backup/page.original.tsx` (line 166): The `{}` ("empty object") type allows any non-nullish value, including literals like `0` and `""`.
- If that's what you want, disable this lint rule with an inline comment or configure the 'allowObjectTypes' rule option.
- If you want a type meaning "any object", you probably want `object` instead.
- If you want a type meaning "any value", you probably want `unknown` instead.
- `src/app/(campaigns)/campaigns/[id]/page.tsx` (line 170): The `{}` ("empty object") type allows any non-nullish value, including literals like `0` and `""`.
- If that's what you want, disable this lint rule with an inline comment or configure the 'allowObjectTypes' rule option.
- If you want a type meaning "any object", you probably want `object` instead.
- If you want a type meaning "any value", you probably want `unknown` instead.
- `src/components/ui/forms/form-controls.tsx` (line 349): An interface declaring no members is equivalent to its supertype.

- **Description**: React Hook "useState" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function.
- **Occurrences**: 3 across 3 files
- **Fixable by Tool**: No

**Examples**:

- `src/app/(dashboard)/dashboard/DashboardContent.tsx` (line 1154): React Hook "useState" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function.
- `src/app/(dashboard)/dashboard/DashboardContent.tsx` (line 1157): React Hook "useEffect" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function.
- `src/components/features/campaigns/wizard/steps/Step4Content.tsx` (line 8): React Hook "useEffect" cannot be called at the top level. React Hooks must be called in a React function component or a custom React Hook function.

- **Description**: The `Function` type accepts any function-like value.
  Prefer explicitly defining any function parameters and return type.
- **Occurrences**: 1 across 1 files
- **Fixable by Tool**: No

**Examples**:

- `src/components/features/campaigns/wizard/steps/Step1Content.tsx` (line 564): The `Function` type accepts any function-like value.
  Prefer explicitly defining any function parameters and return type.

These errors should be fixed soon as they could cause bugs or maintainability issues:

- **Description**: Parsing error: Invalid character.
- **Occurrences**: 12 across 12 files
- **Fixable by Tool**: No

**Examples**:

- `scripts/consolidated/cleanup/deprecation-warnings.js` (line 146): Parsing error: Invalid character.
- `scripts/consolidated/cleanup/stray-utilities-consolidation.js` (line 434): Parsing error: ';' expected.
- `scripts/consolidated/db/feature-component-migration.js` (line 109): Parsing error: Expression or comma expected.

These errors should be fixed in regular development:

_4 rule violations found_

- **@typescript-eslint/ban-ts-comment**: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free. (3 occurrences)
- **@next/next/no-html-link-for-pages**: Do not use an `<a>` element to navigate to `/api/auth/login/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages (2 occurrences)
- **@next/next/no-assign-module-variable**: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable (1 occurrences)
- **no-var**: Unexpected var, use let or const instead. (1 occurrences)

These warnings should be addressed during regular development:

_7 warning types found_

- **@typescript-eslint/no-unused-vars**: 'AnimatePresence' is defined but never used. Allowed unused vars must match /^\_/u. (747 occurrences)
- **@typescript-eslint/no-explicit-any**: Unexpected any. Specify a different type. (314 occurrences)
- **@next/next/no-img-element**: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element (62 occurrences)
- **react-hooks/exhaustive-deps**: React Hook useEffect contains a call to 'setDebugInfo'. Without a list of dependencies, this can lead to an infinite chain of updates. To fix this, pass [] as a second argument to the useEffect Hook. (30 occurrences)
- **prefer-const**: 'componentFiles' is never reassigned. Use 'const' instead. (7 occurrences)
- ... and 2 more

1. Address all critical errors immediately
2. Focus on major errors in the next development sprint
3. Fix minor errors and warnings during regular code maintenance
4. Run the automated lint-fixer to resolve automatically fixable issues

Use the following command to run the automated fixer:

```bash
node scripts/consolidated/linting/lint-fixer.js
```

Re-run this analysis after fixing critical issues to ensure progress.

## Automated Fixing Strategy

This document outlines a systematic, automated approach to fixing ESLint issues across the codebase. By leveraging existing scripts and tools intelligently, we can dramatically reduce the manual effort required to achieve a lint-free codebase.

Rather than attempting to fix all issues at once, a batched approach prioritizes:

1. High-impact errors first
2. Similar issue types in batches
3. Files grouped by feature or module
4. Balance between automation and manual review

| Tool                  | Purpose                                 | Command                                                                  |
| --------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `lint-fixer.js`       | Fix common patterns in individual files | `node scripts/consolidated/linting/lint-fixer.js --file path/to/file.js` |
| `bulk-fix.sh`         | Run batch fixes on multiple issues      | `bash scripts/consolidated/linting/bulk-fix.sh`                          |
| ESLint autofix        | Fix simple issues automatically         | `npx eslint --config eslint.config.mjs --fix path/to/file.js`            |
| `tracking-summary.js` | Monitor progress                        | `node scripts/consolidated/cleanup/tracking-summary.js`                  |

**Automation Approach**:

```bash
bash scripts/consolidated/linting/bulk-fix.sh

FILES=$(npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-require-imports'))
  .map(f => f.filePath); console.log(files.join('\n'))");

echo "$FILES" | xargs -I{} node scripts/consolidated/linting/lint-fixer.js --file "{}"
```

**Verification**:

```bash
npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const count = data.reduce((acc, f) => acc + f.messages.filter(m => m.ruleId === '@typescript-eslint/no-require-imports').length, 0);
  console.log('Remaining require() errors:', count);"
```

**Automation Approach**:

```bash
FILES=$(npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@typescript-eslint/no-unused-vars'))
  .map(f => f.filePath); console.log(files.join('\n'))");

echo "$FILES" | xargs -I{} npx eslint --config eslint.config.mjs --fix --rule '@typescript-eslint/no-unused-vars: warn' "{}"
```

This requires more manual attention but can be semi-automated:

```bash
FILES=$(npx eslint --config eslint.config.mjs --format json . |
  node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const files = data.filter(f => f.messages.some(m => m.ruleId === '@next/next/no-img-element'))
  .map(f => f.filePath); console.log(files.join('\n'))");

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

node fix-images.js $FILES
```

After running this script, you'll need to manually replace `<img>` tags with `<Image>` components.

```bash
bash scripts/consolidated/linting/bulk-fix.sh

node scripts/consolidated/linting/lint-fixer.js --file src/types/prisma-extensions.ts

node scripts/consolidated/cleanup/tracking-summary.js
```

```bash
node scripts/consolidated/linting/lint-fixer.js --file src/components/ui/icons/core/SvgIcon.tsx

npx eslint --config eslint.config.mjs --fix src/components/ui/examples.tsx
npx eslint --config eslint.config.mjs --fix src/components/ui/examples/ColorPaletteLogosExamples.tsx
npx eslint --config eslint.config.mjs --fix src/types/routes.ts

node scripts/consolidated/cleanup/tracking-summary.js
```

```bash
npx eslint --config eslint.config.mjs --fix --rule '@typescript-eslint/no-unused-vars: warn' .

npx eslint --config eslint.config.mjs --fix --rule 'prefer-const: warn' .
npx eslint --config eslint.config.mjs --fix --rule 'import/no-anonymous-default-export: warn' .

node scripts/consolidated/cleanup/tracking-summary.js
```

For faster execution on larger codebases, use parallel processing:

```bash
echo "$FILES" | xargs -P 4 -I{} node scripts/consolidated/linting/lint-fixer.js --file "{}"
```

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

5. **Regular progress tracking**:

   ```bash
   node scripts/consolidated/cleanup/tracking-summary.js
   ```

6. **Save baselines after major milestones**:

   ```bash
   node scripts/consolidated/cleanup/tracking-summary.js --save
   ```

7. **Create a progress report**:
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

This automated approach allows us to efficiently address the vast majority of ESLint issues in the codebase. By applying fixes in batches and utilizing automated scripts, we can achieve a clean codebase with minimal manual intervention. Regular verification and tracking ensure that progress is measurable and sustainable.

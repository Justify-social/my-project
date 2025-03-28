# ESLint Error Priority Report
  
## Overview

- **Generated**: 3/27/2025, 1:52:03 PM
- **Total Files Analyzed**: 815
- **Files with Issues**: 377 (46%)
- **Total Errors**: 323
- **Total Warnings**: 1167
- **Unique Rules Violated**: 18

## Critical Errors (Fix Immediately)

These errors must be fixed before commits can be made successfully:

### @typescript-eslint/no-require-imports

- **Description**: A `require()` style import is forbidden.
- **Occurrences**: 282 across 282 files
- **Fixable by Tool**: No

**Examples**:

- `.eslintrc.js` (line 3): A `require()` style import is forbidden.
- `config/cypress/cypress.config.js` (line 3): A `require()` style import is forbidden.
- `config/eslint/eslintrc.js` (line 3): A `require()` style import is forbidden.

### @typescript-eslint/no-unused-expressions

- **Description**: Expected an assignment or function call and instead saw an expression.
- **Occurrences**: 8 across 8 files
- **Fixable by Tool**: No

**Examples**:

- `cypress/e2e/layout/branding.cy.js` (line 34): Expected an assignment or function call and instead saw an expression.
- `cypress/e2e/layout/no-hydration-error-cy.js` (line 22): Expected an assignment or function call and instead saw an expression.
- `src/app/(admin)/admin/page.tsx` (line 5): Expected an assignment or function call and instead saw an expression.

### react/jsx-no-undef

- **Description**: 'LoadingSpinner' is not defined.
- **Occurrences**: 6 across 6 files
- **Fixable by Tool**: No

**Examples**:

- `src/app/(campaigns)/campaigns/ServerCampaigns.tsx` (line 13): 'LoadingSpinner' is not defined.
- `src/app/(campaigns)/influencer-marketplace/[id]/page.tsx` (line 99): 'LoadingSpinner' is not defined.
- `src/app/(campaigns)/influencer-marketplace/campaigns/page.tsx` (line 186): 'LoadingSpinner' is not defined.

### @typescript-eslint/no-empty-object-type

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

### react-hooks/rules-of-hooks

- **Description**: React Hook "useState" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function.
- **Occurrences**: 3 across 3 files
- **Fixable by Tool**: No

**Examples**:

- `src/app/(dashboard)/dashboard/DashboardContent.tsx` (line 1154): React Hook "useState" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function.
- `src/app/(dashboard)/dashboard/DashboardContent.tsx` (line 1157): React Hook "useEffect" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function.
- `src/components/features/campaigns/wizard/steps/Step4Content.tsx` (line 8): React Hook "useEffect" cannot be called at the top level. React Hooks must be called in a React function component or a custom React Hook function.

### @typescript-eslint/no-unsafe-function-type

- **Description**: The `Function` type accepts any function-like value.
Prefer explicitly defining any function parameters and return type.
- **Occurrences**: 1 across 1 files
- **Fixable by Tool**: No

**Examples**:

- `src/components/features/campaigns/wizard/steps/Step1Content.tsx` (line 564): The `Function` type accepts any function-like value.
Prefer explicitly defining any function parameters and return type.

## Major Errors (High Priority)

These errors should be fixed soon as they could cause bugs or maintainability issues:

### syntax-error

- **Description**: Parsing error: Invalid character.
- **Occurrences**: 12 across 12 files
- **Fixable by Tool**: No

**Examples**:

- `scripts/consolidated/cleanup/deprecation-warnings.js` (line 146): Parsing error: Invalid character.
- `scripts/consolidated/cleanup/stray-utilities-consolidation.js` (line 434): Parsing error: ';' expected.
- `scripts/consolidated/db/feature-component-migration.js` (line 109): Parsing error: Expression or comma expected.

## Minor Errors (Medium Priority)

These errors should be fixed in regular development:

*4 rule violations found*

- **@typescript-eslint/ban-ts-comment**: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free. (3 occurrences)
- **@next/next/no-html-link-for-pages**: Do not use an `<a>` element to navigate to `/api/auth/login/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages (2 occurrences)
- **@next/next/no-assign-module-variable**: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable (1 occurrences)
- **no-var**: Unexpected var, use let or const instead. (1 occurrences)

## Warnings (Low Priority)

These warnings should be addressed during regular development:

*7 warning types found*

- **@typescript-eslint/no-unused-vars**: 'AnimatePresence' is defined but never used. Allowed unused vars must match /^_/u. (747 occurrences)
- **@typescript-eslint/no-explicit-any**: Unexpected any. Specify a different type. (314 occurrences)
- **@next/next/no-img-element**: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element (62 occurrences)
- **react-hooks/exhaustive-deps**: React Hook useEffect contains a call to 'setDebugInfo'. Without a list of dependencies, this can lead to an infinite chain of updates. To fix this, pass [] as a second argument to the useEffect Hook. (30 occurrences)
- **prefer-const**: 'componentFiles' is never reassigned. Use 'const' instead. (7 occurrences)
- ... and 2 more

## Recommended Action Plan

1. Address all critical errors immediately
2. Focus on major errors in the next development sprint
3. Fix minor errors and warnings during regular code maintenance
4. Run the automated lint-fixer to resolve automatically fixable issues

Use the following command to run the automated fixer:

```bash
node scripts/consolidated/linting/lint-fixer.js
```

Re-run this analysis after fixing critical issues to ensure progress.

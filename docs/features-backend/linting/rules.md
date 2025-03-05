# Linting Rules

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Development Team

## Overview

This document details the linting rules enforced in the Campaign Wizard application. These rules help maintain code quality, consistency, and prevent common errors.

## ESLint Rules

### TypeScript Rules

| Rule | Configuration | Description |
|------|--------------|-------------|
| `@typescript-eslint/no-explicit-any` | `warn` | Discourages use of the `any` type to maintain type safety |
| `@typescript-eslint/explicit-function-return-type` | `off` | Return types can be inferred by TypeScript |
| `@typescript-eslint/explicit-module-boundary-types` | `off` | Parameter types can be inferred in exported functions |
| `@typescript-eslint/no-unused-vars` | `error` | Prevents unused variables |
| `@typescript-eslint/no-non-null-assertion` | `warn` | Discourages non-null assertions (`!`) |
| `@typescript-eslint/no-empty-interface` | `warn` | Prevents empty interfaces |
| `@typescript-eslint/consistent-type-definitions` | `['error', 'interface']` | Prefer interfaces over type aliases for object definitions |

### React Rules

| Rule | Configuration | Description |
|------|--------------|-------------|
| `react/react-in-jsx-scope` | `off` | Not needed with Next.js |
| `react/prop-types` | `off` | Using TypeScript for prop validation |
| `react/display-name` | `error` | Components should have a display name for debugging |
| `react/no-unescaped-entities` | `error` | Prevents unescaped entities in JSX |
| `react/no-children-prop` | `error` | Use children as a prop, not as an attribute |
| `react/jsx-key` | `error` | Elements in iterators require keys |
| `react/jsx-no-duplicate-props` | `error` | Prevents duplicate props |

### React Hooks Rules

| Rule | Configuration | Description |
|------|--------------|-------------|
| `react-hooks/rules-of-hooks` | `error` | Enforces Rules of Hooks |
| `react-hooks/exhaustive-deps` | `warn` | Checks effect dependencies |

### Accessibility Rules

| Rule | Configuration | Description |
|------|--------------|-------------|
| `jsx-a11y/alt-text` | `error` | Images must have alt text |
| `jsx-a11y/anchor-has-content` | `error` | Anchors must have content |
| `jsx-a11y/aria-props` | `error` | ARIA properties must be valid |
| `jsx-a11y/aria-role` | `error` | ARIA roles must be valid |
| `jsx-a11y/role-has-required-aria-props` | `error` | Elements with ARIA roles must have required props |
| `jsx-a11y/tabindex-no-positive` | `warn` | Avoid positive tabindex values |

### Import Rules

| Rule | Configuration | Description |
|------|--------------|-------------|
| `import/order` | See below | Enforces import order |
| `import/no-duplicates` | `error` | Prevents duplicate imports |
| `import/no-unresolved` | `off` | TypeScript handles this |
| `import/first` | `error` | Imports must be at the top of the file |
| `import/newline-after-import` | `error` | Requires a newline after imports |

**Import Order Configuration**:
```javascript
'import/order': ['error', { 
  'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
  'newlines-between': 'always',
  'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
}]
```

### Next.js Rules

| Rule | Configuration | Description |
|------|--------------|-------------|
| `@next/next/no-img-element` | `warn` | Prefer Next.js Image component |
| `@next/next/no-html-link-for-pages` | `error` | Use Next.js Link for internal navigation |
| `@next/next/no-sync-scripts` | `error` | Prevent synchronous scripts |

## Prettier Rules

| Rule | Configuration | Description |
|------|--------------|-------------|
| `semi` | `true` | Require semicolons |
| `trailingComma` | `es5` | Trailing commas where valid in ES5 |
| `singleQuote` | `true` | Use single quotes |
| `tabWidth` | `2` | 2 spaces for indentation |
| `printWidth` | `100` | Line length limit |
| `bracketSpacing` | `true` | Spaces in object literals |
| `arrowParens` | `always` | Always include parentheses around arrow function parameters |

## Custom Rules

In addition to the standard rules, we have implemented custom rules for our specific needs:

### Naming Conventions

- **Components**: PascalCase (e.g., `CampaignForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCampaignData.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `CampaignData`)

### File Organization

- One component per file
- Related utilities grouped in directories
- Tests co-located with implementation files

## Disabling Rules

Sometimes it's necessary to disable rules for specific cases. Use the following patterns:

### Disabling for a Line

```javascript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getUnknownData();
```

### Disabling for a Block

```javascript
/* eslint-disable @typescript-eslint/no-explicit-any */
function legacyFunction() {
  // Code with any types
}
/* eslint-enable @typescript-eslint/no-explicit-any */
```

### Disabling for a File

```javascript
/* eslint-disable @typescript-eslint/no-explicit-any */
// Code for the entire file
```

## Rule Customization

To modify these rules, update the following files:

- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `tsconfig.json` - TypeScript configuration

After making changes, run `npm run lint` to verify that the rules are applied correctly.

## Related Documentation

- [Linting Overview](./overview.md)
- [Linting Improvement Plan](./improvement-plan.md)
- [Development Workflow](../../guides/developer/workflow.md) 
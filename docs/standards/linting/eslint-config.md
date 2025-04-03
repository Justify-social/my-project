# ESLint Configuration

This document details our ESLint setup, configurations, and common rules used in the project.

## Configuration

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

## Usage

The following scripts are available for running ESLint:

- `npm run lint`: Run ESLint on the codebase
- `npm run lint:fix`: Run ESLint with automatic fixes

## Integration with CI/CD

Our CI pipeline includes ESLint checks that run on every pull request. Pull requests with linting errors will be blocked from merging until the issues are resolved.

## Pre-commit Hooks

We use Husky and lint-staged to run ESLint checks before each commit:

```json
// .husky/pre-commit
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix"]
}
```

## Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `.eslintrc.json` | Main configuration | `config/eslint/.eslintrc.json` |
| `.eslintignore` | Files to exclude | `config/eslint/.eslintignore` |
| `eslint.config.mjs` | Flat config (v9+) | `config/eslint/eslint.config.mjs` |

## Related Documentation

- [TypeScript Rules](./rules/typescript-rules.md)
- [React Rules](./rules/react-rules.md)
- [Verification Strategy](../verification/lint-strategy.md) 
# eslint-plugin-icon-standards

Custom ESLint plugin to enforce icon usage standards in our application.

## Installation

```bash
# Install as a dev dependency
npm install --save-dev eslint-plugin-icon-standards
```

## Purpose

This plugin enforces our icon usage standards:

1. All icons must be imported from `@/components/ui/atoms/icons` using the `Icon` component
2. Direct imports from any `@fortawesome/*` packages are prohibited

## Configuration

Add the plugin to your ESLint configuration file:

```js
// .eslintrc.js
module.exports = {
  plugins: [
    // ... other plugins
    'icon-standards'
  ],
  extends: [
    // ... other configs
    'plugin:icon-standards/recommended'
  ],
  // or configure rules individually:
  rules: {
    // ... other rules
    'icon-standards/no-fontawesome-direct-import': 'error'
  }
};
```

## Rules

### `no-fontawesome-direct-import`

This rule prevents direct imports from any FontAwesome package.

#### Examples of incorrect code

```js
// ❌ Incorrect
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
```

#### Examples of correct code

```js
// ✅ Correct
import { Icon } from '@/components/ui/atoms/icons';
```

## Auto-fixing

This plugin can automatically fix some violations:

- When `FontAwesomeIcon` is imported from `@fortawesome/react-fontawesome`, it will be replaced with the correct `Icon` import
- Other FontAwesome imports will trigger warnings but won't be auto-fixed, as they may need more complex replacements

## Usage with pre-commit hooks

This plugin can be used with Husky and lint-staged to prevent commits that violate our icon standards:

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
}
```

## Integration with CI/CD

Add the ESLint check to your CI pipeline:

```yaml
# Example GitHub Actions workflow
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '16'
    - run: npm ci
    - run: npm run lint
``` 
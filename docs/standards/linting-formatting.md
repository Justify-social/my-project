# Linting & Formatting Standards

**Last Reviewed:** 2025-05-09

This document is the Single Source of Truth (SSOT) for linting and code formatting standards in the Justify project. Consistent code style improves readability and reduces cognitive load.

## Tools

- **Linter:** ESLint (`eslint`)
  - Purpose: Analyzes code for potential errors, anti-patterns, and stylistic issues based on configured rules.
- **Formatter:** Prettier (`prettier`)
  - Purpose: Automatically formats code to enforce a consistent style (line length, spacing, quotes, semicolons, etc.).

## Configuration

Configuration files for these tools are centralized in the root `/config` directory:

- **ESLint:** `config/eslint/eslint.config.mjs` (or similar `.js`/`.json`)
  - Defines specific ESLint rules, plugins (e.g., `@typescript-eslint`, `eslint-plugin-react-hooks`, `@next/eslint-plugin-next`), and parsing options.
- **Prettier:** `config/prettier/.prettierrc.json`
  - Defines formatting rules like print width, tab width, quote style, etc.
  - Current Rules (as of last review):
    ```json
    {
      "semi": true,
      "singleQuote": true,
      "tabWidth": 2,
      "trailingComma": "es5",
      "printWidth": 100,
      "bracketSpacing": true,
      "arrowParens": "avoid"
    }
    ```
- **EditorConfig:** A `.editorconfig` file might exist in the root to help maintain consistent basic coding styles (indentation, line endings) across different editors.

## Usage

### Running Manually

You can manually check or fix linting and formatting issues using npm scripts defined in `package.json`:

- **Check ESLint Issues:**
  ```bash
  npm run lint
  ```
- **Check Prettier Formatting:**
  ```bash
  npm run format:check
  # or: npx prettier --config config/prettier/.prettierrc.json --check "**/*.{js,jsx,ts,tsx,json,css,scss,md}"
  ```
- **Fix Prettier Formatting:**
  ```bash
  npm run format
  # or: npx prettier --config config/prettier/.prettierrc.json --write "**/*.{js,jsx,ts,tsx,json,css,scss,md}"
  ```
- **Fix ESLint Issues (where possible):**
  ```bash
  npm run lint -- --fix
  ```

### Editor Integration (Recommended)

Configure your editor (e.g., VS Code) to automatically format code on save using Prettier and potentially fix ESLint errors on save.

- Install relevant editor extensions (e.g., ESLint, Prettier - Code formatter for VS Code).
- Ensure your editor settings (`.vscode/settings.json` for VS Code) are configured, potentially including:
  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode", // Set Prettier as default
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit" // Or true
    }
  }
  ```

### Pre-commit Hook (Automated)

We use Husky and lint-staged to automatically enforce standards before code is committed:

- **Mechanism:** When you run `git commit`, a pre-commit hook (`.husky/pre-commit`) triggers `lint-staged`.
- **`lint-staged` Configuration (in `package.json`)**: Defines which commands (ESLint, Prettier) run on which staged files.
  ```json
  // package.json (Example lint-staged config)
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --config eslint.config.mjs --ext .js,.jsx,.ts,.tsx", // Check linting
      "prettier --config config/prettier/.prettierrc.json --check" // Check formatting
    ],
    "*.{json,css,scss,md}": [
      "prettier --config config/prettier/.prettierrc.json --check"
    ]
  }
  ```
- **Outcome:** If either ESLint or Prettier finds issues in the staged files, the commit will be **aborted**. You must fix the reported issues (e.g., by running `npm run format` or manually fixing ESLint errors) and re-stage the files (`git add .`) before successfully committing.

Adherence to these linting and formatting standards via manual checks, editor integration, and pre-commit hooks is mandatory for all contributions.

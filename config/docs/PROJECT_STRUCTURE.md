# Project Structure

This document describes the overall structure of the project, focusing on the organization of configuration files.

## Directory Structure

```
/
├── config/                 # Configuration files
│   ├── eslint/             # ESLint configuration
│   ├── typescript/         # TypeScript configuration
│   ├── tailwind/           # Tailwind CSS configuration
│   ├── jest/               # Jest testing configuration
│   ├── cypress/            # Cypress testing configuration
│   ├── prettier/           # Prettier code formatting
│   ├── nextjs/             # Next.js configuration
│   ├── vercel/             # Vercel deployment configuration
│   ├── sentry/             # Sentry error tracking
│   ├── env/                # Environment variables
│   └── ui/                 # UI component configuration
├── docs/                   # Documentation
│   ├── troubleshooting/    # Troubleshooting guides
│   └── PROJECT_STRUCTURE.md # This file
├── .cache/                 # Cache files (gitignored)
├── scripts/                # Utility scripts
│   ├── icons/              # Icon management scripts
│   ├── ui/                 # UI component scripts
│   └── ...                 # Other script categories
├── src/                    # Application source code
└── public/                 # Static assets
```

## Configuration Files

Most configuration files have been moved from the project root to the `config/` directory and organized by tool or framework. For backward compatibility, redirect files are kept in the project root.

### ESLint Configuration
- Original: `.eslintrc.js`, `.eslintrc.json`, `eslint.config.mjs`
- New location: `config/eslint/`

### TypeScript Configuration
- Original: `tsconfig.json`, `jsconfig.json`
- New location: `config/typescript/`

### Tailwind CSS Configuration
- Original: `tailwind.config.js`, `postcss.config.mjs`
- New location: `config/tailwind/`

### Testing Configuration
- Original: `jest.config.js`, `jest.setup.js`, `cypress.config.js`
- New location: `config/jest/` and `config/cypress/`

### Next.js Configuration
- Original: `next.config.js`, `next-env.d.ts`
- New location: `config/nextjs/`

### Sentry Configuration
- Original: `sentry.config.ts`, `sentry.edge.config.ts`, `sentry.server.config.ts`
- New location: `config/sentry/`

### Environment Variables
- Original: `.env`, `.env.local`
- New location: `config/env/` (symlinked from root)

### UI Component Configuration
- Original: `components.json`, `feature-components.json`
- New location: `config/ui/`

## Cache Files

Cache files and temporary data are stored in the `.cache/` directory, which is added to `.gitignore`:

- `.component-registry-cache.json` → `.cache/component-registry-cache.json`
- `ui-component-validation-report.json` → `.cache/ui-component-validation-report.json`

## Documentation

Documentation files are organized in the `docs/` directory:

- `error-fix.md` → `docs/troubleshooting/error-fix.md`
- `icon-fix.md` → `docs/troubleshooting/icon-fix.md`

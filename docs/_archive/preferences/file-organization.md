# File Organization Preferences

This document outlines the agreed-upon standards for file organization within the project. Following these guidelines ensures consistency and makes the codebase easier to navigate for all team members.

## Directory Structure

The project follows a clean, organized directory structure:

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
│   ├── preferences/        # Project preferences
│   └── PROJECT_STRUCTURE.md # Project structure overview
├── .cache/                 # Cache files (gitignored)
├── scripts/                # Utility scripts
│   ├── master/             # Master toolkit architecture
│   ├── consolidated/       # Single source of truth for consolidated scripts
│   ├── icons/              # Icon management scripts
│   ├── ui/                 # UI component scripts
│   └── ...                 # Other script categories
├── src/                    # Application source code
│   ├── app/                # Next.js app router pages
│   ├── components/         # React components
│   │   ├── ui/             # Core UI components
│   │   └── features/       # Feature-specific components
│   ├── lib/                # Utility libraries
│   ├── styles/             # Global styles
│   └── types/              # TypeScript type definitions
└── public/                 # Static assets
    └── ui-icons/           # UI icons
```

## Principles

1. **Single Source of Truth**:

   - Configuration files should be organized under the `config/` directory
   - Maintain backward compatibility with redirect files
   - Critical application constants should be stored in dedicated files
   - Scripts should have one definitive implementation in their category directory

2. **Clear Categorization**:

   - Files should be organized by their purpose and relationship
   - Subdirectories should be created for related sets of files
   - Avoid deep nesting beyond 3-4 levels

3. **Minimize Root Directory Clutter**:

   - The root directory should contain minimal files
   - Configuration files should be in `config/`
   - Cache files should be in `.cache/`
   - Documentation should be in `docs/`

4. **Naming Conventions**:

   - Use kebab-case for file names (e.g., `file-name.js`)
   - Use PascalCase for component files (e.g., `ComponentName.tsx`)
   - Use camelCase for utility functions (e.g., `utilityFunction.ts`)
   - For scripts, use the .mjs extension for ES modules, .cjs for CommonJS modules

5. **Documentation**:
   - Include a README.md in each major directory
   - Document directory purpose and contents
   - Keep documentation up-to-date

## Configuration Files

Root-level configuration files have been organized into the `config/` directory according to their purpose. For backward compatibility, redirect files exist at the original locations:

| Original File        | New Location                         | Purpose                    |
| -------------------- | ------------------------------------ | -------------------------- |
| `.eslintrc.js`       | `config/eslint/eslintrc.js`          | ESLint configuration       |
| `.eslintrc.json`     | `config/eslint/eslintrc.json`        | ESLint configuration       |
| `eslint.config.mjs`  | `config/eslint/eslint.config.mjs`    | ESLint configuration       |
| `tsconfig.json`      | `config/typescript/tsconfig.json`    | TypeScript configuration   |
| `tailwind.config.js` | `config/tailwind/tailwind.config.js` | Tailwind CSS configuration |
| `next.config.js`     | `config/nextjs/next.config.js`       | Next.js configuration      |
| `.env`               | `config/env/.env`                    | Environment variables      |
| `components.json`    | `config/ui/components.json`          | UI component configuration |

## Script Organization

Scripts are organized following these principles:

1. **Master Toolkit Architecture**:

   - A unified entry point at `scripts/master/master-toolkit.mjs`
   - Category-command pattern for script invocation
   - Comprehensive help system for discoverability

2. **Category-Based Organization**:

   - Scripts are organized by functional category (icons, ui, etc.)
   - Each category directory contains a README.md documenting its scripts
   - Related scripts are kept together for easier discovery

3. **File Format Standards**:

   - `.mjs` for ES modules (preferred for new scripts)
   - `.cjs` for CommonJS modules (when required)
   - `.js` for backward compatibility wrappers (minimal usage)
   - Executable scripts should have the proper permissions set

4. **Consolidation of Duplicates**:

   - The `scripts/consolidated/` directory houses unified scripts
   - Duplicate functionality is eliminated by creating a single source of truth
   - Backward compatibility is maintained through wrapper scripts or symlinks

5. **Documentation and Discoverability**:
   - Each script includes a header comment explaining its purpose and usage
   - Help flags (`--help`) provide detailed usage information
   - READMEs in each directory explain available scripts and common usage patterns

## Cache and Generated Files

Temporary or generated files that don't need version control should be stored in the `.cache/` directory, which is listed in `.gitignore`:

| Original File                         | New Location                                 |
| ------------------------------------- | -------------------------------------------- |
| `.component-registry-cache.json`      | `.cache/component-registry-cache.json`       |
| `ui-component-validation-report.json` | `.cache/ui-component-validation-report.json` |

## Implementation

The organization is maintained through:

1. The `scripts/config-organizer.mjs` script, which organizes configuration files according to these standards
2. The `scripts/master/master-toolkit.mjs` script, which provides unified access to all scripts
3. Redirect files at original locations to maintain backward compatibility
4. Documentation in `docs/PROJECT_STRUCTURE.md` detailing the file organization

## Adding New Files

When adding new files to the project:

1. Identify the appropriate directory based on the file's purpose
2. Follow the established naming conventions
3. Add a reference to significant files in the relevant documentation
4. For configuration files, consider using the `config/` directory structure
5. For scripts, add your script to the appropriate category directory and update the master toolkit
6. Include a comprehensive README or header comment explaining the file's purpose and usage

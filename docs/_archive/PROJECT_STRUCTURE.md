# Project Structure

This document describes the overall structure of the project, focusing on the organization of configuration files and scripts.

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
│   ├── preferences/        # Project preferences
│   ├── troubleshooting/    # Troubleshooting guides
│   └── PROJECT_STRUCTURE.md # This file
├── .cache/                 # Cache files (gitignored)
├── scripts/                # Utility scripts
│   ├── master/             # Master toolkit architecture
│   ├── consolidated/       # Single source of truth for consolidated scripts
│   ├── icons/              # Icon management scripts
│   ├── ui/                 # UI component scripts
│   ├── cleanup/            # Cleanup and maintenance tools
│   └── ...                 # Other script categories
├── src/                    # Application source code
├── archives/               # Archive of removed files
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

## Script Organization

The scripts directory has been organized with a master toolkit architecture for centralized access:

### Master Toolkit
- Located at: `scripts/master/master-toolkit.mjs`
- Provides a unified interface for all scripts using a category-command pattern
- Documentation: `scripts/master/README.md`

### Script Categories
- **icons**: Icon management scripts (`scripts/icons/`)
- **ui**: UI component scripts (`scripts/ui/`)
- **config**: Configuration scripts (`scripts/config/`)
- **docs**: Documentation scripts (`scripts/docs/`)
- **cleanup**: Cleanup utilities (`scripts/cleanup/`)
- **utils**: Utility scripts (`scripts/utils/`)

### Consolidated Scripts
- Location: `scripts/consolidated/`
- Purpose: Single source of truth for scripts that were previously duplicated
- Each script directory includes detailed documentation in README.md files

## Deprecated Files Management

The project includes a comprehensive tree shake process for managing deprecated files:

### Tree Shake Script
- Located at: `scripts/cleanup/tree-shake.mjs`
- Purpose: Aggressively identifies and removes deprecated files
- Features: 
  - Dry-run mode to preview changes
  - Reference checking before removal
  - Automatic backup creation
  - Detailed reporting

### Tree Shake Procedure
1. Run in dry-run mode first: `node scripts/cleanup/tree-shake.mjs --dry-run`
2. Review files that would be removed
3. Run the script to create backups and remove files
4. Verify application functionality

### Archives
- Location: `archives/`
- Purpose: Stores backups of removed files organized by timestamp
- Ensures recoverability of any removed files

## Cache Files

Cache files and temporary data are stored in the `.cache/` directory, which is added to `.gitignore`:

- `.component-registry-cache.json` → `.cache/component-registry-cache.json`
- `ui-component-validation-report.json` → `.cache/ui-component-validation-report.json`

## Documentation

Documentation files are organized in the `docs/` directory with meaningful subdirectories:

- `docs/preferences/` - Project preferences and standards
- `docs/troubleshooting/` - Troubleshooting guides
- `docs/architecture/` - Architecture documentation
- `docs/components/` - Component documentation

## Application Source Structure

The source code is organized following best practices:

```
src/
├── app/           # Next.js App Router pages and layouts
│   ├── (admin)/   # Admin interface routes (grouped)
│   ├── (auth)/    # Authentication routes (grouped)
│   ├── api/       # API route handlers
│   └── [...]/     # Other application routes
├── components/    # React components
│   ├── ui/        # Reusable UI components
│   ├── features/  # Feature-specific components
│   └── layouts/   # Layout components
├── lib/           # Core libraries and utilities
│   ├── api/       # API utilities
│   ├── db/        # Database utilities
│   ├── server/    # Server utilities
│   └── utils/     # General utilities
├── hooks/         # Custom React hooks
├── contexts/      # React context providers
├── types/         # TypeScript type definitions
└── styles/        # Global styles
```

## Server Configuration

Custom server implementation is maintained in `src/lib/server/` with a redirect file in the root for backward compatibility. This approach keeps server code with other source code while maintaining accessibility.

## Middleware Configuration 

Next.js middleware configuration is located in `config/middleware/` with a redirect file in the root, ensuring that Next.js can find the middleware while maintaining organization.

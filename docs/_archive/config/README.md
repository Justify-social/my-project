# Configuration Organization

This document outlines the organization of configuration files in the project, following academic-level software engineering principles.

## Core Architecture Principles

The configuration organization follows these architectural principles:

1. **Single Source of Truth**: Each configuration aspect has a canonical location
2. **Separation of Concerns**: Configuration is organized by domain and purpose
3. **Progressive Disclosure**: Simple operations are easy, complex operations are possible
4. **Backward Compatibility**: Original paths continue to work through redirect files
5. **Explicit Intent**: Configuration files clearly express their purpose
6. **Semantic Organization**: Configuration is organized by its semantic role in the system

## Directory Structure

```
config/
├── cypress/          # Cypress testing configuration
├── docs/             # Documentation-related configuration
├── env/              # Environment variables
│   ├── .env          # Base environment variables
│   └── .env.local    # Local environment variables
├── eslint/           # ESLint configuration
│   ├── eslint.config.mjs
│   ├── eslintrc.js
│   └── eslintrc.json
├── jest/             # Jest testing configuration
│   ├── jest.config.js
│   └── jest.setup.js
├── middleware/       # Middleware configuration
│   └── middleware.ts
├── next/             # Alternate Next.js configuration directory
├── nextjs/           # Next.js configuration
│   ├── next.config.js
│   └── next-env.d.ts
├── postcss/          # PostCSS configuration
│   └── postcss.config.mjs
├── prettier/         # Prettier code formatting
│   └── .prettierrc.json
├── prisma/           # Prisma database schema
│   └── schema.prisma
├── sentry/           # Sentry error tracking
│   ├── sentry.config.ts
│   ├── sentry.edge.config.ts
│   └── sentry.server.config.ts
├── tailwind/         # Tailwind CSS configuration
│   ├── tailwind.config.js
│   └── tailwind.config.ts
├── typescript/       # TypeScript configuration
│   └── tsconfig.json
├── ui/               # UI component configuration
│   ├── components.json
│   └── feature-components.json
└── vercel/           # Vercel deployment configuration
    └── vercel.json
```

## Implementation Details

### Redirect Mechanism

Configuration files at the project root are redirects that import from their canonical locations, allowing:

1. **Backward Compatibility**: Existing import statements continue to work
2. **Clear Documentation**: Each redirect file includes comments about its purpose and location
3. **Explicit Intent**: The redirect pattern makes it clear where the actual configuration resides

### Environment Variables

Environment files (.env, .env.local) are symlinked to their canonical locations in `config/env/` to maintain compatibility with tools that expect these files in the root directory.

### Database Configuration

Database schema (schema.prisma) is maintained in `config/prisma/` with a redirect file in the root that points to this canonical location.

### Server Configuration

Custom server implementation is maintained in `src/lib/server/` with a redirect file in the root that clearly documents this organization.

## Usage Guidelines

### Importing Configuration

When importing configuration, prefer to use the canonical path:

```javascript
// Preferred
import config from './config/typescript/tsconfig.json';

// Discouraged but supported for backward compatibility
import config from './tsconfig.json';
```

### Modifying Configuration

When modifying configuration:

1. Edit the canonical file in the `config/` directory
2. Verify that redirects are properly configured
3. Update documentation if the configuration format changes

## Integration with Project Tooling

The project includes scripts for managing this configuration organization:

```bash
# Using the master toolkit
node scripts/master/master-toolkit.mjs config organize
node scripts/master/master-toolkit.mjs config migrate

# Directly using the scripts
node scripts/config/config-organizer.mjs
node scripts/config/migrate-config.mjs
```

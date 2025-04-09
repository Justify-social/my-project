# Architecture

This section explains how our codebase is structured and the key architectural decisions that shape our project.

## Key Topics

- **[Directory Structure](./directory-structure.md)**: How the codebase is organised into folders and files
- **[Performance Optimization](./performance-optimization.md)**: Strategies for tree-shaking and bundle analysis
- **[Server vs. Client Components](../server-client-components.md)**: Understanding and using RSCs effectively
- **Configuration System** (see below)
- **[Component Dependencies](../dependency-graphs/component-dependencies.mmd)**: Visual representation of how components relate to each other

## Design Principles

Our architecture follows these core principles:

1. **Separation of Concerns**: Each component or module has a clear, focused responsibility
2. **Modularity & Composability**: Code is organised into reusable, independent modules (features, UI components, utilities)
3. **Single Source of Truth (SSOT):** Configuration, core logic, types, and documentation should reside in clear, canonical locations
4. **Scalability & Maintainability**: Architectural patterns chosen allow for project growth and straightforward maintenance

## Configuration System

The project uses a centralised configuration system located in the root `/config` directory. This approach ensures consistency and follows SSOT principles.

### Key Features

- **Environment-based:** Separate configurations for development, testing, and production
- **Centralised:** All tool configurations (ESLint, TypeScript, Jest, Next.js, Tailwind, etc.) reside within `/config`
- **Validation:** Includes scripts for validating configuration integrity

### Structure Overview

```text
config/
├── core/         # Core values (constants, defaults)
├── environment/  # Environment-specific overrides
├── platform/     # Platform-specific adjustments (e.g., Next.js webpack)
├── scripts/      # Config management scripts
├── ui/           # UI-related configs (e.g., component registry)
├── [tool-name]/  # Tool-specific directories (eslint, jest, typescript, etc.)
└── index.js      # (Potentially) Main config entrypoint
```

*For detailed information on using and modifying the configuration system, please refer to the README within the `/config` directory itself (if one exists) or specific tool documentation.*

## Frontend Architecture

The frontend uses Next.js App Router with React and TypeScript. Key elements include:

- React Server Components (RSC) for server-rendered logic and data fetching
- Client Components (`'use client'`) for interactivity and browser APIs
- A modular UI library (`src/components/ui`) based on Radix UI and styled with Tailwind CSS
- Feature-specific components organised in `src/components/features`
- Centralised state management (likely Zustand, based on previous context)
- Path aliases (`@/`) for clean imports

## Backend Architecture

The backend logic primarily resides within:

- **API Routes (`src/app/api/`)**: Handlers for client requests
- **Services (`src/services/`)**: Encapsulated business logic
- **Library (`src/lib/`)**: Core utilities, database interactions (Prisma), external API clients
- **Middleware (`src/middleware.ts`)**: For handling requests before they reach API routes or pages (e.g., authentication)

*(Self-correction: Removed link to Backend Features doc as its existence is unverified)* 
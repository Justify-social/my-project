# Directory Structure

**Last Reviewed:** 2025-05-09

This document outlines the primary directory structure for the project and serves as the Single Source of Truth (SSOT) for codebase organization.

## Root Directory Overview

```text
/
├── .cache/         # Cache files (gitignored)
├── .github/        # GitHub Actions workflows and issue templates
├── .husky/         # Husky pre-commit hooks configuration
├── .vscode/        # VS Code editor settings and recommended extensions
├── archives/       # Archive of removed or deprecated files (should be empty post-cleanup)
├── config/         # Centralised configuration files (See docs/configuration/README.md or config/README.md)
├── docs/           # Project documentation (this directory)
├── public/         # Static assets served publicly (images, fonts, etc.)
├── scripts/        # Utility and automation scripts (See docs/scripts/README.md or scripts/README.md)
├── src/            # Application source code (Detailed below)
├── tests/          # Centralised test suites (Unit, Integration, E2E)
├── .env.example    # Example environment variables (may be in config/env/.env.example)
├── .eslintignore   # Files/directories to be ignored by ESLint
├── .eslintrc.js    # ESLint configuration (may point to config/eslint/)
├── .gitignore      # Specifies intentionally untracked files that Git should ignore
├── .nvmrc          # Specifies the Node.js version for the project
├── .prettierignore # Files/directories to be ignored by Prettier
├── .prettierrc.js  # Prettier configuration (may point to config/prettier/)
├── next-env.d.ts   # Next.js TypeScript declarations
├── next.config.js  # Next.js configuration (may point to config/nextjs/)
├── package.json    # Project metadata, dependencies, and scripts
├── pnpm-lock.yaml  # PNPM lockfile (or package-lock.json for npm, yarn.lock for Yarn)
├── README.md       # Root project README: High-level overview, quick start, links to docs
└── tsconfig.json   # TypeScript configuration (may point to config/typescript/)
```

## `src/` Directory Structure (Application Code)

This is the "Final Structure (Post-Unification)" which represents our target organization for all application source code.

```text
src/
├── app/                       # Next.js App Router: Routing, pages, layouts, API routes
│   ├── (auth)/                # Route group for authentication-related pages (e.g., login, signup)
│   ├── (campaigns)/           # Route group for campaign management pages
│   ├── (dashboard)/           # Route group for user dashboard pages
│   ├── (marketing)/           # Route group for public marketing pages (e.g., landing, pricing)
│   ├── api/                   # API route handlers (backend endpoints)
│   │   └── [..]/              # Sub-routes for different API resources
│   ├── global-error.tsx       # Global error handler for Next.js App Router
│   ├── layout.tsx             # Root application layout component
│   └── not-found.tsx          # Custom 404 page for App Router
│
├── assets/                    # Static assets like images, svgs used within src (distinct from /public)
│   └── icons/                 # SVG icons not part of a font library
│
├── components/                # React components, organized by scope and reusability
│   ├── features/              # Components implementing specific business features or domain logic
│   │   ├── auth/              # Authentication-specific components (e.g., LoginForm)
│   │   ├── campaigns/         # Components related to campaign features
│   │   │   ├── brand-lift/    # Components for Brand Lift specific UIs
│   │   │   ├── common/        # Common components shared across campaign features
│   │   │   ├── influencers/   # Components for Influencer Discovery UIs
│   │   │   └── wizard/        # Components for the Campaign Creation Wizard
│   │   ├── core/              # Core application feature components (shared across multiple domains)
│   │   │   ├── error-handling/# Error boundary and fallback components
│   │   │   ├── loading/       # Loading indicators, skeletons
│   │   │   ├── search/        # Search input and result components
│   │   │   └── user/          # User profile, settings components
│   │   └── dashboard/         # Dashboard-specific composite components
│   │
│   ├── layouts/               # Reusable page layout structures (e.g., DashboardLayout, AuthLayout)
│   │   └── PageShell.tsx      # Common shell for page content with consistent padding/max-width
│   │
│   ├── providers/             # Global React Context providers (e.g., ThemeProvider, AuthProvider)
│   │                            # Note: Prefer Zustand for complex global state over Context.
│   └── ui/                    # Reusable, generic UI library components (Atomic Design inspired)
│       ├── atoms/             # Basic building blocks (Button, Input, Label) - Often from Shadcn/Radix
│       ├── molecules/         # Combinations of atoms (e.g., InputFieldWithLabel, SearchBar)
│       ├── organisms/         # More complex component assemblies (e.g., DataTable, PageHeader)
│       ├── icon/              # Centralised Icon component (e.g., using FontAwesome or custom SVGs)
│       ├── sonner.tsx         # Toast notifications (if using Sonner library)
│       └── index.ts           # Barrel file exporting all generally available UI components
│
├── config/                    # Application-level configuration consumed by src/ code (e.g., feature flags, site metadata)
│   └── site.ts                # Site metadata, navigation links, etc.
│
├── contexts/                  # React Context definitions (if not co-located with providers)
│                              # Prefer Zustand for global state; use Context for more localized state sharing.
│
├── hooks/                     # Custom React hooks, organized by domain
│   ├── api/                   # Hooks for data fetching, mutations (e.g., using TanStack Query)
│   ├── auth/                  # Hooks related to authentication state and actions
│   ├── form/                  # Hooks for form management and validation
│   └── ui/                    # Hooks for UI interactions or component-specific logic (e.g., useCopyToClipboard)
│
├── lib/                       # Core libraries, utility functions, external service clients, and type definitions
│   ├── auth/                  # Authentication utilities, Clerk/Auth0 configurations, session management
│   ├── constants/             # Application-wide constants (enums, magic strings/numbers)
│   ├── data-mapping/          # Data transformation logic (e.g., API response to UI model)
│   ├── db/                    # Database access layer (Prisma client instance, schema extensions, seeding logic)
│   ├── email/                 # Email sending services and templates
│   ├── logger/                # Centralized logging utility
│   ├── server/                # Server-only utilities (not to be imported into client components)
│   ├── stripe/                # Stripe integration utilities
│   └── utils.ts               # General utility functions (date formatting, string manipulation, clsx for classnames)
│
├── services/                  # Business logic services, encapsulating operations for specific domains
│                              # (e.g., CampaignService.ts, UserService.ts). These are typically used by API routes.
│
├── styles/                    # Global styles, Tailwind CSS base, components, and utilities overrides
│   └── globals.css            # Main global stylesheet for Tailwind
│
├── types/                     # Global TypeScript type definitions and interfaces (especially those shared across many domains)
│   └── index.d.ts             # General project-wide type declarations
│
└── middleware.ts              # Next.js middleware for request processing (e.g., authentication, redirects)
```

## `/config` Directory (Root Level)

While this document focuses on `src/`, it's important to note the root `/config` directory, which centralizes tool-specific configurations (ESLint, Prettier, TypeScript, Jest, etc.) and environment variable management. This separation keeps the project root cleaner and tool configurations organized.

Refer to `config/README.md` or `docs/configuration/README.md` (if it exists) for details on the `/config` directory structure.

## Key Principles & Rationale

- **Modularity & Separation of Concerns:** Code is grouped by feature (`components/features`, route groups in `app/`), technical concern (`lib/`, `hooks/`, `services/`), or reusability (`components/ui/`). This makes the codebase easier to understand, maintain, and scale.
- **Next.js App Router Conventions:** The `app/` directory follows Next.js conventions for routing, layouts, and API endpoints. Route groups `(folderName)` are used for organization without affecting URL paths.
- **Component Scopes:**
  - `components/ui/`: Presentational, highly reusable, generic UI elements.
  - `components/features/`: Implement specific business logic and workflows, composing UI components.
  - `components/layouts/`: Structure common page layouts.
  - `components/providers/`: Provide global context to the application.
- **Centralized Core Logic:**
  - `lib/`: Contains foundational utilities, client-side interaction with external services, and database interaction (Prisma).
  - `services/`: House more complex, domain-specific business logic, often orchestrated by API routes.
- **Hooks for Reusable Logic:** `hooks/` contains reusable stateful logic, especially for UI interactions, data fetching, and form handling.
- **Clear Naming Conventions:**
  - Directories: `kebab-case`.
  - Non-component files (.ts, .js): `kebab-case` (e.g., `user-service.ts`) or `PascalCase` if they export a primary class of the same name.
  - React Component files & directories: `PascalCase` (e.g., `UserProfile/index.tsx` or `UserProfile.tsx`).
  - Hooks: `useCamelCase.ts` (e.g., `useUserData.ts`).
- **Absolute Imports:** Use absolute path aliases (e.g., `@/components/ui/Button`) configured in `tsconfig.json` for cleaner and more maintainable imports.
- **Single Source of Truth (SSOT):**
  - Configuration is centralized in the root `/config` directory.
  - Prisma schema (`prisma/schema.prisma`) is the SSOT for database structure, influencing types via `npx prisma generate`.
  - Core reusable logic and type definitions are clearly located.
- **Scalability and Maintainability:** The structure is designed to accommodate a growing number of features and developers by providing clear boundaries and organization.

## Legacy Directories (To Be Removed)

The following directories within `src/components/` were part of a previous structure and are slated for removal. They may currently contain re-exports for backward compatibility, but **no new code should be added here.** Developers should update imports to point to the new locations as per the "Final Structure" above.

```text
src/components/
├── Brand-Lift/               # ⚠️ Use @/components/features/campaigns/brand-lift instead
├── Influencers/              # ⚠️ Use @/components/features/campaigns/influencers instead
├── Wizard/                   # ⚠️ Use @/components/features/campaigns/wizard instead
├── Search/                   # ⚠️ Use @/components/features/core/search instead
├── ErrorBoundary/            # ⚠️ Use @/components/features/core/error-handling instead
├── ErrorFallback/            # ⚠️ Use @/components/ui/ (or core/error-handling) instead
├── mmm/                      # ⚠️ Use @/components/features/analytics/mmm (or similar new location) instead
├── upload/                   # ⚠️ Use @/components/features/assets/upload (or similar new location) instead
├── gif/                      # ⚠️ Use @/components/features/assets/gif (or similar new location) instead
├── AssetPreview/             # ⚠️ Use @/components/features/assets (or similar new location) instead
└── LoadingSkeleton/          # ⚠️ Use @/components/features/core/loading instead
```

_Note: The exact new paths for some legacy items like `mmm`, `upload`, `gif`, `AssetPreview` should be confirmed as feature components are built out._ Migration efforts should include console warnings for deprecated import paths to guide developers.

## Import Path Conventions

To maintain consistency and readability in imports, follow these conventions:

1.  **Always use absolute imports with the `@/` prefix** for modules within the `src/` directory:

```typescript
// Good
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { userService } from '@/services/user-service';

// Bad (relative imports for intra-src modules)
// import { Button } from '../../components/ui/button';
```

2.  **Import from barrel files (`index.ts`) when available at a directory level** for cleaner imports of multiple items:

````typescript
 // Good (if atoms, molecules, organisms are exported from @/components/ui/index.ts)
 import { Button, Card, DataTable } from '@/components/ui';

 // Also Good (if importing specific items not necessarily in a barrel or for clarity)
 import { Button } from '@/components/ui/atoms/Button'; // Assuming Button is Cased
 import { UserProfileCard } from '@/components/features/user/UserProfileCard';
 ```

3.  **Avoid overly deep imports from other feature components.** If a component or utility from one feature module needs to be used by another, consider if it should be promoted to a more shared location (e.g., `components/core/`, `lib/utils.ts`, or a shared feature module like `components/features/common/`).
```typescript
 // Okay, if CampaignHeader is an intended public export of the 'campaigns' feature module
import { CampaignHeader } from '@/components/features/campaigns';

 // Avoid - too coupled to the internal structure of another feature
 // import { SpecificInternalTitle } from '@/components/features/campaigns/brand-lift/internal/SpecificInternalTitle';
 ```

_This document should be reviewed and updated as the project evolves. Adherence to this structure is crucial for maintaining a clean, understandable, and scalable codebase._
````

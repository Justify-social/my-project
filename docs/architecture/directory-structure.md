please now review /docs and every single file mark it out of 10 for SSOT and ease

# Directory Structure

This document outlines the primary directory structure for the project.

## Root Directory Overview

```text
/
├── config/         # Centralised configuration files (See docs/configuration/README.md)
├── docs/           # Project documentation (this directory)
├── .cache/         # Cache files (gitignored)
├── scripts/        # Utility and automation scripts (See docs/scripts/README.md)
├── src/            # Application source code (Detailed below)
├── archives/       # Archive of removed or deprecated files
├── tests/          # Centralised test suites (Unit, Integration, E2E)
└── public/         # Static assets served publicly
```

## `src/` Directory Structure (Application Code)

```text
src/
├── app/               # Next.js App Router: Routing, pages, layouts, API routes
│   ├── (groupings)/   # Route groups for organisation (e.g., (auth), (dashboard))
│   ├── api/           # API route handlers
│   └── layout.tsx     # Root application layout
├── components/        # React components
│   ├── features/      # Components implementing specific business features
│   │   └── [feature-name]/ # Components grouped by feature
│   ├── ui/            # Reusable UI library components (Atomic Design)
│   │   ├── atoms/     # Basic building blocks (Button, Input) - Primarily managed by Shadcn structure now
│   │   ├── molecules/ # Combinations of atoms (Card, Alert) - Primarily managed by Shadcn structure now
│   │   ├── organisms/ # Complex component assemblies (Header, DataTable) - Primarily managed by Shadcn structure now
│   │   ├── icon/      # Centralised Icon component using FontAwesome Pro
│   │   └── index.ts   # Barrel file exporting UI components
│   └── layouts/       # Page layout structures (e.g., SidebarLayout, AuthLayout)
├── contexts/          # React Context providers (Prefer Zustand for global state)
├── hooks/             # Custom React hooks (e.g., useAuth, useApi)
├── lib/               # Core libraries, utils shared across client/server, external service clients
│   ├── auth/          # Authentication utilities & configuration
│   ├── constants/     # Application-wide constants
│   ├── data-mapping/  # Data transformation logic (e.g., form -> API)
│   ├── db/            # Database access utilities (Prisma client)
│   ├── server/        # Server-only utilities
│   └── types/         # Shared TypeScript types/interfaces (Consider moving specific types closer to usage)
├── services/          # Business logic services (e.g., CampaignService, UserService)
├── styles/            # Global styles, Tailwind base/plugins
└── utils/             # General utility functions (date, string, validation etc.)
```

## Key Principles & Conventions

*   **Modularity:** Group code by feature (`components/features`) or technical concern (`lib`, `hooks`, `utils`).
*   **Clear Separation:** Distinguish between UI components (`components/ui`), feature logic (`components/features`, `services`), and core utilities (`lib`, `utils`).
*   **Naming:** Use `kebab-case` for directories and non-component files. Use `PascalCase` for React component files (e.g., `Button.tsx`).
*   **Imports:** Use absolute path aliases (`@/`) configured in `tsconfig.json`.
*   **SSOT:** Configuration is centralised in `/config`, type definitions leverage Prisma where possible, core logic resides in `/lib` and `/services`.

*For detailed UI component structure, see `docs/components/ui/README.md`.*
*For configuration details, see `docs/configuration/README.md`.*
*For script organisation, see `docs/scripts/README.md`.*

## Final Structure (Post-Unification)

```
src/
├── app/                       # Next.js App Router pages
│   ├── (auth)/                # Auth-related pages
│   ├── (campaigns)/           # Campaign-related pages
│   ├── (dashboard)/           # Dashboard pages
│   ├── api/                   # API routes
│   └── layout.tsx             # Root layout
├── components/                # React components
│   ├── features/              # Feature-specific components
│   │   ├── auth/              # Authentication components
│   │   ├── campaigns/         # Campaign-related components
│   │   │   ├── brand-lift/    # Brand lift campaign components
│   │   │   ├── influencers/   # Influencer campaign components
│   │   │   └── wizard/        # Campaign creation wizard
│   │   ├── core/              # Core feature components
│   │   │   ├── error-handling/# Error handling components
│   │   │   ├── search/        # Search components
│   │   │   └── user/          # User-related components
│   │   └── dashboard/         # Dashboard components
│   ├── ui/                    # UI components
│   │   ├── atoms/            # Atomic design: basic building blocks
│   │   ├── molecules/        # Atomic design: combinations of atoms
│   │   ├── organisms/        # Atomic design: complex components
│   │   ├── utils/            # UI utility functions
│   │   ├── deprecated/       # Legacy components (backward compatibility)
│   │   └── index.ts           # UI components barrel export
│   └── providers/             # Context providers
├── hooks/                     # Custom React hooks
│   ├── api/                   # API-related hooks
│   ├── auth/                  # Authentication hooks
│   ├── form/                  # Form-related hooks
│   └── ui/                    # UI-related hooks
├── lib/                       # Library code
│   ├── api/                   # API client functions
│   ├── auth/                  # Auth utilities
│   └── constants/             # Constants
├── utils/                     # Utility functions
│   ├── string/                # String utilities
│   ├── date/                  # Date utilities
│   ├── object/                # Object utilities
│   └── array/                 # Array utilities
├── styles/                    # Global styles
├── types/                     # TypeScript type definitions
└── middleware.ts              # Next.js middleware
```

## Legacy Directories (Scheduled for Removal)

The following directories are maintained temporarily for backward compatibility but should not be used for new code:

```
src/components/
├── Brand-Lift/               # ⚠️ Use @/components/features/campaigns/brand-lift instead
├── Influencers/              # ⚠️ Use @/components/features/campaigns/influencers instead
├── Wizard/                   # ⚠️ Use @/components/features/campaigns/wizard instead
├── Search/                   # ⚠️ Use @/components/features/core/search instead
├── ErrorBoundary/            # ⚠️ Use @/components/features/core/error-handling instead
├── ErrorFallback/            # ⚠️ Use @/components/ui/error-fallback instead
├── mmm/                      # ⚠️ Use @/components/features/analytics/mmm instead
├── upload/                   # ⚠️ Use @/components/features/assets/upload instead
├── gif/                      # ⚠️ Use @/components/features/assets/gif instead
├── AssetPreview/             # ⚠️ Use @/components/features/assets instead
└── LoadingSkeleton/          # ⚠️ Use @/components/features/core/loading instead
```

## Import Path Conventions

To maintain consistency in imports, follow these conventions:

1. Use absolute imports with the `@/` prefix:
   ```typescript
   import { Button } from '@/components/ui/button';
   import { useAuth } from '@/hooks/auth/useAuth';
   ```

2. Import from barrel files when available:
   ```typescript
   // Good
   import { Button, Card } from '@/components/ui';
   
   // Avoid multiple import lines when a barrel is available
   import { Button } from '@/components/ui/button';
   import { Card } from '@/components/ui/card';
   ```

3. Avoid deep imports from other feature components:
   ```typescript
   // Good - import from the feature boundary
   import { CampaignHeader } from '@/components/features/campaigns';
   
   // Avoid - too deeply coupled to internal structure
   import { HeaderTitle } from '@/components/features/campaigns/brand-lift/header/title';
   ```

## Component Organization Guidelines

### UI Components

UI components should be:
- Organized following atomic design principles (see detailed documentation in [docs/reference/ui/atomic-design-structure.md](/docs/reference/ui/atomic-design-structure.md))
- Reusable across the application
- Stateless or with minimal internal state
- Focused on presentation rather than business logic
- Located in `src/components/ui/`

### Feature Components

Feature components should:
- Implement specific business functionality
- Be organized by feature domain
- Located in `src/components/features/`
- May use UI components as building blocks

### Hooks

Custom hooks should:
- Follow the naming convention `use[Name]`
- Be categorized by their purpose (api, auth, form, ui, etc.)
- Located in `src/hooks/`

## Best Practices

1. **Component Structure**:
   - Each component should be in its own directory if it has multiple files
   - Include an `index.ts` file for exporting
   - Keep component files smaller than 300 lines when possible

2. **Documentation**:
   - Each component directory should include a README.md
   - Document component props and usage examples

3. **Testing**:
   - Place tests in a `__tests__` directory next to the component
   - Include test utilities in a `test` directory if needed

4. **Icons**:
   - Use the centralized icon system in `src/components/ui/icons`
   - Follow the SVG optimization guidelines

## Migration Plan

The legacy directories are now implemented with re-export files for backward compatibility:

1. **Phase 1** (Completed):
   - Create re-export files in legacy directories
   - Document legacy directories in `docs/legacy-directories.md`
   - Create import path updater script

2. **Phase 2** (Completed):
   - Run automated import path updates for known patterns
   - Fix missing imports where possible with `missing-imports-resolver.js`
   - Document remaining unresolved imports for manual intervention

3. **Phase 3** (Current):
   - ✅ Added console warnings for deprecated import paths
   - ✅ Created comprehensive documentation of the unified structure
   - 🔄 Planning for removal of legacy directories in upcoming sprints
   - 🔄 Final developer knowledge-sharing sessions scheduled

## Remaining Issues and Manual Intervention

Despite automated efforts, some imports require manual resolution:

1. **Unresolved Standard Library Imports**:
   - Most unresolved imports are for standard libraries like `react`, `next/navigation`, etc.
   - All components have been verified to include necessary imports
   - The `standard-imports-resolver.js` script can be run again if new files are created

2. **Deprecation Warnings**:
   - All legacy directories now include console warnings in development mode
   - Warnings provide clear guidance for migration to new paths
   - Developers should migrate imports upon encountering warnings

3. **Legacy Directory Timeline**:
   - Sprint 1-2: Monitor usage of deprecated imports through warnings
   - Sprint 3-4: Begin gradual removal of legacy directories
   - Sprint 5: Complete removal of all legacy directories

## Verification

Regular verification is essential to maintain the directory structure:

1. Automated Verification:
   - Run `scripts/directory-structure/phase7/final-verification.js` regularly to check for:
     - Import path consistency
     - Directory structure compliance
     - README completeness
     - Circular dependencies
     - Deprecated patterns

2. CI Integration:
   - The verification script has been integrated into the CI pipeline
   - Pull requests failing verification will be flagged for review

## Component Structure Progress

### UI Components Migration Status:

| Component    | Types | Styles | Component | Tests | Status      |
|--------------|:-----:|:------:|:---------:|:-----:|-------------|
| Alert        |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Button       |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Checkbox     |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Input        |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Select       |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Toast        |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Modal        |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Tabs         |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Card         |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Table        |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| Pagination   |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |
| DatePicker   |   ✅  |   ✅   |    ✅     |   🔄  | Completed   |

### UI Components Structure

```
src/components/ui/
├── alert/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── alert.styles.ts
│   ├── Alert.tsx
│   └── index.ts
├── button/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── button.styles.ts
│   ├── Button.tsx
│   └── index.ts
├── card/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── card.styles.ts
│   ├── Card.tsx
│   └── index.ts
├── checkbox/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── checkbox.styles.ts
│   ├── Checkbox.tsx
│   └── index.ts
├── date-picker/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── date-picker.styles.ts
│   ├── DatePicker.tsx
│   └── index.ts
├── input/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── input.styles.ts
│   ├── Input.tsx
│   └── index.ts
├── modal/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── modal.styles.ts
│   ├── Modal.tsx
│   └── index.ts
├── pagination/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── pagination.styles.ts
│   ├── Pagination.tsx
│   └── index.ts
├── radio/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── radio.styles.ts
│   ├── Radio.tsx
│   └── index.ts
├── select/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── select.styles.ts
│   ├── Select.tsx
│   └── index.ts
├── tabs/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── tabs.styles.ts
│   ├── Tabs.tsx
│   └── index.ts
├── table/
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── table.styles.ts
│   ├── Table.tsx
│   └── index.ts
└── toast/
    ├── types/
    │   └── index.ts
    ├── styles/
    │   └── toast.styles.ts
    ├── Toast.tsx
    └── index.ts
```
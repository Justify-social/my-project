# Directory Structure Planning

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
│   │   ├── button/            # Button components
│   │   ├── card/              # Card components
│   │   ├── form/              # Form components
│   │   ├── icons/             # Icon components
│   │   │   ├── core/          # Core icon system components
│   │   │   ├── brand/         # Brand-specific icons
│   │   │   ├── examples/      # Icon examples
│   │   │   └── test/          # Icon test utilities
│   │   ├── layout/            # Layout components
│   │   ├── typography/        # Typography components
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

| Component  | Types | Styles | Component | Tests | Status    |
| ---------- | :---: | :----: | :-------: | :---: | --------- |
| Alert      |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Button     |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Checkbox   |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Input      |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Select     |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Toast      |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Modal      |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Tabs       |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Card       |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Table      |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| Pagination |  ✅   |   ✅   |    ✅     |  🔄   | Completed |
| DatePicker |  ✅   |   ✅   |    ✅     |  🔄   | Completed |

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

## Implemented Components

- [x] Alert - An alert component for showing status messages
- [x] Button - A customizable button component
- [x] Card - A container component with multiple variants
- [x] Checkbox - A form input checkbox component
- [x] DatePicker - A component for selecting dates
- [x] Input - A text input component with validation
- [x] Modal - A dialog component for displaying content in a layer
- [x] Pagination - A component for navigating through paginated data
- [x] Radio - A radio button input component
- [x] Select - A dropdown selection component
- [x] Table - A data table component with sorting and pagination
- [x] Tabs - A tabbed navigation component
- [x] Toast - A notification component for temporary messages

## UI Components Migration Completion Summary

We have successfully completed the migration of all planned UI components to our new modular directory structure. This represents a major milestone in our codebase unification effort. The key achievements include:

1. **Standardized Component Architecture**

   - Every component now follows the same directory structure
   - Consistent separation of types, styles, and component logic
   - Standardized barrel files for cleaner imports

2. **Enhanced Type Safety**

   - Comprehensive TypeScript interfaces for all components
   - Improved developer experience with better IntelliSense support
   - Reduced potential for runtime errors

3. **Improved Style Management**

   - Consistent use of utility functions for styling
   - Better theme consistency across components
   - Easier customization points for future theming

4. **Automated Migration**

   - Created scripts to automate the migration of import statements
   - Ensured backward compatibility during the transition
   - Minimized manual effort required for adopting new components

5. **Documentation & Examples**
   - Added example usage for each component
   - Included thorough JSDoc comments
   - Created standalone example components where appropriate

## Feature Components Progress

| Feature Domain | Structure | Example Components | Migration Scripts | Identification | Migration |
| -------------- | :-------: | :----------------: | :---------------: | :------------: | :-------: |
| Campaigns      |    ✅     |         ✅         |        ✅         |       ✅       |    ✅     |
| Users          |    ✅     |         ✅         |        ✅         |       ✅       |    ✅     |
| Settings       |    ✅     |         ✅         |        ✅         |       ✅       |    ✅     |
| Dashboard      |    ✅     |         ✅         |        ✅         |       ✅       |    ✅     |

### Campaign Components Organization

```
src/components/features/campaigns/
├── wizard/
│   ├── steps/              # Step-specific components (5 step components migrated)
│   ├── audience-targeting/ # Audience targeting UI (completed)
│   ├── shared/             # Shared utilities (StepContentLoader migrated)
│   └── [core components]   # Main wizard components (WizardContext, WizardNavigation migrated)
├── analytics/              # Campaign analytics components
└── management/             # Campaign management components
```

## Final Unification Phase

## Overview

We're now implementing the final phase of the codebase unification project to address the remaining inconsistencies and establish best practices for long-term code quality. This phase builds upon the success of the previous phases and addresses additional requirements for a fully cohesive codebase.

## Key Objectives

### 1. Absolute Naming Consistency

All files and directories will follow the kebab-case naming convention, with the exception of React component files which will continue to use PascalCase (e.g., `Button.tsx`). This will ensure that:

- Import paths are predictable and consistent
- File organization is intuitive
- Auto-completion in editors works reliably

```
# Example of consistent naming

src/
├── components/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login-form/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── login-form.styles.ts
│   │   │   │   └── index.ts
```

### 2. Centralized Documentation

All documentation will be consolidated in the top-level `docs/` directory, following this structure:

```
docs/
├── architecture/            # System architecture documentation
├── components/              # Component documentation
├── guides/                  # User and developer guides
│   ├── developer/           # Developer guides
│   └── user/                # User guides
├── api/                     # API documentation
├── processes/               # Development processes
└── README.md                # Documentation index
```

### 3. Centralized Tests

All tests will be moved to a centralized `tests/` directory that mirrors the project structure:

```
tests/
├── unit/                    # Unit tests
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/             # Integration tests
│   ├── features/
│   └── api/
├── e2e/                     # End-to-end tests
│   └── flows/
└── README.md                # Testing documentation
```

### 4. Centralized Configuration

Configuration files will be moved to a dedicated `config/` directory:

```
config/
├── eslint/                  # ESLint configuration
├── jest/                    # Jest configuration
├── next/                    # Next.js configuration
├── tailwind/                # Tailwind configuration
└── README.md                # Configuration documentation
```

## Implementation Plan

The implementation of this final phase will be carried out through the following steps:

1. **Analysis and Planning**:

   - Create detailed reports for each task
   - Identify files and directories that need to be changed
   - Develop a migration strategy

2. **Documentation Consolidation**:

   - Move documentation from `doc/` to `docs/`
   - Create a comprehensive index
   - Update links in existing documentation

3. **Test Migration**:

   - Create the centralized test structure
   - Migrate tests from `src/__tests__/` to `tests/`
   - Update test scripts in package.json

4. **Configuration Centralization**:

   - Create the `config/` directory
   - Move configuration files
   - Update references in package.json and scripts

5. **Naming Conventions**:

   - Rename files and directories to follow kebab-case
   - Update import paths
   - Fix any issues caused by renaming

6. **Code Quality Improvements**:

   - Run linting and fix errors
   - Implement pre-commit hooks
   - Ensure CI/CD checks are in place

7. **Cleanup**:
   - Remove backup and unused files
   - Delete redundant scripts
   - Clean up temporary directories

## Timeline and Status

The implementation of this final phase is currently in progress, with an estimated completion date of [ESTIMATED_DATE]. The current status is:

- Documentation Consolidation: 🔄 In Progress
- Test Migration: 🔄 In Progress
- Configuration Centralization: 🔄 In Progress
- Naming Conventions: 🔄 In Progress
- Code Quality Improvements: 🔄 In Progress
- Cleanup: 🔄 In Progress

## Conclusion

The final phase of the codebase unification project will complete the transformation of our codebase into a fully consistent, maintainable, and developer-friendly structure. By addressing the remaining inconsistencies and establishing clear patterns and practices, we will ensure that the codebase continues to be easily maintainable and scalable as the project grows.

Upon completion, developers will benefit from:

- Clear, consistent organization of code and resources
- Comprehensive documentation in a central location
- Well-organized and easy-to-run tests
- Strong code quality enforcement
- Clean, optimized codebase with no redundancy

These improvements will significantly enhance developer productivity, reduce onboarding time for new team members, and ensure the long-term maintainability of the project.

# Core Libraries, Services & Utilities

**Last Reviewed:** 2025-05-09

This document describes the purpose and conventions for key directories within the `src/` folder that house our core libraries, services, utility functions, custom hooks, and application-level configurations. Understanding these distinctions is vital for maintaining a well-organized and maintainable codebase.

Refer to the main **[Directory Structure](./directory-structure.md)** document for the complete overview of the codebase layout.

## 1. `src/lib/`

- **Purpose**: The `src/lib/` directory is intended for foundational code, core utility functions, client-side logic for interacting with external services/SDKs, database access configuration, and shared type definitions that are broadly applicable across the application (both client and server contexts, unless specified in subdirectories like `src/lib/server/`). Code here should generally be reusable and not tied to specific feature UI or complex business workflows.
- **Subdirectories & Examples**:
  - `src/lib/auth/`: Utilities for Clerk authentication, session management helpers (like `src/lib/session.ts`).
  - `src/lib/constants/`: Application-wide constants (e.g., `config/core/constants.js` might be refactored here or kept in `src/config`).
  - `src/lib/data-mapping/`: Functions for transforming data structures (e.g., `schema-mapping.ts`, `influencer.ts`).
  - `src/lib/db/` or `src/lib/prisma/`: Prisma client instantiation (`src/lib/prisma.ts`) and potentially base database utilities or seeding logic.
  - `src/lib/email/`: Utilities for interacting with the email service (e.g., Resend).
  - `src/lib/logger/`: Centralized logging setup.
  - `src/lib/middleware/`: **API Route specific middleware helpers** (validation, error handling). Note: This is distinct from the main `src/middleware.ts` Edge middleware.
  - `src/lib/server/`: Utilities guaranteed to run only on the server.
  - `src/lib/stripe/`: Utilities for interacting with the Stripe API/SDK.
  - `src/lib/insightiqService.ts` (Example): Client/SDK for interacting with the InsightIQ API.
  - `src/lib/scoringService.ts` (Example): Contains logic for calculating Justify scores.
  - `src/lib/utils.ts`: Common, generic utility functions (date formatting, string manipulation, `clsx`, etc.).
- **Key Considerations**:
  - Code should be well-tested and stable.
  - Avoid feature-specific UI logic or complex business workflows.
  - Aim for clear, reusable functions/modules.
  - Be mindful of client/server boundaries; use `server-only` or `client-only` packages if needed, or place server-only code in `src/lib/server/`.

## 2. `src/services/`

- **Purpose**: Encapsulates domain-specific business logic operations. Services act as a layer between API route handlers (or Server Components) and the underlying data access (`src/lib/db`) or external service interactions (`src/lib/insightiqService.ts`, etc.). They orchestrate multiple steps to fulfill a specific business use case.
- **Characteristics**: Primarily server-side, should be testable in isolation (dependencies like Prisma client can be mocked).
- **Examples**:
  - `src/services/influencer/index.ts`: Contains logic like `getProcessedInfluencerList` which fetches from InsightIQ, calculates scores via `scoringService`, maps data, applies filters, and potentially interacts with the `MarketplaceInfluencer` model via Prisma.
  - `src/services/BrandLiftService.ts` (_Assumed_): Would handle creating studies in the DB, interacting with the Cint API, processing responses, triggering report generation.
  - `UserService.ts` (_Assumed_): Logic for user profile updates, managing team memberships, coordinating with Clerk via webhooks or API.
- **Key Considerations**:
  - Should not contain direct request/response handling (that belongs in API routes).
  - Should not directly interact with UI components.
  - Organize by domain/resource (e.g., `campaignService.ts`, `userService.ts`).

## 3. `src/hooks/`

- **Purpose**: Contains custom React hooks (`useSomething`) to encapsulate and reuse stateful logic, side effects, or complex interactions within **Client Components**.
- **Subdirectories & Examples**:
  - `src/hooks/api/`: Hooks simplifying data fetching/mutation with TanStack Query (e.g., `useCampaigns`, `useUpdateProfile`).
  - `src/hooks/auth/`: Hooks for accessing Clerk auth state (`useAuth`, `useUser`) or custom auth-related logic.
  - `src/hooks/form/`: Hooks to assist with complex form state or interactions beyond standard React Hook Form usage.
  - `src/hooks/ui/`: Hooks related to UI state or interactions (e.g., `useDisclosure`, `useMediaQuery`, `useToast`).
- **Key Considerations**:
  - Follow the Rules of Hooks.
  - Hooks are for the **client-side** (`'use client'`).
  - Keep hooks focused on a single piece of logic.
  - Should not typically contain complex business logic (that belongs in services).

## 4. `src/config/` (Application Source Configuration)

- **Purpose**: Holds configuration files _directly consumed by the application source code_ (distinct from the root `/config` which holds toolchain config).
- **Examples**:
  - `src/config/site.ts`: Site metadata, navigation structure definitions.
  - `src/config/featureFlags.ts`: Definitions for application feature flags.
- **Key Considerations**:
  - Should contain static configuration data, not executable logic.
  - Do not store secrets here; use environment variables.

## 5. `src/utils/` (Deprecated / Specific Use Only)

- **Status**: Largely deprecated in favor of `src/lib/utils.ts` or co-location.
- **Permitted Use**: May contain highly specific utilities used only within a narrow scope where co-location inside a feature/component directory is not practical, _and_ the utility doesn't belong in `src/lib`. Requires careful consideration.
- **Recommendation**: Place new generic utilities in `src/lib/utils.ts`. Place domain-specific utilities within the relevant `src/lib/[domain]/` or `src/features/[feature]/utils.ts` directory.

By adhering to these structural guidelines for core logic, utilities, and stateful hooks, we aim to create a codebase that is easier to navigate, test, and maintain.

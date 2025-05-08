# Module Architecture & Interaction Patterns

**Last Reviewed:** 2025-05-09

## 1. Overview

This document provides a comprehensive overview of the application's module structure, interactions, dependency rules, and key architectural patterns. It serves as a guide for understanding how different parts of the system work together and how they should interact.

Refer to the **[Directory Structure](./directory-structure.md)** document for the detailed layout of these modules.

## 2. Core Module Structure Overview

The application follows a modular architecture with clear separation of concerns:

```text
src/
├── app/                # Next.js App Router pages and API routes
├── components/         # React components organized by scope (features, ui, layouts, providers)
├── hooks/              # Custom React hooks
├── lib/                # Core libraries, utilities, DB access, external service clients
├── services/           # Domain-specific business logic services (primarily server-side)
├── config/             # Application source code configurations (e.g., site metadata)
├── contexts/           # Context definitions (if not co-located with providers)
├── styles/             # Global styles
├── types/              # Shared TypeScript type definitions
└── middleware.ts       # Next.js Edge middleware
```

## 3. Module Interactions & Data Flow

### 3.1. Typical Request/Response Flow (Simplified)

1.  **Client Interaction**: User action triggers a client component.
2.  **Client State/Hooks**: Component uses hooks (`useState`, `useContext`, `useRouter`, Zustand hooks) for local UI state or shared client state.
3.  **Data Fetching/Mutation**: If server data is needed, the component (or a custom hook it uses) triggers a fetch/mutation, often using TanStack Query (`useQuery`, `useMutation`).
4.  **API Request**: The fetcher function (used by TanStack Query) makes an API call to a Next.js API Route (`/src/app/api/...`).
5.  **Edge Middleware (`middleware.ts`)**: Request may first pass through Edge middleware for checks like authentication.
6.  **API Route Handler**: The corresponding `route.ts` file handles the request.
7.  **API Middleware Helpers**: The handler might use helpers from `src/lib/middleware/` for validation, error handling, etc.
8.  **Service Layer (`services/`)**: The handler calls appropriate service functions to execute business logic.
9.  **Library Layer (`lib/`)**: Services utilize libraries for tasks like database access (`lib/db`), interacting with external SDKs (e.g., `lib/stripe`), or core utilities (`lib/utils.ts`).
10. **Response**: The API route returns a JSON response (via `NextResponse.json`).
11. **Client Update**: TanStack Query receives the response, updates its cache, and re-renders the relevant client components with the new data or status.

### 3.2. Conceptual Diagram

```mermaid
graph LR
    A[Client Component (UI)] --> B{Hooks (React, Zustand, TanStack Query)};
    B --> C{Client State (Zustand Store)};
    B --> D[API Request (fetch)];
    D --> E{Edge Middleware (middleware.ts)};
    E --> F[API Route Handler (app/api/.../route.ts)];
    F --> G[API Middleware Helpers (lib/middleware)];
    G --> F; # Helpers applied within handler
    F --> H{Service Layer (services/*)};
    H --> I{Library Layer (lib/*)};
    I --> J[Database (Prisma)];
    I --> K[External APIs (Clerk, Stripe, etc.)];
    J --> I;
    K --> I;
    I --> H;
    H --> F;
    F --> L[API Response (JSON)];
    L --> B; # Data returned to TanStack Query

    subgraph Browser
        A
        B
        C
        D
    end

    subgraph Server / Vercel
        E
        F
        G
        H
        I
        J
        K
        L
    end
```

## 4. Module Dependency Rules

To maintain a clean, scalable, and testable architecture, we enforce the following dependency rules between key module types within `src/`. **Violation of these rules should be flagged during code review.**

- **`components/ui/` (UI Library)**

  - **Can Depend On**: `lib/` (e.g., utils, types, constants), `hooks/ui/`, `types/`, `styles/`, `assets/`.
  - **Should NOT Depend On**: `components/features/`, `components/layouts/`, `services/`, `app/` (except potentially types imported via alias).
  - _Rationale_: UI library components must be generic, reusable, and presentation-focused, without knowledge of specific features or application pages.

- **`components/features/` (Feature Components)**

  - **Can Depend On**: `components/ui/`, `lib/`, `hooks/` (all kinds), `types/`, `styles/`, `assets/`, `config/`, `contexts/` (or providers).
  - **Should NOT Depend On**: `services/` (directly - prefer calling hooks that use services), `app/` (except types/routing constants), other specific feature components in different domains (promote shared logic to `core/` or `lib/` if needed).
  - _Rationale_: Feature components implement business logic for a specific domain, composing UI elements and interacting with data via hooks. They should remain decoupled from direct service layer calls and other unrelated features.

- **`components/layouts/` (Layout Components)**

  - **Can Depend On**: `components/ui/`, `components/features/` (sparingly, e.g., a User Profile button in a header), `lib/`, `hooks/`, `types/`, `styles/`, `assets/`, `config/`, `contexts/` (or providers).
  - **Should NOT Depend On**: `services/`, `app/` (except types/routing constants).
  - _Rationale_: Layouts structure pages and often need access to UI elements and potentially some core feature components or context.

- **`hooks/` (Custom Hooks)**

  - **Can Depend On**: `lib/`, `types/`, `services/` (especially API hooks), `contexts/` (or Zustand stores), other hooks.
  - **Should NOT Depend On**: `components/` (any kind), `app/`.
  - _Rationale_: Hooks encapsulate reusable logic and should be independent of specific UI components or pages.

- **`services/` (Business Logic Services)**

  - **Can Depend On**: `lib/` (especially `db`, external API clients, utils), `types/`.
  - **Should NOT Depend On**: `components/` (any kind), `hooks/`, `app/`, `contexts/`, `config/`.
  - _Rationale_: Services contain pure business logic, primarily for server-side use, and must remain decoupled from the presentation layer and request/response lifecycle (which is handled by API routes).

- **`lib/` (Core Libraries & Utilities)**

  - **Can Depend On**: `types/`, other parts of `lib/` (with care to avoid circular dependencies).
  - **Should NOT Depend On**: `components/` (any kind), `hooks/`, `services/`, `app/`, `contexts/`, `config/`, `styles/`.
  - _Rationale_: `lib` provides foundational, generic utilities and should have minimal external dependencies within `src/`.

- **`app/` (Routing, Pages, API Routes)**

  - **Can Depend On**: All other directories (`components/`, `hooks/`, `lib/`, `services/`, `types/`, `styles/`, `assets/`, `config/`, `contexts/`).
  - **Should NOT Depend On**: (N/A - This is the top level orchestrator).
  - _Rationale_: Pages and API routes compose components, call hooks, and orchestrate services to handle requests and render UI.

- **General Rule**: Avoid circular dependencies between any modules. Tools like ESLint plugins (`eslint-plugin-import`) can help detect these.

## 5. Key Architectural Patterns Summary

- **Component Architecture**: Separation into UI, Feature, and Layout components (See **[Directory Structure](./directory-structure.md)** for details).
- **State Management**: TanStack Query for server state, Zustand for client state (See **[State Management Strategy](./state-management.md)**).
- **Middleware**: Edge Middleware (`src/middleware.ts`) for routing/auth checks, API Route Helpers (`src/lib/middleware/`) for validation/error handling within endpoints (See **[Middleware Architecture](./middleware.md)**).
- **API Design**: RESTful principles for API routes in `src/app/api/`, utilizing services for business logic (See **[API Design Standards](../standards/api-design.md)** - _placeholder link_).

## 6. Conclusion

Adherence to these module boundaries and interaction patterns is crucial for:

1.  **Scalability**: Allowing new features to be added with minimal impact on existing code.
2.  **Maintainability**: Making the codebase easier to understand, debug, and refactor.
3.  **Testability**: Enabling modules (especially services, libraries, and UI components) to be tested in isolation.
4.  **Developer Experience**: Providing clear guidelines and reducing cognitive load when navigating the codebase.

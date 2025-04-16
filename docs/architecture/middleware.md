# Middleware Architecture

## Overview

Middleware plays a crucial role in this application, handling cross-cutting concerns like authentication, request validation, error handling, and data transformation, particularly for API routes. This document outlines the structure, location, and usage patterns for middleware components.

## Single Source of Truth (SSOT) & Location

**Principle:** All application-specific code, including middleware helpers and utilities used within API routes or server components, resides within the `/src` directory. Middleware specifically designed for API routes should be located under `/src/lib/middleware/`.

**Rationale:**
*   **Collocation:** Keeps related utilities together within the standard application source directory.
*   **Clarity:** Provides a clear separation between application logic (`/src`) and project configuration (`/config`, `/scripts`, etc.).
*   **Next.js Conventions:** Aligns with standard Next.js project structures and simplifies path aliasing (`@/lib/...`).
*   **Maintainability:** Reduces ambiguity and potential path resolution issues previously encountered when middleware was located outside `/src`.

**Key Locations:**

1.  **Edge Middleware:** `src/middleware.ts`
    *   This is the standard Next.js middleware file.
    *   Runs on the Edge runtime before requests are processed by specific pages or API routes.
    *   Primarily used for authentication checks (e.g., redirecting unauthenticated users), routing logic, and setting request headers.
2.  **API Route Middleware Helpers:** `src/lib/middleware/`
    *   Contains helper functions and higher-order functions (HOFs) used *within* API route handlers (`src/app/api/**/route.ts`).
    *   These are **not** run automatically by Next.js but are explicitly imported and applied by developers within the route handlers.
    *   Organized into subdirectories based on functionality.

## Middleware Directory (`src/lib/middleware/`)

This directory contains utilities specifically designed to be used within API route handlers.

*   **`api/`**: General-purpose middleware for API routes.
    *   `index.ts`: Re-exports core helpers (`withValidation`, `tryCatch`, `handleDbError`) from subdirectories.
    *   **`validation/`**: Contains middleware related to request validation.
        *   `validate-api.ts`: Provides `withValidation` HOF.
        *   `validate-request.ts`: (Other validation helpers).
    *   **`errorHandling/`**: Contains middleware related to error handling and formatting.
        *   `handle-api-errors.ts`: Provides `tryCatch` HOF.
        *   `handle-db-errors.ts`: Provides `handleDbError` function.
    *   `check-permissions.ts`: (Helpers for permission checks - import directly via path).
    *   `api-response-middleware.ts`: (Helpers for standardizing API responses - import directly via path).
    *   `util-middleware.ts`: (Miscellaneous utility middleware - import directly via path).
*   **`cursor-ai/`**: Middleware specifically related to Cursor AI integration.
    *   `index.ts`: Exports Cursor AI middleware functions (`graphitiCheckEnforcer`, `getGraphitiTelemetry`).
    *   `graphiti-check-enforcer.ts`: Contains core logic.

## Usage Patterns

1.  **Edge Middleware (`src/middleware.ts`):**
    *   This file exports a `middleware` function and optionally a `config` object to specify the `matcher` (which routes the middleware applies to).
    *   Next.js automatically invokes this based on the matcher.
    *   Example (`src/middleware.ts`):
        ```typescript
        import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

        const isProtectedRoute = createRouteMatcher([
          '/dashboard(.*)', // Protect dashboard routes
          '/settings(.*)', // Protect settings routes
          '/api/(.*)'      // Protect most API routes (adjust as needed)
        ]);

        export default clerkMiddleware((auth, req) => {
          if (isProtectedRoute(req)) {
            auth().protect(); // Protect routes that match
          }
        });

        export const config = {
          matcher: ['/((?!.*\..*|_next).*)', '/', '/(api|trpc)(.*)'],
        };
        ```

2.  **API Route Middleware Helpers (`src/lib/middleware/...`):**
    *   These are typically Higher-Order Functions (HOFs) or utility functions imported into `route.ts` files.
    *   **HOFs (Wrapping Handlers):** Functions like `tryCatch` or `withValidation` wrap the exported route handler. These are typically imported from the main index file (`@/lib/middleware/api`).
        ```typescript
        // src/app/api/some-resource/route.ts
        import { withValidation, tryCatch } from '@/lib/middleware/api';
        import { someSchema } from '@/lib/schemas';

        export const POST = tryCatch(
          withValidation(someSchema,
            async (validatedData, request) => {
              // ... handler logic ...
            }
          )
        );
        ```
    *   **Utility Functions (Inside Handlers):** Functions like `handleDbError` are called within `try...catch` blocks. These are also typically imported from the main index file (`@/lib/middleware/api`). Less common helpers might be imported directly from their specific file (e.g., `@/lib/middleware/api/check-permissions`).
        ```typescript
        // src/app/api/other-resource/route.ts
        import { handleDbError } from '@/lib/middleware/api';
        import { DbOperation } from '@/lib/data-mapping/db-logger';

        export async function GET(request: NextRequest) {
          try {
            // ... database operation ...
          } catch (error) {
            return handleDbError(error, 'Resource', DbOperation.FETCH);
          }
        }
        ```

## Troubleshooting

*   **Module Not Found Errors:** Ensure imports use the correct alias (`@/lib/middleware/api` for re-exported functions, or the specific path like `@/lib/middleware/api/validation/validate-request` for others). Verify middleware files exist in the correct subdirectories within `src/lib/middleware/` and that `index.ts` files correctly export/re-export needed functions.
*   **Type Errors:** Ensure route handlers wrapped in HOFs (like `tryCatch`, `withValidation`) still conform to the expected Next.js `RouteHandler` signature. Sometimes HOFs might alter the expected function signature if not implemented carefully. If a handler is wrapped, ensure the wrapper function correctly returns a `NextResponse` or `Promise<NextResponse>`.

By adhering to the SSOT principle of keeping middleware within `/src/lib/middleware` and using the standard `@/` alias, we aim for a more robust and maintainable middleware structure.

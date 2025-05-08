# Middleware Architecture

**Last Reviewed:** 2025-05-09

## 1. Overview

Middleware in this application serves two primary purposes:

1.  **Edge Middleware (`src/middleware.ts`):** Intercepts requests at the Edge before they hit the main application code. Used for broad concerns like authentication, redirects, and setting request headers.
2.  **API Route Middleware Helpers (`src/lib/middleware/`)**: Utility functions and Higher-Order Functions (HOFs) applied _within_ specific API route handlers (`src/app/api/**/route.ts`) to handle tasks like request validation, error handling, and permission checks.

This document outlines the structure, location, and usage patterns for both types.

## 2. Edge Middleware (`src/middleware.ts`)

- **Location**: `src/middleware.ts` (Project Root Level `src` directory)
- **Runtime**: Vercel Edge Functions / Node.js (depending on configuration/usage).
- **Purpose**: Handles cross-cutting concerns before requests reach specific pages or API routes.
  - **Authentication**: Redirecting unauthenticated users from protected routes (using Clerk's `clerkMiddleware`).
  - **Routing**: Implementing simple redirects or A/B testing logic.
  - **Request Headers**: Adding or modifying request headers.
- **Execution**: Next.js automatically invokes this middleware based on the `matcher` defined in the exported `config` object.
- **Example (`src/middleware.ts`)**: (Illustrative - Refer to actual file for implementation)

  ```typescript
  import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

  // Define public routes that DON'T require authentication
  const isPublicRoute = createRouteMatcher([
    '/', // Example: landing page
    '/api/webhooks/(.*)', // Allow webhooks
    '/sign-in(.*)',
    '/sign-up(.*)',
  ]);

  export default clerkMiddleware((auth, req) => {
    // Protect all routes that are not public
    if (!isPublicRoute(req)) {
      auth().protect();
    }
  });

  export const config = {
    matcher: [
      // Standard matcher to exclude static files, _next internal files, etc.
      '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
      // Apply middleware to API routes
      '/(api|trpc)(.*)',
    ],
  };
  ```

## 3. API Route Middleware Helpers (`src/lib/middleware/`)

- **Location**: `src/lib/middleware/` (Organized into subdirectories like `api/`, `validation/`, `errorHandling/`).
- **Runtime**: Node.js (within the API route handler's environment).
- **Purpose**: Provides reusable logic specifically for use _within_ API route handlers (`route.ts` files) to structure request processing.
  - **Validation (`withValidation`)**: Validating request bodies or parameters against Zod schemas.
  - **Error Handling (`tryCatch`, `handleDbError`)**: Standardizing error responses, especially for database errors or common exceptions.
  - **Permissions (`checkPermissions` - example)**: Checking if the authenticated user has the necessary permissions for the requested operation.
  - **Response Formatting**: Ensuring consistent API response structures.
- **Execution**: These are **not** automatically invoked by Next.js. Developers explicitly import and apply these helper functions or HOFs within their `route.ts` handlers.
- **Organization**: Helpers are grouped by function within `src/lib/middleware/api/`, and core utilities are often re-exported from `src/lib/middleware/api/index.ts` for convenience.
- **Usage Patterns**:

  - **HOFs (Wrapping Handlers):** Functions like `tryCatch` or `withValidation` wrap the exported route handler.

  ```typescript
  // src/app/api/some-resource/route.ts
  import { withValidation, tryCatch } from '@/lib/middleware/api'; // Import re-exported helpers
  import { someSchema } from '@/lib/schemas';

  // Wrap the handler with validation and error catching
  export const POST = tryCatch(
    withValidation(someSchema, async (validatedData, request) => {
      // Handler logic using validatedData...
      // ...
      return NextResponse.json({ success: true /* ... */ });
    })
  );
  ```

  - **Utility Functions (Inside Handlers):** Functions like `handleDbError` are typically called within `try...catch` blocks inside the handler logic.

  ```typescript
  // src/app/api/other-resource/route.ts
  import { handleDbError } from '@/lib/middleware/api'; // Import re-exported helper
  import { DbOperation } from '@/lib/data-mapping/db-logger';
  import { prisma } from '@/lib/db';
  import { NextResponse } from 'next/server';

  export async function GET(request: NextRequest) {
    try {
      const data = await prisma.resource.findMany();
      return NextResponse.json({ success: true, data });
    } catch (error) {
      // Use helper to format DB errors
      return handleDbError(error, 'Resource', DbOperation.FETCH);
    }
  }
  ```

## 4. Rationale for Separation

Keeping the Edge middleware (`src/middleware.ts`) separate from the API route helpers (`src/lib/middleware/`) provides clarity:

- `src/middleware.ts` focuses on **request interception** and broad concerns before specific route logic runs.
- `src/lib/middleware/` focuses on **reusable logic blocks** applied explicitly within the detailed processing of specific API endpoints.

This separation aligns with Next.js conventions and promotes a structured approach to handling different stages of request processing.

## 5. Troubleshooting

- **Middleware Not Running**: Check the `matcher` in `src/middleware.ts`. Ensure it correctly includes the routes you expect the Edge middleware to run on. Check server logs for errors during middleware execution.
- **API Helper Errors**: Ensure correct import paths (`@/lib/middleware/api/...`). Check for errors within the helper function logic itself or within the API route handler where it's applied.
- **Type Errors**: Ensure Zod schemas used with `withValidation` match the expected request body structure. Ensure types are consistent between the helper functions and the route handlers.

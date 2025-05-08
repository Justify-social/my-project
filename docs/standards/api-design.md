# API Design Standards

**Last Reviewed:** 2025-05-08
**Status:** Active

## 1. Introduction

This document outlines the standards and best practices for designing, implementing, and maintaining APIs within the Justify platform. Adherence to these guidelines is crucial for ensuring consistency, predictability, security, and maintainability across all our API endpoints.

Our APIs serve as the primary interface for frontend applications, mobile clients (future), and potentially third-party integrations. A well-designed API surface significantly improves developer experience and system robustness.

## 2. General Principles

- **Clarity & Predictability:** API endpoints and their request/response structures should be intuitive and predictable. Use clear, consistent naming conventions.
- **Simplicity:** Favor simple, focused endpoints over overly complex ones.
- **Statelessness:** APIs should be stateless. Each request from a client must contain all information needed to understand and process the request. Do not rely on server-side session state between requests.
- **Security by Design:** Implement security best practices at all stages of API design and development.
- **Efficiency:** Design APIs to be efficient, minimizing unnecessary data transfer and processing. Utilize Prisma's `select` to fetch only required fields.
- **Consistency:** Apply these standards uniformly across all APIs.

## 3. Framework & Routing

- **Framework:** All backend APIs are built using the Next.js App Router.
- **Location:** API route handlers must be located within the `src/app/api/` directory.
- **File Naming:** Each route handler file must be named `route.ts`.
- **Directory Structure:** Organize API routes into logical subdirectories based on resource or functionality (e.g., `/api/campaigns`, `/api/users`).
- **HTTP Methods:**
  - Export route handlers as named asynchronous functions corresponding to HTTP methods (e.g., `export async function GET(request: NextRequest) { ... }`).
  - Supported methods generally include `GET`, `POST`, `PATCH` (or `PUT` if full replacement), and `DELETE`.
- **Request/Response Objects:** Utilize `NextRequest` and `NextResponse` from `next/server` for handling requests and formulating responses.

```typescript
// Example: src/app/api/example-resource/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // ... logic to fetch resource by params.id
  return NextResponse.json({ success: true, data: { id: params.id, name: 'Example' } });
}
```

## 4. Request Handling

### 4.1. Validation

- **Mandatory Validation:** All incoming request data (bodies, query parameters, URL parameters) MUST be validated.
- **Validation Library:** `zod` is the standard library for schema definition and validation.
- **Schema Definition:** Define clear, specific `zod` schemas for each endpoint's expected request structure.
- **Parsing & Error Handling:**
  - Use `schema.safeParse(data)` to validate.
  - If validation fails, return a `400 Bad Request` status with a standardized error response (see Section 5.2). Include detailed error messages from Zod's `.format()` method in the `details` field of the error response.

```typescript
// Example: zod schema and validation
import { z } from 'zod';
// ... imports ...
import { handleApiError } from '@/lib/apiErrorHandler'; // Assuming this handles ZodError
import logger from '@/lib/logger';

const createResourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createResourceSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('API Validation Error: Create Resource', {
        errors: validationResult.error.format(),
        url: request.url,
      });
      // Throwing a ZodError or custom BadRequestError that handleApiError can process
      throw validationResult.error; // Or: new BadRequestError('Validation failed', validationResult.error.format());
    }

    const { name, description } = validationResult.data;
    // ... logic to create resource
    return NextResponse.json(
      { success: true, data: { id: 'new-id', name, description } },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
```

### 4.2. Request Body Parsing

- For `POST`, `PATCH`, `PUT` requests with a JSON body, use `await request.json()`.
- If the request stream needs to be consumed multiple times (e.g., for logging and processing), use `const clone = request.clone(); const body = await clone.json();`.

## 5. Response Structure

### 5.1. Success Responses

- **Format:** Standardized JSON structure.
- **Structure:**
  ```json
  {
    "success": true,
    "data": {}, // or [] or null
    "message": "Operation successful" // Optional, for user-facing messages if applicable
  }
  ```
- **HTTP Status Codes:**
  - `200 OK`: General success for `GET`, `PATCH`, `PUT`.
  - `201 Created`: For successful `POST` requests that create a new resource. The created resource (or a reference to it) should be in the `data` field.
  - `204 No Content`: For successful `DELETE` requests where no body is returned. (Alternatively, return a `200 OK` with a confirmation message/data).

### 5.2. Error Responses

- **Format:** Standardized JSON structure.
- **Centralized Handling:** Use the shared `handleApiError` utility (e.g., from `@/lib/apiErrorHandler`) within `catch` blocks to ensure consistent error formatting and logging.
- **Custom Error Classes:** Utilize custom error classes (e.g., `BadRequestError`, `UnauthenticatedError`, `ForbiddenError`, `NotFoundError` from `@/lib/errors`) to provide semantic meaning and allow `handleApiError` to determine appropriate status codes and responses.
- **Structure (Client Errors, e.g., Validation):**
  ```json
  {
    "success": false,
    "error": "Brief error message (e.g., Validation failed)",
    "details": {} // Optional: Detailed validation errors, e.g., from zod.format()
  }
  ```
- **Structure (Server Errors):**
  ```json
  {
    "success": false,
    "error": "A user-friendly error message (e.g., Internal Server Error, An unexpected error occurred)",
    "referenceId": "trace-id-if-available" // Optional: for support
  }
  ```
  (Internal details of server errors should be logged, not exposed to the client unless necessary for debugging specific, non-sensitive issues).
- **HTTP Status Codes (Common):**
  - `400 Bad Request`: Invalid syntax, validation errors.
  - `401 Unauthorized`: Authentication is required and has failed or has not yet been provided.
  - `403 Forbidden`: Authenticated user does not have permission to access the resource.
  - `404 Not Found`: The requested resource could not be found.
  - `500 Internal Server Error`: A generic error message for unexpected server conditions.
  - `503 Service Unavailable`: The server is currently unable to handle the request due to temporary overloading or maintenance (e.g., database health check failing).

## 6. Authentication & Authorization

- **Authentication:** Clerk (`auth()` or `getAuth()` from `@clerk/nextjs/server`) is the standard for authenticating users.
  - All endpoints requiring authentication MUST verify the user's identity.
  - If authentication fails or is missing, throw an `UnauthenticatedError` or return a `401 Unauthorized` status.
- **Authorization:**
  - After authentication, verify if the authenticated user has the necessary permissions for the requested operation or resource.
  - Database queries MUST be scoped by `userId` and/or `orgId` where appropriate to enforce data tenancy and access control.
  - For mutation operations (POST, PATCH, DELETE), ensure the user has ownership or explicit permission to modify the target resource.
  - If authorization fails, throw a `ForbiddenError` or return a `403 Forbidden` status.

## 7. Data Handling & Database Interaction

- **ORM:** Prisma is the standard ORM. Use the Prisma Client instance from `@/lib/db` or `@/lib/prisma`.
- **Data Minimization:** Use Prisma's `select` or `include` options judiciously to fetch only the data necessary for the API response. Avoid over-fetching.
- **Atomic Operations:** For operations that involve multiple database writes that must succeed or fail together, use Prisma's `$transaction` API.
- **Data Transformation:** If data needs transformation between the database representation and API response/request (e.g., enum mapping, date formatting not handled by Prisma), use dedicated utility functions (e.g., observed `EnumTransformers`). Keep transformation logic separate from route handler core logic where possible.
- **Sensitive Data:** Be mindful of sensitive data. Do not expose internal IDs or sensitive fields unless strictly necessary for the API's consumer.

## 8. Error Handling (Server-Side Implementation)

- **`try...catch` Blocks:** Wrap main route handler logic in `try...catch` blocks.
- **`tryCatch` Utility:** Consider using the shared `tryCatch` utility middleware (e.g., from `@/lib/middleware/api/util-middleware`) to standardize error trapping around handlers.
- **Centralized Handler:** Delegate error response formatting and logging to `handleApiError`.
- **Specific vs. Generic Errors:** Throw specific custom errors (e.g., `NotFoundError`) when the cause is known. Let `handleApiError` translate these into appropriate client responses. For unknown errors, `handleApiError` should default to a generic 500-level response.

## 9. Logging

- **Standard Logger:** Use the shared logger instance (e.g., from `@/lib/logger`) for all API-related logging.
- **Contextual Information:** Logs MUST include relevant contextual information such as `userId`, `orgId`, request URL, method, relevant business identifiers (e.g., `campaignId`), and error details/stacks.
- **Log Levels:** Use appropriate log levels (`INFO`, `WARN`, `ERROR`).
  - `INFO`: Successful operations, key checkpoints.
  - `WARN`: Potential issues, recoverable errors, validation failures.
  - `ERROR`: Unrecoverable errors, exceptions.
- **Database Logging:** Use the `dbLogger` (e.g., from `@/lib/data-mapping/db-logger`) for logging specific database operations, including performance metrics if applicable.
- **Sensitive Data in Logs:** Avoid logging sensitive PII or credentials.

## 10. Common Endpoint Patterns & Naming Conventions

- **Resource Naming:** Use plural nouns for resource collections (e.g., `/api/campaigns`, `/api/users`).
- **Identifiers:** Use path parameters for resource identifiers (e.g., `/api/campaigns/{campaignId}`).
- **Actions:** For non-CRUD operations, use verbs if necessary, but prefer to model actions as sub-resources or use query parameters if it fits RESTful patterns. Example: `/api/campaigns/{campaignId}/publish`.

### GET (Retrieve Collection)

- `GET /api/resources`
- Supports pagination (e.g., `?page=1&limit=20` or cursor-based).
- Supports filtering (e.g., `?status=active`).
- Supports sorting (e.g., `?sortBy=createdAt&order=desc`).
- Define clear `zod` schemas for query parameters.

### GET (Retrieve Single Resource)

- `GET /api/resources/{id}`
- Returns `404 Not Found` if the resource does not exist.

### POST (Create Resource)

- `POST /api/resources`
- Request body contains the resource representation.
- Returns `201 Created` on success, with the created resource in the response body (including its new ID).

### PATCH (Partially Update Resource)

- `PATCH /api/resources/{id}`
- Request body contains only the fields to be updated.
- Returns `200 OK` with the updated resource representation.
- Returns `404 Not Found` if the resource does not exist.

### PUT (Fully Update/Replace Resource)

- `PUT /api/resources/{id}`
- Request body contains the complete new representation of the resource.
- Returns `200 OK` with the updated resource representation.
- Returns `404 Not Found` if the resource does not exist.
- (Use `PATCH` for partial updates; use `PUT` only if full replacement semantics are intended and implemented).

### DELETE (Remove Resource)

- `DELETE /api/resources/{id}`
- Returns `204 No Content` or `200 OK` with a confirmation message/data.
- Returns `404 Not Found` if the resource does not exist.

## 11. Versioning

Currently, APIs are unversioned (no explicit version in URL paths or headers). As the platform evolves, if breaking changes to APIs become necessary, a versioning strategy (e.g., path-based like `/api/v1/resources`, or header-based) will need to be implemented. For now, changes should aim to be backward-compatible.

## 12. Security Considerations

- **Input Validation:** Already covered (Section 4.1). Crucial for preventing injection attacks (SQLi, XSS if data is reflected).
- **Output Encoding:** `NextResponse.json()` correctly sets `Content-Type: application/json` and handles JSON encoding, mitigating XSS risks for JSON consumers. Be cautious if returning HTML or other content types.
- **Authentication & Authorization:** Already covered (Section 6). Enforce strictly.
- **Parameterized Queries:** Prisma ORM handles SQL parameterization, preventing SQL injection.
- **HTTPS:** All API traffic MUST be served over HTTPS (handled by Vercel deployment).
- **Rate Limiting:** Consider implementing rate limiting on sensitive or computationally expensive endpoints to prevent abuse. (This is a platform-level concern, but APIs should be designed to be compatible with such measures).
- **Information Exposure:** Avoid exposing excessive information in error messages or debug output in production.
- **Dependency Management:** Keep API dependencies up-to-date to patch known vulnerabilities.

## 13. Deprecation Strategy (Placeholder)

When an API or specific fields within an API need to be deprecated:

1.  Provide advance notice to consumers.
2.  Initially, mark the API/field as deprecated in documentation.
3.  Consider logging usage of deprecated features to gauge impact.
4.  After a suitable period, remove the feature.
5.  If versioning is in place, deprecation can be managed across versions.

## 14. Documentation

- Each API endpoint (or group of related endpoints) should ideally have accompanying documentation detailing:
  - Purpose
  - URL and HTTP Method
  - Request parameters (path, query, body) with types and validation rules (link to Zod schemas)
  - Success response structure and status codes
  - Error response structures and status codes
  - Required permissions/authentication
- (This `api-design.md` document serves as the overarching standard).

---

This document provides a comprehensive baseline. It should be reviewed periodically and updated as our platform and best practices evolve.

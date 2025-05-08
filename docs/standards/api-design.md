# API Design Guidelines

**Last Reviewed:** 2025-05-09
**Status:** Draft (Needs Review & Refinement)

## 1. Overview

This document outlines the standards and best practices for designing, implementing, and documenting internal APIs (primarily Next.js API Routes) within the Justify platform. Consistent API design improves developer experience, maintainability, and predictability.

_(Action: Tech Lead/Architect to review, refine, and formally adopt these guidelines.)_

## 2. Core Principles

- **Predictability & Consistency:** APIs should follow consistent patterns for naming, request/response structure, status codes, and error handling.
- **Resource-Oriented:** Design APIs around the logical resources they expose (e.g., `/api/campaigns`, `/api/users/[userId]`). Use nouns for resources.
- **Statelessness:** Each API request should contain all information needed to process it, without relying on server-side session state (authentication state managed via tokens/middleware).
- **Clear Contracts:** Define and validate request inputs (params, query, body) and ideally response shapes using Zod.
- **Appropriate HTTP Methods:** Use standard HTTP verbs correctly:
  - `GET`: Retrieve resources.
  - `POST`: Create new resources.
  - `PUT`: Replace an existing resource entirely.
  - `PATCH`: Partially update an existing resource.
  - `DELETE`: Remove a resource.
- **Security:** Ensure proper authentication and fine-grained authorization checks are applied to every endpoint.

## 3. Request Structure

- **URL Naming:**
  - Use `kebab-case` for path segments.
  - Use plural nouns for resource collections (e.g., `/api/brand-lift-studies`).
  - Use path parameters for specific resource identifiers (e.g., `/api/campaigns/[id]`).
- **Query Parameters:**
  - Use for filtering, sorting, pagination, and field selection.
  - Use `camelCase` for parameter names (e.g., `?status=ACTIVE&sortBy=createdAt&limit=20&offset=0`).
  - Validate expected query parameters and their types using Zod.
- **Request Body (POST/PUT/PATCH):**
  - Always use JSON (`Content-Type: application/json`).
  - Define clear Zod schemas for expected request body structures.
  - Use `PATCH` for partial updates; the request body should only contain the fields to be changed.

## 4. Response Structure

- **Format:** Always use JSON (`Content-Type: application/json`).
- **Standard Wrapper (Recommended):** Use a consistent wrapper for all responses to standardize how data and errors are communicated.

  ```json
  // Success Response (200 OK, 201 Created)
  {
    "success": true,
    "data": { ... } // Single resource object
    // or "data": [ ... ] // Array of resources
    // or "data": null // For successful DELETE (204 No Content shouldn't have body)
    // Optional: "meta": { "pagination": { "total": 100, "limit": 20, "offset": 0 } }
  }

  // Error Response (4xx/5xx)
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR", // e.g., NOT_FOUND, UNAUTHORIZED, FORBIDDEN, INTERNAL_SERVER_ERROR
      "message": "A user-friendly error message describing the issue.",
      "details": { ... } // Optional: Structured details, e.g., Zod error format for validation errors
    }
  }
  ```

- **HTTP Status Codes:** Use standard HTTP status codes correctly and consistently:
  - **2xx Success:**
    - `200 OK`: Standard success response for GET, PUT, PATCH.
    - `201 Created`: Successful creation of a resource (POST).
    - `204 No Content`: Successful request but no content to return (e.g., DELETE).
  - **4xx Client Errors:**
    - `400 Bad Request`: Generic client error (e.g., invalid syntax, failed validation - provide details in body).
    - `401 Unauthorized`: Authentication required or failed.
    - `403 Forbidden`: Authenticated user lacks permission.
    - `404 Not Found`: Resource not found.
    - `409 Conflict`: Request conflicts with current state (e.g., duplicate resource creation).
  - **5xx Server Errors:**
    - `500 Internal Server Error`: Generic server error (avoid leaking details).
    - `503 Service Unavailable`: Temporary server issue.
- **Data Formatting:** Ensure consistent data formatting (e.g., dates as ISO 8601 strings `YYYY-MM-DDTHH:mm:ss.sssZ`). Consider using response formatting helpers (like `createApiResponse` seen in `src/lib/middleware/api/api-response-middleware.ts` if it handles this).

## 5. Validation

- **Server-Side is Mandatory:** Always validate all inputs (path params, query params, request body) on the server-side within the API route handler, even if client-side validation exists.
- **Tool:** Use Zod for schema definition and validation.
- **Location:** Validation logic should occur early in the handler, potentially using middleware helpers (`withValidation`).
- **Error Response:** Return `400 Bad Request` with clear error details (using the standard error response format) upon validation failure.

## 6. Authentication & Authorization

- **Authentication:** Protect API routes using Clerk middleware (`src/middleware.ts`) or by checking `auth()` results at the start of the handler.
- **Authorization:** Perform explicit checks within the handler (or dedicated middleware) to ensure the authenticated user (`userId` from `auth()`) has the necessary permissions (based on roles stored in `sessionClaims.metadata` or fetched from the DB) to perform the requested action on the target resource.
- Return `401 Unauthorized` or `403 Forbidden` as appropriate.

## 7. Error Handling

- Wrap handler logic in `try...catch` blocks.
- Use standardized error handling helpers (e.g., `handleDbError` from `src/lib/middleware/api/errorHandling/`) to catch common Prisma/database errors and return consistent 500 responses.
- Log errors effectively on the server-side using the centralized logger (`src/lib/logger/`), including relevant context but avoiding sensitive data in logs.
- Do not expose stack traces or overly detailed internal error information in API responses.

## 8. Versioning (Future Consideration)

- While not immediately required, consider a strategy for API versioning if significant breaking changes are anticipated in the future (e.g., `/api/v1/campaigns`, `/api/v2/campaigns`).

## 9. Documentation

- **API Reference:** Maintain an up-to-date API reference document (`/docs/api-reference.md`) or consider using tools like Swagger/OpenAPI with JSDoc/TSDoc comments to auto-generate documentation.
- **Minimum Documentation:** For each endpoint, document:
  - Purpose/Description
  - HTTP Method and URL Path
  - Required Authentication/Authorization
  - Path/Query Parameters (name, type, description, required/optional)
  - Request Body Schema (JSON structure, field types, required/optional)
  - Success Response Structure(s) and Status Code(s)
  - Error Response Structure(s) and Status Code(s)

Adherence to these guidelines will lead to a more robust, maintainable, and developer-friendly API layer.

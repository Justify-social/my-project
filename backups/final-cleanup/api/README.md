# API Middlewares

This directory contains middleware functions specifically designed for API routes.

## Purpose

- **validate-request.ts**: Validates incoming API request data
- **api-response-middleware.ts**: Formats API responses consistently
- **check-permissions.ts**: Verifies user permissions for API operations
- **handle-db-errors.ts**: Handles database errors and returns appropriate responses

These middlewares are intended to be used in API route handlers and are separate from the Next.js middleware in `src/middleware.ts` which handles routing and authentication at the application level.

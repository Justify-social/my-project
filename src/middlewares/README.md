# Middlewares

This directory contains middleware functions used throughout the application.

## Structure

- **api/**: Middlewares specifically for API routes
  - validate-request.ts - Validates incoming request data
  - api-response-middleware.ts - Formats API responses
  - check-permissions.ts - Verifies user permissions
  - handle-db-errors.ts - Handles database errors

## Usage

Import API middlewares from their centralized location:

```typescript
import { validateRequest, checkPermissions } from '@/middlewares/api';
```

## Note

The application-level routing and authentication middleware is located in `src/middleware.ts`, following Next.js conventions.

# Middleware Configuration

This directory contains the centralized middleware implementation for the application. As part of fixing navigation rendering issues, all middleware has been consolidated here to establish a Single Source of Truth.

## Directory Structure

- **middleware.ts**: Main middleware implementation for Next.js
- **api/**: API-specific middleware functions
- **cursor-ai/**: Middleware for Cursor AI integration

## Usage

The middleware is automatically loaded by Next.js from the wrapper in `src/middleware.ts`.

For importing specific middleware helpers:

```typescript
// Use this import pattern
import { someHelper } from '@/config/middleware/api';

// Or for the main middleware (though you shouldn't need to import this directly)
import middleware from '@/config/middleware/middleware';
```

## Authentication Flow

The middleware implements a selective authentication approach that:

1. Allows static assets to load without authentication
2. Only enforces authentication for admin routes and API endpoints
3. Coordinates with client-side auth through the Auth State Provider
4. Prevents navigation rendering issues by avoiding unnecessary redirects

## Troubleshooting

If you encounter navigation rendering issues:

1. Check that static assets are properly excluded from authentication checks
2. Verify that components are allowed to complete their rendering cycle
3. Ensure the auth state is properly synchronized between client and server

## Migration

Previous middleware in `src/middlewares/` and `src/middleware.ts` has been deprecated.
A wrapper remains in `src/middleware.ts` for backward compatibility, but all new development
should use this consolidated implementation.

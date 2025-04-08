# Middlewares (DEPRECATED)

> ⚠️ **DEPRECATED: The middleware implementation has been moved to `/config/middleware` directory**
> 
> Please use the implementation in `/config/middleware` instead.
> This directory is kept for reference only and will be removed in a future cleanup.

## Original Documentation

> This directory contains server middleware implementations.

Middleware are special server-side function that run before the routes and API endpoints. They can be used to modify the response, redirect the user, or perform authentication checks.

### Middleware Types

- **API Routes**: Middleware for API routes located in `/api`
- **Auth**: Authentication middleware for protected routes
- **Cursor AI**: Special middleware for handling Cursor AI API requests

For more information about middleware in Next.js, see the [official documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware).

### Why We're Moving Middleware

As part of fixing navigation rendering issues, we've consolidated middleware in `/config/middleware` to:

1. Establish a Single Source of Truth for middleware logic
2. Eliminate redundant authentication checks
3. Ensure consistent handling of authentication state
4. Better coordinate between client and server auth

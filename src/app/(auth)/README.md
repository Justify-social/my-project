# (auth) Routes

This directory contains routes for the auth feature domain.

## Routes

- **accept-invitation**: `/auth/accept-invitation`
- **subscribe**: `/auth/subscribe`

## Special Files

- **layout.tsx**: Shared layout for all (auth) routes
- **loading.tsx**: Loading state shown during route transitions
- **error.tsx**: Error handling component for route errors
- **not-found.tsx**: 404 page for routes that don't exist

## Usage

Import the route definitions from `@/types/routes` to navigate to these routes:

```typescript
import { routes } from '@/types/routes';

// Example usage
<Link href={routes.auth.accept-invitation}>
  accept-invitation Link
</Link>
```

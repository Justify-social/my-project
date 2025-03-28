# (admin) Routes

This directory contains routes for the admin feature domain.

## Routes

- **admin**: `/admin/admin`
- **debug-tools**: `/admin/debug-tools`

## Special Files

- **layout.tsx**: Shared layout for all (admin) routes
- **loading.tsx**: Loading state shown during route transitions
- **error.tsx**: Error handling component for route errors
- **not-found.tsx**: 404 page for routes that don't exist

## Usage

Import the route definitions from `@/types/routes` to navigate to these routes:

```typescript
import { routes } from '@/types/routes';

// Example usage
<Link href={routes.admin.admin}>
  admin Link
</Link>
```

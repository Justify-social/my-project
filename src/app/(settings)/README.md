# (settings) Routes

This directory contains routes for the settings feature domain.

## Routes

- **billing**: `/settings/billing`
- **pricing**: `/settings/pricing`
- **settings**: `/settings/settings`

## Special Files

- **layout.tsx**: Shared layout for all (settings) routes
- **loading.tsx**: Loading state shown during route transitions
- **error.tsx**: Error handling component for route errors
- **not-found.tsx**: 404 page for routes that don't exist

## Usage

Import the route definitions from `@/types/routes` to navigate to these routes:

```typescript
import { routes } from '@/types/routes';

// Example usage
<Link href={routes.settings.billing}>
  billing Link
</Link>
```

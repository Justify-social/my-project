# (dashboard) Routes

This directory contains routes for the dashboard feature domain.

## Routes

- **brand-health**: `/dashboard/brand-health`
- **brand-lift**: `/dashboard/brand-lift`
- **creative-testing**: `/dashboard/creative-testing`
- **dashboard**: `/dashboard/dashboard`
- **help**: `/dashboard/help`
- **mmm**: `/dashboard/mmm`
- **reports**: `/dashboard/reports`

## Special Files

- **layout.tsx**: Shared layout for all (dashboard) routes
- **loading.tsx**: Loading state shown during route transitions
- **error.tsx**: Error handling component for route errors
- **not-found.tsx**: 404 page for routes that don't exist

## Usage

Import the route definitions from `@/types/routes` to navigate to these routes:

```typescript
import { routes } from '@/types/routes';

// Example usage
<Link href={routes.dashboard.brand-health}>
  brand-health Link
</Link>
```

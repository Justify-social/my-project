# (campaigns) Routes

This directory contains routes for the campaigns feature domain.

## Routes

- **campaigns**: `/campaigns/campaigns`
- **influencer**: `/campaigns/influencer`
- **influencer-marketplace**: `/campaigns/influencer-marketplace`

## Special Files

- **layout.tsx**: Shared layout for all (campaigns) routes
- **loading.tsx**: Loading state shown during route transitions
- **error.tsx**: Error handling component for route errors
- **not-found.tsx**: 404 page for routes that don't exist

## Usage

Import the route definitions from `@/types/routes` to navigate to these routes:

```typescript
import { routes } from '@/types/routes';

// Example usage
<Link href={routes.campaigns.campaigns}>
  campaigns Link
</Link>
```

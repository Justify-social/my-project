# Legacy Component Directories

This document lists legacy component directories that are maintained for backward compatibility.
These directories contain re-export files that point to the new component locations.

## Directories

| Legacy Directory                 | New Location                                  | Description                       |
| -------------------------------- | --------------------------------------------- | --------------------------------- |
| `src/components/brand-lift`      | `@/components/features/campaigns/brand-lift`  | Brand lift components             |
| `src/components/Influencers`     | `@/components/features/campaigns/influencers` | Influencer management components  |
| `src/components/Wizard`          | `@/components/features/campaigns/wizard`      | Campaign wizard components        |
| `src/components/Search`          | `@/components/features/core/search`           | Search components                 |
| `src/components/mmm`             | `@/components/features/analytics/mmm`         | Marketing mix modeling components |
| `src/components/ErrorBoundary`   | `@/components/features/core/error-handling`   | Error boundary components         |
| `src/components/ErrorFallback`   | `@/components/ui/error-fallback`              | Error fallback components         |
| `src/components/upload`          | `@/components/features/assets/upload`         | Upload components                 |
| `src/components/gif`             | `@/components/features/assets/gif`            | GIF handling components           |
| `src/components/AssetPreview`    | `@/components/features/assets`                | Asset preview components          |
| `src/components/LoadingSkeleton` | `@/components/features/core/loading`          | Loading skeleton components       |

## Migration Plan

These directories are scheduled for removal once all import paths have been updated.
The tentative timeline for removal is:

1. **Phase 1 (Current)**: Re-export files added for backward compatibility
2. **Phase 2 (Future)**: Deprecation warnings added to console logs
3. **Phase 3 (Future)**: Removal of legacy directories

## How to Update Imports

To prepare for the removal of these legacy directories, update your imports to use the new locations:

```typescript
// Before
import { SomeComponent } from '@/components/legacy-directory';

// After
import { SomeComponent } from '@/components/features/domain/subdomain';
```

## Automated Migration

You can use the import path updater script to automatically update imports in your codebase:

```bash
node scripts/directory-structure/phase7/import-path-updater.js
```

This script will scan your codebase and update imports to use the new locations.

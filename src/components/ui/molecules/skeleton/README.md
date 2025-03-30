# Skeleton Components

Loading state components that provide visual placeholders while content is being fetched or processed.

## Overview

Skeleton components create a smoother user experience by showing loading placeholders that match the shape and layout of content before it arrives. This reduces layout shifts and provides users with a sense of what's coming.

## Components

- **Skeleton**: Base component for creating loading states
- **TextSkeleton**: For multi-line text content placeholders
- **AvatarSkeleton**: For user avatars and profile images
- **CardSkeleton**: For card-like content blocks
- **TableRowSkeleton**: For table rows with multiple columns
- **LoadingSkeleton**: Advanced compositions for specific UI sections

## Usage

```tsx
import { 
  Skeleton, 
  TextSkeleton, 
  AvatarSkeleton, 
  CardSkeleton,
  TableSkeleton 
} from '@/components/ui/skeleton';

// This alias will work because it's properly configured in next.config.js
// to point to src/components/ui/molecules/skeleton

function SkeletonExample() {
  return (
    <div className="space-y-6">
      {/* Basic rectangular skeleton */}
      <Skeleton width="100%" height={200} />
      
      {/* Text placeholder with multiple lines */}
      <TextSkeleton lines={3} />
      
      {/* Avatar placeholder */}
      <div className="flex items-center gap-3">
        <AvatarSkeleton size="md" />
        <TextSkeleton width="70%" lines={2} />
      </div>
      
      {/* Card with content placeholder */}
      <CardSkeleton />
      
      {/* Table row with 4 columns */}
      <TableRowSkeleton cols={4} />
      
      {/* Custom shape using variant */}
      <Skeleton 
        variant="circular" 
        width={80} 
        height={80} 
        className="mx-auto"
      />
      
      {/* Different animation */}
      <Skeleton 
        animation="wave" 
        height={120} 
        className="rounded-lg"
      />
    </div>
  );
}
```

## Path Aliasing

The skeleton components can be imported through a centralized alias:

```tsx
// ✅ Recommended way - Using the path alias
import { TableSkeleton } from '@/components/ui/skeleton';

// ❌ Avoid direct imports - These are prone to breaking if internal structure changes
// import { TableSkeleton } from '@/components/ui/molecules/skeleton';
// import { TableSkeleton } from '@/components/ui/atoms/skeleton'; 
```

This is achieved through path aliases configured in:
- `next.config.js` - For webpack and server-side imports
- `tsconfig.json` - For TypeScript resolution

## Base Skeleton Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'rectangular' \| 'circular' \| 'text' \| 'card' | 'rectangular' | Visual style of the skeleton |
| animation | 'pulse' \| 'wave' \| 'none' | 'pulse' | Animation type for the loading state |
| width | string \| number | - | Width of the skeleton (can use any CSS unit) |
| height | string \| number | - | Height of the skeleton (can use any CSS unit) |
| className | string | - | Additional CSS classes |

## TextSkeleton Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| lines | number | 1 | Number of text lines to display |
| width | string \| number | '100%' | Width of the text lines |
| className | string | - | Additional CSS classes |

## AvatarSkeleton Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size of the avatar |
| className | string | - | Additional CSS classes |

## CardSkeleton Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| className | string | - | Additional CSS classes |

## TableRowSkeleton Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| cols | number | 4 | Number of columns in the row |
| className | string | - | Additional CSS classes |

## Advanced Usage

For more complex loading states, you can compose skeletons together:

```tsx
import { Skeleton, TextSkeleton, AvatarSkeleton } from '@/components/ui/molecules/skeleton';

function ProfileSkeleton() {
  return (
    <div className="border rounded-lg p-4 max-w-md mx-auto">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-3 mb-4">
        <AvatarSkeleton size="lg" />
        <div className="flex-1">
          <TextSkeleton width="70%" className="mb-1" />
          <TextSkeleton width="40%" />
        </div>
      </div>
      
      {/* Cover image */}
      <Skeleton height={200} className="w-full rounded-lg mb-4" />
      
      {/* Bio text */}
      <TextSkeleton lines={3} className="mb-4" />
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Skeleton height={60} className="rounded" />
        <Skeleton height={60} className="rounded" />
        <Skeleton height={60} className="rounded" />
      </div>
    </div>
  );
}
```

## Accessibility

- All skeleton components use `role="status"` and `aria-busy="true"` to communicate loading state to screen readers
- Consider using `aria-label="Loading [content type]"` for more specific descriptions
- For very long loading states, consider adding explicit loading text for screen readers

## Animation Considerations

The Skeleton component provides multiple animation options:

- **pulse**: A subtle opacity pulsing effect (default)
- **wave**: A left-to-right shimmer animation
- **none**: No animation, for reduced motion preferences

To respect user preferences, consider using the `prefers-reduced-motion` media query to adjust or disable animations. 
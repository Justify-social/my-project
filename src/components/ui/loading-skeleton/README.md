# Loading Skeleton Components

This directory contains reusable loading skeleton components for creating consistent loading states across the application.

## Components

### Base Components

- `Skeleton` - The foundational skeleton component with various display options

### Specialized Components

- `CampaignDetailSkeleton` - For the campaign details page
- `WizardSkeleton` - For wizard steps with appropriate step indication
- `TableSkeleton` - For data tables and lists
- `FormSkeleton` - For form inputs and sections
- `AuthSkeleton` - For authentication loading states

## Usage Examples

### Basic Skeleton

```tsx
import { Skeleton } from '@/components/ui/loading-skeleton/skeleton';

// Simple rectangular skeleton
<Skeleton width={200} height={20} />

// Circular avatar skeleton
<Skeleton variant="circular" width={40} height={40} />

// Text skeleton with animation
<Skeleton variant="text" animation="pulse" />

// Card skeleton
<Skeleton variant="card" width="100%" height={120} />
```

### Predefined Skeletons

```tsx
import { TextSkeleton, AvatarSkeleton, CardSkeleton, TableRowSkeleton } from '@/components/ui/loading-skeleton/skeleton';

// Text skeleton with multiple lines
<TextSkeleton lines={3} />

// Avatar skeleton
<AvatarSkeleton size="lg" />

// Card skeleton
<CardSkeleton />

// Table row skeleton
<TableRowSkeleton cols={5} />
```

### Specialized Page Skeletons

```tsx
import { 
  WizardSkeleton, 
  TableSkeleton, 
  FormSkeleton,
  CampaignDetailSkeleton,
  AuthSkeleton
} from '@/components/ui/loading-skeleton';

// For wizard steps
<WizardSkeleton step={2} />

// For data tables
<TableSkeleton rows={10} cols={4} />

// For forms
<FormSkeleton fields={8} />

// For campaign details
<CampaignDetailSkeleton />

// For authentication
<AuthSkeleton />
```

### Usage with Suspense

```tsx
import { Suspense } from 'react';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';

<Suspense fallback={<WizardSkeleton step={currentStep} />}>
  <Component />
</Suspense>
```

### Usage with loading state

```tsx
import { TableSkeleton } from '@/components/ui/loading-skeleton';

function CampaignList() {
  const { data, isLoading } = useCampaigns();

  if (isLoading) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  return (
    // Render actual content
  );
}
```

## Accessibility

All skeleton components include appropriate ARIA attributes:
- `role="status"` 
- `aria-busy="true"`
- `aria-label="Loading"`

## Customization

All components accept a `className` prop for additional styling customization.

## Animation Options

The base `Skeleton` component supports three animation options:
- `pulse` - Default, fades in and out
- `wave` - Shimmer effect from left to right
- `none` - No animation 
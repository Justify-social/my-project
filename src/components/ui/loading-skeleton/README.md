# Skeleton Loading Components

> **IMPORTANT: This package is deprecated**
> 
> These components have been moved to `@/components/ui/molecules/skeleton` following atomic design principles.
> Please update your imports to use the new location.

## Migration Guide

### Before

```tsx
import { WizardSkeleton, FormSkeleton } from "@/components/ui/loading-skeleton";
```

### After

```tsx
import { WizardSkeleton, FormSkeleton } from "@/components/ui/molecules/skeleton";
```

## Available Components

This module provides a comprehensive set of skeleton loading components for various UI patterns:

| Component | Description |
|-----------|-------------|
| `Skeleton` | Base skeleton component for building custom skeletons |
| `WizardSkeleton` | Skeleton for multi-step wizard flows |
| `TableSkeleton` | Skeleton for data tables |
| `SkeletonSection` | Section container with title and content skeletons |
| `FormFieldSkeleton` | Various form field skeletal representations |
| `DashboardSkeleton` | Dashboard layout skeleton |
| `CampaignDetailSkeleton` | Campaign details page skeleton |
| `FormSkeleton` | Complete form skeleton |
| `AuthSkeleton` | Authentication form skeleton |

## Component Usage

### WizardSkeleton

```tsx
<WizardSkeleton 
  step={1} 
  hasProgressBar={true}
  hasHeader={true}
  maxWidth="max-w-6xl"
/>
```

### SkeletonSection

```tsx
<SkeletonSection
  title={true}
  titleWidth="w-1/4"
  actionButton={true}
  lines={3}
  lineHeight="h-4"
/>
```

### FormFieldSkeleton

```tsx
<FormFieldSkeleton
  type="text" // Options: text, select, checkbox, radio, textarea, datepicker, upload
  label={true}
  labelWidth="w-1/4"
/>
```

## Types

The module also exports TypeScript types for the components:

```tsx
import type { SkeletonProps, SkeletonSectionProps, FormFieldSkeletonProps } from "@/components/ui/molecules/skeleton";
``` 
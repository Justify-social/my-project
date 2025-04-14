# Loading Components

**Last Updated:** 2025-03-10  
**Status:** Active  
**Owner:** UI Team

## Overview

This document details the loading component system in Justify.social, tracking the migration from basic `LoadingSpinner` components to more advanced content placeholders using `LoadingSkeleton` components. This migration creates a more unified and visually appealing loading experience across the application.

## Component Types

### LoadingSkeleton Components

Located in `/src/components/ui/loading-skeleton/`:

- **Base Skeleton (`skeleton.tsx`)**: Foundation component with variants:

  - Rectangular: For content blocks
  - Circular: For avatars and icons
  - Text: For text content with variable width
  - Card: For card-like containers

- **Specialized Implementations (`index.tsx`)**:
  - `CampaignDetailSkeleton`: Tailored for campaign details pages
  - `WizardSkeleton`: Step-specific skeletons for the Campaign Wizard
  - `TableSkeleton`: For data tables with configurable columns
  - `FormSkeleton`: For form layouts with multiple field types
  - `AuthSkeleton`: For authentication flows
  - `DashboardSkeleton`: For dashboard layouts with stats/charts
  - `SkeletonSection`: Reusable content blocks
  - `FormFieldSkeleton`: Field-specific skeletons for different input types

### Loading Spinners

Located in `/src/components/ui/spinner/`:

- **Spinner Variants**:
  - `Spinner`: Configurable base spinner
  - `AuthSpinner`: For authentication pages
  - `ButtonSpinner`: For inline button loading
  - `FullscreenSpinner`: Modal spinner overlay
  - `InlineSpinner`: For inline text loading
  - `DotsSpinner`: Animated dots spinner

## Implementation Pattern

The skeleton system follows these design principles:

1. **Composability**: Components can be nested to create complex layouts
2. **Contextual accuracy**: Each skeleton mirrors the actual content
3. **Configuration**: Extensive props for fine-tuning appearance
4. **Responsiveness**: Adapts to all screen sizes
5. **Reusability**: Common patterns extracted into reusable components
6. **Global consistency**: Unified styling across all loading states

### Basic Usage Example

```tsx
// Basic usage
<WizardSkeleton step={3} />

// With custom configurations
<WizardSkeleton
  step={3}
  hasProgressBar={true}
  hasHeader={true}
  maxWidth="max-w-5xl"
/>

// With completely custom content
<WizardSkeleton
  step={3}
  stepContent={
    <div className="space-y-6">
      <SkeletonSection title={true} lines={4} />
      <FormSkeleton
        fields={3}
        layout="grid"
        fieldTypes={['text', 'select', 'textarea']}
      />
    </div>
  }
/>
```

## Migration Status

### Completed Areas

#### Campaign Details Pages

- Campaign Details (`/campaigns/[id]`) using global skeleton components:
  - Enhanced with dedicated `loading.tsx` file for Next.js App Router SSR loading state
  - Improved inline loading state with composition of `SkeletonSection` components
  - Removed specialized components in favor of global skeleton components

#### Campaign List Pages

- Campaign List (`/campaigns`) using global skeleton components:
  - Dedicated `loading.tsx` file for Next.js App Router SSR loading state
  - Enhanced client-side inline loading with `TableSkeleton`
  - Consistent loading UI with proper heading and table structure placeholders

#### Campaign Wizard Pages

- All steps (1-5) using `WizardSkeleton` with step-specific layouts
- Dynamic imports with proper skeleton loading patterns
- Context-specific content in each step's skeleton

### In Progress

- Import path updates (70% complete)
- Component replacements across the application (70% complete)
- High-visibility pages (90% complete)

### Remaining Areas

- Secondary pages (forms, detail views)
- Minor components (dialog boxes, inline loaders)
- Server components and debug tools

## Component Structure

All loading-related components have been consolidated into two directories:

### 1. Loading Skeletons (`src/components/ui/loading-skeleton/`)

- `skeleton.tsx` - Base skeleton component with variants
- `index.tsx` - Specialized skeleton implementations

### 2. Loading Spinners (`src/components/ui/spinner/`)

- `index.tsx` - Various spinner implementations

## Design Guidelines

When implementing loading states:

1. Use skeletons that accurately reflect the content they replace
2. Maintain consistent spacing and layout with the actual content
3. Follow the application color palette for skeleton gradients
4. Use contextual skeletons (table, form, section) instead of generic placeholders
5. Ensure proper responsiveness on all screen sizes
6. Apply proper HTML structure without invalid nesting

## Related Documentation

- [Brand Guide](./brand-guide.md)
- [Campaign Wizard Workflow](../campaign-wizard/workflow.md)

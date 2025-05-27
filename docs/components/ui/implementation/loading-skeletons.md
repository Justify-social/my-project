# Loading Skeletons Implementation Guide

## Overview

Loading skeletons provide visual placeholders while content is loading, improving perceived performance and user experience. Our implementation follows Single Source of Truth (SSOT) principles with comprehensive responsive design.

## Architecture

### Core Implementation

All loading skeleton components are centralized in a single file following SSOT principles:

```typescript
// src/components/ui/loading-skeleton.tsx
export function LoadingSkeleton(); // Base skeleton atom
export function TableSkeleton(); // Table-specific skeleton
export function DashboardSkeleton(); // Dashboard layout skeleton
export function WizardSkeleton(); // Multi-step wizard skeleton
export function AuthSkeleton(); // Authentication forms skeleton
export function BillingSkeleton(); // Billing management skeleton
export function ProfileSkeleton(); // User profile settings skeleton
```

### Design Principles

1. **Single Source of Truth**: All skeleton variants in one file
2. **Responsive Design**: Works across all screen sizes (320px to 1440px+)
3. **Accessibility**: Proper ARIA labels and screen reader support
4. **Performance**: Fast rendering with smooth animations
5. **Consistency**: Matches actual component layouts

## Component Variants

### 1. LoadingSkeleton (Base Component)

The foundational skeleton component with configurable variants:

```typescript
interface LoadingSkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  fullWidth?: boolean;
}
```

**Usage Examples:**

```tsx
// Basic text skeleton
<LoadingSkeleton variant="text" />

// Multiple skeleton lines
<LoadingSkeleton variant="text" count={3} />

// Card skeleton
<LoadingSkeleton variant="card" fullWidth />
```

### 2. TableSkeleton

Displays skeleton loading for table structures:

```tsx
<TableSkeleton rows={5} columns={4} />
```

### 3. DashboardSkeleton

Complete dashboard layout with metrics, charts, and tables:

```tsx
<DashboardSkeleton />
```

### 4. WizardSkeleton

Multi-step wizard with step-specific content:

```tsx
<WizardSkeleton step={1} />
<WizardSkeleton step={2} />
// ... up to step 5
```

### 5. AuthSkeleton

Authentication forms (sign-in/sign-up):

```tsx
<AuthSkeleton />
```

### 6. BillingSkeleton

Billing management with tabs and pricing grid:

```tsx
<BillingSkeleton />
```

### 7. ProfileSkeleton

User profile settings with comprehensive sections:

```tsx
<ProfileSkeleton />
```

## Implementation Patterns

### 1. Page-Level Implementation

Use Suspense boundaries with skeleton fallbacks:

```tsx
import { Suspense } from 'react';
import { AuthSkeleton } from '@/components/ui/loading-skeleton';

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <SignInComponent />
    </Suspense>
  );
}
```

### 2. Component-Level Implementation

Show skeletons while data is loading:

```tsx
import { BillingSkeleton } from '@/components/ui/loading-skeleton';

export default function BillingComponent() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <BillingSkeleton />;
  }

  return <ActualContent />;
}
```

### 3. Dual-Layer Strategy

Combine Suspense with internal component skeletons:

```tsx
// page.tsx
<Suspense fallback={<LoadingSkeleton />}>
  <ClientComponent />
</Suspense>;

// ClientComponent.tsx - internal loading states
{
  isLoading ? <DashboardSkeleton /> : <ActualDashboard />;
}
```

## Responsive Design

### Breakpoint Strategy

Our skeletons use Tailwind's responsive prefixes:

```css
sm: 640px   /* Small tablets */
md: 768px   /* Medium tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

### Responsive Grid Examples

**Marketplace Cards:**

```tsx
// Responsive: 1 col → 2 cols → 3 cols → 4 cols
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {Array.from({ length: itemsPerPage }).map((_, i) => (
    <LoadingSkeleton key={i} variant="card" height="275px" />
  ))}
</div>
```

**Billing Pricing Grid:**

```tsx
// Responsive: 1 col → 3 cols on tablets+
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {Array.from({ length: 3 }).map((_, i) => (
    <PricingCardSkeleton key={i} />
  ))}
</div>
```

## Current Implementation Status

### ✅ Fully Implemented Pages

- **Campaign Wizard**: All 5 steps with step-specific skeletons
- **Campaign Details**: Comprehensive responsive grid layouts
- **Dashboard**: Dual-layer skeleton strategy (page + component level)
- **Influencer Marketplace**: Grid-based responsive skeleton cards
- **Brand Lift Pages**: Table skeleton implementations
- **Auth Pages**: Sign-in/sign-up with form structure skeletons
- **Billing Management**: Tabs, pricing grid, and portal skeletons
- **Profile Settings**: Comprehensive profile section skeletons
- **Admin Tools**: Debug UI components with preview system

### 📊 Screen Size Compliance Matrix

| Component         | Mobile (320px)  | Tablet (768px) | Laptop (1024px) | Desktop (1440px) |
| ----------------- | --------------- | -------------- | --------------- | ---------------- |
| LoadingSkeleton   | ✅ Responsive   | ✅ Responsive  | ✅ Responsive   | ✅ Responsive    |
| TableSkeleton     | ✅ Responsive   | ✅ Responsive  | ✅ Responsive   | ✅ Responsive    |
| DashboardSkeleton | ✅ Responsive   | ✅ Responsive  | ✅ Responsive   | ✅ Responsive    |
| WizardSkeleton    | ✅ Responsive   | ✅ Responsive  | ✅ Responsive   | ✅ Responsive    |
| AuthSkeleton      | ✅ Responsive   | ✅ Responsive  | ✅ Responsive   | ✅ Responsive    |
| BillingSkeleton   | ✅ 1 col grid   | ✅ 3 cols grid | ✅ 3 cols grid  | ✅ 3 cols grid   |
| ProfileSkeleton   | ✅ Stack layout | ✅ Flex layout | ✅ Flex layout  | ✅ Flex layout   |

## Best Practices

### 1. When to Use Skeletons

- **Always**: For pages that load dynamic data
- **Page-level**: Use Suspense with skeleton fallbacks
- **Component-level**: Show skeletons during loading states
- **Critical flows**: Campaign creation, user authentication, data tables

### 2. Skeleton Design Guidelines

- **Match Layout**: Skeleton should closely match the actual content layout
- **Responsive**: Must work across all screen sizes
- **Accessible**: Include proper ARIA labels
- **Performance**: Keep animations smooth and lightweight

### 3. Code Organization

- **Single File**: All skeleton variants in `src/components/ui/loading-skeleton.tsx`
- **Named Exports**: Use descriptive component names
- **Props Interface**: Clear, documented prop interfaces
- **Consistent Naming**: Follow `[Context]Skeleton` pattern

### 4. Testing Considerations

- **Visual Testing**: Verify skeletons match content layouts
- **Responsive Testing**: Test across all breakpoints
- **Performance Testing**: Ensure fast rendering
- **Accessibility Testing**: Verify screen reader compatibility

## Development Workflow

### 1. Adding New Skeletons

When creating a new page/component that needs loading states:

1. **Analyze Layout**: Identify the key visual elements
2. **Create Skeleton**: Add new skeleton to `loading-skeleton.tsx`
3. **Match Structure**: Ensure skeleton matches actual content layout
4. **Add Responsive**: Include appropriate responsive breakpoints
5. **Implement Usage**: Add Suspense boundaries or loading conditions
6. **Test**: Verify across all screen sizes

### 2. Modifying Existing Skeletons

When updating components:

1. **Check Skeleton**: Ensure skeleton still matches updated layout
2. **Update if Needed**: Modify skeleton to match new structure
3. **Test Responsive**: Verify responsiveness still works
4. **Document Changes**: Update this documentation if needed

## Accessibility

### ARIA Implementation

All skeletons include proper accessibility attributes:

```tsx
<div role="status" aria-label="Loading" className="skeleton-container">
  {/* Skeleton content */}
</div>
```

### Screen Reader Support

- **Role**: `role="status"` indicates dynamic content loading
- **Label**: `aria-label="Loading"` provides context
- **Non-intrusive**: Skeletons don't interrupt screen reader flow

## Performance

### Build Metrics

- **Build Time**: ~10.0s (includes all 7 skeleton variants)
- **Bundle Impact**: Minimal - shared base component
- **Runtime Performance**: Optimized with proper React keys and minimal re-renders

### Animation Performance

- **CSS Animations**: Uses CSS transforms for smooth animations
- **GPU Acceleration**: Leverages hardware acceleration where possible
- **Minimal JavaScript**: Animation handled via CSS classes

## Troubleshooting

### Common Issues

1. **Skeleton doesn't match content layout**

   - **Solution**: Review actual component structure and update skeleton accordingly

2. **Layout shifts when content loads**

   - **Solution**: Ensure skeleton dimensions match actual content dimensions

3. **Responsive breakpoints not working**

   - **Solution**: Verify Tailwind classes and test across screen sizes

4. **Performance issues**
   - **Solution**: Check for unnecessary re-renders and optimize React keys

### Debugging Tools

- **Preview Pages**: Use `/debug-tools/ui-components/preview/LoadingSkeleton`
- **Browser DevTools**: Check responsive behavior with device simulation
- **Lighthouse**: Monitor performance impact

## Migration Guide

### For Existing Components

If you have components with basic loading states, migrate them:

**Before:**

```tsx
{
  isLoading ? <div>Loading...</div> : <Content />;
}
```

**After:**

```tsx
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';

{
  isLoading ? <DashboardSkeleton /> : <Content />;
}
```

### For New Components

Always implement proper skeleton loading:

```tsx
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function NewPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="card" />}>
      <NewPageContent />
    </Suspense>
  );
}
```

## Related Documentation

- [Component Library Overview](../component-library.md)
- [UI Implementation Guide](./README.md)
- [Responsive Design Standards](../../../standards/responsive-design.md)
- [Accessibility Guidelines](../../../standards/accessibility.md)

---

_Last Updated: 2025-05-27_  
_Status: Production Ready_  
_Coverage: 100% of critical user flows_

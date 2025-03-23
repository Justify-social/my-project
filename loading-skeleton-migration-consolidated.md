# Loading Skeleton Migration - Consolidated

## Overview

This document tracks the migration from basic `LoadingSpinner` components to more advanced content placeholders using `LoadingSkeleton` components, following the pattern used in the Campaign Details page. This migration will create a more unified and visually appealing loading experience.

## Current State

- **LoadingSpinner**: Basic animated spinner used in 20+ locations across the app
- **LoadingSkeleton**: Advanced content placeholder used primarily in Campaign Details page (`src/components/LoadingSkeleton/index.tsx`)
- **Authentication Spinner**: Custom spinner with "Checking authentication..." text in `src/components/layouts/client-layout.tsx`
- **Various Debug Spinners**: Several spinner implementations in debug tools
- **UI Components Library**: Contains multiple spinner and skeleton variants in `src/components/ui/examples.tsx`
- **Inconsistency**: Different loading patterns create visual inconsistency and less polished user experience

## Migration Status

### Campaign Details Pages
- [x] Campaign Details (`/campaigns/[id]`) - Updated to use global skeleton components:
  - [x] Enhanced with dedicated `loading.tsx` file for Next.js App Router SSR loading state using `SkeletonSection` components
  - [x] Improved inline loading state in the client component with composition of `SkeletonSection` components for data fetching
  - [x] Removed specialized `CampaignDetailSkeleton` in favor of global skeleton components

### Campaign List Pages
- [x] Campaign List (`/campaigns`) - Updated to use global skeleton components:
  - [x] Created dedicated `loading.tsx` file for Next.js App Router SSR loading state using `TableSkeleton` component
  - [x] Enhanced client-side inline loading with `TableSkeleton` for both user and campaign loading states
  - [x] Implemented consistent loading UI with proper heading and table structure placeholders

### Wizard Pages
- [x] Step 1 - Using `WizardSkeleton` with step prop
  - [x] Updated dynamic imports with `WizardSkeleton` instead of `LoadingSpinner`
- [x] Step 2 - Using `WizardSkeleton` with step prop
  - [x] Updated dynamic imports with `WizardSkeleton` instead of `LoadingSpinner`
- [x] Step 3 - Using `WizardSkeleton` with step prop
  - [x] Updated dynamic imports with `WizardSkeleton` instead of `LoadingSpinner`
- [x] Step 4 - Using `WizardSkeleton` with step prop
  - [x] Added to `StepContentLoader` with appropriate `WizardSkeleton`
- [x] Step 5 - Using `WizardSkeleton` with step prop
  - [x] Added to `StepContentLoader` with appropriate `WizardSkeleton`

## Component Details

### LoadingSkeleton
The `LoadingSkeleton` is an advanced content placeholder primarily used in the Campaign Details page.

### WizardSkeleton
The `WizardSkeleton` is specialized for the Campaign Wizard and accepts a `step` prop to adjust the skeleton layout based on each wizard step's content structure.

### Enhanced Contextual Skeletons
The system has been expanded with more component types that precisely match the actual content:

- **FormFieldSkeleton**: Specialized field types (text, select, checkbox, radio, textarea, datepicker, upload)
- **SkeletonSection**: Reusable content sections with configurable headers and content
- **TableSkeleton**: Enhanced with filters, custom column widths, and configurable headers
- **FormSkeleton**: Supports different layouts, field types, and submit buttons
- **AuthSkeleton**: Different variants for sign-in, sign-up, or loading states
- **DashboardSkeleton**: Complete dashboard layout with stats, tables, and charts

## Implementation Notes
- `WizardSkeleton` design matches the layout of Campaign Details pages with rounded corners, shadows, and proper spacing
- Each step variant is styled appropriately for the specific content that will appear on that step
- Skeletons include appropriate placeholders for:
  - Headers
  - Progress bar
  - Form fields
  - Navigation buttons
- `WizardSkeleton` is now fully responsive with proper mobile and desktop styling using Tailwind's responsive modifiers
- Grid layouts properly adapt to different viewport sizes using responsive grid columns
- All skeleton components now accept extensive configuration options to precisely match content
- Step-specific content for wizard steps that accurately mirrors the actual components
- Component composition allows building complex, nested skeletons to match any page layout

## ✅ Completed Tasks

### Component Restructuring
- ✅ Created unified `/src/components/ui/loading-skeleton/` directory
- ✅ Created unified `/src/components/ui/spinner/` directory
- ✅ Implemented base skeleton component with multiple variants
- ✅ Implemented specialized skeleton components (CampaignDetail, Wizard, etc.)
- ✅ Implemented comprehensive spinner component library
- ✅ Created detailed README documentation for both components
- ✅ Enhanced WizardSkeleton component with proper responsive design for all screen sizes
- ✅ Implemented robust contextual skeleton system with specialized component types
- ✅ Added configuration options to all skeleton components for precise content matching
- ✅ Added example components for both spinner and skeleton systems

### UI Example Updates
- ✅ Updated debug tools UI component examples
- ✅ Added comprehensive demonstrations of all loading states
- ✅ Created migration guide section in UI examples
- ✅ Split loading examples into separate files for better organization
- ✅ Removed tabbed interface in debug-tools for a cleaner, unified Loading section
- ✅ Fixed HTML nesting issues in spinner and skeleton components
- ✅ Ensured proper display of both spinner and skeleton components in UI

### Example Implementations
- ✅ Updated client-layout.tsx with new AuthSpinner
- ✅ Created example file showing migration pattern
- ✅ Fixed Campaign Details page to use CampaignDetailSkeleton
- ✅ Updated Step 3 and Step 4 to use WizardSkeleton component
- ✅ Implemented contextual skeleton content for each wizard step

### Original Remaining Tasks
- ✅ Complete migration for Wizard Steps 4 and 5
- ✅ Fix React Hooks ordering issue in Step5Content component (fixed the validateCampaignData reference error)
- ✅ Improve WizardSkeleton component to be fully responsive on all devices
- ✅ Create content-specific skeleton components that match the actual UI components
- ✅ Consolidated spinner components in `/src/components/ui/spinner/` directory
- ✅ Move spinner components from loading-skeleton to spinner directory
- ✅ Fix HTML structure issues with nested components (replaced invalid p > div nesting)
- Review application for any remaining instances of `LoadingSpinner`
- Ensure proper Hook ordering in all components using the skeletons
- Consider adding more specific skeleton layouts for other key pages

## 🔄 In Progress

### Import Path Updates (70% Complete)
- 🔄 Updating imports from old `@/components/LoadingSkeleton` to new paths
- ✅ Updating imports from various spinner implementations to reference `/components/ui/spinner`

### Component Replacement (70% Complete)
- 🔄 Replacing generic LoadingSpinner with appropriate skeletal loaders
- ✅ Implementing appropriate skeleton components for Campaign List and Wizard steps
- ✅ Updated dynamic imports for all 5 Wizard steps to use WizardSkeleton instead of LoadingSpinner

## 📋 Remaining Tasks

### High-visibility Pages (90% Complete)
- ✅ Campaign wizard steps (all 5 steps) - Updated dynamic imports to use WizardSkeleton instead of LoadingSpinner
- ✅ Dashboard page - Added dedicated loading.tsx file and updated inline loading with TableSkeleton
- ✅ Campaign list page - Added server-side `loading.tsx` and client-side inline loading skeletons using global `TableSkeleton` component

### Secondary Pages (0% Complete)
- ⬜ Submission pages
- ⬜ Form components
- ✅ Detail views (Campaign Details completed)

### Campaign Details Pages
- [x] Campaign Details (`/campaigns/[id]`) - Updated to use global skeleton components:
  - [x] Enhanced with dedicated `loading.tsx` file for Next.js App Router SSR loading state using `SkeletonSection` components
  - [x] Improved inline loading state in the client component with composition of `SkeletonSection` components for data fetching
  - [x] Removed specialized `CampaignDetailSkeleton` in favor of global skeleton components

### Campaign List Pages
- [x] Campaign List (`/campaigns`) - Updated to use global skeleton components:
  - [x] Created dedicated `loading.tsx` file for Next.js App Router SSR loading state using `TableSkeleton` component
  - [x] Enhanced client-side inline loading with `TableSkeleton` for both user and campaign loading states
  - [x] Implemented consistent loading UI with proper heading and table structure placeholders

### Minor Components (25% Complete)
- ⬜ Dialog boxes
- ⬜ Inline loaders
- ✅ Debug tools UI components page

## Migration Progress

| Area | Progress | Est. Completion |
|------|----------|----------------|
| Component Restructuring | 100% | Completed |
| Documentation | 100% | Completed |
| Example UI Updates | 100% | Completed |
| Authentication Components | 50% | Week 1 |
| Wizard Steps | 100% | Completed |
| Dashboard & List Pages | 40% | Week 2 |
| Forms & Detail Views | 10% | Week 3 |
| Server Components | 0% | Week 4 |
| Debug Tools | 25% | Week 4 |

## Known Issues

- Some files still reference the old LoadingSpinner component
- ✅ Campaign Detail page updated to use the global skeleton components instead of specialized CampaignDetailSkeleton
- ✅ Campaign List page updated to use the global TableSkeleton component for loading states
- ✅ Dashboard page updated to use the global DashboardSkeleton and TableSkeleton components
- Suspense boundaries need to be updated to use appropriate skeletons
- ✅ HTML nesting issues in loading components (resolved)
- ✅ Enforcing global skeleton component usage pattern across the application

## Next Steps

1. Update the remaining files to use the new import paths
2. Implement appropriate skeleton components in the high-visibility pages
3. Create PR for the authentication spinner updates
4. Update the server components to use the new loading skeletons
5. Enhance Next.js App Router pages with dedicated loading.tsx files:
   - [x] Campaign Detail Page - updated to use global skeleton components with `SkeletonSection`
   - [x] Campaign List Page - updated with server-side loading.tsx and client-side inline loading using TableSkeleton
   - [x] Dashboard Pages - updated with dedicated loading.tsx file and inline TableSkeleton components
   - [ ] Analytics Pages - need loading.tsx implementation
   - [ ] Settings Pages - need loading.tsx implementation

## Component Restructuring Details

All loading-related components have been consolidated into two dedicated directories:

### 1. Loading Skeletons (`src/components/ui/loading-skeleton/`)
- `skeleton.tsx` - Base skeleton component with variants (rectangular, circular, text, card)
- `index.tsx` - Specialized skeleton implementations:
  - `CampaignDetailSkeleton` - For campaign details page
  - `WizardSkeleton` - For wizard steps with contextual content for each step
  - `TableSkeleton` - For data tables with configurable columns and filters
  - `FormSkeleton` - For form inputs with multiple field type support
  - `AuthSkeleton` - For authentication flow with different variants
  - `DashboardSkeleton` - For dashboard layouts with stats and charts
  - `SkeletonSection` - Reusable content block with customizable structure
  - `FormFieldSkeleton` - Individual form field skeletons for different input types

### 2. Loading Spinners (`src/components/ui/spinner/`)
- `index.tsx` - Various spinner implementations:
  - `Spinner` - Configurable base spinner
  - `AuthSpinner` - For authentication pages
  - `ButtonSpinner` - For inline button loading
  - `FullscreenSpinner` - Modal spinner overlay
  - `InlineSpinner` - For inline text loading
  - `DotsSpinner` - Animated dots spinner

## UI Component Updates

The debug-tools UI Components page has been updated to provide a cleaner, more integrated experience:

- Removed tabbed interface in favor of a unified component display
- Fixed HTML nesting issues (replaced invalid `<p>` > `<div>` nesting with proper structure)
- Combined both spinner and skeleton examples into a cohesive Loading section
- Ensured proper display of all loading components
- Updated imports to reference components from their correct directories

## Implementation Strategy

The skeleton system follows these design principles:

1. **Composability**: Components can be nested and combined to create complex layouts
2. **Contextual accuracy**: Each skeleton mirrors the actual content it represents
3. **Configuration**: Extensive props allow fine-tuning appearance without custom code
4. **Responsiveness**: All components adapt properly to all screen sizes
5. **Reusability**: Common patterns extracted into reusable components
6. **Global consistency**: Unified styling across all loading states

### Component Usage Pattern

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

## Migration Strategy

### 1. Update Imports (Week 1)

Update all imports in the codebase to use the new component paths:

```tsx
// BEFORE
import LoadingSkeleton from '@/components/LoadingSkeleton';
// or
import { Skeleton } from '@/components/ui/skeleton';

// AFTER
import LoadingSkeleton from '@/components/ui/loading-skeleton';
// or
import { Skeleton } from '@/components/ui/loading-skeleton/skeleton';
// or
import { WizardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
```

For spinners:

```tsx
// BEFORE
// Various custom spinner implementations

// AFTER
import { Spinner } from '@/components/ui/spinner';
// or
import { AuthSpinner, ButtonSpinner } from '@/components/ui/spinner';
```

### 2. Authentication Spinner Update (Week 1)

Update the authentication loading state in `src/components/layouts/client-layout.tsx` to:
1. Replace spinner with the `AuthSpinner` component
2. Change text from "Checking authentication..." to "Loading Justify..."

```tsx
// BEFORE
return (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Checking authentication...</p>
    </div>
  </div>
);

// AFTER
import { AuthSpinner } from '@/components/ui/spinner';

return (
  <AuthSpinner label="Loading Justify..." />
);
```

### 3. Prioritized Replacement (Weeks 2-3)

Replace LoadingSpinner instances with appropriate skeleton components in the following order:

1. High-visibility pages:
   - Campaign wizard steps (all 5 steps in `src/app/campaigns/wizard/step-*/`)
   - Dashboard page (`src/app/dashboard/`)
   - Campaign list page (`src/app/campaigns/`)

2. Secondary pages:
   - Submission pages (`src/app/campaigns/wizard/submission/`)
   - Form components (`src/components/forms/`)
   - Detail views (`src/app/campaigns/[id]/`)

3. Minor components:
   - Dialog boxes (`src/components/ui/dialog.tsx`)
   - Inline loaders (various locations)
   - Debug tools (`src/app/debug-tools/`)

### 4. Implementation Patterns

For each replacement:

```tsx
// BEFORE
if (loading) {
  return <LoadingSpinner />;
}

// AFTER
import { WizardSkeleton } from '@/components/ui/loading-skeleton';

if (loading) {
  return <WizardSkeleton step={currentStep} />;
}
```

For Suspense boundaries:

```tsx
// BEFORE
<Suspense fallback={<LoadingSpinner />}>
  <Component />
</Suspense>

// AFTER
import { WizardSkeleton } from '@/components/ui/loading-skeleton';

<Suspense fallback={<WizardSkeleton step={currentStep} />}>
  <Component />
</Suspense>
```

### 5. Server Components (Week 4)

Update React Server Components to use appropriate skeletons, found in files like:
- `src/app/campaigns/ServerCampaigns.tsx` 
- `src/app/campaigns/wizard/step-*/page.tsx`

```tsx
// BEFORE
export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClientPage />
    </Suspense>
  );
}

// AFTER
import { WizardSkeleton } from '@/components/ui/loading-skeleton';

export default function Page() {
  return (
    <Suspense fallback={<WizardSkeleton step={2} />}>
      <ClientPage />
    </Suspense>
  );
}
```

### 6. Debug Tools Update (Week 4)

Update all loading states in the debug tools area to use the new skeletons:
- `src/app/debug-tools/ui-components/`
- `src/app/debug-tools/database/`
- `src/app/debug-tools/debug-step/`

This includes ensuring that the UI components debug page showcases all the skeleton loaders properly.

## Detailed Implementation Timeline

### Week 1: Setup and Authentication

#### Day 1-2: Documentation and Setup
- [x] Consolidate all loading skeletons to `/src/components/ui/loading-skeleton/`
- [x] Consolidate all loading spinners to `/src/components/ui/spinner/`
- [x] Create comprehensive README documentation for both component sets
- [x] Add loading components to the design system documentation
- [x] Create a UI examples page showing all available loading states

#### Day 3-4: Authentication and Core Components
- [ ] Update `client-layout.tsx` authentication spinner
- [ ] Create PR for authentication spinner changes
- [ ] Update import paths in core utilities
- [x] Create component usage examples

#### Day 5: Testing and Refinement
- [x] Fix HTML structure issues in loading components
- [ ] Test authentication spinner on all supported browsers
- [ ] Review and adjust any styling inconsistencies
- [ ] Merge authentication spinner PR

### Week 2: High-Visibility Pages

#### Day 1-2: Campaign Wizard
- [ ] Update loading states in all 5 wizard steps
- [ ] Implement `WizardSkeleton` with appropriate step indication
- [ ] Create PR for wizard loading states

#### Day 3-4: Dashboard and Campaign List
- [ ] Update dashboard loading states
- [ ] Implement `TableSkeleton` for campaign list
- [ ] Create PR for dashboard and list loading states

#### Day 5: Testing and Review
- [ ] Test all high-visibility page skeletons
- [ ] Review PRs and merge changes

### Week 3: Secondary Pages and Components

#### Day 1-2: Submission and Form Pages
- [ ] Update submission page loading states
- [ ] Implement `FormSkeleton` for form components
- [ ] Create PR for submission and form loading states

#### Day 3-4: Detail Views and Dialogs
- [ ] Update detail view loading states
- [ ] Update dialog loading states
- [ ] Create PR for detail and dialog loading states

#### Day 5: Testing and Review
- [ ] Test all secondary page skeletons
- [ ] Review PRs and merge changes

### Week 4: Server Components and Debug Tools

#### Day 1-2: Server Components
- [ ] Update loading states in server components
- [ ] Ensure consistent behavior between client and server rendering
- [ ] Create PR for server component loading states

#### Day 3-4: Debug Tools
- [x] Update UI components page with unified loading section
- [ ] Update remaining debug tools loading states
- [ ] Create PR for debug tools loading states

#### Day 5: Final Testing and Documentation
- [x] Comprehensive testing across all UI components 
- [x] Finalize documentation updates
- [ ] Review PRs and merge changes

## Future Considerations

- Consider implementing staggered animation for large skeletons
- Explore dynamic skeleton generation based on content structure
- Add theme support for dark mode skeletons
- Implement content-aware skeletons that adapt to actual content dimensions 
# Shadcn UI Complete Implementation Guide

> **Status: 100% COMPLETED** - Migration successfully finished on 2025-04-01

## Executive Summary

This document explains how we successfully migrated to shadcn/ui while preserving our atomic design structure and FontAwesome Pro icons. The migration established shadcn UI as the **SINGLE SOURCE OF TRUTH** for all UI components in the project.

## Migration Results

| Category | Count |
|----------|-------|
| Atoms | 34 components |
| Molecules | 14 components |
| Organisms | 6 components |
| **Total Shadcn** | **54 components** |
| Deprecated | 25 components (staged for future removal) |

## Key Implementation Details

### 1. Component Structure

We've maintained our atomic design structure with components organised as:

```
src/
└── components/
    └── ui/
        ├── atoms/
        │   ├── button/
        │   │   ├── Button.tsx        <-- shadcn component 
        │   │   └── index.ts
        │   └── ... (33 more atom components)
        ├── molecules/
        │   ├── carousel/
        │   │   ├── Carousel.tsx      <-- shadcn component
        │   │   └── index.ts
        │   └── ... (13 more molecule components)
        ├── organisms/
        │   ├── form/
        │   │   ├── Form.tsx          <-- shadcn component
        │   │   └── index.ts
        │   └── ... (5 more organism components)
        ├── deprecated/
        │   ├── README.md
        │   └── ... (all legacy components)
        └── utils/
            └── font-awesome-adapter.tsx
```

### 2. Implementation Scripts

Three scripts were created for the migration:

1. `scripts/shadcn-adopt.js`: For adopting individual components
2. `scripts/shadcn-migrate.js`: For the full migration of all components 
3. `scripts/complete-shadcn-migration.js`: For finalising the migration by moving legacy components to the deprecated folder

### 3. Migrated Components

#### Atoms (34 components)
- ✅ accordion
- ✅ alert
- ✅ avatar
- ✅ badge
- ✅ button
- ✅ calendar
- ✅ card
- ✅ checkbox
- ✅ collapsible
- ✅ command
- ✅ context-menu
- ✅ dialog
- ✅ dropdown-menu
- ✅ hover-card
- ✅ icon
- ✅ input
- ✅ label
- ✅ loading-spinner
- ✅ menubar
- ✅ navigation-menu
- ✅ popover
- ✅ progress
- ✅ radio-group
- ✅ scroll-area
- ✅ select
- ✅ separator
- ✅ sheet
- ✅ skeleton
- ✅ slider
- ✅ switch
- ✅ table
- ✅ tabs
- ✅ textarea
- ✅ toggle
- ✅ tooltip

#### Molecules (14 components)
- ✅ aspect-ratio
- ✅ breadcrumb
- ✅ carousel
- ✅ combobox (custom implementation)
- ✅ data-table (custom implementation)
- ✅ pagination
- ✅ resizable
- ✅ search-bar
- ✅ sonner
- ✅ And 5 more custom molecules

#### Organisms (6 components)
- ✅ form
- ✅ date-picker (custom implementation)
- ✅ multi-select (custom implementation)
- ✅ calendar-date-range-picker (custom implementation)
- ✅ And 2 more custom organisms

### 4. Custom Implementations

For components not available in the shadcn registry, we created custom implementations that follow the same patterns and styles:

- ✅ combobox (molecules)
- ✅ data-table (molecules) 
- ✅ date-picker (organisms)
- ✅ multi-select (organisms)
- ✅ calendar-date-range-picker (organisms)

### 5. FontAwesome Integration

The scripts automatically replace Lucide icons with FontAwesome equivalents using our adapter component:

```tsx
// Example of a shadcn component using our FontAwesome adapter
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { FontAwesomeIcon } from "@/components/ui/utils/font-awesome-adapter";

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <FontAwesomeIcon name="faCheck" className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

## Developer Usage Guidelines

### Importing Components

Import components using their atomic structure:

```tsx
// Import directly from the category (RECOMMENDED)
import { Button } from "@/components/ui/atoms/button";
import { Carousel } from "@/components/ui/molecules/carousel";
import { Form } from "@/components/ui/organisms/form";

// Or from the main UI index (might cause tree-shaking issues)
import { Button, Carousel, Form } from "@/components/ui";

// AVOID USING DEPRECATED COMPONENTS
// import { OldButton } from "@/components/ui/deprecated/atoms-button";
```

### Adding New shadcn Components

To add a new shadcn component:

```bash
node scripts/shadcn-adopt.js component-name
```

This will install the component and place it in the correct atomic structure directory.

### Customising Components

To customise a shadcn component:

1. Edit the component in its atomic location (`src/components/ui/atoms/component-name/ComponentName.tsx`)
2. Maintain the same interface and API
3. Test your changes to ensure they don't break existing usage

### Troubleshooting Import Issues

If you encounter import issues with UI components, follow these guidelines:

1. **Conflicting Exports**: Avoid `import * from` patterns that can cause conflicting exports
2. **Direct Imports**: Prefer direct imports from component directories:
   ```typescript
   // Good
   import { Button } from '@/components/ui/atoms/button';
   
   // Avoid
   import { Button } from '@/components/ui';
   ```
3. **Case Sensitivity**: Remember that Next.js is case-sensitive with imports
4. **Component Updates**: After updating a component, run validation to ensure paths are correct

### Common Issues and Solutions

1. **"Module not found" errors**:
   - Double-check the component path and correct category (atom/molecule/organism)
   - Ensure the component exists and is properly exported

2. **"Conflicting exports" errors**:
   - Update import statements to use direct paths
   - Avoid wildcard exports when possible

3. **Icon errors**:
   - Use the FontAwesomeIcon adapter from `@/components/ui/utils/font-awesome-adapter`
   - Make sure the icon name is registered in the icon registry

4. **"Component is not a function" errors**:
   - Ensure you're importing the default export if the component uses `export default`
   - Check if the component is using React.forwardRef which requires special handling

## Validation and Testing

To ensure the integrity of the component system, run:

1. `npm run validate:registry` to ensure components are registered
2. `npm run validate:component-paths` to verify component paths
3. `npm run build` to test compilation
4. `npm run test` to run component tests

## Resources

For more information on shadcn UI, visit:

- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
- Internal Storybook at `/dev/storybook` (development environment only) 
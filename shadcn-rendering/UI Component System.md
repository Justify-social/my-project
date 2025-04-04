# UI Component System: Developer Guide

## Overview

Our UI component system combines the best of two worlds:

1. **Shadcn UI** - A collection of accessible, customizable UI components built with Radix UI and Tailwind CSS
2. **Atomic Design** - A methodology for organizing components by complexity (atoms, molecules, organisms)

This guide explains how to use, maintain, and extend our component system.

## Component Structure

Our components follow this file structure:

```
/src/components/ui/
├── index.ts                      # Centralized export file for all components
├── atoms/                        # Basic building blocks
│   ├── button/
│   │   ├── Button.tsx            # ACTUAL IMPLEMENTATION
│   │   └── index.ts              # Re-exports the component
│   └── ...
├── molecules/                    # Composite components
│   └── ...
└── organisms/                    # Complex UI sections
    └── ...
```

## How to Use Components

You can import components in two ways:

### Option 1: Shadcn-style Imports (Recommended)

Use this style when following Shadcn UI documentation or when you're unsure about the component's atomic level:

```tsx
import { Button } from "@/components/ui";
import { Dialog } from "@/components/ui";
import { Card, CardHeader, CardContent } from "@/components/ui";
```

### Option 2: Atomic Design Imports

Use this style when you specifically need to reference the atomic level:

```tsx
import { Button } from "@/components/ui/atoms/button/Button";
import { DataTable } from "@/components/ui/molecules/data-table/DataTable";
import { Form } from "@/components/ui/organisms/form/Form";
```

Both import styles point to the exact same component implementation. Use whichever style makes the most sense for your context.

## Centralized Export System

All 91 components across atoms, molecules, and organisms are exported from a single `index.ts` file. This provides a Single Source of Truth (SSOT) for component exports and simplifies imports.

### Component Naming in Centralized Exports

Components are organized in the centralized exports file by atomic level:

```typescript
// src/components/ui/index.ts

// Atom-level components
export * from "./atoms/button/Button";
export * from "./atoms/input/Input";
// ...

// Molecule-level components
export * from "./molecules/data-table/DataTable";
// ...

// Organism-level components
export * from "./organisms/form/Form";
// ...
```

### Handling Naming Conflicts

When the same component name exists at different atomic levels, we use atomic-level prefixes to prevent conflicts:

```typescript
// src/components/ui/index.ts
export * as AtomTable from "./atoms/table/Table";
export * as OrganismTable from "./organisms/data-display/table/Table";
```

When importing these components:

```typescript
// Import the atoms version
import { AtomTable } from '@/components/ui';

// Import the organisms version 
import { OrganismTable } from '@/components/ui';
```

### Special Handling for Hyphenated Filenames

Components with hyphens in their filenames (like `Aspect-ratio.tsx`) use special export syntax:

```typescript
// src/components/ui/index.ts
export { default as AspectRatio } from "./atoms/aspect-ratio/Aspect-ratio";
export { default as MoleculeAspectRatio } from "./molecules/aspect-ratio/Aspect-ratio";
```

## Using FontAwesome Icons (Not Lucide)

Unlike vanilla Shadcn UI, our system uses FontAwesome Pro icons instead of Lucide icons. This gives us a more comprehensive icon library and ensures consistency across our application.

### Icon Adapter

Use our Icon Adapter component to work with FontAwesome icons:

```tsx
import { IconAdapter } from "@/components/ui/atoms/icon/adapters";

// In your component
<IconAdapter iconId="faCheckLight" className="h-4 w-4" />
```

### Icon Naming Convention

We use a specific naming convention for our icons:
- Light icons (default): Use `faNameLight` suffix (e.g., `faCheckLight`)
- Solid icons (hover/active states): Use `faNameSolid` suffix (e.g., `faCheckSolid`)

### Common Icons Reference

Here are some commonly used icons and their FontAwesome equivalents:

| Function | Lucide Icon | Our FontAwesome Icon |
|----------|------------|---------------------|
| Close/X | `<X />` | `<IconAdapter iconId="faXmarkLight" />` |
| Check | `<Check />` | `<IconAdapter iconId="faCheckLight" />` |
| Chevron Down | `<ChevronDown />` | `<IconAdapter iconId="faChevronDownLight" />` |
| Search | `<Search />` | `<IconAdapter iconId="faMagnifyingGlassLight" />` |
| Plus | `<Plus />` | `<IconAdapter iconId="faPlusLight" />` |
| Settings | `<Settings />` | `<IconAdapter iconId="faGearLight" />` |

### When Modifying Shadcn Components

When adapting Shadcn components to our system:
1. Remove all imports from `lucide-react`
2. Replace all Lucide icon components with our `IconAdapter` 
3. Use the appropriate FontAwesome icon name with correct suffix

Example:
```tsx
// BEFORE (original Shadcn)
import { X } from "lucide-react";

<DialogClose>
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</DialogClose>

// AFTER (our system)
import { IconAdapter } from "@/components/ui/atoms/icon/adapters";

<DialogClose>
  <IconAdapter iconId="faXmarkLight" className="h-4 w-4" />
  <span className="sr-only">Close</span>
</DialogClose>
```

## Adding New Components

When adding new Shadcn UI components to our project:

1. **Install using Shadcn CLI**:
   ```bash
   npx shadcn-ui@latest add button
   ```

2. **Move the component to its appropriate Atomic Design location**:
   ```bash
   # Create folder
   mkdir -p src/components/ui/atoms/button
   
   # Move component
   mv src/components/ui/button.tsx src/components/ui/atoms/button/Button.tsx
   ```

3. **Replace Lucide icons with FontAwesome icons**:
   ```tsx
   // Find and replace all Lucide icons
   import { IconAdapter } from "@/components/ui/atoms/icon/adapters";
   
   // Replace Lucide icons with our IconAdapter
   <IconAdapter iconId="faXmarkLight" className="h-4 w-4" />
   ```

4. **Add the component to the centralized exports automatically**:
   ```bash
   # This will identify new components and update the index.ts file
   node shadcn-rendering/centralized-export-generator.js
   ```

5. **Validate exports and fix any issues**:
   ```bash
   # Check for export issues
   node shadcn-rendering/validate-component-exports.js
   ```

6. **Run validation to ensure everything is set up correctly**:
   ```bash
   node shadcn-rendering/validate-components.js
   ```

## Component Classification Guide

Use this guide to determine which atomic level to use for each component:

### Atoms
- Basic UI elements that can't be broken down further
- Examples: Button, Input, Checkbox, Badge, Avatar

### Molecules
- Combinations of atoms that form a functional unit
- Examples: Card, DataTable, ComboBox, DatePicker

### Organisms
- Complex UI sections built from multiple molecules and atoms
- Examples: Forms, Navigation Menus, Dashboards, Search Interfaces

## Working with Compound Components

Some components like Dialog, Accordion, and Tabs use the compound component pattern:

```tsx
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

For these components:

1. Keep all subcomponents in the same file
2. Export all subcomponents both as named exports and as properties:

```tsx
// src/components/ui/atoms/dialog/Dialog.tsx
export const Dialog = ({ children, ...props }) => { /* ... */ };
export const DialogTrigger = ({ ...props }) => { /* ... */ };
export const DialogContent = ({ ...props }) => { /* ... */ };

// Also export as properties for dot notation
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;

// Export all for named imports
export { Dialog, DialogTrigger, DialogContent };
```

## Handling Components with Same Name

When a component exists at multiple atomic levels (e.g., Table as both atom and organism), we use atomic-level prefixes in the centralized export file:

```tsx
// src/components/ui/index.ts
export * as AtomTable from "./atoms/table/Table";
export * as OrganismTable from "./organisms/data-display/table/Table";
```

This allows you to import the specific version you need:

```tsx
// Import the atoms version
import { AtomTable } from '@/components/ui';

// Import the organisms version 
import { OrganismTable } from '@/components/ui';

// To use:
<AtomTable.Root>...</AtomTable.Root>
<OrganismTable.Root>...</OrganismTable.Root>
```

## Working with Hyphenated Component Names

Some components have hyphens in their filenames (e.g., `Aspect-ratio.tsx`). For these components:

```tsx
// In the centralized index.ts
export { default as AspectRatio } from "./atoms/aspect-ratio/Aspect-ratio";

// When importing:
import { AspectRatio } from "@/components/ui";
```

When the same hyphenated component exists at multiple levels:

```tsx
// In the centralized index.ts
export { default as AspectRatio } from "./atoms/aspect-ratio/Aspect-ratio";
export { default as MoleculeAspectRatio } from "./molecules/aspect-ratio/Aspect-ratio";

// When importing:
import { AspectRatio, MoleculeAspectRatio } from "@/components/ui";
```

## Automation Scripts

We provide several scripts to help maintain our component system:

### Centralized Export Generator

Generate a comprehensive index.ts file with all components properly exported:

```bash
# Generate the centralized exports
node shadcn-rendering/centralized-export-generator.js

# Dry run to see what would be generated
node shadcn-rendering/centralized-export-generator.js --dry-run

# Show detailed information during generation
node shadcn-rendering/centralized-export-generator.js --verbose
```

### Validate Component Exports

Check if all components are properly exported in the centralized file:

```bash
# Check for export issues
node shadcn-rendering/validate-component-exports.js

# Fix common export issues automatically
node shadcn-rendering/validate-component-exports.js --fix
```

### Validate Components

Check if all components follow our standards:

```bash
# Check for issues
node shadcn-rendering/validate-components.js

# Show detailed information
node shadcn-rendering/validate-components.js --verbose

# Fix common issues automatically
node shadcn-rendering/validate-components.js --fix
```

### Migrate Components

Move components from a flat structure to Atomic Design:

```bash
# Dry run (no changes)
node shadcn-rendering/migrate-components.js --dry-run

# Migrate all components
node shadcn-rendering/migrate-components.js

# Migrate a specific component
node shadcn-rendering/migrate-components.js --component=button
```

### Test Component Rendering

Test that components can be imported from both paths:

```bash
node shadcn-rendering/test-component-rendering.js
```

## Troubleshooting

### Component Not Found

If you get an error like `Cannot find module '@/components/ui'`:

1. Check if the component exists in the atomic structure
2. Verify that the component is properly exported in the centralized `index.ts` file
3. Run the centralized export generator to refresh the exports:
   ```bash
   node shadcn-rendering/centralized-export-generator.js
   ```

### Types Not Working

If TypeScript is giving you errors about component props:

1. Make sure the component is properly exporting its types:
   ```tsx
   export interface ButtonProps {
     // ...props
   }
   
   export const Button = ({ ...props }: ButtonProps) => { /* ... */ };
   ```

2. In the centralized index.ts file, ensure you're exporting types too:
   ```tsx
   export { Button, buttonVariants } from './atoms/button/Button';
   export type { ButtonProps } from './atoms/button/Button';
   ```

### Naming Conflicts Across Atomic Levels

If you're getting errors about duplicate exports:

1. Check if the component exists at multiple atomic levels
2. Use the centralized export generator to automatically create namespaced exports:
   ```bash
   node shadcn-rendering/centralized-export-generator.js
   ```
3. Update your imports to use the namespaced versions:
   ```tsx
   import { AtomTable, OrganismTable } from "@/components/ui";
   ```

### Hyphenated Component Issues

If you're having issues with components that have hyphenated filenames:

1. Check how the component is exported in the centralized index.ts file
2. Make sure you're importing it correctly:
   ```tsx
   // In centralized index.ts
   export { default as AspectRatio } from "./atoms/aspect-ratio/Aspect-ratio";
   
   // In your component
   import { AspectRatio } from "@/components/ui";
   ```
3. For re-exports, use the special syntax:
   ```tsx
   export { default as AspectRatio } from "./atoms/aspect-ratio/Aspect-ratio";
   ```

### Compound Component Subcomponents Not Accessible

If you can't access subcomponents (e.g., `Dialog.Trigger`):

1. Check that the component is exporting subcomponents as properties:
   ```tsx
   Dialog.Trigger = DialogTrigger;
   ```

2. Verify you're importing the parent component:
   ```tsx
   import { Dialog } from "@/components/ui";
   // Now Dialog.Trigger should be available
   ```

### Icon-Related Issues

If you're seeing issues with icons:

1. **Missing Icons**: Check if the icon exists in our registry:
   ```bash
   npm run icons:check
   ```

2. **Lucide Icons Still Present**: Search for and replace any remaining Lucide imports:
   ```bash
   grep -r "from 'lucide-react'" src/
   ```

3. **Wrong Icon Appearance**: Verify you're using the correct suffix (Light/Solid):
   ```tsx
   // Default state should use Light
   <IconAdapter iconId="faCheckLight" />
   
   // Hover/active state should use Solid
   <IconAdapter iconId="faCheckSolid" />
   ```

## Best Practices

1. **Use the Shadcn-style imports** in most cases for consistency with documentation
2. **Keep components in their appropriate atomic level** based on complexity
3. **Don't create duplicate implementations** - always use the centralized export approach
4. **Always use FontAwesome icons through our IconAdapter** - never use Lucide icons
5. **Run the centralized export generator** when adding or moving components
6. **Use unique names or atomic prefixes** for components with the same name at different levels
7. **Document component variants and props** in component files

## Conclusion

Our component system gives you the best of both worlds: the familiar import style and documentation of Shadcn UI, combined with the organizational benefits of Atomic Design. By following this guide, you'll help maintain a clean, consistent UI component system that's easy to use and extend.

Remember to always use our FontAwesome icon system through the IconAdapter rather than Lucide icons to ensure visual consistency across our application.
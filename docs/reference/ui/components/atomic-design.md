# UI Component Atomic Design

## Overview

Our UI component library follows Atomic Design principles, improving maintainability and consistency. All components are categorized into atomic groups to create a logical composition model.

## Atomic Design Structure

- **Atoms**: `/src/components/ui/atoms/`
  - Basic building blocks (buttons, inputs, icons, etc.)
  - Examples: Button, Input, Label, Badge, Toggle (formerly Switch), Slider, etc.

- **Molecules**: `/src/components/ui/molecules/`
  - Combinations of atoms forming relatively simple components
  - Examples: Accordion, Alert, Tabs, Table, Scroll-area, etc.
  - Further organized into subdirectories:
    - `feedback/` (alerts, toasts)
    - `data-display/` (tables, lists)
    - etc.

- **Organisms**: `/src/components/ui/organisms/`
  - Complex components composed of atoms and molecules
  - Examples: Card, Calendar, Modal, Forms, etc.

## Directory Structure

```
src/
└── components/
    └── ui/
        ├── atoms/
        │   ├── button/
        │   │   ├── Button.tsx        
        │   │   └── index.ts
        │   └── ...
        ├── molecules/
        │   ├── combobox/
        │   │   ├── Combobox.tsx      
        │   │   └── index.ts
        │   └── ...
        ├── organisms/
        │   ├── form/
        │   │   ├── Form.tsx          
        │   │   └── index.ts
        │   └── ...
        └── utils/
            └── font-awesome-adapter.tsx  
```

## Deprecated Components

All other components have been moved to `/src/components/ui/deprecated/` with appropriate documentation for migration. Each deprecated component includes:

- Warning about future removal
- Migration path to the new component
- Code examples for the replacement
- Timeline for removal (scheduled for v2.0.0)

This reorganization creates a cleaner architecture while ensuring backward compatibility through a documented deprecation process.

## Usage Guidelines

When using components:

```tsx
// ✅ Correct import from atomic location
import { Button } from "@/components/ui/atoms/button";

// ❌ Avoid direct shadcn imports
import { Button } from "@/components/shadcn/ui/button";
```

Alternatively, you can import directly from the main UI:

```tsx
import { Button } from "@/components/ui";
```

## Migration Guidelines

When updating existing code to use the new component structure:

1. Check if the component has been moved to atoms, molecules, or organisms
2. Update import paths accordingly
3. Follow the migration guide in the component's README if available
4. For deprecated components, refer to their README for the recommended replacement

The main `index.ts` file in the UI directory still re-exports all components for backwards compatibility, but direct imports from the atomic design directories are recommended for new code. 
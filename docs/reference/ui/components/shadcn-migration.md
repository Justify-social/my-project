# Shadcn UI Migration Guide

## Overview

This document outlines our approach to migrating the entire UI component library to use shadcn UI components while maintaining our atomic design structure.

## Motivation

- **Single Source of Truth**: Using shadcn UI as the single source of truth for UI components
- **Maintainability**: Standardizing on a well-established component library
- **Consistency**: Ensuring all components follow the same patterns and styles
- **Developer Experience**: Easier onboarding and development
- **Atomic Design**: Preserving our intuitive component organization structure

## Migration Strategy

### 1. Component Organization

We're maintaining our atomic design structure with all components organized as:

- **Atoms**: Basic building blocks (Button, Input, Card, etc.)
- **Molecules**: Combinations of atoms (Form fields, Search inputs, etc.)
- **Organisms**: Complex UI sections (Forms, DataTables, etc.)

### 2. Directory Structure

```
src/
└── components/
    └── ui/
        ├── atoms/
        │   ├── button/
        │   │   ├── Button.tsx        <-- shadcn component 
        │   │   └── index.ts
        │   └── ...
        ├── molecules/
        │   ├── combobox/
        │   │   ├── Combobox.tsx      <-- shadcn component
        │   │   └── index.ts
        │   └── ...
        ├── organisms/
        │   ├── form/
        │   │   ├── Form.tsx          <-- shadcn component
        │   │   └── index.ts
        │   └── ...
        └── utils/
            └── font-awesome-adapter.tsx  <-- Adapter for FontAwesome
```

### 3. Icon Integration

Instead of using Lucide icons (shadcn's default), we're using FontAwesome Pro through our adapter component. The migration script automatically replaces Lucide icons with FontAwesome equivalents.

### 4. Migration Process

We've created a comprehensive migration script (`scripts/shadcn-migrate.js`) that:

1. Installs all shadcn components
2. Moves them to the appropriate atomic structure location
3. Adapts components to use our FontAwesome icons
4. Updates imports throughout the codebase
5. Creates index files for easy importing

### 5. Usage Guidelines

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

### 6. Running the Migration

To perform the migration:

```bash
node scripts/shadcn-migrate.js
```

This will install and adapt all components. The process may take several minutes.

### 7. Post-Migration Steps

After running the migration:

1. Review any error messages from the script
2. Test the application thoroughly
3. Fix any component styling issues
4. Update documentation

## Customizing Components

If you need to modify a shadcn component:

1. Edit the component in its atomic location (`src/components/ui/atoms/component-name/ComponentName.tsx`)
2. Maintain the same interface and API
3. Test your changes to ensure they don't break existing usage

## Adding New shadcn Components

To add a new shadcn component:

1. Run `npx shadcn-ui add component-name`
2. Move the file to the appropriate atomic directory
3. Update imports

Or simply use our adoption script:

```bash
node scripts/shadcn-adopt.js component-name
``` 
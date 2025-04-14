# UI Component Library Usage Guide

## Single Source of Truth (SSOT) Pattern

The UI Component Library in this project follows the Single Source of Truth (SSOT) pattern, which means:

1. All components are defined in their individual files in the `src/components/ui` directory
2. All components are exported from a single entry point: `src/components/ui/index.ts`
3. All imports in the application should use this central entry point

## Importing Components

Always import components from the central `index.ts` file:

```tsx
// ✅ CORRECT: Import from the central index
import { Button, Card, Tabs } from '@/components/ui';

// ❌ INCORRECT: Do not import directly from component files
import Button from '@/components/ui/button';
```

### Importing Types

Types are also exported from the central `index.ts` file:

```tsx
// Import component types
import { Button, type ButtonProps } from '@/components/ui';
```

## Available Components

The UI component library includes the following components, primarily exported from `@/components/ui`:

### Core Components

- `Button` (and `ButtonProps`)
- `Card` (and `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`)
- `Input`
- `Select` (and `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`)
- `Tabs` (and `TabsList`, `TabsTrigger`, `TabsContent`)
- `Table` (Note: Sub-components like `TableHeader`, `TableCell` might need direct import from `./table`)
- `Alert` (and `AlertTitle`, `AlertDescription`)
- `Badge`
- `Avatar` (and `AvatarImage`, `AvatarFallback`)
- `ThemeToggle`
- `Icon` (Note: Import directly from `@/components/ui/icon/icon` recommended)

### Visualization Components

- `ChartLine`
- `ChartBar`
- `ChartPie`
- `ChartArea`
- `ChartRadar`
- `ChartScatter`
- `ChartFunnel`

### KPI & Metrics Components

- `CardKpi`
- `MetricsDashboard`
- `MetricsComparison`

### Domain-Specific Cards

- `CardAsset`
- `CardAssetPreview`

### Typography Components

- `TypographyText`
- `TypographyHeading`

### Navigation Components

- `Sidebar`
- `Header`
- `MenuMobile`

### Form Components

- `SearchBar`

### Notification Components

- `NotificationSonner`

### Loading Components

- `LoadingSpinner`
- `LoadingSkeleton` (and variants like `DashboardSkeleton`, `TableSkeleton`)

### Client Component Variants

- `Button` (client - import from `@/components/ui/client/button-client`)
- `Card` (client - import from `@/components/ui/client/card-client`)

## Adding a New Component

When adding a new component:

1. Create the component file in `src/components/ui/`
2. Export the component from `src/components/ui/index.ts`
3. Add appropriate JSDoc documentation to the component
4. Consider adding a basic rendering of the component to the `/debug-tools/ui-components` page for visual reference.

## SSOT Validation

You can validate that the codebase follows the SSOT pattern by running:

```bash
bash scripts/ui/validate-ssot.sh
```

This script will check for:

- Direct imports from component files (violation of SSOT)
- Components not exported from the main index.ts
- Duplicate component definitions

## Fixing Import Issues

If you need to fix non-compliant imports, you can run:

```bash
bash scripts/ui/fix-imports.sh
```

This script will automatically update direct imports to use the central index.ts file.

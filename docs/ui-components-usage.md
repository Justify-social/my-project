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

The UI component library includes the following components:

### Basic Components
- `Button`: Standard button component with various variants and sizes
- `Card`: Container component with header, content, and footer sections
- `Input`: Text input component
- `Select`: Dropdown select component

### Layout Components
- `Tabs`: Tab navigation component

### Data Components
- Charts: `LineChart`, `BarChart`, `PieChart`, `AreaChart`, `RadarChart`, `ScatterChart`, `FunnelChart`
- KPI Components: `KpiCard`, `MetricsDashboard`, `MetricComparison`

### Client Components
- `Button` (client version): Enhanced interactive version of button
- `Card` (client version): Enhanced interactive version of card

### Other Components
- `ThemeToggle`: Component for switching between light and dark themes
- `Icon`: Universal icon component supporting multiple icon libraries

## Examples

Examples of all components can be found at:
`/debug-tools/ui-components/examples/`

The examples are organized by category:
- Basic Components (`/examples/basics/`)
- Layout Components (`/examples/layouts/`)
- Data Components (`/examples/data/`)
- Form Components (`/examples/forms/`)
- Theme Components (`/examples/themes/`)
- Pattern Examples (`/examples/patterns/`)

## Adding a New Component

When adding a new component:

1. Create the component file in `src/components/ui/`
2. Export the component from `src/components/ui/index.ts`
3. Add appropriate JSDoc documentation to the component
4. Create example usage in the relevant category under `/examples/`

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
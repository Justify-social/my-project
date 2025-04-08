# UI Component Library

This directory contains all UI components organized according to atomic design principles and the server/client component strategy.

## Directory Structure

```
src/components/ui/
├── button.tsx            # Server component
├── card.tsx              # Server component
├── ...
├── client/               # Client components
│   ├── button-client.tsx # Client wrapper
│   ├── card-client.tsx   # Client wrapper
│   └── ...
├── utils/                # Utility functions
│   ├── classify.ts       # Component classification
│   ├── icon-integration.ts # Icon utilities
│   └── theme-override.ts # Theme customization
└── theme-toggle.tsx      # Theme toggle component
```

## Component Categories

Components are organized according to the atomic design methodology:

- **Atoms**: Basic building blocks (Button, Input, Avatar, etc.)
- **Molecules**: Groups of atoms (Card, Alert, Dialog, etc.)
- **Organisms**: Complex components (DataTable, Form, Header, etc.)
- **Templates**: Page-level layouts
- **Pages**: Application pages

## Usage Guidelines

### Server vs. Client Components

By default, all components are implemented as React Server Components. For interactive components that require client-side behavior:

1. Use the client wrapper version of the component (e.g., `button-client.tsx` instead of `button.tsx`)
2. Import from the client directory: `import { Button } from "@/components/ui/client/button-client"`

For more information, see [Server vs. Client Components](../../../docs/server-client-components.md).

### Basic Usage

```tsx
// Server component (default)
import { Button } from "@/components/ui/button";

export default function MyPage() {
  return (
    <Button variant="outline">Static Button</Button>
  );
}
```

```tsx
// Client component (for interactivity)
'use client';

import { Button } from "@/components/ui/client/button-client";

export default function InteractiveComponent() {
  return (
    <Button 
      onClick={() => alert('Clicked!')}
      loading={isLoading}
    >
      Interactive Button
    </Button>
  );
}
```

## Theme Customization

Components use CSS variables defined in `globals.css` and can be customized using the theme-override utility:

```tsx
import { buttonStyles } from "@/components/ui/utils/theme-override";

// Custom button with brand styling
<Button className={buttonStyles({ color: "brand" })}>
  Brand Button
</Button>
```

## Icon Integration

Components use FontAwesome Pro icons through the icon-integration utility:

```tsx
import { getIconClasses } from "@/components/ui/utils/icon-integration";

<Button>
  <i className={getIconClasses("plus")}></i>
  Add Item
</Button>
```

## Documentation

Comprehensive documentation for all components is available in the component browser:

- Component Browser: `/debug-tools/ui-components`
- Server vs. Client: `/debug-tools/ui-components/render-type-comparison`
- Server Test: `/debug-tools/ui-components/server-test`
- Client Test: `/debug-tools/ui-components/client-test`

To generate static documentation:

```bash
npm run docs:ui
# or directly
npx tsx scripts/ui/generate-docs.ts
```

## Architecture & SSOT

The UI component system follows Single Source of Truth principles:

- All component metadata is parsed from JSDoc comments to ensure consistency
- A central type system in `scripts/ui/types.ts` provides shared interfaces
- Component parsing logic is centralized in `scripts/ui/utils/component-parser.ts`
- Production optimizations use a pre-built registry at `utils/component-registry.json`

All tooling and scripts follow these principles to maintain consistency.

## Component Metadata

Components use JSDoc comments to specify metadata:

```tsx
/**
 * @component Button
 * @category atom
 * @renderType server
 * @description A versatile button component with multiple variants
 * @status stable
 * @author Frontend Team
 * @since 2023-04-01
 * 
 * @example
 * ```tsx
 * <Button variant="primary">Click me</Button>
 * ```
 */
```

## Testing

Components have corresponding test files:

- Unit tests: `tests/unit/components/ui/[component].test.tsx`
- Storybook: `src/components/ui/[component].stories.tsx`

To run tests:

```bash
npm test
```

To generate a test file for a component:

```bash
npm run ui:generate-test -- button
# or directly
npx tsx scripts/ui/generate-component-test.ts button
```

## Adding New Components

Use the installation script to add new components:

```bash
./scripts/ui/install-component.sh [component-name] --category [atom|molecule|organism|template|page]
```

This script will:

1. Install the component using Shadcn UI
2. Add appropriate JSDoc comments
3. Categorize the component
4. Apply theme overrides

## Resources

- [Design System Documentation](../../../docs/)
- [Server vs. Client Strategy](../../../docs/server-client-components.md)
- [Testing Guide](../../../docs/testing.md)

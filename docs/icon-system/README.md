# Icon System

A streamlined, maintainable icon system using FontAwesome Pro.

## Core Architecture

The icon system follows a minimalist architecture with only 6 essential files:

```
src/components/ui/atoms/icons/
├── Icon.tsx          # Main component for rendering all icon types
├── icons.ts          # Utility functions for icon management
├── types.ts          # TypeScript definitions
├── registry.json     # Single source of truth for icon registration
├── IconContext.tsx   # Optional global configuration
└── index.ts          # Export interface
```

## Key Features

- **Simple API**: One component with consistent props
- **Multiple Variants**: Light (default), solid (hover), and brand icons
- **Semantic Names**: Use intuitive names like `add` instead of `faPlus`
- **Error Handling**: Built-in fallbacks and validation
- **Type Safety**: Full TypeScript interface

## Basic Usage

```tsx
import { Icon } from '@/components/ui/atoms/icons';

// Basic usage
<Icon name="user" />

// With size and style variants
<Icon name="user" size="lg" variant="solid" />

// Using semantic names
<Icon name="add" /> // Maps to faPlus automatically

// Platform icons
<Icon name="facebook" />
```

## Brand Guidelines

- Default state: `fa-light` (light variant)
- Hover state: `fa-solid` (solid variant)
- Primary color: Jet `#333333`
- Accent color: Deep Sky Blue `#00BFFF`

## Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | (required) | Icon name |
| `size` | `'xs'` to `'4xl'` | `'md'` | Icon size |
| `variant` | `'light'` \| `'solid'` \| `'brand'` | `'light'` | Icon style |
| `active` | `boolean` | `false` | When true, uses solid variant |
| `className` | `string` | `''` | Additional CSS classes |

## Implementation Details

- Icons are sourced from FontAwesome Pro library
- Single registry for all icon types eliminates redundancy
- Consolidated from a complex 20+ file architecture
- Components auto-update on hover (light → solid)

## For Developers

- Always use the `<Icon>` component, never direct FontAwesome imports
- Use semantic names when available for better readability
- See full documentation in [implementation-history.md](./implementation-history.md) 
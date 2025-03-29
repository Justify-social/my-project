# Icon System

A streamlined, easy-to-use icon system for the application.

## Key Features

- **Simple API**: Single component with consistent props
- **Error Handling**: Built-in fallbacks and validation
- **Type Safety**: Full TypeScript support
- **Variants**: Light, solid, and brand icons
- **Semantic Names**: Use intuitive names like `add` instead of `faPlus`

## Usage

### Basic Usage

```tsx
import { Icon } from '@/components/ui/atoms/icons';

// Basic usage
<Icon name="user" />

// With size variants
<Icon name="user" size="lg" />

// With style variants
<Icon name="user" variant="solid" />

// Using semantic names
<Icon name="add" /> // Automatically maps to faPlus
```

### Convenience Components

```tsx
import { SolidIcon, LightIcon } from '@/components/ui/atoms/icons';

// Use solid style
<SolidIcon name="user" />

// Use light style 
<LightIcon name="user" />
```

### Global Configuration

```tsx
import { IconProvider } from '@/components/ui/atoms/icons';

// Set global defaults
<IconProvider defaultSize="lg" defaultVariant="solid">
  <App />
</IconProvider>
```

## Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | (required) | Icon name (semantic, FontAwesome, or platform) |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl'` | `'md'` | Icon size |
| `variant` | `'light' \| 'solid' \| 'regular' \| 'brand'` | `'light'` | Icon style variant |
| `active` | `boolean` | `false` | Whether the icon is active (uses solid variant) |
| `className` | `string` | `''` | Additional CSS classes |
| `title` | `string` | `undefined` | Accessibility title/tooltip |
| `onClick` | `(e: React.MouseEvent) => void` | `undefined` | Click handler |

## Available Sizes

| Size | Class | Dimensions |
|------|-------|------------|
| `xs` | `w-3 h-3` | 0.75rem × 0.75rem |
| `sm` | `w-4 h-4` | 1rem × 1rem |
| `md` | `w-5 h-5` | 1.25rem × 1.25rem |
| `lg` | `w-6 h-6` | 1.5rem × 1.5rem |
| `xl` | `w-8 h-8` | 2rem × 2rem |
| `2xl` | `w-10 h-10` | 2.5rem × 2.5rem |
| `3xl` | `w-12 h-12` | 3rem × 3rem |
| `4xl` | `w-16 h-16` | 4rem × 4rem |

## Semantic Names

The following semantic names are available for easier usage:

| Semantic Name | Actual Icon |
|---------------|-------------|
| `add` | `faPlus` |
| `delete` | `faTrash` |
| `edit` | `faPen` |
| `save` | `faSave` |
| `close` | `faXmark` |
| `check` | `faCheck` |
| `info` | `faInfo` |
| `warning` | `faTriangleExclamation` |
| `error` | `faCircleXmark` |
| `success` | `faCircleCheck` |

Plus many more - see the `SEMANTIC_ICONS` constant for a complete list.

## Platform Icons

Social media platform icons can be used directly:

```tsx
<Icon name="facebook" />
<Icon name="instagram" />
<Icon name="linkedin" />
<Icon name="tiktok" />
<Icon name="youtube" />
<Icon name="x" />
```

## Error Handling

The icon system has built-in error handling:

- Invalid icon names show a fallback question mark
- Network errors automatically use a fallback
- Missing icons display a placeholder
- Type checking prevents common mistakes

## Advanced Usage

### Using in Buttons

```tsx
<button className="flex items-center">
  <Icon name="save" className="mr-2" />
  Save
</button>
```

### With Color Overrides

```tsx
<Icon name="warning" className="text-yellow-500" />
<Icon name="error" className="text-red-500" />
<Icon name="success" className="text-green-500" />
```

## Architecture

This icon system follows a flat architecture with minimal files:

- `Icon.tsx`: The main component
- `icons.ts`: Utility functions
- `types.ts`: TypeScript definitions
- `registry.json`: Icon metadata
- `IconContext.tsx`: Optional global config
- `index.ts`: Export all features 
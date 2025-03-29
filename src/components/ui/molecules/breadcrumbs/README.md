# Breadcrumbs Component

A navigation component that helps users understand their current location within a website's hierarchy and move between levels.

## Features

- Responsive design that adapts to different screen sizes
- Automatic home link/icon inclusion
- Support for path truncation on long paths
- Customizable separators (text or icons)
- Icon support for individual breadcrumb items
- Accessible implementation with proper ARIA attributes
- Customizable styling via class names

## Usage

```tsx
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/molecules/breadcrumbs';

function MyPage() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'category', label: 'Electronics', href: '/products/electronics' },
    { id: 'current', label: 'Smartphones', href: '/products/electronics/smartphones', isCurrent: true }
  ];
  
  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page content */}
    </div>
  );
}
```

## Props

### BreadcrumbsProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | required | Array of breadcrumb items to display |
| `maxItems` | `number` | undefined | Maximum number of items to show before truncating |
| `homeText` | `string` | 'Home' | Text to display for the home breadcrumb |
| `homeIcon` | `string` | 'fa-home' | Icon to display for the home breadcrumb |
| `homeHref` | `string` | '/' | URL for the home breadcrumb |
| `separator` | `ReactNode` | '/' | Separator between breadcrumb items |
| `className` | `string` | undefined | Additional class for the breadcrumbs container |
| `itemClassName` | `string` | undefined | Additional class for breadcrumb items |
| `activeClassName` | `string` | undefined | Additional class for the active/current breadcrumb |
| `separatorClassName` | `string` | undefined | Additional class for separators |

### BreadcrumbItem

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the breadcrumb item |
| `label` | `string` | Text to display for the breadcrumb |
| `href` | `string` | URL to navigate to when clicked |
| `icon` | `string` (optional) | Icon name to display before the label |
| `isCurrent` | `boolean` (optional) | Whether this is the current/active breadcrumb |

## Examples

### Basic Breadcrumbs

```tsx
<Breadcrumbs
  items={[
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'category', label: 'Electronics', href: '/products/electronics' },
    { id: 'current', label: 'Smartphones', href: '/products/electronics/smartphones', isCurrent: true }
  ]}
/>
```

### With Truncation

```tsx
<Breadcrumbs
  items={longPathItems}
  maxItems={5}
/>
```

### Custom Separator

```tsx
import { Icon } from '@/components/ui/atoms/icons';

<Breadcrumbs
  items={items}
  separator={<Icon name="fa-chevron-right" size="xs" />}
/>
```

### Custom Styling

```tsx
<Breadcrumbs
  items={items}
  className="font-semibold"
  itemClassName="rounded py-1 px-2 hover:bg-white"
  activeClassName="bg-blue-500 text-white rounded py-1 px-2"
  separatorClassName="text-gray-500"
/>
```

## Accessibility

- Uses semantic `<nav>` element with appropriate `aria-label`
- Current page is marked with `aria-current="page"` 
- Separators have `aria-hidden="true"` to prevent screen readers from announcing them

See `examples/BreadcrumbsExamples.tsx` for more implementation examples. 
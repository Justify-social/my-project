# Card Component

The Card component is a versatile container that provides structure and styling for grouping related content. It supports various visual styles, header/footer configurations, and specialized variants for metrics and KPIs.

## Features

- **Multiple Variants**: default, interactive, outline, raised
- **Hover Effects**: Optional hover styles for interactive elements
- **Structured Layout**: CardHeader, CardContent, and CardFooter for organized content
- **Metric Display**: Specialized MetricCard for displaying KPIs
- **Customizable**: Full control over styling with className props

## Usage

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/organisms/Card';

function MyComponent() {
  return (
    <Card variant="interactive" hoverable>
      <CardHeader>
        <h3 className="text-lg font-medium">Card Title</h3>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter align="right" withBorder>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Action
        </button>
      </CardFooter>
    </Card>
  );
}
```

## Card Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'interactive' \| 'outline' \| 'raised'` | `'default'` | Visual style of the card |
| `hoverable` | `boolean` | `false` | Whether the card should have hover effects |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Content to render inside the card |

## CardHeader Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | - | Icon to display in the header |
| `actions` | `React.ReactNode` | - | Actions to display in the header (typically buttons) |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Content of the header |

## CardContent Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `withPadding` | `boolean` | `true` | Whether to add padding to the content |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Content of the card body |

## CardFooter Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `'left' \| 'center' \| 'right' \| 'between'` | `'right'` | Controls the alignment of items in the footer |
| `withBorder` | `boolean` | `true` | Whether to show a border at the top of the footer |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Content of the footer |

## MetricCard Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `React.ReactNode` | - | Title of the metric |
| `value` | `React.ReactNode` | - | Primary value to display |
| `description` | `React.ReactNode` | - | Optional secondary/description text |
| `icon` | `React.ReactNode` | - | Optional icon for the card |
| `trend` | `number` | - | Optional trend indicator (positive or negative) |
| `className` | `string` | - | Additional CSS classes |

## Examples

### Basic Card

```tsx
<Card>
  <CardContent>
    <p>Simple card with default styling.</p>
  </CardContent>
</Card>
```

### Card with Header and Footer

```tsx
<Card variant="outline">
  <CardHeader>
    <h3>Features</h3>
  </CardHeader>
  <CardContent>
    <ul>
      <li>Feature 1</li>
      <li>Feature 2</li>
      <li>Feature 3</li>
    </ul>
  </CardContent>
  <CardFooter align="center">
    <button>Learn More</button>
  </CardFooter>
</Card>
```

### Interactive Card

```tsx
<Card variant="interactive" hoverable>
  <CardContent>
    <p>This card has hover effects and looks interactive.</p>
  </CardContent>
</Card>
```

### MetricCard Example

```tsx
<MetricCard
  title="Monthly Revenue"
  value="$12,345"
  description="Last 30 days"
  trend={5.2}
  icon={<Icon name="faChartLine" type="static" className="h-5 w-5" />}
/>
```

## Accessibility

- CardHeader components are styled with appropriate spacing and sizing for clear visual hierarchy
- MetricCard includes color-coded trend indicators with icons for better visual cues
- All card elements accept standard HTML attributes for customization

## Notes on Migration

This component has been migrated from `src/components/ui/layouts/Card.tsx` to its new location following the atomic design pattern. The Card is now properly categorized as an organism since it's a complex component made up of multiple smaller parts (CardHeader, CardContent, CardFooter).

Key improvements in this migration:
- Fixed incorrect icon import
- Added proper type definitions
- Improved documentation
- Used the `cn` utility for class name management
- Followed atomic design principles 
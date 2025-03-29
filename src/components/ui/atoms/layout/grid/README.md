# Grid Component

A flexible layout component for creating responsive CSS grid layouts with configurable columns and spacing. The Grid component makes it easy to create complex layouts that adapt to different screen sizes.

## Features

- **Responsive Columns**: Define different column counts for various screen sizes
- **Configurable Gap Spacing**: Multiple gap size options for spacing between grid items
- **Tailwind CSS Integration**: Uses Tailwind's grid utility classes
- **Simple API**: Intuitive prop names for responsive grid layouts
- **Customizable**: Accepts all standard div HTML attributes

## Usage

```tsx
import { Grid } from '@/components/ui/atoms/layout/grid';

// Basic grid with 2 columns
function BasicGrid() {
  return (
    <Grid cols={2} gap="md">
      <div className="bg-blue-100 p-4 rounded">Item 1</div>
      <div className="bg-blue-100 p-4 rounded">Item 2</div>
      <div className="bg-blue-100 p-4 rounded">Item 3</div>
      <div className="bg-blue-100 p-4 rounded">Item 4</div>
    </Grid>
  );
}

// Responsive grid that adapts to screen size
function ResponsiveGrid() {
  return (
    <Grid 
      cols={1}      // 1 column on mobile
      colsSm={2}    // 2 columns on small screens (640px+)
      colsMd={3}    // 3 columns on medium screens (768px+)
      colsLg={4}    // 4 columns on large screens (1024px+)
      colsXl={6}    // 6 columns on extra large screens (1280px+)
      gap="lg"
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="bg-green-100 p-4 rounded">
          Item {index + 1}
        </div>
      ))}
    </Grid>
  );
}

// Grid with different gap sizing
function GapVariants() {
  return (
    <div className="space-y-8">
      <Grid cols={3} gap="none" className="border border-gray-200">
        <div className="bg-red-100 p-4">No Gap</div>
        <div className="bg-red-100 p-4">No Gap</div>
        <div className="bg-red-100 p-4">No Gap</div>
      </Grid>
      
      <Grid cols={3} gap="xs" className="border border-gray-200">
        <div className="bg-yellow-100 p-4">XS Gap</div>
        <div className="bg-yellow-100 p-4">XS Gap</div>
        <div className="bg-yellow-100 p-4">XS Gap</div>
      </Grid>
      
      <Grid cols={3} gap="md" className="border border-gray-200">
        <div className="bg-blue-100 p-4">MD Gap</div>
        <div className="bg-blue-100 p-4">MD Gap</div>
        <div className="bg-blue-100 p-4">MD Gap</div>
      </Grid>
      
      <Grid cols={3} gap="xl" className="border border-gray-200">
        <div className="bg-purple-100 p-4">XL Gap</div>
        <div className="bg-purple-100 p-4">XL Gap</div>
        <div className="bg-purple-100 p-4">XL Gap</div>
      </Grid>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| cols | 1-12 | 1 | Number of columns at the default (smallest) breakpoint |
| colsSm | 1-12 | undefined | Number of columns at the sm breakpoint (640px+) |
| colsMd | 1-12 | undefined | Number of columns at the md breakpoint (768px+) |
| colsLg | 1-12 | undefined | Number of columns at the lg breakpoint (1024px+) |
| colsXl | 1-12 | undefined | Number of columns at the xl breakpoint (1280px+) |
| gap | 'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Gap between grid items |
| children | ReactNode | - | Grid items to display |
| className | string | - | Additional CSS classes to apply |

Plus all standard `div` HTML attributes.

## Gap Size Reference

| Gap Size | CSS Class | Approximate Size |
|----------|-----------|------------------|
| none | gap-0 | 0px |
| xs | gap-1 | 0.25rem (4px) |
| sm | gap-2 | 0.5rem (8px) |
| md | gap-4 | 1rem (16px) |
| lg | gap-6 | 1.5rem (24px) |
| xl | gap-8 | 2rem (32px) |

## Best Practices

- Use the Grid component for creating multi-column layouts
- Leverage the responsive column props to create layouts that adapt to screen size
- Use the gap prop to control spacing consistency between grid items
- For common layouts like side-by-side elements, a simple `cols={2}` provides a clean solution
- Consider using a combination with Container for complete page layouts 
# Divider

A component used to create a visual separation between content sections.

## Usage

```tsx
import { Divider } from '@/components/ui/atoms/layout/divider';

function MyComponent() {
  return (
    <div>
      <p>Content above the divider</p>
      <Divider />
      <p>Content below the divider</p>
    </div>
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| orientation | 'horizontal' \| 'vertical' | 'horizontal' | The orientation of the divider |
| variant | 'solid' \| 'dashed' \| 'dotted' | 'solid' | The style of the divider line |
| thickness | 'thin' \| 'medium' \| 'thick' | 'thin' | The thickness of the divider |
| color | string | 'divider' | The color of the divider (uses theme colors) |

## Variants

### Orientation

```tsx
<Divider orientation="horizontal" /> // Default
<Divider orientation="vertical" />
```

### Line Style

```tsx
<Divider variant="solid" /> // Default
<Divider variant="dashed" />
<Divider variant="dotted" />
```

### Thickness

```tsx
<Divider thickness="thin" /> // Default
<Divider thickness="medium" />
<Divider thickness="thick" />
```

## Accessibility

The Divider component includes appropriate ARIA attributes to ensure accessibility:
- Uses `role="separator"` to indicate its purpose
- Includes `aria-orientation` attribute matching the visual orientation

## Related Components

- Spacer - For adding empty space without visual elements
- Container - For wrapping and containing content
- Stack - For stacking elements with consistent spacing 
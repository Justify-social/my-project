# Spacer

A utility component used to add whitespace between UI elements.

## Usage

```tsx
import { Spacer } from '@/components/ui/atoms/layout/spacer';

function MyComponent() {
  return (
    <div>
      <div>First element</div>
      <Spacer y="md" />
      <div>Second element</div>
      <Spacer y="lg" />
      <div>Third element</div>
    </div>
  );
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| x | SpacerSize \| number \| string | undefined | Horizontal space (width) |
| y | SpacerSize \| number \| string | undefined | Vertical space (height) |
| inline | boolean | false | Whether the spacer should be displayed as inline |

### SpacerSize

Predefined sizes based on the design system:

| Size | Rem Value | Pixels (approx) |
|------|-----------|-----------------|
| xs | 0.25rem | 4px |
| sm | 0.5rem | 8px |
| md | 1rem | 16px |
| lg | 1.5rem | 24px |
| xl | 2rem | 32px |
| 2xl | 3rem | 48px |
| 3xl | 4rem | 64px |
| 4xl | 6rem | 96px |

## Examples

### Vertical Spacing

```tsx
<Spacer y="md" /> // 16px vertical space
<Spacer y={20} /> // 20px vertical space
<Spacer y="2rem" /> // 2rem vertical space
```

### Horizontal Spacing

```tsx
<Spacer x="md" /> // 16px horizontal space
<Spacer x={20} /> // 20px horizontal space
<Spacer x="2rem" /> // 2rem horizontal space
```

### Combined Spacing

```tsx
<Spacer x="md" y="lg" /> // 16px horizontal, 24px vertical space
```

### Inline Spacing

```tsx
<span>Text</span><Spacer x="md" inline /><span>More text</span>
```

## Related Components

- Divider - For adding a visual separator between content
- Stack - For stacking elements with consistent spacing
- Container - For wrapping and containing content 
# Icon Adapter Usage Guide

This document outlines the standardized usage patterns for icon adapters in the application.

## Overview

Icon adapters provide compatibility layers between our core Icon component and various UI libraries or legacy patterns. They ensure consistent icon rendering while allowing integration with different frameworks.

All adapters follow the Single Source of Truth (SSOT) principle by ultimately rendering through the core `Icon` component, which fetches icon data from the canonical registry files.

## Canonical Adapters

### ShadcnIcon (Primary Adapter)

The `ShadcnIcon` adapter is designed for use with Shadcn UI components. It's the recommended adapter for all new components.

```tsx
import { ShadcnIcon } from '@/components/ui/icon/adapters/shadcn-adapter';

// Basic usage
<ShadcnIcon iconId="faChevronDownLight" />

// With size variant
<ShadcnIcon iconId="faChevronDownLight" size="sm" />

// With solid variant
<ShadcnIcon iconId="faChevronDownLight" variant="solid" />

// With additional props
<ShadcnIcon 
  iconId="faChevronDownLight"
  className="text-primary"
  onClick={() => console.log('Icon clicked')}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `iconId` | string | The ID of the icon from the registry (required) |
| `size` | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' | Size variant |
| `variant` | 'light' \| 'solid' | Icon variant (defaults to 'light') |
| `className` | string | Additional CSS classes |
| `onClick` | function | Click handler |

### IconAdapter (Legacy Adapter)

The `IconAdapter` provides backward compatibility for older components that used different icon patterns.

```tsx
import { IconAdapter } from '@/components/ui/icon/adapters/font-awesome-adapter';

// Basic usage with explicit variant in ID
<IconAdapter iconId="faChevronDownLight" />

// Using legacy solid prop (not recommended for new code)
<IconAdapter iconId="faChevronDown" solid={true} />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `iconId` | string | The ID of the icon (required) |
| `solid` | boolean | Legacy prop to use solid variant (prefer using iconId with Solid suffix) |
| `className` | string | Additional CSS classes |
| `onClick` | function | Click handler |
| `style` | object | Inline styles |
| `title` | string | Accessibility title |

## Deprecated Adapters

The following adapters are deprecated and should not be used in new code:

- `FontAwesomeIcon` - Use `ShadcnIcon` instead
- `ShadcnIcon` from shadcn.tsx - Use `ShadcnIcon` from shadcn-adapter.tsx instead
- `ShadcnSolidIcon` - Use `ShadcnIcon` with `variant="solid"` instead

## Best Practices

1. **Prefer Direct Icon Import for Simple Cases**
   ```tsx
   import { Icon } from '@/components/ui/icon/icon';
   
   <Icon iconId="faChevronDownLight" />
   ```

2. **Use ShadcnIcon for Shadcn UI Integration**
   ```tsx
   import { ShadcnIcon } from '@/components/ui/icon/adapters/shadcn-adapter';
   
   <ShadcnIcon iconId="faChevronDownLight" />
   ```

3. **Ensure Correct Variant Suffix in iconId**
   ```tsx
   // Correct
   <ShadcnIcon iconId="faChevronDownLight" />
   <ShadcnIcon iconId="faChevronDownSolid" />
   
   // Avoid
   <ShadcnIcon iconId="faChevronDown" /> // Missing variant suffix
   ```

4. **Use Semantic Icon Mapping When Possible**
   ```tsx
   import { UI_ICON_MAP } from '@/components/ui/icon/icon-semantic-map';
   
   <ShadcnIcon iconId={UI_ICON_MAP.chevronDown} />
   ```

## Integration Examples

### Button with Icon

```tsx
import { Button } from '@/components/ui/button';
import { ShadcnIcon } from '@/components/ui/icon/adapters/shadcn-adapter';

<Button>
  <ShadcnIcon iconId="faArrowRightLight" className="mr-2" />
  Submit
</Button>
```

### Form Elements with Icons

```tsx
import { Input } from '@/components/ui/input';
import { ShadcnIcon } from '@/components/ui/icon/adapters/shadcn-adapter';

<div className="relative">
  <Input placeholder="Search..." />
  <ShadcnIcon 
    iconId="faSearchLight" 
    className="absolute right-3 top-1/2 transform -translate-y-1/2" 
  />
</div>
```

## Adapter Implementation

All adapters ultimately render through the core `Icon` component, maintaining the SSOT pattern:

```tsx
// Simple adapter pattern
const ShadcnIcon = forwardRef<HTMLSpanElement, ShadcnIconProps>(
  ({ iconId, className, size, variant, ...props }, ref) => {
    return (
      <Icon
        iconId={iconId}
        size={size as IconSize}
        variant={variant as IconVariant}
        className={className}
        {...props}
      />
    );
  }
);
``` 
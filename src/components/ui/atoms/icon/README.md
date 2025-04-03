/**
 * @fileoverview Icon Component Documentation
 * 
 * This file contains documentation for the Icon component system, which
 * provides a consistent and optimized way to use icons throughout the application.
 */

# Icon System - Single Source of Truth (SSOT)

This directory contains the Icon component system for the application, implementing a Single Source of Truth approach to icon management.

## Key Features

- **Semantic Icon Mapping**: Use meaningful names instead of technical icon IDs
- **Type Safety**: Full TypeScript support for icon usage
- **Variant Support**: Light (default) and Solid variants (for hover states)
- **Consistent Design**: Follows FontAwesome Pro naming conventions
- **Extensible**: Easy to add new icons and semantic mappings

## Usage Examples

### Recommended: Semantic Approach (SSOT)

```tsx
import { Icon } from '@/components/ui/atoms/icon';

// Use semantic names for icons (recommended)
<Icon semantic="add" />                  // Maps to faPlusLight
<Icon semantic="calendar" />             // Maps to faCalendarLight
<Icon semantic="success" />              // Maps to faCircleCheckLight

// For hover states / active state
<Icon semantic="add" active={true} />    // Uses solid variant (faPlusSolid)
<SolidIcon semantic="add" />             // Explicit solid variant
<LightIcon semantic="add" />             // Explicit light variant
```

### Alternative: Direct IconID Approach

```tsx
import { Icon } from '@/components/ui/atoms/icon';

// Use explicit icon IDs with variant suffix
<Icon iconId="faPlusLight" />            // Explicit Light variant
<Icon iconId="faPlusSolid" />            // Explicit Solid variant
```

### Legacy: Name + Variant Approach (Not Recommended)

```tsx
import { Icon } from '@/components/ui/atoms/icon';

// Use base name with variant prop
<Icon name="faPlus" variant="light" />   // Light variant
<Icon name="faPlus" variant="solid" />   // Solid variant
```

## Icon Sizes

The Icon component supports standard sizes through the `size` prop:

```tsx
<Icon semantic="add" size="xs" />        // Extra small (w-3 h-3)
<Icon semantic="add" size="sm" />        // Small (w-4 h-4)
<Icon semantic="add" size="md" />        // Medium (w-5 h-5) - Default
<Icon semantic="add" size="lg" />        // Large (w-6 h-6)
<Icon semantic="add" size="xl" />        // Extra large (w-8 h-8)
<Icon semantic="add" size="2xl" />       // 2x large (w-10 h-10)
<Icon semantic="add" size="3xl" />       // 3x large (w-12 h-12)
```

## Best Practices

1. **Always use semantic names**: Use `semantic` prop with names from `UI_ICON_MAP` whenever possible
2. **Hover states**: Use `active={true}` prop for hover states (automatically switches to solid variant)
3. **Custom styling**: Use the `className` prop to add custom styles
4. **Accessibility**: Always include a `title` prop for screen readers

## Implementation Details

### Semantic Mapping

The semantic mapping is defined in `semantic-map.ts` and provides a mapping from semantic names to actual FontAwesome icon IDs.

```ts
// Import the map if you need to look up available icons
import { UI_ICON_MAP } from '@/components/ui/atoms/icon';

// Examples of available semantic names:
// "add", "edit", "delete", "calendar", "info", "warning", "success"
```

### Auto-Switching Variants

The Icon component automatically handles switching between light and solid variants based on the `active` prop:

```tsx
// In a button or interactive component
<button className="group">
  <Icon 
    semantic="add" 
    className="transition-all group-hover:text-primary" 
    active={isHovered} 
  />
  Add Item
</button>
```

### Helper Functions

You can also access helper functions for working with icon variants:

```tsx
import { getSolidUIIcon } from '@/components/ui/atoms/icon';

// Get the solid variant of a semantic icon
const solidIconId = getSolidUIIcon('add');  // Returns "faPlusSolid"
```

## Adding New Icons

To add new semantic icon mappings:

1. Update the `UI_ICON_MAP` in `semantic-map.ts`
2. Ensure the icon exists in the FontAwesome Pro library
3. Use the new semantic name in your components

## Questions and Support

For questions or support with the icon system, please contact the UI team or refer to the design system documentation. 
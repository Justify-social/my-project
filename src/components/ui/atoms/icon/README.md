/**
 * @fileoverview Icon Component Documentation
 * 
 * This file contains documentation for the Icon component system, which
 * provides a consistent and optimized way to use icons throughout the application.
 */

# Icon Component

The Icon component system provides a standardized way to use FontAwesome icons across the application.

## Features

- 🔎 Single source of truth for all icons
- 🔄 Support for light (default) and solid (hover/active) variants 
- 🌟 Consistent styling and sizing
- ⚠️ Type safety for icon names
- 🚀 Performance optimized with SVG

## Usage

```jsx
import { Icon } from '@/components/ui/atoms/icon';

// Basic usage with explicit iconId (preferred)
<Icon iconId="faChevronDownLight" />

// With size
<Icon iconId="faChevronDownLight" size="lg" />

// With solid variant (for hover states)
<Icon iconId="faChevronDownSolid" variant="solid" />

// Explicit control of active state (will use solid variant)
<Icon iconId="faChevronDown" active={true} />
```

## Registry Files

All icons are registered in category-specific registry files:

- `app-icon-registry.json` - Application-specific icons
- `brands-icon-registry.json` - Social media and brand icons
- `kpis-icon-registry.json` - Key Performance Indicator icons
- `light-icon-registry.json` - Light variant icons (default)
- `solid-icon-registry.json` - Solid variant icons (hover, active)

These files are consolidated by the registry-loader.ts to create a unified source of truth.

## Adding New Icons

1. Add the icon SVG file to the appropriate directory:
   - `/public/icons/light/` for light icons
   - `/public/icons/solid/` for solid icons
   - `/public/icons/brands/` for brand icons
   - `/public/icons/app/` for application-specific icons

2. Update the appropriate registry file with the new icon metadata.

3. Run the icon validation scripts to ensure everything is working correctly:
   ```
   npm run icons:validate
   ```

## Icon Conventions

- All icons use the FontAwesome Pro naming conventions
- Light variant is the default (used for normal state)
- Solid variant is used for hover/active states
- Icon IDs should follow the format: `fa[IconName][Variant]`
  - Example: `faChevronDownLight`, `faChevronDownSolid`

## TypeScript Support

The Icon component provides full TypeScript support:

```tsx
import { Icon, IconProps } from '@/components/ui/atoms/icon';

// Type-safe icon component
const MyIcon: React.FC<Omit<IconProps, 'iconId'>> = (props) => {
  return <Icon iconId="faChevronDownLight" {...props} />;
};
```

## Advanced Usage

### Hover Effects

To implement hover effects, use CSS:

```css
.my-icon-container:hover .icon-light {
  display: none;
}
.my-icon-container:hover .icon-solid {
  display: block;
}
```

### Adapters

For special use cases, there are adapter components available:

```jsx
import { ShadcnIcon } from '@/components/ui/atoms/icon/adapters';

// ShadcnIcon provides shadcn/ui compatible styling
<ShadcnIcon iconId="faChevronDownLight" />
``` 
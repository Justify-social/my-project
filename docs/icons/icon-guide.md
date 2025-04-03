# Icon System Usage Guide

## Overview

This guide explains how to use the standardized icon system in our application. The icon system provides a consistent way to access and display icons throughout the application, with proper typing and validation.

## Icon Registry Structure

All icons are stored in registry JSON files:
- `app-icon-registry.json` - Application-specific icons
- `brands-icon-registry.json` - Brand icons (company logos, etc.)
- `kpis-icon-registry.json` - KPI-related icons
- `light-icon-registry.json` - Light variant icons (default)
- `solid-icon-registry.json` - Solid variant icons (on hover)

These files are located in `/public/static/` and are read-only to ensure integrity.

## Using Icons in Components

### Basic Usage

```tsx
import { Icon } from '@/components/ui/atoms/icon'

// Using a light icon (default)
<Icon iconId="faMagnifyingGlassLight" />

// Using a solid icon (typically for hover states)
<Icon iconId="faMagnifyingGlassSolid" />
```

### With Styling

```tsx
<Icon 
  iconId="faUserLight" 
  className="w-5 h-5 text-primary" 
  aria-hidden={true} 
/>
```

### Icon Button Example

```tsx
<button 
  className="p-2 rounded-full hover:bg-gray-100"
  onClick={handleClick}
>
  <Icon 
    iconId="faTrashCanLight" 
    className="w-4 h-4 text-red-500" 
    aria-hidden={true}
  />
</button>
```

## Icon Naming Convention

All icons follow a consistent naming pattern:

`fa[IconName][Variant]`

Where:
- `fa` - Prefix for all icons (FontAwesome)
- `IconName` - Descriptive name in PascalCase (e.g., `User`, `MagnifyingGlass`)
- `Variant` - Either `Light` or `Solid`

Examples:
- `faUserLight` - Light variant of user icon
- `faUserSolid` - Solid variant of user icon
- `faMagnifyingGlassLight` - Light variant of search icon
- `faChevronRightLight` - Light variant of right chevron

## Finding Available Icons

You can view all available icons in the Icon Library:
1. Navigate to `/debug-tools/ui-components/features/icon-library`
2. Use the search functionality to find icons by name

## Best Practices

1. **Use Light Variants by Default**
   - Light icons are our default style
   - Solid icons should primarily be used for hover/active states

2. **Consistent Sizing**
   - Use the following size classes consistently:
     - `w-4 h-4` - Small icons
     - `w-5 h-5` - Standard icons
     - `w-6 h-6` - Large icons

3. **Accessibility**
   - Always add `aria-hidden={true}` when the icon is decorative
   - If the icon conveys meaning, use `aria-label` to describe it

4. **Icon with Text**
   - When using icons alongside text, maintain consistent spacing:
   ```tsx
   <div className="flex items-center gap-2">
     <Icon iconId="faCalendarLight" className="w-4 h-4" aria-hidden={true} />
     <span>Upcoming Events</span>
   </div>
   ```

## Troubleshooting

If an icon doesn't appear:
1. Verify the icon ID exists in the registry
2. Check for typos in the icon name
3. Ensure the Icon component is properly imported

## Adding New Icons

Adding new icons requires updating the registry files:
1. Contact the design team for the new icon SVG
2. Use the icon registration script to add it to the appropriate registry
3. Icons will be validated and locked automatically

---

For questions or issues, please contact the UI development team. 
# Icon System Developer Guide

## Overview

Our application uses a standardized icon system with centralized registries to ensure consistency, type safety, and easy maintenance. This guide explains how to use icons in your components following the current best practices.

## Icon Naming Conventions

All icons follow a standardized naming convention:

- **Light icons**: `faIconNameLight` (e.g., `faUserLight`)
- **Solid icons**: `faIconNameSolid` (e.g., `faUserSolid`)
- **Brand icons**: `brandsIconName` (e.g., `brandsGithub`)
- **App icons**: `appIconName` (e.g., `appDashboard`)
- **KPI icons**: `kpiIconName` (e.g., `kpiConversion`)

## Using Icons in Components

### Recommended Approach

Use the `iconId` property with the modern standard naming convention:

```tsx
import { Icon } from '@/components/ui/atoms/icon/Icon';

// Light variant (default)
<Icon iconId="faUserLight" />

// Solid variant
<Icon iconId="faUserSolid" />

// Brand icon
<Icon iconId="brandsGithub" />

// App icon
<Icon iconId="appDashboard" />

// KPI icon
<Icon iconId="kpiConversion" />
```

### Size Variants

The Icon component supports different size variants:

```tsx
<Icon iconId="faUserLight" size="sm" /> // Small (16x16)
<Icon iconId="faUserLight" size="md" /> // Medium (20x20)
<Icon iconId="faUserLight" size="lg" /> // Large (24x24)
<Icon iconId="faUserLight" size="xl" /> // Extra Large (32x32)
```

### Adding Custom Classes

You can add custom classes to extend styling:

```tsx
<Icon iconId="faUserLight" className="text-blue-500 hover:text-blue-700" />
```

### Interactive Icons

For interactive icons with hover effects:

```tsx
<button className="group">
  <Icon 
    iconId="faUserLight" 
    className="group-hover:hidden" 
  />
  <Icon 
    iconId="faUserSolid" 
    className="hidden group-hover:block" 
  />
</button>
```

## Icon Registries

All available icons are defined in centralized registry files located at:

- `/public/static/app-icon-registry.json`
- `/public/static/brands-icon-registry.json`
- `/public/static/kpis-icon-registry.json`
- `/public/static/light-icon-registry.json`
- `/public/static/solid-icon-registry.json`

These files are read-only and secured to ensure consistency. To add new icons, please follow the icon contribution process.

## Icon Contribution Process

To add a new icon to the system:

1. Create an SVG file following our icon guidelines
2. Add the icon to the appropriate registry file (contact a maintainer)
3. Run the icon registration script to add the icon to the registry

## Legacy Approach (Deprecated)

The following pattern is now deprecated and should be avoided in new code:

```tsx
// ❌ DEPRECATED - Don't use this pattern
<Icon name="faUser" solid={true} />

// ✅ USE THIS INSTEAD
<Icon iconId="faUserSolid" />
```

## ESLint Rule

An ESLint rule has been added to enforce the new standard:

```typescript
// This will cause an ESLint error:
<Icon name="faUser" solid={true} />

// This will pass validation:
<Icon iconId="faUserSolid" />
```

## Utility Components

For convenience, we provide variant-specific components:

```tsx
import { SolidIcon, LightIcon } from '@/components/ui/atoms/icon/Icon';

// Renders solid variant
<SolidIcon iconId="faUser" /> // Equivalent to <Icon iconId="faUserSolid" />

// Renders light variant
<LightIcon iconId="faUser" /> // Equivalent to <Icon iconId="faUserLight" />
```

## Icon Debugging

To see all available icons, visit the debug page:

```
/debug-tools/icons
```

This page shows all available icons and allows you to search by name, category, or tags.

## Need Help?

If you need assistance with icons or have questions about the icon system, please contact the Design System team. 
# Icon System Migration Guide

## Overview

This guide explains how to migrate from the legacy icon naming approach to the new standardized icon ID system. The new system ensures better type safety, explicit variant control, and a consistent experience across the application.

## Key Changes

1. Introduction of the `iconId` property on all Icon components
2. Deprecation of the `name` property and `solid` property
3. New utility functions for working with icon variants

## Migration Guide

### Before and After Examples

```tsx
// BEFORE: Legacy approach with name and solid prop
<Icon name="faUser" solid={true} />

// AFTER: New approach with explicit variant in iconId
<Icon iconId="faUserSolid" />
```

### Recommended Changes

1. Replace `name` with `iconId` and integrate the variant directly:

```tsx
// Legacy
<Icon name="faUser" solid={false} />
<Icon name="faUser" solid={true} />

// Modern
<Icon iconId="faUserLight" />
<Icon iconId="faUserSolid" />
```

2. Use utility functions for dynamic variant handling:

```tsx
import { getLightVariant, getSolidVariant } from '@/components/ui/atoms/icon/IconUtils';

// Legacy
<Icon name={iconName} solid={isActive} />

// Modern
<Icon iconId={isActive ? getSolidVariant(iconName) : getLightVariant(iconName)} />
```

3. For components that create icons, use the new factory function:

```tsx
import { createIconWithId } from '@/components/ui/atoms/icon/IconUtils';

// Legacy
const UserIcon = createIcon('faUser');

// Modern
const UserLightIcon = createIconWithId('faUserLight');
const UserSolidIcon = createIconWithId('faUserSolid');
```

## Benefits of the New Approach

1. **Type Safety**: The variant is explicitly part of the icon ID, reducing runtime errors
2. **Self-Documenting**: Icon names clearly indicate which variant is being used
3. **Simplified Debugging**: Easier to track icon usage and identify missing icons
4. **Consistency**: Aligns with the registry structure for better maintainability
5. **Performance**: Reduces conditionals and complexity in the Icon component

## Transition Period

During the transition period:
- Both `name` and `iconId` properties will work
- The `iconId` property takes precedence when both are provided
- The `name` property will be deprecated in a future release

## Icon Registry References

All standardized icon IDs can be found in the icon registries:

- Light icons: `/public/static/light-icon-registry.json`
- Solid icons: `/public/static/solid-icon-registry.json`
- Brand icons: `/public/static/brands-icon-registry.json`
- App icons: `/public/static/app-icon-registry.json`

## FAQs

**Q: Do I need to update all icons at once?**
A: No, you can gradually migrate as you work on different components.

**Q: Will my existing code break?**
A: No, the legacy approach is still supported for backward compatibility.

**Q: How do I handle active states with the new approach?**
A: Use a ternary expression to switch between Light and Solid variants:
```tsx
<Icon iconId={isActive ? "faHeartSolid" : "faHeartLight"} />
```

## Resources

- Icon Demo: `/debug-tools/ui-components/features/icon-demo`
- Icon Utils: `src/components/ui/atoms/icon/IconUtils.ts`
- Icon implementation: `src/components/ui/atoms/icon/Icon.tsx` 
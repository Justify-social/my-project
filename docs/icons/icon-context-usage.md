# Icon Context Usage Guide

## Overview
The `IconContextProvider` provides global default settings for icon rendering across the application. It's implemented as a React Context that allows consistent behavior for all icons without having to specify props on each individual Icon component.

## Default Configuration
The application uses the following default settings in the root layout:

```tsx
<IconContextProvider 
  defaultVariant="light" 
  defaultSize="md"
  iconBasePath="/icons"
>
  {/* Application content */}
</IconContextProvider>
```

These settings define:
- `defaultVariant="light"` - All icons default to the light variant (e.g., "faCheckLight")
- `defaultSize="md"` - Default size for all icons is medium
- `iconBasePath="/icons"` - Base path for icon assets

## Available Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `defaultVariant` | "light" \| "solid" | Default icon style variant | "light" |
| `defaultSize` | "xs" \| "sm" \| "md" \| "lg" \| "xl" | Default icon size | "md" |
| `iconBasePath` | string | Base path for icon assets | "/icons" |
| `forceVariant` | "light" \| "solid" \| undefined | Override all icons to use this variant | undefined |

## Custom Icon Context Usage

For specific sections of your application, you can override the global defaults:

```tsx
import { IconContextProvider } from '@/components/ui/icon/icon-context';

// Inside your component
return (
  <IconContextProvider defaultVariant="solid" defaultSize="lg">
    <YourComponent />
  </IconContextProvider>
);
```

## Accessing Context in Components

If you need to access the icon context values inside a component:

```tsx
import { useIconContext } from '@/components/ui/icon/icon-context';

const YourComponent = () => {
  const iconContext = useIconContext();
  
  console.log('Current icon default variant:', iconContext.defaultVariant);
  
  return (
    // Your component content
  );
};
```

## Hover State Handling

For icons that need to transition from light to solid variants on hover, use the `HoverIcon` component:

```tsx
import { HoverIcon } from '@/components/ui/icon/hover-icon';

const YourComponent = () => {
  return (
    <HoverIcon 
      iconId="faCheck" 
      className="text-blue-500" 
    />
  );
};
```

The `HoverIcon` component:
- Uses the `defaultVariant` from IconContext for its normal state
- Automatically switches to the solid variant on hover
- Respects the IconContext settings for size and other properties
- Handles app-specific icons correctly (no variant switching)

For custom hover behavior, you can also implement it directly:

```tsx
import { useState } from 'react';
import { Icon } from '@/components/ui/icon/icon';

const CustomHoverIcon = ({ iconId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const baseIconName = iconId.replace(/(Light|Solid)$/, '');
  const finalIconId = `${baseIconName}${isHovered ? 'Solid' : 'Light'}`;
  
  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon iconId={finalIconId} />
    </span>
  );
};
```

## Best Practices

1. **Use the Root Provider**: The main `IconContextProvider` in the root layout handles most cases. Only add additional providers when you need different defaults for a specific section.

2. **Consistent Variants**: Follow the application standard of using "light" variant for normal state and "solid" variant for hover/active states.

3. **Icon Size Consistency**: Use the default sizes when possible to maintain visual consistency:
   - `xs`: 12px (0.75rem)
   - `sm`: 16px (1rem)
   - `md`: 20px (1.25rem) - Default
   - `lg`: 24px (1.5rem)
   - `xl`: 32px (2rem)

4. **Testing Context Changes**: When implementing new context settings, test both the default icons and app-specific icons to ensure both render correctly.

## Related Files

- `src/app/layout.tsx` - Root implementation of IconContextProvider
- `src/components/ui/icon/icon-context.tsx` - Context definition
- `src/components/ui/icon/icon.tsx` - The Icon component that consumes the context
- `src/components/ui/icon/hover-icon.tsx` - Component for hover state transitions 
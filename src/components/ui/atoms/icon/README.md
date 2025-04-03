# Icon Component

A universal icon component that follows Single Source of Truth (SSOT) principles, using a consolidated registry loader that combines all category-specific icon registry files.

## Features

- **Single Source of Truth**: Uses category-specific registry files in `/public/static/` consolidated at build time
- **FontAwesome Pro Conventions**: Default is `fa-light`, hover state is `fa-solid`
- **Universal API**: One component to handle all types of icons
- **Error Handling**: Graceful fallbacks when icons are not found
- **Accessibility**: Properly configured for screen readers with appropriate ARIA attributes
- **Type Safety**: Comprehensive TypeScript typings for better development experience

## Getting Started

```tsx
import { Icon } from '@/components/ui/atoms/icon';

// Basic usage
<Icon name="user" />

// Different sizes
<Icon name="home" size="sm" />
<Icon name="settings" size="lg" />

// Different variants
<Icon name="notification" variant="solid" />
<Icon name="notification" variant="light" />

// Active state (automatically uses solid variant)
<Icon name="star" active />

// Custom styling
<Icon name="check" className="text-success" />

// With click handler
<Icon name="close" onClick={handleClose} />
```

## Icon Registry

All icons are defined in category-specific registry files, which serve as the Single Source of Truth (SSOT) for the entire application:

- `app-icon-registry.json` - App-specific navigation and feature icons
- `brands-icon-registry.json` - Social media and brand icons
- `kpis-icon-registry.json` - Key Performance Indicator icons
- `light-icon-registry.json` - Light variant FontAwesome icons
- `solid-icon-registry.json` - Solid variant FontAwesome icons
- `new-light-icon-registry.json` - New light icons being added
- `new-solid-icon-registry.json` - New solid icons being added

These registry files are consolidated at build time using our registry-loader, providing:

1. Consistent icon usage across components
2. Centralized management of icon assets
3. Easy upgrades and maintenance
4. Accurate analytics for icon usage

## Icon Types

The component accepts the following name patterns:

1. **Semantic names**: Easy-to-remember action names like `add`, `delete`, `edit`
2. **FontAwesome names**: Standard FontAwesome nomenclature like `faUser`, `faHome`
3. **Platform names**: Social platform shortcuts like `facebook`, `instagram`
4. **App-specific icons**: Custom app icons like `appHome`, `appSettings`

## Icon Context

For application-wide icon settings, use the `IconProvider`:

```tsx
import { IconProvider } from '@/components/ui/atoms/icon';

function App() {
  return (
    <IconProvider 
      defaultSize="md"
      defaultVariant="light"
      enableHoverByDefault={true}
    >
      <YourApp />
    </IconProvider>
  )
}
```

## Available Sizes

| Size | CSS Classes | Usage |
|------|------------|-------|
| `xs` | w-3 h-3 | Tiny icons in tight spaces |
| `sm` | w-4 h-4 | Small icons (buttons, inline text) |
| `md` | w-5 h-5 | Default size for most contexts |
| `lg` | w-6 h-6 | Slightly larger icons |
| `xl` | w-8 h-8 | Large icons for emphasis |
| `2xl` | w-10 h-10 | Extra large icons |
| `3xl` | w-12 h-12 | Very large icons |
| `4xl` | w-16 h-16 | Huge icons |

## Implementation Files

The icon component implementation consists of:

- **Icon.tsx**: The main icon component
- **registry-loader.ts**: Consolidates category-specific registry files
- **types.ts**: Type definitions aligned with registry structure
- **icons.ts**: Utilities for working with the consolidated registry
- **IconContext.tsx**: Context for app-wide icon settings
- **index.ts**: Consolidated exports

## Maintaining the SSOT

When updating icons:

1. Update the appropriate category-specific registry file
2. Use the Debug Tools at `/debug-tools/ui-components/features/icon-library` to preview changes
3. Keep the registry structure stable (don't remove required fields)

## Troubleshooting

If an icon isn't showing correctly:

1. Check that the icon exists in the appropriate registry file
2. Verify the icon name is being normalized correctly
3. Look for console warnings that might indicate path issues
4. Check that the SVG file exists at the specified path

## Contributing

When adding new icons:

1. Add the SVG file to the appropriate folder in `/public/static/icons/`
2. Update the appropriate registry file with the new icon metadata
3. Verify the icon renders correctly in the Icon Library debug tool
4. Add any semantic mappings if needed in `icons.ts` 
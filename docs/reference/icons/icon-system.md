# Icon System Documentation

## Overview

Our icon system uses the unified `Icon` component as the Single Source of Truth (SSOT) for all icons in the application. This architecture provides several key benefits:

- **Reliability**: No dependency on external services
- **Performance**: Faster loading times with optimized SVG files
- **Consistent API**: Simple, standardized interface for all icon types
- **Maintainability**: Centralized management of icons
- **Accessibility**: Built-in support for accessibility standards

## Architecture

### Core Components

- **`Icon` Component**: The primary and recommended component for rendering icons
  - Location: `src/components/ui/atoms/icon/Icon.tsx`
  - Supports various sizes, variants, and states
  - Handles error recovery and accessibility
  - Provides a consistent interface for all icon types

- **Icon Registry System**:
  - Location: `/public/static/icon-registry.json` (CANONICAL SOURCE OF TRUTH)
  - Contains metadata about all available icons
  - Maps icon names to their file paths
  - Generated and maintained by automated scripts

- **Icon SVG Files**:
  - Location: `/public/icons/{style}/{name}.svg`
  - Organized by style (light, solid, brands, app)
  - Optimized for web use

### Canonical File Locations

| File | Path | Purpose |
|------|------|---------|
| Icon Registry | `/public/static/icon-registry.json` | Master registry of all icons |
| Icon URL Map | `/public/static/icon-url-map.json` | Maps icon names to URLs |
| Icon SVGs | `/public/icons/{style}/{name}.svg` | SVG files for each icon |

## Usage Guidelines

### Basic Usage

```tsx
// Import the Icon component
import { Icon } from '@/components/ui/atoms/icon';

// Basic usage
<Icon name="faUser" />

// With size variant
<Icon name="faCheck" size="lg" />

// With color action
<Icon name="faTrash" action="danger" />

// Solid variant
<Icon name="faInfo" variant="solid" />
```

### Icon Variants

The system supports multiple icon variants:

- `light` (default): Lighter weight icons
- `solid`: Bold/filled version of icons
- `brands`: Brand/social media icons
- `app`: Application-specific custom icons

```tsx
<Icon name="faCheck" variant="light" /> // Default
<Icon name="faCheck" variant="solid" /> // Bold version
<Icon name="faGithub" variant="brands" /> // Brand icon
<Icon name="appLogo" variant="app" /> // App-specific icon
```

### Icon Sizes

```tsx
<Icon name="faCheck" size="xs" /> // 12px
<Icon name="faCheck" size="sm" /> // 16px
<Icon name="faCheck" size="md" /> // 20px (default)
<Icon name="faCheck" size="lg" /> // 24px
<Icon name="faCheck" size="xl" /> // 32px
<Icon name="faCheck" size="xxl" /> // 48px
```

### Action Colors

Icons can have different hover colors based on action type:

| Action | Color | Usage |
|--------|-------|-------|
| `primary` | Blue | Standard interactive icons |
| `danger` | Red | Delete or dangerous actions |
| `warning` | Yellow | Warning or caution |
| `success` | Green | Success or confirmation |

```tsx
<Icon name="faEdit" action="primary" /> // Blue on hover
<Icon name="faTrash" action="danger" /> // Red on hover
<Icon name="faWarning" action="warning" /> // Yellow on hover
<Icon name="faCheck" action="success" /> // Green on hover
```

### Specialized Components

For common patterns, use these pre-configured components:

```tsx
import { 
  StaticIcon, 
  ButtonIcon, 
  DeleteIcon, 
  WarningIcon, 
  SuccessIcon 
} from '@/components/ui/atoms/icon';

// Decorative icon (no hover effects)
<StaticIcon name="faUser" />

// Interactive button icon
<ButtonIcon name="faEdit" />

// Delete icon (red on hover)
<DeleteIcon name="faTrash" />

// Warning icon (yellow on hover)
<WarningIcon name="faWarning" />

// Success icon (green on hover)
<SuccessIcon name="faCheck" />
```

### Full Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Icon name (with "fa" prefix) |
| `variant` | `'light'｜'solid'｜'brands'｜'app'` | Icon style variant (default: 'light') |
| `size` | `'xs'｜'sm'｜'md'｜'lg'｜'xl'｜'xxl'` | Icon size (default: 'md') |
| `action` | `'primary'｜'success'｜'warning'｜'danger'` | Action color (default: 'primary') |
| `className` | `string` | Additional CSS classes |
| `interactive` | `boolean` | Whether icon responds to hover (default: true) |
| `label` | `string` | Accessibility label |
| `testId` | `string` | Test ID for testing |

## Accessibility

For interactive icons, always provide an accessible label:

```tsx
<button aria-label="Delete item">
  <Icon name="faTrash" />
</button>

// Or for standalone interactive icons:
<Icon 
  name="faTrash" 
  label="Delete item" 
  onClick={handleDelete} 
  tabIndex={0}
  role="button"
/>
```

## Migration from FontAwesomeIcon

Our codebase previously used the `FontAwesomeIcon` component which is now deprecated in favor of the unified `Icon` component.

### Automated Migration

A conversion script is available to automatically migrate deprecated `FontAwesomeIcon` usage:

```bash
# Run with dry run to see what would change
node scripts/icons/convert-fontawesome.mjs --dry-run

# Apply the changes
node scripts/icons/convert-fontawesome.mjs

# For verbose output
node scripts/icons/convert-fontawesome.mjs --verbose

# Process a specific file or directory
node scripts/icons/convert-fontawesome.mjs --file=src/components/ui/molecules
```

### Manual Migration Guidelines

When migrating manually:

1. Replace import statements:
   ```tsx
   // Before
   import { FontAwesomeIcon } from '@/components/ui/utils/font-awesome-adapter';
   
   // After
   import { Icon } from '@/components/ui/atoms/icon';
   ```

2. Replace component usage:
   ```tsx
   // Before
   <FontAwesomeIcon name="faCheck" size="md" />
   
   // After
   <Icon name="faCheck" size="md" variant="light" />
   ```

## Adding New Icons

To add a new icon to the project:

1. Use the icon in your component via the `Icon` component
2. Run the icon download script to fetch and process the icon:
   ```bash
   node scripts/icons/download-icons.mjs --icons=name-of-icon
   
   # Or via the master toolkit
   node scripts/master/master-toolkit.mjs icons download --icons=name-of-icon
   ```
3. The script will:
   - Download the SVG from FontAwesome (if available)
   - Optimize the SVG file
   - Place it in the correct directory
   - Update the icon registry

## Icon System Management

### Audit Script

The audit script analyzes icon usage and health across the project:

```bash
# Run an icon audit
node scripts/icons/audit-icons.mjs

# Run with verbose output
node scripts/icons/audit-icons.mjs --verbose
```

### Download Script

The download script manages icon files and registry:

```bash
# Download specific icons
node scripts/icons/download-icons.mjs --icons=user,bell,info

# Force re-download existing icons
node scripts/icons/download-icons.mjs --force

# Clean up incorrectly named icons
node scripts/icons/download-icons.mjs --cleanup
```

## Troubleshooting

### Icon Not Found

If an icon isn't rendering properly:

1. Check that the icon name is correct (e.g., "faCheck" not "fa-check")
2. Verify the icon exists in the registry:
   ```bash
   node scripts/icons/audit-icons.mjs --verify
   ```
3. Confirm the correct variant is specified

### Missing Icons in Development

If icons aren't appearing in development:

1. Run the download script:
   ```bash
   node scripts/icons/download-icons.mjs
   ```
2. Verify icon files exist in `/public/icons/{style}/`
3. Restart the development server
4. Clear browser cache

### Performance Optimization

To keep the icon system performant:

1. Only download icons you actually use
2. Use the `--cleanup` flag periodically to remove unused icons
3. Consider using the StaticIcon component for non-interactive icons
4. Ensure the correct icon size is used to avoid unnecessary scaling

## Best Practices

1. **Always use the Icon component** - Never import directly from FontAwesome
2. **Be consistent with icon styles** - Use light for most cases, solid for emphasis
3. **Use semantic actions** - Choose appropriate action colors to convey meaning
4. **Make icons accessible** - Always provide labels for interactive icons
5. **Use specialized components** when appropriate (ButtonIcon, DeleteIcon, etc.)
6. **Keep icon names consistent** - Use the established naming pattern
7. **Maintain the single source of truth** - Only update icons via the scripts 
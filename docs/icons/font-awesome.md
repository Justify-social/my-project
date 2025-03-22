# Font Awesome Icons: Complete Guide

## Overview

This document provides a comprehensive guide to using icons in the project. Our implementation now uses local SVG files stored in the codebase instead of loading them dynamically from Font Awesome. This provides several benefits:

1. **Reliability**: No dependency on external CDNs or network requests
2. **Performance**: Faster loading times since icons are bundled with the application
3. **Reduced bundle size**: Only includes the icons actually used in your project
4. **Consistency**: Icons look the same every time regardless of network conditions

## System Architecture

Our icon system is built with a simple, maintainable architecture:

1. **Core Component**: `SvgIcon.tsx` - The main component that renders SVG icons
2. **Icon Variants**: `IconVariants.tsx` - Specialized components like ButtonIcon, DeleteIcon, etc.
3. **Configuration**: `IconConfig.ts` - Settings for icon styles, sizes, and hover effects
4. **Data Storage**: `icon-data.ts` - Generated file with embedded SVG data
5. **Public API**: `index.ts` - The main export file that provides a clean, consistent API

## IMPORTANT: Icons Must Be Downloaded Before Use

⚠️ **All icons MUST be downloaded and stored in the codebase before use!** ⚠️

DO NOT use FontAwesome icons directly in the code without first downloading them using the provided scripts. This ensures:

1. Icons are always available and load immediately (no network dependency)
2. Icons are properly tracked and managed
3. Icons are consistently styled and sized

## Icon Directory Structure

The SVG icons are organized in the following directories based on their style:

- `/public/ui-icons/solid` - For solid Font Awesome icons (prefix: `fas`)
- `/public/ui-icons/light` - For light/outline Font Awesome icons (prefix: `fal`)
- `/public/ui-icons/brands` - For brand Font Awesome icons (prefix: `fab`)
- `/public/ui-icons/regular` - For regular Font Awesome icons (prefix: `far`)

## Icon Workflow - Adding New Icons

Follow these steps whenever you need to add new icons to the project:

### Step 1: Add the icons to your code

Import the icon in your source code as you normally would:

```tsx
// In your component file
import { faNewIcon } from '@fortawesome/pro-solid-svg-icons';
```

### Step 2: Download the icons

Run the icon update script:

```bash
npm run update-icons
```

This script will:
- Scan the codebase for all Font Awesome icons
- Download them as SVG files to the appropriate directories
- Create a registry of all icons
- Generate embedded icon data for maximum performance

### Step 3: Use the icons in your components

Now use the local icon component:

```tsx
import { Icon } from '@/components/ui/icons';

function MyComponent() {
  return <Icon name="faNewIcon" />;
}
```

## Icon Styles and Naming Conventions

The system automatically creates both solid and light variants of all icons. To use the light (outlined) version of an icon, append "Light" to the icon name:

```tsx
// Solid version (default)
<Icon name="faUser" />

// Light/outlined version
<Icon name="faUserLight" />
```

The script automatically creates light versions of all solid icons, so you can use any icon in either style without having to add it explicitly.

## Icon Types and Behaviors

Our system distinguishes between two types of icons:

### Button Icons (`iconType="button"`)

Button icons are interactive elements that provide visual feedback when users interact with them:

- **Default Style**: LIGHT variant
- **Hover Behavior**: Changes to SOLID variant
- **Hover Color**: Changes based on the `action` prop
- **Usage**: For clickable elements, buttons, links, interactive UI elements

```tsx
// Default button icon (blue on hover)
<Icon name="edit" />

// Delete button icon (red on hover)
<Icon name="delete" action="delete" />

// Warning button icon (yellow on hover)
<Icon name="warning" action="warning" />

// Success button icon (green on hover)
<Icon name="check" action="success" />
```

### Static Icons (`iconType="static"`)

Static icons are non-interactive, decorative elements that don't change appearance:

- **Default Style**: LIGHT or SOLID (based on the `solid` prop)
- **Hover Behavior**: No change on hover
- **Usage**: For decorative, informational, or non-interactive UI elements

```tsx
// Static light icon (doesn't change on hover)
<Icon name="info" iconType="static" />

// Static solid icon
<Icon name="info" iconType="static" solid />
```

## Action Colors

Icons can have different hover colors based on their action type:

| Action | Color | Usage |
|--------|-------|-------|
| `default` | Light Blue (#00BFFF) | Standard interactive icons |
| `delete` | Red (#FF3B30) | Delete, remove, or dangerous actions |
| `warning` | Yellow (#FFCC00) | Warning or caution actions |
| `success` | Green (#34C759) | Success or confirmation actions |

## Available Icon Components

The icon system provides two main components for rendering icons:

### SvgIcon (Recommended)

The `SvgIcon` component uses embedded SVG data when available, and falls back to loading from files if needed.

```tsx
import { Icon } from '@/components/ui/icons';

function MyComponent() {
  return (
    <div>
      <Icon name="faUser" />
      <Icon name="faStar" size="lg" className="text-yellow-500" />
      <Icon name="faSpinner" spin />
      {/* Explicitly specify style */}
      <Icon name="faUser" style="light" />
    </div>
  );
}
```

### LocalIcon (Fallback Option)

The `LocalIcon` component is a simpler implementation that always loads SVG files from the public directory. It's provided as a fallback option for cases where the main SvgIcon component might not work as expected:

```tsx
import { LocalIcon } from '@/components/ui/icons';

function MyComponent() {
  return (
    <div>
      <LocalIcon name="faUser" />
      <LocalIcon name="faUser" style="light" />
    </div>
  );
}
```

The main SvgIcon component should be preferred in most cases as it offers better performance through embedded data, but LocalIcon is available when needed as a reliable fallback.

### Icon Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | UI icon name from our icon map |
| `kpiName` | `string` | KPI-specific icon (SVG-based) |
| `appName` | `string` | App navigation icon (SVG-based) |
| `platformName` | `string` | Social platform icon with brand colors |
| `solid` | `boolean` | Whether to use solid style (only for `name` prop) |
| `size` | `'xs'｜'sm'｜'md'｜'lg'｜'xl'` | Icon size preset (default: 'md') |
| `color` | `string` | Icon color (default: 'currentColor') |
| `active` | `boolean` | Whether icon is in active state |
| `iconType` | `'button'｜'static'` | Determines hover behavior (default: 'button') |
| `action` | `'default'｜'delete'｜'warning'｜'success'` | Determines hover color (default: 'default') |
| `className` | `string` | Additional CSS classes |
| `style` | `'solid'｜'light'｜'brands'｜'regular'` | Explicitly set icon style |

## Icon Wrapper Components

For even simpler usage, we provide specialized wrapper components to ensure icons follow the global configuration:

```tsx
import { 
  StaticIcon, 
  ButtonIcon, 
  DeleteIcon, 
  WarningIcon, 
  SuccessIcon 
} from '@/components/ui/icons';

// Decorative static icon (no hover effects)
<StaticIcon name="faUser" />

// Interactive button icon (light to solid hover effect)
<ButtonIcon name="faEdit" />

// Delete icon (red on hover)
<DeleteIcon name="faTrash" />

// Warning icon (yellow on hover)
<WarningIcon name="faWarning" />

// Success icon (green on hover)
<SuccessIcon name="faCheck" />
```

## Hover Effect

For the light-to-solid hover effect to work properly with button icons, include your icon in a parent with the `group` class:

```tsx
<button className="group flex items-center">
  <Icon name="faEdit" />
  <span className="ml-2">Edit</span>
</button>
```

## Icon Types

Our implementation supports several icon types:

### UI Icons

Standard interface icons with support for both solid and light styles.

```tsx
<Icon name="faUser" />
<Icon name="faBell" solid />
```

### Platform Icons

Social media and platform-specific icons with brand colors.

```tsx
<Icon platformName="instagram" />
<Icon platformName="x" /> // Formerly "twitter"
```

## Troubleshooting

If icons are not displaying correctly:

1. Check that you've run the download script after adding new icons
2. Verify the icon name is correct (it should match the FontAwesome import name, e.g., "faUser")
3. For style-specific icons, make sure you're specifying the correct style prop
4. Run the scripts with the `--verbose` flag for more detailed output:
   ```bash
   npm run update-icons -- --verbose
   ```
5. For parent container class issues: ensure the parent has `group` class for hover effects
6. Check that your import is correct: use `import { Icon } from '@/components/ui/icons'`

## CI/CD Integration

It's recommended to run the icon download script as part of your build process to ensure all icons are properly downloaded and available:

```yaml
# In your CI/CD config
build:
  steps:
    - checkout
    - npm install
    - npm run update-icons # Download and generate icon data
    - npm run build # Build your app
```

## NPM Package Management

For Font Awesome packages:

1. Font Awesome packages are kept as devDependencies ONLY
2. The main application NEVER imports directly from Font Awesome packages
3. The script system is the only part of the codebase that should use Font Awesome packages

```json
"devDependencies": {
  "@fortawesome/fontawesome-svg-core": "^x.x.x",
  "@fortawesome/pro-solid-svg-icons": "^x.x.x",
  "@fortawesome/pro-light-svg-icons": "^x.x.x",
  "@fortawesome/free-brands-svg-icons": "^x.x.x",
  "@babel/parser": "^x.x.x",
  "@babel/traverse": "^x.x.x",
  "glob": "^x.x.x"
}
```

## Legacy: Font Awesome Direct Usage (Deprecated)

> **DEPRECATED**: Direct Font Awesome usage is no longer recommended. Use the local SVG icon system instead.

For legacy reference, the old approach used Font Awesome components directly:

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { faHeart as falHeart } from '@fortawesome/pro-light-svg-icons';

// Method 1: Direct import (not recommended)
<FontAwesomeIcon icon={faUser} className="w-6 h-6 text-blue-600" />
<FontAwesomeIcon icon={falHeart} className="w-6 h-6 text-red-500" />

// Method 2: Array syntax (requires library registration)
<FontAwesomeIcon icon={['fas', 'gear']} className="w-6 h-6" />
<FontAwesomeIcon icon={['fab', 'x-twitter']} className="w-6 h-6" />
```

### Old Architecture (Reference Only)

The legacy FontAwesome implementation consisted of:

1. **Core Registration**: Icons registered in `src/lib/icon-registry.tsx`
2. **Component Abstraction**: Custom `<Icon>` component in `src/components/ui/icon.tsx`
3. **Icon Mappings**: Centralized mappings in `src/lib/icon-mappings.ts`
4. **Central Configuration**: Icon settings in `src/config/icon-config.ts`

### Legacy Icon Mappings

For historical reference, these aliases were used to map font-awesome icon names to semantic names:

| Semantic Alias | Font Awesome Icon |
|----------------|-------------------|
| `faClose` | `faXmark` |
| `faMail` | `faEnvelope` |
| `faWarning` | `faTriangleExclamation` |
| `faInfo` | `faCircleInfo` |
| `faView` | `faEye` |
| `faEdit` | `faPenToSquare` |
| `faDocument` | `faFile` |
| `faDocumentText` | `faFileLines` |
| `faChatBubble` | `faCommentDots` |
| `faDelete` | `faTrashCan` |
| `faMagnifyingGlass` | `faSearch` |
| `faSettings` | `faGear` | 
# Icon System

## Overview

Our icon system provides a consistent, high-performance way to display icons throughout the application. It uses local SVG files instead of external libraries, offering significant performance benefits.

## Quick Start

```tsx
// Import the base Icon component
import { Icon } from '@/components/ui/icons';

// For specialized components (recommended)
import { 
  StaticIcon,
  ButtonIcon, 
  DeleteIcon, 
  WarningIcon, 
  SuccessIcon 
} from '@/components/ui/icons';

// UI icon with hover effects
<ButtonIcon name="faEdit" />

// UI icon without hover (static)
<StaticIcon name="faUser" />
```

## Finding Specific Icons

Need a specific icon? Here are the quickest ways to find it:

1. **In-App Icon Browser**: Navigate to `/debug-tools/ui-components/icons` in the app
   - This shows all available icons categorized and searchable

2. **Command-Line Search**: Find icons matching keywords:
   ```bash
   npx tsx scripts/icon-management/list-icons.js --search="keyword"
   ```

3. **Interactive Icon Grid**: Use the `<IconGrid />` component during development:
   ```tsx
   import { IconGrid } from '@/components/ui/icons/test/IconGrid';
   
   function MyComponent() {
     return <IconGrid />;
   }
   ```

4. **Documentation Reference**: For common icons, check our comprehensive documentation at:
   `/docs/icons/font-awesome.md`

5. **Critical Icons**: For must-have UI elements, use our SafeIcon component:
   ```tsx
   import { SafeIcon } from '@/components/ui/icons/safe-icon';
   
   // Always-available critical icons with fallbacks
   <SafeIcon icon="faEdit" iconType="button" />
   ```

## Icon Types

Our system supports multiple icon types:

### 1. UI Icons (FontAwesome-based)

```tsx
import { Icon } from '@/components/ui/icons';

// Default style is "light"
<Icon name="faUser" />

// Solid style
<Icon name="faUser" solid />

// With custom size (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
<Icon name="faCalendar" size="lg" />

// With custom color
<Icon name="faBell" className="text-[var(--accent-color)]" />
```

### 2. Platform Icons (Social Media)

```tsx
import { PlatformIcon } from '@/components/ui/icons';

// Using platform names directly
<PlatformIcon platformName="instagram" />
<PlatformIcon platformName="linkedin" size="lg" />
<PlatformIcon platformName="facebook" className="text-blue-600" />

// Available platforms: 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'x'
```

### 3. KPI Icons

```tsx
import { Icon } from '@/components/ui/icons';

// Using KPI icon names
<Icon kpiName="brandAwareness" />
<Icon kpiName="engagement" size="xl" />

// All KPI icons: 'brandAwareness', 'consideration', 'conversion', 'engagement', 'preference', 'reach', 'retention', 'roi', 'satisfaction', 'sentiment'
```

### 4. App Icons

```tsx
import { Icon } from '@/components/ui/icons';

// Using app icon names
<Icon appName="campaigns" />
<Icon appName="dashboard" size="xl" />

// All app icons: 'campaigns', 'calendar', 'analytics', 'audience', 'content', 'dashboard', 'insights', 'settings'
```

## Specialized Components

For better code readability and consistent styling, use these specialized components:

```tsx
import { 
  StaticIcon,  // No hover effects (decorative)
  ButtonIcon,  // Default hover behavior (light → solid)
  DeleteIcon,  // Red hover color
  WarningIcon, // Yellow hover color
  SuccessIcon  // Green hover color
} from '@/components/ui/icons';

// Examples
<StaticIcon name="faUser" />
<ButtonIcon name="faEdit" />
<DeleteIcon name="faTrashCan" />
<WarningIcon name="faTriangleExclamation" />
<SuccessIcon name="faCircleCheck" />
```

## Hover Effects

For hover effects to work correctly, add the `group` class to the parent element:

```tsx
<button className="group flex items-center gap-2">
  <ButtonIcon name="faEdit" />
  <span>Edit</span>
</button>
```

Button icons automatically:
1. Change from light to solid style on hover
2. Change color based on their action type
3. Handle focus and active states for accessibility

## Common Icon Patterns

### Navigation Icons

```tsx
<li className="group">
  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100">
    <ButtonIcon name="faHouseLight" />
    <span>Dashboard</span>
  </Link>
</li>
```

### Button Icons

```tsx
<button 
  className="group flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
  onClick={handleEdit}
>
  <ButtonIcon name="faPenToSquareLight" />
  <span>Edit Campaign</span>
</button>

<button className="group p-2 rounded-full hover:bg-red-50">
  <DeleteIcon name="faTrashCanLight" size="sm" />
</button>
```

### Status/Informational Icons

```tsx
<div className="flex items-center text-yellow-600">
  <StaticIcon name="faTriangleExclamation" size="sm" className="mr-2" />
  <span>Please complete all required fields</span>
</div>
```

## Brand Colors & Icon Actions

We use consistent colors for icons based on their actions:

```tsx
// Regular icons (Jet → Deep Sky Blue on hover)
<ButtonIcon name="faUser" />

// Delete action (Red hover)
<DeleteIcon name="faTrashCan" />

// Warning action (Yellow hover) 
<WarningIcon name="faTriangleExclamation" />

// Success action (Green hover)
<SuccessIcon name="faCircleCheck" />
```

## Complete Icon Reference

We maintain a complete reference of all available icons in the system:

### In-App Icon Explorer

The most up-to-date and comprehensive way to browse all icons is through our in-app icon explorer:

1. Navigate to `/debug-tools/ui-components/icons` in the app
2. Use the search function to find icons by name
3. View icons by category (UI, Platform, KPI, App)
4. See examples of hover states and action colors

### Icon Type Reference

For quick lookups during development, here's a summary of our icon types:

#### Core UI Icons (Most Common)

These are the most frequently used UI icons in the application:

```
faUser, faEdit, faTrashCan, faPlus, faMinus, faCheck, faXmark, faCircleCheck, 
faCircleXmark, faChevronDown, faChevronUp, faChevronLeft, faChevronRight, 
faCalendar, faSearch, faBell, faGear, faHome, faEnvelope, faLock, faEye, 
faEyeSlash, faShield, faInfo, faWarning, faTriangleExclamation, faPenToSquare, 
faArrowLeft, faArrowRight, faArrowUp, faArrowDown, faDownload, faUpload, 
faFilter, faCopy, faPlayCircle, faPauseCircle, faBuilding, faUserGroup
```

For all icons, add "Light" suffix for the light variant (e.g., `faUserGroupLight`).

## Maintaining and Extending the Icon Library

Our icon system is designed for scalability as the application grows. Follow these guidelines to maintain consistency.

### Adding New Icons

When adding new icons to the system:

1. First, check if the icon already exists in our library:
   ```
   npx tsx scripts/icon-management/list-icons.js --search="keyword"
   ```

2. If not, add the icon usage in your component:
   ```tsx
   <Icon name="faNewIconName" />
   ```

3. Run the download script to fetch the SVG files:
   ```
   node scripts/icon-management/download-icons.js --verbose
   ```

4. Update the type definitions if needed (automatic for most cases):
   - The script will automatically update `src/components/ui/icons/icon-data.ts`
   - Review changes to ensure accuracy

5. Document the new icon in the appropriate team documentation:
   - For core UI/UX icons, update the design system documentation
   - For feature-specific icons, note in feature documentation

### Icon Naming Conventions

For consistent naming, follow these conventions:

1. **UI Icons (FontAwesome)**:
   - Start with `fa` prefix
   - Use CamelCase (e.g., `faUserGroup`)
   - Add `Light` suffix for light variants (e.g., `faUserGroupLight`)

2. **KPI Icons**:
   - Use camelCase (e.g., `brandAwareness`)
   - No prefix or suffix needed

3. **App Icons**:
   - Use camelCase (e.g., `campaigns`)
   - No prefix or suffix needed

4. **Platform Icons**:
   - Use the official platform name in lowercase (e.g., `instagram`)

### Automated Icon Auditing

We maintain icon consistency through automated auditing:

1. Run the audit script to check icon usage:
   ```
   node scripts/icon-management/audit-icons.js
   ```

2. Fix common issues automatically:
   ```
   node scripts/icon-management/audit-icons.js --fix
   ```

3. Generate a detailed HTML report:
   ```
   node scripts/icon-management/audit-icons.js --html
   ```

4. Fix duplicate icon definitions:
   ```
   node scripts/icon-management/audit-icons.js --fix-duplicates
   ```

The audit checks for:
- Missing light/solid variants
- Inconsistent naming
- Unused icons
- Missing SVG files
- Accessibility issues

### Continuous Integration

Our CI pipeline automatically runs the icon audit on each PR, ensuring:
1. No broken icon references
2. All needed SVG files are included
3. Naming conventions are followed
4. Icon types are properly defined

### Icon Library Updates

When FontAwesome releases updates:

1. Check for updates to icon names or paths:
   ```
   node scripts/icon-management/check-updates.js
   ```

2. Update our local SVG files if needed:
   ```
   node scripts/icon-management/update-icons.js
   ```

## Architecture

The icon system follows this architecture:

1. **SVG Files**: Original SVG files in `public/ui-icons/{light|solid|brands|regular}/`
2. **TypeScript Data**: Generated data in `src/components/ui/icons/icon-data.ts`
3. **React Components**: Icon components that reference this data

Benefits:
- Zero network requests - no FontAwesome library needed
- Faster rendering and better tree-shaking
- Consistent styling across the application

## Troubleshooting

### Missing Icon or Icon Not Appearing

If an icon isn't appearing, check:

1. The icon name spelling (e.g., `faUser` not `fauser`)
2. For light icons, ensure you're using `faUserLight` syntax
3. Check the browser console for any errors
4. If the icon is new, run `node scripts/icon-management/download-icons.js --verbose` to add it

### Hover Effects Not Working

If hover effects aren't working:
1. Ensure you've added the `group` class to the parent element
2. Check you're using `ButtonIcon` (or `iconType="button"`) not `StaticIcon`
3. Verify your Tailwind configuration includes group-hover variants

### Adding New Icons

To add new icons to the system:

1. Add the icon usage in your component (e.g., `<Icon name="faNewIcon" />`)
2. Run `node scripts/icon-management/download-icons.js --verbose`
3. Verify the icon appears in `public/ui-icons/`

## Testing Icons

You can preview all available icons in our system:

1. Navigate to `/debug-tools/ui-components/icons` in the app
2. Use the `<IconTester />` component in your development environment

## Important: No FontAwesome Dependencies

The icon system uses direct SVG files instead of FontAwesome libraries. We've removed all FontAwesome package dependencies. If you need new icons, run the download script mentioned above. 
# Icon System

## Current Architecture

The icon system is now fully based on SVG files stored in the codebase:

1. **SVG Files**: Original SVG files in `public/ui-icons/{light|solid|brands|regular}/`
2. **TypeScript Data**: Generated TypeScript data in `src/components/ui/icons/icon-data.ts`
3. **React Components**: Icon components reference this data for rendering

This architecture provides:
- Elimination of network requests - no FontAwesome library needed
- Faster rendering
- Better tree-shaking
- Consistent styling across the application

## Usage

```tsx
import { Icon } from '@/components/ui/icons';

// Basic usage
<Icon name="faUser" />

// With solid style
<Icon name="faUser" solid />

// With size
<Icon name="faUser" size="lg" />

// With custom color
<Icon name="faUser" className="text-blue-500" />

// Button icon (has hover effect)
<Icon name="faEdit" iconType="button" />

// Static icon (no hover effect)
<Icon name="faInfo" iconType="static" solid />

// Platform icons
<Icon platformName="instagram" />

// KPI icons
<Icon kpiName="brandAwareness" />

// App icons
<Icon appName="campaigns" />
```

## Specialized Icon Components

For common use cases, we provide specialized components:

```tsx
import { 
  StaticIcon, 
  ButtonIcon, 
  DeleteIcon, 
  WarningIcon, 
  SuccessIcon 
} from '@/components/ui/icons';

// Static icon (decorative, non-interactive)
<StaticIcon name="faUser" />

// Button icon (interactive, hover effect)
<ButtonIcon name="faEdit" />

// Delete icon (red hover)
<DeleteIcon name="faTrash" />

// Warning icon (yellow hover)
<WarningIcon name="faTriangleExclamation" />

// Success icon (green hover)
<SuccessIcon name="faCheck" />
```

## Light/Solid Differentiation

For hover effects to work correctly, add a parent element with the `group` class:

```tsx
<button className="group flex items-center">
  <ButtonIcon name="faEdit" />
  <span>Edit</span>
</button>
```

## Icon Scripts

The icon system uses two main scripts:

1. **Download Icons**: `node scripts/download-icons.js --verbose`
   - Scans the codebase for icon usage
   - Downloads SVG files for all used icons
   - Creates light variants of solid icons

2. **Audit Icons**: `node scripts/audit-icons.js [--fix] [--html] [--fix-duplicates]` 
   - Validates icon usage
   - Ensures light/solid differentiation
   - Generates detailed HTML report
   - Can automatically fix common issues

## Important: No FontAwesome Dependencies

The icon system now uses direct SVG files instead of FontAwesome libraries. We've removed:
- `@fortawesome/fontawesome-svg-core`
- `@fortawesome/free-brands-svg-icons`
- `@fortawesome/pro-light-svg-icons`
- `@fortawesome/pro-regular-svg-icons`
- `@fortawesome/pro-solid-svg-icons`
- `@fortawesome/react-fontawesome`

If you need new icons, run `node scripts/download-icons.js --verbose` to download them as SVG files. 
# Unified Icon System

This directory contains the unified icon system for the application. It uses SVG icons from Font Awesome Pro, with a focus on light variants by default and solid variants on hover.

## Directory Structure

```
src/components/ui/icons/
├── components/         # Core icon components
│   ├── SvgIcon.tsx     # Primary icon component
│   ├── SafeIcon.tsx    # Fallback icon component
│   ├── IconVariants.tsx # Pre-configured icon variants
│   └── index.ts        # Export components
├── data/
│   ├── icon-data.ts    # Generated SVG data (maintained by script)
│   └── index.ts        # Export data
├── mapping/            # Core mapping files (maintained by scripts)
│   ├── icon-mappings.ts    # MASTER icon mapping functions/utilities
│   ├── icon-registry.json  # MASTER mapping of icon names to file paths
│   └── icon-url-map.json   # MASTER mapping of icon names to URLs
├── utils/              # Utility functions
│   ├── validation.ts   # Icon name validation
│   └── index.ts        # Export utilities
├── IconConfig.ts       # Icon configuration
├── index.ts            # Main entry point for icon system
├── README.md           # This documentation
└── types.ts            # TypeScript type definitions
```

## Usage

Always import icon components from the main entry point:

```typescript
import { Icon, ButtonIcon, DeleteIcon } from '@/components/ui/icons';

// Basic usage
<Icon name="faUser" />

// Static icons (no hover effects)
<Icon name="faUser" iconType="static" />
// Or use the convenience component
<StaticIcon name="faUser" />

// Button icons (with hover effects)
<Icon name="faUser" iconType="button" />
// Or use the convenience component
<ButtonIcon name="faUser" />

// Pre-configured icons
<DeleteIcon />  // Uses faTrashCan with delete action
<WarningIcon /> // Uses faTriangleExclamation with warning action
<SuccessIcon /> // Uses faCircleCheck with success action
```

## Icon Maintenance

The icon system is maintained by scripts in `scripts/icons/`:

1. `download-icons.js` - Downloads all necessary icons from the Font Awesome CDN
2. `generate-icon-data.js` - Generates the icon-data.ts file with embedded SVG paths

To update icons:

```bash
# Download all icons
node scripts/icons/download-icons.js

# Force re-download all icons
node scripts/icons/download-icons.js --force

# Just refresh light icons
node scripts/icons/download-icons.js --refresh-light

# Download icons and generate data
node scripts/icons/download-icons.js
```

## Master Files

The three master mapping files are:

1. `mapping/icon-registry.json` - Maps icon names to file paths
2. `mapping/icon-url-map.json` - Maps icon names to URLs
3. `mapping/icon-mappings.ts` - Utility functions for working with icons

These files are the source of truth for the icon system and are maintained by the download script. 
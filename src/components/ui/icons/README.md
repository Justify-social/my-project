# Local SVG Icon System

This directory contains a new icon system that uses local SVG files instead of loading Font Awesome icons dynamically. This provides several benefits:

1. **Reliability**: No dependency on external CDNs or network requests
2. **Performance**: Faster loading times since icons are bundled with the application
3. **Reduced bundle size**: Only includes the icons actually used in your project
4. **Consistency**: Icons look the same every time regardless of network conditions

## IMPORTANT: Icons Must Be Downloaded Before Use

⚠️ **All icons MUST be downloaded and stored in the codebase before use!** ⚠️

DO NOT use FontAwesome icons directly in the code without first downloading them using the provided scripts. This ensures:

1. Icons are always available and load immediately (no network dependency)
2. Icons are properly tracked and managed
3. Icons are consistently styled and sized

## Icon Styles and Naming Conventions

The system automatically creates both solid and light variants of all icons. To use the light (outlined) version of an icon, append "Light" to the icon name:

```tsx
// Solid version (default)
<Icon name="faUser" />

// Light/outlined version
<Icon name="faUserLight" />
```

The script automatically creates light versions of all solid icons, so you can use any icon in either style without having to add it explicitly.

## Icon Directory Structure

The SVG icons are organized in the following directories based on their style:

- `/public/ui-icons/solid` - For solid Font Awesome icons (prefix: `fas`)
- `/public/ui-icons/light` - For light/outline Font Awesome icons (prefix: `fal`)
- `/public/ui-icons/brands` - For brand Font Awesome icons (prefix: `fab`)
- `/public/ui-icons/regular` - For regular Font Awesome icons (prefix: `far`)

## Icon Workflow - How to Add Icons

Follow these steps whenever you need to add new icons to the project:

### Step 1: Add the icons to your code

Import the icon in your source code as you normally would:

```tsx
// In your component file
import { faNewIcon } from '@fortawesome/pro-solid-svg-icons';
```

### Step 2: Download the icons

Run the download script:

```bash
node scripts/download-icons.js
```

This script will:
- Scan the codebase for all Font Awesome icons
- Download them as SVG files to the appropriate directories
- Create a registry of all icons

### Step 3: Generate embedded icon data (optional)

For maximum performance:

```bash
node scripts/generate-icon-data.js
```

### Step 4: Use the icons in your components

Now use the local icon component:

```tsx
import { Icon } from '@/components/ui/icons';

function MyComponent() {
  return <Icon name="faNewIcon" />;
}
```

## Detailed Implementation Guide

### 1. Install dependencies

```bash
npm install --save-dev @babel/parser @babel/traverse glob
```

### 2. Run the download script

```bash
node scripts/download-icons.js
```

The script will:
- Create directories under `/public/ui-icons/` and save icons as SVG files based on their style
- Generate an icon registry file at `src/assets/icon-registry.json`
- Create an icon URL map at `src/assets/icon-url-map.json`

### 3. Generate embedded icon data (optional)

For maximum performance, you can generate a TypeScript file with all icon data embedded:

```bash
node scripts/generate-icon-data.js
```

This will create:
- `src/components/ui/icons/icon-data.ts` with all icon data embedded

### 4. Using the icon components

There are two component options available:

#### Option 1: SvgIcon (Recommended)

The `SvgIcon` component tries to use embedded icon data when available (faster) and falls back to loading icons from files if needed.

```tsx
import { Icon } from '@/components/ui/icons/SvgIcon';

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

#### Option 2: LocalIcon (Simpler)

The `LocalIcon` component always loads SVG files from the public directory, which is simpler but may be slightly slower.

```tsx
import { Icon } from '@/components/ui/icons/LocalIcon';

function MyComponent() {
  return (
    <div>
      <Icon name="faUser" />
      <Icon name="faUser" style="light" />
    </div>
  );
}
```

## Troubleshooting

If icons are not displaying correctly:

1. Check that you've run the download script after adding new icons
2. Verify the icon name is correct (it should match the FontAwesome import name, e.g., "faUser")
3. For style-specific icons, make sure you're specifying the correct style prop
4. Run the scripts with the `--verbose` flag for more detailed output:
   ```bash
   node scripts/download-icons.js --verbose
   ```

## CI/CD Integration

It's recommended to run the icon download script as part of your build process to ensure all icons are properly downloaded and available:

```yaml
# In your CI/CD config
build:
  steps:
    - checkout
    - npm install
    - node scripts/download-icons.js # Download all icons
    - node scripts/generate-icon-data.js # Generate embedded data
    - npm run build # Build your app
``` 
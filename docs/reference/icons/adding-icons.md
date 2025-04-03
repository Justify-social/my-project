# Adding Icons to the Project

This guide provides step-by-step instructions for adding new icons to the project.

## Prerequisites

- Node.js environment setup
- Project repository cloned locally
- Basic understanding of the icon system (see [Icon System Documentation](./icon-system.md))

## Quick Start

For most cases, you can add a new icon with these three steps:

1. Use the icon in your component
2. Run the download script to fetch the icon
3. Verify the icon appears correctly

## Detailed Steps

### Step 1: Use the Icon in Your Component

First, import the Icon component and use it with the desired icon name:

```tsx
import { Icon } from '@/components/ui/atoms/icon';

function MyComponent() {
  return (
    <div>
      <Icon name="faRocket" />
      {/* The rest of your component */}
    </div>
  );
}
```

### Step 2: Download the Icon

Run the icon download script to fetch and process the icon:

```bash
# Option 1: Use the download script directly
node scripts/icons/download-icons.mjs --icons=rocket

# Option 2: Use the master toolkit
node scripts/master/master-toolkit.mjs icons download --icons=rocket
```

> Note: You don't need to include the "fa" prefix in the command - just use the base name.

### Step 3: Verify the Icon

Once the script has run, the icon should appear in your component. If it's not visible:

1. Check your browser console for errors
2. Verify the icon was downloaded successfully (check `/public/icons/light/rocket.svg`)
3. Make sure you're using the correct icon name format (`faRocket`, not `fa-rocket` or `rocket`)

## Icon Naming Conventions

When adding icons, follow these naming conventions:

1. For standard FontAwesome icons:
   - Use camelCase with "fa" prefix: `faUser`, `faCheckCircle`
   - The script will handle converting to the appropriate file format

2. For brand icons:
   - Use camelCase with "fa" prefix: `faGithub`, `faFacebook`
   - Specify the brands style: `--prefix=brands`

3. For custom app icons:
   - Use camelCase with "app" prefix: `appLogo`, `appCustomFeature`

## Advanced Options

### Download Multiple Icons

```bash
# Download multiple icons at once
node scripts/icons/download-icons.mjs --icons=rocket,star,bell
```

### Specify Icon Style

```bash
# Download a specific style (light, solid, brands)
node scripts/icons/download-icons.mjs --icons=github --prefix=brands
```

### Force Re-download

```bash
# Force re-download even if the icon already exists
node scripts/icons/download-icons.mjs --icons=user --force
```

### Clean Up Icon Files

```bash
# Clean up incorrectly named icons
node scripts/icons/download-icons.mjs --cleanup
```

## Adding Custom SVG Icons

For custom SVG icons not available in FontAwesome:

1. Create your SVG file following these guidelines:
   - Use a viewBox of "0 0 512 512" for consistency
   - Set `fill="currentColor"` to allow color customization
   - Simplify paths for better performance
   - Remove unnecessary attributes

2. Place the SVG in the appropriate directory:
   - App-specific icons: `/public/icons/app/my-custom-icon.svg`
   - KPI-specific icons: `/public/icons/kpis/my-kpi-icon.svg`

3. Update the registry manually or run:
   ```bash
   node scripts/icons/regenerate-registry.mjs
   ```

## Troubleshooting

### Icon Not Found

```
Error: Icon 'faExampleIcon' not found in the registry
```

Solution:
- Check if the icon name is correct
- Try downloading the icon explicitly: `--icons=example-icon`
- Verify the icon exists in FontAwesome

### Rendering Issues

If the icon downloads but doesn't render correctly:

1. Check if the SVG file is valid
2. Inspect the icon registry JSON for that entry
3. Try a different style (light/solid/brands)
4. Make sure your component is using the correct name format

## Examples

### Adding a Standard Icon

```bash
# Add a calendar icon
node scripts/icons/download-icons.mjs --icons=calendar
```

Use in component:
```tsx
<Icon name="faCalendar" />
```

### Adding a Brand Icon

```bash
# Add the LinkedIn logo
node scripts/icons/download-icons.mjs --icons=linkedin --prefix=brands
```

Use in component:
```tsx
<Icon name="faLinkedin" variant="brands" />
```

### Adding App-Specific Icons

```bash
# Custom icons can be manually placed in the /public/icons/app/ directory
# Then regenerate the registry:
node scripts/icons/regenerate-registry.mjs
```

Use in component:
```tsx
<Icon name="appCustomFeature" variant="app" />
``` 
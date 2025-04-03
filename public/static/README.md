# Icon Registry Documentation

This directory contains the categorized icon registry files that serve as the Single Source of Truth (SSOT) for all icons used throughout the application. These files are automatically generated and maintained through the icon management system.

## Registry Files

| File | Description | Count | Usage |
|------|-------------|-------|-------|
| `app-icon-registry.json` | Application-specific icons for main features | 11 | Navigation, feature areas |
| `brands-icon-registry.json` | Social media and external brand logos | 7 | Social sharing, auth providers |
| `kpis-icon-registry.json` | Key Performance Indicator icons | 8 | Metrics, analytics |
| `light-icon-registry.json` | Light version of FontAwesome Pro icons | 137 | Default state UI elements |
| `solid-icon-registry.json` | Solid version of FontAwesome Pro icons | 137 | Hover state UI elements |

## Security Status

All registry files are locked and secured as read-only using multiple protection mechanisms:

- Read-only file permissions (444) applied via `chmod`
- System immutable flag (schg) set via `sudo chflags schg`
- Modification attempts return "Operation not permitted"

This ensures these files serve as a true SSOT and prevents accidental or unauthorized modifications. To modify these files, the proper unlock procedure must be followed (see Maintenance section).

## File Structure

Each registry file follows a consistent JSON schema:

```json
{
  "icons": [
    {
      "category": "light",
      "id": "faCheckLight",
      "name": "Check",
      "faVersion": "fal fa-check",
      "path": "/icons/light/faCheckLight.svg"
    },
    // More icons...
  ],
  "generatedAt": "2025-04-02T23:48:54.371Z",
  "updatedAt": "2025-04-03T11:01:38.000Z",
  "version": "1.5.0",
  "category": "light",
  "iconCount": 137
}
```

### Icon Properties

| Property | Description | Example |
|----------|-------------|---------|
| `category` | The icon category | `"light"`, `"solid"`, `"app"` |
| `id` | Unique identifier | `"faCheckLight"`, `"appHome"` |
| `name` | Human-readable name | `"Check"`, `"Home"` |
| `faVersion` | FontAwesome class (if applicable) | `"fal fa-check"`, `null` |
| `path` | Path to the SVG asset | `"/icons/light/faCheckLight.svg"` |

## Usage Guidelines

### Default Icon States

- **Default state**: Use light icons (`light-icon-registry.json`)
- **Hover/active state**: Use solid icons (`solid-icon-registry.json`)

### Component Integration

```tsx
import { Icon } from '@/components/ui/atoms/icon';

// Usage with ID
<Icon id="faCheckLight" />

// With hover effect (automatically uses solid version)
<Icon id="faCheckLight" withHoverEffect />

// App-specific icon
<Icon id="appHome" />

// Brand icon
<Icon id="brandsFacebook" />
```

## Improved Icon Usage

### New Pattern: Explicit Icon Variants

We've improved how icon variants are handled in the codebase. Instead of using the `solid` attribute, you should now use explicit icon variants with the appropriate suffix:

```jsx
// ❌ Old pattern (deprecated)
<Icon name="faCheck" solid={true} />
<Icon name="faCheck" solid={false} />

// ✅ New pattern (preferred)
<Icon name="faCheckSolid" />
<Icon name="faCheckLight" />
```

This approach offers several benefits:
- More readable and explicit code
- Reduced prop drilling
- Better type safety
- Consistent with FontAwesome naming conventions

The Icon component will automatically detect the suffix and use the appropriate variant, making your code more concise and easier to understand.

### Icon Component Behavior

The Icon component now has the following behavior:
1. If the icon name ends with `Solid`, it will use the solid variant
2. If the icon name ends with `Light`, it will use the light variant
3. If `active={true}` is set, it will use the solid variant
4. Otherwise, it will use the variant specified in the `variant` prop (defaults to "light")

### Migration Script

A migration script `scripts/icons/convert-solid-attributes.js` has been created to automatically convert the old pattern to the new one. Run it with:

```bash
node scripts/icons/convert-solid-attributes.js
```

## Maintenance

These files are automatically generated and should not be manually edited. To update them:

1. Use the icon management tools in `scripts/icons/`
2. Run `npm run icons:update` to regenerate all registry files
3. Validate with `npm run icons:validate`

### Unlocking Registry Files

To unlock a registry file for maintenance:

```bash
# 1. Remove the immutable flag (requires sudo)
sudo chflags noschg public/static/categories/[filename].json

# 2. Set writable permissions
chmod 644 public/static/categories/[filename].json

# After modifications, re-lock the file using:
./scripts/icons/lock-registry-files.sh
```

## Icon Download Status

All icon files have been successfully downloaded and saved to their respective directories:

- `/public/icons/light/` - Contains all 137 light variant icons
- `/public/icons/solid/` - Contains all 137 solid variant icons
- `/public/icons/app/` - Contains 11 application-specific icons
- `/public/icons/brands/` - Contains 7 brand/social media icons
- `/public/icons/kpis/` - Contains 8 KPI-specific icons

## Related Documentation

- [Icon Component Documentation](/src/components/ui/atoms/icon/README.md)
- [Icon System Architecture](/docs/reference/icons/icon-system.md)
- [Icon Management Tools](/scripts/icons/README.md) 
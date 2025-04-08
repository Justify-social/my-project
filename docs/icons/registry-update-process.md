# Icon Registry Update Process

This document outlines the standardized process for updating icon registry files following Single Source of Truth (SSOT) principles.

## Overview

All icon registries are stored as canonical JSON files in `/public/static/`:

- `app-icon-registry.json` - Application-specific icons
- `brands-icon-registry.json` - Brand and company logos
- `kpis-icon-registry.json` - KPI and analytics icons  
- `light-icon-registry.json` - FontAwesome Light variant icons
- `solid-icon-registry.json` - FontAwesome Solid variant icons

These files serve as the SSOT for all icon references in the application. The `icon-registry-loader.ts` file consolidates these registries into a single unified registry at runtime.

## Required Fields

All icons in registry files must have the following required fields:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique identifier (SSOT) | `"faArrowUpLight"` |
| `category` | Icon category | `"light"`, `"app"`, etc. |
| `path` | Path to the SVG asset | `"/icons/light/arrow-up.svg"` |
| `name` | Human-readable name (optional) | `"Arrow Up Light"` |
| `faVersion` | FontAwesome version (optional) | `"6.0.0"` |

## Update Process

Follow these steps when updating icon registry files:

### 1. Prepare

```bash
# Unlock registry files (they're normally locked as read-only)
npm run icons:unlock
```

### 2. Archive Current Registries

```bash
# Archive current registry files before making changes
npm run icons:archive
```

This creates a timestamped backup in `/public/static/archive/YYYY-MM-DD/`.

### 3. Make Changes

Edit the appropriate canonical registry file to add, modify, or remove icons:

- For new icons: Add them to the appropriate registry file
- For modifications: Update the existing registry entries
- For removals: Delete entries from the registry

### 4. Validate Changes

```bash
# Validate all registry files to ensure they have required fields
npm run icons:validate:registry

# Validate SSOT compliance (ensures ID field is used as primary key)
npm run icons:validate:ssot

# Run specific checks for light or solid icons
npm run icons:check:light
npm run icons:check:solid
```

### 5. Test Rendering

```bash
# Test that all icons render correctly
npm run icons:render:test
```

### 6. Update Documentation

If adding new icons or changing existing ones:

1. Update the semantic mapping in `src/components/ui/icon/icon-semantic-map.ts`
2. Document changes in `CHANGELOG.md`

### 7. Lock Registry Files

```bash
# Re-lock registry files as read-only to prevent accidental changes
npm run icons:lock
```

## Staging New Icons

For new icons that aren't ready for production:

1. Add them to the staging files (`new-light-icon-registry.json` or `new-solid-icon-registry.json`)
2. When ready, merge them into the canonical registry:
   ```bash
   npm run icons:merge
   ```

## Troubleshooting

If validation fails:
- Check the console output for specific error messages
- Ensure all icons have the required fields
- Verify path formats match the expected pattern for each category

## Best Practices

- Always use the `id` field as the SSOT for icon references
- Follow naming conventions consistently:
  - Light icons: `fa[Name]Light` (e.g., `faArrowUpLight`)
  - Solid icons: `fa[Name]Solid` (e.g., `faArrowUpSolid`)
  - App icons: `app[Name]` (e.g., `appSettings`)
- Keep registry files clean and well-organized
- Document all registry changes
- Run validation after any changes to ensure consistency 
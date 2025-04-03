# Icon Management Scripts

This directory contains scripts related to icon management, validation, and processing.

## Available Scripts

| Script | Description |
|--------|-------------|
| `download-light-icons.mjs` | Downloads light icons from FontAwesome based on registry |
| `download-solid-icons.mjs` | Downloads solid icons from FontAwesome based on registry |
| `download-brands-icons.mjs` | Downloads brand icons from FontAwesome based on registry |
| `check-light-icons.mjs` | Validates light icon registry integrity |
| `check-solid-icons.mjs` | Validates solid icon registry integrity |
| `fix-light-registry.mjs` | Fixes issues in the light icon registry |
| `fix-solid-registry.mjs` | Fixes issues in the solid icon registry |
| `validate-solid-registry.mjs` | Validates the solid icon registry |
| `lock-registry-files.sh` | Secures registry files as read-only |
| `audit-icons.mjs` | Audits the codebase for icon usage |

## Icon Registry

The icon registry files are stored in:
- `public/static/*-icon-registry.json` - Primary icon registries with all metadata
- `public/static/new-light-icon-registry.json` - New light icons registry
- `public/static/new-solid-icon-registry.json` - New solid icons registry

## Usage

Scripts should be run from the project root using npm.

You can also run the scripts directly:

```bash
node scripts/icons/download-light-icons.mjs
node scripts/icons/download-solid-icons.mjs
node scripts/icons/check-light-icons.mjs
```

## Adding New Icons

To add new icons to the system:

1. Add the icon definition to the appropriate registry file
2. Run the download script to download and process the icons
3. Verify the icons are correctly added with the validation script

## Guidelines

- All icon-related scripts should be placed in this directory
- Registry files are secured with read-only permissions
- Always maintain backward compatibility with existing icon usage

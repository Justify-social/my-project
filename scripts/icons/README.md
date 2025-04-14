# Icon Management Scripts - SSOT Edition

This directory contains essential icon management, validation, and processing scripts following the Single Source of Truth (SSOT) principles. All deprecated and migration scripts have been removed to maintain a clean codebase.

## Available Scripts

| Script                        | Purpose                                          | When to Use                             |
| ----------------------------- | ------------------------------------------------ | --------------------------------------- |
| `download-light-icons.mjs`    | Downloads light icons from FontAwesome           | When adding new light icons             |
| `download-solid-icons.mjs`    | Downloads solid icons from FontAwesome           | When adding new solid icons             |
| `download-brands-icons.mjs`   | Downloads brand icons from FontAwesome           | When adding new brand icons             |
| `check-light-icons.mjs`       | Validates light icon registry                    | After modifying light icons             |
| `check-solid-icons.mjs`       | Validates solid icon registry                    | After modifying solid icons             |
| `validate-solid-registry.mjs` | Deep validation of solid registry                | Quality assurance                       |
| `validate-icon-registry.js`   | Validates all registry files for required fields | Periodic validation checks              |
| `validate-id-ssot.mjs`        | Verifies SSOT compliance                         | During code reviews                     |
| `lock-registry-files.sh`      | Secures registry files as read-only              | After any registry modifications        |
| `merge-icon-registries.mjs`   | Merges icons from staging to main registries     | When new icons are ready for production |
| `audit-icons.mjs`             | Audits icon usage across codebase                | Quarterly maintenance                   |
| `audit-icon-usage.mjs`        | Detailed icon usage analysis                     | When optimizing icon use                |
| `eslint-rule-icon-id.js`      | ESLint rule for iconId usage                     | Integrated with lint process            |
| `scan-icon-references.js`     | Scans for modern icon references                 | During code maintenance                 |
| `verify-icon-rendering.mjs`   | Tests icon rendering                             | When debugging icon issues              |
| `fix-icon-imports.sh`         | Fixes incorrect icon import paths                | When refactoring components             |
| `update-icon-imports.sh`      | Updates icon import patterns                     | During codebase standardization         |

## Icon Registry SSOT

All icon registry files follow the SSOT pattern and are securely stored in:

- `public/static/app-icon-registry.json` - Application icons
- `public/static/brands-icon-registry.json` - Brand icons
- `public/static/kpis-icon-registry.json` - KPI icons
- `public/static/light-icon-registry.json` - Light variant icons
- `public/static/solid-icon-registry.json` - Solid variant icons

Additionally, we have staging registries for new icons:

- `public/static/new-light-icon-registry.json` - New light icons pending addition
- `public/static/new-solid-icon-registry.json` - New solid icons pending addition

## Usage

Scripts should be run from the project root using npm or directly:

```bash
# For downloading icons
npm run icons:download:light
npm run icons:download:solid
npm run icons:download:brands

# For validating icons
npm run icons:check:light
npm run icons:check:solid

# For merging icons from staging to main registries
npm run icons:merge

# For securing registry files
npm run icons:lock
```

## Adding New Icons

To add new icons to the system:

1. Temporarily unlock registry files: `npm run icons:unlock`
2. Add the icon definition to the appropriate staging registry file (new-light-icon-registry.json or new-solid-icon-registry.json)
3. Run the download script: `npm run icons:download:<type>`
4. Validate the icons: `npm run icons:check:<type>`
5. When ready for production, merge the icons from the staging registry to the main registry: `npm run icons:merge`
6. Re-lock the registry files: `npm run icons:lock`

## SSOT Best Practices

1. Always use `iconId` instead of `name` in components
2. Registry files are the single source of truth - never hardcode icon paths
3. Registry files are locked read-only to prevent accidental modifications
4. Follow naming conventions: `fa[IconName][Variant]` e.g. `faChevronDownLight`
5. Use the ESLint rule to enforce proper icon usage
6. Use staging registries for new icons until they're properly tested

# UI Component Debug Tools - Fix Scripts

This directory contains scripts designed to systematically fix UI component rendering issues in the debug tools. These components appear in navigation but fail to render properly in the preview pane.

## Root Cause Analysis

After investigating working components (Accordion, Alert, and Button), we discovered these critical implementation patterns:

1. **Order Dependencies Matter**: 
   - Dynamic imports MUST be defined BEFORE wrapper components that use them
   - Correct sequence: imports → wrappers → exports

2. **Path Resolution Chain**:
   - Components must use flat path format: `@/components/ui/alert` (not atomic paths)
   - Path resolution follows: `SHADCN_PATH_MAPPING` → component key → actual import location

3. **Single Source of Truth (SSOT)**:
   - Multiple wrapper implementations cause inconsistency
   - One canonical implementation should be the reference

## Scripts Overview

### analyze-components.js
Analyzes all UI components in the codebase to:
- Find all UI components and their subcomponents
- Detect variants and special requirements
- Generate a comprehensive component analysis
- Create a reference table for documentation

### validate-path-mapping.js
Validates and updates component mappings:
- Checks for missing or incorrect path mappings
- Identifies gaps in the registry
- Generates patches for missing entries
- Updates the registry when run with `--update` flag

### generate-wrapper.js
Creates a canonical wrapper implementation:
- Follows the critical three-step pattern
- Handles component-specific requirements
- Supports subcomponents correctly
- Creates comprehensive wrapper components

### update-references.js
Updates all import references to use the canonical implementation:
- Finds files importing old wrapper components
- Updates import paths with correct relative paths
- Generates proper imports that work across the codebase
- Creates backups of modified files

### verify-components.js
Provides tools to test and verify component rendering:
- Creates a verification page to test all components
- Provides diagnostics for troubleshooting
- Generates detailed reports for maintenance

### fix-ui-components.js
The main script that orchestrates the entire fix process:
- Runs all scripts in the correct order
- Provides command-line flags for options
- Generates cleanup and verification tools
- Creates comprehensive reports

## Usage Instructions

### Basic Analysis (No Changes)
```bash
node scripts/shadcn/fix-ui-components.js
```

### Update Path Mappings
```bash
node scripts/shadcn/fix-ui-components.js --update-mappings
```

### Update Import References
```bash
node scripts/shadcn/fix-ui-components.js --update-references
```

### Complete Fix
```bash
node scripts/shadcn/fix-ui-components.js --update-all
```

After running the scripts, verify the components render correctly at:
`http://localhost:3000/debug-tools/ui-components/verify-components`

When verified, run the removal script to clean up duplicate files:
```bash
./scripts/shadcn/remove-duplicates.sh
```

## Important Implementation Notes

### The Critical Three-Step Pattern

Follow this exact pattern for any component wrapper:

```tsx
// 1. FIRST: Define dynamic imports at the TOP
const ComponentImport = dynamic(
  () => safeDynamicImport(
    '@/components/ui/component', // Use flat path format
    'Component',
    () => <ErrorLoadingComponent name="Component" />
  ),
  { ssr: false }
);

// 2. THEN: Create the wrapper component
export const ComponentWrapper = (props: any) => {
  return (
    <div className="wrapper-component">
      <ComponentImport>
        {/* Component specific content */}
      </ComponentImport>
    </div>
  );
};

// 3. FINALLY: Include in the ShadcnWrappers object
export const ShadcnWrappers = {
  Component: ComponentWrapper,
  // other wrappers...
};
```

### Special Component Requirements

Some components have specific requirements:
- **Accordion**: Needs AccordionItem, AccordionTrigger, and AccordionContent subcomponents
- **Alert**: Needs AlertTitle and AlertDescription subcomponents
- **Button**: Works best with variants (default, secondary, outline, etc.)
- **Dialog/Modal**: Needs state management (open/close)
- **Card**: Needs CardHeader, CardContent, and CardFooter subcomponents

### Aggressive Removal Policy

- **IMPORTANT**: We do NOT keep deprecated files in the codebase
- After verification, run the removal script to delete duplicate wrapper files
- All imports are updated to point to the canonical implementation

## Troubleshooting

If components don't render correctly:

1. **Check Import Order**: Imports MUST be defined before wrapper components
2. **Check Path Format**: Use flat paths (`@/components/ui/component`)
3. **Check Registry Entries**: Ensure components have entries in both mappings
4. **Check Subcomponents**: Some components need specific subcomponents

## Project Background

This project is part of a comprehensive effort to fix UI component rendering issues in the debug tools. The approach is based on a detailed investigation documented in `shadcn-rendering.md`.

The main goals are:
- Fix all UI components to render properly
- Establish a single source of truth for wrappers
- Create a maintainable system for future component additions
- Remove all duplicate implementations 
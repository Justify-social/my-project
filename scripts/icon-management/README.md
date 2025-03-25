# Icon Management Scripts

This directory contains scripts for managing, validating, and fixing icon-related functionality in the application.

## Scripts Overview

- **audit-icons.js**: Audits icon usage across the application and generates reports
- **check-debug-icons.js**: Debug tool for checking icon implementations
- **check-icon-formatting.js**: Validates icon format consistency
- **download-icons.js**: Downloads icon assets from source repositories
- **enhance-icon-validation.js**: Enhanced validation for icon implementation
- **fix-font-consistency.js**: Ensures font consistency across icon usage
- **fix-icon-group-classes.js**: Fixes CSS classes for icon groups
- **fix-icon-issues.js**: Fixes specific icon implementation issues
- **fix-icon-svgs.js**: Fixes SVG-specific issues in icons
- **generate-icon-data.js**: Generates icon data files from source assets
- **standardize-icon-theming.js**: Standardizes icon theming across the application
- **verify-icons.js**: Verification tool for icon implementation

## Usage

Most scripts can be run directly with Node.js:

```bash
node scripts/icon-management/[script-name].js
```

Or imported through the main scripts index:

```javascript
const { iconManagement } = require('../index');
iconManagement.auditIcons();
```

## Primary Scripts

The most commonly used scripts are exposed as npm commands:

```bash
# Download and update icon assets
npm run update-icons

# Audit icon usage in the application
npm run audit-icons  

# Verify icon implementation
npm run verify-icons

# Check debug icons
npm run check-debug-icons
``` 
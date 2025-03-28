# Icon Management System

This directory contains tools for managing, downloading, and auditing icons in the application.

## Overview

The icon system has been consolidated into a clean, organized structure with minimal scripts. The system only requires two main scripts:

1. **download-icons.js** - Downloads and processes all icons
2. **audit-icons.js** - Audits the codebase for icon usage and validates icon integrity

The scripts are designed to be comprehensive and handle all aspects of icon management in a consistent way.

## Scripts

### Download Icons

```bash
# Download all icons used in the application
node scripts/icons/download-icons.js

# Options:
#   --verbose       Show detailed logging information
#   --force         Force download even if icons exist
#   --no-generate   Skip icon data generation
#   --no-verify     Skip verification of downloaded icons
```

This script:
- Scans the codebase for icon usage
- Downloads all required SVG icons
- Ensures proper icon structure in public directory
- Generates optimized icon data
- Verifies icon integrity

### Audit Icons

```bash
# Audit the application's icon usage
node scripts/icons/audit-icons.js

# Options:
#   --verbose    Show detailed information about findings
#   --json       Output results in JSON format
#   --fix        Attempt to automatically fix simple issues
#   --verify     Include verification of icon SVG files
#   --paths      Check icon import paths
#   --all        Run all checks (equivalent to --verify --paths)
```

This script:
- Analyzes the codebase for icon usage patterns
- Identifies problematic FontAwesome imports or patterns
- Validates icon files for consistency
- Verifies icon data matches physical SVG files
- Checks for missing or broken icon references
- Provides comprehensive reporting

### Icon Data Generation

```bash
# Generate icon data (automatically called by download-icons.js)
node scripts/icons/generate-icon-data.js

# Options:
#   --verbose    Show detailed information
```

This script generates the icon data files needed by the application based on the downloaded SVG files.

## Icon Directory Structure

```
public/icons/                # Public SVG files
├── solid/                   # Solid style icons
├── light/                   # Light style icons
├── brands/                  # Brand icons
└── regular/                 # Regular style icons

src/components/ui/icons/     # Icon components
├── components/              # Icon React components
├── data/                    # Icon data files
└── utils/                   # Icon utility functions
```

## Usage in Application

Import icons in your components:

```jsx
import { Icon, StaticIcon, ButtonIcon } from '@/components/ui/icons';

// Basic usage
<Icon name="faUser" />

// With styling
<Icon name="faCheck" className="text-green-500" />

// Light variant
<Icon name="faUserLight" />

// Static icon (pre-rendered)
<StaticIcon name="faUser" />

// Button icon (with button styling)
<ButtonIcon name="faEdit" onClick={handleEdit} />
```

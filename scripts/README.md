# Project Scripts Architecture

This directory contains a holistic, well-organized collection of utilities and scripts for managing various aspects of the project. The scripts are structured following solid software engineering principles to ensure maintainability, clarity, and efficiency.

> **New Master Toolkit Available!** 
> 
> Try our new unified script interface that provides centralized access to all scripts:
> ```bash
> node scripts/master/master-toolkit.mjs help
> ```
> See [Master Script Architecture](./master/README.md) for details.

## Directory Structure

```
scripts/
├── master/                # Master toolkit and script architecture
│   ├── master-toolkit.mjs # Unified entry point for all scripts
│   └── README.md          # Master architecture documentation
├── consolidated/           # Single source of truth for consolidated scripts
├── icons/                  # Icon management scripts
│   └── README.md           # Documentation for icon scripts
├── ui/                     # UI component management scripts
│   └── README.md           # Documentation for UI scripts
├── config/                 # Configuration management scripts
│   ├── config-organizer.mjs    # Organizes configuration files
│   └── migrate-config.mjs      # Updates configuration references
├── build/                  # Build process scripts
├── utils/                  # Utility scripts
├── cleanup/                # Cleanup and maintenance scripts
├── linting/                # Code quality scripts
├── docs/                   # Documentation scripts
└── db/                     # Database scripts
```

## Architecture Principles

Our script architecture follows these key principles:

1. **Single Source of Truth**: Each functionality has one definitive implementation
2. **Logical Organization**: Scripts are grouped by domain and purpose
3. **Unified Interface**: Common entry points for related functionality
4. **Progressive Complexity**: Simple operations are easy, complex operations are possible
5. **Documentation First**: Every script directory includes comprehensive documentation
6. **ESM Preference**: Modern ES modules (.mjs) are preferred for new scripts
7. **Backward Compatibility**: Support for existing workflows while moving forward

## Script Categories

### Core Scripts

- **master-toolkit.js**: Unified command-line interface for all script functionality
- **config-organizer.mjs**: Manages configuration file organization
- **migrate-config.mjs**: Updates references to configuration files

### Icon Management

The `icons/` directory contains scripts for managing UI icons:

- **download-icons.mjs**: Downloads and processes icon files
- **audit-icons.mjs**: Analyzes icon usage and validates integrity

### UI Component Management

The `ui/` directory contains scripts for UI component management:

- **validate-component-paths.mjs**: Validates component paths
- **analyze-component-usage.cjs**: Analyzes component usage
- **backup-ui-components.js**: Creates component backups

### File Organization

Several scripts maintain the project's clean directory structure:

- **config/scripts/config-organizer.mjs**: Organizes configuration files
- **tree-shake/tree-shake.mjs**: Identifies and removes deprecated files

## Usage Guidelines

### General Pattern

Most scripts follow this usage pattern:

```bash
node scripts/<category>/<script-name>.mjs [options]
```

### Master Toolkit

The master toolkit provides a unified interface:

```bash
node scripts/master-toolkit.js <category> <command> [options]
```

Example:
```bash
# Run icon audit
node scripts/master-toolkit.js icons audit

# Organize configuration files
node scripts/master-toolkit.js config organize
```

### NPM Scripts

Common operations are available through npm scripts:

```bash
# Icon management
npm run icons:download
npm run icons:validate

# UI component management
npm run ui:validate-paths
npm run ui:analyze-usage
```

## Development Guidelines

When creating new scripts:

1. **Location**: Place scripts in the appropriate category directory
2. **Format**: Use `.mjs` for ES modules, `.cjs` for CommonJS modules
3. **Documentation**: Update the relevant README.md with usage instructions
4. **Interfaces**: Maintain consistent CLI interfaces across scripts
5. **Error Handling**: Include robust error handling and user feedback
6. **Testing**: Include testing mechanisms for script functionality
7. **Single Responsibility**: Each script should have a clear, focused purpose

## Implementation Notes

- Scripts are interconnected through a cohesive architecture while maintaining isolation
- Shared utilities are available in the `utils/` directory
- Configuration can be environment-specific using the `NODE_ENV` variable
- All scripts include detailed help output with the `--help` flag

## Future Improvements

- Complete migration to ES modules (.mjs) format
- Enhanced type checking with TypeScript or JSDoc
- Further consolidation of duplicate functionality
- Expanded test coverage for script functionality

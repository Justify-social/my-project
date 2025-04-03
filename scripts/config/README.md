# Configuration Management Scripts

> **DEPRECATED: The scripts from this directory have been moved to `config/scripts/`.**
> 
> Please use the scripts from the new location or use the master toolkit.

This directory previously contained scripts for managing project configuration files and their organization.

## Available Scripts (relocated to `config/scripts/`)

### config-organizer.mjs

Organizes configuration files in the project by:
- Moving configuration files to a structured `config/` directory
- Creating subdirectories for different types of configurations
- Setting up redirect files for backward compatibility
- Creating documentation for the new structure

```bash
# Usage
node config/scripts/config-organizer.mjs [options]

# Options
--dry-run   Preview changes without making them
--verbose   Show detailed logging

# Example - preview changes
node config/scripts/config-organizer.mjs --dry-run

# Example - apply changes
node scripts/master/master-toolkit.mjs config organize
```

### migrate-config.mjs

Updates references to configuration files throughout the codebase:
- Finds and updates import statements that reference old config file paths
- Updates package.json scripts that reference configuration files
- Ensures all parts of the codebase use the new configuration structure

```bash
# Usage
node config/scripts/migrate-config.mjs [options]

# Options
--dry-run   Preview changes without making them
--verbose   Show detailed logging

# Example - preview changes
node config/scripts/migrate-config.mjs --dry-run

# Example - apply changes
node scripts/master/master-toolkit.mjs config migrate
```

## Architecture Principles

These scripts follow our project's architectural principles:
- **Single Source of Truth**: Configuration files have one canonical location
- **Progressive Disclosure**: Simple operations are easy, complex operations are possible
- **Backward Compatibility**: Original paths continue to work through redirect files
- **Discoverability**: Clear documentation and structure helps developers find what they need

## Integration with Master Toolkit

These scripts are accessible through the master toolkit:

```bash
# Access config organizer
node scripts/master/master-toolkit.mjs config organize

# Access config migration
node scripts/master/master-toolkit.mjs config migrate

# Get help on config tools
node scripts/master/master-toolkit.mjs config help
```

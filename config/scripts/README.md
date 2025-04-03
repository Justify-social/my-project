# Configuration Scripts

This directory contains scripts for managing, validating, and organizing the application's configuration.

## Scripts

- **config-organizer.mjs**: Organizes configuration files into a structured directory layout
- **migrate-config.mjs**: Migrates configuration from legacy formats to the current architecture
- **validate-config.js**: Validates the configuration against schemas and checks for errors

## Usage

These scripts can be run via npm commands:

```bash
# Validate the application configuration
npm run validate:config

# Organize configuration files
npm run config:organize

# Migrate legacy configuration
npm run config:migrate
```

## Design Principles

The configuration scripts follow these principles:

1. **Automation over Manual Changes**: Automate repetitive configuration tasks
2. **Validation**: Catch configuration errors before they cause runtime issues
3. **Documentation**: Self-document the configuration architecture
4. **Consistency**: Enforce a consistent configuration structure
5. **Migration Support**: Provide tools for smooth transitions between architectures

## Integration with Package.json

These scripts are integrated with package.json scripts for easy execution, and are part of the application's configuration management strategy. 
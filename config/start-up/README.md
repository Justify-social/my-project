# Application Startup Scripts

This directory contains critical scripts that run during application startup or build processes. These scripts are essential for initializing the application's configuration, validating component registries, and performing other startup tasks.

## Available Scripts

### Component Registry Validation

**`validate-component-registry.js`**: Validates that all UI components are properly registered and follow the project's component architecture.

```bash
# Run the component registry validation
node config/start-up/validate-component-registry.js
```

### Shadcn UI Index Updates

**`update-shadcn-index.mjs`**: Updates the Shadcn UI component indexes during build time to ensure all UI components are properly exported and available.

```bash
# Update the Shadcn UI indexes
node config/start-up/update-shadcn-index.mjs
```

## Integration with Build Process

These scripts are typically executed during the application's build process or when starting the development server. The integration is configured in:

- `package.json` - Pre-build and build scripts
- `next.config.js` - Custom webpack configuration

## Script Execution Order

1. Configuration validation (`config/scripts/validate-config.js`)
2. Component registry validation (`config/start-up/validate-component-registry.js`)
3. UI component updates (`config/start-up/update-shadcn-index.mjs`)

## Adding New Startup Scripts

When adding new startup scripts:

1. Place the script in this directory
2. Update this README
3. Configure the script execution in package.json
4. Document any environment variables or configuration needed

Each script should include proper error handling and informative console output to diagnose issues during startup. 
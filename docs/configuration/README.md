# Configuration System

The configuration system provides a centralized, environment-aware configuration management solution. It follows the Single Source of Truth (SSOT) principle, ensuring that all parts of the application use consistent configuration values.

## Key Features

- **Environment-based Configuration**: Different configurations for development, testing, and production
- **Type-safe Configuration**: Uses structured schemas with validation
- **Single Source of Truth**: All configuration accessed through one entrypoint
- **Platform-specific Modules**: Specialized configurations for various platforms (e.g., Next.js)
- **Validation**: Automatic validation to catch configuration errors early

## Directory Structure

```
config/
├── core/             # Core configuration values
│   ├── constants.js  # Application-wide constants
│   └── defaults.js   # Default configuration values
├── environment/      # Environment-specific configurations
│   ├── development.js
│   ├── production.js
│   └── testing.js
├── platform/         # Platform-specific configurations
│   └── next/         # Next.js specific configuration
│       ├── module/   # Next.js configuration modules
│       │   ├── images.js
│       │   ├── paths.js
│       │   └── webpack.js
│       └── index.js  # Combined Next.js configuration
├── scripts/          # Configuration management scripts
│   ├── config-organizer.mjs
│   ├── migrate-config.mjs
│   └── validate-config.js
├── start-up/         # Application startup scripts
│   ├── update-shadcn-index.mjs
│   └── validate-component-registry.js
├── ui/               # UI component configuration
│   ├── component-registry-manager.mjs
│   ├── components.json
│   └── feature-components.json
├── cypress/          # Cypress testing configuration
│   ├── e2e/          # End-to-end tests
│   ├── fixtures/     # Test data
│   └── support/      # Support files
├── utils.js          # Utility functions for config management
└── index.js          # Main configuration entrypoint
```

## Usage

### Basic Usage

```javascript
// Import the entire configuration
import { config } from '@/config';

// Access specific sections
const { appName, environment } = config;

// Use in a component
function AppHeader() {
  return <h1>{config.appName} ({config.environment})</h1>;
}
```

### Importing Specific Sections

```javascript
// Import specific sections directly
import { database, api } from '@/config';

// Use in your code
async function fetchData() {
  const response = await fetch(`${api.baseUrl}/users`, {
    headers: { 'Authorization': `Bearer ${api.apiKey}` },
    timeout: api.timeout
  });
}
```

## Configuration Types

### Core Configuration

Core configuration includes application-wide constants and default values:

- **constants.js**: Contains values that remain the same across all environments
- **defaults.js**: Provides default values that may be overridden by environment-specific configs

### Environment Configuration

Environment-specific configurations override default values for each environment:

- **development.js**: Values for local development
- **production.js**: Values for production deployment
- **testing.js**: Values for testing environments

### Platform Configuration

Platform-specific configuration modules for different platforms:

- **next/**: Configurations specific to Next.js
  - **module/webpack.js**: Webpack configuration for Next.js
  - **module/images.js**: Next.js image optimization configuration
  - **module/paths.js**: Path aliases for imports

### UI Configuration

Configuration for UI components and registries:

- **ui/components.json**: Shadcn UI component configuration
- **ui/feature-components.json**: Feature-specific component categorization
- **ui/component-registry-manager.mjs**: Script to manage component registries

### Startup Scripts

Critical scripts that run during application startup:

- **start-up/update-shadcn-index.mjs**: Updates Shadcn UI component indexes
- **start-up/validate-component-registry.js**: Validates UI components

### Configuration Scripts

Utilities for managing the configuration system:

- **scripts/config-organizer.mjs**: Organizes configuration files
- **scripts/migrate-config.mjs**: Migrates between configuration structures
- **scripts/validate-config.js**: Validates configuration integrity

### Cypress Configuration

Configuration for Cypress testing:

- **cypress/e2e/**: End-to-end test files
- **cypress/fixtures/**: Test data files
- **cypress/support/**: Support files and plugins

## Validation

The configuration system includes built-in validation to catch configuration errors:

```bash
# Validate the entire configuration
npm run validate:config
```

The validation ensures:

1. Required fields are present
2. Types are correct
3. Referenced paths exist
4. Environment variables are defined in .env.example

## Adding New Configuration

When adding new configuration sections:

1. Add default values to `config/core/defaults.js`
2. Override values in environment-specific files as needed
3. Update validation schema in `config/index.js` if adding new required fields
4. Document the new configuration section in this README

## Environment Variables

Environment variables are stored in `.env` files:

- `.env.development`
- `.env.test`
- `.env.production`

Environment variables should always have sensible defaults in `.env.example`.

## Best Practices

1. **Access through the main entrypoint**: Always import from `@/config` rather than directly from the config files
2. **Keep secrets in environment variables**: Never hardcode secrets in configuration files
3. **Validate before deployment**: Run `npm run validate:config` before deployment
4. **Document changes**: Update this README when making significant changes to the configuration system 
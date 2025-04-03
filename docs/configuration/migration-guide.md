# Configuration Migration Guide

This guide provides step-by-step instructions for migrating existing configuration to the new centralized configuration system.

## Migration Process Overview

1. **Inventory**: Identify and catalog all existing configuration
2. **Migration**: Move configuration to the appropriate location
3. **Verification**: Ensure functionality is maintained
4. **Cleanup**: Remove deprecated configuration files

## Step 1: Identify Current Configuration

Before migrating, identify all existing configuration sources:

- Environment variables in `.env` files
- Configuration in `next.config.js`
- Constants in `src/constants/`
- Configuration objects in various files
- Feature flags
- API settings

Use the toolkit to help identify configuration sources:

```bash
npm run toolkit config scan
```

## Step 2: Categorize Configuration

Categorize your configuration into these types:

1. **Core Constants**: Application-wide, environment-independent values
2. **Environment-specific Settings**: Values that change between environments
3. **Platform-specific Configuration**: Settings for specific platforms (e.g., Next.js)
4. **Feature Flags**: Toggles for enabling/disabling features
5. **API Configuration**: Settings for APIs and external services
6. **Security Configuration**: Authentication, authorization, and security settings

## Step 3: Migrate Configuration

### 3.1 Core Constants

Move application-wide constants to `config/core/constants.js`:

```javascript
// Before - scattered in different files
// src/constants/app.js
export const APP_NAME = 'My Application';
export const APP_VERSION = '1.0.0';

// After - consolidated in config/core/constants.js
export const appName = 'My Application';
export const appVersion = '1.0.0';
```

### 3.2 Default Values

Add default configuration values to `config/core/defaults.js`:

```javascript
// Before - default values scattered or implicit
// src/api/client.js
const API_TIMEOUT = 5000;

// After - centralized in config/core/defaults.js
export const api = {
  timeout: 5000,
  retries: 3,
};
```

### 3.3 Environment Configuration

Move environment-specific configuration to the appropriate environment file:

```javascript
// Before - often using inline environment variables
// src/utils/database.js
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
};

// After - using environment files
// config/environment/development.js
export const database = {
  host: 'localhost',
  port: 5432,
};

// config/environment/production.js
export const database = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
};
```

### 3.4 Platform-specific Configuration

Move platform-specific configuration to the appropriate platform module:

```javascript
// Before - in next.config.js
module.exports = {
  images: {
    domains: ['example.com'],
  },
};

// After - in config/platform/next/module/images.js
export default {
  images: {
    domains: ['example.com'],
  },
};
```

### 3.5 Component Configuration

For components with configuration:

```javascript
// Before - often inside component files
// src/components/DataTable/index.tsx
const DEFAULT_PAGE_SIZE = 10;

// After - in config/core/components.js
export const dataTable = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
};
```

## Step 4: Update Imports

Update your code to import from the new configuration system:

```javascript
// Before
import { API_TIMEOUT } from 'src/constants/api';

// After
import { api } from '@/config';
// Use api.timeout instead of API_TIMEOUT
```

## Step 5: Validate Configuration

Run the configuration validation to ensure everything is correct:

```bash
npm run validate:config
```

Verify that your application behaves as expected with the new configuration.

## Step 6: Clean Up

Remove deprecated configuration files and references:

```bash
npm run toolkit cleanup config-old
```

## Example Migration

### Example 1: API Client Configuration

**Before:**

```javascript
// src/api/client.js
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';
const API_VERSION = process.env.API_VERSION || 'v1';
const API_TIMEOUT = 5000;

export default {
  baseUrl: `${API_BASE_URL}/${API_VERSION}`,
  timeout: API_TIMEOUT,
};
```

**After:**

```javascript
// config/core/defaults.js
export const api = {
  baseUrl: 'https://api.example.com',
  version: 'v1',
  timeout: 5000,
};

// config/environment/production.js
export const api = {
  baseUrl: process.env.API_BASE_URL,
  version: process.env.API_VERSION,
};

// src/api/client.js
import { api } from '@/config';

export default {
  baseUrl: `${api.baseUrl}/${api.version}`,
  timeout: api.timeout,
};
```

### Example 2: Feature Flags

**Before:**

```javascript
// src/features/index.js
export const FEATURES = {
  analytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
  darkMode: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE === 'true',
};
```

**After:**

```javascript
// config/core/defaults.js
export const features = {
  analytics: false,
  darkMode: true,
};

// config/environment/development.js
export const features = {
  analytics: true,
};

// config/environment/production.js
export const features = {
  analytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
  darkMode: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE === 'true',
};
```

## Troubleshooting

### Missing Configuration

If parts of your application stop working after migration, check for:

1. **Missing configuration**: Ensure all config values were migrated
2. **Different naming**: Check if names changed during migration
3. **Import path issues**: Verify imports point to `@/config`

### Type Issues

If you encounter TypeScript errors:

1. Ensure ESM imports/exports are used consistently
2. Use named exports properly
3. Update types if configuration structure changed

## Best Practices

1. **Migration in phases**: Migrate one configuration category at a time
2. **Test thoroughly**: Test each phase before proceeding
3. **Use sensible defaults**: Ensure default values make sense for development
4. **Document changes**: Update documentation when you migrate
5. **Add validation**: Validate all new configuration sections 
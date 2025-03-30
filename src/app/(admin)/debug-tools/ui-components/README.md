# UI Component Debug Tools

## Overview

This directory contains tools for debugging and exploring UI components in the application.

The component discovery system has been simplified to ensure components are visible in debug tools during local development.

## Simplified Implementation

The current implementation has been streamlined for local development:

1. **Static Registry**: Components are discovered through a static registry file generated at development server startup.
2. **No Enterprise Features**: Enterprise features like webhooks, real-time file system watching, Git integration, and WebSocket notifications have been temporarily disabled.
3. **Simple API**: The API endpoint has been simplified to serve the static registry file with a fallback to hardcoded data.
4. **Streamlined Registry Manager**: The ComponentRegistryManager has been simplified to focus only on loading from the static registry file.

## How It Works

1. When the development server starts, a script runs to scan UI component directories:
   - `/src/components/ui/atoms`
   - `/src/components/ui/molecules`
   - `/src/components/ui/organisms`
   - `/public/icons`

2. The script generates a static registry file at `/public/static/component-registry.json`.

3. The Component Registry API serves this static file to the UI.

4. The ComponentRegistryManager loads the static registry file and makes components available to the UI.

## Directory Structure

- `api/`: API utilities for accessing component data
- `components/`: UI components specific to the debug tools
- `db/`: Data structures and types
- `discovery/`: Component discovery utilities
- `registry/`: Component registry management
- `features/`: Feature-specific implementations
- `utils/`: Utility functions

## Manually Refreshing the Registry

If you add or modify UI components and need to refresh the registry:

1. Run the generator script:
   ```
   node scripts/generate-ui-registry.js
   ```

2. Alternatively, restart the development server:
   ```
   npm run dev
   ```

## Re-enabling Enterprise Features

To restore enterprise features (advanced GitHub webhook integration, real-time file watching, etc.):

1. This will be documented in a future update once the local implementation is stable.

## Debug URL

The UI Component Debug Tools can be accessed at:
```
http://localhost:3000/debug-tools/ui-components
``` 
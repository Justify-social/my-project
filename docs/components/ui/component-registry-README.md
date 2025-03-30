# UI Component Registry

## Overview

The UI Component Registry is a system that automates the discovery, registration, and access to UI components across all environments. It provides a unified interface for component metadata, enabling the UI debug tools to display component information seamlessly.

## Quick Start

### Using the Registry in Your Code

```typescript
import { ComponentRegistryManager } from '../path/to/registry/ComponentRegistryManager';

// Get the singleton instance
const registry = ComponentRegistryManager.getInstance();

// Initialize the registry (loads components from appropriate source)
await registry.initialize();

// Get all components
const allComponents = registry.getAllComponents();

// Get components by category
const atomComponents = registry.getComponentsByCategory('atom');

// Find a specific component
const button = registry.getComponentByName('Button');
```

### Listening for Registry Changes

```typescript
// Add a listener to be notified when registry changes
const handleRegistryUpdate = () => {
  const components = registry.getAllComponents();
  console.log(`Registry updated: ${components.length} components available`);
};

registry.addListener(handleRegistryUpdate);

// Don't forget to clean up
// registry.removeListener(handleRegistryUpdate);
```

## Architecture

The registry uses a layered approach with multiple data sources:

1. **Static Registry**: Pre-generated file for production use
2. **Development Scanner**: In-memory component scanning for development
3. **API Endpoint**: Unified HTTP endpoint that works in all environments

The system automatically selects the appropriate data source based on the current environment.

## Key Files

- `src/app/(admin)/debug-tools/ui-components/registry/ComponentRegistryManager.ts`: Central registry manager
- `src/app/(admin)/debug-tools/ui-components/api/development-registry.ts`: Development scanner
- `src/app/api/component-registry/route.ts`: API endpoint implementation
- `public/static/component-registry.json`: Static registry file for production

## Development Notes

### Adding a New Component

Components are automatically discovered if they:

1. Are in one of the component directories
2. Have a named or default export
3. Follow standard React component naming (PascalCase)

For best results, add JSDoc comments above your component:

```tsx
/**
 * Button component
 *
 * A customizable button with various styles and sizes.
 */
export const Button = ({ variant = 'primary', size = 'medium', ...props }) => {
  // Component implementation
};
```

### Understanding Environment-Specific Behavior

- **Production**: Uses the static registry file generated at build time
- **Development (Server)**: Uses in-memory component scanning
- **Development (Browser)**: Uses the API endpoint to fetch from server

## Troubleshooting

### Components Not Appearing

1. Verify the component follows naming conventions (PascalCase)
2. Check if the component is in one of the scanned directories
3. Make sure the component is properly exported (named or default export)
4. Check browser console for any errors during registry initialization

### API Endpoint Issues

If the API endpoint is not working:

1. Verify the route is correctly registered in Next.js
2. Check server logs for scanning errors
3. Ensure the static registry file exists in production

## Documentation

For more detailed information about the implementation, see:

- [Component Registry Implementation](./component-registry-implementation.md)
- [Component Registry API](./component-registry-api.md)

## Contributing

When working with the registry code:

1. Maintain the singleton pattern for `ComponentRegistryManager`
2. Preserve environment detection logic
3. Add appropriate error handling for new features
4. Update documentation when making significant changes

## Performance Considerations

The registry is designed to be efficient:

- Uses caching strategies appropriate for each environment
- Employs lazy loading of component data
- Minimizes redundant operations
- Uses the singleton pattern to prevent multiple instances 
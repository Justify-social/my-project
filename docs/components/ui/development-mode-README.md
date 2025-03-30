# UI Component Debug Tools - Development Mode

## Overview

This document details the implementation for enabling UI component discovery in development mode for the Component Debug Tools. The implementation addresses a key issue where components weren't visible in debug tools during local development.

## Problem

The original implementation relied on the `ComponentRegistryPlugin` to generate a static component registry during the build process. However, this plugin only runs in production builds, resulting in no components being visible when running in development mode.

## Solution

We've implemented a parallel development-only component discovery system that:

1. Scans the filesystem for UI components in real-time
2. Watches for component file changes to keep the registry updated
3. Provides the same API interface as the production build

## Implementation Details

### Key Files

- `src/app/(admin)/debug-tools/ui-components/api/development-registry.ts` - Component scanning in development
- `src/app/(admin)/debug-tools/ui-components/api/dev-registry-watcher.ts` - File watcher for real-time updates
- `src/app/api/component-registry/route.ts` - API endpoint with environment-specific behavior

### Development Registry Generator

The development registry generator scans the filesystem for UI components and extracts metadata using AST parsing, mirroring the behavior of the webpack plugin:

```typescript
async function scanComponentsInMemory(): Promise<ComponentMetadata[]> {
  // Find all component files
  const componentFiles = await findComponentFiles();
  
  // Process each file to extract component metadata
  const components: ComponentMetadata[] = [];
  
  for (const file of componentFiles) {
    const metadata = extractComponentMetadata(file);
    if (metadata) {
      components.push(...metadata);
    }
  }
  
  return components;
}
```

### Development Registry Watcher

The watcher uses `chokidar` to monitor component files and automatically refreshes the registry when changes occur:

```typescript
watcher = chokidar.watch(watchPatterns, {
  ignored: EXCLUDE_PATTERNS,
  persistent: true,
  ignoreInitial: false,
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 100
  }
});

watcher
  .on('add', handleFileChange)
  .on('change', handleFileChange)
  .on('unlink', handleFileChange);
```

### API Endpoint

The API endpoint now serves different data based on the environment:

```typescript
// In development mode, use the registry watcher or generate on demand
if (isDev) {
  // First try to get data from watcher
  const watcherCache = getRegistryCache();
  if (watcherCache) {
    return NextResponse.json({
      success: true,
      data: watcherCache,
      source: 'dev-watcher',
    });
  }
  
  // Generate a fresh development registry if needed
  const devRegistry = await generateDevRegistry();
  // ...
}
```

## Performance Considerations

- **Caching**: The development registry is cached to prevent excessive filesystem scanning
- **Debouncing**: File change events are debounced to prevent multiple consecutive scans
- **Selective Scanning**: Only processes files that match specific patterns and extensions

## Usage

No changes are required in the UI Components Debug Tools - they will automatically work in both development and production environments.

## Benefits

- **Consistent Interface**: The same API works in both development and production
- **Real-time Updates**: Component changes are reflected immediately in development
- **Zero Configuration**: Works automatically without additional setup

## Future Improvements

- Add metrics collection for scanning performance
- Implement more sophisticated caching strategies
- Add support for custom component paths through configuration 
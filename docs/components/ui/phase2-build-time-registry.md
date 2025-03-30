# UI Component Autoloading: Phase 2 - Build-Time Registry

This document outlines the technical specifications and implementation plan for Phase 2 of the UI Component Autoloading project, which focuses on generating a build-time component registry.

## Overview

Phase 2 builds upon the initial autoloading implementation by moving from mock data to an actual, build-time generated registry of UI components. This approach provides several key benefits:

1. **Zero-delay component availability** in all environments (browser and server)
2. **Real component metadata** instead of static mock data
3. **Consistent component information** across environments
4. **Reduced runtime overhead** by pre-computing component metadata

## Technical Implementation

### 1. Webpack Plugin Development

We've created a skeleton webpack plugin at `/scripts/plugins/ComponentRegistryPlugin.js` that will:

- Scan the codebase for UI components during the build process
- Extract component metadata (exports, props, JSDoc comments)
- Generate a JSON file containing the complete component registry

This plugin will be integrated into the Next.js build pipeline to ensure the registry is updated with each build.

### 2. API Layer

We've prepared an API endpoint at `/api/component-registry` that:

- Serves the pre-generated registry in production
- Can optionally perform live scanning in development
- Provides a consistent interface for accessing component data

### 3. ComponentApi Adaptation

The final step will be to modify the existing `ComponentApi` class to:

- First check for the static registry data
- Fall back to runtime discovery when appropriate
- Maintain compatibility with existing code

## Implementation Tasks

1. **Complete the Webpack Plugin**
   - Implement component file scanning using glob patterns
   - Add parsing of TypeScript/React components using Babel
   - Extract component metadata
   - Generate structured JSON output

2. **Build Configuration**
   - Integrate the plugin into the Next.js build configuration
   - Ensure proper execution during build process
   - Verify registry generation in different environments

3. **API Layer Enhancements**
   - Finalize the component registry API endpoint
   - Add caching for improved performance
   - Implement versioning for invalidation

4. **ComponentApi Refactoring**
   - Modify the UI Components Bridge to load from the registry API
   - Update the initial loading mechanism in `page.tsx`
   - Preserve manual discovery capability for testing

## Dependencies

This implementation requires:

- `@babel/parser` and `@babel/traverse` for AST parsing
- `glob` for file pattern matching
- Next.js webpack configuration access

## Testing Criteria

The implementation should be validated against these criteria:

1. Component registry JSON should be generated during build
2. Registry should include all UI components and their metadata
3. Components should load instantly on page load in all environments
4. Manual discovery should still function for development testing
5. Performance impact on build time should be minimal (<5% increase)

## Timeline

| Task | Estimated Duration |
|------|-------------------|
| Webpack Plugin Development | 3 days |
| Build Configuration | 1 day |
| API Layer Enhancements | 2 days |
| ComponentApi Refactoring | 2 days |
| Testing & Validation | 2 days |

## Conclusion

Phase 2 will significantly enhance the UI Component Debug Tools by providing a real-time view of all UI components with zero manual intervention. This implementation maintains the existing architecture while introducing substantial improvements to the developer experience through build-time optimizations. 
# Simplified Component Resolution Plan

## Current Issues Identified

We're currently experiencing several console errors:

1. **Webpack Critical Dependency Warnings**:
   ```
   Critical dependency: the request of a dependency is an expression
   ```
   This occurs because webpack cannot statically analyze dynamic imports with expressions.

2. **Component Resolution Failures**:
   ```
   Could not find component Accordion in module. Available exports: Accordion, AccordionContent, AccordionItem, AccordionTrigger
   ```
   Component resolution is failing due to mismatches between expected exports and actual module structure.

## Root Causes

1. **Dynamic Import Expressions**: Using expressions like `import(path)` prevents webpack from analyzing dependencies at build time, leading to critical warnings and optimization issues.

2. **Complex Resolution Logic**: Our current approach has too many layers of indirection and fallbacks, making it difficult to debug and maintain.

3. **Export Pattern Mismatches**: Components may export differently (default vs named exports) causing resolution failures.

## Simplified Solution Approach

We'll implement a more streamlined approach that maintains the Single Source of Truth while fixing the critical dependency warnings:

### 1. Centralized Component Mapping

```javascript
export const COMPONENT_IMPORTS = {
  // Flat paths mapped directly to static imports
  'accordion': () => import('@/components/ui/atoms/accordion/Accordion'),
  'button': () => import('@/components/ui/atoms/button/Button'),
  'card': () => import('@/components/ui/organisms/card/Card'),
  // Additional components...
};
```

### 2. Simplified Path Resolution

```javascript
export function normalizeComponentPath(path) {
  // Extract component name from path
  const segments = path
    .replace('@/components/ui/', '')
    .replace(/\/$/, '')
    .split('/');
  
  // Use last segment (the component name) for lookup
  return segments[segments.length - 1].toLowerCase();
}
```

### 3. Robust Import Function

```javascript
export function safeDynamicImport(importPath, componentName) {
  // Normalize path for lookup
  const normalizedPath = normalizeComponentPath(importPath);
  
  // Get import function or use similar path matching
  const importFn = COMPONENT_IMPORTS[normalizedPath] || 
                  findSimilarComponentImport(normalizedPath);
  
  if (!importFn) {
    console.error(`No component mapping found for: ${importPath}`);
    return Promise.resolve(createErrorComponent(`Component not found: ${importPath}`));
  }
  
  // Use the static import function
  return importFn()
    .then(mod => resolveComponentFromModule(mod, componentName))
    .catch(error => {
      console.error(`Error importing ${importPath}:`, error);
      return createErrorComponent(`Failed to load: ${importPath}`);
    });
}
```

### 4. Intelligent Component Resolution

```javascript
export function resolveComponentFromModule(mod, componentName) {
  // Try exact named export first
  if (mod[componentName] && typeof mod[componentName] === 'function') {
    return mod[componentName];
  }
  
  // Try default export
  if (mod.default) {
    // If default is the component
    if (typeof mod.default === 'function') {
      return mod.default;
    }
    
    // If default contains the component
    if (mod.default[componentName]) {
      return mod.default[componentName];
    }
  }
  
  // For accordion-like components that export multiple parts
  const potentialComponentKeys = Object.keys(mod).filter(
    key => key.toLowerCase() === componentName.toLowerCase() ||
           key.toLowerCase().includes(componentName.toLowerCase())
  );
  
  if (potentialComponentKeys.length > 0) {
    return mod[potentialComponentKeys[0]];
  }
  
  // Last resort: return first function export
  const firstFunctionExport = Object.values(mod).find(
    value => typeof value === 'function'
  );
  
  if (firstFunctionExport) {
    return firstFunctionExport;
  }
  
  console.warn(`Could not resolve component from module for: ${componentName}`);
  return createErrorComponent(`Component resolution failed: ${componentName}`);
}
```

### 5. Component Registration System

```javascript
export function registerComponent(key, importFn) {
  if (typeof key !== 'string' || typeof importFn !== 'function') {
    console.error('Invalid component registration parameters');
    return false;
  }
  
  const normalizedKey = key.toLowerCase();
  COMPONENT_IMPORTS[normalizedKey] = importFn;
  return true;
}
```

## Implementation Plan

1. **Create Simplified Import Mapping**:
   - Start with core components only
   - Use direct static imports with explicit paths
   - Organize alphabetically for easy maintenance

2. **Replace Dynamic Expression Imports**:
   - Update `safeDynamicImport` to use the static mapping
   - Remove any `import(path)` expressions with variables

3. **Optimize Component Resolution**:
   - Implement simplified component resolution logic
   - Focus on handling common export patterns
   - Provide clear error components for failures

4. **Add Registration Mechanism**:
   - Enable runtime component registration
   - Support lazy-loading of additional components

## Benefits of This Approach

1. **Eliminates Webpack Warnings**:
   - No more dynamic expressions for webpack to analyze
   - All imports are static functions webpack can optimize

2. **Simplified Debugging**:
   - Clearer error messages
   - More predictable component resolution
   - Easier to trace issues

3. **Maintains Single Source of Truth**:
   - Centralized component registry
   - No duplicate import paths

4. **Improved Performance**:
   - Better code splitting
   - Reduced resolution overhead
   - Proper webpack optimization

5. **Future-Proof**:
   - Easy to add new components
   - Adaptable to changing export patterns
   - Supports project growth

## Verification Steps

After implementation:

1. Check browser console for webpack warnings - they should be gone
2. Verify all components load correctly in the UI Components page
3. Test edge cases with unusual export patterns
4. Confirm build optimization works properly

This solution provides the right balance of simplicity, robustness, and maintainability while addressing the specific webpack and component resolution issues we're experiencing.

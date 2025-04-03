/**
 * Icon Adapters Index
 * 
 * This file exports all icon adapters to simplify imports.
 * This allows the rest of the application to import from a single location.
 */

// Export all adapters
export * from './shadcn-adapter';
export * from './font-awesome-adapter';

// Explicitly export main adapter components
export { ShadcnIcon } from './shadcn-adapter';
export { IconAdapter } from './font-awesome-adapter';

// For backward compatibility
export { IconAdapter as FontAwesomeIcon } from './font-awesome-adapter'; 
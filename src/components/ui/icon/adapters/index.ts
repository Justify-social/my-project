/**
 * Icon Adapters Index
 *
 * This file exports all icon adapters to simplify imports.
 * CANONICAL adapters are indicated below.
 */

// Export explicit adapters - CANONICAL versions
export { ShadcnIcon } from './shadcn-adapter'; // CANONICAL shadcn adapter
export { IconAdapter } from './font-awesome-adapter'; // CANONICAL font-awesome adapter

// Re-export types from canonical sources
export type { ShadcnIconProps } from './shadcn-adapter';

// Legacy/deprecated exports (for backward compatibility)
/**
 * @deprecated Use ShadcnIcon from './shadcn-adapter' instead
 */
export * from './shadcn-adapter';

/**
 * @deprecated Use IconAdapter or ShadcnIcon directly
 */
export { IconAdapter as FontAwesomeIcon } from './font-awesome-adapter';

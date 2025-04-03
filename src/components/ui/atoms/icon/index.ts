/**
 * Icon Module - Single Source of Truth for Icon Components
 * 
 * This file consolidates all icon-related exports into a single entry point,
 * making it easier to import and use icons throughout the application.
 * 
 * The entire icon system follows the Single Source of Truth principle:
 * - icon-registry.json is the canonical source for all icon data
 * - Font Awesome Pro conventions are followed (fa-light default, fa-solid on hover)
 * - One universal Icon component handles all icon types
 */

/**
 * Icon Component Barrel File
 * Provides a centralized export point for the Icon component
 */

// Export the main Icon component
export { Icon } from './Icon';

// Export icon utility functions
export * from './icons';
export * from './IconUtils';

// Export icon types
export * from './types';

// Export all adapters
export * from './adapters';

// Export component interfaces and types directly - more reliable than re-exports
export type {
  IconName,
  IconSize,
  IconStyle,
  PlatformName,
  ActionType,
  IconType,
  IconVariant,
  IconProps,
  PlatformIconProps,
  SafeIconProps,
  IconMetadata,
  IconRegistryData,
  IconUrlMapData
} from './types';

// Export constants directly
export {
  SIZE_CLASSES,
  PLATFORM_ICON_TYPE_MAP
} from './types';

// Re-export the main Icon component and its variants
export { SolidIcon, LightIcon } from './Icon';

// Re-export the IconContext provider and hook
export { 
  default as IconContext,
  IconContextProvider, 
  useIconContext 
} from './IconContext';

// No default export - use named exports exclusively

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

// Export the main Icon components
export { Icon, SolidIcon, LightIcon } from './Icon';

// Export the necessary types
export type { IconProps, IconSize } from './types';

// Export the path utility function (needed for custom implementations)
export { getIconPath } from './icons';

// Export the adapter for backwards compatibility
export { IconAdapter } from './adapters/font-awesome-adapter';

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
  IconStyle,
  PlatformName,
  ActionType,
  IconType,
  IconVariant,
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

// Re-export the IconContext provider and hook
export { 
  default as IconContext,
  IconContextProvider, 
  useIconContext 
} from './IconContext';

// Semantic mapping - Single Source of Truth
export { UI_ICON_MAP, getSolidUIIcon } from './semantic-map';
export { default as UI_ICON_MAP_DEFAULT } from './semantic-map';

// No default export - use named exports exclusively

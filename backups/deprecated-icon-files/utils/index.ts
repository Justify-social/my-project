/**
 * Icon Utilities
 * 
 * Export utility functions for the icon system
 */

// Export validation functions
export { validateDynamicName } from './validation';

// Export utility functions from mapping
export {
  getIconBaseName,
  getIconPath,
  getStyleFromPrefix,
  SEMANTIC_TO_FA_MAP
} from '../mapping/icon-mappings';

// Export config utilities
export {
  getIconPrefix,
  shouldUseHoverEffect,
  getActionColor,
  iconConfig
} from './config';

// Re-export the types for convenience
export type { IconStyle, IconSize, IconType, ActionType } from './config'; 
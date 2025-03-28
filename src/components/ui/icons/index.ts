/**
 * Unified Icon System Entry Point
 * 
 * This file exports all icon components, utilities, and types from a single entry point.
 * Importing from this file ensures you get the correct, up-to-date icon components.
 */

// Export all icon components
export {
  SvgIcon,
  PlatformIcon,
  SafeIcon,
  StaticIcon,
  ButtonIcon,
  DeleteIcon,
  WarningIcon,
  SuccessIcon,
  iconComponentFactory
} from './components';

// Set the default export to the main Icon component
import { SvgIcon } from './components';
export const Icon = SvgIcon;
export default Icon;

// Export utility functions
export {
  getIconBaseName,
  getIconPath,
  getIconPrefix,
  getStyleFromPrefix,
  shouldUseHoverEffect,
  getActionColor,
  validateDynamicName,
  SEMANTIC_TO_FA_MAP,
  iconConfig
} from './utils';

// Export types
export type { 
  IconSize, 
  IconName, 
  PlatformName, 
  SvgIconProps, 
  PlatformIconProps,
  IconStyle,
  IconType,
  ActionType
} from './types';

// Export platform maps
export { PLATFORM_ICON_MAP, PLATFORM_COLORS } from './data';

// Export the icon data
export { iconData } from './data';
export type { IconData } from './data';
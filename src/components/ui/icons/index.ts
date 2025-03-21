/**
 * Icon System - Main Export File
 * 
 * This file serves as the public API for the icon system. All components, types,
 * and utilities that should be available to consumers should be exported from here.
 * 
 * By centralizing exports, we create a stable public API that allows us to refactor
 * internal implementations without breaking consumer code.
 */

// Re-export the main Icon component
export { Icon } from './Icon';

// Re-export icon variant components
export {
  StaticIcon,
  ButtonIcon,
  DeleteIcon,
  WarningIcon,
  SuccessIcon
} from './IconVariants';

// Re-export types
export type { IconProps } from './Icon';
export type { 
  IconName,
  KpiIconName,
  AppIconName,
  PlatformIconName
} from './Icon';

// Re-export configuration
export { iconConfig } from './IconConfig';
export { getIconPrefix, shouldUseHoverEffect, getActionColor } from './IconConfig';

// Re-export mappings (only what's needed by consumers)
export { 
  UI_ICON_MAP, 
  UI_OUTLINE_ICON_MAP, 
  PLATFORM_ICON_MAP,
  PLATFORM_COLORS,
  // Also export the URL maps
  KPI_ICON_URLS,
  APP_ICON_URLS
} from './Icon';
export { getIcon } from './IconMapping';

// Re-export utility functions that are part of the public API
export { 
  migrateHeroIcon,
  SafeQuestionMarkIcon,
  iconComponentFactory
} from './IconUtils';

// Re-export IconRegistry and IconMonitoring components
export { IconRegistry } from './IconRegistry';
export { IconMonitoring } from './IconMonitoring';

/**
 * USAGE EXAMPLES:
 * 
 * // Basic icon
 * import { Icon } from '@/components/ui/icons';
 * <Icon name="user" />
 * 
 * // Icon variants
 * import { StaticIcon, ButtonIcon, DeleteIcon } from '@/components/ui/icons';
 * <StaticIcon name="info" />
 * <ButtonIcon name="edit" />
 * <DeleteIcon name="trash" />
 * 
 * // Using configuration
 * import { Icon, iconConfig } from '@/components/ui/icons';
 * <Icon name="user" color={iconConfig.colors.success} />
 */ 
/**
 * Unified Icon System Entry Point
 * 
 * All icon imports should come from here - nowhere else.
 * This provides a single source of truth for the icon system.
 */

// Component exports
export { Icon, SolidIcon, LightIcon } from './Icon';
export { IconProvider, useIconContext } from './IconContext';

// Type exports
export type { 
  IconProps, 
  IconSize, 
  IconStyle,
  IconName,
  PlatformName
} from './types';
export { SIZE_CLASSES } from './types';

// Utility exports
export { 
  normalizeIconName,
  getIconPath,
  iconExists,
  getIconBaseName,
  toKebabCase,
  SEMANTIC_ICONS,
  PLATFORM_ICON_MAP
} from './icons';

// Default export for convenience
export { Icon as default } from './Icon';
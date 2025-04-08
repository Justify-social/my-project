/**
 * Icon Component Barrel File - CANONICAL VERSION
 * SSOT for all icon-related component exports
 * 
 * ⚠️ IMPORTANT: For app icons to work correctly, always import the Icon component 
 * directly from '@/components/ui/icon/icon' rather than from this barrel file.
 * This ensures proper handling of app-specific icons and variant suffixes.
 * 
 * @example
 * // ✅ Correct way to import
 * import { Icon } from '@/components/ui/icon/icon';
 * 
 * // ❌ Avoid this import pattern
 * // import { Icon } from '@/components/ui/icon';
 */

// Core Icon Components
// --------------------
// While these components are exported here, it's recommended to import them
// directly from their source files to avoid any potential barrel file issues
export {
  Icon,
  SolidIcon,
  LightIcon
} from './icon';
/* // Removed export for deleted file
export {
  HoverIcon
} from './hover-icon';
*/

// Icon Context
// -----------
/* // Removed export for deleted file
export {
  default as IconContext,
  IconContextProvider,
  useIconContext
} from './icon-context';
*/

// Icon Registry & Data
// -------------------
/* // Removed export from non-existent file
export {
  iconRegistry,
  consolidateRegistries
} from './icon-registry-loader';
*/

// Icon Utility Functions
// ---------------------
export {
  // Icon lookup & path resolution
  findIconById,
  getIconPath,
  iconExists,
} from './icons';
export {
  // Variant management
  getLightVariant,
  getSolidVariant,
  ensureIconVariant,
  createIcon,
  createIconWithId,
  getBaseIconName,
  isLightVariant,
  isSolidVariant
} from './icon-utils';

// Types & Constants
// ----------------
export {
  // Basic icon types
  type IconName,
  type IconSize,
  type IconStyle,
  type PlatformName,
  type ActionType,
  type IconType,
  type IconVariant,

  // Constants
  SIZE_CLASSES,
  PLATFORM_ICON_TYPE_MAP,

  // Component props interfaces
  type IconProps,
  type PlatformIconProps,
  type SafeIconProps,

  // Registry data interfaces
  type IconMetadata,
  type IconRegistryData,
  type IconUrlMapData
} from './icon-types';

// Official Adapters
// ----------------
// Import these adapters for specific UI libraries
export {
  ShadcnIcon
} from './adapters/shadcn-adapter';
export {
  IconAdapter
} from './adapters/font-awesome-adapter';

// Legacy/Deprecated Exports (for backward compatibility)
// ---------------------------------------------------
/**
 * @deprecated Use ShadcnIcon instead
 */
export { IconAdapter as FontAwesomeIcon } from './adapters/font-awesome-adapter';

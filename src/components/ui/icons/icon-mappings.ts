/**
 * Icon name mappings for consistent naming across the application
 */

/**
 * Maps semantic icon names (used in the app) to their FontAwesome equivalents
 */
export const SEMANTIC_TO_FA_MAP: Record<string, string> = {
  // Core icon mappings
  'close': 'faXmark',
  'dollar': 'faDollarSign',
  'edit': 'faPenToSquare',
  'history': 'faClockRotateLeft',
  'home': 'faHouse',
  'search': 'faMagnifyingGlass',
  'user-circle': 'faCircleUser',
  'warning': 'faTriangleExclamation',
  
  // Additional mappings for consistency
  'add': 'faPlus',
  'delete': 'faTrashCan',
  'settings': 'faGear',
  'check': 'faCheck',
  'error': 'faCircleXmark',
  'info': 'faCircleInfo',
  'success': 'faCircleCheck',
  'help': 'faCircleQuestion',
  'profile': 'faUser',
  'notification': 'faBell',
  'calendar': 'faCalendar',
  'upload': 'faUpload',
  'download': 'faDownload',
  'save': 'faSave',
  'share': 'faShare',
  'menu': 'faBars',
  'logout': 'faRightFromBracket',
  'login': 'faRightToBracket',
};

/**
 * Maps FontAwesome icon names to their SVG file base names
 * Used for direct SVG references
 */
export const FA_TO_SVG_MAP: Record<string, string> = {
  // Special mappings
  'faClose': 'xmark',
  'faDelete': 'trash-can',
  'faEdit': 'pen-to-square',
  'faHistory': 'clock-rotate-left',
  'faHome': 'house',
  'faSearch': 'magnifying-glass',
  'faUserCircle': 'circle-user',
  'faWarning': 'triangle-exclamation',
  'faDollar': 'dollar-sign',
  
  // General pattern: convert camelCase to kebab-case
  // e.g., faCircleUser -> circle-user
  // These will be handled by the getIconBaseName function
};

/**
 * Converts a FontAwesome icon name to its base SVG file name
 * e.g., faCircleUser -> circle-user
 */
export function getIconBaseName(iconName: string): string {
  // Check if we have a special mapping for this icon
  if (iconName in FA_TO_SVG_MAP) {
    return FA_TO_SVG_MAP[iconName];
  }
  
  // Remove the 'fa' prefix
  let baseName = iconName.startsWith('fa') ? iconName.substring(2) : iconName;
  
  // Convert from camelCase to kebab-case
  // e.g. CircleUser -> circle-user
  return baseName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Gets the SVG path for an icon in a specified style
 */
export function getIconPath(iconName: string, style: 'light' | 'solid' | 'regular' | 'brands' = 'light'): string {
  // Convert semantic names to FontAwesome names if needed
  const faName = SEMANTIC_TO_FA_MAP[iconName] || iconName;
  
  // Get the base name for the SVG file
  const baseName = getIconBaseName(faName);
  
  // Return the full path to the SVG
  return `/ui-icons/${style}/${baseName}.svg`;
} 
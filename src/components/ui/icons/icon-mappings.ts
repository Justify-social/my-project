/**
 * Icon name mappings for consistent naming across the application
 */
import { getReliableIconPath, getEnhancedIconBaseName } from './fix-icon-mappings';

/**
 * Maps semantic icon names (used in the app) to their FontAwesome equivalents
 */
export const SEMANTIC_TO_FA_MAP: Record<string, string> = {
  // Core icon mappings - REMOVED missing icons that already have direct FA mappings
  
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
  // Special mappings - REMOVED entries for missing icons
  
  // General pattern: convert camelCase to kebab-case
  // e.g., faCircleUser -> circle-user
  // These will be handled by the getIconBaseName function
};

/**
 * Converts a FontAwesome icon name to its base SVG file name
 * e.g., faCircleUser -> circle-user
 */
export function getIconBaseName(iconName: string): string {
  // Enhanced version with better error handling and special cases
  return getEnhancedIconBaseName(iconName);
}

/**
 * Gets the SVG path for an icon in a specified style
 */
export function getIconPath(iconName: string, style: 'light' | 'solid' | 'regular' | 'brands' = 'light'): string {
  // Try the reliable path first
  const reliablePath = getReliableIconPath(iconName, style);
  if (reliablePath) return reliablePath;
  
  // Fall back to original logic if needed
  const faName = SEMANTIC_TO_FA_MAP[iconName] || iconName;
  const baseName = getIconBaseName(faName);
  
  return `/ui-icons/${style}/${baseName}.svg`;
} 
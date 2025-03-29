/**
 * Consolidated Icon Utilities
 * Replaces multiple overlapping files with a single source of truth
 */

import { IconStyle } from './types';
import registry from './registry.json';

// Type-safe mapping from semantic names to technical names
export const SEMANTIC_ICONS = {
  add: 'faPlus',
  delete: 'faTrash',
  edit: 'faPen',
  save: 'faSave',
  close: 'faXmark',
  check: 'faCheck',
  info: 'faInfo',
  warning: 'faTriangleExclamation',
  error: 'faCircleXmark',
  success: 'faCircleCheck',
  user: 'faUser',
  settings: 'faGear',
  search: 'faMagnifyingGlass',
  calendar: 'faCalendar',
  chevronRight: 'faChevronRight',
  chevronLeft: 'faChevronLeft',
  chevronUp: 'faChevronUp',
  chevronDown: 'faChevronDown',
  arrowRight: 'faArrowRight',
  arrowLeft: 'faArrowLeft',
  arrowUp: 'faArrowUp',
  arrowDown: 'faArrowDown',
  home: 'faHome',
  menu: 'faBars',
  bell: 'faBell',
  upload: 'faUpload',
  download: 'faDownload',
  copy: 'faCopy',
  more: 'faEllipsisVertical',
  link: 'faLink',
  play: 'faPlay',
  pause: 'faPause',
  stop: 'faStop',
} as const;

// Map of icon styles to directory names
const STYLE_FOLDERS: Record<IconStyle, string> = {
  'solid': 'solid',
  'light': 'light',
  'regular': 'regular',
  'brand': 'brands'
};

// Platform icon map for social media icons
export const PLATFORM_ICON_MAP = {
  'facebook': 'faFacebook',
  'instagram': 'faInstagram',
  'linkedin': 'faLinkedin',
  'tiktok': 'faTiktok',
  'youtube': 'faYoutube',
  'x': 'faXTwitter'
} as const;

/**
 * Normalize icon names to handle various formats
 */
export function normalizeIconName(name: string): string {
  if (!name) return 'faQuestion';
  
  // Handle semantic names like 'add' -> 'faPlus'
  if (name in SEMANTIC_ICONS) {
    return SEMANTIC_ICONS[name as keyof typeof SEMANTIC_ICONS];
  }
  
  // Handle platform names like 'facebook' -> 'faFacebook'
  if (name in PLATFORM_ICON_MAP) {
    return PLATFORM_ICON_MAP[name as keyof typeof PLATFORM_ICON_MAP];
  }
  
  // Add 'fa' prefix if missing
  if (!name.startsWith('fa')) {
    return `fa${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  }
  
  return name;
}

/**
 * Get icon path with proper error handling
 */
export function getIconPath(name: string, variant: IconStyle = 'light'): string {
  try {
    const normalizedName = normalizeIconName(name);
    const folderName = STYLE_FOLDERS[variant] || 'light';
    
    // Check if icon exists in registry
    const iconEntry = (registry as Record<string, any>)[normalizedName];
    
    if (iconEntry) {
      // Use the specific path for the variant if available
      const variantPath = `/icons/${folderName}/${iconEntry.name}.svg`;
      return variantPath;
    }
    
    // Return fallback if icon not found
    console.warn(`Icon not found: ${normalizedName}. Using fallback.`);
    return '/icons/light/question.svg';
  } catch (error) {
    // Error boundary for path generation
    console.error(`Failed to generate path for icon ${name}`, error);
    return '/icons/light/question.svg';
  }
}

/**
 * Check if an icon exists in the registry
 */
export function iconExists(name: string): boolean {
  try {
    const normalizedName = normalizeIconName(name);
    return Boolean((registry as Record<string, any>)[normalizedName]);
  } catch {
    return false;
  }
}

/**
 * Extract base name from full icon name (e.g., 'faUser' -> 'user')
 */
export function getIconBaseName(name: string): string {
  if (!name) return '';
  
  // Strip the 'fa' prefix if present
  return name.startsWith('fa') 
    ? name.slice(2).charAt(0).toLowerCase() + name.slice(3)
    : name;
}

/**
 * Generate a unique cache key for an icon
 */
export function getIconCacheKey(name: string, variant: IconStyle = 'light'): string {
  return `icon-${normalizeIconName(name)}-${variant}`;
}

/**
 * Convert camelCase to kebab-case
 */
export function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

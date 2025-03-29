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
  coins: 'faCoins',
  upload: 'faUpload',
  download: 'faDownload',
  copy: 'faCopy',
  more: 'faEllipsisVertical',
  link: 'faLink',
  play: 'faPlay',
  pause: 'faPause',
  stop: 'faStop',
  cog: 'faGear',
  times: 'faXmark',
  xmark: 'faXmark',
  xCircle: 'faCircleXmark',
  anglesLeft: 'faAnglesLeft',
  anglesRight: 'faAnglesRight',
  github: 'faGithub',
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

// App-specific icons that should use the app directory
const APP_ICONS = [
  'creative-asset-testing',
  'brand-health',
  'brand-lift',
  'campaigns',
  'help',
  'home',
  'influencers',
  'mmm',
  'reports',
  'settings',
  'billing'
];

// Standard FontAwesome icons that shouldn't be in the app directory
const STANDARD_ICONS = [
  'profile-image',
  'magnifying-glass',
  'coins'
];

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
  
  // App icon special handling - normalize app prefixed icons
  if (name.startsWith('app') || name.includes('app_') || name.includes('app-')) {
    // Strip any non-alphanumeric characters and standardize casing
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
    
    // Special case for MMM which should be appMMM not appMmm
    if (cleanName.toLowerCase() === 'appmmm') {
      return 'appMMM';
    }
    
    // Convert to proper camelCase with app prefix
    // First letter after 'app' should be uppercase
    if (cleanName.toLowerCase().startsWith('app')) {
      const appPrefix = 'app';
      const restOfName = cleanName.slice(3); // Remove 'app'
      
      if (restOfName.length > 0) {
        return appPrefix + restOfName.charAt(0).toUpperCase() + restOfName.slice(1);
      }
    }
  }
  
  // Convert hyphenated icon names (fa-xmark) to camelCase (faXmark)
  if (name.includes('-')) {
    // Extract prefix and icon name parts
    const parts = name.split('-');
    const prefix = parts[0];
    
    // Convert remaining parts to camelCase
    const iconName = parts.slice(1).map((part, index) => 
      index > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
    ).join('');
    
    // Combine prefix with capitalized icon name
    return prefix + iconName.charAt(0).toUpperCase() + iconName.slice(1);
  }
  
  // Handle app icons with underscores (convert to camelCase if needed)
  if (name.includes('_')) {
    return name.replace(/_([a-z])/gi, (_, char) => char.toUpperCase());
  }
  
  // Add 'fa' prefix if missing and not app/kpis prefixed
  if (!name.startsWith('fa') && !name.startsWith('app') && !name.startsWith('kpis')) {
    return `fa${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  }
  
  return name;
}

/**
 * Get icon path with proper error handling
 */
export function getIconPath(name: string, variant: IconStyle = 'light'): string {
  try {
    // First normalize the icon name
    const normalizedName = normalizeIconName(name);
    
    // Debug log to help diagnose issues
    console.debug(`Getting icon path for: ${name} -> normalized to: ${normalizedName}`);
    
    // Special case for MMM which might be normalized differently
    if (normalizedName.toLowerCase() === 'appmmm' || name.toLowerCase() === 'appmmm') {
      return '/icons/app/mmm.svg';
    }
    
    // Special case for CreativeAssetTesting 
    if (name.toLowerCase().includes('creativeasset') || normalizedName.toLowerCase().includes('creativeasset')) {
      return '/icons/app/creative-asset-testing.svg';
    }
    
    // Special case for profile-image - prioritize app directory, then fall back to light/solid
    if (name.toLowerCase().includes('profile-image') || normalizedName.toLowerCase().includes('profileimage')) {
      // For profile-image, use avatar icon (user-circle) from the appropriate directory
      const folderName = STYLE_FOLDERS[variant] || 'light';
      return `/icons/${folderName}/user-circle.svg`;
    }
    
    // Check if the icon exists in the registry (preferred method)
    const iconEntry = (registry as Record<string, any>)[normalizedName];
    
    if (iconEntry) {
      console.debug(`Icon found in registry: ${normalizedName}`);
      
      // For FontAwesome icons, apply the requested variant
      if (normalizedName.startsWith('fa')) {
        const folderName = STYLE_FOLDERS[variant] || 'light';
        return `/icons/${folderName}/${iconEntry.name}.svg`;
      }
      
      // For app and kpi icons, use the exact path from registry
      return iconEntry.path;
    } 
    
    console.warn(`Icon not found in registry: ${normalizedName}, using fallback path generation`);
    
    // Fallback logic based on icon naming conventions
    
    // Handle app icons
    if (normalizedName.toLowerCase().startsWith('app')) {
      // Extract the name without the 'app' prefix
      const iconName = normalizedName.slice(3).toLowerCase();
      
      // Check if this is a standard icon that should NOT be in app directory
      if (STANDARD_ICONS.some(stdIcon => iconName.includes(stdIcon.toLowerCase()))) {
        const folderName = STYLE_FOLDERS[variant] || 'light';
        const kebabName = toKebabCase(iconName);
        return `/icons/${folderName}/${kebabName}.svg`;
      }
      
      // Try different name formats (camelCase, kebab-case, snake_case)
      const kebabName = toKebabCase(iconName);
      console.debug(`Attempting fallback app icon: ${kebabName}`);
      return `/icons/app/${kebabName}.svg`;
    }
    
    // Handle Font Awesome icons
    if (normalizedName.startsWith('fa')) {
      const folderName = STYLE_FOLDERS[variant] || 'light';
      const baseName = getIconBaseName(normalizedName);
      const kebabName = toKebabCase(baseName);
      console.debug(`Attempting fallback FA icon: ${kebabName}`);
      return `/icons/${folderName}/${kebabName}.svg`;
    }
    
    // Check if it's a standard icon that should be in light/solid directories
    if (STANDARD_ICONS.some(stdIcon => name.toLowerCase().includes(stdIcon.toLowerCase()))) {
      const folderName = STYLE_FOLDERS[variant] || 'light';
      const kebabName = toKebabCase(name);
      return `/icons/${folderName}/${kebabName}.svg`;
    }
    
    // Last resort - standard Font Awesome light icons
    const kebabName = toKebabCase(name);
    console.debug(`Last resort fallback: ${kebabName}`);
    return `/icons/light/${kebabName}.svg`;
  } catch (error) {
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

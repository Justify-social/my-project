/**
 * Consolidated Icon Utilities
 * Updated to use consolidated registry loader - last updated: 2024-04-03
 * Provides standardized icon path resolution and utility functions
 */

import { IconStyle, IconMetadata, IconRegistryData } from './types';

// IMPORTANT: The icon registry is the single source of truth for icons
import { iconRegistry } from './registry-loader';

// Use registry directly with type safety
const registry = iconRegistry;

// Debug flag
const DEBUG = process.env.NODE_ENV === 'development';

// Helper for debug logging
const debug = (...args: any[]) => {
  if (DEBUG) {
    console.log('[Icons]', ...args);
  }
};

// Map of icon styles to directory names
const STYLE_FOLDERS: Record<IconStyle, string> = {
  'solid': 'solid',
  'light': 'light',
  'regular': 'regular',
  'brand': 'brands'
};

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
  
  // Handle semantic names by looking up in registry
  const semanticMatch = registry.icons.find(icon => icon.semantic === name);
  if (semanticMatch) {
    return semanticMatch.map || 'faQuestion';
  }
  
  // Handle platform names by looking up in registry
  const platformMatch = registry.icons.find(icon => icon.platform === name);
  if (platformMatch) {
    return platformMatch.map || 'faQuestion';
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
 * Find an icon in the registry by its FontAwesome map name
 */
function findIconByMapName(mapName: string): IconMetadata | null {
  if (!registry?.icons || !Array.isArray(registry.icons)) {
    debug('Icon registry is not properly loaded or not an array');
    return null;
  }
  
  const icon = registry.icons.find((item: IconMetadata) => item.map === mapName);
  debug(icon ? `Found icon by map name '${mapName}'` : `Icon '${mapName}' not found by map name`);
  return icon || null;
}

/**
 * Find an icon by its ID in the registry
 * If icon ID not found, tries to add Light/Solid suffix and check again
 * @param id Icon ID to find
 * @returns The icon details or undefined if not found
 */
export function findIconById(id: string): IconMetadata | null {
  if (!registry?.icons || !Array.isArray(registry.icons)) {
    debug('Icon registry is not properly loaded or not an array');
    return null;
  }
  
  // Direct lookup
  let icon = registry.icons.find((item: IconMetadata) => 
    item.id === id || 
    item.id === `${id.toLowerCase()}` || 
    (item as any).kebabId === toKebabCase(id)
  );
  
  // If not found, try with Light/Solid suffixes
  if (!icon && !id.endsWith('Light') && !id.endsWith('Solid')) {
    // Try with Light suffix
    icon = registry.icons.find((item: IconMetadata) => item.id === `${id}Light`);
    
    // If still not found, try with Solid suffix
    if (!icon) {
      icon = registry.icons.find((item: IconMetadata) => item.id === `${id}Solid`);
      
      if (icon) {
        debug(`Found icon with Solid suffix: ${icon.id}`);
      }
    } else {
      debug(`Found icon with Light suffix: ${icon.id}`);
    }
  }
  
  debug(icon ? `Found icon by ID '${id}'` : `Icon '${id}' not found by ID`);
  return icon || null;
}

/**
 * Try to find an icon by its alternatives if the primary name isn't found
 */
function findIconByAlternatives(name: string): IconMetadata | null {
  // Get alternatives from registry
  const alternatives = registry.icons
    .filter(icon => icon.alternatives && Array.isArray(icon.alternatives) && icon.alternatives.includes(name))
    .map(icon => icon.map)
    .filter((mapName): mapName is string => !!mapName); // Filter out null/undefined values
  
  if (alternatives && alternatives.length > 0) {
    for (const alt of alternatives) {
      const iconByMap = findIconByMapName(alt);
      if (iconByMap) return iconByMap;
      
      const iconById = findIconById(alt);
      if (iconById) return iconById;
    }
  }
  return null;
}

/**
 * Generate a standardized FontAwesome icon path for fallback when not in registry
 * 
 * This maintains the design system by using a predictable path based on naming conventions
 */
function generateFontAwesomeIconPath(name: string, variant: IconStyle = 'light'): string {
  // Handle explicit suffixes in the name that should override the variant
  const hasSolidSuffix = name.endsWith('Solid');
  const hasLightSuffix = name.endsWith('Light');
  
  // Determine the effective variant and base name
  let effectiveVariant = variant;
  let baseName = name;
  
  if (hasSolidSuffix) {
    effectiveVariant = 'solid';
    // Strip the Solid suffix for path generation if needed
    if (name.endsWith('Solid') && !name.includes('faSolid')) {
      baseName = name.substring(0, name.length - 5);
    }
  } else if (hasLightSuffix) {
    effectiveVariant = 'light';
    // Strip the Light suffix for path generation if needed
    if (name.endsWith('Light') && !name.includes('faLight')) {
      baseName = name.substring(0, name.length - 5);
    }
  }
  
  // Remove 'fa' prefix to get the actual icon name
  const iconName = baseName.startsWith('fa') ? baseName.substring(2).toLowerCase() : baseName.toLowerCase();
  
  // Convert from camelCase to kebab-case for FA format compatibility
  const kebabName = toKebabCase(iconName);
  
  // Create the path using the style folder and full icon ID to match registry pattern
  const folder = STYLE_FOLDERS[effectiveVariant] || 'light';
  
  // Check if we should use an app-specific path
  if (kebabName.startsWith('app')) {
    return `/icons/app/${kebabName.substring(3).toLowerCase()}.svg`;
  }
  
  // Create path that matches registry pattern with full ID
  if (effectiveVariant === 'solid') {
    return `/icons/${folder}/fa${iconName.charAt(0).toUpperCase() + iconName.slice(1)}Solid.svg`;
  } else if (effectiveVariant === 'light') {
    return `/icons/${folder}/fa${iconName.charAt(0).toUpperCase() + iconName.slice(1)}Light.svg`;
  } else if (effectiveVariant === 'brand') {
    return `/icons/brands/brands${iconName.charAt(0).toUpperCase() + iconName.slice(1)}.svg`;
  }
  
  // Default path format
  return `/icons/${folder}/fa${iconName.charAt(0).toUpperCase() + iconName.slice(1)}${folder.charAt(0).toUpperCase() + folder.slice(1)}.svg`;
}

/**
 * Get the path to an icon image file
 * First looks for the icon in the registry, then falls back to a generative approach
 * 
 * @param name - Icon name or ID
 * @param variant - Icon variant (light or solid)
 * @returns URL to the icon image file
 */
export function getIconPath(name: string, variant: IconStyle = 'light'): string {
  if (!name) {
    return '/icons/solid/question.svg'; // Default fallback
  }

  // Handle explicit suffixes in the name that should override the variant
  const hasSolidSuffix = name.endsWith('Solid');
  const hasLightSuffix = name.endsWith('Light');
  
  // Determine the effective variant based on name suffix
  const effectiveVariant = hasSolidSuffix ? 'solid' : hasLightSuffix ? 'light' : variant;

  // Normalize the icon name
  const normalizedName = normalizeIconName(name);
  
  // Try to find the icon in the registry first - most efficient
  // This handles both direct icon IDs and mapped names
  
  // 1. First try with the exact name
  let iconMetadata = findIconById(normalizedName);
  
  // 2. If not found, try finding by map name
  if (!iconMetadata) {
    iconMetadata = findIconByMapName(normalizedName);
  }
  
  // 3. If still not found, try finding by alternatives
  if (!iconMetadata) {
    iconMetadata = findIconByAlternatives(normalizedName);
  }
  
  // If icon found in registry, use its path
  if (iconMetadata && iconMetadata.path) {
    return iconMetadata.path;
  }
  
  // Fallback to generating a path based on conventions
  return generateFontAwesomeIconPath(normalizedName, effectiveVariant);
}

/**
 * Check if an icon exists in the registry
 */
export function iconExists(name: string): boolean {
  const normalizedName = normalizeIconName(name);
  
  // Check by map name
  const iconByMap = findIconByMapName(normalizedName);
  if (iconByMap) return true;
  
  // Check by ID
  const iconById = findIconById(normalizedName);
  if (iconById) return true;
  
  // Check by alternatives
  const iconByAlternative = findIconByAlternatives(normalizedName);
  if (iconByAlternative) return true;
  
  return false;
}

/**
 * Get the base name of an icon without fa/fas/far prefix
 */
export function getIconBaseName(name: string): string {
  const normalizedName = normalizeIconName(name);
  
  if (normalizedName.startsWith('fa')) {
    // Remove fa prefix
    return normalizedName.substring(2);
  }
  
  return normalizedName;
}

/**
 * Generate a cache key for an icon to use in memoization
 */
export function getIconCacheKey(name: string, variant: IconStyle = 'light'): string {
  return `${normalizeIconName(name)}_${variant}`;
}

/**
 * Convert a string to kebab-case
 */
export function toKebabCase(str: string): string {
  // First handle special cases like 'CircleNotch' → 'circle-notch'
  const specialCaseRegex = /([a-z])([A-Z])/g;
  const kebabStr = str
    // Replace uppercase letters with - followed by lowercase letter
    .replace(specialCaseRegex, '$1-$2')
    .toLowerCase();
  
  // Special case handling for specific icons
  if (kebabStr === 'circlenotch') return 'circle-notch';
  if (kebabStr === 'chartline') return 'chart-line';
  if (kebabStr === 'arrowleft') return 'arrow-left';
  if (kebabStr === 'magnifyingglassplus') return 'magnifying-glass-plus';
  
  return kebabStr;
}

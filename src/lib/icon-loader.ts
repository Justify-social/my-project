/**
 * Icon Loader Utility
 * 
 * This utility provides functions for dynamically loading icons only when needed.
 * It helps with tree-shaking and reducing the initial bundle size by lazy-loading
 * icons that are used less frequently.
 */

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { IconName } from '@/components/ui/icon';

// Cache for loaded icons to prevent duplicate imports
const iconCache: Record<string, IconDefinition> = {};

/**
 * Dynamically load a Font Awesome icon
 * 
 * @param iconName The name of the icon as defined in IconName type
 * @param variant 'solid' | 'regular' | 'brands'
 * @returns Promise that resolves to the icon definition
 */
export async function loadIcon(
  iconName: string, 
  variant: 'solid' | 'regular' | 'brands' = 'solid'
): Promise<IconDefinition> {
  // Create a cache key
  const cacheKey = `${variant}-${iconName}`;
  
  // Return cached icon if available
  if (iconCache[cacheKey]) {
    return iconCache[cacheKey];
  }
  
  // Dynamically import the icon based on variant
  try {
    let icon: IconDefinition;
    
    switch (variant) {
      case 'solid':
        icon = (await import(`@fortawesome/free-solid-svg-icons/fa${capitalizeFirstLetter(iconName)}`)).default;
        break;
      case 'regular':
        icon = (await import(`@fortawesome/free-regular-svg-icons/fa${capitalizeFirstLetter(iconName)}`)).default;
        break;
      case 'brands':
        icon = (await import(`@fortawesome/free-brands-svg-icons/fa${capitalizeFirstLetter(iconName)}`)).default;
        break;
      default:
        throw new Error(`Invalid icon variant: ${variant}`);
    }
    
    // Cache the icon for future use
    iconCache[cacheKey] = icon;
    
    return icon;
  } catch (error) {
    console.error(`Failed to load icon: ${iconName} (${variant})`, error);
    throw error;
  }
}

/**
 * Helper function to capitalize the first letter of a string
 * 
 * @param str String to capitalize
 * @returns Capitalized string
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Preload commonly used icons to avoid loading delays
 * This can be called during idle time or on component mount
 */
export async function preloadCommonIcons(): Promise<void> {
  const commonIcons: [string, 'solid' | 'regular' | 'brands'][] = [
    ['user', 'solid'],
    ['search', 'solid'],
    ['check', 'solid'],
    ['xmark', 'solid'],
    // Add more common icons here
  ];
  
  await Promise.all(
    commonIcons.map(([name, variant]) => loadIcon(name, variant).catch(() => null))
  );
}

/**
 * Get the FontAwesome icon prefix based on variant
 */
export function getIconPrefix(variant: 'solid' | 'regular' | 'brands'): string {
  switch (variant) {
    case 'solid': return 'fas';
    case 'regular': return 'far';
    case 'brands': return 'fab';
    default: return 'fas';
  }
} 
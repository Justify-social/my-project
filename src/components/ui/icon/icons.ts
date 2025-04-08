/**
 * Consolidated Icon Utilities
 * Updated to use consolidated registry loader - last updated: 2024-04-03
 * Provides standardized icon path resolution and utility functions
 */

import { IconStyle, IconMetadata } from './icon-types';

// IMPORTANT: Import the generated registry data
import { iconRegistryData } from '@/lib/generated/icon-registry'; // Use path alias

// Use registry data directly with type safety
const registry = iconRegistryData; // Use the imported data object

// Debug flag
const DEBUG = process.env.NODE_ENV === 'development';

// Helper for debug logging
const debug = (...args: any[]) => {
  if (DEBUG) {
    // console.log('[Icons]', ...args); // Commented out debug logs
  }
};

/**
 * Find an icon by its ID in the registry.
 * @param id The exact Icon ID to find (e.g., 'faUserLight', 'appHome').
 * @returns The icon metadata or null if not found.
 */
export function findIconById(id: string): IconMetadata | null {
  // Use the imported registry data
  if (!registry?.icons || !Array.isArray(registry.icons)) {
    debug('Icon registry data is not properly loaded or not an array');
    return null;
  }

  // Direct lookup using the provided ID
  const icon = registry.icons.find((item: IconMetadata) => item.id === id);

  // debug(icon ? `Found icon by ID '${id}'` : `Icon '${id}' not found by ID`); // Commented out
  return icon || null;
}

/**
 * Get the path to an icon image file using only the registry.
 *
 * @param iconId - The exact Icon ID with variant suffix (e.g., 'faUserLight', 'faUserSolid', 'appHome')
 * @returns URL to the icon image file from the registry or a fallback path.
 */
export function getIconPath(iconId: string): string {
  const defaultFallbackPath = '/icons/light/faQuestionLight.svg'; // Consistent fallback

  if (!iconId) {
    // debug('No iconId provided, returning default fallback path.'); // Commented out
    return defaultFallbackPath;
  }

  // Attempt to find the icon directly by its ID in the registry
  const iconMetadata = findIconById(iconId);

  if (iconMetadata?.path) {
    // debug(`Found icon '${id}', using path from registry: ${iconMetadata.path}`); // Commented out
    return iconMetadata.path;
  } else {
    // debug(`Icon '${id}' not found in registry. Returning fallback path.`); // Commented out
    // Check if it looks like an app icon trying to use a variant
    if (iconId.startsWith('app') && (iconId.endsWith('Light') || iconId.endsWith('Solid'))) {
      const baseAppId = iconId.replace(/(Light|Solid)$/, '');
      const baseAppIcon = findIconById(baseAppId);
      if (baseAppIcon?.path) {
        // debug(`Attempted to use variant for app icon '${id}'. Found base app icon '${baseAppId}'. Returning its path: ${baseAppIcon.path}`); // Commented out
        return baseAppIcon.path; // Return the base app icon path
      }
    }
    return defaultFallbackPath;
  }
}

/**
 * Check if an icon exists in the registry by its ID.
 */
export function iconExists(iconId: string): boolean {
  if (!iconId) return false;
  const icon = findIconById(iconId);
  return !!icon; // Returns true if icon is found, false otherwise
}

/**
 * Consolidated Icon Utilities
 * Updated to use consolidated registry loader - last updated: 2024-04-03
 * Provides standardized icon path resolution and utility functions
 */

import { IconMetadata } from './icon-types';

// IMPORTANT: Import the generated registry data
import { iconRegistryData } from '@/lib/generated/icon-registry'; // Use path alias

// Use registry data directly with type safety
const registry = iconRegistryData; // Use the imported data object

// Debug flag
// Workaround for potential process.env typing issues to enable debug logs
const DEBUG =
  (typeof process !== 'undefined' && (process as any).env && (process as any).env.NODE_ENV) ===
  'development';

// Set to keep track of logged warnings
const loggedWarnings = new Set<string>();

// Helper for debug logging
const debug = (...args: unknown[]) => {
  if (DEBUG && false) {
    console.log('[icons.ts]', ...args);
  }
};

/**
 * Find an icon by its ID in the registry.
 * @param id The exact Icon ID to find (e.g., 'faUserLight', 'appHome').
 * @returns The icon metadata or null if not found.
 */
export function findIconById(id: string): IconMetadata | null {
  debug(`findIconById: Attempting to find ID: "${id}"`);
  if (!registry?.icons || !Array.isArray(registry.icons)) {
    debug('findIconById: Icon registry data is not properly loaded or not an array');
    return null;
  }

  const icon = registry.icons.find((item: IconMetadata) => item.id === id);

  if (icon) {
    debug(`findIconById: Found icon for ID: "${id}"`, icon);
  } else {
    debug(`findIconById: Icon NOT FOUND for ID: "${id}"`);
  }
  return icon || null;
}

/**
 * Get the path to an icon image file using only the registry.
 *
 * @param iconId - The exact Icon ID with variant suffix (e.g., 'faUserLight', 'faUserSolid', 'appHome')
 * @returns URL to the icon image file from the registry or a fallback path.
 */
export function getIconPath(iconId: string): string {
  debug(`getIconPath: Called with iconId: "${iconId}"`);
  const defaultFallbackPath = '/icons/light/faQuestionLight.svg';

  if (!iconId) {
    debug('getIconPath: No iconId provided, returning default fallback path.');
    return defaultFallbackPath;
  }

  const iconMetadata = findIconById(iconId);

  if (iconMetadata?.path) {
    debug(`getIconPath: Found metadata with path for "${iconId}":`, iconMetadata.path);
    return iconMetadata.path;
  } else {
    debug(`getIconPath: Metadata or path NOT FOUND for "${iconId}". iconMetadata:`, iconMetadata);
    if (iconId.startsWith('app') && (iconId.endsWith('Light') || iconId.endsWith('Solid'))) {
      const baseAppId = iconId.replace(/(Light|Solid)$/, '');
      debug(`getIconPath: Attempting app icon fallback for "${iconId}", baseAppId: "${baseAppId}"`);
      const baseAppIcon = findIconById(baseAppId);
      if (baseAppIcon?.path) {
        debug(`getIconPath: Found base app icon path for "${baseAppId}":`, baseAppIcon.path);
        return baseAppIcon.path;
      }
    }
    debug(`getIconPath: Returning default fallback path for "${iconId}"`);
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

export function logIconWarning(message: string, ..._args: unknown[]) {
  // Prefix unused args
  if (!loggedWarnings.has(message)) {
    console.warn(`[Icon Warning] ${message}`, ..._args);
    loggedWarnings.add(message);
  }
}

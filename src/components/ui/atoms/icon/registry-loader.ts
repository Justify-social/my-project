/**
 * Registry Loader - SSOT Consolidator for Icon Registries
 * 
 * This file implements the Single Source of Truth (SSOT) pattern for icon registries
 * by consolidating multiple category-specific registry files into a unified registry.
 * 
 * IMPORTANT: The 'id' field is the SSOT for icon identification throughout the system.
 * All icon lookups should use the 'id' field as the primary key, not name or other fields.
 * 
 * @author MIT Professor Implementation
 * @created 2023-04-03
 * @updated 2024-04-03 - Enhanced SSOT documentation
 */

import appIcons from '../../../../../public/static/app-icon-registry.json';
import brandsIcons from '../../../../../public/static/brands-icon-registry.json';
import kpisIcons from '../../../../../public/static/kpis-icon-registry.json';
import lightIcons from '../../../../../public/static/light-icon-registry.json';
import solidIcons from '../../../../../public/static/solid-icon-registry.json';
import newLightIcons from '../../../../../public/static/new-light-icon-registry.json';
import newSolidIcons from '../../../../../public/static/new-solid-icon-registry.json';
import { IconMetadata, IconRegistryData } from './types';

// Debug flag for development mode
const DEBUG = process.env.NODE_ENV === 'development';

// Helper for debug logging
const debug = (...args: any[]) => {
  if (DEBUG) {
    console.log('[IconRegistry]', ...args);
  }
};

/**
 * Consolidate icons from multiple registry files into a single registry
 * This maintains SSOT principles while allowing category-specific registries
 * 
 * Each icon must have:
 * - A unique 'id' field: Primary identifier and SSOT for the icon
 * - A 'category' field: Matches the category-specific registry source
 * - A 'path' field: Points to the SVG file location
 */
export function consolidateRegistries(): IconRegistryData {
  try {
    debug('Consolidating icon registries...');
    
    // Create a comprehensive array of all icons
    const allIcons: IconMetadata[] = [];
    
    // Function to safely add icons from a registry
    const addIconsFromRegistry = (registry: any, sourceName: string) => {
      if (registry && Array.isArray(registry.icons)) {
        debug(`Adding ${registry.icons.length} icons from ${sourceName}`);
        
        // Add icons to the consolidated collection, ensuring each has required fields
        registry.icons.forEach((icon: any) => {
          if (!icon.id) {
            console.warn(`Skipping icon without ID in ${sourceName}`);
            return;
          }
          allIcons.push(icon);
        });
      } else {
        debug(`Warning: Invalid registry format in ${sourceName}`);
      }
    };
    
    // Add icons from each registry, with error handling
    addIconsFromRegistry(appIcons, 'app-icon-registry.json');
    addIconsFromRegistry(brandsIcons, 'brands-icon-registry.json');
    addIconsFromRegistry(kpisIcons, 'kpis-icon-registry.json');
    addIconsFromRegistry(lightIcons, 'light-icon-registry.json');
    addIconsFromRegistry(solidIcons, 'solid-icon-registry.json');
    addIconsFromRegistry(newLightIcons, 'new-light-icon-registry.json');
    addIconsFromRegistry(newSolidIcons, 'new-solid-icon-registry.json');
    
    // Create the consolidated registry with metadata
    const consolidatedRegistry: IconRegistryData = {
      icons: allIcons,
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    debug(`Successfully consolidated ${allIcons.length} icons from all registries`);
    return consolidatedRegistry;
  } catch (error) {
    console.error('Error consolidating icon registries:', error);
    
    // Provide a fallback registry to prevent app crashes
    return {
      icons: [],
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      generatedAt: new Date().toISOString()
    };
  }
}

// Create and export a singleton instance of the consolidated registry
export const iconRegistry = consolidateRegistries();

// Default export for backward compatibility
export default iconRegistry; 
'use client';

/**
 * Icon API
 * 
 * This implementation loads icon data directly from static JSON files
 * using fetch instead of file system operations.
 * No mock data is used.
 */

/**
 * Icon metadata interface
 */
export interface IconMetadata {
  id: string;
  name: string;
  svgContent: string;
  category: string;
  tags: string[];
  weight: string;
  version?: string;
  path?: string;    // SVG path attribute
  viewBox?: string; // SVG viewBox attribute
  width?: number;   // SVG width
  height?: number;  // SVG height
  usageCount?: number;
}

/**
 * Icon API interface
 */
export interface IconApi {
  getIcons(): Promise<{ items: IconMetadata[] }>;
  getIconCategories(): Promise<string[]>;
  getIconWeights(): Promise<string[]>;
  findSimilarIcons(iconId: string): Promise<IconMetadata[]>;
  loadIconsFromStaticRegistry(): Promise<{ items: IconMetadata[] }>;
  normalizeRegistryFormat(registry: any): { items: IconMetadata[] };
  normalizeIconFormat(icon: any): IconMetadata;
  createFallbackIconRegistry(): { items: IconMetadata[] };
}

// Simple in-memory cache
const iconCache: {
  items?: IconMetadata[];
  categories?: string[];
  weights?: string[];
} = {};

// Debug flag
const DEBUG = true;

// Helper for debug logging
const debug = (...args: any[]) => {
  if (DEBUG) {
    console.log('[IconAPI]', ...args);
  }
};

/**
 * Icon API implementation
 */
export const iconApi: IconApi = {
  /**
   * Get all icons
   */
  async getIcons(): Promise<{ items: IconMetadata[] }> {
    debug('getIcons() called');
    
    // Return from cache if available
    if (iconCache.items) {
      debug('Returning cached icons:', iconCache.items.length);
      return { items: iconCache.items };
    }
    
    try {
      // Try loading from static registry file first
      debug('Loading icons from static registry...');
      
      const response = await fetch('/static/icon-registry.json', {
        cache: 'no-store', // Bypass cache for debugging
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch icon registry: ${response.status} ${response.statusText}`);
      }
      
      debug('Response received, parsing JSON...');
      const registry = await response.json();
      debug('Registry structure:', Object.keys(registry));
      
      // Handle both formats - support both 'items' and 'icons' arrays for backward compatibility
      if (registry) {
        let validIcons: IconMetadata[] = [];
        
        if (Array.isArray(registry.items)) {
          debug(`Found ${registry.items.length} icons in 'items' array`);
          validIcons = registry.items;
        } else if (Array.isArray(registry.icons)) {
          debug(`Found ${registry.icons.length} icons in 'icons' array`);
          validIcons = registry.icons;
        } else {
          debug('Registry format is unexpected:', registry);
          console.error('Registry keys received:', Object.keys(registry).join(', '));
          throw new Error('Registry format unexpected: no items or icons array found');
        }
        
        // Validate each icon has required properties
        const filteredIcons = validIcons.filter((icon: any) => {
          const isValid = icon && icon.id && icon.name && typeof icon.svgContent === 'string';
          if (!isValid) {
            debug('Invalid icon found:', icon);
          }
          return isValid;
        });
        
        debug(`${filteredIcons.length} valid icons after filtering`);
        iconCache.items = filteredIcons;
        return { items: filteredIcons };
      } else {
        debug('Registry is null or undefined');
        throw new Error('Registry is null or undefined');
      }
    } catch (err) {
      debug('Failed to load icons from static registry:', err);
      console.error('Failed to load icons from static registry:', err);
    }
    
    // If all attempts fail, return empty array
    debug('Could not load any icons, returning empty array');
    return { items: [] };
  },
  
  /**
   * Get all icon categories
   */
  async getIconCategories(): Promise<string[]> {
    debug('getIconCategories() called');
    
    // Return from cache if available
    if (iconCache.categories) {
      debug('Returning cached categories:', iconCache.categories.length);
      return iconCache.categories;
    }
    
    try {
      // Get icons first
      const { items } = await this.getIcons();
      
      // Extract unique categories
      const categories = Array.from(
        new Set(items.map(icon => icon.category || 'UI'))
      );
      
      debug(`Found ${categories.length} unique categories`);
      iconCache.categories = categories;
      return categories;
    } catch (err) {
      debug('Error getting icon categories:', err);
      console.error('Error getting icon categories:', err);
      return [];
    }
  },
  
  /**
   * Get all icon weights
   */
  async getIconWeights(): Promise<string[]> {
    debug('getIconWeights() called');
    
    // Return from cache if available
    if (iconCache.weights) {
      debug('Returning cached weights:', iconCache.weights.length);
      return iconCache.weights;
    }
    
    try {
      // Get icons first
      const { items } = await this.getIcons();
      
      // Extract unique weights
      const weights = Array.from(
        new Set(items.map(icon => icon.weight || 'regular'))
      );
      
      debug(`Found ${weights.length} unique weights`);
      iconCache.weights = weights;
      return weights;
    } catch (err) {
      debug('Error getting icon weights:', err);
      console.error('Error getting icon weights:', err);
      return [];
    }
  },
  
  /**
   * Find similar icons based on tags or category
   */
  async findSimilarIcons(iconId: string): Promise<IconMetadata[]> {
    debug('findSimilarIcons() called for', iconId);
    
    try {
      // Get all icons
      const { items } = await this.getIcons();
      
      // Find the original icon
      const originalIcon = items.find(icon => icon.id === iconId);
      
      if (!originalIcon) {
        debug('Original icon not found:', iconId);
        return [];
      }
      
      // Find similar icons based on category or tags
      const similarIcons = items
        .filter(icon => 
          icon.id !== iconId && 
          (
            icon.category === originalIcon.category ||
            (Array.isArray(icon.tags) && Array.isArray(originalIcon.tags) &&
             icon.tags.some(tag => originalIcon.tags.includes(tag)))
          )
        )
        .sort((a, b) => {
          // Count how many matching tags there are
          if (!Array.isArray(a.tags) || !Array.isArray(b.tags) || !Array.isArray(originalIcon.tags)) {
            return 0;
          }
          
          const aMatches = a.tags.filter(tag => originalIcon.tags.includes(tag)).length;
          const bMatches = b.tags.filter(tag => originalIcon.tags.includes(tag)).length;
          
          // More matches should come first
          return bMatches - aMatches;
        })
        .slice(0, 5); // Return up to 5 similar icons
      
      // If no similar icons found by category or tags, return some from the same category
      if (similarIcons.length === 0) {
        debug('No similar icons found by tags, falling back to category');
        const categoryIcons = items
          .filter(icon => icon.id !== iconId && icon.category === originalIcon.category)
          .slice(0, 5);
        
        debug(`Found ${categoryIcons.length} icons from same category`);
        return categoryIcons;
      }
      
      debug(`Found ${similarIcons.length} similar icons`);
      return similarIcons;
    } catch (err) {
      debug('Error finding similar icons:', err);
      console.error('Error finding similar icons:', err);
      return [];
    }
  },

  /**
   * Load icons from static registry file with enhanced error handling
   */
  async loadIconsFromStaticRegistry(): Promise<{ items: IconMetadata[] }> {
    debug('Loading icons from static registry');
    
    // Retry logic parameters
    const maxRetries = 3;
    const retryDelay = 500; // ms
    let retryCount = 0;
    
    // All potential category-specific registries to try first
    const categoryRegistries = [
      '/static/app-icon-registry.json',
      '/static/brands-icon-registry.json',
      '/static/kpis-icon-registry.json',
      '/static/light-icon-registry.json',
      '/static/solid-icon-registry.json'
    ];
    
    // Legacy registry paths as fallback
    const legacyRegistryPaths = [
      '/static/icon-registry.json',
      '/api/icon-registry',
      '/static/icons/registry.json',
      '/api/component-registry'
    ];
    
    // Combine both arrays - try category files first, then legacy paths
    const registryPaths = [...categoryRegistries, ...legacyRegistryPaths];
    
    // Collected icons from all category registries
    const allIcons: IconMetadata[] = [];
    const loadedPaths: string[] = [];
    
    // Try each registry path, accumulating all icons found
    for (const path of categoryRegistries) {
      retryCount = 0;
      while (retryCount < maxRetries) {
        try {
          debug(`Fetching from ${path} (attempt ${retryCount + 1}/${maxRetries})`);
          const response = await fetch(path, { 
            cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'force-cache',
            next: { tags: ['icon-registry'] }
          });
          
          if (!response.ok) {
            debug(`Response not OK from ${path}: ${response.status}`);
            throw new Error(`Failed to fetch icon registry from ${path}: ${response.status}`);
          }
          
          const registry = await response.json();
          
          // Validate registry format
          if (registry && Array.isArray(registry.icons) && registry.icons.length > 0) {
            debug(`Successfully loaded ${registry.icons.length} icons from ${path}`);
            allIcons.push(...registry.icons);
            loadedPaths.push(path);
            break; // Success, move to the next path
          } else {
            debug(`Registry at ${path} has invalid format or is empty`);
            throw new Error(`Registry at ${path} has invalid format or is empty`);
          }
        } catch (err) {
          debug(`Attempt ${retryCount + 1} failed for ${path}:`, err);
          retryCount++;
          
          // Only wait if we're going to retry
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
    }
    
    // If we found icons in category registries, return the consolidated collection
    if (allIcons.length > 0) {
      debug(`Successfully loaded ${allIcons.length} icons from ${loadedPaths.length} category registries`);
      
      // Update cache
      iconCache.items = allIcons;
      
      return { 
        items: allIcons 
      };
    }
    
    // If no icons found in category registries, try legacy paths
    debug('No icons found in category registries, trying legacy paths');
    
    // Try each legacy path until we get a valid response
    for (const path of legacyRegistryPaths) {
      retryCount = 0;
      while (retryCount < maxRetries) {
        try {
          debug(`Fetching from legacy path ${path} (attempt ${retryCount + 1}/${maxRetries})`);
          const response = await fetch(path, { 
            cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'force-cache',
            next: { tags: ['icon-registry'] }
          });
          
          if (!response.ok) {
            debug(`Response not OK from ${path}: ${response.status}`);
            throw new Error(`Failed to fetch icon registry from ${path}: ${response.status}`);
          }
          
          const registry = await response.json();
          
          // Validate and normalize the registry data structure
          return this.normalizeRegistryFormat(registry);
        } catch (err) {
          debug(`Attempt ${retryCount + 1} failed for ${path}:`, err);
          retryCount++;
          
          // Only wait if we're going to retry
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
    }
    
    // All attempts failed, try to create a fallback registry
    debug('All registry fetch attempts failed, creating fallback registry');
    return this.createFallbackIconRegistry();
  },

  /**
   * Normalize different registry formats to a consistent structure
   */
  normalizeRegistryFormat(registry: any): { items: IconMetadata[] } {
    debug('Normalizing registry format');
    
    if (!registry) {
      debug('Registry is null or undefined');
      return { items: [] };
    }
    
    // Check for data wrapper used in some API responses
    if (registry.data && typeof registry.data === 'object') {
      debug('Found data wrapper, using registry.data');
      registry = registry.data;
    }
    
    // Find the icon array with various possible property names
    let validIcons: IconMetadata[] = [];
    
    // Check for direct items array
    if (Array.isArray(registry.items)) {
      debug(`Found ${registry.items.length} icons in registry.items`);
      validIcons = registry.items;
    } 
    // Check for icons array
    else if (Array.isArray(registry.icons)) {
      debug(`Found ${registry.icons.length} icons in registry.icons`);
      validIcons = registry.icons;
    }
    // Check for components array that might contain icons
    else if (Array.isArray(registry.components)) {
      debug(`Found ${registry.components.length} components, filtering for icons`);
      validIcons = registry.components.filter((comp: any) => 
        comp.type === 'icon' || 
        (comp.tags && Array.isArray(comp.tags) && comp.tags.includes('icon')) ||
        (comp.name && typeof comp.name === 'string' && comp.name.toLowerCase().includes('icon'))
      );
      debug(`Extracted ${validIcons.length} icons from components array`);
    } 
    // Last resort: check if registry itself is an array
    else if (Array.isArray(registry)) {
      debug(`Registry is an array with ${registry.length} items`);
      validIcons = registry;
    } else {
      debug('Registry format is unexpected:', Object.keys(registry).join(', '));
      console.warn('Unexpected registry format, no recognized icon arrays found');
      return { items: [] };
    }
    
    // Normalize and validate each icon
    const normalizedIcons = validIcons
      .filter(icon => icon != null)
      .map(icon => this.normalizeIconFormat(icon))
      .filter(icon => icon.id && icon.name);
    
    debug(`Normalized ${normalizedIcons.length} valid icons`);
    iconCache.items = normalizedIcons;
    
    return { items: normalizedIcons };
  },

  /**
   * Normalize an individual icon's format to match expected IconMetadata
   */
  normalizeIconFormat(icon: any): IconMetadata {
    // Basic validation
    if (!icon || typeof icon !== 'object') {
      return {} as IconMetadata; // Will be filtered out
    }
    
    // Create normalized icon with fallbacks for missing properties
    const normalized: IconMetadata = {
      id: icon.id || icon.name || '',
      name: icon.name || icon.id || '',
      svgContent: icon.svgContent || icon.content || '',
      category: icon.category || 'UI',
      tags: Array.isArray(icon.tags) ? icon.tags : [],
      weight: icon.weight || 'regular',
      path: icon.path || '',
      viewBox: icon.viewBox || '0 0 24 24',
      width: icon.width || 24,
      height: icon.height || 24,
      version: icon.version || '1.0'
    };
    
    // Special case: fa icons should always have fa- prefix in id
    if (normalized.name.startsWith('fa') && !normalized.id.startsWith('fa')) {
      normalized.id = normalized.name;
    }
    
    // If tags is a string, convert to array
    if (typeof icon.tags === 'string') {
      normalized.tags = icon.tags.split(',').map((tag: string) => tag.trim());
    }
    
    // If we're missing svgContent, try to generate placeholder
    if (!normalized.svgContent) {
      const width = normalized.width || 24;
      const height = normalized.height || 24;
      normalized.svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${normalized.viewBox}" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="none" stroke="currentColor" stroke-width="1"/><text x="${width/2}" y="${height/2}" text-anchor="middle" dominant-baseline="middle" font-size="8">${normalized.name}</text></svg>`;
    }
    
    return normalized;
  },

  /**
   * Create a fallback registry when all loading attempts fail
   */
  createFallbackIconRegistry(): { items: IconMetadata[] } {
    debug('Creating fallback icon registry');
    
    // Basic set of fallback icons
    const fallbackIcons: IconMetadata[] = [
      {
        id: 'fa-circle-question',
        name: 'fa-circle-question',
        category: 'UI',
        tags: ['question', 'help', 'fallback'],
        weight: 'light',
        version: '1.0',
        svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14c-2.206 0-4 1.794-4 4h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2c-.552 0-1 .448-1 1v2h2v-1.031A3.003 3.003 0 0 0 16 10c0-2.206-1.794-4-4-4zm-1 9h2v2h-2v-2z"/></svg>',
        path: '',
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
      },
      {
        id: 'fa-triangle-exclamation',
        name: 'fa-triangle-exclamation',
        category: 'UI',
        tags: ['warning', 'alert', 'fallback'],
        weight: 'light',
        version: '1.0',
        svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>',
        path: '',
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
      }
    ];
    
    // Update cache
    iconCache.items = fallbackIcons;
    
    console.warn('Using fallback icon registry with limited icons');
    return { items: fallbackIcons };
  }
}; 
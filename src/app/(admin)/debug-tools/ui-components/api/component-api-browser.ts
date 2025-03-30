'use client';

/**
 * Browser-compatible component API
 * This version is compatible with client-side usage and fetches component data
 * directly from the registry API endpoint, with proper error handling.
 */

import { ComponentMetadata, Change, Dependency } from '../db/registry';

// Browser-compatible implementation
export const browserComponentApi = {
  /**
   * Fetch registry data from the API endpoint
   * @returns The component registry data or null if there's an error
   */
  async fetchRegistry(): Promise<{ components: ComponentMetadata[] } | null> {
    try {
      console.log('Fetching component registry from API');
      const response = await fetch('/api/component-registry');
      
      if (!response.ok) {
        console.error(`Error fetching registry: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data || !data.data.components) {
        console.error('Invalid registry data format:', data);
        return null;
      }
      
      console.log(`Successfully fetched ${data.data.components.length} components from registry`);
      return data.data;
    } catch (error) {
      console.error('Error fetching component registry:', error);
      return null;
    }
  },

  /**
   * Get all components in the library from the registry
   * @returns Array of component metadata
   */
  getComponents: async (): Promise<ComponentMetadata[]> => {
    console.log('Fetching components from registry API');
    
    try {
      const registry = await browserComponentApi.fetchRegistry();
      
      if (!registry || !registry.components) {
        console.error('Failed to fetch component registry');
        return [];
      }
      
      return registry.components;
    } catch (error) {
      console.error('Error in getComponents:', error);
      return [];
    }
  },

  /**
   * Get metadata for a specific component from the registry
   * @param componentPath Path of the component to retrieve
   * @returns Component metadata or null if not found
   */
  getComponentMetadata: async (componentPath: string): Promise<ComponentMetadata | null> => {
    console.log(`Fetching component metadata for ${componentPath} from registry`);
    
    try {
      const components = await browserComponentApi.getComponents();
      if (!components || components.length === 0) {
        console.warn(`No components available to find ${componentPath}`);
        return null;
      }
      
      const component = components.find(comp => comp.path === componentPath);
      if (!component) {
        console.warn(`Component not found in registry: ${componentPath}`);
      }
      
      return component || null;
    } catch (error) {
      console.error(`Error getting component metadata for ${componentPath}:`, error);
      return null;
    }
  },

  /**
   * Get change history for a component
   * @param componentPath Path of the component to get history for
   * @returns Array of change history entries
   */
  getComponentChanges: async (componentPath: string): Promise<Change[]> => {
    console.log(`Fetching change history for ${componentPath} from registry`);
    
    try {
      const component = await browserComponentApi.getComponentMetadata(componentPath);
      
      if (!component) {
        console.warn(`Cannot fetch changes for non-existent component: ${componentPath}`);
        return [];
      }
      
      if (!component.changeHistory) {
        console.log(`No change history available for ${componentPath}`);
        return [];
      }
      
      return component.changeHistory;
    } catch (error) {
      console.error(`Error getting change history for ${componentPath}:`, error);
      return [];
    }
  },

  /**
   * Get dependencies for a component
   * @param componentPath Path of the component to get dependencies for
   * @returns Array of dependencies
   */
  getComponentDependencies: async (componentPath: string): Promise<Dependency[]> => {
    console.log(`Fetching dependencies for ${componentPath} from registry`);
    
    try {
      const component = await browserComponentApi.getComponentMetadata(componentPath);
      
      if (!component) {
        console.warn(`Cannot fetch dependencies for non-existent component: ${componentPath}`);
        return [];
      }
      
      if (!component.dependencies || component.dependencies.length === 0) {
        console.log(`No dependencies found for ${componentPath}`);
        return [];
      }
      
      return component.dependencies.map(dep => {
        if (typeof dep === 'string') {
          // Convert string dependencies to proper format with required fields
          return {
            name: dep,
            path: dep,
            type: 'other' // Using a valid type from the Dependency interface
          } as Dependency;
        }
        return dep as Dependency;
      });
    } catch (error) {
      console.error(`Error getting dependencies for ${componentPath}:`, error);
      return [];
    }
  },
  
  /**
   * Search for components by name, category, or description
   * @param query Search query string
   * @param category Optional category filter
   * @returns Array of matching components
   */
  searchComponents: async (query: string, category?: string): Promise<ComponentMetadata[]> => {
    console.log(`Searching components with query: "${query}"${category ? ` in category: ${category}` : ''}`);
    
    try {
      const components = await browserComponentApi.getComponents();
      
      if (!components || components.length === 0) {
        console.warn('No components available for search');
        return [];
      }
      
      // Filter by search term
      let results = components;
      
      if (query) {
        const searchLower = query.toLowerCase();
        results = results.filter(comp => 
          comp.name.toLowerCase().includes(searchLower) ||
          (comp.description && comp.description.toLowerCase().includes(searchLower)) ||
          comp.path.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by category if provided
      if (category) {
        results = results.filter(comp => comp.category === category);
      }
      
      console.log(`Found ${results.length} components matching search criteria`);
      return results;
    } catch (error) {
      console.error('Error searching components:', error);
      return [];
    }
  }
}; 
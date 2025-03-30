'use client';

/**
 * Component API
 * 
 * This API layer connects the component discovery and database modules to the UI.
 * It provides a unified interface for the UI to interact with the component registry.
 */

import { ComponentMetadata, PropDefinition, Change, Dependency, ComponentCategory } from '../db/registry';
import { componentRegistryDB } from '../db/registry-db';
import { componentFileWatcher } from '../discovery/file-watcher';
import { componentMetadataExtractor } from '../discovery/metadata-extractor';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Interface for retrieving components with filtering and search options
 */
export interface GetComponentsOptions {
  category?: 'atom' | 'molecule' | 'organism';
  search?: string;
  sortBy?: 'name' | 'lastUpdated';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Result of a components query including pagination info
 */
export interface ComponentsResult {
  items: ComponentMetadata[];
  total: number;
  hasMore: boolean;
  page?: number;
  pageSize?: number;
  error?: string;
}

/**
 * Event types for component change events
 */
export type ComponentChangeEventType = 'add' | 'update' | 'delete';

/**
 * Change event object for component changes
 */
export interface ComponentChangeEvent {
  type: ComponentChangeEventType;
  component: ComponentMetadata | null;
  path: string;
  timestamp: Date;
}

/**
 * Client-side compatible API for UI components
 */
export const componentApi = {
  /**
   * Get all components
   */
  async getComponents(): Promise<ComponentMetadata[]> {
    try {
      // In browser, we need to fetch from the API endpoint
      if (isBrowser) {
        const response = await fetch('/api/component-registry');
        if (!response.ok) {
          console.error('Failed to fetch components from registry API:', response.statusText);
          return [];
        }
        
        const data = await response.json();
        if (!data.success || !data.data || !data.data.components) {
          console.error('Invalid data format from component registry API');
          return [];
        }
        
        return data.data.components;
      }
      
      // For server-side, use the registry database
      if (componentRegistryDB && componentRegistryDB.getComponents) {
        return componentRegistryDB.getComponents();
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching components:', error);
      return [];
    }
  },

  /**
   * Get component metadata by path
   */
  async getComponentMetadata(componentPath: string): Promise<ComponentMetadata | null> {
    try {
      // In browser, fetch from the API endpoint
      if (isBrowser) {
        const response = await fetch('/api/component-registry');
        if (!response.ok) {
          console.error('Failed to fetch component registry:', response.statusText);
          return null;
        }
        
        const data = await response.json();
        if (!data.success || !data.data || !data.data.components) {
          console.error('Invalid data format from component registry API');
          return null;
        }
        
        // Find the component in the returned data
        return data.data.components.find((c: ComponentMetadata) => c.path === componentPath) || null;
      }
      
      // For server-side, use the registry database
      if (componentRegistryDB && componentRegistryDB.getComponent) {
        return componentRegistryDB.getComponent(componentPath);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching component metadata for ${componentPath}:`, error);
      return null;
    }
  },

  /**
   * Get component version changes
   */
  async getComponentChanges(componentPath: string): Promise<Change[]> {
    try {
      // Get the component first
      const component = await this.getComponentMetadata(componentPath);
      
      // Return the change history if it exists
      if (component && component.changeHistory) {
        return component.changeHistory;
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching component changes for ${componentPath}:`, error);
      return [];
    }
  },

  /**
   * Get component dependencies
   */
  async getComponentDependencies(componentPath: string): Promise<Dependency[]> {
    try {
      // Get the component first
      const component = await this.getComponentMetadata(componentPath);
      
      // If we have dependencies information, return it
      if (component && component.dependencies) {
        // Convert string dependencies to Dependency objects
        return component.dependencies.map(dep => ({
          source: componentPath,
          target: typeof dep === 'string' ? dep : dep.target || 'unknown',
          type: typeof dep === 'string' ? 'utility' : dep.type || 'utility'
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching component dependencies for ${componentPath}:`, error);
      return [];
    }
  }
};

/**
 * ComponentApi provides methods for the UI to interact with component data
 */
export class ComponentApi {
  private changeListeners: ((event: ComponentChangeEvent) => void)[] = [];
  private isWatcherInitialized = false;
  private isBrowser = typeof window !== 'undefined';

  constructor(private isBrowser: boolean = typeof window !== 'undefined') {
    // Initialize database connection if not in browser
    if (!this.isBrowser) {
      // If in a server environment, initialize database
      componentRegistryDB.init();
      
      // Scan components if needed
      if (componentRegistryDB.isEmpty()) {
        this.scanComponents();
      }
    }
  }

  /**
   * Initialize the component file watcher
   */
  private async initializeWatcher(): Promise<void> {
    // Skip initialization in browser environment
    if (this.isBrowser || this.isWatcherInitialized) {
      return;
    }

    try {
      // Check if componentFileWatcher exists and has start method before calling
      if (componentFileWatcher && typeof componentFileWatcher.start === 'function') {
        // Configure file watcher with onChange handler
        componentFileWatcher.start();
        
        // Mark as initialized
        this.isWatcherInitialized = true;
      } else {
        console.warn('ComponentApi: File watcher not available or missing start method');
      }
    } catch (error) {
      console.error('Failed to initialize component watcher:', error);
    }
  }

  /**
   * Scan for components and store them in the database
   */
  private async scanComponents(): Promise<void> {
    if (this.isBrowser) {
      console.log('Skipping component scan in browser environment');
      return;
    }
    
    try {
      console.log('ComponentApi: Scanning for components...');
      
      // Check if metadataExtractor exists and has scanComponents method
      if (componentMetadataExtractor && typeof componentMetadataExtractor.scanComponents === 'function') {
        const components = await componentMetadataExtractor.scanComponents();
        console.log(`ComponentApi: Found ${components.length} components`);
        
        // Store components in the database
        if (componentRegistryDB && typeof componentRegistryDB.saveComponents === 'function') {
          await componentRegistryDB.saveComponents(components);
          console.log('ComponentApi: Components saved to database');
        }
      } else {
        console.warn('ComponentApi: Metadata extractor not available or missing scanComponents method');
      }
    } catch (error) {
      console.error('Failed to scan components:', error);
    }
  }

  /**
   * Get all components with optional filtering
   */
  public async getComponents(options: GetComponentsOptions = {}): Promise<ComponentsResult> {
    try {
      if (this.isBrowser) {
        try {
          // In browser, fetch from API
          const response = await fetch('/api/component-registry');
          if (!response.ok) {
            throw new Error(`Failed to fetch registry: ${response.status}`);
          }
          
          const result = await response.json();
          if (!result.success || !result.data || !result.data.components) {
            throw new Error('Invalid registry data format');
          }
          
          // Get components from the registry
          let components: ComponentMetadata[] = result.data.components;
          
          // Apply filtering
          if (options.category) {
            components = components.filter(c => c.category === options.category);
          }
          
          if (options.search) {
            const searchLower = options.search.toLowerCase();
            components = components.filter(c => {
              return (
                c.name.toLowerCase().includes(searchLower) ||
                c.description?.toLowerCase().includes(searchLower) ||
                c.path.toLowerCase().includes(searchLower)
              );
            });
          }
          
          // Apply sorting
          if (options.sortBy) {
            components = this.sortComponents(
              components, 
              options.sortBy, 
              options.sortDirection || 'asc'
            );
          }
          
          // Apply pagination
          const total = components.length;
          if (options.offset !== undefined && options.limit !== undefined) {
            components = components.slice(options.offset, options.offset + options.limit);
          }
          
          return {
            items: components,
            total,
            hasMore: options.limit ? total > (options.offset || 0) + options.limit : false,
            page: options.offset && options.limit ? Math.floor(options.offset / options.limit) + 1 : undefined,
            pageSize: options.limit
          };
        } catch (error) {
          console.error('Error fetching components from API:', error);
          return { items: [], total: 0, hasMore: false, error: error.message };
        }
      }
      
      // Server-side, use the database
      try {
        // Initialize if not already
        if (!this.isWatcherInitialized) {
          await this.initializeWatcher();
        }
        
        // Get components from the database
        let components: ComponentMetadata[] = [];
        
        if (componentRegistryDB && typeof componentRegistryDB.getComponents === 'function') {
          components = await componentRegistryDB.getComponents();
        }
        
        // Apply filtering
        if (options.category) {
          components = components.filter(c => c.category === options.category);
        }
        
        if (options.search) {
          const searchLower = options.search.toLowerCase();
          components = components.filter(c => {
            return (
              c.name.toLowerCase().includes(searchLower) ||
              c.description?.toLowerCase().includes(searchLower) ||
              c.path.toLowerCase().includes(searchLower)
            );
          });
        }
        
        // Apply sorting
        if (options.sortBy) {
          components = this.sortComponents(
            components, 
            options.sortBy, 
            options.sortDirection || 'asc'
          );
        }
        
        // Apply pagination
        const total = components.length;
        if (options.offset !== undefined && options.limit !== undefined) {
          components = components.slice(options.offset, options.offset + options.limit);
        }
        
        return {
          items: components,
          total,
          hasMore: options.limit ? total > (options.offset || 0) + options.limit : false,
          page: options.offset && options.limit ? Math.floor(options.offset / options.limit) + 1 : undefined,
          pageSize: options.limit
        };
      } catch (error) {
        console.error('Error fetching components from database:', error);
        return { items: [], total: 0, hasMore: false, error: error.message };
      }
    } catch (error) {
      console.error('Error in getComponents:', error);
      return { items: [], total: 0, hasMore: false, error: error.message };
    }
  }

  /**
   * Get a single component by path
   */
  public async getComponent(path: string): Promise<ComponentMetadata | null> {
    try {
      if (this.isBrowser) {
        try {
          // Fetch from registry API
          const response = await fetch('/api/component-registry');
          if (!response.ok) {
            throw new Error(`Failed to fetch registry: ${response.status}`);
          }
          
          const result = await response.json();
          if (!result.success || !result.data || !result.data.components) {
            throw new Error('Invalid registry data format');
          }
          
          // Find matching component
          const component = result.data.components.find((c: ComponentMetadata) => c.path === path);
          return component || null;
        } catch (error) {
          console.error(`Error fetching component for path ${path}:`, error);
          return null;
        }
      }
      
      try {
        if (componentRegistryDB.getComponent) {
          return componentRegistryDB.getComponent(path);
        }
      } catch (e) {
        console.warn('Error fetching component from registry:', e);
      }
      return null;
    } catch (error) {
      console.error(`Failed to get component for path ${path}:`, error);
      return null;
    }
  }

  /**
   * Get components that depend on the given component
   */
  public async getDependents(path: string): Promise<ComponentMetadata[]> {
    try {
      if (this.isBrowser) {
        // Get all components via API
        const result = await this.getComponents();
        if (!result.items.length) {
          return [];
        }
        
        // Filter to find components that depend on the given path
        return result.items.filter(component => {
          if (!component.dependencies) return false;
          
          // Check string dependencies or Dependency objects
          return component.dependencies.some(dep => {
            if (typeof dep === 'string') {
              return dep === path;
            }
            return dep.target === path;
          });
        });
      }
      
      // Server-side: Get from database
      if (componentRegistryDB && typeof componentRegistryDB.getDependentComponents === 'function') {
        return componentRegistryDB.getDependentComponents(path);
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching dependents for ${path}:`, error);
      return [];
    }
  }

  /**
   * Get performance metrics for a component
   */
  public async getPerformanceMetrics(path: string, limit: number = 10): Promise<any[]> {
    try {
      const component = await this.getComponent(path);
      
      if (!component || !component.performanceMetrics) {
        return [];
      }
      
      // In a real implementation, this would query a time series database
      // For now, return a simple array with the current metrics
      return [{
        timestamp: new Date(),
        metrics: component.performanceMetrics
      }];
    } catch (error) {
      console.error(`Error fetching performance metrics for ${path}:`, error);
      return [];
    }
  }

  /**
   * Get the latest component changes
   */
  public async getLatestChanges(limit: number = 20): Promise<{ component: ComponentMetadata, change: Change }[]> {
    try {
      // Get all components
      const result = await this.getComponents();
      const changes: { component: ComponentMetadata, change: Change }[] = [];
      
      // Collect all changes with their component info
      result.items.forEach(component => {
        if (component.changeHistory && component.changeHistory.length) {
          component.changeHistory.forEach(change => {
            changes.push({ component, change });
          });
        }
      });
      
      // Sort by date (most recent first)
      changes.sort((a, b) => {
        const dateA = a.change.date instanceof Date ? a.change.date : new Date(a.change.date);
        const dateB = b.change.date instanceof Date ? b.change.date : new Date(b.change.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Limit results
      return changes.slice(0, limit);
    } catch (error) {
      console.error('Error fetching latest changes:', error);
      return [];
    }
  }

  /**
   * Get components with performance regressions
   */
  public async getPerformanceRegressions(threshold: number = 20): Promise<any[]> {
    try {
      // Get all components
      const result = await this.getComponents();
      
      // Filter to components with performance metrics
      const componentsWithMetrics = result.items.filter(
        component => component.performanceMetrics
      );
      
      // In a real implementation, this would compare historical data
      // For now, return an empty array as we can't determine regressions
      return [];
    } catch (error) {
      console.error('Error finding performance regressions:', error);
      return [];
    }
  }

  /**
   * Rescan components (only available on server)
   */
  public async rescanComponents(): Promise<void> {
    if (this.isBrowser) {
      console.warn('Cannot rescan components in browser environment');
      return;
    }
    
    try {
      console.log('Rescanning components...');
      
      if (componentMetadataExtractor && typeof componentMetadataExtractor.scanComponents === 'function') {
        const components = await componentMetadataExtractor.scanComponents();
        console.log(`Found ${components.length} components`);
        
        if (componentRegistryDB && typeof componentRegistryDB.saveComponents === 'function') {
          await componentRegistryDB.saveComponents(components);
          console.log('Components saved to database');
          
          // Notify listeners
          this.notifyChangeListeners({
            type: 'update',
            component: null,
            path: 'all',
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error rescanning components:', error);
    }
  }

  /**
   * Add a listener for component changes
   */
  public addChangeListener(listener: (event: ComponentChangeEvent) => void): void {
    if (!this.changeListeners.includes(listener)) {
      this.changeListeners.push(listener);
      
      // Initialize watcher if this is the first listener
      if (this.changeListeners.length === 1 && !this.isWatcherInitialized) {
        this.initializeWatcher();
      }
    }
  }

  /**
   * Remove a change listener
   */
  public removeChangeListener(listener: (event: ComponentChangeEvent) => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index !== -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of a component change
   */
  private notifyChangeListeners(event: ComponentChangeEvent): void {
    // Clone the listeners array to avoid issues if a listener modifies the array
    const listeners = [...this.changeListeners];
    
    // Notify each listener
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in component change listener:', error);
      }
    });
  }

  /**
   * Sort components by the given field and direction
   */
  private sortComponents(
    components: ComponentMetadata[], 
    sortBy: 'name' | 'lastUpdated', 
    direction: 'asc' | 'desc' = 'asc'
  ): ComponentMetadata[] {
    return [...components].sort((a, b) => {
      let result = 0;
      
      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortBy === 'lastUpdated') {
        // Convert lastUpdated to Date objects if they're not already
        const dateA = a.lastUpdated instanceof Date ? a.lastUpdated : new Date(a.lastUpdated);
        const dateB = b.lastUpdated instanceof Date ? b.lastUpdated : new Date(b.lastUpdated);
        
        result = dateA.getTime() - dateB.getTime();
      }
      
      // Apply sort direction
      return direction === 'asc' ? result : -result;
    });
  }
}

// Export a singleton instance
export const debugComponentApi = new ComponentApi(); 
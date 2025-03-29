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

// Mock browser data that conforms to ComponentMetadata interface
const mockBrowserComponents: ComponentMetadata[] = [
  {
    path: 'src/components/ui/atoms/button/Button.tsx',
    name: 'Button',
    category: 'atom',
    lastUpdated: new Date(),
    exports: ['Button'],
    props: [
      { name: 'variant', type: 'string', required: false, defaultValue: "'primary'" },
      { name: 'size', type: 'string', required: false, defaultValue: "'md'" },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false' }
    ],
    description: 'UI button component with variants',
    examples: ['<Button>Click me</Button>', '<Button variant="secondary">Secondary</Button>'],
    dependencies: ['@/utils/string/utils'],
    version: '1.0.0',
    changeHistory: []
  },
  {
    path: 'src/components/ui/atoms/badge/Badge.tsx',
    name: 'Badge',
    category: 'atom',
    lastUpdated: new Date(),
    exports: ['Badge'],
    props: [
      { name: 'variant', type: 'string', required: false, defaultValue: "'primary'" }
    ],
    description: 'UI badge component',
    examples: ['<Badge>New</Badge>', '<Badge variant="outline">Tag</Badge>'],
    dependencies: ['@/utils/string/utils'],
    version: '1.0.0',
    changeHistory: []
  }
];

/**
 * Client-side compatible API for UI components
 */
export const componentApi = {
  /**
   * Get all components
   */
  async getComponents(): Promise<ComponentMetadata[]> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, return dummy data
      return [
        {
          path: 'src/components/ui/button/Button.tsx',
          name: 'Button',
          category: 'atom' as ComponentCategory,
          lastUpdated: new Date(),
          exports: ['Button'],
          props: [
            { name: 'variant', type: 'string', required: false, defaultValue: "'primary'" },
            { name: 'size', type: 'string', required: false, defaultValue: "'md'" },
            { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false' }
          ],
          description: 'A versatile button component with multiple variants and sizes',
          examples: ['<Button>Click me</Button>', '<Button variant="secondary" size="sm">Small button</Button>'],
          dependencies: ['cn'],
          version: '1.0.0',
          changeHistory: [],
          performanceMetrics: {
            renderTime: 0.8,
            bundleSize: 2.4,
            complexityScore: 1.2
          }
        },
        {
          path: 'src/components/ui/card/Card.tsx',
          name: 'Card',
          category: 'molecule' as ComponentCategory,
          lastUpdated: new Date(),
          exports: ['Card', 'CardContent', 'CardHeader', 'CardFooter', 'CardTitle', 'CardDescription'],
          props: [
            { name: 'bordered', type: 'boolean', required: false, defaultValue: 'true' },
            { name: 'hoverable', type: 'boolean', required: false, defaultValue: 'false' }
          ],
          description: 'A container component for grouping related content',
          examples: ['<Card><CardContent>Content here</CardContent></Card>'],
          dependencies: ['cn'],
          version: '1.0.0',
          changeHistory: [],
          performanceMetrics: {
            renderTime: 1.2,
            bundleSize: 3.6,
            complexityScore: 1.8
          }
        }
      ];
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
      // In a real implementation, this would call an API endpoint
      // For now, return dummy data
      return {
        path: componentPath,
        name: componentPath.split('/').pop()?.replace('.tsx', '') || 'Unknown',
        category: 'atom' as ComponentCategory,
        lastUpdated: new Date(),
        exports: ['Component'],
        props: [
          { name: 'prop1', type: 'string', required: true, defaultValue: undefined },
          { name: 'prop2', type: 'number', required: false, defaultValue: '0' }
        ],
        description: 'Component description',
        examples: ['<Component prop1="value" />'],
        dependencies: ['cn'],
        version: '1.0.0',
        changeHistory: [],
        performanceMetrics: {
          renderTime: 1.0,
          bundleSize: 2.5,
          complexityScore: 1.5
        }
      };
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
      // In a real implementation, this would call an API endpoint
      // For now, return dummy data
      return [
        {
          version: '1.0.0',
          date: new Date(),
          author: 'Developer',
          description: 'Initial version',
          isBreaking: false
        }
      ];
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
      // In a real implementation, this would call an API endpoint
      // For now, return dummy data
      return [
        {
          source: componentPath,
          target: 'src/components/ui/button/Button.tsx',
          type: 'component'
        },
        {
          source: componentPath,
          target: 'src/lib/utils.ts',
          type: 'utility'
        }
      ];
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

  constructor() {
    // Initialize the component watcher if not already initialized and not in browser
    if (!this.isBrowser) {
      this.initializeWatcher();
    } else {
      console.info('ComponentApi: Skipping watcher initialization in browser environment');
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
        
        // Simulate initial components for demo purposes
        setTimeout(() => this.generateMockComponents(), 2000);
      } else {
        console.warn('ComponentApi: File watcher not available or missing start method');
      }
    } catch (error) {
      console.error('Failed to initialize component watcher:', error);
    }
  }

  /**
   * Get all components with optional filtering
   */
  public async getComponents(options: GetComponentsOptions = {}): Promise<ComponentsResult> {
    try {
      // Return mock data in browser environment
      if (this.isBrowser) {
        let filteredComponents = [...mockBrowserComponents];
        
        // Apply category filter if provided
        if (options.category) {
          filteredComponents = filteredComponents.filter(comp => comp.category === options.category);
        }
        
        // Apply search filter if provided
        if (options.search) {
          const searchLower = options.search.toLowerCase();
          filteredComponents = filteredComponents.filter(comp => 
            comp.name.toLowerCase().includes(searchLower) || 
            (comp.description && comp.description.toLowerCase().includes(searchLower))
          );
        }
        
        return {
          items: filteredComponents,
          total: filteredComponents.length,
          hasMore: false
        };
      }

      // Server-side component data retrieval
      let components: ComponentMetadata[] = [];
      
      try {
        if (options.category && componentRegistryDB.getComponentsByCategory) {
          components = componentRegistryDB.getComponentsByCategory(options.category);
        } else if (options.search && componentRegistryDB.searchComponents) {
          components = componentRegistryDB.searchComponents(options.search);
        } else if (componentRegistryDB.getAllComponents) {
          components = componentRegistryDB.getAllComponents();
        } else {
          // Fallback if methods are not available
          components = [];
        }
      } catch (e) {
        console.warn('Error fetching components from registry, using fallback:', e);
        components = [];
      }
      
      // Sort components if requested
      if (options.sortBy) {
        components = this.sortComponents(components, options.sortBy, options.sortDirection);
      }
      
      // Apply pagination if requested
      const total = components.length;
      
      if (options.offset !== undefined || options.limit !== undefined) {
        const offset = options.offset || 0;
        const limit = options.limit || 20;
        components = components.slice(offset, offset + limit);
      }
      
      return {
        items: components,
        total,
        hasMore: (options.offset || 0) + components.length < total
      };
    } catch (error) {
      console.error('Failed to get components:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get a single component by path
   */
  public async getComponent(path: string): Promise<ComponentMetadata | null> {
    try {
      if (this.isBrowser) {
        // Return mock data in browser
        const mockComponent = mockBrowserComponents.find(c => c.path === path);
        if (mockComponent) return mockComponent;
        
        // Return a generic component if not found
        return {
          path,
          name: path.split('/').pop()?.replace('.tsx', '') || 'Unknown',
          category: 'atom',
          lastUpdated: new Date(),
          exports: ['Component'],
          props: [],
          description: 'Browser mock component data',
          examples: ['<Component />'],
          dependencies: [],
          version: '1.0.0',
          changeHistory: []
        };
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
   * Get components that depend on a specific component
   */
  public async getDependents(path: string): Promise<ComponentMetadata[]> {
    try {
      if (this.isBrowser) {
        return []; // Empty array for browser
      }
      
      try {
        if (componentRegistryDB.findDependents) {
          return componentRegistryDB.findDependents(path);
        }
      } catch (e) {
        console.warn('Error finding dependents:', e);
      }
      return [];
    } catch (error) {
      console.error(`Failed to get dependents for path ${path}:`, error);
      return [];
    }
  }

  /**
   * Get performance metrics for a component
   */
  public async getPerformanceMetrics(path: string, limit: number = 10): Promise<any[]> {
    try {
      if (this.isBrowser) {
        return []; // Empty array for browser
      }
      
      try {
        if (componentRegistryDB.getPerformanceMetrics) {
          return componentRegistryDB.getPerformanceMetrics(path, limit);
        }
      } catch (e) {
        console.warn('Error getting performance metrics:', e);
      }
      return [];
    } catch (error) {
      console.error(`Failed to get performance metrics for path ${path}:`, error);
      return [];
    }
  }

  /**
   * Get latest change history across all components
   */
  public async getLatestChanges(limit: number = 20): Promise<{ component: ComponentMetadata, change: Change }[]> {
    try {
      if (this.isBrowser) {
        return []; // Empty array for browser
      }
      
      try {
        if (componentRegistryDB.getLatestChanges) {
          return componentRegistryDB.getLatestChanges(limit);
        }
      } catch (e) {
        console.warn('Error getting latest changes:', e);
      }
      return [];
    } catch (error) {
      console.error('Failed to get latest changes:', error);
      return [];
    }
  }

  /**
   * Get detected performance regressions
   */
  public async getPerformanceRegressions(threshold: number = 20): Promise<any[]> {
    try {
      if (this.isBrowser) {
        return []; // Empty array for browser
      }
      
      try {
        if (componentRegistryDB.detectPerformanceRegressions) {
          return componentRegistryDB.detectPerformanceRegressions(threshold);
        }
      } catch (e) {
        console.warn('Error detecting performance regressions:', e);
      }
      return [];
    } catch (error) {
      console.error('Failed to get performance regressions:', error);
      return [];
    }
  }

  /**
   * Trigger a manual scan of components
   */
  public async rescanComponents(): Promise<void> {
    try {
      if (this.isBrowser) {
        console.info('Component scanning not available in browser environment');
        return;
      }
      
      if (componentFileWatcher && typeof componentFileWatcher.rescanAll === 'function') {
        await componentFileWatcher.rescanAll();
      } else {
        console.warn('ComponentApi: File watcher rescanAll method not available');
      }
    } catch (error) {
      console.error('Failed to rescan components:', error);
    }
  }

  /**
   * Add a change listener to be notified of component changes
   */
  public addChangeListener(listener: (event: ComponentChangeEvent) => void): void {
    if (this.isBrowser) {
      console.info('Change listeners not available in browser environment');
      return;
    }
    
    this.changeListeners.push(listener);
  }

  /**
   * Remove a previously added change listener
   */
  public removeChangeListener(listener: (event: ComponentChangeEvent) => void): void {
    if (this.isBrowser) {
      return;
    }
    
    this.changeListeners = this.changeListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of a component change
   */
  private notifyChangeListeners(event: ComponentChangeEvent): void {
    if (this.isBrowser) {
      return;
    }
    
    this.changeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in component change listener:', error);
      }
    });
  }

  /**
   * Sort components by a specific field
   */
  private sortComponents(
    components: ComponentMetadata[], 
    sortBy: 'name' | 'lastUpdated', 
    direction: 'asc' | 'desc' = 'asc'
  ): ComponentMetadata[] {
    return [...components].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'lastUpdated') {
        comparison = a.lastUpdated.getTime() - b.lastUpdated.getTime();
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Generate mock components for demonstration
   */
  private generateMockComponents(): void {
    if (this.isBrowser) {
      return;
    }
    
    // In a real implementation, this would scan the filesystem
    // and create or update components in the database
    console.log('Generating mock components (simulated)');
  }
}

// Export a singleton instance
export const debugComponentApi = new ComponentApi(); 
/**
 * Unified Component API
 * 
 * This module provides a consistent interface for accessing component data
 * from multiple sources, with the following priority order:
 * 1. Static registry from build-time (via API endpoint)
 * 2. Development registry (in-memory during development)
 * 3. Runtime component discovery (original implementation)
 */

import { ComponentApi, ComponentChangeEvent, ComponentsResult, GetComponentsOptions } from './component-api';
import { generateDevRegistry } from './development-registry';
import { ComponentMetadata } from '../db/registry';

// Environment detection
const isServer = typeof window === 'undefined';
const isBrowser = !isServer;
const isDevelopment = process.env.NODE_ENV === 'development';

// Create registry cache for performance
let registryCache: ComponentsResult | null = null;
let devRegistryCache: Record<string, ComponentMetadata> | null = null;
let lastFetchTime = 0;
let lastDevScanTime = 0;
const CACHE_TTL = 300000; // 5 minutes in milliseconds
const DEV_CACHE_TTL = 60000; // 1 minute in milliseconds for development

/**
 * UnifiedComponentApi provides a consistent interface for component data
 * across different environments, prioritizing static registry when available.
 */
export class UnifiedComponentApi {
  private originalApi: ComponentApi;
  private registryEndpoint: string;
  
  constructor() {
    this.originalApi = new ComponentApi();
    this.registryEndpoint = '/api/component-registry';
  }
  
  /**
   * Get components with unified approach
   * @param options Component filtering/search options
   */
  async getComponents(options: GetComponentsOptions = {}): Promise<ComponentsResult> {
    try {
      // Try to get components from static registry first
      const registryResult = await this.getComponentsFromRegistry(options);
      if (registryResult && registryResult.items.length > 0) {
        return registryResult;
      }
      
      // If in development, try the development registry
      if (isDevelopment) {
        const devRegistryResult = await this.getComponentsFromDevRegistry(options);
        if (devRegistryResult && devRegistryResult.items.length > 0) {
          return devRegistryResult;
        }
      }
      
      // Fall back to original implementation if registry is empty or unavailable
      console.info('Static and development registries unavailable, falling back to runtime discovery');
      return this.originalApi.getComponents(options);
    } catch (error) {
      console.error('Error in unified component API:', error);
      return this.originalApi.getComponents(options);
    }
  }
  
  /**
   * Get a single component by path
   * @param path Component path
   */
  async getComponent(path: string): Promise<any> {
    try {
      // Try to get from registry first
      const registryResult = await this.getComponentsFromRegistry();
      if (registryResult && registryResult.items.length > 0) {
        const component = registryResult.items.find(item => item.path === path);
        if (component) {
          return component;
        }
      }
      
      // If in development, try the development registry
      if (isDevelopment) {
        const devRegistryResult = await this.getComponentsFromDevRegistry();
        if (devRegistryResult && devRegistryResult.items.length > 0) {
          const component = devRegistryResult.items.find(item => item.path === path);
          if (component) {
            return component;
          }
        }
      }
      
      // Fall back to original implementation
      return this.originalApi.getComponent(path);
    } catch (error) {
      console.error('Error getting component:', error);
      return this.originalApi.getComponent(path);
    }
  }
  
  /**
   * Get component dependents
   * @param path Component path
   */
  async getDependents(path: string): Promise<any[]> {
    return this.originalApi.getDependents(path);
  }
  
  /**
   * Get performance metrics
   * @param path Component path
   * @param limit Number of metrics to return
   */
  async getPerformanceMetrics(path: string, limit: number = 10): Promise<any[]> {
    return this.originalApi.getPerformanceMetrics(path, limit);
  }
  
  /**
   * Get latest component changes
   * @param limit Number of changes to return
   */
  async getLatestChanges(limit: number = 20): Promise<any[]> {
    return this.originalApi.getLatestChanges(limit);
  }
  
  /**
   * Get performance regressions
   * @param threshold Regression threshold percentage
   */
  async getPerformanceRegressions(threshold: number = 20): Promise<any[]> {
    return this.originalApi.getPerformanceRegressions(threshold);
  }
  
  /**
   * Rescan components
   */
  async rescanComponents(): Promise<void> {
    // Clear all caches
    registryCache = null;
    devRegistryCache = null;
    lastFetchTime = 0;
    lastDevScanTime = 0;
    
    return this.originalApi.rescanComponents();
  }
  
  /**
   * Add change listener
   */
  addChangeListener(listener: (event: ComponentChangeEvent) => void): void {
    this.originalApi.addChangeListener(listener);
  }
  
  /**
   * Remove change listener
   */
  removeChangeListener(listener: (event: ComponentChangeEvent) => void): void {
    this.originalApi.removeChangeListener(listener);
  }
  
  /**
   * Get components from the development registry
   * @param options Component filtering/search options
   */
  private async getComponentsFromDevRegistry(options: GetComponentsOptions = {}): Promise<ComponentsResult | null> {
    // Only use in development mode and on client-side
    if (!isDevelopment || isServer) {
      return null;
    }
    
    try {
      const now = Date.now();
      
      // Use cache if available and not expired
      if (devRegistryCache && now - lastDevScanTime < DEV_CACHE_TTL) {
        const components = Object.values(devRegistryCache);
        let filteredComponents = [...components];
        
        // Apply filtering if needed
        if (options.search || options.category) {
          filteredComponents = this.filterComponents(components, options);
        }
        
        return {
          items: filteredComponents,
          total: filteredComponents.length,
          hasMore: false
        };
      }
      
      // Generate a fresh development registry
      console.info('Generating development component registry...');
      devRegistryCache = await generateDevRegistry();
      lastDevScanTime = now;
      
      const components = Object.values(devRegistryCache);
      let filteredComponents = [...components];
      
      // Apply filtering if needed
      if (options.search || options.category) {
        filteredComponents = this.filterComponents(components, options);
      }
      
      return {
        items: filteredComponents,
        total: filteredComponents.length,
        hasMore: false
      };
    } catch (error) {
      console.error('Error generating development registry:', error);
      return null;
    }
  }
  
  /**
   * Fetch components from the static registry
   * @param options Component filtering/search options
   */
  private async getComponentsFromRegistry(options: GetComponentsOptions = {}): Promise<ComponentsResult | null> {
    // Skip if server-side
    if (isServer) {
      return null;
    }
    
    try {
      // Use cache if available and not expired
      const now = Date.now();
      if (registryCache && now - lastFetchTime < CACHE_TTL) {
        // Apply filtering to cached results if needed
        if (options.search || options.category) {
          return this.filterCachedResults(registryCache, options);
        }
        return registryCache;
      }
      
      // Fetch from API endpoint
      const response = await fetch(this.registryEndpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch component registry: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!data.success || !data.data || !data.data.components) {
        throw new Error('Invalid registry data format');
      }
      
      // Format the response
      const result: ComponentsResult = {
        items: data.data.components,
        total: data.data.components.length,
        hasMore: false
      };
      
      // Update cache
      registryCache = result;
      lastFetchTime = now;
      
      // Apply filtering if needed
      if (options.search || options.category) {
        return this.filterCachedResults(result, options);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching from registry:', error);
      return null;
    }
  }
  
  /**
   * Apply filtering to cached results
   */
  private filterCachedResults(cache: ComponentsResult, options: GetComponentsOptions): ComponentsResult {
    const filteredItems = this.filterComponents(cache.items, options);
    
    return {
      items: filteredItems,
      total: filteredItems.length,
      hasMore: false
    };
  }
  
  /**
   * Filter components based on search options
   */
  private filterComponents(components: ComponentMetadata[], options: GetComponentsOptions): ComponentMetadata[] {
    let filteredItems = [...components];
    
    // Apply search filter
    if (options.search) {
      const search = options.search.toLowerCase();
      filteredItems = filteredItems.filter(
        item => 
          item.name.toLowerCase().includes(search) || 
          (item.description && item.description.toLowerCase().includes(search))
      );
    }
    
    // Apply category filter
    if (options.category) {
      filteredItems = filteredItems.filter(
        item => item.category === options.category
      );
    }
    
    return filteredItems;
  }
}

// Export a singleton instance
export const unifiedComponentApi = new UnifiedComponentApi();

// Also export the class for testing and extension
export default UnifiedComponentApi; 
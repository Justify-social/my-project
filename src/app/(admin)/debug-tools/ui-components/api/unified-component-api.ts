/**
 * Unified Component API
 * 
 * This module provides a consistent interface for accessing component data
 * from multiple sources using the client adapter pattern.
 */

'use client';

import { ComponentRegistryClientAdapter } from './component-registry-server-adapter';
import { ComponentMetadata } from '@/lib/types/component-registry';

// Interface for component retrieval options
export interface GetComponentsOptions {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

// Interface for component API result
export interface ComponentsResult {
  items: ComponentMetadata[];
  total: number;
  hasMore: boolean;
}

// Event types for component changes
export type ComponentChangeEvent = {
  type: 'added' | 'updated' | 'removed' | 'discovered';
  component: ComponentMetadata;
};

/**
 * UnifiedComponentApi provides a consistent interface for component data
 * across different environments using the client adapter pattern.
 */
export class UnifiedComponentApi {
  private registryAdapter: ComponentRegistryClientAdapter;
  private changeListeners: ((event: ComponentChangeEvent) => void)[] = [];
  
  constructor() {
    this.registryAdapter = new ComponentRegistryClientAdapter();
  }
  
  /**
   * Get components with unified approach
   * @param options Component filtering/search options
   */
  async getComponents(options: GetComponentsOptions = {}): Promise<ComponentsResult> {
    try {
      // Get all components from registry
      let components = await this.registryAdapter.getComponents();
      
      // Apply filtering if needed
      if (options.search) {
        components = await this.registryAdapter.searchComponents(options.search);
      } else if (options.category) {
        components = await this.registryAdapter.getComponentsByCategory(options.category);
      }
      
      // Apply pagination if needed
      const offset = options.offset || 0;
      const limit = options.limit || components.length;
      const paginatedItems = components.slice(offset, offset + limit);
      
      return {
        items: paginatedItems,
        total: components.length,
        hasMore: offset + limit < components.length
      };
    } catch (error) {
      console.error('Error in unified component API:', error);
      return {
        items: [],
        total: 0,
        hasMore: false
      };
    }
  }
  
  /**
   * Get a single component by path
   * @param path Component path
   */
  async getComponent(id: string): Promise<ComponentMetadata | null> {
    try {
      return await this.registryAdapter.getComponent(id);
    } catch (error) {
      console.error('Error getting component:', error);
      return null;
    }
  }
  
  /**
   * Rescan components
   */
  async rescanComponents(): Promise<void> {
    await this.registryAdapter.rescanComponents();
  }
  
  /**
   * Add change listener
   */
  addChangeListener(listener: (event: ComponentChangeEvent) => void): void {
    this.changeListeners.push(listener);
  }
  
  /**
   * Remove change listener
   */
  removeChangeListener(listener: (event: ComponentChangeEvent) => void): void {
    this.changeListeners = this.changeListeners.filter(l => l !== listener);
  }
  
  /**
   * Notify listeners of a component change
   */
  private notifyChange(event: ComponentChangeEvent): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in component change listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const unifiedComponentApi = new UnifiedComponentApi();

// Also export the class for testing and extension
export default UnifiedComponentApi; 
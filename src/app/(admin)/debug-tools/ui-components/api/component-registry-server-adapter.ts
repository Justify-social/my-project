/**
 * Component Registry Server Adapter
 * 
 * This module provides a client-side adapter for the server-only component registry.
 * It uses API endpoints instead of direct imports to maintain proper
 * client/server separation in accordance with Next.js App Router architecture.
 */

// Shared type imports from the Single Source of Truth
import { ComponentMetadata } from '../../../../../lib/types/component-registry';

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Client-side adapter for accessing server-rendered component registry data
 */
export class ComponentRegistryClientAdapter {
  private apiEndpoint: string;
  private cache: ComponentMetadata[] | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 60000; // 1 minute in milliseconds
  
  constructor() {
    this.apiEndpoint = '/api/components/registry';
  }
  
  /**
   * Get all components from the registry
   */
  async getComponents(): Promise<ComponentMetadata[]> {
    try {
      // Use cache if available and not expired
      const now = Date.now();
      if (this.cache && now - this.lastFetchTime < this.CACHE_TTL) {
        return this.cache;
      }
      
      // Fetch from API endpoint
      const response = await fetch(this.apiEndpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch component registry: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update cache
      this.cache = data.components || [];
      this.lastFetchTime = now;
      
      return this.cache || [];
    } catch (error) {
      console.error('Error fetching component registry:', error);
      return [];
    }
  }
  
  /**
   * Get a single component by ID
   */
  async getComponent(id: string): Promise<ComponentMetadata | null> {
    try {
      const components = await this.getComponents();
      return components.find(component => component.id === id) || null;
    } catch (error) {
      console.error(`Error getting component ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Rescan components (development only)
   */
  async rescanComponents(): Promise<boolean> {
    if (!isDevelopment) {
      console.warn('Component rescanning is only available in development mode');
      return false;
    }
    
    try {
      // Clear cache
      this.cache = null;
      this.lastFetchTime = 0;
      
      // Call rescan endpoint
      const response = await fetch(`${this.apiEndpoint}/rescan`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to rescan components: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error rescanning components:', error);
      return false;
    }
  }
  
  /**
   * Filter components by category
   */
  async getComponentsByCategory(category: string): Promise<ComponentMetadata[]> {
    try {
      const components = await this.getComponents();
      return components.filter(component => 
        component.category?.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error(`Error getting components by category ${category}:`, error);
      return [];
    }
  }
  
  /**
   * Search components by name or description
   */
  async searchComponents(query: string): Promise<ComponentMetadata[]> {
    try {
      const components = await this.getComponents();
      const lowercaseQuery = query.toLowerCase();
      
      return components.filter(component => 
        component.name.toLowerCase().includes(lowercaseQuery) ||
        (component.description && component.description.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error(`Error searching components for "${query}":`, error);
      return [];
    }
  }
} 
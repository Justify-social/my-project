import {
  ComponentMetadata,
  ComponentCategory,
  ComponentsResult,
  ComponentChangeEvent,
  ComponentChangeEventType,
  GetComponentsOptions
} from '../types';

/**
 * ComponentRegistryManager
 * 
 * A singleton class that acts as a central hub for managing UI component metadata.
 * It provides methods for registering components, retrieving components by category,
 * and notifying listeners when the registry changes.
 * 
 * Simplified implementation to only load from static registry file.
 */
export class ComponentRegistryManager {
  private static instance: ComponentRegistryManager;
  private registry: Map<string, ComponentMetadata> = new Map();
  private listeners: Set<() => void> = new Set();
  
  private constructor() {
    // Singleton constructor
  }
  
  /**
   * Get the singleton instance of the ComponentRegistryManager
   */
  static getInstance(): ComponentRegistryManager {
    if (!ComponentRegistryManager.instance) {
      ComponentRegistryManager.instance = new ComponentRegistryManager();
    }
    return ComponentRegistryManager.instance;
  }
  
  /**
   * Register a component in the registry
   * @param component Component metadata to register
   */
  registerComponent(component: ComponentMetadata): void {
    const key = this.generateComponentKey(component);
    this.registry.set(key, component);
    this.notifyListeners();
  }
  
  /**
   * Register multiple components at once
   * @param components Array of component metadata to register
   */
  registerComponents(components: ComponentMetadata[]): void {
    let hasChanges = false;
    
    components.forEach(component => {
      const key = this.generateComponentKey(component);
      if (!this.registry.has(key)) {
        this.registry.set(key, component);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.notifyListeners();
    }
  }
  
  /**
   * Generate a unique key for a component
   * @param component Component metadata
   * @returns Unique key string
   */
  private generateComponentKey(component: ComponentMetadata): string {
    return `${component.category}:${component.name}`;
  }
  
  /**
   * Get all components in the registry
   * @returns Array of all component metadata
   */
  getAllComponents(): ComponentMetadata[] {
    return Array.from(this.registry.values());
  }
  
  /**
   * Get components filtered by category
   * @param category Optional category to filter by
   * @returns Array of filtered component metadata
   */
  getComponentsByCategory(category?: ComponentCategory): ComponentMetadata[] {
    const components = this.getAllComponents();
    return category 
      ? components.filter(c => c.category === category)
      : components;
  }
  
  /**
   * Get a component by name
   * @param name Component name to look for
   * @returns Component metadata or undefined if not found
   */
  getComponentByName(name: string): ComponentMetadata | undefined {
    const components = this.getAllComponents();
    return components.find(component => component.name === name);
  }
  
  /**
   * Add a listener for registry changes
   * @param listener Function to call when registry changes
   */
  addListener(listener: () => void): void {
    this.listeners.add(listener);
  }
  
  /**
   * Remove a listener
   * @param listener Function to remove from listeners
   */
  removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }
  
  /**
   * Notify all listeners of registry changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in registry change listener:', error);
      }
    });
  }
  
  /**
   * Reset the registry (for testing/debug)
   */
  reset(): void {
    this.registry.clear();
    this.notifyListeners();
  }
  
  /**
   * Initialize the registry from static file
   */
  async initialize(): Promise<void> {
    // Load from static registry file
    await this.loadFromStaticRegistry();
    this.notifyListeners();
  }
  
  /**
   * Load components from static registry file
   */
  private async loadFromStaticRegistry(): Promise<void> {
    // Load from static JSON file in public directory
    try {
      const response = await fetch('/static/component-registry.json');
      if (!response.ok) {
        console.warn(`Failed to load static registry: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data.components)) {
        console.log(`Loaded ${data.components.length} components from static registry`);
        
        // Convert string dates to Date objects before registering
        const components = data.components.map((comp: any) => ({
          ...comp,
          lastUpdated: new Date(comp.lastUpdated),
          changeHistory: (comp.changeHistory || []).map((change: any) => ({
            ...change,
            date: change.date ? new Date(change.date) : new Date()
          }))
        }));
        
        components.forEach((comp: ComponentMetadata) => this.registerComponent(comp));
      }
    } catch (error) {
      console.warn('Failed to load static registry:', error);
    }
  }
} 
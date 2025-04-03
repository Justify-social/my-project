/**
 * Server Component Registry
 * 
 * This module provides the server-side implementation of the Component Registry.
 * It serves as the Single Source of Truth for component data in server-side code.
 */

// Mark as server-only to ensure proper Next.js separation
'use server';

// Import shared types from our SSOT
import { 
  ComponentMetadata, 
  ComponentChange, 
  ComponentRegistryInterface,
  ComponentCategory,
  DBChange 
} from '../types/component-registry';

// Server-side only imports
import { randomUUID } from 'crypto';

/**
 * Server-side implementation of the Component Registry
 */
export class ServerComponentRegistry implements ComponentRegistryInterface {
  private components: Map<string, ComponentMetadata>;
  private changes: ComponentChange[];
  
  constructor() {
    this.components = new Map();
    this.changes = [];
    
    // Initialize the registry with static data
    this.initializeRegistry();
  }
  
  /**
   * Get all components
   */
  async getComponents(): Promise<ComponentMetadata[]> {
    return Array.from(this.components.values());
  }
  
  /**
   * Get a component by ID
   */
  async getComponentById(id: string): Promise<ComponentMetadata | null> {
    return this.components.get(id) || null;
  }
  
  /**
   * Get components by category
   */
  async getComponentsByCategory(category: string): Promise<ComponentMetadata[]> {
    const normalizedCategory = category.toLowerCase();
    return Array.from(this.components.values())
      .filter(component => component.category.toString().toLowerCase() === normalizedCategory);
  }
  
  /**
   * Search components by name or description
   */
  async searchComponents(query: string): Promise<ComponentMetadata[]> {
    const normalizedQuery = query.toLowerCase();
    return Array.from(this.components.values())
      .filter(component => 
        component.name.toLowerCase().includes(normalizedQuery) ||
        (component.description && component.description.toLowerCase().includes(normalizedQuery))
      );
  }
  
  /**
   * Add a component change
   */
  async addChange(change: Omit<ComponentChange, 'id' | 'timestamp'>): Promise<ComponentChange> {
    const newChange: ComponentChange = {
      ...change,
      id: randomUUID(),
      timestamp: new Date(),
    };
    
    this.changes.push(newChange);
    return newChange;
  }
  
  /**
   * Get component change history
   */
  async getChangeHistory(componentId?: string): Promise<ComponentChange[]> {
    if (componentId) {
      return this.changes.filter(change => change.componentId === componentId);
    }
    
    return this.changes;
  }
  
  /**
   * Initialize the registry with static data
   * In a real implementation, this would load data from a database
   */
  private initializeRegistry(): void {
    // Add some example components to the registry
    const exampleComponents: ComponentMetadata[] = [
      {
        id: 'button',
        name: 'Button',
        path: '/components/ui/atoms/button/Button.tsx',
        category: ComponentCategory.ATOMS,
        description: 'A button component with multiple variants',
        tags: ['interactive', 'form', 'button'],
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'outline' | 'ghost'",
            required: false,
            description: 'The button style variant',
            defaultValue: 'primary'
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            required: false,
            description: 'The button size',
            defaultValue: 'md'
          },
        ],
        examples: [
          {
            title: 'Primary Button',
            description: 'Default primary button style',
            code: "<Button variant='primary'>Click Me</Button>",
            preview: true
          }
        ],
        hasStorybook: true,
        hasTests: true
      },
      {
        id: 'alert',
        name: 'Alert',
        path: '/components/ui/atoms/feedback/alert/Alert.tsx',
        category: ComponentCategory.ATOMS,
        description: 'An alert component for displaying messages',
        tags: ['feedback', 'alert', 'notification'],
        props: [
          {
            name: 'variant',
            type: "'info' | 'success' | 'warning' | 'error'",
            required: false,
            description: 'The alert style variant',
            defaultValue: 'info'
          },
          {
            name: 'title',
            type: 'string',
            required: false,
            description: 'The alert title',
          },
        ],
        examples: [],
        hasStorybook: true,
        hasTests: true
      }
    ];
    
    // Add components to the registry
    exampleComponents.forEach(component => {
      this.components.set(component.id, component);
    });
    
    // Add example changes
    const exampleChanges: ComponentChange[] = [
      {
        id: randomUUID(),
        componentId: 'button',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        author: 'developer@example.com',
        description: 'Added new "ghost" variant',
        changeType: 'updated',
        version: '1.1.0'
      },
      {
        id: randomUUID(),
        componentId: 'alert',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        author: 'designer@example.com',
        description: 'Initial implementation',
        changeType: 'added',
        version: '1.0.0'
      }
    ];
    
    // Add changes to the registry
    this.changes.push(...exampleChanges);
  }
  
  /**
   * Convert a DBChange to a ComponentChange
   * In a real implementation, this would convert database records to model objects
   */
  private mapDBChangeToComponentChange(dbChange: DBChange): ComponentChange {
    return {
      id: dbChange.id,
      componentId: dbChange.componentId,
      timestamp: new Date(dbChange.timestamp),
      author: dbChange.author,
      description: dbChange.description,
      changeType: dbChange.changeType as 'added' | 'updated' | 'deprecated' | 'removed',
      version: dbChange.version
    };
  }
} 
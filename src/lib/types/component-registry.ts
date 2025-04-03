/**
 * Component Registry Types
 * 
 * Central type definitions for the component registry system.
 * This file serves as the Single Source of Truth for all type definitions
 * related to the component registry, ensuring consistency across the codebase.
 */

/**
 * Component categories based on Atomic Design principles
 */
export enum ComponentCategory {
  ATOMS = 'atom',
  MOLECULES = 'molecule',
  ORGANISMS = 'organism',
  TEMPLATES = 'template',
  PATTERNS = 'pattern',
  DEPRECATED = 'deprecated'
}

/**
 * Definition of a component property/prop
 */
export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

/**
 * Component example with title, description and code
 */
export interface ComponentExample {
  title: string;
  description?: string;
  code: string;
  preview?: boolean;
}

/**
 * Component metadata providing comprehensive information about a UI component
 */
export interface ComponentMetadata {
  // Core component identification
  id: string;
  name: string;
  path: string;
  category: ComponentCategory | string;
  
  // Documentation fields
  description?: string;
  tags?: string[];
  props: PropDefinition[];
  examples: ComponentExample[];
  
  // Additional metadata
  hasStorybook?: boolean;
  hasTests?: boolean;
  version?: string;
  lastUpdated?: Date;
  author?: string;
  maintainers?: string[];
  dependencies?: string[];
  changeHistory?: ComponentChange[];
}

/**
 * Represents a change to a component
 */
export interface ComponentChange {
  id: string;
  componentId: string;
  timestamp: Date;
  author?: string;
  description: string;
  changeType: 'added' | 'updated' | 'deprecated' | 'removed';
  version?: string;
}

/**
 * Database component change record
 */
export interface DBChange {
  id: string;
  componentId: string;
  timestamp: Date;
  author?: string;
  description: string;
  changeType: string;
  version?: string;
}

/**
 * Component registry interface defining methods for accessing component data
 */
export interface ComponentRegistryInterface {
  // Core methods
  getComponents(): Promise<ComponentMetadata[]>;
  getComponentById(id: string): Promise<ComponentMetadata | null>;
  getComponentsByCategory(category: string): Promise<ComponentMetadata[]>;
  searchComponents(query: string): Promise<ComponentMetadata[]>;
  
  // Change tracking
  addChange(change: Omit<ComponentChange, 'id' | 'timestamp'>): Promise<ComponentChange>;
  getChangeHistory(componentId?: string): Promise<ComponentChange[]>;
} 
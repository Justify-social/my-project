/**
 * Component Registry Types
 * 
 * This file defines the data structures and types used throughout the 
 * component registry system.
 */

/**
 * UI Component category according to Atomic Design principles
 */
export type ComponentCategory = 'atom' | 'molecule' | 'organism';

/**
 * Definition of a component property
 */
export interface PropDefinition {
  name: string;
  type: string;
  description?: string;
  defaultValue?: string;
  required: boolean;
}

/**
 * Component change history entry
 */
export interface Change {
  version: string;
  date: Date;
  author?: string;
  description: string;
  isBreaking: boolean;
  migrationGuide?: string;
}

/**
 * Component performance metrics
 */
export interface PerformanceMetrics {
  renderTime: number | string;
  bundleSize: number | string; 
  complexityScore?: number | string;
}

/**
 * Component metadata structure
 */
export interface ComponentMetadata {
  // Unique identifier for the component
  id?: string;
  // Relative path to the component file
  path: string;
  // Display name of the component
  name: string;
  // Component category in atomic design
  category: ComponentCategory;
  // When the component was last updated
  lastUpdated: Date;
  // Component description from JSDoc
  description?: string;
  // Exported names from the component file
  exports: string[];
  // Properties/props accepted by the component
  props: PropDefinition[];
  // Code examples from JSDoc
  examples: string[];
  // Component dependencies
  dependencies: string[];
  // Component version number
  version: string;
  // History of changes to the component
  changeHistory: Change[];
  // Performance metrics
  performanceMetrics?: PerformanceMetrics;
}

/**
 * Component dependency reference
 */
export interface Dependency {
  path: string;
  name: string;
  type: 'component' | 'utility' | 'hook' | 'context' | 'other';
}

/**
 * Registry entry with search metadata
 */
export interface RegistryEntry extends ComponentMetadata {
  // Search-friendly keywords for the component
  keywords: string[];
  // Usage score (calculated from imports/usage)
  usageScore: number;
  // Timestamp when added to registry
  registered: Date;
}

/**
 * Component search options
 */
export interface ComponentSearchOptions {
  query?: string;
  category?: ComponentCategory;
  tags?: string[];
  sortBy?: 'name' | 'category' | 'lastUpdated' | 'usageScore';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
} 
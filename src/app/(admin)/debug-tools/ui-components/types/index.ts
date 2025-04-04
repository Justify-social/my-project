/**
 * UI Components Types Module
 * 
 * This module consolidates all type definitions used throughout the UI component system.
 * It provides a single source of truth for types related to component metadata,
 * registry interactions, and component properties.
 */

import type { ReactNode, ComponentType } from 'react';

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
 * Performance metrics for a component
 */
export interface PerformanceMetrics {
  renderTime: number | string;
  bundleSize: number | string;
  complexityScore?: number | string;
  lazyLoaded?: boolean;
  dependencies?: number;
}

/**
 * Record of component changes
 */
export interface Change {
  date: Date;
  author?: string;
  description: string;
  version: string;
  isBreaking: boolean;
  migrationGuide?: string;
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
  // New properties
  library?: 'atomic' | 'shadcn';
  isNamespaced?: boolean;
  originalName?: string;
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

/**
 * Options for querying components
 */
export interface GetComponentsOptions {
  category?: ComponentCategory;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: 'name' | 'lastUpdated' | 'category';
  sortDirection?: 'asc' | 'desc';
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
 * Options for metadata extraction process
 */
export interface MetadataExtractionOptions {
  extractProps: boolean;
  extractExamples: boolean;
  extractDependencies: boolean;
  extractJSDoc: boolean;
}

/**
 * UI Component interface representing a rendered UI component
 */
export interface UIComponent {
  name: string;
  component: ComponentType<any>;
  category: ComponentCategory;
  props?: Record<string, any>;
  examples?: string[];
  description?: string;
}

/**
 * Re-export types from other files for backward compatibility
 */
export type {
  ComponentMetadata as ComponentData,
  PropDefinition as PropDef,
  ComponentCategory as AtomicCategory
}; 
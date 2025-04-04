/**
 * Types for the component registry system
 */
export interface ComponentMetadata {
  id: string;
  name: string;
  path: string;
  category: string;
  description?: string;
  type?: string;
  props?: {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: string;
  }[];
  examples?: {
    name: string;
    code: string;
    description?: string;
  }[];
  tags?: string[];
  dependencies?: string[];
  usedBy?: string[];
  // New fields for component library management
  originalName?: string;      // Original name before namespacing
  isNamespaced?: boolean;     // Whether this component has been namespaced
  library?: 'atomic' | 'shadcn'; // The component library this belongs to
  exportName?: string;        // Specific export name to use for resolution
}

export interface ComponentRegistryData {
  components: ComponentMetadata[];
  lastUpdated: string;
  version: string;
}

// Single Source of Truth for component registry
export const STATIC_REGISTRY_PATH = '/static/component-registry.json'; 
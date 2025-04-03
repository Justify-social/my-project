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
}

export interface ComponentRegistryData {
  components: ComponentMetadata[];
  lastUpdated: string;
  version: string;
}

export const STATIC_REGISTRY_PATH = '/static/component-registry.json'; 
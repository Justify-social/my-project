/**
 * Shared type definitions for the UI Component Browser.
 */

// Component Categories
export const CATEGORIES = ['atom', 'molecule', 'organism', 'template', 'page', 'unknown'] as const;
export type ComponentCategory = (typeof CATEGORIES)[number];

// Component Render Types
export type ComponentRenderType = 'server' | 'client';

// Component Status
export type ComponentStatus = 'stable' | 'beta' | 'deprecated';

// Base Component Metadata (parsed from JSDoc)
export interface ComponentMetadata {
  name: string;
  filePath: string; // Relative path from project root (e.g., /src/components/ui/button.tsx)
  description?: string;
  category: ComponentCategory;
  subcategory?: string | null;
  renderType: ComponentRenderType;
  status?: ComponentStatus;
  author?: string;
  since?: string;
  examples?: string[];
}

// Extended metadata potentially used in the registry
export interface ExtendedComponentMetadata extends ComponentMetadata {
  documentationUrl?: string; // Example extension
  tags?: string[]; // Example extension
}

// Structure of the component registry served by the API
export type ComponentRegistry = {
  components: ExtendedComponentMetadata[];
  byCategory: Record<ComponentCategory, ExtendedComponentMetadata[]>;
  byName: Record<string, ExtendedComponentMetadata>; // Lowercase name as key
  allCategories: readonly ComponentCategory[];
};

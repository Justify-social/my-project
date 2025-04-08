"use server";

/**
 * Component Discovery Utility
 * 
 * This utility provides functions for discovering UI components,
 * extracting metadata, and organizing components by category.
 */

import fs from 'fs';
import path from 'path';
import { ComponentMetadata } from '@/components/ui/utils/classify';

// Constants
const UI_COMPONENTS_DIR = path.join(process.cwd(), 'src/components/ui');
const CATEGORIES = ['atom', 'molecule', 'organism', 'template', 'page'] as const;
export type ComponentCategory = typeof CATEGORIES[number];

// Extended component metadata with filePath
export interface ExtendedComponentMetadata extends ComponentMetadata {
  filePath?: string;
  documentationUrl?: string;
  tags?: string[];
}

// Component registry type
export type ComponentRegistry = {
  components: ExtendedComponentMetadata[];
  byCategory: Record<ComponentCategory, ExtendedComponentMetadata[]>;
  byName: Record<string, ExtendedComponentMetadata>;
  allCategories: readonly ComponentCategory[];
};

/**
 * Discover all UI components and extract their metadata
 * 
 * @returns Array of component metadata
 */
export async function discoverComponents(): Promise<ExtendedComponentMetadata[]> {
  const componentsDir = UI_COMPONENTS_DIR;
  
  try {
    // Read component directory
    const files = await fs.promises.readdir(componentsDir);
    
    // Filter for TypeScript files excluding utils directory and index files
    const componentFiles = files.filter(file => 
      file.endsWith('.tsx') && 
      !file.startsWith('index') &&
      !file.includes('utils/')
    );
    
    // Extract metadata from each component file
    const componentsWithMetadata = await Promise.all(
      componentFiles.map(async (file) => {
        const filePath = path.join(componentsDir, file);
        return getComponentMetadata(filePath);
      })
    );
    
    // Filter out any null values (components without metadata)
    return componentsWithMetadata.filter(Boolean) as ExtendedComponentMetadata[];
  } catch (error) {
    console.error('Error discovering components:', error);
    return [];
  }
}

/**
 * Group components by category (atom, molecule, organism, etc.)
 * 
 * @param components Array of component metadata
 * @returns Record with components grouped by category
 */
export async function groupComponentsByCategory(
  components: ExtendedComponentMetadata[]
): Promise<Record<ComponentCategory, ExtendedComponentMetadata[]>> {
  // Initialize categories
  const grouped = CATEGORIES.reduce((acc, category) => {
    acc[category] = [];
    return acc;
  }, {} as Record<ComponentCategory, ExtendedComponentMetadata[]>);
  
  // Group components by category
  components.forEach(component => {
    const category = component.category as ComponentCategory;
    if (grouped[category]) {
      grouped[category].push(component);
    } else {
      // Default to atom if category is not recognized
      grouped.atom.push(component);
    }
  });
  
  return grouped;
}

/**
 * Extract metadata from a component file
 * 
 * @param filePath Path to the component file
 * @returns Component metadata or null if extraction fails
 */
export async function getComponentMetadata(filePath: string): Promise<ExtendedComponentMetadata | null> {
  try {
    // Read file content
    const content = await fs.promises.readFile(filePath, 'utf-8');
    
    // Get file name without extension
    const fileName = path.basename(filePath).replace('.tsx', '');
    
    // Import the classify utility to parse metadata
    const { parseComponentMetadata } = await import('@/components/ui/utils/classify');
    
    // Parse metadata from file content
    const metadata = parseComponentMetadata(content);
    
    if (!metadata) {
      console.warn(`No metadata found for component: ${fileName}`);
      return null;
    }
    
    return {
      ...metadata,
      filePath: filePath.replace(process.cwd(), ''),
    };
  } catch (error) {
    console.error(`Error extracting metadata for ${filePath}:`, error);
    return null;
  }
}

/**
 * Build a searchable component registry
 * 
 * @returns Component registry with various lookup methods
 */
export async function buildComponentRegistry(): Promise<ComponentRegistry> {
  // Discover all components
  const components = await discoverComponents();
  
  // Group by category
  const byCategory = await groupComponentsByCategory(components);
  
  // Create name lookup
  const byName = components.reduce((acc, component) => {
    acc[component.name.toLowerCase()] = component;
    return acc;
  }, {} as Record<string, ExtendedComponentMetadata>);
  
  return {
    components,
    byCategory,
    byName,
    allCategories: CATEGORIES,
  };
}

// Cache registry in development to avoid repeated file system access
let cachedRegistry: ComponentRegistry | null = null;

/**
 * Get component registry (cached in development)
 * 
 * @param forceRefresh Force refresh the registry
 * @returns Component registry
 */
export async function getComponentRegistry(forceRefresh = false): Promise<ComponentRegistry> {
  // If we already have a cached registry and don't need to refresh, return it
  if (!forceRefresh && cachedRegistry) {
    return cachedRegistry;
  }
  
  // In production, use the pre-built static registry
  if (process.env.NODE_ENV === 'production') {
    try {
      // Import the static registry JSON file
      const staticRegistryPath = path.join(process.cwd(), 'src/components/ui/utils/component-registry.json');
      const staticRegistry = JSON.parse(fs.readFileSync(staticRegistryPath, 'utf-8'));
      
      console.log('Using static component registry for production');
      cachedRegistry = staticRegistry;
      return staticRegistry;
    } catch (error) {
      console.error('Error loading static component registry:', error);
      console.warn('Falling back to dynamic component discovery');
      // If static registry fails, fall back to dynamic discovery
    }
  }
  
  // For development or if static registry fails, build dynamically
  const registry = await buildComponentRegistry();
  
  // Cache the registry
  cachedRegistry = registry;
  
  return registry;
}

/**
 * Search for components by name or description
 * 
 * @param query Search query
 * @param registry Component registry
 * @returns Matching components
 */
export async function searchComponents(
  query: string,
  registry: ComponentRegistry
): Promise<ExtendedComponentMetadata[]> {
  if (!query) return registry.components;
  
  const normalizedQuery = query.toLowerCase();
  
  return registry.components.filter(component => {
    const name = component.name.toLowerCase();
    const description = (component.description || '').toLowerCase();
    
    return (
      name.includes(normalizedQuery) || 
      description.includes(normalizedQuery)
    );
  });
}

/**
 * Get a component by name
 * 
 * @param name Component name
 * @param registry Component registry
 * @returns Component metadata or undefined
 */
export async function getComponentByName(
  name: string,
  registry: ComponentRegistry
): Promise<ExtendedComponentMetadata | undefined> {
  return registry.byName[name.toLowerCase()];
}

/**
 * Filter components by category
 * 
 * @param category Category to filter by
 * @param registry Component registry
 * @returns Components in the specified category
 */
export async function getComponentsByCategory(
  category: ComponentCategory,
  registry: ComponentRegistry
): Promise<ExtendedComponentMetadata[]> {
  return registry.byCategory[category] || [];
} 
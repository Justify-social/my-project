/**
 * Component Discovery Utility
 * 
 * This utility provides functions for discovering UI components,
 * extracting metadata, and organizing components by category.
 */

import fs from 'fs';
import path from 'path';
// Import shared types
import {
  type ComponentMetadata,
  type ExtendedComponentMetadata,
  type ComponentCategory,
  type ComponentRenderType,
  type ComponentStatus,
  type ComponentRegistry,
  CATEGORIES
} from '../types'; // Adjust path if needed

// Constants
const UI_COMPONENTS_DIR = path.join(process.cwd(), 'src/components/ui');

// --- Helper Functions for Metadata Extraction --- (Modeled after classify.ts logic)

/** Extracts a single value string for a given JSDoc tag. */
const extractTagValue = (jsdoc: string, tagName: string): string | null => {
  const match = jsdoc.match(new RegExp(`@${tagName}\\s+([^\\n\\r*]+)`));
  return match?.[1]?.trim().replace(/\*+$/, '').trim() || null;
};

/** Extracts code examples from @example blocks. */
const extractExamples = (jsdoc: string): string[] => {
  const exampleMatches = [...jsdoc.matchAll(/@example(?:\s+\[[^\]]*\])?\s*```(?:tsx|jsx)?\s*([\s\S]*?)```/g)];
  return exampleMatches.map(match => match[1].trim());
};

/** Validates and returns the component category. */
const parseCategory = (jsdoc: string): ComponentCategory => {
  const value = extractTagValue(jsdoc, 'category')?.toLowerCase();
  if (value && CATEGORIES.includes(value as ComponentCategory)) {
    return value as ComponentCategory;
  }
  return 'unknown'; // Default category
};

/** Validates and returns the component render type. */
const parseRenderType = (jsdoc: string, fileContent: string): ComponentRenderType => {
  const value = extractTagValue(jsdoc, 'renderType')?.toLowerCase();
  if (value === 'server' || value === 'client') {
    return value;
  }
  // Check for 'use client' directive as fallback
  if (fileContent.match(/^\s*['\"]use client['\"]/m)) {
    return 'client';
  }
  return 'server'; // Default render type
};

/** Validates and returns the component status. */
const parseStatus = (jsdoc: string): ComponentStatus | undefined => {
  const value = extractTagValue(jsdoc, 'status')?.toLowerCase();
  const validStatuses: ComponentStatus[] = ['stable', 'beta', 'deprecated'];
  if (value && validStatuses.includes(value as ComponentStatus)) {
    return value as ComponentStatus;
  }
  return undefined; // Default: no status or invalid status
};

// --- Main Discovery and Registry Functions ---

/**
 * Parses JSDoc comments from a file content to extract component metadata.
 */
const extractComponentMetadata = (filePath: string): ExtendedComponentMetadata | null => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Use corrected regex to find the first JSDoc block
    const jsdocMatch = content.match(/^\s*\/\*\*[\s\S]*?\*\//m);
    if (!jsdocMatch) {
      // console.warn(`No JSDoc block found in: ${filePath}`);
      return null; // Skip files without JSDoc
    }
    const jsdoc = jsdocMatch[0];

    // Extract metadata using helper functions
    const metadata: ExtendedComponentMetadata = {
      name: extractTagValue(jsdoc, 'component') || path.basename(filePath, path.extname(filePath)),
      filePath: filePath.replace(process.cwd(), ''),
      category: parseCategory(jsdoc),
      subcategory: extractTagValue(jsdoc, 'subcategory'),
      renderType: parseRenderType(jsdoc, content),
      description: extractTagValue(jsdoc, 'description') || '',
      status: parseStatus(jsdoc),
      author: extractTagValue(jsdoc, 'author') || '',
      since: extractTagValue(jsdoc, 'since') || '',
      examples: extractExamples(jsdoc),
      // Initialize other ExtendedComponentMetadata fields if needed
      // documentationUrl: undefined,
      // tags: [],
    };

    // Basic validation
    if (!metadata.name) {
      console.warn(`Could not determine component name for: ${filePath}`);
      return null;
    }

    return metadata;
  } catch (error) {
    console.error(`Error reading or parsing file ${filePath}:`, error);
    return null;
  }
};

/**
 * Recursively finds all .tsx files in a directory, excluding specified patterns.
 */
const findComponentFiles = (dir: string, results: string[] = []): string[] => {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Exclude specific directories more reliably
        if (entry.name === 'utils' || entry.name === 'types' || entry.name === 'client' || entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }
        findComponentFiles(fullPath, results);
      } else if (entry.isFile() && entry.name.endsWith('.tsx') && !entry.name.includes('.stories.') && !entry.name.startsWith('index.')) {
        results.push(fullPath);
      }
    }
  } catch (readDirError) {
    console.error(`Could not read directory ${dir}:`, readDirError);
  }
  return results;
};

/**
 * Discovers all UI components by finding files and extracting metadata.
 */
export const discoverComponents = async (): Promise<ExtendedComponentMetadata[]> => {
  console.log(`Starting component discovery in: ${UI_COMPONENTS_DIR}`);
  const componentFiles = findComponentFiles(UI_COMPONENTS_DIR);
  console.log(`Found ${componentFiles.length} potential component files.`);

  const components = componentFiles
    .map(extractComponentMetadata)
    .filter((c): c is ExtendedComponentMetadata => c !== null);

  console.log(`Successfully extracted metadata for ${components.length} components.`);
  return components;
};

/**
 * Group components by category.
 */
export function groupComponentsByCategory(
  components: ExtendedComponentMetadata[]
): Record<ComponentCategory, ExtendedComponentMetadata[]> {
  const grouped = CATEGORIES.reduce((acc, category) => {
    acc[category] = [];
    return acc;
  }, {} as Record<ComponentCategory, ExtendedComponentMetadata[]>);

  components.forEach(component => {
    // Use the validated category from metadata
    const category = component.category;
    if (grouped[category]) {
      grouped[category].push(component);
    } else {
      // This case should ideally not happen if category is always validated
      console.warn(`Component ${component.name} has unknown category: ${category}. Placing in 'unknown'.`);
      grouped.unknown.push(component);
    }
  });

  return grouped;
}

/**
 * Build a searchable component registry.
 */
export async function buildComponentRegistry(): Promise<ComponentRegistry> {
  const components = await discoverComponents();
  const byCategory = groupComponentsByCategory(components); // Use synchronous grouping

  const byName = components.reduce((acc, component) => {
    // Use component.name which should be valid based on extraction logic
    if (component.name) {
      acc[component.name.toLowerCase()] = component;
    }
    return acc;
  }, {} as Record<string, ExtendedComponentMetadata>);

  return {
    components,
    byCategory,
    byName,
    allCategories: CATEGORIES,
  };
}

// Cache registry logic remains the same
let cachedRegistry: ComponentRegistry | null = null;

export async function getComponentRegistry(forceRefresh = false): Promise<ComponentRegistry> {
  if (!forceRefresh && cachedRegistry) {
    return cachedRegistry;
  }

  // Production check for static registry remains the same
  if (process.env.NODE_ENV === 'production') {
    try {
      const staticRegistryPath = path.join(process.cwd(), 'src/components/ui/utils/component-registry.json');
      const staticRegistryData = fs.readFileSync(staticRegistryPath, 'utf-8');
      const staticRegistry: ComponentRegistry = JSON.parse(staticRegistryData);
      console.log('Using static component registry for production');
      cachedRegistry = staticRegistry;
      return staticRegistry;
    } catch (error) {
      console.error('Error loading static component registry:', error);
      console.warn('Falling back to dynamic component discovery');
    }
  }

  const registry = await buildComponentRegistry();
  cachedRegistry = registry;
  return registry;
}

// Search and getter functions remain largely the same, just ensure they use the registry correctly

export async function searchComponents(
  query: string,
  registry: ComponentRegistry
): Promise<ExtendedComponentMetadata[]> {
  if (!query) return registry.components;
  const normalizedQuery = query.toLowerCase();
  return registry.components.filter(component => {
    const nameMatch = component.name?.toLowerCase().includes(normalizedQuery);
    const descriptionMatch = component.description?.toLowerCase().includes(normalizedQuery);
    return nameMatch || descriptionMatch;
  });
}

export async function getComponentByName(
  name: string,
  registry: ComponentRegistry
): Promise<ExtendedComponentMetadata | undefined> {
  return registry.byName[name.toLowerCase()];
}

export async function getComponentsByCategory(
  category: ComponentCategory,
  registry: ComponentRegistry
): Promise<ExtendedComponentMetadata[]> {
  // Removed duplicated code block
  return registry.byCategory[category] || [];
} 
/**
 * Icon Loader Utility
 * 
 * This utility provides functions for dynamically loading icons only when needed.
 * It helps with tree-shaking and reducing the initial bundle size by lazy-loading
 * icons that are used less frequently.
 * 
 * UPDATED: This version uses the unified icon system rather than direct FontAwesome imports.
 */

// Remove direct FontAwesome import
// import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { IconName } from '@/components/ui/atoms/icons';

// Define a type for our icon data
interface IconData {
  svgPath: string;
  width: number;
  height: number;
  viewBox: string;
}

// Cache for loaded icons to prevent duplicate requests
const iconCache: Record<string, IconData> = {};

/**
 * Dynamically load an icon's SVG data
 * 
 * @param iconName The name of the icon without the 'fa' prefix (e.g., 'user')
 * @param variant 'solid' | 'light' | 'regular' | 'brands'
 * @returns Promise that resolves to the icon SVG data
 */
export async function loadIcon(
  iconName: string, 
  variant: 'solid' | 'light' | 'regular' | 'brands' = 'solid'
): Promise<IconData> {
  // Convert to kebab-case
  const cleanName = iconName.replace(/([A-Z])/g, '-$1').toLowerCase();
  
  // Create a cache key
  const cacheKey = `${variant}-${cleanName}`;
  
  // Return cached icon if available
  if (iconCache[cacheKey]) {
    return iconCache[cacheKey];
  }
  
  // Load the SVG file for the icon
  try {
    // Create the file path to the SVG
    const filePath = `/icons/${variant}/${cleanName}.svg`;
    
    // Fetch the SVG file
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to load icon SVG: ${filePath} (${response.status})`);
    }
    
    // Get the SVG text
    const svgText = await response.text();
    
    // Extract the path data, viewBox, and dimensions
    const svgData = extractSvgData(svgText);
    
    // Cache the icon for future use
    iconCache[cacheKey] = svgData;
    
    return svgData;
  } catch (error) {
    console.error(`Failed to load icon: ${iconName} (${variant})`, error);
    throw error;
  }
}

/**
 * Extract SVG path data and attributes from an SVG string
 */
function extractSvgData(svgText: string): IconData {
  // Default values
  let svgPath = '';
  let width = 24;
  let height = 24;
  let viewBox = '0 0 24 24';
  
  // Extract viewBox
  const viewBoxMatch = svgText.match(/viewBox="([^"]*)"/);
  if (viewBoxMatch && viewBoxMatch[1]) {
    viewBox = viewBoxMatch[1];
    
    // Try to extract width and height from viewBox
    const viewBoxParts = viewBox.split(' ');
    if (viewBoxParts.length === 4) {
      width = parseFloat(viewBoxParts[2]);
      height = parseFloat(viewBoxParts[3]);
    }
  }
  
  // Extract width and height if explicitly defined
  const widthMatch = svgText.match(/width="([^"]*)"/);
  if (widthMatch && widthMatch[1]) {
    width = parseFloat(widthMatch[1]);
  }
  
  const heightMatch = svgText.match(/height="([^"]*)"/);
  if (heightMatch && heightMatch[1]) {
    height = parseFloat(heightMatch[1]);
  }
  
  // Extract path data
  const pathMatch = svgText.match(/<path[^>]*d="([^"]*)"[^>]*>/);
  if (pathMatch && pathMatch[1]) {
    svgPath = pathMatch[1];
  }
  
  return { svgPath, width, height, viewBox };
}

/**
 * Preload commonly used icons to avoid loading delays
 * This can be called during idle time or on component mount
 */
export async function preloadCommonIcons(): Promise<void> {
  const commonIcons: [string, 'solid' | 'light' | 'regular' | 'brands'][] = [
    ['user', 'solid'],
    ['search', 'solid'],
    ['check', 'solid'],
    ['xmark', 'solid'],
    // Add more common icons here
  ];
  
  await Promise.all(
    commonIcons.map(([name, variant]) => loadIcon(name, variant).catch(() => null))
  );
}

/**
 * Get the icon prefix based on variant
 */
export function getIconPrefix(variant: 'solid' | 'light' | 'regular' | 'brands'): string {
  switch (variant) {
    case 'solid': return 'fas';
    case 'regular': return 'far';
    case 'light': return 'fal';
    case 'brands': return 'fab';
    default: return 'fas';
  }
}

/**
 * Convert our internal icon name format to kebab-case for file paths
 */
export function iconNameToFilePath(iconName: string): string {
  // Remove 'fa' prefix if present
  const nameWithoutPrefix = iconName.startsWith('fa') ? 
    iconName.substring(2) : iconName;
  
  // Convert camelCase to kebab-case
  return nameWithoutPrefix
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
} 
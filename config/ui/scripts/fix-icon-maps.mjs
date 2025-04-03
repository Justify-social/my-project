#!/usr/bin/env node

/**
 * Icon Registry Fixer
 * 
 * This script:
 * 1. Regenerates the icon-registry.json file for consistency
 * 2. Ensures all icons have proper entries with complete metadata
 * 3. Adds FontAwesome mapping properties if missing
 * 
 * Usage:
 *   node fix-icon-registry.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

// Get directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command line arguments
const DRY_RUN = process.argv.includes('--dry-run');

// Paths
const ICON_REGISTRY_PATH = path.join(process.cwd(), 'public', 'static', 'icon-registry.json');
const ICONS_ROOT_DIR = path.join(process.cwd(), 'public', 'icons');

// Terminal colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Icon categories/types
const ICON_CATEGORIES = ['app', 'brands', 'kpis', 'light', 'solid', 'regular'];

/**
 * Get all SVG files from the filesystem
 */
function getSvgFiles() {
  const allFiles = {};
  
  // Get all SVG files in each category
  ICON_CATEGORIES.forEach(category => {
    const categoryDir = path.join(ICONS_ROOT_DIR, category);
    const categoryFiles = glob.sync('*.svg', { cwd: categoryDir });
    
    allFiles[category] = categoryFiles.map(file => {
      const fullPath = path.join(categoryDir, file);
      const svgContent = fs.readFileSync(fullPath, 'utf8');
      
      // Extract viewBox if present
      let viewBox = "0 0 512 512"; // Default viewBox
      const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
      if (viewBoxMatch && viewBoxMatch[1]) {
        viewBox = viewBoxMatch[1];
      }
      
      return {
        file,
        path: `/icons/${category}/${file}`,
        category,
        viewBox,
        svgContent
      };
    });
  });
  
  return allFiles;
}

/**
 * Convert kebab-case to camelCase
 */
function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^[a-z]/, (g) => g.toUpperCase());
}

/**
 * Convert camelCase to kebab-case
 */
function kebabCase(str) {
  return str
    .replace(/^[A-Z]/, (g) => g.toLowerCase())
    .replace(/[A-Z]/g, (g) => `-${g.toLowerCase()}`);
}

/**
 * Generate FontAwesome mapping for an icon
 */
function generateFaMapName(icon) {
  const { category, file } = icon;
  
  // Skip non-FontAwesome icons
  if (category !== 'light' && category !== 'solid' && category !== 'brands' && category !== 'regular') {
    return null;
  }
  
  // Get base filename without extension
  const baseName = file.replace('.svg', '');
  
  // Generate the FontAwesome-style map name
  let faMapName;
  if (category === 'light') {
    // Light icons get 'Light' suffix in FontAwesome naming
    faMapName = `fa${camelCase(baseName)}Light`;
  } else {
    // Other styles just get the fa prefix
    faMapName = `fa${camelCase(baseName)}`;
  }
  
  // Special case for circle-notch icon which caused the original issue
  if (baseName === 'circle-notch') {
    if (category === 'light') {
      faMapName = 'faCircleNotchLight';
    } else if (category === 'solid') {
      faMapName = 'faCircleNotch';
    }
  }
  
  return faMapName;
}

/**
 * Generate icon registry data
 */
function generateIconRegistry(svgFiles) {
  const existingRegistry = fs.existsSync(ICON_REGISTRY_PATH) ? 
    JSON.parse(fs.readFileSync(ICON_REGISTRY_PATH, 'utf8')) : 
    { icons: [] };
  
  // Create map of existing icons by path for quick lookup
  const existingIconsMap = {};
  if (existingRegistry.icons && Array.isArray(existingRegistry.icons)) {
    existingRegistry.icons.forEach(icon => {
      if (icon.path) {
        existingIconsMap[icon.path] = icon;
      }
    });
  }
  
  // Regenerate the registry with all icons
  const iconRegistry = {
    icons: [],
    updatedAt: new Date().toISOString()
  };
  
  // Add all icons from filesystem to registry
  ICON_CATEGORIES.forEach(category => {
    const categoryFiles = svgFiles[category] || [];
    
    categoryFiles.forEach(fileData => {
      const { file, path: iconPath, category, viewBox, svgContent } = fileData;
      
      // Get the ID without extension
      const id = file.replace(/\.svg$/, '');
      
      // Create kebab ID
      const kebabId = id.includes('-') ? id : kebabCase(id);
      
      // Generate display name
      const displayName = id
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      // Generate FA map name for FontAwesome icons
      const map = generateFaMapName(fileData);
      
      // Create icon object
      const iconObject = {
        id,
        kebabId,
        name: displayName,
        path: iconPath,
        category,
        viewBox,
        width: 24,
        height: 24,
        svgContent,
        usageCount: 1
      };
      
      // Add map property for FontAwesome icons
      if (map) {
        iconObject.map = map;
      }
      
      // Preserve existing metadata if available
      if (existingIconsMap[iconPath]) {
        const existingIcon = existingIconsMap[iconPath];
        
        // Keep existing usage count if available
        if (existingIcon.usageCount) {
          iconObject.usageCount = existingIcon.usageCount;
        }
        
        // Keep existing overrides if set
        if (existingIcon.overrides) {
          iconObject.overrides = existingIcon.overrides;
        }
        
        // Keep existing map property if set
        if (existingIcon.map && !iconObject.map) {
          iconObject.map = existingIcon.map;
        }
      }
      
      // Add to registry
      iconRegistry.icons.push(iconObject);
    });
  });
  
  // Sort icons by category then id
  iconRegistry.icons.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.id.localeCompare(b.id);
  });
  
  return iconRegistry;
}

/**
 * Save registry file
 */
function saveRegistry(registry) {
  if (DRY_RUN) {
    console.log(`${colors.yellow}[DRY RUN] Would save registry with ${registry.icons.length} icons${colors.reset}`);
    return;
  }
  
  try {
    fs.writeFileSync(ICON_REGISTRY_PATH, JSON.stringify(registry, null, 2));
    console.log(`${colors.green}✅ Successfully saved icon registry with ${registry.icons.length} icons${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error saving icon registry: ${error.message}${colors.reset}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.magenta}==== Icon Registry Fixer ====${colors.reset}`);
  console.log(`${colors.blue}Scanning icon directories...${colors.reset}`);
  
  if (DRY_RUN) {
    console.log(`${colors.yellow}Running in DRY RUN mode - no files will be modified${colors.reset}`);
  }
  
  // Get all SVG files from filesystem
  const svgFiles = getSvgFiles();
  
  // Count total icons
  let totalIcons = 0;
  ICON_CATEGORIES.forEach(category => {
    const count = svgFiles[category] ? svgFiles[category].length : 0;
    console.log(`- ${category}: ${count} icons`);
    totalIcons += count;
  });
  
  console.log(`${colors.blue}Found ${totalIcons} icons in filesystem${colors.reset}`);
  
  // Generate icon registry
  console.log(`${colors.blue}Generating icon registry...${colors.reset}`);
  const iconRegistry = generateIconRegistry(svgFiles);
  
  // Print stats about the registry
  const countByCategory = {};
  iconRegistry.icons.forEach(icon => {
    countByCategory[icon.category] = (countByCategory[icon.category] || 0) + 1;
  });
  
  console.log(`${colors.green}Generated icon registry with ${iconRegistry.icons.length} entries:${colors.reset}`);
  Object.entries(countByCategory).forEach(([category, count]) => {
    console.log(`- ${category}: ${count} icons`);
  });
  
  // Count icons with map property
  const iconsByCategory = {};
  const iconsWithMap = iconRegistry.icons.filter(icon => icon.map);
  
  iconsWithMap.forEach(icon => {
    iconsByCategory[icon.category] = (iconsByCategory[icon.category] || 0) + 1;
  });
  
  console.log(`${colors.green}${iconsWithMap.length} icons have the 'map' property:${colors.reset}`);
  Object.entries(iconsByCategory).forEach(([category, count]) => {
    const total = countByCategory[category] || 0;
    console.log(`- ${category}: ${count}/${total} icons`);
  });
  
  // Save the registry
  saveRegistry(iconRegistry);
}

// Run the main function
main(); 
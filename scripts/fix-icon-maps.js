#!/usr/bin/env node

/**
 * Icon Maps Generator
 * 
 * This script scans the filesystem for all SVG icons and generates:
 * 1. A corrected icon-url-map.json
 * 2. A corrected icon-registry.json
 * 
 * Both files will be sorted alphabetically and will accurately reflect
 * all SVGs in the icons directory.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Paths to the icon map files
const ICON_URL_MAP_PATH = path.join(process.cwd(), 'src', 'components', 'ui', 'atoms', 'icons', 'icon-url-map.json');
const ICON_REGISTRY_PATH = path.join(process.cwd(), 'public', 'ui-icons', 'icon-registry.json');

// Path to the icons directory
const ICONS_ROOT_DIR = path.join(process.cwd(), 'public', 'icons');

// Backup the existing files before modifying them
const ICON_URL_MAP_BACKUP = ICON_URL_MAP_PATH + '.backup-' + Date.now();
const ICON_REGISTRY_BACKUP = ICON_REGISTRY_PATH + '.backup-' + Date.now();

/**
 * Get all SVG files from the filesystem
 * @returns Array of icon objects with file information
 */
function scanFilesystemIcons() {
  console.log('Scanning filesystem for SVG icons...');
  const icons = [];
  
  // Search for all SVG files in the icons directory and subdirectories
  const files = glob.sync(path.join(ICONS_ROOT_DIR, '**/*.svg'));
  
  files.forEach(file => {
    // Convert to the format used in the icon maps (/icons/...)
    const relativePath = '/icons' + file.replace(ICONS_ROOT_DIR, '').replace(/\\/g, '/');
    
    // Parse the path to extract information
    const pathParts = relativePath.split('/');
    const category = pathParts[2]; // light, solid, brands, etc.
    const fileName = pathParts[pathParts.length - 1];
    const name = fileName.replace('.svg', '');
    
    // Generate the proper FontAwesome-style identifier
    const prefix = category === 'light' ? 'faLight' : 
                  category === 'solid' ? 'fa' : 
                  category === 'brands' ? 'faBrands' : 
                  category === 'app' ? 'app' : 
                  category === 'kpis' ? 'kpis' : 
                  'fa';
    
    // Convert kebab-case to camelCase for the icon name
    let iconName = name.replace(/-([a-z])/g, g => g[1].toUpperCase());
    
    // For FontAwesome style icons, create the proper identifier
    let identifier;
    if (category === 'app') {
      // App icons use PascalCase with 'app' prefix
      identifier = 'app' + iconName.charAt(0).toUpperCase() + iconName.slice(1);
    } else if (category === 'kpis') {
      // KPI icons use PascalCase with 'kpis' prefix
      identifier = 'kpis' + iconName.charAt(0).toUpperCase() + iconName.slice(1);
    } else {
      // Handle FontAwesome style
      if (category === 'light') {
        identifier = 'fa' + iconName.charAt(0).toUpperCase() + iconName.slice(1) + 'Light';
      } else if (category === 'brands') {
        identifier = 'fa' + iconName.charAt(0).toUpperCase() + iconName.slice(1);
      } else {
        identifier = 'fa' + iconName.charAt(0).toUpperCase() + iconName.slice(1);
      }
    }
    
    icons.push({
      path: relativePath,
      category,
      fileName,
      name,
      identifier
    });
  });
  
  return icons;
}

/**
 * Generate the icon-url-map.json content
 * @param {Array} icons Array of icon objects
 * @returns {Object} The icon URL map object
 */
function generateIconUrlMap(icons) {
  const iconUrlMap = {};
  
  icons.forEach(icon => {
    iconUrlMap[icon.identifier] = icon.path;
  });
  
  // Sort the object by keys
  return Object.keys(iconUrlMap)
    .sort()
    .reduce((obj, key) => {
      obj[key] = iconUrlMap[key];
      return obj;
    }, {});
}

/**
 * Generate the icon-registry.json content
 * @param {Array} icons Array of icon objects
 * @returns {Object} The icon registry object
 */
function generateIconRegistry(icons) {
  const iconRegistry = {};
  
  icons.forEach(icon => {
    iconRegistry[icon.identifier] = {
      prefix: icon.category,
      name: icon.name,
      fileName: icon.fileName,
      path: icon.path
    };
  });
  
  // Sort the object by keys
  return Object.keys(iconRegistry)
    .sort()
    .reduce((obj, key) => {
      obj[key] = iconRegistry[key];
      return obj;
    }, {});
}

/**
 * Load an existing file for reference
 * @param {string} filePath Path to the file
 * @returns {Object|null} The parsed file or null if not found
 */
function loadExistingFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading file: ${error.message}`);
    return null;
  }
}

/**
 * Backup a file before modifying it
 * @param {string} sourcePath Original file path
 * @param {string} backupPath Backup file path
 */
function backupFile(sourcePath, backupPath) {
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, backupPath);
      console.log(`Backed up ${sourcePath} to ${backupPath}`);
    } catch (error) {
      console.error(`Error backing up file: ${error.message}`);
    }
  }
}

/**
 * Write the generated file
 * @param {string} filePath Path to write the file
 * @param {Object} data The data to write
 */
function writeFile(filePath, data) {
  try {
    const fileContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, fileContent);
    console.log(`Successfully wrote ${filePath}`);
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
  }
}

/**
 * Main function to fix the icon maps
 */
function fixIconMaps() {
  console.log('Fixing icon maps...');
  
  // Scan the filesystem for all SVG icons
  const icons = scanFilesystemIcons();
  console.log(`Found ${icons.length} SVG files in filesystem`);
  
  // Backup existing files
  backupFile(ICON_URL_MAP_PATH, ICON_URL_MAP_BACKUP);
  backupFile(ICON_REGISTRY_PATH, ICON_REGISTRY_BACKUP);
  
  // Generate the corrected icon URL map
  const iconUrlMap = generateIconUrlMap(icons);
  console.log(`Generated icon-url-map.json with ${Object.keys(iconUrlMap).length} entries`);
  
  // Generate the corrected icon registry
  const iconRegistry = generateIconRegistry(icons);
  console.log(`Generated icon-registry.json with ${Object.keys(iconRegistry).length} entries`);
  
  // Write the corrected files
  writeFile(ICON_URL_MAP_PATH, iconUrlMap);
  writeFile(ICON_REGISTRY_PATH, iconRegistry);
  
  console.log('\n✅ Icon maps have been fixed!');
}

// Run the fixer
fixIconMaps(); 
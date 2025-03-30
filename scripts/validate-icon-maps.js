#!/usr/bin/env node

/**
 * Icon Maps Validator
 * 
 * This script validates that icon-url-map.json and icon-registry.json 
 * accurately reflect all SVG files in the icons directory structure
 * and checks if they are in alphabetical order.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Paths to the icon map files
const ICON_URL_MAP_PATH = path.join(process.cwd(), 'src', 'components', 'ui', 'atoms', 'icons', 'icon-url-map.json');
const ICON_REGISTRY_PATH = path.join(process.cwd(), 'public', 'ui-icons', 'icon-registry.json');

// Path to the icons directory
const ICONS_ROOT_DIR = path.join(process.cwd(), 'public', 'icons');

// Icon subdirectories to check
const ICON_SUBDIRS = ['app', 'brands', 'kpis', 'light', 'solid', 'regular'];

/**
 * Get all SVG files from the filesystem
 * @returns Array of SVG file paths
 */
function getFilesystemIcons() {
  const iconFiles = [];
  
  // Search for all SVG files in the icons directory and subdirectories
  const files = glob.sync(path.join(ICONS_ROOT_DIR, '**/*.svg'));
  
  files.forEach(file => {
    // Convert to the format used in the icon maps (/icons/...)
    const relativePath = '/icons' + file.replace(ICONS_ROOT_DIR, '').replace(/\\/g, '/');
    iconFiles.push(relativePath);
  });
  
  return iconFiles;
}

/**
 * Load the icon-url-map.json file
 * @returns Object containing the icon map
 */
function loadIconUrlMap() {
  try {
    if (!fs.existsSync(ICON_URL_MAP_PATH)) {
      console.error(`Icon URL map not found: ${ICON_URL_MAP_PATH}`);
      return null;
    }
    
    const data = fs.readFileSync(ICON_URL_MAP_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading icon URL map: ${error.message}`);
    return null;
  }
}

/**
 * Load the icon-registry.json file
 * @returns Object containing the icon registry
 */
function loadIconRegistry() {
  try {
    if (!fs.existsSync(ICON_REGISTRY_PATH)) {
      console.error(`Icon registry not found: ${ICON_REGISTRY_PATH}`);
      return null;
    }
    
    const data = fs.readFileSync(ICON_REGISTRY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading icon registry: ${error.message}`);
    return null;
  }
}

/**
 * Check if an object's keys are in alphabetical order
 * @param {object} obj The object to check
 * @returns {boolean} True if keys are in alphabetical order
 */
function isAlphabeticallyOrdered(obj) {
  const keys = Object.keys(obj);
  const sortedKeys = [...keys].sort();
  
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== sortedKeys[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Find discrepancies between a collection of paths and a map of paths
 * @param {Array} paths Array of paths from filesystem
 * @param {Object} map Map of icon names to paths
 * @param {string} mapName Name of the map for logging
 * @returns {Object} Object containing missing and extra entries
 */
function findDiscrepancies(paths, map, mapName) {
  const mapPaths = mapName === 'icon-url-map' 
    ? Object.values(map) 
    : Object.values(map).map(entry => entry.path);
  
  const missing = paths.filter(path => !mapPaths.includes(path));
  const extra = mapPaths.filter(path => !paths.includes(path));
  
  return { missing, extra };
}

/**
 * Validate icon maps against filesystem
 */
function validateIconMaps() {
  console.log('Validating icon maps against filesystem...');
  
  // Get all SVG files from the filesystem
  const filesystemIcons = getFilesystemIcons();
  console.log(`Found ${filesystemIcons.length} SVG files in filesystem`);
  
  // Load the icon-url-map.json file
  const iconUrlMap = loadIconUrlMap();
  if (!iconUrlMap) {
    process.exit(1);
  }
  
  const iconUrlMapEntries = Object.keys(iconUrlMap).length;
  console.log(`Loaded icon-url-map.json with ${iconUrlMapEntries} entries`);
  
  // Load the icon-registry.json file
  const iconRegistry = loadIconRegistry();
  if (!iconRegistry) {
    process.exit(1);
  }
  
  const iconRegistryEntries = Object.keys(iconRegistry).length;
  console.log(`Loaded icon-registry.json with ${iconRegistryEntries} entries`);
  
  // Check if the maps are in alphabetical order
  const iconUrlMapOrdered = isAlphabeticallyOrdered(iconUrlMap);
  console.log(`icon-url-map.json is ${iconUrlMapOrdered ? 'in' : 'NOT in'} alphabetical order`);
  
  const iconRegistryOrdered = isAlphabeticallyOrdered(iconRegistry);
  console.log(`icon-registry.json is ${iconRegistryOrdered ? 'in' : 'NOT in'} alphabetical order`);
  
  // Find discrepancies between filesystem and icon-url-map.json
  const urlMapDiscrepancies = findDiscrepancies(filesystemIcons, iconUrlMap, 'icon-url-map');
  
  console.log('\nicon-url-map.json discrepancies:');
  console.log(`Missing entries (in filesystem but not in map): ${urlMapDiscrepancies.missing.length}`);
  if (urlMapDiscrepancies.missing.length > 0) {
    console.log('First 10 missing entries:');
    urlMapDiscrepancies.missing.slice(0, 10).forEach(entry => console.log(`  ${entry}`));
  }
  
  console.log(`Extra entries (in map but not in filesystem): ${urlMapDiscrepancies.extra.length}`);
  if (urlMapDiscrepancies.extra.length > 0) {
    console.log('First 10 extra entries:');
    urlMapDiscrepancies.extra.slice(0, 10).forEach(entry => console.log(`  ${entry}`));
  }
  
  // Find discrepancies between filesystem and icon-registry.json
  const registryDiscrepancies = findDiscrepancies(filesystemIcons, iconRegistry, 'icon-registry');
  
  console.log('\nicon-registry.json discrepancies:');
  console.log(`Missing entries (in filesystem but not in registry): ${registryDiscrepancies.missing.length}`);
  if (registryDiscrepancies.missing.length > 0) {
    console.log('First 10 missing entries:');
    registryDiscrepancies.missing.slice(0, 10).forEach(entry => console.log(`  ${entry}`));
  }
  
  console.log(`Extra entries (in registry but not in filesystem): ${registryDiscrepancies.extra.length}`);
  if (registryDiscrepancies.extra.length > 0) {
    console.log('First 10 extra entries:');
    registryDiscrepancies.extra.slice(0, 10).forEach(entry => console.log(`  ${entry}`));
  }
  
  // Find discrepancies between the two maps
  const urlMapPaths = Object.values(iconUrlMap);
  const registryPaths = Object.values(iconRegistry).map(entry => entry.path);
  
  const inUrlMapNotRegistry = urlMapPaths.filter(path => !registryPaths.includes(path));
  const inRegistryNotUrlMap = registryPaths.filter(path => !urlMapPaths.includes(path));
  
  console.log('\nDiscrepancies between the two maps:');
  console.log(`In icon-url-map.json but not in icon-registry.json: ${inUrlMapNotRegistry.length}`);
  if (inUrlMapNotRegistry.length > 0) {
    console.log('First 10 entries:');
    inUrlMapNotRegistry.slice(0, 10).forEach(entry => console.log(`  ${entry}`));
  }
  
  console.log(`In icon-registry.json but not in icon-url-map.json: ${inRegistryNotUrlMap.length}`);
  if (inRegistryNotUrlMap.length > 0) {
    console.log('First 10 entries:');
    inRegistryNotUrlMap.slice(0, 10).forEach(entry => console.log(`  ${entry}`));
  }
  
  // Summary
  const hasDiscrepancies = urlMapDiscrepancies.missing.length > 0 || 
                          urlMapDiscrepancies.extra.length > 0 ||
                          registryDiscrepancies.missing.length > 0 ||
                          registryDiscrepancies.extra.length > 0 ||
                          inUrlMapNotRegistry.length > 0 ||
                          inRegistryNotUrlMap.length > 0 ||
                          !iconUrlMapOrdered ||
                          !iconRegistryOrdered;
  
  if (hasDiscrepancies) {
    console.error('\n❌ Validation FAILED: Discrepancies found in icon maps');
    return false;
  } else {
    console.log('\n✅ Validation PASSED: Icon maps are accurate and in alphabetical order');
    return true;
  }
}

// Run validation
const result = validateIconMaps();
process.exit(result ? 0 : 1); 
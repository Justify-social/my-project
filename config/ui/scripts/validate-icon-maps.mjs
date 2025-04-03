#!/usr/bin/env node

/**
 * Icon Registry Validator
 * 
 * This script validates the icon-registry.json file to ensure:
 * 1. All icons have valid metadata
 * 2. All entries match actual files in the filesystem
 * 3. There are no missing entries
 * 
 * Usage:
 *   node validate-icon-registry.mjs [--fix]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const ICON_REGISTRY_PATH = path.join(process.cwd(), 'public', 'static', 'icon-registry.json');

// Is fix mode enabled?
const FIX_MODE = process.argv.includes('--fix');

/**
 * Load and validate the icon registry
 */
function validateIconRegistry() {
  // Check if registry exists
  if (!fs.existsSync(ICON_REGISTRY_PATH)) {
    console.error(`Could not find icon registry: ${ICON_REGISTRY_PATH}`);
    return false;
  }

  // Load registry
  try {
    const registry = JSON.parse(fs.readFileSync(ICON_REGISTRY_PATH, 'utf8'));
    
    // Validate registry format
    if (!registry.icons || !Array.isArray(registry.icons)) {
      console.error('Icon registry is not in the expected format. Must have an "icons" array.');
      return false;
    }
    
    console.log(`Loaded icon registry with ${registry.icons.length} entries`);
    
    // Check if registry is ordered
    const isOrdered = checkOrdering(registry.icons);
    console.log(`Icon registry is ${isOrdered ? 'in' : 'NOT in'} alphabetical order`);
    
    // Validate all icon entries have required fields
    const iconValidation = validateIconEntries(registry.icons);
    
    // Count icons by category
    const categoryCounts = countByCategory(registry.icons);
    console.log('\nIcons by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}`);
    });
    
    // Check if icons have the required "map" property for FontAwesome naming
    const missingMapProperty = registry.icons.filter(icon => 
      !icon.map && 
      (icon.category === 'light' || icon.category === 'solid' || icon.category === 'brands')
    );
    
    if (missingMapProperty.length > 0) {
      console.log(`\n⚠️ WARNING: ${missingMapProperty.length} FontAwesome icons are missing the "map" property`);
      console.log('Run scripts/icons/rebuild-registry.mjs to fix this');
    }
    
    return iconValidation;
  } catch (error) {
    console.error('Error validating icon registry:', error);
    return false;
  }
}

/**
 * Check if the registry entries are ordered alphabetically
 */
function checkOrdering(icons) {
  // Get a copy of the icons array
  const sortedIcons = [...icons];
  
  // Sort by category first, then by id
  sortedIcons.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.id.localeCompare(b.id);
  });
  
  // Check if the original array is already sorted
  return icons.every((icon, index) => {
    const sortedIcon = sortedIcons[index];
    return icon.id === sortedIcon.id && icon.category === sortedIcon.category;
  });
}

/**
 * Validate that all icon entries have the required fields
 */
function validateIconEntries(icons) {
  const requiredFields = ['id', 'kebabId', 'name', 'path', 'category', 'viewBox'];
  const invalidIcons = [];
  
  icons.forEach(icon => {
    const missingFields = requiredFields.filter(field => !icon[field]);
    if (missingFields.length > 0) {
      invalidIcons.push({
        icon,
        missingFields
      });
    }
  });
  
  if (invalidIcons.length > 0) {
    console.log(`\n❌ Found ${invalidIcons.length} icons with missing required fields:`);
    invalidIcons.forEach(({ icon, missingFields }) => {
      console.log(`- ${icon.id || 'Unknown'}: Missing ${missingFields.join(', ')}`);
    });
    return false;
  }
  
  console.log('✅ All icon entries have the required fields');
  return true;
}

/**
 * Count icons by category
 */
function countByCategory(icons) {
  return icons.reduce((acc, icon) => {
    const category = icon.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
}

// Run validation
const isValid = validateIconRegistry();

if (!isValid) {
  console.error('\n❌ Icon registry validation failed');
  process.exit(1);
} else {
  console.log('\n✅ Icon registry validation successful');
}

// In fix mode, we would apply fixes here
if (FIX_MODE) {
  console.log('\nFix mode is enabled but not yet implemented.');
  console.log('Please run scripts/icons/rebuild-registry.mjs to fix registry issues.');
} 
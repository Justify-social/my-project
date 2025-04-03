#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import FontAwesome packages
import * as proSolidIcons from '@fortawesome/pro-solid-svg-icons';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the solid icon registry JSON file
const ICON_REGISTRY_PATH = path.resolve(process.cwd(), 'public/static/solid-icon-registry.json');

// Main validation function
async function validateSolidIconRegistry() {
  try {
    console.log(`Validating solid icon registry: ${ICON_REGISTRY_PATH}`);
    
    // Verify the file exists
    if (!fs.existsSync(ICON_REGISTRY_PATH)) {
      throw new Error(`Registry file not found at: ${ICON_REGISTRY_PATH}`);
    }
    
    // Read the file content
    const fileContent = fs.readFileSync(ICON_REGISTRY_PATH, 'utf8');
    console.log(`File size: ${fileContent.length} bytes`);
    
    // Read and parse the icon registry
    const iconRegistry = JSON.parse(fileContent);
    
    if (!iconRegistry.icons || !Array.isArray(iconRegistry.icons)) {
      throw new Error('Invalid icon registry format');
    }
    
    console.log(`📦 Found ${iconRegistry.icons.length} solid icons to validate`);
    
    // Track validation results
    const validIcons = [];
    const invalidFaVersions = [];
    const invalidPaths = [];
    
    // Process each icon
    for (const icon of iconRegistry.icons) {
      const { id, name, faVersion, path: iconPath } = icon;
      
      console.log(`Validating: ${name} (${id})`);
      
      // Check if faVersion exists and follows the expected pattern
      if (!faVersion) {
        invalidFaVersions.push({ id, name, issue: 'Missing faVersion' });
        continue;
      }
      
      // Parse the faVersion to get style and name
      // e.g., "fas fa-user" -> style: "fas", iconName: "user"
      const parts = faVersion.split(' ');
      if (parts.length !== 2 || parts[0] !== 'fas' || !parts[1].startsWith('fa-')) {
        invalidFaVersions.push({ id, name, issue: `Invalid faVersion format: ${faVersion}` });
        continue;
      }
      
      const iconName = parts[1].replace('fa-', '');
      
      // Convert to FontAwesome JS library format (e.g., "user" -> "faUser")
      const faIconName = 'fa' + iconName.split('-').map(
        (part, index) => index === 0 ? 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join('');
      
      // Check if the icon exists in the solid package
      if (!proSolidIcons[faIconName]) {
        invalidFaVersions.push({ 
          id, 
          name, 
          issue: `Icon not found in FontAwesome solid package: ${faIconName}` 
        });
        continue;
      }
      
      // Check path format
      if (!iconPath) {
        invalidPaths.push({ id, name, issue: 'Missing path' });
        continue;
      }
      
      if (!iconPath.startsWith('/icons/solid/') || !iconPath.endsWith('.svg')) {
        invalidPaths.push({ 
          id, 
          name, 
          issue: `Invalid path format: ${iconPath}. Should start with "/icons/solid/" and end with ".svg"` 
        });
        continue;
      }
      
      // If all checks pass, icon is valid
      validIcons.push({ id, name, faVersion });
    }
    
    // Report results
    console.log(`\n📊 Validation Results:`);
    console.log(`   ✅ Valid icons: ${validIcons.length} (${Math.round(validIcons.length / iconRegistry.icons.length * 100)}%)`);
    console.log(`   ❌ Invalid faVersion: ${invalidFaVersions.length}`);
    console.log(`   ❌ Invalid paths: ${invalidPaths.length}`);
    
    // Show details of invalid icons
    if (invalidFaVersions.length > 0) {
      console.log(`\n⚠️ Icons with invalid faVersion:`);
      invalidFaVersions.forEach(({ id, name, issue }) => {
        console.log(`   - ${id} (${name}): ${issue}`);
      });
    }
    
    if (invalidPaths.length > 0) {
      console.log(`\n⚠️ Icons with invalid path:`);
      invalidPaths.forEach(({ id, name, issue }) => {
        console.log(`   - ${id} (${name}): ${issue}`);
      });
    }
    
    // Summary
    if (validIcons.length === iconRegistry.icons.length) {
      console.log(`\n🎉 All icons in the solid registry are valid!`);
    } else {
      console.log(`\n🛠️ Some icons need fixing. Consider running a repair script.`);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the validation
validateSolidIconRegistry(); 
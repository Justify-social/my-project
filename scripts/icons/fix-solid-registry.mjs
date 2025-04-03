#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the solid icon registry JSON file
const ICON_REGISTRY_PATH = path.resolve(process.cwd(), 'public/static/solid-icon-registry.json');

// Mapping of icon IDs to their correct faVersion values
const iconFaVersionFixes = {
  'faCircleCheckSolid': 'fas fa-circle-check',
  'faCircleInfoSolid': 'fas fa-circle-info',
  'faCircleQuestionSolid': 'fas fa-circle-question',
  'faClockRotateLeftSolid': 'fas fa-clock-rotate-left',
  'faHouseSolid': 'fas fa-house',
  'faPenToSquareSolid': 'fas fa-pen-to-square',
  'faTrashCanSolid': 'fas fa-trash-can',
  'faTriangleExclamationSolid': 'fas fa-triangle-exclamation',
  'faXmarkSolid': 'fas fa-xmark'
};

// Main function to fix the registry
function fixSolidIconRegistry() {
  try {
    console.log(`Reading icon registry: ${ICON_REGISTRY_PATH}`);
    
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
    
    console.log(`📦 Found ${iconRegistry.icons.length} icons to process`);
    
    // Create a backup before modifying
    const backupPath = `${ICON_REGISTRY_PATH}.original`;
    fs.writeFileSync(backupPath, fileContent, 'utf8');
    console.log(`✅ Created backup: ${backupPath}`);
    
    // Track changes
    let missingFaVersionFixed = 0;
    let incorrectPathFormatFixed = 0;
    
    // Update each icon
    iconRegistry.icons = iconRegistry.icons.map(icon => {
      const updatedIcon = { ...icon };
      
      // Fix missing faVersion
      if (!icon.faVersion && iconFaVersionFixes[icon.id]) {
        updatedIcon.faVersion = iconFaVersionFixes[icon.id];
        missingFaVersionFixed++;
        console.log(`Fixed faVersion: ${icon.id} -> ${updatedIcon.faVersion}`);
      }
      
      // Fix incorrect path format
      if (icon.path && !icon.path.startsWith('/icons/solid/')) {
        updatedIcon.path = `/icons/solid/${icon.path}`;
        incorrectPathFormatFixed++;
        console.log(`Fixed path: ${icon.id} -> ${updatedIcon.path}`);
      }
      
      return updatedIcon;
    });
    
    // Add metadata
    iconRegistry.updatedAt = new Date().toISOString();
    
    // Write the updated registry back to file
    const updatedContent = JSON.stringify(iconRegistry, null, 2);
    fs.writeFileSync(ICON_REGISTRY_PATH, updatedContent, 'utf8');
    
    console.log(`\n✨ Registry fixes complete:`);
    console.log(`   ✅ Fixed missing faVersion: ${missingFaVersionFixed} icons`);
    console.log(`   ✅ Fixed incorrect path format: ${incorrectPathFormatFixed} icons`);
    console.log(`   📝 Updated timestamp: ${iconRegistry.updatedAt}`);
    
    console.log(`\n🎉 Solid icon registry is now ready for secure locking!`);
    console.log(`   To lock the registry, run: ./scripts/icons/lock-registry-files.sh`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the function
fixSolidIconRegistry(); 
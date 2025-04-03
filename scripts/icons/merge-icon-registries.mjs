#!/usr/bin/env node

/**
 * Icon Registry Merger
 * 
 * This script merges icons from the staging (new-*) registries into the main icon registries.
 * It handles both light and solid icons, ensuring no duplicates are created.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths to registries
const LIGHT_STAGING_PATH = path.resolve(process.cwd(), 'public/static/new-light-icon-registry.json');
const LIGHT_MAIN_PATH = path.resolve(process.cwd(), 'public/static/light-icon-registry.json');
const SOLID_STAGING_PATH = path.resolve(process.cwd(), 'public/static/new-solid-icon-registry.json');
const SOLID_MAIN_PATH = path.resolve(process.cwd(), 'public/static/solid-icon-registry.json');

// Backup directory
const BACKUP_DIR = path.resolve(process.cwd(), 'public/static/icon-registry-backup');

// Check if registry files are writable
function checkWritable(filePath) {
  try {
    // Try to get file stats
    const stats = fs.statSync(filePath);
    
    // Check if file is writable by looking at file mode
    // File mode in octal looks like 0o644, 0o444, etc.
    // The 2 (write) bit in the user position (100) indicates writability
    const isWritable = !!(stats.mode & 0o200);
    
    if (!isWritable) {
      console.error(`❌ File ${filePath} is not writable. Unlock it first with: npm run icons:unlock`);
      return false;
    }
    
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File ${filePath} doesn't exist yet, will create it.`);
      return true;
    }
    console.error(`❌ Error checking file ${filePath}: ${error.message}`);
    return false;
  }
}

// Create backup of a file
function createBackup(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const backupPath = path.join(BACKUP_DIR, `${fileName}.${timestamp}.bak`);
    
    // Copy the file
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Created backup at ${backupPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create backup of ${filePath}: ${error.message}`);
    return false;
  }
}

// Merge icons from staging into main registry
function mergeRegistry(stagingPath, mainPath) {
  try {
    // Check if staging registry exists
    if (!fs.existsSync(stagingPath)) {
      console.log(`ℹ️ Staging registry not found at ${stagingPath}. Nothing to merge.`);
      return false;
    }
    
    // Read staging registry
    const stagingContent = fs.readFileSync(stagingPath, 'utf8');
    const stagingRegistry = JSON.parse(stagingContent);
    
    // Verify staging registry structure
    if (!stagingRegistry.icons || !Array.isArray(stagingRegistry.icons)) {
      console.error(`❌ Invalid staging registry format in ${stagingPath}`);
      return false;
    }
    
    // No icons to merge
    if (stagingRegistry.icons.length === 0) {
      console.log(`ℹ️ No icons in staging registry ${stagingPath}. Nothing to merge.`);
      return false;
    }
    
    // Create or update main registry
    let mainRegistry;
    
    if (fs.existsSync(mainPath)) {
      // Read existing main registry
      const mainContent = fs.readFileSync(mainPath, 'utf8');
      mainRegistry = JSON.parse(mainContent);
      
      // Verify main registry structure
      if (!mainRegistry.icons || !Array.isArray(mainRegistry.icons)) {
        console.error(`❌ Invalid main registry format in ${mainPath}`);
        return false;
      }
    } else {
      // Create new main registry with basic structure
      mainRegistry = {
        icons: [],
        version: stagingRegistry.version || '1.0.0',
        updatedAt: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Backup the main registry
    createBackup(mainPath);
    
    // Get existing icon IDs in main registry
    const existingIds = new Set(mainRegistry.icons.map(icon => icon.id));
    
    // Track merged icons
    let mergedCount = 0;
    let skippedCount = 0;
    
    // Merge each new icon
    for (const icon of stagingRegistry.icons) {
      if (!icon.id) {
        console.warn(`⚠️ Skipping icon without ID in staging registry`);
        skippedCount++;
        continue;
      }
      
      // Skip if icon already exists in main registry
      if (existingIds.has(icon.id)) {
        console.log(`⚠️ Skipping existing icon: ${icon.id}`);
        skippedCount++;
        continue;
      }
      
      // Add the new icon to main registry
      mainRegistry.icons.push(icon);
      existingIds.add(icon.id);
      mergedCount++;
      console.log(`✅ Added new icon: ${icon.id}`);
    }
    
    // Update the main registry metadata
    mainRegistry.updatedAt = new Date().toISOString();
    mainRegistry.lastUpdated = new Date().toISOString();
    
    // Write the updated main registry
    fs.writeFileSync(mainPath, JSON.stringify(mainRegistry, null, 2));
    
    // Clear the staging registry
    if (mergedCount > 0) {
      // Create backup of staging registry
      createBackup(stagingPath);
      
      // Reset staging registry to empty
      stagingRegistry.icons = [];
      stagingRegistry.updatedAt = new Date().toISOString();
      fs.writeFileSync(stagingPath, JSON.stringify(stagingRegistry, null, 2));
      console.log(`✅ Cleared staging registry after successful merge`);
    }
    
    console.log(`✨ Merge complete for ${path.basename(stagingPath)}:`);
    console.log(`   ✅ Added: ${mergedCount} icons`);
    console.log(`   ⚠️ Skipped: ${skippedCount} icons`);
    return mergedCount > 0;
  } catch (error) {
    console.error(`❌ Error merging registry ${path.basename(stagingPath)}: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🔄 Icon Registry Merger');
    console.log('====================');
    
    // Check if files are writable
    const lightMainWritable = checkWritable(LIGHT_MAIN_PATH);
    const solidMainWritable = checkWritable(SOLID_MAIN_PATH);
    
    if (!lightMainWritable || !solidMainWritable) {
      console.error(`❌ Registry files are locked. Unlock them first using: npm run icons:unlock`);
      process.exit(1);
    }
    
    // Merge light icons
    console.log('\n📄 Processing light icons registry...');
    const lightMerged = mergeRegistry(LIGHT_STAGING_PATH, LIGHT_MAIN_PATH);
    
    // Merge solid icons
    console.log('\n📄 Processing solid icons registry...');
    const solidMerged = mergeRegistry(SOLID_STAGING_PATH, SOLID_MAIN_PATH);
    
    // Summary
    console.log('\n🎉 Registry Merger completed!');
    console.log(`   Light icons: ${lightMerged ? 'Changes made' : 'No changes'}`);
    console.log(`   Solid icons: ${solidMerged ? 'Changes made' : 'No changes'}`);
    
    // Reminder to lock files
    console.log('\n🔒 IMPORTANT: Remember to lock the registry files:');
    console.log('   npm run icons:lock');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main(); 
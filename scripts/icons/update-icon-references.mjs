#!/usr/bin/env node

/**
 * Icon Reference Update Script
 * 
 * This script finds and updates all icon references in the codebase to use 'id'
 * as the Single Source of Truth (SSOT) instead of other attributes like 'name'.
 * 
 * Usage:
 *   node scripts/icons/update-icon-references.mjs             # Dry run mode
 *   node scripts/icons/update-icon-references.mjs --execute   # Execute mode (make changes)
 */

import fs from 'fs';
import path from 'path';
import { globby } from 'globby';
import chalk from 'chalk';
import { createRequire } from 'module';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const STATIC_DIR = path.resolve(process.cwd(), 'public', 'static');
const DRY_RUN = !process.argv.includes('--execute');
const VERBOSE = process.argv.includes('--verbose');

// Registry mapping data
const iconRegistry = {
  // Maps to store icon mappings
  idMap: new Map(),            // id -> full icon data
  nameMap: new Map(),          // name (lowercase) -> id
  faVersionMap: new Map(),     // faVersion -> id
  mapNameMap: new Map(),       // map field -> id
  alternativesMap: new Map(),  // alternative name -> id
  
  // Consolidated registry data
  icons: [],
  registryFiles: []
};

// Results tracking
const stats = {
  filesScanned: 0,
  filesThatNeedUpdating: 0,
  filesUpdated: 0,
  totalReferences: 0,
  referencesUpdated: 0,
  errors: 0
};

/**
 * Load all registry files from static directory
 */
async function loadRegistryFiles() {
  console.log(chalk.blue('Loading icon registry files...'));
  
  // Find all icon registry JSON files
  const registryFiles = await globby([
    `${STATIC_DIR}/*-icon-registry.json`,
  ]);
  
  iconRegistry.registryFiles = registryFiles;
  
  // Load each registry file
  for (const filePath of registryFiles) {
    try {
      const registryContent = fs.readFileSync(filePath, 'utf8');
      const registry = JSON.parse(registryContent);
      
      if (!registry.icons || !Array.isArray(registry.icons)) {
        console.warn(chalk.yellow(`Warning: ${path.basename(filePath)} has invalid format (missing icons array)`));
        continue;
      }
      
      console.log(chalk.gray(`  - ${path.basename(filePath)}: ${registry.icons.length} icons`));
      
      // Add icons to our consolidated registry
      iconRegistry.icons.push(...registry.icons);
      
    } catch (err) {
      console.error(chalk.red(`Error loading ${path.basename(filePath)}:`), err.message);
      stats.errors++;
    }
  }
  
  // Build the mapping data
  buildMappingData();
}

/**
 * Build mapping data from loaded registries
 */
function buildMappingData() {
  for (const icon of iconRegistry.icons) {
    // Skip icons without an ID
    if (!icon.id) continue;
    
    // Store the full icon data by ID
    iconRegistry.idMap.set(icon.id, icon);
    
    // Map name to ID (case insensitive)
    if (icon.name) {
      iconRegistry.nameMap.set(icon.name.toLowerCase(), icon.id);
    }
    
    // Map faVersion to ID
    if (icon.faVersion) {
      iconRegistry.faVersionMap.set(icon.faVersion, icon.id);
    }
    
    // Map FontAwesome map field to ID
    if (icon.map) {
      iconRegistry.mapNameMap.set(icon.map, icon.id);
    }
    
    // Map alternatives to ID
    if (icon.alternatives && Array.isArray(icon.alternatives)) {
      for (const alt of icon.alternatives) {
        iconRegistry.alternativesMap.set(alt, icon.id);
      }
    }
  }
  
  console.log(chalk.green(`Loaded ${iconRegistry.icons.length} icons from ${iconRegistry.registryFiles.length} registry files`));
  
  if (VERBOSE) {
    console.log(chalk.gray(`  - IDs: ${iconRegistry.idMap.size}`));
    console.log(chalk.gray(`  - Names mapped to IDs: ${iconRegistry.nameMap.size}`));
    console.log(chalk.gray(`  - faVersions mapped to IDs: ${iconRegistry.faVersionMap.size}`));
    console.log(chalk.gray(`  - map fields mapped to IDs: ${iconRegistry.mapNameMap.size}`));
    console.log(chalk.gray(`  - alternatives mapped to IDs: ${iconRegistry.alternativesMap.size}`));
  }
}

/**
 * Scan the entire codebase for icon references
 */
async function scanCodebase() {
  console.log(chalk.blue('\nScanning codebase for icon references...'));
  
  // Find all potential files that might contain icon references
  const files = await globby([
    `${SRC_DIR}/**/*.{ts,tsx,js,jsx}`,
    `!${SRC_DIR}/**/*.d.ts`,
    `!${SRC_DIR}/**/*.test.{ts,tsx,js,jsx}`,
    `!${SRC_DIR}/**/*.spec.{ts,tsx,js,jsx}`,
    `!${SRC_DIR}/**/*.stories.{ts,tsx,js,jsx}`,
    `!**/node_modules/**`,
  ]);
  
  stats.filesScanned = files.length;
  
  console.log(chalk.gray(`Found ${files.length} files to scan`));
  
  // Process each file
  for (const filePath of files) {
    try {
      const fileNeedsUpdating = await processFile(filePath);
      if (fileNeedsUpdating) {
        stats.filesThatNeedUpdating++;
      }
    } catch (err) {
      console.error(chalk.red(`Error processing ${filePath}:`), err.message);
      stats.errors++;
    }
  }
}

/**
 * Process a single file to find and update icon references
 */
async function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let fileModified = false;
  
  // Pattern 1: <Icon name="iconName" ... />
  fileModified = updateIconComponentReferences(filePath, content, updatedContent) || fileModified;
  
  // Pattern 2: getIconPath('iconName') or similar utility functions
  fileModified = updateIconUtilityReferences(filePath, content, updatedContent) || fileModified;
  
  // Write back if changed and in execute mode
  if (fileModified && !DRY_RUN) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    stats.filesUpdated++;
    console.log(chalk.green(`✓ Updated ${path.relative(process.cwd(), filePath)}`));
  }
  
  return fileModified;
}

/**
 * Update Icon component references in a file
 */
function updateIconComponentReferences(filePath, content, updatedContent) {
  let modified = false;
  
  // Look for Icon component usage patterns
  const iconComponentRegex = /<(Icon|SolidIcon|LightIcon)\s+([^>]+)>/g;
  let match;
  
  while ((match = iconComponentRegex.exec(content)) !== null) {
    const [fullMatch, componentName, props] = match;
    
    // Look for name prop
    const nameMatch = props.match(/name\s*=\s*["']([^"']+)["']/);
    if (nameMatch) {
      const iconName = nameMatch[1];
      stats.totalReferences++;
      
      // Check if we should update this reference
      const { shouldUpdate, correctId } = shouldUpdateIconReference(iconName);
      
      if (shouldUpdate && correctId) {
        // Create updated props with corrected ID
        const updatedProps = props.replace(
          /name\s*=\s*["']([^"']+)["']/,
          `name="${correctId}"`
        );
        
        // Replace in the updated content
        const updatedMatch = `<${componentName} ${updatedProps}>`;
        updatedContent = updatedContent.replace(fullMatch, updatedMatch);
        
        modified = true;
        stats.referencesUpdated++;
        
        if (VERBOSE || DRY_RUN) {
          const relPath = path.relative(process.cwd(), filePath);
          console.log(
            `${DRY_RUN ? chalk.yellow('Would update') : chalk.cyan('Updated')} in ${chalk.cyan(relPath)}: ` +
            `${chalk.red(iconName)} → ${chalk.green(correctId)}`
          );
        }
      }
    }
  }
  
  return modified;
}

/**
 * Update icon utility function references in a file
 */
function updateIconUtilityReferences(filePath, content, updatedContent) {
  let modified = false;
  
  // Look for utility function usage patterns like getIconPath('iconName')
  const utilityFunctionRegex = /(getIconPath|getIconById|iconExists|getSvgContent)\s*\(\s*['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = utilityFunctionRegex.exec(content)) !== null) {
    const [fullMatch, functionName, iconName] = match;
    stats.totalReferences++;
    
    // Check if we should update this reference
    const { shouldUpdate, correctId } = shouldUpdateIconReference(iconName);
    
    if (shouldUpdate && correctId) {
      // Create updated function call
      const updatedMatch = `${functionName}('${correctId}'`;
      updatedContent = updatedContent.replace(fullMatch, updatedMatch);
      
      modified = true;
      stats.referencesUpdated++;
      
      if (VERBOSE || DRY_RUN) {
        const relPath = path.relative(process.cwd(), filePath);
        console.log(
          `${DRY_RUN ? chalk.yellow('Would update') : chalk.cyan('Updated')} in ${chalk.cyan(relPath)}: ` +
          `${chalk.red(iconName)} → ${chalk.green(correctId)} in ${functionName}()`
        );
      }
    }
  }
  
  return modified;
}

/**
 * Determine if an icon reference should be updated and what it should be updated to
 */
function shouldUpdateIconReference(iconName) {
  // If it's already a valid ID, no need to update
  if (iconRegistry.idMap.has(iconName)) {
    return { shouldUpdate: false };
  }
  
  // Check if it's a name that maps to an ID
  const lowerName = iconName.toLowerCase();
  if (iconRegistry.nameMap.has(lowerName)) {
    return { 
      shouldUpdate: true, 
      correctId: iconRegistry.nameMap.get(lowerName)
    };
  }
  
  // Check if it's a FontAwesome version that maps to an ID
  if (iconRegistry.faVersionMap.has(iconName)) {
    return { 
      shouldUpdate: true, 
      correctId: iconRegistry.faVersionMap.get(iconName)
    };
  }
  
  // Check if it's a FontAwesome map field that maps to an ID
  if (iconRegistry.mapNameMap.has(iconName)) {
    return { 
      shouldUpdate: true, 
      correctId: iconRegistry.mapNameMap.get(iconName)
    };
  }
  
  // Check if it's an alternative name that maps to an ID
  if (iconRegistry.alternativesMap.has(iconName)) {
    return { 
      shouldUpdate: true, 
      correctId: iconRegistry.alternativesMap.get(iconName)
    };
  }
  
  // We cannot determine the correct ID, so do not update
  return { shouldUpdate: false };
}

/**
 * Print a summary report of changes made
 */
function printSummary() {
  console.log(chalk.blue('\nIcon Reference Update Summary:'));
  console.log(chalk.gray('---------------------------'));
  console.log(`Files scanned: ${chalk.cyan(stats.filesScanned)}`);
  console.log(`Files that need updating: ${chalk.yellow(stats.filesThatNeedUpdating)}`);
  
  if (!DRY_RUN) {
    console.log(`Files updated: ${chalk.green(stats.filesUpdated)}`);
  }
  
  console.log(`Total icon references found: ${chalk.cyan(stats.totalReferences)}`);
  
  if (DRY_RUN) {
    console.log(`References that would be updated: ${chalk.yellow(stats.referencesUpdated)}`);
  } else {
    console.log(`References updated: ${chalk.green(stats.referencesUpdated)}`);
  }
  
  console.log(`Errors encountered: ${chalk.red(stats.errors)}`);
  
  if (DRY_RUN && stats.referencesUpdated > 0) {
    console.log(chalk.yellow('\nThis was a DRY RUN. No files were actually changed.'));
    console.log(chalk.yellow('To make the changes, run with the --execute flag:'));
    console.log(chalk.gray('  node scripts/icons/update-icon-references.mjs --execute'));
  } else if (!DRY_RUN && stats.referencesUpdated > 0) {
    console.log(chalk.green('\nSuccessfully updated icon references to use ID as SSOT!'));
  } else if (stats.totalReferences > 0 && stats.referencesUpdated === 0) {
    console.log(chalk.green('\nAll icon references are already using ID as SSOT!'));
  }
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('Icon Reference Update Script'));
  console.log(chalk.gray('-------------------------'));
  
  if (DRY_RUN) {
    console.log(chalk.yellow('Running in DRY RUN mode - no files will be modified\n'));
  } else {
    console.log(chalk.green('Running in EXECUTE mode - files will be updated\n'));
  }
  
  // Load registry files
  await loadRegistryFiles();
  
  // Scan codebase and update references
  await scanCodebase();
  
  // Print summary
  printSummary();
  
  // Return success/failure
  return stats.errors === 0;
}

// Run the script
main().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error(chalk.red('Script error:'), err);
  process.exit(1);
}); 
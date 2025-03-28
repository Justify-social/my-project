/**
 * Remove Original Script Files
 * 
 * This script removes the original script files that have been consolidated
 * into the new directory structure. It first verifies the consolidated script
 * exists before removing the original file.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Path to the redirects file with mapping of original to new locations
const REDIRECTS_FILE = path.join(__dirname, 'script-redirects.json');

// Function to read the redirects map
function getRedirectsMap() {
  try {
    if (!fs.existsSync(REDIRECTS_FILE)) {
      console.error(`Redirects file not found: ${REDIRECTS_FILE}`);
      process.exit(1);
    }

    const redirectsContent = fs.readFileSync(REDIRECTS_FILE, 'utf8');
    return JSON.parse(redirectsContent);
  } catch (error) {
    console.error(`Error reading redirects file: ${error.message}`);
    process.exit(1);
  }
}

// Function to verify a consolidated script exists
function verifyConsolidatedScript(consolidatedPath) {
  return fs.existsSync(consolidatedPath);
}

// Function to remove an original script file
function removeOriginalScript(originalPath) {
  try {
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
      console.log(`Removed: ${originalPath}`);
      return true;
    } else {
      console.log(`File already removed: ${originalPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error removing ${originalPath}: ${error.message}`);
    return false;
  }
}

// Function to clean up empty directories
function cleanupEmptyDirectories(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }

  try {
    const contents = fs.readdirSync(directory);
    
    if (contents.length === 0) {
      fs.rmdirSync(directory);
      console.log(`Removed empty directory: ${directory}`);
      
      // Recursively check the parent directory
      const parentDir = path.dirname(directory);
      if (parentDir.includes('/scripts/') && !parentDir.includes('/scripts/consolidated')) {
        cleanupEmptyDirectories(parentDir);
      }
    }
  } catch (error) {
    console.error(`Error cleaning up directory ${directory}: ${error.message}`);
  }
}

// Main function to remove original script files
function removeOriginalScripts() {
  console.log('Starting removal of original script files...');
  
  const redirectsMap = getRedirectsMap();
  const entries = Object.entries(redirectsMap);
  
  console.log(`Found ${entries.length} scripts to process`);
  
  let totalRemoved = 0;
  let totalFailures = 0;
  
  // First, verify all consolidated scripts exist
  console.log('Verifying all consolidated scripts exist...');
  
  const invalidEntries = entries.filter(([_, consolidatedPath]) => !verifyConsolidatedScript(consolidatedPath));
  
  if (invalidEntries.length > 0) {
    console.error(`Error: ${invalidEntries.length} consolidated scripts are missing:`);
    invalidEntries.forEach(([originalPath, consolidatedPath]) => {
      console.error(`  ${consolidatedPath} (from ${originalPath})`);
    });
    
    const shouldContinue = process.argv.includes('--force');
    if (!shouldContinue) {
      console.error('Aborting. Use --force to continue anyway.');
      process.exit(1);
    }
    
    console.warn('Continuing with removal despite missing consolidated scripts.');
  }
  
  // Process each script for removal
  console.log('Removing original script files...');
  
  const directoriesToCheck = new Set();
  
  for (const [originalPath, consolidatedPath] of entries) {
    // Skip if the consolidated script is missing and we're not forcing
    if (!verifyConsolidatedScript(consolidatedPath) && !process.argv.includes('--force')) {
      console.warn(`Skipping ${originalPath} - consolidated script is missing`);
      totalFailures++;
      continue;
    }
    
    // Remove the original script
    if (removeOriginalScript(originalPath)) {
      totalRemoved++;
      
      // Track the directory for cleanup
      const directory = path.dirname(originalPath);
      directoriesToCheck.add(directory);
    } else {
      totalFailures++;
    }
  }
  
  // Clean up empty directories
  console.log('\nCleaning up empty directories...');
  directoriesToCheck.forEach(dir => cleanupEmptyDirectories(dir));
  
  // Generate report
  console.log('\nRemoval summary:');
  console.log(`Total scripts processed: ${entries.length}`);
  console.log(`Successfully removed: ${totalRemoved}`);
  console.log(`Failed to remove: ${totalFailures}`);
  
  // Generate a more detailed report file
  generateRemovalReport(entries.length, totalRemoved, totalFailures);
  
  console.log('Script removal completed.');
}

// Generate a report of the removal process
function generateRemovalReport(totalScripts, removed, failures) {
  const reportPath = 'docs/script-removal-report.md';
  
  const reportContent = `# Original Script Removal Report

Date: ${new Date().toISOString().split('T')[0]}

## Summary

- **Total Scripts Processed**: ${totalScripts}
- **Successfully Removed**: ${removed}
- **Failed to Remove**: ${failures}

## Next Steps

1. Update documentation to reflect the consolidated script organization
2. Run tests to ensure there are no regressions
3. Update CI/CD pipelines to use the consolidated scripts

`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Generated removal report at ${reportPath}`);
}

// Check if this is a dry run
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('Performing dry run - no files will be removed');
  console.log('To actually remove files, run without --dry-run');
} else {
  // Confirm with the user before proceeding
  if (!process.argv.includes('--force')) {
    console.log('WARNING: This script will permanently delete files.');
    console.log('Make sure you have backups and have tested the consolidated scripts.');
    console.log('Use --dry-run to see what would be removed without actually removing anything.');
    console.log('To proceed with removal, run with --force');
    process.exit(0);
  }
  
  // Run the removal process
  removeOriginalScripts();
} 
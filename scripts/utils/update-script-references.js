/**
 * Update Script References
 * 
 * This script updates references to original script paths with their new consolidated paths
 * throughout the codebase. It uses the redirects map to know which paths to replace.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Path to the redirects file
const REDIRECTS_FILE = path.join(__dirname, 'script-redirects.json');
// Directories to exclude from search
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  'coverage'
].join(' --exclude-dir=');

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

// Function to escape path for use in grep
function escapeForGrep(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to escape path for use in sed
function escapeForSed(str) {
  return str.replace(/[/&]/g, '\\$&');
}

// Function to update references in a single file
function updateFileReferences(filePath, originalPath, newPath) {
  try {
    const escapedOriginal = escapeForSed(originalPath);
    const escapedNew = escapeForSed(newPath);
    
    // Use sed to replace the old path with the new path
    execSync(`sed -i '' 's|${escapedOriginal}|${escapedNew}|g' "${filePath}"`);
    return true;
  } catch (error) {
    console.error(`Error updating references in ${filePath}: ${error.message}`);
    return false;
  }
}

// Function to find all files referencing an original script path
function findReferencingFiles(originalPath) {
  try {
    const escapedPath = escapeForGrep(originalPath);
    const cmd = `grep -l --include="*.js" --include="*.json" --include="*.ts" --include="*.tsx" --exclude-dir=${EXCLUDE_DIRS} -r "${escapedPath}" ./`;
    const result = execSync(cmd, { encoding: 'utf8' }).trim();
    
    // Return array of files, or empty array if no matches
    return result ? result.split('\n') : [];
  } catch (error) {
    // grep returns exit code 1 if no matches found, which causes execSync to throw
    if (error.status === 1) {
      return [];
    }
    console.error(`Error finding references: ${error.message}`);
    return [];
  }
}

// Main function to update all script references
function updateScriptReferences() {
  console.log('Starting script reference update...');
  
  const redirectsMap = getRedirectsMap();
  const entries = Object.entries(redirectsMap);
  
  console.log(`Found ${entries.length} script redirects to process`);
  
  let totalFiles = 0;
  let totalReplacements = 0;
  const updatedFiles = new Set();
  
  // Process each redirect entry
  for (const [originalPath, newPath] of entries) {
    console.log(`Processing: ${originalPath} -> ${newPath}`);
    
    // Find files referencing this script path
    const referencingFiles = findReferencingFiles(originalPath);
    
    if (referencingFiles.length > 0) {
      console.log(`  Found ${referencingFiles.length} files referencing ${originalPath}`);
      
      // Update references in each file
      for (const filePath of referencingFiles) {
        // Skip the redirects file itself to avoid corrupting it
        if (filePath === REDIRECTS_FILE) continue;
        
        if (updateFileReferences(filePath, originalPath, newPath)) {
          console.log(`  Updated references in: ${filePath}`);
          updatedFiles.add(filePath);
          totalReplacements++;
        }
      }
      
      totalFiles += referencingFiles.length;
    } else {
      console.log(`  No references found for: ${originalPath}`);
    }
  }
  
  // Generate report
  console.log('\nReference update summary:');
  console.log(`Total files scanned for references: ${totalFiles}`);
  console.log(`Total files updated: ${updatedFiles.size}`);
  console.log(`Total replacements made: ${totalReplacements}`);
  
  // Generate a more detailed report file
  generateUpdateReport(entries.length, updatedFiles.size, totalReplacements);
  
  console.log('Script reference update completed.');
}

// Generate a report of the update process
function generateUpdateReport(redirectCount, filesUpdated, replacementsCount) {
  const reportPath = 'docs/script-reference-update-report.md';
  
  const reportContent = `# Script Reference Update Report

Date: ${new Date().toISOString().split('T')[0]}

## Summary

- **Total Redirects Processed**: ${redirectCount}
- **Files Updated**: ${filesUpdated}
- **Total Replacements**: ${replacementsCount}

## Next Steps

1. Verify the application still functions correctly after reference updates
2. Run tests to ensure there are no regressions
3. Remove original script files now that references have been updated
4. Update documentation to reflect the new script organization

`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Generated update report at ${reportPath}`);
}

// Run the update
updateScriptReferences(); 
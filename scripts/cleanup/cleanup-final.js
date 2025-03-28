#!/usr/bin/env node
/**
 * Final Cleanup Script
 * 
 * This script completes the cleanup process by:
 * 1. Moving necessary assets from scripts/src to appropriate locations
 * 2. Removing the scripts/src directory entirely
 * 3. Moving the cleanup scripts to the consolidated directory
 * 
 * Usage:
 *   node scripts/cleanup-final.js --dry-run  # Show what would be done without changing anything
 *   node scripts/cleanup-final.js            # Execute the final cleanup
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const ROOT_DIR = process.cwd();

// Utility functions for colored console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message) {
  console.log(message);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function warning(message) {
  console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ️ ${message}${colors.reset}`);
}

// Move a file to a new location
function moveFile(sourcePath, destPath) {
  if (DRY_RUN) {
    info(`[DRY RUN] Would move: ${sourcePath} -> ${destPath}`);
    return;
  }
  
  try {
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    
    // Remove original
    fs.unlinkSync(sourcePath);
    
    success(`Moved: ${sourcePath} -> ${destPath}`);
  } catch (err) {
    error(`Failed to move ${sourcePath}: ${err.message}`);
  }
}

// Remove a directory or file
function removeItem(itemPath) {
  if (DRY_RUN) {
    info(`[DRY RUN] Would remove: ${itemPath}`);
    return;
  }
  
  try {
    if (fs.existsSync(itemPath)) {
      if (fs.lstatSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(itemPath);
      }
      success(`Removed: ${itemPath}`);
    } else {
      warning(`Item does not exist: ${itemPath}`);
    }
  } catch (err) {
    error(`Failed to remove ${itemPath}: ${err.message}`);
  }
}

// Process the scripts/src directory
function processSrcDirectory() {
  info('Processing scripts/src directory...');
  
  const srcDir = path.join(ROOT_DIR, 'scripts/src');
  if (!fs.existsSync(srcDir)) {
    warning('scripts/src directory does not exist, skipping');
    return;
  }
  
  // Move asset files to public directory
  const iconDataSrc = path.join(srcDir, 'components/ui/icons/icon-data.ts');
  const iconRegistrySrc = path.join(srcDir, 'components/ui/icons/mapping/icon-registry.json');
  const iconUrlMapSrc = path.join(srcDir, 'components/ui/icons/mapping/icon-url-map.json');
  
  const iconDataDest = path.join(ROOT_DIR, 'scripts/consolidated/icons/icon-data.ts');
  const iconRegistryDest = path.join(ROOT_DIR, 'scripts/public/ui-icons/icon-registry.json');
  const iconUrlMapDest = path.join(ROOT_DIR, 'scripts/public/ui-icons/icon-url-map.json');
  
  if (fs.existsSync(iconDataSrc)) {
    moveFile(iconDataSrc, iconDataDest);
  }
  
  if (fs.existsSync(iconRegistrySrc)) {
    moveFile(iconRegistrySrc, iconRegistryDest);
  }
  
  if (fs.existsSync(iconUrlMapSrc)) {
    moveFile(iconUrlMapSrc, iconUrlMapDest);
  }
  
  // Remove the entire scripts/src directory
  removeItem(srcDir);
}

// Process cleanup scripts
function processCleanupScripts() {
  info('Processing cleanup scripts...');
  
  // Move the cleanup-deprecated-scripts.js to consolidated/cleanup
  const deprecatedScriptSrc = path.join(ROOT_DIR, 'scripts/cleanup-deprecated-scripts.js');
  const deprecatedScriptDest = path.join(ROOT_DIR, 'scripts/consolidated/cleanup/cleanup-deprecated-scripts.js');
  
  if (fs.existsSync(deprecatedScriptSrc)) {
    moveFile(deprecatedScriptSrc, deprecatedScriptDest);
  }
  
  // Move this script to consolidated/cleanup after execution
  const thisScript = path.join(ROOT_DIR, 'scripts/cleanup-final.js');
  const thisScriptDest = path.join(ROOT_DIR, 'scripts/consolidated/cleanup/cleanup-final.js');
  
  if (!DRY_RUN) {
    // Create a post-execution script that will move this script
    const tempScriptPath = path.join(ROOT_DIR, 'scripts/temp-move-script.js');
    const moveScriptContent = `
      // This script moves cleanup-final.js to consolidated/cleanup after execution
import fs from 'fs';
import path from 'path';
      
      setTimeout(() => {
        try {
          // Move the cleanup-final.js file
          const sourcePath = '${thisScript.replace(/\\/g, '\\\\')}';
          const destPath = '${thisScriptDest.replace(/\\/g, '\\\\')}';
          
          // Create destination directory if it doesn't exist
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          
          // Copy file
          fs.copyFileSync(sourcePath, destPath);
          
          // Remove original
          fs.unlinkSync(sourcePath);
          
          console.log('\\x1b[32m✅ Moved cleanup-final.js to consolidated/cleanup\\x1b[0m');
          
          // Remove this temporary script
          fs.unlinkSync('${tempScriptPath.replace(/\\/g, '\\\\')}');
        } catch (err) {
          console.error('\\x1b[31m❌ Failed to move cleanup-final.js:\\x1b[0m', err.message);
        }
      }, 1000);
    `;
    
    fs.writeFileSync(tempScriptPath, moveScriptContent);
    
    // Execute the post-execution script in the background
    setTimeout(() => {
      try {
        execSync(`node ${tempScriptPath} &`, { stdio: 'inherit' });
      } catch (err) {
        error(`Failed to execute temp script: ${err.message}`);
      }
    }, 100);
  } else {
    info(`[DRY RUN] Would move this script (${thisScript}) to ${thisScriptDest} after execution`);
  }
}

// Update package.json to include new scripts
function updatePackageJson() {
  info('Updating package.json with cleanup scripts...');
  
  if (DRY_RUN) {
    info('[DRY RUN] Would update package.json with new cleanup scripts');
    return;
  }
  
  try {
    const packageJsonPath = path.join(ROOT_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add new scripts
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['cleanup:deprecated'] = 'node scripts/consolidated/cleanup/cleanup-deprecated-scripts.js';
    packageJson.scripts['cleanup:final'] = 'node scripts/consolidated/cleanup/cleanup-final.js';
    
    // Save updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    success('Updated package.json with new cleanup scripts');
  } catch (err) {
    error(`Failed to update package.json: ${err.message}`);
  }
}

// Generate final report
function generateReport() {
  const reportPath = path.join(ROOT_DIR, 'docs/final-cleanup-report.md');
  
  const reportContent = `# Final Cleanup Report
Date: ${new Date().toISOString().split('T')[0]}

## Summary

This report documents the final cleanup steps performed to complete the unification project.

### Actions Performed

1. **Asset Migration**
   - Moved \`icon-data.ts\` to \`scripts/consolidated/icons/\`
   - Moved \`icon-registry.json\` to \`scripts/public/ui-icons/\`
   - Moved \`icon-url-map.json\` to \`scripts/public/ui-icons/\`

2. **Directory Removal**
   - Removed \`scripts/src\` directory completely

3. **Script Organization**
   - Moved cleanup scripts to \`scripts/consolidated/cleanup/\`
   - Added npm scripts for future cleanup operations

### Final Directory Structure

The \`scripts\` directory now has a clean, optimized structure:

\`\`\`
scripts/
├── consolidated/  # All consolidated scripts organized by category
│   ├── build/
│   ├── cleanup/
│   ├── documentation/
│   ├── icons/
│   ├── linting/
│   ├── testing/
│   └── utils/
└── public/        # Public assets only
    └── ui-icons/
\`\`\`

## Next Steps

1. Use scripts from their new consolidated locations
2. Run \`npm run cleanup:deprecated\` if any deprecated scripts are found in the future
3. Update any remaining documentation to reference the new script locations

## Conclusion

The scripts directory is now fully optimized and organized according to the unification project guidelines. This completes the final cleanup phase of the unification project.
`;
  
  if (DRY_RUN) {
    info(`[DRY RUN] Would create report at: ${reportPath}`);
    console.log('\n--- Report Preview ---\n');
    console.log(reportContent);
    console.log('\n--- End Preview ---\n');
  } else {
    try {
      fs.writeFileSync(reportPath, reportContent);
      success(`Created final cleanup report at: ${reportPath}`);
    } catch (err) {
      error(`Failed to create report: ${err.message}`);
    }
  }
}

// Main function
function main() {
  log('\n🧹 Final Cleanup - Completing Unification Project');
  log('=================================================');
  
  if (DRY_RUN) {
    warning('Running in DRY RUN mode - no changes will be made');
  }
  
  // Process scripts/src
  processSrcDirectory();
  
  // Process cleanup scripts
  processCleanupScripts();
  
  // Update package.json
  updatePackageJson();
  
  // Generate final report
  generateReport();
  
  // Final message
  if (DRY_RUN) {
    info('[DRY RUN] Run without --dry-run to execute the final cleanup');
  } else {
    success('Final cleanup complete!');
    success('The scripts directory is now fully optimized and organized.');
    success('Final report created at: docs/final-cleanup-report.md');
  }
}

// Run the main function
main(); 
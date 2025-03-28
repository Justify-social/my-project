/**
 * Update Download Icons Script
 * 
 * This script creates an updated version of the download-icons.js script
 * that works with the new directory structure.
 * 
 * Usage:
 *   node scripts/icons/update-download-icons.js           # Normal mode
 *   node scripts/icons/update-download-icons.js --install  # Install as default script
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Process command line arguments
const args = process.argv.slice(2);
const shouldInstall = args.includes('--install');

// Paths
const sourceScriptPath = path.join(__dirname, '..', 'icon-management', 'download-icons.js');
const targetScriptPath = path.join(__dirname, 'download-icons.js');
const backupScriptPath = path.join(__dirname, '..', 'icon-management', 'download-icons.js.bak');

// Ensure the source script exists
if (!fs.existsSync(sourceScriptPath)) {
  console.error(`Source script not found: ${sourceScriptPath}`);
  process.exit(1);
}

// Read the source script
const sourceScript = fs.readFileSync(sourceScriptPath, 'utf8');

// Updates to make to the script
const updates = [
  // Update output directories
  {
    pattern: /const OUTPUT_DIRS = \{[\s\S]*?\};/,
    replacement: `const OUTPUT_DIRS = {
  'fas': path.join(__dirname, '..', '..', 'public', 'icons', 'solid'),
  'fal': path.join(__dirname, '..', '..', 'public', 'icons', 'light'),
  'fab': path.join(__dirname, '..', '..', 'public', 'icons', 'brands'),
  'far': path.join(__dirname, '..', '..', 'public', 'icons', 'regular')
};`
  },
  
  // Update paths in download functions
  {
    pattern: /url = `https:\/\/site-assets\.fontawesome\.com\/releases\/v6\.4\.0\/svgs\/${style}\/${mappedName}\.svg`;/g,
    replacement: `url = \`https://site-assets.fontawesome.com/releases/v6.4.0/svgs/\${style}/\${mappedName}.svg\`;`
  },
  
  // Update generate-icon-data.js reference
  {
    pattern: /const generateIconDataPath = path\.join\(__dirname, 'generate-icon-data\.js'\);/g,
    replacement: `const generateIconDataPath = path.join(__dirname, '..', 'icons', 'generate-icon-data.js');`
  },
  
  // Update the path for running the generate-icon-data script
  {
    pattern: /execSync\('node scripts\/icon-management\/generate-icon-data\.js'/g,
    replacement: `execSync('node scripts/icons/generate-icon-data.js'`
  }
];

// Apply updates to the script
let updatedScript = sourceScript;
for (const update of updates) {
  updatedScript = updatedScript.replace(update.pattern, update.replacement);
}

// Add header comment
updatedScript = `/**
 * Icon Downloader (Updated for new directory structure)
 * 
 * This is an updated version of the original download-icons.js script
 * modified to work with the new directory structure.
 * 
 * Usage:
 *   node scripts/icons/download-icons.js         # Normal mode
 *   node scripts/icons/download-icons.js --verbose   # Verbose mode with detailed logging
 */
${updatedScript}`;

// Write the updated script to the target path
console.log(`Writing updated script to: ${targetScriptPath}`);
fs.writeFileSync(targetScriptPath, updatedScript, 'utf8');
console.log('Script updated successfully!');

// Make the script executable
try {
  execSync(`chmod +x ${targetScriptPath}`);
  console.log('Made script executable');
} catch (error) {
  console.warn('Could not make script executable:', error.message);
}

// Install as default script if requested
if (shouldInstall) {
  console.log('\nInstalling as default script...');
  
  // Back up the original script
  console.log(`Backing up original script to: ${backupScriptPath}`);
  fs.copyFileSync(sourceScriptPath, backupScriptPath);
  
  // Copy the updated script to the original location
  console.log(`Copying updated script to: ${sourceScriptPath}`);
  fs.copyFileSync(targetScriptPath, sourceScriptPath);
  
  console.log('Script installed as default!');
  console.log(`Original script backed up to: ${backupScriptPath}`);
} else {
  console.log('\nTo install as the default script, run with --install flag:');
  console.log(`node ${path.relative(process.cwd(), __filename)} --install`);
} 
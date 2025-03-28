/**
 * Update Generate Icon Data Script
 * 
 * This script creates an updated version of the generate-icon-data.js script
 * that works with the new directory structure.
 * 
 * Usage:
 *   node scripts/icons/update-generate-icon-data.js           # Normal mode
 *   node scripts/icons/update-generate-icon-data.js --install  # Install as default script
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Process command line arguments
const args = process.argv.slice(2);
const shouldInstall = args.includes('--install');

// Paths
const sourceScriptPath = path.join(__dirname, '..', 'icon-management', 'generate-icon-data.js');
const targetScriptPath = path.join(__dirname, 'generate-icon-data.js');
const backupScriptPath = path.join(__dirname, '..', 'icon-management', 'generate-icon-data.js.bak');

// Ensure the source script exists
if (!fs.existsSync(sourceScriptPath)) {
  console.error(`Source script not found: ${sourceScriptPath}`);
  process.exit(1);
}

// Read the source script
const sourceScript = fs.readFileSync(sourceScriptPath, 'utf8');

// Updates to make to the script
const updates = [
  // Update icon directories
  {
    pattern: /const ICON_DIRS = \{[\s\S]*?\};/,
    replacement: `const ICON_DIRS = {
  solid: path.join(__dirname, '..', '..', 'public', 'icons', 'solid'),
  light: path.join(__dirname, '..', '..', 'public', 'icons', 'light'),
  brands: path.join(__dirname, '..', '..', 'public', 'icons', 'brands'),
  regular: path.join(__dirname, '..', '..', 'public', 'icons', 'regular')
};`
  },
  
  // Update output file path
  {
    pattern: /const OUTPUT_FILE = .*$/m,
    replacement: `const OUTPUT_FILE = path.join(__dirname, '..', '..', 'src', 'assets', 'icons', 'data', 'icon-data.ts');`
  },
  
  // Update SVG URL paths in the code that constructs URLs
  {
    pattern: /svgData\.url = `\/ui-icons\/${styleName}\/${info\.name}\.svg`;/g,
    replacement: `svgData.url = \`/icons/\${styleName}/\${info.name}.svg\`;`
  },
  
  // Fix another potential URL reference
  {
    pattern: /url: "\/ui-icons\//g,
    replacement: `url: "/icons/`
  }
];

// Apply updates to the script
let updatedScript = sourceScript;
for (const update of updates) {
  updatedScript = updatedScript.replace(update.pattern, update.replacement);
}

// Add header comment
updatedScript = `/**
 * Icon Data Generator (Updated for new directory structure)
 * 
 * This is an updated version of the original generate-icon-data.js script
 * modified to work with the new directory structure.
 * 
 * Usage:
 *   node scripts/icons/generate-icon-data.js         # Normal mode
 *   node scripts/icons/generate-icon-data.js --verbose   # Verbose mode with detailed logging
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
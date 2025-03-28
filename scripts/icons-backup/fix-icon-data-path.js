/**
 * Fix Icon Data Path References
 * 
 * This script ensures that all icon data references point to the correct locations.
 */

import fs from 'fs';
import path from 'path';

// Ensure icon-data.ts exists in both locations
const sourceIconDataPath = path.join(__dirname, '..', 'src', 'assets', 'icons', 'data', 'icon-data.ts');
const coreIconDataPath = path.join(__dirname, '..', 'src', 'components', 'ui', 'icons', 'core', 'icon-data.ts');
const mainIconDataPath = path.join(__dirname, '..', 'src', 'components', 'ui', 'icons', 'icon-data.ts');

console.log('Fixing icon data paths...');

// Check if source exists
if (!fs.existsSync(sourceIconDataPath)) {
  console.error(`Error: Source icon data file not found at ${sourceIconDataPath}`);
  process.exit(1);
}

// Ensure directories exist
const coreDir = path.dirname(coreIconDataPath);
if (!fs.existsSync(coreDir)) {
  console.log(`Creating directory: ${coreDir}`);
  fs.mkdirSync(coreDir, { recursive: true });
}

// Copy the file to core location
try {
  console.log(`Copying icon data to: ${coreIconDataPath}`);
  fs.copyFileSync(sourceIconDataPath, coreIconDataPath);
} catch (error) {
  console.error(`Error copying to core location: ${error.message}`);
}

// Create a symlink or copy to the main location
try {
  console.log(`Creating symlink to: ${mainIconDataPath}`);
  
  // Remove existing file or symlink if it exists
  if (fs.existsSync(mainIconDataPath)) {
    fs.unlinkSync(mainIconDataPath);
  }
  
  // Try to create a symlink first
  try {
    fs.symlinkSync(coreIconDataPath, mainIconDataPath);
  } catch (symlinkError) {
    // If symlink fails (e.g., on Windows or due to permissions), copy instead
    console.log(`Symlink failed, copying file instead: ${symlinkError.message}`);
    fs.copyFileSync(coreIconDataPath, mainIconDataPath);
  }
} catch (error) {
  console.error(`Error creating reference to main location: ${error.message}`);
}

// Check if files now exist
const coreExists = fs.existsSync(coreIconDataPath);
const mainExists = fs.existsSync(mainIconDataPath);

console.log('\nStatus:');
console.log(`Core icon data file: ${coreExists ? '✅ Found' : '❌ Missing'}`);
console.log(`Main icon data file: ${mainExists ? '✅ Found' : '❌ Missing'}`);

if (coreExists && mainExists) {
  console.log('\n✅ Icon data paths fixed successfully!');
} else {
  console.log('\n❌ Some icon data files are still missing. Please check errors above.');
} 
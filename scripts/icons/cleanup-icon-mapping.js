#!/usr/bin/env node

/**
 * Icon Mapping Cleanup Tool
 * 
 * This script removes the legacy icon mapping file and updates the icon
 * utility code after all legacy references have been updated in the codebase.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Paths to update
const mappingFilePath = path.join(process.cwd(), 'public', 'static', 'icon-name-mapping.json');
const iconsFilePath = path.join(process.cwd(), 'src', 'components', 'ui', 'atoms', 'icon', 'icons.ts');

console.log(chalk.blue('Cleaning up icon mapping references...'));

// Check if mapping file exists
if (!fs.existsSync(mappingFilePath)) {
  console.log(chalk.yellow('Icon mapping file already removed.'));
} else {
  // Take a backup of the mapping file before deletion
  const backupPath = path.join(process.cwd(), 'public', 'static', 'icon-registry-backup', 'icon-name-mapping.json.bak');
  
  // Ensure backup directory exists
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  
  try {
    // Create backup
    fs.copyFileSync(mappingFilePath, backupPath);
    console.log(chalk.green(`✓ Created backup at ${backupPath}`));
    
    // Remove the mapping file
    fs.unlinkSync(mappingFilePath);
    console.log(chalk.green('✓ Removed icon-name-mapping.json'));
  } catch (error) {
    console.error(chalk.red('Error removing mapping file:'), error);
    process.exit(1);
  }
}

// Update the icon utility file to remove mapping logic
if (fs.existsSync(iconsFilePath)) {
  console.log(chalk.blue('Updating icon utilities to remove mapping logic...'));
  
  let content = fs.readFileSync(iconsFilePath, 'utf8');
  
  // Create backup
  const iconsFileBackupPath = `${iconsFilePath}.bak`;
  fs.writeFileSync(iconsFileBackupPath, content);
  console.log(chalk.green(`✓ Created backup of icon utilities at ${iconsFileBackupPath}`));
  
  // Replace mapping loading and usage with simplified version
  content = content.replace(/\/\/ Load icon name mappings[\s\S]*?try {[\s\S]*?} catch \(e\) {[\s\S]*?};/m, 
    `// Legacy icon name mappings have been removed
// All components now use direct references to standard icon IDs`);
  
  // Remove code that applies the mapping
  content = content.replace(/\/\/ Apply icon name mapping[\s\S]*?if \(iconNameMapping\[name\]\) {[\s\S]*?}/g,
    `// Legacy icon name mappings have been removed
  // No mapping needed as all components use standard icon IDs`);
  
  // Save updated file
  fs.writeFileSync(iconsFilePath, content);
  console.log(chalk.green('✓ Updated icon utilities to remove mapping logic'));
}

console.log(chalk.green('✓ Cleanup complete!'));
console.log(chalk.yellow('\nNOTE: The icon system now exclusively uses standardized icon IDs.'));
console.log(chalk.yellow('Any new components should reference icons directly by their registry ID.'));
console.log(chalk.yellow('Example: Use "faMagnifyingGlassLight" instead of "faSearch"')); 
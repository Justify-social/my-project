/**
 * ESLint Config Updater
 * 
 * This script migrates from the deprecated .eslintignore file to the
 * newer ignores property in eslint.config.mjs.
 */

const fs = require('fs');
const path = require('path');

const eslintConfigPath = path.resolve(process.cwd(), 'eslint.config.mjs');
const eslintIgnorePath = path.resolve(process.cwd(), '.eslintignore');

// Check if the necessary files exist
if (!fs.existsSync(eslintConfigPath)) {
  console.error('Error: eslint.config.mjs file not found');
  process.exit(1);
}

if (!fs.existsSync(eslintIgnorePath)) {
  console.error('Error: .eslintignore file not found');
  process.exit(1);
}

// Read the .eslintignore file
const ignoreContent = fs.readFileSync(eslintIgnorePath, 'utf-8');
const ignoreLines = ignoreContent
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

// Read the ESLint config file
let configContent = fs.readFileSync(eslintConfigPath, 'utf-8');

// Format the ignore patterns for insertion
const formattedIgnores = ignoreLines.map(line => `    '${line}',`).join('\n');

// Pattern to find the ignores property
const ignoresRegex = /ignores\s*:\s*\[([\s\S]*?)\]/g;

if (ignoresRegex.test(configContent)) {
  // Replace the existing ignores array
  configContent = configContent.replace(ignoresRegex, `ignores: [\n${formattedIgnores}\n  ]`);
} else {
  // Look for the files property to add ignores after it
  const filesRegex = /files\s*:\s*\[([\s\S]*?)\]/g;
  
  if (filesRegex.test(configContent)) {
    configContent = configContent.replace(filesRegex, (match) => {
      return `${match},\n  ignores: [\n${formattedIgnores}\n  ]`;
    });
  } else {
    // As a fallback, add ignores property to the last configuration object
    const lastBraceIndex = configContent.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      configContent = configContent.slice(0, lastBraceIndex) +
        `,\n  ignores: [\n${formattedIgnores}\n  ]\n}` +
        configContent.slice(lastBraceIndex + 1);
    } else {
      console.error('Error: Unable to find a suitable place to add ignores property');
      process.exit(1);
    }
  }
}

// Create a backup of the original config
const backupPath = `${eslintConfigPath}.backup`;
fs.writeFileSync(backupPath, fs.readFileSync(eslintConfigPath));
console.log(`Created backup of eslint.config.mjs at ${backupPath}`);

// Write the updated config back to the file
fs.writeFileSync(eslintConfigPath, configContent);
console.log('Successfully updated eslint.config.mjs with ignores from .eslintignore');

// Rename the old .eslintignore file as a backup
fs.renameSync(eslintIgnorePath, `${eslintIgnorePath}.old`);
console.log('Renamed .eslintignore to .eslintignore.old');

console.log('\nMigration complete. Please test your ESLint configuration to ensure it works as expected.');
console.log('If there are issues, you can restore the backup files.'); 
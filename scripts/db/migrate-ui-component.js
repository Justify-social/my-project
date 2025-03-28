/**
 * UI Component Migration Script
 * 
 * This script assists in the migration of UI components from the root of the UI
 * directory to their appropriate subdirectories.
 * 
 * Usage:
 * node scripts/migrate-ui-component.js <source-file> <target-directory> [--update-imports] [--dry-run]
 * 
 * Example:
 * node scripts/migrate-ui-component.js src/components/ui/alert.tsx feedback
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Get command line arguments
const args = process.argv.slice(2);
const sourceFile = args[0];
const targetDirectory = args[1];
const updateImports = args.includes('--update-imports');
const dryRun = args.includes('--dry-run');

// Display help if no arguments provided
if (!sourceFile || !targetDirectory) {
  console.log(`
UI Component Migration Script

Usage:
  node scripts/migrate-ui-component.js <source-file> <target-directory> [--update-imports] [--dry-run]

Arguments:
  source-file      Path to the source component file
  target-directory Name of the target subdirectory (e.g., 'feedback', 'layout')
  --update-imports Scan and update imports in other files (experimental)
  --dry-run        Show what would be done without making changes

Example:
  node scripts/migrate-ui-component.js src/components/ui/alert.tsx feedback
  `);
  process.exit(1);
}

// Validate source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Source file ${sourceFile} does not exist`);
  process.exit(1);
}

// Parse source file path
const parsedPath = path.parse(sourceFile);
const sourceFileName = parsedPath.base;
const componentName = parsedPath.name.charAt(0).toUpperCase() + parsedPath.name.slice(1);

// Create target path
const targetDir = path.join('src/components/ui', targetDirectory);
const targetFile = path.join(targetDir, componentName + '.tsx');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  if (dryRun) {
    console.log(`Would create directory: ${targetDir}`);
  } else {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }
}

// Read source file
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

// Copy file
if (dryRun) {
  console.log(`Would copy: ${sourceFile} → ${targetFile}`);
} else {
  fs.writeFileSync(targetFile, sourceContent);
  console.log(`Copied: ${sourceFile} → ${targetFile}`);
}

// Update index.ts in target directory
const indexFile = path.join(targetDir, 'index.ts');
if (fs.existsSync(indexFile)) {
  const indexContent = fs.readFileSync(indexFile, 'utf8');
  const exportLine = `export * from './${componentName}';`;

  if (!indexContent.includes(exportLine)) {
    const updatedContent = indexContent.replace(
      /\/\/ Export components/,
      `// Export components\n${exportLine}`
    );

    if (dryRun) {
      console.log(`Would update index file: ${indexFile}`);
      console.log(`Adding export: ${exportLine}`);
    } else {
      fs.writeFileSync(indexFile, updatedContent);
      console.log(`Updated index file: ${indexFile}`);
    }
  }
}

// Update imports in other files (experimental)
if (updateImports) {
  try {
    const oldImportPath = `@/components/ui/${parsedPath.name}`;
    const newImportPath = `@/components/ui/${targetDirectory}`;
    
    console.log(`Scanning for imports of ${oldImportPath}...`);
    
    const grepCommand = `grep -r "from '${oldImportPath}'" --include="*.tsx" --include="*.ts" src/`;
    
    try {
      const grepResult = execSync(grepCommand, { encoding: 'utf8' });
      const affectedFiles = grepResult.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.split(':')[0]);
      
      console.log(`Found ${affectedFiles.length} files with imports to update:`);
      affectedFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const updatedContent = content.replace(
          new RegExp(`from '${oldImportPath}'`, 'g'),
          `from '${newImportPath}'`
        );
        
        if (dryRun) {
          console.log(`Would update imports in: ${file}`);
        } else {
          fs.writeFileSync(file, updatedContent);
          console.log(`Updated imports in: ${file}`);
        }
      });
    } catch (error) {
      // grep returns non-zero exit code when no matches found
      console.log('No imports found to update.');
    }
  } catch (error) {
    console.error(`Error updating imports: ${error.message}`);
  }
}

console.log('Component migration complete.');

// Suggest next steps
console.log('\nNext steps:');
console.log(`1. Update the icon-unification.md file to mark this migration as complete`);
console.log(`2. Run tests to verify everything is working correctly`);
if (!updateImports) {
  console.log(`3. Consider running with --update-imports to automatically update import paths`);
} 
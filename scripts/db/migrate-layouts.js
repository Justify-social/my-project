#!/usr/bin/env node

/**
 * Layout Components Migration Script
 * 
 * This script migrates layout components from /src/components/layouts/ to 
 * the new modular structure at /src/components/layout/ directory.
 * 
 * Usage:
 * Run in dry mode: node scripts/directory-structure/component-migration/migrate-layouts.js
 * Run with applying changes: node scripts/directory-structure/component-migration/migrate-layouts.js --apply
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const rootDir = process.cwd();
const dryRun = !process.argv.includes('--apply');
const verbose = process.argv.includes('--verbose');

// Source and target directories
const sourceDir = path.join(rootDir, 'src/components/layouts');
const targetDir = path.join(rootDir, 'src/components/layout');

// Old import patterns to search for
const oldImportPatterns = [
  /import\s+.*?\s+from\s+['"](.+?)\/layouts\/([^'"]+)['"]/g,
  /import\s+{\s*.*?\s*}\s+from\s+['"](.+?)\/layouts\/([^'"]+)['"]/g,
];

// Function to log messages with condition
function log(message, alwaysShow = false) {
  if (verbose || alwaysShow) {
    console.log(message);
  }
}

// Ensure the target directory exists
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    log(`Creating directory: ${dir}`, true);
    if (!dryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Get all layout component files
function getLayoutFiles() {
  if (!fs.existsSync(sourceDir)) {
    log(`Source directory does not exist: ${sourceDir}`, true);
    return [];
  }
  
  try {
    return fs.readdirSync(sourceDir).filter(file => 
      file.endsWith('.tsx') || file.endsWith('.ts')
    );
  } catch (error) {
    log(`Error reading source directory: ${error.message}`, true);
    return [];
  }
}

// Migrate a single layout component
function migrateLayoutComponent(filename) {
  const sourcePath = path.join(sourceDir, filename);
  const targetPath = path.join(targetDir, filename);

  // Read the component file
  let content;
  try {
    content = fs.readFileSync(sourcePath, 'utf8');
  } catch (error) {
    log(`Error reading file ${sourcePath}: ${error.message}`, true);
    return false;
  }

  // Create the target file
  if (!dryRun) {
    try {
      fs.writeFileSync(targetPath, content);
      log(`Created ${targetPath}`, true);
    } catch (error) {
      log(`Error creating file ${targetPath}: ${error.message}`, true);
      return false;
    }
  } else {
    log(`Would create ${targetPath}`, true);
  }

  return true;
}

// Create an index.ts file in the target directory
function createIndexFile() {
  const files = getLayoutFiles();
  if (files.length === 0) return;

  const indexContent = `/**
 * Layout Components
 * 
 * This directory contains structural layout components for the application.
 */

// Export components
${files.map(file => {
  const name = path.basename(file, path.extname(file));
  return `export * from './${name}';`;
}).join('\n')}
`;

  const indexPath = path.join(targetDir, 'index.ts');
  
  if (!dryRun) {
    try {
      fs.writeFileSync(indexPath, indexContent);
      log(`Created index file at ${indexPath}`, true);
    } catch (error) {
      log(`Error creating index file: ${error.message}`, true);
    }
  } else {
    log(`Would create index file at ${indexPath} with content:`, true);
    log(indexContent, true);
  }
}

// Update imports throughout the codebase
function updateImports() {
  // Find all TypeScript and TSX files
  const command = `find ${rootDir} -type f -name "*.ts*" | grep -v "node_modules" | xargs grep -l "/layouts/" || true`;
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    const filesToUpdate = result.trim().split('\n').filter(Boolean);
    
    log(`Found ${filesToUpdate.length} files with layout imports to update`, true);
    
    for (const file of filesToUpdate) {
      let content;
      try {
        content = fs.readFileSync(file, 'utf8');
      } catch (error) {
        log(`Error reading file ${file}: ${error.message}`);
        continue;
      }
      
      // Replace import patterns
      let updatedContent = content;
      for (const pattern of oldImportPatterns) {
        updatedContent = updatedContent.replace(pattern, (match, prefix, component) => {
          return match.replace(`${prefix}/layouts/${component}`, `${prefix}/layout/${component}`);
        });
      }
      
      if (content !== updatedContent) {
        if (!dryRun) {
          try {
            fs.writeFileSync(file, updatedContent);
            log(`Updated imports in ${file}`);
          } catch (error) {
            log(`Error updating file ${file}: ${error.message}`, true);
          }
        } else {
          log(`Would update imports in ${file}`);
        }
      }
    }
  } catch (error) {
    log(`Error finding files to update: ${error.message}`, true);
  }
}

// Main function
function main() {
  log(`Starting layout components migration${dryRun ? ' (DRY RUN)' : ''}`, true);
  
  // Ensure target directory exists
  ensureDirectoryExists(targetDir);
  
  // Get all layout component files
  const files = getLayoutFiles();
  
  if (files.length === 0) {
    log('No layout components found to migrate', true);
    return;
  }
  
  log(`Found ${files.length} layout components to migrate`, true);
  
  // Migrate each component
  let migratedCount = 0;
  for (const file of files) {
    log(`Migrating ${file}...`);
    if (migrateLayoutComponent(file)) {
      migratedCount++;
    }
  }
  
  // Create index file
  createIndexFile();
  
  // Update imports throughout the codebase
  updateImports();
  
  log(`Layout component migration ${dryRun ? 'would complete' : 'completed'} with ${migratedCount}/${files.length} components migrated`, true);
  
  if (dryRun) {
    log('Run with --apply to apply the changes', true);
  }
}

// Run the script
main(); 
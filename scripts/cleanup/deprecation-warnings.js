#!/usr/bin/env node
/**
 * @fileoverview Script to add deprecation warnings to legacy import paths.
 * This script modifies re-export files in legacy directories to include console.warn
 * statements that notify developers about deprecated import paths.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const ROOT_DIR = path.join(__dirname, '../../..');
const BACKUP_DIR = path.join(ROOT_DIR, '.deprecation-warnings-backup');

// Legacy directories mapped to their new locations
const LEGACY_DIRECTORIES = [
  {
    dir: 'src/components/brand-lift',
    newPath: '@/components/features/campaigns/brand-lift',
    description: 'Brand lift components'
  },
  {
    dir: 'src/components/Influencers',
    newPath: '@/components/features/campaigns/influencers',
    description: 'Influencer management components'
  },
  {
    dir: 'src/components/Wizard',
    newPath: '@/components/features/campaigns/wizard',
    description: 'Campaign wizard components'
  },
  {
    dir: 'src/components/Search',
    newPath: '@/components/features/core/search',
    description: 'Search components'
  },
  {
    dir: 'src/components/mmm',
    newPath: '@/components/features/analytics/mmm',
    description: 'Marketing mix modeling components'
  },
  {
    dir: 'src/components/ErrorBoundary',
    newPath: '@/components/features/core/error-handling',
    description: 'Error boundary components'
  },
  {
    dir: 'src/components/ErrorFallback',
    newPath: '@/components/ui/error-fallback',
    description: 'Error fallback components'
  },
  {
    dir: 'src/components/upload',
    newPath: '@/components/features/assets/upload',
    description: 'Upload components'
  },
  {
    dir: 'src/components/gif',
    newPath: '@/components/features/assets/gif',
    description: 'GIF handling components'
  },
  {
    dir: 'src/components/AssetPreview',
    newPath: '@/components/features/assets',
    description: 'Asset preview components'
  },
  {
    dir: 'src/components/LoadingSkeleton',
    newPath: '@/components/features/core/loading',
    description: 'Loading skeleton components'
  }
];

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Statistics
const stats = {
  directoriesProcessed: 0,
  filesModified: 0,
  backupsMade: 0,
  errors: 0
};

/**
 * Creates a backup of a file before modifying it.
 * @param {string} filePath - Path of the file to backup
 * @returns {boolean} - Whether backup was successful
 */
function createBackup(filePath) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = filePath.replace(/\//g, '_');
    const backupPath = path.join(BACKUP_DIR, `${fileName}.${timestamp}.bak`);
    
    fs.copyFileSync(filePath, backupPath);
    stats.backupsMade++;
    console.log(`✓ Backed up to ${backupPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating backup for ${filePath}: ${error.message}`);
    stats.errors++;
    return false;
  }
}

/**
 * Adds deprecation warnings to a re-export file.
 * @param {string} filePath - Path of the re-export file
 * @param {string} newImportPath - The recommended import path
 * @param {string} description - Description of the component
 * @returns {boolean} - Whether modification was successful
 */
function addDeprecationWarning(filePath, newImportPath, description) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has deprecation warning
    if (content.includes('console.warn(') && content.includes('DEPRECATED')) {
      console.log(`⚠ File already has deprecation warning: ${filePath}`);
      return false;
    }
    
    // Create backup
    if (!createBackup(filePath)) {
      return false;
    }
    
    // Determine the file type
    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    
    // Generate deprecation warning code
    const packageName = 'your-app';
    const fileName = path.basename(filePath);
    const oldPath = filePath.replace(`${ROOT_DIR}/`, '');
    const warningCode = `
// Add deprecation warning for legacy imports
if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '\\x1b[33m%s\\x1b[0m',
    \`DEPRECATED IMPORT: '\${oldPath}' is deprecated and will be removed in a future version of \${packageName}. \` +
    \`Please update your imports to use '\${newImportPath}' instead. (\${description})\`
  );
}
`;
    
    // Modify content based on file type
    let modifiedContent;
    if (isTypeScript) {
      // For TypeScript, find the right position to insert the warning (after imports but before exports)
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
      
      if (lastImportIndex !== -1) {
        const endOfImports = lastImportIndex + importLines[importLines.length - 1].length;
        modifiedContent = content.slice(0, endOfImports) + '\n' + warningCode + content.slice(endOfImports);
      } else {
        // If no imports, add at the beginning
        modifiedContent = warningCode + content;
      }
    } else {
      // For JavaScript, add at the beginning
      modifiedContent = warningCode + content;
    }
    
    // Write modified content
    fs.writeFileSync(filePath, modifiedContent);
    stats.filesModified++;
    console.log(`✓ Added deprecation warning to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error modifying ${filePath}: ${error.message}`);
    stats.errors++;
    return false;
  }
}

/**
 * Process a legacy directory and add deprecation warnings to all re-export files.
 * @param {string} dirPath - Path of the legacy directory
 * @param {string} newImportPath - The recommended import path
 * @param {string} description - Description of the component
 */
function processLegacyDirectory(dirPath, newImportPath, description) {
  const fullPath = path.join(ROOT_DIR, dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ Directory not found: ${fullPath}`);
    return;
  }
  
  console.log(`\nProcessing legacy directory: ${dirPath}`);
  stats.directoriesProcessed++;
  
  try {
    // Get all files in the directory
    const files = fs.readdirSync(fullPath);
    
    // Process each file
    files.forEach(file => {
      const filePath = path.join(fullPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
        // Add deprecation warning to the file
        addDeprecationWarning(filePath, newImportPath, description);
      } else if (stats.isDirectory()) {
        // Process subdirectories recursively
        processLegacyDirectory(
          path.join(dirPath, file),
          newImportPath,
          description
        );
      }
    });
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Main function to add deprecation warnings to all legacy directories.
 */
function main() {
  console.log('=== Adding Deprecation Warnings to Legacy Imports ===');
  
  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Process each legacy directory
  LEGACY_DIRECTORIES.forEach(({ dir, newPath, description }) => {
    processLegacyDirectory(dir, newPath, description);
  });
  
  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Directories processed: ${stats.directoriesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Backups made: ${stats.backupsMade}`);
  console.log(`Errors: ${stats.errors}`);
  
  if (stats.errors > 0) {
    console.log('\n⚠ Some errors occurred during processing. Check the logs for details.');
    process.exit(1);
  } else {
    console.log('\n✓ Deprecation warnings added successfully!');
  }
}

// Execute main function
main(); 
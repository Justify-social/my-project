#!/usr/bin/env node

/**
 * Stray Utilities Consolidation Script
 * 
 * This script identifies and consolidates utility files that are scattered
 * throughout the codebase into standardized locations.
 * 
 * It:
 * 1. Identifies stray utility files based on naming patterns and content
 * 2. Creates backups of these files
 * 3. Moves them to appropriate locations based on their functionality
 * 4. Creates re-export files for backward compatibility
 * 5. Updates imports throughout the codebase
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';
import readline from 'readline';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '../../../.stray-utilities-backup');
const ROOT_DIR = path.join(__dirname, '../../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Stats for tracking
const stats = {
  filesIdentified: 0,
  filesBackedUp: 0,
  filesMoved: 0,
  importsUpdated: 0,
  reExportsCreated: 0
};

// Target directories for utilities
const targetDirectories = {
  string: path.join(SRC_DIR, 'utils/string'),
  date: path.join(SRC_DIR, 'utils/date'),
  format: path.join(SRC_DIR, 'utils/format'),
  validation: path.join(SRC_DIR, 'utils/validation'),
  array: path.join(SRC_DIR, 'utils/array'),
  object: path.join(SRC_DIR, 'utils/object'),
  math: path.join(SRC_DIR, 'utils/math'),
  url: path.join(SRC_DIR, 'utils/url'),
  file: path.join(SRC_DIR, 'utils/file'),
  network: path.join(SRC_DIR, 'utils/network'),
  ui: path.join(SRC_DIR, 'utils/ui'),
  dom: path.join(SRC_DIR, 'utils/dom'),
  general: path.join(SRC_DIR, 'utils')
};

// Patterns to identify utility files and their categories
const utilityPatterns = [
  {
    pattern: /format|formatter|formatting/i,
    category: 'format',
    description: 'Formatting utilities'
  },
  {
    pattern: /validate|validation|validator/i,
    category: 'validation',
    description: 'Validation utilities'
  },
  {
    pattern: /string|text|str/i,
    category: 'string',
    description: 'String manipulation utilities'
  },
  {
    pattern: /date|time|datetime|calendar/i,
    category: 'date',
    description: 'Date and time utilities'
  },
  {
    pattern: /array|list|collection/i,
    category: 'array',
    description: 'Array manipulation utilities'
  },
  {
    pattern: /object|map|prop/i,
    category: 'object',
    description: 'Object manipulation utilities'
  },
  {
    pattern: /math|calc|calculate|number/i, 
    category: 'math',
    description: 'Mathematical utilities'
  },
  {
    pattern: /url|path|route/i,
    category: 'url',
    description: 'URL manipulation utilities'
  },
  {
    pattern: /file|upload|download/i,
    category: 'file',
    description: 'File handling utilities'
  },
  {
    pattern: /api|fetch|request|http/i,
    category: 'network',
    description: 'Network-related utilities'
  },
  {
    pattern: /ui|theme|style|css/i,
    category: 'ui',
    description: 'UI-related utilities'
  },
  {
    pattern: /dom|element|html/i,
    category: 'dom',
    description: 'DOM manipulation utilities'
  }
];

/**
 * Creates backup directory if it doesn't exist
 */
function ensureBackupDirectory() {
  if (!fs.existsSync(BACKUP_DIR)) {
    if (!DRY_RUN) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    console.log(`${colors.blue}Created backup directory: ${BACKUP_DIR}${colors.reset}`);
  }
}

/**
 * Creates target directories if they don't exist
 */
function ensureTargetDirectories() {
  for (const [category, directory] of Object.entries(targetDirectories)) {
    if (!fs.existsSync(directory)) {
      if (!DRY_RUN) {
        fs.mkdirSync(directory, { recursive: true });
      }
      console.log(`${colors.blue}Created target directory: ${directory}${colors.reset}`);
    }
  }
}

/**
 * Identifies a utility file's category based on name and content
 * @param {string} filePath - Path to the utility file
 * @returns {string|null} - Category or null if not identified
 */
function identifyUtilityCategory(filePath) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Check filename against patterns
  for (const { pattern, category } of utilityPatterns) {
    if (pattern.test(fileName)) {
      return category;
    }
  }
  
  // Check first few lines of content against patterns
  const firstFewLines = fileContent.split('\n').slice(0, 10).join('\n');
  for (const { pattern, category } of utilityPatterns) {
    if (pattern.test(firstFewLines)) {
      return category;
    }
  }
  
  // Default to general utilities if we can't categorize
  return 'general';
}

/**
 * Finds all potential utility files in the codebase
 * @returns {Array} - Array of potential utility files with paths and categories
 */
function findUtilityFiles() {
  console.log(`${colors.blue}Scanning for potential utility files...${colors.reset}`);
  
  // Find files using glob patterns
  const utilityFilesCommand = `find ${SRC_DIR} -type f -name "*util*.ts" -o -name "*helper*.ts" -o -name "*format*.ts" -o -name "*validator*.ts"`;
  
  try {
    const result = execSync(utilityFilesCommand, { encoding: 'utf8' });
    const filePaths = result.split('\n').filter(path => path.trim() !== '');
    
    // Skip files that are already in the utils directory
    const filteredPaths = filePaths.filter(filePath => !filePath.includes('/utils/'));
    
    // Identify categories
    const utilityFiles = filteredPaths.map(filePath => {
      const category = identifyUtilityCategory(filePath);
      return { path: filePath, category };
    });
    
    console.log(`${colors.green}Found ${utilityFiles.length} potential utility files outside of utils directory${colors.reset}`);
    stats.filesIdentified = utilityFiles.length;
    
    return utilityFiles;
  } catch (error) {
    console.error(`${colors.red}Error scanning for utility files: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Creates a backup of a file
 * @param {string} filePath - Path to the file to back up
 * @returns {string} - Path to the backup file
 */
function backupFile(filePath) {
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const backupPath = path.join(BACKUP_DIR, `${fileName}.${timestamp}`);
  
  if (!DRY_RUN) {
    fs.copyFileSync(filePath, backupPath);
  }
  
  stats.filesBackedUp++;
  return backupPath;
}

/**
 * Moves a utility file to its target directory
 * @param {Object} utilityFile - Utility file info with path and category
 * @returns {Object} - Result with old and new paths
 */
function moveUtilityFile(utilityFile) {
  const { path: filePath, category } = utilityFile;
  const fileName = path.basename(filePath);
  const targetDir = targetDirectories[category];
  const targetPath = path.join(targetDir, fileName);
  
  // Create backup
  const backupPath = backupFile(filePath);
  console.log(`${colors.green}✓ Backed up${colors.reset} ${filePath} to ${backupPath}`);
  
  // Move file
  if (!DRY_RUN) {
    fs.copyFileSync(filePath, targetPath);
    
    // Create re-export file for backward compatibility if needed
    createReExportFile(filePath, targetPath);
  }
  
  console.log(`${colors.green}✓ Moved${colors.reset} ${filePath} to ${targetPath} (${category} utilities)`);
  stats.filesMoved++;
  
  return {
    oldPath: filePath,
    newPath: targetPath
  };
}

/**
 * Creates a re-export file for backward compatibility
 * @param {string} originalPath - Original path of the utility file
 * @param {string} newPath - New path of the utility file
 */
function createReExportFile(originalPath, newPath) {
  // Only create re-export if the file is imported elsewhere
  const importCheck = `grep -r "from '.*${path.basename(originalPath, '.ts')}'" --include="*.ts" --include="*.tsx" ${SRC_DIR}`;
  
  try {
    const importResult = execSync(importCheck, { encoding: 'utf8' });
    const importLines = importResult.split('\n').filter(line => !line.includes(originalPath) && line.trim() !== '');
    
    if (importLines.length === 0) {
      console.log(`${colors.yellow}No imports found for ${originalPath}, skipping re-export${colors.reset}`);
      return;
    }
    
    // Create re-export file
    const relativePath = path.relative(path.dirname(originalPath), newPath).replace(/\\/g, '/');
    const reExportContent = `/**
 * This file is maintained for backward compatibility.
 * Please import from '${path.relative(SRC_DIR, newPath).replace(/\\/g, '/')}' instead.
 * 
 * @deprecated
 */

export * from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';
`;

    if (!DRY_RUN) {
      fs.writeFileSync(originalPath, reExportContent);
    }
    
    console.log(`${colors.green}✓ Created re-export${colors.reset} at ${originalPath}`);
    stats.reExportsCreated++;
  } catch (error) {
    // No imports found
    console.log(`${colors.yellow}No imports found for ${originalPath}, will remove original${colors.reset}`);
    
    // Remove original file
    if (!DRY_RUN) {
      fs.unlinkSync(originalPath);
    }
  }
}

/**
 * Updates the utils/index.ts file to include all newly migrated utilities
 */
function updateUtilsIndex() {
  const utilsIndexPath = path.join(SRC_DIR, 'utils/index.ts');
  
  // Check if utils/index.ts exists
  if (!fs.existsSync(utilsIndexPath)) {
    console.log(`${colors.yellow}Utils index file does not exist, creating one${colors.reset}`);
    
    if (!DRY_RUN) {
      // Create categories from targetDirectories
      const categories = Object.keys(targetDirectories)
        .filter(cat => cat !== 'general')
        .sort();
      
      // Create content
      let indexContent = `/**
 * Utils Index
 * 
 * This file re-exports all utility functions for easy imports.
 */

`;
      
      // Add exports for each category
      for (const category of categories) {
        indexContent += `// ${utilityPatterns.find(p => p.category === category)?.description || '${category} utilities'}\n`;
        indexContent += `export * from './${category}';\n\n`;
      }
      
      // Add exports for general utils
      indexContent += `// General utilities\n`;
      indexContent += `export * from './general';\n`;
      
      fs.writeFileSync(utilsIndexPath, indexContent);
    }
    
    console.log(`${colors.green}✓ Created${colors.reset} utils index file`);
    return;
  }
  
  // Read existing index file
  const indexContent = fs.readFileSync(utilsIndexPath, 'utf8');
  const lines = indexContent.split('\n');
  
  // Check if categories are already exported
  const categories = Object.keys(targetDirectories)
    .filter(cat => cat !== 'general')
    .sort();
  
  const missingCategories = categories.filter(category => 
    !indexContent.includes(`from './${category}'`)
  );
  
  if (missingCategories.length === 0) {
    console.log(`${colors.green}✓ Utils index file is up-to-date${colors.reset}`);
    return;
  }
  
  console.log(`${colors.yellow}Updating utils index file with ${missingCategories.length} new categories${colors.reset}`);
  
  if (!DRY_RUN) {
    // Add missing exports to the end
    let newContent = indexContent;
    
    for (const category of missingCategories) {
      const description = utilityPatterns.find(p => p.category === category)?.description || `${category} utilities`;
      newContent += `\n// ${description}\n`;
      newContent += `export * from './${category}';\n`;
    }
    
    fs.writeFileSync(utilsIndexPath, newContent);
  }
  
  console.log(`${colors.green}✓ Updated${colors.reset} utils index file`);
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Stray Utilities Consolidation Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Ensure directories exist
  ensureBackupDirectory();
  ensureTargetDirectories();
  
  // Find utility files
  const utilityFiles = findUtilityFiles();
  
  if (utilityFiles.length === 0) {
    console.log(`${colors.yellow}No stray utility files found${colors.reset}`);
    return;
  }
  
  // Group utility files by category
  const categorizedFiles = {};
  for (const utilFile of utilityFiles) {
    if (!categorizedFiles[utilFile.category]) {
      categorizedFiles[utilFile.category] = [];
    }
    categorizedFiles[utilFile.category].push(utilFile);
  }
  
  // Print categorization
  console.log(`\n${colors.cyan}=== Utility Files Categorization ===${colors.reset}`);
  for (const [category, files] of Object.entries(categorizedFiles)) {
    console.log(`${colors.magenta}${category}${colors.reset} (${files.length} files):`);
    for (const file of files) {
      console.log(`  - ${path.relative(ROOT_DIR, file.path)}`);
    }
  }
  
  // Confirm with user if not in dry run
  if (!DRY_RUN) {
    console.log(`\n${colors.yellow}This will move ${utilityFiles.length} files to their respective utility directories.${colors.reset}`);
    console.log(`${colors.yellow}Backups will be created in ${BACKUP_DIR}${colors.reset}`);
    
    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`\n${colors.yellow}Do you want to continue? (y/n) ${colors.reset}`, answer => {
      rl.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log(`${colors.red}Aborted${colors.reset}`);
        process.exit(0);
      }
      
      // Move files
      processUtilityFiles(utilityFiles);
    });
  } else {
    console.log(`\n${colors.yellow}This is a dry run. No files will be moved.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes${colors.reset}`);
  }
}

/**
 * Process utility files (move and update)
 * @param {Array} utilityFiles - Array of utility files to process
 */
function processUtilityFiles(utilityFiles) {
  console.log(`\n${colors.cyan}=== Moving Utility Files ===${colors.reset}`);
  
  const movedFiles = utilityFiles.map(moveUtilityFile);
  
  // Update utils index
  updateUtilsIndex();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}✓ Files identified:${colors.reset} ${stats.filesIdentified}`);
  console.log(`${colors.green}✓ Files backed up:${colors.reset} ${stats.filesBackedUp}`);
  console.log(`${colors.green}✓ Files moved:${colors.reset} ${stats.filesMoved}`);
  console.log(`${colors.green}✓ Re-exports created:${colors.reset} ${stats.reExportsCreated}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  }
}

// Handle non-interactive mode for dry run
if (DRY_RUN) {
  // Just find and categorize files without moving them
  main();
} else {
  main();
} 
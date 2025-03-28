#!/usr/bin/env node

/**
 * Debug Tools Unification Script
 * 
 * This script unifies the duplicated debug-tools components:
 * - src/components/ui/debug-tools.tsx
 * - src/components/ui/utilities/debug-tools.tsx
 * 
 * It will:
 * 1. Create a backup of both files
 * 2. Keep the component in utilities/ directory as the canonical version
 * 3. Update the root file to re-export from utilities (for backward compatibility)
 * 4. Update any imports throughout the codebase if needed
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '../../../.debug-tools-backup');
const ROOT_DIR = path.join(__dirname, '../../..');

// Paths to components
const ROOT_DEBUG_TOOLS = path.join(ROOT_DIR, 'src/components/ui/debug-tools.tsx');
const UTILITIES_DEBUG_TOOLS = path.join(ROOT_DIR, 'src/components/ui/utilities/debug-tools.tsx');

// Stats for tracking
const stats = {
  backupsMade: 0,
  filesModified: 0,
  importsUpdated: 0
};

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

/**
 * Creates a backup of files before modifying them
 */
function createBackups() {
  console.log(`${colors.blue}Creating backups of debug-tools files...${colors.reset}`);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Format timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  // Backup root debug-tools file
  if (fs.existsSync(ROOT_DEBUG_TOOLS)) {
    const backupPath = path.join(BACKUP_DIR, `debug-tools.${timestamp}.tsx`);
    if (!DRY_RUN) {
      fs.copyFileSync(ROOT_DEBUG_TOOLS, backupPath);
    }
    console.log(`${colors.green}✓ Backed up${colors.reset} root debug-tools to ${backupPath}`);
    stats.backupsMade++;
  }
  
  // Backup utilities debug-tools file
  if (fs.existsSync(UTILITIES_DEBUG_TOOLS)) {
    const backupPath = path.join(BACKUP_DIR, `utilities-debug-tools.${timestamp}.tsx`);
    if (!DRY_RUN) {
      fs.copyFileSync(UTILITIES_DEBUG_TOOLS, backupPath);
    }
    console.log(`${colors.green}✓ Backed up${colors.reset} utilities debug-tools to ${backupPath}`);
    stats.backupsMade++;
  }
}

/**
 * Updates the root debug-tools file to re-export from utilities
 */
function updateRootDebugTools() {
  console.log(`${colors.blue}Updating root debug-tools to re-export from utilities...${colors.reset}`);
  
  // Check if root debug-tools exists
  if (!fs.existsSync(ROOT_DEBUG_TOOLS)) {
    console.log(`${colors.yellow}⚠ Root debug-tools file does not exist${colors.reset}`);
    return;
  }
  
  // Create re-export file
  const reExportContent = `/**
 * This file is maintained for backward compatibility.
 * Please use the canonical version in utilities/debug-tools instead.
 * 
 * @deprecated Import from '@/components/ui/utilities/debug-tools' instead
 */

export { default } from './utilities/debug-tools';
`;

  if (!DRY_RUN) {
    fs.writeFileSync(ROOT_DEBUG_TOOLS, reExportContent);
  }
  
  console.log(`${colors.green}✓ Updated${colors.reset} root debug-tools to re-export from utilities`);
  stats.filesModified++;
}

/**
 * Finds all imports of debug-tools and updates them if needed
 */
function updateImports() {
  console.log(`${colors.blue}Checking for imports that might need updating...${colors.reset}`);
  
  // Find all imports using grep (we don't have to update these since we're maintaining compatibility)
  // But it's good to know which files are using it
  try {
    const grepCommand = `grep -r "from '@/components/ui/debug-tools'" --include="*.tsx" --include="*.ts" ${ROOT_DIR}/src`;
    const result = execSync(grepCommand, { encoding: 'utf8' });
    
    const importLines = result.split('\n').filter(line => line.trim() !== '');
    if (importLines.length > 0) {
      console.log(`${colors.yellow}The following files import from root debug-tools:${colors.reset}`);
      importLines.forEach(line => {
        console.log(`  - ${line.split(':')[0]}`);
      });
      
      console.log(`${colors.green}✓ No action needed${colors.reset} as we're maintaining backward compatibility`);
    } else {
      console.log(`${colors.green}✓ No direct imports from root debug-tools found${colors.reset}`);
    }
  } catch (error) {
    // grep returns non-zero exit code when no matches found
    console.log(`${colors.green}✓ No direct imports from root debug-tools found${colors.reset}`);
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Debug Tools Unification Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Execute steps
  createBackups();
  updateRootDebugTools();
  updateImports();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}✓ Backups created:${colors.reset} ${stats.backupsMade}`);
  console.log(`${colors.green}✓ Files modified:${colors.reset} ${stats.filesModified}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  }
}

// Execute main function
main(); 
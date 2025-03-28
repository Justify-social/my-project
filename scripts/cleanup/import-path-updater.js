#!/usr/bin/env node

/**
 * Import Path Updater Script
 * 
 * This script scans the codebase and updates deprecated import paths:
 * - '@/lib/utils' → '@/utils/string/utils'
 * - '@/components/error-fallback' → '@/components/ui/error-fallback'
 * - '@/components/Brand-Lift' → '@/components/features/campaigns/brand-lift'
 * - '@/components/influencers' → '@/components/features/campaigns/influencers'
 * - '@/components/wizard' → '@/components/features/campaigns/wizard'
 * - and more
 * 
 * The script creates backups before making any changes to ensure safety.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '../../../.import-path-fixes-backup');
const ROOT_DIR = path.join(__dirname, '../../../');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const APP_DIR = path.join(ROOT_DIR, 'app');

// Import path mappings to update
const IMPORT_PATH_MAPPINGS = [
  {
    from: /@\/lib\/utils/g,
    to: '@/utils/string/utils',
    description: 'Utilities moved to standardized location'
  },
  {
    from: /@\/components\/ErrorFallback/g,
    to: '@/components/ui/error-fallback',
    description: 'Error fallback moved to UI components'
  },
  {
    from: /@\/components\/Brand-Lift/g,
    to: '@/components/features/campaigns/brand-lift',
    description: 'Brand lift components moved to features/campaigns'
  },
  {
    from: /@\/components\/Influencers/g,
    to: '@/components/features/campaigns/influencers',
    description: 'Influencer components moved to features/campaigns'
  },
  {
    from: /@\/components\/Wizard/g,
    to: '@/components/features/campaigns/wizard',
    description: 'Wizard components moved to features/campaigns'
  },
  {
    from: /@\/components\/Search/g,
    to: '@/components/features/core/search',
    description: 'Search components moved to features/core'
  },
  {
    from: /@\/components\/mmm/g,
    to: '@/components/features/analytics/mmm',
    description: 'MMM components moved to features/analytics'
  },
  {
    from: /@\/components\/ErrorBoundary/g,
    to: '@/components/features/core/error-handling',
    description: 'Error boundary components moved to features/core'
  },
  {
    from: /@\/components\/upload/g,
    to: '@/components/features/assets/upload',
    description: 'Upload components moved to features/assets'
  },
  {
    from: /@\/components\/gif/g,
    to: '@/components/features/assets/gif',
    description: 'GIF components moved to features/assets'
  },
  {
    from: /@\/components\/AssetPreview/g,
    to: '@/components/features/assets',
    description: 'Asset preview components moved to features/assets'
  },
  {
    from: /@\/components\/LoadingSkeleton/g,
    to: '@/components/features/core/loading',
    description: 'Loading skeleton components moved to features/core'
  }
];

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

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
  filesScanned: 0,
  filesModified: 0,
  backupsMade: 0,
  importPathsUpdated: 0
};

/**
 * Creates a backup of a file before modifying it
 * @param {string} filePath - Path to the file to backup
 */
function createBackup(filePath) {
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Generate backup file path
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\//g, '_');
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const backupPath = path.join(BACKUP_DIR, `${relPath}.${timestamp}.bak`);
  
  // Create backup
  if (!DRY_RUN) {
    fs.copyFileSync(filePath, backupPath);
  }
  
  stats.backupsMade++;
  return backupPath;
}

/**
 * Updates import paths in a single file
 * @param {string} filePath - Path to the file to update
 * @returns {boolean} - Whether the file was modified
 */
function updateFileImportPaths(filePath) {
  // Read file content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
    return false;
  }
  
  // Track if any changes were made
  let modified = false;
  const originalContent = content;
  
  // Apply each import path mapping
  for (const mapping of IMPORT_PATH_MAPPINGS) {
    if (mapping.from.test(content)) {
      content = content.replace(mapping.from, mapping.to);
      modified = true;
      stats.importPathsUpdated++;
    }
  }
  
  // If content was modified, save the changes
  if (modified) {
    if (!DRY_RUN) {
      // Backup the file before modifying
      const backupPath = createBackup(filePath);
      console.log(`${colors.blue}Backed up to ${backupPath}${colors.reset}`);
      
      // Write the updated content
      fs.writeFileSync(filePath, content, 'utf8');
    }
    console.log(`${colors.green}✓ Updated import paths in ${filePath}${colors.reset}`);
    stats.filesModified++;
  }
  
  return modified;
}

/**
 * Recursively scans a directory for files to process
 * @param {string} dirPath - Path to the directory to scan
 */
function scanDirectory(dirPath) {
  // Get all files in the directory
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (error) {
    console.log(`${colors.red}Error reading directory ${dirPath}: ${error.message}${colors.reset}`);
    return;
  }
  
  // Process each entry
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    
    // Skip node_modules and certain directories
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name.startsWith('.')) {
        continue;
      }
      scanDirectory(entryPath);
    } else if (entry.isFile()) {
      // Check if the file has a relevant extension
      const ext = path.extname(entry.name).toLowerCase();
      if (FILE_EXTENSIONS.includes(ext)) {
        stats.filesScanned++;
        updateFileImportPaths(entryPath);
      }
    }
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Import Path Updater Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Print import path mappings to update
  console.log(`${colors.blue}Import path mappings to update:${colors.reset}`);
  for (const mapping of IMPORT_PATH_MAPPINGS) {
    console.log(`  ${colors.yellow}${mapping.from.toString()}${colors.reset} → ${colors.green}${mapping.to}${colors.reset} (${mapping.description})`);
  }
  
  // Scan the codebase
  console.log(`\n${colors.blue}Scanning the codebase...${colors.reset}`);
  scanDirectory(SRC_DIR);
  if (fs.existsSync(APP_DIR)) {
    scanDirectory(APP_DIR);
  }
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.blue}Files scanned:${colors.reset} ${stats.filesScanned}`);
  console.log(`${colors.blue}Files modified:${colors.reset} ${stats.filesModified}`);
  console.log(`${colors.blue}Backups made:${colors.reset} ${stats.backupsMade}`);
  console.log(`${colors.blue}Import paths updated:${colors.reset} ${stats.importPathsUpdated}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}Import paths have been successfully updated!${colors.reset}`);
  }
}

// Run the script
main(); 
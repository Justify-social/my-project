#!/usr/bin/env node

/**
 * Backup UI Components Script
 * 
 * This script creates a backup of all UI components before the shadcn migration.
 * It copies the entire UI components directory to a backup location.
 * 
 * Usage:
 *   node scripts/backup-ui-components.js
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const SOURCE_DIR = 'src/components/ui';
const BACKUP_DIR = 'backup-components/ui-pre-shadcn';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('📦 Creating UI components backup...');
    
    // Create timestamp-based backup directory
    const backupDirWithTimestamp = `${BACKUP_DIR}-${TIMESTAMP}`;
    
    // Check if source directory exists
    if (!fs.existsSync(SOURCE_DIR)) {
      console.error(`❌ Source directory does not exist: ${SOURCE_DIR}`);
      process.exit(1);
    }
    
    // Ensure backup directory exists
    fs.ensureDirSync(path.dirname(backupDirWithTimestamp));
    
    // Copy entire components directory to backup
    fs.copySync(SOURCE_DIR, backupDirWithTimestamp);
    
    // Create a git tag for easy reference
    try {
      execSync(`git tag ui-components-backup-${TIMESTAMP}`);
      console.log(`✅ Created git tag: ui-components-backup-${TIMESTAMP}`);
    } catch (error) {
      console.warn(`⚠️ Could not create git tag: ${error.message}`);
    }
    
    console.log(`✅ Backup created at: ${backupDirWithTimestamp}`);
    console.log('🚀 Ready to proceed with shadcn migration');
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run the script
main(); 
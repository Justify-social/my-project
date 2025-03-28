#!/usr/bin/env node

/**
 * Tabs Component Migration Script
 * 
 * This script helps migrate usages of the old tabs component to the new modular tabs component.
 * It searches for import statements that reference the old tabs.tsx file and replaces them
 * with the new modular import path.
 * 
 * Usage:
 * node migrate-tabs.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const SRC_DIR = path.resolve(process.cwd(), 'src');
const SEARCH_PATTERNS = [
  '@/components/ui/tabs',
  '../components/ui/tabs',
  '../../components/ui/tabs',
  '../ui/tabs',
  './tabs',
  '../tabs'
];

// Helper functions
function findFilesImportingOldTabs() {
  console.log('Searching for files importing old tabs component...');
  
  const files = new Set();
  
  for (const pattern of SEARCH_PATTERNS) {
    try {
      // Use a simpler grep pattern that's more likely to work
      const command = `grep -l -r --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" "from \\"${pattern}\\"" ${SRC_DIR}`;
      console.log(`Running: ${command}`);
      
      try {
        const output = execSync(command).toString().trim();
        if (output) {
          output.split('\n').forEach(file => files.add(file));
        }
      } catch (err) {
        // grep returns exit code 1 when no matches are found, which is not an error for us
        if (err.status !== 1) {
          console.error(`Error executing grep for pattern ${pattern}:`, err.message);
        }
      }
      
    } catch (error) {
      console.error(`Error searching for pattern ${pattern}:`, error.message);
    }
  }
  
  return Array.from(files);
}

function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }
  
  // Original content for comparison
  const originalContent = content;
  
  // Process standard named imports
  let modified = false;
  for (const pattern of SEARCH_PATTERNS) {
    // Named imports pattern: import { X, Y } from "pattern";
    const namedImportRegex = new RegExp(`import\\s*{([^}]+)}\\s*from\\s*["']${pattern.replace(/\//g, '\\/')}["'];?`, 'g');
    
    content = content.replace(namedImportRegex, (match, imports) => {
      modified = true;
      return `import { ${imports} } from "@/components/ui/tabs";`;
    });
    
    // Default import pattern: import Tabs from "pattern";
    const defaultImportRegex = new RegExp(`import\\s+(\\w+)\\s+from\\s*["']${pattern.replace(/\//g, '\\/')}["'];?`, 'g');
    
    content = content.replace(defaultImportRegex, (match, importName) => {
      modified = true;
      return `import ${importName} from "@/components/ui/tabs";`;
    });
  }
  
  // Save changes if file was modified and not in dry-run mode
  if (modified) {
    if (DRY_RUN) {
      console.log(`✓ Would update ${filePath} (dry run)`);
      console.log(`  Original: ${originalContent.split('\n')[0].substring(0, 80)}...`);
      console.log(`  New     : ${content.split('\n')[0].substring(0, 80)}...`);
    } else {
      try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${filePath}`);
      } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
      }
    }
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

// Main execution
function main() {
  console.log('Tabs Component Migration Script');
  console.log('==============================');
  console.log(`Mode: ${DRY_RUN ? 'Dry Run (no changes will be made)' : 'Live Run'}`);
  
  // Find files that import the old tabs component
  const filesToProcess = findFilesImportingOldTabs();
  
  if (filesToProcess.length === 0) {
    console.log('No files found importing the old tabs component.');
    return;
  }
  
  console.log(`\nFound ${filesToProcess.length} file(s) to process:\n`);
  
  // Process each file
  filesToProcess.forEach(processFile);
  
  console.log('\nMigration complete!');
  if (DRY_RUN) {
    console.log('This was a dry run. No actual changes were made.');
    console.log('Run without --dry-run to apply the changes.');
  }
}

main(); 
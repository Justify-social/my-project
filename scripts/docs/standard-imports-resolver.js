#!/usr/bin/env node

/**
 * Standard Imports Resolver Script
 * 
 * This script analyzes the unresolved imports documented in docs/unresolved-imports.md
 * and adds standard library imports (like React, Next.js) to files where they are missing.
 * 
 * This addresses the ~80 remaining import issues identified during final verification.
 */

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.join(__dirname, '../../../../');
const UNRESOLVED_IMPORTS_PATH = path.join(ROOT_DIR, 'docs/unresolved-imports.md');
const BACKUP_DIR = path.join(ROOT_DIR, '.standard-imports-fixes-backup');

// Standard library imports to add
const STANDARD_IMPORTS = {
  'react': "import React from 'react';",
  'next/navigation': "import { useRouter, useParams, useSearchParams } from 'next/navigation';",
  'next/link': "import Link from 'next/link';",
  'next/image': "import Image from 'next/image';",
  '@auth0/nextjs-auth0': "import { getSession } from '@auth0/nextjs-auth0';",
  '@auth0/nextjs-auth0/client': "import { useUser } from '@auth0/nextjs-auth0/client';",
  'react-hot-toast': "import toast from 'react-hot-toast';",
  '@testing-library/react': "import { render, screen, fireEvent } from '@testing-library/react';",
  '@fortawesome/react-fontawesome': "import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';",
  '@fortawesome/fontawesome-svg-core': "import { library } from '@fortawesome/fontawesome-svg-core';",
  '@fortawesome/pro-solid-svg-icons': "import { fas } from '@fortawesome/pro-solid-svg-icons';",
  '@fortawesome/pro-light-svg-icons': "import { fal } from '@fortawesome/pro-light-svg-icons';",
  '@fortawesome/free-brands-svg-icons': "import { fab } from '@fortawesome/free-brands-svg-icons';",
  'framer-motion': "import { motion, AnimatePresence } from 'framer-motion';",
  'next/server': "import { NextResponse, NextRequest } from 'next/server';",
  'fs': "import fs from 'fs';",
  'path': "import path from 'path';",
  '@prisma/client': "import { PrismaClient } from '@prisma/client';",
  'recharts': "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';",
  'next-auth/react': "import { signIn, signOut, useSession } from 'next-auth/react';"
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

// Stats for tracking
const stats = {
  filesAnalyzed: 0,
  filesModified: 0,
  backupsMade: 0,
  importsAdded: 0,
  errorCount: 0
};

/**
 * Parse the unresolved imports document to extract file paths and missing imports
 * @returns {Object} - Object with file paths as keys and arrays of missing imports as values
 */
function parseUnresolvedImports() {
  try {
    const content = fs.readFileSync(UNRESOLVED_IMPORTS_PATH, 'utf8');
    const fileImports = {};
    
    // Extract sections for each file
    const fileSections = content.split(/### (.+)\n/);
    
    for (let i = 1; i < fileSections.length; i += 2) {
      const filePath = fileSections[i].trim();
      const sectionContent = fileSections[i + 1];
      
      if (!fileImports[filePath]) {
        fileImports[filePath] = [];
      }
      
      // Extract import statements
      const importMatches = sectionContent.matchAll(/`import ... from '(.+)'`/g);
      for (const match of importMatches) {
        const importPath = match[1];
        if (STANDARD_IMPORTS[importPath]) {
          fileImports[filePath].push(importPath);
        }
      }
    }
    
    return fileImports;
  } catch (error) {
    console.error(`${colors.red}Error parsing unresolved imports: ${error.message}${colors.reset}`);
    stats.errorCount++;
    return {};
  }
}

/**
 * Creates a backup of a file before modifying it
 * @param {string} filePath - Path to the file to backup
 */
function createBackup(filePath) {
  try {
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
  } catch (error) {
    console.error(`${colors.red}Error creating backup for ${filePath}: ${error.message}${colors.reset}`);
    stats.errorCount++;
    return null;
  }
}

/**
 * Add standard imports to a file
 * @param {string} filePath - Path to the file
 * @param {Array<string>} imports - Array of import paths to add
 */
function addStandardImports(filePath, imports) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  try {
    console.log(`${colors.blue}Processing ${filePath}${colors.reset}`);
    stats.filesAnalyzed++;
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`${colors.yellow}File not found: ${fullPath}${colors.reset}`);
      return;
    }
    
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Create import statements to add
    const importsToAdd = [];
    
    for (const importPath of imports) {
      // Check if already present
      if (content.includes(`from '${importPath}'`) || content.includes(`from "${importPath}"`)) {
        console.log(`${colors.yellow}Import for '${importPath}' already exists in ${filePath}${colors.reset}`);
        continue;
      }
      
      // Add the import
      importsToAdd.push(STANDARD_IMPORTS[importPath]);
      stats.importsAdded++;
    }
    
    // If no imports to add, skip file
    if (importsToAdd.length === 0) {
      console.log(`${colors.yellow}No standard imports to add to ${filePath}${colors.reset}`);
      return;
    }
    
    // Find the right place to add imports
    // Try to find existing imports first
    const importRegex = /import .+ from ['"].+['"]/g;
    const lastImportMatch = [...content.matchAll(importRegex)].pop();
    
    if (lastImportMatch) {
      // Add after the last import
      const lastImportIndex = lastImportMatch.index + lastImportMatch[0].length;
      content = content.substring(0, lastImportIndex) + '\n' + importsToAdd.join('\n') + content.substring(lastImportIndex);
    } else {
      // Add at the beginning, but after any comments or doctype
      const firstCodeLineMatch = content.match(/^(\/\*[\s\S]*?\*\/|\/\/.*\n)*(.*)/);
      const startIndex = firstCodeLineMatch ? firstCodeLineMatch.index : 0;
      content = content.substring(0, startIndex) + importsToAdd.join('\n') + '\n' + content.substring(startIndex);
    }
    
    // Write changes if content was modified
    if (content !== originalContent) {
      if (!DRY_RUN) {
        // Create backup
        const backupPath = createBackup(fullPath);
        if (backupPath) {
          console.log(`${colors.blue}Backed up to ${backupPath}${colors.reset}`);
        }
        
        // Write the file
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`${colors.green}✓ Added ${importsToAdd.length} imports to ${filePath}${colors.reset}`);
      } else {
        console.log(`${colors.green}Would add ${importsToAdd.length} imports to ${filePath}${colors.reset}`);
      }
      
      stats.filesModified++;
    }
  } catch (error) {
    console.error(`${colors.red}Error processing ${filePath}: ${error.message}${colors.reset}`);
    stats.errorCount++;
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Standard Imports Resolver Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Check if unresolved imports file exists
  if (!fs.existsSync(UNRESOLVED_IMPORTS_PATH)) {
    console.error(`${colors.red}Unresolved imports file not found: ${UNRESOLVED_IMPORTS_PATH}${colors.reset}`);
    process.exit(1);
  }
  
  // Parse unresolved imports
  console.log(`${colors.blue}Parsing unresolved imports...${colors.reset}`);
  const fileImports = parseUnresolvedImports();
  
  // Add standard imports
  console.log(`${colors.blue}Adding standard imports...${colors.reset}`);
  for (const filePath in fileImports) {
    addStandardImports(filePath, fileImports[filePath]);
  }
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.blue}Files analyzed:${colors.reset} ${stats.filesAnalyzed}`);
  console.log(`${colors.blue}Files modified:${colors.reset} ${stats.filesModified}`);
  console.log(`${colors.blue}Backups made:${colors.reset} ${stats.backupsMade}`);
  console.log(`${colors.blue}Imports added:${colors.reset} ${stats.importsAdded}`);
  console.log(`${colors.blue}Errors:${colors.reset} ${stats.errorCount}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}Standard imports have been successfully added!${colors.reset}`);
    
    // Update stats in unification.md
    console.log(`${colors.yellow}Remember to update unification.md with the results of this script.${colors.reset}`);
  }
}

// Run the script
main(); 
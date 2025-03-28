#!/usr/bin/env node

/**
 * Examples Circular Dependency Fix Script
 * 
 * This script fixes the circular dependency between:
 * - src/components/ui/examples.tsx
 * - src/components/ui/index.ts
 * 
 * The circular dependency occurs because:
 * 1. index.ts exports ColorPaletteLogosExamples from examples.tsx
 * 2. examples.tsx imports components from index.ts
 * 
 * This script resolves it by:
 * 1. Creating a separate ColorPaletteLogosExamples.tsx file
 * 2. Updating examples.tsx to import from the new file
 * 3. Updating index.ts to import from the new file
 * 4. Creating backups before making any changes
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '../../../../.circular-dep-fixes-backup');
const ROOT_DIR = path.join(__dirname, '../../../../');

// Paths to components
const EXAMPLES_PATH = path.join(ROOT_DIR, 'src/components/ui/examples.tsx');
const INDEX_PATH = path.join(ROOT_DIR, 'src/components/ui/index.ts');
const COLOR_EXAMPLES_PATH = path.join(ROOT_DIR, 'src/components/ui/examples/ColorPaletteLogosExamples.tsx');

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
  backupsMade: 0,
  filesCreated: 0,
  filesModified: 0
};

/**
 * Creates a backup of files before modifying them
 */
function createBackups() {
  console.log(`${colors.blue}Creating backups of examples files...${colors.reset}`);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Format timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  // Backup examples file
  if (fs.existsSync(EXAMPLES_PATH)) {
    const backupPath = path.join(BACKUP_DIR, `examples.${timestamp}.tsx`);
    if (!DRY_RUN) {
      fs.copyFileSync(EXAMPLES_PATH, backupPath);
    }
    console.log(`${colors.green}✓ Backed up${colors.reset} examples.tsx to ${backupPath}`);
    stats.backupsMade++;
  }
  
  // Backup index file
  if (fs.existsSync(INDEX_PATH)) {
    const backupPath = path.join(BACKUP_DIR, `index.${timestamp}.ts`);
    if (!DRY_RUN) {
      fs.copyFileSync(INDEX_PATH, backupPath);
    }
    console.log(`${colors.green}✓ Backed up${colors.reset} index.ts to ${backupPath}`);
    stats.backupsMade++;
  }
}

/**
 * Extracts ColorPaletteLogosExamples component from examples.tsx
 */
function extractColorPaletteLogosExamples() {
  console.log(`${colors.blue}Extracting ColorPaletteLogosExamples component...${colors.reset}`);
  
  // Check if examples file exists
  if (!fs.existsSync(EXAMPLES_PATH)) {
    console.log(`${colors.red}Error: Examples file not found at ${EXAMPLES_PATH}${colors.reset}`);
    return;
  }
  
  // Read examples file content
  const content = fs.readFileSync(EXAMPLES_PATH, 'utf8');
  
  // Extract ColorPaletteLogosExamples function
  const colorPaletteLogosExamplesRegex = /export function ColorPaletteLogosExamples\(\) \{[\s\S]*?return[\s\S]*?<\/div>[\s\S]*?\}/m;
  const colorPaletteLogosExamplesMatch = content.match(colorPaletteLogosExamplesRegex);
  
  if (!colorPaletteLogosExamplesMatch) {
    console.log(`${colors.red}Error: ColorPaletteLogosExamples function not found in examples.tsx${colors.reset}`);
    return;
  }
  
  // Create new file content
  const colorPaletteLogosExamples = colorPaletteLogosExamplesMatch[0];
  
  // Check for imports used by this component
  const importRegex = /import.*?from.*?;/g;
  const imports = [];
  let importMatch;
  
  while ((importMatch = importRegex.exec(content)) !== null) {
    imports.push(importMatch[0]);
  }
  
  // Define content for new file
  const newFileContent = `'use client';

/**
 * Color Palette and Logos Examples Component
 * 
 * This component displays examples of color palettes and logos.
 * It has been extracted to its own file to resolve circular dependencies.
 */

import React from 'react';
import { colors } from '../colors';
import { Icon } from '../icons';
import { Card, CardHeader, CardContent } from '../card';
import { Heading, Text } from '../typography';

${colorPaletteLogosExamples}

// Default export for backwards compatibility
export default ColorPaletteLogosExamples;
`;

  // Create directory if it doesn't exist
  const dir = path.dirname(COLOR_EXAMPLES_PATH);
  if (!fs.existsSync(dir) && !DRY_RUN) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write new file
  if (!DRY_RUN) {
    fs.writeFileSync(COLOR_EXAMPLES_PATH, newFileContent);
  }
  
  console.log(`${colors.green}✓ Created${colors.reset} ColorPaletteLogosExamples component at ${COLOR_EXAMPLES_PATH}`);
  stats.filesCreated++;
}

/**
 * Updates examples.tsx to import from the new file
 */
function updateExamplesFile() {
  console.log(`${colors.blue}Updating examples.tsx...${colors.reset}`);
  
  // Check if examples file exists
  if (!fs.existsSync(EXAMPLES_PATH)) {
    console.log(`${colors.red}Error: Examples file not found at ${EXAMPLES_PATH}${colors.reset}`);
    return;
  }
  
  // Read file content
  const content = fs.readFileSync(EXAMPLES_PATH, 'utf8');
  
  // Add import for new component
  let updatedContent = content;
  
  // Check if import is already present
  if (!updatedContent.includes("import { ColorPaletteLogosExamples }")) {
    // Add the import near the top of the file, after the other imports
    updatedContent = updatedContent.replace(
      /(import.*from.*;\n)(?!import)/,
      `$1import { ColorPaletteLogosExamples } from './examples/ColorPaletteLogosExamples';\n\n`
    );
  }
  
  // Remove the ColorPaletteLogosExamples function if it's still in the file
  updatedContent = updatedContent.replace(
    /export function ColorPaletteLogosExamples\(\) \{[\s\S]*?return[\s\S]*?<\/div>[\s\S]*?\}/m,
    '// ColorPaletteLogosExamples has been moved to its own file'
  );
  
  if (!DRY_RUN) {
    fs.writeFileSync(EXAMPLES_PATH, updatedContent);
  }
  
  console.log(`${colors.green}✓ Updated${colors.reset} examples.tsx to import ColorPaletteLogosExamples`);
  stats.filesModified++;
}

/**
 * Updates index.ts to import from the new file
 */
function updateIndexFile() {
  console.log(`${colors.blue}Updating index.ts...${colors.reset}`);
  
  // Check if index file exists
  if (!fs.existsSync(INDEX_PATH)) {
    console.log(`${colors.red}Error: Index file not found at ${INDEX_PATH}${colors.reset}`);
    return;
  }
  
  // Read file content
  const content = fs.readFileSync(INDEX_PATH, 'utf8');
  
  // Update the import to point to new file
  const updatedContent = content.replace(
    /export \{ ColorPaletteLogosExamples \} from '\.\/examples';/,
    "export { ColorPaletteLogosExamples } from './examples/ColorPaletteLogosExamples';"
  );
  
  if (!DRY_RUN) {
    fs.writeFileSync(INDEX_PATH, updatedContent);
  }
  
  console.log(`${colors.green}✓ Updated${colors.reset} index.ts to import from new ColorPaletteLogosExamples file`);
  stats.filesModified++;
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Examples Circular Dependency Fix Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Execute steps
  createBackups();
  extractColorPaletteLogosExamples();
  updateExamplesFile();
  updateIndexFile();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}✓ Backups created:${colors.reset} ${stats.backupsMade}`);
  console.log(`${colors.green}✓ Files created:${colors.reset} ${stats.filesCreated}`);
  console.log(`${colors.green}✓ Files modified:${colors.reset} ${stats.filesModified}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}Circular dependency between examples.tsx and index.ts has been resolved!${colors.reset}`);
  }
}

// Run the script
main(); 
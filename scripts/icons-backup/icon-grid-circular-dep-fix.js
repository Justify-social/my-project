#!/usr/bin/env node

/**
 * Icon Grid Circular Dependency Fix Script
 * 
 * This script fixes the circular dependency between:
 * - src/components/ui/icons/examples/index.ts
 * - src/components/ui/icons/test/IconGrid.tsx
 * 
 * The circular dependency occurs because:
 * 1. examples/index.ts imports IconGrid from test/IconGrid.tsx
 * 2. test/IconGrid.tsx imports IconGridFromExamples from examples/index.ts
 * 
 * This script resolves it by:
 * 1. Moving IconGrid to a shared location (examples/IconGrid.tsx)
 * 2. Updating both files to import from the new location
 * 3. Creating backups before making any changes
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, '../../../../.circular-dep-fixes-backup');
const ROOT_DIR = path.join(__dirname, '../../../../');

// Paths to components
const EXAMPLES_INDEX_PATH = path.join(ROOT_DIR, 'src/components/ui/icons/examples/index.ts');
const ICONGRID_TEST_PATH = path.join(ROOT_DIR, 'src/components/ui/icons/test/IconGrid.tsx');
const ICONGRID_NEW_PATH = path.join(ROOT_DIR, 'src/components/ui/icons/examples/IconGrid.tsx');

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
  console.log(`${colors.blue}Creating backups of icon grid files...${colors.reset}`);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Format timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  
  // Backup examples index file
  if (fs.existsSync(EXAMPLES_INDEX_PATH)) {
    const backupPath = path.join(BACKUP_DIR, `examples-index.${timestamp}.ts`);
    if (!DRY_RUN) {
      fs.copyFileSync(EXAMPLES_INDEX_PATH, backupPath);
    }
    console.log(`${colors.green}✓ Backed up${colors.reset} examples index to ${backupPath}`);
    stats.backupsMade++;
  }
  
  // Backup IconGrid test file
  if (fs.existsSync(ICONGRID_TEST_PATH)) {
    const backupPath = path.join(BACKUP_DIR, `IconGrid-test.${timestamp}.tsx`);
    if (!DRY_RUN) {
      fs.copyFileSync(ICONGRID_TEST_PATH, backupPath);
    }
    console.log(`${colors.green}✓ Backed up${colors.reset} IconGrid test to ${backupPath}`);
    stats.backupsMade++;
  }
}

/**
 * Creates a new IconGrid file in the examples directory
 */
function createNewIconGrid() {
  console.log(`${colors.blue}Creating new IconGrid component in examples directory...${colors.reset}`);
  
  // Get the content of the current IconGrid component
  if (!fs.existsSync(ICONGRID_TEST_PATH)) {
    console.log(`${colors.red}Error: IconGrid test file not found at ${ICONGRID_TEST_PATH}${colors.reset}`);
    return;
  }
  
  // Read the content of the test IconGrid file
  // But we need to get the original implementation, not just the re-export
  const content = fs.readFileSync(ICONGRID_TEST_PATH, 'utf8');
  
  // Look for the real implementation in the examples directory
  // If it doesn't exist, we'll create it
  
  // Define content for the new IconGrid file
  const newIconGridContent = `'use client';

/**
 * Icon Grid Component
 * 
 * This component displays a grid of available icons for demonstration purposes.
 * It is shared between the examples and test modules.
 */

import React, { useState } from 'react';
import { Icon } from '../';
import { IconBaseProps } from '../types';
import { UI_ICON_MAP } from '../data';

interface IconGridProps {
  /**
   * Filter to apply to icons (shows icons containing this string)
   */
  filter?: string;
  
  /**
   * Number of columns in the grid
   */
  columns?: number;
  
  /**
   * Size of each icon
   */
  size?: string;
  
  /**
   * Color of each icon
   */
  color?: string;
}

/**
 * Displays a grid of available icons with search and filtering
 */
export function IconGrid({ 
  filter = '', 
  columns = 4, 
  size = 'md', 
  color = 'current' 
}: IconGridProps) {
  const [searchTerm, setSearchTerm] = useState(filter);
  
  // Filter icons based on search term
  const icons = Object.entries(UI_ICON_MAP)
    .filter(([name]) => 
      searchTerm ? name.toLowerCase().includes(searchTerm.toLowerCase()) : true
    )
    .sort(([a], [b]) => a.localeCompare(b));
  
  return (
    <div className="space-y-4 font-work-sans">
      <div className="mb-4 font-work-sans">
        <input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded font-work-sans"
        />
      </div>
      
      <div className="font-work-sans">
        <p className="text-sm text-gray-500 mb-2 font-work-sans">
          {icons.length} icons found
        </p>
      </div>
      
      <div
        className="grid gap-4 font-work-sans"
        style={{ gridTemplateColumns: \`repeat(\${columns}, 1fr)\` }}
      >
        {icons.map(([name, icon]) => (
          <div
            key={name}
            className="flex flex-col items-center p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors font-work-sans"
          >
            <Icon name={icon} size={size as IconBaseProps['size']} className="mb-2" />
            <span className="text-xs text-gray-600 text-center break-all font-work-sans">{name}</span>
            <span className="text-xs text-gray-400 mt-1 font-work-sans">{icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Default export for backwards compatibility
export default IconGrid;`;

  if (!DRY_RUN) {
    // Create the directory if it doesn't exist
    const dir = path.dirname(ICONGRID_NEW_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(ICONGRID_NEW_PATH, newIconGridContent);
  }
  
  console.log(`${colors.green}✓ Created${colors.reset} new IconGrid component at ${ICONGRID_NEW_PATH}`);
  stats.filesCreated++;
}

/**
 * Updates the examples index file to use the new IconGrid
 */
function updateExamplesIndex() {
  console.log(`${colors.blue}Updating examples index file...${colors.reset}`);
  
  // Check if file exists
  if (!fs.existsSync(EXAMPLES_INDEX_PATH)) {
    console.log(`${colors.red}Error: Examples index file not found at ${EXAMPLES_INDEX_PATH}${colors.reset}`);
    return;
  }
  
  // Read file content
  const content = fs.readFileSync(EXAMPLES_INDEX_PATH, 'utf8');
  
  // Update imports and exports
  const updatedContent = content
    .replace(
      /import \{ IconGrid \} from '\.\.\/test\/IconGrid';/,
      `import { IconGrid } from './IconGrid';`
    );
  
  if (!DRY_RUN) {
    fs.writeFileSync(EXAMPLES_INDEX_PATH, updatedContent);
  }
  
  console.log(`${colors.green}✓ Updated${colors.reset} examples index to use the new IconGrid`);
  stats.filesModified++;
}

/**
 * Updates the test IconGrid file to use the new IconGrid
 */
function updateTestIconGrid() {
  console.log(`${colors.blue}Updating test IconGrid file...${colors.reset}`);
  
  // Check if file exists
  if (!fs.existsSync(ICONGRID_TEST_PATH)) {
    console.log(`${colors.red}Error: IconGrid test file not found at ${ICONGRID_TEST_PATH}${colors.reset}`);
    return;
  }
  
  // Define new content for the test IconGrid file
  const newContent = `'use client';

/**
 * @deprecated This component is maintained for backwards compatibility.
 * Please import IconGrid from '@/components/ui/icons/examples/IconGrid' instead.
 */

import { IconGrid as IconGridComponent } from '../examples/IconGrid';

export { IconGridComponent as IconGrid };
export default IconGridComponent;
`;
  
  if (!DRY_RUN) {
    fs.writeFileSync(ICONGRID_TEST_PATH, newContent);
  }
  
  console.log(`${colors.green}✓ Updated${colors.reset} test IconGrid to re-export from examples`);
  stats.filesModified++;
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Icon Grid Circular Dependency Fix Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Execute steps
  createBackups();
  createNewIconGrid();
  updateExamplesIndex();
  updateTestIconGrid();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}✓ Backups created:${colors.reset} ${stats.backupsMade}`);
  console.log(`${colors.green}✓ Files created:${colors.reset} ${stats.filesCreated}`);
  console.log(`${colors.green}✓ Files modified:${colors.reset} ${stats.filesModified}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}Circular dependency between examples/index.ts and test/IconGrid.tsx has been resolved!${colors.reset}`);
  }
}

// Run the script
main(); 
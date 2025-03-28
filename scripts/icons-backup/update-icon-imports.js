#!/usr/bin/env node

/**
 * Script to update icon import paths in all TypeScript/React files
 * This helps migrate from the old location structure to the new one
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');

// Mapping of old imports to new ones
const IMPORT_REPLACEMENTS = [
  {
    old: "from '@/lib/icon-helpers'",
    new: "from '@/components/ui/icons'"
  },
  {
    old: "from '@/lib/icon-mappings'",
    new: "from '@/components/ui/icons'"
  },
  {
    old: "from '@/configs/icon-config'",
    new: "from '@/components/ui/icons'"
  },
  {
    old: "{ FA_UI_ICON_MAP }",
    new: "{ UI_ICON_MAP }"
  },
  {
    old: "{ FA_UI_OUTLINE_ICON_MAP }",
    new: "{ UI_OUTLINE_ICON_MAP }"
  },
  {
    old: "{ FA_PLATFORM_ICON_MAP }",
    new: "{ PLATFORM_ICON_MAP }"
  }
];

// Find all TypeScript/TSX files
const findFiles = (dir = SRC_DIR, fileList = []) => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
};

// Update imports in a file
const updateFileImports = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  for (const replacement of IMPORT_REPLACEMENTS) {
    if (content.includes(replacement.old)) {
      content = content.replace(new RegExp(replacement.old, 'g'), replacement.new);
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    console.log(`Updating imports in ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

// Main function
const main = () => {
  console.log('Updating icon imports across the codebase...');
  
  // Find all TypeScript/TSX files
  const files = findFiles();
  console.log(`Found ${files.length} TypeScript/TSX files to process`);
  
  // Process each file
  let updatedCount = 0;
  for (const file of files) {
    try {
      const originalContent = fs.readFileSync(file, 'utf8');
      updateFileImports(file);
      const newContent = fs.readFileSync(file, 'utf8');
      
      if (originalContent !== newContent) {
        updatedCount++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`Updated imports in ${updatedCount} files`);
  console.log('Done! You may need to restart your development server.');
};

// Run the script
main(); 
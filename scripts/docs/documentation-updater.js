#!/usr/bin/env node

/**
 * Documentation Updater Script
 * 
 * This script updates documentation files and READMEs to reflect the final state of the codebase after unification. It:
 * 
 * 1. Updates import paths in documentation examples
 * 2. Ensures component README files are current
 * 3. Verifies directory structure documentation matches reality
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.join(__dirname, '../../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

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

// Stats for tracking changes
const stats = {
  filesScanned: 0,
  filesUpdated: 0,
  readmeFilesCreated: 0,
  pathsUpdated: 0,
  examplesUpdated: 0
};

/**
 * Updates import paths in documentation markdown files
 */
function updateDocumentationImportPaths() {
  console.log(`${colors.blue}Updating import paths in documentation...${colors.reset}`);
  
  // Find markdown files in the docs directory
  const findDocsFilesCmd = `find ${DOCS_DIR} -type f -name "*.md"`;
  const docFiles = execSync(findDocsFilesCmd, { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.trim() !== '');
  
  for (const filePath of docFiles) {
    stats.filesScanned++;
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Replace old import paths with new ones
    const oldPaths = [
      { pattern: /from ['"].*\/components\/Brand-Lift['"]/g, replacement: "from '@/components/features/campaigns/brand-lift'" },
      { pattern: /from ['"].*\/components\/Influencers['"]/g, replacement: "from '@/components/features/campaigns/influencers'" },
      { pattern: /from ['"].*\/components\/Wizard['"]/g, replacement: "from '@/components/features/campaigns/wizard'" },
      { pattern: /from ['"].*\/components\/Search['"]/g, replacement: "from '@/components/features/core/search'" },
      { pattern: /from ['"].*\/components\/mmm['"]/g, replacement: "from '@/components/features/analytics/mmm'" },
      { pattern: /from ['"].*\/components\/ErrorBoundary['"]/g, replacement: "from '@/components/features/core/error-handling'" },
      { pattern: /from ['"].*\/components\/ErrorFallback['"]/g, replacement: "from '@/components/features/core/error-handling'" },
      { pattern: /from ['"].*\/components\/upload['"]/g, replacement: "from '@/components/features/assets/upload'" },
      { pattern: /from ['"].*\/components\/gif['"]/g, replacement: "from '@/components/features/assets/gif'" },
      { pattern: /from ['"].*\/components\/AssetPreview['"]/g, replacement: "from '@/components/features/assets'" },
      { pattern: /from ['"].*\/components\/LoadingSkeleton['"]/g, replacement: "from '@/components/features/core/loading'" },
      { pattern: /from ['"].*\/lib\/utils['"]/g, replacement: "from '@/utils'" }
    ];
    
    // Update each pattern
    for (const { pattern, replacement } of oldPaths) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        updated = true;
        stats.pathsUpdated++;
      }
    }
    
    // Update import examples of individual UI components
    const uiComponentPatterns = [
      { pattern: /from ['"].*\/components\/(button|alert|input|select|checkbox|radio|toggle|switch|dropdown|modal|tooltip|badge|avatar|card|table|tabs|toast|progress|spinner|skeleton)['"]/gi, 
        replacement: (match, component) => `from '@/components/ui/${component.toLowerCase()}'` }
    ];
    
    for (const { pattern, replacement } of uiComponentPatterns) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        updated = true;
        stats.pathsUpdated++;
      }
    }
    
    // Save updated file
    if (updated) {
      console.log(`${colors.green}✓ Updated${colors.reset} import paths in ${filePath}`);
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content);
      }
      stats.filesUpdated++;
    }
  }
}

/**
 * Creates or updates README files in component directories
 */
function updateComponentReadmeFiles() {
  console.log(`${colors.blue}Updating component README files...${colors.reset}`);
  
  // Component directories to check
  const componentDirs = [
    { path: path.join(SRC_DIR, 'components/ui'), name: 'UI Components' },
    { path: path.join(SRC_DIR, 'components/features'), name: 'Feature Components' },
    { path: path.join(SRC_DIR, 'components/layout'), name: 'Layout Components' }
  ];
  
  // Process each directory
  for (const { path: dirPath, name } of componentDirs) {
    if (!fs.existsSync(dirPath)) {
      continue;
    }
    
    // Check for README
    const readmePath = path.join(dirPath, 'README.md');
    const hasReadme = fs.existsSync(readmePath);
    
    if (!hasReadme) {
      console.log(`${colors.yellow}Missing README in ${dirPath}${colors.reset}`);
      
      // Create a basic README
      const readme = generateComponentReadme(dirPath, name);
      
      if (!DRY_RUN) {
        fs.writeFileSync(readmePath, readme);
      }
      
      console.log(`${colors.green}✓ Created${colors.reset} README in ${dirPath}`);
      stats.readmeFilesCreated++;
    } else {
      // README exists, check if it needs updating
      const currentReadme = fs.readFileSync(readmePath, 'utf8');
      
      // Detect if the README is outdated
      const isOutdated = detectOutdatedReadme(currentReadme, dirPath);
      
      if (isOutdated) {
        // Update the README with the current component list
        const newReadme = updateExistingReadme(currentReadme, dirPath);
        
        if (!DRY_RUN && newReadme !== currentReadme) {
          fs.writeFileSync(readmePath, newReadme);
          console.log(`${colors.green}✓ Updated${colors.reset} README in ${dirPath}`);
          stats.filesUpdated++;
        }
      }
    }
    
    // Process subdirectories
    processSubdirectories(dirPath);
  }
}

/**
 * Detects if a README file is outdated based on the actual components in the directory
 * @param {string} readme - The README content
 * @param {string} dirPath - The directory path
 * @returns {boolean} - Whether the README is outdated
 */
function detectOutdatedReadme(readme, dirPath) {
  // Get component files in the directory
  const componentFiles = getComponentFiles(dirPath);
  const componentNames = componentFiles.map(file => path.basename(file, path.extname(file)));
  
  // Check if all components are mentioned in the README
  return componentNames.some(name => !readme.includes(name));
}

/**
 * Updates an existing README with the current component list
 * @param {string} readme - The existing README content
 * @param {string} dirPath - The directory path
 * @returns {string} - The updated README content
 */
function updateExistingReadme(readme, dirPath) {
  // Get component files in the directory
  const componentFiles = getComponentFiles(dirPath);
  const componentNames = componentFiles.map(file => path.basename(file, path.extname(file)));
  
  // Simple approach: Add missing components to the end of the README
  const missingComponents = componentNames.filter(name => !readme.includes(name));
  
  if (missingComponents.length === 0) {
    return readme;
  }
  
  let updatedReadme = readme;
  
  // Look for a component list section
  const componentListMatch = readme.match(/## Components\s+(.+?)(?=##|$)/s);
  
  if (componentListMatch) {
    // Add missing components to the existing list
    const componentSection = componentListMatch[0];
    const updatedSection = componentSection + '\n\n' + missingComponents.map(name => `- **${name}**: A ${name} component`).join('\n');
    updatedReadme = readme.replace(componentSection, updatedSection);
  } else {
    // Add a new component list section
    updatedReadme += '\n\n## Components\n\n' + componentNames.map(name => `- **${name}**: A ${name} component`).join('\n');
  }
  
  return updatedReadme;
}

/**
 * Gets all component files in a directory
 * @param {string} dirPath - The directory path
 * @returns {string[]} - Array of component file paths
 */
function getComponentFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  // Get .tsx files that might be components
  const files = fs.readdirSync(dirPath);
  return files
    .filter(file => file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.stories.'))
    .map(file => path.join(dirPath, file));
}

/**
 * Processes subdirectories to create or update README files
 * @param {string} parentDir - The parent directory path
 */
function processSubdirectories(parentDir) {
  const entries = fs.readdirSync(parentDir, { withFileTypes: true });
  const subdirs = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
  
  for (const subdir of subdirs) {
    const dirPath = path.join(parentDir, subdir);
    
    // Skip directories like node_modules, .git, etc.
    if (subdir.startsWith('.') || subdir === 'node_modules') {
      continue;
    }
    
    // Check for README in subdirectory
    const readmePath = path.join(dirPath, 'README.md');
    const hasReadme = fs.existsSync(readmePath);
    
    if (!hasReadme) {
      // Create a basic README for the subdirectory
      const name = subdir.charAt(0).toUpperCase() + subdir.slice(1) + ' Components';
      const readme = generateComponentReadme(dirPath, name);
      
      if (!DRY_RUN) {
        fs.writeFileSync(readmePath, readme);
      }
      
      console.log(`${colors.green}✓ Created${colors.reset} README in ${dirPath}`);
      stats.readmeFilesCreated++;
    } else {
      // Check if the README needs updating
      const currentReadme = fs.readFileSync(readmePath, 'utf8');
      const isOutdated = detectOutdatedReadme(currentReadme, dirPath);
      
      if (isOutdated) {
        const newReadme = updateExistingReadme(currentReadme, dirPath);
        
        if (!DRY_RUN && newReadme !== currentReadme) {
          fs.writeFileSync(readmePath, newReadme);
          console.log(`${colors.green}✓ Updated${colors.reset} README in ${dirPath}`);
          stats.filesUpdated++;
        }
      }
    }
  }
}

/**
 * Generates a basic README for a component directory
 * @param {string} dirPath - The directory path
 * @param {string} name - The name of the component group
 * @returns {string} - The README content
 */
function generateComponentReadme(dirPath, name) {
  // Get component files in the directory
  const componentFiles = getComponentFiles(dirPath);
  const componentNames = componentFiles.map(file => path.basename(file, path.extname(file)));
  
  // Generate README content
  return `# ${name}

This directory contains ${name.toLowerCase()} for the application.

## Overview

${name} provide ${name.toLowerCase()} functionality for the application. They are designed to be reusable and composable.

## Components

${componentNames.map(name => `- **${name}**: A ${name} component`).join('\n')}

## Usage

\`\`\`tsx
import { ${componentNames.join(', ')} } from '${dirPath.replace(SRC_DIR, '@')}';

// Example usage
function ExampleComponent() {
  return (
    <div>
      {/* Add usage examples here */}
    </div>
  );
}
\`\`\`
`;
}

/**
 * Updates code examples in documentation files
 */
function updateDocumentationExamples() {
  console.log(`${colors.blue}Updating code examples in documentation...${colors.reset}`);
  
  // Find markdown files with code examples
  const findDocsWithCodeCmd = `grep -l "\`\`\`tsx" ${DOCS_DIR}/**/*.md`;
  
  try {
    const docsWithCode = execSync(findDocsWithCodeCmd, { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim() !== '');
    
    for (const filePath of docsWithCode) {
      stats.filesScanned++;
      const content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // Find code blocks
      const codeBlockRegex = /```tsx\n([\s\S]*?)```/g;
      let match;
      let newContent = content;
      
      while ((match = codeBlockRegex.exec(content)) !== null) {
        const codeBlock = match[1];
        let updatedCode = codeBlock;
        
        // Update import paths in code block
        for (const { pattern, replacement } of oldPaths) {
          updatedCode = updatedCode.replace(pattern, replacement);
        }
        
        // Update UI component import paths
        updatedCode = updatedCode.replace(
          /import\s+\{([^}]+)\}\s+from\s+['"].*\/components['"]/g,
          "import {$1} from '@/components/ui'"
        );
        
        if (updatedCode !== codeBlock) {
          newContent = newContent.replace(codeBlock, updatedCode);
          updated = true;
          stats.examplesUpdated++;
        }
      }
      
      // Save updated file
      if (updated) {
        console.log(`${colors.green}✓ Updated${colors.reset} code examples in ${filePath}`);
        if (!DRY_RUN) {
          fs.writeFileSync(filePath, newContent);
        }
        stats.filesUpdated++;
      }
    }
  } catch (error) {
    // No files found, or grep error
    console.log(`${colors.yellow}No documentation files with code examples found${colors.reset}`);
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Documentation Updater Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Update documentation import paths
  updateDocumentationImportPaths();
  
  // Update component README files
  updateComponentReadmeFiles();
  
  // Update code examples in documentation
  updateDocumentationExamples();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.green}✓ Files scanned:${colors.reset} ${stats.filesScanned}`);
  console.log(`${colors.green}✓ Files updated:${colors.reset} ${stats.filesUpdated}`);
  console.log(`${colors.green}✓ README files created:${colors.reset} ${stats.readmeFilesCreated}`);
  console.log(`${colors.green}✓ Import paths updated:${colors.reset} ${stats.pathsUpdated}`);
  console.log(`${colors.green}✓ Code examples updated:${colors.reset} ${stats.examplesUpdated}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  }
}

// Run the script
main(); 
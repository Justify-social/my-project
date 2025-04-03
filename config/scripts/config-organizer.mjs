#!/usr/bin/env node

/**
 * Configuration Files Organizer
 * 
 * This script organizes configuration files in the project root by:
 * 1. Creating a config directory with subdirectories for different types of configs
 * 2. Moving configuration files to their appropriate directories
 * 3. Creating proper redirect files to maintain backward compatibility
 * 
 * Usage:
 *   node scripts/config-organizer.mjs --dry-run  # Preview changes
 *   node scripts/config-organizer.mjs            # Actually make changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Process arguments
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Terminal colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// Helper log functions
const log = (msg) => console.log(msg);
const info = (msg) => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`);
const success = (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`);
const warning = (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`);
const error = (msg) => console.error(`${colors.red}✗ ${colors.reset}${msg}`);
const verbose = (msg) => VERBOSE && console.log(`  ${msg}`);

// Configuration structure
const CONFIG_STRUCTURE = {
  'eslint': 'ESLint configuration',
  'typescript': 'TypeScript configuration',
  'tailwind': 'Tailwind CSS configuration',
  'jest': 'Jest testing configuration',
  'cypress': 'Cypress testing configuration',
  'prettier': 'Prettier code formatting',
  'nextjs': 'Next.js configuration',
  'vercel': 'Vercel deployment configuration',
  'sentry': 'Sentry error tracking',
  'env': 'Environment variables',
  'docs': 'Documentation files'
};

// Files to organize
const FILES_TO_ORGANIZE = [
  // ESLint
  { 
    source: '.eslintrc.js', 
    target: 'config/eslint/eslintrc.js',
    createRedirect: true,
    redirectContent: `// This file is now located at config/eslint/eslintrc.js
// This is a redirect file for backward compatibility
module.exports = require('./config/eslint/eslintrc.js');`
  },
  { 
    source: '.eslintrc.json', 
    target: 'config/eslint/eslintrc.json',
    createRedirect: true,
    redirectContent: `// This file is now located at config/eslint/eslintrc.json
// This is a redirect file for backward compatibility
module.exports = require('./config/eslint/eslintrc.json');`
  },
  { 
    source: 'eslint.config.mjs', 
    target: 'config/eslint/eslint.config.mjs',
    createRedirect: true,
    redirectContent: `// This file is now located at config/eslint/eslint.config.mjs
// This is a redirect file for backward compatibility
import config from './config/eslint/eslint.config.mjs';
export default config;`
  },
  { 
    source: '.eslintignore', 
    target: 'config/eslint/.eslintignore',
    createRedirect: false
  },
  
  // TypeScript
  { 
    source: 'tsconfig.json', 
    target: 'config/typescript/tsconfig.json',
    createRedirect: true,
    redirectContent: `// This file is now located at config/typescript/tsconfig.json
// This is a redirect file for backward compatibility
{
  "extends": "./config/typescript/tsconfig.json"
}`
  },
  // jsconfig.json is deprecated in favor of tsconfig.json for TypeScript projects
  { 
    source: 'jsconfig.json', 
    target: 'config/typescript/jsconfig.json',
    createRedirect: false,
    deprecateFile: true
  },
  { 
    source: 'tsconfig.tsbuildinfo', 
    target: 'config/typescript/tsconfig.tsbuildinfo',
    createRedirect: false
  },
  
  // Tailwind
  { 
    source: 'tailwind.config.js', 
    target: 'config/tailwind/tailwind.config.js',
    createRedirect: true,
    redirectContent: `// This file is a redirect to the configuration in config/tailwind/
// For backward compatibility
import tailwindConfig from './config/tailwind/tailwind.config.js';

export default tailwindConfig;`
  },
  { 
    source: 'tailwind.config.ts', 
    target: 'config/tailwind/tailwind.config.ts',
    createRedirect: true,
    redirectContent: `// This file is a redirect to the configuration in config/tailwind/
// For backward compatibility
import config from './config/tailwind/tailwind.config';
export default config;`
  },
  { 
    source: 'postcss.config.mjs', 
    target: 'config/tailwind/postcss.config.mjs',
    createRedirect: true,
    redirectContent: `// This file is now located at config/tailwind/postcss.config.mjs
// This is a redirect file for backward compatibility
import config from './config/tailwind/postcss.config.mjs';
export default config;`
  },
  
  // Jest
  { 
    source: 'jest.config.js', 
    target: 'config/jest/jest.config.js',
    createRedirect: true,
    redirectContent: `// This file is now located at config/jest/jest.config.js
// This is a redirect file for backward compatibility
module.exports = require('./config/jest/jest.config.js');`
  },
  { 
    source: 'jest.setup.js', 
    target: 'config/jest/jest.setup.js',
    createRedirect: true,
    redirectContent: `// This file is now located at config/jest/jest.setup.js
// This is a redirect file for backward compatibility
module.exports = require('./config/jest/jest.setup.js');`
  },
  
  // Cypress
  { 
    source: 'cypress.config.js', 
    target: 'config/cypress/cypress.config.js',
    createRedirect: true,
    redirectContent: `// This file is now located at config/cypress/cypress.config.js
// This is a redirect file for backward compatibility
module.exports = require('./config/cypress/cypress.config.js');`
  },
  
  // Prettier
  { 
    source: '.prettierrc.json', 
    target: 'config/prettier/.prettierrc.json',
    createRedirect: true,
    redirectContent: `{
  "extends": "./config/prettier/.prettierrc.json"
}`
  },
  
  // Next.js
  { 
    source: 'next.config.js', 
    target: 'config/nextjs/next.config.js',
    createRedirect: true,
    redirectContent: `// This file is now located at config/nextjs/next.config.js
// This is a redirect file for backward compatibility
module.exports = require('./config/nextjs/next.config.js');`
  },
  { 
    source: 'next-env.d.ts', 
    target: 'config/nextjs/next-env.d.ts',
    createRedirect: true,
    redirectContent: `// This file is now located at config/nextjs/next-env.d.ts
// This is a redirect file for backward compatibility
/// <reference path="./config/nextjs/next-env.d.ts" />`
  },
  
  // Vercel
  { 
    source: 'vercel.json', 
    target: 'config/vercel/vercel.json',
    createRedirect: true,
    redirectContent: `{
  "extends": "./config/vercel/vercel.json"
}`
  },
  
  // Sentry
  { 
    source: 'sentry.config.ts', 
    target: 'config/sentry/sentry.config.ts',
    createRedirect: true,
    redirectContent: `// This file is now located at config/sentry/sentry.config.ts
// This is a redirect file for backward compatibility
export * from './config/sentry/sentry.config';`
  },
  { 
    source: 'sentry.edge.config.ts', 
    target: 'config/sentry/sentry.edge.config.ts',
    createRedirect: true,
    redirectContent: `// This file is now located at config/sentry/sentry.edge.config.ts
// This is a redirect file for backward compatibility
export * from './config/sentry/sentry.edge.config';`
  },
  { 
    source: 'sentry.server.config.ts', 
    target: 'config/sentry/sentry.server.config.ts',
    createRedirect: true,
    redirectContent: `// This file is now located at config/sentry/sentry.server.config.ts
// This is a redirect file for backward compatibility
export * from './config/sentry/sentry.server.config';`
  },
  
  // Environment
  { 
    source: '.env', 
    target: 'config/env/.env',
    createRedirect: false,
    createSymlink: true
  },
  { 
    source: '.env.local', 
    target: 'config/env/.env.local',
    createRedirect: false,
    createSymlink: true
  },
  
  // Documentation files
  { 
    source: 'error-fix.md', 
    target: 'docs/troubleshooting/error-fix.md',
    createRedirect: false
  },
  { 
    source: 'icon-fix.md', 
    target: 'docs/troubleshooting/icon-fix.md',
    createRedirect: false
  },
  
  // Data files
  { 
    source: 'components.json', 
    target: 'config/ui/components.json',
    createRedirect: true,
    redirectContent: `{
  "extends": "./config/ui/components.json"
}`
  },
  { 
    source: 'feature-components.json', 
    target: 'config/ui/feature-components.json',
    createRedirect: false
  },
  { 
    source: 'icon-registry-small.json', 
    target: 'config/ui/icon-registry-small.json',
    createRedirect: false
  },
  
  // Cache files to delete
  { 
    source: '.component-registry-cache.json', 
    target: '.cache/component-registry-cache.json',
    createRedirect: false,
    moveToCache: true
  },
  { 
    source: 'ui-component-validation-report.json', 
    target: '.cache/ui-component-validation-report.json',
    createRedirect: false,
    moveToCache: true
  }
];

// Track metrics
let filesMoved = 0;
let redirectsCreated = 0;
let symlinkCreated = 0;
let dirsCreated = 0;
let errors = 0;

// Create directory structure
function createDirectoryStructure() {
  // Create main config directory
  const configDir = path.join(ROOT_DIR, 'config');
  if (!fs.existsSync(configDir)) {
    if (!DRY_RUN) {
      try {
        fs.mkdirSync(configDir, { recursive: true });
        dirsCreated++;
      } catch (err) {
        error(`Failed to create config directory: ${err.message}`);
        errors++;
      }
    } else {
      warning('[DRY RUN] Would create directory: config/');
    }
  }
  
  // Create cache directory
  const cacheDir = path.join(ROOT_DIR, '.cache');
  if (!fs.existsSync(cacheDir)) {
    if (!DRY_RUN) {
      try {
        fs.mkdirSync(cacheDir, { recursive: true });
        dirsCreated++;
      } catch (err) {
        error(`Failed to create .cache directory: ${err.message}`);
        errors++;
      }
    } else {
      warning('[DRY RUN] Would create directory: .cache/');
    }
  }
  
  // Create docs directory
  const docsDir = path.join(ROOT_DIR, 'docs');
  if (!fs.existsSync(docsDir)) {
    if (!DRY_RUN) {
      try {
        fs.mkdirSync(docsDir, { recursive: true });
        dirsCreated++;
      } catch (err) {
        error(`Failed to create docs directory: ${err.message}`);
        errors++;
      }
    } else {
      warning('[DRY RUN] Would create directory: docs/');
    }
  }
  
  // Create docs subdirectories
  const troubleshootingDir = path.join(ROOT_DIR, 'docs/troubleshooting');
  if (!fs.existsSync(troubleshootingDir)) {
    if (!DRY_RUN) {
      try {
        fs.mkdirSync(troubleshootingDir, { recursive: true });
        dirsCreated++;
      } catch (err) {
        error(`Failed to create docs/troubleshooting directory: ${err.message}`);
        errors++;
      }
    } else {
      warning('[DRY RUN] Would create directory: docs/troubleshooting/');
    }
  }

  // Create subdirectories for each config type
  for (const [dir, description] of Object.entries(CONFIG_STRUCTURE)) {
    const fullPath = path.join(ROOT_DIR, `config/${dir}`);
    
    if (!fs.existsSync(fullPath)) {
      if (!DRY_RUN) {
        try {
          fs.mkdirSync(fullPath, { recursive: true });
          
          // Add README to describe the directory
          const readmePath = path.join(fullPath, 'README.md');
          fs.writeFileSync(readmePath, `# ${dir.charAt(0).toUpperCase() + dir.slice(1)} Configuration\n\n${description}\n`);
          
          success(`Created directory: config/${dir}/`);
          dirsCreated++;
        } catch (err) {
          error(`Failed to create directory config/${dir}: ${err.message}`);
          errors++;
        }
      } else {
        warning(`[DRY RUN] Would create directory: config/${dir}/ (${description})`);
      }
    }
  }
}

// Move a file to its new location
function moveFile(fileConfig) {
  const { source, target, createRedirect, redirectContent, createSymlink, moveToCache, deprecateFile } = fileConfig;
  
  const sourcePath = path.join(ROOT_DIR, source);
  const targetPath = path.join(ROOT_DIR, target);
  
  // Skip if source doesn't exist
  if (!fs.existsSync(sourcePath)) {
    verbose(`Source file not found: ${source}`);
    return false;
  }
  
  // Create target directory if it doesn't exist
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    if (!DRY_RUN) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
        dirsCreated++;
      } catch (err) {
        error(`Failed to create directory ${targetDir}: ${err.message}`);
        errors++;
        return false;
      }
    }
  }
  
  // Skip if it's a deprecated file
  if (deprecateFile) {
    if (DRY_RUN) {
      warning(`[DRY RUN] Would remove deprecated file: ${source}`);
      return true;
    }
    
    try {
      fs.unlinkSync(sourcePath);
      success(`Removed deprecated file: ${source}`);
      return true;
    } catch (err) {
      error(`Failed to remove deprecated file ${source}: ${err.message}`);
      errors++;
      return false;
    }
  }
  
  // Special handling for cache files
  if (moveToCache) {
    if (DRY_RUN) {
      warning(`[DRY RUN] Would move cache file: ${source} to ${target}`);
      filesMoved++;
      return true;
    }
    
    try {
      // Create target directory if needed
      if (!fs.existsSync(path.dirname(targetPath))) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      }
      
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      
      // Remove original
      fs.unlinkSync(sourcePath);
      
      success(`Moved cache file: ${source} to ${target}`);
      filesMoved++;
      
      // Add to .gitignore
      const gitignorePath = path.join(ROOT_DIR, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        let gitignore = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignore.includes('.cache/')) {
          gitignore += '\n# Cache files\n.cache/\n';
          fs.writeFileSync(gitignorePath, gitignore);
          success('Added .cache/ to .gitignore');
        }
      }
      
      return true;
    } catch (err) {
      error(`Failed to move cache file ${source}: ${err.message}`);
      errors++;
      return false;
    }
  }
  
  // Handle symlinks for env files
  if (createSymlink) {
    if (DRY_RUN) {
      warning(`[DRY RUN] Would create symlink: ${target} <- ${source}`);
      symlinkCreated++;
      return true;
    }
    
    try {
      // Create target directory if needed
      if (!fs.existsSync(path.dirname(targetPath))) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      }
      
      // Copy file content to target
      fs.copyFileSync(sourcePath, targetPath);
      
      // Create symlink (original location symlinks to the new location)
      if (fs.existsSync(sourcePath)) {
        fs.unlinkSync(sourcePath);
      }
      fs.symlinkSync(targetPath, sourcePath);
      
      success(`Created symlink: ${target} <- ${source}`);
      symlinkCreated++;
      return true;
    } catch (err) {
      error(`Failed to create symlink ${source}: ${err.message}`);
      errors++;
      return false;
    }
  }
  
  // Regular file move
  if (DRY_RUN) {
    warning(`[DRY RUN] Would move: ${source} to ${target}`);
    filesMoved++;
    
    if (createRedirect) {
      warning(`[DRY RUN] Would create redirect: ${source}`);
      redirectsCreated++;
    }
    
    return true;
  }
  
  try {
    // Create target directory if needed
    if (!fs.existsSync(path.dirname(targetPath))) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    }
    
    // Copy the file to new location
    fs.copyFileSync(sourcePath, targetPath);
    
    // Create redirect file or remove original
    if (createRedirect && redirectContent) {
      fs.writeFileSync(sourcePath, redirectContent);
      success(`Created redirect: ${source} -> ${target}`);
      redirectsCreated++;
    } else {
      fs.unlinkSync(sourcePath);
    }
    
    success(`Moved: ${source} to ${target}`);
    filesMoved++;
    return true;
  } catch (err) {
    error(`Failed to move ${source}: ${err.message}`);
    errors++;
    return false;
  }
}

// Update all imports in JavaScript files to reflect new paths
function updateImports() {
  if (DRY_RUN) {
    warning(`[DRY RUN] Would update imports in source files`);
    return;
  }
  
  // Not implemented yet - would need to scan all source files and update imports
  // This is a complex task and would require parsing JS/TS files
  
  info(`Import updating is not implemented yet`);
}

// Create a PROJECT_STRUCTURE.md file
function createProjectStructureDocs() {
  const docPath = path.join(ROOT_DIR, 'docs/PROJECT_STRUCTURE.md');
  
  if (DRY_RUN) {
    warning(`[DRY RUN] Would create project structure documentation: docs/PROJECT_STRUCTURE.md`);
    return;
  }
  
  const docContent = `# Project Structure

This document describes the overall structure of the project, focusing on the organization of configuration files.

## Directory Structure

\`\`\`
/
├── config/                 # Configuration files
│   ├── eslint/             # ESLint configuration
│   ├── typescript/         # TypeScript configuration
│   ├── tailwind/           # Tailwind CSS configuration
│   ├── jest/               # Jest testing configuration
│   ├── cypress/            # Cypress testing configuration
│   ├── prettier/           # Prettier code formatting
│   ├── nextjs/             # Next.js configuration
│   ├── vercel/             # Vercel deployment configuration
│   ├── sentry/             # Sentry error tracking
│   ├── env/                # Environment variables
│   └── ui/                 # UI component configuration
├── docs/                   # Documentation
│   ├── troubleshooting/    # Troubleshooting guides
│   └── PROJECT_STRUCTURE.md # This file
├── .cache/                 # Cache files (gitignored)
├── scripts/                # Utility scripts
│   ├── icons/              # Icon management scripts
│   ├── ui/                 # UI component scripts
│   └── ...                 # Other script categories
├── src/                    # Application source code
└── public/                 # Static assets
\`\`\`

## Configuration Files

Most configuration files have been moved from the project root to the \`config/\` directory and organized by tool or framework. For backward compatibility, redirect files are kept in the project root.

### ESLint Configuration
- Original: \`.eslintrc.js\`, \`.eslintrc.json\`, \`eslint.config.mjs\`
- New location: \`config/eslint/\`

### TypeScript Configuration
- Original: \`tsconfig.json\`, \`jsconfig.json\`
- New location: \`config/typescript/\`

### Tailwind CSS Configuration
- Original: \`tailwind.config.js\`, \`postcss.config.mjs\`
- New location: \`config/tailwind/\`

### Testing Configuration
- Original: \`jest.config.js\`, \`jest.setup.js\`, \`cypress.config.js\`
- New location: \`config/jest/\` and \`config/cypress/\`

### Next.js Configuration
- Original: \`next.config.js\`, \`next-env.d.ts\`
- New location: \`config/nextjs/\`

### Sentry Configuration
- Original: \`sentry.config.ts\`, \`sentry.edge.config.ts\`, \`sentry.server.config.ts\`
- New location: \`config/sentry/\`

### Environment Variables
- Original: \`.env\`, \`.env.local\`
- New location: \`config/env/\` (symlinked from root)

### UI Component Configuration
- Original: \`components.json\`, \`feature-components.json\`
- New location: \`config/ui/\`

## Cache Files

Cache files and temporary data are stored in the \`.cache/\` directory, which is added to \`.gitignore\`:

- \`.component-registry-cache.json\` → \`.cache/component-registry-cache.json\`
- \`ui-component-validation-report.json\` → \`.cache/ui-component-validation-report.json\`

## Documentation

Documentation files are organized in the \`docs/\` directory:

- \`error-fix.md\` → \`docs/troubleshooting/error-fix.md\`
- \`icon-fix.md\` → \`docs/troubleshooting/icon-fix.md\`
`;

  try {
    // Create docs directory if needed
    const docsDir = path.dirname(docPath);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(docPath, docContent);
    success(`Created project structure documentation: docs/PROJECT_STRUCTURE.md`);
  } catch (err) {
    error(`Failed to create project structure documentation: ${err.message}`);
    errors++;
  }
}

// Update README.md to include the new structure
function updateReadme() {
  const readmePath = path.join(ROOT_DIR, 'README.md');
  
  if (!fs.existsSync(readmePath)) {
    warning(`README.md not found, skipping update`);
    return;
  }
  
  if (DRY_RUN) {
    warning(`[DRY RUN] Would update README.md with project structure information`);
    return;
  }
  
  try {
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    const structureSection = `
## Project Structure

This project has been organized with a clean directory structure:

- \`config/\` - Configuration files organized by tool/framework
- \`docs/\` - Project documentation
- \`scripts/\` - Utility scripts organized by function
- \`src/\` - Application source code
- \`public/\` - Static assets

See \`docs/PROJECT_STRUCTURE.md\` for more details on the project organization.
`;
    
    // Check if the section already exists
    if (!readme.includes('## Project Structure')) {
      readme += structureSection;
      fs.writeFileSync(readmePath, readme);
      success(`Updated README.md with project structure information`);
    } else {
      verbose(`README.md already contains project structure section`);
    }
  } catch (err) {
    error(`Failed to update README.md: ${err.message}`);
    errors++;
  }
}

// Main function
async function main() {
  console.log(`\n${colors.bold}${colors.cyan}Configuration Files Organizer${colors.reset}`);
  console.log(`${colors.cyan}=============================${colors.reset}\n`);
  
  if (DRY_RUN) {
    warning('Running in DRY RUN mode - no changes will be made');
  }
  
  // Create directory structure
  info('Creating directory structure...');
  createDirectoryStructure();
  
  // Move configuration files
  console.log(`\n${colors.bold}Moving configuration files...${colors.reset}`);
  for (const fileConfig of FILES_TO_ORGANIZE) {
    moveFile(fileConfig);
  }
  
  // Update imports if needed
  console.log(`\n${colors.bold}Updating imports...${colors.reset}`);
  updateImports();
  
  // Create project structure documentation
  console.log(`\n${colors.bold}Creating documentation...${colors.reset}`);
  createProjectStructureDocs();
  updateReadme();
  
  // Results
  console.log(`\n${colors.bold}${colors.green}Organization Results:${colors.reset}`);
  if (DRY_RUN) {
    console.log(`- Would move: ${filesMoved} files`);
    console.log(`- Would create: ${redirectsCreated} redirects`);
    console.log(`- Would create: ${symlinkCreated} symlinks`);
    console.log(`- Would create: ${dirsCreated} directories`);
  } else {
    console.log(`- Moved: ${filesMoved} files`);
    console.log(`- Created: ${redirectsCreated} redirects`);
    console.log(`- Created: ${symlinkCreated} symlinks`);
    console.log(`- Created: ${dirsCreated} directories`);
  }
  
  if (errors > 0) {
    console.log(`- Errors: ${errors}`);
  }
  
  if (DRY_RUN) {
    console.log(`\n${colors.bold}To actually perform these operations, run the script without --dry-run${colors.reset}`);
  } else {
    console.log(`\n${colors.bold}${colors.green}Project structure has been successfully organized!${colors.reset}`);
    console.log(`See docs/PROJECT_STRUCTURE.md for details on the new organization.`);
  }
}

// Run the main function
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 
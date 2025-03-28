#!/usr/bin/env node

/**
 * Legacy Directory Handler Script
 * 
 * This script creates re-export files in legacy component directories that point
 * to their new locations. This allows for a smooth transition while preserving
 * backward compatibility.
 * 
 * The script:
 * 1. Creates index.ts files in legacy directories that re-export from new locations
 * 2. Adds deprecation warnings in the re-export files
 * 3. Documents the legacy directories for future cleanup
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.join(__dirname, '../../../');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const LEGACY_DOCS_PATH = path.join(DOCS_DIR, 'legacy-directories.md');

// Legacy directory mappings
const LEGACY_DIRECTORIES = [
  {
    source: path.join(COMPONENTS_DIR, 'Brand-Lift'),
    target: '@/components/features/campaigns/brand-lift',
    description: 'Brand lift components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'Influencers'),
    target: '@/components/features/campaigns/influencers',
    description: 'Influencer management components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'Wizard'),
    target: '@/components/features/campaigns/wizard',
    description: 'Campaign wizard components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'Search'),
    target: '@/components/features/core/search',
    description: 'Search components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'mmm'),
    target: '@/components/features/analytics/mmm',
    description: 'Marketing mix modeling components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'ErrorBoundary'),
    target: '@/components/features/core/error-handling',
    description: 'Error boundary components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'ErrorFallback'),
    target: '@/components/ui/error-fallback',
    description: 'Error fallback components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'upload'),
    target: '@/components/features/assets/upload',
    description: 'Upload components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'gif'),
    target: '@/components/features/assets/gif',
    description: 'GIF handling components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'AssetPreview'),
    target: '@/components/features/assets',
    description: 'Asset preview components'
  },
  {
    source: path.join(COMPONENTS_DIR, 'LoadingSkeleton'),
    target: '@/components/features/core/loading',
    description: 'Loading skeleton components'
  }
];

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
  directoriesProcessed: 0,
  reExportsCreated: 0,
  docsUpdated: 0
};

/**
 * Creates a re-export file in a legacy directory
 * @param {object} directory - Legacy directory object
 */
function createReExportFile(directory) {
  // Check if directory exists
  if (!fs.existsSync(directory.source)) {
    console.log(`${colors.yellow}⚠ Directory not found: ${directory.source}${colors.reset}`);
    return;
  }
  
  const indexPath = path.join(directory.source, 'index.ts');
  const relativePath = path.relative(ROOT_DIR, directory.source);
  
  // Check if the index.ts already exists
  if (fs.existsSync(indexPath)) {
    console.log(`${colors.yellow}⚠ Index file already exists: ${indexPath}${colors.reset}`);
    return;
  }
  
  // Create the re-export content
  const content = `/**
 * @deprecated This directory is deprecated and will be removed in a future release.
 * Please update imports to use ${directory.target} instead.
 * 
 * This is a re-export file for backward compatibility.
 */

// Re-export everything from the new location
export * from '${directory.target}';

// Also re-export the default export if any
import DefaultExport from '${directory.target}';
export default DefaultExport;
`;
  
  // Write the re-export file
  if (!DRY_RUN) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(directory.source)) {
      fs.mkdirSync(directory.source, { recursive: true });
    }
    
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`${colors.green}✓ Created re-export file: ${relativePath}/index.ts${colors.reset}`);
    stats.reExportsCreated++;
  } else {
    console.log(`${colors.blue}Would create re-export file: ${relativePath}/index.ts${colors.reset}`);
  }
  
  stats.directoriesProcessed++;
}

/**
 * Creates or updates the legacy directories documentation
 */
function updateLegacyDirectoriesDocs() {
  console.log(`${colors.blue}Updating legacy directories documentation...${colors.reset}`);
  
  // Create docs directory if it doesn't exist
  if (!DRY_RUN && !fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  
  // Generate documentation content
  const content = `# Legacy Component Directories

This document lists legacy component directories that are maintained for backward compatibility.
These directories contain re-export files that point to the new component locations.

## Directories

| Legacy Directory | New Location | Description |
|------------------|--------------|-------------|
${LEGACY_DIRECTORIES.map(dir => {
  const relPath = path.relative(ROOT_DIR, dir.source);
  return `| \`${relPath}\` | \`${dir.target}\` | ${dir.description} |`;
}).join('\n')}

## Migration Plan

These directories are scheduled for removal once all import paths have been updated.
The tentative timeline for removal is:

1. **Phase 1 (Current)**: Re-export files added for backward compatibility
2. **Phase 2 (Future)**: Deprecation warnings added to console logs
3. **Phase 3 (Future)**: Removal of legacy directories

## How to Update Imports

To prepare for the removal of these legacy directories, update your imports to use the new locations:

\`\`\`typescript
// Before
import { SomeComponent } from '@/components/legacy-directory';

// After
import { SomeComponent } from '@/components/features/domain/subdomain';
\`\`\`

## Automated Migration

You can use the import path updater script to automatically update imports in your codebase:

\`\`\`bash
node scripts/directory-structure/phase7/import-path-updater.js
\`\`\`

This script will scan your codebase and update imports to use the new locations.
`;
  
  // Write the documentation file
  if (!DRY_RUN) {
    fs.writeFileSync(LEGACY_DOCS_PATH, content, 'utf8');
    console.log(`${colors.green}✓ Updated legacy directories documentation: ${LEGACY_DOCS_PATH}${colors.reset}`);
    stats.docsUpdated++;
  } else {
    console.log(`${colors.blue}Would update legacy directories documentation: ${LEGACY_DOCS_PATH}${colors.reset}`);
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Legacy Directory Handler Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Process each legacy directory
  console.log(`${colors.blue}Processing legacy directories...${colors.reset}`);
  
  for (const directory of LEGACY_DIRECTORIES) {
    createReExportFile(directory);
  }
  
  // Update documentation
  updateLegacyDirectoriesDocs();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.blue}Directories processed:${colors.reset} ${stats.directoriesProcessed}`);
  console.log(`${colors.blue}Re-export files created:${colors.reset} ${stats.reExportsCreated}`);
  console.log(`${colors.blue}Documentation files updated:${colors.reset} ${stats.docsUpdated}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}Legacy directory handling completed successfully!${colors.reset}`);
  }
}

// Run the script
main(); 
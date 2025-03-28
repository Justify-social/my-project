#!/usr/bin/env node

/**
 * Standalone Components Migration Script
 * 
 * This script migrates standalone components from /src/components/ root to 
 * their appropriate feature directories based on component analysis.
 * 
 * Usage:
 * Run in dry mode: node scripts/directory-structure/component-migration/standalone/migrate-standalone-components.js
 * Run with applying changes: node scripts/directory-structure/component-migration/standalone/migrate-standalone-components.js --apply
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const rootDir = process.cwd();
const dryRun = !process.argv.includes('--apply');
const verbose = process.argv.includes('--verbose');

// Source directory
const sourceDir = path.join(rootDir, 'src/components');

// Component mapping - maps each component to its target directory
const componentMapping = [
  {
    sourceFile: 'ErrorBoundary.tsx',
    targetDir: 'src/components/features/core/error-handling',
    description: 'Core error handling component'
  },
  {
    sourceFile: 'InfluencerCard.tsx',
    targetDir: 'src/components/features/campaigns/influencers',
    description: 'Influencer display card component used in campaigns'
  },
  {
    sourceFile: 'LayoutContent.tsx',
    targetDir: 'src/components/layout',
    description: 'Layout content wrapper component'
  },
  {
    sourceFile: 'OnboardingModal.tsx',
    targetDir: 'src/components/features/users/onboarding',
    description: 'User onboarding modal component'
  },
  {
    sourceFile: 'SearchParamsWrapper.tsx',
    targetDir: 'src/components/features/core/search',
    description: 'Search parameters wrapper component'
  },
  {
    sourceFile: 'SaveIconTest.tsx',
    targetDir: 'src/components/features/core/tests',
    description: 'Icon testing component'
  },
  {
    sourceFile: 'CalendarUpcoming.tsx',
    targetDir: 'src/components/features/dashboard/widgets',
    description: 'Upcoming calendar widget component'
  }
];

// Function to log messages with condition
function log(message, alwaysShow = false) {
  if (verbose || alwaysShow) {
    console.log(message);
  }
}

// Ensure the target directory exists
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    log(`Creating directory: ${dir}`, true);
    if (!dryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Migrate a single component
function migrateComponent(mapping) {
  const sourcePath = path.join(sourceDir, mapping.sourceFile);
  const targetDir = path.join(rootDir, mapping.targetDir);
  const targetPath = path.join(targetDir, mapping.sourceFile);
  
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    log(`Source file does not exist: ${sourcePath}`, true);
    return false;
  }

  // Ensure target directory exists
  ensureDirectoryExists(targetDir);

  // Read the component file
  let content;
  try {
    content = fs.readFileSync(sourcePath, 'utf8');
  } catch (error) {
    log(`Error reading file ${sourcePath}: ${error.message}`, true);
    return false;
  }

  // Create the target file
  if (!dryRun) {
    try {
      fs.writeFileSync(targetPath, content);
      log(`Created ${targetPath}`, true);
    } catch (error) {
      log(`Error creating file ${targetPath}: ${error.message}`, true);
      return false;
    }
  } else {
    log(`Would create ${targetPath}`, true);
  }

  return true;
}

// Create an index.ts file in each target directory
function createIndexFiles() {
  // Group components by target directory
  const dirGroups = {};
  
  componentMapping.forEach(mapping => {
    if (!dirGroups[mapping.targetDir]) {
      dirGroups[mapping.targetDir] = [];
    }
    dirGroups[mapping.targetDir].push({
      file: mapping.sourceFile,
      description: mapping.description
    });
  });

  // Create index files for each directory
  Object.keys(dirGroups).forEach(dir => {
    const components = dirGroups[dir];
    const dirName = path.basename(dir);
    
    const indexContent = `/**
 * ${dirName.charAt(0).toUpperCase() + dirName.slice(1)} Components
 * 
 * This directory contains ${dirName.toLowerCase()} related components.
 */

// Export components
${components.map(comp => {
  const name = path.basename(comp.file, path.extname(comp.file));
  return `export * from './${name}'; // ${comp.description}`;
}).join('\n')}
`;

    const indexPath = path.join(rootDir, dir, 'index.ts');
    
    if (!dryRun) {
      ensureDirectoryExists(path.join(rootDir, dir));
      try {
        fs.writeFileSync(indexPath, indexContent);
        log(`Created index file at ${indexPath}`, true);
      } catch (error) {
        log(`Error creating index file: ${error.message}`, true);
      }
    } else {
      log(`Would create index file at ${indexPath} with content:`, verbose);
      if (verbose) {
        log(indexContent);
      }
    }
  });
}

// Update imports throughout the codebase for a specific component
function updateImportsForComponent(component) {
  const sourceFile = component.sourceFile;
  const componentName = path.basename(sourceFile, path.extname(sourceFile));
  const targetPath = component.targetDir.replace(rootDir + '/', '');
  
  // Find files that import this component
  const command = `find ${rootDir} -type f -name "*.ts*" | grep -v "node_modules" | xargs grep -l "/${componentName}" || true`;
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    const filesToUpdate = result.trim().split('\n').filter(Boolean);
    
    log(`Found ${filesToUpdate.length} files that might import ${componentName}`, true);
    
    for (const file of filesToUpdate) {
      let content;
      try {
        content = fs.readFileSync(file, 'utf8');
      } catch (error) {
        log(`Error reading file ${file}: ${error.message}`);
        continue;
      }
      
      // Create a pattern for this specific component
      const pattern = new RegExp(`(import\\s+.*?\\s+from\\s+['"])(.+?/${componentName})(['"])`, 'g');
      
      // Replace import paths
      const updatedContent = content.replace(pattern, (match, prefix, importPath, suffix) => {
        // Only replace if it's a direct import from src/components
        if (importPath.includes('/components/') && !importPath.includes(targetPath)) {
          return `${prefix}@/${targetPath}/${componentName}${suffix}`;
        }
        return match; // No change
      });
      
      if (content !== updatedContent) {
        if (!dryRun) {
          try {
            fs.writeFileSync(file, updatedContent);
            log(`Updated imports in ${file}`);
          } catch (error) {
            log(`Error updating file ${file}: ${error.message}`, true);
          }
        } else {
          log(`Would update imports in ${file}`);
        }
      }
    }
  } catch (error) {
    log(`Error finding files to update for ${componentName}: ${error.message}`, true);
  }
}

// Update all imports
function updateImports() {
  componentMapping.forEach(component => {
    updateImportsForComponent(component);
  });
}

// Main function
function main() {
  log(`Starting standalone components migration${dryRun ? ' (DRY RUN)' : ''}`, true);
  
  // Track migration results
  let migratedCount = 0;
  
  // Migrate each component
  for (const component of componentMapping) {
    log(`Migrating ${component.sourceFile} to ${component.targetDir}...`, true);
    if (migrateComponent(component)) {
      migratedCount++;
    }
  }
  
  // Create index files
  createIndexFiles();
  
  // Update imports throughout the codebase
  updateImports();
  
  log(`Standalone component migration ${dryRun ? 'would complete' : 'completed'} with ${migratedCount}/${componentMapping.length} components migrated`, true);
  
  if (dryRun) {
    log('Run with --apply to apply the changes', true);
  }
}

// Run the script
main(); 
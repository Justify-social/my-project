#!/usr/bin/env node

/**
 * Legacy Feature Components Migration Script
 * 
 * This script migrates legacy feature components from their old directories to 
 * the new modular structure under src/components/features/
 * 
 * Usage:
 * Run in dry mode: node scripts/directory-structure/component-migration/standalone/migrate-legacy-feature-components.js
 * Run with applying changes: node scripts/directory-structure/component-migration/standalone/migrate-legacy-feature-components.js --apply
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const rootDir = process.cwd();
const dryRun = !process.argv.includes('--apply');
const verbose = process.argv.includes('--verbose');

// Feature directories mapping
const featureDirectories = [
  {
    sourceDir: 'src/components/brand-lift',
    targetDir: 'src/components/features/campaigns/brand-lift',
    description: 'Brand lift measurement components'
  },
  {
    sourceDir: 'src/components/Influencers',
    targetDir: 'src/components/features/campaigns/influencers',
    description: 'Influencer management components'
  },
  {
    sourceDir: 'src/components/campaign',
    targetDir: 'src/components/features/campaigns/management',
    description: 'Campaign management components'
  },
  {
    sourceDir: 'src/components/Wizard',
    targetDir: 'src/components/features/campaigns/wizard',
    description: 'Campaign wizard components'
  },
  {
    sourceDir: 'src/components/Search',
    targetDir: 'src/components/features/core/search',
    description: 'Search functionality components'
  },
  {
    sourceDir: 'src/components/mmm',
    targetDir: 'src/components/features/analytics/mmm',
    description: 'Marketing mix modeling components'
  },
  {
    sourceDir: 'src/components/ReviewSections',
    targetDir: 'src/components/features/campaigns/review',
    description: 'Campaign review components'
  },
  {
    sourceDir: 'src/components/ErrorBoundary',
    targetDir: 'src/components/features/core/error-handling',
    description: 'Error boundary components'
  },
  {
    sourceDir: 'src/components/ErrorFallback',
    targetDir: 'src/components/features/core/error-handling',
    description: 'Error fallback components'
  },
  {
    sourceDir: 'src/components/AssetPreview',
    targetDir: 'src/components/features/assets',
    description: 'Asset preview components'
  },
  {
    sourceDir: 'src/components/gif',
    targetDir: 'src/components/features/assets/gif',
    description: 'GIF related components'
  },
  {
    sourceDir: 'src/components/upload',
    targetDir: 'src/components/features/assets/upload',
    description: 'Asset upload components'
  },
  {
    sourceDir: 'src/components/LoadingSkeleton',
    targetDir: 'src/components/features/core/loading',
    description: 'Loading skeleton components'
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

// Get all files in a directory (recursive)
function getAllFiles(dir) {
  if (!fs.existsSync(dir)) {
    log(`Source directory does not exist: ${dir}`, true);
    return [];
  }

  let results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat && stat.isDirectory()) {
        // Recurse into subdirectory
        results = results.concat(getAllFiles(fullPath));
      } else {
        // Add file if it's a TypeScript file
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          results.push({
            fullPath,
            relativePath: path.relative(dir, fullPath)
          });
        }
      }
    });
  } catch (error) {
    log(`Error reading directory ${dir}: ${error.message}`, true);
  }
  
  return results;
}

// Migrate a single file
function migrateFile(sourceFile, targetDir, relativePath) {
  const targetPath = path.join(targetDir, relativePath);
  const targetDirPath = path.dirname(targetPath);
  
  // Ensure target directory exists
  ensureDirectoryExists(targetDirPath);
  
  // Read the source file
  let content;
  try {
    content = fs.readFileSync(sourceFile, 'utf8');
  } catch (error) {
    log(`Error reading file ${sourceFile}: ${error.message}`, true);
    return false;
  }
  
  // Create the target file
  if (!dryRun) {
    try {
      fs.writeFileSync(targetPath, content);
      log(`Created ${targetPath}`);
    } catch (error) {
      log(`Error creating file ${targetPath}: ${error.message}`, true);
      return false;
    }
  } else {
    log(`Would create ${targetPath}`);
  }
  
  return true;
}

// Create an index.ts file for each directory
function createIndexFile(dir, description) {
  // Only create for the top-level directory
  const indexPath = path.join(dir, 'index.ts');
  const dirName = path.basename(dir);
  
  const indexContent = `/**
 * ${dirName.charAt(0).toUpperCase() + dirName.slice(1)} Components
 * 
 * ${description}
 */

// This directory contains various ${dirName.toLowerCase()} related components
// Each component or group of components may have its own subdirectory
// with more specific exports.
`;

  if (!dryRun) {
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
}

// Generate an import update regex pattern for a given directory
function generateImportPattern(sourceDir) {
  // Extract the name of the directory
  const dirName = path.basename(sourceDir);
  // Create a pattern that matches imports from this directory
  return new RegExp(`(import\\s+.*?\\s+from\\s+['"])(.+?/${dirName}/)([^'"]+)(['"])`, 'g');
}

// Update imports throughout the codebase for a specific feature directory
function updateImportsForFeature(feature) {
  const sourceDir = feature.sourceDir;
  const targetDir = feature.targetDir;
  const dirName = path.basename(sourceDir);
  
  // Find files that import from this directory
  const command = `find ${rootDir} -type f -name "*.ts*" | grep -v "node_modules" | xargs grep -l "/${dirName}/" || true`;
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    const filesToUpdate = result.trim().split('\n').filter(Boolean);
    
    log(`Found ${filesToUpdate.length} files that might import from ${dirName}`, true);
    
    for (const file of filesToUpdate) {
      let content;
      try {
        content = fs.readFileSync(file, 'utf8');
      } catch (error) {
        log(`Error reading file ${file}: ${error.message}`);
        continue;
      }
      
      // Create a pattern for this specific directory
      const pattern = generateImportPattern(sourceDir);
      
      // Replace import paths
      const updatedContent = content.replace(pattern, (match, prefix, pathPart, component, suffix) => {
        // Calculate the new import path
        const newPath = targetDir.replace(/^src\//, '@/');
        return `${prefix}${newPath}/${component}${suffix}`;
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
    log(`Error finding files to update for ${dirName}: ${error.message}`, true);
  }
}

// Update all imports
function updateImports() {
  featureDirectories.forEach(feature => {
    updateImportsForFeature(feature);
  });
}

// Migration for a single feature directory
function migrateFeatureDirectory(feature) {
  const { sourceDir, targetDir, description } = feature;
  const sourcePath = path.join(rootDir, sourceDir);
  const targetPath = path.join(rootDir, targetDir);
  
  log(`Migrating from ${sourceDir} to ${targetDir}...`, true);
  
  // Get all files to migrate
  const files = getAllFiles(sourcePath);
  
  if (files.length === 0) {
    log(`No files found in ${sourceDir}`, true);
    return 0;
  }
  
  log(`Found ${files.length} files to migrate`, true);
  
  // Ensure the target directory exists
  ensureDirectoryExists(targetPath);
  
  // Migrate each file
  let migratedCount = 0;
  for (const file of files) {
    if (migrateFile(file.fullPath, targetPath, file.relativePath)) {
      migratedCount++;
    }
  }
  
  // Create index file
  createIndexFile(targetPath, description);
  
  return migratedCount;
}

// Main function
function main() {
  log(`Starting legacy feature components migration${dryRun ? ' (DRY RUN)' : ''}`, true);
  
  // Track migration results
  let totalFiles = 0;
  let totalMigrated = 0;
  
  // Migrate each feature directory
  for (const feature of featureDirectories) {
    const sourcePath = path.join(rootDir, feature.sourceDir);
    
    // Check if source directory exists
    if (!fs.existsSync(sourcePath)) {
      log(`Source directory does not exist: ${sourcePath}`, true);
      continue;
    }
    
    const migratedCount = migrateFeatureDirectory(feature);
    const fileCount = getAllFiles(sourcePath).length;
    
    totalFiles += fileCount;
    totalMigrated += migratedCount;
    
    log(`Migrated ${migratedCount}/${fileCount} files from ${feature.sourceDir}`, true);
  }
  
  // Update imports throughout the codebase
  updateImports();
  
  log(`Legacy feature components migration ${dryRun ? 'would complete' : 'completed'} with ${totalMigrated}/${totalFiles} files migrated`, true);
  
  if (dryRun) {
    log('Run with --apply to apply the changes', true);
  }
}

// Run the script
main(); 
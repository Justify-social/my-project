/**
 * Component Relocation Script
 * 
 * This script moves components that should be in the UI directory from features
 * to their proper location in the UI directory structure.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Utility functions
const log = (message) => console.log(`\x1b[36m[Component Relocation]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Components to relocate from features to UI
const componentsToRelocate = [
  {
    source: 'src/components/features/navigation/index.ts',
    target: 'src/components/ui/navigation/index.ts',
    reason: 'Generic UI element without business logic'
  },
  {
    source: 'src/components/features/core/tests/index.ts',
    target: 'src/components/ui/core/tests/index.ts',
    reason: 'Generic UI element without business logic'
  },
  {
    source: 'src/components/features/core/tests/SaveIconTest.tsx',
    target: 'src/components/ui/core/tests/SaveIconTest.tsx',
    reason: 'Generic UI element without business logic'
  },
  {
    source: 'src/components/features/core/loading/skeleton.tsx',
    target: 'src/components/ui/core/loading/skeleton.tsx',
    reason: 'Generic UI element without business logic'
  },
  {
    source: 'src/components/features/core/error-handling/ErrorBoundary.tsx',
    target: 'src/components/ui/core/error-handling/ErrorBoundary.tsx',
    reason: 'Generic UI element without business logic'
  },
  // Components to relocate to layouts
  {
    source: 'src/components/features/core/search/index.ts',
    target: 'src/components/layouts/core/search/index.ts',
    reason: 'Layout container without specific business logic'
  }
];

/**
 * Move a component to a new location
 * @param {Object} component - Component to relocate
 * @returns {Object} - Result of the operation
 */
async function moveComponent(component) {
  try {
    // Check if source exists
    if (!fs.existsSync(component.source)) {
      error(`Source file not found: ${component.source}`);
      return {
        source: component.source,
        target: component.target,
        success: false,
        error: 'Source file not found'
      };
    }

    // Create target directory if it doesn't exist
    const targetDir = path.dirname(component.target);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      log(`Created directory: ${targetDir}`);
    }

    // Copy file to new location
    const content = fs.readFileSync(component.source, 'utf8');
    fs.writeFileSync(component.target, content);
    
    // Update imports in the new file if needed
    updateImportsInFile(component.target);
    
    // Update imports in other files that reference these components
    updateReferencesAcrossProject(component.source, component.target);
    
    // Remove original file
    fs.unlinkSync(component.source);
    
    success(`Moved component: ${component.source} -> ${component.target}`);
    
    return {
      source: component.source,
      target: component.target,
      success: true
    };
  } catch (err) {
    error(`Failed to move component ${component.source}: ${err.message}`);
    return {
      source: component.source,
      target: component.target,
      success: false,
      error: err.message
    };
  }
}

/**
 * Update imports in a file to reflect new locations
 * @param {string} filePath - Path to the file to update
 */
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Replace imports from features to UI or layouts
    content = content.replace(
      /from\s+['"]@\/components\/features\/(core|navigation)/g,
      (match, group) => {
        updated = true;
        // Determine if this should go to UI or layouts
        if (filePath.includes('/layouts/')) {
          return `from '@/components/layouts/${group}`;
        } else {
          return `from '@/components/ui/${group}`;
        }
      }
    );
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      log(`Updated imports in ${filePath}`);
    }
  } catch (err) {
    warning(`Error updating imports in ${filePath}: ${err.message}`);
  }
}

/**
 * Update references to moved components across the project
 * @param {string} oldPath - Original path of the component
 * @param {string} newPath - New path of the component
 */
function updateReferencesAcrossProject(oldPath, newPath) {
  // Convert paths to format used in imports
  const oldImportPath = `@/components/${oldPath.replace(/^src\/components\//, '')}`;
  const newImportPath = `@/components/${newPath.replace(/^src\/components\//, '')}`;
  
  // Find all JS/TS/TSX files that might have imports
  const files = glob.sync('src/**/*.{js,jsx,ts,tsx}', {
    ignore: ['node_modules/**', '.git/**', '.next/**', 'dist/**', 'build/**']
  });
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let updated = false;
      
      // Replace imports with the new path
      content = content.replace(
        new RegExp(`from\\s+['"]${oldImportPath.replace(/\.[^.]*$/, '')}['"]`, 'g'),
        (match) => {
          updated = true;
          return match.replace(oldImportPath.replace(/\.[^.]*$/, ''), newImportPath.replace(/\.[^.]*$/, ''));
        }
      );
      
      if (updated) {
        fs.writeFileSync(file, content);
        log(`Updated imports in ${file}`);
      }
    } catch (err) {
      warning(`Error updating imports in ${file}: ${err.message}`);
    }
  });
}

/**
 * Clean up empty directories after moving files
 */
function cleanupEmptyDirectories() {
  // Get all directories under components/features
  const directories = glob.sync('src/components/features/**/*/');
  
  // Sort directories by depth (deepest first)
  const sortedDirs = directories.sort((a, b) => {
    return b.split('/').length - a.split('/').length;
  });
  
  sortedDirs.forEach(dir => {
    try {
      const files = fs.readdirSync(dir);
      
      // If directory is empty, remove it
      if (files.length === 0) {
        fs.rmdirSync(dir);
        log(`Removed empty directory: ${dir}`);
      }
    } catch (err) {
      warning(`Error checking directory ${dir}: ${err.message}`);
    }
  });
}

/**
 * Create a report of the relocation process
 * @param {Array<Object>} results - Results of the relocation operations
 */
function createReport(results) {
  const reportContent = `# Component Responsibility Relocation Report

## Summary
- Total components processed: ${results.length}
- Successfully relocated: ${results.filter(r => r.success).length}
- Failed: ${results.filter(r => !r.success).length}

## Successfully Relocated Components
${results.filter(r => r.success).map(r => `- ✅ \`${r.source}\` -> \`${r.target}\``).join('\n')}

## Failed Relocations
${results.filter(r => !r.success).map(r => `- ❌ \`${r.source}\`: ${r.error}`).join('\n')}

## Purpose
This script relocated components from the features directory to either the UI or layouts directory based on their responsibilities:

- UI components: Generic, presentational components without business logic
- Layout components: Components that provide structural layout without specific business logic
- Feature components: Components with specific business logic tied to application features

This separation ensures better organization and maintainability.
`;

  fs.writeFileSync('docs/project-history/component-responsibility-report.md', reportContent);
  success(`Report written to docs/project-history/component-responsibility-report.md`);
}

/**
 * Main function to run the script
 */
async function main() {
  // Create git backup before making changes
  try {
    execSync('git branch -D component-relocation-backup 2>/dev/null || true', { stdio: 'pipe' });
    execSync('git checkout -b component-relocation-backup', { stdio: 'pipe' });
    execSync('git checkout -', { stdio: 'pipe' });
    success(`Created backup branch: component-relocation-backup`);
  } catch (err) {
    warning(`Could not create git backup branch: ${err.message}`);
  }
  
  log(`Found ${componentsToRelocate.length} components to relocate`);
  
  // Relocate components
  const results = [];
  for (const component of componentsToRelocate) {
    const result = await moveComponent(component);
    results.push(result);
  }
  
  // Clean up empty directories
  cleanupEmptyDirectories();
  
  // Create a report
  createReport(results);
  
  // Final summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  log(`Component relocation completed.`);
  success(`Successfully relocated ${successCount} components.`);
  if (failCount > 0) {
    error(`Failed to relocate ${failCount} components. See the report for details.`);
  }
}

// Run the script
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 
/**
 * Import Verification Script
 * 
 * This script verifies that imports for renamed files are correctly updated.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import execSync from 'child_process';

// Utility functions
const log = (message) => console.log(`\x1b[36m[Import Verification]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Find all possible JS/TS files that might import other files
function findAllSourceFiles() {
  return glob.sync('**/*.{js,jsx,ts,tsx,md}', {
    ignore: ['node_modules/**', '.git/**', '.next/**', 'build/**', 'dist/**']
  });
}

// Load mapping of renamed files from the file-renaming-report.md
function loadRenamingMap() {
  const renamingMap = new Map();
  
  if (!fs.existsSync('docs/file-renaming-report.md')) {
    warning('file-renaming-report.md not found, cannot load renaming map');
    return renamingMap;
  }
  
  const content = fs.readFileSync('docs/file-renaming-report.md', 'utf8');
  const renamedFilesSection = content.split('### Successfully Renamed')[1]?.split('### Skipped')[0] || '';
  
  // Extract the renamed file paths
  const renamedLines = renamedFilesSection.match(/- `([^`]+)` -> `([^`]+)`/g) || [];
  
  for (const line of renamedLines) {
    const match = line.match(/- `([^`]+)` -> `([^`]+)`/);
    if (match) {
      const [, oldPath, newPath] = match;
      renamingMap.set(oldPath, newPath);
      
      // Also add mappings without file extensions for import paths
      const oldPathWithoutExt = oldPath.replace(/\.\w+$/, '');
      const newPathWithoutExt = newPath.replace(/\.\w+$/, '');
      renamingMap.set(oldPathWithoutExt, newPathWithoutExt);
    }
  }
  
  return renamingMap;
}

// Check for old import paths in a file
function checkImports(file, renamingMap) {
  if (!fs.existsSync(file)) return [];
  
  try {
    const content = fs.readFileSync(file, 'utf8');
    const issues = [];
    
    // Skip binary files
    if (/\uFFFD/.test(content)) {
      return issues;
    }
    
    for (const [oldPath, newPath] of renamingMap.entries()) {
      // Skip directories when checking imports (they would be used with a following slash or file)
      if (!oldPath.includes('.') && !fs.existsSync(oldPath)) continue;
      
      // Check for requires, imports, and other references
      const importRegexes = [
        // require statements
        new RegExp(`require\\(['"\`]([\\./]*${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})['"\`]\\)`, 'g'),
        // import statements
        new RegExp(`from\\s+['"\`]([\\./]*${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})['"\`]`, 'g'),
        // URL paths in markdown
        new RegExp(`\\[(.*)\\]\\(([\\./]*${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\)`, 'g'),
      ];
      
      for (const regex of importRegexes) {
        const matches = content.match(regex);
        if (matches) {
          for (const match of matches) {
            issues.push({
              file,
              oldPath,
              newPath,
              match
            });
          }
        }
      }
    }
    
    return issues;
  } catch (err) {
    warning(`Could not check imports in ${file}: ${err.message}`);
    return [];
  }
}

// Create a verification report
function createVerificationReport(issues) {
  const reportContent = `# Import Verification Report

## Summary
- Total files scanned: ${issues.length > 0 ? [...new Set(issues.map(i => i.file))].length : 0}
- Files with potential import issues: ${[...new Set(issues.map(i => i.file))].length}
- Total potential issues found: ${issues.length}

## Details

${[...new Set(issues.map(i => i.file))].map(file => {
  const fileIssues = issues.filter(i => i.file === file);
  return `### ${file}
${fileIssues.map(issue => `- Found reference to \`${issue.oldPath}\`, should be \`${issue.newPath}\`
  \`\`\`
  ${issue.match.slice(0, 100)}${issue.match.length > 100 ? '...' : ''}
  \`\`\`
`).join('')}`;
}).join('\n\n')}

## Next Steps

1. Review the issues above and fix them manually
2. Run tests to ensure all imports are correctly resolved
3. Update any hardcoded paths in the codebase
`;

  fs.writeFileSync('docs/import-verification-report.md', reportContent);
  success('Created import verification report at docs/import-verification-report.md');
}

// Main function
async function main() {
  log('Starting import verification...');
  
  // Track timing
  const startTime = Date.now();
  
  try {
    // Load the renaming map
    const renamingMap = loadRenamingMap();
    log(`Loaded renaming map with ${renamingMap.size} entries`);
    
    if (renamingMap.size === 0) {
      warning('No renamed files found. Nothing to verify.');
      return;
    }
    
    // Find all source files
    const sourceFiles = findAllSourceFiles();
    log(`Found ${sourceFiles.length} source files to check`);
    
    // Check each file for import issues
    const allIssues = [];
    for (const file of sourceFiles) {
      const issues = checkImports(file, renamingMap);
      if (issues.length > 0) {
        allIssues.push(...issues);
      }
    }
    
    log(`Found ${allIssues.length} potential import issues in ${[...new Set(allIssues.map(i => i.file))].length} files`);
    
    // Create a verification report
    createVerificationReport(allIssues);
    
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    success(`Import verification completed in ${executionTime}s`);
  } catch (err) {
    error(`Import verification failed: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function
main(); 
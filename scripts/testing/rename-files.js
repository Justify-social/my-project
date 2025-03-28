/**
 * File Renaming Script for Naming Consistency
 * 
 * This script safely renames files and directories to kebab-case,
 * while updating imports and references to maintain functionality.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import execSync from 'child_process';

// Utility functions
const log = (message) => console.log(`\x1b[36m[Rename Files]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Convert strings to kebab-case
function toKebabCase(str) {
  // Handle special case for PROJECT_OVERVIEW.md -> project-overview.md
  if (str === 'PROJECT_OVERVIEW.md') {
    return 'project-overview.md';
  }

  // Skip PascalCase React component files
  if (/^[A-Z][a-zA-Z0-9]*\.(tsx|jsx|ts|js)$/.test(str)) {
    return str;
  }

  // Special case for directories that should remain PascalCase
  if (str === 'KPIs' || /^[A-Z][a-zA-Z0-9]*$/.test(str) && !str.includes('.')) {
    return str;
  }

  return str
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Replace underscores with hyphens
    .replace(/_/g, '-')
    // Replace periods with hyphens (except file extensions)
    .replace(/\.(?![\w]+$)/g, '-')
    // Handle camelCase -> kebab-case
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Convert to lowercase
    .toLowerCase();
}

// Get the new path for a file or directory
function getNewPath(oldPath) {
  const dirname = path.dirname(oldPath);
  const basename = path.basename(oldPath);
  const newBasename = toKebabCase(basename);
  return path.join(dirname, newBasename);
}

// Find files and directories not following kebab-case
function findInconsistentNaming() {
  const excludeDirs = ['node_modules', '.git', '.next'];

  // Load already identified files from naming-convention-issues.md
  let identifiedFiles = [];
  if (fs.existsSync('docs/naming-convention-issues.md')) {
    const content = fs.readFileSync('docs/naming-convention-issues.md', 'utf8');
    identifiedFiles = content.match(/`([^`]+)`/g)
      .map(match => match.replace(/`/g, ''))
      .filter(file => fs.existsSync(file));
  } else {
    // Fallback to searching manually
    identifiedFiles = glob.sync('**/*', { 
      nodir: false,
      ignore: excludeDirs.map(dir => `${dir}/**`)
    }).filter(item => {
      // Skip directories we want to exclude
      if (excludeDirs.some(dir => item.startsWith(dir + '/'))) {
        return false;
      }
      
      const basename = path.basename(item);
      // Skip hidden files
      if (basename.startsWith('.')) {
        return false;
      }

      // Skip React component files (PascalCase is correct for them)
      if (/^[A-Z][a-zA-Z0-9]*\.(tsx|jsx|ts|js)$/.test(basename)) {
        return false;
      }

      // Check if name follows kebab-case
      return basename !== toKebabCase(basename);
    });
  }

  return identifiedFiles;
}

// Update imports and references in a file
function updateImportsInFile(file, oldPath, newPath) {
  if (!fs.existsSync(file)) return;

  try {
    let content = fs.readFileSync(file, 'utf8');
    const oldRelativePath = path.relative(path.dirname(file), oldPath);
    const newRelativePath = path.relative(path.dirname(file), newPath);
    
    // Skip binary files
    if (/\uFFFD/.test(content)) {
      return;
    }

    // Update relative imports
    content = content.replace(
      new RegExp(`(['"\`])${oldRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`, 'g'),
      `$1${newRelativePath}$2`
    );

    // Update absolute imports
    const oldPathWithoutExt = oldPath.replace(/\.[^/.]+$/, '');
    const newPathWithoutExt = newPath.replace(/\.[^/.]+$/, '');
    content = content.replace(
      new RegExp(`(['"\`])${oldPathWithoutExt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`, 'g'),
      `$1${newPathWithoutExt}$2`
    );

    fs.writeFileSync(file, content);
  } catch (err) {
    warning(`Could not update imports in ${file}: ${err.message}`);
  }
}

// Find all JS/TS/TSX/JSX/MD files that might have imports
function findFilesWithImports() {
  return glob.sync('**/*.{js,jsx,ts,tsx,md}', {
    ignore: ['node_modules/**', '.git/**', '.next/**']
  });
}

// Rename a file or directory and update imports
async function renameFileAndUpdateImports(oldPath, newPath) {
  if (oldPath === newPath) return { oldPath, newPath, success: true, skipped: true };
  
  if (!fs.existsSync(oldPath)) {
    return { oldPath, newPath, success: false, error: 'File does not exist' };
  }

  try {
    // Create parent directory if it doesn't exist
    const parentDir = path.dirname(newPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Check if it's a directory
    const isDirectory = fs.statSync(oldPath).isDirectory();

    // Create a git backup branch before making changes
    try {
      execSync('git branch -D naming-backup 2>/dev/null || true', { stdio: 'pipe' });
      execSync('git checkout -b naming-backup', { stdio: 'pipe' });
      execSync(`git checkout -`, { stdio: 'pipe' });
    } catch (err) {
      warning(`Could not create git backup branch: ${err.message}`);
    }

    // Update imports in all relevant files first
    const filesToUpdate = findFilesWithImports();
    for (const file of filesToUpdate) {
      updateImportsInFile(file, oldPath, newPath);
    }

    // Special handling for React component files
    if (
      (oldPath.endsWith('.tsx') || oldPath.endsWith('.jsx')) &&
      // Check for PascalCase file name
      /^[A-Z][a-zA-Z0-9]*\.(tsx|jsx)$/.test(path.basename(oldPath))
    ) {
      warning(`Skipping rename of React component file: ${oldPath}`);
      return { oldPath, newPath, success: true, skipped: true };
    }

    // For directories, we need to create the new one and recursively copy files
    if (isDirectory) {
      // Create new directory
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true });
      }

      // Copy all files to the new directory
      const files = glob.sync(`${oldPath}/**/*`, { dot: true, nodir: true });
      for (const file of files) {
        const relativePath = path.relative(oldPath, file);
        const newFilePath = path.join(newPath, relativePath);
        
        // Create parent directory if it doesn't exist
        const newFileDir = path.dirname(newFilePath);
        if (!fs.existsSync(newFileDir)) {
          fs.mkdirSync(newFileDir, { recursive: true });
        }
        
        fs.copyFileSync(file, newFilePath);
      }

      // Remove the old directory
      fs.rmSync(oldPath, { recursive: true, force: true });
    } else {
      // For regular files, just rename them
      fs.copyFileSync(oldPath, newPath);
      fs.unlinkSync(oldPath);
    }

    success(`Renamed: ${oldPath} -> ${newPath}`);
    return { oldPath, newPath, success: true };
  } catch (err) {
    error(`Failed to rename ${oldPath}: ${err.message}`);
    return { oldPath, newPath, success: false, error: err.message };
  }
}

// Process a batch of file renames
async function processRenameBatch(files, batchSize = 5) {
  const results = [];
  
  // Process files in batches to avoid overwhelming the system
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)} (${batch.length} files)`);
    
    const batchPromises = batch.map(oldPath => {
      const newPath = getNewPath(oldPath);
      return renameFileAndUpdateImports(oldPath, newPath);
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

// Create a report of the renaming process
function createRenameReport(results) {
  const reportContent = `# File Renaming Report

## Summary
- Total files processed: ${results.length}
- Successfully renamed: ${results.filter(r => r.success && !r.skipped).length}
- Skipped: ${results.filter(r => r.skipped).length}
- Failed: ${results.filter(r => !r.success).length}

## Details

### Successfully Renamed
${results.filter(r => r.success && !r.skipped).map(r => `- \`${r.oldPath}\` -> \`${r.newPath}\``).join('\n')}

### Skipped
${results.filter(r => r.skipped).map(r => `- \`${r.oldPath}\` (already kebab-case or React component)`).join('\n')}

### Failed
${results.filter(r => !r.success).map(r => `- \`${r.oldPath}\` (Error: ${r.error})`).join('\n')}

## Next Steps

1. Verify that all imports and references are correctly updated
2. Update any hardcoded paths in the codebase
3. Update documentation to reflect the new file structure
4. Run tests to ensure everything still works as expected
`;

  fs.writeFileSync('docs/file-renaming-report.md', reportContent);
  success('Created file renaming report at docs/file-renaming-report.md');
}

// Main function
async function main() {
  log('Starting file renaming process for naming consistency...');
  
  // Track timing
  const startTime = Date.now();
  
  try {
    // Find files and directories with inconsistent naming
    const inconsistentFiles = findInconsistentNaming();
    log(`Found ${inconsistentFiles.length} files/directories with inconsistent naming`);
    
    if (inconsistentFiles.length === 0) {
      success('No files or directories need renaming. Naming is consistent!');
      return;
    }
    
    // Group files into documentation, scripts, source code, and others
    const docFiles = inconsistentFiles.filter(f => f.includes('/docs/') || f.includes('.md'));
    const scriptFiles = inconsistentFiles.filter(f => f.includes('/scripts/') || f.endsWith('.js') || f.endsWith('.sh'));
    const sourceFiles = inconsistentFiles.filter(f => f.includes('/src/'));
    const otherFiles = inconsistentFiles.filter(f => 
      !docFiles.includes(f) && !scriptFiles.includes(f) && !sourceFiles.includes(f)
    );
    
    log(`Processing files in order: documentation (${docFiles.length}), scripts (${scriptFiles.length}), source (${sourceFiles.length}), other (${otherFiles.length})`);
    
    // Process files in the safest order: docs first, then scripts, then source code
    const docResults = await processRenameBatch(docFiles);
    const scriptResults = await processRenameBatch(scriptFiles);
    const sourceResults = await processRenameBatch(sourceFiles);
    const otherResults = await processRenameBatch(otherFiles);
    
    // Combine all results
    const allResults = [...docResults, ...scriptResults, ...sourceResults, ...otherResults];
    
    // Create a report
    createRenameReport(allResults);
    
    // Update project progress
    try {
      execSync('node scripts/unification-final/update-progress.js "Naming Consistency" 60', { stdio: 'inherit' });
    } catch (err) {
      warning(`Could not update progress: ${err.message}`);
    }
    
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    success(`File renaming completed in ${executionTime}s`);
  } catch (err) {
    error(`File renaming failed: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function
main(); 
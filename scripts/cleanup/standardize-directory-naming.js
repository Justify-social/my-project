/**
 * Directory Naming Standardization Script
 * 
 * This script standardizes directory naming by:
 * 1. Ensuring consistent plural forms for directories containing multiple components
 * 2. Using kebab-case for all directory names
 * 3. Updating import references
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');
const { promisify } = require('util');

// Utility functions
const log = (message) => console.log(`\x1b[36m[Directory Standardization]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

/**
 * Directories that should be pluralized
 * Add more directory types that should always be plural
 */
const DIRECTORIES_TO_PLURALIZE = [
  'component',
  'layout',
  'util',
  'hook',
  'context',
  'provider',
  'service',
  'helper',
  'middleware',
  'module',
  'interface',
  'type',
  'asset',
  'icon',
  'image',
  'font',
  'style',
  'config',
  'constant',
  'handler',
  'model'
];

/**
 * Convert a string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} - Kebab-case string
 */
function toKebabCase(str) {
  return str
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Replace underscores with hyphens
    .replace(/_/g, '-')
    // Replace periods with hyphens (except file extensions)
    .replace(/\.(?![\w]+$)/g, '-')
    // Handle camelCase/PascalCase -> kebab-case
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Convert to lowercase
    .toLowerCase();
}

/**
 * Pluralize a word
 * This is a simplified implementation and doesn't handle all English pluralization rules
 * @param {string} word - Word to pluralize
 * @returns {string} - Pluralized word
 */
function pluralize(word) {
  // Skip if already plural
  if (word.endsWith('s')) {
    return word;
  }
  
  // Handle special cases
  const specialCases = {
    'child': 'children',
    'person': 'people',
    'man': 'men',
    'woman': 'women',
    'tooth': 'teeth',
    'foot': 'feet',
    'mouse': 'mice',
    'goose': 'geese'
  };
  
  if (specialCases[word]) {
    return specialCases[word];
  }
  
  // Handle words ending in 'y' - change to 'ies'
  if (word.endsWith('y') && word.length > 1 && !['a', 'e', 'i', 'o', 'u'].includes(word[word.length - 2])) {
    return word.slice(0, -1) + 'ies';
  }
  
  // Handle words ending in 'f' or 'fe' - change to 'ves'
  if (word.endsWith('f')) {
    return word.slice(0, -1) + 'ves';
  }
  
  if (word.endsWith('fe')) {
    return word.slice(0, -2) + 'ves';
  }
  
  // Default - just add 's'
  return word + 's';
}

/**
 * Find directories that need renaming
 * @returns {Array<Object>} - Array of directories to rename
 */
function findDirectoriesToRename() {
  const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build'];
  
  // Find all directories
  const allDirs = glob.sync('src/**/*/');
  
  // Filter out excluded directories
  const directoriesOfInterest = allDirs.filter(dir => {
    return !excludeDirs.some(exclude => dir.includes(`/${exclude}/`)) && 
           !excludeDirs.some(exclude => dir.startsWith(`${exclude}/`));
  });
  
  // Find directories that need renaming
  return directoriesOfInterest.map(dir => {
    // Remove trailing slash
    const dirWithoutSlash = dir.endsWith('/') ? dir.slice(0, -1) : dir;
    // Get directory name without path
    const dirName = path.basename(dirWithoutSlash);
    // Convert to kebab-case
    const kebabName = toKebabCase(dirName);
    
    // Check if directory should be pluralized
    const shouldPluralize = DIRECTORIES_TO_PLURALIZE.some(type => {
      // Check if the directory name is a singular form of one of the types
      return kebabName === type || 
             kebabName === toKebabCase(type);
    });
    
    // Get the new name
    let newName = kebabName;
    if (shouldPluralize) {
      newName = pluralize(kebabName);
    }
    
    // Check if directory needs renaming
    const needsRenaming = dirName !== newName;
    
    return {
      path: dirWithoutSlash,
      originalName: dirName,
      newName: newName,
      needsRenaming: needsRenaming
    };
  }).filter(dir => dir.needsRenaming);
}

/**
 * Check if a directory should be renamed (additional validation)
 * @param {Object} dirInfo - Directory information
 * @returns {boolean} - Whether the directory should be renamed
 */
function shouldRenameDirectory(dirInfo) {
  // Get directory contents
  const dirContents = glob.sync(`${dirInfo.path}/*`);
  
  // Skip empty directories
  if (dirContents.length === 0) {
    warning(`Skipping empty directory: ${dirInfo.path}`);
    return false;
  }
  
  // Check if the new name already exists
  const parentDir = path.dirname(dirInfo.path);
  const newPath = path.join(parentDir, dirInfo.newName);
  
  if (fs.existsSync(newPath)) {
    // If new directory already exists, we need to merge instead of rename
    warning(`Directory ${newPath} already exists. Will merge instead of rename.`);
    dirInfo.shouldMerge = true;
    return true;
  }
  
  return true;
}

/**
 * Update imports in a file after directory renaming
 * @param {string} file - File to update
 * @param {string} oldPath - Original directory path
 * @param {string} newPath - New directory path
 */
function updateImportsInFile(file, oldPath, newPath) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return;
  
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Skip binary files
    if (/\uFFFD/.test(content)) {
      return;
    }
    
    // Convert paths to format used in imports (with forward slashes)
    const oldImportPath = oldPath.replace(/\\/g, '/');
    const newImportPath = newPath.replace(/\\/g, '/');
    
    // Check for absolute imports with @/
    const oldAbsoluteImport = oldImportPath.replace(/^src\//, '@/');
    const newAbsoluteImport = newImportPath.replace(/^src\//, '@/');
    
    // Calculate relative paths
    const dirPath = path.dirname(file);
    let oldRelativePath = path.relative(dirPath, oldPath).replace(/\\/g, '/');
    let newRelativePath = path.relative(dirPath, newPath).replace(/\\/g, '/');
    
    // Ensure they start with ./ or ../
    if (!oldRelativePath.startsWith('.')) {
      oldRelativePath = `./${oldRelativePath}`;
    }
    
    if (!newRelativePath.startsWith('.')) {
      newRelativePath = `./${newRelativePath}`;
    }
    
    let updated = false;
    let updatedContent = content;
    
    // Update absolute imports
    updatedContent = updatedContent.replace(
      new RegExp(`(['"\`])${oldAbsoluteImport}(['"\`/])`, 'g'),
      (match, quote1, quote2) => {
        updated = true;
        return `${quote1}${newAbsoluteImport}${quote2}`;
      }
    );
    
    // Update relative imports
    updatedContent = updatedContent.replace(
      new RegExp(`(['"\`])${oldRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`/])`, 'g'),
      (match, quote1, quote2) => {
        updated = true;
        return `${quote1}${newRelativePath}${quote2}`;
      }
    );
    
    if (updated) {
      fs.writeFileSync(file, updatedContent);
      log(`Updated imports in ${file}`);
    }
  } catch (err) {
    warning(`Error updating imports in ${file}: ${err.message}`);
  }
}

/**
 * Update all imports after renaming a directory
 * @param {string} oldPath - Original directory path
 * @param {string} newPath - New directory path
 */
function updateAllImports(oldPath, newPath) {
  // Find all JS/TS/TSX/JSX files that might have imports
  const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
    ignore: ['node_modules/**', '.git/**', '.next/**', 'dist/**', 'build/**']
  });
  
  files.forEach(file => {
    updateImportsInFile(file, oldPath, newPath);
  });
}

/**
 * Copy directory contents to a new directory
 * @param {string} source - Source directory
 * @param {string} target - Target directory
 */
async function copyDirectory(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directories
      await copyDirectory(sourcePath, targetPath);
    } else {
      // Copy files
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

/**
 * Rename a directory
 * @param {Object} dirInfo - Directory information
 * @returns {Object} - Result of the operation
 */
async function renameDirectory(dirInfo) {
  try {
    const parentDir = path.dirname(dirInfo.path);
    const newPath = path.join(parentDir, dirInfo.newName);
    
    log(`Renaming directory: ${dirInfo.path} -> ${newPath}`);
    
    if (dirInfo.shouldMerge) {
      // Merge directory contents instead of renaming
      await copyDirectory(dirInfo.path, newPath);
      
      // Update imports for all files
      updateAllImports(dirInfo.path, newPath);
      
      // Remove the original directory
      fs.rmSync(dirInfo.path, { recursive: true, force: true });
      
      success(`Merged directory: ${dirInfo.path} -> ${newPath}`);
    } else {
      // Create the new directory
      fs.mkdirSync(newPath, { recursive: true });
      
      // Copy all contents
      await copyDirectory(dirInfo.path, newPath);
      
      // Update imports for all files
      updateAllImports(dirInfo.path, newPath);
      
      // Remove the original directory
      fs.rmSync(dirInfo.path, { recursive: true, force: true });
      
      success(`Renamed directory: ${dirInfo.path} -> ${newPath}`);
    }
    
    return {
      originalPath: dirInfo.path,
      newPath: newPath,
      success: true
    };
  } catch (err) {
    error(`Failed to rename directory ${dirInfo.path}: ${err.message}`);
    return {
      originalPath: dirInfo.path,
      newPath: path.join(path.dirname(dirInfo.path), dirInfo.newName),
      success: false,
      error: err.message
    };
  }
}

/**
 * Create a report of the directory renaming process
 * @param {Array<Object>} results - Results of the directory renaming operations
 */
function createReport(results) {
  const reportContent = `# Directory Naming Standardization Report

## Summary
- Total directories processed: ${results.length}
- Successfully renamed: ${results.filter(r => r.success).length}
- Failed: ${results.filter(r => !r.success).length}

## Successfully Renamed Directories
${results.filter(r => r.success).map(r => `- ✅ \`${r.originalPath}\` -> \`${r.newPath}\``).join('\n')}

## Failed Directories
${results.filter(r => !r.success).map(r => `- ❌ \`${r.originalPath}\`: ${r.error}`).join('\n')}
`;

  fs.writeFileSync('docs/project-history/directory-naming-report.md', reportContent);
  success(`Report written to docs/project-history/directory-naming-report.md`);
}

/**
 * Main function to run the script
 */
async function main() {
  // Create git backup before making changes
  try {
    execSync('git branch -D directory-naming-backup 2>/dev/null || true', { stdio: 'pipe' });
    execSync('git checkout -b directory-naming-backup', { stdio: 'pipe' });
    execSync('git checkout -', { stdio: 'pipe' });
    success(`Created backup branch: directory-naming-backup`);
  } catch (err) {
    warning(`Could not create git backup branch: ${err.message}`);
  }
  
  // Find directories that need renaming
  const directoriesToRename = findDirectoriesToRename();
  log(`Found ${directoriesToRename.length} directories to rename`);
  
  // Filter out directories that should not be renamed
  const validDirectories = directoriesToRename.filter(shouldRenameDirectory);
  log(`${validDirectories.length} directories will be processed`);
  
  // Process directories in reverse order (deepest first to prevent path issues)
  const sortedDirectories = validDirectories.sort((a, b) => {
    return b.path.split('/').length - a.path.split('/').length;
  });
  
  // Rename each directory
  const results = [];
  for (const dirInfo of sortedDirectories) {
    const result = await renameDirectory(dirInfo);
    results.push(result);
  }
  
  // Create a report
  createReport(results);
  
  // Final summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  log(`Directory naming standardization completed.`);
  success(`Successfully renamed ${successCount} directories.`);
  if (failCount > 0) {
    error(`Failed to rename ${failCount} directories. See the report for details.`);
  }
}

// Run the script
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 
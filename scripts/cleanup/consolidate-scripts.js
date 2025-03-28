#!/usr/bin/env node

/**
 * Scripts Directory Consolidation Tool
 * 
 * This script analyzes the scripts directory to identify potential duplicates,
 * similar scripts, and suggests consolidation opportunities. It helps maintain
 * a clean and organized scripts directory structure.
 * 
 * Usage:
 *   node scripts/cleanup/consolidate-scripts.js [--dry-run] [--auto-consolidate]
 * 
 * Options:
 *   --dry-run          Show what would be done without making changes
 *   --auto-consolidate Automatically consolidate obvious duplicates
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';
import crypto from 'crypto';

// Color console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const autoConsolidate = args.includes('--auto-consolidate');

// Base directory for scripts
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

// Directories and files to ignore
const IGNORE_DIRS = [
  '.git',
  'node_modules',
];

const IGNORE_FILES = [
  '.DS_Store',
  'README.md',
  'index.js'
];

// Script categories for organizing
const SCRIPT_CATEGORIES = {
  'icon': ['icon', 'svg', 'fa-', 'fontawesome', 'glyph'],
  'build': ['build', 'webpack', 'rollup', 'compile', 'minify', 'bundle', 'package'],
  'deploy': ['deploy', 'publish', 'release', 'upload', 'cdn'],
  'test': ['test', 'jest', 'cypress', 'mocha', 'spec', 'e2e'],
  'lint': ['lint', 'eslint', 'stylelint', 'prettier', 'format'],
  'cleanup': ['cleanup', 'clean', 'prune', 'remove', 'delete'],
  'doc': ['doc', 'docs', 'document', 'readme', 'api', 'jsdoc'],
  'analyze': ['analyze', 'check', 'verify', 'validate', 'audit'],
  'db': ['db', 'database', 'migrate', 'seed', 'sql'],
  'utils': ['util', 'helper', 'tools', 'scripts']
};

// Script categories with existing consolidated directories
const EXISTING_CONSOLIDATED_DIRS = [
  'scripts/icons',
  'scripts/cleanup',
  'scripts/documentation'
];

// Results storage
const results = {
  exactDuplicates: [],  // Completely identical files
  similarScripts: [],   // Similar but not identical files
  scriptsByCategory: {}, // Scripts organized by category
  consolidationSuggestions: [], // Suggested consolidation actions
  filesScanned: 0,
  directoriesScanned: 0
};

// Initialize category trackers
for (const category in SCRIPT_CATEGORIES) {
  results.scriptsByCategory[category] = [];
}
results.scriptsByCategory['other'] = [];

/**
 * Calculate file hash for comparison
 * @param {string} filePath - Path to file
 * @returns {string} MD5 hash of file contents
 */
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('md5').update(content).digest('hex');
    return hash;
  } catch (err) {
    console.error(`Error hashing file ${filePath}: ${err.message}`);
    return '';
  }
}

/**
 * Determine the category of a script based on filename and content
 * @param {string} filePath - Path to the script file
 * @returns {string} Category name
 */
function determineScriptCategory(filePath) {
  const fileName = path.basename(filePath).toLowerCase();
  const fileDir = path.dirname(filePath);
  
  // First check if it's in an existing consolidated directory
  for (const dir of EXISTING_CONSOLIDATED_DIRS) {
    if (fileDir.startsWith(dir)) {
      return path.basename(dir);
    }
  }
  
  // Then check content and filename patterns
  try {
    const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
    
    for (const category in SCRIPT_CATEGORIES) {
      const patterns = SCRIPT_CATEGORIES[category];
      
      // Check filename first
      if (patterns.some(pattern => fileName.includes(pattern))) {
        return category;
      }
      
      // Then check content
      if (patterns.some(pattern => content.includes(pattern))) {
        return category;
      }
    }
    
    return 'other';
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
    return 'other';
  }
}

/**
 * Check similarity between two scripts
 * @param {string} file1 - Path to first script
 * @param {string} file2 - Path to second script
 * @returns {Object} Similarity information
 */
function checkScriptSimilarity(file1, file2) {
  try {
    const content1 = fs.readFileSync(file1, 'utf8');
    const content2 = fs.readFileSync(file2, 'utf8');
    
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    
    // Count matching lines
    const minLines = Math.min(lines1.length, lines2.length);
    let matchingLines = 0;
    
    for (let i = 0; i < minLines; i++) {
      if (lines1[i].trim() === lines2[i].trim()) {
        matchingLines++;
      }
    }
    
    const similarity = matchingLines / minLines;
    
    return {
      file1,
      file2,
      similarity: similarity,
      matchingLines,
      totalLines1: lines1.length,
      totalLines2: lines2.length
    };
  } catch (err) {
    console.error(`Error comparing files ${file1} and ${file2}: ${err.message}`);
    return {
      file1,
      file2,
      similarity: 0,
      matchingLines: 0,
      totalLines1: 0,
      totalLines2: 0
    };
  }
}

/**
 * Read script metadata from file
 * @param {string} filePath - Path to script file
 * @returns {Object} Script metadata
 */
function getScriptMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, 30); // Read first 30 lines
    
    let description = '';
    let usageSample = '';
    
    // Look for description in comment blocks
    let inCommentBlock = false;
    
    for (const line of lines) {
      // Start of a comment block
      if (line.includes('/**') || line.includes('/*')) {
        inCommentBlock = true;
        continue;
      }
      
      // End of a comment block
      if (inCommentBlock && line.includes('*/')) {
        inCommentBlock = false;
        continue;
      }
      
      // Inside a comment block
      if (inCommentBlock) {
        const cleanLine = line.trim().replace(/^\s*\*\s*/, '').trim();
        if (cleanLine && !cleanLine.startsWith('@') && !description) {
          description = cleanLine;
        }
      }
      
      // Look for usage examples
      if (line.includes('Usage:') || line.includes('Example:')) {
        usageSample = line.trim();
      }
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    return {
      path: filePath,
      name: path.basename(filePath),
      description: description || path.basename(filePath),
      size: stats.size,
      modified: stats.mtime,
      usageSample: usageSample,
      category: determineScriptCategory(filePath)
    };
  } catch (err) {
    console.error(`Error reading metadata for ${filePath}: ${err.message}`);
    return {
      path: filePath,
      name: path.basename(filePath),
      description: path.basename(filePath),
      size: 0,
      modified: new Date(),
      usageSample: '',
      category: 'other'
    };
  }
}

/**
 * Scan the scripts directory for duplicate and similar scripts
 */
function scanScriptsDirectory() {
  console.log(`${colors.cyan}Scanning scripts directory...${colors.reset}`);
  
  const scripts = [];
  const scriptHashes = {};
  
  /**
   * Recursively process directory
   * @param {string} dirPath - Directory to process
   */
  function processDirectory(dirPath) {
    results.directoriesScanned++;
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      if (IGNORE_DIRS.includes(item)) {
        continue;
      }
      
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        processDirectory(itemPath);
      } else if (stats.isFile() && item.endsWith('.js') && !IGNORE_FILES.includes(item)) {
        results.filesScanned++;
        
        // Get file hash and metadata
        const hash = getFileHash(itemPath);
        const metadata = getScriptMetadata(itemPath);
        
        // Track script by category
        results.scriptsByCategory[metadata.category].push(metadata);
        
        // Store script info
        scripts.push({
          path: itemPath,
          hash: hash,
          metadata: metadata
        });
        
        // Check for exact duplicates
        if (scriptHashes[hash]) {
          results.exactDuplicates.push({
            original: scriptHashes[hash],
            duplicate: itemPath
          });
        } else {
          scriptHashes[hash] = itemPath;
        }
      }
    }
  }
  
  // Start processing from the scripts directory
  processDirectory(SCRIPTS_DIR);
  
  console.log(`${colors.green}Processed ${results.filesScanned} script files in ${results.directoriesScanned} directories${colors.reset}`);
  
  // Find similar scripts
  for (let i = 0; i < scripts.length; i++) {
    for (let j = i + 1; j < scripts.length; j++) {
      const similarity = checkScriptSimilarity(scripts[i].path, scripts[j].path);
      
      if (similarity.similarity > 0.7) { // 70% similarity threshold
        results.similarScripts.push(similarity);
      }
    }
  }
  
  // Generate consolidation suggestions
  generateConsolidationSuggestions();
}

/**
 * Generate suggestions for consolidating scripts
 */
function generateConsolidationSuggestions() {
  // Suggest directory consolidation for script categories
  for (const category in results.scriptsByCategory) {
    const scripts = results.scriptsByCategory[category];
    
    if (scripts.length >= 3) {
      // Check if scripts are distributed across multiple directories
      const directories = new Set();
      scripts.forEach(script => {
        directories.add(path.dirname(script.path));
      });
      
      if (directories.size > 1) {
        // Multiple directories contain scripts of this category
        results.consolidationSuggestions.push({
          type: 'directory',
          category: category,
          scripts: scripts,
          directories: Array.from(directories),
          description: `Create a consolidated '${category}' directory for ${scripts.length} related scripts`
        });
      }
    }
  }
  
  // Suggest exact duplicate removals
  results.exactDuplicates.forEach(duplicate => {
    results.consolidationSuggestions.push({
      type: 'exact-duplicate',
      original: duplicate.original,
      duplicate: duplicate.duplicate,
      description: `Remove exact duplicate: ${duplicate.duplicate}`
    });
  });
  
  // Suggest merging similar scripts
  results.similarScripts.forEach(similar => {
    if (similar.similarity > 0.9) { // Very high similarity
      results.consolidationSuggestions.push({
        type: 'merge-similar',
        file1: similar.file1,
        file2: similar.file2,
        similarity: similar.similarity,
        description: `Merge very similar scripts (${Math.round(similar.similarity * 100)}% match): ${path.basename(similar.file1)} and ${path.basename(similar.file2)}`
      });
    }
  });
}

/**
 * Consolidate scripts based on suggestions
 */
function consolidateScripts() {
  // Handle exact duplicates (safest to auto-consolidate)
  if (autoConsolidate) {
    console.log(`\n${colors.cyan}Auto-consolidating exact duplicates...${colors.reset}`);
    
    for (const duplicate of results.exactDuplicates) {
      console.log(`${colors.yellow}Removing duplicate: ${duplicate.duplicate}${colors.reset}`);
      console.log(`  Original: ${duplicate.original}`);
      
      if (!isDryRun) {
        try {
          fs.unlinkSync(duplicate.duplicate);
          console.log(`${colors.green}✓ Deleted duplicate file${colors.reset}`);
        } catch (err) {
          console.error(`${colors.red}Error deleting file: ${err.message}${colors.reset}`);
        }
      }
    }
  }
  
  // For directory organization, create script to help with more complex moves
  const suggestionsByType = {
    'directory': results.consolidationSuggestions.filter(s => s.type === 'directory'),
    'exact-duplicate': results.consolidationSuggestions.filter(s => s.type === 'exact-duplicate'),
    'merge-similar': results.consolidationSuggestions.filter(s => s.type === 'merge-similar')
  };
  
  if (suggestionsByType.directory.length > 0) {
    console.log(`\n${colors.cyan}Directory consolidation recommendations:${colors.reset}`);
    
    for (const suggestion of suggestionsByType.directory) {
      console.log(`${colors.yellow}${suggestion.description}${colors.reset}`);
      console.log(`  Category: ${suggestion.category}`);
      console.log(`  Scripts: ${suggestion.scripts.length}`);
      console.log(`  Current locations:`);
      suggestion.directories.forEach(dir => {
        console.log(`    - ${dir}`);
      });
      console.log(`  Suggested target: scripts/${suggestion.category}/`);
      console.log('');
    }
  }
  
  if (suggestionsByType['merge-similar'].length > 0) {
    console.log(`\n${colors.cyan}Similar script merge recommendations:${colors.reset}`);
    
    for (const suggestion of suggestionsByType['merge-similar']) {
      console.log(`${colors.yellow}${suggestion.description}${colors.reset}`);
      console.log(`  File 1: ${suggestion.file1}`);
      console.log(`  File 2: ${suggestion.file2}`);
      console.log(`  Similarity: ${Math.round(suggestion.similarity * 100)}%`);
      console.log('');
    }
  }
}

/**
 * Print a report of findings
 */
function printReport() {
  console.log(`\n${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Scripts Directory Analysis${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  
  console.log(`\n${colors.yellow}Scripts by Category${colors.reset}`);
  console.log(`${colors.yellow}=================${colors.reset}`);
  
  for (const category in results.scriptsByCategory) {
    const scripts = results.scriptsByCategory[category];
    if (scripts.length > 0) {
      console.log(`${colors.green}${category} (${scripts.length})${colors.reset}`);
      scripts.forEach(script => {
        console.log(`  - ${script.path}`);
        if (script.description) {
          console.log(`    ${script.description}`);
        }
      });
      console.log('');
    }
  }
  
  console.log(`\n${colors.magenta}Exact Duplicates (${results.exactDuplicates.length})${colors.reset}`);
  console.log(`${colors.magenta}================${colors.reset}`);
  
  if (results.exactDuplicates.length === 0) {
    console.log('No exact duplicates found.');
  } else {
    results.exactDuplicates.forEach(duplicate => {
      console.log(`${colors.red}Duplicate: ${duplicate.duplicate}${colors.reset}`);
      console.log(`  Original: ${duplicate.original}`);
    });
  }
  
  console.log(`\n${colors.blue}Similar Scripts (${results.similarScripts.length})${colors.reset}`);
  console.log(`${colors.blue}===============${colors.reset}`);
  
  if (results.similarScripts.length === 0) {
    console.log('No similar scripts found.');
  } else {
    // Sort by similarity (highest first)
    results.similarScripts
      .sort((a, b) => b.similarity - a.similarity)
      .forEach(similar => {
        console.log(`${colors.yellow}Similarity: ${Math.round(similar.similarity * 100)}%${colors.reset}`);
        console.log(`  Script 1: ${similar.file1}`);
        console.log(`  Script 2: ${similar.file2}`);
        console.log(`  Matching lines: ${similar.matchingLines} of ${Math.min(similar.totalLines1, similar.totalLines2)}`);
        console.log('');
      });
  }
  
  console.log(`\n${colors.cyan}Consolidation Suggestions (${results.consolidationSuggestions.length})${colors.reset}`);
  console.log(`${colors.cyan}=========================${colors.reset}`);
  
  if (results.consolidationSuggestions.length === 0) {
    console.log('No consolidation suggestions.');
  } else {
    results.consolidationSuggestions.forEach(suggestion => {
      console.log(`${colors.green}${suggestion.description}${colors.reset}`);
    });
  }
  
  // Print next steps
  console.log(`\n${colors.cyan}Next Steps${colors.reset}`);
  console.log(`${colors.cyan}==========${colors.reset}`);
  console.log(`1. Review the consolidation suggestions`);
  console.log(`2. Remove exact duplicates (safest to start with)`);
  console.log(`3. Create organized directories for script categories with many scripts`);
  console.log(`4. Carefully merge similar scripts, preserving unique functionality`);
  console.log(`5. Update references to moved scripts`);
  console.log(`6. Document consolidation in unification.md`);
  
  if (isDryRun) {
    console.log(`\n${colors.yellow}This was a dry run. Run without --dry-run to apply changes.${colors.reset}`);
  }
  if (autoConsolidate) {
    console.log(`\n${colors.green}Auto-consolidation was enabled. Exact duplicates were processed.${colors.reset}`);
  }
}

// Main function
function main() {
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Scripts Directory Consolidation Tool${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`Mode: ${isDryRun ? 'Dry run' : 'Live'}`);
  console.log(`Auto-consolidate: ${autoConsolidate ? 'Yes' : 'No'}`);
  
  // Scan scripts directory
  scanScriptsDirectory();
  
  // Consolidate scripts if needed
  if (results.consolidationSuggestions.length > 0) {
    consolidateScripts();
  }
  
  // Print final report
  printReport();
}

// Run the main function
main(); 
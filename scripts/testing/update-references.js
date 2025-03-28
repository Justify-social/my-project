#!/usr/bin/env node

/**
 * Deprecated Component Reference Updater
 * 
 * This script scans the codebase for references to deprecated components
 * and provides suggestions on how to update them to use the unified components.
 * 
 * Usage:
 *   node scripts/cleanup/update-references.js [--fix] [--components=component1,component2]
 * 
 * Options:
 *   --fix               Automatically apply suggested fixes when possible
 *   --dry-run           Show what would be changed without modifying files
 *   --components=<list> Comma-separated list of specific component patterns to check
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

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
const shouldFix = args.includes('--fix');
const isDryRun = args.includes('--dry-run');
const componentsArg = args.find(arg => arg.startsWith('--components='));
const targetComponents = componentsArg 
  ? componentsArg.replace('--components=', '').split(',')
  : [];

// Directories to ignore
const ignoreDirectories = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.vercel',
  '.github',
  '.husky',
  '.vscode',
  '.idea'
];

// File extensions to check
const checkExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.vue'
];

// Deprecated component mappings
// Format: { pattern: /regex-to-match/, replacement: 'new-import-path', component: 'ComponentName' }
const deprecatedComponentMappings = [
  // Icon-related components
  { 
    pattern: /from ['"]\.\.\/\.\.\/components\/ui\/icon['"]/, 
    replacement: "from '../../components/ui/icons'",
    component: 'Icon' 
  },
  { 
    pattern: /from ['"]\.\.\/\.\.\/components\/ui\/icon-wrapper['"]/, 
    replacement: "from '../../components/ui/icons'",
    component: 'IconWrapper' 
  },
  { 
    pattern: /from ['"]\.\.\/\.\.\/components\/ui\/custom-icon-display['"]/, 
    replacement: "from '../../components/ui/icons/examples'",
    component: 'CustomIconDisplay' 
  },
  { 
    pattern: /from ['"]\.\.\/\.\.\/components\/ui\/safe-icon['"]/, 
    replacement: "from '../../components/ui/icons/core'",
    component: 'SafeIcon' 
  },
  // Spinner-related components
  { 
    pattern: /from ['"]\.\.\/\.\.\/components\/ui\/loading-spinner['"]/, 
    replacement: "from '../../components/ui/spinner'",
    component: 'LoadingSpinner' 
  },
  { 
    pattern: /from ['"]\.\.\/\.\.\/components\/ui\/loading-skeleton\/spinners['"]/, 
    replacement: "from '../../components/ui/spinner'",
    component: 'Spinner' 
  },
  // Direct imports from FontAwesome
  { 
    pattern: /@fortawesome\/fontawesome-svg-core/,
    replacement: "../../components/ui/icons",
    component: 'FontAwesome Core'
  },
  { 
    pattern: /@fortawesome\/pro-solid-svg-icons/,
    replacement: "../../components/ui/icons",
    component: 'FontAwesome Solid'
  },
  { 
    pattern: /@fortawesome\/pro-light-svg-icons/,
    replacement: "../../components/ui/icons",
    component: 'FontAwesome Light'
  },
  { 
    pattern: /@fortawesome\/free-brands-svg-icons/,
    replacement: "../../components/ui/icons",
    component: 'FontAwesome Brands'
  },
  { 
    pattern: /@fortawesome\/react-fontawesome/,
    replacement: "../../components/ui/icons",
    component: 'FontAwesomeIcon'
  }
];

// Specific component usage patterns
const componentUsagePatterns = [
  { 
    pattern: /<FontAwesomeIcon/g, 
    replacement: '<Icon', 
    component: 'FontAwesomeIcon' 
  },
  { 
    pattern: /<LoadingSpinner/g, 
    replacement: '<Spinner', 
    component: 'LoadingSpinner' 
  }
];

// Statistics
const stats = {
  filesChecked: 0,
  filesWithIssues: 0,
  issuesFound: 0,
  issuesFixed: 0,
  errors: 0
};

/**
 * Checks if a directory should be ignored
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} True if the directory should be ignored
 */
function shouldIgnoreDirectory(dirPath) {
  const dirName = path.basename(dirPath);
  return ignoreDirectories.includes(dirName);
}

/**
 * Checks if a file should be processed
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if the file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return checkExtensions.includes(ext);
}

/**
 * Updates references to deprecated components in a file
 * @param {string} filePath - Path to the file
 */
function updateReferencesInFile(filePath) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasIssues = false;
    let issuesFixed = 0;
    
    // Check for deprecated import patterns
    for (const mapping of deprecatedComponentMappings) {
      // Skip if we're targeting specific components and this isn't one of them
      if (targetComponents.length > 0 && !targetComponents.includes(mapping.component)) {
        continue;
      }
      
      if (mapping.pattern.test(content)) {
        console.log(`${colors.yellow}Found deprecated import in ${filePath}${colors.reset}`);
        console.log(`  Component: ${colors.magenta}${mapping.component}${colors.reset}`);
        console.log(`  Suggestion: Replace with import from ${colors.green}${mapping.replacement}${colors.reset}`);
        
        stats.issuesFound++;
        hasIssues = true;
        
        if (shouldFix && !isDryRun) {
          newContent = newContent.replace(mapping.pattern, mapping.replacement);
          issuesFixed++;
          stats.issuesFixed++;
        }
      }
    }
    
    // Check for deprecated component usage patterns
    for (const pattern of componentUsagePatterns) {
      // Skip if we're targeting specific components and this isn't one of them
      if (targetComponents.length > 0 && !targetComponents.includes(pattern.component)) {
        continue;
      }
      
      const matches = content.match(pattern.pattern);
      if (matches) {
        console.log(`${colors.yellow}Found deprecated component usage in ${filePath}${colors.reset}`);
        console.log(`  Component: ${colors.magenta}${pattern.component}${colors.reset}`);
        console.log(`  Occurrences: ${matches.length}`);
        console.log(`  Suggestion: Replace with ${colors.green}${pattern.replacement}${colors.reset}`);
        
        stats.issuesFound += matches.length;
        hasIssues = true;
        
        if (shouldFix && !isDryRun) {
          newContent = newContent.replace(pattern.pattern, pattern.replacement);
          issuesFixed += matches.length;
          stats.issuesFixed += matches.length;
        }
      }
    }
    
    // Write updated content if needed
    if (hasIssues) {
      stats.filesWithIssues++;
      
      if (shouldFix && !isDryRun && content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`${colors.green}✓ Updated file: ${filePath} (Fixed ${issuesFixed} issues)${colors.reset}`);
      } else if (shouldFix && isDryRun) {
        console.log(`${colors.blue}Would update file: ${filePath} (Would fix ${issuesFixed} issues)${colors.reset}`);
      } else {
        console.log(`${colors.blue}File needs manual updates: ${filePath}${colors.reset}`);
      }
      
      console.log(''); // Add a blank line for readability
    }
  } catch (err) {
    console.error(`${colors.red}Error processing file ${filePath}: ${err.message}${colors.reset}`);
    stats.errors++;
  }
}

/**
 * Recursively scans a directory for files to update
 * @param {string} dirPath - Directory to scan
 */
function scanDirectory(dirPath) {
  try {
    // Check if directory should be ignored
    if (shouldIgnoreDirectory(dirPath)) {
      return;
    }
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      
      try {
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          scanDirectory(itemPath);
        } else if (stats.isFile() && shouldProcessFile(itemPath)) {
          // Update references in file
          stats.filesChecked++;
          updateReferencesInFile(itemPath);
        }
      } catch (err) {
        console.error(`${colors.red}Error processing ${itemPath}: ${err.message}${colors.reset}`);
      }
    }
  } catch (err) {
    console.error(`${colors.red}Error scanning directory ${dirPath}: ${err.message}${colors.reset}`);
  }
}

/**
 * Uses grep to quickly find files with potential issues
 * @returns {string[]} Array of file paths with potential issues
 */
function findPotentialIssuesWithGrep() {
  const patterns = [];
  
  // Build list of grep patterns
  for (const mapping of deprecatedComponentMappings) {
    if (targetComponents.length === 0 || targetComponents.includes(mapping.component)) {
      const pattern = mapping.pattern.toString().replace(/\//g, '').replace(/\\/g, '');
      patterns.push(pattern);
    }
  }
  
  for (const pattern of componentUsagePatterns) {
    if (targetComponents.length === 0 || targetComponents.includes(pattern.component)) {
      const patternStr = pattern.pattern.toString().replace(/\//g, '').replace(/\\/g, '').replace(/g$/, '');
      patterns.push(patternStr);
    }
  }
  
  if (patterns.length === 0) {
    return [];
  }
  
  // Build grep command
  const grepPattern = patterns.join('|');
  const extensions = checkExtensions.join(',');
  const ignorePattern = ignoreDirectories.map(dir => `--exclude-dir=${dir}`).join(' ');
  
  const command = `grep -l -r -E "${grepPattern}" --include="*{${extensions}}" ${ignorePattern} .`;
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return result.trim().split('\n').filter(Boolean);
  } catch (err) {
    // grep returns exit code 1 if no matches found, which throws an error
    if (err.status === 1) {
      return [];
    }
    console.error(`${colors.red}Error running grep: ${err.message}${colors.reset}`);
    return [];
  }
}

/**
 * Prints a summary of the update operation
 */
function printSummary() {
  console.log(`\n${colors.cyan}Update Summary${colors.reset}`);
  console.log(`${colors.cyan}================================${colors.reset}`);
  console.log(`Files checked: ${stats.filesChecked}`);
  console.log(`Files with deprecated references: ${stats.filesWithIssues}`);
  console.log(`Total issues found: ${stats.issuesFound}`);
  
  if (shouldFix) {
    console.log(`Issues fixed: ${stats.issuesFixed}`);
  }
  
  console.log(`Errors encountered: ${stats.errors}`);
  
  if (isDryRun) {
    console.log(`\n${colors.yellow}This was a dry run. No files were actually updated.${colors.reset}`);
    console.log(`To actually update the files, run with --fix without --dry-run.`);
  } else if (!shouldFix) {
    console.log(`\n${colors.yellow}This was a scan only. No files were updated.${colors.reset}`);
    console.log(`To automatically update files, run with the --fix flag.`);
  } else {
    console.log(`\n${colors.green}Update complete!${colors.reset}`);
  }
  
  console.log(`\n${colors.magenta}Next Steps${colors.reset}`);
  console.log(`1. Update unification.md with the reference update results`);
  console.log(`2. Run a build to ensure everything still works correctly`);
  console.log(`3. Manually review any files that couldn't be automatically updated`);
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Deprecated Component Reference Updater${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  
  console.log(`Mode: ${isDryRun ? 'Dry run' : (shouldFix ? 'Fix' : 'Scan')}`);
  
  if (targetComponents.length > 0) {
    console.log(`Target components: ${targetComponents.join(', ')}`);
  } else {
    console.log(`Target components: All`);
  }
  
  console.log(`\n${colors.blue}Searching for files with deprecated references...${colors.reset}`);
  
  // Use grep to find potential issues quickly
  const filesToCheck = findPotentialIssuesWithGrep();
  
  if (filesToCheck.length === 0) {
    console.log(`${colors.green}No files with deprecated references found.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}Found ${filesToCheck.length} files with potential issues${colors.reset}`);
  
  // Process each file
  for (const filePath of filesToCheck) {
    stats.filesChecked++;
    updateReferencesInFile(filePath);
  }
  
  // Print summary
  printSummary();
}

// Run the main function
main(); 
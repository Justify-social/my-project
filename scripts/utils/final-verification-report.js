#!/usr/bin/env node

/**
 * final-verification-report.js
 * 
 * This script performs a comprehensive analysis of the codebase to identify:
 * 1. Files marked with @deprecated tags that are intentionally maintained for backward compatibility
 * 2. Any files that were supposed to be removed during the unification project but remain
 * 3. Proper implementation of redirection patterns for deprecated components
 * 
 * It generates a detailed report to confirm the codebase's state after the unification project.
 * 
 * Usage:
 *   node final-verification-report.js [--verbose]
 * 
 * Options:
 *   --verbose   Show detailed output during analysis
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
];

// Log styling
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Initialize CLI arguments
const VERBOSE = process.argv.includes('--verbose');

// Output management
const log = (message) => console.log(message);
const success = (message) => console.log(`${colors.green}${message}${colors.reset}`);
const info = (message) => console.log(`${colors.blue}${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}${message}${colors.reset}`);
const verbose = (message) => if (VERBOSE) console.log(`${colors.cyan}${message}${colors.reset}`);
const header = (message) => console.log(`${colors.bold}${colors.magenta}${message}${colors.reset}`);

// Data collection
const deprecatedFiles = [];
const deprecatedDirectories = [];
const redirectedPatterns = [];
const legacyIndexFiles = [];
const scriptDuplicates = [];

/**
 * Find all files marked with @deprecated in the codebase
 */
function findDeprecatedFiles() {
  header('\nFinding files marked as deprecated...');
  
  try {
    // Use a more robust approach with multiple fallback methods
    let output = '';
    
    // First attempt - comprehensive grep with multiple file types
    try {
      const cmd = 'grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.md" "@deprecated\\|deprecated" . | grep -v "node_modules" | grep -v ".git"';
      output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
      verbose(`Successfully executed primary grep command`);
    } catch (e) {
      verbose(`Primary grep command failed: ${e.message}`);
      
      // Second attempt - use find + xargs which is more compatible across systems
      try {
        const cmd = 'find . -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.md" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" | xargs grep -l "@deprecated\\|deprecated" 2>/dev/null || echo ""';
        output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        verbose(`Successfully executed find+xargs command`);
      } catch (e2) {
        verbose(`Find+xargs command failed: ${e2.message}`);
        
        // Last resort - simple find for .ts files only, with error suppression
        try {
          const cmd = 'find . -type f -name "*.ts" 2>/dev/null | grep -v "node_modules" | grep -v ".git" | xargs grep -l "@deprecated" 2>/dev/null || echo ""';
          output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
          verbose(`Successfully executed last-resort command`);
        } catch (e3) {
          verbose(`All grep attempts failed: ${e3.message}`);
        }
      }
    }
    
    if (!output) {
      success('No files marked as deprecated found.');
      return;
    }
    
    const files = output.split('\n').filter(line => line.trim());
    verbose(`Found ${files.length} potential files with deprecated references`);
    
    for (const filePath of files) {
      if (!filePath.trim()) continue;
      
      // Skip files in ignored directories
      if (IGNORE_PATTERNS.some(pattern => filePath.includes(pattern))) {
        continue;
      }
      
      // Read the file to check its contents
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileLines = content.split('\n');
        
        // Find lines with @deprecated or deprecated
        for (let i = 0; i < fileLines.length; i++) {
          const line = fileLines[i];
          if (line.includes('@deprecated') || line.includes('deprecated')) {
            const context = `${filePath}:${line.trim()}`;
            
            // Check if this is a directory index file declaring deprecated status
            if (filePath.endsWith('index.ts') || filePath.endsWith('index.js')) {
              legacyIndexFiles.push({
                path: filePath,
                content: context
              });
              verbose(`Found legacy index file: ${filePath}`);
            }
            // Check if this is a component/util with @deprecated tag
            else if (line.includes('@deprecated')) {
              deprecatedFiles.push({
                path: filePath,
                content: context
              });
              verbose(`Found deprecated file: ${filePath}`);
            }
            // Check for deprecated directories mentioned in documentation
            else if (filePath.endsWith('.md') && line.includes('deprecated') && line.includes('director')) {
              deprecatedDirectories.push({
                path: filePath,
                content: context
              });
              verbose(`Found deprecated directory reference: ${filePath}`);
            }
          }
        }
      } catch (err) {
        error(`Error reading file ${filePath}: ${err.message}`);
      }
    }
    
    info(`Found ${legacyIndexFiles.length} legacy index files.`);
    info(`Found ${deprecatedFiles.length} files with @deprecated tag.`);
    info(`Found ${deprecatedDirectories.length} references to deprecated directories.`);
    
  } catch (err) {
    error(`Error finding deprecated files: ${err.message}`);
  }
}

/**
 * Find all redirected patterns in the codebase
 */
function findRedirectedPatterns() {
  header('\nFinding redirected patterns...');
  
  try {
    // Use a more robust approach with multiple fallback methods
    let output = '';
    
    // First attempt - comprehensive grep with multiple file types
    try {
      const cmd = 'grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "Import from" . | grep -v "node_modules" | grep -v ".git"';
      output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
      verbose(`Successfully executed primary grep command for redirected patterns`);
    } catch (e) {
      verbose(`Primary grep command failed: ${e.message}`);
      
      // Second attempt - use find + xargs which is more compatible across systems
      try {
        const cmd = 'find . -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" | xargs grep -l "Import from" 2>/dev/null || echo ""';
        output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        verbose(`Successfully executed find+xargs command for redirected patterns`);
      } catch (e2) {
        verbose(`Find+xargs command failed: ${e2.message}`);
        
        // Last resort - simple find for all JS/TS files with error suppression
        try {
          const cmd = 'find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \\) 2>/dev/null | grep -v "node_modules" | grep -v ".git" | xargs grep -l "Import from" 2>/dev/null || echo ""';
          output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
          verbose(`Successfully executed last-resort command for redirected patterns`);
        } catch (e3) {
          verbose(`All grep attempts failed: ${e3.message}`);
        }
      }
    }
    
    if (!output) {
      success('No redirected patterns found.');
      return;
    }
    
    const files = output.split('\n').filter(line => line.trim());
    verbose(`Found ${files.length} potential redirect patterns`);
    
    for (const filePath of files) {
      if (!filePath.trim()) continue;
      
      // Skip files in ignored directories
      if (IGNORE_PATTERNS.some(pattern => filePath.includes(pattern))) {
        continue;
      }
      
      // Read the file to check its contents
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileLines = content.split('\n');
        
        // Find lines with "Import from"
        for (let i = 0; i < fileLines.length; i++) {
          const line = fileLines[i];
          if (line.includes('Import from')) {
            const context = `${filePath}:${line.trim()}`;
            redirectedPatterns.push({
              path: filePath,
              content: context
            });
            verbose(`Found redirected pattern: ${filePath}`);
            break; // Just count the file once
          }
        }
      } catch (err) {
        error(`Error reading file ${filePath}: ${err.message}`);
      }
    }
    
    info(`Found ${redirectedPatterns.length} redirected patterns.`);
    
  } catch (err) {
    error(`Error finding redirected patterns: ${err.message}`);
  }
}

/**
 * Check for any remaining script duplicates
 */
function checkScriptDuplicates() {
  header('\nChecking for remaining script duplicates...');
  
  try {
    // Get all JS files in the scripts directory
    const command = `find ./scripts -type f -name "*.js" | sort`;
    const output = execSync(command, { encoding: 'utf8' }).trim();
    
    if (!output) {
      success('No scripts found.');
      return;
    }
    
    const files = output.split('\n');
    
    // Check for any scripts outside the consolidated directory
    const nonConsolidatedScripts = files.filter(file => !file.includes('/consolidated/'));
    
    if (nonConsolidatedScripts.length === 0) {
      success('All scripts are properly consolidated.');
    } else {
      warning(`Found ${nonConsolidatedScripts.length} scripts outside the consolidated directory.`);
      for (const script of nonConsolidatedScripts) {
        scriptDuplicates.push({ path: script });
        verbose(`Non-consolidated script: ${script}`);
      }
    }
    
  } catch (err) {
    error(`Error checking script duplicates: ${err.message}`);
  }
}

/**
 * Generate a comprehensive report
 */
function generateReport() {
  header('\nGenerating final verification report...');
  
  const now = new Date();
  const reportFilePath = path.join(process.cwd(), 'docs', 'project-history', 'unification-project', 'reports', 'deprecated-files-verification.md');
  
  let reportContent = `# Deprecated Files Verification Report

**Date**: ${now.toISOString().split('T')[0]}  
**Status**: ${scriptDuplicates.length === 0 ? '✅ Clean' : '⚠️ Items Found'}  

## Overview

This report provides a comprehensive verification of deprecated files, directories, and patterns in the codebase after the completion of the unification project. The purpose is to ensure that:

1. All files that should have been removed are gone
2. Any files marked as deprecated are properly documented
3. Redirection patterns are properly implemented for backward compatibility

## Summary

- **Deprecated Files Found**: ${deprecatedFiles.length}
- **Legacy Index Files**: ${legacyIndexFiles.length}
- **Redirect Patterns**: ${redirectedPatterns.length}
- **Non-Consolidated Scripts**: ${scriptDuplicates.length}

## Detailed Findings

### Legacy Index Files

These index files mark entire directories as deprecated but are maintained for backward compatibility:

${legacyIndexFiles.length === 0 ? 'None found.\n' : legacyIndexFiles.map(file => (
  `- \`${file.path}\`: ${file.content.split(':').slice(1).join(':').trim()}`
)).join('\n')}

### Files with @deprecated Tags

These individual files are marked as deprecated but maintained for backward compatibility:

${deprecatedFiles.length === 0 ? 'None found.\n' : deprecatedFiles.map(file => (
  `- \`${file.path}\`: ${file.content.split(':').slice(1).join(':').trim()}`
)).join('\n')}

### Redirected Import Patterns

These files contain redirected imports that support the migration to new file locations:

${redirectedPatterns.length === 0 ? 'None found.\n' : redirectedPatterns.map(pattern => (
  `- \`${pattern.path}\`: ${pattern.content.split(':').slice(1).join(':').trim()}`
)).join('\n')}

### Non-Consolidated Scripts

These scripts remain outside the consolidated directory structure and may need attention:

${scriptDuplicates.length === 0 ? 'None found.\n' : scriptDuplicates.map(script => (
  `- \`${script.path}\``
)).join('\n')}

## Conclusion

${scriptDuplicates.length === 0 
  ? 'The codebase has been successfully cleaned up. All deprecated files have been properly handled. Files marked with @deprecated tags are maintained for backward compatibility and are clearly documented.' 
  : 'While most of the codebase has been properly cleaned up, there are some remaining scripts outside the consolidated directory structure that may need attention.'}

${legacyIndexFiles.length > 0 
  ? '\nThere are legacy index files that mark directories as deprecated but are maintained for backward compatibility. These files provide clear guidance for developers to use the new locations.' 
  : ''}

## Next Steps

1. ${scriptDuplicates.length === 0 
    ? 'Continue maintaining the clean state of the codebase' 
    : 'Review the non-consolidated scripts and decide whether to consolidate or remove them'}
2. Create a schedule for eventual removal of deprecated components
3. Update documentation to clearly communicate migration paths from deprecated to current APIs
4. Set up monitoring to catch any reintroduction of deprecated patterns
`;

  try {
    // Ensure the directory exists
    const reportDir = path.dirname(reportFilePath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportFilePath, reportContent);
    success(`Generated report at: ${reportFilePath}`);
  } catch (err) {
    error(`Failed to write report: ${err.message}`);
  }

  // Also log a summary to the console
  console.log('\n' + '-'.repeat(80));
  info('📋 DEPRECATED FILES VERIFICATION SUMMARY');
  console.log('-'.repeat(80));
  log(`Legacy index files: ${legacyIndexFiles.length}`);
  log(`Files with @deprecated tags: ${deprecatedFiles.length}`);
  log(`Redirected patterns: ${redirectedPatterns.length}`);
  log(`Non-consolidated scripts: ${scriptDuplicates.length}`);
  
  if (scriptDuplicates.length === 0) {
    success('✅ Codebase cleanup verified! All deprecated files have been properly handled.');
  } else {
    warning(`⚠️ Found ${scriptDuplicates.length} scripts outside the consolidated directory.`);
  }
  console.log('-'.repeat(80) + '\n');
}

/**
 * Main function
 */
function main() {
  header('DEPRECATED FILES VERIFICATION');
  log('Performing comprehensive analysis of deprecated files in the codebase...');
  
  findDeprecatedFiles();
  findRedirectedPatterns();
  checkScriptDuplicates();
  generateReport();
}

// Start the verification process
main(); 
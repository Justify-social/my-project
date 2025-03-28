#!/usr/bin/env node

/**
 * Fix Unused Expressions Script
 * 
 * This script finds and fixes unused expressions in the codebase.
 * Common patterns replaced:
 * - condition && doSomething() -> if (condition) doSomething()
 * - onClick={() => condition && doSomething()} -> onClick={() => condition && doSomething()}
 * 
 * Usage: node scripts/consolidated/linting/fix-unused-expressions.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const CODEBASE_ROOT = path.resolve(__dirname, '../../..');
const FILE_PATTERNS = ['**/*.tsx', '**/*.jsx', '**/*.ts', '**/*.js'];
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run')
};

// Color formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logging utility
function log(message, type = 'info') {
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    fix: `${colors.magenta}[FIX]${colors.reset}`,
    dryRun: `${colors.cyan}[DRY-RUN]${colors.reset}`
  }[type];
  
  console.log(`${prefix} ${message}`);
}

// Find files with unused expression eslint errors
function findFilesWithUnusedExpressions() {
  log('Finding files with unused expressions...');
  
  try {
    // Run ESLint to find unused expressions
    const cmd = `npx eslint --config eslint.config.mjs --format json ${FILE_PATTERNS.join(' ')} --rule 'no-unused-expressions: error'`;
    
    let eslintOutput;
    try {
      eslintOutput = execSync(cmd, { encoding: 'utf8', cwd: CODEBASE_ROOT });
    } catch (error) {
      // ESLint will return non-zero exit code if it finds issues
      eslintOutput = error.stdout;
    }
    
    const results = JSON.parse(eslintOutput);
    
    // Filter for files with unused expression errors
    const filesWithIssues = results
      .filter(result => result.messages.some(msg => 
        msg.ruleId === 'no-unused-expressions' || 
        msg.ruleId === '@typescript-eslint/no-unused-expressions'
      ))
      .map(result => ({
        filePath: result.filePath,
        issues: result.messages.filter(msg => 
          msg.ruleId === 'no-unused-expressions' || 
          msg.ruleId === '@typescript-eslint/no-unused-expressions'
        )
      }));
    
    log(`Found ${filesWithIssues.length} files with unused expression issues.`);
    return filesWithIssues;
  } catch (error) {
    log(`Error finding files with unused expressions: ${error.message}`, 'error');
    return [];
  }
}

// Fix unused expressions in a file
function fixUnusedExpressions(file, issues) {
  if (!fs.existsSync(file.filePath)) {
    log(`File not found: ${file.filePath}`, 'error');
    return false;
  }
  
  log(`Processing ${file.filePath}...`);
  
  try {
    const content = fs.readFileSync(file.filePath, 'utf8');
    let modified = false;
    let fixCount = 0;
    
    // Get file lines
    const lines = content.split('\n');
    
    // Process each issue
    for (const issue of issues) {
      const line = lines[issue.line - 1];
      
      // Skip if line is not found
      if (!line) continue;
      
      // Handle different unused expression patterns
      // 1. Handle logical expressions in JSX onClick handlers
      const onClickRegex = /(onClick={[^}]*\(\)\s*=>\s*)([^{}.()]+)(\s*&&\s*)([^}]+\([^}]*\))/g;
      const jsxMatches = [...line.matchAll(onClickRegex)];
      
      if (jsxMatches.length > 0) {
        for (const match of jsxMatches) {
          const [fullMatch, prefix, condition, logicalOp, action] = match;
          const replacement = `${prefix}${condition} && ${action}`;
          
          // Replace in line
          lines[issue.line - 1] = line.replace(fullMatch, replacement);
          
          if (options.dryRun) {
            log(`Would fix: ${fullMatch} -> ${replacement}`, 'dryRun');
          } else {
            log(`Fixed onClick handler: ${fullMatch} -> ${replacement}`, 'fix');
            fixCount++;
            modified = true;
          }
        }
        continue;
      }
      
      // 2. Handle regular logical expressions
      const logicalExprRegex = /([^;=(){}\s]+)\s*&&\s*([^;()]+\([^;]*\))/g;
      const logicalMatches = [...line.matchAll(logicalExprRegex)];
      
      if (logicalMatches.length > 0) {
        for (const match of logicalMatches) {
          const [fullMatch, condition, action] = match;
          
          // Check if in JSX context (opening angle bracket)
          const jsxContext = line.substring(0, match.index).includes('<');
          
          // Different replacements based on context
          let replacement;
          if (jsxContext) {
            // Keep the logical expression pattern in JSX context
            replacement = fullMatch;
          } else {
            // Convert to if statement in regular code
            replacement = `if (${condition}) ${action}`;
          }
          
          if (replacement !== fullMatch) {
            // Replace in line
            lines[issue.line - 1] = line.replace(fullMatch, replacement);
            
            if (options.dryRun) {
              log(`Would fix: ${fullMatch} -> ${replacement}`, 'dryRun');
            } else {
              log(`Fixed logical expression: ${fullMatch} -> ${replacement}`, 'fix');
              fixCount++;
              modified = true;
            }
          }
        }
        continue;
      }
    }
    
    // Write changes back to file
    if (modified && !options.dryRun) {
      fs.writeFileSync(file.filePath, lines.join('\n'), 'utf8');
      log(`Fixed ${fixCount} unused expressions in ${file.filePath}`, 'success');
      return true;
    } else if (options.dryRun && fixCount > 0) {
      log(`Would fix ${fixCount} unused expressions in ${file.filePath}`, 'dryRun');
      return true;
    }
    
    return false;
  } catch (error) {
    log(`Error fixing unused expressions in ${file.filePath}: ${error.message}`, 'error');
    return false;
  }
}

// Main execution
function main() {
  log('Starting unused expressions fix script...');
  log(`Mode: ${options.dryRun ? 'Dry run' : 'Fix'}`);
  
  // Find files with unused expressions
  const filesWithIssues = findFilesWithUnusedExpressions();
  
  // Attempt to fix each file
  let fixedCount = 0;
  
  for (const file of filesWithIssues) {
    if (fixUnusedExpressions(file, file.issues)) {
      fixedCount++;
    }
  }
  
  // Final report
  if (options.dryRun) {
    log(`Dry run completed. Would fix unused expressions in ${fixedCount} files.`, 'dryRun');
  } else {
    log(`Fixed unused expressions in ${fixedCount}/${filesWithIssues.length} files.`, 'success');
    
    if (fixedCount > 0) {
      log('Run ESLint to verify fixes: npx eslint --config eslint.config.mjs .', 'info');
    }
  }
}

// Execute main function
main(); 
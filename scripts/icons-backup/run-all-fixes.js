#!/usr/bin/env node

/**
 * Run All Circular Dependency Fixes
 * 
 * This script runs all the circular dependency fix scripts in sequence.
 * It provides a convenient way to apply all fixes with a single command.
 */

import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');

// Script paths
const SCRIPTS_DIR = __dirname;
const SCRIPTS = [
  'icon-circular-dep-fix.js',
  'icon-grid-circular-dep-fix.js',
  'examples-circular-dep-fix.js'
];

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Stats for tracking
const stats = {
  totalScripts: SCRIPTS.length,
  successfulScripts: 0,
  failedScripts: 0
};

/**
 * Runs a single script
 * @param {string} scriptName - Name of the script to run
 * @returns {boolean} - Whether the script was successful
 */
function runScript(scriptName) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  console.log(`\n${colors.cyan}=== Running ${scriptName} ===${colors.reset}`);
  
  try {
    // Execute the script with the dry run flag if specified
    const command = `node ${scriptPath}${DRY_RUN ? ' --dry-run' : ''}`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`${colors.green}✓ Successfully ran ${scriptName}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✖ Error running ${scriptName}: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Main function to execute all scripts
 */
function main() {
  console.log(`${colors.cyan}=== Running All Circular Dependency Fixes ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Run each script in sequence
  for (const script of SCRIPTS) {
    const success = runScript(script);
    if (success) {
      stats.successfulScripts++;
    } else {
      stats.failedScripts++;
    }
  }
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.blue}Total scripts:${colors.reset} ${stats.totalScripts}`);
  console.log(`${colors.green}Successful scripts:${colors.reset} ${stats.successfulScripts}`);
  console.log(`${colors.red}Failed scripts:${colors.reset} ${stats.failedScripts}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  } else if (stats.failedScripts === 0) {
    console.log(`\n${colors.green}All circular dependency fixes have been successfully applied!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}Some circular dependency fixes failed. Check the logs for details.${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main(); 
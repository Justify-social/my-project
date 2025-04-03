#!/usr/bin/env node

/**
 * Master Toolkit - Unified Script Interface
 * 
 * This script provides a single entry point for all script functionality across the project.
 * It coordinates the execution of specialized scripts in each category, presenting a unified interface.
 * 
 * Usage:
 *   node scripts/master/master-toolkit.mjs <category> <command> [options]
 * 
 * Categories:
 *   icons        - Icon management tools
 *   ui           - UI component management tools
 *   config       - Configuration management tools
 *   docs         - Documentation tools
 *   cleanup      - Cleanup and maintenance tools
 *   linting      - Code quality tools
 *   db           - Database tools
 * 
 * Example:
 *   node scripts/master/master-toolkit.mjs icons audit
 *   node scripts/master/master-toolkit.mjs config organize
 */

import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get the directory name of the current module
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '../..');

// Define script categories and their commands
const categories = {
  icons: {
    audit: 'icons/audit-icons.mjs',
    download: 'icons/download-icons.mjs',
    convert: 'icons/convert-fontawesome.mjs',
    help: '',
  },
  ui: {
    'validate-paths': 'ui/validate-component-paths.mjs',
    'analyze-usage': 'ui/analyze-component-usage.cjs',
    backup: 'ui/backup-ui-components.js',
    'cleanup-backups': 'ui/cleanup-backups.mjs',
    help: '',
  },
  config: {
    organize: 'config/config-organizer.mjs',
    migrate: 'config/migrate-config.mjs',
    help: '',
  },
  docs: {
    update: 'docs/update-docs.mjs',
    generate: 'docs/generate-docs.mjs',
    help: '',
  },
  cleanup: {
    scripts: 'cleanup/cleanup-scripts.mjs',
    'import-paths': 'cleanup/update-import-paths.mjs',
    'find-backups': 'cleanup/find-backups.mjs',
    'tree-shake': 'cleanup/tree-shake.mjs',
    help: '',
  },
  linting: {
    fix: 'linting/fix-linter-issues.mjs',
    plan: 'linting/generate-lint-plan.mjs',
    help: '',
  },
  db: {
    migrate: 'db/migrate-db.mjs',
    seed: 'db/seed-db.mjs',
    help: '',
  },
  help: '',
};

// Command handlers for ui category
const uiCommands = {
  // ... existing ui commands ...
  
  // Component registry management command
  'registry': async (args) => {
    const subCommand = args[0] || 'help';
    
    switch (subCommand) {
      case 'generate':
        await runScriptWithArgs('config/ui/component-registry-manager.mjs', ['generate']);
        break;
      case 'validate':
        await runScriptWithArgs('config/ui/component-registry-manager.mjs', ['validate']);
        break;
      case 'cleanup':
        await runScriptWithArgs('config/ui/component-registry-manager.mjs', ['cleanup']);
        break;
      case 'help':
      default:
        console.log(`
${chalk.bold(chalk.cyan('UI Component Registry Management'))}

Commands:
  ${chalk.green('generate')}  - Generate the runtime component registry
  ${chalk.green('validate')}  - Validate components against the registry
  ${chalk.green('cleanup')}   - Clean up deprecated registry files

Example:
  ${chalk.yellow('node scripts/master/master-toolkit.mjs ui registry generate')}
  ${chalk.yellow('node scripts/master/master-toolkit.mjs ui registry cleanup')}
`);
        break;
    }
  },
  
  // Help command for ui category
  'help': async () => {
    console.log(`
${chalk.bold(chalk.cyan('UI Component Management'))}

Commands:
  ${chalk.green('analyze')}   - Analyze UI component usage
  ${chalk.green('validate')}  - Validate UI component paths
  ${chalk.green('registry')}  - Manage component registries
  ${chalk.green('shadcn')}    - Manage shadcn UI components
  ${chalk.green('help')}      - Show this help message

Example:
  ${chalk.yellow('node scripts/master/master-toolkit.mjs ui analyze')}
  ${chalk.yellow('node scripts/master/master-toolkit.mjs ui registry generate')}
`);
  }
};

/**
 * Display help information for the master toolkit
 */
function showHelp(category = null) {
  if (!category) {
    console.log(`
Master Toolkit - Unified Script Interface

Usage:
  node scripts/master/master-toolkit.mjs <category> <command> [options]

Categories:
  icons        - Icon management tools
  ui           - UI component management tools
  config       - Configuration management tools
  docs         - Documentation tools
  cleanup      - Cleanup and maintenance tools
  linting      - Code quality tools
  db           - Database tools
  help         - Show this help message

For detailed help on a specific category:
  node scripts/master/master-toolkit.mjs <category> help
`);
  } else if (categories[category]) {
    console.log(`
${category.toUpperCase()} Category Commands:

Usage:
  node scripts/master/master-toolkit.mjs ${category} <command> [options]

Available Commands:`);
    
    Object.keys(categories[category]).forEach(cmd => {
      if (cmd !== 'help') {
        console.log(`  ${cmd}`);
      }
    });
    
    console.log(`
For help with a specific command:
  node scripts/master/master-toolkit.mjs ${category} <command> --help
`);
  } else {
    console.log(`Unknown category: ${category}`);
    console.log(`Run 'node scripts/master/master-toolkit.mjs help' for a list of valid categories.`);
  }
  
  process.exit(0);
}

/**
 * Execute a script with the provided arguments
 */
function executeScript(scriptPath, args) {
  const fullPath = join(rootDir, 'scripts', scriptPath);
  
  if (!existsSync(fullPath)) {
    console.error(`Error: Script not found at ${fullPath}`);
    process.exit(1);
  }
  
  // Determine the interpreter based on file extension
  let interpreter = 'node';
  if (fullPath.endsWith('.sh')) {
    interpreter = 'bash';
  }
  
  // Execute the script
  const child = spawn(interpreter, [fullPath, ...args], {
    stdio: 'inherit',
    cwd: rootDir,
  });
  
  // Handle exit
  child.on('exit', (code) => {
    process.exit(code);
  });
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  // Show help if no arguments or explicit help request
  if (args.length === 0 || args[0] === 'help') {
    showHelp(args[1]);
    return;
  }
  
  const category = args[0];
  const command = args[1] || 'help';
  const scriptArgs = args.slice(2);
  
  // Validate category
  if (!categories[category]) {
    console.error(`Error: Unknown category '${category}'`);
    showHelp();
    return;
  }
  
  // Show category help
  if (command === 'help') {
    showHelp(category);
    return;
  }
  
  // Validate command
  if (!categories[category][command]) {
    console.error(`Error: Unknown command '${command}' for category '${category}'`);
    showHelp(category);
    return;
  }
  
  // Execute the command
  executeScript(categories[category][command], scriptArgs);
}

main(); 
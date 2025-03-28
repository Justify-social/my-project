#!/usr/bin/env node

/**
 * Master Toolkit
 * 
 * A comprehensive script coordinator that provides a centralized interface
 * to all script functionality across categories.
 * 
 * Usage:
 *   node scripts/master-toolkit.js <category> <command> [options]
 * 
 * Example:
 *   node scripts/master-toolkit.js components find
 *   node scripts/master-toolkit.js linting fix --file path/to/file.tsx
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// Configuration
const CODEBASE_ROOT = path.resolve(__dirname, '..');

// Colors for terminal output
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// Define available categories and commands
const CATEGORIES = {
  components: {
    description: 'UI component management tools',
    commands: {
      find: {
        description: 'Find duplicate components',
        script: 'scripts/components/master-component-manager.sh',
        args: ['find']
      },
      consolidate: {
        description: 'Consolidate components into canonical directories',
        script: 'scripts/components/master-component-manager.sh',
        args: ['consolidate']
      },
      remove: {
        description: 'Remove duplicate component directories',
        script: 'scripts/components/master-component-manager.sh',
        args: ['remove']
      },
      clean: {
        description: 'Clean up component structure and fix imports',
        script: 'scripts/components/master-component-manager.sh',
        args: ['clean']
      },
      'full-cycle': {
        description: 'Run full component management cycle',
        script: 'scripts/components/master-component-manager.sh',
        args: ['full-cycle']
      }
    }
  },
  
  linting: {
    description: 'Code quality and linting tools',
    commands: {
      fix: {
        description: 'Fix linting issues automatically',
        script: 'scripts/linting/lint-fixer.js',
        options: [
          { name: 'file', description: 'Target specific file', type: 'string' }
        ]
      },
      'fix-any': {
        description: 'Fix explicit any types',
        script: 'scripts/linting/fix-any-types.js',
        options: [
          { name: 'path', description: 'Target specific directory', type: 'string' }
        ]
      },
      'find-issues': {
        description: 'Find common linting issues',
        script: 'scripts/linting/codebase-lint-cleaner.js',
        options: [
          { name: 'report', description: 'Generate detailed report', type: 'boolean' }
        ]
      },
      plan: {
        description: 'Generate a lint fix execution plan',
        script: 'scripts/linting/bulk-fix-planner.js',
        options: [
          { name: 'output-file', description: 'Save plan to file', type: 'string' },
          { name: 'top', description: 'Focus on top N issues', type: 'number', default: 10 }
        ]
      },
      'bulk-fix': {
        description: 'Execute bulk lint fixes',
        script: 'scripts/linting/bulk-fix.sh'
      }
    }
  },
  
  icons: {
    description: 'Icon management tools',
    commands: {
      audit: {
        description: 'Audit icons for issues',
        script: 'scripts/icons/audit-icons.js'
      },
      download: {
        description: 'Download and update icons',
        script: 'scripts/icons/download-icons.js'
      },
      verify: {
        description: 'Verify icon structure',
        script: 'scripts/icons/verify-icons.js'
      },
      'update-imports': {
        description: 'Update icon imports',
        script: 'scripts/icons/update-icon-imports.js'
      },
      'fix-issues': {
        description: 'Fix common icon issues',
        script: 'scripts/icons/fix-icon-issues.js'
      },
      generate: {
        description: 'Generate icon data',
        script: 'scripts/icons/generate-icon-data.js'
      }
    }
  },
  
  docs: {
    description: 'Documentation tools',
    commands: {
      update: {
        description: 'Update documentation',
        script: 'scripts/docs/documentation-updater.js'
      },
      'generate-scripts': {
        description: 'Generate script documentation',
        script: 'scripts/docs/generate-scripts-docs.js'
      },
      'cleanup': {
        description: 'Clean up documentation files',
        script: 'scripts/docs/verification-cleanup.sh'
      }
    }
  },
  
  cleanup: {
    description: 'Cleanup utilities',
    commands: {
      'import-paths': {
        description: 'Update import paths',
        script: 'scripts/cleanup/import-path-updater.js',
        options: [
          { name: 'dry-run', description: 'Show changes without applying', type: 'boolean' }
        ]
      },
      'find-backups': {
        description: 'Find backup files',
        script: 'scripts/cleanup/find-backups.js'
      },
      'remove-backups': {
        description: 'Remove backup files',
        script: 'scripts/cleanup/remove-backups.js',
        options: [
          { name: 'confirm', description: 'Skip confirmation', type: 'boolean' }
        ]
      },
      'deprecated': {
        description: 'Clean up deprecated files',
        script: 'scripts/cleanup/cleanup-deprecated-scripts.js'
      }
    }
  },
  
  utils: {
    description: 'Utility tools',
    commands: {
      'verify-no-backups': {
        description: 'Verify no backup files exist',
        script: 'scripts/utils/verify-no-backups.js'
      },
      'final-report': {
        description: 'Generate final verification report',
        script: 'scripts/utils/final-verification-report.js'
      }
    }
  }
};

// Show main help
function showMainHelp() {
  console.log(colors.bold(colors.green('\nMaster Toolkit - Consolidated Script Coordinator')));
  console.log('\nThis tool provides access to all script functionality in one place.\n');
  
  console.log(colors.bold(colors.cyan('Usage:')));
  console.log('  node scripts/master-toolkit.js <category> <command> [options]\n');
  
  console.log(colors.bold(colors.cyan('Available Categories:')));
  
  Object.keys(CATEGORIES).forEach(category => {
    console.log(`  ${colors.yellow(category.padEnd(15))} ${CATEGORIES[category].description}`);
  });
  
  console.log('\nUse', colors.yellow('node scripts/master-toolkit.js <category> help'), 'for details about a specific category.');
  console.log('\n');
}

// Show category help
function showCategoryHelp(category) {
  if (!CATEGORIES[category]) {
    console.log(colors.red(`\nUnknown category: ${category}`));
    showMainHelp();
    return;
  }
  
  console.log(colors.bold(colors.green(`\n${category} Tools - ${CATEGORIES[category].description}`)));
  console.log('\n');
  
  console.log(colors.bold(colors.cyan('Available Commands:')));
  
  Object.keys(CATEGORIES[category].commands).forEach(command => {
    const cmd = CATEGORIES[category].commands[command];
    console.log(`  ${colors.yellow(command.padEnd(15))} ${cmd.description}`);
    
    // Show command options if they exist
    if (cmd.options && cmd.options.length > 0) {
      cmd.options.forEach(option => {
        const optionStr = option.type === 'boolean' ? `--${option.name}` : `--${option.name} <${option.type}>`;
        console.log(`    ${colors.magenta(optionStr.padEnd(20))} ${option.description}`);
      });
    }
  });
  
  console.log('\nExample:');
  const firstCommand = Object.keys(CATEGORIES[category].commands)[0];
  console.log(`  node scripts/master-toolkit.js ${category} ${firstCommand}`);
  console.log('\n');
}

// Process command and arguments
function executeCommand(category, command, args = []) {
  if (!CATEGORIES[category]) {
    console.log(colors.red(`\nUnknown category: ${category}`));
    showMainHelp();
    return;
  }
  
  if (!CATEGORIES[category].commands[command]) {
    console.log(colors.red(`\nUnknown command '${command}' for category '${category}'`));
    showCategoryHelp(category);
    return;
  }
  
  const cmdConfig = CATEGORIES[category].commands[command];
  const scriptPath = cmdConfig.script;
  
  console.log(colors.green(`\nExecuting: ${category} > ${command}\n`));
  
  // Handle different script types
  const ext = path.extname(scriptPath);
  
  try {
    if (ext === '.sh') {
      // For shell scripts
      const scriptArgs = cmdConfig.args ? [...cmdConfig.args, ...args] : args;
      const fullCommand = `bash ${path.join(CODEBASE_ROOT, scriptPath)} ${scriptArgs.join(' ')}`;
      console.log(colors.blue(`Running: ${fullCommand}\n`));
      execSync(fullCommand, { stdio: 'inherit' });
    } else {
      // For JavaScript scripts
      const nodeArgs = [path.join(CODEBASE_ROOT, scriptPath), ...args];
      console.log(colors.blue(`Running: node ${nodeArgs.join(' ')}\n`));
      const childProcess = spawn('node', nodeArgs, { stdio: 'inherit' });
      
      childProcess.on('close', (code) => {
        if (code !== 0) {
          console.log(colors.red(`\nCommand exited with code ${code}`));
        } else {
          console.log(colors.green('\nCommand completed successfully'));
        }
      });
    }
  } catch (error) {
    console.log(colors.red(`\nError executing command: ${error.message}`));
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showMainHelp();
    return;
  }
  
  const category = args[0].toLowerCase();
  
  if (category === 'help' || category === '--help' || category === '-h') {
    showMainHelp();
    return;
  }
  
  if (!CATEGORIES[category]) {
    console.log(colors.red(`\nUnknown category: ${category}`));
    showMainHelp();
    return;
  }
  
  if (args.length === 1 || args[1] === 'help' || args[1] === '--help' || args[1] === '-h') {
    showCategoryHelp(category);
    return;
  }
  
  const command = args[1].toLowerCase();
  const commandArgs = args.slice(2);
  
  executeCommand(category, command, commandArgs);
}

main(); 
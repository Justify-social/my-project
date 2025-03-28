#!/usr/bin/env node

/**
 * Bulk Lint Fix Planner
 * 
 * This script analyzes ESLint errors and generates a batch execution plan
 * for efficiently fixing multiple issues at once, grouped by similar error types.
 * 
 * Usage:
 *   node scripts/consolidated/linting/bulk-fix-planner.js [--output-file <filename>] [--top <number>]
 * 
 * Options:
 *   --output-file  Save the execution plan to specified file
 *   --top          Focus on the top N most critical issues (default: 10)
 */

import fs from 'fs';
import path from 'path';
import prioritizer from './lint-error-prioritizer';

// Configuration
const CODEBASE_ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_DIR = path.join(CODEBASE_ROOT, 'docs/verification');

// Simple color functions
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  outputFile: args.includes('--output-file') ? args[args.indexOf('--output-file') + 1] : null,
  top: args.includes('--top') ? parseInt(args[args.indexOf('--top') + 1], 10) : 10
};

// Logger
function log(message, type = 'info') {
  const prefix = {
    info: colors.blue('INFO'),
    success: colors.green('SUCCESS'),
    warning: colors.yellow('WARNING'),
    error: colors.red('ERROR'),
    plan: colors.cyan('PLAN')
  }[type];
  
  console.log(`${prefix}: ${message}`);
}

// Group files by error type for more efficient fixing
function groupFilesByError(priorityData) {
  const fileGroups = {};
  const flatErrors = [];
  
  // First, collect all errors with their file information
  Object.entries(priorityData.filesToFix).forEach(([filePath, fileData]) => {
    const relPath = path.relative(CODEBASE_ROOT, filePath);
    
    // Add errors (higher priority)
    fileData.errors.forEach(error => {
      flatErrors.push({
        rule: error.ruleId,
        path: relPath,
        absolutePath: filePath,
        line: error.line,
        column: error.column,
        message: error.message,
        severity: 2 // error
      });
    });
    
    // Add warnings (lower priority)
    fileData.warnings.forEach(warning => {
      flatErrors.push({
        rule: warning.ruleId,
        path: relPath,
        absolutePath: filePath,
        line: warning.line,
        column: warning.column,
        message: warning.message,
        severity: 1 // warning
      });
    });
  });
  
  // Get prioritized rules
  const prioritizedRules = priorityData.rulesByPriority.map(rule => rule.rule);
  
  // Sort errors by priority (based on rule order) and then by file
  flatErrors.sort((a, b) => {
    // First by rule priority
    const ruleAPriority = prioritizedRules.indexOf(a.rule);
    const ruleBPriority = prioritizedRules.indexOf(b.rule);
    
    if (ruleAPriority !== ruleBPriority) {
      return ruleAPriority - ruleBPriority;
    }
    
    // Then by severity
    if (a.severity !== b.severity) {
      return b.severity - a.severity; // Higher severity first
    }
    
    // Then by file path
    if (a.path !== b.path) {
      return a.path.localeCompare(b.path);
    }
    
    // Finally by line number
    return a.line - b.line;
  });
  
  // Group by rule
  prioritizedRules.forEach(rule => {
    const ruleErrors = flatErrors.filter(error => error.rule === rule);
    
    if (ruleErrors.length > 0) {
      // Now group by file
      const filesByRule = {};
      
      ruleErrors.forEach(error => {
        if (!filesByRule[error.path]) {
          filesByRule[error.path] = {
            path: error.path,
            absolutePath: error.absolutePath,
            occurrences: []
          };
        }
        
        filesByRule[error.path].occurrences.push({
          line: error.line,
          column: error.column,
          message: error.message,
          severity: error.severity
        });
      });
      
      fileGroups[rule] = {
        rule,
        fileCount: Object.keys(filesByRule).length,
        totalOccurrences: ruleErrors.length,
        files: Object.values(filesByRule)
      };
    }
  });
  
  return fileGroups;
}

// Generate fix strategies based on rule type
function generateFixStrategies(ruleGroups, priorityData) {
  const strategies = {};
  
  // Lookup rule details
  const ruleDetails = {};
  priorityData.rulesByPriority.forEach(rule => {
    ruleDetails[rule.rule] = {
      description: rule.description,
      priority: rule.priorityScore,
      fixable: rule.fixable
    };
  });
  
  // Special strategies for specific rules
  const specialStrategies = {
    'react/jsx-no-undef': {
      title: 'Fix Undefined Component References',
      description: 'Add missing imports for components referenced in JSX',
      approach: 'Use the lint-fixer.js script with --file option to automatically add imports:',
      commands: (group) => {
        return group.files.map(file => 
          `node scripts/consolidated/linting/lint-fixer.js --file ${file.path}`
        );
      }
    },
    'react-hooks/rules-of-hooks': {
      title: 'Fix React Hooks Rules Violations',
      description: 'Ensure hooks are called unconditionally at the top level of components',
      approach: 'These errors require manual fixing. Look for conditional hook calls and refactor:',
      commands: (group) => {
        return ['# Manual fix required - Hooks cannot be called conditionally',
                '# For each file, refactor to ensure hooks are called unconditionally:'];
      }
    },
    '@typescript-eslint/no-unsafe-function-type': {
      title: 'Fix Unsafe Function Types',
      description: 'Replace generic Function types with explicit function signatures',
      approach: 'Manual fix required. Replace generic Function type with explicit signatures:',
      commands: (group) => {
        return ['# For each occurrence, replace `Function` with an explicit function type',
                '# Example: `Function` → `(arg1: string, arg2: number) => void`'];
      }
    },
    '@typescript-eslint/no-require-imports': {
      title: 'Fix CommonJS require() Imports',
      description: 'Convert require() style imports to ES module imports',
      approach: 'Use the lint-fixer.js script to automatically convert require() imports:',
      commands: (group) => {
        return group.files.map(file => 
          `node scripts/consolidated/linting/lint-fixer.js --file ${file.path}`
        );
      }
    },
    'import/no-anonymous-default-export': {
      title: 'Fix Anonymous Default Exports',
      description: 'Assign default exports to variables before exporting',
      approach: 'Use the lint-fixer.js script to automatically fix anonymous exports:',
      commands: (group) => {
        return group.files.map(file => 
          `node scripts/consolidated/linting/lint-fixer.js --file ${file.path}`
        );
      }
    },
    '@typescript-eslint/no-unused-vars': {
      title: 'Fix Unused Variables',
      description: 'Prefix unused variables with underscore or remove them',
      approach: 'Use eslint --fix to automatically prefix unused variables:',
      commands: (group) => {
        return group.files.map(file => 
          `npx eslint --config eslint.config.mjs --fix ${file.path}`
        );
      }
    },
    '@typescript-eslint/no-explicit-any': {
      title: 'Fix Explicit any Types',
      description: 'Replace any types with more specific types',
      approach: 'Manual fix required. Each any type needs to be replaced with a more specific type:',
      commands: (group) => {
        return ['# Consider the context and replace `any` with more specific types',
                '# Example: `any` → `string | number` or a custom type/interface'];
      }
    },
    '@next/next/no-img-element': {
      title: 'Fix HTML img Elements',
      description: 'Replace HTML img elements with Next.js Image components',
      approach: 'Manual fix required. Replace img tags with Next.js Image components:',
      commands: (group) => {
        return ['# Import the Image component: `import Image from "next/image"`',
                '# Replace <img> with <Image> and add required props (width, height, etc)'];
      }
    }
  };
  
  // Generate strategies for each rule group
  Object.entries(ruleGroups).forEach(([rule, group]) => {
    const details = ruleDetails[rule] || { 
      description: 'Unknown rule',
      priority: 0,
      fixable: false
    };
    
    const specialStrategy = specialStrategies[rule];
    
    const strategy = {
      rule,
      title: specialStrategy?.title || `Fix ${rule} Violations`,
      description: details.description,
      priority: details.priority,
      fileCount: group.fileCount,
      occurrences: group.totalOccurrences,
      approach: specialStrategy?.approach || (
        details.fixable 
          ? 'Use eslint --fix to automatically fix these issues:' 
          : 'Manual fix required. Review each occurrence and fix according to the rule:'
      ),
      commands: specialStrategy?.commands?.(group) || (
        details.fixable
          ? group.files.map(file => `npx eslint --config eslint.config.mjs --fix ${file.path}`)
          : [`# Manual inspection and fixes required for ${group.fileCount} files`]
      ),
      files: group.files.slice(0, 5), // Limit to first 5 files
      hasMoreFiles: group.files.length > 5
    };
    
    strategies[rule] = strategy;
  });
  
  // Convert to array and sort by priority
  return Object.values(strategies).sort((a, b) => b.priority - a.priority);
}

// Generate executable shell script for bulk fixing
function generateExecutionScript(strategies) {
  let script = `#!/bin/bash

# Bulk Lint Fix Execution Script
# Generated on: ${new Date().toISOString()}
#
# This script will attempt to fix multiple lint issues in sequence.
# It will pause between operations to allow inspection of changes.
#
# Usage:
#   bash ./bulk-fix.sh

set -e
YELLOW="\\033[1;33m"
GREEN="\\033[1;32m"
RED="\\033[1;31m"
BLUE="\\033[1;34m"
RESET="\\033[0m"

echo -e "\${BLUE}Bulk Lint Fixing Script\${RESET}"
echo "Starting sequential fixes..."
echo

`;

  // Generate command sections
  strategies.slice(0, options.top).forEach((strategy, index) => {
    script += `# ${index + 1}. ${strategy.title}\n`;
    script += `echo -e "\${YELLOW}\\n===== FIXING: ${strategy.title} =====\${RESET}"\n`;
    script += `echo "${strategy.description}"\n`;
    script += `echo "Fixing ${strategy.occurrences} occurrences across ${strategy.fileCount} files..."\n`;
    script += `echo -e "\${BLUE}${strategy.approach}\${RESET}"\n`;
    script += `\n`;
    
    if (strategy.commands[0].startsWith('#')) {
      // Manual fix instructions
      script += `echo -e "\${RED}MANUAL FIX REQUIRED\${RESET}"\n`;
      strategy.commands.forEach(cmd => {
        script += `echo "${cmd}"\n`;
      });
      
      // List files to fix
      script += `echo -e "\\nFiles to fix:"\n`;
      strategy.files.forEach(file => {
        script += `echo "- ${file.path}"\n`;
      });
      if (strategy.hasMoreFiles) {
        script += `echo "- ... and more files (${strategy.fileCount - strategy.files.length} additional)"\n`;
      }
      
      script += `\n# Pausing for manual fixes\n`;
      script += `read -p "Press Enter when manual fixes are complete (or Ctrl+C to abort)..."\n`;
    } else {
      // Automated commands
      strategy.commands.forEach(cmd => {
        script += `echo "$ ${cmd}"\n`;
        script += `${cmd}\n`;
        script += `echo\n`;
      });
    }
    
    script += `echo -e "\${GREEN}Completed: ${strategy.title}\${RESET}"\n`;
    script += `echo\n\n`;
  });
  
  script += `echo -e "\${GREEN}All fixes applied!\${RESET}"\n`;
  script += `echo "Run ESLint again to verify fixes:"\n`;
  script += `echo "  npx eslint --config eslint.config.mjs ."\n`;
  
  return script;
}

// Generate markdown execution plan
function generateMarkdownPlan(strategies, summary) {
  let markdown = `# Lint Fix Execution Plan

## Overview

This document provides a structured plan for fixing ${summary.totalErrors} ESLint errors and ${summary.totalWarnings} warnings 
across ${summary.filesWithIssues} files.

## Execution Strategy

The issues have been prioritized and grouped by rule type to allow for more efficient fixing. This plan focuses on the
top ${options.top} most critical issues based on severity, frequency, and impact.

## Fix Sequence

`;

  // Add each strategy
  strategies.slice(0, options.top).forEach((strategy, index) => {
    markdown += `### ${index + 1}. ${strategy.title}\n\n`;
    markdown += `- **Rule ID**: \`${strategy.rule}\`\n`;
    markdown += `- **Description**: ${strategy.description}\n`;
    markdown += `- **Occurrences**: ${strategy.occurrences} across ${strategy.fileCount} files\n`;
    markdown += `- **Approach**: ${strategy.approach}\n\n`;
    
    // Add commands or instructions
    markdown += "```bash\n";
    strategy.commands.forEach(cmd => {
      markdown += `${cmd}\n`;
    });
    markdown += "```\n\n";
    
    // Add example files
    markdown += "**Example Files**:\n\n";
    strategy.files.forEach(file => {
      markdown += `- \`${file.path}\`\n`;
    });
    
    if (strategy.hasMoreFiles) {
      markdown += `- ... and ${strategy.fileCount - strategy.files.length} more files\n`;
    }
    
    markdown += "\n";
  });

  markdown += `## Execution Script

An executable script has been generated at \`scripts/consolidated/linting/bulk-fix.sh\` that will guide you through
the fixing process for each rule. The script will:

1. Apply automated fixes where possible
2. Provide instructions for manual fixes where needed
3. Pause after each fix set to allow verification

Run the script with:

\`\`\`bash
bash scripts/consolidated/linting/bulk-fix.sh
\`\`\`

## Verification

After applying all fixes, run ESLint again to verify the results:

\`\`\`bash
npx eslint --config eslint.config.mjs .
\`\`\`

## Next Steps

1. Execute the bulk fix script
2. Verify fixes with ESLint
3. Run the git pre-commit hook to ensure commits will pass
4. Update the lint status verification document with new results

This plan was generated on ${new Date().toLocaleString()}.
`;

  return markdown;
}

// Main execution function
async function main() {
  try {
    log('Analyzing lint errors to create execution plan...', 'info');
    
    // Get priority data from the prioritizer
    const results = await prioritizer.extractLintErrors();
    const priorityData = prioritizer.prioritizeErrors(results);
    const summary = priorityData.summary;
    
    log(`Found ${summary.totalErrors} errors and ${summary.totalWarnings} warnings across ${summary.filesWithIssues} files`, 'info');
    
    // Group files by error type
    const ruleGroups = groupFilesByError(priorityData);
    log(`Grouped issues by ${Object.keys(ruleGroups).length} rule types`, 'info');
    
    // Generate fix strategies
    const strategies = generateFixStrategies(ruleGroups, priorityData);
    log(`Generated ${strategies.length} fix strategies`, 'plan');
    
    // Generate shell script
    const scriptContent = generateExecutionScript(strategies);
    const scriptPath = path.join(__dirname, 'bulk-fix.sh');
    fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });
    log(`Generated executable script at ${scriptPath}`, 'success');
    
    // Generate markdown plan
    const markdown = generateMarkdownPlan(strategies, summary);
    
    // Save to file if specified
    if (options.outputFile) {
      const outputPath = path.resolve(OUTPUT_DIR, options.outputFile);
      fs.writeFileSync(outputPath, markdown, 'utf8');
      log(`Saved execution plan to ${outputPath}`, 'success');
    } else {
      // Print top issues
      log(`Top ${Math.min(options.top, strategies.length)} issues to fix:`, 'plan');
      strategies.slice(0, options.top).forEach((strategy, index) => {
        log(`${index + 1}. ${strategy.title} - ${strategy.occurrences} occurrences in ${strategy.fileCount} files`, 'info');
      });
      
      console.log('\n' + markdown);
    }
    
    return {
      strategies,
      markdown
    };
  } catch (error) {
    log(`Error creating execution plan: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run script if executed directly
if (require.main === module) {
  main();
} else {
  // Export for use in other scripts
  module.exports = {
    groupFilesByError,
    generateFixStrategies,
    generateExecutionScript,
    generateMarkdownPlan,
    main
  };
} 
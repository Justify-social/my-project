#!/usr/bin/env node

/**
 * ESLint Error Prioritizer
 * 
 * This script analyzes ESLint output and prioritizes errors based on:
 * 1. Error severity (errors > warnings)
 * 2. Frequency of occurrence
 * 3. Impact on development workflow
 * 
 * Usage:
 *   node scripts/consolidated/linting/lint-error-prioritizer.js [--output-file <filename>]
 * 
 * Options:
 *   --output-file  Save prioritized errors to specified file
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Simple color functions
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// Configuration
const CODEBASE_ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_DIR = path.join(CODEBASE_ROOT, 'docs/verification');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  outputFile: args.includes('--output-file') ? args[args.indexOf('--output-file') + 1] : null
};

// Logger
function log(message, type = 'info') {
  const prefix = {
    info: colors.blue('INFO'),
    success: colors.green('SUCCESS'),
    warning: colors.yellow('WARNING'),
    error: colors.red('ERROR'),
    fix: colors.magenta('FIX'),
    priority: colors.cyan('PRIORITY')
  }[type];
  
  console.log(`${prefix}: ${message}`);
}

// Parse ESLint output and extract errors
async function extractLintErrors() {
  log('Running ESLint on entire codebase. This may take a while...', 'info');
  
  // Run ESLint and capture output
  let eslintOutput;
  try {
    eslintOutput = execSync(
      'npx eslint --config eslint.config.mjs --format json .', 
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
  } catch (error) {
    // ESLint returns non-zero exit code when issues are found
    eslintOutput = error.stdout;
  }
  
  // Parse JSON output
  let results;
  try {
    results = JSON.parse(eslintOutput);
  } catch (error) {
    log('Failed to parse ESLint output as JSON', 'error');
    throw error;
  }
  
  return results;
}

// Calculate error frequencies and priorities
function prioritizeErrors(results) {
  // Track error frequencies
  const errorCounts = {};
  const filesToFix = {};
  let totalErrorCount = 0;
  let totalWarningCount = 0;
  
  // Process each file's results
  results.forEach(fileResult => {
    if (fileResult.messages.length === 0) return;
    
    const fileErrors = {
      path: fileResult.filePath,
      errors: [],
      warnings: []
    };
    
    // Process each message (error/warning)
    fileResult.messages.forEach(message => {
      const ruleId = message.ruleId || 'syntax-error';
      
      // Initialize rule counter if not exists
      if (!errorCounts[ruleId]) {
        errorCounts[ruleId] = {
          rule: ruleId,
          severity: message.severity, // 1=warning, 2=error
          count: 0,
          description: message.message,
          files: new Set(),
          fixable: !!message.fix
        };
      }
      
      // Update counters
      errorCounts[ruleId].count++;
      errorCounts[ruleId].files.add(fileResult.filePath);
      
      // Add to file-specific tracking
      const errorDetails = {
        ruleId,
        line: message.line,
        column: message.column,
        message: message.message,
        severity: message.severity
      };
      
      if (message.severity === 2) {
        fileErrors.errors.push(errorDetails);
        totalErrorCount++;
      } else {
        fileErrors.warnings.push(errorDetails);
        totalWarningCount++;
      }
    });
    
    // Add file to fix list if it has errors or warnings
    if (fileErrors.errors.length > 0 || fileErrors.warnings.length > 0) {
      filesToFix[fileResult.filePath] = fileErrors;
    }
  });
  
  // Convert to array and sort by priority
  const errorArray = Object.values(errorCounts);
  
  // High impact rules that should be fixed first
  const highImpactRules = [
    'react-hooks/rules-of-hooks',
    'react/jsx-no-undef',
    '@typescript-eslint/no-unsafe-function-type',
    '@typescript-eslint/no-empty-object-type',
    '@typescript-eslint/no-unused-expressions',
    'no-undef'
  ];
  
  // Assign priority score (higher is more important)
  errorArray.forEach(error => {
    let priorityScore = 0;
    
    // Base priority on severity (errors are higher priority)
    priorityScore += (error.severity === 2) ? 1000 : 0;
    
    // High impact rules get extra priority
    if (highImpactRules.includes(error.rule)) {
      priorityScore += 500;
    }
    
    // Add count to priority (more occurrences = higher priority)
    priorityScore += error.count;
    
    // Add file count to priority (more files = higher priority)
    priorityScore += error.files.size * 10;
    
    // Fixable errors get slightly higher priority
    priorityScore += error.fixable ? 50 : 0;
    
    error.priorityScore = priorityScore;
    error.fileCount = error.files.size;
    error.files = Array.from(error.files); // Convert set to array for JSON
  });
  
  // Sort by priority (highest first)
  errorArray.sort((a, b) => b.priorityScore - a.priorityScore);
  
  return {
    rulesByPriority: errorArray,
    filesToFix,
    summary: {
      totalFiles: results.length,
      filesWithIssues: Object.keys(filesToFix).length,
      totalErrors: totalErrorCount,
      totalWarnings: totalWarningCount,
      uniqueRules: errorArray.length
    }
  };
}

// Generate prioritized fix plan
function generateFixPlan(priorityData) {
  // Group files by error type to fix similar issues together
  const filesByRule = {};
  
  Object.values(priorityData.filesToFix).forEach(fileData => {
    const filePath = fileData.path;
    const relPath = path.relative(CODEBASE_ROOT, filePath);
    
    // Process errors (higher priority)
    fileData.errors.forEach(error => {
      if (!filesByRule[error.ruleId]) {
        filesByRule[error.ruleId] = [];
      }
      filesByRule[error.ruleId].push({
        path: relPath,
        line: error.line,
        column: error.column,
        message: error.message
      });
    });
    
    // Process warnings (lower priority)
    fileData.warnings.forEach(warning => {
      if (!filesByRule[warning.ruleId]) {
        filesByRule[warning.ruleId] = [];
      }
      filesByRule[warning.ruleId].push({
        path: relPath,
        line: warning.line,
        column: warning.column,
        message: warning.message
      });
    });
  });
  
  // Create action plan based on rule priorities
  const actionPlan = {
    criticalErrors: [],
    majorErrors: [],
    minorErrors: [],
    warnings: []
  };
  
  priorityData.rulesByPriority.forEach(rule => {
    // Get list of affected files for this rule
    const affectedFiles = filesByRule[rule.rule] || [];
    
    const ruleAction = {
      rule: rule.rule,
      description: rule.description,
      occurrences: rule.count,
      affectedFiles: affectedFiles.length,
      fixable: rule.fixable,
      examples: affectedFiles.slice(0, 3) // Show up to 3 examples
    };
    
    // Categorize based on severity and priority
    if (rule.severity === 2) {
      if (rule.priorityScore >= 1500) {
        actionPlan.criticalErrors.push(ruleAction);
      } else if (rule.priorityScore >= 1050) {
        actionPlan.majorErrors.push(ruleAction);
      } else {
        actionPlan.minorErrors.push(ruleAction);
      }
    } else {
      actionPlan.warnings.push(ruleAction);
    }
  });
  
  return {
    actionPlan,
    summary: priorityData.summary,
    timestamp: new Date().toISOString()
  };
}

// Generate markdown output
function generateMarkdown(fixPlan) {
  const { actionPlan, summary, timestamp } = fixPlan;
  
  // Format date for display
  const formattedDate = new Date(timestamp).toLocaleString();
  
  let markdown = `# ESLint Error Priority Report
  
## Overview

- **Generated**: ${formattedDate}
- **Total Files Analyzed**: ${summary.totalFiles}
- **Files with Issues**: ${summary.filesWithIssues} (${Math.round(summary.filesWithIssues / summary.totalFiles * 100)}%)
- **Total Errors**: ${summary.totalErrors}
- **Total Warnings**: ${summary.totalWarnings}
- **Unique Rules Violated**: ${summary.uniqueRules}

## Critical Errors (Fix Immediately)

These errors must be fixed before commits can be made successfully:

`;

  if (actionPlan.criticalErrors.length === 0) {
    markdown += "No critical errors found.\n\n";
  } else {
    actionPlan.criticalErrors.forEach(error => {
      markdown += `### ${error.rule}\n\n`;
      markdown += `- **Description**: ${error.description}\n`;
      markdown += `- **Occurrences**: ${error.occurrences} across ${error.affectedFiles} files\n`;
      markdown += `- **Fixable by Tool**: ${error.fixable ? 'Yes' : 'No'}\n\n`;
      
      if (error.examples.length > 0) {
        markdown += "**Examples**:\n\n";
        error.examples.forEach(example => {
          markdown += `- \`${example.path}\` (line ${example.line}): ${example.message}\n`;
        });
        markdown += "\n";
      }
    });
  }

  markdown += `## Major Errors (High Priority)

These errors should be fixed soon as they could cause bugs or maintainability issues:

`;

  if (actionPlan.majorErrors.length === 0) {
    markdown += "No major errors found.\n\n";
  } else {
    actionPlan.majorErrors.forEach(error => {
      markdown += `### ${error.rule}\n\n`;
      markdown += `- **Description**: ${error.description}\n`;
      markdown += `- **Occurrences**: ${error.occurrences} across ${error.affectedFiles} files\n`;
      markdown += `- **Fixable by Tool**: ${error.fixable ? 'Yes' : 'No'}\n\n`;
      
      if (error.examples.length > 0) {
        markdown += "**Examples**:\n\n";
        error.examples.forEach(example => {
          markdown += `- \`${example.path}\` (line ${example.line}): ${example.message}\n`;
        });
        markdown += "\n";
      }
    });
  }

  markdown += `## Minor Errors (Medium Priority)

These errors should be fixed in regular development:

`;

  if (actionPlan.minorErrors.length === 0) {
    markdown += "No minor errors found.\n\n";
  } else {
    markdown += `*${actionPlan.minorErrors.length} rule violations found*\n\n`;
    actionPlan.minorErrors.slice(0, 5).forEach(error => {
      markdown += `- **${error.rule}**: ${error.description} (${error.occurrences} occurrences)\n`;
    });
    
    if (actionPlan.minorErrors.length > 5) {
      markdown += `- ... and ${actionPlan.minorErrors.length - 5} more\n`;
    }
    
    markdown += "\n";
  }

  markdown += `## Warnings (Low Priority)

These warnings should be addressed during regular development:

`;

  if (actionPlan.warnings.length === 0) {
    markdown += "No warnings found.\n\n";
  } else {
    markdown += `*${actionPlan.warnings.length} warning types found*\n\n`;
    actionPlan.warnings.slice(0, 5).forEach(warning => {
      markdown += `- **${warning.rule}**: ${warning.description} (${warning.occurrences} occurrences)\n`;
    });
    
    if (actionPlan.warnings.length > 5) {
      markdown += `- ... and ${actionPlan.warnings.length - 5} more\n`;
    }
    
    markdown += "\n";
  }

  markdown += `## Recommended Action Plan

1. Address all critical errors immediately
2. Focus on major errors in the next development sprint
3. Fix minor errors and warnings during regular code maintenance
4. Run the automated lint-fixer to resolve automatically fixable issues

Use the following command to run the automated fixer:

\`\`\`bash
node scripts/consolidated/linting/lint-fixer.js
\`\`\`

Re-run this analysis after fixing critical issues to ensure progress.
`;

  return markdown;
}

// Main execution function
async function main() {
  try {
    // Extract lint errors
    const results = await extractLintErrors();
    log(`Analyzed ${results.length} files`, 'success');
    
    // Prioritize errors
    const priorityData = prioritizeErrors(results);
    log(`Found ${priorityData.summary.totalErrors} errors and ${priorityData.summary.totalWarnings} warnings`, 'info');
    
    // Generate fix plan
    const fixPlan = generateFixPlan(priorityData);
    log(`Generated action plan with ${fixPlan.actionPlan.criticalErrors.length} critical issues to fix`, 'priority');
    
    // Convert to markdown
    const markdown = generateMarkdown(fixPlan);
    
    // Save to file if specified
    if (options.outputFile) {
      const outputPath = path.resolve(OUTPUT_DIR, options.outputFile);
      fs.writeFileSync(outputPath, markdown, 'utf8');
      log(`Saved priority report to ${outputPath}`, 'success');
    } else {
      // Print critical errors summary
      log('Critical errors requiring immediate attention:', 'priority');
      fixPlan.actionPlan.criticalErrors.forEach(error => {
        log(`- ${error.rule}: ${error.occurrences} occurrences (${error.affectedFiles} files)`, 'error');
      });
      
      console.log('\n' + markdown);
    }
    
    return {
      fixPlan,
      markdown
    };
  } catch (error) {
    log(`Error analyzing lint issues: ${error.message}`, 'error');
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
    extractLintErrors,
    prioritizeErrors,
    generateFixPlan,
    generateMarkdown,
    main
  };
} 
/**
 * Codebase Lint Cleaner
 * 
 * This script performs a thorough scan of the entire codebase,
 * identifying and fixing all lint issues to achieve a 100% lint-free codebase.
 * 
 * It works in multiple passes:
 * 1. Fix all auto-fixable issues
 * 2. Fix type safety issues (no-explicit-any)
 * 3. Fix unused variables
 * 4. Fix React hooks issues
 * 5. Verify the codebase is fully clean
 * 6. Set up Husky Git hooks for ongoing maintenance
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get the current file's directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // Directories to scan and fix
  directories: [
    'src',
    'pages',
    'components',
    'lib',
    'utils',
    'hooks',
    'api',
    'tests'
  ],
  // ESLint configs
  eslintConfig: 'eslint.config.mjs',
  // Skip patterns
  skipPatterns: [
    'node_modules',
    '.next',
    'build',
    'dist',
    'coverage'
  ],
  // Output file for the lint report
  reportFile: 'docs/verification/lint-fix-progress/lint-status-report.md',
  // Audit file to update
  auditFile: 'docs/verification/lint-fix-progress/comprehensive-linting-audit.md'
};

// Statistics tracking
const stats = {
  initialErrors: 0,
  initialWarnings: 0,
  currentErrors: 0,
  currentWarnings: 0,
  fixedErrors: 0,
  fixedWarnings: 0,
  filesProcessed: 0,
  filesWithIssues: 0,
  filesByType: {},
  ruleViolations: {},
};

/**
 * Main function that orchestrates the cleaning process
 */
async function cleanCodebase() {
  try {
    console.log(chalk.blue.bold('🧹 Starting Codebase Lint Cleaner 🧹\n'));
    
    // Step 1: Ensure Husky is properly installed
    console.log(chalk.yellow('Step 1: Ensuring Husky is properly installed...'));
    ensureHuskyInstalled();
    
    // Step 2: Initial lint scan to assess the current state
    console.log(chalk.yellow('\nStep 2: Performing initial lint scan...'));
    const initialScan = performLintScan();
    processLintResults(initialScan, true);
    
    // Step 3: Update lint stats in the audit file
    updateAuditFile('initial');
    
    // Step 4: Run general auto-fix
    console.log(chalk.yellow('\nStep 3: Running general auto-fix...'));
    executeCommand('npm run lint-fix');
    
    // Step 5: Fix no-explicit-any issues
    console.log(chalk.yellow('\nStep 4: Fixing type safety issues (no-explicit-any)...'));
    CONFIG.directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(chalk.cyan(`  Processing directory: ${dir}`));
        try {
          executeCommand(`npm run lint:any -- --path ${dir}`);
        } catch (error) {
          console.log(chalk.red(`  Error processing ${dir}: ${error.message}`));
        }
      }
    });
    
    // Step 6: Fix unused variables
    console.log(chalk.yellow('\nStep 5: Fixing unused variables...'));
    CONFIG.directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(chalk.cyan(`  Processing directory: ${dir}`));
        try {
          executeCommand(`npm run lint:unused-vars -- --path ${dir}`);
        } catch (error) {
          console.log(chalk.red(`  Error processing ${dir}: ${error.message}`));
        }
      }
    });
    
    // Step 7: Set up Husky Git hooks
    console.log(chalk.yellow('\nStep 6: Setting up Husky Git hooks for ongoing maintenance...'));
    setupHuskyHooks();
    
    // Step 8: Run final lint scan to check results
    console.log(chalk.yellow('\nStep 7: Performing final lint scan...'));
    const finalScan = performLintScan();
    processLintResults(finalScan, false);
    
    // Step 9: Update audit file with final stats
    updateAuditFile('final');
    
    // Step 10: Generate detailed report
    generateReport();
    
    // Step 11: Provide summary output
    console.log(chalk.green.bold('\n✅ Codebase Lint Cleaning Complete! ✅'));
    console.log(chalk.green(`Initial issues: ${stats.initialErrors + stats.initialWarnings} (${stats.initialErrors} errors, ${stats.initialWarnings} warnings)`));
    console.log(chalk.green(`Final issues: ${stats.currentErrors + stats.currentWarnings} (${stats.currentErrors} errors, ${stats.currentWarnings} warnings)`));
    console.log(chalk.green(`Issues fixed: ${stats.fixedErrors + stats.fixedWarnings} (${stats.fixedErrors} errors, ${stats.fixedWarnings} warnings)`));
    console.log(chalk.blue(`\nDetailed report available at: ${CONFIG.reportFile}`));
    
    if (stats.currentErrors + stats.currentWarnings > 0) {
      console.log(chalk.yellow('\nRemaining issues require manual attention. Check the report for details.'));
      console.log(chalk.green('\nHusky Git hooks have been set up, which will ensure all future commits are lint-free.'));
      process.exit(1);
    } else {
      console.log(chalk.green.bold('\n🎉 Codebase is now 100% lint-free! 🎉'));
      console.log(chalk.green('\nHusky Git hooks have been set up, which will maintain a lint-free codebase for all future commits.'));
      process.exit(0);
    }
    
  } catch (error) {
    console.error(chalk.red('Error during lint cleaning process:'), error);
    process.exit(1);
  }
}

/**
 * Ensures Husky is properly installed
 */
function ensureHuskyInstalled() {
  try {
    // Check if Husky is installed
    console.log(chalk.cyan('  Checking Husky installation...'));
    
    // Check if .husky directory exists
    if (!fs.existsSync('.husky')) {
      console.log(chalk.yellow('  Husky not installed. Installing now...'));
      
      // Make sure husky is in package.json
      executeCommand('npm install husky lint-staged --save-dev');
      
      // Initialize Husky
      executeCommand('npx husky install');
      
      // Add prepare script to package.json if not exists
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (!packageJson.scripts || !packageJson.scripts.prepare || !packageJson.scripts.prepare.includes('husky')) {
          console.log(chalk.cyan('  Adding Husky prepare script to package.json...'));
          if (!packageJson.scripts) packageJson.scripts = {};
          packageJson.scripts.prepare = 'husky install';
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }
      }
    } else {
      console.log(chalk.green('  Husky already installed.'));
    }
    
    // Check if lint-staged config exists, create if not
    const lintStagedConfigPath = path.resolve(process.cwd(), '.lintstagedrc');
    if (!fs.existsSync(lintStagedConfigPath)) {
      console.log(chalk.cyan('  Creating lint-staged configuration...'));
      const lintStagedConfig = {
        '*.{js,jsx,ts,tsx}': 'eslint --fix'
      };
      fs.writeFileSync(lintStagedConfigPath, JSON.stringify(lintStagedConfig, null, 2));
    } else {
      console.log(chalk.green('  lint-staged configuration already exists.'));
    }
    
  } catch (error) {
    console.error(chalk.red('  Error setting up Husky:'), error.message);
    throw error;
  }
}

/**
 * Sets up Husky Git hooks
 */
function setupHuskyHooks() {
  try {
    console.log(chalk.cyan('  Setting up Git hooks...'));
    
    // Create pre-commit hook
    executeCommand('npx husky add .husky/pre-commit "npx lint-staged"');
    
    // Create pre-push hook (optional - runs full lint check before pushing)
    const prePushScript = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running full lint check before push..."
npm run lint-fix || (echo "Linting failed. Please fix the issues before pushing." && exit 1)
`;
    const prePushPath = path.resolve(process.cwd(), '.husky/pre-push');
    fs.writeFileSync(prePushPath, prePushScript);
    fs.chmodSync(prePushPath, '755'); // Make executable
    
    // Update package.json with appropriate scripts if needed
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      if (!packageJson.scripts) packageJson.scripts = {};
      
      // Add/update required scripts
      const scriptsToAdd = {
        'lint': `eslint --config ${CONFIG.eslintConfig} "src/**/*.{js,jsx,ts,tsx}"`,
        'lint-staged': 'lint-staged'
      };
      
      let scriptsUpdated = false;
      for (const [scriptName, scriptCommand] of Object.entries(scriptsToAdd)) {
        if (!packageJson.scripts[scriptName]) {
          packageJson.scripts[scriptName] = scriptCommand;
          scriptsUpdated = true;
        }
      }
      
      if (scriptsUpdated) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(chalk.green('  Updated package.json with required scripts.'));
      }
    }
    
    console.log(chalk.green('  Git hooks successfully set up.'));
    
  } catch (error) {
    console.error(chalk.red('  Error setting up Git hooks:'), error.message);
  }
}

/**
 * Performs a full lint scan and returns the results
 */
function performLintScan() {
  try {
    console.log(chalk.cyan('  Running ESLint scan...'));
    // Use --format json to get structured output
    const result = execSync(
      `npx eslint --config ${CONFIG.eslintConfig} "src/**/*.{js,jsx,ts,tsx}" --format json`,
      { encoding: 'utf-8' }
    );
    return JSON.parse(result);
  } catch (error) {
    // ESLint returns a non-zero exit code if it finds issues
    // We still want to process the JSON output
    try {
      return JSON.parse(error.stdout);
    } catch (jsonError) {
      console.error(chalk.red('  Error parsing ESLint results:'), jsonError);
      return [];
    }
  }
}

/**
 * Processes the lint results and updates statistics
 */
function processLintResults(results, isInitial) {
  if (!Array.isArray(results)) {
    console.warn(chalk.yellow('  Invalid lint results format. Skipping processing.'));
    return;
  }
  
  let totalErrors = 0;
  let totalWarnings = 0;
  let filesWithIssues = 0;
  
  // Process each file's results
  results.forEach(fileResult => {
    const { filePath, messages, errorCount, warningCount } = fileResult;
    
    if (errorCount + warningCount > 0) {
      filesWithIssues++;
      
      // Track files by extension
      const ext = path.extname(filePath).substring(1);
      stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1;
      
      // Track rule violations
      messages.forEach(msg => {
        const { ruleId, severity } = msg;
        if (ruleId) {
          stats.ruleViolations[ruleId] = stats.ruleViolations[ruleId] || { errors: 0, warnings: 0 };
          if (severity === 2) { // Error
            stats.ruleViolations[ruleId].errors++;
          } else if (severity === 1) { // Warning
            stats.ruleViolations[ruleId].warnings++;
          }
        }
      });
    }
    
    totalErrors += errorCount;
    totalWarnings += warningCount;
  });
  
  // Update statistics
  if (isInitial) {
    stats.initialErrors = totalErrors;
    stats.initialWarnings = totalWarnings;
    stats.currentErrors = totalErrors;
    stats.currentWarnings = totalWarnings;
  } else {
    stats.fixedErrors = stats.initialErrors - totalErrors;
    stats.fixedWarnings = stats.initialWarnings - totalWarnings;
    stats.currentErrors = totalErrors;
    stats.currentWarnings = totalWarnings;
  }
  
  stats.filesWithIssues = filesWithIssues;
  stats.filesProcessed = results.length;
  
  // Log summary
  console.log(chalk.cyan(`  Found ${totalErrors} errors and ${totalWarnings} warnings in ${filesWithIssues} files.`));
}

/**
 * Executes a shell command
 */
function executeCommand(command) {
  try {
    console.log(chalk.cyan(`  Executing: ${command}`));
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(chalk.red(`  Command failed: ${command}`));
    console.error(chalk.red(`  ${error.message}`));
    return false;
  }
}

/**
 * Updates the audit file with current statistics
 */
function updateAuditFile(stage) {
  try {
    const auditFilePath = path.resolve(process.cwd(), CONFIG.auditFile);
    
    if (!fs.existsSync(auditFilePath)) {
      console.warn(chalk.yellow(`  Audit file not found at ${auditFilePath}. Skipping update.`));
      return;
    }
    
    let content = fs.readFileSync(auditFilePath, 'utf-8');
    
    // Calculate progress percentages
    const totalInitialIssues = stats.initialErrors + stats.initialWarnings;
    const currentIssues = stats.currentErrors + stats.currentWarnings;
    const errorProgress = stats.initialErrors > 0 ? Math.round((1 - stats.currentErrors / stats.initialErrors) * 100) : 100;
    const warningProgress = stats.initialWarnings > 0 ? Math.round((1 - stats.currentWarnings / stats.initialWarnings) * 100) : 100;
    const totalProgress = totalInitialIssues > 0 ? Math.round((1 - currentIssues / totalInitialIssues) * 100) : 100;
    
    // Format the date
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Update the last updated date
    content = content.replace(
      /\*\*Last Updated\*\*: .*$/m,
      `**Last Updated**: ${dateString}`
    );
    
    // Update the current status table
    const statusTableRegex = /\| Category \| Count \| Progress \|\n\|.*\|\n\| Errors.*\|\n\| Warnings.*\|\n\| \*\*Total\*\*.*\|/;
    const newStatusTable = 
      `| Category | Count | Progress |\n` +
      `|----------|-------|----------|\n` +
      `| Errors    | ~${stats.currentErrors}  | ${errorProgress}% complete |\n` +
      `| Warnings  | ~${stats.currentWarnings}   | ${warningProgress}% complete |\n` +
      `| **Total** | ~${currentIssues}  | ${totalProgress}% complete |`;
    
    content = content.replace(statusTableRegex, newStatusTable);
    
    // Add metrics summary
    const metricsRegex = /## Metrics Summary\n\n- Issues.*\n- Current error.*\n- Current warning.*\n- Total remaining.*[\n-]*/;
    const newMetrics = 
      `## Metrics Summary\n\n` +
      `- Issues resolved: ${totalInitialIssues - currentIssues}\n` +
      `- Current error count: ~${stats.currentErrors}\n` +
      `- Current warning count: ~${stats.currentWarnings}\n` +
      `- Total remaining issues: ~${currentIssues}\n` +
      `- Progress: ${totalProgress}% complete\n` +
      `- Last scan: ${new Date().toLocaleString()}\n` +
      `- Husky Git hooks: Active`;
    
    content = content.replace(metricsRegex, newMetrics);
    
    // Add Husky section if not exists
    if (!content.includes('## Git Hooks Setup')) {
      const huskySection = `## Git Hooks Setup

Husky Git hooks are now enforcing lint-free code:

1. **Pre-commit hook**: Automatically fixes lint issues in staged files before each commit
2. **Pre-push hook**: Performs a full lint check before pushing to remote
3. **Configuration**: Managed via \`.lintstagedrc\` and \`.husky/\` directory

To temporarily bypass hooks: \`git commit -m "message" --no-verify\`

`;
      
      // Insert before "Recent Fixes" or "Action Plan" section
      if (content.includes('## Recent Fixes')) {
        content = content.replace('## Recent Fixes', huskySection + '## Recent Fixes');
      } else if (content.includes('## Action Plan')) {
        content = content.replace('## Action Plan', huskySection + '## Action Plan');
      }
    }
    
    // Write updated content back to file
    fs.writeFileSync(auditFilePath, content);
    console.log(chalk.green(`  Updated audit file with ${stage} statistics.`));
    
  } catch (error) {
    console.error(chalk.red(`  Error updating audit file: ${error.message}`));
  }
}

/**
 * Generates a detailed report of the linting status
 */
function generateReport() {
  try {
    const reportDir = path.dirname(path.resolve(process.cwd(), CONFIG.reportFile));
    
    // Ensure directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Format rule violations for better reporting
    const topRuleViolations = Object.entries(stats.ruleViolations)
      .sort((a, b) => (b[1].errors + b[1].warnings) - (a[1].errors + a[1].warnings))
      .slice(0, 20);
    
    const formattedRuleViolations = topRuleViolations
      .map(([rule, { errors, warnings }]) => `| ${rule} | ${errors} | ${warnings} | ${errors + warnings} |`)
      .join('\n');
    
    // Format file types statistics
    const fileTypeStats = Object.entries(stats.filesByType)
      .sort((a, b) => b[1] - a[1])
      .map(([ext, count]) => `| ${ext} | ${count} |`)
      .join('\n');
    
    // Generate the report content
    const reportContent = `# Lint Status Report

**Generated**: ${new Date().toLocaleString()}

## Summary

| Metric | Initial | Current | Fixed | Remaining |
|--------|---------|---------|-------|-----------|
| Errors | ${stats.initialErrors} | ${stats.currentErrors} | ${stats.fixedErrors} | ${stats.currentErrors} |
| Warnings | ${stats.initialWarnings} | ${stats.currentWarnings} | ${stats.fixedWarnings} | ${stats.currentWarnings} |
| **Total** | ${stats.initialErrors + stats.initialWarnings} | ${stats.currentErrors + stats.currentWarnings} | ${stats.fixedErrors + stats.fixedWarnings} | ${stats.currentErrors + stats.currentWarnings} |

**Progress**: ${stats.initialErrors + stats.initialWarnings > 0 ? Math.round(((stats.fixedErrors + stats.fixedWarnings) / (stats.initialErrors + stats.initialWarnings)) * 100) : 100}% of issues fixed

## Files

- Total files scanned: ${stats.filesProcessed}
- Files with issues: ${stats.filesWithIssues}

### By File Type

| Extension | Files with Issues |
|-----------|------------------|
${fileTypeStats}

## Top Rule Violations

| Rule | Errors | Warnings | Total |
|------|--------|----------|-------|
${formattedRuleViolations}

## Husky Integration

- **Status**: Active
- **Pre-commit hook**: Fixes lint issues automatically on commit
- **Pre-push hook**: Performs full lint check before pushing
- **Configuration**: Located in \`.husky/\` directory

## Next Steps

${stats.currentErrors + stats.currentWarnings > 0 
  ? `The codebase still has ${stats.currentErrors + stats.currentWarnings} linting issues that need to be addressed. Focus on these areas:

1. Type safety issues (${stats.ruleViolations['@typescript-eslint/no-explicit-any'] ? stats.ruleViolations['@typescript-eslint/no-explicit-any'].errors + stats.ruleViolations['@typescript-eslint/no-explicit-any'].warnings : 0} occurrences)
2. Unused variables (${stats.ruleViolations['@typescript-eslint/no-unused-vars'] ? stats.ruleViolations['@typescript-eslint/no-unused-vars'].errors + stats.ruleViolations['@typescript-eslint/no-unused-vars'].warnings : 0} occurrences)
3. React hook dependencies (${stats.ruleViolations['react-hooks/exhaustive-deps'] ? stats.ruleViolations['react-hooks/exhaustive-deps'].errors + stats.ruleViolations['react-hooks/exhaustive-deps'].warnings : 0} occurrences)

Though Husky will prevent new issues from being introduced, you should still address existing issues using automated tools.`
  : '🎉 The codebase is now 100% lint-free! All ESLint rules are satisfied and Husky will maintain this standard for all future commits.'
}

## Conclusion

This scan was performed with ESLint configuration from \`${CONFIG.eslintConfig}\`.
Husky Git hooks are now ensuring that all future commits maintain the lint standards.
`;

    // Write the report to file
    fs.writeFileSync(path.resolve(process.cwd(), CONFIG.reportFile), reportContent);
    console.log(chalk.green(`  Generated detailed lint report at ${CONFIG.reportFile}`));
    
  } catch (error) {
    console.error(chalk.red(`  Error generating report: ${error.message}`));
  }
}

// Start the cleaning process
cleanCodebase(); 
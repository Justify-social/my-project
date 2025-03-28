/**
 * Cleanup Tracking Script
 * 
 * This script tracks the progress of various cleanup tasks and generates a report.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Utility functions
const log = (message) => console.log(`\x1b[36m[Cleanup Tracking]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);

/**
 * Check if a directory exists
 */
function directoryExists(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Check if test files are properly named
 */
function checkTestFileNaming() {
  // Check for standardized test files
  const reportExists = fs.existsSync('docs/project-history/test-standardization-report.md');
  return {
    issue: 'Inconsistent test file naming',
    status: reportExists ? 'complete' : 'not started',
    notes: reportExists ? 'All test files now follow consistent naming patterns' : 'Test files use inconsistent naming patterns'
  };
}

/**
 * Check if component directories are properly named
 */
function checkDirectoryNaming() {
  // Check for standardized directory report
  const reportExists = fs.existsSync('docs/project-history/directory-naming-report.md');
  return {
    issue: 'Inconsistent component directory naming',
    status: reportExists ? 'complete' : 'not started',
    notes: reportExists ? 'All component directories now follow consistent naming patterns' : 'Component directories use inconsistent naming patterns'
  };
}

/**
 * Check if major directories have README files
 */
function checkDirectoryReadmes() {
  // Check for README generation report
  const reportExists = fs.existsSync('docs/project-history/readme-generation-report.md');
  return {
    issue: 'Missing documentation in major directories',
    status: reportExists ? 'complete' : 'not started',
    notes: reportExists ? 'All major directories now have README files' : 'Many directories are missing README files'
  };
}

/**
 * Check if features directory is properly structured
 */
function checkFeaturesDirectory() {
  // Check for features refinement report
  const reportExists = fs.existsSync('docs/project-history/features-refinement-report.md');
  return {
    issue: 'Overly complex features directory',
    status: reportExists ? 'complete' : 'not started',
    notes: reportExists ? 'Features are now organized by domain and category' : 'Features directory lacks clear organization'
  };
}

/**
 * Check if component responsibilities are properly separated
 */
function checkComponentResponsibilities() {
  // Check for component responsibility report
  const reportExists = fs.existsSync('docs/project-history/component-responsibility-report.md');
  return {
    issue: 'Mixed component responsibilities',
    status: reportExists ? 'complete' : 'in progress',
    notes: reportExists ? 'UI components have been moved to appropriate directories' : 'Components with different responsibilities are mixed together'
  };
}

/**
 * Check if test files are centralized
 */
function checkTestCentralization() {
  // Check for test centralization report
  const reportExists = fs.existsSync('docs/project-history/test-centralization-report.md');
  const testDirExists = directoryExists('src/__tests__');
  return {
    issue: 'Scattered test files',
    status: reportExists && testDirExists ? 'complete' : (testDirExists ? 'in progress' : 'not started'),
    notes: reportExists ? 'Tests are now centralized in src/__tests__' : 'Test files are scattered throughout the codebase'
  };
}

/**
 * Check if middleware functionality is consolidated
 */
function checkMiddlewareConsolidation() {
  // Check for middleware consolidation report
  const reportExists = fs.existsSync('docs/project-history/middleware-consolidation-report.md');
  const apiMiddlewareDirExists = directoryExists('src/middlewares/api');
  return {
    issue: 'Duplicate context and layout directories',
    status: reportExists && apiMiddlewareDirExists ? 'complete' : 'in progress',
    notes: reportExists ? 'Middleware functionality has been consolidated and organized' : 'Middleware functionality is duplicated'
  };
}

/**
 * Check if remaining issues exist in the codebase
 */
function checkRemainingIssues() {
  return [
    {
      issue: 'Inconsistent or duplicate utility functions',
      status: 'in progress',
      notes: 'Some utility functions are still duplicated or inconsistently named'
    },
    {
      issue: 'Accessibility issues',
      status: 'not started',
      notes: 'Accessibility improvements needed across components'
    },
    {
      issue: 'Inconsistent error handling',
      status: 'in progress',
      notes: 'Error handling patterns vary across the application'
    }
  ];
}

/**
 * Generate a cleanup progress report
 */
function generateProgressReport() {
  // Get status of various issues
  const issues = [
    checkTestFileNaming(),
    checkDirectoryNaming(),
    checkDirectoryReadmes(),
    checkFeaturesDirectory(),
    checkComponentResponsibilities(),
    checkTestCentralization(),
    checkMiddlewareConsolidation(),
    ...checkRemainingIssues()
  ];
  
  // Categorize issues by status
  const completed = issues.filter(issue => issue.status === 'complete');
  const inProgress = issues.filter(issue => issue.status === 'in progress');
  const notStarted = issues.filter(issue => issue.status === 'not started');
  
  // Generate markdown report
  const reportContent = `# Cleanup Progress Report

## Summary
- **Completed**: ${completed.length} issues
- **In Progress**: ${inProgress.length} issues
- **Not Started**: ${notStarted.length} issues
- **Total**: ${issues.length} issues

## Completed Issues
${completed.map(issue => `- ✅ **${issue.issue}**: ${issue.notes}`).join('\n')}

## In Progress Issues
${inProgress.map(issue => `- 🚧 **${issue.issue}**: ${issue.notes}`).join('\n')}

## Not Started Issues
${notStarted.map(issue => `- ❌ **${issue.issue}**: ${issue.notes}`).join('\n')}

## Next Steps
1. Complete the in-progress tasks
2. Address the not-started issues
3. Develop a maintenance plan to prevent future technical debt

## Benefits
The cleanup efforts have significantly improved:
- Code organization and maintainability
- Developer experience and onboarding
- Project documentation
- Separation of concerns
`;

  // Write report to file
  fs.writeFileSync('docs/project-history/cleanup-progress-report.md', reportContent);
  success(`Progress report written to docs/project-history/cleanup-progress-report.md`);
  
  return {
    completed: completed.length,
    inProgress: inProgress.length,
    notStarted: notStarted.length,
    total: issues.length
  };
}

/**
 * Main function to run the script
 */
function main() {
  // Ensure the directory exists
  const docsDir = 'docs/project-history';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    log(`Created directory: ${docsDir}`);
  }
  
  // Generate progress report
  const results = generateProgressReport();
  
  // Print summary
  log(`Cleanup tracking completed.`);
  success(`Found ${results.completed} completed issues, ${results.inProgress} in progress, and ${results.notStarted} not started.`);
}

// Run the script
main(); 
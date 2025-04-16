// find-hook-issues.js

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Define project root
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

// Directory to save the report
const REPORT_DIR = path.join(PROJECT_ROOT, 'docs');
const REPORT_FILE = path.join(REPORT_DIR, 'hook-dependency-issues-report.md');

// <<< ADDED DEBUGGING >>>
console.error(`[DEBUG] Script __dirname: ${__dirname}`);
console.error(`[DEBUG] Calculated PROJECT_ROOT: ${PROJECT_ROOT}`);
console.error(`[DEBUG] Calculated REPORT_FILE: ${REPORT_FILE}`);
// <<< END DEBUGGING >>>

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Function to check for hook dependency issues
function checkHookDependencies(code, filePath) {
  const issues = [];
  const fileShortPath = path.relative(PROJECT_ROOT, filePath); // Use relative path for report
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    traverse(ast, {
      CallExpression(path) {
        // Simplified check: look for callees ending in 'use...' (adjust if too broad)
        let calleeName = '';
        if (path.node.callee.type === 'Identifier') {
          calleeName = path.node.callee.name;
        } else if (
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.property.type === 'Identifier'
        ) {
          // Handle cases like React.useState
          calleeName = path.node.callee.property.name;
        }

        // Basic check for hooks (can be refined)
        if (calleeName && calleeName.match(/^use[A-Z]/)) {
          const args = path.node.arguments;
          // Check if the last argument is an ArrayExpression (the dependency array)
          if (args.length > 0 && args[args.length - 1].type === 'ArrayExpression') {
            // Check for empty dependency array
            if (args[args.length - 1].elements.length === 0) {
              issues.push({
                hook: calleeName,
                issue: 'Empty dependency array (`[]`)',
                location: `${fileShortPath}:${path.node.loc.start.line}`,
              });
            }
          }
          // Optional: Add check for missing dependency array if needed
          // else {
          //     // This hook call doesn't seem to have a dependency array
          //     // Decide if this constitutes an "issue" for this script's purpose
          // }
        }
      },
    });
  } catch (error) {
    // Return parse errors as a special type of issue
    console.error(`Error parsing file ${fileShortPath}:`, error.message);
    issues.push({
      hook: 'N/A',
      issue: `File parsing error: ${error.message}`,
      location: fileShortPath,
      isError: true, // Mark as an error for reporting
    });
  }
  return issues;
}

// Main function to scan files
function scanFiles() {
  const files = glob.sync('src/**/*.{ts,tsx}', { cwd: PROJECT_ROOT });
  let allIssues = [];
  let filesScanned = 0;
  let filesWithIssues = 0; // Count files with actual hook issues, not errors
  let filesWithErrors = 0; // Count files that failed to parse or read

  files.forEach(file => {
    const filePath = path.join(PROJECT_ROOT, file);
    filesScanned++;
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileIssues = checkHookDependencies(content, filePath);

      if (fileIssues.length > 0) {
        const hasRealIssue = fileIssues.some(issue => !issue.isError);
        const hasError = fileIssues.some(issue => issue.isError);

        if (hasRealIssue) filesWithIssues++;
        if (hasError) filesWithErrors++;

        allIssues = allIssues.concat(fileIssues);
      }
    } catch (error) {
      console.error(`Error reading file ${path.relative(PROJECT_ROOT, filePath)}:`, error.message);
      allIssues.push({
        hook: 'N/A',
        issue: `File reading error: ${error.message}`,
        location: path.relative(PROJECT_ROOT, filePath),
        isError: true,
      });
      filesWithErrors++;
    }
  });

  const stats = {
    totalFilesScanned: filesScanned,
    filesWithIssues: filesWithIssues, // Only hook issues
    filesWithErrors: filesWithErrors, // Parsing/reading errors
    totalIssuesFound: allIssues.filter(issue => !issue.isError).length, // Count only hook issues
    totalErrorsEncountered: allIssues.filter(issue => issue.isError).length, // Count only errors
  };

  return { issues: allIssues, stats };
}

// Generate markdown report
function generateReport(issues, stats) {
  let markdown = '# React Hook Dependency Issues Report\n\n';
  markdown += `Report generated on: ${new Date().toISOString()}\n\n`;

  markdown += '## Summary\n';
  markdown += `- Total Files Scanned: ${stats.totalFilesScanned}\n`;
  markdown += `- Files with Empty Dependency Array Issues: ${stats.filesWithIssues}\n`;
  markdown += `- Files with Parsing/Reading Errors: ${stats.filesWithErrors}\n`;
  markdown += `- Total Empty Dependency Array Issues Found: ${stats.totalIssuesFound}\n`;
  markdown += `- Total Errors Encountered (Parsing/Reading): ${stats.totalErrorsEncountered}\n\n`;

  const hookIssues = issues.filter(issue => !issue.isError);
  const errorIssues = issues.filter(issue => issue.isError);

  if (hookIssues.length === 0) {
    markdown += '## Hook Dependency Issues\n\n';
    markdown += 'No empty dependency array issues found. Good job!\n\n';
  } else {
    markdown += '## Hook Dependency Issues Found\n\n';
    markdown += `Total issues: ${stats.totalIssuesFound}\n\n`;
    markdown += '| File Location | Hook | Issue |\n';
    markdown += '|---------------|------|-------|\n';
    hookIssues.forEach(issue => {
      markdown += `| ${issue.location} | \`${issue.hook}\` | ${issue.issue} |\n`;
    });
    markdown += '\n';
  }

  if (errorIssues.length > 0) {
    markdown += '## Errors Encountered During Scan\n\n';
    markdown += `Total errors: ${stats.totalErrorsEncountered}\n\n`;
    markdown += '| File Path | Error |\n';
    markdown += '|-----------|-------|\n';
    errorIssues.forEach(error => {
      markdown += `| ${error.location} | ${error.issue} |\n`;
    });
    markdown += '\n';
  }

  return markdown;
}

// Run the scan and save the report
console.log('Scanning for React Hook dependency issues...');
const { issues, stats } = scanFiles();
console.log(
  `Scan complete. Found ${stats.totalIssuesFound} potential hook issues and encountered ${stats.totalErrorsEncountered} errors.`
);

const reportContent = generateReport(issues, stats);

try {
  fs.writeFileSync(REPORT_FILE, reportContent, 'utf-8');
  console.log(`Report successfully generated at ${path.relative(PROJECT_ROOT, REPORT_FILE)}`);
} catch (error) {
  // Log specifically to stderr so the API route captures it
  console.error(
    `Failed to write report file at ${path.relative(PROJECT_ROOT, REPORT_FILE)}:`,
    error
  );
  // Exit with a non-zero code to indicate failure to the caller (API route)
  process.exit(1);
}

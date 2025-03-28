/**
 * Script Import References Verification
 * 
 * This script scans the codebase for references to original script locations
 * to ensure we can safely remove the original files once all references are updated.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Get the redirects map to check for references to original files
const REDIRECTS_MAP_PATH = path.join('scripts', 'consolidated', 'script-redirects.json');
let scriptRedirects = {};

try {
  if (fs.existsSync(REDIRECTS_MAP_PATH)) {
    scriptRedirects = JSON.parse(fs.readFileSync(REDIRECTS_MAP_PATH, 'utf8'));
  } else {
    console.error('Script redirects map not found. Please run the consolidation script first.');
    process.exit(1);
  }
} catch (error) {
  console.error(`Error reading redirects map: ${error.message}`);
  process.exit(1);
}

// Directories to exclude from the search
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'build',
  'dist',
  'coverage',
  'scripts/consolidated' // Exclude the consolidated directory itself
];

// Output report paths
const REPORT_PATH = path.join('docs', 'script-import-verification.md');
const ISSUES_JSON_PATH = path.join('scripts', 'consolidated', 'import-issues.json');

// Data structure to store the results
const results = {
  referencedScripts: {},
  unusedScripts: [],
  totalReferences: 0,
  filesWithReferences: new Set(),
  scriptReferencesByFile: {}
};

/**
 * Escape a string for use in a shell command
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeShellArg(str) {
  return `'${str.replace(/'/g, "'\\''")}'`;
}

/**
 * Check for references to original script paths in the codebase
 */
function findScriptReferences() {
  console.log('Scanning for references to original script locations...');
  
  // Process each original script path from the redirects map
  for (const [originalPath, _] of Object.entries(scriptRedirects)) {
    const scriptName = path.basename(originalPath);
    const scriptDir = path.dirname(originalPath).replace(/^\/?/, '');
    
    // Create a pattern that will match both absolute and relative paths to this script
    // We need to escape special characters for grep
    const relativePattern = path.join(scriptDir, scriptName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const absolutePattern = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create the grep command to search for references
    const excludePattern = EXCLUDE_DIRS.map(dir => `--exclude-dir=${dir}`).join(' ');
    const grepCmd = `grep -r ${excludePattern} -l -E '(${relativePattern}|${absolutePattern})' .`;
    
    try {
      // Execute the grep command to find files with references
      const output = execSync(grepCmd, { encoding: 'utf8' }).trim();
      
      if (output) {
        const files = output.split('\n');
        results.filesWithReferences = new Set([...results.filesWithReferences, ...files]);
        
        // Track references by script
        results.referencedScripts[originalPath] = files.length;
        results.totalReferences += files.length;
        
        // Track references by file
        files.forEach(file => {
          if (!results.scriptReferencesByFile[file]) {
            results.scriptReferencesByFile[file] = [];
          }
          results.scriptReferencesByFile[file].push(originalPath);
        });
        
        console.log(`Found ${files.length} references to ${originalPath}`);
      } else {
        // No references found, safe to add to unused scripts
        results.unusedScripts.push(originalPath);
      }
    } catch (error) {
      // grep returns non-zero exit code when no matches are found
      results.unusedScripts.push(originalPath);
    }
  }
  
  console.log(`Found ${results.totalReferences} total references in ${results.filesWithReferences.size} files`);
  console.log(`Found ${results.unusedScripts.length} scripts with no references`);
}

/**
 * Generate a report of the script reference findings
 */
function generateReport() {
  console.log('Generating report...');
  
  // Save the JSON data for programmatic use
  fs.writeFileSync(
    ISSUES_JSON_PATH,
    JSON.stringify({
      referencedScripts: results.referencedScripts,
      unusedScripts: results.unusedScripts,
      scriptReferencesByFile: results.scriptReferencesByFile,
      totalReferences: results.totalReferences,
      filesWithReferences: Array.from(results.filesWithReferences)
    }, null, 2)
  );
  
  // Create a markdown report
  let reportContent = `# Script Import Verification Report

Date: ${new Date().toISOString().split('T')[0]}

## Summary

- **Total Original Scripts**: ${Object.keys(scriptRedirects).length}
- **Scripts Still Referenced**: ${Object.keys(results.referencedScripts).length}
- **Unused Scripts**: ${results.unusedScripts.length}
- **Total References Found**: ${results.totalReferences}
- **Files with References**: ${results.filesWithReferences.size}

## Scripts Still Referenced

The following scripts are still referenced in the codebase and should not be removed yet:

| Original Script | References | New Location |
|-----------------|------------|--------------|
`;

  // Add entries for scripts with references
  const referencedScriptsSorted = Object.entries(results.referencedScripts)
    .sort((a, b) => b[1] - a[1]); // Sort by number of references (descending)
  
  for (const [script, count] of referencedScriptsSorted) {
    const newLocation = scriptRedirects[script];
    reportContent += `| \`${script}\` | ${count} | \`${newLocation}\` |\n`;
  }

  // Add section for files with references
  reportContent += `\n## Files with References\n\nThe following files contain references to original script locations:\n\n`;

  for (const [file, scripts] of Object.entries(results.scriptReferencesByFile)) {
    reportContent += `### ${file}\n\n`;
    reportContent += `References scripts:\n\n`;
    
    for (const script of scripts) {
      reportContent += `- \`${script}\` → \`${scriptRedirects[script]}\`\n`;
    }
    
    reportContent += '\n';
  }

  // Add section for unused scripts
  reportContent += `\n## Safe to Remove\n\nThe following scripts have no references in the codebase and can be safely removed:\n\n`;
  
  for (const script of results.unusedScripts) {
    reportContent += `- \`${script}\` → \`${scriptRedirects[script]}\`\n`;
  }

  // Add next steps
  reportContent += `\n## Next Steps\n\n1. Update references in the ${results.filesWithReferences.size} files identified above
2. Re-run this verification script
3. Once no more references are found, remove the original script files
4. Update documentation to reflect the new script organization\n`;

  // Write the report
  fs.writeFileSync(REPORT_PATH, reportContent);
  console.log(`Report generated at ${REPORT_PATH}`);
}

/**
 * Main function
 */
function main() {
  console.log('Starting script import verification...');
  
  findScriptReferences();
  generateReport();
  
  console.log('Script import verification completed.');
}

// Run the main function
main(); 
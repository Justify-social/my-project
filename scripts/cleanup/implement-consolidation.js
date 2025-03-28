/**
 * Script Consolidation Implementation
 * 
 * This script implements the consolidation suggestions from the analysis report.
 * It moves scripts to their appropriate consolidated directories and updates
 * any references to them.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Define the mapping of script categories to consolidated directories
const categoryDirs = {
  'icon': 'scripts/consolidated/icons',
  'build': 'scripts/consolidated/build',
  'test': 'scripts/consolidated/testing',
  'lint': 'scripts/consolidated/linting',
  'doc': 'scripts/consolidated/documentation',
  'utils': 'scripts/consolidated/utils',
  'cleanup': 'scripts/consolidated/cleanup',
  'analyze': 'scripts/consolidated/utils', // Map to utils for now
  'deploy': 'scripts/consolidated/build', // Map to build for now
  'db': 'scripts/consolidated/utils', // Map to utils for now
  'other': 'scripts/consolidated/utils' // Map to utils for now
};

// Function to read the report and extract script paths by category
function extractScriptsByCategory() {
  const reportPath = 'scripts/consolidated/scripts-consolidation-report.md';
  if (!fs.existsSync(reportPath)) {
    console.error('Consolidation report not found.');
    process.exit(1);
  }
  
  const report = fs.readFileSync(reportPath, 'utf8');
  
  // Parse the report to get scripts by category
  const scriptsByCategory = {};
  
  // Initialize categories
  Object.keys(categoryDirs).forEach(category => {
    scriptsByCategory[category] = [];
  });
  
  // Extract scripts using regex patterns
  // This regex matches sections like "icon (98)" followed by script paths
  const categoryRegex = /(\w+) \((\d+)\)([\s\S]*?)(?=\n\n\w+ \(\d+\)|$)/g;
  let match;
  
  while ((match = categoryRegex.exec(report)) !== null) {
    const category = match[1];
    const scriptsSection = match[3];
    
    // Extract file paths from the section
    const pathRegex = /- (\/[^\n]+)/g;
    let pathMatch;
    
    while ((pathMatch = pathRegex.exec(scriptsSection)) !== null) {
      const filePath = pathMatch[1].trim();
      // Check if file exists and is not already processed
      if (fs.existsSync(filePath) && !isInConsolidatedDir(filePath)) {
        if (category in scriptsByCategory) {
          scriptsByCategory[category].push(filePath);
        } else {
          scriptsByCategory['other'].push(filePath);
        }
      }
    }
  }
  
  console.log('Extracted script categorization from report:');
  Object.entries(scriptsByCategory).forEach(([category, scripts]) => {
    console.log(`  ${category}: ${scripts.length} scripts`);
  });
  
  return scriptsByCategory;
}

// Check if a file is already in one of the consolidated directories
function isInConsolidatedDir(filePath) {
  return filePath.includes('scripts/consolidated/');
}

// Function to move a script to its consolidated directory
function moveScript(sourcePath, category) {
  const targetDir = categoryDirs[category];
  if (!targetDir) {
    console.warn(`No target directory defined for category: ${category}`);
    return false;
  }
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const fileName = path.basename(sourcePath);
  const targetPath = path.join(targetDir, fileName);
  
  // Skip if target file already exists
  if (fs.existsSync(targetPath)) {
    console.log(`Target file already exists: ${targetPath}`);
    return false;
  }
  
  try {
    // Copy the file instead of moving to avoid breaking existing references immediately
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${sourcePath} to ${targetPath}`);
    
    // Add an entry to the redirects file
    addToRedirectsFile(sourcePath, targetPath);
    
    return true;
  } catch (error) {
    console.error(`Error copying ${sourcePath} to ${targetPath}: ${error.message}`);
    return false;
  }
}

// Create a file to track redirections for future reference
function addToRedirectsFile(sourcePath, targetPath) {
  const redirectsPath = 'scripts/consolidated/script-redirects.json';
  let redirects = {};
  
  if (fs.existsSync(redirectsPath)) {
    try {
      redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
    } catch (e) {
      console.warn(`Error reading redirects file: ${e.message}`);
      redirects = {};
    }
  }
  
  redirects[sourcePath] = targetPath;
  
  fs.writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2));
}

// Function to update references to moved scripts in package.json
function updatePackageJsonReferences() {
  console.log('Updating references in package.json...');
  
  const packageJsonPath = 'package.json';
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found');
    return;
  }
  
  // Backup package.json
  fs.copyFileSync(packageJsonPath, `${packageJsonPath}.bak`);
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const redirectsPath = 'scripts/consolidated/script-redirects.json';
    
    if (!fs.existsSync(redirectsPath)) {
      console.warn('Redirects file not found. Skipping package.json update.');
      return;
    }
    
    const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
    let changesMade = false;
    
    if (packageJson.scripts) {
      // Iterate through scripts and replace paths
      Object.entries(packageJson.scripts).forEach(([scriptName, scriptCommand]) => {
        Object.entries(redirects).forEach(([sourcePath, targetPath]) => {
          // Create regex pattern that matches the script path outside of the "node " prefix
          const pattern = new RegExp(`(node\\s+)${sourcePath.replace(/\//g, '\\/')}(\\s|$)`);
          if (pattern.test(scriptCommand)) {
            packageJson.scripts[scriptName] = scriptCommand.replace(pattern, `$1${targetPath}$2`);
            console.log(`Updated script "${scriptName}" with new path: ${targetPath}`);
            changesMade = true;
          }
        });
      });
    }
    
    if (changesMade) {
      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Successfully updated package.json with new script paths');
    } else {
      console.log('No changes needed in package.json');
    }
  } catch (error) {
    console.error(`Error updating package.json: ${error.message}`);
    // Restore backup on error
    fs.copyFileSync(`${packageJsonPath}.bak`, packageJsonPath);
  }
}

// Main function to implement consolidation
function consolidateScripts() {
  console.log('Starting script consolidation implementation...');
  
  // Get categorized scripts
  const scriptsByCategory = extractScriptsByCategory();
  
  // Move scripts to their consolidated directories
  let movedCount = 0;
  for (const [category, scripts] of Object.entries(scriptsByCategory)) {
    console.log(`Processing ${scripts.length} scripts for category: ${category}`);
    for (const script of scripts) {
      if (moveScript(script, category)) {
        movedCount++;
      }
    }
  }
  
  console.log(`Moved ${movedCount} scripts to consolidated directories.`);
  
  // Update package.json references
  updatePackageJsonReferences();
  
  // Generate a summary report
  generateConsolidationReport(movedCount);
  
  console.log('Script consolidation implementation completed.');
}

// Generate a summary report of the consolidation
function generateConsolidationReport(movedCount) {
  const reportPath = 'docs/script-consolidation-report.md';
  
  const reportContent = `# Script Consolidation Report
  
Date: ${new Date().toISOString().split('T')[0]}

## Summary

- ${movedCount} scripts moved to consolidated directories
- Script references updated in package.json
- Redirection mapping created for future reference at \`scripts/consolidated/script-redirects.json\`

## Directory Structure

The scripts have been consolidated into the following directory structure:

\`\`\`
scripts/consolidated/
├── build/        # Build, bundling, and deployment scripts
├── cleanup/      # Cleanup and maintenance scripts
├── documentation/# Documentation generation scripts
├── icons/        # Icon-related scripts
├── linting/      # Code quality and linting scripts
├── testing/      # Testing and validation scripts
└── utils/        # Utility scripts
\`\`\`

## Next Steps

1. Update any remaining imports in code that reference the old script locations
2. Remove original script files after confirming all references are updated
3. Add index files for each script category to provide easier access
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Generated consolidation report at ${reportPath}`);
}

// Run the consolidation
consolidateScripts(); 
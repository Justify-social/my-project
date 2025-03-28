#!/usr/bin/env node

/**
 * Test Scripts Consolidation
 * 
 * This script analyzes, categorizes, and consolidates test-related scripts
 * across the codebase into a structured directory under /scripts/testing/
 * 
 * Usage:
 *   node scripts/cleanup/consolidate-test-scripts.js [--dry-run] [--auto-consolidate]
 * 
 * Options:
 *   --dry-run         Show what would be done without making changes
 *   --auto-consolidate Automatically consolidate scripts based on recommendations
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import execSync from 'child_process';

// Color formatting for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Command line options
const options = {
  dryRun: process.argv.includes('--dry-run'),
  autoConsolidate: process.argv.includes('--auto-consolidate')
};

// Test script categories
const testCategories = {
  'api': ['api', 'endpoint', 'http', 'rest', 'graphql', 'request'],
  'ui': ['ui', 'component', 'visual', 'dom', 'render', 'react', 'vue'],
  'e2e': ['e2e', 'end-to-end', 'browser', 'selenium', 'cypress', 'puppeteer'],
  'unit': ['unit', 'jest', 'mocha', 'spec'],
  'integration': ['integration', 'combine', 'interop'],
  'performance': ['performance', 'perf', 'benchmark', 'speed', 'timing'],
  'mock': ['mock', 'stub', 'fake', 'fixture', 'data'],
};

// Target consolidated directory
const TARGET_DIR = 'scripts/testing';

// Utility to calculate file hash for comparison
function calculateFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error(`Error calculating hash for ${filePath}:`, error.message);
    return null;
  }
}

// Determine the category of a test script
function determineTestCategory(filePath, fileContent) {
  const fileName = path.basename(filePath).toLowerCase();
  const fileContentLower = fileContent.toLowerCase();
  
  for (const [category, keywords] of Object.entries(testCategories)) {
    for (const keyword of keywords) {
      if (fileName.includes(keyword) || fileContentLower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'other';
}

// Check if a file is a test script
function isTestScript(filePath, fileContent) {
  const fileName = path.basename(filePath).toLowerCase();
  const testKeywords = ['test', 'spec', 'check', 'verify', 'validate', 'assert', 'should'];
  
  // Check filename
  if (testKeywords.some(keyword => fileName.includes(keyword))) {
    return true;
  }
  
  // Check file content for testing imports/frameworks
  const testingLibraries = [
    'jest', 'mocha', 'chai', 'cypress', 'test', 'assert', 'puppeteer', 
    'selenium', 'testing-library', 'enzyme', 'vitest', 'supertest'
  ];
  
  return testingLibraries.some(lib => 
    fileContent.includes(`require('${lib}')`) || 
    fileContent.includes(`from '${lib}'`) ||
    fileContent.includes(`import ${lib}`) ||
    fileContent.includes(`describe(`) ||
    fileContent.includes(`it(`) ||
    fileContent.includes(`test(`));
}

// Read script metadata and description
function readScriptInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const firstCommentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    
    let description = 'No description';
    if (firstCommentMatch) {
      const comment = firstCommentMatch[1];
      const descriptionMatch = comment.match(/\*\s*(.*?)[\r\n]/);
      if (descriptionMatch) {
        description = descriptionMatch[1].trim();
      }
    }
    
    return {
      path: filePath,
      name: path.basename(filePath),
      description,
      content,
      hash: calculateFileHash(filePath),
      size: fs.statSync(filePath).size,
      lastModified: fs.statSync(filePath).mtime,
      category: determineTestCategory(filePath, content),
      isTestScript: isTestScript(filePath, content)
    };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Find test scripts in the codebase
function findTestScripts() {
  console.log(`${colors.bold}Scanning for test scripts in the codebase...${colors.reset}`);
  
  // Get all JavaScript files in the scripts directory
  let scriptFiles = [];
  try {
    // Find all JS files in the scripts directory
    const scriptFilesRaw = execSync('find scripts -type f -name "*.js"', { encoding: 'utf8' });
    scriptFiles = scriptFilesRaw.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding script files:', error.message);
    return [];
  }
  
  console.log(`${colors.green}Found ${scriptFiles.length} JavaScript files in scripts directory${colors.reset}`);
  
  // Process each file to check if it's a test script
  const allScripts = scriptFiles
    .map(filePath => readScriptInfo(filePath))
    .filter(Boolean);
  
  const testScripts = allScripts.filter(script => script.isTestScript);
  
  console.log(`${colors.green}Identified ${testScripts.length} test scripts${colors.reset}`);
  return { allScripts, testScripts };
}

// Create target directory structure
function createDirectoryStructure() {
  if (options.dryRun) {
    console.log(`${colors.yellow}[DRY RUN] Would create directory structure:${colors.reset}`);
    console.log(`${colors.yellow}[DRY RUN] - ${TARGET_DIR}${colors.reset}`);
    
    for (const category of Object.keys(testCategories)) {
      console.log(`${colors.yellow}[DRY RUN] - ${TARGET_DIR}/${category}${colors.reset}`);
    }
    
    return;
  }
  
  // Create main directory
  if (!fs.existsSync(TARGET_DIR)) {
    console.log(`${colors.green}Creating directory: ${TARGET_DIR}${colors.reset}`);
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  
  // Create category subdirectories
  for (const category of Object.keys(testCategories)) {
    const categoryDir = `${TARGET_DIR}/${category}`;
    if (!fs.existsSync(categoryDir)) {
      console.log(`${colors.green}Creating directory: ${categoryDir}${colors.reset}`);
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  }
  
  // Create 'other' category for uncategorized tests
  const otherDir = `${TARGET_DIR}/other`;
  if (!fs.existsSync(otherDir)) {
    console.log(`${colors.green}Creating directory: ${otherDir}${colors.reset}`);
    fs.mkdirSync(otherDir, { recursive: true });
  }
}

// Copy a script to the target location
function copyScript(script, targetPath) {
  if (options.dryRun) {
    console.log(`${colors.yellow}[DRY RUN] Would copy: ${script.path} -> ${targetPath}${colors.reset}`);
    return;
  }
  
  try {
    // Check if target file already exists
    if (fs.existsSync(targetPath)) {
      const targetStat = fs.statSync(targetPath);
      const sourceStat = fs.statSync(script.path);
      
      // If target is newer, don't overwrite
      if (targetStat.mtime > sourceStat.mtime) {
        console.log(`${colors.cyan}Skipping: ${targetPath} (target is newer)${colors.reset}`);
        return;
      }
    }
    
    // Create directory if it doesn't exist
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy file
    fs.copyFileSync(script.path, targetPath);
    console.log(`${colors.green}Copied: ${script.path} -> ${targetPath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error copying ${script.path}:${colors.reset}`, error.message);
  }
}

// Consolidate scripts based on categories
function consolidateScripts(testScripts) {
  console.log(`\n${colors.bold}Consolidating ${testScripts.length} test scripts...${colors.reset}`);
  
  // Create directory structure first
  createDirectoryStructure();
  
  const stats = {
    copied: 0,
    skipped: 0,
    errors: 0
  };
  
  // Process each test script
  for (const script of testScripts) {
    const fileName = script.name;
    const category = script.category;
    const targetPath = `${TARGET_DIR}/${category}/${fileName}`;
    
    try {
      copyScript(script, targetPath);
      stats.copied++;
    } catch (error) {
      console.error(`${colors.red}Error processing ${script.path}:${colors.reset}`, error.message);
      stats.errors++;
    }
  }
  
  // Display stats
  console.log(`\n${colors.bold}Consolidation Summary:${colors.reset}`);
  console.log(`${colors.green}Scripts copied: ${stats.copied}${colors.reset}`);
  console.log(`${colors.yellow}Scripts skipped: ${stats.skipped}${colors.reset}`);
  console.log(`${colors.red}Errors: ${stats.errors}${colors.reset}`);
}

// Create index.js for the testing directory
function createIndexFile(testScripts) {
  const indexPath = `${TARGET_DIR}/index.js`;
  if (options.dryRun) {
    console.log(`${colors.yellow}[DRY RUN] Would create index file: ${indexPath}${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.bold}Creating index file for testing directory...${colors.reset}`);
  
  // Group scripts by category
  const scriptsByCategory = {};
  for (const script of testScripts) {
    if (!scriptsByCategory[script.category]) {
      scriptsByCategory[script.category] = [];
    }
    scriptsByCategory[script.category].push(script);
  }
  
  // Generate index file content
  let indexContent = `#!/usr/bin/env node

/**
 * Testing Scripts Directory Explorer
 * 
 * This script provides an overview of all testing scripts available in the codebase.
 * It shows scripts organized by category and provides usage instructions.
 * 
 * Usage:
 *   node scripts/testing/index.js [category]
 * 
 * Examples:
 *   node scripts/testing/index.js         # List all categories
 *   node scripts/testing/index.js api     # List API testing scripts
 */

import fs from 'fs';
import path from 'path';

// Color formatting
const colors = {
  reset: '\\x1b[0m',
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  magenta: '\\x1b[35m',
  cyan: '\\x1b[36m',
  bold: '\\x1b[1m'
};

// Available test script categories
const categories = {
`;

  // Add categories and their descriptions
  for (const category of Object.keys(testCategories)) {
    let description = '';
    switch (category) {
      case 'api': description = 'API and endpoint testing'; break;
      case 'ui': description = 'UI and component testing'; break;
      case 'e2e': description = 'End-to-end browser testing'; break;
      case 'unit': description = 'Unit tests for individual functions'; break;
      case 'integration': description = 'Integration testing between components'; break;
      case 'performance': description = 'Performance and benchmark testing'; break;
      case 'mock': description = 'Mock data and test fixtures'; break;
      default: description = 'Other testing utilities';
    }
    
    indexContent += `  '${category}': '${description}',\n`;
  }
  
  indexContent += `  'other': 'Other testing utilities'\n};\n\n`;
  
  // Add script information
  indexContent += `// Available testing scripts
const testingScripts = {\n`;
  
  for (const category of Object.keys(scriptsByCategory)) {
    const scripts = scriptsByCategory[category];
    
    indexContent += `  // ${category.toUpperCase()} TESTING SCRIPTS\n`;
    for (const script of scripts) {
      const description = script.description.replace(/'/g, "\\'");
      indexContent += `  '${path.relative('scripts', script.path)}': '${description}',\n`;
    }
    indexContent += '\n';
  }
  
  indexContent += `};\n\n`;
  
  // Add display function
  indexContent += `// Display available scripts
function displayScripts() {
  const category = process.argv[2];
  
  // If category specified, show only that category
  if (category && categories[category]) {
    console.log(\`\${colors.bold}TESTING SCRIPTS: \${category.toUpperCase()} TESTING\${colors.reset}\\n\`);
    console.log(\`\${colors.cyan}\${categories[category]}\${colors.reset}\\n\`);
    
    Object.entries(testingScripts).forEach(([script, description]) => {
      if (script.includes(\`/\${category}/\`)) {
        console.log(\`\${colors.green}\${script}\${colors.reset}\`);
        console.log(\`  \${description}\\n\`);
      }
    });
    
    console.log(\`Run a script: \${colors.yellow}node <script_path>\${colors.reset}\\n\`);
    return;
  }
  
  // Show all categories
  console.log(\`\${colors.bold}TESTING SCRIPTS CATEGORIES\${colors.reset}\\n\`);
  
  Object.entries(categories).forEach(([category, description]) => {
    const count = Object.keys(testingScripts).filter(script => 
      script.includes(\`/\${category}/\`)).length;
    
    console.log(\`\${colors.green}\${category}\${colors.reset} (\${count} scripts)\`);
    console.log(\`  \${description}\\n\`);
  });
  
  console.log(\`To see scripts in a category: \${colors.yellow}node scripts/testing/index.js <category>\${colors.reset}\\n\`);
}

// Run main function
displayScripts();\n`;

  try {
    fs.writeFileSync(indexPath, indexContent);
    console.log(`${colors.green}Created index file: ${indexPath}${colors.reset}`);
    
    // Make it executable
    try {
      fs.chmodSync(indexPath, '755');
      console.log(`${colors.green}Made index file executable${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error making index file executable:${colors.reset}`, error.message);
    }
  } catch (error) {
    console.error(`${colors.red}Error creating index file:${colors.reset}`, error.message);
  }
}

// Create README.md for the testing directory
function createReadme(testScripts) {
  const readmePath = `${TARGET_DIR}/README.md`;
  if (options.dryRun) {
    console.log(`${colors.yellow}[DRY RUN] Would create README: ${readmePath}${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.bold}Creating README for testing directory...${colors.reset}`);
  
  // Group scripts by category
  const scriptsByCategory = {};
  for (const script of testScripts) {
    if (!scriptsByCategory[script.category]) {
      scriptsByCategory[script.category] = [];
    }
    scriptsByCategory[script.category].push(script);
  }
  
  // Generate README content
  let readmeContent = `# Testing Scripts

This directory contains scripts for testing various aspects of the codebase.

## Directory Structure

\`\`\`
/scripts/testing/
├── index.js                    # Directory explorer
├── api/                        # API testing scripts
├── ui/                         # UI testing scripts
├── e2e/                        # End-to-end testing scripts
├── unit/                       # Unit testing utilities
├── integration/                # Integration testing scripts
├── performance/                # Performance testing scripts
├── mock/                       # Mock data and test fixtures
└── other/                      # Other testing utilities
\`\`\`

## Available Scripts

`;

  // Add script lists by category
  for (const category of Object.keys(scriptsByCategory)) {
    const scripts = scriptsByCategory[category];
    const categoryDesc = {
      'api': 'API Testing',
      'ui': 'UI Testing',
      'e2e': 'End-to-End Testing',
      'unit': 'Unit Testing',
      'integration': 'Integration Testing',
      'performance': 'Performance Testing',
      'mock': 'Mock Data & Fixtures',
      'other': 'Other Testing Utilities'
    }[category] || category.toUpperCase();
    
    readmeContent += `### ${categoryDesc}\n\n`;
    
    if (scripts.length === 0) {
      readmeContent += 'No scripts in this category yet.\n\n';
      continue;
    }
    
    for (const script of scripts) {
      readmeContent += `- **${script.name}**: ${script.description}\n`;
    }
    
    readmeContent += '\n';
  }
  
  // Add usage instructions
  readmeContent += `## Usage

You can explore available scripts using the included index.js:

\`\`\`bash
# List all categories
node scripts/testing/index.js

# List scripts in a specific category
node scripts/testing/index.js api
\`\`\`

## Adding New Testing Scripts

When adding new testing scripts:

1. Place them in the appropriate category directory
2. Include a JSDoc comment at the top describing the script's purpose
3. Follow the same command-line argument patterns as existing scripts
4. Update this README if adding a new category

## Continuous Integration

Many of these scripts are used in our CI/CD pipeline. See the CI configuration 
files for details on which scripts are run during integration testing.
`;

  try {
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`${colors.green}Created README: ${readmePath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error creating README:${colors.reset}`, error.message);
  }
}

// Main function
function main() {
  console.log(`${colors.bold}Test Scripts Consolidation Tool${colors.reset}`);
  console.log(`${colors.cyan}Options: ${options.dryRun ? 'Dry Run' : 'Live Mode'}, Auto-Consolidate: ${options.autoConsolidate}${colors.reset}`);
  
  // Find test scripts
  const { allScripts, testScripts } = findTestScripts();
  
  // Do nothing if no test scripts found
  if (testScripts.length === 0) {
    console.log(`${colors.yellow}No test scripts found. Exiting.${colors.reset}`);
    return;
  }
  
  // Group scripts by category
  const scriptsByCategory = {};
  for (const script of testScripts) {
    if (!scriptsByCategory[script.category]) {
      scriptsByCategory[script.category] = [];
    }
    scriptsByCategory[script.category].push(script);
  }
  
  // Print summary of found scripts
  console.log(`\n${colors.bold}Found ${testScripts.length} test scripts in ${Object.keys(scriptsByCategory).length} categories:${colors.reset}`);
  for (const [category, scripts] of Object.entries(scriptsByCategory)) {
    console.log(`- ${colors.cyan}${category}:${colors.reset} ${scripts.length} scripts`);
  }
  
  // Consolidate scripts if auto-consolidate is enabled
  if (options.autoConsolidate || !options.dryRun) {
    consolidateScripts(testScripts);
    createIndexFile(testScripts);
    createReadme(testScripts);
  } else {
    console.log(`\n${colors.yellow}[DRY RUN] Run with --auto-consolidate to perform consolidation${colors.reset}`);
  }
  
  // Print final summary
  console.log(`\n${colors.bold}Final Summary:${colors.reset}`);
  console.log(`${colors.cyan}Total scripts analyzed: ${allScripts.length}${colors.reset}`);
  console.log(`${colors.cyan}Test scripts identified: ${testScripts.length}${colors.reset}`);
  console.log(`${colors.cyan}Categories found: ${Object.keys(scriptsByCategory).length}${colors.reset}`);
  
  // Print next steps
  console.log(`\n${colors.bold}Next Steps:${colors.reset}`);
  if (options.dryRun) {
    console.log(`1. Run with ${colors.yellow}--auto-consolidate${colors.reset} to perform the consolidation`);
  } else {
    console.log(`1. Review the consolidated scripts in ${colors.green}${TARGET_DIR}${colors.reset}`);
    console.log(`2. Update any build processes to use the new script locations`);
  }
  console.log(`3. Update documentation to reference new script locations`);
}

// Run the script
main(); 
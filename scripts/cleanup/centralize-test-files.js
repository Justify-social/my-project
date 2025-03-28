/**
 * Test Centralization Script
 * 
 * This script identifies scattered test files throughout the codebase
 * and relocates them to a centralized test directory structure.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const TEST_EXTENSIONS = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];
const TARGET_TEST_DIR = 'src/__tests__';

// Utility functions
const log = (message) => console.log(`\x1b[36m[Test Centralization]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

/**
 * Find all test files in the codebase
 * @returns {Array<string>} - List of test file paths
 */
function findTestFiles() {
  // Create patterns for test files
  const patterns = TEST_EXTENSIONS.map(ext => `src/**/*${ext}`);
  
  // Directories to exclude
  const excludePatterns = [
    'src/__tests__/**',
    'src/node_modules/**',
    '.next/**',
    'node_modules/**'
  ];
  
  // Find all test files
  const testFiles = [];
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: excludePatterns });
    testFiles.push(...files);
  });
  
  return testFiles;
}

/**
 * Determine the target path for a test file
 * @param {string} sourcePath - The original path of the test file
 * @returns {string} - The path where the test file should be moved
 */
function getTargetPath(sourcePath) {
  // Extract directory structure
  const relativePath = sourcePath.replace(/^src\//, '');
  const filename = path.basename(relativePath);
  
  // Determine the directory structure within the __tests__ folder
  let targetDir;
  
  if (relativePath.includes('components/')) {
    // For component tests
    const componentType = relativePath.includes('components/layouts') 
      ? 'layouts'
      : relativePath.includes('components/ui')
        ? 'ui'
        : 'features';
    
    // Extract the component directory path
    const match = relativePath.match(/components\/([^/]+)\/(.*?)\//);
    if (match) {
      const componentCategory = match[2];
      targetDir = path.join(TARGET_TEST_DIR, 'components', componentType, componentCategory);
    } else {
      targetDir = path.join(TARGET_TEST_DIR, 'components', componentType);
    }
  } else if (relativePath.includes('hooks/')) {
    // For hook tests
    targetDir = path.join(TARGET_TEST_DIR, 'hooks');
  } else if (relativePath.includes('utils/')) {
    // For utility tests
    targetDir = path.join(TARGET_TEST_DIR, 'utils');
  } else if (relativePath.includes('contexts/')) {
    // For context tests
    targetDir = path.join(TARGET_TEST_DIR, 'contexts');
  } else if (relativePath.includes('lib/')) {
    // For lib tests
    targetDir = path.join(TARGET_TEST_DIR, 'lib');
  } else if (relativePath.includes('services/')) {
    // For service tests
    targetDir = path.join(TARGET_TEST_DIR, 'services');
  } else {
    // For other tests
    targetDir = path.join(TARGET_TEST_DIR, 'other');
  }
  
  return path.join(targetDir, filename);
}

/**
 * Move a test file to its new location
 * @param {string} sourcePath - Original path of the test file
 * @param {string} targetPath - Target path for the test file
 * @returns {Object} - Result of the operation
 */
function moveTestFile(sourcePath, targetPath) {
  try {
    // Create target directory if it doesn't exist
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Read test file content
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    // Update imports if needed
    const updatedContent = updateTestImports(content, sourcePath, targetPath);
    
    // Write to new location
    fs.writeFileSync(targetPath, updatedContent);
    
    // Remove original file
    fs.unlinkSync(sourcePath);
    
    success(`Moved test file: ${sourcePath} -> ${targetPath}`);
    
    return {
      source: sourcePath,
      target: targetPath,
      success: true
    };
  } catch (err) {
    error(`Failed to move test file ${sourcePath}: ${err.message}`);
    return {
      source: sourcePath,
      target: targetPath,
      success: false,
      error: err.message
    };
  }
}

/**
 * Update the imports in a test file to reflect its new location
 * @param {string} content - The content of the test file
 * @param {string} sourcePath - The original path of the test file
 * @param {string} targetPath - The target path for the test file
 * @returns {string} - The updated content
 */
function updateTestImports(content, sourcePath, targetPath) {
  // Calculate the depth difference to adjust relative imports
  const sourceDepth = sourcePath.split('/').length;
  const targetDepth = targetPath.split('/').length;
  const depthDifference = targetDepth - sourceDepth;
  
  // Update relative imports
  let updatedContent = content.replace(
    /from\s+['"]\.\.?\/(.*?)['"]/g,
    (match, importPath) => {
      // Add additional '../' for each level deeper
      const prefix = '../'.repeat(depthDifference + 1);
      return `from '${prefix}${importPath}'`;
    }
  );
  
  // Convert relative imports to absolute imports where possible
  updatedContent = updatedContent.replace(
    /from\s+['"]\.\.?\/(?:\.\.\/)*(?:components|hooks|utils|contexts|lib|services)\/(.*?)['"]/g,
    (match, importPath) => {
      // Get the import type
      const importType = match.match(/\/(?:components|hooks|utils|contexts|lib|services)\//)[0].replace(/\//g, '');
      return `from '@/${importType}/${importPath}'`;
    }
  );
  
  return updatedContent;
}

/**
 * Create a report of the test centralization process
 * @param {Array<Object>} results - Results of the centralization operations
 */
function createReport(results) {
  const reportContent = `# Test Centralization Report

## Summary
- Total test files processed: ${results.length}
- Successfully moved: ${results.filter(r => r.success).length}
- Failed: ${results.filter(r => !r.success).length}

## Successfully Moved Test Files
${results.filter(r => r.success).map(r => `- ✅ \`${r.source}\` -> \`${r.target}\``).join('\n')}

## Failed Moves
${results.filter(r => !r.success).map(r => `- ❌ \`${r.source}\`: ${r.error}`).join('\n')}

## Test Directory Structure
The new centralized test structure organizes tests by module type:

\`\`\`
src/__tests__/
├── components/
│   ├── features/
│   ├── layouts/
│   └── ui/
├── contexts/
├── hooks/
├── lib/
├── services/
└── utils/
\`\`\`

This structure ensures:
1. Tests are consistently located and easy to find
2. Test organization mirrors the codebase structure
3. Better separation between tests and implementation
`;

  fs.writeFileSync('docs/project-history/test-centralization-report.md', reportContent);
  success(`Report written to docs/project-history/test-centralization-report.md`);
}

/**
 * Main function to run the script
 */
async function main() {
  // Create git backup before making changes
  try {
    execSync('git branch -D test-centralization-backup 2>/dev/null || true', { stdio: 'pipe' });
    execSync('git checkout -b test-centralization-backup', { stdio: 'pipe' });
    execSync('git checkout -', { stdio: 'pipe' });
    success(`Created backup branch: test-centralization-backup`);
  } catch (err) {
    warning(`Could not create git backup branch: ${err.message}`);
  }
  
  // Find all test files
  const testFiles = findTestFiles();
  log(`Found ${testFiles.length} test files to centralize`);
  
  // Move test files
  const results = [];
  for (const sourcePath of testFiles) {
    const targetPath = getTargetPath(sourcePath);
    const result = moveTestFile(sourcePath, targetPath);
    results.push(result);
  }
  
  // Create a report
  createReport(results);
  
  // Final summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  log(`Test centralization completed.`);
  success(`Successfully moved ${successCount} test files.`);
  if (failCount > 0) {
    error(`Failed to move ${failCount} test files. See the report for details.`);
  }
}

// Run the script
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 
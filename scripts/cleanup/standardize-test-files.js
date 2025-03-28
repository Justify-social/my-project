/**
 * Test File Standardization Script
 * 
 * This script standardizes test files by:
 * 1. Ensuring consistent kebab-case naming with .test.ts/tsx suffix
 * 2. Moving tests to their appropriate __tests__ directories
 * 3. Updating import references
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Utility functions
const log = (message) => console.log(`\x1b[36m[Test Standardization]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
  return str
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Replace underscores with hyphens
    .replace(/_/g, '-')
    // Replace periods with hyphens (except file extensions)
    .replace(/\.(?![\w]+$)/g, '-')
    // Handle camelCase/PascalCase -> kebab-case
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Convert to lowercase
    .toLowerCase();
}

/**
 * Standardize test file naming
 * @param {string} filePath - Original file path
 * @returns {string} - Standardized file name
 */
function standardizeTestFileName(filePath) {
  const dirname = path.dirname(filePath);
  const basename = path.basename(filePath);
  
  // Handle -test.ts/tsx pattern
  if (basename.match(/-test\.(ts|tsx|js|jsx)$/)) {
    return toKebabCase(basename.replace(/-test\.(ts|tsx|js|jsx)$/, '')) + '.test.' + basename.split('.').pop();
  }
  
  // Handle .test.ts/tsx pattern - just ensure kebab case for component name
  if (basename.match(/\.test\.(ts|tsx|js|jsx)$/)) {
    const componentName = basename.replace(/\.test\.(ts|tsx|js|jsx)$/, '');
    return toKebabCase(componentName) + '.test.' + basename.split('.').pop();
  }
  
  // Handle cases without test suffix - add it
  const ext = path.extname(basename);
  const name = basename.replace(ext, '');
  return toKebabCase(name) + '.test' + ext;
}

/**
 * Get the appropriate test directory for a source file
 * @param {string} filePath - Path to the source file
 * @returns {string} - Path to the appropriate test directory
 */
function getTestDirectory(filePath) {
  const dirname = path.dirname(filePath);
  
  // If already in a __tests__ directory, leave it there
  if (dirname.includes('__tests__')) {
    return dirname;
  }
  
  // Create __tests__ directory next to the source file
  return path.join(dirname, '__tests__');
}

/**
 * Get the appropriate central test directory for a test
 * @param {string} filePath - Path to the test file
 * @returns {string} - Path to the central test directory
 */
function getCentralTestDirectory(filePath) {
  // Determine if it's an integration or unit test
  const isIntegration = filePath.includes('integration') || 
                        filePath.includes('Integration') ||
                        filePath.includes('e2e') || 
                        filePath.includes('E2E');
  
  const testType = isIntegration ? 'integration' : 'unit';
  
  // If it's in src/__tests__, maintain the directory structure
  if (filePath.startsWith('src/__tests__/')) {
    const relativePath = filePath.replace(/^src\/__tests__\/(unit|integration\/)?/, '');
    return path.join('tests', testType, path.dirname(relativePath));
  }
  
  // For component tests, create a structure mirroring the component location
  const dirPath = path.dirname(filePath);
  const relativePath = dirPath.replace(/^src\//, '').replace(/__tests__\/?/, '');
  return path.join('tests', testType, relativePath);
}

/**
 * Find all test files in the codebase
 * @returns {Array<string>} - Array of test file paths
 */
function findTestFiles() {
  // Find all test files
  const testPatterns = [
    // Files with .test.ts/tsx suffix
    'src/**/*.test.{ts,tsx,js,jsx}',
    // Files with -test.ts/tsx suffix
    'src/**/*-test.{ts,tsx,js,jsx}',
    // Files in __tests__ directories
    'src/**/__tests__/**/*.{ts,tsx,js,jsx}'
  ];
  
  const testFiles = [];
  
  testPatterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: ['node_modules/**', '.git/**', '.next/**', '**/dist/**']
    });
    testFiles.push(...files);
  });
  
  // Remove duplicates
  return [...new Set(testFiles)];
}

/**
 * Update imports in files that reference the test file
 * @param {string} oldPath - Original file path
 * @param {string} newPath - New file path
 */
function updateImportsAndReferences(oldPath, newPath) {
  // Find all files that might have imports
  const filesToCheck = glob.sync('**/*.{ts,tsx,js,jsx,md}', {
    ignore: ['node_modules/**', '.git/**', '.next/**', 'dist/**']
  });
  
  filesToCheck.forEach(file => {
    try {
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return;
      
      let content = fs.readFileSync(file, 'utf8');
      
      // Skip binary files
      if (/\uFFFD/.test(content)) {
        return;
      }
      
      const oldRelativePath = path.relative(path.dirname(file), oldPath).replace(/\\/g, '/');
      const newRelativePath = path.relative(path.dirname(file), newPath).replace(/\\/g, '/');
      
      // Fix for Windows paths
      const oldRelativePathFixed = oldRelativePath.startsWith('.') ? oldRelativePath : `./${oldRelativePath}`;
      const newRelativePathFixed = newRelativePath.startsWith('.') ? newRelativePath : `./${newRelativePath}`;
      
      // Update relative imports
      let updated = false;
      
      const updatedContent = content.replace(
        new RegExp(`(['"\`])${oldRelativePathFixed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`, 'g'),
        (match, quote1, quote2) => {
          updated = true;
          return `${quote1}${newRelativePathFixed}${quote2}`;
        }
      );
      
      if (updated) {
        fs.writeFileSync(file, updatedContent);
        log(`Updated imports in ${file}`);
      }
    } catch (err) {
      warning(`Error updating imports in ${file}: ${err.message}`);
    }
  });
}

/**
 * Process a single test file
 * @param {string} filePath - Path to the test file
 * @returns {Object} - Result of the operation
 */
async function processTestFile(filePath) {
  try {
    // Get the standardized file name
    const standardizedName = standardizeTestFileName(filePath);
    
    // Get the appropriate test directory
    const centralTestDir = getCentralTestDirectory(filePath);
    const localTestDir = getTestDirectory(filePath);
    
    // Create both central and local test paths
    const centralTestPath = path.join(centralTestDir, standardizedName);
    const localTestPath = path.join(localTestDir, standardizedName);
    
    // Ensure the test directories exist
    fs.mkdirSync(centralTestDir, { recursive: true });
    fs.mkdirSync(localTestDir, { recursive: true });
    
    // Standardize the file locally first
    if (path.join(path.dirname(filePath), path.basename(filePath)) !== localTestPath) {
      // Copy the test file with the standardized name to local test directory
      fs.copyFileSync(filePath, localTestPath);
      
      // Update imports and references
      updateImportsAndReferences(filePath, localTestPath);
      
      // Only remove the original file if it's different from the new one
      if (filePath !== localTestPath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      success(`Standardized: ${filePath} -> ${localTestPath}`);
    }
    
    // Copy to central test directory as well
    fs.copyFileSync(localTestPath, centralTestPath);
    success(`Centralized: ${localTestPath} -> ${centralTestPath}`);
    
    return {
      original: filePath,
      local: localTestPath,
      central: centralTestPath,
      success: true
    };
  } catch (err) {
    error(`Failed to process ${filePath}: ${err.message}`);
    return {
      original: filePath,
      success: false,
      error: err.message
    };
  }
}

/**
 * Create a report summarizing the standardization results
 * @param {Array<Object>} results - Results of the standardization operations
 */
function createReport(results) {
  const reportContent = `# Test File Standardization Report

## Summary
- Total test files processed: ${results.length}
- Successfully standardized: ${results.filter(r => r.success).length}
- Failed: ${results.filter(r => !r.success).length}

## Successfully Standardized Files
${results.filter(r => r.success).map(r => `- ✅ \`${r.original}\` -> \`${r.local}\` and \`${r.central}\``).join('\n')}

## Failed Files
${results.filter(r => !r.success).map(r => `- ❌ \`${r.original}\`: ${r.error}`).join('\n')}
`;

  fs.writeFileSync('docs/project-history/test-standardization-report.md', reportContent);
  success(`Report written to docs/project-history/test-standardization-report.md`);
}

/**
 * Update Jest configuration to recognize the new test structure
 */
function updateJestConfig() {
  try {
    const jestConfigPath = 'jest.config.js';
    
    if (!fs.existsSync(jestConfigPath)) {
      warning(`Jest config not found at ${jestConfigPath}`);
      return;
    }
    
    let jestConfig = fs.readFileSync(jestConfigPath, 'utf8');
    
    // Add/update testMatch patterns
    const updatedConfig = jestConfig.replace(
      /testMatch\s*:\s*\[[^\]]*\]/,
      `testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/*.test.[jt]s?(x)"
  ]`
    );
    
    fs.writeFileSync(jestConfigPath, updatedConfig);
    success(`Updated Jest configuration`);
  } catch (err) {
    error(`Failed to update Jest config: ${err.message}`);
  }
}

/**
 * Update package.json test scripts
 */
function updatePackageJsonScripts() {
  try {
    const packageJsonPath = 'package.json';
    
    if (!fs.existsSync(packageJsonPath)) {
      warning(`package.json not found`);
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update test scripts
    if (!packageJson.scripts) packageJson.scripts = {};
    
    packageJson.scripts['test:unit'] = 'jest --testPathPattern=tests/unit';
    packageJson.scripts['test:integration'] = 'jest --testPathPattern=tests/integration';
    packageJson.scripts['test:local'] = 'jest --testPathPattern=src';
    packageJson.scripts['test'] = 'jest';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    success(`Updated test scripts in package.json`);
  } catch (err) {
    error(`Failed to update package.json: ${err.message}`);
  }
}

/**
 * Create a .gitignore entry for the local test directories
 */
function updateGitIgnore() {
  try {
    let gitignore = '';
    
    if (fs.existsSync('.gitignore')) {
      gitignore = fs.readFileSync('.gitignore', 'utf8');
    }
    
    // Add a comment and the test directories if they don't exist
    if (!gitignore.includes('# Local test files')) {
      gitignore += '\n# Local test files (centralized in /tests)\n';
      gitignore += 'src/**/__tests__/**/*.test.ts\n';
      gitignore += 'src/**/__tests__/**/*.test.tsx\n';
      gitignore += 'src/**/__tests__/**/*.test.js\n';
      gitignore += 'src/**/__tests__/**/*.test.jsx\n';
      
      fs.writeFileSync('.gitignore', gitignore);
      success(`Updated .gitignore to exclude local test duplicates`);
    }
  } catch (err) {
    warning(`Failed to update .gitignore: ${err.message}`);
  }
}

/**
 * Main function to run the script
 */
async function main() {
  // Create git backup before making changes
  try {
    execSync('git branch -D test-standardization-backup 2>/dev/null || true', { stdio: 'pipe' });
    execSync('git checkout -b test-standardization-backup', { stdio: 'pipe' });
    execSync('git checkout -', { stdio: 'pipe' });
    success(`Created backup branch: test-standardization-backup`);
  } catch (err) {
    warning(`Could not create git backup branch: ${err.message}`);
  }
  
  // Find all test files
  const testFiles = findTestFiles();
  log(`Found ${testFiles.length} test files to standardize`);
  
  // Process all test files
  const results = [];
  for (const file of testFiles) {
    const result = await processTestFile(file);
    results.push(result);
  }
  
  // Create a report
  createReport(results);
  
  // Update Jest configuration
  updateJestConfig();
  
  // Update package.json scripts
  updatePackageJsonScripts();
  
  // Update .gitignore
  updateGitIgnore();
  
  // Final summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  log(`Test standardization completed.`);
  success(`Successfully processed ${successCount} test files.`);
  if (failCount > 0) {
    error(`Failed to process ${failCount} test files. See the report for details.`);
  }
}

// Run the script
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 
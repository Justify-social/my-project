/**
 * Test Migration Script
 * 
 * This script migrates tests from src/__tests__ and other locations to the centralized tests directory.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import execSync from 'child_process';

// Utility functions
const log = (message) => console.log(`\x1b[36m[Test Migration]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Ensure test directories exist
const ensureTestDirs = () => {
  ['unit', 'integration', 'e2e'].forEach(dir => {
    const dirPath = path.join('tests', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      success(`Created test directory: ${dirPath}`);
    }
  });
};

// Find tests in src directory
const findTests = () => {
  // Tests in src/__tests__
  const centralTests = glob.sync('src/__tests__/**/*.{js,jsx,ts,tsx}');
  
  // Component-level tests
  const componentTests = glob.sync('src/**/__tests__/**/*.{js,jsx,ts,tsx}')
    .filter(file => !file.startsWith('src/__tests__/'));
  
  return { centralTests, componentTests };
};

// Determine test type (unit or integration)
const getTestType = (filePath) => {
  if (filePath.includes('integration') || filePath.includes('Integration')) {
    return 'integration';
  }
  return 'unit';
};

// Create destination path for a test file
const getDestPath = (filePath) => {
  const testType = getTestType(filePath);
  
  if (filePath.startsWith('src/__tests__/')) {
    // For central tests, preserve the structure under src/__tests__/{unit|integration}/
    const relativePath = filePath.replace(/^src\/__tests__\/(unit|integration)\//, '');
    return path.join('tests', testType, relativePath);
  } else {
    // For component tests, create a structure mirroring the component location
    const componentPath = filePath.split('__tests__')[0];
    const testFileName = path.basename(filePath);
    const relativePath = componentPath.replace(/^src\//, '').replace(/\/$/, '');
    return path.join('tests', testType, relativePath, testFileName);
  }
};

// Migrate a single test file
const migrateTestFile = (filePath) => {
  const destPath = getDestPath(filePath);
  const destDir = path.dirname(destPath);
  
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  try {
    // Copy the file
    fs.copyFileSync(filePath, destPath);
    success(`Migrated: ${filePath} -> ${destPath}`);
    return { source: filePath, destination: destPath, success: true };
  } catch (err) {
    error(`Failed to migrate ${filePath}: ${err.message}`);
    return { source: filePath, destination: destPath, success: false, error: err.message };
  }
};

// Run the migration
const migrateTests = async () => {
  log('Starting test migration...');
  
  // Ensure test directories exist
  ensureTestDirs();
  
  // Find tests
  const { centralTests, componentTests } = findTests();
  log(`Found ${centralTests.length} tests in src/__tests__ and ${componentTests.length} component-level tests`);
  
  // Prepare migration report
  const report = {
    total: centralTests.length + componentTests.length,
    migrated: 0,
    failed: 0,
    results: []
  };
  
  // Migrate central tests
  log('Migrating central tests...');
  for (const testFile of centralTests) {
    const result = migrateTestFile(testFile);
    report.results.push(result);
    if (result.success) report.migrated++; else report.failed++;
  }
  
  // Migrate component tests
  log('Migrating component tests...');
  for (const testFile of componentTests) {
    const result = migrateTestFile(testFile);
    report.results.push(result);
    if (result.success) report.migrated++; else report.failed++;
  }
  
  // Write migration report
  const reportContent = `# Test Migration Report

## Summary
- Total tests: ${report.total}
- Successfully migrated: ${report.migrated}
- Failed migrations: ${report.failed}

## Migration Details

${report.results.map(r => `- ${r.success ? '✅' : '❌'} \`${r.source}\` -> \`${r.destination}\`${r.error ? ` (Error: ${r.error})` : ''}`).join('\n')}
`;

  fs.writeFileSync('docs/test-migration-report.md', reportContent);
  success(`Migration report written to docs/test-migration-report.md`);
  
  return report;
};

// Update package.json test scripts
const updateTestScripts = async () => {
  log('Updating test scripts in package.json...');
  
  if (!fs.existsSync('package.json')) {
    error('package.json not found');
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Backup package.json
    fs.writeFileSync('package.json.test-bak', JSON.stringify(packageJson, null, 2));
    
    // Update test scripts
    if (!packageJson.scripts) packageJson.scripts = {};
    
    packageJson.scripts['test:unit'] = 'jest --config=jest.config.js --testPathPattern=tests/unit';
    packageJson.scripts['test:integration'] = 'jest --config=jest.config.js --testPathPattern=tests/integration';
    packageJson.scripts['test:e2e'] = 'cypress run';
    packageJson.scripts['test'] = 'npm run test:unit && npm run test:integration';
    
    // Write updated package.json
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    success('Updated test scripts in package.json');
  } catch (err) {
    error(`Failed to update package.json: ${err.message}`);
  }
};

// Main function
const main = async () => {
  log('Starting test migration process...');
  
  // Track timing
  const startTime = Date.now();
  
  try {
    // Migrate tests
    const report = await migrateTests();
    
    // Update package.json
    await updateTestScripts();
    
    // Update progress
    try {
      execSync('node scripts/unification-final/update-progress.js "Test Organization" 50', { stdio: 'inherit' });
    } catch (err) {
      warning(`Could not update progress: ${err.message}`);
    }
    
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    success(`Test migration completed in ${executionTime}s. Migrated ${report.migrated}/${report.total} tests.`);
  } catch (err) {
    error(`Test migration failed: ${err.message}`);
    process.exit(1);
  }
};

// Run main function
main(); 
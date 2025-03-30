#!/usr/bin/env node

/**
 * UI Component Validation Script
 * 
 * This script validates that all UI components follow the project's naming conventions:
 * - Component folders follow atomic design pattern (atoms, molecules, organisms)
 * - Component names use PascalCase for component files (Button.tsx, Card.tsx)
 * - Helper files use kebab-case (button-utils.ts, card-styles.ts)
 * - Each component has a dedicated folder with kebab-case name
 * - Main component implementation matches folder name in PascalCase
 * 
 * It also identifies problematic imports that need to be updated.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Configuration
const UI_COMPONENTS_ROOT = path.resolve(__dirname, '../src/components/ui');
const COMPONENT_TYPES = ['atoms', 'molecules', 'organisms'];
const IGNORE_DIRS = ['deprecated', 'utils'];

// Validation results
const issues = {
  namingIssues: [],
  structureIssues: [],
  importIssues: []
};

/**
 * Check if string is PascalCase
 */
function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Check if string is kebab-case
 */
function isKebabCase(str) {
  return /^[a-z][a-z0-9-]*$/.test(str);
}

/**
 * Extract component name from file path
 */
function extractComponentName(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  return basename;
}

/**
 * Validate a component file
 */
function validateComponentFile(filePath, componentType, componentDir) {
  const relativePath = path.relative(UI_COMPONENTS_ROOT, filePath);
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);
  const baseName = path.basename(filePath, fileExt);
  const dirName = path.basename(componentDir);

  // Main component file should be PascalCase and match directory name
  if (fileExt === '.tsx' && fileName !== 'index.tsx') {
    if (!isPascalCase(baseName)) {
      issues.namingIssues.push({
        file: relativePath,
        issue: `Component file should be PascalCase: ${fileName}`,
        suggestion: `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}${fileExt}`
      });
    }

    // For the main component file (same name as directory but PascalCase)
    if (baseName.toLowerCase() === dirName.toLowerCase() && baseName !== dirName.charAt(0).toUpperCase() + dirName.slice(1)) {
      issues.namingIssues.push({
        file: relativePath,
        issue: `Main component file should match directory name in PascalCase`,
        suggestion: `${dirName.charAt(0).toUpperCase() + dirName.slice(1)}${fileExt}`
      });
    }
  }

  // Helper files should be kebab-case
  if (fileExt === '.ts' && !fileName.includes('.d.ts') && fileName !== 'index.ts' && fileName !== 'types.ts') {
    if (!isKebabCase(baseName)) {
      issues.namingIssues.push({
        file: relativePath,
        issue: `Helper file should be kebab-case: ${fileName}`,
        suggestion: baseName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() + fileExt
      });
    }
  }
}

/**
 * Validate a component directory
 */
function validateComponentDir(dirPath, componentType) {
  const relativePath = path.relative(UI_COMPONENTS_ROOT, dirPath);
  const dirName = path.basename(dirPath);

  // Directory should be kebab-case
  if (!isKebabCase(dirName)) {
    issues.structureIssues.push({
      directory: relativePath,
      issue: `Component directory should be kebab-case: ${dirName}`,
      suggestion: dirName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    });
  }

  // Check for main component file that matches directory name
  const expectedMainFile = path.join(dirPath, `${dirName.charAt(0).toUpperCase() + dirName.slice(1)}.tsx`);
  if (!fs.existsSync(expectedMainFile)) {
    const mainFileExists = fs.readdirSync(dirPath)
      .some(file => file.toLowerCase() === `${dirName}.tsx` || 
                    file.toLowerCase() === `${dirName.charAt(0).toUpperCase() + dirName.slice(1).toLowerCase()}.tsx`);
    
    if (!mainFileExists) {
      issues.structureIssues.push({
        directory: relativePath,
        issue: `Missing main component file that matches directory name`,
        suggestion: `Create ${path.basename(expectedMainFile)}`
      });
    }
  }

  // Check for index.ts barrel file
  const indexFile = path.join(dirPath, 'index.ts');
  if (!fs.existsSync(indexFile)) {
    issues.structureIssues.push({
      directory: relativePath,
      issue: `Missing index.ts barrel file`,
      suggestion: `Create index.ts to export all components from this directory`
    });
  }

  // Validate each file in the directory
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile()) {
      validateComponentFile(filePath, componentType, dirPath);
    } else if (fs.statSync(filePath).isDirectory() && 
              !['styles', 'utils', 'types', 'tests', '__tests__', 'examples'].includes(file)) {
      // Recursively validate subdirectories, excluding common utility directories
      validateComponentDir(filePath, componentType);
    }
  }
}

/**
 * Find problematic imports in the codebase
 */
async function findProblematicImports() {
  try {
    // Find imports that don't include the full component file path
    console.log('Searching for problematic imports...');
    
    // Use grep to find imports from UI components
    const { stdout } = await execPromise("grep -r \"import.*from.*@/components/ui\" --include=\"*.tsx\" --include=\"*.ts\" src/");
    
    const lines = stdout.split('\n').filter(Boolean);
    const problemImports = [];
    
    for (const line of lines) {
      // Parse the import line
      const [file, importStatement] = line.split(':', 2);
      
      // Skip index files and type declaration files
      if (file.endsWith('index.ts') || file.endsWith('.d.ts')) {
        continue;
      }
      
      // Match relative import patterns that don't include the specific component file
      const importMatch = importStatement.match(/import\s+.*from\s+['"](@\/components\/ui\/[^'"]*)['"]/);
      if (!importMatch) continue;
      
      const importPath = importMatch[1];
      
      // Check if the import is potentially problematic (doesn't include full file path)
      if (!importPath.includes('.tsx') && !importPath.includes('.ts') && 
          importPath.split('/').length >= 4 && // At least to the component folder level
          !importPath.endsWith('/types') &&
          !importPath.endsWith('/utils')) {
        
        problemImports.push({
          file,
          importStatement: importStatement.trim(),
          importPath,
          suggestion: `Update to include specific file (e.g., ${importPath}/${importPath.split('/').pop()}.tsx)`
        });
      }
    }
    
    issues.importIssues = problemImports;
  } catch (error) {
    console.error('Error finding problematic imports:', error);
  }
}

/**
 * Main validation function
 */
async function validateUIComponents() {
  console.log('Starting UI component validation...');
  
  // Validate component directories
  for (const componentType of COMPONENT_TYPES) {
    const componentTypeDir = path.join(UI_COMPONENTS_ROOT, componentType);
    
    if (!fs.existsSync(componentTypeDir)) {
      console.warn(`Component type directory not found: ${componentType}`);
      continue;
    }
    
    const componentDirs = fs.readdirSync(componentTypeDir);
    for (const dir of componentDirs) {
      if (IGNORE_DIRS.includes(dir)) continue;
      
      const componentDir = path.join(componentTypeDir, dir);
      if (fs.statSync(componentDir).isDirectory()) {
        validateComponentDir(componentDir, componentType);
      }
    }
  }
  
  // Find problematic imports
  await findProblematicImports();
  
  // Output results
  console.log('\n---- UI COMPONENT VALIDATION REPORT ----\n');
  
  if (issues.namingIssues.length === 0 && 
      issues.structureIssues.length === 0 && 
      issues.importIssues.length === 0) {
    console.log('✅ All UI components conform to naming and structure conventions!');
    return;
  }
  
  if (issues.namingIssues.length > 0) {
    console.log(`\n🔴 Found ${issues.namingIssues.length} naming issues:\n`);
    issues.namingIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Suggestion: ${issue.suggestion}\n`);
    });
  }
  
  if (issues.structureIssues.length > 0) {
    console.log(`\n🔴 Found ${issues.structureIssues.length} structure issues:\n`);
    issues.structureIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.directory}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Suggestion: ${issue.suggestion}\n`);
    });
  }
  
  if (issues.importIssues.length > 0) {
    console.log(`\n🔴 Found ${issues.importIssues.length} problematic imports that need updating:\n`);
    issues.importIssues.forEach((issue, index) => {
      if (index < 10) { // Show first 10 examples
        console.log(`${index + 1}. ${issue.file}`);
        console.log(`   Import: ${issue.importStatement}`);
        console.log(`   Suggestion: ${issue.suggestion}\n`);
      } else if (index === 10) {
        console.log(`   ... and ${issues.importIssues.length - 10} more\n`);
      }
    });
  }
  
  // Optionally write to a report file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      namingIssues: issues.namingIssues.length,
      structureIssues: issues.structureIssues.length,
      importIssues: issues.importIssues.length,
      total: issues.namingIssues.length + issues.structureIssues.length + issues.importIssues.length
    },
    details: issues
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../ui-component-validation-report.json'), 
    JSON.stringify(reportData, null, 2)
  );
  
  console.log(`\nFull report written to ui-component-validation-report.json`);
}

// Run the validation
validateUIComponents().catch(console.error);

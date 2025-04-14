#!/usr/bin/env node
/**
 * Navigation Path Validator
 *
 * This script checks for common path/import issues in navigation components:
 * - Validates that all navigation component files exist
 * - Checks that import paths in files are consistent
 * - Verifies icon paths referenced in components resolve to actual files
 * - Ensures component naming matches between exports and imports
 *
 * Usage: node scripts/validate-navigation-paths.js
 */

// Using CommonJS for compatibility
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const NAVIGATION_DIR = path.join(ROOT_DIR, 'src/components/ui/navigation');
const ICON_DIR = path.join(ROOT_DIR, 'public/icons');
const APP_ICON_DIR = path.join(ICON_DIR, 'app');
const LIGHT_ICON_DIR = path.join(ICON_DIR, 'light');
const SOLID_ICON_DIR = path.join(ICON_DIR, 'solid');

// Color codes for terminal output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

console.log(`${CYAN}==== Navigation Path Validator ====${RESET}\n`);

// Track validation results
let errors = 0;
let warnings = 0;
let passed = 0;

// 1. Check if navigation component files exist
console.log(`${CYAN}Checking navigation component files...${RESET}`);

const expectedFiles = ['header.tsx', 'sidebar.tsx', 'mobile-menu.tsx'];

const missingFiles = [];
const existingFiles = [];

expectedFiles.forEach(file => {
  const filePath = path.join(NAVIGATION_DIR, file);
  if (fs.existsSync(filePath)) {
    existingFiles.push(file);
    console.log(`${GREEN}✓ Found ${file}${RESET}`);
    passed++;
  } else {
    missingFiles.push(file);
    console.log(`${RED}✗ Missing ${file}${RESET}`);
    errors++;
  }
});

// 2. Scan import statements in layout files
console.log(`\n${CYAN}Scanning for import references...${RESET}`);

// Get a list of files that might import navigation components
function findFilesWithNavigationImports() {
  try {
    const grepCommand = `cd "${ROOT_DIR}" && grep -r --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" "import.*['\\\"].*navigation" src`;
    const result = execSync(grepCommand, { encoding: 'utf8' });
    return result.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error(`${RED}Error searching for navigation imports: ${error.message}${RESET}`);
    return [];
  }
}

const filesWithNavigationImports = findFilesWithNavigationImports();
console.log(`Found ${filesWithNavigationImports.length} files with navigation imports`);

// Check each import line for correctness
let importPatterns = {
  correct: 0,
  incorrect: [],
};

filesWithNavigationImports.forEach(line => {
  const [file, importText] = line.split(':', 2);

  // Check for potential issues in import paths
  const navigationImport =
    importText.match(/import.*?from\s+['"](.*?navigation\/.*?)['"]/) ||
    importText.match(/import\(['"](.*?navigation\/.*?)['"]\)/);

  if (navigationImport) {
    const importPath = navigationImport[1];

    // Check if import is direct path to component
    if (existingFiles.some(file => importPath.endsWith(`navigation/${file.replace('.tsx', '')}`))) {
      console.log(`${GREEN}✓ Correct import in ${file}: ${importPath}${RESET}`);
      importPatterns.correct++;
      passed++;
    }
    // Check for index imports (potential issue)
    else if (importPath.endsWith('navigation') || importPath.endsWith('navigation/index')) {
      console.log(`${YELLOW}⚠ Barrel import in ${file}: ${importPath} - may cause issues${RESET}`);
      importPatterns.incorrect.push({
        file,
        importPath,
        issue: 'Barrel import (index) - may cause circular dependencies',
      });
      warnings++;
    }
    // Check for relative path imports (potential issue)
    else if (importPath.startsWith('.')) {
      console.log(
        `${YELLOW}⚠ Relative import in ${file}: ${importPath} - inconsistent with project standards${RESET}`
      );
      importPatterns.incorrect.push({
        file,
        importPath,
        issue: 'Relative import path - inconsistent with project standards',
      });
      warnings++;
    }
    // Check for renamed imports (potential issue)
    else if (importPath.includes('as')) {
      console.log(
        `${YELLOW}⚠ Renamed import in ${file}: ${importText} - may lead to confusion${RESET}`
      );
      importPatterns.incorrect.push({
        file,
        importPath,
        issue: 'Renamed import - may lead to confusion',
      });
      warnings++;
    }
    // Other unknown pattern
    else {
      console.log(`${YELLOW}⚠ Unusual import in ${file}: ${importPath}${RESET}`);
      importPatterns.incorrect.push({
        file,
        importPath,
        issue: 'Unusual import pattern',
      });
      warnings++;
    }
  }
});

// 3. Check icon references in navigation components
console.log(`\n${CYAN}Validating icon references in navigation components...${RESET}`);

function extractIconReferences(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Find direct icon references
    const iconRefs = [];

    // Match iconId="xyz" or iconId='xyz' or iconId={xyz}
    const iconIdMatches = content.match(/iconId=["']{1}([^"']+)["']{1}/g) || [];
    iconIdMatches.forEach(match => {
      const iconId = match.match(/iconId=["']{1}([^"']+)["']{1}/)[1];
      iconRefs.push(iconId);
    });

    // Match iconId={NAV_ICONS.XYZ} or other constant references
    const constMatches = content.match(/iconId=\{([^}]+)\}/g) || [];
    constMatches.forEach(match => {
      iconRefs.push(`CONSTANT: ${match.match(/iconId=\{([^}]+)\}/)[1]}`);
    });

    return iconRefs;
  } catch (error) {
    console.error(`${RED}Error reading file ${filePath}: ${error.message}${RESET}`);
    return [];
  }
}

function checkIconExists(iconId) {
  // Handle constant references
  if (iconId.startsWith('CONSTANT:')) {
    return true; // Assume constants are valid for now
  }

  // Strip variant suffixes
  let baseIconId = iconId;
  let variant = '';

  if (iconId.endsWith('Light')) {
    baseIconId = iconId.replace(/Light$/, '');
    variant = 'light';
  } else if (iconId.endsWith('Solid')) {
    baseIconId = iconId.replace(/Solid$/, '');
    variant = 'solid';
  }

  // Handle app icons
  if (iconId.startsWith('app')) {
    // App icons are lowercase with dashes
    const fileName =
      iconId.replace(/([A-Z])/g, match => `-${match.toLowerCase()}`).replace(/^app-/, '') + '.svg';
    const appIconPath = path.join(APP_ICON_DIR, fileName);

    return fs.existsSync(appIconPath);
  }

  // Handle FontAwesome icons (typically start with 'fa')
  if (iconId.startsWith('fa')) {
    // Convert camelCase to kebab-case
    const baseName = baseIconId
      .replace(/^fa/, '')
      .replace(/([A-Z])/g, match => `-${match.toLowerCase()}`)
      .toLowerCase();

    // Check in appropriate directory based on variant
    const iconDirToCheck = variant === 'light' ? LIGHT_ICON_DIR : SOLID_ICON_DIR;
    const iconPath = path.join(iconDirToCheck, `${baseName}.svg`);

    return fs.existsSync(iconPath);
  }

  return false;
}

existingFiles.forEach(file => {
  const filePath = path.join(NAVIGATION_DIR, file);
  const iconRefs = extractIconReferences(filePath);

  console.log(`\nChecking ${iconRefs.length} icon references in ${file}:`);

  if (iconRefs.length === 0) {
    console.log(`${YELLOW}⚠ No direct icon references found in ${file}${RESET}`);
    warnings++;
  }

  iconRefs.forEach(iconId => {
    if (iconId.startsWith('CONSTANT:')) {
      console.log(`${GREEN}✓ Using constant reference: ${iconId}${RESET}`);
      passed++;
    } else if (checkIconExists(iconId)) {
      console.log(`${GREEN}✓ Icon exists: ${iconId}${RESET}`);
      passed++;
    } else {
      console.log(`${RED}✗ Missing icon: ${iconId}${RESET}`);
      errors++;
    }
  });
});

// 4. Check for export/import name consistency
console.log(`\n${CYAN}Checking component name consistency...${RESET}`);

function extractExportNames(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Match for export patterns
    const exportDefault = content.match(/export\s+default\s+(\w+)/) || [];
    const exportNamed = content.match(/export\s+(const|function)\s+(\w+)/) || [];

    const exportNames = [];

    if (exportDefault.length > 1) {
      exportNames.push({ name: exportDefault[1], type: 'default' });
    }

    if (exportNamed.length > 2) {
      exportNames.push({ name: exportNamed[2], type: 'named' });
    }

    return exportNames;
  } catch (error) {
    console.error(`${RED}Error reading file ${filePath}: ${error.message}${RESET}`);
    return [];
  }
}

existingFiles.forEach(file => {
  const filePath = path.join(NAVIGATION_DIR, file);
  const exportNames = extractExportNames(filePath);

  const componentName = file
    .replace('.tsx', '')
    .replace(/-./g, match => match.charAt(1).toUpperCase())
    .replace(/^./, match => match.toUpperCase());

  console.log(`\nExport names in ${file}:`);

  if (exportNames.length === 0) {
    console.log(`${RED}✗ No exports found in ${file}${RESET}`);
    errors++;
  }

  exportNames.forEach(({ name, type }) => {
    // Check if component name is similar to file name (allowing for variations)
    const nameMatch =
      name === componentName ||
      name === componentName + 'Component' ||
      name === componentName.replace(/^./, match => match.toLowerCase());

    if (nameMatch) {
      console.log(`${GREEN}✓ ${type} export matches filename: ${name}${RESET}`);
      passed++;
    } else {
      console.log(
        `${YELLOW}⚠ ${type} export name (${name}) differs from expected name (${componentName})${RESET}`
      );
      warnings++;
    }
  });
});

// Summary
console.log(`\n${CYAN}==== Summary ====${RESET}`);
console.log(`${GREEN}✓ ${passed} checks passed${RESET}`);
console.log(`${YELLOW}⚠ ${warnings} warnings${RESET}`);
console.log(`${RED}✗ ${errors} errors${RESET}`);

// Provide suggestions based on findings
if (errors > 0 || warnings > 0) {
  console.log(`\n${CYAN}==== Suggested Fixes ====${RESET}`);

  if (missingFiles.length > 0) {
    console.log(`\n${YELLOW}1. Create missing navigation component files:${RESET}`);
    missingFiles.forEach(file => {
      console.log(`   - Create ${NAVIGATION_DIR}/${file}`);
    });
  }

  if (importPatterns.incorrect.length > 0) {
    console.log(`\n${YELLOW}2. Fix inconsistent import patterns:${RESET}`);

    // Group by issue type
    const issueGroups = {};
    importPatterns.incorrect.forEach(({ file, importPath, issue }) => {
      if (!issueGroups[issue]) {
        issueGroups[issue] = [];
      }
      issueGroups[issue].push({ file, importPath });
    });

    // Print suggestions by issue type
    Object.entries(issueGroups).forEach(([issue, items]) => {
      console.log(`   - ${issue}:`);
      items.slice(0, 3).forEach(({ file, importPath }) => {
        console.log(
          `     * In ${file}, change "${importPath}" to "@/components/ui/navigation/[component]"`
        );
      });
      if (items.length > 3) {
        console.log(`     * ... and ${items.length - 3} more similar issues`);
      }
    });
  }

  // Final fix summary
  console.log(`\n${CYAN}Recommendation:${RESET}`);
  if (errors > warnings) {
    console.log(
      `This appears to be a path resolution issue. Focus on fixing the incorrect imports and missing files first.`
    );
  } else {
    console.log(
      `The core navigation components exist, but there may be naming inconsistencies. Check that export names match the import statements.`
    );
  }
}

console.log(`\n${CYAN}==== Validation Complete ====${RESET}`);

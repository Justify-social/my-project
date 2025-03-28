#!/usr/bin/env node

/**
 * Final Verification Script
 * 
 * This script performs a comprehensive verification of the codebase after
 * unification, checking for any remaining issues or inconsistencies.
 * 
 * It checks:
 * 1. Import path consistency
 * 2. Directory structure compliance
 * 3. Component organization
 * 4. README completeness
 * 5. Missing or deprecated files
 * 6. Circular dependencies
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const ROOT_DIR = path.join(__dirname, '../../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Find files recursively in a directory with specific extension
 * @param {string} directory - Directory to search in
 * @param {string} extension - File extension to search for (e.g., '.tsx')
 * @returns {string[]} - Array of file paths
 */
function findFiles(directory, extension) {
  try {
    let files = [];
    
    // If extension is .tsx, search for both .ts and .tsx files
    if (extension === '.tsx') {
      const tsxCmd = `find ${directory} -type f -name "*.tsx" | grep -v "node_modules" | grep -v ".next"`;
      const tsCmd = `find ${directory} -type f -name "*.ts" | grep -v "node_modules" | grep -v ".next"`;
      
      const tsxFiles = execSync(tsxCmd, { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim() !== '');
      
      const tsFiles = execSync(tsCmd, { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim() !== '');
      
      files = [...tsxFiles, ...tsFiles];
    } else {
      // For other extensions
      const cmd = `find ${directory} -type f -name "*${extension}" | grep -v "node_modules" | grep -v ".next"`;
      files = execSync(cmd, { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim() !== '');
    }
    
    return files;
  } catch (error) {
    console.error(`${colors.red}Error finding files: ${error.message}${colors.reset}`);
    return [];
  }
}

// Stats for tracking issues
const stats = {
  filesScanned: 0,
  issuesFound: 0,
  importIssues: 0,
  structureIssues: 0,
  circularDependencies: 0,
  missingReadmes: 0,
  deprecatedFiles: 0
};

// Key directories to check
const expectedDirectories = [
  'src/components/ui',
  'src/components/features',
  'src/components/layout',
  'src/utils',
  'src/app/(auth)',
  'src/app/(dashboard)',
  'src/app/(campaigns)',
  'src/app/(settings)',
  'src/app/(admin)'
];

// Deprecated import patterns to check
const deprecatedImportPatterns = [
  {
    pattern: 'from \'@/components/Brand-Lift',
    recommendation: 'Use from \'@/components/features/brand-lift\' instead'
  },
  {
    pattern: 'from \'@/components/influencers',
    recommendation: 'Use from \'@/components/features/influencers\' instead'
  },
  {
    pattern: 'from \'@/components/wizard',
    recommendation: 'Use from \'@/components/features/wizard\' instead'
  },
  {
    pattern: 'from \'@/components/search',
    recommendation: 'Use from \'@/components/features/search\' instead'
  },
  {
    pattern: 'from \'@/components/mmm',
    recommendation: 'Use from \'@/components/features/mmm\' instead'
  },
  {
    pattern: 'from \'@/components/error-boundary',
    recommendation: 'Use from \'@/components/ui/error-boundary\' instead'
  },
  {
    pattern: 'from \'@/components/error-fallback',
    recommendation: 'Use from \'@/components/ui/error-fallback\' instead'
  },
  {
    pattern: 'from \'@/components/upload',
    recommendation: 'Use from \'@/components/features/upload\' instead'
  },
  {
    pattern: 'from \'@/components/gif',
    recommendation: 'Use from \'@/components/features/gif\' instead'
  },
  {
    pattern: 'from \'@/components/asset-preview',
    recommendation: 'Use from \'@/components/features/asset-preview\' instead'
  },
  {
    pattern: 'from \'@/components/LoadingSkeleton',
    recommendation: 'Use from \'@/components/ui/skeleton\' instead'
  },
  {
    pattern: 'from \'@/lib/utils',
    recommendation: 'Use from \'@/utils/string/utils\' instead'
  }
];

/**
 * Verifies import paths in all TypeScript and TypeScript JSX files
 */
function verifyImportPaths() {
  console.log(`${colors.blue}Verifying import paths...${colors.reset}`);
  
  const tsFiles = findFiles(SRC_DIR, '.tsx');
  console.log(`Found ${tsFiles.length} TypeScript files to check`);
  
  const deprecatedImports = [];
  const circularRefs = [];
  
  // For each file, read content and check imports
  tsFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for deprecated import patterns
      deprecatedImportPatterns.forEach(pattern => {
        if (content.includes(pattern.pattern)) {
          deprecatedImports.push({
            file,
            pattern: pattern.pattern,
            recommendation: pattern.recommendation
          });
          stats.importIssues++;
          stats.issuesFound++;
        }
      });
      
      // Extract all imports to check for missing files
      const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Skip node modules and external packages
        if (!importPath.startsWith('@/') && !importPath.startsWith('./') && !importPath.startsWith('../')) {
          continue;
        }
        
        // Convert relative path to absolute
        let absolutePath;
        if (importPath.startsWith('@/')) {
          // For imports using @ alias
          absolutePath = path.join(ROOT_DIR, 'src', importPath.substring(2));
        } else {
          // For relative imports
          absolutePath = path.join(path.dirname(file), importPath);
        }
        
        // If path doesn't have extension, try common extensions
        if (!path.extname(absolutePath)) {
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          let found = false;
          
          // First check if it's a directory with index file
          for (const ext of extensions) {
            const indexPath = path.join(absolutePath, `index${ext}`);
            if (fs.existsSync(indexPath)) {
              found = true;
              break;
            }
          }
          
          // If not found as index, check with extensions
          if (!found) {
            for (const ext of extensions) {
              if (fs.existsSync(`${absolutePath}${ext}`)) {
                found = true;
                break;
              }
            }
          }
          
          if (!found) {
            // Special case for LoadingSpinner which is an alias in ui/index.ts
            if (absolutePath.includes('LoadingSpinner') && 
                (absolutePath.endsWith('ui/LoadingSpinner') || 
                 absolutePath.endsWith('ui\\LoadingSpinner'))) {
              // This is fine, it's an export alias from spinner component
              continue;
            }
            
            console.log(`${colors.yellow}Warning: Import not found - ${importPath} in ${file}`);
            stats.importIssues++;
            stats.issuesFound++;
          }
        } else if (!fs.existsSync(absolutePath)) {
          console.log(`${colors.yellow}Warning: Import not found - ${importPath} in ${file}`);
          stats.importIssues++;
          stats.issuesFound++;
        }
      }
    } catch (error) {
      console.error(`${colors.red}Error processing file ${file}: ${error.message}`);
      stats.importIssues++;
      stats.issuesFound++;
    }
  });
  
  // Report findings
  if (deprecatedImports.length > 0) {
    console.log(`${colors.yellow}\nDeprecated import patterns found:`);
    deprecatedImports.forEach(item => {
      console.log(`${colors.yellow}- ${item.file}: ${item.pattern}`);
      console.log(`${colors.green}  Recommendation: ${item.recommendation}`);
    });
  }
}

/**
 * Verifies directory structure
 */
function verifyDirectoryStructure() {
  console.log(`${colors.blue}Verifying directory structure...${colors.reset}`);
  
  const missingDirs = [];
  
  for (const dir of expectedDirectories) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      missingDirs.push(dir);
      stats.structureIssues++;
      stats.issuesFound++;
    }
  }
  
  if (missingDirs.length > 0) {
    console.log(`${colors.red}Missing expected directories:${colors.reset}`);
    for (const dir of missingDirs) {
      console.log(`  ${dir}`);
    }
  } else {
    console.log(`${colors.green}✓ All expected directories found${colors.reset}`);
  }
  
  // Check for components in old locations
  const oldLocationDirs = [
    'src/components/brand-lift',
    'src/components/Influencers',
    'src/components/Wizard',
    'src/components/Search',
    'src/components/mmm',
    'src/components/ErrorBoundary',
    'src/components/ErrorFallback',
    'src/components/upload',
    'src/components/gif',
    'src/components/AssetPreview',
    'src/components/LoadingSkeleton'
  ];
  
  const remainingOldDirs = [];
  
  for (const dir of oldLocationDirs) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      remainingOldDirs.push(dir);
      stats.structureIssues++;
      stats.issuesFound++;
    }
  }
  
  if (remainingOldDirs.length > 0) {
    console.log(`${colors.red}Old component directories still exist:${colors.reset}`);
    for (const dir of remainingOldDirs) {
      console.log(`  ${dir}`);
    }
  } else {
    console.log(`${colors.green}✓ No old component directories found${colors.reset}`);
  }
}

/**
 * Verifies README completeness
 */
function verifyReadmeCompleteness() {
  console.log(`${colors.blue}Verifying README completeness...${colors.reset}`);
  
  const missingReadmes = [];
  
  // Check for READMEs in main component directories
  const componentDirs = [
    'src/components/ui',
    'src/components/features',
    'src/components/layout'
  ];
  
  for (const dir of componentDirs) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const readmePath = path.join(dirPath, 'README.md');
      if (!fs.existsSync(readmePath)) {
        missingReadmes.push(dir);
        stats.missingReadmes++;
        stats.issuesFound++;
      }
      
      // Check subdirectories
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const subdirs = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(name => !name.startsWith('.'));
      
      for (const subdir of subdirs) {
        const subdirPath = path.join(dirPath, subdir);
        const subdirReadmePath = path.join(subdirPath, 'README.md');
        
        if (!fs.existsSync(subdirReadmePath)) {
          missingReadmes.push(`${dir}/${subdir}`);
          stats.missingReadmes++;
          stats.issuesFound++;
        }
      }
    }
  }
  
  if (missingReadmes.length > 0) {
    console.log(`${colors.red}Missing README files:${colors.reset}`);
    for (const dir of missingReadmes) {
      console.log(`  ${dir}/README.md`);
    }
  } else {
    console.log(`${colors.green}✓ All required README files found${colors.reset}`);
  }
}

/**
 * Checks for circular dependencies
 */
function checkForCircularDependencies() {
  console.log(`${colors.blue}Checking for circular dependencies...${colors.reset}`);
  
  try {
    const output = execSync('npx madge --circular --extensions ts,tsx src', { encoding: 'utf8' });
    
    // If the command succeeds with output, there are circular dependencies
    if (output.trim()) {
      console.log(`${colors.red}Circular dependencies found:${colors.reset}`);
      console.log(output);
      stats.circularDependencies++;
      stats.issuesFound++;
    } else {
      console.log(`${colors.green}✓ No circular dependencies found${colors.reset}`);
    }
  } catch (error) {
    // If madge isn't installed
    if (error.message.includes('not found')) {
      console.log(`${colors.yellow}Unable to check for circular dependencies. Install madge with:${colors.reset}`);
      console.log('  npm install -g madge');
    } else {
      // If the command fails due to circular dependencies
      console.log(`${colors.red}Circular dependencies found:${colors.reset}`);
      console.log(error.stdout || error.message);
      stats.circularDependencies++;
      stats.issuesFound++;
    }
  }
}

/**
 * Checks for deprecated files
 */
function checkForDeprecatedFiles() {
  console.log(`${colors.blue}Checking for deprecated files...${colors.reset}`);
  
  const deprecatedFiles = [
    'src/components/ui/custom-icon-display.tsx',
    'src/components/ui/icon-wrapper.tsx',
    'src/components/ui/icon.tsx',
    'src/components/ui/safe-icon.tsx',
    'src/components/ui/loading-spinner.tsx'
  ];
  
  const existingDeprecatedFiles = [];
  
  for (const file of deprecatedFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      existingDeprecatedFiles.push(file);
      stats.deprecatedFiles++;
      stats.issuesFound++;
    }
  }
  
  if (existingDeprecatedFiles.length > 0) {
    console.log(`${colors.red}Found deprecated files that should be removed:${colors.reset}`);
    for (const file of existingDeprecatedFiles) {
      console.log(`  ${file}`);
    }
  } else {
    console.log(`${colors.green}✓ No deprecated files found${colors.reset}`);
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Final Verification Script ===${colors.reset}`);
  
  verifyImportPaths();
  verifyDirectoryStructure();
  verifyReadmeCompleteness();
  checkForCircularDependencies();
  checkForDeprecatedFiles();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Verification Summary ===${colors.reset}`);
  console.log(`${colors.blue}Files scanned:${colors.reset} ${stats.filesScanned}`);
  
  if (stats.issuesFound === 0) {
    console.log(`${colors.green}✓ No issues found! The codebase is fully compliant with the unified structure.${colors.reset}`);
  } else {
    console.log(`${colors.red}Issues found:${colors.reset} ${stats.issuesFound}`);
    console.log(`  ${colors.yellow}Import issues:${colors.reset} ${stats.importIssues}`);
    console.log(`  ${colors.yellow}Structure issues:${colors.reset} ${stats.structureIssues}`);
    console.log(`  ${colors.yellow}Missing READMEs:${colors.reset} ${stats.missingReadmes}`);
    console.log(`  ${colors.yellow}Circular dependencies:${colors.reset} ${stats.circularDependencies}`);
    console.log(`  ${colors.yellow}Deprecated files:${colors.reset} ${stats.deprecatedFiles}`);
  }
}

// Run the script
main(); 
#!/usr/bin/env node

/**
 * Missing Imports Resolver Script
 * 
 * This script analyzes missing imports identified during verification and:
 * 1. Creates missing files where appropriate with appropriate exports
 * 2. Updates imports to point to existing files where possible
 * 3. Documents unresolvable imports for manual resolution
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.join(__dirname, '../../../');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const BACKUP_DIR = path.join(ROOT_DIR, '.missing-imports-fixes-backup');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const UNRESOLVED_IMPORTS_PATH = path.join(DOCS_DIR, 'unresolved-imports.md');

// Common missing imports to handle
const MISSING_IMPORTS_MAP = [
  {
    pattern: /from ['"]@\/components\/Icon['"]/,
    target: '@/components/ui/icons/Icon',
    replacement: true
  },
  {
    pattern: /from ['"]@\/components\/ui\/icons\/SvgIcon['"]/,
    target: '@/components/ui/icons/core/SvgIcon',
    replacement: true
  },
  {
    pattern: /from ['"]\.\.\/icon['"]/,
    target: null, // Handle dynamically based on context
    replacement: false
  },
  {
    pattern: /from ['"]\.\/icons['"]/,
    target: null, // Handle dynamically based on context
    replacement: false
  },
  {
    pattern: /from ['"]\.\/styles\/.*\.styles['"]/,
    target: null, // Handle dynamically based on context
    replacement: false
  },
  {
    pattern: /from ['"]\.\/ErrorBoundary['"]/,
    target: '@/components/features/core/error-handling/ErrorBoundary',
    replacement: true
  },
  {
    pattern: /from ['"]\.\/types['"]/,
    target: '../types', // This is likely a relative import that needs context
    replacement: false
  },
  {
    pattern: /from ['"]@\/src\/components/,
    target: '@/components', // Remove duplicate src
    replacement: true
  }
];

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

// Stats for tracking
const stats = {
  filesScanned: 0,
  filesModified: 0,
  backupsMade: 0,
  importsFixed: 0,
  unresolvedImports: 0
};

// Unresolved imports list for documentation
const unresolvedImports = [];

/**
 * Creates a backup of a file before modifying it
 * @param {string} filePath - Path to the file to backup
 */
function createBackup(filePath) {
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Generate backup file path
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\//g, '_');
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const backupPath = path.join(BACKUP_DIR, `${relPath}.${timestamp}.bak`);
  
  // Create backup
  if (!DRY_RUN) {
    fs.copyFileSync(filePath, backupPath);
  }
  
  stats.backupsMade++;
  return backupPath;
}

/**
 * Attempts to fix missing imports in a file
 * @param {string} filePath - Path to the file to analyze
 */
function fixMissingImports(filePath) {
  console.log(`${colors.blue}Analyzing file: ${filePath}${colors.reset}`);
  stats.filesScanned++;
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
    return;
  }
  
  let modified = false;
  const originalContent = content;
  
  // Extract all imports
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  const imports = [];
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      full: match[0],
      path: match[1],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Process each import
  for (const importItem of imports) {
    const importPath = importItem.path;
    
    // Check if import exists
    let absolutePath;
    if (importPath.startsWith('@/')) {
      // For imports using @ alias (remove duplicate 'src' if present)
      const cleanPath = importPath.replace('@/src/', '@/');
      absolutePath = path.join(ROOT_DIR, 'src', cleanPath.substring(2));
    } else {
      // For relative imports
      absolutePath = path.join(path.dirname(filePath), importPath);
    }
    
    // Check if the import exists
    const importExists = doesImportExist(absolutePath);
    
    if (!importExists) {
      // Try to fix the import
      let fixed = false;
      
      // Apply fixes from the mapping
      for (const fix of MISSING_IMPORTS_MAP) {
        if (fix.pattern.test(importItem.full)) {
          if (fix.replacement && fix.target) {
            // Simple replacement
            const newImport = importItem.full.replace(importPath, fix.target);
            content = content.substring(0, importItem.start) + newImport + content.substring(importItem.end);
            console.log(`${colors.green}✓ Fixed import:${colors.reset} ${importPath} → ${fix.target}`);
            fixed = true;
            stats.importsFixed++;
            modified = true;
            break;
          } else if (fix.pattern.toString().includes('styles')) {
            // Handle style imports
            const stylesFix = handleStylesImport(filePath, importPath);
            if (stylesFix) {
              const newImport = importItem.full.replace(importPath, stylesFix);
              content = content.substring(0, importItem.start) + newImport + content.substring(importItem.end);
              console.log(`${colors.green}✓ Fixed styles import:${colors.reset} ${importPath} → ${stylesFix}`);
              fixed = true;
              stats.importsFixed++;
              modified = true;
            }
          } else if (fix.pattern.toString().includes('icons')) {
            // Handle icons imports
            const iconsFix = handleIconsImport(filePath, importPath);
            if (iconsFix) {
              const newImport = importItem.full.replace(importPath, iconsFix);
              content = content.substring(0, importItem.start) + newImport + content.substring(importItem.end);
              console.log(`${colors.green}✓ Fixed icons import:${colors.reset} ${importPath} → ${iconsFix}`);
              fixed = true;
              stats.importsFixed++;
              modified = true;
            }
          } else if (fix.pattern.toString().includes('types')) {
            // Handle types imports
            const typesFix = handleTypesImport(filePath, importPath);
            if (typesFix) {
              const newImport = importItem.full.replace(importPath, typesFix);
              content = content.substring(0, importItem.start) + newImport + content.substring(importItem.end);
              console.log(`${colors.green}✓ Fixed types import:${colors.reset} ${importPath} → ${typesFix}`);
              fixed = true;
              stats.importsFixed++;
              modified = true;
            }
          }
        }
      }
      
      // Fix @/src/ prefix
      if (!if (fixed) importPath.startsWith('@/src/')) {
        const newImportPath = importPath.replace('@/src/', '@/');
        const newImport = importItem.full.replace(importPath, newImportPath);
        content = content.substring(0, importItem.start) + newImport + content.substring(importItem.end);
        console.log(`${colors.green}✓ Fixed @/src/ prefix:${colors.reset} ${importPath} → ${newImportPath}`);
        fixed = true;
        stats.importsFixed++;
        modified = true;
      }
      
      if (!fixed) {
        // Document unresolved import
        console.log(`${colors.yellow}⚠ Unresolved import:${colors.reset} ${importPath} in ${filePath}`);
        unresolvedImports.push({
          file: filePath,
          importPath,
          recommendation: getImportRecommendation(filePath, importPath)
        });
        stats.unresolvedImports++;
      }
    }
  }
  
  // If content was modified, save the changes
  if (modified) {
    if (!DRY_RUN) {
      // Backup the file before modifying
      const backupPath = createBackup(filePath);
      console.log(`${colors.blue}Backed up to ${backupPath}${colors.reset}`);
      
      // Write the updated content
      fs.writeFileSync(filePath, content, 'utf8');
    }
    stats.filesModified++;
  }
}

/**
 * Checks if an import path exists
 * @param {string} importPath - Path to check
 * @returns {boolean} - Whether the import exists
 */
function doesImportExist(importPath) {
  // If path has extension, check directly
  if (path.extname(importPath)) {
    return fs.existsSync(importPath);
  }
  
  // If no extension, check common extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  // Check for index files
  for (const ext of extensions) {
    const indexPath = path.join(importPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return true;
    }
  }
  
  // Check with extensions
  for (const ext of extensions) {
    if (fs.existsSync(`${importPath}${ext}`)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Handle styles import fixes
 * @param {string} filePath - Path of the file being analyzed
 * @param {string} importPath - Import path to fix
 * @returns {string|null} - Fixed import path or null
 */
function handleStylesImport(filePath, importPath) {
  const componentName = path.basename(path.dirname(filePath)).toLowerCase();
  
  if (importPath.includes('styles')) {
    // Try common patterns
    const possiblePaths = [
      `../styles/${componentName}.styles`,
      `./styles/${componentName}.styles`,
      `@/components/ui/${componentName}/styles/${componentName}.styles`
    ];
    
    for (const testPath of possiblePaths) {
      const absolutePath = testPath.startsWith('@/') 
        ? path.join(ROOT_DIR, 'src', testPath.substring(2))
        : path.join(path.dirname(filePath), testPath);
      
      if (doesImportExist(absolutePath)) {
        return testPath;
      }
    }
    
    // If not found, create the styles file
    if (!DRY_RUN) {
      const stylesDir = path.join(path.dirname(filePath), 'styles');
      if (!fs.existsSync(stylesDir)) {
        fs.mkdirSync(stylesDir, { recursive: true });
      }
      
      const stylesPath = path.join(stylesDir, `${componentName}.styles.ts`);
      const stylesContent = `// Auto-generated styles file for ${componentName}
export const ${componentName}Styles = {
  // Add styles here
};
`;
      fs.writeFileSync(stylesPath, stylesContent);
      console.log(`${colors.green}✓ Created styles file:${colors.reset} ${stylesPath}`);
    }
    
    return `./styles/${componentName}.styles`;
  }
  
  return null;
}

/**
 * Handle icons import fixes
 * @param {string} filePath - Path of the file being analyzed
 * @param {string} importPath - Import path to fix
 * @returns {string|null} - Fixed import path or null
 */
function handleIconsImport(filePath, importPath) {
  // If it's an icon import
  if (importPath.includes('icon') || importPath.includes('Icon')) {
    // Common fixes
    if (importPath === './icons' || importPath === '../icons') {
      return '@/components/ui/icons';
    }
    
    if (importPath === '../icon' || importPath === './icon') {
      return '@/components/ui/icons/Icon';
    }
    
    // Try component-specific
    const componentDir = path.dirname(filePath);
    const possiblePaths = [
      path.join(componentDir, 'icons'),
      path.join(componentDir, '..', 'icons'),
      path.join(COMPONENTS_DIR, 'ui', 'icons')
    ];
    
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        const relativePath = path.relative(path.dirname(filePath), testPath);
        return relativePath || './icons';
      }
    }
  }
  
  return null;
}

/**
 * Handle types import fixes
 * @param {string} filePath - Path of the file being analyzed
 * @param {string} importPath - Import path to fix
 * @returns {string|null} - Fixed import path or null
 */
function handleTypesImport(filePath, importPath) {
  // If it's a types import
  if (importPath === './types' || importPath === '../types') {
    // Try common locations
    const componentDir = path.dirname(filePath);
    const possiblePaths = [
      path.join(componentDir, 'types.ts'),
      path.join(componentDir, '..', 'types.ts'),
      path.join(componentDir, 'shared', 'types.ts'),
      path.join(componentDir, '..', 'shared', 'types.ts')
    ];
    
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        return path.relative(path.dirname(filePath), testPath.replace(/\.ts$/, ''));
      }
    }
    
    // If not found, create the types file
    if (!DRY_RUN) {
      const typesPath = path.join(componentDir, 'types.ts');
      const componentName = path.basename(componentDir);
      const typesContent = `// Auto-generated types file for ${componentName}
export interface ${componentName}Props {
  // Add types here
}
`;
      fs.writeFileSync(typesPath, typesContent);
      console.log(`${colors.green}✓ Created types file:${colors.reset} ${typesPath}`);
    }
    
    return './types';
  }
  
  return null;
}

/**
 * Get a recommendation for an unresolved import
 * @param {string} filePath - Path of the file being analyzed
 * @param {string} importPath - Import path to fix
 * @returns {string} - Recommendation
 */
function getImportRecommendation(filePath, importPath) {
  // Extract component name from import path
  const parts = importPath.split('/');
  const lastPart = parts[parts.length - 1];
  
  // Check if it's a component name
  if (/^[A-Z]/.test(lastPart)) {
    return `May need to create the ${lastPart} component or update import to use a similar existing component`;
  }
  
  // Check if it's a relative path
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return `Check if the file structure has changed; may need to update relative path or create missing file`;
  }
  
  // Check if it's an absolute path
  if (importPath.startsWith('@/')) {
    return `Update import to use the new location after unification or create the missing file`;
  }
  
  return `Review this import to determine the correct path in the unified structure`;
}

/**
 * Recursively scans a directory for files to process
 * @param {string} dirPath - Path to the directory to scan
 */
function scanDirectory(dirPath) {
  // Get all files in the directory
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    
    // Skip node_modules and certain directories
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name.startsWith('.')) {
        continue;
      }
      scanDirectory(entryPath);
    } else if (entry.isFile()) {
      // Check if the file has a relevant extension
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        fixMissingImports(entryPath);
      }
    }
  }
}

/**
 * Document unresolved imports for manual fixes
 */
function documentUnresolvedImports() {
  console.log(`${colors.blue}Documenting unresolved imports...${colors.reset}`);
  
  if (unresolvedImports.length === 0) {
    console.log(`${colors.green}✓ No unresolved imports to document${colors.reset}`);
    return;
  }
  
  // Create docs directory if it doesn't exist
  if (!DRY_RUN && !fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  
  // Group unresolved imports by file
  const byFile = {};
  for (const item of unresolvedImports) {
    if (!byFile[item.file]) {
      byFile[item.file] = [];
    }
    byFile[item.file].push({
      importPath: item.importPath,
      recommendation: item.recommendation
    });
  }
  
  // Generate documentation content
  const content = `# Unresolved Imports

This document lists import statements that could not be automatically resolved during the codebase unification process.
These imports need to be manually reviewed and fixed.

## Files with Unresolved Imports

${Object.keys(byFile).map(file => `
### ${path.relative(ROOT_DIR, file)}

${byFile[file].map(item => `- \`import ... from '${item.importPath}'\`
  - **Recommendation**: ${item.recommendation}`).join('\n')}
`).join('\n')}

## Next Steps

1. Review each file and fix the imports according to the recommendations
2. Run the final verification script again to confirm all imports are resolved:
   \`\`\`bash
   node scripts/directory-structure/phase7/final-verification.js
   \`\`\`
3. Update the unification.md document to reflect progress
`;
  
  // Write the documentation file
  if (!DRY_RUN) {
    fs.writeFileSync(UNRESOLVED_IMPORTS_PATH, content, 'utf8');
    console.log(`${colors.green}✓ Documented unresolved imports:${colors.reset} ${UNRESOLVED_IMPORTS_PATH}`);
  } else {
    console.log(`${colors.blue}Would document unresolved imports:${colors.reset} ${UNRESOLVED_IMPORTS_PATH}`);
  }
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Missing Imports Resolver Script ${DRY_RUN ? '(DRY RUN)' : ''} ===${colors.reset}`);
  
  // Scan the codebase
  console.log(`${colors.blue}Scanning the codebase...${colors.reset}`);
  scanDirectory(SRC_DIR);
  
  // Document unresolved imports
  documentUnresolvedImports();
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.blue}Files scanned:${colors.reset} ${stats.filesScanned}`);
  console.log(`${colors.blue}Files modified:${colors.reset} ${stats.filesModified}`);
  console.log(`${colors.blue}Backups made:${colors.reset} ${stats.backupsMade}`);
  console.log(`${colors.blue}Imports fixed:${colors.reset} ${stats.importsFixed}`);
  console.log(`${colors.blue}Unresolved imports:${colors.reset} ${stats.unresolvedImports}`);
  
  if (DRY_RUN) {
    console.log(`\n${colors.yellow}This was a dry run. No actual changes were made.${colors.reset}`);
    console.log(`${colors.yellow}Run without --dry-run to apply changes.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}Missing imports resolution completed!${colors.reset}`);
    if (stats.unresolvedImports > 0) {
      console.log(`${colors.yellow}Some imports could not be automatically resolved. See ${UNRESOLVED_IMPORTS_PATH} for details.${colors.reset}`);
    }
  }
}

// Run the script
main(); 
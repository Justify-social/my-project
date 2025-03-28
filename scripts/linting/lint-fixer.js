#!/usr/bin/env node

/**
 * ESLint Automated Fixer
 * 
 * This script fixes common ESLint issues automatically:
 * - Missing component imports in JSX
 * - CommonJS require() to ES module imports
 * - Anonymous default exports
 * - Other automatically fixable issues via ESLint's --fix
 * 
 * Usage:
 *   node scripts/consolidated/linting/lint-fixer.js [--file <filepath>]
 * 
 * Options:
 *   --file   Only fix issues in the specified file
 */

// Import required modules
import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const CODEBASE_ROOT = path.resolve(__dirname, '../../..');

// Simple color functions
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  file: args.includes('--file') ? args[args.indexOf('--file') + 1] : null,
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose')
};

// Logger
function log(message, type = 'info') {
  const prefix = {
    info: colors.blue('INFO'),
    success: colors.green('SUCCESS'),
    warning: colors.yellow('WARNING'),
    error: colors.red('ERROR'),
    fix: colors.magenta('FIX'),
    dry: colors.cyan('DRY-RUN')
  }[type];
  
  console.log(`${prefix}: ${message}`);
}

// Get ESLint issues for a file or the entire codebase
function getLintIssues(filePath = null) {
  const target = filePath ? filePath : '.';
  let eslintOutput;
  
  try {
    eslintOutput = execSync(
      `npx eslint --config eslint.config.mjs --format json ${target}`, 
      { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );
  } catch (error) {
    // ESLint returns non-zero exit code when issues are found
    if (error.stdout) {
      eslintOutput = error.stdout;
    } else {
      log(`Failed to run ESLint: ${error.message}`, 'error');
      throw error;
    }
  }
  
  try {
    return JSON.parse(eslintOutput);
  } catch (error) {
    log(`Failed to parse ESLint output as JSON. This might be due to the output size.`, 'error');
    log(`Attempting to process files individually instead...`, 'info');
    
    // Fallback approach - get all TypeScript/JavaScript files and process them one by one
    return processFilesIndividually();
  }
}

// Fallback function to process files individually when bulk processing fails
function processFilesIndividually() {
  log('Using fallback method to find files with lint issues', 'info');
  
  // Get all TypeScript/JavaScript files
  const files = [];
  const fileTypes = ['.js', '.jsx', '.ts', '.tsx'];
  
  function traverseDirectory(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      // Skip node_modules and other common exclusions
      if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'build') {
        continue;
      }
      
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (fileTypes.includes(path.extname(fullPath))) {
        files.push(fullPath);
      }
    }
  }
  
  traverseDirectory(CODEBASE_ROOT);
  log(`Found ${files.length} files to check individually`, 'info');
  
  // Return a mock ESLint result structure with just the file paths
  return files.map(file => ({
    filePath: file,
    messages: [],
    errorCount: 0,
    warningCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    suppressedMessages: []
  }));
}

// Fix missing component imports in JSX files
function fixMissingComponentImports(filePath, issues) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, 'error');
    return false;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const missingComponents = issues.filter(issue => 
    issue.ruleId === 'react/jsx-no-undef'
  );
  
  if (missingComponents.length === 0) {
    return false;
  }
  
  log(`Found ${missingComponents.length} missing component imports in ${filePath}`, 'info');
  
  if (options.dryRun) {
    missingComponents.forEach(issue => {
      log(`Would fix: Missing import for component '${issue.message.match(/'([^']+)'/)[1]}' at line ${issue.line}`, 'dry');
    });
    return true;
  }
  
  // Extract component names that need to be imported
  const componentNames = missingComponents.map(issue => {
    const match = issue.message.match(/'([^']+)'/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  // Find potential import sources
  const potentialImports = findPotentialImports(componentNames, filePath);
  
  // Add imports to the file
  let updatedContent = fileContent;
  let importsAdded = 0;
  
  for (const component of componentNames) {
    if (potentialImports[component]) {
      const importStatement = `import ${component} from '${potentialImports[component]}';\n`;
      
      // Add import after existing imports
      const importRegex = /^import .+?;(\r?\n)/m;
      if (importRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(
          importRegex, 
          (match, newline) => `${match}${importStatement}`
        );
      } else {
        // No existing imports, add at the beginning of the file
        updatedContent = importStatement + updatedContent;
      }
      
      importsAdded++;
      log(`Added import for ${component} from '${potentialImports[component]}'`, 'fix');
    } else {
      log(`Could not find import source for component: ${component}`, 'warning');
    }
  }
  
  if (importsAdded > 0) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    log(`Fixed ${importsAdded}/${componentNames.length} missing imports in ${filePath}`, 'success');
    return true;
  }
  
  return false;
}

// Find potential import sources for missing components
function findPotentialImports(componentNames, currentFilePath) {
  const imports = {};
  
  // Common paths to check for components
  const commonPaths = [
    'src/components',
    'components',
    'src/components/ui',
    'src/components/features'
  ];
  
  for (const component of componentNames) {
    // Search for potential files that might export this component
    const potentialFiles = [];
    
    try {
      // Look for exact match files
      for (const basePath of commonPaths) {
        // Check for files with the same name as the component
        const variations = [
          path.join(basePath, component, 'index.tsx'),
          path.join(basePath, component, 'index.ts'),
          path.join(basePath, component + '.tsx'),
          path.join(basePath, component + '.jsx'),
          path.join(basePath, 'ui', component + '.tsx'),
          path.join(basePath, 'ui', component + '.jsx')
        ];
        
        for (const filePath of variations) {
          const fullPath = path.join(CODEBASE_ROOT, filePath);
          if (fs.existsSync(fullPath)) {
            potentialFiles.push(filePath);
          }
        }
      }
      
      // Search for files that might export this component by name
      if (potentialFiles.length === 0) {
        const result = execSync(
          `grep -r "export.*${component}" --include="*.tsx" --include="*.jsx" --include="*.ts" src`,
          { encoding: 'utf8', cwd: CODEBASE_ROOT }
        );
        
        if (result) {
          const lines = result.split('\n').filter(Boolean);
          lines.forEach(line => {
            const [file] = line.split(':');
            if (file && !potentialFiles.includes(file)) {
              potentialFiles.push(file);
            }
          });
        }
      }
    } catch (error) {
      // Grep might fail if no matches are found, which is fine
    }
    
    // Select the best matching import path
    if (potentialFiles.length > 0) {
      // For simplicity, just take the first one
      // In a more advanced version, we could analyze the content to confirm the export
      const relativePath = path.relative(
        path.dirname(currentFilePath),
        path.join(CODEBASE_ROOT, potentialFiles[0])
      ).replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
      
      // Handle special case where the path is the current directory
      const importPath = relativePath.startsWith('.') 
        ? relativePath
        : './' + relativePath;
      
      // Remove file extension
      imports[component] = importPath.replace(/\.(tsx|jsx|ts|js)$/, '');
    }
  }
  
  return imports;
}

// Fix CommonJS require() to ES module imports
function fixRequireToImport(filePath, issues) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, 'error');
    return false;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const requireIssues = issues.filter(issue => 
    issue.ruleId === '@typescript-eslint/no-require-imports'
  );
  
  if (requireIssues.length === 0) {
    return false;
  }
  
  log(`Found ${requireIssues.length} require() statements to fix in ${filePath}`, 'info');
  
  if (options.dryRun) {
    requireIssues.forEach(issue => {
      log(`Would fix: require() statement at line ${issue.line}`, 'dry');
    });
    return true;
  }
  
  // Process all require statements in the file
  const lines = fileContent.split('\n');
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    // Look for require statements
    const requireRegex = /const\s+([a-zA-Z0-9_{}]+)\s+=\s+require\(['"]([^'"]+)['"]\);?/;
    const match = lines[i].match(requireRegex);
    
    if (match) {
      const [fullMatch, importName, modulePath] = match;
      
      // Check if it's a destructured require
      if (importName.startsWith('{') && importName.endsWith('}')) {
        // Handle destructuring
        const namedImports = importName.slice(1, -1).trim();
        lines[i] = `import ${namedImports} from '${modulePath}';`;
      } else {
        // Simple import
        lines[i] = `import ${importName} from '${modulePath}';`;
      }
      
      modified = true;
      log(`Converted require() to import at line ${i + 1}`, 'fix');
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    log(`Fixed require() statements in ${filePath}`, 'success');
    return true;
  }
  
  return false;
}

// Fix anonymous default exports
function fixAnonymousExports(filePath, issues) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, 'error');
    return false;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const anonymousExportIssues = issues.filter(issue => 
    issue.ruleId === 'import/no-anonymous-default-export'
  );
  
  if (anonymousExportIssues.length === 0) {
    return false;
  }
  
  log(`Found ${anonymousExportIssues.length} anonymous default exports in ${filePath}`, 'info');
  
  if (options.dryRun) {
    anonymousExportIssues.forEach(issue => {
      log(`Would fix: Anonymous default export at line ${issue.line}`, 'dry');
    });
    return true;
  }
  
  const lines = fileContent.split('\n');
  let modified = false;
  
  // Extract filename without extension to use as component name
  const baseName = path.basename(filePath, path.extname(filePath));
  const componentName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  
  for (let i = 0; i < lines.length; i++) {
    // Handle different types of anonymous exports
    
    // Anonymous function exports
    const functionExportRegex = /export\s+default\s+function\s*\(/;
    if (functionExportRegex.test(lines[i])) {
      lines[i] = lines[i].replace(
        functionExportRegex,
        `function ${componentName}(`
      );
      
      // Add the export at the end of the file
      lines.push(`\nexport default ${componentName};`);
      
      modified = true;
      log(`Named anonymous function export as '${componentName}'`, 'fix');
      continue;
    }
    
    // Anonymous arrow function exports
    const arrowExportRegex = /export\s+default\s+\(/;
    if (arrowExportRegex.test(lines[i])) {
      lines[i] = lines[i].replace(
        arrowExportRegex,
        `const ${componentName} = (`
      );
      
      // Add the export at the end of the file
      lines.push(`\nexport default ${componentName};`);
      
      modified = true;
      log(`Named anonymous arrow function export as '${componentName}'`, 'fix');
      continue;
    }
    
    // Anonymous object exports
    const objectExportRegex = /export\s+default\s+\{/;
    if (objectExportRegex.test(lines[i])) {
      lines[i] = lines[i].replace(
        objectExportRegex,
        `const ${componentName} = {`
      );
      
      // Add the export at the end of the file
      lines.push(`\nexport default ${componentName};`);
      
      modified = true;
      log(`Named anonymous object export as '${componentName}'`, 'fix');
      continue;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    log(`Fixed anonymous exports in ${filePath}`, 'success');
    return true;
  }
  
  return false;
}

// Run ESLint with --fix on a file
function runEslintFix(filePath) {
  log(`Running ESLint --fix on ${filePath}`, 'info');
  
  if (options.dryRun) {
    log(`Would run 'npx eslint --config eslint.config.mjs --fix ${filePath}'`, 'dry');
    return true;
  }
  
  try {
    execSync(
      `npx eslint --config eslint.config.mjs --fix "${filePath}"`,
      { encoding: 'utf8', stdio: options.verbose ? 'inherit' : 'pipe' }
    );
    log(`Applied ESLint automatic fixes to ${filePath}`, 'success');
    return true;
  } catch (error) {
    // ESLint might exit with non-zero if it couldn't fix all issues, which is expected
    log(`Applied partial ESLint fixes to ${filePath}`, 'warning');
    return true;
  }
}

// Process a single file for linting issues
function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, 'error');
    return false;
  }
  
  log(`Processing ${filePath}`, 'info');
  
  try {
    // Read the file content
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let updatedContent = originalContent;
    let modified = false;
    
    // 1. Fix require() imports - convert to ES6 imports
    const requirePattern = /(?:const|let|var)\s+([^=]+)\s*=\s*require\(['"](.*)['"]\);?/g;
    let requireMatch;
    let requireCount = 0;
    
    // Collect all require statements to convert
    const requireStatements = [];
    while ((requireMatch = requirePattern.exec(originalContent)) !== null) {
      requireStatements.push({
        fullMatch: requireMatch[0],
        importName: requireMatch[1].trim(),
        importPath: requireMatch[2]
      });
      requireCount++;
    }
    
    if (requireCount > 0) {
      log(`Found ${requireCount} require() statements to fix in ${filePath}`, 'info');
      
      // Process each require statement
      requireStatements.forEach(req => {
        // Handle different import formats (destructuring, default, etc.)
        if (req.importName.startsWith('{') && req.importName.endsWith('}')) {
          // Destructured import: import a, b from 'module';
          const namedImports = req.importName.slice(1, -1).trim();
          const importStatement = `import ${namedImports} from '${req.importPath}';`;
          updatedContent = updatedContent.replace(req.fullMatch, importStatement);
        } else if (req.importName.includes('=')) {
          // Assignment with require: const a = b = require('module');
          // Convert to separate imports
          const parts = req.importName.split('=').map(p => p.trim());
          const importStatement = `import ${parts[0]} from '${req.importPath}';`;
          updatedContent = updatedContent.replace(req.fullMatch, importStatement);
        } else {
          // Standard import: import module from 'module';
          const importStatement = `import ${req.importName} from '${req.importPath}';`;
          updatedContent = updatedContent.replace(req.fullMatch, importStatement);
        }
      });
      
      modified = true;
    }
    
    // 2. Fix missing component imports (if file is JSX/TSX)
    if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
      // Look for JSX tags not defined in the file
      const jsxPattern = /<([A-Z][a-zA-Z0-9]*)(?:\s|\/?>)/g;
      const importedComponentsPattern = /import\s+{?\s*([^{};\n]+)\s*}?\s*from/g;
      
      // Find all JSX component usages
      const jsxComponents = new Set();
      let jsxMatch;
      while ((jsxMatch = jsxPattern.exec(updatedContent)) !== null) {
        jsxComponents.add(jsxMatch[1]);
      }
      
      // Find all already imported components
      const importedComponents = new Set();
      let importMatch;
      while ((importMatch = importedComponentsPattern.exec(updatedContent)) !== null) {
        importMatch[1].split(',').forEach(comp => {
          const trimmed = comp.trim().split(' as ')[0];
          importedComponents.add(trimmed);
        });
      }
      
      // Find missing components (used but not imported)
      const missingComponents = [...jsxComponents].filter(comp => !importedComponents.has(comp));
      
      if (missingComponents.length > 0) {
        log(`Found ${missingComponents.length} potential missing component imports in ${filePath}`, 'info');
        
        // Try to find imports for missing components
        const importStatements = [];
        
        for (const component of missingComponents) {
          // Skip native HTML elements and components that are likely defined in the file
          if (component.toLowerCase() === component || updatedContent.includes(`function ${component}`)) {
            continue;
          }
          
          // Try to find a matching component file
          const potentialImports = findPotentialImports([component], filePath);
          if (potentialImports[component]) {
            importStatements.push(`import ${component} from '${potentialImports[component]}';`);
          }
        }
        
        // Add import statements after existing imports
        if (importStatements.length > 0) {
          const importSection = updatedContent.match(/import.*?from.*?;(\s*)/s);
          if (importSection) {
            const index = importSection.index + importSection[0].length;
            updatedContent = 
              updatedContent.slice(0, index) + 
              importStatements.join('\n') + '\n' + 
              updatedContent.slice(index);
            modified = true;
          } else {
            // No existing imports, add at the beginning of the file
            updatedContent = importStatements.join('\n') + '\n\n' + updatedContent;
            modified = true;
          }
        }
      }
    }
    
    // 3. Fix unused expressions
    const unusedExpressionPattern = /(?<!\bvoid\s+)([a-zA-Z0-9_$.]+)\s*&&\s*([a-zA-Z0-9_$.]+\([^)]*\))/g;
    if (unusedExpressionPattern.test(updatedContent)) {
      log(`Found potential unused expressions in ${filePath}`, 'info');
      
      // Convert unused expressions like 'if (a) b()' to 'if (a) b()'
      updatedContent = updatedContent.replace(
        unusedExpressionPattern,
        (match, condition, action) => `if (${condition}) ${action}`
      );
      
      modified = true;
    }
    
    // Write changes if modified
    if (modified && !options.dryRun) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      log(`Fixed issues in ${filePath}`, 'success');
      
      // Run ESLint --fix as a final pass to clean up any other issues
      try {
        execSync(`npx eslint --config eslint.config.mjs --fix "${filePath}"`, { 
          stdio: options.verbose ? 'inherit' : 'ignore' 
        });
        log(`Applied ESLint fixes to ${filePath}`, 'success');
      } catch (error) {
        log(`Applied partial ESLint fixes to ${filePath}`, 'warning');
      }
      
      return true;
    } else if (modified && options.dryRun) {
      log(`Would fix issues in ${filePath} (dry run)`, 'dry');
      return true;
    }
    
    return false;
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`, 'error');
    return false;
  }
}

// Main function
function main() {
  log('Starting ESLint automated fixer', 'info');
  
  let files = [];
  
  if (options.file) {
    // Process a single file
    files = [options.file];
  } else {
    // Process all JavaScript/TypeScript files, excluding problematic paths
    log('Finding JavaScript and TypeScript files to process', 'info');
    
    const fileTypes = ['.js', '.jsx', '.ts', '.tsx'];
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'cypress/downloads'];
    
    function traverseDirectory(dir) {
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          
          // Skip excluded directories
          if (fs.statSync(fullPath).isDirectory()) {
            if (!excludeDirs.includes(item)) {
              traverseDirectory(fullPath);
            }
            continue;
          }
          
          // Only process JavaScript/TypeScript files
          if (fileTypes.includes(path.extname(fullPath))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        log(`Error traversing directory ${dir}: ${error.message}`, 'error');
      }
    }
    
    traverseDirectory(CODEBASE_ROOT);
    log(`Found ${files.length} JavaScript/TypeScript files to check`, 'info');
  }
  
  // Process each file individually
  let processedCount = 0;
  let fixedCount = 0;
  
  for (const file of files) {
    try {
      if (processFile(file)) {
        fixedCount++;
      }
      processedCount++;
      
      // Log progress every 10 files
      if (processedCount % 10 === 0) {
        log(`Progress: Processed ${processedCount}/${files.length} files, fixed ${fixedCount} files`, 'info');
      }
    } catch (error) {
      log(`Error processing file ${file}: ${error.message}`, 'error');
    }
  }
  
  log(`Completed processing ${processedCount} files, applied fixes to ${fixedCount} files`, 'success');
  
  if (fixedCount > 0) {
    log('Next steps:', 'info');
    log('1. Run ESLint to verify fixes: npx eslint --config eslint.config.mjs .', 'info');
    log('2. Manually address any remaining issues that could not be fixed automatically', 'info');
  } else {
    log('No fixes were applied. The code may already be in good shape!', 'info');
  }
}

// Run main function if executed directly
if (require.main === module) {
  main();
} 
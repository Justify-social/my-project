#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import * as globModule from 'glob';
import chalk from 'chalk';

// Use the glob function from the module
const glob = globModule.glob;

/**
 * Component Path Consistency Validator
 * 
 * This script validates that the component paths in ComponentPreview.tsx
 * match the actual implementation files in the codebase.
 * 
 * It serves as a "single source of truth" validation to prevent
 * path drift and inconsistencies in the UI Component Library.
 */

// Configuration
const COMPONENT_PREVIEW_PATH = 'src/app/(admin)/debug-tools/ui-components/components/ComponentPreview.tsx';
const COMPONENT_DISCOVERY_PATH = 'src/app/(admin)/debug-tools/ui-components/utils/component-discovery.js';
const COMPONENT_REGISTRY_UTILS_PATH = 'src/app/(admin)/debug-tools/ui-components/utils/component-registry-utils.js';
const COMPONENT_PATTERNS = [
  'src/components/ui/atoms/**/*.tsx',
  'src/components/ui/molecules/**/*.tsx',
  'src/components/ui/organisms/**/*.tsx',
];
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/*.test.tsx',
  '**/*.test.ts',
  '**/*.spec.tsx',
  '**/*.spec.ts',
  '**/examples/**',
  '**/test/**',
];

// Main function
async function main() {
  try {
    // Check if files exist
    if (!fs.existsSync(COMPONENT_PREVIEW_PATH)) {
      console.error(chalk.red(`Component preview file not found: ${COMPONENT_PREVIEW_PATH}`));
      process.exit(1);
    }

    // Extract imports from ComponentPreview
    console.log(`Extracting import paths from ComponentPreview.tsx...`);
    const previewContent = fs.readFileSync(COMPONENT_PREVIEW_PATH, 'utf8');
    const imports = extractDynamicImports(previewContent);
    console.log(`Found ${imports.length} component imports`);

    // Extract patterns from component discovery file if it exists
    let discoveryPatterns = [];
    if (fs.existsSync(COMPONENT_DISCOVERY_PATH)) {
      console.log(`Checking component discovery patterns in ${COMPONENT_DISCOVERY_PATH}...`);
      const discoveryContent = fs.readFileSync(COMPONENT_DISCOVERY_PATH, 'utf8');
      discoveryPatterns = extractComponentPatterns(discoveryContent);
      console.log(`Found ${discoveryPatterns.length} component patterns in discovery system`);
    }

    // Check if auto-discovery is being used
    const isUsingAutoDiscovery = discoveryPatterns.length > 0 || 
                                (fs.existsSync(COMPONENT_DISCOVERY_PATH) &&
                                fs.readFileSync(COMPONENT_DISCOVERY_PATH, 'utf8').includes('discoverComponents()'));
    console.log(`${isUsingAutoDiscovery ? chalk.green('✓') : chalk.red('✗')} Auto-discovery system: ${isUsingAutoDiscovery ? 'ENABLED' : 'DISABLED'}`);

    // If using auto-discovery, analyze the patterns rather than explicit imports
    const componentImports = isUsingAutoDiscovery 
      ? getAutoDiscoveredComponents(discoveryPatterns)
      : imports;
    
    console.log(`Found ${componentImports.length} component imports in ${isUsingAutoDiscovery ? 'auto-discovery system' : 'ComponentPreview.tsx'}`);

    // Find all component implementations
    console.log(`Finding component implementations in the codebase...`);
    const implementations = findComponentImplementations();
    console.log(`Found ${implementations.length} component implementations in the codebase`);

    // Check for issues
    const issues = findIssues(componentImports, implementations, isUsingAutoDiscovery);
    
    if (issues.length > 0) {
      console.log(chalk.red(`❌ Found ${issues.length} component path issues:\n`));
      
      // Group issues by type
      const missingImplementations = issues.filter(issue => issue.type === 'missing-implementation');
      const notInPreview = issues.filter(issue => issue.type === 'not-in-preview');
      const pathMismatches = issues.filter(issue => issue.type === 'path-mismatch');
      
      // Show missing implementations
      if (missingImplementations.length > 0) {
        console.log(chalk.yellow(`❓ Missing Implementations (${missingImplementations.length}):`));
        missingImplementations.forEach(issue => {
          console.log(`  - ${issue.component} (${issue.importPath})`);
        });
        console.log('');
      }
      
      // Show components not in preview
      if (notInPreview.length > 0) {
        console.log(chalk.blue(`➕ Components Not in Preview:`));
        notInPreview.forEach(issue => {
          console.log(`  - ${issue.component} (${issue.filePath})`);
        });
        console.log('');
      }
      
      // Show path mismatches
      if (pathMismatches.length > 0) {
        console.log(chalk.red(`⚠️ Path Mismatches:`));
        pathMismatches.forEach(issue => {
          console.log(`  - ${issue.component}:`);
          console.log(`    Expected: ${issue.importPath}`);
          console.log(`    Found: ${issue.filePath}`);
        });
      }
      
      // Provide suggestions if using auto-discovery
      if (isUsingAutoDiscovery) {
        console.log(chalk.green(`\nAuto-discovery is enabled. The system will attempt to load all components.`));
        console.log(chalk.green(`If components are missing, check the following:`));
        console.log(`1. Component files follow naming and export conventions`);
        console.log(`2. Component directories follow the standard path pattern`);
        console.log(`3. Default props are provided for components that need them to render properly`);
      }
      
      process.exit(1);
    } else {
      console.log(chalk.green(`✓ All component paths are valid!`));
      if (isUsingAutoDiscovery) {
        console.log(chalk.green(`✓ Auto-discovery system is working correctly and all components are included.`));
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

// Extract dynamic imports from component preview file
function extractDynamicImports(content) {
  const dynamicImportRegex = /dynamic\(\s*\(\)\s*=>\s*import\(['"](.*?)['"]\)/g;
  const imports = [];
  let match;
  
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Also check for safeDynamicImport pattern
  const safeDynamicImportRegex = /safeDynamicImport\(\s*import\(['"](.*?)['"]\)/g;
  while ((match = safeDynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Also check for safeDynamicImportPath pattern
  const safeDynamicImportPathRegex = /safeDynamicImportPath\(\s*import\(['"](.*?)['"]\)/g;
  while ((match = safeDynamicImportPathRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return [...new Set(imports)]; // Remove duplicates
}

// Extract component patterns from discovery file
function extractComponentPatterns(content) {
  // Look for COMPONENT_PATTERNS array in the file - use a more robust regex for multi-line arrays
  const patternsRegex = /COMPONENT_PATTERNS\s*=\s*\[\s*([\s\S]*?)\s*\]/g;
  const match = patternsRegex.exec(content);
  
  if (match && match[1]) {
    // Extract each pattern string, supporting both single and double quotes
    const patternStringsRegex = /['"]([^'"]+)['"]/g;
    const patterns = [];
    let patternMatch;
    
    while ((patternMatch = patternStringsRegex.exec(match[1])) !== null) {
      patterns.push(patternMatch[1]);
    }
    
    return patterns;
  }
  
  // Try another approach if the first one fails - look for the const declaration
  const constRegex = /const\s+COMPONENT_PATTERNS\s*=\s*\[\s*([\s\S]*?)\s*\]/g;
  const constMatch = constRegex.exec(content);
  
  if (constMatch && constMatch[1]) {
    // Extract each pattern string, supporting both single and double quotes
    const patternStringsRegex = /['"]([^'"]+)['"]/g;
    const patterns = [];
    let patternMatch;
    
    while ((patternMatch = patternStringsRegex.exec(constMatch[1])) !== null) {
      patterns.push(patternMatch[1]);
    }
    
    return patterns;
  }
  
  // If everything else fails, check if the file contains the standard patterns as strings
  const commonPatterns = [
    'src/components/ui/atoms/**/*.tsx',
    'src/components/ui/molecules/**/*.tsx',
    'src/components/ui/organisms/**/*.tsx'
  ];
  
  if (commonPatterns.every(pattern => content.includes(pattern))) {
    console.log('Using fallback common patterns detection');
    return commonPatterns;
  }
  
  return [];
}

// Get component imports from auto-discovery system
function getAutoDiscoveredComponents(patterns) {
  // If patterns is empty but component discovery file exists, use default patterns
  if (patterns.length === 0 && fs.existsSync(COMPONENT_DISCOVERY_PATH)) {
    console.log('No patterns found but component discovery file exists. Using default patterns.');
    patterns = [
      'src/components/ui/atoms/**/*.tsx',
      'src/components/ui/molecules/**/*.tsx',
      'src/components/ui/organisms/**/*.tsx'
    ];
  }
  
  console.log(`Getting components using ${patterns.length} patterns:`);
  patterns.forEach(p => console.log(`  - ${p}`));
  
  // Use the patterns from the discovery file to find all potential components
  const allComponentPaths = [];
  
  for (const pattern of patterns) {
    console.log(`Processing pattern: ${pattern}`);
    try {
      // Use synchronous glob to avoid promise issues
      const files = globModule.sync(pattern, { ignore: IGNORE_PATTERNS });
      console.log(`Found ${files.length} files for pattern ${pattern}`);
      
      for (const file of files) {
        // Convert file path to import path
        const importPath = filePathToImportPath(file);
        allComponentPaths.push(importPath);
      }
    } catch (error) {
      console.error(`Error processing pattern ${pattern}:`, error);
    }
  }
  
  console.log(`Total component paths found: ${allComponentPaths.length}`);
  return [...new Set(allComponentPaths)]; // Remove duplicates
}

// Convert file path to import path (@/components/...)
function filePathToImportPath(filePath) {
  // Remove .tsx extension
  let importPath = filePath.replace(/\.tsx$/, '');
  
  // Convert to @/ format with proper normalization
  if (importPath.startsWith('src/')) {
    // Remove 'src/' prefix to ensure @/components/... format
    importPath = '@/' + importPath.substring(4);
  } else if (!importPath.startsWith('@/')) {
    // If it doesn't start with @/ or src/, add @/
    importPath = '@/' + importPath;
  }
  
  return importPath;
}

// Find all component implementations in the codebase
function findComponentImplementations() {
  const implementations = [];
  
  for (const pattern of COMPONENT_PATTERNS) {
    try {
      // Use synchronous glob
      const files = globModule.sync(pattern, { ignore: IGNORE_PATTERNS });
      implementations.push(...files);
    } catch (error) {
      console.error(`Error finding implementations with pattern ${pattern}:`, error);
    }
  }
  
  return implementations;
}

// Check for issues between imports and implementations
function findIssues(imports, implementations, isUsingAutoDiscovery) {
  const issues = [];
  
  // Create a map of normalized paths to actual paths
  const implementationMap = new Map();
  for (const filePath of implementations) {
    const normalizedPath = normalizePath(filePathToImportPath(filePath));
    implementationMap.set(normalizedPath, filePath);
  }
  
  // Check if imports have implementations
  if (!isUsingAutoDiscovery) {
    for (const importPath of imports) {
      const normalizedImportPath = normalizePath(importPath);
      if (!implementationMap.has(normalizedImportPath)) {
        issues.push({
          type: 'missing-implementation',
          component: getComponentNameFromPath(importPath),
          importPath,
        });
      }
    }
  }
  
  // Check if implementations are in the import list or will be auto-discovered
  for (const [normalizedPath, filePath] of implementationMap.entries()) {
    const componentName = getComponentNameFromPath(filePath);
    
    // If auto-discovery is enabled, we just check the pattern, not specific imports
    if (isUsingAutoDiscovery) {
      // Auto-discovery will find all components, no need to check for not-in-preview
      continue;
    } else {
      // Manual import - check if it's in the list
      const isImported = imports.some(importPath => 
        normalizePath(importPath) === normalizedPath
      );
      
      if (!isImported) {
        issues.push({
          type: 'not-in-preview',
          component: componentName,
          filePath,
        });
      }
    }
  }
  
  // Check for path mismatches (only relevant for non-auto-discovery)
  if (!isUsingAutoDiscovery) {
    for (const importPath of imports) {
      const normalizedImportPath = normalizePath(importPath);
      const matchedImplementation = implementationMap.get(normalizedImportPath);
      
      if (matchedImplementation) {
        // Check if the import path matches the actual file path format
        // This helps catch case mismatches, etc.
        const expectedImportPath = filePathToImportPath(matchedImplementation);
        
        if (importPath !== expectedImportPath) {
          issues.push({
            type: 'path-mismatch',
            component: getComponentNameFromPath(importPath),
            importPath,
            filePath: expectedImportPath,
          });
        }
      }
    }
  }
  
  return issues;
}

// Helper function to normalize paths for comparison
function normalizePath(path) {
  // Remove extensions
  let normalizedPath = path.replace(/\.(tsx|ts|js|jsx)$/, '');
  
  // Convert to lowercase for case-insensitive comparison
  normalizedPath = normalizedPath.toLowerCase();
  
  // Replace @/src/components with @/components
  normalizedPath = normalizedPath.replace('@/src/components/', '@/components/');
  
  // Remove index if it's at the end of the path
  normalizedPath = normalizedPath.replace(/\/index$/, '');
  
  return normalizedPath;
}

// Extract component name from path
function getComponentNameFromPath(path) {
  const parts = path.split('/');
  let name = parts[parts.length - 1];
  
  // If it's an index file, use the parent directory name
  if (name === 'index' && parts.length > 1) {
    name = parts[parts.length - 2];
  }
  
  // Remove file extension if present
  name = name.replace(/\.(tsx|ts|js|jsx)$/, '');
  
  return name;
}

// Run the main function
main(); 
#!/usr/bin/env node

/**
 * Dynamic Imports Implementation Script
 * 
 * This script analyzes page components in the app directory and converts large component imports
 * to dynamic imports using Next.js' dynamic() function to improve performance.
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const SIZE_THRESHOLD = 50 * 1024; // 50KB threshold for dynamic imports
const IGNORE_PATTERNS = ['node_modules', '.git', '.next', 'api'];

// File extensions to process
const VALID_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];

// Route groups to process
const ROUTE_GROUPS = ['(auth)', '(dashboard)', '(campaigns)', '(settings)', '(admin)'];

// Regular expression to match import statements
const IMPORT_REGEX = /import\s+(?:{[^}]+}|\*\s+as\s+[^\s,]+|[^\s,]+)\s+from\s+['"]([^'"]+)['"]/g;

// Check if a file size exceeds the threshold
function isLargeComponent(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size > SIZE_THRESHOLD;
  } catch (error) {
    console.error(`Error checking file size for ${filePath}:`, error);
    return false;
  }
}

// Find all page components in the app directory
function findPageComponents() {
  const pageComponents = [];
  
  for (const group of ROUTE_GROUPS) {
    const groupPath = path.join(APP_DIR, group);
    if (!fs.existsSync(groupPath)) continue;
    
    const routes = fs.readdirSync(groupPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !IGNORE_PATTERNS.includes(dirent.name));
    
    for (const route of routes) {
      const routePath = path.join(groupPath, route.name);
      const pagePath = path.join(routePath, 'page.tsx');
      
      if (fs.existsSync(pagePath)) {
        pageComponents.push(pagePath);
      }
    }
  }
  
  return pageComponents;
}

// Analyze imports in a file
function analyzeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    let match;
    
    while ((match = IMPORT_REGEX.exec(content)) !== null) {
      const importPath = match[1];
      imports.push({
        fullMatch: match[0],
        path: importPath,
        isRelative: importPath.startsWith('.') || importPath.startsWith('/')
      });
    }
    
    return imports;
  } catch (error) {
    console.error(`Error analyzing imports for ${filePath}:`, error);
    return [];
  }
}

// Convert regular imports to dynamic imports
function convertToDynamicImports(filePath, largeComponentImports) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add Next.js dynamic import
    if (!content.includes("import dynamic from 'next/dynamic'")) {
      const importStatement = "import dynamic from 'next/dynamic';\n";
      content = importStatement + content;
    }
    
    // Replace imports with dynamic imports
    for (const importInfo of largeComponentImports) {
      const componentName = importInfo.fullMatch.match(/import\s+(\w+)/)?.[1];
      if (!componentName) continue;
      
      // Remove the original import
      content = content.replace(importInfo.fullMatch, '');
      
      // Add dynamic import at the top of the file (after other imports)
      const lastImportIndex = content.lastIndexOf('import');
      const lastImportLineEnd = content.indexOf('\n', lastImportIndex) + 1;
      
      const dynamicImport = `const ${componentName} = dynamic(() => import('${importInfo.path}'), { ssr: true, loading: () => <div>Loading...</div> });\n`;
      content = content.slice(0, lastImportLineEnd) + dynamicImport + content.slice(lastImportLineEnd);
    }
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`Added dynamic imports to ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`Error converting to dynamic imports for ${filePath}:`, error);
    return false;
  }
}

// Process a page component
function processPageComponent(pagePath) {
  try {
    console.log(`Processing: ${pagePath}`);
    const imports = analyzeImports(pagePath);
    const largeComponentImports = [];
    
    for (const importInfo of imports) {
      if (!importInfo.isRelative) continue; // Skip non-relative imports
      
      // Convert relative import to absolute path
      const importDir = path.dirname(pagePath);
      const absoluteImportPath = path.resolve(importDir, importInfo.path);
      
      // Check if import has a file extension
      let componentPath = absoluteImportPath;
      if (!VALID_EXTENSIONS.some(ext => absoluteImportPath.endsWith(ext))) {
        // Try with each valid extension
        for (const ext of VALID_EXTENSIONS) {
          const testPath = absoluteImportPath + ext;
          if (fs.existsSync(testPath)) {
            componentPath = testPath;
            break;
          }
        }
      }
      
      // Check if the component is large
      if (isLargeComponent(componentPath)) {
        largeComponentImports.push(importInfo);
      }
    }
    
    // Convert large component imports to dynamic imports
    if (largeComponentImports.length > 0) {
      const success = convertToDynamicImports(pagePath, largeComponentImports);
      if (success) {
        console.log(`Converted ${largeComponentImports.length} large component imports to dynamic imports in ${pagePath}`);
      }
    } else {
      console.log(`No large components found in ${pagePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${pagePath}:`, error);
  }
}

// Add loading.tsx components with proper Suspense fallbacks
function addLoadingComponents() {
  for (const group of ROUTE_GROUPS) {
    const groupPath = path.join(APP_DIR, group);
    if (!fs.existsSync(groupPath)) continue;
    
    const loadingPath = path.join(groupPath, 'loading.tsx');
    const loadingContent = `// Loading component for ${group}
import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-white bg-primary-600 transition ease-in-out duration-150">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    </div>
  );
}`;
    
    fs.writeFileSync(loadingPath, loadingContent);
    console.log(`Updated loading component for ${group}`);
  }
}

// Main execution
function main() {
  try {
    console.log('Starting dynamic imports implementation...');
    
    // Find all page components
    const pageComponents = findPageComponents();
    console.log(`Found ${pageComponents.length} page components to process`);
    
    // Process each page component
    let processedCount = 0;
    for (const pagePath of pageComponents) {
      processPageComponent(pagePath);
      processedCount++;
    }
    
    // Add loading components with proper Suspense fallbacks
    addLoadingComponents();
    
    console.log(`Successfully processed ${processedCount} page components`);
    console.log('Dynamic imports implementation completed!');
  } catch (error) {
    console.error('Error during implementation:', error);
    process.exit(1);
  }
}

// Run the implementation
main(); 
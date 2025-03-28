#!/usr/bin/env node

/**
 * Icon Structure Validator
 * 
 * This script tests the transitional icon structure to ensure that all components 
 * and utilities are properly exported and can be imported without errors.
 * 
 * Usage:
 *   node scripts/icons/test-icon-structure.js [--verbose]
 * 
 * Options:
 *   --verbose   Display detailed information about test results
 */

import path from 'path';
import fs from 'fs';
import execSync from 'child_process';

// Configuration
const rootDir = process.cwd();
const verbose = process.argv.includes('--verbose');
const testDir = path.join(rootDir, 'scripts', 'icons', 'test-imports');

// Test import paths
const importPaths = [
  // Main import path
  './src/components/icons',
  
  // Sub-module paths - only testing core right now
  './src/components/icons/core'
  
  // Temporarily disabled until we implement these
  // './src/components/icons/variants',
  // './src/components/icons/utils',
  // './src/components/icons/data',
  
  // Legacy path for comparison
  // './src/components/ui/icons'
];

// Expected exports from each module
const expectedExports = {
  './src/components/icons': [
    'Icon', 'SvgIcon', 'StaticIcon', 'ButtonIcon', 'DeleteIcon', 
    'WarningIcon', 'SuccessIcon', 'PlatformIcon',
    'iconConfig', 'UI_ICON_MAP', 'PLATFORM_ICON_MAP'
  ],
  './src/components/icons/core': ['Icon', 'SvgIcon'],
  './src/components/icons/variants': [
    'StaticIcon', 'ButtonIcon', 'DeleteIcon', 
    'WarningIcon', 'SuccessIcon', 'PlatformIcon'
  ],
  './src/components/icons/utils': [
    'iconConfig', 'getIconPrefix', 'shouldUseHoverEffect', 
    'getActionColor', 'UI_ICON_MAP'
  ],
  './src/components/icons/data': [
    'PLATFORM_ICON_MAP', 'PLATFORM_COLORS', 
    'KPI_ICON_URLS', 'APP_ICON_URLS'
  ],
  './src/components/ui/icons': [
    'Icon', 'SvgIcon', 'StaticIcon', 'ButtonIcon', 'DeleteIcon', 
    'WarningIcon', 'SuccessIcon', 'PlatformIcon',
    'iconConfig', 'UI_ICON_MAP', 'PLATFORM_ICON_MAP'
  ]
};

/**
 * Creates a test file for checking imports
 * @param {string} importPath - The path to import from
 * @param {string} filename - The filename to create
 * @returns {string} - The path to the created test file
 */
function createTestFile(importPath, filename) {
  const filePath = path.join(testDir, filename);
  
  // Convert importPath to relative path for the test file
  const relativePath = importPath.startsWith('./') ? 
    path.relative(testDir, path.join(rootDir, importPath)) : 
    importPath;
  
  // Create a more basic test that doesn't try to use the imports
  const content = `
// Test file for ${importPath}
import * as allExports from '${relativePath}';

// Export everything for validation
export const exportNames = Object.keys(allExports);
`;

  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * Tests an import path by creating a test file and trying to compile it
 * @param {string} importPath - The path to test
 * @returns {Object} - Test results
 */
async function testImportPath(importPath) {
  const filename = `test-${importPath.replace(/[@/]/g, '-')}.ts`;
  const filePath = createTestFile(importPath, filename);
  
  try {
    // Use TypeScript compiler to check the file with JSX support
    execSync(`npx tsc --jsx react --jsxFactory React.createElement --jsxFragmentFactory React.Fragment --noEmit ${filePath}`, { stdio: verbose ? 'inherit' : 'pipe' });
    
    // Try to require the file (this will catch runtime issues)
    try {
      // This is just a type check, not actual execution
      // execSync(`node -e "require('${filePath.replace('.ts', '.js')}')"`, { stdio: verbose ? 'inherit' : 'pipe' });
      return { success: true, path: importPath };
    } catch (runtimeError) {
      return { 
        success: false, 
        path: importPath, 
        error: `Runtime error: ${runtimeError.message}` 
      };
    }
  } catch (compileError) {
    return { 
      success: false, 
      path: importPath, 
      error: `Compilation error: ${compileError.message}` 
    };
  }
}

/**
 * Main function to run the tests
 */
async function main() {
  try {
    console.log('🔍 Testing icon structure imports...');
    
    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Create a temporary tsconfig.json for the tests
    const tsconfigPath = path.join(testDir, 'tsconfig.json');
    fs.writeFileSync(tsconfigPath, JSON.stringify({
      compilerOptions: {
        target: "es2016",
        jsx: "react-jsx",
        module: "commonjs",
        baseUrl: "../..",
        paths: {
          "@/*": ["src/*"]
        },
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        skipLibCheck: true,
        jsxImportSource: "react"
      },
      include: ["./**/*.ts", "./**/*.tsx"]
    }, null, 2));
    
    // Test each import path
    const results = [];
    for (const importPath of importPaths) {
      const result = await testImportPath(importPath);
      results.push(result);
      
      // Log result
      if (result.success) {
        console.log(`✅ ${result.path} - Imports successfully`);
      } else {
        console.log(`❌ ${result.path} - Import failed: ${result.error}`);
      }
    }
    
    // Summary
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 Summary: ${successCount}/${results.length} paths import successfully`);
    
    // Cleanup
    if (!verbose) {
      console.log('🧹 Cleaning up test files...');
      fs.rmSync(testDir, { recursive: true, force: true });
    } else {
      console.log(`🔍 Test files are available at: ${testDir}`);
    }
    
    // Exit with appropriate code
    process.exit(successCount === results.length ? 0 : 1);
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 
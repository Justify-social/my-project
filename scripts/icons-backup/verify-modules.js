/**
 * Complete verification script for the unified icon system
 * This script checks if all modules in the icon system have been properly implemented.
 */

import fs from 'fs';
import path from 'path';

const ICONS_DIR = path.join(__dirname, '../../src/components/icons');
const MODULES = [
  { name: 'Core', dir: 'core', minFiles: 7 },
  { name: 'Variants', dir: 'variants', minFiles: 2 },
  { name: 'Utils', dir: 'utils', minFiles: 4 },
  { name: 'Data', dir: 'data', minFiles: 1 }
];

/**
 * Main verification function
 */
function verifyModules() {
  console.log('🔍 Verifying Icon System Modules...\n');
  
  let allPassed = true;
  
  // Check main index.ts
  const mainIndexExists = fs.existsSync(path.join(ICONS_DIR, 'index.ts'));
  console.log(`${mainIndexExists ? '✅' : '❌'} Main index.ts file`);
  allPassed = allPassed && mainIndexExists;
  
  // Check each module
  for (const module of MODULES) {
    const moduleDir = path.join(ICONS_DIR, module.dir);
    const moduleExists = fs.existsSync(moduleDir);
    const moduleFiles = moduleExists ? fs.readdirSync(moduleDir).filter(f => !f.startsWith('.')) : [];
    const hasEnoughFiles = moduleFiles.length >= module.minFiles;
    const hasIndex = moduleFiles.includes('index.ts');
    
    // Module validation status
    const moduleValid = moduleExists && hasEnoughFiles && hasIndex;
    allPassed = allPassed && moduleValid;
    
    console.log(`\n=== ${module.name} Module ===`);
    console.log(`${moduleExists ? '✅' : '❌'} Directory exists`);
    console.log(`${hasEnoughFiles ? '✅' : '❌'} Has enough files (${moduleFiles.length}/${module.minFiles})`);
    console.log(`${hasIndex ? '✅' : '❌'} Has index.ts`);
    
    if (moduleExists) {
      console.log('\nFiles:');
      moduleFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }
  }
  
  // Verify exports
  if (mainIndexExists) {
    const mainIndex = fs.readFileSync(path.join(ICONS_DIR, 'index.ts'), 'utf8');
    console.log('\n=== Export Verification ===');
    
    // Basic pattern matching for exports
    const hasExports = {
      core: mainIndex.includes("from './core'"),
      variants: mainIndex.includes("from './variants'"),
      utils: mainIndex.includes("from './utils'"),
      data: mainIndex.includes("from './data'")
    };
    
    Object.entries(hasExports).forEach(([module, hasExport]) => {
      console.log(`${hasExport ? '✅' : '❌'} Exports from ${module}`);
      allPassed = allPassed && hasExport;
    });
  }
  
  // Final result
  console.log('\n📊 Summary:');
  console.log(allPassed ? '✅ All modules verified successfully!' : '❌ Some verifications failed');
  
  return allPassed;
}

// Run the verification
const success = verifyModules();
process.exit(success ? 0 : 1); 
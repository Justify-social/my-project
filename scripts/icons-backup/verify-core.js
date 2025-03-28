/**
 * Simple verification script to check if our core icon components can be imported.
 * This script doesn't rely on TypeScript compilation, just checks if files exist.
 */

import fs from 'fs';
import path from 'path';

const CORE_DIR = path.join(__dirname, '../../src/components/icons/core');
const REQUIRED_FILES = [
  'SvgIcon.tsx',
  'safe-icon.tsx',
  'icon-mappings.ts',
  'IconConfig.ts',
  'validation.ts',
  'icon-data.ts',
  'index.ts'
];

function checkFiles() {
  console.log('🔍 Verifying core icon components...');
  
  // Check if the core directory exists
  if (!fs.existsSync(CORE_DIR)) {
    console.error('❌ Core directory not found:', CORE_DIR);
    return false;
  }
  
  // Check for required files
  let allFilesExist = true;
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(CORE_DIR, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - Found`);
    } else {
      console.error(`❌ ${file} - Missing`);
      allFilesExist = false;
    }
  }
  
  // Check if index.ts exports required components
  if (allFilesExist) {
    const indexPath = path.join(CORE_DIR, 'index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const requiredExports = [
      'SvgIcon',
      'Icon',
      'PlatformIcon',
      'SvgIconProps',
      'SafeIcon',
      'SEMANTIC_TO_FA_MAP',
      'getIconBaseName',
      'getIconPrefix',
      'iconConfig'
    ];
    
    let allExportsFound = true;
    for (const exportName of requiredExports) {
      if (content.includes(`export { ${exportName}`) || 
          content.includes(`export type { ${exportName}`) || 
          content.includes(`${exportName},`) ||
          content.includes(`${exportName} }`)) {
        console.log(`✅ ${exportName} - Exported from index.ts`);
      } else {
        console.error(`❌ ${exportName} - Not exported from index.ts`);
        allExportsFound = false;
      }
    }
    
    return allExportsFound && allFilesExist;
  }
  
  return false;
}

// Run verification
const success = checkFiles();
console.log('\n📊 Summary:', success ? '✅ All core components verified!' : '❌ Verification failed');
process.exit(success ? 0 : 1); 
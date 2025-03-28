const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

/**
 * Final script to fix remaining import references to old directories
 * - Fixes @/context references to point to @/contexts
 * - Fixes @/components/layout references to point to @/components/layouts
 */

// Create a backup branch
try {
  execSync('git checkout -b cleanup-import-fixes-backup-2');
  console.log('✅ Created backup branch: cleanup-import-fixes-backup-2');
} catch (error) {
  console.error('Failed to create backup branch:', error.message);
  // Continue without backup if it fails
}

// More specific fixing function that logs verbose information
const fixImports = (filePath, oldPattern, newReplacement) => {
  try {
    console.log(`Checking file: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check if the file contains the pattern
    if (content.includes(oldPattern)) {
      console.log(`Found match in: ${filePath}`);
      
      // Replace the specific pattern
      content = content.replace(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newReplacement);
      
      // Only write back if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed in: ${filePath}`);
        return true;
      } else {
        console.log(`⚠️ Pattern found but no changes made in: ${filePath}`);
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return false;
  }
};

// Manually inspect specific files from our grep results
const manuallyInspectFiles = () => {
  const contextFiles = [
    'src/components/features/core/search/SearchResults.tsx',
    'src/components/features/content/SearchBar.tsx',
    'src/components/layouts/client-layout.tsx.layout',
    'src/components/layouts/client-layout.tsx'
  ];
  
  const layoutFiles = [
    'src/components/layouts/client-layout.example.tsx',
    'src/components/layouts/client-layout.example.tsx.layout',
  ];
  
  let contextFixCount = 0;
  let layoutFixCount = 0;
  
  console.log('🔍 Manually checking context imports...');
  contextFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        if (fixImports(file, 'from "@/context/', 'from "@/contexts/') ||
            fixImports(file, "from '@/context/", "from '@/contexts/")) {
          contextFixCount++;
        }
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    } catch (error) {
      console.error(`Error with file ${file}:`, error.message);
    }
  });
  
  console.log('🔍 Manually checking layout imports...');
  layoutFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        if (fixImports(file, 'from "@/components/layout/', 'from "@/components/layouts/') ||
            fixImports(file, "from '@/components/layout/", "from '@/components/layouts/")) {
          layoutFixCount++;
        }
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    } catch (error) {
      console.error(`Error with file ${file}:`, error.message);
    }
  });
  
  return { contextFixCount, layoutFixCount };
};

// Fix @/context references
const fixContextImports = () => {
  const files = glob.sync('src/**/*.{ts,tsx}');
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixImports(file, '@/context/', '@/contexts/')) {
      fixedCount++;
    }
  });
  
  return fixedCount;
};

// Fix @/components/layout references
const fixLayoutImports = () => {
  const files = glob.sync('src/**/*.{ts,tsx}');
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixImports(file, '@/components/layout/', '@/components/layouts/')) {
      fixedCount++;
    }
  });
  
  return fixedCount;
};

// Generate a report
const generateReport = (contextFixCount, layoutFixCount, manualContextFixes, manualLayoutFixes) => {
  const report = `# Import Path Fixes Report

## Summary
- Total context imports fixed: ${contextFixCount + manualContextFixes}
  - Automated fixes: ${contextFixCount}
  - Manual fixes: ${manualContextFixes}
- Total layout imports fixed: ${layoutFixCount + manualLayoutFixes}
  - Automated fixes: ${layoutFixCount}
  - Manual fixes: ${manualLayoutFixes}

## Details
- Fixed '@/context/' imports to use '@/contexts/'
- Fixed '@/components/layout/' imports to use '@/components/layouts/'

## Status
The codebase now uses consistent import paths for contexts and layouts.
`;

  const reportPath = path.join('docs', 'project-history', 'import-fixes-report.md');
  
  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`✅ Report saved to: ${reportPath}`);
  } catch (error) {
    console.error('Failed to write report:', error.message);
  }
};

// Run the automated fixes first
console.log('🔍 Fixing context imports...');
const contextFixCount = fixContextImports();
console.log(`✅ Fixed ${contextFixCount} context imports automatically`);

console.log('🔍 Fixing layout imports...');
const layoutFixCount = fixLayoutImports();
console.log(`✅ Fixed ${layoutFixCount} layout imports automatically`);

// Run manual inspection on specific files
console.log('🔍 Running manual inspection on specific files...');
const { contextFixCount: manualContextFixes, layoutFixCount: manualLayoutFixes } = manuallyInspectFiles();
console.log(`✅ Fixed ${manualContextFixes} context imports manually`);
console.log(`✅ Fixed ${manualLayoutFixes} layout imports manually`);

// Generate report
generateReport(contextFixCount, manualContextFixes, layoutFixCount, manualLayoutFixes);

console.log('✨ Import fixes completed'); 
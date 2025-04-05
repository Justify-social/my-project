// scripts/shadcn/update-references.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Import References Updater
 * 
 * This script:
 * 1. Finds all files importing shadcn-wrappers
 * 2. Updates imports to use the canonical wrapper file
 * 3. Handles different import patterns and paths
 * 4. Generates a report of all updated files
 */

// Configuration
const CANONICAL_PATH = 'src/app/(admin)/debug-tools/ui-components/wrappers/canonical-shadcn-wrappers';

// Find all files importing shadcn-wrappers
const findImportingFiles = () => {
  console.log('🔍 Searching for files importing shadcn-wrappers...');
  
  const files = glob.sync('src/app/**/*.{tsx,ts,js,jsx}', {
    ignore: ['**/node_modules/**', '**/canonical-shadcn-wrappers.tsx']
  }).filter(file => {
    const content = fs.readFileSync(file, 'utf8');
    return content.includes('shadcn-wrappers') || 
           content.includes('ShadcnWrappers') ||
           content.includes('AccordionWrapper') ||
           content.includes('AlertWrapper') ||
           content.includes('ButtonWrapper');
  });
  
  console.log(`Found ${files.length} files potentially importing shadcn-wrappers`);
  return files;
};

// Calculate relative path between two files
const getRelativePath = (fromFile, toFile) => {
  const fromDir = path.dirname(fromFile);
  const relative = path.relative(fromDir, toFile)
    .replace(/\\/g, '/') // Normalize for Windows
    .replace(/\.tsx$/, ''); // Remove extension
  
  // Ensure path starts with ./ or ../
  return relative.startsWith('.') ? relative : `./${relative}`;
};

// Update imports to use canonical path
const updateImports = (files, dryRun = false) => {
  const updatedFiles = [];
  const canonicalFullPath = path.resolve(CANONICAL_PATH);
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Generate the correct relative path for this file
    const relPath = getRelativePath(file, CANONICAL_PATH);
    
    // Different import patterns to update
    const importPatterns = [
      // Named imports with path
      {
        regex: /import\s+{([^}]*)}\s+from\s+['"](.+)shadcn-wrappers['"]/g,
        replacement: `import {$1} from '${relPath}'`
      },
      // Default import with path
      {
        regex: /import\s+(\w+)\s+from\s+['"](.+)shadcn-wrappers['"]/g,
        replacement: `import $1 from '${relPath}'`
      },
      // Dynamic import with path
      {
        regex: /import\(['"](.+)shadcn-wrappers['"]\)/g, 
        replacement: `import('${relPath}')`
      }
    ];
    
    // Apply each pattern
    importPatterns.forEach(pattern => {
      content = content.replace(pattern.regex, pattern.replacement);
    });
    
    // Check if the file was updated
    if (content !== originalContent) {
      // Create a backup
      if (!dryRun) {
        fs.writeFileSync(`${file}.bak`, originalContent);
        fs.writeFileSync(file, content);
      }
      updatedFiles.push(file);
    }
  });
  
  if (dryRun) {
    console.log(`Would update ${updatedFiles.length} files to use canonical imports`);
    updatedFiles.forEach(file => console.log(`- ${file}`));
  } else {
    console.log(`✅ Updated ${updatedFiles.length} files to use canonical imports`);
    
    // Write report
    const report = {
      timestamp: new Date().toISOString(),
      filesScanned: files.length,
      filesUpdated: updatedFiles.length,
      updatedFiles
    };
    
    fs.writeFileSync('reference-update-report.json', JSON.stringify(report, null, 2));
  }
  
  return updatedFiles;
};

// Main execution
const main = () => {
  const files = findImportingFiles();
  
  // Check if --update flag is provided
  const shouldUpdate = process.argv.includes('--update');
  if (shouldUpdate) {
    updateImports(files);
  } else {
    updateImports(files, true); // Dry run
    console.log(`
✅ Reference validation complete. Found ${files.length} potential files to update.
Run with --update flag to update imports:

  node scripts/shadcn/update-references.js --update
`);
  }
};

main();
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const UI_COMPONENTS_ROOT = path.resolve(__dirname, '../src/components/ui');
const COMPONENT_CATEGORIES = ['atoms', 'molecules', 'organisms'];
const STYLE_PATTERNS = ['styles', '.styles.ts'];

// Function to add default export to style files
function addDefaultExportToStyleFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Skip if file already has a default export
    if (fileContent.includes('export default') || fileContent.includes('= default')) {
      console.log(`✓ ${filePath} - Already has default export`);
      return false;
    }
    
    // Get all exports from the file
    const exportRegex = /export const (\w+)/g;
    const exports = [];
    let match;
    
    while ((match = exportRegex.exec(fileContent)) !== null) {
      exports.push(match[1]);
    }
    
    // Create a default export object with all exports
    let newContent = fileContent;
    
    if (exports.length > 0) {
      newContent += '\n\n// Default export added by auto-fix script\nexport default {\n';
      exports.forEach(exportName => {
        newContent += `  ${exportName},\n`;
      });
      newContent += '};\n';
      
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ ${filePath} - Added default export with ${exports.length} style exports`);
      return true;
    } else {
      // If no named exports were found, create an empty default export
      newContent += '\n\n// Default export added by auto-fix script\nexport default {};\n';
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ ${filePath} - Added empty default export (no named exports found)`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find all style files
function findStyleFiles(dir) {
  const result = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      if (file === 'styles') {
        // Process all .ts files in styles directories
        const styleFiles = fs.readdirSync(filePath)
          .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
          .map(f => path.join(filePath, f));
        result.push(...styleFiles);
      } else if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        // Continue searching in other directories
        result.push(...findStyleFiles(path.join(dir, file)));
      }
    } else if (file.endsWith('.styles.ts')) {
      // Add individual style files
      result.push(filePath);
    }
  }
  
  return result;
}

// Main execution
console.log('==================================================');
console.log('Adding Default Exports to Style Files');
console.log('==================================================');

let totalFixed = 0;

for (const category of COMPONENT_CATEGORIES) {
  const categoryPath = path.join(UI_COMPONENTS_ROOT, category);
  console.log(`\nProcessing ${category}...`);
  
  if (fs.existsSync(categoryPath)) {
    const styleFiles = findStyleFiles(categoryPath);
    console.log(`Found ${styleFiles.length} style files in ${category}`);
    
    let fixedInCategory = 0;
    for (const styleFile of styleFiles) {
      if (addDefaultExportToStyleFile(styleFile)) {
        fixedInCategory++;
        totalFixed++;
      }
    }
    
    console.log(`Fixed ${fixedInCategory} style files in ${category}`);
  } else {
    console.log(`Directory not found: ${categoryPath}`);
  }
}

console.log('\n==================================================');
console.log(`Total style files fixed: ${totalFixed}`);
console.log('==================================================');

if (totalFixed > 0) {
  console.log('\nRunning validation script to check remaining issues...');
  try {
    execSync('node scripts/validate-component-exports.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('Validation completed with issues. Please check the output above.');
  }
} 
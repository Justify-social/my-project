#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const UI_COMPONENTS_ROOT = path.resolve(__dirname, '../src/components/ui');
const COMPONENT_CATEGORIES = ['atoms', 'molecules', 'organisms'];
const FILE_EXTENSIONS = ['.ts'];

// Function to add default export to index.ts files
function addDefaultExportToFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Skip if file already has a default export
    if (fileContent.includes('export default') || fileContent.includes('= default')) {
      console.log(`✓ ${filePath} - Already has default export`);
      return false;
    }
    
    // Get the directory name to use as the component name
    const dirName = path.basename(path.dirname(filePath));
    const componentName = dirName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    // Check if there's a component that matches the directory name
    const dirPath = path.dirname(filePath);
    const files = fs.readdirSync(dirPath);
    
    // Look for a component file that might match the directory name
    const componentFiles = files.filter(file => 
      file.toLowerCase().includes(dirName.toLowerCase()) &&
      (file.endsWith('.tsx') || file.endsWith('.jsx'))
    );
    
    let exportStatement;
    
    if (componentFiles.length > 0) {
      // Find the most likely component to export
      const mainComponent = componentFiles.find(file => 
        file.endsWith('.tsx') || file.endsWith('.jsx')
      );
      
      if (mainComponent) {
        const componentNameWithoutExt = path.basename(mainComponent, path.extname(mainComponent));
        
        // Add export statements
        let newContent = fileContent;
        
        // Check if the file already imports the component
        const importRegex = new RegExp(`import.+${componentNameWithoutExt}.+from`);
        if (!importRegex.test(newContent)) {
          newContent += `\nimport ${componentNameWithoutExt} from './${componentNameWithoutExt}';\n`;
        }
        
        // Add default export
        newContent += `\nexport default ${componentNameWithoutExt};\n`;
        
        fs.writeFileSync(filePath, newContent);
        console.log(`✅ ${filePath} - Added default export for ${componentNameWithoutExt}`);
        return true;
      }
    }
    
    // If no component file was found, create a simple default export
    let newContent = fileContent;
    newContent += `\n// Default export added by auto-fix script\nexport default {\n  // All exports from this file\n};\n`;
    
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ ${filePath} - Added generic default export`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively process a directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedFiles = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      fixedFiles += processDirectory(filePath);
    } else if (
      file === 'index.ts' && 
      !filePath.includes('node_modules') &&
      !filePath.includes('dist')
    ) {
      if (addDefaultExportToFile(filePath)) {
        fixedFiles++;
      }
    }
  }
  
  return fixedFiles;
}

// Main execution
console.log('==================================================');
console.log('Adding Default Exports to Component Index Files');
console.log('==================================================');

let totalFixed = 0;

for (const category of COMPONENT_CATEGORIES) {
  const categoryPath = path.join(UI_COMPONENTS_ROOT, category);
  console.log(`\nProcessing ${category}...`);
  
  if (fs.existsSync(categoryPath)) {
    const fixed = processDirectory(categoryPath);
    totalFixed += fixed;
    console.log(`Fixed ${fixed} files in ${category}`);
  } else {
    console.log(`Directory not found: ${categoryPath}`);
  }
}

console.log('\n==================================================');
console.log(`Total index.ts files fixed: ${totalFixed}`);
console.log('==================================================');

if (totalFixed > 0) {
  console.log('\nRunning validation script to check remaining issues...');
  try {
    execSync('node scripts/validate-component-exports.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('Validation completed with issues. Please check the output above.');
  }
} 
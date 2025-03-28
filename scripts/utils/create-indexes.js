/**
 * Script Category Index Generator
 * 
 * Creates index.js files for each script category, exporting all scripts
 * in that category for easier imports and better organization.
 */

import fs from 'fs';
import path from 'path';

// Base directory for consolidated scripts
const BASE_DIR = 'scripts/consolidated';

// Categories to create indexes for
const CATEGORIES = [
  'icons', 
  'testing', 
  'linting', 
  'documentation', 
  'cleanup', 
  'build', 
  'db', 
  'utils'
];

// Function to create a category description
function getCategoryDescription(category) {
  const descriptions = {
    'icons': 'Icon system management, verification, and migration scripts',
    'testing': 'Testing, validation, and verification scripts',
    'linting': 'Code quality, linting, and formatting scripts',
    'documentation': 'Documentation generation and management scripts',
    'cleanup': 'Cleanup and maintenance scripts',
    'build': 'Build, bundling, and deployment scripts',
    'db': 'Database operations and migration scripts',
    'utils': 'General utility scripts and helpers'
  };
  
  return descriptions[category] || `Scripts related to ${category}`;
}

// Function to generate import and export statements for a script
function generateExportStatement(scriptPath, scriptName) {
  // Convert script name to camelCase for the export
  const baseName = path.basename(scriptName, '.js');
  const camelCaseName = baseName
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^([A-Z])/, (_, letter) => letter.toLowerCase());
  
  return {
    importStatement: `import ${camelCaseName} from './${scriptName}';`,
    exportStatement: `  ${camelCaseName},`
  };
}

// Function to generate an index file for a category
function generateCategoryIndex(category) {
  const categoryDir = path.join(BASE_DIR, category);
  
  // Skip if directory doesn't exist
  if (!fs.existsSync(categoryDir)) {
    console.log(`Skipping ${category} - directory doesn't exist`);
    return false;
  }
  
  // Get JS files in the category directory
  const files = fs.readdirSync(categoryDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
  
  if (files.length === 0) {
    console.log(`Skipping ${category} - no JS files found`);
    return false;
  }
  
  // Generate import and export statements
  const imports = [];
  const exports = [];
  
  files.forEach(file => {
    const { importStatement, exportStatement } = generateExportStatement(categoryDir, file);
    imports.push(importStatement);
    exports.push(exportStatement);
  });
  
  // Create the index file content
  const indexContent = `/**
 * ${getCategoryDescription(category)}
 * 
 * This index file exports all scripts in the ${category} category
 * for easier importing and usage.
 */

${imports.join('\n')}

module.exports = {
${exports.join('\n')}
};
`;

  // Write the index file
  const indexPath = path.join(categoryDir, 'index.js');
  fs.writeFileSync(indexPath, indexContent);
  
  console.log(`Created index for ${category} with ${files.length} scripts`);
  return true;
}

// Function to create a main index file in the consolidated directory
function generateMainIndex() {
  const imports = [];
  const exports = [];
  
  CATEGORIES.forEach(category => {
    const categoryDir = path.join(BASE_DIR, category);
    
    // Skip if directory doesn't exist or has no index file
    if (!fs.existsSync(path.join(categoryDir, 'index.js'))) {
      return;
    }
    
    const importStatement = `import ${category} from './${category}';`;
    const exportStatement = `  ${category},`;
    
    imports.push(importStatement);
    exports.push(exportStatement);
  });
  
  // Create the main index file content
  const indexContent = `/**
 * Consolidated Scripts Main Index
 * 
 * This main index file exports all script categories
 * for unified access to all consolidated scripts.
 */

${imports.join('\n')}

module.exports = {
${exports.join('\n')}
};
`;

  // Write the main index file
  const indexPath = path.join(BASE_DIR, 'index.js');
  fs.writeFileSync(indexPath, indexContent);
  
  console.log(`Created main index file at ${indexPath}`);
}

// Function to create a README file for each category
function generateCategoryReadme(category) {
  const categoryDir = path.join(BASE_DIR, category);
  
  // Skip if directory doesn't exist
  if (!fs.existsSync(categoryDir)) {
    return false;
  }
  
  // Get JS files in the category directory
  const files = fs.readdirSync(categoryDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
  
  if (files.length === 0) {
    return false;
  }
  
  // Generate script list for the README
  const scriptList = files.map(file => {
    const baseName = path.basename(file, '.js');
    
    // Try to get a description from the file (first comment block)
    let description = '';
    try {
      const content = fs.readFileSync(path.join(categoryDir, file), 'utf8');
      const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
      
      if (commentMatch) {
        // Extract description from comment block
        const comment = commentMatch[1];
        const descriptionLines = comment
          .split('\n')
          .map(line => line.trim().replace(/^\s*\*\s*/, ''))
          .filter(line => line && !line.startsWith('@'));
        
        if (descriptionLines.length > 0) {
          description = descriptionLines[0];
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}: ${error.message}`);
    }
    
    return `- \`${baseName}.js\`: ${description || 'No description available'}`;
  });
  
  // Create the README content
  const readmeContent = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Scripts

${getCategoryDescription(category)}.

## Available Scripts

${scriptList.join('\n')}

## Usage

You can import individual scripts directly:

\`\`\`js
import scriptName from './scripts/consolidated/${category}/script-name';
\`\`\`

Or import all scripts in this category using the index:

\`\`\`js
import scriptName from './scripts/consolidated/${category}';
\`\`\`
`;

  // Write the README file
  const readmePath = path.join(categoryDir, 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  
  console.log(`Created README for ${category}`);
  return true;
}

// Main function to create indexes and README files
function createIndexes() {
  console.log('Starting index generation...');
  
  // Generate category indexes
  let indexCount = 0;
  CATEGORIES.forEach(category => {
    if (generateCategoryIndex(category)) {
      indexCount++;
      generateCategoryReadme(category);
    }
  });
  
  // Generate main index
  if (indexCount > 0) {
    generateMainIndex();
  }
  
  console.log(`Created ${indexCount} category indexes`);
  console.log('Index generation completed.');
}

// Run the index generation
createIndexes(); 
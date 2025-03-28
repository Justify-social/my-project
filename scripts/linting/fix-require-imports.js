#!/usr/bin/env node
/**
 * Script to convert CommonJS require() imports to ES module imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all JS files in the project (excluding node_modules, .next, etc.)
function findJsFiles(dir, exclude = [/node_modules/, /\.next/, /\.git/, /dist/, /build/]) {
  const files = [];
  
  function traverseDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      // Skip excluded directories
      if (exclude.some(pattern => pattern.test(fullPath))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        traverseDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverseDir(dir);
  return files;
}

// Convert require to import in a file
function convertRequireToImport(filePath) {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Fix module.exports -> export default
    const moduleExportsRegex = /module\.exports\s*=\s*([^;]+);/g;
    if (moduleExportsRegex.test(content)) {
      content = content.replace(moduleExportsRegex, 'export default $1;');
      modified = true;
    }
    
    // 2. Fix require() -> import
    const requireRegex = /const\s+(\w+|\{\s*[^}]+\s*\})\s*=\s*require\(['"]([^'"]+)['"]\);/g;
    let match;
    
    while ((match = requireRegex.exec(content)) !== null) {
      const [fullMatch, importName, modulePath] = match;
      let replacement;
      
      if (importName.startsWith('{')) {
        // Destructured require
        replacement = `import ${importName} from '${modulePath}';`;
      } else {
        // Regular require
        replacement = `import ${importName} from '${modulePath}';`;
      }
      
      content = content.replace(fullMatch, replacement);
      modified = true;
    }
    
    // 3. Fix the more complex require patterns (e.g., require().something)
    const complexRequireRegex = /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)\.(\w+);/g;
    while ((match = complexRequireRegex.exec(content)) !== null) {
      const [fullMatch, importName, modulePath, property] = match;
      const replacement = `import { ${property} as ${importName} } from '${modulePath}';`;
      
      content = content.replace(fullMatch, replacement);
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath}`);
      return true;
    } else {
      console.log(`✓ No changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process command line arguments
const args = process.argv.slice(2);
let targetPath = '.';
let dryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--path' && i + 1 < args.length) {
    targetPath = args[i + 1];
    i++;
  } else if (args[i] === '--dry-run') {
    dryRun = true;
  }
}

// Main execution
console.log(`Scanning for files in ${targetPath}...`);
const files = findJsFiles(targetPath);
console.log(`Found ${files.length} JavaScript/TypeScript files.`);

let changedFiles = 0;
for (const file of files) {
  if (dryRun) {
    console.log(`Would process: ${file}`);
  } else {
    const changed = convertRequireToImport(file);
    if (changed) changedFiles++;
  }
}

console.log('');
console.log('Summary:');
console.log(`${dryRun ? 'Would process' : 'Processed'} ${files.length} files`);
if (!dryRun) console.log(`Updated ${changedFiles} files`);
console.log('');

if (changedFiles > 0 && !dryRun) {
  console.log('Running ESLint to check the changes...');
  try {
    execSync('npx eslint --config eslint.config.mjs --fix ' + files.filter(f => f.endsWith('.js') || f.endsWith('.ts')).join(' '), { stdio: 'inherit' });
  } catch (error) {
    console.log('ESLint found some issues that could not be automatically fixed.');
  }
} 
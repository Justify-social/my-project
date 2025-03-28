#!/usr/bin/env node
/**
 * Script to automatically fix TypeScript 'no-explicit-any' errors
 * by replacing them with 'unknown' type
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript files that have any type
function findFilesWithAnyType(dir, exclude = [/node_modules/, /\.next/, /\.git/, /dist/, /build/]) {
  try {
    // Run ESLint to find files with no-explicit-any errors
    const output = execSync(
      'npx eslint --config eslint.config.mjs --format json "src/**/*.{ts,tsx}" --rule "@typescript-eslint/no-explicit-any: error"',
      { encoding: 'utf8' }
    );
    
    const results = JSON.parse(output);
    const filesWithAny = [];
    
    for (const result of results) {
      if (result.messages.some(msg => msg.ruleId === '@typescript-eslint/no-explicit-any')) {
        filesWithAny.push(result.filePath);
      }
    }
    
    console.log(`Found ${filesWithAny.length} files with any type`);
    return filesWithAny;
  } catch (error) {
    // Extract the valid JSON from the output if ESLint fails but produces valid result
    try {
      const jsonStart = error.stdout.indexOf('[');
      const jsonEnd = error.stdout.lastIndexOf(']') + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonOutput = error.stdout.substring(jsonStart, jsonEnd);
        const results = JSON.parse(jsonOutput);
        
        const filesWithAny = [];
        for (const result of results) {
          if (result.messages.some(msg => msg.ruleId === '@typescript-eslint/no-explicit-any')) {
            filesWithAny.push(result.filePath);
          }
        }
        
        console.log(`Found ${filesWithAny.length} files with any type`);
        return filesWithAny;
      }
    } catch (jsonError) {
      console.error('Error parsing ESLint output:', jsonError);
    }
    
    console.error('Error running ESLint:', error.message);
    return [];
  }
}

// Replace any with unknown in a file
function replaceAnyWithUnknown(filePath) {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Get specific any type occurrences using ESLint
    let anyLocations = [];
    try {
      const output = execSync(
        `npx eslint --config eslint.config.mjs --format json "${filePath}" --rule "@typescript-eslint/no-explicit-any: error"`,
        { encoding: 'utf8' }
      );
      
      const results = JSON.parse(output);
      if (results.length > 0 && results[0].messages) {
        anyLocations = results[0].messages
          .filter(msg => msg.ruleId === '@typescript-eslint/no-explicit-any')
          .map(msg => ({
            line: msg.line,
            column: msg.column,
            endLine: msg.endLine,
            endColumn: msg.endColumn
          }));
      }
    } catch (error) {
      console.error(`Error getting any locations for ${filePath}:`, error.message);
    }
    
    if (anyLocations.length === 0) {
      // Fallback to regex replacement if ESLint doesn't give us locations
      const anyRegex = /\bany\b(?!\s*\.|\.any)/g;
      content = content.replace(anyRegex, 'unknown');
      modified = true;
    } else {
      // Convert content to lines for precise replacement
      const lines = content.split('\n');
      
      // Process each any occurrence from ESLint
      for (const loc of anyLocations) {
        const line = lines[loc.line - 1];
        
        // Simple approach: replace 'any' with 'unknown' in this line
        // More sophisticated approach would use column information for precision
        lines[loc.line - 1] = line.replace(/\bany\b(?!\s*\.|\.any)/, 'unknown');
      }
      
      content = lines.join('\n');
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
let targetPath = 'src';
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
console.log(`Scanning for files with 'any' type in ${targetPath}...`);
const files = findFilesWithAnyType(targetPath);
console.log(`Found ${files.length} files with 'any' type.`);

let changedFiles = 0;
for (const file of files) {
  if (dryRun) {
    console.log(`Would process: ${file}`);
  } else {
    const changed = replaceAnyWithUnknown(file);
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
    execSync(`npx eslint --config eslint.config.mjs --fix ${files.join(' ')}`, { stdio: 'inherit' });
  } catch (error) {
    console.log('ESLint found some issues that could not be automatically fixed.');
  }
} 
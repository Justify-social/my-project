#!/usr/bin/env node

/**
 * Linter Issue Fixer Script
 * 
 * This script helps automatically fix common linter issues in the codebase:
 * 1. Removes unused imports and variables
 * 2. Adds display names to anonymous components
 * 3. Escapes entities in JSX
 * 4. Converts require() style imports to ES module syntax
 * 
 * Usage:
 *   node src/scripts/fix-linter-issues.js [--dry-run] [--fix-type=<type>] [--path=<path>]
 * 
 * Options:
 *   --dry-run       Show what would be fixed without making changes
 *   --fix-type      Specify which type of fixes to apply (imports, unused, display-names, entities, all)
 *   --path          Specify a path to fix (defaults to src/)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fixTypeArg = args.find(arg => arg.startsWith('--fix-type='));
const fixType = fixTypeArg ? fixTypeArg.split('=')[1] : 'all';
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : 'src/';

console.log(`
🔍 Linter Issue Fixer
=====================
Mode: ${dryRun ? 'Dry Run (no changes will be made)' : 'Fix Mode (changes will be applied)'}
Fix Type: ${fixType}
Target Path: ${targetPath}
`);

// Helper function to run ESLint with --fix option
function runEslintFix(fixRules, targetPath) {
  const rulesParam = fixRules.map(rule => `--rule "${rule}:error"`).join(' ');
  const command = `npx eslint ${targetPath} ${rulesParam} --fix ${dryRun ? '--dry-run' : ''}`;
  
  console.log(`Running: ${command}`);
  
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return true;
  } catch (error) {
    console.error('Error running ESLint fix:', error.message);
    return false;
  }
}

// Fix unused imports and variables
function fixUnusedImportsAndVars() {
  console.log('\n🧹 Fixing unused imports and variables...');
  return runEslintFix([
    '@typescript-eslint/no-unused-vars',
    'import/no-unused-modules'
  ], targetPath);
}

// Fix require() style imports
function fixRequireImports() {
  console.log('\n📦 Fixing require() style imports...');
  return runEslintFix([
    '@typescript-eslint/no-require-imports'
  ], targetPath);
}

// Fix missing display names
function fixDisplayNames() {
  console.log('\n🏷️ Fixing missing display names...');
  return runEslintFix([
    'react/display-name'
  ], targetPath);
}

// Fix unescaped entities
function fixUnescapedEntities() {
  console.log('\n🔤 Fixing unescaped entities in JSX...');
  return runEslintFix([
    'react/no-unescaped-entities'
  ], targetPath);
}

// Find files with 'any' type usage
function findAnyTypeUsage() {
  console.log('\n🔍 Finding files with \'any\' type usage...');
  
  try {
    const command = `npx eslint ${targetPath} --rule "@typescript-eslint/no-explicit-any:error" -f json`;
    const output = execSync(command, { encoding: 'utf8' });
    
    const results = JSON.parse(output);
    const filesWithAnyType = results
      .filter(result => result.errorCount > 0)
      .map(result => ({
        filePath: result.filePath,
        count: result.errorCount,
        locations: result.messages.map(msg => `Line ${msg.line}, Col ${msg.column}`)
      }));
    
    console.log(`\nFound ${filesWithAnyType.length} files with 'any' type usage:`);
    filesWithAnyType.forEach(file => {
      console.log(`- ${file.filePath} (${file.count} occurrences)`);
      if (file.count <= 5) {
        file.locations.forEach(loc => console.log(`  ${loc}`));
      }
    });
    
    return filesWithAnyType;
  } catch (error) {
    console.error('Error finding \'any\' type usage:', error.message);
    return [];
  }
}

// Find files with img tags instead of Next.js Image
function findImgTags() {
  console.log('\n🖼️ Finding files with <img> tags instead of Next.js <Image>...');
  
  try {
    const command = `npx eslint ${targetPath} --rule "@next/next/no-img-element:error" -f json`;
    const output = execSync(command, { encoding: 'utf8' });
    
    const results = JSON.parse(output);
    const filesWithImgTags = results
      .filter(result => result.errorCount > 0)
      .map(result => ({
        filePath: result.filePath,
        count: result.errorCount,
        locations: result.messages.map(msg => `Line ${msg.line}, Col ${msg.column}`)
      }));
    
    console.log(`\nFound ${filesWithImgTags.length} files with <img> tags:`);
    filesWithImgTags.forEach(file => {
      console.log(`- ${file.filePath} (${file.count} occurrences)`);
    });
    
    return filesWithImgTags;
  } catch (error) {
    console.error('Error finding <img> tags:', error.message);
    return [];
  }
}

// Find React Hook dependency issues
function findHookDependencyIssues() {
  console.log('\n🪝 Finding React Hook dependency issues...');
  
  try {
    const command = `npx eslint ${targetPath} --rule "react-hooks/exhaustive-deps:error" -f json`;
    const output = execSync(command, { encoding: 'utf8' });
    
    const results = JSON.parse(output);
    const filesWithHookIssues = results
      .filter(result => result.errorCount > 0)
      .map(result => ({
        filePath: result.filePath,
        count: result.errorCount,
        locations: result.messages.map(msg => `Line ${msg.line}, Col ${msg.column}: ${msg.message}`)
      }));
    
    console.log(`\nFound ${filesWithHookIssues.length} files with React Hook dependency issues:`);
    filesWithHookIssues.forEach(file => {
      console.log(`- ${file.filePath} (${file.count} issues)`);
      if (file.count <= 3) {
        file.locations.forEach(loc => console.log(`  ${loc}`));
      }
    });
    
    return filesWithHookIssues;
  } catch (error) {
    console.error('Error finding React Hook dependency issues:', error.message);
    return [];
  }
}

// Generate a report of linter issues
function generateReport() {
  console.log('\n📊 Generating linter issues report...');
  
  const anyTypeFiles = findAnyTypeUsage();
  const imgTagFiles = findImgTags();
  const hookIssueFiles = findHookDependencyIssues();
  
  const reportPath = path.join(process.cwd(), 'linter-issues-report.md');
  
  const reportContent = `# Linter Issues Report
Generated on: ${new Date().toISOString()}

## Summary
- Files with \`any\` type usage: ${anyTypeFiles.length}
- Files with \`<img>\` tags instead of Next.js \`<Image>\`: ${imgTagFiles.length}
- Files with React Hook dependency issues: ${hookIssueFiles.length}

## Files with \`any\` type usage
${anyTypeFiles.map(file => `- ${file.filePath} (${file.count} occurrences)`).join('\n')}

## Files with \`<img>\` tags
${imgTagFiles.map(file => `- ${file.filePath} (${file.count} occurrences)`).join('\n')}

## Files with React Hook dependency issues
${hookIssueFiles.map(file => `- ${file.filePath} (${file.count} issues)`).join('\n')}

## Recommendations
1. Replace \`any\` types with more specific types
2. Replace \`<img>\` tags with Next.js \`<Image>\` component
3. Fix React Hook dependency arrays
`;

  if (!dryRun) {
    fs.writeFileSync(reportPath, reportContent);
    console.log(`Report saved to: ${reportPath}`);
  } else {
    console.log('Report would be generated (dry run)');
  }
}

// Main function
async function main() {
  let success = true;
  
  try {
    if (fixType === 'all' || fixType === 'unused') {
      success = fixUnusedImportsAndVars() && success;
    }
    
    if (fixType === 'all' || fixType === 'imports') {
      success = fixRequireImports() && success;
    }
    
    if (fixType === 'all' || fixType === 'display-names') {
      success = fixDisplayNames() && success;
    }
    
    if (fixType === 'all' || fixType === 'entities') {
      success = fixUnescapedEntities() && success;
    }
    
    if (fixType === 'all' || fixType === 'report') {
      generateReport();
    }
    
    console.log('\n✅ Linter fix script completed');
    if (!success) {
      console.log('⚠️ Some fixes were not applied successfully');
    }
  } catch (error) {
    console.error('\n❌ Error running linter fix script:', error);
    process.exit(1);
  }
}

main(); 
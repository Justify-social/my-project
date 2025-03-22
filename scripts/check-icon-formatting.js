/**
 * Icon Format Check Script
 * 
 * This script scans the codebase for components using the Icon component
 * and ensures they're using the resolveIconName utility function for consistent
 * icon name formatting.
 * 
 * Usage:
 *   node scripts/check-icon-formatting.js
 *   node scripts/check-icon-formatting.js --fix  # Auto-fix issues
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const colors = require('./utils/colors');

// Flag for auto-fixing issues
const shouldFix = process.argv.includes('--fix');

// Pattern to detect improper icon name formatting
const PROBLEMATIC_PATTERNS = [
  /name=\{.*\.startsWith\('fa'\)/,
  /name=\{.*\.charAt\(0\)\.toUpperCase\(\)/,
  /name=\{UI_ICON_MAP\[.*\]/,
  /name=\{`fa/
];

// Count of issues found/fixed
let issuesFound = 0;
let issuesFixed = 0;

console.log(`${colors.blue}🔍 Checking Icon name formatting...${colors.reset}\n`);

// Find all React files
const files = glob.sync('src/**/*.{tsx,jsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Quick check for Icon component usage
  if (!content.includes('<Icon') && !content.includes(' Icon ')) {
    return;
  }
  
  // Quick check for problematic patterns before parsing
  const hasIssue = PROBLEMATIC_PATTERNS.some(pattern => pattern.test(content));
  if (!hasIssue) {
    return;
  }
  
  // Parse the file
  let ast;
  try {
    ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
    });
  } catch (error) {
    console.error(`${colors.red}Error parsing ${file}:${colors.reset}`, error.message);
    return;
  }
  
  // Flag to track if file was modified
  let fileModified = false;
  
  // Flag to track if resolveIconName is imported
  let hasResolveIconNameImport = false;
  
  // Find Icon components and check name props
  traverse(ast, {
    ImportDeclaration(path) {
      // Check if resolveIconName is already imported
      if (path.node.source.value.includes('/components/ui/icons')) {
        const specifiers = path.node.specifiers.map(s => s.imported?.name || s.local?.name);
        if (specifiers.includes('resolveIconName')) {
          hasResolveIconNameImport = true;
        }
      }
    },
    
    JSXOpeningElement(path) {
      // Only process Icon components
      if (path.node.name.name !== 'Icon' && 
          path.node.name.name !== 'ButtonIcon' && 
          path.node.name.name !== 'StaticIcon' && 
          path.node.name.name !== 'DeleteIcon' &&
          path.node.name.name !== 'WarningIcon' &&
          path.node.name.name !== 'SuccessIcon') {
        return;
      }
      
      // Find the name prop
      const nameProp = path.node.attributes.find(attr => 
        attr.type === 'JSXAttribute' && attr.name.name === 'name'
      );
      
      if (!nameProp || !nameProp.value || !nameProp.value.expression) {
        return;
      }
      
      // Skip if already using resolveIconName
      if (nameProp.value.expression.type === 'CallExpression' && 
          nameProp.value.expression.callee.name === 'resolveIconName') {
        return;
      }
      
      // Get the line number for reporting
      const lineNumber = nameProp.loc?.start.line || '?';
      
      // Get the original expression for reporting
      const originalCode = generate(nameProp.value.expression, {}, content).code;
      
      issuesFound++;
      console.log(`${colors.yellow}Issue found in ${file}:${lineNumber}${colors.reset}`);
      console.log(`  ${colors.gray}${originalCode}${colors.reset}`);
      
      // Fix the issue if auto-fixing is enabled
      if (shouldFix) {
        // Wrap the expression with resolveIconName
        nameProp.value.expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'resolveIconName'
          },
          arguments: [nameProp.value.expression]
        };
        
        fileModified = true;
        issuesFixed++;
        console.log(`  ${colors.green}✓ Fixed: resolveIconName(${originalCode})${colors.reset}`);
      } else {
        console.log(`  ${colors.cyan}Suggestion: resolveIconName(${originalCode})${colors.reset}`);
      }
    }
  });
  
  // Add resolveIconName import if needed and file was modified
  if (fileModified && !hasResolveIconNameImport) {
    // Find the imports from ui/icons
    let iconImportPath = null;
    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value.includes('/components/ui/icons')) {
          iconImportPath = path;
        }
      }
    });
    
    if (iconImportPath) {
      // Add resolveIconName to existing imports
      iconImportPath.node.specifiers.push({
        type: 'ImportSpecifier',
        imported: {
          type: 'Identifier',
          name: 'resolveIconName'
        },
        local: {
          type: 'Identifier',
          name: 'resolveIconName'
        }
      });
      
      console.log(`  ${colors.green}✓ Added resolveIconName import${colors.reset}`);
    }
    
    // Generate the updated code and save it
    const output = generate(ast, {}, content);
    fs.writeFileSync(file, output.code);
    console.log(`  ${colors.green}✓ Saved updated file${colors.reset}`);
  }
});

// Show summary
console.log(`\n${colors.blue}Summary:${colors.reset}`);
console.log(`  ${colors.yellow}Issues found: ${issuesFound}${colors.reset}`);
if (shouldFix) {
  console.log(`  ${colors.green}Issues fixed: ${issuesFixed}${colors.reset}`);
}

if (issuesFound > 0 && !shouldFix) {
  console.log(`\n${colors.cyan}To automatically fix these issues, run:${colors.reset}`);
  console.log(`  ${colors.gray}node scripts/check-icon-formatting.js --fix${colors.reset}`);
}

// Add script to package.json
console.log(`\n${colors.blue}To add this check to your workflow:${colors.reset}`);
console.log(`  ${colors.gray}1. Add to package.json scripts:${colors.reset}`);
console.log(`     ${colors.cyan}"check-icons": "node scripts/check-icon-formatting.js",${colors.reset}`);
console.log(`     ${colors.cyan}"fix-icons": "node scripts/check-icon-formatting.js --fix"${colors.reset}`);
console.log(`  ${colors.gray}2. Add to your CI pipeline or pre-commit hook${colors.reset}`);

// Exit with error code if issues found (for CI integration)
if (issuesFound > 0 && !shouldFix) {
  process.exit(1);
} 
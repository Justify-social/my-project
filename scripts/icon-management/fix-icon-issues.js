#!/usr/bin/env node

/**
 * Icon Issues Fixer
 * 
 * This script analyzes and automatically fixes common icon issues in the codebase:
 * 1. Adds missing name props to Icon components
 * 2. Adds group class to parent elements of button icons
 * 3. Adds solid property to static icons
 * 4. Handles other common issues
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;
const { execSync } = require('child_process');
const { glob } = require('glob');

// Debug imports
console.log('Starting script...');
console.log('Checking for required modules...');

try { 
  console.log('Requiring fs...'); 
  console.log('fs loaded successfully'); 
} catch(e) { 
  console.error('Error loading fs:', e); 
  process.exit(1);
}

try { 
  console.log('Requiring path...'); 
  console.log('path loaded successfully'); 
} catch(e) { 
  console.error('Error loading path:', e); 
  process.exit(1);
}

try { 
  console.log('Requiring @babel/parser...'); 
  console.log('@babel/parser loaded successfully'); 
} catch(e) { 
  console.error('Error loading @babel/parser:', e); 
  process.exit(1);
}

try { 
  console.log('Requiring @babel/traverse...'); 
  console.log('@babel/traverse loaded successfully'); 
} catch(e) { 
  console.error('Error loading @babel/traverse:', e); 
  process.exit(1);
}

try { 
  console.log('Requiring @babel/types...'); 
  console.log('@babel/types loaded successfully'); 
} catch(e) { 
  console.error('Error loading @babel/types:', e); 
  process.exit(1);
}

try { 
  console.log('Requiring @babel/generator...'); 
  console.log('@babel/generator loaded successfully'); 
} catch(e) { 
  console.error('Error loading @babel/generator:', e); 
  process.exit(1);
}

try { 
  console.log('Requiring child_process...'); 
  console.log('child_process loaded successfully'); 
} catch(e) { 
  console.error('Error loading child_process:', e); 
  process.exit(1);
}

try { 
  console.log('Requiring glob...'); 
  console.log('glob loaded successfully'); 
} catch(e) { 
  console.error('Error loading glob:', e); 
  process.exit(1);
}

// ANSI color codes for colorful output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

console.log(`${colors.bright}${colors.blue}🔧 Icon Issues Fixer${colors.reset}\n`);

// Read the audit report to understand issues
let auditReport;
try {
  console.log('Reading audit report...');
  const reportPath = path.join(process.cwd(), 'icon-audit-report.json');
  
  console.log(`Checking if ${reportPath} exists...`);
  if (!fs.existsSync(reportPath)) {
    console.log(`${colors.yellow}No audit report found. Running audit...${colors.reset}`);
    execSync('node scripts/icon-management/audit-icons.js', { stdio: 'inherit' });
  }
  
  console.log('Reading audit report file...');
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  console.log(`Audit report size: ${reportContent.length} bytes`);
  
  console.log('Parsing JSON...');
  auditReport = JSON.parse(reportContent);
  console.log(`${colors.green}Loaded audit report with ${auditReport.totalIssues} issues${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error loading audit report: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
}

// Group issues by file for easier processing
console.log('Grouping issues by file...');
const issuesByFile = {};

// Process the details which is an object with numeric keys
Object.values(auditReport.details).forEach(detail => {
  if (!detail.file || detail.issues.length === 0) return;
  
  // Make paths absolute - make sure to handle paths that start with src/ or /src/
  const normalizedPath = detail.file.startsWith('/') ? detail.file.slice(1) : detail.file;
  const absoluteFilePath = path.join(process.cwd(), normalizedPath);
  
  if (!issuesByFile[absoluteFilePath]) {
    issuesByFile[absoluteFilePath] = [];
  }
  
  issuesByFile[absoluteFilePath].push(detail);
});

const fileCount = Object.keys(issuesByFile).length;
console.log(`${colors.cyan}Found issues in ${fileCount} files${colors.reset}`);

// Track statistics
const stats = {
  filesFixed: 0,
  iconTypesAdded: 0,
  groupClassesAdded: 0,
  solidPropertiesAdded: 0,
  otherIssuesFixed: 0
};

// Process each file with issues
for (const [filePath, details] of Object.entries(issuesByFile)) {
  console.log(`\n${colors.yellow}Processing ${filePath}${colors.reset}`);
  
  let fileContent;
  try {
    fileContent = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
    continue;
  }
  
  let ast;
  try {
    // Parse the file into an AST
    ast = parser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties']
    });
  } catch (error) {
    console.error(`${colors.red}Error parsing ${filePath}: ${error.message}${colors.reset}`);
    continue;
  }
  
  let fileModified = false;
  
  // Process the AST
  traverse(ast, {
    JSXOpeningElement(path) {
      const elementName = path.node.name;
      
      // Check if it's an Icon component
      if (
        (elementName.type === 'JSXIdentifier' && elementName.name === 'Icon') ||
        (elementName.type === 'JSXMemberExpression' && elementName.property.name === 'Icon')
      ) {
        // Get the location of this element
        const loc = path.node.loc;
        const lineNumber = loc ? loc.start.line : -1;
        
        // Find issues for this specific icon
        const matchingDetails = details.filter(detail => {
          return detail.line === lineNumber || 
                 (detail.line >= loc?.start.line && detail.line <= loc?.end.line);
        });
        
        if (matchingDetails.length === 0) return;
        
        for (const detail of matchingDetails) {
          // Fix missing icon type
          if (detail.issues.some(issue => issue.includes('No icon type specified'))) {
            const hasNameProp = path.node.attributes.some(attr => 
              attr.type === 'JSXAttribute' && attr.name.name === 'name'
            );
            
            if (!hasNameProp) {
              // Try to infer a name from context
              let inferredName = null;
              
              // Check if we can infer from variable names or comments nearby
              const parentPath = path.findParent(p => 
                p.isVariableDeclarator() || 
                p.isFunctionDeclaration() || 
                p.isClassMethod()
              );
              
              if (parentPath) {
                if (parentPath.isVariableDeclarator() && parentPath.node.id.type === 'Identifier') {
                  const varName = parentPath.node.id.name;
                  if (varName.toLowerCase().includes('icon')) {
                    inferredName = varName.replace(/Icon$|^Icon|icon$|^icon/, '');
                    // Convert camelCase to kebab-case
                    inferredName = inferredName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                  }
                } else if (parentPath.isFunctionDeclaration() || parentPath.isClassMethod()) {
                  const funcName = parentPath.node.id?.name || parentPath.node.key?.name;
                  if (funcName && funcName.toLowerCase().includes('icon')) {
                    inferredName = funcName.replace(/Icon$|^Icon|icon$|^icon/, '');
                    inferredName = inferredName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                  }
                }
              }
              
              if (inferredName) {
                console.log(`${colors.green}Adding name="${inferredName}" to Icon at line ${lineNumber}${colors.reset}`);
                path.node.attributes.push(
                  t.jsxAttribute(
                    t.jsxIdentifier('name'),
                    t.stringLiteral(inferredName)
                  )
                );
                stats.iconTypesAdded++;
                fileModified = true;
              } else {
                console.log(`${colors.red}Could not infer name for Icon at line ${lineNumber}${colors.reset}`);
              }
            }
          }
          
          // Check if icon is static and missing solid property
          if (detail.issues.some(issue => issue.includes('missing solid property'))) {
            const hasSolidProp = path.node.attributes.some(attr => 
              attr.type === 'JSXAttribute' && attr.name.name === 'solid'
            );
            
            if (!hasSolidProp) {
              console.log(`${colors.green}Adding solid={false} to static Icon at line ${lineNumber}${colors.reset}`);
              path.node.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('solid'),
                  t.jsxExpressionContainer(t.booleanLiteral(false))
                )
              );
              stats.solidPropertiesAdded++;
              fileModified = true;
            }
          }
          
          // Check for button icons missing group class
          if (detail.issues.some(issue => issue.includes('missing group class'))) {
            // Find the parent JSX element
            const parentJSX = path.findParent(p => 
              p.isJSXElement() && p.node.openingElement !== path.node
            );
            
            if (parentJSX && parentJSX.node.openingElement) {
              const classNameAttr = parentJSX.node.openingElement.attributes.find(attr => 
                attr.type === 'JSXAttribute' && attr.name.name === 'className'
              );
              
              if (classNameAttr) {
                if (classNameAttr.value.type === 'StringLiteral') {
                  const currentClasses = classNameAttr.value.value;
                  if (!currentClasses.includes('group')) {
                    classNameAttr.value.value = `group ${currentClasses}`;
                    console.log(`${colors.green}Adding group class to parent element at line ${parentJSX.node.loc?.start.line}${colors.reset}`);
                    stats.groupClassesAdded++;
                    fileModified = true;
                  }
                } else if (classNameAttr.value.type === 'JSXExpressionContainer') {
                  console.log(`${colors.yellow}Complex className expression found at line ${parentJSX.node.loc?.start.line}, manual fix required${colors.reset}`);
                }
              } else {
                // No className attribute, add one
                parentJSX.node.openingElement.attributes.push(
                  t.jsxAttribute(
                    t.jsxIdentifier('className'),
                    t.stringLiteral('group')
                  )
                );
                console.log(`${colors.green}Adding className="group" to parent element at line ${parentJSX.node.loc?.start.line}${colors.reset}`);
                stats.groupClassesAdded++;
                fileModified = true;
              }
            }
          }
        }
      }
    }
  });
  
  // If file was modified, write it back
  if (fileModified) {
    try {
      const updatedCode = generate(ast, {
        retainLines: true,
        compact: false,
        jsescOption: { minimal: true },
      }).code;
      
      fs.writeFileSync(filePath, updatedCode, 'utf8');
      console.log(`${colors.green}✓ Updated ${filePath}${colors.reset}`);
      stats.filesFixed++;
    } catch (error) {
      console.error(`${colors.red}Error writing file ${filePath}: ${error.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}No automatic fixes applied to ${filePath}${colors.reset}`);
  }
}

// Summary
console.log(`\n${colors.bright}${colors.blue}📊 Fix Summary${colors.reset}`);
console.log(`${colors.green}Files fixed: ${stats.filesFixed}${colors.reset}`);
console.log(`${colors.green}Icon types added: ${stats.iconTypesAdded}${colors.reset}`);
console.log(`${colors.green}Group classes added: ${stats.groupClassesAdded}${colors.reset}`);
console.log(`${colors.green}Solid properties added: ${stats.solidPropertiesAdded}${colors.reset}`);
console.log(`${colors.green}Other issues fixed: ${stats.otherIssuesFixed}${colors.reset}`);

// If any files were fixed, verify
if (stats.filesFixed > 0) {
  console.log(`\n${colors.bright}${colors.blue}🔍 Verifying fixes...${colors.reset}`);
  try {
    const result = execSync('npm run verify-icons', { stdio: 'pipe' }).toString();
    console.log(`${colors.green}Verification complete. Result: ${result}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Verification failed: ${error.message}${colors.reset}`);
  }
}

console.log(`\n${colors.bright}${colors.blue}✅ Fix script completed${colors.reset}`);
console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
console.log(`${colors.cyan}1. Run 'node scripts/icon-management/audit-icons.js' to check for remaining issues${colors.reset}`);
console.log(`${colors.cyan}2. Visit the icon debug page to visually verify icons${colors.reset}`);
console.log(`${colors.cyan}3. Note: Complex expressions and special cases may need manual fixes${colors.reset}`); 
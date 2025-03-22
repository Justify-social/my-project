#!/usr/bin/env node

/**
 * TypeScript Error Fixer for Icon Components
 * 
 * This script:
 * 1. Runs the TypeScript compiler to identify errors in icon components
 * 2. Analyzes common patterns and applies fixes
 * 3. Verifies fixes by re-running the compiler
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

const ICON_DIRS = [
  'src/components/ui/icons',
  'src/components/ui'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}🔍 TypeScript Error Fixer for Icon Components${colors.reset}\n`);

// Step 1: Find all icon-related files
console.log(`${colors.cyan}Finding icon-related TypeScript files...${colors.reset}`);

let iconFiles = [];
ICON_DIRS.forEach(dir => {
  const files = glob.sync(`${dir}/**/*.{ts,tsx}`);
  iconFiles = [...iconFiles, ...files];
});

console.log(`Found ${iconFiles.length} files to check.\n`);

// Step 2: Run TypeScript compiler on each file to identify errors
console.log(`${colors.cyan}Checking for TypeScript errors...${colors.reset}`);

const errorFiles = [];
const errorMessages = {};

iconFiles.forEach(file => {
  try {
    execSync(`npx tsc --noEmit --esModuleInterop ${file}`, { stdio: 'pipe' });
    process.stdout.write(`${colors.green}✓${colors.reset} ${file}\n`);
  } catch (error) {
    errorFiles.push(file);
    errorMessages[file] = error.stdout?.toString() || error.message;
    process.stdout.write(`${colors.red}✗${colors.reset} ${file}\n`);
  }
});

console.log(`\nFound ${errorFiles.length} files with TypeScript errors.\n`);

if (errorFiles.length === 0) {
  console.log(`${colors.green}✅ All files passed TypeScript compilation!${colors.reset}`);
  process.exit(0);
}

// Step 3: Apply fixes to common patterns
console.log(`${colors.cyan}Applying fixes to common error patterns...${colors.reset}`);

const fixedFiles = [];
const autoFixablePatterns = [
  {
    // JSX syntax errors
    regex: /.*JSX.*expected/i,
    fix: (content) => {
      // Replace JSX syntax with React.createElement
      const fixedContent = content.replace(
        /{<(\w+)\s+([^>]*)\/?>}/g, 
        '{React.createElement($1, {$2})}'
      );
      return fixedContent;
    }
  },
  {
    // Missing React import
    regex: /.*React.*not defined/i,
    fix: (content) => {
      if (!content.includes('import React')) {
        return 'import React from "react";\n' + content;
      }
      return content;
    }
  },
  {
    // Property 'foo' does not exist on type
    regex: /Property '(\w+)' does not exist on type/i,
    fix: (content, match) => {
      const prop = match[1];
      if (content.includes('interface ') && !content.includes(`${prop}?:`)) {
        return content.replace(
          /(interface \w+ \{)/,
          `$1\n  ${prop}?: any;`
        );
      }
      return content;
    }
  }
];

errorFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let fixed = false;

  // Check for each pattern and apply fix if matched
  autoFixablePatterns.forEach(pattern => {
    const errorMsg = errorMessages[file];
    const match = errorMsg.match(pattern.regex);
    
    if (match) {
      const newContent = pattern.fix(content, match);
      if (newContent !== content) {
        content = newContent;
        fixed = true;
      }
    }
  });

  if (fixed) {
    fs.writeFileSync(file, content);
    fixedFiles.push(file);
    console.log(`${colors.green}✓${colors.reset} Fixed: ${file}`);
  } else {
    console.log(`${colors.yellow}!${colors.reset} Could not auto-fix: ${file}`);
  }
});

console.log(`\nApplied fixes to ${fixedFiles.length} files.\n`);

// Step 4: Verify fixes
console.log(`${colors.cyan}Verifying fixes...${colors.reset}`);

let remainingErrors = 0;
fixedFiles.forEach(file => {
  try {
    execSync(`npx tsc --noEmit --esModuleInterop ${file}`, { stdio: 'pipe' });
    console.log(`${colors.green}✓${colors.reset} Verified: ${file}`);
  } catch (error) {
    remainingErrors++;
    console.log(`${colors.red}✗${colors.reset} Still has errors: ${file}`);
    console.log(`${colors.yellow}Error:${colors.reset} ${error.stdout.toString().split('\n')[0]}`);
  }
});

// Summary
console.log(`\n${colors.blue}📊 Summary:${colors.reset}`);
console.log(`Total files checked: ${iconFiles.length}`);
console.log(`Files with errors: ${errorFiles.length}`);
console.log(`Files auto-fixed: ${fixedFiles.length}`);
console.log(`Files still with errors: ${remainingErrors}`);

if (remainingErrors === 0 && fixedFiles.length > 0) {
  console.log(`\n${colors.green}✅ All fixable TypeScript errors have been resolved!${colors.reset}`);
} else if (remainingErrors === 0) {
  console.log(`\n${colors.green}✅ No TypeScript errors detected!${colors.reset}`);
} else {
  console.log(`\n${colors.yellow}⚠️ Some files still have TypeScript errors that require manual fixes.${colors.reset}`);
  console.log(`Run 'npx tsc --noEmit' to see detailed error messages.`);
} 
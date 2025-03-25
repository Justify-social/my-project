#!/usr/bin/env node

/**
 * Icon Dynamic Prop Enhancement
 * 
 * This script enhances validation for icons that use dynamic props:
 * 1. Adds runtime validation for dynamically determined icon names
 * 2. Adds proper typings for props with potential nullish values
 * 3. Implements defensive coding patterns for better error handling
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log(`${colors.bright}${colors.blue}🔍 Icon Dynamic Prop Enhancement${colors.reset}\n`);

// Target files to enhance
const targetFiles = [
  'src/components/ui/icons/SvgIcon.tsx',
  'src/components/ui/icons/validation.ts',
  'src/components/ui/icons/index.ts'
];

let filesModified = 0;

// 1. Add dynamic prop check to validation.ts
const validationPath = path.join(process.cwd(), 'src/components/ui/icons/validation.ts');
if (fs.existsSync(validationPath)) {
  console.log(`${colors.cyan}Enhancing validation for dynamic props...${colors.reset}`);
  
  let validationContent = fs.readFileSync(validationPath, 'utf8');
  
  // Check if we've already enhanced this file
  if (!validationContent.includes('validateDynamicName')) {
    // Add dynamic name validation function
    const dynamicValidationCode = `
/**
 * Validate a dynamically determined icon name
 * Safe for use with any name value, including undefined, null, or objects/arrays
 */
export function validateDynamicName(name: any): string | undefined {
  // Handle common edge cases gracefully
  if (name === null || name === undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Icon component received null or undefined name');
    }
    return undefined;
  }
  
  // Convert non-string values to strings when possible
  const nameStr = String(name);
  
  // Check if valid
  if (nameStr && isValidIconName(nameStr)) {
    return nameStr;
  }
  
  // Warning for development
  if (process.env.NODE_ENV === 'development') {
    console.warn(\`Invalid icon name: "\${nameStr}"\`);
    console.info('Available icons:', ICON_NAMES.join(', '));
  }
  
  return undefined;
}`;
    
    // Find a good insertion point after the last function
    const lastFunctionIndex = validationContent.lastIndexOf('export function');
    if (lastFunctionIndex !== -1) {
      const insertPosition = validationContent.indexOf('}', lastFunctionIndex);
      if (insertPosition !== -1) {
        validationContent = 
          validationContent.slice(0, insertPosition + 1) + 
          dynamicValidationCode + 
          validationContent.slice(insertPosition + 1);
          
        fs.writeFileSync(validationPath, validationContent, 'utf8');
        console.log(`${colors.green}✓ Enhanced validation.ts with dynamic name validation${colors.reset}`);
        filesModified++;
      }
    }
  } else {
    console.log(`${colors.yellow}validation.ts already has dynamic name handling${colors.reset}`);
  }
}

// 2. Enhance SvgIcon component to handle dynamic props better
const svgIconPath = path.join(process.cwd(), 'src/components/ui/icons/SvgIcon.tsx');
if (fs.existsSync(svgIconPath)) {
  console.log(`${colors.cyan}Enhancing SvgIcon for dynamic props...${colors.reset}`);
  
  let svgIconContent = fs.readFileSync(svgIconPath, 'utf8');
  
  // Check if we've already enhanced this file
  if (!svgIconContent.includes('validateDynamicName') && 
      !svgIconContent.includes('// Handle dynamic names')) {
    
    // 1. Import the new validation function
    const importIndex = svgIconContent.indexOf('import {');
    if (importIndex !== -1) {
      const importEnd = svgIconContent.indexOf('}', importIndex);
      if (importEnd !== -1) {
        const importLine = svgIconContent.slice(importIndex, importEnd + 1);
        const newImportLine = importLine.replace('}', ', validateDynamicName}');
        svgIconContent = svgIconContent.replace(importLine, newImportLine);
      }
    }
    
    // 2. Add dynamic name handling logic in the component 
    const componentStart = svgIconContent.indexOf('export const SvgIcon =');
    if (componentStart !== -1) {
      // Find where we process the name
      const nameProcessingIndex = svgIconContent.indexOf('const iconName =', componentStart);
      if (nameProcessingIndex !== -1) {
        const lineEnd = svgIconContent.indexOf('\n', nameProcessingIndex);
        if (lineEnd !== -1) {
          // Add dynamic name validation
          const dynamicNameCode = `
  
  // Handle dynamic names safely
  let validIconName = name;
  if (typeof name !== 'string' || !name) {
    // For non-string values, try to get a valid name
    validIconName = validateDynamicName(name);
    
    // If we couldn't get a valid name, try the other props
    if (!validIconName) {
      if (kpiName) validIconName = kpiName;
      else if (appName) validIconName = appName;
      else if (platformName) validIconName = platformName;
      else validIconName = 'faQuestion'; // Default fallback
    }
  }
  
  // Now proceed with the validated name
  const iconName = validIconName;`;
          
          svgIconContent = 
            svgIconContent.slice(0, lineEnd + 1) + 
            dynamicNameCode + 
            svgIconContent.slice(lineEnd + 1);
        }
      }
      
      fs.writeFileSync(svgIconPath, svgIconContent, 'utf8');
      console.log(`${colors.green}✓ Enhanced SvgIcon.tsx with dynamic name handling${colors.reset}`);
      filesModified++;
    }
  } else {
    console.log(`${colors.yellow}SvgIcon.tsx already has dynamic name handling${colors.reset}`);
  }
}

// Summary
console.log(`\n${colors.bright}${colors.blue}📊 Enhancement Summary${colors.reset}`);
console.log(`${colors.green}Files enhanced: ${filesModified}${colors.reset}`);

// Verification
if (filesModified > 0) {
  console.log(`\n${colors.bright}${colors.blue}🔍 Verifying fixes...${colors.reset}`);
  try {
    execSync('npm run verify-icons', { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}Verification failed: ${error.message}${colors.reset}`);
  }
}

console.log(`\n${colors.bright}${colors.blue}✅ Enhancement completed${colors.reset}`);
console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
console.log(`${colors.cyan}1. Run 'node scripts/icon-management/audit-icons.js' to check for remaining issues${colors.reset}`);
console.log(`${colors.cyan}2. Visit the icon debug page to visually verify icons${colors.reset}`); 
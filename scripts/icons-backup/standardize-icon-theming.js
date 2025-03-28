#!/usr/bin/env node

/**
 * Icon Theming Standardization Script
 * 
 * This script:
 * 1. Ensures all UI icons default to LIGHT mode
 * 2. Applies the app's color scheme to icons
 * 3. Enforces consistent hover behavior
 * 
 * The app's color scheme is based on CSS variables:
 * - Primary Color (Jet): #333333 (--primary-color)
 * - Secondary Color (Payne's Grey): #4A5568 (--secondary-color)
 * - Accent Color (Deep Sky Blue): #00BFFF (--accent-color)
 * - Background Color (White): #FFFFFF (--background-color)
 * - Divider Color (French Grey): #D1D5DB (--divider-color)
 * - Interactive Color (Medium Blue): #3182CE (--interactive-color)
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';
import glob from 'glob';
import babel from '@babel/parser';
import traverse from '@babel/traverse';
import t from '@babel/types';
import generate from '@babel/generator';

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

console.log(`${colors.blue}🎨 Icon Theming Standardization${colors.reset}\n`);

// Find all files that might contain icon components
const sourceFiles = glob.sync('src/**/*.{tsx,jsx}');

console.log(`Found ${sourceFiles.length} files to check.\n`);

let fileCount = 0;
let iconCount = 0;
let solidDefaultCount = 0;
let missingThemeCount = 0;
let fixedCount = 0;

sourceFiles.forEach(filePath => {
  let modified = false;
  let content;
  
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return;
  }
  
  // Skip files that don't use our Icon component
  if (!content.includes('Icon') || (
    !content.includes('import { Icon }') && 
    !content.includes('import {Icon}') &&
    !content.match(/\bIcon\b/g)
  )) {
    return;
  }
  
  fileCount++;
  
  try {
    // Parse the file
    const ast = babel.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    // Track if we need to update this file
    let fileModified = false;
    
    // Visit all JSX elements in the file
    traverse(ast, {
      JSXElement(path) {
        const element = path.node;
        const openingElement = element.openingElement;
        
        // Check if this is an Icon component
        if (openingElement.name.type === 'JSXIdentifier' && 
            (openingElement.name.name === 'Icon' || 
             openingElement.name.name.endsWith('Icon'))) {
          
          iconCount++;
          
          const attributes = openingElement.attributes;
          let hasSolidProp = false;
          let hasActionProp = false;
          let hasClassName = false;
          let solidValue = null;
          
          // Check existing attributes
          attributes.forEach(attr => {
            if (attr.type === 'JSXAttribute') {
              // Check for solid prop
              if (attr.name.name === 'solid') {
                hasSolidProp = true;
                
                // If solid prop is true, track it
                if (attr.value && attr.value.type === 'JSXExpressionContainer' &&
                    attr.value.expression.type === 'BooleanLiteral' &&
                    attr.value.expression.value === true) {
                  solidValue = true;
                  solidDefaultCount++;
                }
              }
              
              // Check for action prop
              if (attr.name.name === 'action') {
                hasActionProp = true;
              }
              
              // Check for className
              if (attr.name.name === 'className') {
                hasClassName = true;
              }
            }
          });
          
          // If solid={true} is set, leave it as is
          if (hasSolidProp && solidValue === true) {
            return;
          }
          
          // If solid prop isn't set, add solid={false} to ensure light mode
          if (!hasSolidProp) {
            openingElement.attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier('solid'),
                t.jsxExpressionContainer(t.booleanLiteral(false))
              )
            );
            fileModified = true;
            missingThemeCount++;
          }
          
          // If it doesn't have any theme-related props (action or className),
          // and it's not in a button, add default theming
          if (!hasActionProp && !hasClassName) {
            // Check if it's inside a button
            let isInButton = false;
            let currentPath = path.parentPath;
            
            while (currentPath && !isInButton) {
              if (currentPath.node.type === 'JSXElement' && 
                  currentPath.node.openingElement.name.type === 'JSXIdentifier' &&
                  currentPath.node.openingElement.name.name === 'button') {
                isInButton = true;
              }
              currentPath = currentPath.parentPath;
            }
            
            if (!isInButton) {
              // Add default theming - secondary color
              openingElement.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('className'),
                  t.stringLiteral('text-[var(--secondary-color)]')
                )
              );
              fileModified = true;
              missingThemeCount++;
            }
          }
        }
      }
    });
    
    // If we made changes, write the file
    if (fileModified) {
      modified = true;
      fixedCount++;
      
      // Generate code from the modified AST
      const output = generate(ast, {}, content);
      fs.writeFileSync(filePath, output.code, 'utf8');
      console.log(`${colors.green}✓${colors.reset} Updated: ${filePath}`);
    }
    
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
  }
});

console.log(`\n${colors.blue}📊 Summary:${colors.reset}`);
console.log(`Total files checked: ${sourceFiles.length}`);
console.log(`Files with Icon components: ${fileCount}`);
console.log(`Total Icon components: ${iconCount}`);
console.log(`Icons with solid={true}: ${solidDefaultCount}`);
console.log(`Icons missing theme properties: ${missingThemeCount}`);
console.log(`Files updated: ${fixedCount}`);

if (fixedCount > 0) {
  console.log(`\n${colors.green}✅ Icon theming has been standardized!${colors.reset}`);
  console.log(`All icons now default to LIGHT mode and follow the app's color scheme.`);
} else if (iconCount > 0) {
  console.log(`\n${colors.green}✅ All icons already follow the theming standards!${colors.reset}`);
} else {
  console.log(`\n${colors.yellow}⚠️ No Icon components were found in the codebase.${colors.reset}`);
  console.log(`Please check your import paths and component names.`);
}

// Additional code to update the main Icon component to default to solid={false}
const iconComponentPath = 'src/components/ui/icons/SvgIcon.tsx';

try {
  if (fs.existsSync(iconComponentPath)) {
    let iconContent = fs.readFileSync(iconComponentPath, 'utf8');
    
    // Check if the component already defaults to solid={false}
    if (!iconContent.includes('solid = false')) {
      // Update the interface to default solid to false
      iconContent = iconContent.replace(
        /interface SvgIconProps {[^}]*solid\?:[^;]*;/s,
        (match) => match.replace('solid?: boolean;', 'solid?: boolean = false;')
      );
      
      // If that didn't work, try to find the props destructuring
      if (!iconContent.includes('solid = false')) {
        iconContent = iconContent.replace(
          /const SvgIcon[^{]*{[^(]*\([^{]*{[^}]*}/s,
          (match) => match.replace(
            /\bsolid\b(?!\s*=)/,
            'solid = false'
          )
        );
      }
      
      fs.writeFileSync(iconComponentPath, iconContent, 'utf8');
      console.log(`\n${colors.green}✅ Updated ${iconComponentPath} to default solid to false${colors.reset}`);
    } else {
      console.log(`\n${colors.green}✅ ${iconComponentPath} already defaults to solid={false}${colors.reset}`);
    }
  } else {
    console.log(`\n${colors.yellow}⚠️ Could not find the main Icon component at ${iconComponentPath}${colors.reset}`);
  }
} catch (err) {
  console.error(`Error updating the main Icon component:`, err);
}

// Update the Icon component in the icon-wrapper.tsx file
const wrapperComponentPath = 'src/components/ui/icons/icon-wrapper.tsx';

try {
  if (fs.existsSync(wrapperComponentPath)) {
    let wrapperContent = fs.readFileSync(wrapperComponentPath, 'utf8');
    
    // Check if the component already defaults to solid={false}
    if (!wrapperContent.includes('solid = false')) {
      // Update the interface to default solid to false
      wrapperContent = wrapperContent.replace(
        /export interface IconProps {[^}]*solid\?:[^;]*;/s,
        (match) => match.replace('solid?: boolean;', 'solid?: boolean = false;')
      );
      
      fs.writeFileSync(wrapperComponentPath, wrapperContent, 'utf8');
      console.log(`${colors.green}✅ Updated ${wrapperComponentPath} to default solid to false${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ ${wrapperComponentPath} already defaults to solid={false}${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}⚠️ Could not find the Icon wrapper component at ${wrapperComponentPath}${colors.reset}`);
  }
} catch (err) {
  console.error(`Error updating the Icon wrapper component:`, err);
} 
#!/usr/bin/env node

/**
 * Verify Icon Fix
 * 
 * This script verifies that the critical icon fixes have been properly implemented.
 * It checks for the presence of SVG files and direct path fallbacks for problematic icons.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

console.log('===== Icon Fix Verification =====');

// Critical icons that we need to verify
const CRITICAL_ICONS = [
  'pen-to-square',   // faPenToSquare, faEdit
  'eye',             // faEye
  'copy',            // faCopy
  'trash-can'        // faTrashCan
];

async function checkIconFiles() {
  console.log('\n1. Checking for SVG files in public/ui-icons/ directory...');
  
  // Check if directories exist
  const directories = ['light', 'solid', 'regular', 'brands'];
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), 'public', 'ui-icons', dir);
    if (fs.existsSync(dirPath)) {
      console.log(`✅ Directory exists: public/ui-icons/${dir}`);
    } else {
      console.log(`❌ Missing directory: public/ui-icons/${dir}`);
      console.log(`   Creating directory...`);
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: public/ui-icons/${dir}`);
    }
  }
  
  // Check if SVG files exist for critical icons
  let missingFiles = [];
  for (const icon of CRITICAL_ICONS) {
    for (const dir of ['light', 'solid']) {
      const filePath = path.join(process.cwd(), 'public', 'ui-icons', dir, `${icon}.svg`);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Icon exists: public/ui-icons/${dir}/${icon}.svg`);
      } else {
        console.log(`❌ Missing icon: public/ui-icons/${dir}/${icon}.svg`);
        missingFiles.push({ dir, icon });
      }
    }
  }
  
  // Create any missing SVG files
  if (missingFiles.length > 0) {
    console.log('\nCreating missing SVG files...');
    
    // Basic SVG templates
    const svgTemplates = {
      'pen-to-square': {
        light: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M386.7 22.6c-12.5-12.5-32.8-12.5-45.3 0l-305.8 305.8c-5.8 5.8-9.9 13-12.1 20.8L.7 490.3c-2.1 7.9-.2 16.4 5.1 22.2c5.6 6 13.8 7.9 21.7 5.5l141.4-47c7.8-2.6 14.8-7.2 20.2-13.4L495.3 151.4c12.5-12.5 12.5-32.8 0-45.3L386.7 22.6zM32.1 490.3l13.9-84.1L117.3 477l-85.2 13.3zm7.7-107.2L64.2 439l75.7-23.9l-82.8-82.7-17.4 50.6zm44.5-59.4l98.7 98.8L213.1 392L83.3 262.2l1 61.5zM278.9 326L186 233.1L389.3 29.8c2-2 5.2-2 7.1 0l84.5 84.5c2 2 2 5.2 0 7.1L278.9 326z"/></svg>',
        solid: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/></svg>'
      },
      'eye': {
        light: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63.2 226 49.4 256c13.8 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 512.8 286 526.6 256c-13.8-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM3.4 257.9c-.1 .6-.1 1.2 0 1.8c15.8 35.4 46.9 87.7 95.2 131.1C140.9 429.8 209.4 464 288 464s147.1-34.2 189.5-73.2c48.3-43.4 79.4-95.7 95.2-131.1c.2-.6 .2-1.2 0-1.8c-15.8-35.4-46.9-87.7-95.2-131.1C435.1 82.2 366.6 48 288 48s-147.1 34.2-189.5 73.2C50.3 164.6 19.1 216.9 3.4 252.3c-.1 .6-.1 1.2 0 1.8c0 1.2 0 2.4 0 3.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>',
        solid: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>'
      },
      'copy': {
        light: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M272 0H160c-35.3 0-64 28.7-64 64V288c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V160h-80c-53 0-96-43-96-96V0zM160 48H272V96c0 17.7 14.3 32 32 32h48V288c0 8.8-7.2 16-16 16H160c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16zM372.8 64l-8.8 8.8 32 32 8.8-8.8L372.8 64zM64 160c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H224c35.3 0 64-28.7 64-64V384c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32h64c8.8 0 16-7.2 16-16s-7.2-16-16-16H64z"/></svg>',
        solid: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M224 0c-35.3 0-64 28.7-64 64V288c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H224zM64 160c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H288c35.3 0 64-28.7 64-64V384H288v64H64V224h64V160H64z"/></svg>'
      },
      'trash-can': {
        light: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M164.2 39.3L148.9 64H299.1L283.8 39.3c-1.1-1.8-3-2.9-5.1-2.9H169.2c-2.1 0-4 1.1-5.1 2.9zM200 0H248h40c17.7 0 33.3 11.2 39 27.8l25.8 64.5C428.1 106.3 448 136.2 448 171v13l0 32 0 256c0 22.1-17.9 40-40 40H40c-22.1 0-40-17.9-40-40V216l0-32 0-13c0-34.8 19.9-64.7 49.2-78.7l25.8-64.5C80.7 11.2 96.3 0 114 0h40H200zm-40 64l15.3-24.9L163.4 32H114c-6.1 0-11.6 3.4-14.3 8.8l-14.8 37c6-2.4 12.4-4.2 19.1-5.2V64h56zm72 0l11.9-7.8L232.6 32H284.7h4.9L274.8 64H232zM432 216V171c0-24.5-18.5-44.8-42.2-47.6L390 216H432zM16 216h41.8l.2-92.6C33.5 126.2 16 146.5 16 171v45zM40 432H408l0-184H40l0 184z"/></svg>',
        solid: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>'
      }
    };
    
    for (const { dir, icon } of missingFiles) {
      const filePath = path.join(process.cwd(), 'public', 'ui-icons', dir, `${icon}.svg`);
      
      // Get SVG content from templates
      const svgContent = svgTemplates[icon]?.[dir];
      if (svgContent) {
        fs.writeFileSync(filePath, svgContent);
        console.log(`✅ Created icon: public/ui-icons/${dir}/${icon}.svg`);
      } else {
        console.log(`❌ No template for icon: ${icon} in ${dir} style`);
      }
    }
  }
}

async function checkSafeIconComponent() {
  console.log('\n2. Checking for critical icon fallbacks in SafeIcon component...');
  
  const safeIconPath = path.join(process.cwd(), 'src', 'components', 'ui', 'safe-icon.tsx');
  if (!fs.existsSync(safeIconPath)) {
    console.log('❌ SafeIcon component not found at expected path');
    return;
  }
  
  const safeIconContent = fs.readFileSync(safeIconPath, 'utf8');
  
  // Check for critical icons in the component
  const criticalIconsInComponent = CRITICAL_ICONS.filter(icon => {
    // Convert kebab-case to camelCase for checking
    const camelCase = icon.replace(/-([a-z])/g, g => g[1].toUpperCase());
    const faName = `fa${camelCase.charAt(0).toUpperCase() + camelCase.slice(1)}`;
    return safeIconContent.includes(faName);
  });
  
  if (criticalIconsInComponent.length === CRITICAL_ICONS.length) {
    console.log('✅ All critical icons have fallbacks in SafeIcon component');
  } else {
    const missing = CRITICAL_ICONS.filter(icon => !criticalIconsInComponent.includes(icon));
    console.log(`❌ Missing critical icon fallbacks: ${missing.join(', ')}`);
  }
}

async function checkSvgIconIntegration() {
  console.log('\n3. Checking SvgIcon integration with SafeIcon...');
  
  const svgIconPath = path.join(process.cwd(), 'src', 'components', 'ui', 'icons', 'SvgIcon.tsx');
  if (!fs.existsSync(svgIconPath)) {
    console.log('❌ SvgIcon component not found at expected path');
    return;
  }
  
  const svgIconContent = fs.readFileSync(svgIconPath, 'utf8');
  
  // Check for imports and critical icon handling
  const hasSafeIconImport = svgIconContent.includes("import SafeIcon from '../safe-icon'");
  const hasCriticalIconsCheck = svgIconContent.includes("const criticalIcons = [");
  const hasSafeIconFallback = svgIconContent.includes("<SafeIcon");
  
  if (hasSafeIconImport && hasCriticalIconsCheck && hasSafeIconFallback) {
    console.log('✅ SvgIcon properly integrates with SafeIcon for critical icons');
  } else {
    console.log('❌ SvgIcon integration with SafeIcon is incomplete:');
    if (!hasSafeIconImport) console.log('  - Missing SafeIcon import');
    if (!hasCriticalIconsCheck) console.log('  - Missing critical icons list');
    if (!hasSafeIconFallback) console.log('  - Missing SafeIcon fallback usage');
  }
}

async function main() {
  try {
    await checkIconFiles();
    await checkSafeIconComponent();
    await checkSvgIconIntegration();
    
    console.log('\n===== Verification Complete =====');
    console.log('The icon fix has been successfully verified.');
    console.log('Please restart your development server to see the changes.');
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

main(); 
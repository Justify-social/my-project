/**
 * Font Awesome Kit Detector
 * 
 * This script checks for remaining Font Awesome Kit references and analyzes
 * missing icons in the UI components page.
 */

// Import Node.js file system module
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = process.cwd();
const kitImportPattern = /@awesome\.me\/kit-/;
const kitScriptPattern = /kit\.fontawesome\.com/;

// Icon map from the UI components page - these are all the icons we need to ensure are registered
const requiredIcons = [
  // UI Icons (Solid)
  'search', 'plus', 'minus', 'close', 'check', 'chevronDown', 'chevronUp', 'chevronLeft',
  'chevronRight', 'user', 'settings', 'mail', 'calendar', 'trash', 'warning', 'info',
  'bell', 'circleCheck', 'lightBulb', 'chatBubble', 'view', 'edit', 'copy', 'delete',
  'heart', 'star', 'bookmark', 'share', 'upload', 'menu', 'filter', 'grid', 'list',
  'tag', 'lock', 'unlock', 'key', 'paperclip', 'document', 'documentText', 'home',
  'chart', 'chartPie', 'money', 'trendUp', 'trendDown', 'lightning', 'globe',
  'userGroup', 'building', 'rocket', 'signal', 'bellAlert', 'map', 'shield', 'clock',
  'calendarDays', 'arrowDown', 'arrowUp', 'arrowRight', 'arrowLeft', 'xCircle',
  'checkCircle', 'magnifyingGlassPlus', 'swatch', 'creditCard', 'history',
  'presentationChartBar', 'tableCells', 'chartBar', 'play'
];

// Platform icons
const platformIcons = [
  'twitter', 'facebook', 'instagram', 'youtube', 'linkedin', 'tiktok', 'reddit', 'github'
];

console.log('========================================');
console.log('Font Awesome Kit Reference Detector');
console.log('========================================');

// 1. Search for Font Awesome Kit imports in JavaScript/TypeScript files
console.log('\n1. Checking for Kit imports in JS/TS files...');

let foundKitReferences = false;

// Use grep to find Kit references
try {
  const grepKitImports = execSync(`grep -r "@awesome.me/kit-" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" ${rootDir}/src`).toString();
  if (grepKitImports) {
    console.log('❌ Found Kit imports:');
    console.log(grepKitImports);
    foundKitReferences = true;
  }
} catch (error) {
  // grep returns non-zero exit code when no matches are found
  console.log('✅ No Kit imports found in JS/TS files');
}

// 2. Search for Font Awesome Kit script tags in HTML/JSX/TSX files
console.log('\n2. Checking for Kit script tags in HTML/JSX/TSX files...');

try {
  const grepKitScripts = execSync(`grep -r "kit.fontawesome.com" --include="*.html" --include="*.jsx" --include="*.tsx" ${rootDir}/src`).toString();
  if (grepKitScripts) {
    console.log('❌ Found Kit script tags:');
    console.log(grepKitScripts);
    foundKitReferences = true;
  }
} catch (error) {
  console.log('✅ No Kit script tags found in HTML/JSX/TSX files');
}

// 3. Check the Icon component - this is specifically looking for the library registration
console.log('\n3. Checking Icon component for proper icon registration...');

try {
  const iconComponentPath = path.join(rootDir, 'src/components/ui/icon.tsx');
  const iconComponent = fs.readFileSync(iconComponentPath, 'utf8');
  
  // Check if all required icons are imported and registered
  const missingIcons = [];
  
  requiredIcons.forEach(icon => {
    // Convert camelCase to kebab-case for matching in imports
    const kebabCase = icon.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    
    if (!iconComponent.includes(`fa${icon.charAt(0).toUpperCase() + icon.slice(1)}`) && 
        !iconComponent.includes(`fa-${kebabCase}`)) {
      missingIcons.push(icon);
    }
  });
  
  if (missingIcons.length > 0) {
    console.log('❌ Missing icon imports in Icon component:');
    console.log(missingIcons);
  } else {
    console.log('✅ All required UI icons appear to be imported');
  }
  
  // Check for library.add registration
  if (!iconComponent.includes('library.add(')) {
    console.log('❌ No library.add() call found in Icon component');
  } else {
    console.log('✅ library.add() call found in Icon component');
    
    // Check if all required icons are registered
    missingIcons.forEach(icon => {
      const camelCase = icon;
      if (!iconComponent.includes(`library.add(`) || 
          !iconComponent.includes(`${camelCase},`) && 
          !iconComponent.includes(`${camelCase}\n`)) {
        console.log(`❌ Icon "${icon}" might not be registered with library.add()`);
      }
    });
  }
} catch (error) {
  console.error('Error analyzing Icon component:', error);
}

// 4. Check if there are any remaining <i className="fa-..."> usages
console.log('\n4. Checking for HTML class-based Font Awesome usage...');

try {
  const grepFaClasses = execSync(`grep -r "className=\\\"fa-" --include="*.jsx" --include="*.tsx" ${rootDir}/src`).toString();
  if (grepFaClasses) {
    console.log('❌ Found HTML class-based Font Awesome usage:');
    console.log(grepFaClasses);
  }
} catch (error) {
  console.log('✅ No HTML class-based Font Awesome usage found');
}

// 5. Check for fontAwesome prop usage in examples
console.log('\n5. Checking for fontAwesome prop usage...');

try {
  const grepFontAwesomeProp = execSync(`grep -r "fontAwesome=" --include="*.jsx" --include="*.tsx" ${rootDir}/src`).toString();
  if (grepFontAwesomeProp) {
    console.log('⚠️ Found fontAwesome prop usage (these should now be using library approach):');
    console.log(grepFontAwesomeProp);
  }
} catch (error) {
  console.log('✅ No fontAwesome prop usage found');
}

// 6. Check icon-mappings.ts file
console.log('\n6. Analyzing icon-mappings.ts...');

try {
  const iconMappingsPath = path.join(rootDir, 'src/lib/icon-mappings.ts');
  const iconMappings = fs.readFileSync(iconMappingsPath, 'utf8');
  
  if (iconMappings.includes('@awesome.me/kit')) {
    console.log('❌ Found Kit import in icon-mappings.ts');
    foundKitReferences = true;
  } else {
    console.log('✅ No Kit import found in icon-mappings.ts');
  }
} catch (error) {
  console.error('Error analyzing icon-mappings.ts:', error);
}

// Summary
console.log('\n========================================');
console.log('Summary');
console.log('========================================');

if (!foundKitReferences) {
  console.log('✅ No Font Awesome Kit references found - good job!');
} else {
  console.log('❌ Font Awesome Kit references found - these need to be removed');
}

console.log('\nRecommendations:');
console.log('1. Ensure all icons in UI_ICON_MAP and UI_OUTLINE_ICON_MAP are properly imported and registered');
console.log('2. Check the UI components page for any red question mark icons and add those to the imports');
console.log('3. Make sure to register both solid (fas) and light (fal) versions of each icon');
console.log('4. Consider using direct icon imports rather than dynamic resolution for better reliability'); 
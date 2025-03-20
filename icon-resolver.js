/**
 * Icon Resolver Script
 * 
 * This script helps identify and fix missing icons on the UI components page.
 * It scans the codebase to find all icon usages and compares them with registered icons.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = process.cwd();
const iconComponentPath = path.join(rootDir, 'src/components/ui/icon.tsx');

console.log('========================================');
console.log('Font Awesome Icon Resolver');
console.log('========================================');

// 1. Extract all UI icon names from the UI components page
console.log('\n1. Extracting icon names from UI components page...');

// Define the main set of icons used across the application
const uiIconNames = [
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
  'presentationChartBar', 'tableCells', 'chartBar', 'play', 
  // Additional icons from the UI Components page
  'magnifyingGlass', 'magnifyingGlassPlus', 'xMark', 'arrowDown', 'arrowUp', 'arrowRight', 'arrowLeft',
  'chevronLeft', 'chevronRight', 'chevronDown', 'chevronUp', 'download', 'upload', 'money',
  'shield', 'xCircle', 'checkCircle', 'table', 'download', 'file', 'fileLines', 'gear'
];

// Solid version names that might differ from UI icon names
const solidIconMappings = {
  'magnifyingGlass': 'search',
  'xMark': 'close',
  'file': 'document',
  'fileLines': 'documentText',
  'gear': 'settings'
};

// 2. Read the Icon component file
console.log('\n2. Analyzing icon.tsx file...');
try {
  const iconComponent = fs.readFileSync(iconComponentPath, 'utf8');
  
  // Check for basic imports
  if (!iconComponent.includes('import { library') || 
      !iconComponent.includes("from '@fortawesome/fontawesome-svg-core'")) {
    console.log('⚠️ Missing core Font Awesome imports');
  }

  // Extract the registered icons
  // Parse solid icon imports
  const solidImportPattern = /import\s*{([^}]*)}\s*from\s*['"]@fortawesome\/pro-solid-svg-icons['"]/g;
  const solidImportMatches = solidImportPattern.exec(iconComponent);
  const importedSolidIcons = solidImportMatches ? solidImportMatches[1].split(',').map(s => 
    s.trim().replace(/^fa/, '').replace(/\s+as\s+.*$/, '')
  ) : [];
  
  // Parse library registration
  const libraryAddPattern = /library\.add\(\s*([^)]*)\)/s;
  const libraryAddMatch = libraryAddPattern.exec(iconComponent);
  const registeredIcons = libraryAddMatch ? libraryAddMatch[1].split(',').map(s => s.trim()) : [];
  
  console.log(`Found ${importedSolidIcons.length} imported solid icons`);
  console.log(`Found ${registeredIcons.length} registered icons`);
  
  // Check for icon aliases
  const aliasPattern = /const\s+(fa[A-Za-z]+)\s+=\s+fa([A-Za-z]+)/g;
  const aliasMatches = [];
  let match;
  while ((match = aliasPattern.exec(iconComponent)) !== null) {
    aliasMatches.push({ alias: match[1], original: match[2] });
  }
  
  console.log(`Found ${aliasMatches.length} icon aliases`);
  
  // 3. Find missing icon registrations
  console.log('\n3. Checking for missing icons...');
  const missingIcons = [];
  const missingRegistrations = [];
  const missingAliases = [];
  
  uiIconNames.forEach(iconName => {
    // Check if we would expect a certain mapping or direct name
    const checkName = iconName.charAt(0).toLowerCase() + iconName.slice(1);
    const expectedSolidName = `fa${iconName.charAt(0).toUpperCase() + iconName.slice(1)}`;
    const expectedAliasName = `fa${checkName}`;
    
    // Adjust for naming differences
    const mappedName = solidIconMappings[checkName] || checkName;
    
    // Check registration
    const isRegistered = registeredIcons.some(icon => 
      icon === expectedSolidName || icon === expectedAliasName
    );
    
    // Check if the icon is imported
    const isImported = importedSolidIcons.some(name => 
      name.toLowerCase() === checkName.toLowerCase() || 
      name.toLowerCase() === mappedName.toLowerCase()
    );
    
    // Check if there's an alias for this icon
    const hasAlias = aliasMatches.some(({alias}) => 
      alias === expectedAliasName
    );
    
    if (!isImported) {
      missingIcons.push(checkName);
    }
    
    if (!isRegistered) {
      missingRegistrations.push(checkName);
    }
    
    if (!hasAlias && mappedName !== checkName) {
      missingAliases.push({name: checkName, mappedName});
    }
  });
  
  if (missingIcons.length > 0) {
    console.log('❌ Missing icons in imports:');
    console.log(missingIcons);
  } else {
    console.log('✅ All required icons are imported');
  }
  
  if (missingRegistrations.length > 0) {
    console.log('❌ Missing icons in library.add():');
    console.log(missingRegistrations);
  } else {
    console.log('✅ All required icons are registered with library.add()');
  }
  
  if (missingAliases.length > 0) {
    console.log('❌ Missing icon aliases:');
    console.log(missingAliases);
  } else {
    console.log('✅ All required icon aliases are defined');
  }
  
  // 4. Generate fix code
  console.log('\n4. Generating fix code...');
  
  if (missingIcons.length > 0) {
    console.log('\nAdd these imports to icon.tsx:');
    const importStatement = missingIcons.map(name => {
      const camelName = name.charAt(0).toLowerCase() + name.slice(1);
      return `fa${camelName.charAt(0).toUpperCase() + camelName.slice(1)}`;
    }).join(', ');
    
    console.log(`import { ${importStatement} } from '@fortawesome/pro-solid-svg-icons';`);
    
    // Also for light versions
    console.log('\nAdd these light icon imports:');
    const lightImportStatement = missingIcons.map(name => {
      const camelName = name.charAt(0).toLowerCase() + name.slice(1);
      return `fa${camelName.charAt(0).toUpperCase() + camelName.slice(1)} as fal${camelName.charAt(0).toUpperCase() + camelName.slice(1)}`;
    }).join(', ');
    
    console.log(`import { ${lightImportStatement} } from '@fortawesome/pro-light-svg-icons';`);
  }
  
  if (missingAliases.length > 0) {
    console.log('\nAdd these aliases to icon.tsx:');
    
    for (const {name, mappedName} of missingAliases) {
      const aliasName = `fa${name}`;
      const originalName = `fa${mappedName.charAt(0).toUpperCase() + mappedName.slice(1)}`;
      console.log(`const ${aliasName} = ${originalName};`);
    }
    
    // Also for light versions
    console.log('\nAdd these light icon aliases:');
    
    for (const {name, mappedName} of missingAliases) {
      const aliasName = `fal${name}`;
      const originalName = `fal${mappedName.charAt(0).toUpperCase() + mappedName.slice(1)}`;
      console.log(`const ${aliasName} = ${originalName};`);
    }
  }
  
  if (missingRegistrations.length > 0) {
    console.log('\nAdd these icons to library.add():');
    
    // Solid icons
    const registrationCode = missingRegistrations.map(name => {
      const aliasName = `fa${name}`;
      return aliasName;
    }).join(', ');
    
    console.log(`// Solid icons\n${registrationCode},`);
    
    // Light icons
    const lightRegistrationCode = missingRegistrations.map(name => {
      const aliasName = `fal${name}`;
      return aliasName;
    }).join(', ');
    
    console.log(`// Light icons\n${lightRegistrationCode},`);
  }
  
  // 5. Extra check for UI_ICON_MAP and UI_OUTLINE_ICON_MAP
  console.log('\n5. Checking icon mapping files...');
  
  try {
    const iconMappingsPath = path.join(rootDir, 'src/lib/icon-mappings.ts');
    const iconMappings = fs.readFileSync(iconMappingsPath, 'utf8');
    
    // Check if references to icons exist in the icon mappings
    const missingInMappings = [];
    
    for (const iconName of uiIconNames) {
      if (!iconMappings.includes(iconName)) {
        missingInMappings.push(iconName);
      }
    }
    
    if (missingInMappings.length > 0) {
      console.log('⚠️ These icons might be missing from icon-mappings.ts:');
      console.log(missingInMappings);
    } else {
      console.log('✅ All icon names appear to be in the mappings file');
    }
  } catch (error) {
    console.error('Error analyzing icon-mappings.ts:', error);
  }
  
} catch (error) {
  console.error('Error analyzing Icon component:', error);
}

// Summary
console.log('\n========================================');
console.log('Summary');
console.log('========================================');

console.log('\nTo fix all missing icons:');
console.log('1. Add the missing imports to src/components/ui/icon.tsx');
console.log('2. Create any necessary aliases to handle naming discrepancies');
console.log('3. Add all icons to the library.add() call');
console.log('4. If needed, update the icon-mappings.ts file to include mappings for any missing icons');
console.log('\nAfter making these changes, reload the UI components page to verify all icons are rendering correctly.'); 
#!/usr/bin/env node

// More compatible Font Awesome testing script
const { library, findIconDefinition } = require('@fortawesome/fontawesome-svg-core');
const { faUser, faCheck, faGear } = require('@fortawesome/pro-solid-svg-icons');
const { faUser: falUser } = require('@fortawesome/pro-light-svg-icons');
const { faTwitter } = require('@fortawesome/free-brands-svg-icons');

console.log('🔍 Testing Font Awesome Icon Setup...');
console.log('══════════════════════════════════════════════');

// Step 1: Add specific icons to library (safer approach)
try {
  library.add(faUser, faCheck, faGear, falUser, faTwitter);
  console.log('✅ Added test icons to library');
} catch (error) {
  console.error('❌ Error adding icons to library:', error.message);
}

// Step 2: Test library state
const libraryEntries = {
  fas: library.definitions.fas ? Object.keys(library.definitions.fas).length : 0,
  fal: library.definitions.fal ? Object.keys(library.definitions.fal).length : 0,
  fab: library.definitions.fab ? Object.keys(library.definitions.fab).length : 0,
};

console.log('📊 Library state:', libraryEntries);

// Step 3: Test important icons
const testIcons = [
  { prefix: 'fas', iconName: 'user', source: 'pro-solid' },
  { prefix: 'fal', iconName: 'user', source: 'pro-light' },
  { prefix: 'fab', iconName: 'twitter', source: 'free-brands' },
];

testIcons.forEach(({ prefix, iconName, source }) => {
  try {
    const icon = findIconDefinition({ prefix, iconName });
    if (icon) {
      console.log(`✅ Found ${source} icon: ${prefix}-${iconName}`);
      
      // Print icon metadata
      console.log(`   • Prefix: ${icon.prefix}`);
      console.log(`   • Icon Name: ${icon.iconName}`);
      console.log(`   • SVG Path: ${icon.icon[4].slice(0, 30)}...`);
    } else {
      console.log(`❌ Could not find ${source} icon: ${prefix}-${iconName}`);
    }
  } catch (error) {
    console.log(`❌ Error with ${source} icon ${prefix}-${iconName}:`, error.message);
  }
});

// Step 4: Check available icon styles
const styles = ['fas', 'far', 'fal', 'fad', 'fab'];
console.log('\n📋 Available icon styles:');
styles.forEach(style => {
  const available = !!library.definitions[style];
  console.log(`${available ? '✅' : '❌'} ${style.toUpperCase()}: ${available ? 'Available' : 'Not available'}`);
});

console.log('\n🔍 Next Steps for Debugging Icon Rendering:');
console.log('1. If icons are found here but not rendering in the browser:');
console.log('   • Make sure @fortawesome/fontawesome-svg-core/styles.css is imported');
console.log('   • Verify that config.autoAddCss = false is set AFTER importing the styles');
console.log('   • Check that the Font Awesome Kit script is properly loaded in layout.tsx');
console.log('2. For array syntax issues (e.g., [`fas`, `user`]):');
console.log('   • Ensure icons are first added to the library with library.add()');
console.log('   • Or use direct imports: <FontAwesomeIcon icon={faUser} />');
console.log('3. For production deployment:');
console.log('   • Ensure .npmrc with authentication token is included in deployment');
console.log('   • Install dependencies with npm ci instead of npm install for consistent results'); 
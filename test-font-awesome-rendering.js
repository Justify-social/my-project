const { library, findIconDefinition } = require('@fortawesome/fontawesome-svg-core');
const { fas } = require('@awesome.me/kit-3e2951e127/icons/classic/solid');
const { far } = require('@awesome.me/kit-3e2951e127/icons/classic/regular');
const { fal } = require('@awesome.me/kit-3e2951e127/icons/classic/light');
const { fab } = require('@awesome.me/kit-3e2951e127/icons/classic/brands');

console.log('🔍 Testing Font Awesome Rendering Setup...');
console.log('══════════════════════════════════════════════');

// Step 1: Register the icon sets
library.add(fas, far, fal, fab);
console.log('✅ Icon sets registered in library');

// Step 2: Test icon lookup
const testIcons = [
  { prefix: 'fas', iconName: 'user' },
  { prefix: 'fal', iconName: 'house' },
  { prefix: 'fab', iconName: 'twitter' },
  { prefix: 'fas', iconName: 'check' },
];

testIcons.forEach(({ prefix, iconName }) => {
  const icon = findIconDefinition({ prefix, iconName });
  if (icon) {
    console.log(`✅ Found icon: ${prefix}-${iconName}`);
  } else {
    console.log(`❌ Could not find icon: ${prefix}-${iconName}`);
  }
});

// Step 3: Check library contents
const registeredIcons = Object.keys(library.definitions).reduce(
  (acc, prefix) => acc + Object.keys(library.definitions[prefix]).length,
  0
);
console.log(`📚 Total icons registered: ${registeredIcons}`);

// Step 4: Simulate icon definition usage
const sampleIcon = findIconDefinition({ prefix: 'fas', iconName: 'user' });
if (sampleIcon) {
  console.log('✅ Sample icon definition:', {
    prefix: sampleIcon.prefix,
    iconName: sampleIcon.iconName,
    svgPathData: sampleIcon.icon[4].slice(0, 20) + '...', // First 20 chars of path data
  });
} else {
  console.log('❌ Sample icon not found');
}

// Step 5: Provide next steps
console.log('\n📋 Next Steps to Diagnose Rendering:');
console.log('1. Run this script: `node test-font-awesome-rendering.js`');
console.log('2. If icons are found but not rendering in app:');
console.log('   • Check if `@fortawesome/fontawesome-svg-core/styles.css` is imported');
console.log('   • Ensure `<script src="https://kit.fontawesome.com/3e2951e127.js" />` is in layout.tsx');
console.log('   • Verify icon prop format: [`fas`, `user`]');
console.log('3. Share output with me if issues persist');
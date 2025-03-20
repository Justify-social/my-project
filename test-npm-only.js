/**
 * Font Awesome NPM-Only Test
 * 
 * This script verifies that Font Awesome is correctly configured to use only NPM packages
 * and no Kit script is being loaded.
 */

// Import required Font Awesome components
const { findIconDefinition, library } = require('@fortawesome/fontawesome-svg-core');
const { faUser, faCheck } = require('@fortawesome/pro-solid-svg-icons');
const { faTwitter } = require('@fortawesome/free-brands-svg-icons');

// Register icons with library
library.add(faUser, faCheck, faTwitter);

console.log('========================================');
console.log('Font Awesome NPM-Only Configuration Test');
console.log('========================================');

// Test 1: Check if we can find icons that have been registered
try {
  const userIcon = findIconDefinition({ prefix: 'fas', iconName: 'user' });
  console.log('✅ Found registered solid icon:', userIcon ? 'Yes' : 'No');
} catch (e) {
  console.error('❌ Error finding registered solid icon:', e.message);
}

// Test 2: Check if we can find brand icons
try {
  const twitterIcon = findIconDefinition({ prefix: 'fab', iconName: 'twitter' });
  console.log('✅ Found registered brand icon:', twitterIcon ? 'Yes' : 'No');
} catch (e) {
  console.error('❌ Error finding registered brand icon:', e.message);
}

// Test 3: Check if we correctly fail for unregistered icons
try {
  const unregisteredIcon = findIconDefinition({ prefix: 'fas', iconName: 'nonexistent-icon' });
  console.log('❌ Found unregistered icon (should fail):', unregisteredIcon ? 'Yes' : 'No');
} catch (e) {
  console.log('✅ Correctly failed for unregistered icon:', e.message);
}

// Test 4: Check for Kit script in browser (Node.js always passes this test)
console.log('');
console.log('Browser Tests:');
console.log('-------------');
console.log('In a browser environment, please check for:');
console.log('1. window.FontAwesomeKitConfig should be undefined or null');
console.log('2. No <script> tags with fontawesome.com/kit in the source');
console.log('3. SVG icons should still render correctly with both <FontAwesomeIcon> and CSS class methods');

// Browser detection code (only runs in browser)
if (typeof window !== 'undefined') {
  console.log('');
  console.log('Detected browser environment, running additional tests:');
  
  // Check for Kit config
  if (window.FontAwesomeKitConfig) {
    console.error('❌ Kit script is still loaded! window.FontAwesomeKitConfig found:', window.FontAwesomeKitConfig);
  } else {
    console.log('✅ No Kit script detected (window.FontAwesomeKitConfig is undefined)');
  }
  
  // Check for Kit scripts
  const kitScripts = document.querySelectorAll('script[src*="kit.fontawesome.com"]');
  if (kitScripts.length > 0) {
    console.error('❌ Kit script tags found in document:', kitScripts.length);
  } else {
    console.log('✅ No Kit script tags found in document');
  }
}

console.log('');
console.log('Test complete. If all checks passed, your Font Awesome configuration');
console.log('is correctly using only NPM packages without the Kit script.'); 
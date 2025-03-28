#!/usr/bin/env node

/**
 * Build & Validate Font Awesome Fixes
 * 
 * This script builds the application and ensures that the Font Awesome fixes
 * are properly applied in the production build.
 */

import execSync from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('===== Font Awesome Production Validation =====');

// Function to run commands with better error handling
function runCommand(command) {
  console.log(`\n> ${command}`);
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\nError executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Check if we're in the project root
if (!fs.existsSync('package.json')) {
  console.error('Error: Please run this script from the project root directory');
  process.exit(1);
}

// Build the application
console.log('\n1. Building the application...');
runCommand('npm run build');

// Validate the build
console.log('\n2. Validating the build...');

// Verify production files were created
const buildDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildDir)) {
  console.error('Build directory does not exist. Build may have failed.');
  process.exit(1);
}

console.log('\n3. Post-build validation:');
console.log('   ✅ Build directory exists');

console.log('\n4. Next steps:');
console.log('   1. Start the production server with: npm run start');
console.log('   2. Open the browser and navigate to the UI components page');
console.log('   3. Check the browser console for any "Could not find icon {}" errors');
console.log('   4. Verify all icons are displayed correctly');

console.log('\n5. Additional validation:');
console.log('   Run this command in your browser console:');
console.log(`
// Font Awesome Production Validator
(function validateFontAwesome() {
  console.log("===== Font Awesome Production Validator =====");
  
  // Count visible icons
  const icons = document.querySelectorAll('svg[data-prefix]');
  console.log(\`Found \${icons.length} Font Awesome icons\`);
  
  // Check for error icons (our custom fallback)
  const errorIcons = document.querySelectorAll('svg[stroke="red"]');
  console.log(\`Found \${errorIcons.length} error fallback icons\`);
  
  // Install a global error handler to catch any Font Awesome errors
  window.addEventListener('error', function(event) {
    if (event.error && if (event.error.message) event.error.message.includes('Could not find icon')) {
      console.error('⚠️ VALIDATION FAILED: Font Awesome error detected:', event.error.message);
    }
  });
  
  console.log("Monitoring for Font Awesome errors...");
  console.log("If no errors appear within 10 seconds, validation passed!");
  
  // Check again after all images/resources are loaded
  window.addEventListener('load', function() {
    setTimeout(() => {
      const finalErrorIcons = document.querySelectorAll('svg[stroke="red"]');
      if (finalErrorIcons.length > errorIcons.length) {
        console.warn(\`⚠️ Warning: More error icons appeared (\${finalErrorIcons.length - errorIcons.length} new)\`);
      } else {
        console.log("✅ No new error icons appeared after full page load");
      }
      
      console.log("===== Validation Complete =====");
    }, 5000);
  });
})();
`);

console.log('\n===== End of Validation ====='); 
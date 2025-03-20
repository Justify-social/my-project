#!/usr/bin/env node

// Font Awesome availability test
const fontAwesomeTest = async () => {
  console.log("🔍 Testing Font Awesome installation and configuration...");
  console.log("════════════════════════════════════════════════════════");
  
  try {
    // Test 1: Check if the Pro Kit is installed
    try {
      const kitPath = require.resolve('@awesome.me/kit-3e2951e127');
      console.log("✅ Pro Kit installed at:", kitPath);
    } catch (e) {
      console.error("❌ Pro Kit not found. Is it installed?", e.message);
      console.log("   Run: npm install @awesome.me/kit-3e2951e127");
    }
    
    // Test 2: Check core package
    try {
      const core = require('@fortawesome/fontawesome-svg-core');
      console.log("✅ Core package installed:", core.version);
    } catch (e) {
      console.error("❌ Core package not found:", e.message);
    }
    
    // Test 3: Check React component
    try {
      const reactFA = require('@fortawesome/react-fontawesome');
      console.log("✅ React component package installed");
    } catch (e) {
      console.error("❌ React component package not found:", e.message);
    }
    
    // Test 4: Check individual icon packages
    const iconPackages = [
      { name: 'Pro Light', path: '@fortawesome/pro-light-svg-icons' },
      { name: 'Pro Regular', path: '@fortawesome/pro-regular-svg-icons' },
      { name: 'Pro Solid', path: '@fortawesome/pro-solid-svg-icons' }, 
      { name: 'Free Brands', path: '@fortawesome/free-brands-svg-icons' }
    ];
    
    for (const pkg of iconPackages) {
      try {
        const iconModule = require(pkg.path);
        const iconCount = Object.keys(iconModule).filter(key => key.startsWith('fa')).length;
        console.log(`✅ ${pkg.name} package installed: ${iconCount} icons available`);
      } catch (e) {
        console.error(`❌ ${pkg.name} package not found:`, e.message);
      }
    }
    
    // Test 5: Check token in .npmrc 
    const fs = require('fs');
    const path = require('path');
    
    try {
      const npmrcPath = path.resolve(process.cwd(), '.npmrc');
      if (fs.existsSync(npmrcPath)) {
        const content = fs.readFileSync(npmrcPath, 'utf8');
        if (content.includes('@awesome.me:registry=https://npm.fontawesome.com/')) {
          console.log("✅ .npmrc contains Font Awesome registry entry");
        } else {
          console.error("❌ .npmrc missing Font Awesome registry entry");
        }
        
        if (content.includes('//npm.fontawesome.com/:_authToken=')) {
          console.log("✅ .npmrc contains Font Awesome auth token");
          // Check if token looks valid (not just a placeholder)
          const tokenMatch = content.match(/\/\/npm\.fontawesome\.com\/\:_authToken=([A-Z0-9-]+)/);
          if (tokenMatch && tokenMatch[1].length < 10) {
            console.warn("⚠️ Auth token looks suspicious (very short)");
          }
        } else {
          console.error("❌ .npmrc missing Font Awesome auth token");
        }
      } else {
        console.error("❌ .npmrc file not found");
      }
    } catch (e) {
      console.error("❌ Error checking .npmrc:", e.message);
    }

    // Test 6: Verify that we can load specific icons (not just the packages)
    const testIcons = [
      { name: 'Light user', path: '@fortawesome/pro-light-svg-icons', icon: 'faUser' },
      { name: 'Solid user', path: '@fortawesome/pro-solid-svg-icons', icon: 'faUser' },
      { name: 'Brand twitter', path: '@fortawesome/free-brands-svg-icons', icon: 'faTwitter' }
    ];
    
    for (const iconTest of testIcons) {
      try {
        const iconModule = require(iconTest.path);
        const iconObj = iconModule[iconTest.icon];
        if (iconObj) {
          console.log(`✅ Successfully loaded ${iconTest.name} icon`);
        } else {
          console.error(`❌ ${iconTest.name} icon not found in package`);
        }
      } catch (e) {
        console.error(`❌ Error loading ${iconTest.name} icon:`, e.message);
      }
    }
    
    console.log("\n📋 Font Awesome Configuration Analysis:");
    console.log("────────────────────────────────────────");
    
    // Check for common problems in the codebase based on investigation
    console.log("\n1. If icons aren't rendering visually, check that:");
    console.log("   • Your layout.tsx has the script tag for the FA Kit");
    console.log("   • Not using conflicting import methods (kit + direct imports)");
    console.log("   • Add this to your layout.tsx if icons look broken or have wrong styles:");
    console.log("     import '@fortawesome/fontawesome-svg-core/styles.css';\n");
    
    console.log("2. If API calls like findIconDefinition fail, but icons render:");
    console.log("   • This is the 'dual-loading' scenario - it's normal with Pro Kit");
    console.log("   • Don't change your icon names from camelCase to kebab-case");
    console.log("   • The updated diagnostic tool will show 'Degraded' instead of 'Failing'\n");
    
    console.log("3. For icon mapping problems:");
    console.log("   • Ensure icon names in icon-mappings.ts match Font Awesome names");
    console.log("   • Some icons need to be kebab-case in the mapping functions");
    console.log("   • Example: 'chevronUp' should be mapped to 'chevron-up' internally\n");
  } catch (e) {
    console.error("❌ Unexpected error during Font Awesome tests:", e);
  }
};

fontAwesomeTest().catch(console.error); 
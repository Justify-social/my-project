#!/usr/bin/env node

/**
 * Font Awesome Diagnostic Tool
 * 
 * This advanced diagnostic tool helps identify and fix Font Awesome icon issues by:
 * 1. Testing package installation and configuration
 * 2. Verifying icon registration and visibility
 * 3. Detecting icon mapping issues in the codebase
 * 4. Testing actual rendering of specific problematic icons
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Font Awesome comprehensive test
const fontAwesomeTest = async () => {
  console.log("\n🔍 FONT AWESOME COMPREHENSIVE DIAGNOSTIC TOOL");
  console.log("══════════════════════════════════════════════\n");
  
  // Track found issues
  const issues = [];
  
  try {
    // SECTION 1: PACKAGE INSTALLATION
    console.log("SECTION 1: PACKAGE INSTALLATION & CONFIGURATION");
    console.log("──────────────────────────────────────────────────");
    
    // Test 1: Check if the Pro Kit is installed
    try {
      const kitPath = require.resolve('@awesome.me/kit-3e2951e127');
      console.log("✅ Pro Kit installed at:", kitPath);
    } catch (e) {
      const issue = "❌ Pro Kit not found. Installation may be required";
      issues.push(issue);
      console.error(issue);
      console.log("   Run: npm install @awesome.me/kit-3e2951e127");
    }
    
    // Test 2: Check core package
    try {
      const core = require('@fortawesome/fontawesome-svg-core');
      console.log("✅ Core package installed:", core.version);
    } catch (e) {
      const issue = "❌ Core package not found";
      issues.push(issue);
      console.error(issue, e.message);
    }
    
    // Test 3: Check React component
    try {
      const reactFA = require('@fortawesome/react-fontawesome');
      console.log("✅ React component package installed");
    } catch (e) {
      const issue = "❌ React component package not found";
      issues.push(issue);
      console.error(issue, e.message);
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
        const issue = `❌ ${pkg.name} package not found`;
        issues.push(issue);
        console.error(issue, e.message);
      }
    }
    
    // Test 5: Check token in .npmrc 
    try {
      const npmrcPath = path.resolve(process.cwd(), '.npmrc');
      if (fs.existsSync(npmrcPath)) {
        const content = fs.readFileSync(npmrcPath, 'utf8');
        if (content.includes('@awesome.me:registry=https://npm.fontawesome.com/')) {
          console.log("✅ .npmrc contains Font Awesome registry entry");
        } else {
          const issue = "❌ .npmrc missing Font Awesome registry entry";
          issues.push(issue);
          console.error(issue);
        }
        
        if (content.includes('//npm.fontawesome.com/:_authToken=')) {
          console.log("✅ .npmrc contains Font Awesome auth token");
          // Check if token looks valid (not just a placeholder)
          const tokenMatch = content.match(/\/\/npm\.fontawesome\.com\/\:_authToken=([A-Z0-9-]+)/);
          if (tokenMatch && tokenMatch[1].length < 10) {
            const issue = "⚠️ Auth token looks suspicious (very short)";
            issues.push(issue);
            console.warn(issue);
          }
        } else {
          const issue = "❌ .npmrc missing Font Awesome auth token";
          issues.push(issue);
          console.error(issue);
        }
      } else {
        const issue = "❌ .npmrc file not found";
        issues.push(issue);
        console.error(issue);
      }
    } catch (e) {
      const issue = "❌ Error checking .npmrc";
      issues.push(issue);
      console.error(issue, e.message);
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
          const issue = `❌ ${iconTest.name} icon not found in package`;
          issues.push(issue);
          console.error(issue);
        }
      } catch (e) {
        const issue = `❌ Error loading ${iconTest.name} icon`;
        issues.push(issue);
        console.error(issue, e.message);
      }
    }

    console.log("\n");
    
    // SECTION 2: CODE INSPECTION
    console.log("SECTION 2: CODE INSPECTION");
    console.log("──────────────────────────");
    
    // Check icon.tsx for correct imports and registrations
    try {
      const iconTsxPath = path.resolve(process.cwd(), 'src/components/ui/icon.tsx');
      if (fs.existsSync(iconTsxPath)) {
        const iconTsx = fs.readFileSync(iconTsxPath, 'utf8');
        
        console.log("Analyzing icon.tsx file:");
        
        // Check for proper CSS import
        if (iconTsx.includes('@fortawesome/fontawesome-svg-core/styles.css')) {
          console.log("✅ Font Awesome CSS styles are properly imported");
        } else {
          const issue = "❌ Missing Font Awesome CSS import in icon.tsx";
          issues.push(issue);
          console.error(issue);
        }
        
        // Check for autoAddCss = false setting
        if (iconTsx.includes('config.autoAddCss = false')) {
          console.log("✅ Font Awesome autoAddCss configuration is set correctly");
        } else {
          const issue = "⚠️ Missing 'autoAddCss = false', may cause styling conflicts";
          issues.push(issue);
          console.warn(issue);
        }

        // Extract library.add() call and analyze
        const libraryAddMatch = iconTsx.match(/library\.add\(\s*([\s\S]*?)\s*\)/);
        if (libraryAddMatch) {
          const libraryAddContent = libraryAddMatch[1];
          // Count the number of icons registered
          const iconCount = (libraryAddContent.match(/fa[A-Za-z]+/g) || []).length;
          console.log(`✅ Found library.add() with approximately ${iconCount} icons registered`);
          
          // Check for problematic icons from the screenshot
          const problematicIcons = ['circleCheck', 'chatBubble', 'warning', 'delete', 'edit', 'info', 
                                     'grid', 'menu', 'document', 'documentText', 'chart',
                                     'money', 'trendUp', 'trendDown', 'lightning', 'bellAlert',
                                     'arrowLeft', 'arrowRight', 'arrowUp', 'arrowDown', 'xCircle',
                                     'checkCircle', 'magnifyingGlassPlus', 'swatch',
                                     'creditCard', 'presentationChartBar', 'tableCells'];
          
          // Check each problematic icon
          const missingIcons = [];
          for (const icon of problematicIcons) {
            // Check for pattern faIcon
            const iconPattern = new RegExp(`fa${icon}[,\\s]`);
            // Also check for pattern fa${icon} with first letter capitalized
            const capitalizedPattern = new RegExp(`fa${icon.charAt(0).toUpperCase() + icon.slice(1)}[,\\s]`);
            
            if (!iconPattern.test(libraryAddContent) && !capitalizedPattern.test(libraryAddContent)) {
              missingIcons.push(icon);
            }
          }
          
          if (missingIcons.length > 0) {
            const issue = `❌ These icons appear to be missing from library.add(): ${missingIcons.join(', ')}`;
            issues.push(issue);
            console.error(issue);
          } else {
            console.log("✅ All problematic icons from the screenshot appear to be registered");
          }
        } else {
          const issue = "❌ Could not find library.add() call in icon.tsx";
          issues.push(issue);
          console.error(issue);
        }

        // Check for icon aliases
        const aliasRegex = /const\s+(fa[A-Za-z]+)\s+=\s+(fa[A-Za-z]+)/g;
        let match;
        const aliases = [];
        while ((match = aliasRegex.exec(iconTsx)) !== null) {
          aliases.push({ alias: match[1], original: match[2] });
        }
        
        console.log(`✅ Found ${aliases.length} icon aliases`);
        
        // Check for specific problematic aliases
        const requiredAliases = {
          'faClose': 'faXmark',
          'faMail': 'faEnvelope',
          'faDocument': 'faFile',
          'faDocumentText': 'faFileLines',
          'faEdit': 'faPenToSquare',
          'faView': 'faEye',
          'faDelete': 'faTrashCan',
          'faChatBubble': 'faCommentDots',
          'faGrid': 'faTableCells',
          'faMenu': 'faBars',
          'faXCircle': 'faCircleXmark',
          'faCheckCircle': 'faCircleCheck',
          'faSwatch': 'faPalette',
          'faPresentationChartBar': 'faChartLine'
        };
        
        const missingAliases = Object.entries(requiredAliases)
          .filter(([alias, original]) => 
            !aliases.some(a => a.alias === alias && a.original === original))
          .map(([alias, original]) => `${alias} = ${original}`);
          
        if (missingAliases.length > 0) {
          const issue = `❌ Missing important aliases: ${missingAliases.join(', ')}`;
          issues.push(issue);
          console.error(issue);
        } else {
          console.log("✅ All important aliases are defined");
        }
        
        // Check for light (fal) aliases too
        const lightAliasRegex = /const\s+(fal[A-Za-z]+)\s+=\s+(fal[A-Za-z]+)/g;
        let lightMatch;
        const lightAliases = [];
        while ((lightMatch = lightAliasRegex.exec(iconTsx)) !== null) {
          lightAliases.push({ alias: lightMatch[1], original: lightMatch[2] });
        }
        
        console.log(`✅ Found ${lightAliases.length} light icon aliases`);
      } else {
        const issue = "❌ Could not find icon.tsx file";
        issues.push(issue);
        console.error(issue);
      }
    } catch (e) {
      const issue = "❌ Error analyzing icon.tsx";
      issues.push(issue);
      console.error(issue, e.message);
    }
    
    // Check icon-mappings.ts for proper mappings
    try {
      const iconMappingsPath = path.resolve(process.cwd(), 'src/lib/icon-mappings.ts');
      if (fs.existsSync(iconMappingsPath)) {
        const iconMappings = fs.readFileSync(iconMappingsPath, 'utf8');
        
        console.log("\nAnalyzing icon-mappings.ts file:");
        
        // Check for key UI icon mappings
        const mappingRegex = /getIcon\('([^']+)',\s*'([^']+)'\)/g;
        let mappingMatch;
        const mappings = [];
        
        while ((mappingMatch = mappingRegex.exec(iconMappings)) !== null) {
          mappings.push({ name: mappingMatch[1], style: mappingMatch[2] });
        }
        
        console.log(`✅ Found ${mappings.length} icon mappings`);
        
        // Key Font Awesome names that need to be mapped correctly
        const criticalMappings = [
          { uiName: 'circle-check', faName: 'circle-check' },
          { uiName: 'comment-dots', faName: 'comment-dots' },
          { uiName: 'triangle-exclamation', faName: 'triangle-exclamation' },
          { uiName: 'trash-can', faName: 'trash-can' },
          { uiName: 'pen-to-square', faName: 'pen-to-square' },
          { uiName: 'circle-info', faName: 'circle-info' },
          { uiName: 'table-cells', faName: 'table-cells' },
          { uiName: 'bars', faName: 'bars' },
          { uiName: 'file', faName: 'file' },
          { uiName: 'file-lines', faName: 'file-lines' },
          { uiName: 'chart-bar', faName: 'chart-bar' },
          { uiName: 'money-bill', faName: 'money-bill' },
          { uiName: 'arrow-trend-up', faName: 'arrow-trend-up' },
          { uiName: 'arrow-trend-down', faName: 'arrow-trend-down' },
          { uiName: 'bolt', faName: 'bolt' },
          { uiName: 'bell-slash', faName: 'bell-slash' },
          { uiName: 'arrow-left', faName: 'arrow-left' },
          { uiName: 'arrow-right', faName: 'arrow-right' },
          { uiName: 'arrow-up', faName: 'arrow-up' },
          { uiName: 'arrow-down', faName: 'arrow-down' },
          { uiName: 'circle-xmark', faName: 'circle-xmark' },
          { uiName: 'circle-check', faName: 'circle-check' },
          { uiName: 'magnifying-glass-plus', faName: 'magnifying-glass-plus' },
          { uiName: 'palette', faName: 'palette' },
          { uiName: 'credit-card', faName: 'credit-card' },
          { uiName: 'chart-line', faName: 'chart-line' },
          { uiName: 'table', faName: 'table' }
        ];
        
        const missingMappings = criticalMappings.filter(
          mapping => !mappings.some(m => m.name === mapping.faName)
        );
        
        if (missingMappings.length > 0) {
          const issue = `❌ Missing critical icon mappings: ${missingMappings.map(m => m.faName).join(', ')}`;
          issues.push(issue);
          console.error(issue);
        } else {
          console.log("✅ All critical icon mappings are present");
        }
        
        // Check how the mappings are being used (are the UI properties correct?)
        if (iconMappings.includes('FA_UI_ICON_MAP')) {
          console.log("✅ FA_UI_ICON_MAP is defined");
        } else {
          const issue = "❌ FA_UI_ICON_MAP is missing";
          issues.push(issue);
          console.error(issue);
        }
        
        if (iconMappings.includes('FA_UI_OUTLINE_ICON_MAP')) {
          console.log("✅ FA_UI_OUTLINE_ICON_MAP is defined");
        } else {
          const issue = "❌ FA_UI_OUTLINE_ICON_MAP is missing";
          issues.push(issue);
          console.error(issue);
        }
      } else {
        const issue = "❌ Could not find icon-mappings.ts file";
        issues.push(issue);
        console.error(issue);
      }
    } catch (e) {
      const issue = "❌ Error analyzing icon-mappings.ts";
      issues.push(issue);
      console.error(issue, e.message);
    }
    
    // Check IconTester.tsx for possible issues
    try {
      const iconTesterPath = path.resolve(process.cwd(), 'src/components/ui/IconTester.tsx');
      if (fs.existsSync(iconTesterPath)) {
        const iconTesterContent = fs.readFileSync(iconTesterPath, 'utf8');
        
        console.log("\nAnalyzing IconTester.tsx:");
        
        // Check if IconTester is handling undefined icons correctly
        if (iconTesterContent.includes('name && (')) {
          console.log("✅ IconTester appears to check for undefined names before rendering");
        } else {
          const issue = "⚠️ IconTester may not be guarding against undefined icon names";
          issues.push(issue);
          console.warn(issue);
        }
        
        // Look for empty object rendering attempts
        const suspiciousPatterns = [
          /Icon\s+name=\{\s*\}/,
          /name\s+=\s+\{\s*\}/,
          /Icon\s+name=\{[^}]*undefined[^}]*\}/
        ];
        
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(iconTesterContent)) {
            const issue = "⚠️ Found suspicious pattern in IconTester that may cause empty object errors";
            issues.push(issue);
            console.warn(issue);
            break;
          }
        }
      } else {
        console.log("ℹ️ IconTester.tsx not found (not a critical issue)");
      }
    } catch (e) {
      console.error("Error analyzing IconTester.tsx:", e.message);
    }

    console.log("\n");
    
    // SECTION 3: COMMON ICON PROBLEMS DIAGNOSIS
    console.log("SECTION 3: SPECIFIC ICON ISSUES");
    console.log("────────────────────────────────");
    
    // Analyze the console errors from the screenshot
    console.log("Analyzing reported console errors:");
    console.log("1. 'Error: Could not find icon undefined'");
    console.log("   This likely indicates the component is being passed an undefined icon name");
    console.log("   Check the Icon component for proper null/undefined guards");
    
    console.log("\n2. 'Error: Could not find icon {}'");
    console.log("   This suggests an empty object is being passed as an icon prop");
    console.log("   Check the IconTester component for proper icon name validation");
    
    console.log("\nVisibly missing icons from screenshot:");
    console.log("- Look at red question mark icons, which indicate missing mappings or registrations");
    console.log("- circleCheck, chatBubble, warning, info, menu, view, etc.");
    console.log("- These might need proper icon registration or corrected mappings");
    
    // SECTION 4: SOLUTIONS
    console.log("\n");
    console.log("SECTION 4: RECOMMENDED SOLUTIONS");
    console.log("───────────────────────────────");
    
    if (issues.length === 0) {
      console.log("✅ No critical issues found! If icons still aren't rendering, check browser console for errors");
    } else {
      console.log(`⚠️ Found ${issues.length} issues that may be causing icon rendering problems:`);
      
      // Group issues by type for more useful recommendations
      const importIssues = issues.filter(i => i.includes('import'));
      const mappingIssues = issues.filter(i => i.includes('mapping'));
      const aliasIssues = issues.filter(i => i.includes('alias'));
      const registrationIssues = issues.filter(i => i.includes('registration') || i.includes('library.add'));
      
      if (importIssues.length > 0) {
        console.log("\n1. Fix Icon Import Issues:");
        importIssues.forEach(issue => console.log(`   - ${issue}`));
        console.log("   Solution: Ensure proper imports in icon.tsx including CSS styles");
      }
      
      if (mappingIssues.length > 0) {
        console.log("\n2. Fix Icon Mapping Issues:");
        mappingIssues.forEach(issue => console.log(`   - ${issue}`));
        console.log("   Solution: Update icon-mappings.ts with correct mappings for all required icons");
      }
      
      if (aliasIssues.length > 0) {
        console.log("\n3. Fix Icon Alias Issues:");
        aliasIssues.forEach(issue => console.log(`   - ${issue}`));
        console.log("   Solution: Add missing aliases in icon.tsx to handle naming variations");
      }
      
      if (registrationIssues.length > 0) {
        console.log("\n4. Fix Icon Registration Issues:");
        registrationIssues.forEach(issue => console.log(`   - ${issue}`));
        console.log("   Solution: Ensure all icons are properly registered with library.add()");
      }
    }
    
    console.log("\nAdditional Troubleshooting Steps:");
    console.log("1. Fix undefined/empty object errors in the IconTester component:");
    console.log("   • Add proper guards: {name && <Icon name={name} />}");
    console.log("   • Check types for icon names (use 'as const' for type safety)");
    
    console.log("\n2. Check for naming discrepancies between components:");
    console.log("   • UI_ICON_MAP uses camelCase (e.g., 'circleCheck')");
    console.log("   • getIcon() uses kebab-case (e.g., 'circle-check')");
    console.log("   • Ensure these are consistently mapped");
    
    console.log("\n3. Add more explicit error handling in the Icon component:");
    console.log("   • Wrap FontAwesomeIcon in a try/catch block");
    console.log("   • Log specific icon names that fail to render");
    
    console.log("\n4. Rebuild and clear caches:");
    console.log("   • Run: npm run build");
    console.log("   • Clear browser cache and reload");
    
    console.log("\n5. Test with the browser's network tab open:");
    console.log("   • Look for 401/403 errors related to Font Awesome");
    console.log("   • Ensure the Font Awesome kit JS is loading correctly");

    // SECTION 5: VISUAL TEST GENERATION
    console.log("\n");
    console.log("SECTION 5: VISUAL TEST GENERATION");
    console.log("────────────────────────────────");
    
    // Generate an HTML test file to visually check icons
    const htmlPath = path.resolve(process.cwd(), 'font-awesome-test.html');
    
    try {
      // Collect all the problematic icons we want to test visually
      const iconsToTest = [
        'circleCheck', 'chatBubble', 'warning', 'info', 'menu', 'view', 
        'grid', 'delete', 'document', 'documentText', 'chart', 'chartPie',
        'money', 'trendUp', 'trendDown', 'lightning', 'userGroup', 'bellAlert', 
        'map', 'shield', 'clock', 'arrowDown', 'arrowUp', 'arrowRight', 
        'arrowLeft', 'xCircle', 'checkCircle', 'magnifyingGlassPlus', 
        'swatch', 'creditCard', 'presentationChartBar', 'tableCells'
      ];
      
      // Generate HTML that uses Font Awesome icons directly for testing
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Font Awesome Icon Test</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <!-- Import Font Awesome Styles -->
        <script src="https://kit.fontawesome.com/your-kit-code.js" crossorigin="anonymous"></script>
        <style>
          .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
          }
          .icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          .icon-display {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .missing {
            color: red;
            border-color: red;
          }
        </style>
      </head>
      <body class="p-8 bg-gray-50">
        <h1 class="text-2xl font-bold mb-6">Font Awesome Icon Test</h1>
        
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Icon Test</h2>
          <div class="icon-grid">
            ${iconsToTest.map(iconName => `
              <div class="icon-item">
                <div class="icon-display">
                  <i class="fas fa-${iconName.replace(/([A-Z])/g, "-$1").toLowerCase()}"></i>
                </div>
                <span class="text-sm text-gray-700">${iconName}</span>
                <span class="text-xs text-gray-500">fa-${iconName.replace(/([A-Z])/g, "-$1").toLowerCase()}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div>
          <h2 class="text-xl font-semibold mb-4">Light Icon Test</h2>
          <div class="icon-grid">
            ${iconsToTest.map(iconName => `
              <div class="icon-item">
                <div class="icon-display">
                  <i class="fal fa-${iconName.replace(/([A-Z])/g, "-$1").toLowerCase()}"></i>
                </div>
                <span class="text-sm text-gray-700">${iconName}</span>
                <span class="text-xs text-gray-500">fa-${iconName.replace(/([A-Z])/g, "-$1").toLowerCase()}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
      `;
      
      // Write the HTML file
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ Generated visual test HTML file at: ${htmlPath}`);
      console.log('   Open this file in a browser to visually inspect icons');
    } catch (e) {
      console.error("❌ Error generating visual test HTML file:", e.message);
    }
  } catch (e) {
    console.error("❌ Unexpected error during Font Awesome tests:", e);
  }
};

fontAwesomeTest().catch(console.error); 
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Verify Icons Script
 * 
 * This script verifies that all icons referenced in the icon-data.ts file
 * are properly downloaded and accessible in the filesystem.
 * 
 * Usage:
 *   node scripts/verify-icons.js
 */

// ANSI color codes for colorful output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

console.log(`${colors.bright}${colors.blue}🔍 Icon System Verification${colors.reset}\n`);

// Function to verify icons
async function verifyIcons() {
  let iconData;
  
  try {
    // Try to read the icon-data.ts file to parse icon URLs
    const iconDataPath = path.join(process.cwd(), 'src', 'components', 'ui', 'icons', 'icon-data.ts');
    const fileContent = fs.readFileSync(iconDataPath, 'utf8');
    
    // Extract the URL paths using regex
    const urlRegex = /"url":\s*"([^"]+)"/g;
    const matches = [...fileContent.matchAll(urlRegex)];
    
    console.log(`${colors.cyan}Found ${matches.length} icon references in icon-data.ts${colors.reset}`);
    
    // Check each URL to verify file exists
    let missingFiles = 0;
    let existingFiles = 0;
    
    for (const match of matches) {
      const url = match[1];
      const filePath = path.join(process.cwd(), 'public', url);
      
      if (fs.existsSync(filePath)) {
        existingFiles++;
      } else {
        missingFiles++;
        console.log(`${colors.red}❌ Missing file: ${url}${colors.reset}`);
      }
    }
    
    // Summary
    console.log(`\n${colors.cyan}📊 Verification Summary:${colors.reset}`);
    console.log(`${colors.green}✅ Accessible icons: ${existingFiles}${colors.reset}`);
    
    if (missingFiles > 0) {
      console.log(`${colors.red}❌ Missing icons: ${missingFiles}${colors.reset}`);
      console.log(`\n${colors.yellow}Run 'npm run update-icons' to download missing icons.${colors.reset}`);
    } else {
      console.log(`\n${colors.green}🎉 All icons are properly installed and accessible!${colors.reset}`);
    }
    
    // Check light/solid differentiation
    console.log(`\n${colors.cyan}Checking light/solid differentiation...${colors.reset}`);
    const lightDir = path.join(process.cwd(), 'public', 'ui-icons', 'light');
    const solidDir = path.join(process.cwd(), 'public', 'ui-icons', 'solid');
    
    if (fs.existsSync(lightDir) && fs.existsSync(solidDir)) {
      const lightFiles = fs.readdirSync(lightDir).filter(f => f.endsWith('.svg'));
      const solidFiles = fs.readdirSync(solidDir).filter(f => f.endsWith('.svg'));
      
      console.log(`Light icons: ${lightFiles.length}`);
      console.log(`Solid icons: ${solidFiles.length}`);
      
      // Check for any duplicate light/solid icons
      try {
        const output = execSync('node scripts/audit-icons.js --verbose', { encoding: 'utf8' });
        if (output.includes('duplicate light/solid icon pairs')) {
          console.log(`${colors.yellow}⚠️ Some light and solid icons may be too similar.${colors.reset}`);
          console.log(`${colors.yellow}Run 'node scripts/audit-icons.js --fix-duplicates' to fix this issue.${colors.reset}`);
        } else {
          console.log(`${colors.green}✅ Light and solid icons are properly differentiated.${colors.reset}`);
        }
      } catch (e) {
        console.log(`${colors.yellow}⚠️ Could not check light/solid differentiation.${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ Icon directories not found. Run 'npm run update-icons'.${colors.reset}`);
    }
    
    return existingFiles;
  } catch (e) {
    console.error(`${colors.red}Error verifying icons: ${e.message}${colors.reset}`);
    return 0;
  }
}

// Run the verification
verifyIcons()
  .then(count => {
    console.log(`\n${colors.bright}${colors.green}Icon verification complete!${colors.reset}`);
    if (count === 0) {
      console.log(`${colors.yellow}⚠️ No icons were verified. Make sure to run 'npm run update-icons' first.${colors.reset}`);
    }
  })
  .catch(err => {
    console.error(`${colors.red}Verification failed: ${err.message}${colors.reset}`);
    process.exit(1);
  }); 
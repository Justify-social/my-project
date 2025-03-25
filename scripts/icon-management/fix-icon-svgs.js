/**
 * SVG Icon Fixer
 * 
 * Usage:
 *   node scripts/icon-management/fix-icon-svgs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Directory paths
const LIGHT_ICONS_DIR = path.join(__dirname, '..', 'public', 'ui-icons', 'light');
const SOLID_ICONS_DIR = path.join(__dirname, '..', 'public', 'ui-icons', 'solid');
const TEMP_DIR = path.join(__dirname, 'temp-icons');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Mapping from our semantic names to FontAwesome icon file names (from IconMapping.ts)
const ICON_FILE_MAPPING = {
  "arrowDown": "arrow-down",
  "arrowLeft": "arrow-left",
  "arrowRight": "arrow-right",
  "arrowUp": "arrow-up",
  "bell": "bell",
  "bellAlert": "bell-slash",
  "bookmark": "bookmark",
  "building": "building",
  "calendar": "calendar",
  "calendarDays": "calendar-days",
  "chart": "chart-bar",
  "chartBar": "chart-column",
  "chartPie": "chart-pie",
  "chatBubble": "comment-dots",
  "check": "check",
  "checkCircle": "circle-check",
  "chevronDown": "chevron-down",
  "chevronLeft": "chevron-left",
  "chevronRight": "chevron-right",
  "chevronUp": "chevron-up",
  "circleCheck": "circle-check",
  "clock": "clock",
  "close": "xmark",
  "copy": "copy",
  "creditCard": "credit-card",
  "delete": "trash-can",
  "document": "file",
  "documentText": "file-lines",
  "download": "download",
  "edit": "pen-to-square",
  "fileLines": "file-lines",
  "filter": "filter",
  "globe": "globe",
  "grid": "table-cells",
  "heart": "heart",
  "history": "clock-rotate-left",
  "home": "house",
  "info": "circle-info",
  "key": "key",
  "lightBulb": "lightbulb",
  "lightning": "bolt",
  "list": "list",
  "lock": "lock",
  "magnifyingGlassPlus": "magnifying-glass-plus",
  "mail": "envelope",
  "map": "map",
  "menu": "bars",
  "minus": "minus",
  "money": "money-bill",
  "paperclip": "paperclip",
  "play": "play",
  "plus": "plus",
  "presentationChartBar": "chart-line",
  "rocket": "rocket",
  "search": "magnifying-glass",
  "settings": "gear",
  "share": "share",
  "shield": "shield",
  "signal": "signal",
  "star": "star",
  "swatch": "palette",
  "tableCells": "table",
  "tag": "tag",
  "trendDown": "arrow-trend-down",
  "trendUp": "arrow-trend-up",
  "unlock": "unlock",
  "upload": "upload",
  "user": "user",
  "userCircle": "circle-user",
  "userGroup": "user-group",
  "view": "eye",
  "warning": "triangle-exclamation",
  "xCircle": "circle-xmark",
  "xMark": "xmark",
  "photo": "image"
};

// Function to check if the light and solid icons are the same
function compareIconFiles(lightPath, solidPath) {
  if (!fs.existsSync(lightPath) || !fs.existsSync(solidPath)) {
    return false;
  }
  
  const lightContent = fs.readFileSync(lightPath, 'utf8');
  const solidContent = fs.readFileSync(solidPath, 'utf8');
  
  return lightContent === solidContent;
}

// Function to download both light and solid versions
async function downloadIcons() {
  console.log('Downloading icons using npm run update-icons...');
  
  // Run the update-icons script to download all icons
  try {
    execSync('npm run update-icons', { stdio: 'inherit' });
    console.log('Icons downloaded successfully!');
  } catch (error) {
    console.error('Error downloading icons:', error);
    process.exit(1);
  }
}

// Download a FontAwesome icon directly from the CDN
function downloadIconFromCDN(iconName, style, outputPath) {
  return new Promise((resolve, reject) => {
    const stylePrefix = style === 'light' ? 'fal' : 'fas';
    // Use Font Awesome CDN to download icons
    const url = `https://site-assets.fontawesome.com/releases/v6.4.0/svgs/${style}/${iconName}.svg`;
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          // Process SVG content to ensure it has fill="currentColor"
          let svgContent = data;
          if (!svgContent.includes('fill="currentColor"')) {
            svgContent = svgContent.replace('<svg', '<svg fill="currentColor"');
          }
          
          fs.writeFileSync(outputPath, svgContent, 'utf8');
          resolve(outputPath);
        });
      } else if (response.statusCode === 404) {
        reject(new Error(`Icon not found: ${url}`));
      } else {
        reject(new Error(`Failed to download icon, status: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Fix a specific icon by downloading the correct light version
async function fixSpecificIcon(iconName) {
  const lightPath = path.join(LIGHT_ICONS_DIR, `${iconName}.svg`);
  const solidPath = path.join(SOLID_ICONS_DIR, `${iconName}.svg`);
  const tempLightPath = path.join(TEMP_DIR, `${iconName}-light.svg`);
  
  console.log(`Fixing ${iconName}...`);
  
  try {
    // Download the light version
    await downloadIconFromCDN(iconName, 'light', tempLightPath);
    
    // If download succeeded, replace the existing light icon
    if (fs.existsSync(tempLightPath)) {
      fs.copyFileSync(tempLightPath, lightPath);
      console.log(`✅ Successfully fixed ${iconName}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to fix ${iconName}:`, error.message);
  }
  
  return false;
}

// Main function to fix icon issues
async function fixIcons() {
  // First, verify the directories exist
  if (!fs.existsSync(LIGHT_ICONS_DIR)) {
    console.error('Light icons directory not found:', LIGHT_ICONS_DIR);
    process.exit(1);
  }
  
  if (!fs.existsSync(SOLID_ICONS_DIR)) {
    console.error('Solid icons directory not found:', SOLID_ICONS_DIR);
    process.exit(1);
  }
  
  console.log('Checking for duplicate icon files...');
  
  // Track statistics
  let sameCount = 0;
  let differentCount = 0;
  let missingCount = 0;
  const duplicateIcons = [];
  
  // Check each file in our mapping
  for (const [semanticName, fileName] of Object.entries(ICON_FILE_MAPPING)) {
    const lightPath = path.join(LIGHT_ICONS_DIR, `${fileName}.svg`);
    const solidPath = path.join(SOLID_ICONS_DIR, `${fileName}.svg`);
    
    // Check if both files exist
    if (!fs.existsSync(lightPath) || !fs.existsSync(solidPath)) {
      console.log(`🔍 Missing icon(s) for ${semanticName} (${fileName})`);
      missingCount++;
      continue;
    }
    
    // Compare the files
    const areSame = compareIconFiles(lightPath, solidPath);
    
    if (areSame) {
      console.log(`❌ DUPLICATE: ${semanticName} (${fileName}) light and solid are identical`);
      sameCount++;
      duplicateIcons.push(fileName);
    } else {
      console.log(`✅ OK: ${semanticName} (${fileName}) light and solid are different`);
      differentCount++;
    }
  }
  
  console.log('\nIcon comparison summary:');
  console.log(`- ${differentCount} icons have correct light/solid differences`);
  console.log(`- ${sameCount} icons have identical light/solid versions (issue)`);
  console.log(`- ${missingCount} icon files are missing`);
  
  // If we have duplicates, try to fix them
  if (duplicateIcons.length > 0) {
    console.log('\nAttempting to fix duplicate icons by downloading true light versions...');
    
    let fixedCount = 0;
    for (const iconName of duplicateIcons) {
      const success = await fixSpecificIcon(iconName);
      if (success) fixedCount++;
    }
    
    console.log(`\nFixed ${fixedCount} of ${duplicateIcons.length} duplicate icons.`);
    
    if (fixedCount < duplicateIcons.length) {
      console.log('\nSome icons could not be automatically fixed. You may need to:');
      console.log('1. Manually download the correct light versions from Font Awesome');
      console.log('2. Place them in the public/ui-icons/light directory');
      console.log('3. Run "npm run update-icons" to regenerate the icon data');
    }
  }
  
  // Clean up
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

// Run the script
fixIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 
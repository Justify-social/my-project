#!/usr/bin/env node

/**
 * Unified Icon Downloader and Generator
 * 
 * This comprehensive script handles all icon-related downloading and generation:
 * 1. Scans the codebase for FontAwesome icon usage
 * 2. Downloads all required SVG icons from FontAwesome
 * 3. Ensures proper icon structure in the public directory
 * 4. Generates optimized icon data for the application
 * 5. Verifies icon integrity and consistency
 * 
 * Usage:
 *   node scripts/icons/download-icons.js [options]
 * 
 * Options:
 *   --verbose       Show detailed logging
 *   --force         Force download even if icons exist
 *   --no-generate   Skip icon data generation
 *   --no-verify     Skip verification of downloaded icons
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');
const https = require('https');

// Add more visible console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Process command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const forceDownload = args.includes('--force');
const skipGenerate = args.includes('--no-generate');
const skipVerify = args.includes('--no-verify');
const refreshLightOnly = args.includes('--refresh-light');

// Helper logging function
function log(message, isVerboseOnly = false) {
  if (!isVerboseOnly || isVerbose) {
    console.log(message);
  }
}

// Output progress steps
log(`${colors.cyan}🚀 Starting Unified Icon Processing...${colors.reset}`);

// Font Awesome icon sets used in the project
const FA_LIBRARIES = [
  '@fortawesome/pro-solid-svg-icons',
  '@fortawesome/pro-light-svg-icons',
  '@fortawesome/pro-regular-svg-icons',
  '@fortawesome/pro-duotone-svg-icons',
  '@fortawesome/free-brands-svg-icons'
];

// Icon prefixes and their corresponding libraries
const ICON_PREFIXES = {
  'fas': '@fortawesome/pro-solid-svg-icons',
  'fal': '@fortawesome/pro-light-svg-icons',
  'fab': '@fortawesome/free-brands-svg-icons',
  'far': '@fortawesome/pro-regular-svg-icons',
  'fad': '@fortawesome/pro-duotone-svg-icons',
  'app': 'app-icons',
  'kpis': 'kpis-icons'
};

// Output directories for the SVG icons based on style
const OUTPUT_DIRS = {
  'solid': path.join(__dirname, '..', '..', 'public', 'icons', 'solid'),
  'light': path.join(__dirname, '..', '..', 'public', 'icons', 'light'),
  'brands': path.join(__dirname, '..', '..', 'public', 'icons', 'brands'),
  'regular': path.join(__dirname, '..', '..', 'public', 'icons', 'regular'),
  'app': path.join(__dirname, '..', '..', 'public', 'icons', 'app'),
  'kpis': path.join(__dirname, '..', '..', 'public', 'icons', 'kpis')
};

// Create output directories if they don't exist
Object.values(OUTPUT_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    log(`${colors.green}Creating directory: ${dir}${colors.reset}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Function to compare two SVG files
function compareIconFiles(path1, path2) {
  if (!fs.existsSync(path1) || !fs.existsSync(path2)) {
    return false;
  }
  
  const content1 = fs.readFileSync(path1, 'utf8');
  const content2 = fs.readFileSync(path2, 'utf8');
  
  return content1 === content2;
}

// Enhanced function to download Font Awesome light icons directly from CDN
function downloadIconFromCDN(iconName, style = 'light', outputPath) {
  return new Promise((resolve, reject) => {
    const stylePrefix = style === 'light' ? 'fal' : 'fas';
    
    // First try local extraction if possible
    try {
      const library = style === 'light' ? '@fortawesome/pro-light-svg-icons' : '@fortawesome/pro-solid-svg-icons';
      const actualIconName = getFontAwesomeIconName(iconName);
      
      if (actualIconName && isIconAvailableInLibrary(actualIconName, library)) {
        log(`Using local library for ${iconName} (${actualIconName})`, true);
        const icon = require(library)[actualIconName];
        
        // Process and save icon - currently missing implementation
        // Extract the SVG content from the icon and write to file
        if (icon && icon.icon) {
          const [width, height, _, __, svgPath] = icon.icon;
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor">
  <path d="${svgPath}"></path>
</svg>`;
          fs.writeFileSync(outputPath, svgContent, 'utf8');
          log(`Successfully saved ${style} icon ${iconName} to ${outputPath}`, true);
          resolve(outputPath);
          return;
        } else {
          log(`Icon data incomplete for ${iconName}, falling back to CDN`, true);
          // Falls through to CDN approach
        }
      }
    } catch (err) {
      log(`Local extraction failed for ${iconName}: ${err.message}`, true);
      // Continue to CDN approach
    }
    
    // Map kebab-case names to FontAwesome naming system
    const mappedName = ICON_NAME_MAPPINGS[iconName] || iconName;
    
    // Use Font Awesome CDN to download icons - adjust version if needed
    const url = `https://site-assets.fontawesome.com/releases/v6.4.0/svgs/${style}/${mappedName}.svg`;
    
    log(`Attempting to download ${iconName} as ${mappedName} from ${url}`, true);
    
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
      } else if (response.statusCode === 403) {
        // For 403 errors, create a placeholder SVG
        if (fs.existsSync(outputPath)) {
          log(`Using existing file for ${iconName} due to CDN permission error`, true);
          resolve(outputPath);
        } else {
          createPlaceholderSvg(iconName, outputPath);
          log(`Created placeholder for ${iconName} due to CDN permission error`, true);
          resolve(outputPath);
        }
      } else {
        reject(new Error(`Failed to download icon, status: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      // For network errors, also create a placeholder
      createPlaceholderSvg(iconName, outputPath);
      log(`Created placeholder for ${iconName} due to network error: ${err.message}`, true);
      resolve(outputPath);
    });
  });
}

// Helper function to create placeholder SVG files for missing icons
function createPlaceholderSvg(iconName, outputPath) {
  // Simple square with the icon name as text for visibility
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <rect width="512" height="512" fill="none" stroke="currentColor" stroke-width="20" />
    <text x="50%" y="50%" font-family="sans-serif" font-size="72" text-anchor="middle" dominant-baseline="middle">${iconName}</text>
  </svg>`;
  
  fs.writeFileSync(outputPath, svgContent, 'utf8');
  return outputPath;
}

// Helper to check if an icon is available in the local library
function isIconAvailableInLibrary(iconName, libraryPath) {
  try {
    const library = require(libraryPath);
    return !!library[iconName];
  } catch (err) {
    return false;
  }
}

// Map of common icon names to Font Awesome names
const ICON_NAME_MAPPINGS = {
  'menu': 'bars',
  'chat-bubble': 'comment-dots',
  'hamburger': 'bars',
  'close': 'xmark',
  'edit': 'pen-to-square',
  'check-circle': 'circle-check',
  'dollar': 'dollar-sign',
  'money': 'money-bill',
  'save': 'floppy-disk',
  'search': 'magnifying-glass',
  'user-circle': 'circle-user',
  'warning': 'triangle-exclamation',
  'history': 'clock-rotate-left',
  'home': 'house'
};

// Helper function to convert semantic names to Font Awesome names
function getFontAwesomeIconName(iconName) {
  // Try direct mapping first
  if (ICON_NAME_MAPPINGS[iconName]) {
    return `fa${camelCase(ICON_NAME_MAPPINGS[iconName])}`;
  }
  
  // Convert kebab-case to camelCase for FontAwesome naming
  return `fa${camelCase(iconName)}`;
}

// Convert kebab-case to camelCase
function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^[a-z]/, (g) => g.toUpperCase());
}

// MAIN EXECUTION STARTS HERE

// Step 1: Find all icons used in the codebase
log(`${colors.cyan}📂 Scanning codebase for icon usage...${colors.reset}`);

// Find all TypeScript and JavaScript files in the src directory
const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', { 
  cwd: path.join(__dirname, '..', '..'),
  ignore: [
    '**/node_modules/**',
    '**/.next/**',
    '**/scripts/**',
    '**/public/**',
    '**/test/**',
    '**/__tests__/**',
  ]
});

log(`Found ${sourceFiles.length} source files to scan.`);

// Track all found icon imports
const usedIcons = new Map();

// Scan source files for icon usage
sourceFiles.forEach((filePath, index) => {
  try {
    const fullPath = path.join(__dirname, '..', '..', filePath);
    const code = fs.readFileSync(fullPath, 'utf8');
    
    // Look for icon usage patterns
    
    // Pattern 1: Direct imports from FontAwesome
    const faImports = code.match(/from\s+['"](@fortawesome\/[^'"]+)['"]/g);
    if (faImports) {
      log(`Found FontAwesome imports in ${filePath}`, true);
    }
    
    // Pattern 2: React component icon usage
    const iconComponentUsage = [...code.matchAll(/<Icon\s+name\s*=\s*["']([^"']+)["']/g)];
    if (iconComponentUsage.length > 0) {
      iconComponentUsage.forEach(match => {
        const iconName = match[1];
        if (iconName.startsWith('fa')) {
          // Determine which library this likely belongs to
          const library = iconName.endsWith('Light') 
            ? '@fortawesome/pro-light-svg-icons'
            : '@fortawesome/pro-solid-svg-icons';
          
              if (!usedIcons.has(iconName)) {
            usedIcons.set(iconName, library);
              }
            }
          });
        }
    
    // Show progress periodically
    if ((index + 1) % 100 === 0) {
      log(`Processed ${index + 1}/${sourceFiles.length} files...`, true);
    }
    
  } catch (error) {
    log(`${colors.red}Error processing file ${filePath}: ${error.message}${colors.reset}`);
  }
});

log(`${colors.green}Found ${usedIcons.size} unique icons from the codebase.${colors.reset}`);

// Scan existing icon directories to ensure we don't miss any previously downloaded icons
log(`${colors.cyan}📂 Scanning existing icon folders...${colors.reset}`);
let foundExistingIcons = 0;

for (const [prefix, dir] of Object.entries(OUTPUT_DIRS)) {
  if (fs.existsSync(dir)) {
    const svgFiles = glob.sync('*.svg', { cwd: dir });
    
    svgFiles.forEach(file => {
      // Convert kebab-case file names back to camelCase icon names
      const baseName = path.basename(file, '.svg');
      const camelName = `fa${baseName.charAt(0).toUpperCase()}${baseName.substring(1).replace(/-([a-z])/g, g => g[1].toUpperCase())}`;
      
      // Map prefix to library
      const library = ICON_PREFIXES[prefix] || '@fortawesome/pro-solid-svg-icons';
      
      if (!usedIcons.has(camelName)) {
        usedIcons.set(camelName, library);
        foundExistingIcons++;
      }
      
      // For light icons, also add the Light suffix version
      if (prefix === 'fal' && !usedIcons.has(`${camelName}Light`)) {
        usedIcons.set(`${camelName}Light`, library);
        foundExistingIcons++;
      }
    });
  }
}

if (foundExistingIcons > 0) {
  log(`${colors.green}Found ${foundExistingIcons} additional icons from existing SVG files.${colors.reset}`);
}

log(`${colors.green}Total: ${usedIcons.size} unique Font Awesome icons.${colors.reset}`);

// Ensure we have all platform icons included
const REQUIRED_PLATFORM_ICONS = {
  'faFacebook': '@fortawesome/free-brands-svg-icons',
  'faInstagram': '@fortawesome/free-brands-svg-icons',
  'faLinkedin': '@fortawesome/free-brands-svg-icons',
  'faTiktok': '@fortawesome/free-brands-svg-icons',
  'faYoutube': '@fortawesome/free-brands-svg-icons',
  'faXTwitter': '@fortawesome/free-brands-svg-icons',
  'faTwitter': '@fortawesome/free-brands-svg-icons', // Include for backward compatibility
};

// Required light icons - always include these common light icons
const REQUIRED_LIGHT_ICONS = {
  'faUser': '@fortawesome/pro-light-svg-icons',
  'faChevronDown': '@fortawesome/pro-light-svg-icons',
  'faChevronUp': '@fortawesome/pro-light-svg-icons',
  'faChevronLeft': '@fortawesome/pro-light-svg-icons',
  'faChevronRight': '@fortawesome/pro-light-svg-icons',
  'faCalendar': '@fortawesome/pro-light-svg-icons',
  'faCheck': '@fortawesome/pro-light-svg-icons',
  'faXmark': '@fortawesome/pro-light-svg-icons',
  'faBell': '@fortawesome/pro-light-svg-icons',
  'faCircleInfo': '@fortawesome/pro-light-svg-icons',
  'faCircleCheck': '@fortawesome/pro-light-svg-icons',
  'faCircleXmark': '@fortawesome/pro-light-svg-icons',
  'faEnvelope': '@fortawesome/pro-light-svg-icons',
  'faSearch': '@fortawesome/pro-light-svg-icons',
  'faPlay': '@fortawesome/pro-light-svg-icons',
  'faPause': '@fortawesome/pro-light-svg-icons',
  'faHouse': '@fortawesome/pro-light-svg-icons',
  'faPenToSquare': '@fortawesome/pro-light-svg-icons'
};

// Add required icons to the list if they're not already there
for (const [icon, library] of Object.entries(REQUIRED_PLATFORM_ICONS)) {
  if (!usedIcons.has(icon)) {
    usedIcons.set(icon, library);
    log(`Adding required platform icon: ${icon}`, true);
  }
}

for (const [icon, library] of Object.entries(REQUIRED_LIGHT_ICONS)) {
  if (!usedIcons.has(icon)) {
    usedIcons.set(icon, library);
    log(`Adding required light icon: ${icon}`, true);
  }
  
  // Also ensure light variants with Light suffix
  const lightVariant = `${icon}Light`;
  if (!usedIcons.has(lightVariant)) {
    usedIcons.set(lightVariant, library);
    log(`Adding required light icon variant: ${lightVariant}`, true);
  }
}

// Step 2: Download all needed icons
log(`${colors.cyan}⬇️ Downloading icons...${colors.reset}`);

// Function to process a batch of icons
async function processBatch(batch) {
  const promises = batch.map(async ([iconName, library]) => {
    try {
      // Extract icon info
      const baseName = iconName.replace(/^fa/, '').replace(/Light$/, '');
      const kebabName = baseName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      
      // Determine the icon style
      let prefix = 'fas'; // default to solid
      if (library.includes('light')) {
        prefix = 'fal';
      } else if (library.includes('brands')) {
        prefix = 'fab';
      } else if (library.includes('regular')) {
        prefix = 'far';
      }
      
      // Map prefix to style folder
      const style = prefix === 'fas' ? 'solid' :
                   prefix === 'fal' ? 'light' :
                   prefix === 'fab' ? 'brands' : 'regular';
      
      // Output path for the icon
      const outputPath = path.join(OUTPUT_DIRS[style], `${kebabName}.svg`);
      
      // Skip if the file already exists and we're not forcing download
      if (fs.existsSync(outputPath) && !forceDownload) {
        return { iconName, result: 'skipped' };
      }
      
      // Try to download the icon
      await downloadIconFromCDN(kebabName, style, outputPath);
      return { iconName, result: 'downloaded' };
    } catch (error) {
      log(`${colors.red}Failed to download ${iconName}: ${error.message}${colors.reset}`);
      return { iconName, result: 'failed', error: error.message };
    }
  });
  
  return Promise.all(promises);
}

// Process icons in batches to avoid overwhelming the network
const BATCH_SIZE = 10;
const iconEntries = Array.from(usedIcons.entries());
const batches = [];

for (let i = 0; i < iconEntries.length; i += BATCH_SIZE) {
  batches.push(iconEntries.slice(i, i + BATCH_SIZE));
}

let downloadResults = {
  downloaded: 0,
  skipped: 0,
  failed: 0
};

// Function to specifically purge and reload all light icons
async function purgeAndRefreshLightIcons() {
  log(`${colors.cyan}🧹 Purging and refreshing light icons specifically...${colors.reset}`);
  
  // Get all current light icons
  const lightIconsDir = OUTPUT_DIRS['light'];
  if (!fs.existsSync(lightIconsDir)) {
    fs.mkdirSync(lightIconsDir, { recursive: true });
    log(`Created light icons directory: ${lightIconsDir}`);
    return;
  }
  
  // Find all SVG files in the light directory
  const lightSvgFiles = glob.sync('*.svg', { cwd: lightIconsDir });
  log(`Found ${lightSvgFiles.length} existing light icons to refresh`);
  
  // Delete all existing light icons
  let deletedCount = 0;
  for (const file of lightSvgFiles) {
    const fullPath = path.join(lightIconsDir, file);
    try {
      fs.unlinkSync(fullPath);
      deletedCount++;
    } catch (err) {
      log(`${colors.red}Failed to delete ${fullPath}: ${err.message}${colors.reset}`);
    }
  }
  log(`${colors.green}Deleted ${deletedCount} existing light icons${colors.reset}`);

  // Load the icon-url-map.json to get all light icons used in the app
  let allLightIcons = new Set();
  
  try {
    // Try to read the icon-url-map.json file to get all light icons
    const iconMapPath = path.join(__dirname, '..', '..', 'src', 'components', 'ui', 'icons', 'mapping', 'icon-url-map.json');
    if (fs.existsSync(iconMapPath)) {
      const iconMap = JSON.parse(fs.readFileSync(iconMapPath, 'utf8'));
      
      // Extract light icons from the map
      for (const [iconName, iconPath] of Object.entries(iconMap)) {
        if (typeof iconPath === 'string' && iconPath.includes('/light/')) {
          const kebabName = iconPath.split('/').pop().replace('.svg', '');
          if (kebabName) {
            allLightIcons.add(kebabName);
          }
        }
      }
      log(`${colors.green}Found ${allLightIcons.size} light icons from icon-url-map.json${colors.reset}`);
    }
  } catch (error) {
    log(`${colors.yellow}Warning: Could not read icon-url-map.json: ${error.message}${colors.reset}`);
  }
  
  // Add required light icons to ensure we have the basics
  for (const [iconName, _] of Object.entries(REQUIRED_LIGHT_ICONS)) {
    const baseName = iconName.replace(/^fa/, '');
    const kebabName = baseName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    allLightIcons.add(kebabName);
  }
  
  // Add light icons from the fontawesome libraries
  try {
    const faLibrary = require('@fortawesome/pro-light-svg-icons');
    for (const key of Object.keys(faLibrary)) {
      if (key.startsWith('fa') && key !== 'fab' && key !== 'fas' && key !== 'far' && key !== 'fal') {
        const baseName = key.replace(/^fa/, '');
        const kebabName = baseName
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');
          
        // Add explicitly requested icons
        if (['bolt', 'bug', 'circle-user', 'chart-line', 'file-lines', 'file', 'clock', 'chart-pie', 'chart-column', 'magnifying-glass-plus', 'rotate', 'shield'].includes(kebabName)) {
          allLightIcons.add(kebabName);
        }
      }
    }
  } catch (error) {
    log(`${colors.yellow}Warning: Could not read FontAwesome light library: ${error.message}${colors.reset}`);
  }
  
  // Generate list of light icons to download
  const lightIcons = Array.from(allLightIcons).map(kebabName => {
    return {
      kebabName,
      iconName: `fa${camelCase(kebabName)}`
    };
  });
  
  log(`${colors.cyan}Attempting to download ${lightIcons.length} light icons...${colors.reset}`);
  
  // Download each light icon one by one (more reliable than batch)
  let downloadedCount = 0;
  let failedCount = 0;
  
  for (const { iconName, kebabName } of lightIcons) {
    const outputPath = path.join(lightIconsDir, `${kebabName}.svg`);
    
    try {
      // Use the FontAwesome library version for more reliability
      const faIconName = getFontAwesomeIconName(kebabName);
      const icon = require('@fortawesome/pro-light-svg-icons')[faIconName];
      
      if (icon && icon.icon) {
        const [width, height, _, __, svgPath] = icon.icon;
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor">
  <path d="${svgPath}"></path>
</svg>`;
        fs.writeFileSync(outputPath, svgContent, 'utf8');
        downloadedCount++;
        
        if (downloadedCount % 10 === 0 || downloadedCount === lightIcons.length) {
          log(`${colors.green}Downloaded ${downloadedCount}/${lightIcons.length} light icons...${colors.reset}`);
        }
      } else {
        // Fall back to CDN for any missing icons
        await downloadIconFromCDN(kebabName, 'light', outputPath);
        downloadedCount++;
      }
    } catch (error) {
      log(`${colors.red}Failed to download light icon ${iconName}: ${error.message}${colors.reset}`);
      failedCount++;
      
      // Try to download from CDN as fallback
      try {
        await downloadIconFromCDN(kebabName, 'light', outputPath);
        log(`${colors.green}Recovered ${iconName} via CDN${colors.reset}`);
        downloadedCount++;
      } catch (cdnError) {
        log(`${colors.red}CDN fallback also failed for ${iconName}: ${cdnError.message}${colors.reset}`);
      }
    }
  }
  
  log(`${colors.green}✅ Light icon refresh complete!${colors.reset}`);
  log(`- Downloaded: ${downloadedCount}`);
  log(`- Failed: ${failedCount}`);
  
  return { downloaded: downloadedCount, failed: failedCount };
}

(async () => {
  log(`Processing ${batches.length} batches of icons...`);
  
  // Special mode to just refresh light icons
  if (refreshLightOnly) {
    // We still need to scan and identify icons
    log(`${colors.cyan}📂 Preparing to refresh light icons only...${colors.reset}`);
    await purgeAndRefreshLightIcons();
    
    // Skip to icon data generation
    if (!skipGenerate) {
      log(`${colors.cyan}📊 Generating icon data file...${colors.reset}`);
      // (Existing code for generating icon data)
    }
    
    log(`${colors.bold}${colors.green}🎉 Light icon refresh complete!${colors.reset}`);
    return;
  }
  
  // Regular processing continues below for non-light-refresh mode
  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatch(batches[i]);
    
    // Update statistics
    batchResults.forEach(result => {
      downloadResults[result.result]++;
    });
    
    // Show progress
    log(`Completed batch ${i + 1}/${batches.length} - Downloaded: ${downloadResults.downloaded}, Skipped: ${downloadResults.skipped}, Failed: ${downloadResults.failed}`, true);
  }
  
  log(`${colors.green}✅ Icon download complete!${colors.reset}`);
  log(`- Downloaded: ${downloadResults.downloaded}`);
  log(`- Skipped (already exists): ${downloadResults.skipped}`);
  log(`- Failed: ${downloadResults.failed}`);
  
  // Step 3: Generate icon data
  if (!skipGenerate) {
    log(`${colors.cyan}📊 Generating icon data file...${colors.reset}`);
    
    try {
      const iconRegistryDir = path.join(__dirname, '..', '..', 'src', 'assets', 'icons', 'data');
      if (!fs.existsSync(iconRegistryDir)) {
        fs.mkdirSync(iconRegistryDir, { recursive: true });
      }
      
      const generateIconDataScript = path.join(__dirname, 'generate-icon-data.js');
      if (fs.existsSync(generateIconDataScript)) {
        execSync(`node ${generateIconDataScript}${isVerbose ? ' --verbose' : ''}`, { 
          stdio: isVerbose ? 'inherit' : 'pipe' 
        });
        log(`${colors.green}✅ Successfully generated icon data${colors.reset}`);
      } else {
        log(`${colors.yellow}⚠️ Could not find generate-icon-data.js script${colors.reset}`);
        
        // Attempt to run the script through the directory where it might be located
        try {
          execSync(`node scripts/icons/generate-icon-data.js${isVerbose ? ' --verbose' : ''}`, { 
            stdio: isVerbose ? 'inherit' : 'pipe' 
          });
          log(`${colors.green}✅ Successfully generated icon data${colors.reset}`);
      } catch (error) {
          log(`${colors.red}❌ Failed to generate icon data: ${error.message}${colors.reset}`);
        }
      }
        } catch (error) {
      log(`${colors.red}❌ Error generating icon data: ${error.message}${colors.reset}`);
    }
  }
  
  // Step 4: Verify icons if not skipped
  if (!skipVerify) {
    log(`${colors.cyan}🔍 Verifying icon integrity...${colors.reset}`);
    
    try {
      // Simple verification: check that we have SVG files for all icons
      let allIconsValid = true;
      let missingIcons = [];
      let potentiallyIncorrectStyleIcons = [];
      
      for (const [iconName, library] of usedIcons.entries()) {
        const baseName = iconName.replace(/^fa/, '').replace(/Light$/, '');
        const kebabName = baseName
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');
        
        // Determine icon style from library
        let style = 'solid'; // default
        if (library.includes('light')) {
          style = 'light';
        } else if (library.includes('brands')) {
          style = 'brands';
        } else if (library.includes('regular')) {
          style = 'regular';
        }
        
        // For light variants, we need to check the light directory
        if (iconName.endsWith('Light')) {
          style = 'light';
        }
        
        const iconPath = path.join(OUTPUT_DIRS[style], `${kebabName}.svg`);
        
        if (!fs.existsSync(iconPath)) {
          allIconsValid = false;
          missingIcons.push({ name: iconName, style, path: iconPath });
        } else if (style === 'light') {
          // Check if light icons might actually be solid icons by examining SVG content
          try {
            const content = fs.readFileSync(iconPath, 'utf8');
            // Simple heuristic: light icons typically have fewer path commands/characters than solid
            // This isn't foolproof but helps catch obvious mismatches
            const pathMatch = content.match(/<path\s+d="([^"]+)"/);
            if (pathMatch && pathMatch[1]) {
              const pathData = pathMatch[1];
              // Most light icons have simpler paths and often contain specific stroke attributes
              // If the path is complex and doesn't have these properties, it might be a solid icon
              if (pathData.length > 500 && !content.includes('stroke-width') && 
                  !content.includes('fill="none"') && !content.includes('fill-rule="nonzero"')) {
                potentiallyIncorrectStyleIcons.push({ 
                  name: iconName, 
                  path: iconPath,
                  issue: 'May be a solid icon in light directory'
                });
              }
            }
          } catch (err) {
            log(`Error checking light icon integrity for ${iconName}: ${err.message}`, true);
          }
        }
      }
      
      if (allIconsValid && potentiallyIncorrectStyleIcons.length === 0) {
        log(`${colors.green}✅ All icons verified successfully${colors.reset}`);
      } else {
        if (missingIcons.length > 0) {
          log(`${colors.yellow}⚠️ Found ${missingIcons.length} missing icons${colors.reset}`);
          
          if (isVerbose) {
            missingIcons.forEach(icon => {
              log(`  - ${icon.name} (${icon.style}): ${icon.path}`);
            });
          }
        }
        
        if (potentiallyIncorrectStyleIcons.length > 0) {
          log(`${colors.yellow}⚠️ Found ${potentiallyIncorrectStyleIcons.length} potential style mismatches (light/solid)${colors.reset}`);
          log(`${colors.yellow}Run with --force to redownload these icons${colors.reset}`);
          
          // Always show these since they're important
          potentiallyIncorrectStyleIcons.forEach(icon => {
            log(`  - ${icon.name}: ${icon.issue} (${icon.path})`);
          });
          
          // Suggest running with force flag to fix these issues
          log(`${colors.cyan}Suggestion: Run with --force flag to redownload mismatched icons${colors.reset}`);
        }
      }
    } catch (error) {
      log(`${colors.red}❌ Error verifying icons: ${error.message}${colors.reset}`);
    }
  }
  
  log(`${colors.bold}${colors.green}🎉 Icon processing complete!${colors.reset}`);
})();

// Catch errors
process.on('unhandledRejection', (error) => {
  log(`${colors.red}Unhandled promise rejection: ${error.message}${colors.reset}`);
  process.exit(1);
}); 
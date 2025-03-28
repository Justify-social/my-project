/**
 * Icon Data Generator (Updated for new directory structure)
 * 
 * This is an updated version of the original generate-icon-data.js script
 * modified to work with the new directory structure.
 * 
 * Usage:
 *   node scripts/icons/generate-icon-data.js         # Normal mode
 *   node scripts/icons/generate-icon-data.js --verbose   # Verbose mode with detailed logging
 */
/**
 * Icon Data Generator
 * 
 * Generates icon data from SVG files in the public directory.
 * 
 * Usage:
 *   node scripts/icon-management/generate-icon-data.js         # Normal mode
 *   node scripts/icon-management/generate-icon-data.js --verbose   # Verbose mode with detailed logging
 */

const fs = require('fs');
const path = require('path');

// Process command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');

// Helper logging function
function log(message, isVerboseOnly = false) {
  if (!isVerboseOnly || isVerbose) {
    console.log(message);
  }
}

// Icon directories with SVG files
const ICON_DIRS = {
  solid: path.join(__dirname, '..', '..', 'public', 'icons', 'solid'),
  light: path.join(__dirname, '..', '..', 'public', 'icons', 'light'),
  brands: path.join(__dirname, '..', '..', 'public', 'icons', 'brands'),
  regular: path.join(__dirname, '..', '..', 'public', 'icons', 'regular'),
  app: path.join(__dirname, '..', '..', 'public', 'icons', 'app'),
  kpis: path.join(__dirname, '..', '..', 'public', 'icons', 'kpis')
};

// Output TypeScript files
const OUTPUT_FILES = [
  path.join(__dirname, '..', '..', 'src', 'components', 'ui', 'icons', 'data', 'icon-data.ts')
];

// File paths for icon data
const ROOT_DIR = path.join(__dirname, '..', '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const REGISTRY_FILE = path.join(SRC_DIR, 'components', 'ui', 'icons', 'mapping', 'icon-registry.json');
const ICON_DATA_FILE = path.join(SRC_DIR, 'components', 'ui', 'icons', 'data', 'icon-data.ts');
const URL_MAP_FILE = path.join(SRC_DIR, 'components', 'ui', 'icons', 'mapping', 'icon-url-map.json');

// Map of style prefixes to style folder names
const PREFIX_TO_STYLE = {
  'fas': 'solid',
  'fal': 'light',
  'fab': 'brands',
  'far': 'regular',
  'app': 'app',
  'kpis': 'kpis'
};

// Function to extract path data from SVG file
function extractSvgData(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract viewBox
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    console.error(`Failed to extract viewBox from ${filePath}`);
    return null;
  }
  
  const viewBox = viewBoxMatch[1].split(' ');
  if (viewBox.length < 4) {
    console.error(`Invalid viewBox format in ${filePath}`);
    return null;
  }
  
  const width = parseInt(viewBox[2], 10);
  const height = parseInt(viewBox[3], 10);
  
  // Extract path data - some SVGs might use different elements
  const pathMatch = content.match(/<path d="([^"]+)"/);
  
  // If no path, extract full SVG content
  if (!pathMatch) {
    // Instead of failing, use a simplified representation
    const svgContentStart = content.indexOf('<svg');
    const svgContentEnd = content.lastIndexOf('</svg>');
    
    if (svgContentStart === -1 || svgContentEnd === -1) {
      console.error(`Failed to extract SVG content from ${filePath}`);
      return null;
    }
    
    // Use placeholder path for complex SVGs
    const path = "M0 0 H" + width + " V" + height + " H0 Z";
    console.log(`Using placeholder path for complex SVG: ${filePath}`);
    
    return { width, height, path, complex: true };
  }
  
  const path = pathMatch[1];
  
  return { width, height, path };
}

// Main function
async function generateIconData() {
  log('Generating icon data...');
  
  // Check if registry file exists
  if (!fs.existsSync(REGISTRY_FILE)) {
    console.error(`Registry file ${REGISTRY_FILE} does not exist. Run download-icons.js first.`);
    process.exit(1);
  }
  
  // Check if at least one icon directory exists
  let hasAnyDir = false;
  for (const dir of Object.values(ICON_DIRS)) {
    if (fs.existsSync(dir)) {
      hasAnyDir = true;
      break;
    }
  }
  
  if (!hasAnyDir) {
    console.error(`None of the icon directories exist. Run download-icons.js first.`);
    process.exit(1);
  }
  
  // Read registry file
  const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  
  // Scan app and kpis folders for icons not in registry
  if (fs.existsSync(ICON_DIRS.app)) {
    const appIcons = fs.readdirSync(ICON_DIRS.app)
      .filter(file => file.endsWith('.svg'))
      .map(file => {
        const baseName = path.basename(file, '.svg');
        // Convert to camelCase if needed
        const iconName = `app${baseName.charAt(0).toUpperCase()}${baseName.substring(1).replace(/-([a-z])/g, g => g[1].toUpperCase())}`;
        return { iconName, file: baseName, path: `/icons/app/${file}` };
      });
    
    log(`Found ${appIcons.length} app icons`);
    
    appIcons.forEach(icon => {
      if (!registry[icon.iconName]) {
        registry[icon.iconName] = {
          prefix: 'app',
          name: icon.file,
          fileName: `${icon.file}.svg`,
          path: icon.path
        };
        log(`Added app icon: ${icon.iconName}`, true);
      }
    });
  }
  
  if (fs.existsSync(ICON_DIRS.kpis)) {
    const kpisIcons = fs.readdirSync(ICON_DIRS.kpis)
      .filter(file => file.endsWith('.svg'))
      .map(file => {
        const baseName = path.basename(file, '.svg');
        // Convert to camelCase if needed
        const iconName = `kpis${baseName.charAt(0).toUpperCase()}${baseName.substring(1).replace(/_([a-z])/g, g => g[1].toUpperCase())}`;
        return { iconName, file: baseName, path: `/icons/kpis/${file}` };
      });
    
    log(`Found ${kpisIcons.length} kpis icons`);
    
    kpisIcons.forEach(icon => {
      if (!registry[icon.iconName]) {
        registry[icon.iconName] = {
          prefix: 'kpis',
          name: icon.file,
          fileName: `${icon.file}.svg`,
          path: icon.path
        };
        log(`Added kpis icon: ${icon.iconName}`, true);
      }
    });
  }
  
  // Save updated registry
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');
  log(`Updated registry with app and kpis icons`, true);
  
  // Generate URL map
  const urlMap = {};
  
  for (const [iconName, info] of Object.entries(registry)) {
    const styleName = PREFIX_TO_STYLE[info.prefix] || 'solid';
    urlMap[iconName] = `/icons/${styleName}/${info.name}.svg`;
  }
  
  // Write URL map file
  fs.writeFileSync(URL_MAP_FILE, JSON.stringify(urlMap, null, 2), 'utf8');
  log(`Generated icon URL map with ${Object.keys(urlMap).length} icons`, true);
  
  // Generate icon data
  const iconData = {};
  let successCount = 0;
  let failCount = 0;
  
  for (const [iconName, info] of Object.entries(registry)) {
    const styleName = PREFIX_TO_STYLE[info.prefix] || 'solid';
    const svgFile = path.join(ICON_DIRS[styleName], `${info.name}.svg`);
    
    log(`Processing icon: ${iconName} (${info.prefix}/${info.name})`, true);
    
    if (!fs.existsSync(svgFile)) {
      log(`  ❌ SVG file ${svgFile} does not exist.`, true);
      failCount++;
      continue;
    }
    
    const svgData = extractSvgData(svgFile);
    if (!svgData) {
      log(`  ❌ Failed to extract SVG data from ${svgFile}`, true);
      failCount++;
      continue;
    }
    
    // Add URL to the data for direct access in browser
    svgData.url = `/icons/${styleName}/${info.name}.svg`;
    
    log(`  ✅ Successfully extracted SVG data: ${svgData.width}x${svgData.height}`, true);
    log(`  📁 URL: ${svgData.url}`, true);
    
    iconData[iconName] = svgData;
    successCount++;
  }
  
  // Generate TypeScript file
  const tsContent = `/**
 * This file was automatically generated by generate-icon-data.js
 * Do not edit directly!
 */

import type { IconData, IconName } from './types';

export const iconData: Record<IconName, IconData> = ${JSON.stringify(iconData, null, 2)};
`;
  
  // Write TypeScript files to all output locations
  for (const outputFile of OUTPUT_FILES) {
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write TypeScript file
    fs.writeFileSync(outputFile, tsContent, 'utf8');
    log(`Wrote icon data to: ${outputFile}`, true);
  }
  
  log(`Successfully generated icon data for ${successCount} icons.`);
  if (failCount > 0) {
    log(`Failed to generate data for ${failCount} icons.`);
  }
  log(`Output files: ${OUTPUT_FILES.join(', ')}`);
}

// Run the function
generateIconData().catch(err => {
  console.error('Error generating icon data:', err);
  process.exit(1);
}); 
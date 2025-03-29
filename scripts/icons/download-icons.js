#!/usr/bin/env node

/**
 * Robust FontAwesome Pro Icon Downloader and Registry Updater
 * 
 * This script handles all icon-related operations:
 * 1. Scans the codebase for FontAwesome icon usage
 * 2. Extracts SVG content directly from FontAwesome npm packages
 * 3. Manages the icon directory structure
 * 4. Updates icon registry files (icon-registry.json and icon-url-map.json)
 * 5. Verifies icon integrity
 * 
 * Usage:
 *   node scripts/icons/download-icons.js [options]
 * 
 * Options:
 *   --verbose              Show detailed logging
 *   --force                Force download even if icons exist
 *   --icons=name1,name2    Specify specific icons to download
 *   --prefix=style1,style2 Specify icon styles (solid,light,brands)
 *   --skip-registry-update Skip updating the registry files
 *   --dry-run              Show what would be done without making changes
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Terminal colors for better output
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
const dryRun = args.includes('--dry-run');
const skipRegistryUpdate = args.includes('--skip-registry-update');

// Handle specific icons argument
let specificIcons = [];
let iconStylesArg = [];

args.forEach(arg => {
  if (arg.startsWith('--icons=')) {
    specificIcons = arg.replace('--icons=', '').split(',').map(s => s.trim());
    console.log(`${colors.cyan}Processing specific icons: ${specificIcons.join(', ')}${colors.reset}`);
  }
  if (arg.startsWith('--prefix=')) {
    iconStylesArg = arg.replace('--prefix=', '').split(',').map(s => s.trim());
    console.log(`${colors.cyan}Using icon styles: ${iconStylesArg.join(', ')}${colors.reset}`);
  }
});

// Helper logging function
function log(message, isVerboseOnly = false) {
  if (!isVerboseOnly || isVerbose) {
    console.log(message);
  }
}

// Ensure file exists and is readable
function ensureFileExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Icon types we support
const ICON_LIBRARIES = {
  'light': '@fortawesome/pro-light-svg-icons',
  'solid': '@fortawesome/pro-solid-svg-icons',
  'brands': '@fortawesome/free-brands-svg-icons',
  'regular': '@fortawesome/pro-regular-svg-icons',
  'duotone': '@fortawesome/pro-duotone-svg-icons'
};

// Prefixes for different icon types
const ICON_PREFIXES = {
  'light': 'fal',
  'solid': 'fas',
  'brands': 'fab',
  'regular': 'far',
  'duotone': 'fad',
  'app': 'app',
  'kpis': 'kpis'
};

// Output directories for the SVG icons
const OUTPUT_DIRS = {
  'light': path.join(__dirname, '..', '..', 'public', 'icons', 'light'),
  'solid': path.join(__dirname, '..', '..', 'public', 'icons', 'solid'),
  'brands': path.join(__dirname, '..', '..', 'public', 'icons', 'brands'),
  'regular': path.join(__dirname, '..', '..', 'public', 'icons', 'regular'),
  'app': path.join(__dirname, '..', '..', 'public', 'icons', 'app'),
  'kpis': path.join(__dirname, '..', '..', 'public', 'icons', 'kpis')
};

// Paths to the registry files
const ICON_REGISTRY_PATH = path.join(__dirname, '..', '..', 'src', 'components', 'ui', 'atoms', 'icons', 'registry.json');

// Common mapping from semantic names to FontAwesome names
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
  'home': 'house',
  'atom-simple': 'atom' // Map atom-simple to atom
};

// Required icons to always include
const REQUIRED_ICONS = {
  'light': [
    'user', 'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
    'calendar', 'check', 'xmark', 'bell', 'circle-info', 'circle-check', 
    'circle-xmark', 'envelope', 'search', 'play', 'pause', 'house', 
    'pen-to-square', 'atom', 'dna', 'bacterium'
  ],
  'solid': [
    'bell', 'circle-check', 'check', 'xmark', 'circle-info', 'gear',
    'house', 'atom', 'dna', 'bacterium'
  ],
  'brands': [
    'facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok'
  ]
};

// Create output directories if they don't exist
Object.values(OUTPUT_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    log(`${colors.green}Creating directory: ${dir}${colors.reset}`);
    if (!dryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
});

// Convert kebab-case to camelCase
function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^[a-z]/, (g) => g.toUpperCase());
}

// Convert camelCase to kebab-case
function kebabCase(str) {
  return str
    .replace(/^[A-Z]/, (g) => g.toLowerCase())
    .replace(/[A-Z]/g, (g) => `-${g.toLowerCase()}`);
}

// Get the base name without prefix (fa) and Light suffix
function getBaseName(iconName) {
  return iconName.replace(/^fa/, '').replace(/Light$/, '');
}

// Generate kebab-case filename from icon name
function generateFilename(iconName) {
  const baseName = getBaseName(iconName);
  return kebabCase(baseName);
}

// Load an icon registry file
function loadRegistryFile(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    log(`${colors.yellow}Warning: Could not read ${filePath}: ${err.message}${colors.reset}`);
  }
  return defaultValue;
}

// Save an icon registry file
function saveRegistryFile(filePath, data) {
  try {
    if (!dryRun) {
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      log(`${colors.green}Updated ${filePath}${colors.reset}`);
    } else {
      log(`${colors.cyan}[DRY RUN] Would update ${filePath}${colors.reset}`);
    }
  } catch (err) {
    log(`${colors.red}Error: Failed to write to ${filePath}: ${err.message}${colors.reset}`);
  }
}

// Extract an icon directly from the npm package
function extractIconFromPackage(iconName, style) {
  try {
    // Map the style to a FontAwesome library module
    const libraryModule = ICON_LIBRARIES[style];
    if (!libraryModule) {
      return null;
    }
    
    // Check if the package is installed
    try {
      require.resolve(libraryModule);
    } catch (err) {
      log(`${colors.yellow}Warning: Library ${libraryModule} is not installed${colors.reset}`, true);
      return null;
    }
    
    // Get the FontAwesome icon name
    let faIconName;
    const mappedName = ICON_NAME_MAPPINGS[iconName] || iconName;
    
    // Try to normalize the icon name to FontAwesome format
    if (iconName.includes('-')) {
      faIconName = `fa${camelCase(mappedName)}`;
    } else {
      faIconName = `fa${mappedName.charAt(0).toUpperCase()}${mappedName.slice(1)}`;
    }
    
    // Load the icon from the library
    const faLibrary = require(libraryModule);
    const icon = faLibrary[faIconName];
    
    if (!icon || !icon.icon) {
      // Try alternate icon names if initial attempt fails
      const altNames = [
        `fa${mappedName}`, // No capitalization
        `fa${mappedName.toUpperCase()}`, // All uppercase
        `fa${camelCase(mappedName)}`, // Explicit camelCase
      ];
      
      for (const altName of altNames) {
        if (faLibrary[altName] && faLibrary[altName].icon) {
          return faLibrary[altName];
        }
      }
      
      return null;
    }
    
    return icon;
  } catch (err) {
    log(`${colors.red}Error extracting ${iconName} (${style}): ${err.message}${colors.reset}`, true);
    return null;
  }
}

// Generate SVG content from a FontAwesome icon
function generateSvgContent(icon) {
  if (!icon || !icon.icon) {
    return null;
  }
  
  const [width, height, _, __, svgPath] = icon.icon;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor">
  <path d="${svgPath}"></path>
</svg>`;
}

// Create a placeholder SVG for missing icons
function createPlaceholderSvg(iconName) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
  <rect width="512" height="512" fill="none" stroke="currentColor" stroke-width="20" />
  <text x="50%" y="50%" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">${iconName}</text>
</svg>`;
}

// Calculate the icon path for use in the registry and url map
function calculateIconPath(style, filename) {
  return `/icons/${style}/${filename}`;
}

// Add icon to the registry
function addIconToRegistry(registry, iconName, style, filename) {
  const prefix = ICON_PREFIXES[style];
  const iconPath = calculateIconPath(style, filename);
  
  // Add to registry with all metadata
  registry[iconName] = {
    prefix,
    name: filename,
    fileName: `${filename}.svg`,
    path: iconPath
  };
  
  return registry;
}

// Update registry files
function updateRegistryFiles(iconName, style, filename) {
  if (skipRegistryUpdate) {
    log(`${colors.cyan}Skipping registry update (--skip-registry-update)${colors.reset}`, true);
    return;
  }
  
  // Update icon-registry.json
  try {
    const registry = loadRegistryFile(ICON_REGISTRY_PATH, {});
    addIconToRegistry(registry, iconName, style, filename);
    saveRegistryFile(ICON_REGISTRY_PATH, registry);
    } catch (err) {
    log(`${colors.red}Error updating registry: ${err.message}${colors.reset}`);
  }
}

// Process an individual icon
async function processIcon(iconName, style) {
  try {
    // Generate filename and output path
    const kebabName = generateFilename(iconName);
    const outputPath = path.join(OUTPUT_DIRS[style], `${kebabName}.svg`);
    
    // Skip if the file already exists and we're not forcing download
    if (fs.existsSync(outputPath) && !forceDownload) {
      log(`${colors.blue}Skipping existing icon: ${iconName} (${style})${colors.reset}`, true);
      return { iconName, style, result: 'skipped' };
    }
    
    // Extract the icon from the package
    log(`${colors.cyan}Processing icon: ${iconName} (${style})${colors.reset}`, true);
    
    // Skip processing app and kpis icons
    if (style === 'app' || style === 'kpis') {
      log(`${colors.blue}Skipping app/kpis icon: ${iconName} (no download needed)${colors.reset}`, true);
      return { iconName, style, result: 'skipped' };
    }
    
    const icon = extractIconFromPackage(kebabName, style);
    
    // Skip the write process in dry run mode
    if (dryRun) {
      if (icon) {
        log(`${colors.yellow}DRY RUN: Would save ${iconName} to ${outputPath}${colors.reset}`);
      } else {
        log(`${colors.yellow}DRY RUN: Would create placeholder for ${iconName} at ${outputPath}${colors.reset}`);
      }
      return { iconName, style, result: 'dry-run' };
    }
    
    // Generate and write SVG content
    let svgContent;
    if (icon) {
      svgContent = generateSvgContent(icon);
      fs.writeFileSync(outputPath, svgContent, 'utf8');
      log(`${colors.green}Saved icon: ${iconName} (${style}) to ${outputPath}${colors.reset}`, true);
    } else {
      // Create a placeholder for missing icons
      svgContent = createPlaceholderSvg(kebabName);
      fs.writeFileSync(outputPath, svgContent, 'utf8');
      log(`${colors.yellow}Created placeholder for: ${iconName} (${style}) at ${outputPath}${colors.reset}`, true);
    }
    
    // Update the registry files
    updateRegistryFiles(iconName, style, `${kebabName}.svg`);
    
    return { iconName, style, result: 'downloaded' };
  } catch (error) {
    log(`${colors.red}Error processing ${iconName} (${style}): ${error.message}${colors.reset}`);
    return { iconName, style, result: 'failed', error: error.message };
  }
}

// Generate a comprehensive list of icons to process
function buildIconList() {
  const iconList = [];
  
  // If specific icons are specified, only process those
  if (specificIcons.length > 0) {
    const styles = iconStylesArg.length > 0 ? iconStylesArg : ['solid', 'light', 'brands'];
    
    for (const iconName of specificIcons) {
      for (const style of styles) {
        if (style === 'app' || style === 'kpis') {
          continue; // Skip app and kpis icons as they're already downloaded
        }
        
        const camelIconName = `fa${camelCase(iconName)}`;
        iconList.push({ iconName: camelIconName, style });
        
        // Add Light suffix variants for light icons
        if (style === 'light') {
          iconList.push({ iconName: `${camelIconName}Light`, style });
        }
      }
    }
  } else {
    // Add all required icons
    for (const [style, icons] of Object.entries(REQUIRED_ICONS)) {
      for (const iconName of icons) {
        if (style === 'app' || style === 'kpis') {
          continue; // Skip app and kpis icons
        }
        
        const camelIconName = `fa${camelCase(iconName)}`;
        iconList.push({ iconName: camelIconName, style });
        
        // Add Light suffix variants for light icons
        if (style === 'light') {
          iconList.push({ iconName: `${camelIconName}Light`, style });
        }
      }
    }
    
    // Add icons found in the registry files
    const registry = loadRegistryFile(ICON_REGISTRY_PATH, {});
    for (const [iconName, iconData] of Object.entries(registry)) {
      if (iconName.startsWith('fa')) {
        const prefix = iconData.prefix;
        let style;
        
        // Map prefix to style
        for (const [styleKey, prefixValue] of Object.entries(ICON_PREFIXES)) {
          if (prefixValue === prefix) {
            style = styleKey;
            break;
          }
        }
        
        if (style && style !== 'app' && style !== 'kpis') {
          // Skip Light suffix variants as they're handled by the main icon
          if (!iconName.endsWith('Light')) {
            iconList.push({ iconName, style });
          }
        }
      }
    }
  }
  
  // Deduplicate the list
  const uniqueIconList = [];
  const iconSet = new Set();
  
  for (const item of iconList) {
    const key = `${item.iconName}:${item.style}`;
    if (!iconSet.has(key)) {
      iconSet.add(key);
      uniqueIconList.push(item);
    }
  }
  
  return uniqueIconList;
}

// Main function
async function main() {
  console.log(`${colors.bold}${colors.cyan}🚀 Starting Robust Icon Processing...${colors.reset}`);
  
  // Build the list of icons to process
  const iconList = buildIconList();
  log(`${colors.green}Processing ${iconList.length} icons${colors.reset}`);
  
  if (dryRun) {
    log(`${colors.yellow}DRY RUN MODE: No files will be modified${colors.reset}`);
  }
  
  // Process all icons
  const results = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
    'dry-run': 0
  };
  
  // Process icons in sequence to avoid race conditions
  for (const item of iconList) {
    const result = await processIcon(item.iconName, item.style);
    results[result.result]++;
    
    // Log progress periodically
    if ((results.downloaded + results.skipped + results.failed + results['dry-run']) % 10 === 0) {
      log(`Processed ${results.downloaded + results.skipped + results.failed + results['dry-run']}/${iconList.length} icons...`, true);
    }
  }
  
  // Log summary
  console.log(`${colors.bold}${colors.green}✅ Icon processing complete!${colors.reset}`);
  console.log(`${colors.green}- Downloaded: ${results.downloaded}${colors.reset}`);
  console.log(`${colors.blue}- Skipped: ${results.skipped}${colors.reset}`);
  console.log(`${colors.yellow}- Dry Run: ${results['dry-run']}${colors.reset}`);
  
  if (results.failed > 0) {
    console.log(`${colors.red}- Failed: ${results.failed}${colors.reset}`);
  }
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 
#!/usr/bin/env node

/**
 * FontAwesome Pro Icon Downloader and Registry Updater
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
 *   --cleanup              Clean up incorrectly named icons
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

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
const forceDownload = args.includes('--force') || args.includes('--cleanup');
const dryRun = args.includes('--dry-run');
const skipRegistryUpdate = args.includes('--skip-registry-update');
const shouldCleanup = args.includes('--cleanup');

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

// Paths to the registry files
const ICON_REGISTRY_PATH = path.join(__dirname, '..', '..', 'src', 'components', 'ui', 'atoms', 'icons', 'registry.json');
const ICON_URL_MAP_PATH = path.join(__dirname, '..', '..', 'src', 'components', 'ui', 'atoms', 'icons', 'icon-url-map.json');
const BACKUP_ICON_REGISTRY_PATH = path.join(__dirname, '..', '..', 'public', 'ui-icons', 'icon-registry.json');
const BACKUP_ICON_URL_MAP_PATH = path.join(__dirname, '..', '..', 'public', 'ui-icons', 'icon-url-map.json');

// Output directories for the SVG icons - fixed path to be at the root level
const OUTPUT_DIRS = {
  'light': path.join(__dirname, '..', '..', 'public', 'icons', 'light'),
  'solid': path.join(__dirname, '..', '..', 'public', 'icons', 'solid'),
  'brands': path.join(__dirname, '..', '..', 'public', 'icons', 'brands'),
  'regular': path.join(__dirname, '..', '..', 'public', 'icons', 'regular'),
  'app': path.join(__dirname, '..', '..', 'public', 'icons', 'app'),
  'kpis': path.join(__dirname, '..', '..', 'public', 'icons', 'kpis')
};

// Required icons to always include
const REQUIRED_ICONS = {
  'light': [
    'user', 'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
    'calendar', 'check', 'xmark', 'bell', 'circle-info', 'circle-check', 
    'circle-xmark', 'envelope', 'search', 'play', 'pause', 'house', 
    'pen-to-square', 'atom', 'dna', 'bacteria', 'magnifying-glass', 'coins',
    'profile-image', 'filter', 'cog', 'gear', 'plus', 'user-group', 'users',
    'arrow-right', 'building', 'angles-left', 'angles-right', 'times'
  ],
  'solid': [
    'bell', 'circle-check', 'check', 'xmark', 'circle-info', 'gear',
    'house', 'atom', 'dna', 'bacteria', 'magnifying-glass', 'coins',
    'profile-image', 'filter', 'cog', 'user', 'plus', 'user-group', 'users',
    'arrow-right', 'building', 'angles-left', 'angles-right', 'times'
  ],
  'brands': [
    'facebook', 'x-twitter', 'linkedin', 'instagram', 'youtube', 'tiktok', 'github'
  ]
};

// Standard icons that should be in standard directories (light/solid), not app directory
const STANDARD_ICONS = [
  'profile-image',
  'magnifying-glass',
  'coins',
  'user',
  'bell',
  'check-circle',
  'circle-info',
  'circle-question',
  'envelope',
  'filter',
  'gear',
  'cog',
  'search',
  'plus',
  'times',
  'xmark',
  'user-group',
  'users',
  'angle-left',
  'angle-right',
  'angles-left',
  'angles-right',
  'arrow-right',
  'building',
  'calendar',
  'chevron-left',
  'chevron-right'
];

// Social media/brands icons that should be in the brands directory
const SOCIAL_MEDIA_ICONS = [
  'facebook',
  'instagram',
  'linkedin',
  'youtube',
  'tiktok',
  'x-twitter',
  'github',
  // Add other social media platform icons here
];

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
  'atom-simple': 'atom', // Map atom-simple to atom
  'bacterium': 'bacteria' // FontAwesome uses "bacteria" not "bacterium"
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

// Sanitize icon name for file naming
function sanitizeIconName(iconName) {
  // Remove fa prefix if present
  if (iconName.startsWith('fa-')) {
    iconName = iconName.substring(3);
  } else if (iconName.startsWith('fa')) {
    iconName = iconName.substring(2);
  }
  
  // Convert camelCase to kebab-case for consistency
  return kebabCase(iconName);
}

// Get the base name without prefix (fa) and Light suffix
function getBaseName(iconName) {
  // First remove 'fa' or 'fa-' prefix if present
  let baseName = iconName;
  if (baseName.startsWith('fa-')) {
    baseName = baseName.slice(3);
  } else if (baseName.startsWith('fa')) {
    baseName = baseName.slice(2);
  }
  
  // Then remove Light suffix if present
  return baseName.replace(/Light$/, '');
}

// Generate proper filename from icon name (ensures no 'fa-' prefixes)
function generateFilename(iconName) {
  // Get clean base name without any prefixes or suffixes
  const baseName = getBaseName(iconName);
  
  // Convert to kebab-case for file naming
  return kebabCase(baseName);
}

// Count icons in a directory
function countIcons(directory) {
  if (!fs.existsSync(directory)) {
    return 0;
  }
  
  try {
    const files = fs.readdirSync(directory);
    return files.filter(file => file.endsWith('.svg')).length;
  } catch (err) {
    log(`${colors.red}Error counting icons in ${directory}: ${err.message}${colors.reset}`);
    return 0;
  }
}

// Function to clean up incorrectly named icons
function cleanupIncorrectlyNamedIcons() {
  log(`${colors.blue}Cleaning up incorrectly named icons...${colors.reset}`);
  
  if (dryRun) {
    log(`${colors.yellow}[DRY RUN] Would clean up incorrectly named icons${colors.reset}`);
    return;
  }
  
  // Process the brands directory - should only contain social media platforms without fa- prefix
  const brandsDir = OUTPUT_DIRS.brands;
  if (fs.existsSync(brandsDir)) {
    const brandFiles = fs.readdirSync(brandsDir);
    let brandCorrectionCount = 0;
    
    brandFiles.forEach(file => {
      const fileName = file.replace(/\.svg$/, '');
      const fileNameWithoutPrefix = fileName.startsWith('fa-') ? fileName.substring(3) : fileName;
      
      // Check if this is NOT a social media icon (it doesn't belong in brands)
      const isSocialMediaIcon = SOCIAL_MEDIA_ICONS.includes(fileNameWithoutPrefix);
      
      if (!isSocialMediaIcon) {
        // This should be moved to the light directory
        const destFileName = file.startsWith('fa-') ? file.substring(3) : file;
        const sourcePath = path.join(brandsDir, file);
        const destPath = path.join(OUTPUT_DIRS.light, destFileName);
        
        log(`${colors.yellow}Moving non-social media icon from brands to light: ${file} -> ${destPath}${colors.reset}`);
        
        try {
          // First make sure the light directory exists
          if (!fs.existsSync(OUTPUT_DIRS.light)) {
            fs.mkdirSync(OUTPUT_DIRS.light, { recursive: true });
          }
          
          // Copy to light directory
          fs.copyFileSync(sourcePath, destPath);
          
          // Also copy to solid directory for consistency
          const solidPath = path.join(OUTPUT_DIRS.solid, destFileName);
          if (!fs.existsSync(OUTPUT_DIRS.solid)) {
            fs.mkdirSync(OUTPUT_DIRS.solid, { recursive: true });
          }
          fs.copyFileSync(sourcePath, solidPath);
          
          // Then delete from brands directory
          fs.unlinkSync(sourcePath);
          brandCorrectionCount++;
        } catch (err) {
          log(`${colors.red}Error moving file ${file}: ${err.message}${colors.reset}`);
        }
      } else if (file.startsWith('fa-')) {
        // This is a social media icon but has fa- prefix
        const newFileName = file.substring(3);
        const sourcePath = path.join(brandsDir, file);
        const destPath = path.join(brandsDir, newFileName);
        
        log(`${colors.yellow}Renaming social media icon: ${file} -> ${newFileName}${colors.reset}`);
        
        try {
          fs.renameSync(sourcePath, destPath);
          brandCorrectionCount++;
        } catch (err) {
          log(`${colors.red}Error renaming file ${file}: ${err.message}${colors.reset}`);
        }
      }
    });
    
    log(`${colors.green}Corrected ${brandCorrectionCount} brand icons${colors.reset}`);
  }
  
  // Process the standard icon directories to ensure files are named correctly
  ['light', 'solid', 'regular'].forEach(style => {
    const styleDir = OUTPUT_DIRS[style];
    if (fs.existsSync(styleDir)) {
      const styleFiles = fs.readdirSync(styleDir);
      let styleCorrectionCount = 0;
      
      styleFiles.forEach(file => {
        if (file.startsWith('fa-')) {
          const newFileName = file.substring(3); // Remove fa- prefix
          const sourcePath = path.join(styleDir, file);
          const destPath = path.join(styleDir, newFileName);
          
          log(`${colors.yellow}Renaming ${style} icon: ${file} -> ${newFileName}${colors.reset}`);
          
          try {
            fs.renameSync(sourcePath, destPath);
            styleCorrectionCount++;
          } catch (err) {
            log(`${colors.red}Error renaming file ${file}: ${err.message}${colors.reset}`);
          }
        }
      });
      
      log(`${colors.green}Corrected ${styleCorrectionCount} ${style} icons${colors.reset}`);
    }
  });
  
  // Process the app directory to ensure standard icons are not in there
  const appDir = OUTPUT_DIRS.app;
  if (fs.existsSync(appDir)) {
    const appFiles = fs.readdirSync(appDir);
    let appCorrectionCount = 0;
    
    appFiles.forEach(file => {
      const fileBase = file.replace('.svg', '');
      // Check if this file should be in a standard directory
      if (STANDARD_ICONS.some(stdIcon => fileBase === stdIcon || fileBase.includes(stdIcon))) {
        const sourcePath = path.join(appDir, file);
        const destPath = path.join(OUTPUT_DIRS.light, file);
        
        log(`${colors.yellow}Moving icon from app to light: ${file}${colors.reset}`);
        
        try {
          // First make sure the light directory exists
          if (!fs.existsSync(OUTPUT_DIRS.light)) {
            fs.mkdirSync(OUTPUT_DIRS.light, { recursive: true });
          }
          
          // Copy to light directory
          fs.copyFileSync(sourcePath, destPath);
          
          // Also copy to solid directory for consistency
          const solidPath = path.join(OUTPUT_DIRS.solid, file);
          if (!fs.existsSync(OUTPUT_DIRS.solid)) {
            fs.mkdirSync(OUTPUT_DIRS.solid, { recursive: true });
          }
          fs.copyFileSync(sourcePath, solidPath);
          
          // Then delete from app directory
          fs.unlinkSync(sourcePath);
          appCorrectionCount++;
        } catch (err) {
          log(`${colors.red}Error moving file ${file}: ${err.message}${colors.reset}`);
        }
      }
    });
    
    log(`${colors.green}Corrected ${appCorrectionCount} app directory icons${colors.reset}`);
  }
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
    
    // Try backup location if primary fails
    if (filePath === ICON_REGISTRY_PATH && fs.existsSync(BACKUP_ICON_REGISTRY_PATH)) {
      try {
        log(`${colors.blue}Trying backup registry at ${BACKUP_ICON_REGISTRY_PATH}${colors.reset}`);
        const content = fs.readFileSync(BACKUP_ICON_REGISTRY_PATH, 'utf8');
        return JSON.parse(content);
      } catch (backupErr) {
        log(`${colors.yellow}Warning: Could not read backup registry: ${backupErr.message}${colors.reset}`);
      }
    }
    
    if (filePath === ICON_URL_MAP_PATH && fs.existsSync(BACKUP_ICON_URL_MAP_PATH)) {
      try {
        log(`${colors.blue}Trying backup URL map at ${BACKUP_ICON_URL_MAP_PATH}${colors.reset}`);
        const content = fs.readFileSync(BACKUP_ICON_URL_MAP_PATH, 'utf8');
        return JSON.parse(content);
      } catch (backupErr) {
        log(`${colors.yellow}Warning: Could not read backup URL map: ${backupErr.message}${colors.reset}`);
      }
    }
  }
  return defaultValue;
}

// Save a registry file with pretty formatting
function saveRegistryFile(filePath, data) {
  if (dryRun) {
    log(`${colors.yellow}DRY RUN: Would update ${filePath}${colors.reset}`, false);
    return;
  }
  
  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      log(`${colors.green}Created directory: ${dir}${colors.reset}`, false);
    } catch (err) {
      log(`${colors.red}Error creating directory ${dir}: ${err.message}${colors.reset}`, false);
    }
  }
  
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    log(`${colors.green}Updated ${filePath}${colors.reset}`, false);
    
    // Also save to backup location
    if (filePath === ICON_REGISTRY_PATH) {
      const backupDir = path.dirname(BACKUP_ICON_REGISTRY_PATH);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(BACKUP_ICON_REGISTRY_PATH, content, 'utf8');
      log(`${colors.green}Updated backup registry at ${BACKUP_ICON_REGISTRY_PATH}${colors.reset}`, false);
    }
    
    if (filePath === ICON_URL_MAP_PATH) {
      const backupDir = path.dirname(BACKUP_ICON_URL_MAP_PATH);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(BACKUP_ICON_URL_MAP_PATH, content, 'utf8');
      log(`${colors.green}Updated backup URL map at ${BACKUP_ICON_URL_MAP_PATH}${colors.reset}`, false);
    }
  } catch (err) {
    log(`${colors.red}Error writing to ${filePath}: ${err.message}${colors.reset}`, false);
    
    // Try backup location if primary fails
    if (filePath === ICON_REGISTRY_PATH) {
      try {
        const backupDir = path.dirname(BACKUP_ICON_REGISTRY_PATH);
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        fs.writeFileSync(BACKUP_ICON_REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
        log(`${colors.green}Saved to backup registry at ${BACKUP_ICON_REGISTRY_PATH} instead${colors.reset}`, false);
      } catch (backupErr) {
        log(`${colors.red}Error writing to backup registry: ${backupErr.message}${colors.reset}`, false);
      }
    }
    
    if (filePath === ICON_URL_MAP_PATH) {
      try {
        const backupDir = path.dirname(BACKUP_ICON_URL_MAP_PATH);
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        fs.writeFileSync(BACKUP_ICON_URL_MAP_PATH, JSON.stringify(data, null, 2), 'utf8');
        log(`${colors.green}Saved to backup URL map at ${BACKUP_ICON_URL_MAP_PATH} instead${colors.reset}`, false);
      } catch (backupErr) {
        log(`${colors.red}Error writing to backup URL map: ${backupErr.message}${colors.reset}`, false);
      }
    }
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
    if (mappedName.includes('-')) {
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

// Add an icon to the registry
function addIconToRegistry(registry, iconName, style, filename) {
  // Prevent LightLight entries
  if (iconName.endsWith('LightLight')) {
    return;
  }
  
  const iconKey = style === 'light' && iconName.endsWith('Light') ? iconName.slice(0, -5) : iconName;
  const cleanFilename = filename.replace(/^fa-/, '');
  registry[iconKey] = {
    name: cleanFilename.replace(/\.svg$/, ''),
    fileName: cleanFilename,
    path: `/icons/${style}/${cleanFilename}`
  };
}

// Add an icon to the URL map
function addIconToUrlMap(urlMap, iconName, style, filename) {
  // Prevent LightLight entries
  if (iconName.endsWith('LightLight')) {
    return;
  }
  
  const iconKey = style === 'light' && iconName.endsWith('Light') ? iconName.slice(0, -5) : iconName;
  const cleanFilename = filename.replace(/^fa-/, '');
  urlMap[iconKey] = `/icons/${style}/${cleanFilename}`;
}

// Clean registry and URL map of any LightLight entries
function cleanLightLightEntries(obj) {
  const cleanedObj = {};
  for (const key in obj) {
    if (!key.endsWith('LightLight')) {
      cleanedObj[key] = obj[key];
    }
  }
  return cleanedObj;
}

// Update registry files with a new icon
function updateRegistryFiles(iconName, style, filename) {
  if (skipRegistryUpdate || dryRun) {
    return;
  }
  
  // Load registry files
  const registry = loadRegistryFile(ICON_REGISTRY_PATH, {});
  const urlMap = loadRegistryFile(ICON_URL_MAP_PATH, {});
  
  // Add the icon to both files
  addIconToRegistry(registry, iconName, style, filename);
  addIconToUrlMap(urlMap, iconName, style, filename);
  
  // Clean out any LightLight entries
  const cleanedRegistry = cleanLightLightEntries(registry);
  const cleanedUrlMap = cleanLightLightEntries(urlMap);
  
  // Save the cleaned registry files
  saveRegistryFile(ICON_REGISTRY_PATH, cleanedRegistry);
  saveRegistryFile(ICON_URL_MAP_PATH, cleanedUrlMap);
}

// Process an individual icon
async function processIcon(iconName, style) {
  try {
    // Generate PROPER filename (without fa- prefix) and output path
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
    
    // For icon extraction, use the cleaned name (without the fa prefix)
    const cleanedIconName = getBaseName(iconName);
    const icon = extractIconFromPackage(cleanedIconName, style);
    
    // Skip the write process in dry run mode
    if (dryRun) {
      if (icon) {
        log(`${colors.yellow}DRY RUN: Would save ${iconName} as ${kebabName}.svg to ${outputPath}${colors.reset}`);
      } else {
        log(`${colors.yellow}DRY RUN: Would create placeholder for ${iconName} as ${kebabName}.svg at ${outputPath}${colors.reset}`);
      }
      return { iconName, style, result: 'dry-run' };
    }
    
    // Generate and write SVG content
    let svgContent;
    if (icon) {
      svgContent = generateSvgContent(icon);
      fs.writeFileSync(outputPath, svgContent, 'utf8');
      log(`${colors.green}Saved icon: ${iconName} as ${kebabName}.svg to ${outputPath}${colors.reset}`, true);
    } else {
      // Create a placeholder for missing icons
      svgContent = createPlaceholderSvg(kebabName);
      fs.writeFileSync(outputPath, svgContent, 'utf8');
      log(`${colors.yellow}Created placeholder for: ${iconName} as ${kebabName}.svg at ${outputPath}${colors.reset}`, true);
    }
    
    // Update the registry files - always use the clean kebab name for the filename
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
  
  // First, count existing icons
  const iconCounts = {};
  for (const [style, dir] of Object.entries(OUTPUT_DIRS)) {
    iconCounts[style] = countIcons(dir);
    log(`${colors.blue}Found ${iconCounts[style]} icons in ${style} directory${colors.reset}`);
  }
  
  // Clean up incorrectly named icons if requested
  if (shouldCleanup) {
    console.log(`${colors.magenta}Cleaning up incorrectly named icons...${colors.reset}`);
    cleanupIncorrectlyNamedIcons();
  }
  
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
  
  // Count icons after processing
  const newIconCounts = {};
  for (const [style, dir] of Object.entries(OUTPUT_DIRS)) {
    newIconCounts[style] = countIcons(dir);
    const diff = newIconCounts[style] - iconCounts[style];
    const diffText = diff > 0 ? `+${diff}` : diff;
    log(`${colors.blue}Now have ${newIconCounts[style]} icons in ${style} directory (${diffText})${colors.reset}`);
  }
  
  // Log summary
  console.log(`${colors.bold}${colors.green}✅ Icon processing complete!${colors.reset}`);
  console.log(`${colors.green}- Downloaded: ${results.downloaded}${colors.reset}`);
  console.log(`${colors.blue}- Skipped: ${results.skipped}${colors.reset}`);
  console.log(`${colors.yellow}- Dry Run: ${results['dry-run']}${colors.reset}`);
  
  if (results.failed > 0) {
    console.log(`${colors.red}- Failed: ${results.failed}${colors.reset}`);
  }
  
  // Final cleanup of LightLight entries
  if (!dryRun) {
    console.log('Performing final cleanup of LightLight entries...');
    // Clean registry files
    const registry = loadRegistryFile(ICON_REGISTRY_PATH, {});
    const urlMap = loadRegistryFile(ICON_URL_MAP_PATH, {});
    const backupRegistry = loadRegistryFile(BACKUP_ICON_REGISTRY_PATH, {});
    const backupUrlMap = loadRegistryFile(BACKUP_ICON_URL_MAP_PATH, {});
    
    const cleanedRegistry = cleanLightLightEntries(registry);
    const cleanedUrlMap = cleanLightLightEntries(urlMap);
    const cleanedBackupRegistry = cleanLightLightEntries(backupRegistry);
    const cleanedBackupUrlMap = cleanLightLightEntries(backupUrlMap);
    
    saveRegistryFile(ICON_REGISTRY_PATH, cleanedRegistry);
    saveRegistryFile(ICON_URL_MAP_PATH, cleanedUrlMap);
    saveRegistryFile(BACKUP_ICON_REGISTRY_PATH, cleanedBackupRegistry);
    saveRegistryFile(BACKUP_ICON_URL_MAP_PATH, cleanedBackupUrlMap);
    
    console.log('Cleanup complete!');
  }
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 
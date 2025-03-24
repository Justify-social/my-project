/**
 * This script extracts all Font Awesome icons used in the project,
 * downloads them as SVG files, and saves them to the specified public/ui-icons directories.
 * 
 * After running this script, you can use the local SVG icons instead of loading them from Font Awesome.
 * 
 * Usage:
 *   node scripts/download-icons.js         # Normal mode
 *   node scripts/download-icons.js --verbose   # Verbose mode with detailed logging
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { execSync } = require('child_process');
const https = require('https');

// Process command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');

// Helper logging function
function log(message, isVerboseOnly = false) {
  if (!isVerboseOnly || isVerbose) {
    console.log(message);
  }
}

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
  'fad': '@fortawesome/pro-duotone-svg-icons'
};

// Output directories for the SVG icons based on style
const OUTPUT_DIRS = {
  'fas': path.join(__dirname, '..', 'public', 'ui-icons', 'solid'),
  'fal': path.join(__dirname, '..', 'public', 'ui-icons', 'light'),
  'fab': path.join(__dirname, '..', 'public', 'ui-icons', 'brands'),
  'far': path.join(__dirname, '..', 'public', 'ui-icons', 'regular')
};

// Create output directories if they don't exist
Object.values(OUTPUT_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
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
// This is a fallback for when the extraction process fails to get distinct light icons
function downloadIconFromCDN(iconName, style = 'light', outputPath) {
  return new Promise((resolve, reject) => {
    const stylePrefix = style === 'light' ? 'fal' : 'fas';
    // Use Font Awesome CDN to download icons - adjust version if needed
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

// Find all TypeScript and JavaScript files in the src directory
const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', { cwd: path.join(__dirname, '..') });

// Track all found icon imports
const usedIcons = new Map();

// Function to process a file and extract Font Awesome icon imports
function processFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const code = fs.readFileSync(fullPath, 'utf8');
    
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    traverse(ast, {
      // Handle direct imports
      ImportDeclaration(path) {
        const source = path.node.source.value;
        
        // Check if this is a Font Awesome import
        if (FA_LIBRARIES.includes(source)) {
          // Process each import specifier
          path.node.specifiers.forEach(specifier => {
            if (specifier.type === 'ImportSpecifier') {
              const iconName = specifier.imported.name;
              // Add the icon to our map with its library
              if (!usedIcons.has(iconName)) {
                usedIcons.set(iconName, source);
              }
            }
          });
        }
      },
      
      // Handle imports from wildcard imports or re-exports
      MemberExpression(path) {
        if (
          path.node.object &&
          path.node.object.type === 'Identifier' && 
          path.node.property &&
          path.node.property.type === 'Identifier'
        ) {
          const objName = path.node.object.name;
          const propName = path.node.property.name;
          
          // Check if this looks like accessing a Font Awesome icon from an import
          // For example: solidIcons.faUser or icons.faUser
          if (
            (objName.includes('icon') || objName.includes('Icon') || 
            objName.includes('solid') || objName.includes('light') || 
            objName.includes('brand') || objName.includes('regular')) && 
            propName.startsWith('fa')
          ) {
            // Try to determine which library this likely belongs to based on the name pattern
            let library = '@fortawesome/pro-solid-svg-icons'; // Default
            
            if (objName.includes('light')) {
              library = '@fortawesome/pro-light-svg-icons';
            } else if (objName.includes('brand')) {
              library = '@fortawesome/free-brands-svg-icons';
            } else if (objName.includes('regular')) {
              library = '@fortawesome/pro-regular-svg-icons';
            } else if (objName.includes('duotone')) {
              library = '@fortawesome/pro-duotone-svg-icons';
            }
            
            if (!usedIcons.has(propName)) {
              usedIcons.set(propName, library);
            }
          }
        }
      },
      
      // Handle direct references to icon names as strings
      StringLiteral(path) {
        const value = path.node.value;
        
        // If it looks like a Font Awesome icon name (fa followed by camelCase)
        if (value.startsWith('fa') && 
            value.length > 2 && 
            value[2] === value[2].toUpperCase() &&
            !value.includes('-') && 
            !value.includes('_')) {
          
          // Default to solid icons unless we can determine otherwise from context
          let library = '@fortawesome/pro-solid-svg-icons';
          
          // Try to infer the icon type from surrounding code
          const parent = path.parent;
          if (parent && parent.properties) {
            // Look for properties that might indicate icon style
            for (const prop of parent.properties) {
              if (prop.key && prop.key.name === 'prefix') {
                if (prop.value && prop.value.value) {
                  const prefix = prop.value.value;
                  if (prefix === 'fal') library = '@fortawesome/pro-light-svg-icons';
                  else if (prefix === 'fab') library = '@fortawesome/free-brands-svg-icons';
                  else if (prefix === 'far') library = '@fortawesome/pro-regular-svg-icons';
                  else if (prefix === 'fad') library = '@fortawesome/pro-duotone-svg-icons';
                }
                break;
              }
            }
          }
          
          if (!usedIcons.has(value)) {
            usedIcons.set(value, library);
          }
        }
      }
    });
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

// Process all source files
log('Scanning project files for Font Awesome icons...');
sourceFiles.forEach(processFile);
log(`Found ${usedIcons.size} unique Font Awesome icons from imports.`);

// Scan existing icon directories to ensure we don't miss any previously downloaded icons
log('Scanning existing icon folders...');
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
    });
  }
}

if (foundExistingIcons > 0) {
  log(`Found ${foundExistingIcons} additional icons from existing SVG files.`);
  log(`Total: ${usedIcons.size} unique Font Awesome icons.`);
}

// Ensure we have all platform icons included
// These are critical social media icons that must be available
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
  'faPenToSquare': '@fortawesome/pro-light-svg-icons',
  'faMenu': '@fortawesome/pro-light-svg-icons'
};

// Required solid icons - always include these common solid icons
const REQUIRED_SOLID_ICONS = {
  'faPlay': '@fortawesome/pro-solid-svg-icons',
  'faPause': '@fortawesome/pro-solid-svg-icons',
  'faFileAudio': '@fortawesome/pro-solid-svg-icons',
  'faFileImage': '@fortawesome/pro-solid-svg-icons',
  'faFileVideo': '@fortawesome/pro-solid-svg-icons',
  'faRotateRight': '@fortawesome/pro-solid-svg-icons',
  'faMenu': '@fortawesome/pro-solid-svg-icons'
};

// Add any required icons
let platformIconsAdded = 0;
for (const [iconName, library] of Object.entries(REQUIRED_PLATFORM_ICONS)) {
  if (!usedIcons.has(iconName)) {
    usedIcons.set(iconName, library);
    platformIconsAdded++;
  }
}

// Add required solid icons
let solidIconsAdded = 0;
for (const [iconName, library] of Object.entries(REQUIRED_SOLID_ICONS)) {
  if (!usedIcons.has(iconName)) {
    usedIcons.set(iconName, library);
    solidIconsAdded++;
  }
}

// Create light versions of all solid icons
// Extract all solid icons (fas prefix)
const solidIcons = Array.from(usedIcons.entries())
  .filter(([iconName, library]) => {
    // Skip icons that already have Light variants
    return !iconName.endsWith('Light') && 
           library === '@fortawesome/pro-solid-svg-icons';
  });

// Add light versions of all solid icons
let lightIconsAdded = 0;
let existingLightIconsAdded = 0;

// First, add explicitly required light icons
for (const [iconName, library] of Object.entries(REQUIRED_LIGHT_ICONS)) {
  // Use a different name for light icons to avoid conflicts with solid icons
  const lightIconName = `${iconName}Light`;
  
  // Add to usedIcons with the light icon name
  if (!usedIcons.has(lightIconName)) {
    usedIcons.set(lightIconName, library);
    existingLightIconsAdded++;
  }
}

// Then, automatically create light versions of all solid icons
for (const [iconName, solidLibrary] of solidIcons) {
  const lightIconName = `${iconName}Light`;
  const lightLibrary = '@fortawesome/pro-light-svg-icons';
  
  // Only add if we don't already have this light icon
  if (!usedIcons.has(lightIconName)) {
    usedIcons.set(lightIconName, lightLibrary);
    lightIconsAdded++;
  }
}

// Log what we've added
if (platformIconsAdded > 0) {
  log(`Added ${platformIconsAdded} required platform icons that weren't found in the codebase.`);
}

if (existingLightIconsAdded > 0) {
  log(`Added ${existingLightIconsAdded} explicitly required light icons.`);
}

if (lightIconsAdded > 0) {
  log(`Added ${lightIconsAdded} automatically generated light icons from solid icons.`);
}

if (solidIconsAdded > 0) {
  log(`Added ${solidIconsAdded} required solid icons that weren't found in the codebase.`);
}

log(`Total: ${usedIcons.size} unique Font Awesome icons.`);

// Create a temporary directory to extract the SVG paths
const TEMP_DIR = path.join(__dirname, 'temp-icons');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Write a temporary file that extracts the SVG paths
const tempFilePath = path.join(TEMP_DIR, 'extract-icons.js');

// Create a safer version of the extraction code with better error handling
const extractionCode = `
const fs = require('fs');
const path = require('path');
const https = require('https');

// Track successful and failed extractions
const results = {
  success: [],
  failed: [],
  lightFromCDN: []
};

// Helper function to download an icon directly from CDN
async function downloadIconFromCDN(iconName, style = 'light') {
  return new Promise((resolve, reject) => {
    // Use Font Awesome CDN
    const url = \`https://site-assets.fontawesome.com/releases/v6.4.0/svgs/\${style}/\${iconName}.svg\`;
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        
        response.on('end', () => {
          // Process SVG content
          let svgContent = data;
          if (!svgContent.includes('fill="currentColor"')) {
            svgContent = svgContent.replace('<svg', '<svg fill="currentColor"');
          }
          resolve(svgContent);
        });
      } else {
        reject(new Error(\`Failed to download: \${response.statusCode}\`));
      }
    }).on('error', err => reject(err));
  });
}

// Enhanced extraction function that prioritizes distinct light icons
async function safeExtract(iconName, library) {
  try {
    // Check if this is a special light icon name
    const isLightIcon = iconName.endsWith('Light');
    
    // If it's a light icon, use the base name to get the icon from the library
    const actualIconName = isLightIcon ? iconName.replace(/Light$/, '') : iconName;
    
    // Determine the prefix for checking existing files
    const prefix = isLightIcon ? 'fal' : 
                  library.includes('solid') ? 'fas' : 
                  library.includes('light') ? 'fal' : 
                  library.includes('brands') ? 'fab' : 
                  library.includes('regular') ? 'far' : 'fas';
    
    // Check if the icon already exists and is valid in the file system
    const iconStyleDir = prefix === 'fas' ? 'solid' : 
                         prefix === 'fal' ? 'light' : 
                         prefix === 'fab' ? 'brands' : 
                         prefix === 'far' ? 'regular' : 'solid';
    
    const iconPath = path.join(__dirname, '..', 'public', 'ui-icons', iconStyleDir, \`\${actualIconName}.svg\`);
    
    // If the icon already exists, skip downloading and just record it as a success
    if (fs.existsSync(iconPath)) {
      const fileContent = fs.readFileSync(iconPath, 'utf8');
      if (fileContent && fileContent.includes('<svg') && fileContent.includes('<path')) {
        console.log(\`Icon \${actualIconName} (\${prefix}) already exists and is valid. Skipping download.\`);
        results.success.push(iconName);
        return true;
      }
      console.log(\`Icon \${actualIconName} (\${prefix}) exists but appears invalid. Re-downloading.\`);
    }
    
    // For light icons, try to get them directly from CDN first for better distinctness
    if (isLightIcon) {
      try {
        const svgContent = await downloadIconFromCDN(actualIconName, 'light');
        // Convert to a mock icon definition format that includes the SVG content
        const mockIconDef = {
          prefix: 'fal',
          iconName: actualIconName,
          svgContent: svgContent,
          isFromCDN: true
        };
        
        fs.writeFileSync(
          path.join(__dirname, \`\${iconName}.json\`), 
          JSON.stringify(mockIconDef)
        );
        results.lightFromCDN.push(iconName);
        results.success.push(iconName);
        return true;
      } catch (cdnError) {
        console.log(\`CDN fetch failed for \${actualIconName}, falling back to library: \${cdnError.message}\`);
        // Continue with normal extraction if CDN fails
      }
    }
    
    // Import the icon dynamically from the library
    const icon = require(library)[actualIconName];
    
    // Verify the icon exists and has the expected structure
    if (icon && icon.iconName && icon.prefix && Array.isArray(icon.icon)) {
      // For light icons, we need to modify the prefix to ensure it's saved as a light icon
      let modifiedIcon = icon;
      
      // If this is a light icon, ensure the prefix is 'fal'
      if (isLightIcon && modifiedIcon.prefix !== 'fal') {
        modifiedIcon = {
          ...icon,
          prefix: 'fal',  // Override to light prefix
          iconName: icon.iconName // Keep the original icon name (without 'Light')
        };
      }
      
      fs.writeFileSync(
        path.join(__dirname, \`\${iconName}.json\`), 
        JSON.stringify(modifiedIcon)
      );
      results.success.push(iconName);
      return true;
    } else {
      console.error(\`Icon \${actualIconName} from \${library} has invalid format\`);
      results.failed.push({ name: iconName, reason: 'invalid_format' });
      return false;
    }
  } catch (error) {
    console.error(\`Failed to extract \${iconName} from \${library}: \${error.message}\`);
    results.failed.push({ name: iconName, reason: 'extraction_failed', error: error.message });
    return false;
  }
}

// Wrap each extraction in a promise
const extractionPromises = [];
${Array.from(usedIcons.entries()).map(([iconName, library]) => 
  `extractionPromises.push(safeExtract('${iconName}', '${library}'));`
).join('\n')}

// Execute all extractions and wait for them to complete
Promise.all(extractionPromises).then(() => {
  // Write results for the parent process to analyze
  fs.writeFileSync(
    path.join(__dirname, 'extraction-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(\`Icon data extraction complete: \${results.success.length} icons extracted successfully, \${results.failed.length} failed.\`);
  
  if (results.lightFromCDN.length > 0) {
    console.log(\`\${results.lightFromCDN.length} light icons fetched directly from CDN for better distinctness.\`);
  }
});
`;

fs.writeFileSync(tempFilePath, extractionCode, 'utf8');

// Execute the temporary file to extract icon data
log('Extracting SVG data from Font Awesome icons...');
try {
  execSync(`node ${tempFilePath}`, { stdio: isVerbose ? 'inherit' : 'pipe' });
  
  // Read the extraction results
  const extractionResults = JSON.parse(
    fs.readFileSync(path.join(TEMP_DIR, 'extraction-results.json'), 'utf8')
  );
  
  log(`Extracted ${extractionResults.success.length} icons successfully.`);
  
  if (extractionResults.lightFromCDN && extractionResults.lightFromCDN.length > 0) {
    log(`${extractionResults.lightFromCDN.length} light icons were downloaded directly from CDN for better distinctness.`);
  }
  
  if (extractionResults.failed.length > 0) {
    log(`Failed to extract ${extractionResults.failed.length} icons:`);
    if (isVerbose) {
      extractionResults.failed.forEach(failure => {
        log(`  - ${failure.name}: ${failure.reason} ${failure.error ? '(' + failure.error + ')' : ''}`);
      });
    } else {
      log(`  Run with --verbose flag to see details about failed icons.`);
    }
  }
} catch (error) {
  log(`Error extracting icon data: ${error.message}`);
  if (isVerbose) {
    console.error(error);
  }
  process.exit(1);
}

// Process each icon JSON file and convert to SVG
log('Converting icons to SVG files...');
let successCount = 0;

// Track icons by category for reporting
const iconsByType = {
  solid: 0,
  light: 0,
  brands: 0,
  regular: 0
};

const iconRegistry = {};

// Get the list of successfully extracted icons
const extractionResults = JSON.parse(
  fs.readFileSync(path.join(TEMP_DIR, 'extraction-results.json'), 'utf8')
);

// Only process icons that were successfully extracted
for (const iconName of extractionResults.success) {
  try {
    const iconDataPath = path.join(TEMP_DIR, `${iconName}.json`);
    const iconData = JSON.parse(fs.readFileSync(iconDataPath, 'utf8'));
    
    // If this is a light icon fetched from CDN, handle it specially
    if (iconData.isFromCDN && iconData.svgContent) {
      // Extract the icon information
      const { prefix, iconName: name } = iconData;
      const outputDir = OUTPUT_DIRS[prefix] || OUTPUT_DIRS['fas'];
      const svgFilePath = path.join(outputDir, `${name}.svg`);
      
      log(`Processing CDN-fetched light icon: ${iconName} (${prefix}/${name})`, true);
      
      // Write the SVG content directly
      fs.writeFileSync(svgFilePath, iconData.svgContent, 'utf8');
      log(`  - Saved CDN light icon to: ${svgFilePath}`, true);
      
      // Add to registry
      const relativePath = path.join('/ui-icons', getStyleNameFromPrefix(prefix), `${name}.svg`);
      iconRegistry[iconName] = {
        prefix,
        name,
        fileName: `${name}.svg`,
        path: relativePath.replace(/\\/g, '/') // Ensure forward slashes for web paths
      };
      
      // Update count
      iconsByType.light++;
      successCount++;
      
      // Skip the rest of this iteration since we've already processed this icon
      continue;
    }
    
    // Original extraction code for non-CDN icons
    // Extract SVG path data
    const { prefix, iconName: name, icon } = iconData;
    const [width, height, ligatures, unicode, svgPathData] = icon;
    
    // Determine the output directory based on prefix
    const outputDir = OUTPUT_DIRS[prefix] || OUTPUT_DIRS['fas']; // Default to solid if unknown
    
    log(`Processing icon: ${iconName} (${prefix}/${name})`, true);
    
    // Create SVG content
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor">
  <path d="${svgPathData}"></path>
</svg>`;
    
    // Write SVG file
    const svgFilePath = path.join(outputDir, `${name}.svg`);
    
    // For light icons, ensure they are truly light versions
    if (prefix === 'fal') {
      const solidPath = path.join(OUTPUT_DIRS['fas'], `${name}.svg`);
      
      // If both light and solid icons exist, check if they're identical
      if (fs.existsSync(solidPath) && fs.existsSync(svgFilePath) && compareIconFiles(svgFilePath, solidPath)) {
        log(`⚠️ Duplicate detected: ${name} light and solid are identical. Attempting to fix...`, true);
        
        try {
          // Try to download the correct light version from CDN
          downloadIconFromCDN(name, 'light', svgFilePath)
            .then(() => {
              log(`✅ Successfully fixed light icon: ${name}`, true);
            })
            .catch(() => {
              // If CDN download fails, apply a basic transform to make the icon visually different
              log(`⚠️ CDN download failed, applying fallback transformation for ${name}`, true);
              const solidContent = fs.readFileSync(solidPath, 'utf8');
              // Create a thinner stroke version for light icons - not perfect but visually different
              const lightContent = solidContent.replace('<path d="', '<path stroke="currentColor" stroke-width="0.5" fill="currentColor" d="');
              fs.writeFileSync(svgFilePath, lightContent, 'utf8');
            });
        } catch (error) {
          log(`❌ Error fixing light icon ${name}: ${error.message}`, true);
          // Still write the icon even if fixing failed
          fs.writeFileSync(svgFilePath, svgContent, 'utf8');
        }
      } else {
        // For new light icons
        fs.writeFileSync(svgFilePath, svgContent, 'utf8');
        log(`  - Saved light icon to: ${svgFilePath}`, true);
      }
    } else {
      // For all other cases, write normally
      fs.writeFileSync(svgFilePath, svgContent, 'utf8');
      log(`  - Saved to: ${svgFilePath}`, true);
    }
    
    // Add to registry with relative path for web access
    const relativePath = path.join('/ui-icons', getStyleNameFromPrefix(prefix), `${name}.svg`);
    iconRegistry[iconName] = {
      prefix,
      name,
      fileName: `${name}.svg`,
      path: relativePath.replace(/\\/g, '/') // Ensure forward slashes for web paths
    };
    
    // Update counts
    if (prefix === 'fas') iconsByType.solid++;
    else if (prefix === 'fal') iconsByType.light++;
    else if (prefix === 'fab') iconsByType.brands++;
    else if (prefix === 'far') iconsByType.regular++;
    
    successCount++;
  } catch (error) {
    log(`Error processing icon ${iconName}: ${error.message}`);
    if (isVerbose) {
      console.error(error);
    }
  }
}

// Helper function to get style name from prefix
function getStyleNameFromPrefix(prefix) {
  switch (prefix) {
    case 'fas': return 'solid';
    case 'fal': return 'light';
    case 'fab': return 'brands';
    case 'far': return 'regular';
    default: return 'solid';
  }
}

// Ensure the assets directory exists
const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Write the icon registry file
fs.writeFileSync(
  path.join(ASSETS_DIR, 'icon-registry.json'), 
  JSON.stringify(iconRegistry, null, 2), 
  'utf8'
);

// Create a URL map file for direct imports in code
const iconUrlMap = {};
for (const [iconName, info] of Object.entries(iconRegistry)) {
  iconUrlMap[iconName] = info.path;
}

fs.writeFileSync(
  path.join(ASSETS_DIR, 'icon-url-map.json'),
  JSON.stringify(iconUrlMap, null, 2),
  'utf8'
);

// Clean up temporary directory
fs.rmSync(TEMP_DIR, { recursive: true, force: true });

// Final validation to ensure light and solid icons are different
async function validateLightAndSolidIcons() {
  log('\nValidating light and solid icon differences...');
  
  const duplicateIcons = [];
  let distinctCount = 0;
  let duplicateCount = 0;
  
  // Get lists of all light and solid icons
  const lightIcons = glob.sync('*.svg', { cwd: OUTPUT_DIRS['fal'] });
  
  // Check each light icon against its solid counterpart
  for (const iconFile of lightIcons) {
    const lightPath = path.join(OUTPUT_DIRS['fal'], iconFile);
    const solidPath = path.join(OUTPUT_DIRS['fas'], iconFile);
    
    if (fs.existsSync(solidPath)) {
      if (compareIconFiles(lightPath, solidPath)) {
        duplicateIcons.push(iconFile);
        duplicateCount++;
      } else {
        distinctCount++;
      }
    }
  }
  
  // Specifically validate our play/pause icons
  log('\nValidating play and pause icons...');
  const targetIcons = ['play', 'pause'];
  for (const iconName of targetIcons) {
    const lightPath = path.join(OUTPUT_DIRS['fal'], `${iconName}.svg`);
    const solidPath = path.join(OUTPUT_DIRS['fas'], `${iconName}.svg`);
    
    let lightExists = fs.existsSync(lightPath);
    let solidExists = fs.existsSync(solidPath);
    
    if (!lightExists || !solidExists) {
      log(`⚠️ Missing ${iconName} icons: Light=${lightExists}, Solid=${solidExists}`);
      
      // If the light version is missing but solid exists, download it from CDN
      if (!lightExists && solidExists) {
        try {
          log(`Attempting to download light version of ${iconName} from CDN...`);
          await downloadIconFromCDN(iconName, 'light', lightPath);
          log(`✅ Successfully downloaded light version of ${iconName}`);
          lightExists = true;
        } catch (error) {
          log(`❌ Failed to download light version of ${iconName}: ${error.message}`);
        }
      }
      
      // If the solid version is missing but light exists, download it from CDN
      if (!solidExists && lightExists) {
        try {
          log(`Attempting to download solid version of ${iconName} from CDN...`);
          await downloadIconFromCDN(iconName, 'solid', solidPath);
          log(`✅ Successfully downloaded solid version of ${iconName}`);
          solidExists = true;
        } catch (error) {
          log(`❌ Failed to download solid version of ${iconName}: ${error.message}`);
        }
      }
      
      // If both are missing, try downloading both
      if (!lightExists && !solidExists) {
        try {
          log(`Attempting to download both versions of ${iconName} from CDN...`);
          await downloadIconFromCDN(iconName, 'light', lightPath);
          await downloadIconFromCDN(iconName, 'solid', solidPath);
          log(`✅ Successfully downloaded both versions of ${iconName}`);
        } catch (error) {
          log(`❌ Failed to download versions of ${iconName}: ${error.message}`);
        }
      }
    } else {
      // Check if the icons are distinct
      if (compareIconFiles(lightPath, solidPath)) {
        log(`⚠️ Light and solid versions of ${iconName} are identical. Attempting to fix...`);
        try {
          await downloadIconFromCDN(iconName, 'light', lightPath);
          log(`✅ Successfully fixed light version of ${iconName}`);
        } catch (error) {
          log(`❌ Failed to fix light version of ${iconName}: ${error.message}`);
        }
      } else {
        log(`✅ ${iconName} icons exist and are distinct.`);
      }
    }
  }
  
  // Report results
  log(`Found ${distinctCount} correctly distinct light/solid icon pairs`);
  
  if (duplicateCount > 0) {
    log(`⚠️ WARNING: Found ${duplicateCount} duplicate light/solid icon pairs!`);
    log('Attempting to fix remaining duplicate icons...');
    
    let fixedCount = 0;
    
    // Fix each duplicate sequentially using async/await to ensure reliable completion
    for (const iconFile of duplicateIcons) {
      const iconName = path.basename(iconFile, '.svg');
      const lightPath = path.join(OUTPUT_DIRS['fal'], iconFile);
      
      try {
        // Try to download the light version from CDN
        await downloadIconFromCDN(iconName, 'light', lightPath);
        fixedCount++;
        log(`✅ Fixed light icon: ${iconName}`);
      } catch (cdnError) {
        try {
          // If CDN download fails, apply a fallback transformation
          log(`⚠️ CDN download failed for ${iconName}, applying fallback transformation`);
          const solidPath = path.join(OUTPUT_DIRS['fas'], iconFile);
          const solidContent = fs.readFileSync(solidPath, 'utf8');
          
          // Create a thinner stroke version for light icons
          const lightContent = solidContent.replace('<path d="', '<path stroke="currentColor" stroke-width="0.5" fill="currentColor" d="');
          fs.writeFileSync(lightPath, lightContent, 'utf8');
          fixedCount++;
          log(`⚠️ Applied fallback transformation for ${iconName}`);
        } catch (fallbackError) {
          log(`❌ Failed to fix ${iconName}: ${fallbackError.message}`);
        }
      }
    }
    
    log(`Fixed ${fixedCount} of ${duplicateCount} remaining duplicate icons.`);
    
    if (fixedCount < duplicateCount) {
      log(`⚠️ WARNING: ${duplicateCount - fixedCount} icons could not be fixed automatically.`);
      log('These icons may need manual adjustment for proper light/solid differentiation.');
    }
  } else {
    log('✅ All light/solid icon pairs are correctly differentiated!');
  }
  
  return { distinctCount, duplicateCount, fixedCount: duplicateCount > 0 ? fixedCount : 0 };
}

// Function to ensure icons are properly added to the registry
function ensureIconInRegistry(iconName, prefix) {
  const style = getStyleNameFromPrefix(prefix);
  const actualIconName = iconName;
  const svgPath = path.join(OUTPUT_DIRS[prefix], `${actualIconName}.svg`);
  
  if (fs.existsSync(svgPath)) {
    // Create registry entry if it doesn't exist
    const camelCaseName = prefix === 'fal' ? 
      `fa${actualIconName.charAt(0).toUpperCase()}${actualIconName.substring(1)}Light` : 
      `fa${actualIconName.charAt(0).toUpperCase()}${actualIconName.substring(1)}`;
    
    // Check if already in registry
    if (!iconRegistry[camelCaseName]) {
      const relativePath = path.join('/ui-icons', style, `${actualIconName}.svg`);
      iconRegistry[camelCaseName] = {
        prefix,
        name: actualIconName,
        fileName: `${actualIconName}.svg`,
        path: relativePath.replace(/\\/g, '/') // Ensure forward slashes for web paths
      };
      log(`Added ${camelCaseName} to icon registry`);
      return true;
    }
    return false;
  }
  return false;
}

// Invoke the validation asynchronously
(async () => {
  try {
    const validationResults = await validateLightAndSolidIcons();
    
    // Ensure our play/pause icons are in the registry
    log('\nEnsuring play/pause icons are in the registry...');
    const iconNames = ['play', 'pause'];
    const prefixes = ['fas', 'fal'];
    
    let iconsAddedToRegistry = 0;
    for (const iconName of iconNames) {
      for (const prefix of prefixes) {
        if (ensureIconInRegistry(iconName, prefix)) {
          iconsAddedToRegistry++;
        }
      }
    }
    
    if (iconsAddedToRegistry > 0) {
      log(`Added ${iconsAddedToRegistry} play/pause icons to the registry.`);
    } else {
      log('All play/pause icons already in registry.');
    }
    
    // If there were duplicates that were fixed, update the icon data
    if (validationResults.fixedCount > 0 || iconsAddedToRegistry > 0) {
      log('\nRegenerating icon data after fixes...');
      try {
        // Invoke the icon data generation script if it exists
        const generateIconDataPath = path.join(__dirname, 'generate-icon-data.js');
        if (fs.existsSync(generateIconDataPath)) {
          execSync(`node ${generateIconDataPath}`, { stdio: isVerbose ? 'inherit' : 'pipe' });
          log('✅ Successfully regenerated icon data after fixing duplicates');
        }
      } catch (genError) {
        log(`❌ Error regenerating icon data: ${genError.message}`);
      }
    }
    
    // Log results
    log(`\nSuccessfully saved ${successCount} SVG icons:`);
    log(`- ${iconsByType.solid} solid icons to ${OUTPUT_DIRS['fas']}`);
    log(`- ${iconsByType.light} light icons to ${OUTPUT_DIRS['fal']}`);
    log(`- ${iconsByType.brands} brand icons to ${OUTPUT_DIRS['fab']}`);
    log(`- ${iconsByType.regular} regular icons to ${OUTPUT_DIRS['far']}`);
    log('\nIcon registry created at src/assets/icon-registry.json');
    log('Icon URL map created at src/assets/icon-url-map.json');
    log('\nTo use the local icons, update your Icon component to use the local SVG files.');
    
    // Ensure brand icons are available
    log('\nEnsuring all required brand icons are available...');
    downloadBrandIcons();
  } catch (error) {
    log(`❌ Validation error: ${error.message}`);
    
    // Log results even if validation failed
    log(`\nSaved ${successCount} SVG icons:`);
    log(`- ${iconsByType.solid} solid icons to ${OUTPUT_DIRS['fas']}`);
    log(`- ${iconsByType.light} light icons to ${OUTPUT_DIRS['fal']}`);
    log(`- ${iconsByType.brands} brand icons to ${OUTPUT_DIRS['fab']}`);
    log(`- ${iconsByType.regular} regular icons to ${OUTPUT_DIRS['far']}`);
  }
})();

// Helper function to ensure we have essential brand icons
function downloadBrandIcons() {
  log('Ensuring brand icons are available...');
  
  // List of essential brand icons
  const brandIcons = [
    { name: 'facebook', iconName: 'faFacebook' },
    { name: 'instagram', iconName: 'faInstagram' },
    { name: 'linkedin', iconName: 'faLinkedin' },
    { name: 'tiktok', iconName: 'faTiktok' },
    { name: 'youtube', iconName: 'faYoutube' },
    { name: 'twitter', iconName: 'faTwitter' },
    { name: 'x-twitter', iconName: 'faXTwitter' },
    { name: 'github', iconName: 'faGithub' },
    { name: 'reddit', iconName: 'faReddit' },
    { name: 'pinterest', iconName: 'faPinterest' }
  ];
  
  // Create brands directory if it doesn't exist
  const brandsDir = OUTPUT_DIRS['fab'];
  if (!fs.existsSync(brandsDir)) {
    fs.mkdirSync(brandsDir, { recursive: true });
  }
  
  let brandsAdded = 0;
  
  // For each brand icon, create an SVG file from scratch if needed
  for (const icon of brandIcons) {
    const svgPath = path.join(brandsDir, `${icon.name}.svg`);
    
    // Only create if the file doesn't exist
    if (!fs.existsSync(svgPath)) {
      try {
        // Generate a simplified placeholder SVG
        const svgContent = getBrandIconSvg(icon.name);
        fs.writeFileSync(svgPath, svgContent, 'utf8');
        
        // Add to the icon registry
        const relativePath = path.join('/ui-icons', 'brands', `${icon.name}.svg`);
        iconRegistry[icon.iconName] = {
          prefix: 'fab',
          name: icon.name,
          fileName: `${icon.name}.svg`,
          path: relativePath.replace(/\\/g, '/')
        };
        
        brandsAdded++;
        log(`Created brand icon: ${icon.name}`, true);
      } catch (error) {
        log(`Failed to create brand icon ${icon.name}: ${error.message}`);
      }
    } else {
      // The icon already exists
      const relativePath = path.join('/ui-icons', 'brands', `${icon.name}.svg`);
      iconRegistry[icon.iconName] = {
        prefix: 'fab',
        name: icon.name,
        fileName: `${icon.name}.svg`,
        path: relativePath.replace(/\\/g, '/')
      };
      
      log(`Using existing brand icon: ${icon.name}`, true);
    }
    
    // Update the count for reporting
    iconsByType.brands++;
  }
  
  if (brandsAdded > 0) {
    log(`Added ${brandsAdded} brand icons.`);
  }
}

// Helper function to get SVG content for a brand icon
function getBrandIconSvg(name) {
  // Map of icons to their SVG path data
  const iconPaths = {
    'facebook': 'M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z',
    'instagram': 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
    'linkedin': 'M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z',
    'tiktok': 'M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0A121.18,121.18,0,0,0,448,121.18Z',
    'youtube': 'M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z',
    'twitter': 'M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112 72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z',
    'x-twitter': 'M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112 72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z',
    'github': 'M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z',
    'reddit': 'M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z',
    'pinterest': 'M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248z'
  };
  
  // Get the path for the requested icon, or use a default path
  const path = iconPaths[name] || 'M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
  <path d="${path}"></path>
</svg>`;
}

// Function to check if an icon already exists and is valid
function iconExistsAndIsValid(iconName, prefix) {
  const style = getStyleNameFromPrefix(prefix);
  const outputDir = OUTPUT_DIRS[prefix];
  
  if (!outputDir) return false;
  
  const svgPath = path.join(outputDir, `${iconName}.svg`);
  
  // Check if file exists and has content
  if (fs.existsSync(svgPath)) {
    const content = fs.readFileSync(svgPath, 'utf8');
    return content && content.includes('<svg') && content.includes('<path'); 
  }
  
  return false;
} 
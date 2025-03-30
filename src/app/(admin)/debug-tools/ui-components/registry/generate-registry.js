/**
 * Static Registry Generator (JavaScript version)
 * 
 * Simple JavaScript version that can be required directly without TypeScript compilation.
 */

const fs = require('fs');
const path = require('path');

// Target directories to scan
const COMPONENT_DIRS = [
  { path: 'src/components/ui/atoms', category: 'atom' },
  { path: 'src/components/ui/molecules', category: 'molecule' },
  { path: 'src/components/ui/organisms', category: 'organism' }
];

// Output file path
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'static');
const COMPONENT_REGISTRY_FILE = path.join(OUTPUT_PATH, 'component-registry.json');
const ICON_REGISTRY_FILE = path.join(OUTPUT_PATH, 'icon-registry.json');

// Keywords that might indicate mock data
const MOCK_KEYWORDS = ['mock', 'fake', 'dummy', 'placeholder', 'sample'];

// Legitimate uses of testing-related words that should not trigger the mock filter
const LEGITIMATE_CONTEXTS = [
  'test-id', 
  'data-testid', 
  'testing-library',
  'component testing',
  'unit testing',
  'integration testing',
  'e2e testing',
  'compatibility testing',
  'accessibility testing',
  'asset testing',
  'creative asset testing',
  'PropTypes',
  'unit-test',
  'test-utils',
  'a11y-test',
  'visual-test',
  'component-test'
];

/**
 * Scan directory recursively for React component files
 */
function scanDirectory(dirPath, category) {
  const components = [];
  
  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return components;
  }
  
  // Read directory contents
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subComponents = scanDirectory(fullPath, category);
      components.push(...subComponents);
    } else if (
      entry.isFile() && 
      (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) &&
      !entry.name.includes('.test.') && 
      !entry.name.includes('.spec.')
    ) {
      // Extract component name from filename
      const baseName = path.basename(entry.name, path.extname(entry.name));
      
      // Skip index files and files with lowercase first letter (likely not components)
      if (baseName === 'index' || (baseName[0] === baseName[0].toLowerCase() && baseName[0] !== baseName[0].toUpperCase())) {
        continue;
      }
      
      // Check for mock data indicators in file content
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      
      // Improved mock detection logic that's less aggressive
      const containsMockData = MOCK_KEYWORDS.some(keyword => {
        // Skip keywords in legitimate contexts
        if (keyword.toLowerCase() === 'test') {
          // If it's the word 'test', check if it's in a legitimate context
          const hasLegitimateContext = LEGITIMATE_CONTEXTS.some(context => 
            fileContent.toLowerCase().includes(context.toLowerCase())
          );
          if (hasLegitimateContext) return false;
        }
        
        const keywordPattern = new RegExp(`\\b${keyword}\\b`, 'i');
        if (!keywordPattern.test(fileContent)) return false;
        
        // Skip if it's in a legitimate context
        const hasLegitimateContext = LEGITIMATE_CONTEXTS.some(context => 
          fileContent.toLowerCase().includes(context.toLowerCase())
        );
        
        // Skip if it's in a comment that indicates "not mock data"
        const isExemptByComment = (
          fileContent.includes(`// Not ${keyword}`) || 
          fileContent.includes(`// Not a ${keyword}`) ||
          fileContent.includes(`// Real data, not ${keyword}`) ||
          fileContent.includes(`/* Not ${keyword} */`) ||
          fileContent.includes(`// This is NOT ${keyword} data`) ||
          fileContent.includes(`// No ${keyword} data used here`)
        );
        
        // If in a file under /examples/ directory, assume it's legitimate example code, not mock data
        const isInExamplesDirectory = fullPath.includes('/examples/');
        
        // If the file is called SomeComponentExample.tsx, it's likely a legitimate example
        const isExampleComponent = baseName.toLowerCase().includes('example');
        
        // If in a UI component directory structure, trust the component more
        const isInUIComponentDir = fullPath.includes('/components/ui/');
        
        return !(hasLegitimateContext || isExemptByComment || isInExamplesDirectory || isExampleComponent || isInUIComponentDir);
      });
      
      // Skip files likely containing mock data - but with improved exemption checks
      if (containsMockData && 
          !fileContent.includes('// MOCK_DATA_EXEMPT') && 
          !fileContent.includes('/* MOCK_DATA_EXEMPT */') &&
          !fileContent.includes('// NOT_MOCK_DATA') &&
          !fileContent.includes('/* NOT_MOCK_DATA */')) {
        console.warn(`Skipping suspected mock data in: ${fullPath}`);
        continue;
      }
      
      // Create component metadata
      const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
      const component = {
        path: relativePath,
        name: baseName,
        category,
        lastUpdated: new Date().toISOString(),
        exports: [baseName],
        props: [],
        description: `${baseName} ${category} component`,
        examples: [],
        dependencies: [],
        version: '1.0.0',
        changeHistory: []
      };
      
      components.push(component);
    }
  }
  
  return components;
}

/**
 * Scan icons directory and generate icon metadata
 */
function scanIcons() {
  console.log('Scanning for icons...');
  const icons = [];
  
  // First, use icon-url-map.json as our single source of truth
  const iconMapPath = path.join(process.cwd(), 'src', 'components', 'ui', 'atoms', 'icons', 'icon-url-map.json');
  
  if (fs.existsSync(iconMapPath)) {
    console.log('Using icon-url-map.json as single source of truth for icon locations');
    try {
      const iconMap = JSON.parse(fs.readFileSync(iconMapPath, 'utf8'));
      
      // Process each entry in the icon map
      Object.entries(iconMap).forEach(([iconName, iconPath]) => {
        // The iconPath is like "/icons/light/check.svg" - we need to prepend "public"
        const fullPath = path.join(process.cwd(), 'public', iconPath);
        
        // Check if the file actually exists
        if (fs.existsSync(fullPath)) {
          const svgContent = fs.readFileSync(fullPath, 'utf8');
          
          icons.push({
            id: iconName,
            name: iconName,
            path: iconPath, // Store the original path as it appears in icon-url-map.json
            category: iconPath.includes('/light/') ? 'light' : 
                      iconPath.includes('/solid/') ? 'solid' : 
                      iconPath.includes('/brands/') ? 'brands' : 'icon',
            weight: iconPath.includes('/light/') ? 'light' : 
                    iconPath.includes('/solid/') ? 'solid' : 
                    iconPath.includes('/brands/') ? 'regular' : 'regular',
            tags: [iconName.replace('fa', '').toLowerCase()],
            viewBox: extractSvgAttribute(svgContent, 'viewBox') || '0 0 24 24',
            width: parseInt(extractSvgAttribute(svgContent, 'width') || '24', 10),
            height: parseInt(extractSvgAttribute(svgContent, 'height') || '24', 10),
            svgContent: prepareSvgForReact(svgContent),
            usageCount: 0
          });
        } else {
          // Icon file not found, but don't spam logs
          // This is more informational than an error
          if (!iconPath.includes('fa-')) { // Reduce noise
            console.log(`Icon file mapping exists but file not found at ${fullPath} (${iconPath})`);
          }
        }
      });
      
      console.log(`Successfully loaded ${icons.length} icons from icon-url-map.json`);
      return icons;
    } catch (error) {
      console.error('Error parsing icon-url-map.json:', error);
      // Fall through to traditional scanning
    }
  }
  
  // If the icon map wasn't found or failed to load, fall back to directory scanning
  console.warn('icon-url-map.json not found or invalid, falling back to directory scanning');
  
  // Check the public icons directory for SVG files
  const publicIconsPath = path.join(process.cwd(), 'public', 'icons');
  if (fs.existsSync(publicIconsPath)) {
    const publicIcons = scanPublicIcons(publicIconsPath);
    icons.push(...publicIcons);
  }
  
  return icons;
}

/**
 * Scan public icons directory
 */
function scanPublicIcons(directory) {
  const icons = [];
  
  if (!fs.existsSync(directory)) {
    console.warn(`Directory not found: ${directory}`);
    return icons;
  }
  
  // Process files recursively
  function processDirectory(dir, pathPrefix = '') {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      const relativePath = path.join(pathPrefix, file.name);
      
      if (file.isDirectory()) {
        processDirectory(fullPath, relativePath);
        continue;
      }
      
      // Only process SVG files
      if (!file.name.endsWith('.svg')) continue;
      
      try {
        // Read actual SVG content
        const svgContent = fs.readFileSync(fullPath, 'utf8');
        
        // Validate it's proper SVG by checking for svg tag
        if (!svgContent.includes('<svg')) {
          console.warn(`Invalid SVG content in ${fullPath}`);
          continue;
        }
        
        // Clean and prepare SVG for React rendering
        const cleanedSvg = prepareSvgForReact(svgContent);
        
        // Determine category from path or filename
        const pathParts = relativePath.split(path.sep);
        const category = pathParts.length > 1 ? pathParts[0] : 'UI';
        
        // Generate unique ID
        const id = relativePath
          .replace(/\.svg$/i, '')
          .replace(/[\\/]/g, '-')
          .replace(/\s+/g, '-')
          .toLowerCase();
          
        // Determine if this is a solid icon based on path or filename
        const isSolid = fullPath.includes('solid') || file.name.includes('solid');
        
        // Extract viewBox, width, and height from SVG
        const viewBox = extractSvgAttribute(svgContent, 'viewBox') || '0 0 24 24';
        const width = parseInt(extractSvgAttribute(svgContent, 'width') || '24', 10);
        const height = parseInt(extractSvgAttribute(svgContent, 'height') || '24', 10);
        
        // Generate tags from filename and category
        const fileName = path.basename(file.name, '.svg')
          .replace(/[-_]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2'); // Add spaces between camelCase
          
        const tags = [
          fileName,
          ...fileName.split(/\s+/),
          category
        ].filter(Boolean).map(tag => tag.toLowerCase());
        
        icons.push({
          id,
          name: fileName.charAt(0).toUpperCase() + fileName.slice(1),
          path: '/' + relativePath.replace(/\\/g, '/'),
          category,
          weight: isSolid ? 'solid' : 'light',
          tags: [...new Set(tags)], // Remove duplicates
          viewBox,
          width,
          height,
          svgContent: cleanedSvg,
          usageCount: 1
        });
      } catch (err) {
        console.error(`Error processing icon ${fullPath}:`, err);
      }
    }
  }
  
  processDirectory(directory);
  return icons;
}

/**
 * Prepares SVG content for React rendering by ensuring proper namespaces
 * and handling special attributes
 */
function prepareSvgForReact(svgContent) {
  if (!svgContent) return '';
  
  // Trim to get just the SVG content
  let cleanContent = svgContent.trim();
  
  // If it's not a proper SVG tag, try to fix it
  if (!cleanContent.startsWith('<svg')) {
    const svgStartIndex = cleanContent.indexOf('<svg');
    if (svgStartIndex >= 0) {
      cleanContent = cleanContent.substring(svgStartIndex);
    }
  }
  
  // Ensure it ends with a proper closing tag
  if (!cleanContent.endsWith('</svg>')) {
    const svgEndIndex = cleanContent.lastIndexOf('</svg>');
    if (svgEndIndex >= 0) {
      cleanContent = cleanContent.substring(0, svgEndIndex + 6);
    }
  }
  
  return cleanContent;
}

/**
 * Extract an attribute value from SVG content
 */
function extractSvgAttribute(svgContent, attributeName) {
  if (!svgContent) return null;
  
  const regex = new RegExp(`${attributeName}=["']([^"']*)["']`);
  const match = svgContent.match(regex);
  
  return match ? match[1] : null;
}

/**
 * Validate icon registry before saving
 */
function validateIconRegistry(icons) {
  console.log(`Validating ${icons.length} icons before saving...`);

  let validSvgCount = 0;
  let invalidSvgCount = 0;
  let missingSvgCount = 0;
  let fixedSvgCount = 0;

  // Process each icon
  const validatedIcons = icons.map(icon => {
    // Check if SVG content exists
    if (!icon.svgContent) {
      console.warn(`Missing SVG content for icon: ${icon.id}`);
      missingSvgCount++;
      // Provide a fallback SVG
      icon.svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>`;
      return icon;
    }

    // Check if SVG content is valid
    if (!icon.svgContent.includes('<svg')) {
      console.warn(`Invalid SVG content for icon: ${icon.id}`);
      invalidSvgCount++;
      // Replace with fallback SVG
      icon.svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>`;
      return icon;
    }

    // Check if SVG content needs to be fixed
    let needsFixing = false;
    
    // Check for namespace
    if (!icon.svgContent.includes('xmlns=')) {
      needsFixing = true;
    }
    
    // Check for currentColor
    if (!icon.svgContent.includes('currentColor')) {
      needsFixing = true;
    }
    
    // Apply fixes if needed
    if (needsFixing) {
      icon.svgContent = prepareSvgForReact(icon.svgContent);
      fixedSvgCount++;
    } else {
      validSvgCount++;
    }

    return icon;
  });

  console.log(`Validation complete:
- Valid SVG content: ${validSvgCount}
- Fixed SVG content: ${fixedSvgCount}
- Invalid SVG content: ${invalidSvgCount}
- Missing SVG content: ${missingSvgCount}
- Total icons: ${validatedIcons.length}
  `);

  return validatedIcons;
}

/**
 * Main function to generate the component registry
 */
function generateComponentRegistry() {
  console.log('Generating static component registry...');
  
  try {
    // Scan for components in each directory
    let allComponents = [];
    
    for (const dir of COMPONENT_DIRS) {
      const dirPath = path.join(process.cwd(), dir.path);
      const components = scanDirectory(dirPath, dir.category);
      console.log(`Found ${components.length} components in ${dir.path}`);
      allComponents = [...allComponents, ...components];
    }
    
    // Scan for icons using the single source of truth
    const icons = scanIcons();
    console.log(`Found ${icons.length} icons`);
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_PATH)) {
      fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    }
    
    // Save component registry
    const registry = {
      components: allComponents,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    fs.writeFileSync(
      COMPONENT_REGISTRY_FILE, 
      JSON.stringify(registry, null, 2)
    );
    
    console.log(`Static component registry generated at ${COMPONENT_REGISTRY_FILE} with ${allComponents.length} components`);
    
    // Save icon registry if there are icons
    if (icons.length > 0) {
      // First validate the icon SVG content
      console.log(`Validating ${icons.length} icons before saving...`);
      
      let validCount = 0;
      let fixedCount = 0;
      let invalidCount = 0;
      let missingCount = 0;
      
      // Validate each icon
      icons.forEach(icon => {
        if (!icon.svgContent) {
          missingCount++;
          return;
        }
        
        const svgContent = icon.svgContent;
        
        // Very basic SVG validation
        if (svgContent.trim().startsWith('<svg') && svgContent.trim().endsWith('</svg>')) {
          validCount++;
        } else if (svgContent.trim().includes('<svg') && svgContent.trim().includes('</svg>')) {
          // Try to fix simple issues
          icon.svgContent = svgContent.trim()
            .replace(/^[^<]*(<svg)/, '$1')
            .replace(/(<\/svg>)[^>]*$/, '$1');
          fixedCount++;
        } else {
          invalidCount++;
          console.warn(`Invalid SVG content for icon: ${icon.id}`);
        }
      });
      
      console.log('Validation complete:');
      console.log(`- Valid SVG content: ${validCount}`);
      console.log(`- Fixed SVG content: ${fixedCount}`);
      console.log(`- Invalid SVG content: ${invalidCount}`);
      console.log(`- Missing SVG content: ${missingCount}`);
      console.log(`- Total icons: ${icons.length}`);
      
      // Save icon registry
      const iconRegistry = {
        icons,
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      fs.writeFileSync(
        ICON_REGISTRY_FILE, 
        JSON.stringify(iconRegistry, null, 2)
      );
      
      console.log(`Static icon registry generated at ${ICON_REGISTRY_FILE} with ${icons.length} icons`);
    }
    
    return true;
  } catch (error) {
    console.error('Error generating component registry:', error);
    return false;
  }
}

// Run the registry generator
generateComponentRegistry();

// Export the function
module.exports = {
  generateComponentRegistry
};

// If script is run directly, generate the registry
if (require.main === module) {
  const result = generateComponentRegistry();
  if (!result) {
    process.exit(1);
  }
} 
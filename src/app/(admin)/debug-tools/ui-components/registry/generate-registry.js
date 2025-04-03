/**
 * Static Registry Generator (JavaScript version)
 * 
 * Simple JavaScript version that can be imported directly without TypeScript compilation.
 */

import path from 'path';
import fs from 'fs';
const { join } = path;
const { existsSync, readFileSync, readdirSync, writeFileSync } = fs;

// Target directories to scan
const COMPONENT_DIRS = [
  { path: 'src/components/ui/atoms', category: 'atoms' },
  { path: 'src/components/ui/molecules', category: 'molecules' },
  { path: 'src/components/ui/organisms', category: 'organisms' }
];

// Output file path
const OUTPUT_PATH = join(process.cwd(), 'public', 'static');
const COMPONENT_REGISTRY_FILE = join(OUTPUT_PATH, 'component-registry.json');
const ICON_REGISTRY_FILE = join(OUTPUT_PATH, 'icon-registry.json');

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

// Function to convert PascalCase to kebab-case
function pascalToKebab(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Scan directory recursively for React component files
 */
function scanDirectory(dirPath, category) {
  const components = [];
  
  // Check if directory exists
  if (!existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return components;
  }
  
  // Read directory contents
  const entries = readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    
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
      const fileContent = readFileSync(fullPath, 'utf8');
      
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
      
      // Create component metadata with kebab-case name
      const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
      const kebabName = pascalToKebab(baseName);
      
      const component = {
        path: relativePath,
        name: kebabName,
        originalName: baseName, // Store original name for reference
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
  let icons = [];
  
  // First, use icon-registry.json as our single source of truth
  const iconRegistryPath = join(process.cwd(), 'public', 'static', 'icon-registry.json');
  
  try {
    if (existsSync(iconRegistryPath)) {
      console.log('Using icon-registry.json as single source of truth');
      const iconRegistry = JSON.parse(readFileSync(iconRegistryPath, 'utf8'));
      
      if (iconRegistry.icons && Array.isArray(iconRegistry.icons)) {
        // Modern registry format with icons array
        icons = iconRegistry.icons.map(icon => ({
          id: icon.id,
          name: icon.name || icon.id,
          category: icon.category || 'unknown',
          path: icon.path,
          viewBox: icon.viewBox || '0 0 512 512',
          width: icon.width || 24,
          height: icon.height || 24,
          map: icon.map || null,
          usageCount: icon.usageCount || 0,
        }));
      } else {
        // Legacy registry format (object with keys)
        icons = Object.entries(iconRegistry).map(([id, data]) => {
          return {
            id,
            name: data.name || id,
            category: data.prefix || 'unknown',
            path: data.path,
            viewBox: data.viewBox || '0 0 512 512',
            width: data.width || 24,
            height: data.height || 24,
            map: null, // Legacy format doesn't have map property
            usageCount: data.usageCount || 0,
          };
        });
      }
      
      console.log(`Successfully loaded ${icons.length} icons from icon-registry.json`);
      return icons;
    } else {
      console.error('icon-registry.json not found');
    }
  } catch (error) {
    console.error('Error parsing icon-registry.json:', error);
  }
  
  // If we couldn't load any icons, log an error
  if (icons.length === 0) {
    console.warn('No icons found in registry. Debug tools will have limited functionality.');
  }
  
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
      const dirPath = join(process.cwd(), dir.path);
      const components = scanDirectory(dirPath, dir.category);
      console.log(`Found ${components.length} components in ${dir.path}`);
      allComponents = [...allComponents, ...components];
    }
    
    // Scan for icons using the single source of truth
    const icons = scanIcons();
    console.log(`Found ${icons.length} icons`);
    
    // Ensure output directory exists
    if (!existsSync(OUTPUT_PATH)) {
      fs.mkdirSync(OUTPUT_PATH, { recursive: true });
    }
    
    // Save component registry
    const registry = {
      components: allComponents,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    writeFileSync(
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
      
      writeFileSync(
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
export { generateComponentRegistry }; 
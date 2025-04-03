/**
 * Static Registry Generator
 * 
 * This script generates a static registry of UI components during development.
 * It scans the component directories and creates a JSON file in the public directory.
 * 
 * IMPORTANT: This script follows the Single Source of Truth principle and only writes
 * to canonical locations:
 * - /public/static/component-registry.json
 * - /public/static/icon-registry.json
 */

import fs from 'fs';
import path from 'path';
import { ComponentMetadata, ComponentCategory } from '../db/registry';
import { IconMetadata } from '../features/icon-library/IconLibrary';

// Target directories to scan
const COMPONENT_DIRS = [
  { path: 'src/components/ui/atoms', category: 'atom' },
  { path: 'src/components/ui/molecules', category: 'molecule' },
  { path: 'src/components/ui/organisms', category: 'organism' }
];

// Output file path - CANONICAL LOCATIONS ONLY
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'static');
const COMPONENT_REGISTRY_FILE = path.join(OUTPUT_PATH, 'component-registry.json');
const ICON_REGISTRY_FILE = path.join(OUTPUT_PATH, 'icon-registry.json');

// Extend ComponentMetadata for serializable version
interface SerializableComponentMetadata extends Omit<ComponentMetadata, 'lastUpdated'> {
  lastUpdated: string;
}

// Extend IconMetadata for serializable version
interface SerializableIconMetadata extends IconMetadata {
  lastUpdated: string;
}

/**
 * Scan directory recursively for React component files
 */
function scanDirectory(dirPath: string, category: ComponentCategory): SerializableComponentMetadata[] {
  const components: SerializableComponentMetadata[] = [];
  
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
      
      // Create component metadata
      const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
      const component: SerializableComponentMetadata = {
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
function scanIcons(): SerializableIconMetadata[] {
  // First check the actual icon component directory
  const compIconsPath = path.join(process.cwd(), 'src', 'components', 'ui', 'atoms', 'icons');
  let icons = scanComponentIcons(compIconsPath);
  
  // Then check the public icons directory for SVG files
  const publicIconsPath = path.join(process.cwd(), 'public', 'icons');
  if (fs.existsSync(publicIconsPath)) {
    const publicIcons = scanPublicIcons(publicIconsPath);
    icons = [...icons, ...publicIcons];
  } else {
    console.warn(`Public icons directory not found: ${publicIconsPath}`);
  }
  
  return icons;
}

/**
 * Scan component icons directory
 */
function scanComponentIcons(dirPath: string): SerializableIconMetadata[] {
  const icons: SerializableIconMetadata[] = [];
  
  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    console.warn(`Icons component directory not found: ${dirPath}`);
    return icons;
  }
  
  try {
    // Check for icon registry.json file in the component directory first
    const registryPath = path.join(dirPath, 'registry.json');
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      
      // Convert registry entries to our format
      for (const [id, data] of Object.entries(registry)) {
        const iconName = (data as any).name || id.replace(/^fa/, '');
        const iconPath = (data as any).path || `/icons/${(data as any).fileName}`;
        
        // Determine category based on prefix or name
        let category = 'UI';
        if (id.startsWith('app')) {
          category = 'App';
        } else if (id.startsWith('fa')) {
          category = 'FontAwesome';
        }
        
        // Create icon metadata
        const icon: SerializableIconMetadata = {
          id,
          name: `Icon${iconName.charAt(0).toUpperCase() + iconName.slice(1)}`,
          path: iconPath,
          category,
          viewBox: '0 0 24 24',
          width: 24,
          height: 24,
          svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>',
          usageCount: 1, // Real usage count would need to be determined by code analysis
          lastUpdated: new Date().toISOString()
        };
        
        icons.push(icon);
      }
      
      return icons;
    }
  } catch (err) {
    console.warn(`Error reading component icons: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  // Fallback to scanning component files
  // Read directory contents
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isFile() && (
        entry.name.endsWith('.tsx') || 
        entry.name.endsWith('.ts') ||
        entry.name.endsWith('.jsx') ||
        entry.name.endsWith('.js')
      ) && !entry.name.includes('index.') && !entry.name.includes('types.')) {
        // Extract icon name from filename
        const baseName = path.basename(entry.name, path.extname(entry.name));
        const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
        
        // Create icon metadata
        const icon: SerializableIconMetadata = {
          id: `icon-${baseName}`,
          name: `Icon${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`,
          path: relativePath,
          category: 'UI',
          viewBox: '0 0 24 24',
          width: 24,
          height: 24,
          svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>',
          usageCount: 1,
          lastUpdated: new Date().toISOString()
        };
        
        icons.push(icon);
      }
    }
  } catch (err) {
    console.warn(`Error scanning component icons: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  return icons;
}

/**
 * Scan public icons directory
 */
function scanPublicIcons(dirPath: string): SerializableIconMetadata[] {
  const icons: SerializableIconMetadata[] = [];
  
  try {
    // Read directory contents recursively
    const readDirRecursive = (dir: string, prefix = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          readDirRecursive(fullPath, `${prefix}${entry.name}/`);
        } else if (
          entry.isFile() && 
          (entry.name.endsWith('.svg') || entry.name.endsWith('.png') || entry.name.endsWith('.jpg'))
        ) {
          // Extract icon name and info
          const baseName = path.basename(entry.name, path.extname(entry.name));
          const relativePath = `public/icons/${prefix}${entry.name}`;
          
          // Determine category based on directory or filename
          let category = 'UI';
          const parentDir = path.basename(path.dirname(fullPath));
          if (parentDir === 'app') {
            category = 'App';
          } else if (['light', 'solid', 'regular', 'brands'].includes(parentDir)) {
            category = 'FontAwesome';
          }
          
          // Try to read SVG content for SVG files
          let svgContent = '';
          let viewBox = '0 0 24 24';
          if (entry.name.endsWith('.svg')) {
            try {
              svgContent = fs.readFileSync(fullPath, 'utf-8');
              // Try to extract viewBox from SVG
              const viewBoxMatch = svgContent.match(/viewBox=["']([^"']*)["']/);
              if (viewBoxMatch && viewBoxMatch[1]) {
                viewBox = viewBoxMatch[1];
              }
            } catch (err) {
              console.warn(`Error reading SVG content for ${entry.name}:`, err);
            }
          }
          
          // Create icon metadata with a prefix to avoid collisions
          const icon: SerializableIconMetadata = {
            id: `file-icon-${parentDir}-${baseName}`,
            name: `Icon${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`,
            path: `/icons/${prefix}${entry.name}`,
            category,
            viewBox,
            width: 24,
            height: 24,
            svgContent,
            usageCount: 1,
            lastUpdated: new Date().toISOString()
          };
          
          icons.push(icon);
        }
      }
    };
    
    readDirRecursive(dirPath);
  } catch (err) {
    console.warn(`Error scanning public icons: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  return icons;
}

// Add the SVG preparation function
function prepareSvgForReact(svgContent: string): string {
  // Ensure SVG has proper namespace
  if (!svgContent.includes('xmlns=')) {
    svgContent = svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // Replace problematic attributes for React
  svgContent = svgContent
    // Replace 'class' with 'className'
    .replace(/\sclass=/g, ' className=')
    // Handle inline styles that might cause issues
    .replace(/\sstyle=/g, ' data-style=')
    // Fix self-closing tags that might be problematic in React/JSX
    .replace(/<(\w+)([^>]*)\/>/g, '<$1$2></$1>');
    
  // Ensure SVG uses "currentColor" to inherit color from parent
  if (!svgContent.includes('currentColor')) {
    // If fill attribute exists but isn't currentColor, replace it
    if (svgContent.includes('fill="') && !svgContent.includes('fill="currentColor"')) {
      svgContent = svgContent.replace(/fill="[^"]*"/g, 'fill="currentColor"');
    } 
    // If stroke attribute exists but isn't currentColor, replace it
    else if (svgContent.includes('stroke="') && !svgContent.includes('stroke="currentColor"')) {
      svgContent = svgContent.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
    }
    // If neither fill nor stroke with color exists, add fill currentColor
    else if (!svgContent.includes('fill=') && !svgContent.includes('stroke=')) {
      svgContent = svgContent.replace('<svg', '<svg fill="currentColor"');
    }
  }
  
  return svgContent;
}

// Extract an attribute value from SVG content
function extractSvgAttribute(svgContent: string, attributeName: string): string | null {
  const regex = new RegExp(`${attributeName}=["']([^"']*)["']`);
  const match = svgContent.match(regex);
  return match ? match[1] : null;
}

// Validate icon registry before saving
function validateIconRegistry(icons: SerializableIconMetadata[]): SerializableIconMetadata[] {
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
 * Generate the static registry files
 */
export async function generateStaticRegistry(): Promise<void> {
  console.log('Generating static component registry...');
  
  // Make sure output directory exists
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }
  
  // COMPONENT REGISTRY
  // -----------------
  
  // Scan component directories
  let allComponents: SerializableComponentMetadata[] = [];
  for (const dir of COMPONENT_DIRS) {
    const dirPath = path.join(process.cwd(), dir.path);
    const components = scanDirectory(dirPath, dir.category as ComponentCategory);
    console.log(`Found ${components.length} components in ${dir.path}`);
    allComponents = [...allComponents, ...components];
  }
  
  // Scan real icons (not mock)
  const icons = scanIcons();
  console.log(`Found ${icons.length} icons`);
  
  // Add icons as atom components
  const iconComponents = icons.map(icon => ({
    path: icon.path,
    name: icon.name,
    category: 'atom' as ComponentCategory,
    lastUpdated: new Date().toISOString(),
    exports: [icon.name],
    props: [],
    description: `${icon.name} icon component`,
    examples: [],
    dependencies: [],
    version: '1.0.0',
    changeHistory: []
  }));
  
  allComponents = [...allComponents, ...iconComponents];
  
  // Create component registry data
  const registryData = {
    components: allComponents,
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    source: 'static-generator'
  };
  
  // Write component registry to file
  fs.writeFileSync(COMPONENT_REGISTRY_FILE, JSON.stringify(registryData, null, 2));
  console.log(`Static component registry generated at ${COMPONENT_REGISTRY_FILE} with ${allComponents.length} components`);
  
  // ICON REGISTRY
  // ------------
  
  // Use a Map to deduplicate icons by ID
  const iconMap = new Map<string, SerializableIconMetadata>();
  
  // Add all real icons from the scan
  icons.forEach(icon => {
    iconMap.set(icon.id, icon);
  });
  
  // Convert Map to array for saving
  const uniqueIcons = Array.from(iconMap.values());
  
  // Create the icon registry object
  const iconRegistry = {
    icons: uniqueIcons,
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
  
  // Write icon registry to file (canonical location only)
  fs.writeFileSync(ICON_REGISTRY_FILE, JSON.stringify(iconRegistry, null, 2));
  console.log(`Icon registry generated at ${ICON_REGISTRY_FILE} with ${uniqueIcons.length} icons`);
}

// If script is run directly, generate the registry
if (require.main === module) {
  generateStaticRegistry().catch(err => {
    console.error('Error generating static registry:', err);
    process.exit(1);
  });
} 
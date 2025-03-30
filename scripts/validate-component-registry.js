#!/usr/bin/env node

/**
 * Component Registry Validator
 * 
 * This script validates the generated component registry against the actual filesystem:
 * 1. Verifies that every component in the registry exists in the filesystem
 * 2. Verifies that all components in the filesystem are included in the registry
 * 3. Checks for any mock data or suspicious entries
 * 4. Validates registry structure and required fields
 * 5. Ensures consistent metadata across components
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const crypto = require('crypto');

// Target directories to scan (must match the generator)
const COMPONENT_DIRS = [
  { path: 'src/components/ui/atoms', category: 'atom' },
  { path: 'src/components/ui/molecules', category: 'molecule' },
  { path: 'src/components/ui/organisms', category: 'organism' }
];

// Icon directories that should be checked differently
const ICON_DIRS = [
  'public/icons/light',
  'public/icons/solid', 
  'public/icons/app',
  'public/icons/brands',
  'public/icons/kpis',
  'public/icons/regular'
];

// Path to registry file
const REGISTRY_PATH = path.join(process.cwd(), 'public', 'static', 'component-registry.json');

// Required fields for each component
const REQUIRED_FIELDS = ['path', 'name', 'category', 'exports'];

// Mock data keywords to check for
const MOCK_KEYWORDS = ['mock', 'fake', 'dummy', 'placeholder', 'sample'];

// Test-related terms that should be allowed in legitimate contexts
const LEGITIMATE_TEST_CONTEXTS = [
  'test-id',
  'data-testid',
  'testing-library',
  'accessibility testing',
  'component testing',
  'unit testing',
  'integration testing',
  'e2e testing',
  'compatibility testing',
  'asset testing',
  'creative asset testing',
  'component-test',
  'test-utils',
  'test-support',
  'example',
  'demo',
  'accessibility-testing',
  'VisualRegressionTesting'
];

/**
 * Get all component files from the filesystem
 * @returns Array of component file paths
 */
function getFilesystemComponents() {
  const componentFiles = [];
  
  for (const dir of COMPONENT_DIRS) {
    const dirPath = path.join(process.cwd(), dir.path);
    
    if (!fs.existsSync(dirPath)) {
      console.warn(`Component directory not found: ${dirPath}`);
      continue;
    }
    
    // Get all component files (using same pattern as generator)
    const files = glob.sync(path.join(dirPath, '**/*.{tsx,jsx}'), {
      ignore: ['**/*.test.*', '**/*.spec.*', '**/index.*']
    });
    
    for (const file of files) {
      const basename = path.basename(file);
      // Skip files that start with lowercase (not likely components)
      const firstChar = basename.charAt(0);
      if (firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase()) {
        continue;
      }
      
      const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
      componentFiles.push(relativePath);
    }
  }
  
  return componentFiles;
}

/**
 * Load the registry file
 * @returns Registry data or null if not found
 */
function loadRegistry() {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      console.error(`Registry file not found: ${REGISTRY_PATH}`);
      return null;
    }
    
    const data = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading registry: ${error.message}`);
    return null;
  }
}

/**
 * Generate a hash for a file to identify changes
 * @param {string} filePath Path to the file
 * @returns {string} MD5 hash of the file content
 */
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error.message);
    return '';
  }
}

/**
 * Check for suspicious mock data
 * @param {object} registry The registry object to check
 * @returns Array of issues found
 */
function checkForMockData(registry) {
  const issues = [];
  const registryStr = JSON.stringify(registry).toLowerCase();
  
  // Check for mock data indicators in the whole registry
  MOCK_KEYWORDS.forEach(keyword => {
    if (registryStr.includes(keyword)) {
      issues.push(`Registry contains suspicious keyword: "${keyword}"`);
    }
  });
  
  // Don't flag "test" keyword if it's in a legitimate context
  if (registryStr.includes('test')) {
    let isLegitimate = false;
    for (const context of LEGITIMATE_TEST_CONTEXTS) {
      if (registryStr.includes(context.toLowerCase())) {
        isLegitimate = true;
        break;
      }
    }
    // Also check if it's in a common testing pattern like data-testid
    if (registryStr.includes('data-test') || registryStr.includes('test-id') || registryStr.includes('testid')) {
      isLegitimate = true;
    }
    if (!isLegitimate) {
      issues.push(`Registry contains suspicious keyword: "test"`);
    }
  }
  
  // Check each component for suspicious properties
  if (registry.components) {
    registry.components.forEach((component, index) => {
      // Skip icon validation for paths
      if (isIconPath(component.path)) {
        return;
      }
      
      // Check if the path doesn't match our expected component directories
      let validPath = false;
      for (const dir of COMPONENT_DIRS) {
        if (component.path.includes(dir.path)) {
          validPath = true;
          break;
        }
      }
      
      if (!validPath) {
        issues.push(`Component #${index} (${component.name}) has suspicious path: ${component.path}`);
      }
      
      // Check component description for mock indicators
      if (component.description) {
        // Skip icon validation for descriptions that match expected icons
        if (isIconPath(component.path)) {
          return;
        }
        
        const descLower = component.description.toLowerCase();
        
        // Check for mock keywords
        MOCK_KEYWORDS.forEach(keyword => {
          if (descLower.includes(keyword)) {
            issues.push(`Component #${index} (${component.name}) has suspicious description containing "${keyword}": ${component.description}`);
          }
        });
        
        // Special handling for "test" keyword
        if (descLower.includes('test')) {
          let isLegitimate = false;
          for (const context of LEGITIMATE_TEST_CONTEXTS) {
            if (descLower.includes(context.toLowerCase())) {
              isLegitimate = true;
              break;
            }
          }
          if (!isLegitimate && !component.path.includes('asset-testing')) {
            issues.push(`Component #${index} (${component.name}) has suspicious description containing "test": ${component.description}`);
          }
        }
      }
      
      // Check component props for mock values
      if (component.props && Array.isArray(component.props)) {
        component.props.forEach(prop => {
          if (prop.defaultValue && typeof prop.defaultValue === 'string') {
            const valueLower = prop.defaultValue.toLowerCase();
            MOCK_KEYWORDS.forEach(keyword => {
              if (valueLower.includes(keyword)) {
                issues.push(`Component #${index} (${component.name}) has prop "${prop.name}" with suspicious default value containing "${keyword}": ${prop.defaultValue}`);
              }
            });
          }
        });
      }
      
      // Check for suspicious examples
      if (component.examples && Array.isArray(component.examples)) {
        component.examples.forEach((example, exIndex) => {
          if (typeof example === 'string') {
            const exampleLower = example.toLowerCase();
            MOCK_KEYWORDS.forEach(keyword => {
              if (exampleLower.includes(keyword)) {
                issues.push(`Component #${index} (${component.name}) has example #${exIndex} with suspicious content containing "${keyword}": ${example}`);
              }
            });
          }
        });
      }
    });
  }
  
  return issues;
}

/**
 * Validate component metadata structure
 * @param {object} registry The registry object to check
 * @returns Array of issues found
 */
function validateMetadataStructure(registry) {
  const issues = [];
  
  if (!registry.components || !Array.isArray(registry.components)) {
    issues.push('Registry is missing "components" array');
    return issues;
  }
  
  registry.components.forEach((component, index) => {
    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!component[field]) {
        issues.push(`Component #${index} (${component.name || 'unnamed'}) is missing required field: ${field}`);
      }
    });
    
    // Check exports is an array
    if (component.exports && !Array.isArray(component.exports)) {
      issues.push(`Component #${index} (${component.name || 'unnamed'}) has "exports" that is not an array`);
    }
    
    // Check props is an array if present
    if (component.props && !Array.isArray(component.props)) {
      issues.push(`Component #${index} (${component.name || 'unnamed'}) has "props" that is not an array`);
    }
    
    // Check dependencies is an array if present
    if (component.dependencies && !Array.isArray(component.dependencies)) {
      issues.push(`Component #${index} (${component.name || 'unnamed'}) has "dependencies" that is not an array`);
    }
    
    // Check category is valid
    if (component.category && !['atom', 'molecule', 'organism'].includes(component.category)) {
      issues.push(`Component #${index} (${component.name || 'unnamed'}) has invalid category: ${component.category}`);
    }
  });
  
  return issues;
}

/**
 * Validate the registry file exists and has the expected data
 * @returns {boolean} True if validation passes
 */
function validateRegistryExists() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`Registry file not found: ${REGISTRY_PATH}`);
    return false;
  }
  
  try {
    const stats = fs.statSync(REGISTRY_PATH);
    if (stats.size < 10) { // Minimum valid JSON size
      console.error(`Registry file is empty or too small: ${stats.size} bytes`);
      return false;
    }
    
    const data = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    const registry = JSON.parse(data);
    
    if (!registry.components || !Array.isArray(registry.components)) {
      console.error('Registry does not contain a valid components array');
      return false;
    }
    
    if (registry.components.length === 0) {
      console.error('Registry components array is empty');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error validating registry: ${error.message}`);
    return false;
  }
}

/**
 * Check if a path is an icon path that should be validated differently
 * @param {string} path The path to check
 * @returns {boolean} True if the path is an icon path
 */
function isIconPath(path) {
  // First check if this is a path from the icon-url-map.json
  if (path.startsWith('/icons/')) {
    return true;
  }
  
  // Check if the path matches any of the icon patterns
  if (path.startsWith('/app/') || 
      path.startsWith('/light/') || 
      path.startsWith('/solid/') || 
      path.startsWith('/brands/') || 
      path.startsWith('/kpis/') ||
      path.startsWith('/regular/')) {
    return true;
  }
  
  // Also check against full paths in the icon directories
  for (const iconDir of ICON_DIRS) {
    if (path.includes(iconDir)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Load the icon-url-map.json for validation
 * @returns {Object|null} The icon map or null if not found
 */
function loadIconUrlMap() {
  try {
    const iconMapPath = path.join(process.cwd(), 'src', 'components', 'ui', 'atoms', 'icons', 'icon-url-map.json');
    
    if (!fs.existsSync(iconMapPath)) {
      console.warn('icon-url-map.json not found for validation');
      return null;
    }
    
    const iconMapContent = fs.readFileSync(iconMapPath, 'utf8');
    return JSON.parse(iconMapContent);
  } catch (error) {
    console.error('Error loading icon-url-map.json:', error.message);
    return null;
  }
}

/**
 * Validate the registry against filesystem
 */
async function validateRegistry() {
  console.log('Validating component registry against filesystem...');
  
  // Quick check if registry exists and has expected structure
  if (!validateRegistryExists()) {
    process.exit(1);
  }
  
  // Load the registry
  const registry = loadRegistry();
  if (!registry) {
    process.exit(1);
  }
  
  console.log(`Loaded registry with ${registry.components?.length || 0} components`);
  
  // Load the icon-url-map as the single source of truth for icons
  const iconUrlMap = loadIconUrlMap();
  if (iconUrlMap) {
    console.log(`Loaded icon-url-map.json with ${Object.keys(iconUrlMap).length} icon mappings`);
  }
  
  // Get actual components from filesystem
  const filesystemComponents = getFilesystemComponents();
  console.log(`Found ${filesystemComponents.length} components in filesystem`);
  
  const issues = [];
  
  // Check 1: Verify all registry components exist in filesystem
  if (registry.components) {
    for (const component of registry.components) {
      // Skip icon validation for components from icon-url-map.json
      if (isIconPath(component.path)) {
        // For icon paths, check against the icon-url-map
        if (iconUrlMap) {
          // The component path should be in the values of the icon-url-map
          const iconExists = Object.values(iconUrlMap).some(iconPath => 
            iconPath === component.path || component.path.endsWith(iconPath)
          );
          
          if (!iconExists) {
            issues.push(`Icon in registry not found in icon-url-map.json: ${component.path}`);
          }
        }
        continue;
      }
      
      if (!fs.existsSync(component.path)) {
        issues.push(`Component in registry doesn't exist in filesystem: ${component.path}`);
      }
    }
  }
  
  // Check 2: Verify all filesystem components are in registry
  for (const filePath of filesystemComponents) {
    const found = registry.components.some(comp => 
      comp.path === filePath || 
      // Also check normalized path (with or without extension)
      path.join(process.cwd(), comp.path).replace(/\.[^.]+$/, '') === 
      path.join(process.cwd(), filePath).replace(/\.[^.]+$/, '')
    );
    
    if (!found) {
      issues.push(`Component in filesystem is missing from registry: ${filePath}`);
    }
  }
  
  // Check 3: Look for suspicious mock data
  const mockIssues = checkForMockData(registry);
  issues.push(...mockIssues);
  
  // Check 4: Validate metadata structure
  const structureIssues = validateMetadataStructure(registry);
  issues.push(...structureIssues);
  
  // Check 5: Verify registry generation timestamp is recent
  if (registry.generatedAt) {
    const generatedDate = new Date(registry.generatedAt);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    if (generatedDate < oneWeekAgo) {
      issues.push(`Registry was generated more than a week ago: ${registry.generatedAt}`);
    }
  } else {
    issues.push('Registry is missing generatedAt timestamp');
  }
  
  // Report results
  if (issues.length > 0) {
    console.error('Registry validation failed with the following issues:');
    issues.forEach((issue, index) => {
      console.error(`${index + 1}. ${issue}`);
    });
    process.exit(1);
  }
  
  console.log('✅ Registry validation passed!');
  process.exit(0);
}

// Run validation
validateRegistry().catch(error => {
  console.error('Validation failed with error:', error);
  process.exit(1);
}); 
// scripts/shadcn/analyze-components.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Component analyzer script
 * 
 * This script:
 * 1. Finds all UI components in the codebase
 * 2. Analyzes their structure and exports
 * 3. Determines flat paths and subcomponents
 * 4. Generates a comprehensive analysis report
 */

// Find all component files
const findComponents = () => {
  return glob.sync('src/components/ui/**/*.tsx', {
    ignore: ['**/*.test.tsx', '**/*.spec.tsx', '**/index.tsx']
  }).map(file => {
    const relativePath = file.replace(/^src\//, '@/');
    const flatPath = getFlatPath(relativePath);
    const componentName = getComponentName(file);
    const content = fs.readFileSync(file, 'utf8');
    
    const component = {
      filePath: file,
      relativePath,
      flatPath,
      componentName,
      hasSubcomponents: detectSubcomponents(file),
      variants: detectVariants(content),
      specialRequirements: determineSpecialRequirements(componentName, content),
      status: 'To be fixed' // Default status, will be updated later
    };
    
    return component;
  });
};

// Extract component name from file path
const getComponentName = (filePath) => {
  const basename = path.basename(filePath, path.extname(filePath));
  // Handle special cases like kebab-case filenames
  if (basename.includes('-')) {
    // Convert kebab-case to PascalCase
    return basename.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
  return basename;
};

// Extract flat path from atomic path
const getFlatPath = (atomicPath) => {
  // Convert @/components/ui/atoms/alert/Alert.tsx → @/components/ui/alert
  const match = atomicPath.match(/@\/components\/ui\/(?:atoms|molecules|organisms)\/([^\/]+)/);
  if (match) {
    return `@/components/ui/${match[1].toLowerCase()}`;
  }
  return atomicPath;
};

// Analyze component exports and detect subcomponents
const detectSubcomponents = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  // Find export statements to detect subcomponents
  const exports = content.match(/export\s+(?:const|function|class)\s+(\w+)/g) || [];
  const namedExports = content.match(/export\s+{\s*([^}]+)\s*}/g) || [];
  
  const subcomponents = exports.map(exp => {
    const match = exp.match(/export\s+(?:const|function|class)\s+(\w+)/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  // Also check for named exports
  namedExports.forEach(namedExport => {
    const names = namedExport.match(/export\s+{\s*([^}]+)\s*}/)[1];
    const components = names.split(',').map(name => name.trim());
    subcomponents.push(...components);
  });
  
  return [...new Set(subcomponents)]; // Remove duplicates
};

// Detect variants if component has them
const detectVariants = (content) => {
  const variantMatch = content.match(/variant[s]?.*?:\s*{([^}]+)}/);
  if (!variantMatch) return [];
  
  const variantsBlock = variantMatch[1];
  const variants = variantsBlock.match(/['"](\w+)['"]/g) || [];
  
  return variants.map(v => v.replace(/['"]/g, ''));
};

// Determine if component has special requirements
const determineSpecialRequirements = (componentName, content) => {
  const requirements = [];
  
  // Check component-specific requirements
  switch(componentName.toLowerCase()) {
    case 'accordion':
      if (content.includes('AccordionTrigger') || content.includes('AccordionContent'))
        requirements.push('Needs trigger/content subcomponents');
      break;
    case 'alert':
      if (content.includes('AlertTitle') || content.includes('AlertDescription'))
        requirements.push('Needs title/description subcomponents');
      break;
    case 'button':
      if (content.includes('variant'))
        requirements.push('Variants recommended');
      break;
    case 'card':
      if (content.includes('CardHeader') || content.includes('CardContent'))
        requirements.push('Needs header/content/footer subcomponents');
      break;
    case 'dialog':
    case 'modal':
      requirements.push('Requires state management (open/close)');
      break;
    // Add more special cases as needed
  }
  
  // Check for context providers
  if (content.includes('createContext') || content.includes('useContext'))
    requirements.push('Requires context provider');
    
  // Check for forwardRef
  if (content.includes('forwardRef'))
    requirements.push('Uses forwardRef');
    
  return requirements;
};

// Check for existing wrapper implementations
const findExistingWrappers = () => {
  const wrapperFiles = glob.sync('src/app/**/*-wrappers.{tsx,jsx,ts,js}');
  const wrappers = {};
  
  wrapperFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const wrapperMatches = content.match(/export\s+const\s+(\w+Wrapper)\s*=/g) || [];
    
    wrapperMatches.forEach(match => {
      const wrapperName = match.match(/export\s+const\s+(\w+Wrapper)\s*=/)[1];
      const componentName = wrapperName.replace('Wrapper', '');
      if (!wrappers[componentName]) {
        wrappers[componentName] = [];
      }
      wrappers[componentName].push(file);
    });
  });
  
  return wrappers;
};

// Check if components are working in existing implementations
const determineWorkingStatus = (components, existingWrappers) => {
  // List of components known to be working
  const knownWorkingComponents = ['Accordion', 'Button', 'Alert'];
  
  return components.map(comp => {
    // Check if component is in the known working list
    if (knownWorkingComponents.includes(comp.componentName)) {
      comp.status = 'Working';
    } 
    // Check if it has an existing wrapper
    else if (existingWrappers[comp.componentName] && existingWrappers[comp.componentName].length > 0) {
      comp.status = 'Has wrapper';
    }
    
    return comp;
  });
};

// Main execution
console.log('🔍 Analyzing components...');

// Find all components
const components = findComponents();

// Find existing wrapper implementations
const existingWrappers = findExistingWrappers();

// Update component status based on existing implementations
const analyzedComponents = determineWorkingStatus(components, existingWrappers);

// Generate report
console.log(`Found ${components.length} components`);
console.log(`${components.filter(c => c.status === 'Working').length} components are working`);
console.log(`${components.filter(c => c.status === 'Has wrapper').length} components have wrappers`);
console.log(`${components.filter(c => c.status === 'To be fixed').length} components need fixing`);

// Write analysis to file
fs.writeFileSync('component-analysis.json', JSON.stringify(analyzedComponents, null, 2));

// Generate component reference table for markdown
const generateComponentTable = (components) => {
  const header = '| Component Name | Flat Path | Special Requirements | Status |';
  const separator = '|----------------|------------------------|--------------------------|------------|';
  
  const rows = components.map(comp => {
    const requirements = comp.specialRequirements.length > 0 
      ? comp.specialRequirements.join(', ') 
      : 'None';
      
    return `| ${comp.componentName} | ${comp.flatPath} | ${requirements} | ${comp.status} |`;
  });
  
  return [header, separator, ...rows].join('\n');
};

// Generate markdown table
const componentTable = generateComponentTable(analyzedComponents);
fs.writeFileSync('component-reference-table.md', componentTable);

console.log('✅ Component analysis complete. Results saved to component-analysis.json and component-reference-table.md');
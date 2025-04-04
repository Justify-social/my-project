/**
 * UI Component Validation Script
 * 
 * This script validates that all components follow our Atomic Design + Shadcn pattern:
 * - Components exist in the correct Atomic Design location
 * - Barrel files exist for Shadcn-style imports
 * - No duplicate implementations exist
 * - All necessary exports are properly configured
 * - No Lucide icons are used (must use FontAwesome through IconAdapter)
 * 
 * Usage:
 * node scripts/validate-components.js [--fix] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const CONFIG = {
  componentsDir: path.resolve(__dirname, '../src/components/ui'),
  fix: process.argv.includes('--fix'),
  verbose: process.argv.includes('--verbose'),
};

// Component mapping (expected structure)
const COMPONENT_MAP = [
  // Atoms
  { name: 'accordion', level: 'atoms', hasSubComponents: true },
  { name: 'alert', level: 'atoms', hasSubComponents: false },
  { name: 'alert-dialog', level: 'atoms', hasSubComponents: true },
  { name: 'avatar', level: 'atoms', hasSubComponents: true },
  { name: 'badge', level: 'atoms', hasSubComponents: false },
  { name: 'button', level: 'atoms', hasSubComponents: false },
  { name: 'calendar', level: 'atoms', hasSubComponents: false },
  { name: 'card', level: 'atoms', hasSubComponents: true },
  { name: 'checkbox', level: 'atoms', hasSubComponents: false },
  // Add all expected components here...
];

// Lucide icon patterns to check for
const LUCIDE_PATTERNS = [
  { pattern: /from ['"]lucide-react['"]/, fix: null },
  { pattern: /import {.*} from ['"]lucide-react['"]/, fix: "import { IconAdapter } from '@/components/ui/atoms/icon/adapters';" },
  { pattern: /<([A-Z][a-zA-Z]*Icon|X|Check|Plus|Minus|Search|Settings|ChevronDown|ChevronUp|ChevronLeft|ChevronRight)\s/, fix: null },
];

// Initialize
function init() {
  console.log('🔍 Starting UI Component Validation');
  console.log(`Mode: ${CONFIG.fix ? 'Fix Mode (will attempt to fix issues)' : 'Check Mode (will only report issues)'}`);
  console.log(`Verbosity: ${CONFIG.verbose ? 'Verbose' : 'Normal'}`);
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Get a list of all implemented components (both flat and atomic)
function getImplementedComponents() {
  const components = [];
  
  // Check flat structure files
  const rootFiles = fs.readdirSync(CONFIG.componentsDir);
  
  rootFiles.forEach(file => {
    // Skip directories and non-TypeScript files
    if (file === 'atoms' || file === 'molecules' || file === 'organisms' || 
        (!file.endsWith('.ts') && !file.endsWith('.tsx'))) {
      return;
    }
    
    // Extract component name (remove extension)
    const name = file.replace(/\.(ts|tsx)$/, '');
    
    components.push({
      name,
      hasFlat: file.endsWith('.tsx'), // If it's .tsx, it's an implementation, not a barrel
      hasBarrel: file.endsWith('.ts'), // If it's .ts, it's likely a barrel file
      hasAtomic: false, // Will check later
      atomicLevel: null,
      issues: [],
    });
  });
  
  // Check atomic structure files
  const levels = ['atoms', 'molecules', 'organisms'];
  
  levels.forEach(level => {
    const levelPath = path.join(CONFIG.componentsDir, level);
    
    if (!fileExists(levelPath)) {
      return;
    }
    
    const componentDirs = fs.readdirSync(levelPath);
    
    componentDirs.forEach(dir => {
      const dirPath = path.join(levelPath, dir);
      
      // Skip non-directories and hidden files
      if (!fs.statSync(dirPath).isDirectory() || dir.startsWith('.')) {
        return;
      }
      
      // Check for implementation file
      const pascalName = getPascalCaseName(dir);
      const implPath = path.join(dirPath, `${pascalName}.tsx`);
      
      if (fileExists(implPath)) {
        // Find existing entry or create a new one
        let entry = components.find(c => c.name === dir);
        
        if (!entry) {
          entry = {
            name: dir,
            hasFlat: false,
            hasBarrel: false,
            hasAtomic: true,
            atomicLevel: level,
            issues: [],
          };
          components.push(entry);
        } else {
          entry.hasAtomic = true;
          entry.atomicLevel = level;
        }
      }
    });
  });
  
  return components;
}

// Create a barrel file for a component
function createBarrelFile(component, level) {
  const barrelPath = path.join(CONFIG.componentsDir, `${component.name}.ts`);
  const atomicPath = `./${level}/${component.name}/${getPascalCaseName(component.name)}`;
  
  const content = `/**
 * Barrel file for ${component.name} component
 * 
 * This file enables Shadcn UI style imports:
 * import { ${getPascalCaseName(component.name)} } from "@/components/ui/${component.name}";
 * 
 * The actual component is located at:
 * @/components/ui/${level}/${component.name}/${getPascalCaseName(component.name)}
 */

export * from '${atomicPath}';
`;
  
  fs.writeFileSync(barrelPath, content);
  console.log(`✅ Created barrel file: ${barrelPath}`);
}

// Validate component exports
function validateExports(component, expected) {
  const atomicPath = path.join(
    CONFIG.componentsDir, 
    component.atomicLevel, 
    component.name, 
    `${getPascalCaseName(component.name)}.tsx`
  );
  
  if (!fileExists(atomicPath)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(atomicPath, 'utf-8');
    
    // Check for export statements
    const hasNamedExport = content.includes(`export const ${getPascalCaseName(component.name)}`);
    const hasDefaultExport = content.includes('export default') || content.includes('export { default }');
    
    if (!hasNamedExport && !hasDefaultExport) {
      component.issues.push(`Component doesn't have proper exports`);
    }
    
    // For compound components, check for subcomponent exports
    if (expected.hasSubComponents) {
      // This is a simplified check, could be enhanced with AST parsing
      const hasSubcomponentExports = content.includes('.Content =') || 
                                    content.includes('.Trigger =') ||
                                    content.includes('.Item =');
      
      if (!hasSubcomponentExports) {
        component.issues.push(`Compound component missing subcomponent exports`);
      }
    }
    
    // Check for Lucide icon usage
    checkForLucideIcons(component, content, atomicPath);
    
  } catch (error) {
    component.issues.push(`Error reading component file: ${error.message}`);
  }
}

// Check for Lucide icons in component code
function checkForLucideIcons(component, content, filePath) {
  // Check for Lucide imports and components
  let foundLucide = false;
  
  LUCIDE_PATTERNS.forEach(({ pattern }) => {
    if (pattern.test(content)) {
      foundLucide = true;
      component.issues.push(`Component uses Lucide icons - must use FontAwesome with IconAdapter`);
    }
  });
  
  // Check if IconAdapter is imported when needed
  if (foundLucide && !content.includes("from '@/components/ui/atoms/icon/adapters'")) {
    component.issues.push(`Missing IconAdapter import for FontAwesome icons`);
  }
  
  // Fix Lucide imports if in fix mode
  if (CONFIG.fix && foundLucide) {
    fixLucideIcons(component, content, filePath);
  }
}

// Fix Lucide icon imports
function fixLucideIcons(component, content, filePath) {
  console.log(`🔧 Fixing: Replacing Lucide icons with FontAwesome in ${component.name}`);
  
  try {
    let updatedContent = content;
    
    // Replace import statements
    updatedContent = updatedContent.replace(
      /import\s+{([^}]*)}\s+from\s+['"]lucide-react['"];?/g,
      "import { IconAdapter } from '@/components/ui/atoms/icon/adapters';"
    );
    
    // Common Lucide icon replacements
    const iconReplacements = [
      { from: /<X([^>]*?)>/g, to: '<IconAdapter iconId="faXmarkLight"$1>' },
      { from: /<\/X>/g, to: '</IconAdapter>' },
      { from: /<Check([^>]*?)>/g, to: '<IconAdapter iconId="faCheckLight"$1>' },
      { from: /<\/Check>/g, to: '</IconAdapter>' },
      { from: /<ChevronDown([^>]*?)>/g, to: '<IconAdapter iconId="faChevronDownLight"$1>' },
      { from: /<\/ChevronDown>/g, to: '</IconAdapter>' },
      { from: /<ChevronUp([^>]*?)>/g, to: '<IconAdapter iconId="faChevronUpLight"$1>' },
      { from: /<\/ChevronUp>/g, to: '</IconAdapter>' },
      { from: /<ChevronLeft([^>]*?)>/g, to: '<IconAdapter iconId="faChevronLeftLight"$1>' },
      { from: /<\/ChevronLeft>/g, to: '</IconAdapter>' },
      { from: /<ChevronRight([^>]*?)>/g, to: '<IconAdapter iconId="faChevronRightLight"$1>' },
      { from: /<\/ChevronRight>/g, to: '</IconAdapter>' },
      { from: /<Plus([^>]*?)>/g, to: '<IconAdapter iconId="faPlusLight"$1>' },
      { from: /<\/Plus>/g, to: '</IconAdapter>' },
      { from: /<Minus([^>]*?)>/g, to: '<IconAdapter iconId="faMinusLight"$1>' },
      { from: /<\/Minus>/g, to: '</IconAdapter>' },
      { from: /<Search([^>]*?)>/g, to: '<IconAdapter iconId="faMagnifyingGlassLight"$1>' },
      { from: /<\/Search>/g, to: '</IconAdapter>' },
      { from: /<Settings([^>]*?)>/g, to: '<IconAdapter iconId="faGearLight"$1>' },
      { from: /<\/Settings>/g, to: '</IconAdapter>' },
    ];
    
    // Apply each replacement
    iconReplacements.forEach(({ from, to }) => {
      updatedContent = updatedContent.replace(from, to);
    });
    
    // Write updated content back to file
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Replaced Lucide icons with FontAwesome in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to fix Lucide icons: ${error.message}`);
  }
}

// Fix component issues
function fixComponentIssues(component, expected) {
  // 1. Fix missing atomic implementation
  if (!component.hasAtomic && component.hasFlat) {
    const flatPath = path.join(CONFIG.componentsDir, `${component.name}.tsx`);
    const atomicDirPath = path.join(CONFIG.componentsDir, expected.level, component.name);
    const atomicPath = path.join(atomicDirPath, `${getPascalCaseName(component.name)}.tsx`);
    
    console.log(`🔧 Fixing: Moving flat implementation to atomic location`);
    
    try {
      // Create directory if needed
      fs.mkdirSync(atomicDirPath, { recursive: true });
      
      // Read flat file content
      const content = fs.readFileSync(flatPath, 'utf-8');
      
      // Write to atomic location
      fs.writeFileSync(atomicPath, content);
      console.log(`✅ Created atomic implementation: ${atomicPath}`);
      
      // Create barrel file
      createBarrelFile(component, expected.level);
      
      // Remove flat file
      fs.unlinkSync(flatPath);
      console.log(`✅ Removed flat implementation: ${flatPath}`);
      
      // Update component status
      component.hasAtomic = true;
      component.atomicLevel = expected.level;
      component.hasFlat = false;
      component.hasBarrel = true;
    } catch (error) {
      console.error(`❌ Failed to fix missing atomic implementation: ${error.message}`);
    }
  }
  
  // 2. Fix duplicate implementation
  if (component.hasFlat && component.hasAtomic) {
    const flatPath = path.join(CONFIG.componentsDir, `${component.name}.tsx`);
    
    console.log(`🔧 Fixing: Removing duplicate flat implementation`);
    
    try {
      // Remove flat file
      fs.unlinkSync(flatPath);
      console.log(`✅ Removed duplicate flat implementation: ${flatPath}`);
      
      // Update component status
      component.hasFlat = false;
    } catch (error) {
      console.error(`❌ Failed to remove duplicate implementation: ${error.message}`);
    }
  }
  
  // 3. Fix missing barrel file
  if (!component.hasBarrel && component.hasAtomic) {
    console.log(`🔧 Fixing: Creating missing barrel file`);
    createBarrelFile(component, component.atomicLevel);
    component.hasBarrel = true;
  }
}

// Helper function to convert kebab-case to PascalCase
function getPascalCaseName(kebabCase) {
  return kebabCase
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Validate components
function validateComponents(components) {
  console.log('\nValidating components...');
  
  // Compare against expected structure
  components.forEach(component => {
    // Find expected component config
    const expected = COMPONENT_MAP.find(c => c.name === component.name);
    
    // 1. Check if this is an expected component
    if (!expected) {
      component.issues.push(`Unexpected component - not in component map`);
      return;
    }
    
    // 2. Check for atomic implementation
    if (!component.hasAtomic) {
      component.issues.push(`Missing atomic implementation in ${expected.level}`);
    } else if (component.atomicLevel !== expected.level) {
      component.issues.push(`Incorrect atomic level: found in ${component.atomicLevel}, expected ${expected.level}`);
    }
    
    // 3. Check for barrel file
    if (!component.hasBarrel) {
      component.issues.push(`Missing barrel file (for Shadcn-style imports)`);
    }
    
    // 4. Check for duplicate implementation
    if (component.hasFlat && component.hasAtomic) {
      component.issues.push(`Duplicate implementation (both flat and atomic)`);
    }
    
    // 5. Validate barrel file content
    if (component.hasBarrel) {
      validateBarrelFile(component, expected);
    }
    
    // 6. Check component exports
    if (component.hasAtomic) {
      validateExports(component, expected);
    }
    
    // 7. Try to fix issues in fix mode
    if (CONFIG.fix && component.issues.length > 0) {
      fixComponentIssues(component, expected);
    }
  });
  
  // Check for missing components
  const implementedNames = components.map(c => c.name);
  const missingComponents = COMPONENT_MAP.filter(c => !implementedNames.includes(c.name));
  
  if (missingComponents.length > 0) {
    console.log('\n⚠️ Missing components:');
    missingComponents.forEach(c => {
      console.log(`- ${c.name} (expected in ${c.level})`);
    });
  }
  
  return components;
}

// Validate barrel file content
function validateBarrelFile(component, expected) {
  const barrelPath = path.join(CONFIG.componentsDir, `${component.name}.ts`);
  
  if (!fileExists(barrelPath)) {
    return;
  }
  
  // If we're in fix mode and there's no barrel file, create one
  if (CONFIG.fix && !component.hasBarrel && component.hasAtomic) {
    createBarrelFile(component, expected.level);
    component.hasBarrel = true;
    return;
  }
  
  try {
    const content = fs.readFileSync(barrelPath, 'utf-8');
    
    // Expected export path
    const expectedExport = `./${expected.level}/${component.name}/${getPascalCaseName(component.name)}`;
    
    if (!content.includes(`export * from '${expectedExport}'`)) {
      component.issues.push(`Barrel file doesn't correctly export from atomic location`);
      
      // Fix if in fix mode
      if (CONFIG.fix) {
        const fixedContent = `/**
 * Barrel file for ${component.name} component
 * 
 * This file enables Shadcn UI style imports:
 * import { ${getPascalCaseName(component.name)} } from "@/components/ui/${component.name}";
 * 
 * The actual component is located at:
 * @/components/ui/${expected.level}/${component.name}/${getPascalCaseName(component.name)}
 */

export * from '${expectedExport}';
`;
        fs.writeFileSync(barrelPath, fixedContent);
        console.log(`✅ Fixed barrel file: ${barrelPath}`);
      }
    }
  } catch (error) {
    component.issues.push(`Error reading barrel file: ${error.message}`);
  }
}
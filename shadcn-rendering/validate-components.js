/**
 * Component Validation Script
 * 
 * This script validates UI components against our standards:
 * 1. Checks for Lucide icons that need to be replaced with FontAwesome
 * 2. Identifies components with duplicate implementations
 * 3. Validates proper structure (index exports, barrel files, etc.)
 * 4. Reports components that need attention
 * 
 * Usage:
 * node scripts/validate-components.js [--fix] [--component=name] [--verbose]
 * 
 * Options:
 *   --fix         Automatically fix issues when possible
 *   --component   Only validate a specific component
 *   --verbose     Show detailed output
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  componentsDir: path.resolve(__dirname, '../src/components/ui'),
  fix: process.argv.includes('--fix'),
  verbose: process.argv.includes('--verbose'),
  targetComponent: process.argv.find(arg => arg.startsWith('--component='))?.split('=')[1]
};

// Icon mappings from Lucide to FontAwesome
const ICON_MAPPINGS = {
  'X': 'faXmarkLight',
  'Check': 'faCheckLight',
  'ChevronRight': 'faChevronRightLight',
  'ChevronLeft': 'faChevronLeftLight',
  'ChevronUp': 'faChevronUpLight',
  'ChevronDown': 'faChevronDownLight',
  'ChevronsUpDown': 'faChevronUpDownLight',
  'Menu': 'faBarsLight',
  'Search': 'faMagnifyingGlassLight',
  'Settings': 'faGearLight',
  'User': 'faUserLight',
  'Plus': 'faPlusLight',
  'Minus': 'faMinusLight',
  'Edit': 'faPenLight',
  'Trash': 'faTrashLight',
  'Calendar': 'faCalendarLight',
  'Clock': 'faClockLight',
  'Eye': 'faEyeLight',
  'EyeOff': 'faEyeSlashLight',
  'Info': 'faInfoCircleLight',
  'AlertCircle': 'faExclamationCircleLight',
  'AlertTriangle': 'faTriangleExclamationLight',
  'Bell': 'faBellLight',
  'Mail': 'faEnvelopeLight',
  'MoreHorizontal': 'faEllipsisLight',
  'MoreVertical': 'faEllipsisVerticalLight',
  'Star': 'faStarLight',
  'Heart': 'faHeartLight',
  'Home': 'faHomeLight',
  'ArrowRight': 'faArrowRightLight',
  'ArrowLeft': 'faArrowLeftLight',
  'ArrowUp': 'faArrowUpLight',
  'ArrowDown': 'faArrowDownLight',
  'ExternalLink': 'faArrowUpRightFromSquareLight',
  'Copy': 'faCopyLight',
  'Check': 'faCheckLight',
  'Download': 'faDownloadLight',
  'Upload': 'faUploadLight',
  'Loader': 'faSpinnerLight',
  'Filter': 'faFilterLight',
  'Sun': 'faSunLight',
  'Moon': 'faMoonLight',
  'CloudSun': 'faCloudSunLight',
  'CloudMoon': 'faCloudMoonLight'
};

// Log with verbosity check
function log(message, forceLog = false) {
  if (CONFIG.verbose || forceLog) {
    console.log(message);
  }
}

// Check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Read a file with error handling
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`);
    return null;
  }
}

// Write a file with error handling
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    log(`Error writing file ${filePath}: ${error.message}`);
    return false;
  }
}

// Find Lucide icon imports in a file
function findLucideIcons(fileContent) {
  // Check for import statement
  const importMatch = fileContent.match(/import\s+{([^}]+)}\s+from\s+["']lucide-react["']/);
  if (!importMatch) return [];
  
  // Extract imported icons
  const imports = importMatch[1].split(',').map(i => i.trim());
  return imports;
}

// Replace Lucide icons with FontAwesome in a file
function replaceLucideIcons(filePath, dryRun = false) {
  const content = readFile(filePath);
  if (!content) return { fixed: false, message: 'Could not read file' };
  
  const lucideIcons = findLucideIcons(content);
  if (lucideIcons.length === 0) return { fixed: false, message: 'No Lucide icons found' };
  
  // Track unmapped icons
  const unmappedIcons = [];
  
  // Create a modified version of the content
  let modifiedContent = content;
  
  // Replace the import statement
  modifiedContent = modifiedContent.replace(
    /import\s+{([^}]+)}\s+from\s+["']lucide-react["']/,
    `import { IconAdapter } from "@/components/ui/atoms/icon/adapters"`
  );
  
  // Replace each icon usage
  lucideIcons.forEach(icon => {
    const iconName = icon.trim();
    const faIcon = ICON_MAPPINGS[iconName];
    
    if (faIcon) {
      // Replace <IconName /> with <IconAdapter iconId="faIconName" />
      const iconRegex = new RegExp(`<${iconName}([^>]*)\\s*\\/>`, 'g');
      modifiedContent = modifiedContent.replace(iconRegex, (match, props) => {
        return `<IconAdapter iconId="${faIcon}"${props} />`;
      });
      
      // Replace <IconName></IconName> with <IconAdapter iconId="faIconName"></IconAdapter>
      const iconWithChildrenRegex = new RegExp(`<${iconName}([^>]*)>(.*?)<\\/${iconName}>`, 'g');
      modifiedContent = modifiedContent.replace(iconWithChildrenRegex, (match, props, children) => {
        return `<IconAdapter iconId="${faIcon}"${props}>${children}</IconAdapter>`;
      });
    } else {
      unmappedIcons.push(iconName);
    }
  });
  
  // If we have unmapped icons, report them
  if (unmappedIcons.length > 0) {
    return { 
      fixed: false, 
      message: `Found ${unmappedIcons.length} unmapped icons: ${unmappedIcons.join(', ')}` 
    };
  }
  
  // Write the modified content if not in dry run mode
  if (!dryRun) {
    if (writeFile(filePath, modifiedContent)) {
      return { 
        fixed: true, 
        message: `Replaced ${lucideIcons.length} Lucide icons with FontAwesome adapters` 
      };
    } else {
      return { fixed: false, message: 'Failed to write modified file' };
    }
  }
  
  return { 
    fixed: false, 
    message: `Would replace ${lucideIcons.length} Lucide icons with FontAwesome adapters (dry run)` 
  };
}

// Check if a component has an index.ts file with proper exports
function validateIndexFile(componentDir) {
  const indexPath = path.join(componentDir, 'index.ts');
  
  if (!fileExists(indexPath)) {
    return {
      valid: false,
      message: 'Missing index.ts file'
    };
  }
  
  const indexContent = readFile(indexPath);
  if (!indexContent) {
    return {
      valid: false,
      message: 'Could not read index.ts file'
    };
  }
  
  // Get component files to check for exports
  const componentFiles = fs.readdirSync(componentDir)
    .filter(file => file.endsWith('.tsx') && !file.startsWith('index'))
    .map(file => file.replace('.tsx', ''));
  
  // Check if each component is exported
  const missingExports = [];
  componentFiles.forEach(component => {
    const exportRegex = new RegExp(`export\\s+\\*\\s+from\\s+['"]\\.\\/\\s*${component}\\s*['"]`);
    if (!exportRegex.test(indexContent)) {
      missingExports.push(component);
    }
  });
  
  if (missingExports.length > 0) {
    return {
      valid: false,
      message: `Missing exports in index.ts: ${missingExports.join(', ')}`
    };
  }
  
  return {
    valid: true,
    message: 'Index file is valid'
  };
}

// Fix index.ts file for a component
function fixIndexFile(componentDir, dryRun = false) {
  const indexPath = path.join(componentDir, 'index.ts');
  
  // Get component files to include in exports
  const componentFiles = fs.readdirSync(componentDir)
    .filter(file => file.endsWith('.tsx') && !file.startsWith('index'))
    .map(file => file.replace('.tsx', ''));
  
  if (componentFiles.length === 0) {
    return {
      fixed: false,
      message: 'No component files found'
    };
  }
  
  // Create index content
  const indexContent = `/**
 * Index file for component exports
 * Generated by validate-components.js
 */

${componentFiles.map(component => `export * from './${component}';`).join('\n')}
`;
  
  if (!dryRun) {
    if (writeFile(indexPath, indexContent)) {
      return {
        fixed: true,
        message: `Created/updated index.ts with exports for ${componentFiles.length} components`
      };
    } else {
      return {
        fixed: false,
        message: 'Failed to write index.ts file'
      };
    }
  }
  
  return {
    fixed: false,
    message: `Would create/update index.ts with exports for ${componentFiles.length} components (dry run)`
  };
}

// Validate a specific component
function validateComponent(componentName) {
  log(`Validating component: ${componentName}`, true);
  
  const issues = [];
  
  // Check for the component in each atomic level
  const atomicLevels = ['atoms', 'molecules', 'organisms'];
  const implementations = [];
  
  atomicLevels.forEach(level => {
    const componentDir = path.join(CONFIG.componentsDir, level, componentName);
    
    if (fileExists(componentDir)) {
      implementations.push({
        level,
        path: componentDir
      });
    }
  });
  
  if (implementations.length === 0) {
    return {
      valid: false,
      message: `Component ${componentName} not found in any atomic level`,
      issues: []
    };
  }
  
  // Check for multiple implementations
  if (implementations.length > 1) {
    issues.push({
      type: 'multiple-implementations',
      message: `Component ${componentName} has multiple implementations: ${implementations.map(i => i.level).join(', ')}`,
      fix: CONFIG.fix ? null : 'Needs manual resolution - use --fix to keep the highest level implementation'
    });
    
    // If fixing, keep the highest level implementation (organisms > molecules > atoms)
    if (CONFIG.fix) {
      // Sort by level (organisms > molecules > atoms)
      implementations.sort((a, b) => {
        const levels = { organisms: 3, molecules: 2, atoms: 1 };
        return levels[b.level] - levels[a.level];
      });
      
      const keep = implementations[0];
      log(`Keeping ${componentName} implementation in ${keep.level}`, true);
      
      // Remove other implementations
      implementations.slice(1).forEach(impl => {
        log(`Would remove ${componentName} implementation in ${impl.level}`, true);
        // TODO: Implement removal logic if needed
      });
    }
  }
  
  // Validate each implementation
  implementations.forEach(impl => {
    // Check for index.ts file
    const indexResult = validateIndexFile(impl.path);
    if (!indexResult.valid) {
      issues.push({
        type: 'missing-index',
        level: impl.level,
        message: `${impl.level}/${componentName}: ${indexResult.message}`,
        fix: CONFIG.fix ? 'Fixing index.ts file' : 'Run with --fix to generate index.ts'
      });
      
      // Fix index file if requested
      if (CONFIG.fix) {
        const fixResult = fixIndexFile(impl.path);
        log(`Fix result: ${fixResult.message}`, true);
      }
    }
    
    // Check main component file
    const pascalName = componentName.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    const componentFilePath = path.join(impl.path, `${pascalName}.tsx`);
    
    if (!fileExists(componentFilePath)) {
      issues.push({
        type: 'missing-component-file',
        level: impl.level,
        message: `${impl.level}/${componentName}: Missing main component file ${pascalName}.tsx`,
        fix: null
      });
    } else {
      // Check for Lucide icons
      const content = readFile(componentFilePath);
      if (content) {
        const lucideIcons = findLucideIcons(content);
        if (lucideIcons.length > 0) {
          issues.push({
            type: 'lucide-icons',
            level: impl.level,
            message: `${impl.level}/${componentName}: Uses ${lucideIcons.length} Lucide icons: ${lucideIcons.join(', ')}`,
            fix: CONFIG.fix ? 'Replacing with FontAwesome adapters' : 'Run with --fix to replace with FontAwesome adapters'
          });
          
          // Replace Lucide icons if requested
          if (CONFIG.fix) {
            const replaceResult = replaceLucideIcons(componentFilePath);
            log(`Replace result: ${replaceResult.message}`, true);
          }
        }
      }
    }
    
    // Check barrel file
    const barrelFilePath = path.join(CONFIG.componentsDir, `${componentName}.ts`);
    if (!fileExists(barrelFilePath)) {
      issues.push({
        type: 'missing-barrel-file',
        level: impl.level,
        message: `${componentName}: Missing barrel file at ${barrelFilePath}`,
        fix: 'Run generate-barrel-files.js to create barrel files'
      });
    }
  });
  
  return {
    valid: issues.length === 0,
    message: issues.length === 0 ? `Component ${componentName} is valid` : `Component ${componentName} has ${issues.length} issues`,
    issues
  };
}

// Get all component names
function getAllComponentNames() {
  const components = new Set();
  const atomicLevels = ['atoms', 'molecules', 'organisms'];
  
  atomicLevels.forEach(level => {
    const levelPath = path.join(CONFIG.componentsDir, level);
    
    if (fileExists(levelPath)) {
      fs.readdirSync(levelPath)
        .filter(dir => {
          const dirPath = path.join(levelPath, dir);
          return fs.statSync(dirPath).isDirectory() && !dir.startsWith('.');
        })
        .forEach(dir => components.add(dir));
    }
  });
  
  return [...components];
}

// Main function
function main() {
  log('🔍 Validating UI components...', true);
  
  // Get components to validate
  const componentNames = CONFIG.targetComponent 
    ? [CONFIG.targetComponent] 
    : getAllComponentNames();
  
  log(`Found ${componentNames.length} components to validate`, true);
  
  // Track validation results
  const validComponents = [];
  const componentsWithIssues = [];
  
  // Validate each component
  componentNames.forEach(component => {
    const validationResult = validateComponent(component);
    
    if (validationResult.valid) {
      validComponents.push(component);
    } else {
      componentsWithIssues.push({
        name: component,
        issues: validationResult.issues
      });
    }
  });
  
  // Output results
  console.log('\n📊 Validation Results:');
  console.log(`- Total components: ${componentNames.length}`);
  console.log(`- Valid components: ${validComponents.length}`);
  console.log(`- Components with issues: ${componentsWithIssues.length}`);
  
  if (componentsWithIssues.length > 0) {
    console.log('\n🚨 Components with Issues:');
    
    componentsWithIssues.forEach(component => {
      console.log(`\n${component.name}:`);
      component.issues.forEach(issue => {
        console.log(`  - ${issue.message}`);
        if (issue.fix) {
          console.log(`    Fix: ${issue.fix}`);
        }
      });
    });
    
    console.log('\nRun with --fix flag to automatically fix issues where possible.');
  } else {
    console.log('\n✅ All components are valid!');
  }
}

// Run the script
main(); 
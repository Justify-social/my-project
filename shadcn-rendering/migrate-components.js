/**
 * Component Migration Script
 * 
 * This script migrates components from standard Shadcn structure to our Atomic Design structure.
 * It handles:
 * 1. Moving component files to the appropriate atomic level folder
 * 2. Creating proper naming conventions
 * 3. Replacing Lucide icons with FontAwesome
 * 4. Creating barrel files for Shadcn-style imports
 * 
 * Usage:
 * node scripts/migrate-components.js [--component=name] [--level=atoms|molecules|organisms] [--dry-run] [--verbose]
 * 
 * Options:
 *   --component   Name of the component to migrate (e.g., button, dialog)
 *   --level       Atomic design level (default: atoms)
 *   --dry-run     Show changes without applying them
 *   --verbose     Show detailed logs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  componentsDir: path.resolve(__dirname, '../src/components/ui'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  targetComponent: process.argv.find(arg => arg.startsWith('--component='))?.split('=')[1],
  atomicLevel: process.argv.find(arg => arg.startsWith('--level='))?.split('=')[1] || 'atoms'
};

// Validate atomic level
if (!['atoms', 'molecules', 'organisms'].includes(CONFIG.atomicLevel)) {
  console.error(`Error: Invalid atomic level "${CONFIG.atomicLevel}". Must be atoms, molecules, or organisms.`);
  process.exit(1);
}

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

// Create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!fileExists(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return true;
    } catch (error) {
      log(`Error creating directory ${dirPath}: ${error.message}`);
      return false;
    }
  }
  return true;
}

// Convert kebab-case to PascalCase
function toPascalCase(kebabCase) {
  return kebabCase
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
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

// Replace Lucide icons with FontAwesome in content
function replaceLucideIcons(content) {
  if (!content) return { modified: false, content };
  
  const lucideIcons = findLucideIcons(content);
  if (lucideIcons.length === 0) return { modified: false, content };
  
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
  
  // If we have unmapped icons, report them but return the partially modified content
  if (unmappedIcons.length > 0) {
    console.warn(`⚠️ Warning: Found ${unmappedIcons.length} unmapped icons: ${unmappedIcons.join(', ')}`);
    console.warn('These icons will need manual replacement');
  }
  
  return { modified: true, content: modifiedContent };
}

// Check if a component might be a compound component
function isCompoundComponent(content) {
  if (!content) return false;
  
  // Compound components often have multiple exports
  const exportCount = (content.match(/export\s+const\s+\w+/g) || []).length;
  
  // Compound components usually have Child components as properties
  const compoundPattern = /\w+\.\w+\s*=\s*\w+/;
  
  return exportCount > 2 || compoundPattern.test(content);
}

// Convert a component to a proper compound component format
function convertToCompoundComponent(content, componentName) {
  if (!content) return { modified: false, content };
  
  // If it's already in compound format, skip
  if (content.includes('as CompoundComponent')) {
    return { modified: false, content };
  }
  
  const pascalName = toPascalCase(componentName);
  
  // Check if this looks like a compound component
  if (!isCompoundComponent(content)) {
    return { modified: false, content };
  }
  
  log(`Converting ${pascalName} to compound component format`, true);
  
  // This is a simplistic approach - full compound component conversion
  // would require more complex AST parsing
  let modifiedContent = content;
  
  // Add type definitions at the top
  if (!modifiedContent.includes('interface Compound')) {
    // Look for the last import statement
    const lastImportIndex = modifiedContent.lastIndexOf('import');
    const importEndIndex = lastImportIndex > -1 ? 
      modifiedContent.indexOf('\n', modifiedContent.indexOf(';', lastImportIndex)) : 0;
    
    // Simple interface for compound component
    const compoundInterface = `
// Define the compound component interface
interface Compound${pascalName} extends React.FC<${pascalName}Props> {
  // Add child component types here as needed
}
`;
    
    // Insert after imports
    if (importEndIndex > 0) {
      modifiedContent = 
        modifiedContent.substring(0, importEndIndex + 1) + 
        compoundInterface + 
        modifiedContent.substring(importEndIndex + 1);
    }
    
    // Find the main component export
    const mainExportMatch = modifiedContent.match(
      new RegExp(`export\\s+const\\s+${pascalName}\\s*=\\s*React\\.forwardRef`)
    );
    
    if (mainExportMatch) {
      const exportIndex = mainExportMatch.index;
      
      // Replace the export
      modifiedContent = 
        modifiedContent.substring(0, exportIndex) + 
        `// Create the main component
const ${pascalName}Component = React.forwardRef` + 
        modifiedContent.substring(exportIndex + `export const ${pascalName} = React.forwardRef`.length);
      
      // Add export at the end
      modifiedContent += `
// Export the compound component
export const ${pascalName} = ${pascalName}Component as Compound${pascalName};
`;
    }
  }
  
  return { modified: true, content: modifiedContent };
}

// Create an index.ts file for a component
function createIndexFile(componentDir, componentName) {
  const indexPath = path.join(componentDir, 'index.ts');
  const pascalName = toPascalCase(componentName);
  
  const indexContent = `/**
 * Index file for component exports
 */

export * from './${pascalName}';
`;
  
  if (CONFIG.dryRun) {
    log(`Would create index file: ${indexPath}`, true);
    log(`With content:\n${indexContent}`);
    return true;
  }
  
  return writeFile(indexPath, indexContent);
}

// Create a barrel file for Shadcn-style imports
function createBarrelFile(componentName) {
  const barrelPath = path.join(CONFIG.componentsDir, `${componentName}.ts`);
  const pascalName = toPascalCase(componentName);
  const atomicPath = `./${CONFIG.atomicLevel}/${componentName}/${pascalName}`;
  
  const barrelContent = `/**
 * Barrel file for ${componentName} component
 * 
 * This file enables Shadcn UI style imports:
 * import { ${pascalName} } from "@/components/ui/${componentName}";
 * 
 * The actual component is located at:
 * @/components/ui/${CONFIG.atomicLevel}/${componentName}/${pascalName}
 */

export * from '${atomicPath}';
`;
  
  if (CONFIG.dryRun) {
    log(`Would create barrel file: ${barrelPath}`, true);
    log(`With content:\n${barrelContent}`);
    return true;
  }
  
  return writeFile(barrelPath, barrelContent);
}

// Migrate a specific component
function migrateComponent(componentName) {
  log(`Migrating component: ${componentName}`, true);
  
  // Source file (original Shadcn component)
  const sourceFilePath = path.join(CONFIG.componentsDir, `${componentName}.tsx`);
  
  // If the source file doesn't exist, check if it might be in a directory
  if (!fileExists(sourceFilePath)) {
    log(`Source file ${sourceFilePath} not found, checking directory structure`, true);
    
    // Check if there's a folder with the component name
    const sourceDirPath = path.join(CONFIG.componentsDir, componentName);
    
    if (fileExists(sourceDirPath)) {
      log(`Found directory ${sourceDirPath}, checking for component files`, true);
      
      // Check for index.tsx or other component files
      const dirFiles = fs.readdirSync(sourceDirPath);
      const componentFile = dirFiles.find(f => f.endsWith('.tsx') && (f === 'index.tsx' || f.toLowerCase().includes(componentName)));
      
      if (componentFile) {
        const altSourcePath = path.join(sourceDirPath, componentFile);
        log(`Using ${altSourcePath} as source file`, true);
        return migrateFromPath(altSourcePath, componentName);
      }
    }
    
    console.error(`❌ Error: Component ${componentName} not found. Make sure the file exists at ${sourceFilePath} or in a directory structure.`);
    return false;
  }
  
  return migrateFromPath(sourceFilePath, componentName);
}

// Migrate from a specific source path
function migrateFromPath(sourceFilePath, componentName) {
  // Target paths for Atomic Design structure
  const targetDir = path.join(CONFIG.componentsDir, CONFIG.atomicLevel, componentName);
  const pascalName = toPascalCase(componentName);
  const targetFilePath = path.join(targetDir, `${pascalName}.tsx`);
  
  // Check if target already exists
  if (fileExists(targetFilePath)) {
    console.warn(`⚠️ Warning: Target file ${targetFilePath} already exists. Skipping migration.`);
    return false;
  }
  
  // Read the source file
  const sourceContent = readFile(sourceFilePath);
  if (!sourceContent) {
    console.error(`❌ Error: Could not read source file ${sourceFilePath}.`);
    return false;
  }
  
  // Make a backup of the original file
  const backupFilePath = `${sourceFilePath}.bak`;
  
  if (CONFIG.dryRun) {
    log(`Would create backup: ${backupFilePath}`, true);
  } else {
    if (writeFile(backupFilePath, sourceContent)) {
      log(`✅ Created backup: ${backupFilePath}`, true);
    } else {
      console.warn(`⚠️ Warning: Failed to create backup. Continuing without backup.`);
    }
  }
  
  // Replace Lucide icons with FontAwesome
  const { modified: iconsModified, content: contentWithIcons } = replaceLucideIcons(sourceContent);
  
  // Convert to compound component if appropriate
  const { modified: formatModified, content: finalContent } = convertToCompoundComponent(contentWithIcons, componentName);
  
  // Create target directory
  if (CONFIG.dryRun) {
    log(`Would create directory: ${targetDir}`, true);
  } else {
    if (!ensureDir(targetDir)) {
      console.error(`❌ Error: Could not create target directory ${targetDir}.`);
      return false;
    }
  }
  
  // Write the migrated file
  if (CONFIG.dryRun) {
    log(`Would write migrated file: ${targetFilePath}`, true);
    log(`With content modifications:\n- Icons ${iconsModified ? 'modified' : 'unchanged'}\n- Format ${formatModified ? 'modified' : 'unchanged'}`);
  } else {
    if (writeFile(targetFilePath, finalContent)) {
      log(`✅ Created migrated file: ${targetFilePath}`, true);
    } else {
      console.error(`❌ Error: Failed to write migrated file ${targetFilePath}.`);
      return false;
    }
  }
  
  // Create index.ts file
  if (!createIndexFile(targetDir, componentName)) {
    console.warn(`⚠️ Warning: Failed to create index.ts file.`);
  }
  
  // Create barrel file for Shadcn-style imports
  if (!createBarrelFile(componentName)) {
    console.warn(`⚠️ Warning: Failed to create barrel file.`);
  }
  
  return true;
}

// Get all components to migrate
function getAllComponents() {
  try {
    return fs.readdirSync(CONFIG.componentsDir)
      .filter(file => file.endsWith('.tsx') && !file.startsWith('index'))
      .map(file => file.replace('.tsx', ''));
  } catch (error) {
    console.error(`❌ Error reading components directory: ${error.message}`);
    return [];
  }
}

// Main function
function main() {
  console.log(`🔄 Component Migration Tool ${CONFIG.dryRun ? '(DRY RUN)' : ''}`);
  console.log(`Target level: ${CONFIG.atomicLevel}`);
  
  // Get components to migrate
  const componentsToMigrate = CONFIG.targetComponent 
    ? [CONFIG.targetComponent] 
    : getAllComponents();
  
  if (componentsToMigrate.length === 0) {
    console.error('❌ No components found to migrate.');
    return;
  }
  
  console.log(`Found ${componentsToMigrate.length} component(s) to migrate.`);
  
  // Track migration results
  const migratedComponents = [];
  const failedComponents = [];
  
  // Migrate each component
  componentsToMigrate.forEach(component => {
    console.log(`\nMigrating ${component}...`);
    
    if (migrateComponent(component)) {
      migratedComponents.push(component);
      console.log(`✅ Successfully migrated ${component}`);
    } else {
      failedComponents.push(component);
      console.log(`❌ Failed to migrate ${component}`);
    }
  });
  
  // Output summary
  console.log('\n📊 Migration Summary:');
  console.log(`- Total components: ${componentsToMigrate.length}`);
  console.log(`- Successfully migrated: ${migratedComponents.length}`);
  console.log(`- Failed: ${failedComponents.length}`);
  
  if (failedComponents.length > 0) {
    console.log('\nFailed components:');
    failedComponents.forEach(comp => console.log(`- ${comp}`));
  }
  
  if (CONFIG.dryRun) {
    console.log('\nThis was a dry run. No files were actually modified.');
    console.log('Run again without --dry-run to apply changes.');
  }
}

// Run the script
main(); 
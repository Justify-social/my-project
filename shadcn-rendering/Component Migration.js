/**
 * Shadcn UI to Atomic Design Migration Script
 * 
 * This script helps migrate Shadcn UI components to our Atomic Design structure
 * while maintaining backward compatibility through barrel files.
 * It also handles replacing Lucide icons with our FontAwesome icon system.
 * 
 * Usage:
 * node scripts/migrate-components.js [--dry-run] [--component=button]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const CONFIG = {
  srcDir: path.resolve(__dirname, '../src'),
  componentsDir: path.resolve(__dirname, '../src/components/ui'),
  backupDir: path.resolve(__dirname, '../backups', `migration-${new Date().toISOString().replace(/:/g, '-')}`),
  dryRun: process.argv.includes('--dry-run'),
  targetComponent: process.argv.find(arg => arg.startsWith('--component='))?.split('=')[1] || null,
};

// Component mapping (component name to atomic level)
const COMPONENT_MAP = [
  // Atoms (simple components)
  { name: 'accordion', level: 'atoms', hasSubComponents: true },
  { name: 'alert', level: 'atoms', hasSubComponents: false },
  { name: 'alert-dialog', level: 'atoms', hasSubComponents: true },
  { name: 'avatar', level: 'atoms', hasSubComponents: true },
  { name: 'badge', level: 'atoms', hasSubComponents: false },
  { name: 'button', level: 'atoms', hasSubComponents: false },
  { name: 'calendar', level: 'atoms', hasSubComponents: false },
  { name: 'card', level: 'atoms', hasSubComponents: true },
  { name: 'checkbox', level: 'atoms', hasSubComponents: false },
  { name: 'collapsible', level: 'atoms', hasSubComponents: true },
  { name: 'command', level: 'atoms', hasSubComponents: true },
  { name: 'dialog', level: 'atoms', hasSubComponents: true },
  
  // Molecules (composite components)
  { name: 'data-table', level: 'molecules', hasSubComponents: true },
  { name: 'date-picker', level: 'molecules', hasSubComponents: true },
  { name: 'combobox', level: 'molecules', hasSubComponents: true },
  
  // Organisms (complex components)
  { name: 'form', level: 'organisms', hasSubComponents: true },
  { name: 'navigation-menu', level: 'organisms', hasSubComponents: true },
  // Add more components as needed
];

// Lucide to FontAwesome icon mappings
const ICON_MAPPINGS = [
  { lucide: 'X', fontAwesome: 'faXmarkLight' },
  { lucide: 'Check', fontAwesome: 'faCheckLight' },
  { lucide: 'ChevronDown', fontAwesome: 'faChevronDownLight' },
  { lucide: 'ChevronUp', fontAwesome: 'faChevronUpLight' },
  { lucide: 'ChevronLeft', fontAwesome: 'faChevronLeftLight' },
  { lucide: 'ChevronRight', fontAwesome: 'faChevronRightLight' },
  { lucide: 'Plus', fontAwesome: 'faPlusLight' },
  { lucide: 'Minus', fontAwesome: 'faMinusLight' },
  { lucide: 'Search', fontAwesome: 'faMagnifyingGlassLight' },
  { lucide: 'Settings', fontAwesome: 'faGearLight' },
  { lucide: 'User', fontAwesome: 'faUserLight' },
  { lucide: 'Calendar', fontAwesome: 'faCalendarLight' },
  { lucide: 'Bell', fontAwesome: 'faBellLight' },
  { lucide: 'Info', fontAwesome: 'faInfoLight' },
  { lucide: 'AlertTriangle', fontAwesome: 'faTriangleExclamationLight' },
  { lucide: 'Home', fontAwesome: 'faHomeLight' },
  { lucide: 'Menu', fontAwesome: 'faBarsLight' },
  { lucide: 'Mail', fontAwesome: 'faEnvelopeLight' },
  { lucide: 'Heart', fontAwesome: 'faHeartLight' },
  { lucide: 'ArrowRight', fontAwesome: 'faArrowRightLight' },
  { lucide: 'ArrowLeft', fontAwesome: 'faArrowLeftLight' },
  { lucide: 'ArrowUp', fontAwesome: 'faArrowUpLight' },
  { lucide: 'ArrowDown', fontAwesome: 'faArrowDownLight' },
];

// Initialize
function init() {
  console.log('🚀 Starting Shadcn UI to Atomic Design migration');
  console.log(`Mode: ${CONFIG.dryRun ? 'Dry Run (no changes will be made)' : 'Live Run'}`);
  
  if (CONFIG.targetComponent) {
    console.log(`Target: Only migrating ${CONFIG.targetComponent} component`);
  }
  
  // Create backup directory
  if (!CONFIG.dryRun) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    console.log(`Created backup directory: ${CONFIG.backupDir}`);
  }
}

// Backup existing files
function backupFiles() {
  if (CONFIG.dryRun) {
    console.log('Skipping backup in dry run mode');
    return;
  }
  
  console.log('Backing up existing files...');
  
  // Backup the entire components directory
  const backupPath = path.join(CONFIG.backupDir, 'components');
  fs.mkdirSync(backupPath, { recursive: true });
  
  // Using cp -r for directory copy
  try {
    execSync(`cp -r ${CONFIG.componentsDir}/* ${backupPath}`);
    console.log(`✅ Backed up components directory to ${backupPath}`);
  } catch (error) {
    console.error('❌ Failed to backup components:', error);
    process.exit(1);
  }
}

// Find components to migrate
function findComponentsToMigrate() {
  const components = CONFIG.targetComponent 
    ? COMPONENT_MAP.filter(c => c.name === CONFIG.targetComponent)
    : COMPONENT_MAP;
    
  if (components.length === 0) {
    console.error(`❌ No components found to migrate${CONFIG.targetComponent ? ` matching '${CONFIG.targetComponent}'` : ''}`);
    process.exit(1);
  }
  
  return components;
}

// Check if a component file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Migrate a single component
function migrateComponent(component) {
  console.log(`\n🔄 Migrating component: ${component.name}`);
  
  // Define paths
  const flatFilePath = path.join(CONFIG.componentsDir, `${component.name}.tsx`);
  const flatIndexPath = path.join(CONFIG.componentsDir, `${component.name}.ts`);
  const atomicDirPath = path.join(CONFIG.componentsDir, component.level, component.name);
  const atomicFilePath = path.join(atomicDirPath, `${getPascalCaseName(component.name)}.tsx`);
  const atomicIndexPath = path.join(atomicDirPath, 'index.ts');
  
  // Check if files exist
  const hasFlatFile = fileExists(flatFilePath);
  const hasAtomicFile = fileExists(atomicFilePath);
  
  console.log(`- Flat file (${flatFilePath}): ${hasFlatFile ? 'EXISTS' : 'MISSING'}`);
  console.log(`- Atomic file (${atomicFilePath}): ${hasAtomicFile ? 'EXISTS' : 'MISSING'}`);
  
  // Decide migration strategy
  if (hasAtomicFile && hasFlatFile) {
    console.log('- Strategy: Both implementations exist, keeping atomic and creating barrel file');
    
    // In live mode, remove flat file and create barrel
    if (!CONFIG.dryRun) {
      // Create barrel file pointing to atomic implementation
      createBarrelFile(component);
      
      // Remove flat file
      fs.unlinkSync(flatFilePath);
      console.log(`✅ Removed duplicate flat implementation: ${flatFilePath}`);
    }
  } else if (hasAtomicFile && !hasFlatFile) {
    console.log('- Strategy: Atomic implementation exists, creating barrel file');
    
    // Just create barrel file
    if (!CONFIG.dryRun) {
      createBarrelFile(component);
    }
  } else if (!hasAtomicFile && hasFlatFile) {
    console.log('- Strategy: Only flat implementation exists, migrating to atomic structure');
    
    // Move flat file to atomic structure
    if (!CONFIG.dryRun) {
      // Create directory if needed
      fs.mkdirSync(atomicDirPath, { recursive: true });
      
      // Read flat file content
      let componentContent = fs.readFileSync(flatFilePath, 'utf-8');
      
      // Replace Lucide icons with FontAwesome
      componentContent = replaceIcons(componentContent);
      
      // Write to atomic location
      fs.writeFileSync(atomicFilePath, componentContent);
      console.log(`✅ Created atomic implementation: ${atomicFilePath}`);
      
      // Create barrel file
      createBarrelFile(component);
      
      // Remove flat file
      fs.unlinkSync(flatFilePath);
      console.log(`✅ Removed flat implementation: ${flatFilePath}`);
      
      // Create index.ts in atomic folder
      createAtomicIndex(component);
    }
  } else {
    console.log('❌ Error: Neither flat nor atomic implementation exists!');
    return false;
  }
  
  return true;
}

// Replace Lucide icons with FontAwesome icons
function replaceIcons(content) {
  console.log('- Checking for Lucide icons to replace with FontAwesome...');
  
  let updatedContent = content;
  let replacementCount = 0;
  
  // Check for Lucide imports
  const hasLucideImport = /from ['"]lucide-react['"]/i.test(content);
  
  if (hasLucideImport) {
    // Add IconAdapter import
    if (!content.includes("from '@/components/ui/atoms/icon/adapters'")) {
      updatedContent = updatedContent.replace(
        /import /i,
        "import { IconAdapter } from '@/components/ui/atoms/icon/adapters';\nimport "
      );
    }
    
    // Remove Lucide imports
    updatedContent = updatedContent.replace(
      /import\s+{([^}]*)}\s+from\s+['"]lucide-react['"];?\n?/g,
      ""
    );
    
    // Replace icon components
    ICON_MAPPINGS.forEach(({ lucide, fontAwesome }) => {
      const openTagRegex = new RegExp(`<${lucide}([^>]*?)>`, 'g');
      const closeTagRegex = new RegExp(`</${lucide}>`, 'g');
      
      const openTagMatches = updatedContent.match(openTagRegex) || [];
      replacementCount += openTagMatches.length;
      
      updatedContent = updatedContent.replace(openTagRegex, `<IconAdapter iconId="${fontAwesome}"$1>`);
      updatedContent = updatedContent.replace(closeTagRegex, '</IconAdapter>');
    });
    
    console.log(`- Replaced ${replacementCount} Lucide icons with FontAwesome`);
  } else {
    console.log('- No Lucide icons found');
  }
  
  return updatedContent;
}

// Create a barrel file for a component
function createBarrelFile(component) {
  const barrelPath = path.join(CONFIG.componentsDir, `${component.name}.ts`);
  const atomicPath = `./${component.level}/${component.name}/${getPascalCaseName(component.name)}`;
  
  const content = `/**
 * Barrel file for ${component.name} component
 * 
 * This file enables Shadcn UI style imports:
 * import { ${getPascalCaseName(component.name)} } from "@/components/ui/${component.name}";
 * 
 * The actual component is located at:
 * @/components/ui/${component.level}/${component.name}/${getPascalCaseName(component.name)}
 */

export * from '${atomicPath}';
`;
  
  fs.writeFileSync(barrelPath, content);
  console.log(`✅ Created barrel file: ${barrelPath}`);
}

// Create index.ts in atomic folder
function createAtomicIndex(component) {
  const indexPath = path.join(CONFIG.componentsDir, component.level, component.name, 'index.ts');
  const componentName = getPascalCaseName(component.name);
  
  const content = `export * from './${componentName}';
`;
  
  fs.writeFileSync(indexPath, content);
  console.log(`✅ Created atomic index file: ${indexPath}`);
}

// Helper function to convert kebab-case to PascalCase
function getPascalCaseName(kebabCase) {
  return kebabCase
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Run validation on migrated components
function validateMigration(components) {
  console.log('\n🔍 Validating migration...');
  let success = true;
  
  for (const component of components) {
    const barrelPath = path.join(CONFIG.componentsDir, `${component.name}.ts`);
    const atomicFilePath = path.join(
      CONFIG.componentsDir, 
      component.level, 
      component.name, 
      `${getPascalCaseName(component.name)}.tsx`
    );
    
    // Check if barrel file exists
    if (!fileExists(barrelPath)) {
      console.error(`❌ Missing barrel file: ${barrelPath}`);
      success = false;
    }
    
    // Check if atomic file exists
    if (!fileExists(atomicFilePath)) {
      console.error(`❌ Missing atomic implementation: ${atomicFilePath}`);
      success = false;
    }
    
    // Check if flat file was removed
    const flatFilePath = path.join(CONFIG.componentsDir, `${component.name}.tsx`);
    if (fileExists(flatFilePath)) {
      console.error(`❌ Flat file still exists: ${flatFilePath}`);
      success = false;
    }
    
    // Check for Lucide icon usage
    if (fileExists(atomicFilePath)) {
      const content = fs.readFileSync(atomicFilePath, 'utf-8');
      if (/from ['"]lucide-react['"]/i.test(content)) {
        console.error(`❌ Component still has Lucide icon imports: ${atomicFilePath}`);
        success = false;
      }
    }
  }
  
  return success;
}

// Main function
function main() {
  try {
    init();
    backupFiles();
    
    const components = findComponentsToMigrate();
    console.log(`Found ${components.length} components to migrate`);
    
    // Migrate each component
    let migrationCount = 0;
    for (const component of components) {
      if (migrateComponent(component)) {
        migrationCount++;
      }
    }
    
    console.log(`\n📊 Migration summary:`);
    console.log(`- Total components: ${components.length}`);
    console.log(`- Successfully migrated: ${migrationCount}`);
    console.log(`- Failed: ${components.length - migrationCount}`);
    
    if (!CONFIG.dryRun && migrationCount > 0) {
      const validationSuccess = validateMigration(components);
      console.log(`\n${validationSuccess ? '✅ Validation successful!' : '❌ Validation failed!'}`);
    }
    
    console.log(`\n${CONFIG.dryRun ? '🔍 Dry run completed.' : '🎉 Migration completed!'}`);
    if (CONFIG.dryRun) {
      console.log('Run again without --dry-run to apply changes.');
    } else {
      console.log(`Backup created at: ${CONFIG.backupDir}`);
    }
  } catch (error) {
    console.error('❌ Migration failed with an error:', error);
    process.exit(1);
  }
}

main();
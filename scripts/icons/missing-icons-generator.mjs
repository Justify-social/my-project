#!/usr/bin/env node

/**
 * Icon Mapping Generator
 * 
 * This script creates a mapping between legacy FontAwesome icon references and their 
 * corresponding entries in the existing icon registry. It does NOT generate new icons 
 * or modify the registry, only provides a mapping file to help the icon system find 
 * the correct existing icon.
 * 
 * Usage:
 *   node scripts/icons/missing-icons-generator.mjs             # Dry run
 *   node scripts/icons/missing-icons-generator.mjs --execute   # Create mapping file
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, 'public');
const STATIC_DIR = path.resolve(PUBLIC_DIR, 'static');
const DRY_RUN = !process.argv.includes('--execute');
const VERBOSE = process.argv.includes('--verbose');

// Registry files to analyze
const LIGHT_REGISTRY_FILE = path.join(STATIC_DIR, 'light-icon-registry.json');
const SOLID_REGISTRY_FILE = path.join(STATIC_DIR, 'solid-icon-registry.json');

// Output mapping file location
const MAPPING_FILE = path.join(STATIC_DIR, 'icon-name-mapping.json');

// Results tracking
const stats = {
  iconsMapped: 0,
  existingIcons: {}
};

/**
 * Load icon registries to identify existing icons
 */
function loadExistingIconRegistry() {
  console.log(chalk.blue('Loading existing icon registries...'));
  
  try {
    // Load light icons registry
    const lightRegistry = JSON.parse(fs.readFileSync(LIGHT_REGISTRY_FILE, 'utf8'));
    
    if (lightRegistry && Array.isArray(lightRegistry.icons)) {
      console.log(chalk.gray(`  - Light icons: ${lightRegistry.icons.length} entries`));
      
      // Store all light icons for lookup
      lightRegistry.icons.forEach(icon => {
        if (icon.id && icon.faVersion) {
          stats.existingIcons[icon.id] = {
            id: icon.id,
            category: 'light',
            faVersion: icon.faVersion,
            path: icon.path
          };
        }
      });
    }
    
    // Load solid icons registry
    const solidRegistry = JSON.parse(fs.readFileSync(SOLID_REGISTRY_FILE, 'utf8'));
    
    if (solidRegistry && Array.isArray(solidRegistry.icons)) {
      console.log(chalk.gray(`  - Solid icons: ${solidRegistry.icons.length} entries`));
      
      // Store all solid icons for lookup
      solidRegistry.icons.forEach(icon => {
        if (icon.id && icon.faVersion) {
          stats.existingIcons[icon.id] = {
            id: icon.id,
            category: 'solid',
            faVersion: icon.faVersion,
            path: icon.path
          };
        }
      });
    }
    
    console.log(chalk.green(`Found ${Object.keys(stats.existingIcons).length} total existing icons`));
    
  } catch (error) {
    console.error(chalk.red('Error loading registries:'), error.message);
  }
}

/**
 * Generate icon name mappings for common FontAwesome icons
 */
function generateIconMappings() {
  console.log(chalk.blue('\nGenerating icon name mappings...'));
  
  // Define known mappings (legacy FA name → proper registry name)
  const iconMappings = {
    // The primary mappings requested by the user
    'faSearch': 'faMagnifyingGlassLight',
    'faSearchSolid': 'faMagnifyingGlassSolid',
    
    // Other common mappings
    'faCircleNotch': 'faCircleNotchLight',
    'faXmark': 'faXmarkLight',
    'faHome': 'faHomeLight',
    'faFolder': 'faFolderLight',
    'faChartLine': 'faChartLineLight',
    'faComment': 'faCommentLight',
    'faCog': 'faGearLight',
    'faCoins': 'faCoinsLight',
    'faBell': 'faBellLight',
    'faPalette': 'faPaletteLight',
    'faCubes': 'faCubesLight',
    'faArrowLeft': 'faArrowLeftLight',
    'faAtom': 'faAtomLight',
    'faDna': 'faDnaLight',
    'faBacterium': 'faBacteriumLight',
    'faMagnifyingGlassPlus': 'faMagnifyingGlassPlusLight',
    'faGithub': 'faGithubLight',
    'faChevronRight': 'faChevronRightLight',
    'faChevronDown': 'faChevronDownLight',
    'faChevronLeft': 'faChevronLeftLight',
    'faChevronUp': 'faChevronUpLight',
    'faTrashCan': 'faTrashCanLight',
    'faUser': 'faUserLight',
    'faUserGroup': 'faUserGroupLight',
    'faCalendar': 'faCalendarLight',
    'faPlus': 'faPlusLight',
    'faCircleCheck': 'faCircleCheckLight',
    'faFilter': 'faFilterLight',
    'faEnvelope': 'faEnvelopeLight',
    'faBuilding': 'faBuildingLight',
    'faUserCircle': 'faUserCircleLight',
    'faCircleInfo': 'faCircleInfoLight',
    'faCircleQuestion': 'faCircleQuestionLight',
    'faGlobe': 'faGlobeLight',
    'faCommentDots': 'faCommentDotsLight',
    'faTag': 'faTagLight',
    'faStar': 'faStarLight',
    'faDollarSign': 'faDollarSignLight',
    'faList': 'faListLight',
    'faCheckCircle': 'faCheckCircleLight',
    'faCircleExclamation': 'faCircleExclamationLight',
    'faRotate': 'faRotateLight',
    'faFilterSlash': 'faFilterSlashLight',
    'faCheck': 'faCheckLight',
    'faArrowRight': 'faArrowRightLight',
    'faUpload': 'faUploadLight',
    'faInfo': 'faInfoLight',
    'faChartBar': 'faChartBarLight',
    'faLightbulb': 'faLightbulbLight',
    'faArrowTrendUp': 'faArrowTrendUpLight',
    'faSave': 'faFloppyDiskLight',  // FontAwesome renamed "save" to "floppy-disk"
    
    // Add solid variants too
    'faCircleNotchSolid': 'faCircleNotchSolid',
    'faXmarkSolid': 'faXmarkSolid',
    'faHomeSolid': 'faHomeSolid',
    'faFolderSolid': 'faFolderSolid'
    // Add more solid variants as needed
  };
  
  // Validate mappings against existing icons
  const validatedMappings = {};
  let invalidCount = 0;
  
  Object.entries(iconMappings).forEach(([legacyName, registryId]) => {
    // Check if the target registry ID exists
    if (stats.existingIcons[registryId]) {
      validatedMappings[legacyName] = registryId;
      stats.iconsMapped++;
    } else {
      console.log(chalk.yellow(`Warning: Mapping target '${registryId}' for '${legacyName}' not found in registry`));
      invalidCount++;
    }
  });
  
  console.log(chalk.green(`Created ${stats.iconsMapped} valid icon mappings`));
  if (invalidCount > 0) {
    console.log(chalk.yellow(`Found ${invalidCount} invalid mappings (targets not in registry)`));
  }
  
  return {
    mappings: validatedMappings,
    generated: new Date().toISOString(),
    version: '1.0.0',
    count: stats.iconsMapped
  };
}

/**
 * Save the mappings to a file
 */
function saveMappings(mappingData) {
  console.log(chalk.blue('\nSaving icon mappings...'));
  
  if (DRY_RUN) {
    console.log(chalk.yellow('DRY RUN: Would save mappings to', MAPPING_FILE));
    console.log(chalk.gray('Preview of mappings:'));
    console.log(JSON.stringify(mappingData, null, 2).slice(0, 500) + '...');
  } else {
    try {
      fs.writeFileSync(
        MAPPING_FILE,
        JSON.stringify(mappingData, null, 2)
      );
      console.log(chalk.green(`Saved icon mappings to: ${MAPPING_FILE}`));
    } catch (error) {
      console.error(chalk.red('Error saving mappings:'), error.message);
    }
  }
}

/**
 * Print summary of actions taken
 */
function printSummary() {
  console.log(chalk.yellow('\nIcon Mapping Generator Summary:'));
  console.log(chalk.yellow('-----------------------------'));
  console.log(`Existing icons analyzed: ${Object.keys(stats.existingIcons).length}`);
  console.log(`Icon mappings created: ${stats.iconsMapped}`);
  
  console.log(chalk.green('\nNext steps:'));
  console.log('1. Ensure Icon component is updated to use the mapping file');
  console.log('2. Run verification to confirm correct icon rendering:');
  console.log('     node scripts/icons/verify-icon-rendering.mjs');
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('Icon Mapping Generator'));
  console.log(chalk.gray('--------------------'));
  
  if (DRY_RUN) {
    console.log(chalk.yellow('Running in DRY RUN mode - no files will be modified\n'));
  } else {
    console.log(chalk.green('Running in EXECUTE mode - mapping file will be created\n'));
  }
  
  // Load existing icon registry
  loadExistingIconRegistry();
  
  // Generate icon mappings
  const mappingData = generateIconMappings();
  
  // Save mappings to file
  saveMappings(mappingData);
  
  // Print summary
  printSummary();
}

// Run the script
main().catch(err => {
  console.error(chalk.red('\nError:'), err);
  process.exit(1);
}); 
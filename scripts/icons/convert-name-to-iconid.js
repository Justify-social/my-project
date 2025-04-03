#!/usr/bin/env node

/**
 * Icon Name to IconId Converter
 * 
 * This script updates all Icon components that use the legacy 'name' attribute
 * to use the standardized 'iconId' attribute instead, and adds the Light or Solid
 * suffix to the icon names.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Build a mapping of old icon names to the new format with light/solid variants
// Prefer Light by default, use Solid only when explicitly specified
const iconVariantMapping = {
  // Default mappings for common icons
  "faSearch": "faMagnifyingGlassLight",
  "faSearchSolid": "faMagnifyingGlassSolid",
  "faXmark": "faXmarkLight",
  "faFolder": "faFolderLight",
  "faChartLine": "faChartLineLight",
  "faComment": "faCommentLight", 
  "faCog": "faGearLight",
  "faCoins": "faCoinsLight",
  "faBell": "faBellLight",
  "faPalette": "faPaletteLight",
  "faArrowLeft": "faArrowLeftLight",
  "faAtom": "faAtomLight",
  "faDna": "faDnaLight",
  "faBacterium": "faBacteriumLight",
  "faMagnifyingGlassPlus": "faMagnifyingGlassPlusLight",
  "faGithub": "brandsGithub",
  "faChevronRight": "faChevronRightLight",
  "faChevronDown": "faChevronDownLight",
  "faChevronLeft": "faChevronLeftLight",
  "faChevronUp": "faChevronUpLight",
  "faTrashCan": "faTrashCanLight",
  "faTrashAlt": "faTrashCanLight",
  "faUser": "faUserLight",
  "faUserGroup": "faUserGroupLight",
  "faCalendar": "faCalendarLight",
  "faPlus": "faPlusLight",
  "faCircleCheck": "faCircleCheckLight",
  "faFilter": "faFilterLight",
  "faEnvelope": "faEnvelopeLight",
  "faBuilding": "faBuildingLight",
  "faUserCircle": "faUserCircleLight", 
  "faCircleInfo": "faCircleInfoLight",
  "faCircleQuestion": "faCircleQuestionLight",
  "faGlobe": "faGlobeLight",
  "faCommentDots": "faCommentDotsLight",
  "faTag": "faTagLight",
  "faStar": "faStarLight",
  "faDollarSign": "faDollarSignLight",
  "faList": "faListLight",
  "faRotate": "faRotateLight",
  "faCheck": "faCheckLight",
  "faArrowRight": "faArrowRightLight",
  "faArrowUp": "faArrowUpLight",
  "faArrowDown": "faArrowDownLight",
  "faUpload": "faUploadLight",
  "faInfo": "faInfoLight",
  "faChartBar": "faChartBarLight",
  "faChartPie": "faChartPieLight",
  "faLightbulb": "faLightbulbLight",
  "faArrowTrendUp": "faArrowTrendUpLight",
  "faSave": "faFloppyDiskLight",
  "faSpinner": "faSpinnerLight",
  "faMinus": "faMinusLight",
  "faFileVideo": "faFileVideoLight",
  "faFileImage": "faFileImageLight",
  "faFileAudio": "faFileAudioLight",
  "faFile": "faFileLight",
  "faDocument": "faFileLight",
  "faDocumentText": "faFileLight",
  "faCircleXmark": "faCircleXmarkLight",
  "faPencil": "faPencilLight",
  "faPaperPlane": "faPaperPlaneLight",
  "faClock": "faClockLight",
  "faPlay": "faPlayLight",
  "faFlag": "faFlagLight",
  "faPrint": "faPrintLight",
  "faShare": "faShareLight",
  "faPenToSquare": "faPenToSquareLight",
  "faImage": "faImageLight",
  "faMap": "faMapLight",
  "faBolt": "faBoltLight",
  "faCopy": "faCopyLight",
  "faTriangleExclamation": "faTriangleExclamationLight",
};

// Find all files using Icon components with name attribute
console.log(chalk.blue('Searching for files with legacy icon references...'));

try {
  const findCommand = `find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "name=\\"fa"`;
  const filesToProcess = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  
  console.log(chalk.green(`Found ${filesToProcess.length} files with legacy icon references`));
  
  // Track stats
  let totalReplacements = 0;
  let processedFiles = 0;
  let updatedFiles = 0;
  
  // Process each file
  for (const filePath of filesToProcess) {
    processedFiles++;
    console.log(chalk.blue(`Processing ${filePath} (${processedFiles}/${filesToProcess.length})`));
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    let fileReplacements = 0;
    
    // Create a backup
    fs.writeFileSync(`${filePath}.bak`, content);
    
    // Pattern to match the Icon component with name attribute
    // This regex looks for something like: <Icon name="faIconName" ... />
    // and captures relevant parts for replacement
    const nameRegex = /<Icon\s+([^>]*?)name="(fa[A-Za-z]+)"([^>]*?)(solid=\{(true|false)\})?([^>]*?)(\/>|>\s*<\/Icon>)/g;
    
    content = content.replace(nameRegex, (match, prefix, iconName, middle, solidProp, solidValue, suffix, closing) => {
      fileReplacements++;
      updated = true;
      
      // Determine if solid variant should be used
      let newIconName = iconName;
      if (solidProp && solidValue === 'true') {
        // Use solid variant if explicitly requested
        newIconName = iconName + 'Solid';
      } else {
        // Use light variant by default
        newIconName = iconName + 'Light';
      }
      
      // Use mapping if available, otherwise use default suffix
      newIconName = iconVariantMapping[iconName] || newIconName;
      
      // Remove the iconType attribute if present
      const cleanedPrefix = prefix.replace(/iconType="[^"]*"\s*/, '');
      const cleanedMiddle = middle.replace(/iconType="[^"]*"\s*/, '');
      const cleanedSuffix = suffix.replace(/iconType="[^"]*"\s*/, '');
      
      // Build the new component without solid prop
      let newComponent = `<Icon ${cleanedPrefix}iconId="${newIconName}"${cleanedMiddle}${cleanedSuffix}${closing}`;
      
      console.log(`  ${chalk.cyan(iconName)} → ${chalk.green(newIconName)}`);
      return newComponent;
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(chalk.green(`  Updated file with ${fileReplacements} replacements`));
      totalReplacements += fileReplacements;
      updatedFiles++;
    } else {
      console.log(chalk.gray('  No replacements made'));
    }
  }
  
  console.log(chalk.green(`\n✓ Completed processing ${processedFiles} files`));
  console.log(chalk.green(`✓ Updated ${updatedFiles} files with ${totalReplacements} icon replacements`));
  
} catch (error) {
  console.error(chalk.red('Error updating icon references:'), error);
  process.exit(1);
} 
#!/usr/bin/env node

/**
 * Convert Solid Attributes Script
 * 
 * This script removes all solid={} attributes from Icon components
 * and updates the iconId to have the appropriate Light/Solid suffix.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Find all files with solid attributes
console.log(chalk.blue('Searching for files with solid attributes...'));

try {
  const findCommand = `find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "solid={"`;
  const filesToProcess = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  
  console.log(chalk.green(`Found ${filesToProcess.length} files with solid attributes`));
  
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
    
    // Replace solid={true} with Solid suffix in iconId
    const solidTrueRegex = /iconId="(fa[A-Za-z]+Light|fa[A-Za-z]+)"([^>]*?)solid=\{\s*true\s*\}([^>]*?)(\/>|>\s*<\/Icon>)/g;
    content = content.replace(solidTrueRegex, (match, iconId, prefix, suffix, closing) => {
      fileReplacements++;
      updated = true;
      
      // Create the solid variant by replacing Light with Solid or adding Solid
      let solidIconId;
      if (iconId.endsWith('Light')) {
        solidIconId = iconId.replace(/Light$/, 'Solid');
      } else {
        solidIconId = `${iconId}Solid`;
      }
      
      console.log(`  ${chalk.cyan(iconId)} + solid={true} → ${chalk.green(solidIconId)}`);
      return `iconId="${solidIconId}"${prefix}${suffix}${closing}`;
    });
    
    // Remove solid={false} from iconId (since Light is default)
    const solidFalseRegex = /iconId="(fa[A-Za-z]+)"([^>]*?)solid=\{\s*false\s*\}([^>]*?)(\/>|>\s*<\/Icon>)/g;
    content = content.replace(solidFalseRegex, (match, iconId, prefix, suffix, closing) => {
      fileReplacements++;
      updated = true;
      
      // Ensure Light suffix
      let lightIconId;
      if (!iconId.endsWith('Light') && !iconId.endsWith('Solid')) {
        lightIconId = `${iconId}Light`;
      } else {
        lightIconId = iconId;
      }
      
      console.log(`  ${chalk.cyan(iconId)} + solid={false} → ${chalk.green(lightIconId)}`);
      return `iconId="${lightIconId}"${prefix}${suffix}${closing}`;
    });
    
    // Handle remaining name="fa..." with solid={} attributes
    const nameWithSolidRegex = /name="(fa[A-Za-z]+)"([^>]*?)solid=\{\s*(true|false)\s*\}([^>]*?)(\/>|>\s*<\/Icon>)/g;
    content = content.replace(nameWithSolidRegex, (match, iconName, prefix, solidValue, suffix, closing) => {
      fileReplacements++;
      updated = true;
      
      // Determine suffix based on solid value
      const newIconId = solidValue === 'true' ? 
        `${iconName}Solid` : 
        `${iconName}Light`;
      
      // Remove any iconType attributes
      const cleanedPrefix = prefix.replace(/iconType="[^"]*"\s*/, '');
      const cleanedSuffix = suffix.replace(/iconType="[^"]*"\s*/, '');
      
      console.log(`  ${chalk.cyan(`name="${iconName}" + solid={${solidValue}}`)} → ${chalk.green(`iconId="${newIconId}"`)}`);
      return `iconId="${newIconId}"${cleanedPrefix}${cleanedSuffix}${closing}`;
    });
    
    // Clean up any remaining iconType attributes
    const iconTypeRegex = /iconId="([^"]+)"([^>]*?)iconType="[^"]*"([^>]*?)(\/>|>\s*<\/Icon>)/g;
    content = content.replace(iconTypeRegex, (match, iconId, prefix, suffix, closing) => {
      fileReplacements++;
      updated = true;
      console.log(`  Removed iconType attribute from ${chalk.green(`iconId="${iconId}"`)}`);
      return `iconId="${iconId}"${prefix}${suffix}${closing}`;
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
  console.error(chalk.red('Error updating solid attributes:'), error);
  process.exit(1);
} 
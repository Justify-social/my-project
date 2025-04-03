#!/usr/bin/env node

/**
 * Fix Duplicate Icon Suffixes
 * 
 * This script fixes duplicate Light and Solid suffixes that might have been
 * introduced by the conversion script.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Find all files that might have duplicate suffixes
console.log(chalk.blue('Searching for files with duplicate icon suffixes...'));

try {
  // Search for files with duplicate Light or Solid suffixes
  const findCommand = `find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "LightLight\\|SolidSolid"`;
  const filesToProcess = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  
  console.log(chalk.green(`Found ${filesToProcess.length} files with duplicate suffixes`));
  
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
    
    // Fix duplicate Light suffixes
    const lightRegex = /iconId="(fa[A-Za-z]+)LightLight"/g;
    content = content.replace(lightRegex, (match, iconBase) => {
      fileReplacements++;
      updated = true;
      console.log(`  ${chalk.cyan(`${iconBase}LightLight`)} → ${chalk.green(`${iconBase}Light`)}`);
      return `iconId="${iconBase}Light"`;
    });
    
    // Fix duplicate Solid suffixes
    const solidRegex = /iconId="(fa[A-Za-z]+)SolidSolid"/g;
    content = content.replace(solidRegex, (match, iconBase) => {
      fileReplacements++;
      updated = true;
      console.log(`  ${chalk.cyan(`${iconBase}SolidSolid`)} → ${chalk.green(`${iconBase}Solid`)}`);
      return `iconId="${iconBase}Solid"`;
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
  console.error(chalk.red('Error fixing duplicate suffixes:'), error);
  process.exit(1);
} 
#!/usr/bin/env node

/**
 * Icon Reference Scanner
 * 
 * This script scans the codebase for legacy icon references that need to be updated
 * to standardized icons from the icon registry. It generates a detailed report of
 * all references found.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Load the icon mapping file
const iconMappingPath = path.join(process.cwd(), 'public', 'static', 'icon-name-mapping.json');
const iconMapping = JSON.parse(fs.readFileSync(iconMappingPath, 'utf8')).mappings;
const iconKeys = Object.keys(iconMapping);

// Build regex pattern for all legacy icon names
const iconPattern = iconKeys.map(key => `\\b${key}\\b`).join('|');

// Execute grep search across the codebase
console.log(chalk.blue('Scanning for legacy icon references...'));
console.log(chalk.gray('This may take a few minutes depending on the size of the codebase.'));

try {
  // Use ripgrep for faster searching if available
  const grepCommand = `rg -l "${iconPattern}" --type=ts --type=tsx --type=js --type=jsx src/`;
  const files = execSync(grepCommand, { encoding: 'utf8' }).trim().split('\n');

  if (!files || files.length === 0 || (files.length === 1 && !files[0])) {
    console.log(chalk.green('No legacy icon references found!'));
    process.exit(0);
  }

  // Count references in each file
  const fileReferences = {};
  const totalStats = {
    totalFiles: 0,
    totalReferences: 0,
    iconsByFrequency: {}
  };

  files.forEach(file => {
    if (!file) return;
    
    totalStats.totalFiles++;
    const content = fs.readFileSync(file, 'utf8');
    
    const fileStats = {
      references: 0,
      icons: {}
    };

    iconKeys.forEach(iconName => {
      // Use regex to find all instances of this icon name
      const regex = new RegExp(`\\b${iconName}\\b`, 'g');
      const matches = content.match(regex);
      
      if (matches && matches.length > 0) {
        fileStats.references += matches.length;
        fileStats.icons[iconName] = matches.length;
        
        // Update global stats
        totalStats.totalReferences += matches.length;
        totalStats.iconsByFrequency[iconName] = (totalStats.iconsByFrequency[iconName] || 0) + matches.length;
      }
    });

    if (fileStats.references > 0) {
      fileReferences[file] = fileStats;
    }
  });

  // Sort icons by frequency
  const sortedIcons = Object.entries(totalStats.iconsByFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, mappedTo: iconMapping[name], count }));

  // Generate report
  const report = {
    summary: {
      totalFiles: totalStats.totalFiles,
      totalReferences: totalStats.totalReferences,
      uniqueIcons: Object.keys(totalStats.iconsByFrequency).length
    },
    fileReferences: fileReferences,
    iconsByFrequency: sortedIcons
  };

  // Save report to disk
  const reportPath = path.join(process.cwd(), 'reports', 'icon-references-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary to console
  console.log(chalk.green(`✓ Found ${totalStats.totalReferences} legacy icon references across ${totalStats.totalFiles} files`));
  console.log(chalk.green(`✓ Full report saved to: ${reportPath}`));
  console.log(chalk.yellow('\nTop 10 most used legacy icons:'));
  
  sortedIcons.slice(0, 10).forEach((icon, index) => {
    console.log(`${index + 1}. ${chalk.cyan(icon.name)} → ${chalk.green(icon.mappedTo)} (${icon.count} references)`);
  });
  
} catch (error) {
  console.error(chalk.red('Error scanning for icon references:'), error);
  process.exit(1);
} 
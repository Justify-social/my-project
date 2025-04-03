#!/usr/bin/env node

/**
 * Legacy Icon References Migrator
 * 
 * This script converts legacy icon references (name="faIcon") to the new
 * standardized iconId approach (iconId="faIconLight" or iconId="faIconSolid").
 * 
 * Usage:
 *   node scripts/icons/migrate-icons.mjs [file-path]
 * 
 * Examples:
 *   node scripts/icons/migrate-icons.mjs src/app/campaigns/[id]/page.tsx
 *   node scripts/icons/migrate-icons.mjs --top-10
 *   node scripts/icons/migrate-icons.mjs --auto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { execSync } from 'child_process';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const reportDir = path.join(rootDir, 'reports');
const reportPath = path.join(reportDir, 'legacy-icon-scan.json');

// Utility to load registries
const loadIconRegistries = () => {
  try {
    // Load all registry files
    const lightRegistry = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/static/light-icon-registry.json'), 'utf8'));
    const solidRegistry = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/static/solid-icon-registry.json'), 'utf8'));
    
    // Extract just the icon IDs
    const lightIcons = lightRegistry.icons.map(icon => icon.id);
    const solidIcons = solidRegistry.icons.map(icon => icon.id);
    
    return { lightIcons, solidIcons };
  } catch (error) {
    console.error('Error loading icon registries:', error);
    return { lightIcons: [], solidIcons: [] };
  }
};

// Check if a registry entry exists
const getIconVariants = (iconName, registries) => {
  const baseIconName = iconName.replace(/^['"]|['"]$/g, ''); // Remove quotes
  
  // Check if light and solid variants exist
  const hasLightVariant = registries.lightIcons.includes(`${baseIconName}Light`);
  const hasSolidVariant = registries.solidIcons.includes(`${baseIconName}Solid`);
  
  return { hasLightVariant, hasSolidVariant };
};

// Transformation functions
const transformations = {
  // Transform name="faIcon" to iconId="faIconLight"
  nameToIconId: (content, registries) => {
    const nameRegex = /name=["'](fa[A-Za-z]+)["']/g;
    let match;
    let transformedContent = content;
    let count = 0;
    
    while ((match = nameRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const iconName = match[1];
      const variants = getIconVariants(iconName, registries);
      
      // Skip if neither variant exists in registry
      if (!variants.hasLightVariant && !variants.hasSolidVariant) {
        console.log(chalk.yellow(`⚠️ Icon "${iconName}" not found in registries - skipping`));
        continue;
      }
      
      // Default to Light variant if available
      const variantSuffix = variants.hasLightVariant ? 'Light' : 'Solid';
      const replacement = `iconId="${iconName}${variantSuffix}"`;
      
      transformedContent = transformedContent.replace(fullMatch, replacement);
      count++;
    }
    
    return { transformedContent, count };
  },
  
  // Transform name="faIcon" solid={true} to iconId="faIconSolid"
  nameSolidToIconId: (content, registries) => {
    // More complex replacement looking for name + solid props near each other
    const nameWithSolidRegex = /name=["'](fa[A-Za-z]+)["'](?:[^}]*?)solid=\{(true|false)\}/g;
    let match;
    let transformedContent = content;
    let count = 0;
    
    while ((match = nameWithSolidRegex.exec(content)) !== null) {
      const iconName = match[1];
      const isSolid = match[2] === 'true';
      const variants = getIconVariants(iconName, registries);
      
      // Skip if neither variant exists in registry
      if (!variants.hasLightVariant && !variants.hasSolidVariant) {
        console.log(chalk.yellow(`⚠️ Icon "${iconName}" not found in registries - skipping`));
        continue;
      }
      
      // Determine which variant to use
      let variantSuffix;
      if (isSolid) {
        variantSuffix = variants.hasSolidVariant ? 'Solid' : 'Light';
      } else {
        variantSuffix = variants.hasLightVariant ? 'Light' : 'Solid';
      }
      
      // Create a replacement that includes all content between name and solid
      const fullBlock = match[0];
      const iconId = `iconId="${iconName}${variantSuffix}"`;
      
      // Replace the whole block with just the iconId
      const replacedBlock = fullBlock.replace(/name=["'].*?["']/, iconId)
                                     .replace(/\s*solid=\{(true|false)\}/, '');
      
      transformedContent = transformedContent.replace(fullBlock, replacedBlock);
      count++;
    }
    
    return { transformedContent, count };
  },
  
  // Remove solid props if iconId is already present
  removeSolidWhenIconId: (content) => {
    const iconIdWithSolidRegex = /iconId=["']fa[A-Za-z]+(Light|Solid)["'](?:[^}]*?)solid=\{(true|false)\}/g;
    let transformedContent = content;
    let count = 0;
    
    // Simply remove solid props when iconId is used
    transformedContent = transformedContent.replace(iconIdWithSolidRegex, (match) => {
      count++;
      return match.replace(/\s*solid=\{(true|false)\}/, '');
    });
    
    return { transformedContent, count };
  },
  
  // Transform active={isActive} with conditional iconId
  handleActiveProps: (content) => {
    // This is a complex pattern that needs careful handling
    // For simplicity, we'll just log these instances for manual review
    const activeRegex = /active=\{([^}]+)\}/g;
    const matches = [...content.matchAll(activeRegex)];
    
    if (matches.length > 0) {
      console.log(chalk.blue('ℹ️ Found active props that need manual review:'));
      matches.forEach(match => {
        console.log(`  Active condition: ${match[0]}`);
      });
    }
    
    return { transformedContent: content, count: 0 };
  }
};

// Process a file
const processFile = (filePath, options = {}) => {
  console.log(chalk.blue(`Processing ${filePath}...`));
  
  try {
    // Load content and registries
    const content = fs.readFileSync(filePath, 'utf8');
    const registries = loadIconRegistries();
    
    // Create backup
    if (!options.dryRun) {
      const backupPath = `${filePath}.bak`;
      fs.writeFileSync(backupPath, content);
      console.log(chalk.green(`Created backup at ${backupPath}`));
    }
    
    // Apply transformations
    let transformedContent = content;
    let totalChanges = 0;
    
    // First handle name+solid combinations
    const nameSolidResult = transformations.nameSolidToIconId(transformedContent, registries);
    transformedContent = nameSolidResult.transformedContent;
    totalChanges += nameSolidResult.count;
    
    // Then handle remaining name attributes
    const nameResult = transformations.nameToIconId(transformedContent, registries);
    transformedContent = nameResult.transformedContent;
    totalChanges += nameResult.count;
    
    // Clean up redundant solid props
    const cleanupResult = transformations.removeSolidWhenIconId(transformedContent);
    transformedContent = cleanupResult.transformedContent;
    totalChanges += cleanupResult.count;
    
    // Log active props for manual review
    transformations.handleActiveProps(transformedContent);
    
    // Save changes
    if (totalChanges > 0) {
      if (!options.dryRun) {
        fs.writeFileSync(filePath, transformedContent);
        console.log(chalk.green(`✅ Applied ${totalChanges} transformations to ${filePath}`));
      } else {
        console.log(chalk.yellow(`Would apply ${totalChanges} transformations (dry run)`));
      }
    } else {
      console.log(chalk.yellow('No transformations needed for this file'));
    }
    
    return { success: true, changes: totalChanges };
  } catch (error) {
    console.error(chalk.red(`Error processing ${filePath}:`), error);
    return { success: false, changes: 0 };
  }
};

// Main execution
const main = async () => {
  const args = process.argv.slice(2);
  
  // Handle command line arguments
  if (args.length === 0) {
    console.log(chalk.yellow('Please specify a file path or use --top-10 or --auto flags'));
    console.log('Usage: node scripts/icons/migrate-icons.mjs [file-path]');
    process.exit(1);
  }
  
  // Check if scan report exists
  let report;
  if (fs.existsSync(reportPath)) {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } else {
    console.log(chalk.yellow('No scan report found. Running scan first...'));
    execSync('node scripts/icons/scan-legacy-references.mjs', { stdio: 'inherit' });
    
    if (fs.existsSync(reportPath)) {
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } else {
      console.error(chalk.red('Failed to generate scan report'));
      process.exit(1);
    }
  }
  
  // Process different command modes
  if (args[0] === '--top-10') {
    console.log(chalk.blue('Processing top 10 files with most legacy references'));
    
    const topFiles = report.files
      .filter(f => f.stats.legacyCount > 0)
      .sort((a, b) => b.stats.legacyCount - a.stats.legacyCount)
      .slice(0, 10)
      .map(f => path.join(rootDir, f.file));
    
    for (const file of topFiles) {
      await processFile(file, { dryRun: false });
    }
  } else if (args[0] === '--auto') {
    console.log(chalk.blue('Starting automatic migration of all files with legacy references'));
    console.log(chalk.yellow('This is a dry run. Add --force to apply changes'));
    
    const dryRun = !args.includes('--force');
    const filesToProcess = report.files
      .filter(f => f.stats.legacyCount > 0)
      .map(f => path.join(rootDir, f.file));
    
    console.log(`Found ${filesToProcess.length} files to process`);
    
    for (const file of filesToProcess) {
      await processFile(file, { dryRun });
    }
  } else {
    // Process individual file
    const filePath = path.resolve(args[0]);
    
    if (!fs.existsSync(filePath)) {
      console.error(chalk.red(`File not found: ${filePath}`));
      process.exit(1);
    }
    
    await processFile(filePath, { dryRun: false });
  }
  
  console.log(chalk.green('Migration complete!'));
  console.log(chalk.blue('Run scan again to see updated progress: node scripts/icons/scan-legacy-references.mjs'));
};

main().catch(error => {
  console.error(chalk.red('Error during migration:'), error);
  process.exit(1);
}); 
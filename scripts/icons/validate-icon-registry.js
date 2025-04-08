#!/usr/bin/env node

/**
 * Icon Registry Validator
 * 
 * This script validates all icon registry files to ensure they have the required
 * fields and structure. It's part of the icon registry update process.
 * 
 * Usage:
 *   node scripts/validate-icon-registry.js [registry-file-path]
 * 
 * If no registry file path is provided, it will validate all canonical registry files.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk'; // You might need to run `npm install chalk`
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const REGISTRY_DIR = path.join(__dirname, '../public/static');
const CANONICAL_REGISTRIES = [
  'app-icon-registry.json',
  'brands-icon-registry.json',
  'kpis-icon-registry.json',
  'light-icon-registry.json',
  'solid-icon-registry.json',
];

// Required fields for each icon
const REQUIRED_FIELDS = ['id', 'category', 'path'];

// Statistics
let totalIcons = 0;
let validIcons = 0;
let invalidIcons = 0;

/**
 * Validate a single icon
 * @param {Object} icon The icon object to validate
 * @param {string} source The source registry file
 * @returns {boolean} Whether the icon is valid
 */
function validateIcon(icon, source) {
  // Check required fields
  const missingFields = REQUIRED_FIELDS.filter(field => !icon[field]);
  
  if (missingFields.length > 0) {
    console.error(
      chalk.red(`Invalid icon in ${source}:`),
      chalk.yellow(`Icon ID: ${icon.id || 'MISSING ID'}`),
      chalk.red(`Missing fields: ${missingFields.join(', ')}`)
    );
    return false;
  }
  
  // Check for duplicate IDs (would need to track IDs across all registries)
  
  // Additional validations could be added here:
  // - Check for valid paths
  // - Validate SVG content if available
  // - Check for recommended fields (name, tags, etc.)
  
  return true;
}

/**
 * Validate a registry file
 * @param {string} registryPath Path to the registry file
 */
function validateRegistry(registryPath) {
  console.log(chalk.blue(`Validating registry: ${registryPath}`));
  
  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    
    // Check that registry has an icons array
    if (!registry.icons || !Array.isArray(registry.icons)) {
      console.error(chalk.red(`Invalid registry format: ${registryPath}`));
      console.error(chalk.red('Registry must have an "icons" array'));
      return;
    }
    
    // Get registry filename for reporting
    const registryName = path.basename(registryPath);
    console.log(chalk.blue(`Registry contains ${registry.icons.length} icons`));
    
    // Validate each icon
    let registryValidIcons = 0;
    let registryInvalidIcons = 0;
    
    registry.icons.forEach(icon => {
      totalIcons++;
      
      if (validateIcon(icon, registryName)) {
        validIcons++;
        registryValidIcons++;
      } else {
        invalidIcons++;
        registryInvalidIcons++;
      }
    });
    
    // Registry summary
    console.log(
      chalk.blue(`Registry summary: ${registryValidIcons} valid, ${registryInvalidIcons} invalid`)
    );
    console.log(chalk.blue('-'.repeat(50)));
    
  } catch (error) {
    console.error(chalk.red(`Error processing ${registryPath}:`), error.message);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Validate specific registry file
    const registryPath = path.resolve(args[0]);
    validateRegistry(registryPath);
  } else {
    // Validate all canonical registry files
    console.log(chalk.green('Validating all canonical registry files...'));
    
    CANONICAL_REGISTRIES.forEach(registry => {
      const registryPath = path.join(REGISTRY_DIR, registry);
      validateRegistry(registryPath);
    });
  }
  
  // Final summary
  console.log(chalk.green('Validation complete!'));
  console.log(chalk.green(`Total icons: ${totalIcons}`));
  console.log(chalk.green(`Valid icons: ${validIcons}`));
  
  if (invalidIcons > 0) {
    console.log(chalk.red(`Invalid icons: ${invalidIcons}`));
    process.exit(1); // Exit with error code
  } else {
    console.log(chalk.green('All icons are valid!'));
  }
}

main(); 
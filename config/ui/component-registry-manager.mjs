#!/usr/bin/env node

/**
 * Component Registry Manager
 * 
 * This script orchestrates the generation and management of component registries
 * following the Single Source of Truth (SSOT) principles.
 * 
 * CANONICAL LOCATIONS:
 * - /config/ui/components.json - Shadcn UI configuration
 * - /config/ui/feature-components.json - Feature component categorization
 * - /public/static/component-registry.json - Runtime component registry
 * 
 * The script can:
 * - Generate the runtime component registry
 * - Validate components against the registry
 * - Clean up deprecated registry files
 * 
 * Usage:
 *   node config/ui/component-registry-manager.mjs generate
 *   node config/ui/component-registry-manager.mjs validate
 *   node config/ui/component-registry-manager.mjs cleanup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

// Terminal colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// Helper log functions
const log = (msg) => console.log(msg);
const info = (msg) => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`);
const success = (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`);
const warning = (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`);
const error = (msg) => console.error(`${colors.red}✗ ${colors.reset}${msg}`);

// Define canonical paths
const CANONICAL_PATHS = {
  // Config files
  shadcnConfig: path.join(ROOT_DIR, 'config', 'ui', 'components.json'),
  featureComponents: path.join(ROOT_DIR, 'config', 'ui', 'feature-components.json'),
  
  // Runtime registries
  componentRegistry: path.join(ROOT_DIR, 'public', 'static', 'component-registry.json'),
  iconRegistry: path.join(ROOT_DIR, 'public', 'static', 'icon-registry.json'),
  iconUrlMap: path.join(ROOT_DIR, 'public', 'static', 'icon-url-map.json')
};

// Define deprecated paths to check and remove
const DEPRECATED_PATHS = [
  path.join(ROOT_DIR, 'public', 'ui-icons', 'icon-registry.json'),
  path.join(ROOT_DIR, 'public', 'ui-icons', 'icon-url-map.json'),
  path.join(ROOT_DIR, 'public', 'static', 'component-registry.backup.json')
];

/**
 * Main function
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
      await generateComponentRegistry();
      break;
    case 'validate':
      await validateComponentRegistry();
      break;
    case 'cleanup':
      await cleanupDeprecatedFiles();
      break;
    default:
      log(`
Component Registry Manager

Usage:
  node config/ui/component-registry-manager.mjs <command>

Commands:
  generate  - Generate the runtime component registry
  validate  - Validate components against the registry
  cleanup   - Clean up deprecated registry files
      `);
      break;
  }
}

/**
 * Generate the component registry
 */
async function generateComponentRegistry() {
  info('Generating component registry...');
  
  try {
    // Ensure directory exists
    const staticDir = path.dirname(CANONICAL_PATHS.componentRegistry);
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }
    
    // Execute the static registry generator script
    const generatorPath = path.join(ROOT_DIR, 'src', 'app', '(admin)', 'debug-tools', 'ui-components', 'registry', 'generate-registry.js');
    
    if (fs.existsSync(generatorPath)) {
      execSync(`node ${generatorPath}`, { stdio: 'inherit' });
      success('Component registry generated successfully.');
    } else {
      error(`Generator script not found at ${generatorPath}`);
      process.exit(1);
    }
  } catch (err) {
    error(`Failed to generate component registry: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Validate the component registry
 */
async function validateComponentRegistry() {
  info('Validating component registry...');
  
  try {
    // Check if canonical files exist
    if (!fs.existsSync(CANONICAL_PATHS.componentRegistry)) {
      warning(`Component registry not found at ${CANONICAL_PATHS.componentRegistry}`);
      warning('Run "generate" command first to create it.');
      return;
    }
    
    // Execute the validation script
    const validatorPath = path.join(ROOT_DIR, 'scripts', 'ui', 'validate-component-paths.mjs');
    
    if (fs.existsSync(validatorPath)) {
      execSync(`node ${validatorPath}`, { stdio: 'inherit' });
      success('Component registry validation completed.');
    } else {
      error(`Validator script not found at ${validatorPath}`);
      process.exit(1);
    }
  } catch (err) {
    error(`Validation failed: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Clean up deprecated files
 */
async function cleanupDeprecatedFiles() {
  info('Cleaning up deprecated component registry files...');
  
  let removedCount = 0;
  
  for (const deprecatedPath of DEPRECATED_PATHS) {
    if (fs.existsSync(deprecatedPath)) {
      try {
        fs.unlinkSync(deprecatedPath);
        success(`Removed deprecated file: ${deprecatedPath}`);
        removedCount++;
      } catch (err) {
        warning(`Failed to remove ${deprecatedPath}: ${err.message}`);
      }
    }
  }
  
  if (removedCount === 0) {
    info('No deprecated files found.');
  } else {
    success(`Removed ${removedCount} deprecated files.`);
  }
  
  // Check if the ui-icons directory is empty and can be removed
  const uiIconsDir = path.join(ROOT_DIR, 'public', 'ui-icons');
  if (fs.existsSync(uiIconsDir)) {
    try {
      const files = fs.readdirSync(uiIconsDir);
      if (files.length === 0) {
        fs.rmdirSync(uiIconsDir);
        success(`Removed empty directory: ${uiIconsDir}`);
      } else {
        info(`Directory not empty, cannot remove: ${uiIconsDir}`);
      }
    } catch (err) {
      warning(`Failed to check/remove directory ${uiIconsDir}: ${err.message}`);
    }
  }
}

// Run the main function
main().catch(err => {
  error(`Error: ${err.message}`);
  process.exit(1);
}); 
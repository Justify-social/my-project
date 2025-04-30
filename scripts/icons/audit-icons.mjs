#!/usr/bin/env node

/**
 * Icon Registry Audit Script
 *
 * This script audits the icon registry files and validates icon usage across the codebase.
 * It checks for:
 * - Missing icons
 * - Inconsistencies between registry files
 * - References to icons in code that aren't in the registry
 * - Registry files that don't match the actual files on disk
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const STATIC_DIR = path.join(PUBLIC_DIR, 'static');
const CATEGORIES_DIR = path.join(STATIC_DIR, 'categories');
// const ICONS_DIR = path.join(PUBLIC_DIR, 'icons'); // Unused constant

// Registry files
const REGISTRY_FILES = {
  light: path.join(CATEGORIES_DIR, 'light-icon-registry.json'),
  solid: path.join(CATEGORIES_DIR, 'solid-icon-registry.json'),
  brands: path.join(CATEGORIES_DIR, 'brands-icon-registry.json'),
  app: path.join(CATEGORIES_DIR, 'app-icon-registry.json'),
  kpis: path.join(CATEGORIES_DIR, 'kpis-icon-registry.json'),
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose'),
  fix: args.includes('--fix'),
  debugOnly: args.includes('--debug-only'),
};

// Color formatting for console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Loads an icon registry file
 */
function loadRegistry(type) {
  const filePath = REGISTRY_FILES[type];
  if (!fs.existsSync(filePath)) {
    console.warn(
      `${colors.yellow}Warning: Registry file for '${type}' does not exist at ${filePath}${colors.reset}`
    );
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(
      `${colors.red}Error loading registry file for '${type}': ${error.message}${colors.reset}`
    );
    return null;
  }
}

/**
 * Checks if all SVG files referenced in a registry actually exist
 */
function validateSVGFiles(registry /*, type */) {
  // Parameter correctly removed here
  if (!registry) return { valid: false, missing: [] };

  const missing = [];

  for (const icon of registry.icons) {
    // Remove leading slash to get relative path from project root
    const filePath = path.join(PUBLIC_DIR, icon.path.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      missing.push({ id: icon.id, path: filePath });
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Find all icon ID references in the codebase using grep
 */
function findIconReferencesInCode() {
  try {
    const command = `grep -r --include="*.{ts,tsx,js,jsx}" "id=[\\"']\\(fa\\|app\\|brands\\|kpis\\)" ${path.join(ROOT_DIR, 'src')}`;
    const output = execSync(command, { encoding: 'utf8' });

    // Extract icon IDs using regex
    const iconRefs = new Set();
    const regex = /id=["'](fa|app|brands|kpis)([A-Za-z0-9]+)(Light|Solid)?["']/g;
    let match;

    const lines = output.split('\n');
    for (const line of lines) {
      while ((match = regex.exec(line)) !== null) {
        const fullId = match[0].split(/["']/)[1];
        iconRefs.add(fullId);
      }
    }

    return Array.from(iconRefs);
  } catch (error) {
    console.error(`${colors.red}Error finding icon references: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Check if all referenced icons exist in the registries
 */
function validateIconReferences(iconRefs, registries) {
  const missing = [];
  const registryIcons = new Set();

  // Collect all icon IDs from registries
  // Here, 'type' was genuinely unused, so keep it removed from destructuring
  for (const [, /* type */ registry] of Object.entries(registries)) {
    if (registry && registry.icons) {
      for (const icon of registry.icons) {
        registryIcons.add(icon.id);
      }
    }
  }

  // Check for missing icons
  for (const iconId of iconRefs) {
    if (!registryIcons.has(iconId)) {
      missing.push(iconId);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Main audit function
 */
async function auditIcons() {
  console.log(`${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.cyan}Icon Registry Audit Tool${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}`);

  // Load all registries
  console.log('\nLoading icon registries...');
  const registries = {};
  let totalIcons = 0;

  for (const type of Object.keys(REGISTRY_FILES)) {
    registries[type] = loadRegistry(type);
    if (registries[type]) {
      const count = registries[type].icons.length;
      totalIcons += count;
      console.log(`- ${type}: ${count} icons`);
    }
  }

  console.log(`\nTotal icons across all registries: ${totalIcons}`);

  // Check SVG file existence
  console.log('\nValidating SVG files existence...');
  let allFilesValid = true;
  const fileValidationResults = {};

  for (const [type, registry] of Object.entries(registries)) {
    if (!registry) continue;

    // Call validateSVGFiles without the type parameter
    const result = validateSVGFiles(registry);
    fileValidationResults[type] = result;

    if (!result.valid) {
      allFilesValid = false;
      console.log(
        `${colors.red}✗ ${type}: Missing ${result.missing.length} SVG files${colors.reset}`
      );

      if (options.verbose) {
        for (const { id, path } of result.missing) {
          console.log(`  - ${id}: ${path}`);
        }
      }
    } else {
      console.log(`${colors.green}✓ ${type}: All SVG files exist${colors.reset}`);
    }
  }

  // Find and validate icon references in code
  console.log('\nFinding icon references in codebase...');
  const iconRefs = findIconReferencesInCode();
  console.log(`Found ${iconRefs.length} icon references in code`);

  const refValidation = validateIconReferences(iconRefs, registries);
  if (!refValidation.valid) {
    console.log(
      `${colors.red}✗ Missing ${refValidation.missing.length} icons referenced in code${colors.reset}`
    );

    if (options.verbose || refValidation.missing.length < 10) {
      for (const iconId of refValidation.missing) {
        console.log(`  - ${iconId}`);
      }
    }
  } else {
    console.log(
      `${colors.green}✓ All icon references have corresponding registry entries${colors.reset}`
    );
  }

  // Summary
  console.log('\nAudit Summary:');
  const allValid = allFilesValid && refValidation.valid;

  if (allValid) {
    console.log(`${colors.green}✓ All checks passed successfully!${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Some validation checks failed${colors.reset}`);

    if (options.fix) {
      console.log('\nAttempting to fix issues...');
      // Add fixing logic here if needed
      console.log('Fix implementation not available yet.');
    } else {
      console.log('\nRun with --fix option to attempt automatic fixes');
    }
  }

  console.log(`${colors.cyan}======================================${colors.reset}`);
  return allValid;
}

// Run the audit function
auditIcons().then(success => {
  if (!success) {
    process.exit(1);
  }
});

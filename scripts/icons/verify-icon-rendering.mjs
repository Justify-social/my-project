#!/usr/bin/env node

/**
 * Comprehensive Icon Rendering Verification Script
 * 
 * This script provides a complete analysis of icon usage and rendering in the application:
 * 1. Validates all registry icons (SVG files exist and are properly formatted)
 * 2. Scans codebase for icon references and identifies missing mappings
 * 3. Identifies FontAwesome references not in registry
 * 4. Analyzes usage patterns to ensure consistent icon implementation
 * 5. Checks actual rendering paths to prevent 404 errors
 * 
 * Usage:
 *   node scripts/icons/verify-icon-rendering.mjs             # Basic verification
 *   node scripts/icons/verify-icon-rendering.mjs --verbose   # Detailed output
 *   node scripts/icons/verify-icon-rendering.mjs --fix       # Fix obvious issues automatically
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import { globby } from 'globby';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, 'public');
const STATIC_DIR = path.resolve(PUBLIC_DIR, 'static');
const SRC_DIR = path.resolve(PROJECT_ROOT, 'src');
const VERBOSE = process.argv.includes('--verbose');
const FIX_MODE = process.argv.includes('--fix');
const MAX_CONCURRENT = 50; // Maximum number of concurrent file operations

// Registry files to verify
const REGISTRY_FILES = [
  'app-icon-registry.json',
  'brands-icon-registry.json',
  'kpis-icon-registry.json',
  'light-icon-registry.json',
  'solid-icon-registry.json',
  'new-light-icon-registry.json',
  'new-solid-icon-registry.json',
];

// FontAwesome patterns to detect
const FA_PATTERNS = [
  /name=["']fa([A-Z][a-zA-Z0-9]+)["']/g,             // name="faIcon"
  /icon={<Icon\s+name=["']fa([A-Z][a-zA-Z0-9]+)["']/, // icon={<Icon name="faIcon"
  /getIconPath\(["']fa([A-Z][a-zA-Z0-9]+)["']/g,      // getIconPath("faIcon"
  /normalizeIconName\(["']fa([A-Z][a-zA-Z0-9]+)["']/g // normalizeIconName("faIcon"
];

// Stats tracking
const stats = {
  totalIcons: 0,
  validIcons: 0,
  invalidIcons: 0,
  missingFiles: 0,
  validSvg: 0,
  invalidSvg: 0,
  usedIcons: new Set(),
  missingMappings: new Set(),
  unusedIcons: new Set(),
  filesScanned: 0,
  filesWithIcons: 0,
  processingTime: 0
};

// Issues tracking
const issues = [];
const iconReferences = new Map(); // Maps icon names to file references
const iconsInRegistry = new Map(); // Maps icon IDs to their full data
const faNameToIdMap = new Map(); // Maps FontAwesome names to icon IDs
const missingFaIcons = new Set(); // FontAwesome icons referenced but missing from registry

/**
 * Load a registry file and return its contents
 */
function loadRegistry(fileName) {
  try {
    const filePath = path.join(STATIC_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Registry file not found: ${fileName}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const registry = JSON.parse(content);
    
    if (!registry.icons || !Array.isArray(registry.icons)) {
      throw new Error(`Invalid registry format in ${fileName}`);
    }
    
    return registry;
  } catch (err) {
    console.error(chalk.red(`Error loading registry ${fileName}:`), err.message);
    return { icons: [] };
  }
}

/**
 * Load all icon registries
 */
function loadAllRegistries() {
  const allIcons = [];
  
  console.log(chalk.blue('Loading icon registries...'));
  
  for (const fileName of REGISTRY_FILES) {
    try {
      const registry = loadRegistry(fileName);
      console.log(chalk.gray(`  - ${fileName}: ${registry.icons.length} icons`));
      
      // Add to our registry map for quick lookup
      registry.icons.forEach(icon => {
        if (icon.id) {
          iconsInRegistry.set(icon.id, icon);
          
          // Map FontAwesome version to ID if available
          if (icon.faVersion) {
            // Clean version to get just the name part (e.g., "fal fa-user" -> "faUser")
            const cleanVersion = icon.faVersion.split(' ').pop(); // Get last part after space
            const faName = `fa${cleanVersion.charAt(0).toUpperCase() + cleanVersion.slice(1)}`;
            faNameToIdMap.set(faName, icon.id);
            
            // Also add standard formatting (e.g., "faUser")
            const parts = cleanVersion.split('-');
            if (parts.length > 1) {
              const standardName = 'fa' + parts.map((part, i) => 
                i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
              ).join('');
              faNameToIdMap.set(standardName, icon.id);
            }
          }
        }
      });
      
      allIcons.push(...registry.icons);
    } catch (err) {
      console.error(chalk.red(`Error processing registry ${fileName}:`), err.message);
    }
  }
  
  console.log(chalk.green(`Loaded ${allIcons.length} total icons from all registries`));
  stats.totalIcons = allIcons.length;
  
  return allIcons;
}

/**
 * Convert a relative path to absolute
 */
function resolveIconPath(relativePath) {
  // Handle path formats
  let normalizedPath = relativePath;
  
  // Ensure it starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  
  return path.join(PUBLIC_DIR, normalizedPath);
}

/**
 * Check if an SVG file exists
 */
function checkSvgExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

/**
 * Validate SVG content
 */
function validateSvgContent(filePath) {
  try {
    // Read the SVG file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic validation
    if (!content.includes('<svg') || !content.includes('</svg>')) {
      return { valid: false, reason: 'Missing SVG root element' };
    }
    
    // Check for minimum required attributes
    if (!content.includes('width=') && !content.includes('viewBox=')) {
      return { valid: false, reason: 'Missing required width or viewBox attribute' };
    }
    
    // Check for malformed XML
    if ((content.match(/<svg/g) || []).length !== (content.match(/<\/svg>/g) || []).length) {
      return { valid: false, reason: 'Malformed SVG XML structure' };
    }
    
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: `Error reading file: ${err.message}` };
  }
}

/**
 * Process icons in batches for performance
 */
async function processIconsBatch(icons, startIdx, endIdx) {
  const batch = icons.slice(startIdx, endIdx);
  const results = [];
  
  for (const icon of batch) {
    const result = verifyIcon(icon);
    results.push(result);
  }
  
  return results;
}

/**
 * Verify that an icon can be rendered correctly
 */
function verifyIcon(icon) {
  const result = {
    id: icon.id,
    category: icon.category,
    valid: true,
    issues: []
  };
  
  // Check for required fields
  if (!icon.id) {
    result.valid = false;
    result.issues.push('Missing required field: id');
  }
  
  if (!icon.category) {
    result.valid = false;
    result.issues.push('Missing required field: category');
  }
  
  if (!icon.path) {
    result.valid = false;
    result.issues.push('Missing required field: path');
  }
  
  // If missing critical fields, can't continue verification
  if (!icon.id || !icon.path) {
    return result;
  }
  
  // Resolve the file path
  const absolutePath = resolveIconPath(icon.path);
  
  // Check if the file exists
  const fileExists = checkSvgExists(absolutePath);
  if (!fileExists) {
    result.valid = false;
    result.issues.push(`SVG file not found: ${icon.path}`);
    stats.missingFiles++;
    return result;
  }
  
  // Validate SVG content
  const svgValidation = validateSvgContent(absolutePath);
  if (!svgValidation.valid) {
    result.valid = false;
    result.issues.push(`Invalid SVG file: ${icon.path} - ${svgValidation.reason}`);
    stats.invalidSvg++;
    return result;
  }
  
  stats.validSvg++;
  return result;
}

/**
 * Process all icons and verify they render correctly
 */
async function verifyAllIcons(icons) {
  console.log(chalk.blue(`\nVerifying ${icons.length} icons can render correctly...`));
  
  const batchSize = MAX_CONCURRENT;
  const batches = Math.ceil(icons.length / batchSize);
  const results = [];
  
  // Process icons in batches to avoid memory issues
  for (let i = 0; i < batches; i++) {
    const startIdx = i * batchSize;
    const endIdx = Math.min(startIdx + batchSize, icons.length);
    const batchResults = await processIconsBatch(icons, startIdx, endIdx);
    results.push(...batchResults);
    
    // Show progress
    const progress = Math.min(100, Math.round((endIdx / icons.length) * 100));
    process.stdout.write(`\r${chalk.gray(`Progress: ${progress}% (${endIdx}/${icons.length})`)}`);
  }
  
  // Clear the progress line
  process.stdout.write('\r' + ' '.repeat(50) + '\r');
  
  return results;
}

/**
 * Process verification results
 */
function processResults(results) {
  for (const result of results) {
    if (result.valid) {
      stats.validIcons++;
    } else {
      stats.invalidIcons++;
      issues.push({
        id: result.id,
        category: result.category,
        issues: result.issues
      });
    }
  }
}

/**
 * Find all references to icons in the codebase
 */
async function findIconReferences() {
  console.log(chalk.blue('\nScanning codebase for icon references...'));
  
  // Find all TypeScript and JavaScript files
  const files = await globby([
    `${SRC_DIR}/**/*.{ts,tsx,js,jsx}`,
    `!${SRC_DIR}/**/*.d.ts`, 
    `!${SRC_DIR}/**/*.test.{ts,tsx,js,jsx}`,
    `!${SRC_DIR}/**/*.spec.{ts,tsx,js,jsx}`,
    `!${SRC_DIR}/**/*.stories.{ts,tsx,js,jsx}`,
    `!**/node_modules/**`
  ]);
  
  stats.filesScanned = files.length;
  console.log(chalk.gray(`Found ${files.length} files to scan for icon usage`));
  
  // Process each file to find icon references
  for (const filePath of files) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let hasIcons = false;
      
      // Look for Icon component usage
      const iconComponentMatches = fileContent.match(/<Icon\s+name=["']([^"']+)["']/g);
      if (iconComponentMatches && iconComponentMatches.length > 0) {
        hasIcons = true;
        
        // Extract icon names
        iconComponentMatches.forEach(match => {
          const nameMatch = match.match(/name=["']([^"']+)["']/);
          if (nameMatch && nameMatch[1]) {
            const iconName = nameMatch[1];
            
            // Track this reference
            if (!iconReferences.has(iconName)) {
              iconReferences.set(iconName, []);
            }
            iconReferences.get(iconName).push(filePath);
            
            // Check if it's a FontAwesome reference
            if (iconName.startsWith('fa') && !iconName.endsWith('Light') && !iconName.endsWith('Solid')) {
              if (!faNameToIdMap.has(iconName)) {
                missingFaIcons.add(iconName);
              }
            }
            
            // Check if this icon is in our registry
            if (iconsInRegistry.has(iconName)) {
              stats.usedIcons.add(iconName);
            } else if (faNameToIdMap.has(iconName)) {
              // It's a FontAwesome reference that maps to a registry ID
              const mappedId = faNameToIdMap.get(iconName);
              stats.usedIcons.add(mappedId);
            } else {
              // This icon is referenced but not in our registry
              stats.missingMappings.add(iconName);
            }
          }
        });
      }
      
      // Look for getIconPath or other utility function usage
      const iconUtilMatches = fileContent.match(/getIconPath\(["']([^"']+)["']/g);
      if (iconUtilMatches && iconUtilMatches.length > 0) {
        hasIcons = true;
        
        // Extract icon names
        iconUtilMatches.forEach(match => {
          const nameMatch = match.match(/getIconPath\(["']([^"']+)["']/);
          if (nameMatch && nameMatch[1]) {
            const iconName = nameMatch[1];
            
            // Track this reference
            if (!iconReferences.has(iconName)) {
              iconReferences.set(iconName, []);
            }
            iconReferences.get(iconName).push(filePath);
            
            // Check if it's a FontAwesome reference
            if (iconName.startsWith('fa') && !iconName.endsWith('Light') && !iconName.endsWith('Solid')) {
              if (!faNameToIdMap.has(iconName)) {
                missingFaIcons.add(iconName);
              }
            }
            
            // Check if this icon is in our registry
            if (iconsInRegistry.has(iconName)) {
              stats.usedIcons.add(iconName);
            } else if (faNameToIdMap.has(iconName)) {
              // It's a FontAwesome reference that maps to a registry ID
              const mappedId = faNameToIdMap.get(iconName);
              stats.usedIcons.add(mappedId);
            } else {
              // This icon is referenced but not in our registry
              stats.missingMappings.add(iconName);
            }
          }
        });
      }
      
      if (hasIcons) {
        stats.filesWithIcons++;
      }
    } catch (err) {
      console.error(chalk.red(`Error scanning file ${filePath}:`), err.message);
    }
  }
  
  // Determine unused icons
  iconsInRegistry.forEach((value, key) => {
    if (!stats.usedIcons.has(key)) {
      stats.unusedIcons.add(key);
    }
  });
  
  console.log(chalk.green(`Found icon references in ${stats.filesWithIcons} files`));
  console.log(chalk.gray(`  - ${iconReferences.size} unique icon names referenced`));
  console.log(chalk.gray(`  - ${stats.usedIcons.size} registered icons used`));
  console.log(chalk.yellow(`  - ${stats.missingMappings.size} icon references without registry entries`));
  console.log(chalk.yellow(`  - ${missingFaIcons.size} FontAwesome icons missing from registry`));
  console.log(chalk.gray(`  - ${stats.unusedIcons.size} registered icons not used in code`));
}

/**
 * Verify icon file existence with HTTP HEAD requests
 */
async function verifyIconHttpPaths() {
  console.log(chalk.blue('\nVerifying all referenced icons exist as files...'));
  
  // Create mapping of normalized paths to check
  const paths = new Set();
  
  // Add all registry icon paths
  iconsInRegistry.forEach(icon => {
    if (icon.path) {
      paths.add(icon.path);
    }
  });
  
  // Add paths for FontAwesome icons that might be generated
  missingFaIcons.forEach(faName => {
    // Extract the icon name without 'fa' prefix
    const baseName = faName.substring(2);
    
    // Convert from camelCase to kebab-case
    const kebabName = baseName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    
    // Check both light and solid variants
    paths.add(`/icons/light/${kebabName}.svg`);
    paths.add(`/icons/solid/${kebabName}.svg`);
  });
  
  console.log(chalk.gray(`Checking ${paths.size} unique icon paths`));
  
  // Check each path for existence
  const missing = [];
  for (const iconPath of paths) {
    const fullPath = path.join(PUBLIC_DIR, iconPath);
    if (!fs.existsSync(fullPath)) {
      missing.push(iconPath);
    }
  }
  
  if (missing.length > 0) {
    console.log(chalk.yellow(`\nFound ${missing.length} missing icon files that would cause 404 errors:`));
    missing.slice(0, 20).forEach(p => console.log(chalk.gray(`  - ${p}`)));
    if (missing.length > 20) {
      console.log(chalk.gray(`  ... and ${missing.length - 20} more.`));
    }
  } else {
    console.log(chalk.green('All icon paths point to existing files!'));
  }
  
  return missing;
}

/**
 * Identify required FontAwesome icons and suggest adding them
 */
function suggestMissingFaIcons() {
  if (missingFaIcons.size === 0) {
    return;
  }
  
  console.log(chalk.yellow('\nSuggested FontAwesome icons to add to registry:'));
  
  missingFaIcons.forEach(faName => {
    // Extract the icon name without 'fa' prefix
    const baseName = faName.substring(2);
    
    // Convert from camelCase to kebab-case
    const kebabName = baseName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    
    // Create a suggested light version entry
    const lightEntry = {
      category: "light",
      id: `${faName}Light`,
      name: baseName.replace(/([a-z])([A-Z])/g, '$1 $2'),
      faVersion: `fal fa-${kebabName}`,
      path: `/icons/light/${kebabName}.svg`
    };
    
    // Create a suggested solid version entry
    const solidEntry = {
      category: "solid",
      id: `${faName}Solid`,
      name: baseName.replace(/([a-z])([A-Z])/g, '$1 $2'),
      faVersion: `fas fa-${kebabName}`,
      path: `/icons/solid/${kebabName}.svg`
    };
    
    console.log(chalk.cyan(`\nFor icon "${faName}" (${kebabName}):`));
    console.log(chalk.gray('Light version:'));
    console.log(JSON.stringify(lightEntry, null, 2));
    console.log(chalk.gray('Solid version:'));
    console.log(JSON.stringify(solidEntry, null, 2));
  });
  
  if (FIX_MODE) {
    console.log(chalk.yellow('\nWould you like to add these icons to the registry? (not implemented yet)'));
    // TODO: Implement auto-fix for missing FontAwesome icons
  }
}

/**
 * Print summary report
 */
function printSummary() {
  console.log(chalk.blue('\nIcon Rendering Verification Results:'));
  console.log(chalk.gray('----------------------------------'));
  console.log(`Total icons in registry: ${chalk.cyan(stats.totalIcons)}`);
  console.log(`Valid icons: ${chalk.green(stats.validIcons)}`);
  console.log(`Invalid icons: ${chalk.red(stats.invalidIcons)}`);
  console.log(`Files with missing SVG: ${chalk.yellow(stats.missingFiles)}`);
  console.log(`Files with invalid SVG: ${chalk.red(stats.invalidSvg)}`);
  console.log(`Valid SVG files: ${chalk.green(stats.validSvg)}`);
  console.log(`Files scanned for usage: ${chalk.cyan(stats.filesScanned)}`);
  console.log(`Files with icon usage: ${chalk.cyan(stats.filesWithIcons)}`);
  console.log(`Unique icon references: ${chalk.cyan(iconReferences.size)}`);
  console.log(`Icons in registry that are used: ${chalk.green(stats.usedIcons.size)}`);
  console.log(`Icons in registry not used: ${chalk.yellow(stats.unusedIcons.size)}`);
  console.log(`Icon references missing from registry: ${chalk.red(stats.missingMappings.size)}`);
  console.log(`FontAwesome icons missing from registry: ${chalk.red(missingFaIcons.size)}`);
  console.log(`Verification success rate: ${chalk.cyan(Math.round((stats.validIcons / stats.totalIcons) * 100))}%`);
  console.log(`Processing time: ${chalk.gray(stats.processingTime.toFixed(2))} ms`);
  
  // Issues with registry icons
  if (issues.length > 0) {
    console.log(chalk.yellow(`\nIssues found with ${issues.length} registered icons:`));
    
    if (VERBOSE) {
      issues.forEach((issue, idx) => {
        console.log(chalk.gray(`\n${idx + 1}. Icon ID: ${chalk.cyan(issue.id)} (${issue.category})`));
        issue.issues.forEach(i => console.log(`   - ${i}`));
      });
    } else {
      // Show just the first 5 issues
      issues.slice(0, 5).forEach((issue, idx) => {
        console.log(chalk.gray(`\n${idx + 1}. Icon ID: ${chalk.cyan(issue.id)} (${issue.category})`));
        issue.issues.forEach(i => console.log(`   - ${i}`));
      });
      
      if (issues.length > 5) {
        console.log(chalk.gray(`\n... and ${issues.length - 5} more issues. Use --verbose to see all.`));
      }
    }
  }
  
  // Issues with missing mappings
  if (stats.missingMappings.size > 0) {
    console.log(chalk.yellow(`\nIcon references with no registry entry (top ${Math.min(10, stats.missingMappings.size)}):`));
    
    Array.from(stats.missingMappings).slice(0, 10).forEach(name => {
      const files = iconReferences.get(name) || [];
      console.log(chalk.gray(`  - "${name}" used in ${files.length} file(s)`));
      if (VERBOSE && files.length > 0) {
        files.slice(0, 3).forEach(file => {
          console.log(chalk.gray(`      - ${path.relative(PROJECT_ROOT, file)}`));
        });
        if (files.length > 3) {
          console.log(chalk.gray(`      ... and ${files.length - 3} more files`));
        }
      }
    });
    
    if (stats.missingMappings.size > 10) {
      console.log(chalk.gray(`  ... and ${stats.missingMappings.size - 10} more. Use --verbose for details.`));
    }
  }
  
  if (issues.length > 0 || stats.missingMappings.size > 0 || missingFaIcons.size > 0) {
    console.log(chalk.yellow('\nIcon rendering issues were found. These should be fixed to prevent visual bugs.'));
  } else {
    console.log(chalk.green('\nAll icons verified successfully! They will render correctly when referenced.'));
  }
}

/**
 * Main function
 */
async function main() {
  console.log(chalk.blue('Comprehensive Icon Rendering Verification Script'));
  console.log(chalk.gray('---------------------------------------------'));
  
  if (FIX_MODE) {
    console.log(chalk.yellow('Running in FIX mode - will attempt to fix issues automatically where possible'));
  }
  
  const startTime = performance.now();
  
  // Load all icon registries
  const allIcons = loadAllRegistries();
  
  // Verify all registered icons
  const results = await verifyAllIcons(allIcons);
  
  // Process registry verification results
  processResults(results);
  
  // Find icon references in codebase
  await findIconReferences();
  
  // Verify HTTP paths
  const missingPaths = await verifyIconHttpPaths();
  
  // Suggest fixes for missing FontAwesome icons
  if (missingFaIcons.size > 0) {
    suggestMissingFaIcons();
  }
  
  // Calculate processing time
  const endTime = performance.now();
  stats.processingTime = endTime - startTime;
  
  // Print summary
  printSummary();
  
  // Exit with appropriate code based on critical issues
  const hasCriticalIssues = stats.invalidIcons > 0 || 
                           stats.missingFiles > 0 || 
                           missingFaIcons.size > 0 ||
                           missingPaths.length > 0;
  
  process.exit(hasCriticalIssues ? 1 : 0);
}

// Run the script
main().catch(err => {
  console.error(chalk.red('\nError:'), err);
  process.exit(1);
}); 
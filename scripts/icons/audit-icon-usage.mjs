#!/usr/bin/env node

/**
 * Icon Usage Audit Script
 * 
 * This script scans the entire codebase for Icon component usage patterns
 * and verifies whether they're correctly using "id" as the SSOT for referencing icons.
 * 
 * Usage:
 *   node scripts/icons/audit-icon-usage.mjs
 *   node scripts/icons/audit-icon-usage.mjs --fix  # Auto-fix issues where possible
 */

import fs from 'fs';
import path from 'path';
import { globby } from 'globby';
import chalk from 'chalk';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const ICON_REGISTRIES_DIR = path.resolve(process.cwd(), 'public/static');
const REGISTRY_FILES = [
  'app-icon-registry.json',
  'brands-icon-registry.json',
  'kpis-icon-registry.json',
  'light-icon-registry.json',
  'solid-icon-registry.json',
];
const ICON_COMPONENTS = ['Icon', 'SolidIcon', 'LightIcon'];
const SHOULD_FIX = process.argv.includes('--fix');

// Icon registry data
let allIconIds = new Set();
let idToNameMap = new Map();
let nameToIdMap = new Map();
let faVersionToIdMap = new Map();
let deprecatedMappings = new Set();

// Results tracking
const results = {
  filesScanned: 0,
  iconUsagesFound: 0,
  correctUsages: 0,
  incorrectUsages: 0,
  fixedUsages: 0,
  errorFiles: 0,
};

// Load all icon registries to build reference maps
async function loadIconRegistries() {
  console.log(chalk.blue('Loading icon registries...'));
  
  for (const registryFile of REGISTRY_FILES) {
    const filePath = path.join(ICON_REGISTRIES_DIR, registryFile);
    try {
      if (fs.existsSync(filePath)) {
        const registry = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (registry.icons && Array.isArray(registry.icons)) {
          console.log(chalk.gray(`  - ${registryFile}: ${registry.icons.length} icons`));
          
          for (const icon of registry.icons) {
            if (icon.id) {
              // Store the icon ID
              allIconIds.add(icon.id);
              
              // Map between ID and name
              if (icon.name) {
                idToNameMap.set(icon.id, icon.name);
                nameToIdMap.set(icon.name.toLowerCase(), icon.id);
              }
              
              // Map between faVersion and ID
              if (icon.faVersion) {
                faVersionToIdMap.set(icon.faVersion, icon.id);
              }
              
              // Check for map field (which is a FontAwesome identifier)
              if (icon.map) {
                faVersionToIdMap.set(icon.map, icon.id);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(chalk.red(`Error loading ${registryFile}:`), err.message);
    }
  }
  
  console.log(chalk.green(`Loaded ${allIconIds.size} unique icon IDs from registries`));
  
  // Identify deprecated mappings
  markDeprecatedMappings();
}

// Find and analyze all icon usages
async function auditIconUsage() {
  console.log(chalk.blue('Scanning codebase for Icon component usage...'));
  
  // Find all React/TSX files
  const files = await globby([
    `${SRC_DIR}/**/*.tsx`,
    `${SRC_DIR}/**/*.jsx`,
    `!${SRC_DIR}/**/*.d.ts`,
    `!${SRC_DIR}/**/*.test.tsx`,
    `!${SRC_DIR}/**/*.stories.tsx`,
    `!**/node_modules/**`,
  ]);
  
  results.filesScanned = files.length;
  
  console.log(chalk.gray(`Found ${files.length} files to scan`));
  
  // Process each file
  for (const file of files) {
    try {
      await processFile(file);
    } catch (err) {
      console.error(chalk.red(`Error processing ${file}:`), err.message);
      results.errorFiles++;
    }
  }
}

// Process a single file
async function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Use regex to find all icon component usages
  // Capture group 1: component name (Icon, SolidIcon, LightIcon)
  // Capture group 2: all props within the component
  const iconComponentRegex = new RegExp(`<(${ICON_COMPONENTS.join('|')})\\s+([^>]+)>`, 'g');
  
  let match;
  while ((match = iconComponentRegex.exec(content)) !== null) {
    const [fullMatch, componentName, props] = match;
    results.iconUsagesFound++;
    
    // Extract the name prop
    const nameMatch = props.match(/name\s*=\s*["']([^"']+)["']/);
    if (nameMatch) {
      const iconName = nameMatch[1];
      const { isCorrect, suggestion, fixedProps } = analyzeIconUsage(iconName, props);
      
      if (isCorrect) {
        results.correctUsages++;
      } else {
        results.incorrectUsages++;
        
        // Report the issue
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(
          chalk.yellow(`Issue found in ${chalk.cyan(relativePath)}:`),
          `\n  Component: ${chalk.cyan(`<${componentName}>`)}`,
          `\n  Current: ${chalk.red(`name="${iconName}"`)}`,
          `\n  Suggestion: ${chalk.green(suggestion)}`
        );
        
        // Fix if requested and possible
        if (SHOULD_FIX && fixedProps) {
          const newComponentText = `<${componentName} ${fixedProps}>`;
          content = content.slice(0, match.index) + newComponentText + content.slice(match.index + fullMatch.length);
          modified = true;
          results.fixedUsages++;
          
          // Reset the regex to continue matching
          iconComponentRegex.lastIndex = match.index + newComponentText.length;
        }
      }
    }
  }
  
  // Write back the file if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(chalk.green(`Fixed icon usages in ${path.relative(process.cwd(), filePath)}`));
  }
}

// Analyze an icon usage to determine if it's using the correct id
function analyzeIconUsage(iconName, props) {
  // Check if the icon name is already a valid ID
  if (allIconIds.has(iconName)) {
    return { isCorrect: true };
  }
  
  // Check if it's a FontAwesome identifier that maps to an ID
  if (faVersionToIdMap.has(iconName)) {
    const correctId = faVersionToIdMap.get(iconName);
    return {
      isCorrect: false,
      suggestion: `Use id: "${correctId}" instead of "${iconName}"`,
      fixedProps: props.replace(
        /name\s*=\s*["']([^"']+)["']/,
        `name="${correctId}"`
      )
    };
  }
  
  // Check if it's a name that maps to an ID
  const lowerName = iconName.toLowerCase();
  if (nameToIdMap.has(lowerName)) {
    const correctId = nameToIdMap.get(lowerName);
    return {
      isCorrect: false,
      suggestion: `Use id: "${correctId}" instead of name: "${iconName}"`,
      fixedProps: props.replace(
        /name\s*=\s*["']([^"']+)["']/,
        `name="${correctId}"`
      )
    };
  }
  
  // Check if it's a semantic name (user, plus, etc.)
  // This is trickier as we'd need to analyze the icon utilities
  if (iconName.match(/^[a-z-]+$/)) {
    return {
      isCorrect: false,
      suggestion: `Consider using an explicit icon ID instead of semantic name "${iconName}"`,
      fixedProps: null // No automatic fix for this case
    };
  }
  
  // If it's a fa* name format but not in our registries
  if (iconName.startsWith('fa')) {
    // Try to guess the correct ID
    const potentialMatches = findSimilarIconIds(iconName);
    if (potentialMatches.length > 0) {
      return {
        isCorrect: false,
        suggestion: `Icon "${iconName}" not found in registries. Did you mean one of: ${potentialMatches.join(', ')}?`,
        fixedProps: null // No automatic fix for this case
      };
    }
    
    return {
      isCorrect: false,
      suggestion: `Icon "${iconName}" not found in any registry. Ensure this icon exists and use its correct ID.`,
      fixedProps: null
    };
  }
  
  // For other patterns, just report the possible issue
  return {
    isCorrect: false,
    suggestion: `Unknown icon reference "${iconName}". Verify this icon exists and use its correct ID.`,
    fixedProps: null
  };
}

// Find similar icon IDs for a given name
function findSimilarIconIds(name) {
  const lowercaseName = name.toLowerCase();
  const similarIds = [];
  
  // Check for matching substrings
  for (const id of allIconIds) {
    if (id.toLowerCase().includes(lowercaseName) || 
        lowercaseName.includes(id.toLowerCase())) {
      similarIds.push(id);
    }
  }
  
  // Limit the number of suggestions
  return similarIds.slice(0, 5);
}

// Identify deprecated mapping patterns
function markDeprecatedMappings() {
  deprecatedMappings.add('name');
  deprecatedMappings.add('faVersion');
  // Add other deprecated mapping fields if needed
}

// Show summary report
function showReport() {
  console.log(chalk.blue('\nIcon Usage Audit Report:'));
  console.log(chalk.gray('---------------------------'));
  console.log(`Files scanned: ${chalk.cyan(results.filesScanned)}`);
  console.log(`Icon usages found: ${chalk.cyan(results.iconUsagesFound)}`);
  console.log(`Correct usages: ${chalk.green(results.correctUsages)}`);
  console.log(`Incorrect usages: ${chalk.yellow(results.incorrectUsages)}`);
  
  if (SHOULD_FIX) {
    console.log(`Usages fixed: ${chalk.green(results.fixedUsages)}`);
  }
  
  console.log(`Files with errors: ${chalk.red(results.errorFiles)}`);
  
  if (results.incorrectUsages > 0) {
    console.log(chalk.yellow('\nSome icon usages need to be updated to use the correct ID.'));
    if (!SHOULD_FIX) {
      console.log(chalk.gray('Run with --fix to automatically fix issues where possible.'));
    }
  } else if (results.incorrectUsages === 0 && results.iconUsagesFound > 0) {
    console.log(chalk.green('\nAll icon usages are correctly using ID as the SSOT!'));
  }
}

// Main execution
async function main() {
  console.log(chalk.blue('Icon Usage Audit Script'));
  console.log(chalk.gray('----------------------'));
  
  if (SHOULD_FIX) {
    console.log(chalk.yellow('Running in FIX mode - will attempt to correct issues automatically\n'));
  } else {
    console.log(chalk.gray('Running in AUDIT mode - will only report issues\n'));
  }
  
  // Load reference data
  await loadIconRegistries();
  
  // Find and analyze all icon usages
  await auditIconUsage();
  
  // Report results
  showReport();
  
  // Exit with appropriate code
  process.exit(results.incorrectUsages > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(chalk.red('Error:'), err);
  process.exit(1);
}); 
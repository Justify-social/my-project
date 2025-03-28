#!/usr/bin/env node

/**
 * Feature Component Migration Script
 * 
 * This script migrates components to the new features directory structure
 * based on the identification results from feature-component-identification.js.
 * 
 * Usage:
 * node scripts/directory-structure/feature-component-migration.js --domain=campaigns [--dry-run] [--input=file.json]
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Parse command line arguments
const args = process.argv.slice(2);
const domainArg = args.find(arg => arg.startsWith('--domain='))?.split('=')[1];
const dryRun = args.includes('--dry-run');
const inputFile = args.find(arg => arg.startsWith('--input='))?.split('=')[1] || 'feature-components.json';
const confirmArg = args.find(arg => arg.startsWith('--confirm='));
const confirmScore = confirmArg ? parseInt(confirmArg.split('=')[1] || '7', 10) : 7;

// Validate arguments
if (!domainArg) {
  console.error('Error: --domain parameter is required');
  console.log('Usage: node feature-component-migration.js --domain=campaigns [--dry-run] [--input=file.json]');
  process.exit(1);
}

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file '${inputFile}' not found.`);
  console.log('Run feature-component-identification.js first to generate the component mapping.');
  process.exit(1);
}

// Configuration
const ROOT_DIR = process.cwd();
const FEATURES_DIR = path.join(ROOT_DIR, 'src', 'components', 'features');

/**
 * Create directories if they don't exist
 */
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

/**
 * Move a file and update its import statements
 */
function migrateComponent(component, targetPath) {
  const srcPath = component.filePath;
  const destPath = path.join(ROOT_DIR, targetPath);
  
  // Check if source file exists
  if (!fs.existsSync(srcPath)) {
    console.log(`Warning: Source file does not exist: ${srcPath}`);
    console.log(`Skipping migration of ${component.componentName} (${component.relativePath})`);
    return null;
  }
  
  // Ensure target directory exists
  ensureDirectoryExists(path.dirname(destPath));
  
  if (!dryRun) {
    // Read the file content
    const content = fs.readFileSync(srcPath, 'utf8');
    
    // Write to new location
    fs.writeFileSync(destPath, content);
    console.log(`Migrated: ${component.relativePath} -> ${targetPath}`);
    
    // Remove the original file
    fs.unlinkSync(srcPath);
  } else {
    console.log(`Would migrate: ${component.relativePath} -> ${targetPath}`);
  }
  
  return {
    originalPath: component.relativePath,
    newPath: targetPath,
    componentName: component.componentName
  };
}

/**
 * Generate an import updater script
 * @param {Array} migratedComponents - List of migrated components
 */
function generateImportUpdaterScript(migratedComponents) {
  const importUpdaterPath = path.join(ROOT_DIR, 'scripts', 'directory-structure', `update-imports-${domainArg}.js`);
  
  // Create the script content
  const importUpdaterContent = [
    '#!/usr/bin/env node',
    '/**',
    ` * Import Path Updater for ${domainArg} components`,
    ' *',
    ' * This script updates import statements throughout the codebase to reference',
    ` * the new locations of migrated ${domainArg} components.`,
    ' *',
    ' * Usage:',
    ` * node scripts/directory-structure/update-imports-${domainArg}.js [--dry-run]`,
    ' */',
    '',
    'import fs from \'fs\';',
    'import path from \'path\';',
    '',
    'const dryRun = process.argv.includes("--dry-run");',
    'const rootDir = process.cwd();',
    '',
    // Components that were migrated
    `const migratedComponents = ${JSON.stringify(migratedComponents, null, 2)};`,
    '',
    // Scan all files in the src directory
    'function findFilesToUpdate() {',
    '  const results = [];',
    '  const exclude = ["node_modules", "dist", "build", ".git"];',
    '  ',
    '  function traverse(dir) {',
    '    const files = fs.readdirSync(dir);',
    '    for (const file of files) {',
    '      const fullPath = path.join(dir, file);',
    '      if (fs.statSync(fullPath).isDirectory()) {',
    '        if (!exclude.includes(file)) {',
    '          traverse(fullPath);',
    '        }',
    '      } else if (/\\.(js|jsx|ts|tsx)$/.test(file)) {',
    '        results.push(fullPath);',
    '      }',
    '    }',
    '  }',
    '  ',
    '  traverse(path.join(rootDir, "src"));',
    '  return results;',
    '}',
    '',
    // Update imports in a file
    'function updateImports(filePath) {',
    '  let content = fs.readFileSync(filePath, "utf8");',
    '  let modified = false;',
    '  ',
    // For each migrated component
    '  for (const component of migratedComponents) {',
    '    const oldPath = component.originalPath.replace(/\\.(tsx|jsx)$/, "");',
    '    const newPath = component.newPath.replace(/\\.(tsx|jsx)$/, "");',
    '    const componentName = component.componentName;',
    '    const baseName = path.basename(oldPath);',
    '    const newImport = `@/${newPath}`;',
    '    ',
    // Look for imports
    '    const patterns = [',
    // Relative path imports
    '      { find: `./${baseName}`, replace: newImport },',
    '      { find: `./${baseName}.`, replace: `${newImport}.` },',
    '      { find: `../${baseName}`, replace: newImport },',
    '      { find: `../${baseName}.`, replace: `${newImport}.` },',
    '      { find: `../../${baseName}`, replace: newImport },',
    '      { find: `../../${baseName}.`, replace: `${newImport}.` },',
    '      { find: `../../../${baseName}`, replace: newImport },',
    '      { find: `../../../${baseName}.`, replace: `${newImport}.` },',
    // Component name imports
    '      { find: `./${componentName}`, replace: newImport },',
    '      { find: `./${componentName}.`, replace: `${newImport}.` },',
    '      { find: `../${componentName}`, replace: newImport },',
    '      { find: `../${componentName}.`, replace: `${newImport}.` },',
    // Absolute imports
    '      { find: `@/${oldPath}`, replace: newImport },',
    '      { find: `@/${oldPath}.`, replace: `${newImport}.` }',
    '    ];',
    '',
    // Check for any matches
    '    let hasMatch = false;',
    '    for (const pattern of patterns) {',
    '      if (content.includes(`from "${pattern.find}"`) || content.includes(`from \'${pattern.find}\'`)) {',
    '        hasMatch = true;',
    '        break;',
    '      }',
    '    }',
    '',
    '    if (hasMatch) {',
    '      console.log(`In file ${path.relative(rootDir, filePath)}:`);',
    '      console.log(`  Updating imports for ${componentName}`);',
    '',
    // Apply replacements
    '      const original = content;',
    '      for (const pattern of patterns) {',
    '        content = content.replace(`from "${pattern.find}"`, `from "${pattern.replace}"`);',
    '        content = content.replace(`from \'${pattern.find}\'`, `from \'${pattern.replace}\'`);',
    '      }',
    '      ',
    '      if (original !== content) {',
    '        modified = true;',
    '      }',
    '    }',
    '  }',
    '  ',
    // Save changes
    '  if (modified && !dryRun) {',
    '    fs.writeFileSync(filePath, content);',
    '    return true;',
    '  }',
    '  ',
    '  return modified;',
    '}',
    '',
    // Main function
    'function main() {',
    `  console.log("Updating imports for ${migratedComponents.length} migrated components...");`,
    '  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);',
    '  ',
    '  const files = findFilesToUpdate();',
    '  console.log(`Found ${files.length} files to check`);',
    '  ',
    '  let modifiedCount = 0;',
    '  for (const file of files) {',
    '    if (updateImports(file)) {',
    '      modifiedCount++;',
    '    }',
    '  }',
    '  ',
    '  console.log("\\nCompleted import updates:");',
    '  console.log(`- ${modifiedCount} files modified`);',
    '  ',
    '  if (dryRun) {',
    '    console.log("\\nThis was a dry run. No changes were made.");',
    '    console.log("Run without --dry-run to apply the changes.");',
    '  }',
    '}',
    '',
    'main();'
  ].join('\n');

  if (!dryRun) {
    fs.writeFileSync(importUpdaterPath, importUpdaterContent);
    fs.chmodSync(importUpdaterPath, '755'); // Make executable
    console.log(`\nCreated import updater script: ${importUpdaterPath}`);
  } else {
    console.log(`\nWould create import updater script: ${importUpdaterPath}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log(`Feature Component Migration - Domain: ${domainArg}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);
  
  // Read the component mapping
  const mapping = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  
  // Filter components for the requested domain
  const domainComponents = mapping.componentsByDomain[domainArg] || {};
  
  if (Object.keys(domainComponents).length === 0) {
    console.log(`No components found for domain: ${domainArg}`);
    return;
  }
  
  // Count components
  let totalComponents = 0;
  let eligibleComponents = 0;
  
  for (const feature of Object.values(domainComponents)) {
    totalComponents += feature.length;
    
    for (const component of feature) {
      if (component.suggested.matchScore >= confirmScore) {
        eligibleComponents++;
      }
    }
  }
  
  console.log(`\nComponents in domain "${domainArg}":`);
  console.log(`- Total components: ${totalComponents}`);
  console.log(`- Components with confidence score >= ${confirmScore}: ${eligibleComponents}`);
  
  if (eligibleComponents === 0) {
    console.log(`\nNo components meet the minimum confidence score of ${confirmScore}.`);
    console.log(`Use --confirm=<score> to adjust the minimum confidence threshold.`);
    return;
  }
  
  console.log('\nComponents to migrate:');
  
  // Track migrated components for import updater
  const migratedComponents = [];
  
  // Process each feature in the domain
  for (const [feature, components] of Object.entries(domainComponents)) {
    console.log(`\n== Feature: ${feature} ==`);
    
    // Filter components by confidence score
    const eligibleFeatureComponents = components.filter(
      c => c.suggested.matchScore >= confirmScore
    );
    
    if (eligibleFeatureComponents.length === 0) {
      console.log(`  No components meet the confidence threshold.`);
      continue;
    }
    
    // Migrate each component
    for (const component of eligibleFeatureComponents) {
      console.log(`  Component: ${component.componentName} (${component.relativePath})`);
      console.log(`  - Confidence score: ${component.suggested.matchScore}/10`);
      console.log(`  - Reason: ${component.suggested.matchReason}`);
      
      const result = migrateComponent(component, component.suggested.targetPath);
      if (result) {
        migratedComponents.push(result);
      }
      
      console.log('');
    }
  }
  
  if (migratedComponents.length > 0) {
    // Generate import updater script
    generateImportUpdaterScript(migratedComponents);
  }
  
  console.log('\nMigration summary:');
  console.log(`- Components migrated: ${migratedComponents.length}/${eligibleComponents}`);
  
  if (dryRun) {
    console.log('\nThis was a dry run. No changes were made.');
    console.log('Run without --dry-run to apply the changes.');
  } else if (migratedComponents.length > 0) {
    console.log('\nNext steps:');
    console.log(`1. Run the import updater script: node scripts/directory-structure/update-imports-${domainArg}.js --dry-run`);
    console.log('2. Review the changes and then run without --dry-run to apply them');
    console.log('3. Test the application to ensure everything works correctly');
  }
}

main(); 
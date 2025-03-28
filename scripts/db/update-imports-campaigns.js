#!/usr/bin/env node

/**
 * Import Path Updater for campaigns components
 *
 * This script updates import statements throughout the codebase to reference
 * the new locations of migrated campaigns components.
 *
 * Usage:
 * node scripts/directory-structure/update-imports-campaigns.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';

const dryRun = process.argv.includes("--dry-run");
const rootDir = process.cwd();

// Components that were migrated
const migratedComponents = [
  {
    "originalPath": "app/campaigns/wizard/step-1/Step1Content.tsx",
    "newPath": "src/components/features/campaigns/wizard/Step1Content.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/campaigns/wizard/step-2/Step2Content.tsx",
    "newPath": "src/components/features/campaigns/wizard/Step2Content.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/campaigns/wizard/step-3/Step3Content.tsx",
    "newPath": "src/components/features/campaigns/wizard/Step3Content.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/campaigns/wizard/step-4/Step4Content.tsx",
    "newPath": "src/components/features/campaigns/wizard/Step4Content.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/campaigns/wizard/step-5/Step5Content.tsx",
    "newPath": "src/components/features/campaigns/wizard/Step5Content.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Wizard/WizardNavigation.tsx",
    "newPath": "src/components/features/campaigns/wizard/WizardNavigation.tsx",
    "componentName": "WizardNavigation"
  },
  {
    "originalPath": "components/Wizard/shared/StepContentLoader.tsx",
    "newPath": "src/components/features/campaigns/wizard/StepContentLoader.tsx",
    "componentName": "StepLoader"
  },
  {
    "originalPath": "components/campaign/Step4Content.tsx",
    "newPath": "src/components/features/campaigns/wizard/Step4Content.tsx",
    "componentName": "Step4Content"
  },
  {
    "originalPath": "components/features/campaigns/wizard/WizardContext.tsx",
    "newPath": "src/components/features/campaigns/wizard/WizardContext.tsx",
    "componentName": "WizardProvider"
  },
  {
    "originalPath": "context/WizardContext.tsx",
    "newPath": "src/components/features/campaigns/wizard/WizardContext.tsx",
    "componentName": "useWizard"
  },
  {
    "originalPath": "contexts/CampaignWizardContext.tsx",
    "newPath": "src/components/features/campaigns/wizard/CampaignWizardContext.tsx",
    "componentName": "CampaignWizardContext"
  },
  {
    "originalPath": "contexts/WizardContext.tsx",
    "newPath": "src/components/features/campaigns/wizard/WizardContext.tsx",
    "componentName": "WizardContext"
  }
];

// Scan all files in the src directory
function findFilesToUpdate() {
  const results = [];
  const exclude = ["node_modules", "dist", "build", ".git"];
  
  function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      // Check if file exists before proceeding
      if (!fs.existsSync(fullPath)) {
        console.warn(`Warning: File does not exist: ${fullPath}`);
        continue;
      }
      
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          if (!exclude.includes(file)) {
            traverse(fullPath);
          }
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
          results.push(fullPath);
        }
      } catch (err) {
        console.warn(`Warning: Error processing ${fullPath}: ${err.message}`);
      }
    }
  }
  
  traverse(path.join(rootDir, "src"));
  return results;
}

// Update imports in a file
function updateImports(filePath) {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File does not exist: ${filePath}`);
    return false;
  }
  
  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.warn(`Warning: Error reading file ${filePath}: ${err.message}`);
    return false;
  }
  
  let modified = false;
  
  // For each migrated component
  for (const component of migratedComponents) {
    const oldPath = component.originalPath.replace(/\.(tsx|jsx)$/, "");
    const newPath = component.newPath.replace(/\.(tsx|jsx)$/, "");
    const componentName = component.componentName;
    const baseName = path.basename(oldPath);
    const newImport = `@/${newPath}`;
    
    // Look for imports
    const patterns = [
      // Relative path imports
      { find: `./${baseName}`, replace: newImport },
      { find: `./${baseName}.`, replace: `${newImport}.` },
      { find: `../${baseName}`, replace: newImport },
      { find: `../${baseName}.`, replace: `${newImport}.` },
      { find: `../../${baseName}`, replace: newImport },
      { find: `../../${baseName}.`, replace: `${newImport}.` },
      { find: `../../../${baseName}`, replace: newImport },
      { find: `../../../${baseName}.`, replace: `${newImport}.` },
      // Component name imports
      { find: `./${componentName}`, replace: newImport },
      { find: `./${componentName}.`, replace: `${newImport}.` },
      { find: `../${componentName}`, replace: newImport },
      { find: `../${componentName}.`, replace: `${newImport}.` },
      // Absolute imports
      { find: `@/${oldPath}`, replace: newImport },
      { find: `@/${oldPath}.`, replace: `${newImport}.` }
    ];

    // Check for any matches
    let hasMatch = false;
    for (const pattern of patterns) {
      if (content.includes(`from "${pattern.find}"`) || content.includes(`from '${pattern.find}'`)) {
        hasMatch = true;
        break;
      }
    }

    if (hasMatch) {
      console.log(`In file ${path.relative(rootDir, filePath)}:`);
      console.log(`  Updating imports for ${componentName}`);

      // Apply replacements
      const original = content;
      for (const pattern of patterns) {
        content = content.replace(`from "${pattern.find}"`, `from "${pattern.replace}"`);
        content = content.replace(`from '${pattern.find}'`, `from '${pattern.replace}'`);
      }
      
      if (original !== content) {
        modified = true;
      }
    }
  }
  
  // Save changes
  if (modified && !dryRun) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return modified;
}

// Main function
function main() {
  console.log("Updating imports for 12 migrated components...");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  
  const files = findFilesToUpdate();
  console.log(`Found ${files.length} files to check`);
  
  let modifiedCount = 0;
  for (const file of files) {
    if (updateImports(file)) {
      modifiedCount++;
    }
  }
  
  console.log("\nCompleted import updates:");
  console.log(`- ${modifiedCount} files modified`);
  
  if (dryRun) {
    console.log("\nThis was a dry run. No changes were made.");
    console.log("Run without --dry-run to apply the changes.");
  }
}

main();
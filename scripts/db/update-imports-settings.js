#!/usr/bin/env node

/**
 * Import Path Updater for settings components
 *
 * This script updates import statements throughout the codebase to reference
 * the new locations of migrated settings components.
 *
 * Usage:
 * node scripts/directory-structure/update-imports-settings.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';

const dryRun = process.argv.includes("--dry-run");
const rootDir = process.cwd();

// Components that were migrated
const migratedComponents = [
  {
    "originalPath": "app/brand-health/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/brand-lift/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/brand-lift/progress/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/brand-lift/report/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/brand-lift/selected-campaign/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/brand-lift/survey-approval/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/brand-lift/survey-design/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/brand-lift/survey-preview/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/settings/branding/page.tsx",
    "newPath": "src/components/features/settings/branding/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Brand-Lift/CreativePreview.tsx",
    "newPath": "src/components/features/settings/branding/CreativePreview.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Brand-Lift/PlatformSwitcher.tsx",
    "newPath": "src/components/features/settings/branding/PlatformSwitcher.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Brand-Lift/SelectedCampaignContent.tsx",
    "newPath": "src/components/features/settings/branding/SelectedCampaignContent.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Brand-Lift/SurveyApprovalContent.tsx",
    "newPath": "src/components/features/settings/branding/SurveyApprovalContent.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Brand-Lift/SurveyDesignContent.tsx",
    "newPath": "src/components/features/settings/branding/SurveyDesignContent.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Brand-Lift/SurveyOptionCard.tsx",
    "newPath": "src/components/features/settings/branding/SurveyOptionCard.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Brand-Lift/SurveyPreviewContent.tsx",
    "newPath": "src/components/features/settings/branding/SurveyPreviewContent.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/Brand-Lift/SurveyProgressBar.tsx",
    "newPath": "src/components/features/settings/branding/SurveyProgressBar.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/settings/branding/FileUpload.tsx",
    "newPath": "src/components/features/settings/branding/FileUpload.tsx",
    "componentName": "FileUpload"
  },
  {
    "originalPath": "components/settings/branding/FontSelector.tsx",
    "newPath": "src/components/features/settings/branding/FontSelector.tsx",
    "componentName": "FontSelector"
  },
  {
    "originalPath": "app/settings/team-management/debug/page.tsx",
    "newPath": "src/components/features/settings/team/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/settings/team-management/fixed/page.tsx",
    "newPath": "src/components/features/settings/team/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/settings/team-management/page.tsx",
    "newPath": "src/components/features/settings/team/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "app/settings/team-management/simple-debug/page.tsx",
    "newPath": "src/components/features/settings/team/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/settings/team-management/DeleteConfirmationModal.tsx",
    "newPath": "src/components/features/settings/team/DeleteConfirmationModal.tsx",
    "componentName": "DeleteConfirmationModal"
  },
  {
    "originalPath": "components/settings/team-management/TestModal.tsx",
    "newPath": "src/components/features/settings/team/TestModal.tsx",
    "componentName": "TestModal"
  },
  {
    "originalPath": "app/billing/page.tsx",
    "newPath": "src/components/features/settings/account/page.tsx",
    "componentName": "SubscriptionBillingPage"
  }
];

// Scan all files in the src directory
function findFilesToUpdate() {
  const results = [];
  const exclude = ["node_modules", "dist", "build", ".git"];
  
  function traverse(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
          if (fs.statSync(fullPath).isDirectory()) {
            if (!exclude.includes(file)) {
              traverse(fullPath);
            }
          } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            results.push(fullPath);
          }
        } catch (statError) {
          console.log(`Warning: Error accessing file ${fullPath}: ${statError.message}`);
        }
      }
    } catch (readError) {
      console.log(`Warning: Cannot read directory ${dir}: ${readError.message}`);
    }
  }
  
  traverse(path.join(rootDir, "src"));
  return results;
}

// Update imports in a file
function updateImports(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
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
  console.log("Updating imports for 26 migrated components...");
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
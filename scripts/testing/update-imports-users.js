#!/usr/bin/env node

/**
 * Import Path Updater for users components
 *
 * This script updates import statements throughout the codebase to reference
 * the new locations of migrated users components.
 *
 * Usage:
 * node scripts/directory-structure/update-imports-users.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';

const dryRun = process.argv.includes("--dry-run");
const rootDir = process.cwd();

// Components that were migrated
const migratedComponents = [
  {
    "originalPath": "__tests__/integration/ProfileSettingsPage.test.tsx",
    "newPath": "src/components/features/users/profile/ProfileSettingsPage.test.tsx",
    "componentName": "ProfileSettingsPage.test"
  },
  {
    "originalPath": "__tests__/settings/profile/PersonalInfoSection.test.tsx",
    "newPath": "src/components/features/users/profile/PersonalInfoSection.test.tsx",
    "componentName": "PersonalInfoSection.test"
  },
  {
    "originalPath": "__tests__/settings/profile/ProfilePictureSection.test.tsx",
    "newPath": "src/components/features/users/profile/ProfilePictureSection.test.tsx",
    "componentName": "ProfilePictureSection.test"
  },
  {
    "originalPath": "__tests__/settings/profile/ProfileSettingsSkeleton.test.tsx",
    "newPath": "src/components/features/users/profile/ProfileSettingsSkeleton.test.tsx",
    "componentName": "ProfileSettingsSkeleton.test"
  },
  {
    "originalPath": "app/settings/profile-settings/components/PersonalInfoSection.tsx",
    "newPath": "src/components/features/users/profile/PersonalInfoSection.tsx",
    "componentName": "PersonalInfoSection"
  },
  {
    "originalPath": "app/settings/profile-settings/components/ProfilePictureSection.tsx",
    "newPath": "src/components/features/users/profile/ProfilePictureSection.tsx",
    "componentName": "ProfilePictureSection"
  },
  {
    "originalPath": "app/settings/profile-settings/page.tsx",
    "newPath": "src/components/features/users/profile/page.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/settings/profile/PersonalInfoSection.tsx",
    "newPath": "src/components/features/users/profile/PersonalInfoSection.tsx",
    "componentName": "PersonalInfoSection"
  },
  {
    "originalPath": "components/settings/profile/ProfilePictureSection.tsx",
    "newPath": "src/components/features/users/profile/ProfilePictureSection.tsx",
    "componentName": "ProfilePictureSection"
  },
  {
    "originalPath": "components/settings/profile/ProfileSettingsSkeleton.tsx",
    "newPath": "src/components/features/users/profile/ProfileSettingsSkeleton.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "__tests__/settings/profile/PasswordManagementSection.test.tsx",
    "newPath": "src/components/features/users/authentication/PasswordManagementSection.test.tsx",
    "componentName": "PasswordManagementSection.test"
  },
  {
    "originalPath": "app/settings/profile-settings/components/PasswordManagementSection.tsx",
    "newPath": "src/components/features/users/authentication/PasswordManagementSection.tsx",
    "componentName": "PasswordManagementSection"
  },
  {
    "originalPath": "components/auth/AuthCheck.tsx",
    "newPath": "src/components/features/users/authentication/AuthCheck.tsx",
    "componentName": "function"
  },
  {
    "originalPath": "components/settings/profile/PasswordManagementSection.tsx",
    "newPath": "src/components/features/users/authentication/PasswordManagementSection.tsx",
    "componentName": "PasswordManagementSection"
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
  console.log("Updating imports for 14 migrated components...");
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
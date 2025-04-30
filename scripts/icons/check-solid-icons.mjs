#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the solid icon registry JSON file
const ICON_REGISTRY_PATH = path.resolve(process.cwd(), 'public/static/solid-icon-registry.json');

// Main validation function
function validateIconRegistry() {
  try {
    console.log(`Validating: ${ICON_REGISTRY_PATH}`);

    // Check if file exists
    if (!fs.existsSync(ICON_REGISTRY_PATH)) {
      throw new Error(`Registry file not found at: ${ICON_REGISTRY_PATH}`);
    }

    // Read the file content
    const fileContent = fs.readFileSync(ICON_REGISTRY_PATH, 'utf8');
    console.log(`File size: ${fileContent.length} bytes`);

    // Parse the icon registry
    const iconRegistry = JSON.parse(fileContent);

    if (!iconRegistry.icons || !Array.isArray(iconRegistry.icons)) {
      throw new Error('Invalid icon registry format');
    }

    console.log(`📦 Found ${iconRegistry.icons.length} icon definitions to validate`);

    // Track issues
    const missingFaVersion = [];
    const incorrectPathFormat = [];
    const missingPaths = [];
    const validIcons = [];

    // Validate each icon
    for (const icon of iconRegistry.icons) {
      const { id, name, faVersion, path: iconPath } = icon;

      // Check for issues
      if (!faVersion) {
        // Missing faVersion - let's suggest what it should likely be
        const suggestedVersion = `fas fa-${name.toLowerCase().replace(/\s+/g, '-')}`;
        missingFaVersion.push({ id, name, suggestedVersion });
      }

      if (!iconPath) {
        missingPaths.push({ id, name });
      } else if (!iconPath.startsWith('/icons/solid/')) {
        // Path format issue
        const correctPath = `/icons/solid/${iconPath}`;
        incorrectPathFormat.push({ id, name, currentPath: iconPath, correctPath });
      }

      // If no issues, it's a valid icon
      if (faVersion && iconPath && iconPath.startsWith('/icons/solid/')) {
        validIcons.push({ id, name, faVersion });
      }
    }

    // Report validation results
    console.log('\n📊 Validation Results:');
    console.log(`   ✅ Valid icons: ${validIcons.length}`);
    console.log(
      `   ❌ Issues detected: ${missingFaVersion.length + incorrectPathFormat.length + missingPaths.length}`
    );

    if (missingFaVersion.length > 0) {
      console.log('\n⚠️ Icons Missing faVersion:');
      missingFaVersion.forEach(({ id, name, suggestedVersion }) => {
        console.log(`   - ${id} (${name}): should use "${suggestedVersion}"`);
      });
    }

    if (incorrectPathFormat.length > 0) {
      console.log('\n⚠️ Icons with Incorrect Path Format:');
      incorrectPathFormat.forEach(({ id, name, currentPath, correctPath }) => {
        console.log(
          `   - ${id} (${name}): should use "${correctPath}" instead of "${currentPath}"`
        );
      });
    }

    if (missingPaths.length > 0) {
      console.log('\n⚠️ Icons Missing Paths:');
      missingPaths.forEach(({ id, name }) => {
        console.log(`   - ${id} (${name})`);
      });
    }

    // Calculate and show percentage of valid icons
    const validPercentage = Math.round((validIcons.length / iconRegistry.icons.length) * 100);
    console.log(`\n📈 Registry is ${validPercentage}% valid`);

    if (missingFaVersion.length > 0 || incorrectPathFormat.length > 0 || missingPaths.length > 0) {
      console.log('\n🛠️ Recommendations:');
      console.log('   1. Fix missing faVersion fields');
      console.log("   2. Correct path formats to include '/icons/solid/' prefix");
      console.log('   3. Run a script to repair these issues before generating icons');
    } else {
      console.log('\n🎉 All icons appear to be correctly formatted!');
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the validation
validateIconRegistry();

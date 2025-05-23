#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import FontAwesome packages
import { icon } from '@fortawesome/fontawesome-svg-core';
import * as brandIcons from '@fortawesome/free-brands-svg-icons';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use the specific registry file
const ICON_REGISTRY_PATH = path.resolve(process.cwd(), 'public/static/brands-icon-registry.json');
// Custom output directory
const OUTPUT_BASE_DIR = path.resolve(process.cwd(), 'public');

// Process an icon and save it to the specified path
function processIcon(iconData) {
  const { faVersion, path: iconPath, id, name } = iconData;

  if (!faVersion || !iconPath) {
    console.warn(`⚠️ Skipping icon with missing data: ${id}`);
    return false;
  }

  try {
    // Parse the faVersion to get style and name
    // e.g., "fab fa-facebook" -> style: "fab", iconName: "facebook"
    const [style, iconIdentifier] = faVersion.split(' ');
    const iconName = iconIdentifier.replace('fa-', '');

    console.log(`Processing: ${name} (${iconName})`);

    let iconDefinition;

    // Handle brand icons from the @fortawesome/free-brands-svg-icons package
    if (style === 'fab') {
      // Convert the icon name to the format used in FontAwesome JS library
      // e.g., "facebook" -> "faFacebook"
      const faIconName =
        'fa' +
        iconName
          .split('-')
          .map((part, index) =>
            index === 0
              ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
              : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join('');

      // Get the icon definition from the brands package
      iconDefinition = brandIcons[faIconName];

      if (!iconDefinition) {
        console.warn(`⚠️ Icon not found in brand icons: ${faIconName}. Available similar icons:`);
        const similarIcons = Object.keys(brandIcons)
          .filter(key => key.toLowerCase().includes(iconName.toLowerCase()))
          .slice(0, 5);

        if (similarIcons.length > 0) {
          console.log(`   Similar icons: ${similarIcons.join(', ')}`);
        }
        return false;
      }
    } else {
      console.warn(`⚠️ Non-brand icons not supported in this version: ${style}`);
      return false;
    }

    // Generate SVG using the FontAwesome library
    const renderedIcon = icon(iconDefinition, {
      attributes: { class: faVersion },
    });

    if (!renderedIcon) {
      console.warn(`⚠️ Failed to render icon: ${name}`);
      return false;
    }

    // Get the SVG string
    const svgString = renderedIcon.html[0];

    // Use the custom output directory
    const fullPath = path.join(OUTPUT_BASE_DIR, iconPath);
    const outputDir = path.dirname(fullPath);

    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Save the SVG to the specified path
    fs.writeFileSync(fullPath, svgString);

    console.log(`✅ Saved: ${name} to ${fullPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${name}: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log(`Using registry file: ${ICON_REGISTRY_PATH}`);
    console.log(`Output directory base: ${OUTPUT_BASE_DIR}`);

    // Verify the file exists
    if (!fs.existsSync(ICON_REGISTRY_PATH)) {
      throw new Error(`Registry file not found at: ${ICON_REGISTRY_PATH}`);
    }

    // Read the file content
    const fileContent = fs.readFileSync(ICON_REGISTRY_PATH, 'utf8');
    console.log(`File size: ${fileContent.length} bytes`);

    // Read and parse the icon registry
    const iconRegistry = JSON.parse(fileContent);

    if (!iconRegistry.icons || !Array.isArray(iconRegistry.icons)) {
      throw new Error('Invalid icon registry format');
    }

    console.log(`📦 Found ${iconRegistry.icons.length} icons to process`);

    // Process each icon
    let successCount = 0;
    let failCount = 0;

    for (const icon of iconRegistry.icons) {
      const success = processIcon(icon);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Never modify the original registry file
    console.log(`\n✅ Registry file untouched as requested`);

    console.log(`\n✨ Processing complete:`);
    console.log(`   ✅ Successfully processed: ${successCount} icons`);
    console.log(`   ❌ Failed to process: ${failCount} icons`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();

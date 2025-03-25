/**
 * Icon Audit and Repair Tool
 * 
 * Scans the application for icon inconsistencies and fixes them.
 * 
 * Usage:
 *   node scripts/icon-management/audit-icons.js               # Audit and fix all issues
 *   node scripts/icon-management/audit-icons.js --fix-duplicates  # Only fix duplicate icons
 *   node scripts/icon-management/audit-icons.js --fix-missing     # Only fix missing icons
 * 
 * Options:
 *   --verbose      Show detailed report
 *   --fix          Fix all icon issues (default)
 *   --html         Generate HTML report
 *   --no-fix       Only report issues without fixing
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Process command line arguments
const args = process.argv.slice(2);
const fixDuplicates = args.includes('--fix-duplicates') || args.length === 0;
const fixMissing = args.includes('--fix-missing') || args.length === 0;

// Output directories for the SVG icons based on style
const OUTPUT_DIRS = {
  'solid': path.join(__dirname, '..', 'public', 'ui-icons', 'solid'),
  'light': path.join(__dirname, '..', 'public', 'ui-icons', 'light'),
  'brands': path.join(__dirname, '..', 'public', 'ui-icons', 'brands'),
  'regular': path.join(__dirname, '..', 'public', 'ui-icons', 'regular')
};

// Create output directories if they don't exist
Object.values(OUTPUT_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
});

console.log('Icon Audit Tool');
console.log('==============');

/**
 * Downloads an icon directly from the FontAwesome CDN
 */
function downloadIconFromCDN(iconName, style = 'light', outputPath) {
  return new Promise((resolve, reject) => {
    // Use Font Awesome CDN to download icons - adjust version if needed
    const url = `https://site-assets.fontawesome.com/releases/v6.4.0/svgs/${style}/${iconName}.svg`;
    
    console.log(`Downloading ${style}/${iconName} from ${url}`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          // Process SVG content to ensure it has fill="currentColor"
          let svgContent = data;
          if (!svgContent.includes('fill="currentColor"')) {
            svgContent = svgContent.replace('<svg', '<svg fill="currentColor"');
        }
        
          fs.writeFileSync(outputPath, svgContent, 'utf8');
          console.log(`✅ Successfully saved to ${outputPath}`);
          resolve(outputPath);
        });
      } else if (response.statusCode === 404) {
        console.log(`❌ Icon not found: ${url}`);
        reject(new Error(`Icon not found: ${url}`));
      } else {
        console.log(`❌ Failed to download: status ${response.statusCode}`);
        reject(new Error(`Failed to download icon, status: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.log(`❌ Download error: ${err.message}`);
      reject(err);
    });
          });
}

/**
 * Creates a fallback icon if download fails
 */
function createFallbackIcon(iconName, style, outputPath) {
  console.log(`Creating fallback ${style} icon for ${iconName}`);
  
  // Simple path data for various fallback icons
  const fallbackPaths = {
    'menu': 'M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z',
    'file-audio': 'M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm-64 268c0 10.7-12.9 16-20.5 8.5L104 376H76c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h28l35.5-36.5c7.6-7.6 20.5-2.2 20.5 8.5v136zm33.2-47.6c9.1-9.3 9.1-24.1 0-33.4-22.1-22.8 12.2-56.2 34.4-33.5 27.2 27.9 27.2 72.4 0 100.4-21.8 22.3-56.9-10.4-34.4-33.5zm86-117.1c54.4 55.9 54.4 144.8 0 200.8-21.8 22.4-57-10.3-34.4-33.5 36.2-37.2 36.3-96.5 0-133.8-22.1-22.8 12.3-56.3 34.4-33.5zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z',
    'file-image': 'M384 121.941V128H256V0h6.059c6.365 0 12.47 2.529 16.97 7.029l97.941 97.941A24.005 24.005 0 0 1 384 121.941zM248 160c-13.2 0-24-10.8-24-24V0H24C10.745 0 0 10.745 0 24v464c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24V160H248zm-135.455 16c26.51 0 48 21.49 48 48s-21.49 48-48 48-48-21.49-48-48 21.491-48 48-48zm208 240h-256l.485-48.485L104.545 328c4.686-4.686 11.799-4.686 16.485 0L160.545 368 264.06 264.485c4.686-4.686 12.284-4.686 16.971 0L320.545 304v112z',
    'file-video': 'M384 121.941V128H256V0h6.059c6.365 0 12.47 2.529 16.97 7.029l97.941 97.941A24.005 24.005 0 0 1 384 121.941zM224 136V0H24C10.745 0 0 10.745 0 24v464c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24V160H248c-13.2 0-24-10.8-24-24zm96 144.016v111.963c0 21.445-25.943 31.998-40.971 16.971L224 353.941V392c0 13.255-10.745 24-24 24H88c-13.255 0-24-10.745-24-24V280c0-13.255 10.745-24 24-24h112c13.255 0 24 10.745 24 24v38.059l55.029-55.013c15.011-15.01 40.971-4.491 40.971 16.97z',
    'rotate-right': 'M694.8 346.8c-39.5-39.5-103.5-39.5-143 0l-272 272c-39.5 39.5-39.5 103.5 0 143s103.5 39.5 143 0l272-272c39.5-39.5 39.5-103.5 0-143zM951.5 633.3l-514.5 514.5c-37.2 37.2-89.1 59.2-143 59.2H128c-35.3 0-64-28.7-64-64V976.7c0-53.9 22.1-105.8 59.2-143l514.5-514.5c75.1-75.1 196.9-75.1 272 0l41.8 41.8c75.1 75.1 75.1 196.9 0 272z'
  };
  
  // Create suitable viewbox and path based on icon name
  let viewBox = "0 0 448 512";
  if (iconName === 'rotate-right') viewBox = "0 0 1024 1024";
  
  // For light style, make the stroke thinner
  const pathAttrs = style === 'light' 
    ? 'stroke="currentColor" stroke-width="0.5" fill="currentColor"' 
    : 'fill="currentColor"';
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">
  <path ${pathAttrs} d="${fallbackPaths[iconName] || 'M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z'}"></path>
</svg>`;
  
  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`✅ Created fallback icon at ${outputPath}`);
  return outputPath;
}

/**
 * Checks if two icon files have identical content
 */
function compareIconFiles(path1, path2) {
  if (!fs.existsSync(path1) || !fs.existsSync(path2)) {
    return false;
  }
  
  const content1 = fs.readFileSync(path1, 'utf8');
  const content2 = fs.readFileSync(path2, 'utf8');
  
  // Extract the path data for more accurate comparison
  const pathMatch1 = content1.match(/<path[^>]*d="([^"]+)"/);
  const pathMatch2 = content2.match(/<path[^>]*d="([^"]+)"/);
  
  if (!pathMatch1 || !pathMatch2) {
    // Can't compare paths, so compare the whole file
    return content1 === content2;
  }
  
  // Just compare path data which is the actual shape
  return pathMatch1[1] === pathMatch2[1];
}

/**
 * Fix missing icons
 */
async function fixMissingIcons() {
  console.log('\nFIXING MISSING ICONS');
  console.log('===================');
  
  // List of icons that need to be fixed
  const missingIcons = [
    { name: 'menu', styles: ['light', 'solid'] },
    { name: 'file-audio', styles: ['solid'] },
    { name: 'file-image', styles: ['solid'] },
    { name: 'file-video', styles: ['solid'] },
    { name: 'rotate-right', styles: ['solid'] }
  ];
  
  let fixedCount = 0;
  let failedCount = 0;

  for (const icon of missingIcons) {
    for (const style of icon.styles) {
      const outputPath = path.join(OUTPUT_DIRS[style], `${icon.name}.svg`);
      
      try {
        await downloadIconFromCDN(icon.name, style, outputPath);
                  fixedCount++;
      } catch (error) {
        console.log(`Failed to download ${style}/${icon.name}: ${error.message}`);
        try {
          createFallbackIcon(icon.name, style, outputPath);
                  fixedCount++;
        } catch (fallbackError) {
          console.log(`Failed to create fallback icon: ${fallbackError.message}`);
          failedCount++;
        }
      }
    }
  }
  
  console.log(`\nFixed ${fixedCount} missing icons, failed to fix ${failedCount} icons.`);
  return { fixed: fixedCount, failed: failedCount };
            }

/**
 * Fix duplicate icons (identical light/solid variants)
 */
async function fixDuplicateIcons() {
  console.log('\nFIXING DUPLICATE ICONS');
  console.log('=====================');
  
  // List of icons known to be duplicates
  const duplicateIcons = [
    'close', 'edit', 'home', 'house', 'pen-to-square', 'xmark'
  ];
  
  let fixedCount = 0;
  let failedCount = 0;
  
  for (const icon of duplicateIcons) {
    const lightPath = path.join(OUTPUT_DIRS.light, `${icon}.svg`);
    const solidPath = path.join(OUTPUT_DIRS.solid, `${icon}.svg`);
    
    // Check if both files exist
    if (!fs.existsSync(lightPath) || !fs.existsSync(solidPath)) {
      console.log(`❌ Can't fix ${icon} - one or both variants don't exist.`);
      failedCount++;
      continue;
          }

    // Check if they're actually duplicates
    if (!compareIconFiles(lightPath, solidPath)) {
      console.log(`ℹ️ ${icon} light and solid variants are already distinct, skipping.`);
      continue;
    }
    
    console.log(`Fixing duplicate icon: ${icon}`);
    
    try {
      // Try to download the light version from CDN
      await downloadIconFromCDN(icon, 'light', lightPath);
      console.log(`✅ Successfully replaced light variant of ${icon}`);
      fixedCount++;
    } catch (error) {
      console.log(`Failed to download light icon for ${icon}: ${error.message}`);
      
      try {
        // Apply fallback transformation - make the existing solid icon lighter
        const solidContent = fs.readFileSync(solidPath, 'utf8');
        // Create a thinner stroke version
        const lightContent = solidContent.replace('<path d="', '<path stroke="currentColor" stroke-width="0.5" fill="currentColor" d="');
        fs.writeFileSync(lightPath, lightContent, 'utf8');
        console.log(`✅ Applied fallback transformation for ${icon}`);
        fixedCount++;
      } catch (fallbackError) {
        console.log(`❌ Failed to fix duplicate icon ${icon}: ${fallbackError.message}`);
        failedCount++;
      }
    }
  }
  
  console.log(`\nFixed ${fixedCount} duplicate icons, failed to fix ${failedCount} icons.`);
  return { fixed: fixedCount, failed: failedCount };
}

/**
 * Main function
 */
async function main() {
  const results = {
    missingFixed: 0,
    missingFailed: 0,
    duplicatesFixed: 0,
    duplicatesFailed: 0
  };
  
  // Fix missing icons if requested
  if (fixMissing) {
    const missingResults = await fixMissingIcons();
    results.missingFixed = missingResults.fixed;
    results.missingFailed = missingResults.failed;
  }
  
  // Fix duplicate icons if requested
  if (fixDuplicates) {
    const duplicateResults = await fixDuplicateIcons();
    results.duplicatesFixed = duplicateResults.fixed;
    results.duplicatesFailed = duplicateResults.failed;
  }
  
  // Report overall results
  console.log('\nAUDIT SUMMARY');
  console.log('=============');
  console.log(`Missing icons fixed: ${results.missingFixed}`);
  console.log(`Duplicate icons fixed: ${results.duplicatesFixed}`);
  console.log(`Total failures: ${results.missingFailed + results.duplicatesFailed}`);
  
  // Regenerate icon data if we fixed anything
  if (results.missingFixed > 0 || results.duplicatesFixed > 0) {
    console.log('\nRegenerating icon data...');
    try {
      execSync('node scripts/icon-management/generate-icon-data.js', { stdio: 'inherit' });
      console.log('✅ Successfully regenerated icon data');
    } catch (error) {
      console.log(`❌ Failed to regenerate icon data: ${error.message}`);
}
  }
  
  console.log('\nIcon audit complete!');
}

// Run the script
main().catch(error => {
  console.error('Error running audit script:', error);
  process.exit(1);
});
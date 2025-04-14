/**
 * Scan Icon References - Updated for New Icon System
 *
 * This script no longer depends on the deprecated icon-name-mapping.json file.
 * It directly checks all icon references against the consolidated icon registry.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Paths
const srcDir = path.join(process.cwd(), 'src');
const registryFiles = {
  app: path.join(process.cwd(), 'public', 'static', 'app-icon-registry.json'),
  brands: path.join(process.cwd(), 'public', 'static', 'brands-icon-registry.json'),
  light: path.join(process.cwd(), 'public', 'static', 'light-icon-registry.json'),
  solid: path.join(process.cwd(), 'public', 'static', 'solid-icon-registry.json'),
  kpis: path.join(process.cwd(), 'public', 'static', 'kpis-icon-registry.json'),
};

// Initialize the consolidated registry
const registry = { icons: [] };

// Load all registry files
Object.keys(registryFiles).forEach(key => {
  if (fs.existsSync(registryFiles[key])) {
    try {
      const data = JSON.parse(fs.readFileSync(registryFiles[key], 'utf8'));
      if (data && Array.isArray(data.icons)) {
        registry.icons.push(...data.icons);
      }
    } catch (e) {
      console.error(chalk.red(`Error loading ${key} registry:`, e.message));
    }
  }
});

// Find all JSX/TSX files
console.log(chalk.blue('Scanning for icon references...'));
const files = glob.sync('**/*.{jsx,tsx}', { cwd: srcDir, ignore: 'node_modules/**' });
console.log(chalk.gray(`Found ${files.length} JSX/TSX files to scan`));

// Regular expressions for icon references
const iconRegexes = [
  /<Icon\s+([^>]*)name=["']([^"']+)["']([^>]*)>/g,
  /<Icon\s+([^>]*)iconId=["']([^"']+)["']([^>]*)>/g,
  /<FontAwesomeIcon\s+([^>]*)icon=["']([^"']+)["']([^>]*)>/g,
  /<IconAdapter\s+([^>]*)icon=["']([^"']+)["']([^>]*)>/g,
  /<ShadcnIcon\s+([^>]*)iconId=["']([^"']+)["']([^>]*)>/g,
];

// Results
const results = {
  total: 0,
  modern: 0,
  legacy: 0,
  byFile: {},
};

// Analyze each file
files.forEach(file => {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const fileResults = { modern: 0, legacy: 0, references: [] };

  // Check for icon references
  iconRegexes.forEach(regex => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const iconIdentifier = match[2];

      // Check if this is a modern or legacy reference
      let isModern = false;

      // Modern references use iconId that matches registry id
      if (match[0].includes('iconId=')) {
        isModern = true;
      } else {
        // Check if this is an id in the registry
        isModern = registry.icons.some(
          icon =>
            icon.id === iconIdentifier ||
            (icon.alternatives && icon.alternatives.includes(iconIdentifier))
        );
      }

      fileResults.references.push({
        identifier: iconIdentifier,
        isModern,
        context: match[0].trim(),
      });

      if (isModern) {
        fileResults.modern++;
        results.modern++;
      } else {
        fileResults.legacy++;
        results.legacy++;
      }

      results.total++;
    }
  });

  // Save results if file has icon references
  if (fileResults.references.length > 0) {
    results.byFile[file] = fileResults;
  }
});

// Display results
console.log(chalk.green(`\n📊 Icon Reference Analysis`));
console.log(chalk.green(`======================`));
console.log(`Total icon references found: ${results.total}`);
console.log(
  `- Modern references: ${results.modern} (${Math.round((results.modern / results.total) * 100)}%)`
);
console.log(
  `- Legacy references: ${results.legacy} (${Math.round((results.legacy / results.total) * 100)}%)`
);

// Show files with legacy references
if (results.legacy > 0) {
  console.log(chalk.yellow(`\n⚠️ Files with legacy icon references:`));
  Object.keys(results.byFile)
    .filter(file => results.byFile[file].legacy > 0)
    .forEach(file => {
      const fileData = results.byFile[file];
      console.log(chalk.yellow(`  ${file}: ${fileData.legacy} legacy references`));

      // Show the first few legacy references as examples
      fileData.references
        .filter(ref => !ref.isModern)
        .slice(0, 3)
        .forEach(ref => {
          console.log(chalk.gray(`    - ${ref.identifier}: ${ref.context}`));
        });
    });
} else {
  console.log(
    chalk.green(`\n✅ No legacy icon references found - all icons use the modern approach!`)
  );
}

console.log(chalk.blue(`\nRun the migration tool to update any remaining legacy references:`));
console.log(chalk.gray(`  node scripts/icons/migrate-icons.mjs [file-path]`));

// Export results as JSON if requested
if (process.argv.includes('--json')) {
  const outputPath = path.join(process.cwd(), 'reports', 'icon-references.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(chalk.blue(`\n📄 Detailed report saved to ${outputPath}`));
}

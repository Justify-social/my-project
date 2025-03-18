/**
 * Prepare for Heroicons Removal
 * 
 * This script analyzes the codebase to find direct imports of Heroicons and
 * logs them for future cleanup once migration is complete.
 * 
 * Usage:
 *   node scripts/prepare-remove-heroicons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Directories to scan
const SRC_DIR = path.join(__dirname, '../src');
const IGNORE_DIRS = [
  'node_modules',
  '.next',
];

// Patterns to search for
const PATTERNS = [
  '@heroicons/react',
  'import.*from.*@heroicons/react',
  'require\\(.*@heroicons/react',
  'from \'@heroicons/react',
  'from "@heroicons/react',
];

// Output file
const OUTPUT_FILE = path.join(__dirname, '../heroicons-usage-report.md');

// Helper functions
function scanDir(dir, results = []) {
  if (IGNORE_DIRS.some(ignoreDir => dir.includes(ignoreDir))) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanDir(fullPath, results);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check each pattern
      for (const pattern of PATTERNS) {
        const regex = new RegExp(pattern, 'g');
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = content.split('\n')[lineNumber - 1].trim();
          
          results.push({
            file: path.relative(process.cwd(), fullPath),
            line: lineNumber,
            content: line,
          });
        }
      }
    }
  }

  return results;
}

// Main script
console.log(chalk.blue('🔍 Scanning for Heroicons imports...'));

try {
  // Scan for Heroicons imports
  const results = scanDir(SRC_DIR);
  
  console.log(chalk.green(`✅ Found ${results.length} usage(s) of Heroicons`));
  
  // Output results to markdown file
  let output = `# Heroicons Usage Report\n\n`;
  output += `Generated on: ${new Date().toISOString()}\n\n`;
  output += `## Summary\n\n`;
  output += `- Total usages found: ${results.length}\n`;
  
  if (results.length > 0) {
    output += `\n## Direct Imports\n\n`;
    output += `| File | Line | Content |\n`;
    output += `| ---- | ---- | ------- |\n`;
    
    for (const result of results) {
      output += `| ${result.file} | ${result.line} | \`${result.content}\` |\n`;
    }
    
    output += `\n## Migration Plan\n\n`;
    output += `1. Replace direct imports with our Icon component\n`;
    output += `2. Use the migration helper: \`import { migrateHeroIcon } from '@/lib/icon-helpers';\`\n`;
    output += `3. After all imports are migrated, remove the Heroicons dependency\n`;
  } else {
    output += `\n## Next Steps\n\n`;
    output += `✅ No direct Heroicons imports found! You can safely remove the @heroicons/react dependency.\n`;
  }
  
  fs.writeFileSync(OUTPUT_FILE, output);
  
  console.log(chalk.green(`✅ Report saved to ${OUTPUT_FILE}`));
  console.log(chalk.blue('📋 Next steps:'));
  
  if (results.length > 0) {
    console.log(chalk.yellow('1. Review the report and replace direct imports with our Icon component'));
    console.log(chalk.yellow('2. Use the migration helper function for easy migration'));
    console.log(chalk.yellow('3. After all imports are migrated, remove the Heroicons dependency'));
  } else {
    console.log(chalk.green('✅ No direct Heroicons imports found! You can safely remove the @heroicons/react dependency.'));
  }
} catch (error) {
  console.error(chalk.red('Error scanning for Heroicons imports:'), error);
} 
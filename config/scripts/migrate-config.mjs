#!/usr/bin/env node

/**
 * Configuration Migration Script
 *
 * This script is designed to help migrate configuration files to the new config/ directory structure.
 * It's intended to be run after the config-organizer.mjs script.
 *
 * The script updates imports and references to configuration files in the codebase to point to
 * their new locations. This ensures that direct references (bypassing redirects) are updated.
 *
 * Usage:
 *   node scripts/migrate-config.mjs --dry-run  # Preview changes
 *   node scripts/migrate-config.mjs            # Actually make changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Process arguments
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Terminal colors for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

// Helper log functions
const log = msg => console.log(msg);
const info = msg => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`);
const success = msg => console.log(`${colors.green}✓ ${colors.reset}${msg}`);
const warning = msg => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`);
const error = msg => console.error(`${colors.red}✗ ${colors.reset}${msg}`);
const verbose = msg => VERBOSE && console.log(`  ${msg}`);

// Configuration path mappings
// Maps original paths to new paths
const CONFIG_PATH_MAPPINGS = [
  // ESLint
  {
    originalPath: '.eslintrc.js',
    newPath: 'config/eslint/eslintrc.js',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\.eslintrc.js[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\.eslintrc.js[\'"]',
      '[\'"]\\.\\.?\\/?\\.eslintrc.js[\'"]',
    ],
  },
  {
    originalPath: '.eslintrc.json',
    newPath: 'config/eslint/eslintrc.json',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\.eslintrc.json[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\.eslintrc.json[\'"]',
      '[\'"]\\.\\.?\\/?\\.eslintrc.json[\'"]',
    ],
  },
  {
    originalPath: 'eslint.config.mjs',
    newPath: 'config/eslint/eslint.config.mjs',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/eslint.config.mjs[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/eslint.config.mjs[\'"]',
      '[\'"]\\.\\.?\\/?\\/eslint.config.mjs[\'"]',
    ],
  },

  // TypeScript
  {
    originalPath: 'tsconfig.json',
    newPath: 'config/typescript/tsconfig.json',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/tsconfig.json[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/tsconfig.json[\'"]',
      '[\'"]\\.\\.?\\/?\\/tsconfig.json[\'"]',
      '"extends":\\s*[\'"]\\.\\.?\\/?\\/tsconfig.json[\'"]',
    ],
  },

  // Tailwind
  {
    originalPath: 'tailwind.config.js',
    newPath: 'config/tailwind/tailwind.config.js',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/tailwind.config.js[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/tailwind.config.js[\'"]',
      '[\'"]\\.\\.?\\/?\\/tailwind.config.js[\'"]',
    ],
  },
  {
    originalPath: 'tailwind.config.ts',
    newPath: 'config/tailwind/tailwind.config.ts',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/tailwind.config.ts[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/tailwind.config.ts[\'"]',
      '[\'"]\\.\\.?\\/?\\/tailwind.config.ts[\'"]',
    ],
  },
  {
    originalPath: 'postcss.config.mjs',
    newPath: 'config/tailwind/postcss.config.mjs',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/postcss.config.mjs[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/postcss.config.mjs[\'"]',
      '[\'"]\\.\\.?\\/?\\/postcss.config.mjs[\'"]',
    ],
  },

  // Jest
  {
    originalPath: 'jest.config.js',
    newPath: 'config/jest/jest.config.js',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/jest.config.js[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/jest.config.js[\'"]',
      '[\'"]\\.\\.?\\/?\\/jest.config.js[\'"]',
    ],
  },
  {
    originalPath: 'jest.setup.js',
    newPath: 'config/jest/jest.setup.js',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/jest.setup.js[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/jest.setup.js[\'"]',
      '[\'"]\\.\\.?\\/?\\/jest.setup.js[\'"]',
    ],
  },

  // Next.js
  {
    originalPath: 'next.config.js',
    newPath: 'config/nextjs/next.config.js',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/next.config.js[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/next.config.js[\'"]',
      '[\'"]\\.\\.?\\/?\\/next.config.js[\'"]',
    ],
  },

  // UI Components
  {
    originalPath: 'components.json',
    newPath: 'config/ui/components.json',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/components.json[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/components.json[\'"]',
      'readFileSync\\([\'"]\\.\\.?\\/?\\/components.json[\'"]\\)',
      '[\'"]\\.\\.?\\/?\\/components.json[\'"]',
    ],
  },
  {
    originalPath: 'feature-components.json',
    newPath: 'config/ui/feature-components.json',
    patterns: [
      'require\\([\'"]\\.\\.?\\/?\\/feature-components.json[\'"]\\)',
      'import\\s+(?:.*?)\\s+from\\s+[\'"]\\.\\.?\\/?\\/feature-components.json[\'"]',
      'readFileSync\\([\'"]\\.\\.?\\/?\\/feature-components.json[\'"]\\)',
      '[\'"]\\.\\.?\\/?\\/feature-components.json[\'"]',
    ],
  },
];

// File extensions to process
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json'];

// Find all source files to process
function findSourceFiles() {
  info('Finding source files to process...');

  let files = [];

  try {
    // Use a grep command to find files with potential references
    let patterns = CONFIG_PATH_MAPPINGS.flatMap(mapping => mapping.patterns);
    let patternArg = patterns.join('|');

    // Execute grep command to find files with potential references
    let command = `grep -r -l -E "${patternArg}" --include="*.{js,jsx,ts,tsx,mjs,cjs,json}" ${ROOT_DIR} | grep -v "node_modules" | grep -v ".git"`;

    if (VERBOSE) {
      verbose(`Running command: ${command}`);
    }

    let output = execSync(command, { encoding: 'utf8' });
    files = output.trim().split('\n').filter(Boolean);

    if (VERBOSE) {
      verbose(`Found ${files.length} files with potential references`);
    }
  } catch (err) {
    // If grep doesn't find matches, it returns non-zero exit code
    if (err.status !== 1) {
      error(`Error finding source files: ${err.message}`);
    } else {
      files = [];
    }
  }

  return files;
}

// Update references in a file
function updateReferencesInFile(filePath) {
  if (VERBOSE) {
    verbose(`Processing file: ${filePath}`);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    for (const mapping of CONFIG_PATH_MAPPINGS) {
      const { originalPath, newPath, patterns } = mapping;

      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'g');

        if (regex.test(newContent)) {
          const replacedContent = newContent.replace(regex, match => {
            hasChanges = true;
            // Maintain the same quotes and structure, just replace the path
            return match.replace(originalPath, newPath);
          });

          newContent = replacedContent;

          if (VERBOSE && hasChanges) {
            verbose(`  Found references to ${originalPath} in ${filePath}`);
          }
        }
      }
    }

    if (hasChanges) {
      if (DRY_RUN) {
        warning(`[DRY RUN] Would update references in: ${filePath}`);
      } else {
        fs.writeFileSync(filePath, newContent, 'utf8');
        success(`Updated references in: ${filePath}`);
      }
      return true;
    }
  } catch (err) {
    error(`Error processing file ${filePath}: ${err.message}`);
  }

  return false;
}

// Update package.json scripts
function updatePackageJsonScripts() {
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    warning('package.json not found, skipping script updates');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let hasChanges = false;

    if (packageJson.scripts) {
      // Update common script references
      for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts)) {
        let newCommand = scriptCommand;

        // Update Jest config references
        if (scriptCommand.includes('jest') && !scriptCommand.includes('config/jest')) {
          newCommand = scriptCommand.replace(
            /--config(\s+|=)(['"]?)([^'"]+)(['"]?)/g,
            (match, space, openQuote, configPath, closeQuote) => {
              if (configPath === 'jest.config.js') {
                hasChanges = true;
                return `--config${space}${openQuote}config/jest/jest.config.js${closeQuote}`;
              }
              return match;
            }
          );
        }

        // Update ESLint config references
        if (scriptCommand.includes('eslint') && !scriptCommand.includes('config/eslint')) {
          newCommand = scriptCommand.replace(
            /--config(\s+|=)(['"]?)([^'"]+)(['"]?)/g,
            (match, space, openQuote, configPath, closeQuote) => {
              if (configPath === '.eslintrc.js' || configPath === '.eslintrc.json') {
                hasChanges = true;
                return `--config${space}${openQuote}config/eslint/${configPath.replace('.', '')}${closeQuote}`;
              }
              return match;
            }
          );
        }

        if (newCommand !== scriptCommand) {
          packageJson.scripts[scriptName] = newCommand;
          if (VERBOSE) {
            verbose(`Updated script '${scriptName}': ${scriptCommand} -> ${newCommand}`);
          }
        }
      }
    }

    if (hasChanges) {
      if (DRY_RUN) {
        warning('[DRY RUN] Would update package.json scripts');
      } else {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
        success('Updated package.json scripts');
      }
      return true;
    } else {
      if (VERBOSE) {
        verbose('No script updates needed in package.json');
      }
    }
  } catch (err) {
    error(`Error updating package.json: ${err.message}`);
  }

  return false;
}

// Main function
async function main() {
  console.log(`\n${colors.bold}${colors.cyan}Configuration Migration Script${colors.reset}`);
  console.log(`${colors.cyan}===============================${colors.reset}\n`);

  if (DRY_RUN) {
    warning('Running in DRY RUN mode - no changes will be made');
  }

  // Check if config directory exists
  const configDir = path.join(ROOT_DIR, 'config');
  if (!fs.existsSync(configDir)) {
    error('Config directory not found. Please run config-organizer.mjs first.');
    process.exit(1);
  }

  // Find all source files with potential references
  const sourceFiles = findSourceFiles();

  // Update references in package.json scripts
  updatePackageJsonScripts();

  // Process each file
  console.log(`\n${colors.bold}Updating configuration references...${colors.reset}`);

  let updatedFiles = 0;

  for (const file of sourceFiles) {
    if (updateReferencesInFile(file)) {
      updatedFiles++;
    }
  }

  // Results
  console.log(`\n${colors.bold}${colors.green}Migration Results:${colors.reset}`);
  if (DRY_RUN) {
    console.log(`- Would update: ${updatedFiles} files`);
  } else {
    console.log(`- Updated: ${updatedFiles} files`);
  }

  if (DRY_RUN) {
    console.log(
      `\n${colors.bold}To actually perform these operations, run the script without --dry-run${colors.reset}`
    );
  } else {
    console.log(
      `\n${colors.bold}${colors.green}Configuration references have been successfully migrated!${colors.reset}`
    );
    console.log(`You can view the organized structure in the config/ directory.`);
  }
}

// Run the main function
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
});

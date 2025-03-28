/**
 * ESLint Single Rule Fixer
 * 
 * This script focuses on fixing a specific ESLint rule by temporarily disabling all other rules.
 * 
 * Usage:
 *   node fix-specific-rule.js --rule "rule-name" [--path "directory-path"] [--file "file-path"]
 *
 * Examples:
 *   node fix-specific-rule.js --rule "@typescript-eslint/no-explicit-any"
 *   node fix-specific-rule.js --rule "@typescript-eslint/no-explicit-any" --path "src/components"
 *   node fix-specific-rule.js --rule "@typescript-eslint/no-explicit-any" --file "src/components/Button.tsx"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let rule = '';
let targetPath = '';
let targetFile = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--rule' && i + 1 < args.length) {
    rule = args[i + 1];
    i++; // Skip the next argument which is the rule name
  } else if (args[i] === '--path' && i + 1 < args.length) {
    targetPath = args[i + 1];
    i++; // Skip the next argument which is the path
  } else if (args[i] === '--file' && i + 1 < args.length) {
    targetFile = args[i + 1];
    i++; // Skip the next argument which is the file
  }
}

if (!rule) {
  console.error('Error: You must specify a rule with --rule');
  process.exit(1);
}

// If both --path and --file are provided, prioritize --file
if (targetFile) {
  targetPath = '';
}

// Target path defaults to the entire project if not specified
if (!targetPath && !targetFile) {
  targetPath = '.';
}

// Create a temporary ESLint config that only enables the specified rule
const tempConfig = {
  root: true,
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [],
  rules: {
    [rule]: 'warn' // Set to warn level to allow fixing
  }
};

const configPath = path.join(process.cwd(), 'temp-eslint-config.mjs');

try {
  console.log(`Running ESLint with only rule '${rule}' enabled for fixing...`);
  
  // Write temporary config
  fs.writeFileSync(configPath, `export default ${JSON.stringify(tempConfig, null, 2)};`);
  
  let command;
  if (targetFile) {
    command = `npx eslint --config ${configPath} "${targetFile}" --fix`;
  } else {
    command = `npx eslint --config ${configPath} "${targetPath}/**/*.{js,ts,tsx}" --fix`;
  }
  
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error running ESLint:', error.message);
} finally {
  // Clean up temporary config file
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
    console.log('Temporary config file removed');
  }
} 
#!/usr/bin/env node

/**
 * Icon Update Validation Tool
 * 
 * This script validates that all legacy icon references have been updated
 * to the standardized icon names from the registry. It scans for any remaining
 * legacy icon name attributes.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Legacy icon names to check for
const legacyIconPatterns = [
  // Check for name attribute being used instead of iconId
  'name="fa[A-Z]',
  // Check for solid attribute being used
  'solid={',
  // Check for iconType attribute being used
  'iconType="'
];

// Validate updates
console.log(chalk.blue('Validating icon reference updates...'));

try {
  // Check for any remaining legacy icon references using standard grep
  const grepCommand = `find src/ -type f -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l "name=\\"fa\\|solid={\\|iconType=" || true`;
  console.log(chalk.gray(`Running: ${grepCommand}`));
  
  let remainingReferenceFiles;
  
  try {
    remainingReferenceFiles = execSync(grepCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch (error) {
    // If no matches found, grep exits with code 1, which is not an actual error in this case
    if (error.status === 1 && !error.stdout.trim()) {
      remainingReferenceFiles = [];
    } else {
      throw error;
    }
  }

  if (remainingReferenceFiles.length === 0) {
    console.log(chalk.green('✓ No legacy icon references found! The update was successful.'));
    console.log(chalk.green('✓ All icon references are using the standardized iconId attribute.'));
    process.exit(0);
  }

  console.log(chalk.red(`✗ Found ${remainingReferenceFiles.length} files still containing legacy icon references:`));
  
  // Analyze each file to show details about remaining references
  const remainingReferences = {};
  
  for (const file of remainingReferenceFiles) {
    console.log(chalk.yellow(`\nFile: ${file}`));
    
    const content = fs.readFileSync(file, 'utf8');
    remainingReferences[file] = {};
    
    // Check each legacy pattern
    for (const pattern of legacyIconPatterns) {
      const regex = new RegExp(pattern, 'g');
      const matches = content.match(regex);
      
      if (matches && matches.length > 0) {
        remainingReferences[file][pattern] = matches.length;
        console.log(`  ${chalk.cyan(pattern)} (${matches.length} references)`);
      }
    }
  }
  
  // Save validation report
  const reportPath = path.join(process.cwd(), 'reports', 'icon-validation-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  
  const report = {
    validationDate: new Date().toISOString(),
    success: false,
    remainingFiles: remainingReferenceFiles.length,
    fileDetails: remainingReferences
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(chalk.yellow(`\nValidation report saved to: ${reportPath}`));
  
  console.log(chalk.yellow('\nTo fix remaining references, run:'));
  console.log(chalk.yellow('  node scripts/icons/convert-name-to-iconid.js'));
  
  process.exit(1);
} catch (error) {
  console.error(chalk.red('Error validating icon updates:'), error);
  process.exit(1);
} 
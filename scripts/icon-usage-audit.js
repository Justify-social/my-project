#!/usr/bin/env node

/**
 * Icon Usage Audit Script
 * 
 * This script scans the codebase for direct FontAwesome imports and:
 * 1. Reports all violations
 * 2. Provides recommendations for fixing them
 * 3. Optionally fixes simple cases automatically (with user confirmation)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const SCAN_DIRS = ['src/components', 'src/pages', 'src/app'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'build', 'dist', '.next'];
const FONTAWESOME_IMPORTS = [
  '@fortawesome/react-fontawesome',
  '@fortawesome/fontawesome-svg-core',
  '@fortawesome/pro-solid-svg-icons',
  '@fortawesome/pro-light-svg-icons',
  '@fortawesome/pro-regular-svg-icons',
  '@fortawesome/pro-duotone-svg-icons',
  '@fortawesome/free-brands-svg-icons'
];

// Track findings
const findings = [];
let totalFiles = 0;
let scannedFiles = 0;

// Helper for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Check if running in CI mode
const isCI = process.argv.includes('--ci');

// Scan a single file
function scanFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return;
  }
  
  scannedFiles++;
  console.log(`${colors.cyan}Scanning:${colors.reset} ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const fileFindings = [];
  
  // Check for FontAwesome imports
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    for (const importName of FONTAWESOME_IMPORTS) {
      if (line.includes(`from '${importName}'`) || line.includes(`from "${importName}"`)) {
        // Check if it's a FontAwesomeIcon import
        if (importName === '@fortawesome/react-fontawesome' && line.includes('FontAwesomeIcon')) {
          fileFindings.push({
            lineNumber,
            line,
            importName,
            type: 'FontAwesomeIcon',
            replacement: 'import { Icon } from "@/components/ui/atoms/icons";'
          });
        } 
        // Check if it's an icon import (like faUser)
        else if (line.match(/import\s+\{\s*(\w+)\s*\}/)) {
          const iconMatch = line.match(/import\s+\{\s*(\w+(?:\s*,\s*\w+)*)\s*\}/);
          const icons = iconMatch ? iconMatch[1].split(',').map(i => i.trim()) : [];
          
          fileFindings.push({
            lineNumber,
            line,
            importName,
            type: 'IconImport',
            icons,
            replacement: '// Use the Icon component with name prop instead'
          });
        }
        // Other FontAwesome imports
        else {
          fileFindings.push({
            lineNumber,
            line,
            importName,
            type: 'Other',
            replacement: '// Remove this import and use the Icon component instead'
          });
        }
      }
    }
  }
  
  if (fileFindings.length > 0) {
    findings.push({
      filePath,
      findings: fileFindings
    });
  }
}

// Recursively scan directories
function scanDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    // Skip excluded directories
    if (entry.isDirectory() && !EXCLUDE_DIRS.includes(entry.name)) {
      scanDir(fullPath);
    } 
    // Process files
    else if (entry.isFile()) {
      totalFiles++;
      scanFile(fullPath);
    }
  }
}

// Fix a single file
function fixFile(filePath, findings) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Make a copy of lines that we'll modify
  const newLines = [...lines];
  
  // Sort findings by line number in descending order to avoid offsets when modifying lines
  findings.sort((a, b) => b.lineNumber - a.lineNumber);
  
  for (const finding of findings) {
    if (finding.type === 'FontAwesomeIcon') {
      // Replace FontAwesomeIcon import with Icon import
      newLines[finding.lineNumber - 1] = finding.replacement;
    } else {
      // Add a comment explaining the change for other types
      newLines[finding.lineNumber - 1] = finding.replacement + ' // ' + finding.line;
    }
  }
  
  const newContent = newLines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`${colors.green}Fixed:${colors.reset} ${filePath}`);
}

// Display findings and prompt for fixes
function processFindings() {
  console.log('\n' + '-'.repeat(80));
  console.log(`${colors.yellow}AUDIT RESULTS${colors.reset}`);
  console.log('-'.repeat(80));
  console.log(`Files scanned: ${scannedFiles}/${totalFiles}`);
  console.log(`Files with FontAwesome imports: ${findings.length}`);
  console.log('-'.repeat(80) + '\n');
  
  if (findings.length === 0) {
    console.log(`${colors.green}No direct FontAwesome imports found. All good!${colors.reset}`);
    if (!isCI) {
      rl.close();
    }
    
    // Generate report for CI
    if (isCI) {
      generateCIReport();
    }
    
    return;
  }
  
  // Print findings
  for (let i = 0; i < findings.length; i++) {
    const { filePath, findings: fileFindings } = findings[i];
    console.log(`${colors.red}#${i+1}${colors.reset} ${filePath} (${fileFindings.length} findings)`);
    
    for (const finding of fileFindings) {
      console.log(`  Line ${finding.lineNumber}: ${finding.line.trim()}`);
      console.log(`  ${colors.green}→ Replace with:${colors.reset} ${finding.replacement}`);
      
      if (finding.type === 'IconImport' && finding.icons.length > 0) {
        console.log(`  ${colors.blue}→ Alternative:${colors.reset} Use <Icon name="${finding.icons[0].replace('fa', '')}" /> in JSX`);
      }
      
      console.log('');
    }
    
    console.log('-'.repeat(80));
  }
  
  // In CI mode, generate report and exit
  if (isCI) {
    generateCIReport();
    process.exit(findings.length > 0 ? 1 : 0);
    return;
  }
  
  // Interactive mode - prompt for action
  rl.question(`\nWould you like to apply automatic fixes? (y/N) `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      for (const { filePath, findings: fileFindings } of findings) {
        // Only auto-fix FontAwesomeIcon imports for now
        if (fileFindings.some(f => f.type === 'FontAwesomeIcon')) {
          fixFile(filePath, fileFindings.filter(f => f.type === 'FontAwesomeIcon'));
        }
      }
      console.log(`\n${colors.green}✓ Automatic fixes applied.${colors.reset}`);
      console.log(`\n${colors.yellow}Note:${colors.reset} Only FontAwesomeIcon imports were automatically fixed.`);
      console.log(`${colors.yellow}Manual attention is needed for other FontAwesome imports.${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}No changes made.${colors.reset}`);
    }
    
    // Suggest installing the ESLint plugin
    console.log('\n' + '-'.repeat(80));
    console.log(`${colors.blue}NEXT STEPS${colors.reset}`);
    console.log('-'.repeat(80));
    console.log('1. Install the ESLint plugin to prevent future violations:');
    console.log('   npm install --save-dev eslint-plugin-icon-standards');
    console.log('\n2. Add it to your ESLint configuration:');
    console.log('   // .eslintrc.js');
    console.log('   plugins: ["icon-standards"],');
    console.log('   extends: ["plugin:icon-standards/recommended"]');
    console.log('\n3. Set up a pre-commit hook to enforce the rule.');
    console.log('-'.repeat(80));
    
    rl.close();
  });
}

// Generate report for CI environments
function generateCIReport() {
  const report = {
    scannedFiles,
    totalFiles,
    violations: findings.map(({ filePath, findings }) => ({
      file: filePath,
      instances: findings.map(finding => ({
        line: finding.lineNumber,
        code: finding.line,
        importName: finding.importName,
        type: finding.type,
        recommendation: finding.replacement
      }))
    }))
  };
  
  fs.writeFileSync('icon-usage-report.json', JSON.stringify(report, null, 2));
  console.log(`${colors.cyan}Generated report:${colors.reset} icon-usage-report.json`);
}

// Main function
function main() {
  console.log(`${colors.yellow}ICON USAGE AUDIT${colors.reset}`);
  console.log(`Scanning for direct FontAwesome imports...`);
  
  // Scan all configured directories
  for (const dir of SCAN_DIRS) {
    if (fs.existsSync(dir)) {
      scanDir(dir);
    }
  }
  
  // Process and display findings
  processFindings();
}

// Run the script
main(); 
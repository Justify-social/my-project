#!/usr/bin/env node

/**
 * Script Documentation Generator
 * 
 * This script scans the scripts directory and generates a markdown document
 * listing all available scripts with their descriptions and usage information.
 * 
 * Usage:
 *   node scripts/cleanup/generate-scripts-docs.js [--output=<filename>]
 * 
 * Options:
 *   --output=<filename>   Output file (default: scripts-documentation.md)
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Color formatting for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Command line options
const args = process.argv.slice(2);
let outputFile = 'scripts-documentation.md';

// Parse command line arguments
args.forEach(arg => {
  if (arg.startsWith('--output=')) {
    outputFile = arg.split('=')[1];
  }
});

// Script categories
const scriptCategories = {
  'icons': 'Icon-related scripts',
  'cleanup': 'Codebase cleanup utilities',
  'testing': 'Testing scripts',
  'documentation': 'Documentation generators',
  'build': 'Build process utilities',
  'validation': 'Code validation tools',
  'database': 'Database utilities',
  'campaign': 'Campaign management tools',
  'utilities': 'General utilities'
};

// Read script metadata
function readScriptInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract description from JSDoc comment
    let description = 'No description';
    const firstCommentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (firstCommentMatch) {
      const comment = firstCommentMatch[1];
      const descriptionMatch = comment.match(/\*\s*(.*?)[\r\n]/);
      if (descriptionMatch) {
        description = descriptionMatch[1].trim();
      }
    }
    
    // Extract usage examples from comments
    let usage = '';
    const usageMatch = content.match(/Usage:([\s\S]*?)(\*\/|\*\s*@|\*\s*Options:)/);
    if (usageMatch) {
      usage = usageMatch[1]
        .replace(/\*/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .join('\n');
    }
    
    // Extract options from comments
    let options = '';
    const optionsMatch = content.match(/Options:([\s\S]*?)(\*\/|\*\s*@)/);
    if (optionsMatch) {
      options = optionsMatch[1]
        .replace(/\*/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .join('\n');
    }
    
    // Determine category based on path
    const relPath = path.relative(process.cwd(), filePath);
    const parts = relPath.split(path.sep);
    let category = 'other';
    
    if (parts.includes('scripts')) {
      const index = parts.indexOf('scripts');
      if (index + 1 < parts.length) {
        category = parts[index + 1];
      }
    }
    
    return {
      path: relPath,
      name: path.basename(filePath),
      description,
      usage,
      options,
      category,
      isExecutable: (fs.statSync(filePath).mode & 0o100) !== 0, // Check if executable
      lastModified: new Date(fs.statSync(filePath).mtime).toISOString().split('T')[0]
    };
  } catch (error) {
    console.error(`${colors.red}Error reading ${filePath}:${colors.reset}`, error.message);
    return null;
  }
}

// Find all scripts in the codebase
function findScripts() {
  console.log(`${colors.bold}Scanning for scripts in the codebase...${colors.reset}`);
  
  let scriptFiles = [];
  try {
    // Find all JS files in the scripts directory
    const scriptFilesRaw = execSync('find scripts -type f -name "*.js"', { encoding: 'utf8' });
    scriptFiles = scriptFilesRaw.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding script files:', error.message);
    return [];
  }
  
  console.log(`${colors.green}Found ${scriptFiles.length} JavaScript files in scripts directory${colors.reset}`);
  
  // Process each file to extract metadata
  const scripts = scriptFiles
    .map(filePath => readScriptInfo(filePath))
    .filter(Boolean);
  
  // Group scripts by category
  const scriptsByCategory = {};
  for (const script of scripts) {
    if (!scriptsByCategory[script.category]) {
      scriptsByCategory[script.category] = [];
    }
    scriptsByCategory[script.category].push(script);
  }
  
  // Sort scripts by name within each category
  for (const category in scriptsByCategory) {
    scriptsByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return { scripts, scriptsByCategory };
}

// Generate markdown documentation
function generateMarkdown(scripts, scriptsByCategory) {
  console.log(`${colors.bold}Generating markdown documentation...${colors.reset}`);
  
  let markdown = `# Scripts Documentation
  
This document provides a comprehensive list of all scripts available in the codebase, organized by category.

*Generated on: ${new Date().toISOString().split('T')[0]}*

## Table of Contents

`;

  // Generate table of contents
  Object.keys(scriptsByCategory).sort().forEach(category => {
    const scripts = scriptsByCategory[category];
    const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
    const categoryDescription = scriptCategories[category] || `${displayCategory} scripts`;
    
    markdown += `- [${displayCategory} Scripts (${scripts.length})](#${category}-scripts)\n`;
  });
  
  markdown += '\n## Script Categories\n\n';
  
  // Generate documentation for each category
  Object.keys(scriptsByCategory).sort().forEach(category => {
    const scripts = scriptsByCategory[category];
    const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
    const categoryDescription = scriptCategories[category] || `${displayCategory} scripts`;
    
    markdown += `### ${displayCategory} Scripts\n\n`;
    markdown += `${categoryDescription}\n\n`;
    
    scripts.forEach(script => {
      markdown += `#### \`${script.name}\`\n\n`;
      markdown += `**Path**: \`${script.path}\`\n\n`;
      markdown += `**Description**: ${script.description}\n\n`;
      
      if (script.usage) {
        markdown += `**Usage**:\n\`\`\`\n${script.usage}\n\`\`\`\n\n`;
      }
      
      if (script.options) {
        markdown += `**Options**:\n\`\`\`\n${script.options}\n\`\`\`\n\n`;
      }
      
      if (script.isExecutable) {
        markdown += `**Executable**: Yes\n\n`;
      }
      
      markdown += `**Last Modified**: ${script.lastModified}\n\n`;
      
      markdown += '---\n\n';
    });
  });
  
  return markdown;
}

// Write markdown to file
function writeMarkdown(markdown, outputFile) {
  console.log(`${colors.bold}Writing documentation to ${outputFile}...${colors.reset}`);
  
  try {
    fs.writeFileSync(outputFile, markdown);
    console.log(`${colors.green}Documentation successfully written to ${outputFile}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error writing documentation:${colors.reset}`, error.message);
  }
}

// Main function
function main() {
  console.log(`${colors.bold}Script Documentation Generator${colors.reset}`);
  console.log(`${colors.cyan}Output file: ${outputFile}${colors.reset}\n`);
  
  // Find scripts
  const { scripts, scriptsByCategory } = findScripts();
  
  // Generate markdown
  const markdown = generateMarkdown(scripts, scriptsByCategory);
  
  // Write markdown to file
  writeMarkdown(markdown, outputFile);
  
  // Print summary
  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`${colors.cyan}Total scripts: ${scripts.length}${colors.reset}`);
  console.log(`${colors.cyan}Categories: ${Object.keys(scriptsByCategory).length}${colors.reset}`);
  
  Object.keys(scriptsByCategory).sort().forEach(category => {
    console.log(`- ${colors.green}${category}:${colors.reset} ${scriptsByCategory[category].length} scripts`);
  });
  
  console.log(`\n${colors.bold}Documentation generated:${colors.reset} ${outputFile}`);
}

// Run the script
main(); 
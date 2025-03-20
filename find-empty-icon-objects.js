#!/usr/bin/env node

/**
 * Empty Icon Object Finder
 * 
 * This script searches the codebase for instances where empty object literals
 * might be passed to Icon or SafeFontAwesomeIcon components.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const PATTERNS = [
  /icon\s*=\s*\{\}/g,
  /icon\s*=\s*\{\s*\}/g,
  /<Icon\s+name\s*=\s*\{\}/g,
  /<Icon\s+[^>]*?name\s*=\s*\{\s*\}/g,
  /<SafeFontAwesomeIcon\s+icon\s*=\s*\{\}/g,
  /<SafeFontAwesomeIcon\s+[^>]*?icon\s*=\s*\{\s*\}/g,
  /<FontAwesomeIcon\s+icon\s*=\s*\{\}/g,
  /<FontAwesomeIcon\s+[^>]*?icon\s*=\s*\{\s*\}/g,
  /icon\s*=\s*\{[^}]*?undefined[^}]*?\}/g,
  /name\s*=\s*\{[^}]*?undefined[^}]*?\}/g,
];

// Results storage
const results = {
  totalFiles: 0,
  matchedFiles: 0,
  matches: []
};

/**
 * Find all files with a specific extension in a directory (recursive)
 */
function findFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, ext, fileList);
    } else if (stat.isFile() && (file.endsWith(ext) || file.endsWith(`${ext}x`))) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Analyze a file for potential empty object patterns
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileMatches = [];
  
  let componentScope = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track component scope to provide better context
    if (line.includes('function') || line.includes('const') || line.includes('class')) {
      if (line.includes('=') && line.includes('=>')) {
        const match = line.match(/(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=/);
        if (match) {
          componentScope = match[1];
        }
      } else if (line.includes('function')) {
        const match = line.match(/function\s+([A-Za-z0-9_]+)/);
        if (match) {
          componentScope = match[1];
        }
      }
    }
    
    // Check each pattern on this line
    for (const pattern of PATTERNS) {
      pattern.lastIndex = 0; // Reset regex
      
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const lineNum = i + 1;
        const matchText = match[0];
        const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 4)).join('\n');
        
        fileMatches.push({
          lineNum,
          matchText,
          context,
          component: componentScope
        });
      }
    }
  }
  
  return fileMatches;
}

/**
 * Main execution function
 */
async function main() {
  console.log("=== Empty Icon Object Finder ===");
  console.log("Searching for empty objects passed to Icon components...\n");
  
  // Find all JS/TS files
  const jsFiles = findFiles(SRC_DIR, '.js');
  const tsFiles = findFiles(SRC_DIR, '.ts');
  const files = [...jsFiles, ...tsFiles];
  
  results.totalFiles = files.length;
  
  // Analyze each file
  for (const file of files) {
    const fileMatches = analyzeFile(file);
    
    if (fileMatches.length > 0) {
      results.matchedFiles++;
      const relativePath = path.relative(process.cwd(), file);
      
      results.matches.push({
        file: relativePath,
        matches: fileMatches
      });
    }
  }
  
  // Output results
  console.log(`Scanned ${results.totalFiles} files`);
  console.log(`Found potential issues in ${results.matchedFiles} files\n`);
  
  if (results.matchedFiles === 0) {
    console.log("✅ No empty object icon props found!");
  } else {
    console.log("⚠️ Potential empty object issues found:\n");
    
    results.matches.forEach(({ file, matches }) => {
      console.log(`File: ${file}`);
      
      matches.forEach(({ lineNum, matchText, context, component }) => {
        console.log(`  Line ${lineNum}: ${matchText.trim()}`);
        if (component) {
          console.log(`  Component: ${component}`);
        }
        console.log(`  Context:\n${context.split('\n').map(l => `    ${l}`).join('\n')}`);
        console.log();
      });
    });
    
    console.log("Recommended fix: Replace empty objects with proper icon props or add validation.");
  }
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
}); 
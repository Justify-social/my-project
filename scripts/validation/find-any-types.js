#!/usr/bin/env node

/**
 * Find 'any' Type Usage
 * 
 * Finds TypeScript 'any' type usage in the codebase.
 * 
 * Usage:
 *   node scripts/validation/find-any-types.js [path]
 * 
 * Options:
 *   path      Specify a path to scan (defaults to src/)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const targetPath = args[0] || 'src/';

console.log(`
🔍 Find 'any' Type Usage (using grep)
===================================
Target Path: ${targetPath}
`);

try {
  // Use grep to find 'any' type usage
  const command = `grep -r --include="*.ts" --include="*.tsx" -n "any" ${targetPath}`;
  console.log(`Running: ${command}`);
  
  const output = execSync(command, { encoding: 'utf8' });
  
  // Process the output to filter out false positives
  const lines = output.split('\n').filter(Boolean);
  
  // Group by file
  const fileMap = {};
  
  lines.forEach(line => {
    const match = line.match(/^([^:]+):(\d+):(.*)/);
    if (match) {
      const [, filePath, lineNumber, content] = match;
      
      // Skip false positives (comments, strings, etc.)
      if (
        content.includes('// any') || 
        content.includes('/* any') || 
        content.includes('* any') ||
        content.includes('"any"') || 
        content.includes("'any'") ||
        content.includes('`any`') ||
        !content.match(/\bany\b/)
      ) {
        return;
      }
      
      if (!fileMap[filePath]) {
        fileMap[filePath] = [];
      }
      
      fileMap[filePath].push({
        lineNumber: parseInt(lineNumber),
        content: content.trim()
      });
    }
  });
  
  // Generate a report
  const reportPath = path.join(process.cwd(), 'any-type-usage-report.md');
  
  const files = Object.keys(fileMap);
  const totalOccurrences = Object.values(fileMap).reduce((sum, occurrences) => sum + occurrences.length, 0);
  
  let reportContent = `# 'any' Type Usage Report
Generated on: ${new Date().toISOString()}

## Summary
- Files with \`any\` type usage: ${files.length}
- Total occurrences: ${totalOccurrences}

## Files with 'any' type usage

`;

  files.forEach(file => {
    const occurrences = fileMap[file];
    reportContent += `### ${file} (${occurrences.length} occurrences)\n\n`;
    
    occurrences.forEach(({ lineNumber, content }) => {
      reportContent += `- Line ${lineNumber}: \`${content}\`\n`;
    });
    
    reportContent += '\n';
  });
  
  reportContent += `## Recommendations

1. Replace \`any\` with more specific types:
   - Use \`unknown\` for values of unknown type
   - Use \`Record<string, unknown>\` for objects with unknown properties
   - Use proper interfaces or type aliases for structured data
   - Use union types for values that can be of multiple types

2. Consider using the interactive fix script:
   \`\`\`
   node scripts/validation/fix-any-types.js --fix --file=path/to/file.ts
   \`\`\`
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nFound ${files.length} files with 'any' type usage (${totalOccurrences} occurrences)`);
  console.log(`Report saved to: ${reportPath}`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} 
#!/usr/bin/env node

/**
 * Find <img> Tag Usage
 * 
 * Finds <img> tags that should be replaced with Next.js Image component.
 * 
 * Usage:
 *   node scripts/validation/find-img-tags.js [path]
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
🖼️ Find <img> Tag Usage (using grep)
==================================
Target Path: ${targetPath}
`);

try {
  // Use grep to find <img> tag usage
  const command = `grep -r --include="*.tsx" --include="*.jsx" -n "<img" ${targetPath}`;
  console.log(`Running: ${command}`);
  
  const output = execSync(command, { encoding: 'utf8' });
  
  // Process the output
  const lines = output.split('\n').filter(Boolean);
  
  // Group by file
  const fileMap = {};
  
  lines.forEach(line => {
    const match = line.match(/^([^:]+):(\d+):(.*)/);
    if (match) {
      const [, filePath, lineNumber, content] = match;
      
      // Skip false positives (comments, strings, etc.)
      if (
        content.includes('// <img') || 
        content.includes('/* <img') || 
        content.includes('* <img')
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
  const reportPath = path.join(process.cwd(), 'img-tag-usage-report.md');
  
  const files = Object.keys(fileMap);
  const totalOccurrences = Object.values(fileMap).reduce((sum, occurrences) => sum + occurrences.length, 0);
  
  let reportContent = `# <img> Tag Usage Report
Generated on: ${new Date().toISOString()}

## Summary
- Files with \`<img>\` tag usage: ${files.length}
- Total occurrences: ${totalOccurrences}

## Files with <img> tag usage

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

1. Replace \`<img>\` tags with Next.js \`<Image>\` components:
   - Import the Image component: \`import Image from "next/image";\`
   - Replace \`<img>\` with \`<Image>\`
   - Ensure width and height props are provided (required by Next.js)
   - Use proper loading and quality attributes for optimization

2. Consider using the interactive fix script:
   \`\`\`
   node scripts/validation/fix-img-tags.js --fix --file=path/to/file.tsx
   \`\`\`

3. For images that don't need optimization (like SVGs or icons), consider using:
   \`\`\`jsx
   <Image
     src="/path/to/image.jpg"
     alt="Description"
     width={500}
     height={300}
     unoptimized
   />
   \`\`\`
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nFound ${files.length} files with <img> tag usage (${totalOccurrences} occurrences)`);
  console.log(`Report saved to: ${reportPath}`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} 
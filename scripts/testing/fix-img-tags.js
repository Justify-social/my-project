#!/usr/bin/env node

/**
 * Fix <img> Tags Script
 * 
 * This script helps identify and replace HTML <img> tags with Next.js <Image> components:
 * 1. Scans files for <img> tag usage
 * 2. Analyzes the context to suggest appropriate Image component replacements
 * 3. Generates a report with suggested fixes
 * 
 * Usage:
 *   node scripts/validation/fix-img-tags.js [--path=<path>] [--fix] [--file=<file>]
 * 
 * Options:
 *   --path      Specify a path to scan (defaults to src/)
 *   --fix       Apply suggested fixes (interactive mode)
 *   --file      Focus on a specific file
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';
import readline from 'readline';

// Parse command line arguments
const args = process.argv.slice(2);
const fixMode = args.includes('--fix');
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : 'src/';
const fileArg = args.find(arg => arg.startsWith('--file='));
const targetFile = fileArg ? fileArg.split('=')[1] : null;

console.log(`
🖼️ Fix <img> Tags
================
Mode: ${fixMode ? 'Interactive Fix' : 'Analysis Only'}
Target Path: ${targetPath}
${targetFile ? `Target File: ${targetFile}` : ''}
`);

// Find files with <img> tags
function findImgTags() {
  console.log('\n🔍 Finding files with <img> tags...');
  
  try {
    const filePattern = targetFile ? targetFile : targetPath;
    const command = `npx eslint ${filePattern} --rule "@next/next/no-img-element:error" -f json`;
    const output = execSync(command, { encoding: 'utf8' });
    
    const results = JSON.parse(output);
    const filesWithImgTags = results
      .filter(result => result.errorCount > 0)
      .map(result => ({
        filePath: result.filePath,
        count: result.errorCount,
        occurrences: result.messages.map(msg => ({
          line: msg.line,
          column: msg.column,
          message: msg.message
        }))
      }));
    
    console.log(`\nFound ${filesWithImgTags.length} files with <img> tags:`);
    filesWithImgTags.forEach(file => {
      console.log(`- ${file.filePath} (${file.count} occurrences)`);
    });
    
    return filesWithImgTags;
  } catch (error) {
    console.error('Error finding <img> tags:', error.message);
    return [];
  }
}

// Read a file and get the context around a specific line
function getContextAroundLine(filePath, lineNumber, contextLines = 5) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    
    const startLine = Math.max(0, lineNumber - contextLines - 1);
    const endLine = Math.min(lines.length - 1, lineNumber + contextLines - 1);
    
    const contextContent = lines.slice(startLine, endLine + 1);
    const lineWithImg = lines[lineNumber - 1];
    
    return {
      context: contextContent,
      startLineNumber: startLine + 1,
      lineWithImg,
      fullContent: lines
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return { context: [], startLineNumber: 1, lineWithImg: '', fullContent: [] };
  }
}

// Extract attributes from an <img> tag
function extractImgAttributes(imgTag) {
  const attributes = {};
  
  // Extract src
  const srcMatch = imgTag.match(/src=["']([^"']*)["']/);
  if (srcMatch) attributes.src = srcMatch[1];
  
  // Extract alt
  const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
  if (altMatch) attributes.alt = altMatch[1];
  
  // Extract width
  const widthMatch = imgTag.match(/width=["']?([^"'\s]*)["']?/);
  if (widthMatch) attributes.width = widthMatch[1];
  
  // Extract height
  const heightMatch = imgTag.match(/height=["']?([^"'\s]*)["']?/);
  if (heightMatch) attributes.height = heightMatch[1];
  
  // Extract className
  const classNameMatch = imgTag.match(/className=["']([^"']*)["']/);
  if (classNameMatch) attributes.className = classNameMatch[1];
  
  // Extract style
  const styleMatch = imgTag.match(/style=\{([^}]*)\}/);
  if (styleMatch) attributes.style = styleMatch[1];
  
  // Extract other attributes
  const otherAttrs = imgTag.match(/([a-zA-Z0-9_-]+)=["']?([^"'\s]*)["']?/g);
  if (otherAttrs) {
    otherAttrs.forEach(attr => {
      const [name, value] = attr.split('=');
      if (!['src', 'alt', 'width', 'height', 'className', 'style'].includes(name)) {
        attributes[name] = value.replace(/["']/g, '');
      }
    });
  }
  
  return attributes;
}

// Generate Next.js Image component from attributes
function generateImageComponent(attributes) {
  const { src, alt = '""', width, height, className, style, ...otherAttrs } = attributes;
  
  let imageComponent = `<Image\n  src="${src}"\n  alt=${alt}`;
  
  // Add width and height (required for Next.js Image)
  if (width) imageComponent += `\n  width={${isNaN(width) ? width : parseInt(width)}}`;
  if (height) imageComponent += `\n  height={${isNaN(height) ? height : parseInt(height)}}`;
  
  // If width or height is missing, add placeholder values and a comment
  if (!width || !height) {
    if (!width) imageComponent += `\n  width={500} {/* TODO: Replace with actual width */}`;
    if (!height) imageComponent += `\n  height={300} {/* TODO: Replace with actual height */}`;
  }
  
  // Add className if present
  if (className) imageComponent += `\n  className="${className}"`;
  
  // Add style if present
  if (style) imageComponent += `\n  style={${style}}`;
  
  // Add other attributes
  Object.entries(otherAttrs).forEach(([name, value]) => {
    imageComponent += `\n  ${name}="${value}"`;
  });
  
  imageComponent += '\n/>';
  
  return imageComponent;
}

// Apply a fix to a file
function applyFix(filePath, lineNumber, replacement) {
  try {
    const { fullContent } = getContextAroundLine(filePath, lineNumber);
    const line = fullContent[lineNumber - 1];
    
    // Check if the import statement for Image exists
    const hasImageImport = fullContent.some(line => 
      line.includes('import Image from "next/image"') || 
      line.includes("import Image from 'next/image'") ||
      line.includes('import { Image }')
    );
    
    // If not, add the import statement at the top of the file
    if (!hasImageImport) {
      // Find the first import statement
      const firstImportIndex = fullContent.findIndex(line => line.trim().startsWith('import'));
      
      if (firstImportIndex !== -1) {
        // Add after the last consecutive import statement
        let lastImportIndex = firstImportIndex;
        while (lastImportIndex + 1 < fullContent.length && 
               fullContent[lastImportIndex + 1].trim().startsWith('import')) {
          lastImportIndex++;
        }
        
        fullContent.splice(lastImportIndex + 1, 0, 'import Image from "next/image";');
      } else {
        // No imports found, add at the top
        fullContent.unshift('import Image from "next/image";');
      }
    }
    
    // Replace the <img> tag with the Image component
    fullContent[lineNumber - 1] = line.replace(/<img[^>]*>/, replacement);
    
    fs.writeFileSync(filePath, fullContent.join('\n'));
    console.log(`✅ Applied fix to ${filePath}:${lineNumber}`);
    return true;
  } catch (error) {
    console.error(`Error applying fix to ${filePath}:`, error.message);
    return false;
  }
}

// Interactive CLI for fixing <img> tags
async function interactiveFix(filesWithImgTags) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  try {
    for (const file of filesWithImgTags) {
      console.log(`\n📝 Processing ${file.filePath}...`);
      
      for (const occurrence of file.occurrences) {
        const { context, startLineNumber, lineWithImg } = getContextAroundLine(
          file.filePath, 
          occurrence.line
        );
        
        console.log('\nContext:');
        context.forEach((line, index) => {
          const lineNumber = startLineNumber + index;
          const marker = lineNumber === occurrence.line ? '>' : ' ';
          console.log(`${marker} ${lineNumber}: ${line}`);
        });
        
        // Extract <img> tag
        const imgTagMatch = lineWithImg.match(/<img[^>]*>/);
        if (!imgTagMatch) {
          console.log('❌ Could not find <img> tag in this line. Skipping...');
          continue;
        }
        
        const imgTag = imgTagMatch[0];
        const attributes = extractImgAttributes(imgTag);
        const suggestedReplacement = generateImageComponent(attributes);
        
        console.log('\nSuggested replacement:');
        console.log(suggestedReplacement);
        
        const answer = await askQuestion('\nApply this replacement? (y/n/edit): ');
        
        if (answer.toLowerCase() === 'y') {
          applyFix(file.filePath, occurrence.line, suggestedReplacement);
        } else if (answer.toLowerCase() === 'edit') {
          const customReplacement = await askQuestion('Enter your custom replacement: ');
          applyFix(file.filePath, occurrence.line, customReplacement);
        } else {
          console.log('Skipping this occurrence...');
        }
      }
    }
  } finally {
    rl.close();
  }
}

// Generate a report with suggested fixes
function generateReport(filesWithImgTags) {
  console.log('\n📊 Generating <img> tag fix report...');
  
  const reportPath = path.join(process.cwd(), 'img-tag-fix-report.md');
  
  let reportContent = `# <img> Tag Fix Report
Generated on: ${new Date().toISOString()}

## Summary
- Files with \`<img>\` tags: ${filesWithImgTags.length}
- Total occurrences: ${filesWithImgTags.reduce((sum, file) => sum + file.count, 0)}

## Files with suggested fixes

`;

  for (const file of filesWithImgTags) {
    reportContent += `### ${file.filePath} (${file.count} occurrences)\n\n`;
    
    for (const occurrence of file.occurrences) {
      const { context, startLineNumber, lineWithImg } = getContextAroundLine(
        file.filePath, 
        occurrence.line
      );
      
      reportContent += `#### Line ${occurrence.line}\n\n`;
      reportContent += "```jsx\n";
      
      context.forEach((line, index) => {
        const lineNumber = startLineNumber + index;
        const marker = lineNumber === occurrence.line ? '>' : ' ';
        reportContent += `${marker} ${line}\n`;
      });
      
      reportContent += "```\n\n";
      
      // Extract <img> tag
      const imgTagMatch = lineWithImg.match(/<img[^>]*>/);
      if (imgTagMatch) {
        const imgTag = imgTagMatch[0];
        const attributes = extractImgAttributes(imgTag);
        const suggestedReplacement = generateImageComponent(attributes);
        
        reportContent += "Suggested replacement:\n\n```jsx\n";
        reportContent += suggestedReplacement;
        reportContent += "\n```\n\n";
        
        // Add note about import
        reportContent += "**Note:** Make sure to add the following import if it doesn't exist:\n\n";
        reportContent += "```jsx\nimport Image from \"next/image\";\n```\n\n";
      } else {
        reportContent += "Could not find <img> tag in this line.\n\n";
      }
    }
  }
  
  reportContent += `## How to use this report
  
1. Review each occurrence and the suggested replacement
2. Make sure to add the Image import if it doesn't exist
3. Replace the \`<img>\` tag with the Next.js \`<Image>\` component
4. Ensure width and height are properly set (required by Next.js)
5. Test the component to verify the image displays correctly

You can also run this script with the \`--fix\` flag for interactive fixing:

\`\`\`
node scripts/validation/fix-img-tags.js --fix
\`\`\`
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Report saved to: ${reportPath}`);
}

// Main function
async function main() {
  try {
    const filesWithImgTags = findImgTags();
    
    if (filesWithImgTags.length === 0) {
      console.log('No files with <img> tags found.');
      return;
    }
    
    if (fixMode) {
      await interactiveFix(filesWithImgTags);
    } else {
      generateReport(filesWithImgTags);
    }
    
    console.log('\n✅ Script completed successfully');
  } catch (error) {
    console.error('\n❌ Error running script:', error);
    process.exit(1);
  }
}

main(); 
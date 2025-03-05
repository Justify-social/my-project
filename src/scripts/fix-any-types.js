#!/usr/bin/env node

/**
 * Fix 'any' Type Usage Script
 * 
 * This script helps identify and fix 'any' type usage in TypeScript files:
 * 1. Scans files for 'any' type usage
 * 2. Analyzes the context to suggest appropriate type replacements
 * 3. Generates a report with suggested fixes
 * 
 * Usage:
 *   node src/scripts/fix-any-types.js [--path=<path>] [--fix] [--file=<file>]
 * 
 * Options:
 *   --path      Specify a path to scan (defaults to src/)
 *   --fix       Apply suggested fixes (interactive mode)
 *   --file      Focus on a specific file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const fixMode = args.includes('--fix');
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : 'src/';
const fileArg = args.find(arg => arg.startsWith('--file='));
const targetFile = fileArg ? fileArg.split('=')[1] : null;

console.log(`
🔍 Fix 'any' Type Usage
======================
Mode: ${fixMode ? 'Interactive Fix' : 'Analysis Only'}
Target Path: ${targetPath}
${targetFile ? `Target File: ${targetFile}` : ''}
`);

// Common TypeScript types that might replace 'any'
const commonTypes = [
  'unknown',
  'Record<string, unknown>',
  'Record<string, string>',
  'Record<string, number>',
  'Record<string, boolean>',
  'Record<string, string | number | boolean | null>',
  '{ [key: string]: unknown }',
  'string[]',
  'number[]',
  'boolean[]',
  '(string | number | boolean | null)[]',
  'Error',
  'void',
  'React.ReactNode',
  'React.ReactElement',
  'React.MouseEvent',
  'React.ChangeEvent<HTMLInputElement>',
  'React.FormEvent<HTMLFormElement>'
];

// Find files with 'any' type usage
function findAnyTypeUsage() {
  console.log('\n🔍 Finding files with \'any\' type usage...');
  
  try {
    const filePattern = targetFile ? targetFile : targetPath;
    const command = `npx eslint ${filePattern} --rule "@typescript-eslint/no-explicit-any:error" -f json`;
    const output = execSync(command, { encoding: 'utf8' });
    
    const results = JSON.parse(output);
    const filesWithAnyType = results
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
    
    console.log(`\nFound ${filesWithAnyType.length} files with 'any' type usage:`);
    filesWithAnyType.forEach(file => {
      console.log(`- ${file.filePath} (${file.count} occurrences)`);
    });
    
    return filesWithAnyType;
  } catch (error) {
    console.error('Error finding \'any\' type usage:', error.message);
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
    const lineWithAny = lines[lineNumber - 1];
    
    return {
      context: contextContent,
      startLineNumber: startLine + 1,
      lineWithAny,
      fullContent: lines
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return { context: [], startLineNumber: 1, lineWithAny: '', fullContent: [] };
  }
}

// Analyze the context to suggest type replacements
function suggestTypeReplacement(context, lineWithAny) {
  // Check for common patterns
  if (lineWithAny.includes('function') || lineWithAny.includes('=>')) {
    if (lineWithAny.includes('Event')) {
      return ['React.MouseEvent', 'React.ChangeEvent<HTMLInputElement>', 'React.FormEvent<HTMLFormElement>'];
    }
    return ['unknown', 'void', 'never'];
  }
  
  if (lineWithAny.includes('[]') || context.some(line => line.includes('Array'))) {
    return ['unknown[]', 'string[]', 'number[]', '(string | number | boolean | null)[]'];
  }
  
  if (lineWithAny.includes('Record<') || lineWithAny.includes('{ [key:')) {
    return ['Record<string, unknown>', '{ [key: string]: unknown }'];
  }
  
  if (context.some(line => line.includes('error') || line.includes('catch'))) {
    return ['Error', 'unknown'];
  }
  
  if (context.some(line => line.includes('React') || line.includes('JSX'))) {
    return ['React.ReactNode', 'React.ReactElement', 'JSX.Element'];
  }
  
  // Default suggestions
  return ['unknown', 'Record<string, unknown>', 'string | number | boolean | null'];
}

// Apply a fix to a file
function applyFix(filePath, lineNumber, columnNumber, replacement) {
  try {
    const { fullContent } = getContextAroundLine(filePath, lineNumber);
    const line = fullContent[lineNumber - 1];
    
    // Replace 'any' with the suggested type
    // This is a simple replacement and might need manual verification
    const newLine = line.substring(0, columnNumber - 1) + 
                   replacement + 
                   line.substring(columnNumber + 2); // +2 to skip 'any'
    
    fullContent[lineNumber - 1] = newLine;
    
    fs.writeFileSync(filePath, fullContent.join('\n'));
    console.log(`✅ Applied fix to ${filePath}:${lineNumber}`);
    return true;
  } catch (error) {
    console.error(`Error applying fix to ${filePath}:`, error.message);
    return false;
  }
}

// Interactive CLI for fixing 'any' types
async function interactiveFix(filesWithAnyType) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));
  
  try {
    for (const file of filesWithAnyType) {
      console.log(`\n📝 Processing ${file.filePath}...`);
      
      for (const occurrence of file.occurrences) {
        const { context, startLineNumber, lineWithAny } = getContextAroundLine(
          file.filePath, 
          occurrence.line
        );
        
        console.log('\nContext:');
        context.forEach((line, index) => {
          const lineNumber = startLineNumber + index;
          const marker = lineNumber === occurrence.line ? '>' : ' ';
          console.log(`${marker} ${lineNumber}: ${line}`);
        });
        
        const suggestedTypes = suggestTypeReplacement(context, lineWithAny);
        
        console.log('\nSuggested replacements:');
        suggestedTypes.forEach((type, index) => {
          console.log(`${index + 1}. ${type}`);
        });
        console.log(`${suggestedTypes.length + 1}. Custom type`);
        console.log(`${suggestedTypes.length + 2}. Skip this occurrence`);
        
        const answer = await askQuestion('\nSelect a replacement (number) or type a custom type: ');
        
        if (answer === `${suggestedTypes.length + 2}`) {
          console.log('Skipping this occurrence...');
          continue;
        }
        
        let selectedType;
        if (answer <= suggestedTypes.length) {
          selectedType = suggestedTypes[parseInt(answer) - 1];
        } else if (answer === `${suggestedTypes.length + 1}`) {
          selectedType = await askQuestion('Enter custom type: ');
        } else {
          selectedType = answer;
        }
        
        if (selectedType) {
          applyFix(file.filePath, occurrence.line, occurrence.column, selectedType);
        }
      }
    }
  } finally {
    rl.close();
  }
}

// Generate a report with suggested fixes
function generateReport(filesWithAnyType) {
  console.log('\n📊 Generating \'any\' type fix report...');
  
  const reportPath = path.join(process.cwd(), 'any-type-fix-report.md');
  
  let reportContent = `# 'any' Type Fix Report
Generated on: ${new Date().toISOString()}

## Summary
- Files with \`any\` type usage: ${filesWithAnyType.length}
- Total occurrences: ${filesWithAnyType.reduce((sum, file) => sum + file.count, 0)}

## Files with suggested fixes

`;

  for (const file of filesWithAnyType) {
    reportContent += `### ${file.filePath} (${file.count} occurrences)\n\n`;
    
    for (const occurrence of file.occurrences) {
      const { context, startLineNumber, lineWithAny } = getContextAroundLine(
        file.filePath, 
        occurrence.line
      );
      
      reportContent += `#### Line ${occurrence.line}, Column ${occurrence.column}\n\n`;
      reportContent += "```typescript\n";
      
      context.forEach((line, index) => {
        const lineNumber = startLineNumber + index;
        const marker = lineNumber === occurrence.line ? '>' : ' ';
        reportContent += `${marker} ${line}\n`;
      });
      
      reportContent += "```\n\n";
      
      const suggestedTypes = suggestTypeReplacement(context, lineWithAny);
      
      reportContent += "Suggested replacements:\n";
      suggestedTypes.forEach(type => {
        reportContent += `- \`${type}\`\n`;
      });
      
      reportContent += "\n";
    }
  }
  
  reportContent += `## How to use this report
  
1. Review each occurrence and the suggested replacements
2. Choose the most appropriate type based on the context
3. Replace \`any\` with the selected type
4. Run TypeScript compiler to verify the fix works
5. Repeat for all occurrences

You can also run this script with the \`--fix\` flag for interactive fixing:

\`\`\`
node src/scripts/fix-any-types.js --fix
\`\`\`
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Report saved to: ${reportPath}`);
}

// Main function
async function main() {
  try {
    const filesWithAnyType = findAnyTypeUsage();
    
    if (filesWithAnyType.length === 0) {
      console.log('No files with \'any\' type usage found.');
      return;
    }
    
    if (fixMode) {
      await interactiveFix(filesWithAnyType);
    } else {
      generateReport(filesWithAnyType);
    }
    
    console.log('\n✅ Script completed successfully');
  } catch (error) {
    console.error('\n❌ Error running script:', error);
    process.exit(1);
  }
}

main(); 
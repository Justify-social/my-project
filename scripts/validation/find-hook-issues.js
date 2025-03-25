#!/usr/bin/env node

/**
 * Find React Hook Dependency Issues
 * 
 * Finds React Hook dependency issues in the codebase.
 * 
 * Usage:
 *   node scripts/validation/find-hook-issues.js [path]
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
🪝 Find React Hook Dependency Issues (using grep)
=============================================
Target Path: ${targetPath}
`);

// Common React Hooks
const hooks = [
  'useEffect',
  'useCallback',
  'useMemo',
  'useLayoutEffect',
  'useImperativeHandle'
];

try {
  // Use grep to find React Hook usage with dependency arrays
  const hookPatterns = hooks.map(hook => `${hook}`).join('\\|');
  const command = `grep -r --include="*.tsx" --include="*.jsx" --include="*.ts" -n "${hookPatterns}" ${targetPath}`;
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
        content.includes('// use') || 
        content.includes('/* use') || 
        content.includes('* use')
      ) {
        return;
      }
      
      // Check if this is a hook with dependency array
      const hasDependencyArray = content.includes('[]') || content.includes('[') && content.includes(']');
      
      if (hasDependencyArray) {
        if (!fileMap[filePath]) {
          fileMap[filePath] = [];
        }
        
        fileMap[filePath].push({
          lineNumber: parseInt(lineNumber),
          content: content.trim(),
          hook: hooks.find(hook => content.includes(hook))
        });
      }
    }
  });
  
  // Read files to analyze hook dependencies
  Object.entries(fileMap).forEach(([filePath, occurrences]) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      occurrences.forEach(occurrence => {
        // Get the hook and its surrounding context
        const startLine = Math.max(0, occurrence.lineNumber - 10);
        const endLine = Math.min(lines.length - 1, occurrence.lineNumber + 10);
        const context = lines.slice(startLine, endLine + 1).join('\n');
        
        // Extract the dependency array
        const dependencyArrayMatch = context.match(/\[(.*?)\]/s);
        if (dependencyArrayMatch) {
          const dependencyArray = dependencyArrayMatch[1].trim();
          occurrence.dependencies = dependencyArray === '' ? [] : dependencyArray.split(',').map(dep => dep.trim());
          
          // Extract the hook body to find potential missing dependencies
          const hookBodyMatch = context.match(/\{([\s\S]*?)\}/);
          if (hookBodyMatch) {
            const hookBody = hookBodyMatch[1];
            
            // Find variables used in the hook body
            const variableUsageRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
            const usedVariables = new Set();
            let match;
            
            while ((match = variableUsageRegex.exec(hookBody)) !== null) {
              const variable = match[1];
              // Skip common keywords and built-ins
              if (!['if', 'else', 'return', 'const', 'let', 'var', 'function', 'async', 'await', 
                   'true', 'false', 'null', 'undefined', 'this', 'new', 'try', 'catch', 'finally',
                   'console', 'window', 'document', 'Math', 'Object', 'Array', 'String', 'Number',
                   'Boolean', 'Error', 'JSON', 'Promise'].includes(variable)) {
                usedVariables.add(variable);
              }
            }
            
            // Compare with dependencies
            const missingDependencies = Array.from(usedVariables).filter(variable => {
              return !occurrence.dependencies.includes(variable) && 
                     !occurrence.dependencies.some(dep => dep.includes(variable));
            });
            
            if (missingDependencies.length > 0) {
              occurrence.missingDependencies = missingDependencies;
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error.message);
    }
  });
  
  // Filter to only include occurrences with missing dependencies
  Object.keys(fileMap).forEach(filePath => {
    fileMap[filePath] = fileMap[filePath].filter(occurrence => occurrence.missingDependencies && occurrence.missingDependencies.length > 0);
    if (fileMap[filePath].length === 0) {
      delete fileMap[filePath];
    }
  });
  
  // Generate a report
  const reportPath = path.join(process.cwd(), 'hook-dependency-issues-report.md');
  
  const files = Object.keys(fileMap);
  const totalOccurrences = Object.values(fileMap).reduce((sum, occurrences) => sum + occurrences.length, 0);
  
  let reportContent = `# React Hook Dependency Issues Report
Generated on: ${new Date().toISOString()}

## Summary
- Files with potential hook dependency issues: ${files.length}
- Total occurrences: ${totalOccurrences}

## Files with hook dependency issues

`;

  files.forEach(file => {
    const occurrences = fileMap[file];
    reportContent += `### ${file} (${occurrences.length} occurrences)\n\n`;
    
    occurrences.forEach(({ lineNumber, content, hook, dependencies, missingDependencies }) => {
      reportContent += `#### Line ${lineNumber}: \`${hook}\`\n\n`;
      reportContent += "```jsx\n";
      reportContent += content + "\n";
      reportContent += "```\n\n";
      
      reportContent += "Current dependencies:\n";
      reportContent += `\`[${dependencies.join(', ')}]\`\n\n`;
      
      reportContent += "Potentially missing dependencies:\n";
      reportContent += `\`[${missingDependencies.join(', ')}]\`\n\n`;
    });
    
    reportContent += '\n';
  });
  
  reportContent += `## Recommendations

1. Add missing dependencies to the dependency array:
   \`\`\`jsx
   useEffect(() => {
     // Effect using someVariable
   }, [someVariable]); // Add someVariable to the dependency array
   \`\`\`

2. If you intentionally want to exclude a dependency:
   \`\`\`jsx
   // eslint-disable-next-line react-hooks/exhaustive-deps
   useEffect(() => {
     // Effect using someVariable that should not trigger re-runs
   }, []); // Empty dependency array with explicit comment
   \`\`\`

3. For functions, consider using useCallback:
   \`\`\`jsx
   const handleClick = useCallback(() => {
     // Function using someVariable
   }, [someVariable]); // Include dependencies here
   \`\`\`

4. For computed values, consider using useMemo:
   \`\`\`jsx
   const computedValue = useMemo(() => {
     // Computation using someVariable
     return result;
   }, [someVariable]); // Include dependencies here
   \`\`\`
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nFound ${files.length} files with potential hook dependency issues (${totalOccurrences} occurrences)`);
  console.log(`Report saved to: ${reportPath}`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} 
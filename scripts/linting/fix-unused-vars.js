/**
 * ESLint Unused Variables Fixer
 * 
 * This script automatically adds underscore prefixes to unused variables to satisfy ESLint rules.
 * 
 * Usage:
 *   node fix-unused-vars.js [--path "directory-path"] [--file "file-path"]
 *
 * Examples:
 *   node fix-unused-vars.js
 *   node fix-unused-vars.js --path "src/components"
 *   node fix-unused-vars.js --file "src/components/Button.tsx"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let targetPath = '';
let targetFile = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--path' && i + 1 < args.length) {
    targetPath = args[i + 1];
    i++; // Skip the next argument which is the path
  } else if (args[i] === '--file' && i + 1 < args.length) {
    targetFile = args[i + 1];
    i++; // Skip the next argument which is the file
  }
}

// If both --path and --file are provided, prioritize --file
if (targetFile) {
  targetPath = '';
}

// Target path defaults to the entire project if not specified
if (!targetPath && !targetFile) {
  targetPath = 'src';
}

// Get unused variables using ESLint
function findUnusedVariables() {
  try {
    console.log(`Looking for unused variables${targetFile ? ' in ' + targetFile : ' in ' + targetPath}...`);
    
    // Command to run ESLint and find unused variables
    let command;
    if (targetFile) {
      command = `npx eslint "${targetFile}" -f json --rule "@typescript-eslint/no-unused-vars: error"`;
    } else {
      command = `npx eslint "${targetPath}/**/*.{js,ts,tsx}" -f json --rule "@typescript-eslint/no-unused-vars: error"`;
    }
    
    const result = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return JSON.parse(result);
  } catch (error) {
    // If ESLint returned errors, extract and parse the JSON output
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (jsonError) {
        console.error('Error parsing ESLint output:', jsonError);
        console.error('ESLint output was:', error.stdout);
        return [];
      }
    }
    
    console.error('Error running ESLint:', error.message);
    return [];
  }
}

// Check if all files have been processed
function allFilesProcessed(fileList, processedFiles) {
  return fileList.length === processedFiles.length;
}

// Process each file with unused variables
function processUnusedVariables() {
  const results = findUnusedVariables();
  
  if (!Array.isArray(results) || results.length === 0) {
    console.log('No unused variables found.');
    return;
  }
  
  // Filter for files with actual unused variable errors
  const filesWithIssues = results.filter(file => 
    file.messages && file.messages.some(msg => 
      msg.ruleId === '@typescript-eslint/no-unused-vars'
    )
  );
  
  if (filesWithIssues.length === 0) {
    console.log('No unused variables found.');
    return;
  }
  
  console.log(`Found ${filesWithIssues.length} files with unused variables.`);
  
  const processedFiles = [];
  
  // Process each file
  for (const file of filesWithIssues) {
    try {
      console.log(`Processing ${file.filePath}`);
      
      const content = fs.readFileSync(file.filePath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      
      // Group messages by line for more efficient processing
      const messagesByLine = {};
      
      file.messages.forEach(msg => {
        if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
          if (!messagesByLine[msg.line]) {
            messagesByLine[msg.line] = [];
          }
          messagesByLine[msg.line].push(msg);
        }
      });
      
      // Process each line with unused variables
      for (const [lineNum, messages] of Object.entries(messagesByLine)) {
        const lineIndex = parseInt(lineNum) - 1;
        const line = lines[lineIndex];
        
        // Process each message for the current line
        for (const msg of messages) {
          const variableName = msg.message.match(/'([^']+)'/)?.[1];
          
          if (variableName) {
            // Find exact position of variable in the line
            // This approach is more precise than simple regex replace
            
            // Handle different variable types (parameter, declared variable, import)
            if (line.includes(`function ${variableName}`) || line.includes(`${variableName}(`)) {
              // Function or function parameter - can't easily replace
              continue;
            }
            
            let newLine = line;
            
            // Replace only the variable name, not other occurrences of the same text
            if (line.includes(`const ${variableName}`) || line.includes(`let ${variableName}`) || line.includes(`var ${variableName}`)) {
              // Variable declaration
              newLine = line.replace(new RegExp(`(const|let|var)\\s+${variableName}\\b`), `$1 _${variableName}`);
            } else if (line.includes(`import { ${variableName}`) || line.match(new RegExp(`import.*?\\{[^}]*?${variableName}\\b[^}]*?\\}`))) {
              // Named import
              newLine = line.replace(new RegExp(`\\b${variableName}\\b(?!(:|,))`), `_${variableName}`);
            } else if (line.match(new RegExp(`\\b${variableName}\\s*:`)) || line.match(new RegExp(`\\(.*?${variableName}\\b.*?\\)`))) {
              // Parameter or destructured object
              newLine = line.replace(new RegExp(`\\b${variableName}\\b(?=\\s*[,:]|\\))`), `_${variableName}`);
            }
            
            if (newLine !== line) {
              lines[lineIndex] = newLine;
              modified = true;
              console.log(`  Renamed '${variableName}' to '_${variableName}' on line ${lineNum}`);
            }
          }
        }
      }
      
      if (modified) {
        fs.writeFileSync(file.filePath, lines.join('\n'));
        console.log(`  Updated ${file.filePath}`);
      }
      
      processedFiles.push(file.filePath);
      
      // Check if all files have been processed
      if (allFilesProcessed(filesWithIssues, processedFiles)) {
        console.log('\nComplete! Re-run ESLint to verify the changes.');
      }
    } catch (error) {
      console.error(`Error processing ${file.filePath}:`, error);
    }
  }
}

// Execute the script
processUnusedVariables(); 
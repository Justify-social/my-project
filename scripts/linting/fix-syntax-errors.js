// Script to fix the "if (if condition)" syntax error pattern in the codebase
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with the pattern
const findFiles = () => {
  try {
    // Use grep to find all occurrences of the pattern
    const grepCommand = `grep -r "if (if" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" ./src ./scripts`;
    const result = execSync(grepCommand, { encoding: 'utf-8' });
    
    // Parse the grep output to get file paths and line numbers
    const matches = result.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [filePath, ...rest] = line.split(':');
        return { filePath, line: rest.join(':').trim() };
      });
    
    return matches;
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
};

// Process a file to fix the syntax error
const processFile = (filePath) => {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace the pattern: if (if condition) expr -> if (condition && expr)
    const fixedContent = content.replace(/if\s*\(\s*if\s*\(\s*([^)]+)\s*\)\s*([^)]+)\s*\)/g, 
      (match, condition, expr) => {
        return `if (${condition} && ${expr})`;
      });
    
    // Write the fixed content back to the file
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf-8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ No changes in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Process the specified file if provided, otherwise process all files with the pattern
const main = () => {
  const specificFile = process.argv[2];
  
  if (specificFile && fs.existsSync(specificFile)) {
    processFile(specificFile);
    return;
  }
  
  console.log('Finding files with the syntax error...');
  const matches = findFiles();
  
  if (matches.length === 0) {
    console.log('No files found with the syntax error pattern.');
    return;
  }
  
  console.log(`Found ${matches.length} occurrences. Starting to fix...`);
  
  // Process unique files
  const uniqueFiles = [...new Set(matches.map(m => m.filePath))];
  let fixedCount = 0;
  
  for (const file of uniqueFiles) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\nSummary: Fixed ${fixedCount} out of ${uniqueFiles.length} files.`);
};

main(); 
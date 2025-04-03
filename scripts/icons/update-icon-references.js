#!/usr/bin/env node

/**
 * Icon Reference Update Tool
 * 
 * This script updates legacy icon references to use the standardized icon names
 * from the icon registry. It can be run in dry-run mode to preview changes or
 * in apply mode to make the changes.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Load the icon mapping file
const iconMappingPath = path.join(process.cwd(), 'public', 'static', 'icon-name-mapping.json');
const iconMapping = JSON.parse(fs.readFileSync(iconMappingPath, 'utf8')).mappings;

// Load the report file if it exists
const reportPath = path.join(process.cwd(), 'reports', 'icon-references-report.json');
let report = null;

if (fs.existsSync(reportPath)) {
  report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  console.log(chalk.blue(`Loaded report with ${report.summary.totalReferences} references in ${report.summary.totalFiles} files`));
} else {
  console.log(chalk.yellow('No report file found. Run scan-icon-references.js first for a detailed analysis.'));
}

// Function to update a single file
function updateFile(filePath, dryRun = true) {
  console.log(chalk.blue(`Processing ${filePath}${dryRun ? ' (DRY RUN)' : ''}`));
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  let replacements = 0;
  
  // Create a backup if not in dry run mode
  if (!dryRun) {
    const backupPath = `${filePath}.bak`;
    fs.writeFileSync(backupPath, content);
  }
  
  // Replace each icon reference
  Object.keys(iconMapping).forEach(oldName => {
    const newName = iconMapping[oldName];
    
    // Use regex with word boundaries to only replace whole words
    const regex = new RegExp(`\\b${oldName}\\b`, 'g');
    const matchCount = (content.match(regex) || []).length;
    
    if (matchCount > 0) {
      content = content.replace(regex, newName);
      updated = true;
      replacements += matchCount;
      console.log(`  ${chalk.cyan(oldName)} → ${chalk.green(newName)} (${matchCount} replacements)`);
    }
  });
  
  if (updated && !dryRun) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`  Updated file with ${replacements} replacements`));
    return replacements;
  } else if (updated) {
    console.log(chalk.yellow(`  Would make ${replacements} replacements (dry run)`));
    return 0; // No actual replacements in dry run
  } else {
    console.log(chalk.gray('  No replacements made'));
    return 0;
  }
}

// Main function to update files
async function updateIconReferences(options = {}) {
  const { 
    dryRun = true,
    specificFiles = null,
    batchSize = 10
  } = options;
  
  console.log(chalk.blue(`Starting icon reference update ${dryRun ? '(DRY RUN)' : ''}`));
  
  let filesToProcess = [];
  
  if (specificFiles && Array.isArray(specificFiles) && specificFiles.length > 0) {
    // Use provided file list
    filesToProcess = specificFiles;
    console.log(chalk.blue(`Processing ${filesToProcess.length} specified files`));
  } else if (report && report.fileReferences) {
    // Use files from the report
    filesToProcess = Object.keys(report.fileReferences);
    console.log(chalk.blue(`Processing ${filesToProcess.length} files from report`));
  } else {
    // Scan for files on the fly
    console.log(chalk.blue('No files specified, scanning for icon references...'));
    const iconPattern = Object.keys(iconMapping).map(key => `\\b${key}\\b`).join('|');
    
    try {
      // Use standard grep instead of ripgrep
      const grepCommand = `find src/ -type f -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l "${iconPattern}"`;
      console.log(chalk.gray(`Running: ${grepCommand}`));
      
      filesToProcess = execSync(grepCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
      console.log(chalk.blue(`Found ${filesToProcess.length} files with icon references`));
    } catch (error) {
      console.error(chalk.red('Error scanning for files:'), error);
      
      // If no matches found, grep exits with code 1, which is not an actual error in this case
      if (error.status === 1 && error.stdout === '') {
        console.log(chalk.green('No files found with legacy icon references!'));
        filesToProcess = [];
      } else {
        process.exit(1);
      }
    }
  }
  
  if (filesToProcess.length === 0) {
    console.log(chalk.green('No files to process!'));
    return { totalReplacements: 0, processedFiles: 0 };
  }
  
  // Process files
  let totalReplacements = 0;
  let processedFiles = 0;
  
  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < filesToProcess.length; i += batchSize) {
    const batch = filesToProcess.slice(i, i + batchSize);
    
    console.log(chalk.blue(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(filesToProcess.length/batchSize)}`));
    
    for (const filePath of batch) {
      if (!filePath || !fs.existsSync(filePath)) continue;
      
      try {
        const replacements = updateFile(filePath, dryRun);
        totalReplacements += replacements;
        processedFiles++;
      } catch (error) {
        console.error(chalk.red(`Error processing ${filePath}:`), error);
      }
    }
    
    // Short delay between batches
    if (i + batchSize < filesToProcess.length) {
      console.log(chalk.gray('Pausing between batches...'));
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(chalk.green(`✓ Completed processing ${processedFiles} files`));
  console.log(chalk.green(`${dryRun ? 'Would make' : 'Made'} ${totalReplacements} icon reference replacements`));
  
  return { totalReplacements, processedFiles };
}

// Command line interface
const args = process.argv.slice(2);
const options = {
  dryRun: !args.includes('--apply'),
  specificFiles: null,
  batchSize: 10
};

// Check for specific files
const fileIndex = args.indexOf('--files');
if (fileIndex !== -1 && args.length > fileIndex + 1) {
  options.specificFiles = args[fileIndex + 1].split(',');
}

// Check for batch size
const batchIndex = args.indexOf('--batch');
if (batchIndex !== -1 && args.length > batchIndex + 1) {
  options.batchSize = parseInt(args[batchIndex + 1], 10) || 10;
}

// Run the update
console.log(chalk.blue('Icon Reference Update Tool'));
console.log(chalk.gray('Options:'));
console.log(chalk.gray(`- Dry Run: ${options.dryRun ? 'Yes' : 'No'}`));
console.log(chalk.gray(`- Batch Size: ${options.batchSize}`));
console.log(chalk.gray(`- Specific Files: ${options.specificFiles ? options.specificFiles.join(', ') : 'None (processing all)'}`));

updateIconReferences(options)
  .then(results => {
    if (options.dryRun) {
      console.log(chalk.yellow('\nThis was a DRY RUN. To apply changes, run with --apply flag:'));
      console.log(chalk.yellow('  node scripts/icons/update-icon-references.js --apply'));
    }
  })
  .catch(error => {
    console.error(chalk.red('Error running update:'), error);
    process.exit(1);
  }); 
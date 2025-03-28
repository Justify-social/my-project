/**
 * Update Unification Progress
 * 
 * This script updates the progress tracking in docs/unification-final-phase.md
 * 
 * Usage:
 * node scripts/unification-final/update-progress.js <task> <percentage>
 * 
 * Example:
 * node scripts/unification-final/update-progress.js "Documentation Centralization" 50
 */

import fs from 'fs';
import path from 'path';

// Define utility functions
const log = (message) => console.log(`\x1b[36m[Progress Update]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Get arguments
const taskName = process.argv[2];
const percentage = parseInt(process.argv[3], 10);

// Validate arguments
if (!taskName || isNaN(percentage) || percentage < 0 || percentage > 100) {
  error('Invalid arguments.');
  console.log('Usage: node scripts/unification-final/update-progress.js <task> <percentage>');
  console.log('Example: node scripts/unification-final/update-progress.js "Documentation Centralization" 50');
  process.exit(1);
}

// Main function
async function main() {
  const progressFile = path.join(process.cwd(), 'docs', 'unification-final-phase.md');
  
  // Check if file exists
  if (!fs.existsSync(progressFile)) {
    error(`Progress file not found: ${progressFile}`);
    process.exit(1);
  }
  
  // Read file
  let content = fs.readFileSync(progressFile, 'utf8');
  
  // Update the task status
  const status = percentage === 100 ? '✅ Completed' : '🔄 In Progress';
  
  // Replace the line with the task
  const regex = new RegExp(`^\\|(.*?)\\| ${taskName} \\|(.*?)\\|(.*?)\\|(.*?)\\|$`, 'gm');
  
  if (regex.test(content)) {
    content = content.replace(regex, `|$1| ${taskName} |$2| ${status} | ${percentage}% |`);
    
    // Write back to file
    fs.writeFileSync(progressFile, content, 'utf8');
    
    success(`Updated progress for "${taskName}" to ${percentage}%`);
    
    // If this completes a task, check if all tasks are complete
    if (percentage === 100) {
      const allTasksRegex = /^\|(.*?)\|(.*?)\| 🔄 In Progress \|(.*?)\|$/gm;
      if (!allTasksRegex.test(content)) {
        // All tasks completed, update overall status
        content = content.replace(
          '🔄 **In Progress (Phase 8)**',
          '✅ **Complete (Phase 8)**'
        );
        fs.writeFileSync(progressFile, content, 'utf8');
        success('All tasks completed! Updated overall status.');
      }
    }
  } else {
    warning(`Task "${taskName}" not found in progress file.`);
    
    // List available tasks
    log('Available tasks:');
    const taskRegex = /^\|(.*?)\| (.*?) \|(.*?)\|(.*?)\|$/gm;
    let match;
    while ((match = taskRegex.exec(content)) !== null) {
      console.log(`- ${match[2].trim()}`);
    }
  }
}

main().catch(err => {
  error(`Progress update failed: ${err.message}`);
  process.exit(1);
}); 
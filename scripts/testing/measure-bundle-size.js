/**
 * Bundle Size Measurement Script for Font Awesome Migration
 * 
 * This script analyzes the bundle size impact of Font Awesome imports 
 * before and after optimization.
 */

import fs from 'fs';
import path from 'path';
import exec from 'child_process';
import chalk from 'chalk';

// Configuration
const OUTPUT_DIR = path.join(process.cwd(), '.next', 'analyze');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(chalk.blue('📏 Measuring Font Awesome bundle size impact...'));
console.log(chalk.yellow('⚙️ Building production bundle with analyzer...'));

// Use environment variable to trigger bundle analysis
const buildCommand = 'ANALYZE=true npm run build';

exec(buildCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(chalk.red('❌ Build failed:'), error);
    console.error(stderr);
    return;
  }
  
  console.log(chalk.green('✅ Build completed successfully!'));
  
  // Check if stats files were generated
  const clientStatsFile = path.join(OUTPUT_DIR, 'client-stats.json');
  const serverStatsFile = path.join(OUTPUT_DIR, 'server-stats.json');
  
  if (fs.existsSync(clientStatsFile) && fs.existsSync(serverStatsFile)) {
    console.log(chalk.green('📊 Bundle size analysis completed'));
    
    try {
      // Load the stats files
      const clientStats = JSON.parse(fs.readFileSync(clientStatsFile, 'utf8'));
      const serverStats = JSON.parse(fs.readFileSync(serverStatsFile, 'utf8'));
      
      // Extract Font Awesome related modules
      const faModules = {
        client: extractFontAwesomeModules(clientStats),
        server: extractFontAwesomeModules(serverStats)
      };
      
      // Display the results
      console.log(chalk.blue('\n=== Font Awesome Bundle Impact ==='));
      console.log(chalk.yellow('\nClient-side Font Awesome modules:'));
      displayModules(faModules.client);
      
      console.log(chalk.yellow('\nServer-side Font Awesome modules:'));
      displayModules(faModules.server);
      
      // Calculate totals
      const clientTotal = faModules.client.reduce((sum, mod) => sum + mod.size, 0);
      const serverTotal = faModules.server.reduce((sum, mod) => sum + mod.size, 0);
      
      console.log(chalk.blue('\n=== Total Font Awesome Impact ==='));
      console.log(`Client-side total: ${formatBytes(clientTotal)}`);
      console.log(`Server-side total: ${formatBytes(serverTotal)}`);
      console.log(`Combined total: ${formatBytes(clientTotal + serverTotal)}`);
      
      // Open the HTML reports
      const clientReportFile = path.join(OUTPUT_DIR, 'client.html');
      const serverReportFile = path.join(OUTPUT_DIR, 'server.html');
      
      if (fs.existsSync(clientReportFile)) {
        const openCommand = process.platform === 'darwin' 
          ? `open ${clientReportFile}` 
          : (process.platform === 'win32' 
            ? `start ${clientReportFile}` 
            : `xdg-open ${clientReportFile}`);
        
        exec(openCommand);
      }
    } catch (err) {
      console.error(chalk.red('Error processing stats files:'), err);
    }
  } else {
    console.log(chalk.yellow('Stats files not found. Make sure the bundle analyzer is configured correctly.'));
  }
});

/**
 * Extract Font Awesome related modules from the stats
 */
function extractFontAwesomeModules(stats) {
  const modules = [];
  
  // Traverse the stats to find Font Awesome modules
  function traverse(node) {
    if (Array.isArray(node.modules)) {
      node.modules.forEach(module => {
        if (module.name && module.name.includes('@fortawesome')) {
          modules.push({
            name: module.name,
            size: module.size
          });
        }
        
        if (module.modules) {
          traverse(module);
        }
      });
    } else if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }
  
  traverse(stats);
  
  // Sort by size in descending order
  return modules.sort((a, b) => b.size - a.size);
}

/**
 * Display module information in a formatted way
 */
function displayModules(modules) {
  modules.forEach(mod => {
    console.log(`${formatBytes(mod.size).padEnd(10)} - ${mod.name}`);
  });
  
  console.log(`\nTotal modules: ${modules.length}`);
}

/**
 * Format bytes to a human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} 
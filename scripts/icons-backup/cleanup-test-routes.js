#!/usr/bin/env node

/**
 * Test Routes Cleanup Script
 * 
 * This script handles the cleanup of test routes and remaining items in the app directory.
 */

import fs from 'fs';
import path from 'path';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const DEBUG_TOOLS_DIR = path.join(APP_DIR, '(admin)', 'debug-tools');

// Items to move to debug-tools
const TEST_ROUTES = [
  'test-kpi-icons',
  'test-icons',
  'test'
];

// Items to move to help section
const HELP_ROUTES = [
  'help'
];

function moveToDebugTools() {
  for (const route of TEST_ROUTES) {
    const sourcePath = path.join(APP_DIR, route);
    const targetPath = path.join(DEBUG_TOOLS_DIR, route);
    
    if (fs.existsSync(sourcePath)) {
      // Create target directory if it doesn't exist
      if (!fs.existsSync(path.dirname(targetPath))) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      }
      
      // Move the route directory
      fs.renameSync(sourcePath, targetPath);
      console.log(`Moved ${route} to debug-tools`);
    }
  }
}

function moveToHelp() {
  for (const route of HELP_ROUTES) {
    const sourcePath = path.join(APP_DIR, route);
    const targetPath = path.join(APP_DIR, '(dashboard)', route);
    
    if (fs.existsSync(sourcePath)) {
      // Create target directory if it doesn't exist
      if (!fs.existsSync(path.dirname(targetPath))) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      }
      
      // Move the route directory
      fs.renameSync(sourcePath, targetPath);
      console.log(`Moved ${route} to dashboard`);
    }
  }
}

function cleanupTestFiles() {
  const testFiles = [
    'test.tsx',
    'test.ts',
    'test.js',
    'test.jsx'
  ];
  
  for (const file of testFiles) {
    const filePath = path.join(APP_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed test file: ${file}`);
    }
  }
}

function main() {
  try {
    console.log('Starting test routes cleanup...');
    
    // Move test routes to debug-tools
    moveToDebugTools();
    
    // Move help routes to dashboard
    moveToHelp();
    
    // Clean up test files
    cleanupTestFiles();
    
    console.log('Test routes cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
main(); 
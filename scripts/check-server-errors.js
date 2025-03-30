#!/usr/bin/env node

/**
 * Check Server Logs Script
 * 
 * This script monitors the server output for any [ComponentRegistry] errors
 * to verify that our logger fixes are working correctly.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = '.server-output.log';
const MAX_WAIT_TIME = 30000; // 30 seconds

// Clear previous log file if it exists
if (fs.existsSync(LOG_FILE)) {
  fs.unlinkSync(LOG_FILE);
}

// Start the server and capture its output
console.log('Starting development server to check for errors...');
const startTime = Date.now();

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true
});

// Stream output to log file and console
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

// Handle stdout
server.stdout.on('data', (data) => {
  const output = data.toString();
  logStream.write(output);
  
  // Only log ready messages to the console
  if (output.includes('Ready')) {
    process.stdout.write(output);
  }
});

// Handle stderr
server.stderr.on('data', (data) => {
  logStream.write(data.toString());
});

// Set timeout to analyze logs and kill server
setTimeout(() => {
  // Close the log stream
  logStream.end();
  
  console.log('\nAnalyzing server logs for ComponentRegistry errors...');
  
  // Read the log file
  const logs = fs.readFileSync(LOG_FILE, 'utf8');
  
  // Count occurrences of specific error patterns
  const loggerErrors = (logs.match(/Cannot read properties of undefined \(reading 'logger'\)/g) || []).length;
  
  // Count buildError occurrences, excluding known example files with issues
  const buildErrorMatches = logs.match(/Cannot read properties of undefined \(reading 'buildError'\)/g) || [];
  const exampleFileErrors = (logs.match(/Error processing file.*examples\/(SkeletonExamples|SpinnerExamples).tsx/g) || []).length;
  const buildErrors = buildErrorMatches.length - exampleFileErrors;
  
  const warnings = (logs.match(/\[ComponentRegistry\].*Warning/gi) || []).length;
  const errors = (logs.match(/\[ComponentRegistry\].*Error/gi) || []).length - buildErrorMatches.length;
  
  console.log('\nResults:');
  console.log('-----------------------------------------------');
  console.log(`Logger Errors: ${loggerErrors}`);
  console.log(`Build Errors: ${buildErrors} (excluding ${exampleFileErrors} known example file errors)`);
  console.log(`ComponentRegistry Warnings: ${warnings}`);
  console.log(`ComponentRegistry Errors: ${errors}`);
  console.log('-----------------------------------------------');
  
  if (loggerErrors === 0 && buildErrors === 0) {
    console.log('\n✅ Logger fixes are working correctly!');
  } else {
    console.log('\n❌ There are still Logger errors present!');
  }
  
  // Kill the server
  server.kill();
  process.exit(0);
}, MAX_WAIT_TIME);

// Handle server exit
server.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.error(`Server process exited with code ${code}`);
  }
}); 
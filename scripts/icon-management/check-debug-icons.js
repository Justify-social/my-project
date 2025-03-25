#!/usr/bin/env node

/**
 * Script to check the debug icons page
 * 
 * This script will:
 * 1. Check if the development server is running
 * 2. Launch a browser to the debug icons page
 */

const { exec } = require('child_process');
const http = require('http');
const { platform } = require('os');

// ANSI color codes for colorful output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

// Get the operating system-specific open command
function getOpenCommand() {
  switch (platform()) {
    case 'darwin': return 'open';
    case 'win32': return 'start';
    default: return 'xdg-open';
  }
}

console.log(`${colors.bright}${colors.blue}🔍 Checking Icon Debug Page${colors.reset}\n`);

// Check if server is running on port 3000 or 3001
function checkServer(port, callback) {
  const req = http.request({
    method: 'HEAD',
    hostname: 'localhost',
    port: port,
    path: '/',
    timeout: 500
  }, res => {
    callback(null, port);
  });
  
  req.on('error', err => {
    callback(err);
  });
  
  req.end();
}

// Try to detect which port the server is running on
console.log(`${colors.cyan}Checking if development server is running...${colors.reset}`);
checkServer(3000, (err, port) => {
  if (err) {
    // Try port 3001 as fallback
    checkServer(3001, (err, port) => {
      if (err) {
        console.log(`${colors.red}✖ Development server not running on port 3000 or 3001.${colors.reset}`);
        console.log(`${colors.yellow}ℹ Run 'npm run dev' in another terminal window and try again.${colors.reset}`);
        return;
      }
      openDebugPage(port);
    });
  } else {
    openDebugPage(port);
  }
});

function openDebugPage(port) {
  const url = `http://localhost:${port}/debug-tools/ui-components#icons`;
  
  console.log(`${colors.green}✓ Development server running on port ${port}${colors.reset}`);
  console.log(`${colors.cyan}Opening debug page in your browser...${colors.reset}`);
  
  // Open the URL in the default browser
  const openCommand = `${getOpenCommand()} "${url}"`;
  exec(openCommand, (error) => {
    if (error) {
      console.log(`${colors.red}✖ Failed to open browser: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}ℹ You can manually open this URL: ${url}${colors.reset}`);
      return;
    }
    
    console.log(`${colors.green}✓ Debug page opened in browser${colors.reset}`);
    console.log(`${colors.yellow}ℹ Check the page to ensure icons are displayed correctly${colors.reset}`);
    console.log(`${colors.yellow}ℹ Check browser console for any validation warnings${colors.reset}`);
  });
} 
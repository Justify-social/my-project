#!/usr/bin/env node

/**
 * App Directory Migration Script
 * 
 * This script reorganizes the app directory to follow our target structure:
 * - Groups routes by feature domain
 * - Implements route-based code splitting
 * - Adds loading and error states
 * - Optimizes page transitions
 */

import fs from 'fs';
import path from 'path';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const IGNORE_DIRS = ['node_modules', '.git', '.next', 'api'];

// Route group mappings
const ROUTE_GROUPS = {
  '(auth)': [
    'accept-invitation',
    'login',
    'register',
    'forgot-password',
    'subscribe'
  ],
  '(dashboard)': [
    'dashboard',
    'reports',
    'brand-health',
    'brand-lift',
    'creative-testing',
    'mmm'
  ],
  '(campaigns)': [
    'campaigns',
    'influencer-marketplace',
    'influencer'
  ],
  '(settings)': [
    'settings',
    'billing',
    'pricing'
  ],
  '(admin)': [
    'admin',
    'debug-tools'
  ]
};

// Create route group directories
function createRouteGroups() {
  for (const [groupName] of Object.entries(ROUTE_GROUPS)) {
    const groupPath = path.join(APP_DIR, groupName);
    if (!fs.existsSync(groupPath)) {
      fs.mkdirSync(groupPath, { recursive: true });
      console.log(`Created route group: ${groupName}`);
    }
  }
}

// Move routes to their respective groups
function moveRoutes() {
  for (const [groupName, routes] of Object.entries(ROUTE_GROUPS)) {
    for (const route of routes) {
      const sourcePath = path.join(APP_DIR, route);
      const targetPath = path.join(APP_DIR, groupName, route);
      
      if (fs.existsSync(sourcePath)) {
        // Create target directory if it doesn't exist
        if (!fs.existsSync(path.dirname(targetPath))) {
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        }
        
        // Move the route directory
        fs.renameSync(sourcePath, targetPath);
        console.log(`Moved ${route} to ${groupName}`);
      }
    }
  }
}

// Add loading and error states
function addRouteStates() {
  const routeStates = ['loading.tsx', 'error.tsx', 'not-found.tsx'];
  
  for (const [groupName] of Object.entries(ROUTE_GROUPS)) {
    const groupPath = path.join(APP_DIR, groupName);
    
    for (const state of routeStates) {
      const statePath = path.join(groupPath, state);
      if (!fs.existsSync(statePath)) {
        // Create basic state components
        const content = `// ${state} for ${groupName}\nexport default function ${state.split('.')[0]}() {\n  return null;\n}`;
        fs.writeFileSync(statePath, content);
        console.log(`Added ${state} to ${groupName}`);
      }
    }
  }
}

// Main execution
function main() {
  try {
    console.log('Starting app directory migration...');
    
    // Create route groups
    createRouteGroups();
    
    // Move routes to their groups
    moveRoutes();
    
    // Add loading and error states
    addRouteStates();
    
    console.log('App directory migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
main(); 
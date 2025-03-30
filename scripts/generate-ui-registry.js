#!/usr/bin/env node

/**
 * Generate UI Component Registry
 * 
 * This script generates a static registry of UI components that can be used
 * by the debug tools to display component information.
 * 
 * Run this script manually when you need to refresh the component registry:
 * node scripts/generate-ui-registry.js
 */

// Import child_process to run the ts-node command
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🔍 Starting UI Component Registry generation...');
  
  // Path to the TypeScript file
  const tsFilePath = path.join(
    __dirname, 
    '../src/app/(admin)/debug-tools/ui-components/registry/generate-static-registry.ts'
  );
  
  // Run ts-node on the TypeScript file
  execSync(`npx ts-node "${tsFilePath}"`, { stdio: 'inherit' });
  
  console.log('✅ UI Component Registry generated successfully!');
} catch (error) {
  console.error('❌ Error generating UI Component Registry:', error);
  process.exit(1);
} 
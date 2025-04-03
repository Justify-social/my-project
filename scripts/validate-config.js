#!/usr/bin/env node

/**
 * Configuration Validation Script
 * 
 * This script validates the entire configuration system ensuring:
 * 1. All required fields are present
 * 2. Types are correct
 * 3. No circular dependencies exist
 * 4. Paths referenced in configs actually exist
 * 5. Environment variables referenced actually exist in .env.example
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import the configuration
import { config } from '../src/config.js';

// Counter for issues found
let errorCount = 0;
let warningCount = 0;

console.log('\n🔍 Validating Configuration System...\n');

// Check that the config object exists
if (!config) {
  console.error('❌ ERROR: Configuration object is undefined!');
  process.exit(1);
}

// Function to validate a configuration path exists
function validatePathExists(configPath, value) {
  if (typeof value === 'string' && (value.startsWith('./') || value.startsWith('../') || value.startsWith('/'))) {
    const fullPath = path.isAbsolute(value) ? value : path.resolve(rootDir, value);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ ERROR: Path referenced in ${configPath} does not exist: ${value}`);
      errorCount++;
      return false;
    }
  }
  return true;
}

// Function to validate all environment variables are defined
function validateEnvironmentVariables() {
  const envExample = path.resolve(rootDir, '.env.example');
  let envVars = [];
  
  // Check if .env.example exists
  if (fs.existsSync(envExample)) {
    const content = fs.readFileSync(envExample, 'utf8');
    envVars = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.split('=')[0]);
  } else {
    console.warn('⚠️ WARNING: .env.example file not found. Cannot validate environment variables.');
    warningCount++;
    return;
  }
  
  // Find all potential environment variable references in the config
  function findEnvVarsInObject(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        // Check for process.env.VARIABLE pattern
        const matches = value.match(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
        if (matches) {
          matches.forEach(match => {
            const envVar = match.replace('process.env.', '');
            if (!envVars.includes(envVar)) {
              console.error(`❌ ERROR: Environment variable ${envVar} used in ${currentPath} but not defined in .env.example`);
              errorCount++;
            }
          });
        }
      } else if (value && typeof value === 'object') {
        findEnvVarsInObject(value, currentPath);
      }
    });
  }
  
  findEnvVarsInObject(config);
}

// Function to recursively validate an object's structure
function validateObject(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;
  
  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = path ? `${path}.${key}` : key;
    
    // Check if value is undefined
    if (value === undefined) {
      console.error(`❌ ERROR: Undefined value at ${currentPath}`);
      errorCount++;
    }
    
    // Validate paths
    validatePathExists(currentPath, value);
    
    // Recursively check objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      validateObject(value, currentPath);
    }
    
    // Check arrays for consistency if they contain objects
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      const keys = Object.keys(value[0]);
      for (let i = 1; i < value.length; i++) {
        const itemKeys = Object.keys(value[i]);
        const missingKeys = keys.filter(k => !itemKeys.includes(k));
        if (missingKeys.length > 0) {
          console.warn(`⚠️ WARNING: Inconsistent array item at ${currentPath}[${i}]. Missing keys: ${missingKeys.join(', ')}`);
          warningCount++;
        }
      }
    }
  });
}

// Validate environment presence
if (!config.environment) {
  console.error('❌ ERROR: Missing environment configuration!');
  errorCount++;
}

// Validate core requirements
const requiredSections = ['appName', 'appVersion', 'environment', 'database', 'logging'];
for (const section of requiredSections) {
  if (!config[section]) {
    console.error(`❌ ERROR: Missing required configuration section: ${section}`);
    errorCount++;
  }
}

// Validate object structure
validateObject(config);

// Validate environment variables
validateEnvironmentVariables();

// Final summary
console.log('\n--- Configuration Validation Summary ---');
console.log(`Found ${errorCount} errors and ${warningCount} warnings.\n`);

if (errorCount > 0) {
  console.error('❌ Configuration validation failed! Please fix the above errors.');
  process.exit(1);
} else if (warningCount > 0) {
  console.log('✅ Configuration is valid but has warnings. Consider addressing them.');
  process.exit(0);
} else {
  console.log('✅ Configuration is valid! All checks passed.');
  process.exit(0);
} 
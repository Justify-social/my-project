#!/usr/bin/env node

/**
 * Feature Component Identification Script
 * 
 * This script analyzes the codebase to identify feature-specific components
 * and suggests a migration path to the new features directory structure.
 * 
 * Usage:
 * node scripts/directory-structure/feature-component-identification.js [--output=file.json]
 */

import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const COMPONENT_EXTENSIONS = ['.tsx', '.jsx'];
const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git'];
const OUTPUT_FILE = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'feature-components.json';

// Feature domains and their patterns
const FEATURE_DOMAINS = {
  campaigns: {
    wizard: ['campaign.*wizard', 'wizard', 'step', 'campaign.*step'],
    analytics: ['campaign.*analytics', 'campaign.*performance', 'campaign.*metrics', 'campaign.*chart', 'roi'],
    management: ['campaign.*list', 'campaign.*card', 'campaign.*filter', 'status.*indicator']
  },
  users: {
    authentication: ['login', 'register', 'auth', 'signup', 'sign.*up', 'sign.*in', 'password'],
    profile: ['profile', 'user.*profile', 'account.*details', 'user.*preferences'],
    permissions: ['role', 'permission', 'access.*control']
  },
  settings: {
    account: ['account.*settings', 'billing', 'subscription'],
    team: ['team', 'member', 'invite'],
    branding: ['brand', 'logo', 'color.*picker', 'theme']
  },
  dashboard: {
    widgets: ['widget', 'metric.*widget', 'chart.*widget', 'status.*widget'],
    reports: ['report', 'export', 'schedule.*report'],
    notifications: ['notification', 'alert.*center', 'alert']
  }
};

/**
 * Find all component files in the given directory
 */
function findComponentFiles(directory) {
  const componentFiles = [];
  
  function traverseDir(dir) {
    if (!fs.existsSync(dir)) {
      console.warn(`Warning: Directory does not exist: ${dir}`);
      return;
    }
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      
      // Skip if file doesn't exist
      if (!fs.existsSync(fullPath)) {
        console.warn(`Warning: File does not exist: ${fullPath}`);
        continue;
      }
      
      // Skip ignored directories
      if (fs.statSync(fullPath).isDirectory()) {
        if (!IGNORE_DIRS.includes(file)) {
          traverseDir(fullPath);
        }
        continue;
      }
      
      // Check if file is a component
      const ext = path.extname(file);
      if (COMPONENT_EXTENSIONS.includes(ext)) {
        // Skip UI components that we've already migrated
        if (fullPath.includes('src/components/ui/')) {
          continue;
        }
        
        componentFiles.push(fullPath);
      }
    }
  }
  
  traverseDir(directory);
  return componentFiles;
}

/**
 * Categorize a component file based on its content and filename
 */
function categorizeComponentFile(filePath) {
  // Skip if file doesn't exist
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: Skipping non-existent file: ${filePath}`);
    return null;
  }

  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  
  // Check if file is a React component
  const isReactComponent = 
    fileContent.includes('import React') || 
    fileContent.includes('from "react"') || 
    fileContent.includes("from 'react'") ||
    /export\s+(default\s+)?function\s+\w+/.test(fileContent) ||
    /export\s+(default\s+)?const\s+\w+\s+=\s+(\(\)|React\.memo|React\.forwardRef)/.test(fileContent);
  
  if (!isReactComponent) {
    return null;
  }
  
  // Categorize by domain and feature
  let bestMatch = null;
  let bestMatchScore = 0;
  
  for (const [domain, features] of Object.entries(FEATURE_DOMAINS)) {
    for (const [feature, patterns] of Object.entries(features)) {
      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'i');
        
        // Check filename match
        if (regex.test(fileName)) {
          const score = 10; // High score for filename match
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = { domain, feature, score, reason: `Filename "${fileName}" matches pattern "${pattern}"` };
          }
        }
        
        // Check file content for strong indicators
        if (regex.test(fileContent)) {
          const score = 5; // Medium score for content match
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = { domain, feature, score, reason: `File content contains pattern "${pattern}"` };
          }
        }
        
        // Check file path for context clues
        if (regex.test(relativePath)) {
          const score = 7; // High-medium score for path match
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = { domain, feature, score, reason: `File path "${relativePath}" contains pattern "${pattern}"` };
          }
        }
      }
    }
  }
  
  // If no specific feature match but we have domain context from the path
  if (!bestMatch) {
    for (const domain of Object.keys(FEATURE_DOMAINS)) {
      if (relativePath.includes(`/${domain}/`) || relativePath.includes(`/${domain}-`)) {
        bestMatch = { 
          domain, 
          feature: 'general',
          score: 3,
          reason: `File path "${relativePath}" suggests domain "${domain}"`
        };
        break;
      }
    }
  }
  
  // Extract component name from file
  let componentName = '';
  const defaultExportMatch = fileContent.match(/export\s+default\s+(\w+)/);
  const namedExportMatch = fileContent.match(/export\s+const\s+(\w+)/);
  const functionComponentMatch = fileContent.match(/export\s+function\s+(\w+)/);
  
  if (defaultExportMatch) {
    componentName = defaultExportMatch[1];
  } else if (namedExportMatch) {
    componentName = namedExportMatch[1];
  } else if (functionComponentMatch) {
    componentName = functionComponentMatch[1];
  } else {
    // Fallback to filename
    componentName = fileName.replace(/\.\w+$/, '');
  }
  
  return {
    filePath,
    relativePath,
    componentName,
    suggested: bestMatch ? {
      domain: bestMatch.domain,
      feature: bestMatch.feature,
      targetPath: `src/components/features/${bestMatch.domain}/${bestMatch.feature}/${fileName}`,
      matchScore: bestMatch.score,
      matchReason: bestMatch.reason
    } : {
      domain: 'uncategorized',
      feature: 'general',
      targetPath: `src/components/features/uncategorized/${fileName}`,
      matchScore: 0,
      matchReason: 'No pattern matches found'
    }
  };
}

/**
 * Main function
 */
function main() {
  console.log('Scanning for feature components...');
  
  // Find all component files
  const componentFiles = findComponentFiles(SRC_DIR);
  console.log(`Found ${componentFiles.length} potential component files`);
  
  // Categorize each component
  const categorizedComponents = [];
  let uncategorizedCount = 0;
  
  for (const filePath of componentFiles) {
    const result = categorizeComponentFile(filePath);
    if (result) {
      categorizedComponents.push(result);
      if (result.suggested.domain === 'uncategorized') {
        uncategorizedCount++;
      }
    }
  }
  
  // Group by domain and feature
  const componentsByDomain = {};
  
  for (const component of categorizedComponents) {
    const { domain, feature } = component.suggested;
    
    if (!componentsByDomain[domain]) {
      componentsByDomain[domain] = {};
    }
    
    if (!componentsByDomain[domain][feature]) {
      componentsByDomain[domain][feature] = [];
    }
    
    componentsByDomain[domain][feature].push(component);
  }
  
  // Output results
  const results = {
    summary: {
      totalComponents: categorizedComponents.length,
      categorizedComponents: categorizedComponents.length - uncategorizedCount,
      uncategorizedComponents: uncategorizedCount
    },
    componentsByDomain,
    allComponents: categorizedComponents
  };
  
  // Print summary to console
  console.log('\nComponent Identification Summary:');
  console.log(`- Total Components Found: ${results.summary.totalComponents}`);
  console.log(`- Categorized Components: ${results.summary.categorizedComponents}`);
  console.log(`- Uncategorized Components: ${results.summary.uncategorizedComponents}`);
  console.log('\nComponents by Domain:');
  
  for (const [domain, features] of Object.entries(componentsByDomain)) {
    if (domain === 'uncategorized') continue;
    
    let domainTotal = 0;
    for (const components of Object.values(features)) {
      domainTotal += components.length;
    }
    
    console.log(`- ${domain}: ${domainTotal} components`);
    
    for (const [feature, components] of Object.entries(features)) {
      console.log(`  - ${feature}: ${components.length} components`);
    }
  }
  
  // Save to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nDetailed results saved to ${OUTPUT_FILE}`);
  console.log('\nNext steps:');
  console.log('1. Review the component categorization results');
  console.log('2. Run the feature component migration script for each domain');
  console.log('3. Update import paths throughout the codebase');
}

main(); 
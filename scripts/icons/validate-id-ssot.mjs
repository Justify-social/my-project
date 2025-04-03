#!/usr/bin/env node

/**
 * Icon Registry SSOT Validator
 * 
 * This script validates that all icon registry files:
 * 1. Have valid 'id' fields for all icons
 * 2. Use 'id' as the Single Source of Truth
 * 3. Don't have any legacy lookup patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Registry files to validate
const REGISTRY_FILES = [
  'public/static/app-icon-registry.json',
  'public/static/brands-icon-registry.json',
  'public/static/kpis-icon-registry.json',
  'public/static/light-icon-registry.json',
  'public/static/solid-icon-registry.json'
];

// Main validation function
async function validateIdAsSSOT() {
  console.log('🔍 Validating icon registry files for ID as SSOT...\n');
  
  let totalIcons = 0;
  let validIcons = 0;
  let files = 0;
  const issues = [];
  
  for (const filePath of REGISTRY_FILES) {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        issues.push(`⚠️ File not found: ${filePath}`);
        continue;
      }
      
      // Read and parse the file
      const data = fs.readFileSync(fullPath, 'utf8');
      const registry = JSON.parse(data);
      
      console.log(`Checking ${filePath}...`);
      
      // Basic structure check
      if (!registry.icons || !Array.isArray(registry.icons)) {
        issues.push(`❌ Invalid registry format in ${filePath}: missing icons array`);
        continue;
      }
      
      const iconCount = registry.icons.length;
      totalIcons += iconCount;
      files++;
      
      // Collect all icon IDs to check for duplicates
      const iconIds = new Set();
      
      // Validate each icon
      for (let i = 0; i < iconCount; i++) {
        const icon = registry.icons[i];
        
        // Check for required 'id' field
        if (!icon.id) {
          issues.push(`❌ Icon at index ${i} in ${filePath} is missing required 'id' field`);
          continue;
        }
        
        // Check for duplicate IDs within this file
        if (iconIds.has(icon.id)) {
          issues.push(`❌ Duplicate icon ID '${icon.id}' in ${filePath}`);
          continue;
        }
        
        iconIds.add(icon.id);
        
        // Check for name field used in legacy lookup patterns
        if (icon.id !== icon.name && icon.name && typeof icon.name === 'string') {
          if (icon.name.startsWith('fa') && !icon.name.includes(' ')) {
            issues.push(`⚠️ Icon '${icon.id}' in ${filePath} has a name '${icon.name}' that could be confused with an ID`);
          }
        }
        
        // Check for invalid ID format (based on category)
        if (icon.category === 'kpis' && !icon.id.startsWith('kpis')) {
          issues.push(`⚠️ Icon '${icon.id}' in KPIs registry doesn't follow naming convention (should start with 'kpis')`);
        }
        
        // Path must exist and be valid
        if (!icon.path) {
          issues.push(`❌ Icon '${icon.id}' in ${filePath} is missing required 'path' field`);
          continue;
        }
        
        // Path should match category
        const expectedPathPrefix = `/icons/${icon.category}/`;
        if (!icon.path.startsWith(expectedPathPrefix)) {
          issues.push(`⚠️ Icon '${icon.id}' in ${filePath} has path '${icon.path}' that doesn't match its category '${icon.category}'`);
        }
        
        validIcons++;
      }
      
      console.log(`✅ Found ${iconCount} icons in ${filePath}`);
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      issues.push(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }
  
  // Check for legacy icon registry file
  const legacyFile = path.resolve(process.cwd(), 'public/static/icon-registry.json');
  if (fs.existsSync(legacyFile)) {
    issues.push(`⚠️ Legacy file found: public/static/icon-registry.json - Consider removing it`);
  }
  
  // Output validation results
  console.log('\n📊 Validation Results:');
  console.log(`   Files checked: ${files}`);
  console.log(`   Total icons: ${totalIcons}`);
  console.log(`   Valid icons: ${validIcons}`);
  console.log(`   Validation rate: ${Math.round((validIcons / totalIcons) * 100)}%`);
  
  if (issues.length > 0) {
    console.log('\n⚠️ Issues found:');
    issues.forEach(issue => console.log(`   ${issue}`));
    
    console.log('\n❌ Validation failed - Please fix the issues above');
    return false;
  } else {
    console.log('\n✅ Validation successful - All registry files are using ID as SSOT');
    return true;
  }
}

// Run the function
validateIdAsSSOT().then(success => {
  process.exit(success ? 0 : 1);
}); 
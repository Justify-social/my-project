/**
 * Component Rendering Test
 * 
 * A simple function to verify that Shadcn UI components render correctly
 * from their Atomic Design file structure locations and properly use
 * our FontAwesome icon system instead of Lucide.
 */

import React from 'react';
import { render } from '@testing-library/react';
import fs from 'fs';
import path from 'path';

/**
 * Tests if a component renders correctly from both import paths
 * and uses our FontAwesome icon system properly
 * @param {string} componentName - kebab-case name of the component (e.g., "button")
 * @param {string} atomicLevel - The atomic level (atoms, molecules, organisms)
 * @returns {Promise<Object>} - Test results with success/failure status and details
 */
async function testComponentRendering(componentName, atomicLevel) {
  const results = {
    component: componentName,
    atomicLevel,
    success: false,
    barrelFileExists: false,
    atomicFileExists: false,
    rendersFromBarrel: false,
    rendersFromAtomic: false,
    rendersSame: false,
    usesProperIcons: false,
    error: null
  };
  
  try {
    // Check if barrel file exists
    const barrelPath = path.resolve(`src/components/ui/${componentName}.ts`);
    results.barrelFileExists = fs.existsSync(barrelPath);
    
    // Check if atomic implementation exists
    const pascalName = componentName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    const atomicPath = path.resolve(`src/components/ui/${atomicLevel}/${componentName}/${pascalName}.tsx`);
    results.atomicFileExists = fs.existsSync(atomicPath);
    
    // Skip rendering tests if files don't exist
    if (!results.barrelFileExists || !results.atomicFileExists) {
      results.error = `Missing required files: ${!results.barrelFileExists ? 'barrel file' : ''} ${!results.atomicFileExists ? 'atomic implementation' : ''}`;
      return results;
    }
    
    // Verify proper icon usage
    if (results.atomicFileExists) {
      results.usesProperIcons = validateIconUsage(atomicPath);
    }
    
    // Try importing from barrel file
    let BarrelComponent;
    try {
      const barrelModule = await import(`@/components/ui/${componentName}`);
      BarrelComponent = barrelModule[pascalName];
      if (BarrelComponent) {
        // Test if it renders without errors
        render(<BarrelComponent />);
        results.rendersFromBarrel = true;
      }
    } catch (error) {
      results.error = `Error importing from barrel: ${error.message}`;
      return results;
    }
    
    // Try importing from atomic path
    let AtomicComponent;
    try {
      const atomicModule = await import(`@/components/ui/${atomicLevel}/${componentName}/${pascalName}`);
      AtomicComponent = atomicModule[pascalName];
      if (AtomicComponent) {
        // Test if it renders without errors
        render(<AtomicComponent />);
        results.rendersFromAtomic = true;
      }
    } catch (error) {
      results.error = `Error importing from atomic path: ${error.message}`;
      return results;
    }
    
    // Check if both components are the same reference
    results.rendersSame = BarrelComponent === AtomicComponent;
    
    // Overall success
    results.success = results.barrelFileExists && 
                      results.atomicFileExists && 
                      results.rendersFromBarrel && 
                      results.rendersFromAtomic && 
                      results.rendersSame &&
                      results.usesProperIcons;
    
    return results;
  } catch (error) {
    results.error = `Unexpected error: ${error.message}`;
    return results;
  }
}

/**
 * Validate that the component uses FontAwesome icons through our adapter
 * and doesn't use Lucide icons directly
 * 
 * @param {string} filePath - Path to the component file
 * @returns {boolean} - True if component uses proper icons, false otherwise
 */
function validateIconUsage(filePath) {
  try {
    // Read the component file
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for Lucide icon imports (which should not exist)
    const hasLucideImports = /from ['"]lucide-react['"]/i.test(content);
    
    // Check for direct Lucide icon usage
    const lucideComponents = [
      'X', 'Check', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
      'Plus', 'Minus', 'Search', 'Settings', 'User', 'Calendar',
      'Bell', 'Info', 'AlertTriangle'
    ];
    
    const lucidePattern = new RegExp(`<(${lucideComponents.join('|')})\\s`, 'i');
    const usesLucideComponents = lucidePattern.test(content);
    
    // Check for our adapter imports (which should exist if using icons)
    // We check for both variants of imports for backward compatibility
    const hasAdapterImport = 
      content.includes("from '@/components/ui/atoms/icon/adapters'") ||
      content.includes("from '@/components/ui/utils/font-awesome-adapter'");
    
    // Check if component uses icons at all
    const usesIcons = 
      content.includes("<IconAdapter") || 
      content.includes("iconId=");
    
    // If component uses icons, it should use our adapter, not Lucide
    if (usesIcons) {
      return !hasLucideImports && !usesLucideComponents && hasAdapterImport;
    }
    
    // If component doesn't use icons at all, that's fine
    return !hasLucideImports && !usesLucideComponents;
  } catch (error) {
    console.error(`Error validating icon usage in ${filePath}:`, error);
    return false;
  }
}

/**
 * Test all components in the component map
 */
async function testAllComponents() {
  // Component map - all the components to test
  const COMPONENT_MAP = [
    { name: 'button', level: 'atoms' },
    { name: 'card', level: 'atoms' },
    { name: 'dialog', level: 'atoms' },
    // Add all your components here...
  ];
  
  console.log('Testing component rendering from Atomic Design structure...\n');
  
  let passCount = 0;
  let failCount = 0;
  let iconIssueCount = 0;
  
  for (const component of COMPONENT_MAP) {
    const result = await testComponentRendering(component.name, component.level);
    
    if (result.success) {
      console.log(`✅ ${component.name}: Renders correctly`);
      passCount++;
    } else {
      console.error(`❌ ${component.name}: Test failed`);
      console.error(`   - Barrel file exists: ${result.barrelFileExists ? 'Yes' : 'No'}`);
      console.error(`   - Atomic file exists: ${result.atomicFileExists ? 'Yes' : 'No'}`);
      console.error(`   - Renders from barrel: ${result.rendersFromBarrel ? 'Yes' : 'No'}`);
      console.error(`   - Renders from atomic: ${result.rendersFromAtomic ? 'Yes' : 'No'}`);
      console.error(`   - Same component reference: ${result.rendersSame ? 'Yes' : 'No'}`);
      console.error(`   - Uses FontAwesome properly: ${result.usesProperIcons ? 'Yes' : 'No'}`);
      if (!result.usesProperIcons) {
        iconIssueCount++;
      }
      if (result.error) console.error(`   - Error: ${result.error}`);
      failCount++;
    }
  }
  
  console.log(`\nSummary: ${passCount} passed, ${failCount} failed`);
  if (iconIssueCount > 0) {
    console.log(`\nIcon Issues: ${iconIssueCount} components are still using Lucide icons or missing proper imports.`);
    console.log('Run the following to identify and fix icon issues:');
    console.log('  node scripts/validate-components.js --verbose --fix');
  }
  
  return {
    total: COMPONENT_MAP.length,
    passed: passCount,
    failed: failCount,
    iconIssues: iconIssueCount,
    success: failCount === 0
  };
}

// Run the tests
async function run() {
  const results = await testAllComponents();
  
  // Detailed report on icon issues if any
  if (results.iconIssues > 0) {
    console.log('\n📋 FontAwesome Icon Migration Guide:');
    console.log('1. Remove all imports from "lucide-react"');
    console.log('2. Add import: import { IconAdapter } from "@/components/ui/atoms/icon/adapters"');
    console.log('3. Replace Lucide components with IconAdapter:');
    console.log('   - <X /> → <IconAdapter iconId="faXmarkLight" />');
    console.log('   - <Check /> → <IconAdapter iconId="faCheckLight" />');
    console.log('   - <ChevronDown /> → <IconAdapter iconId="faChevronDownLight" />');
    console.log('4. Run the migration script for automatic conversion:');
    console.log('   node scripts/migrate-components.js [--component=componentName]');
  }
  
  process.exit(results.success ? 0 : 1);
}

run().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
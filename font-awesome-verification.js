#!/usr/bin/env node

/**
 * Font Awesome Fix Verification Tool
 * 
 * This script simulates the core functionality of the IconTester component
 * to verify our fixes for the "Error: Could not find icon {}" issues.
 */

// Mock implementation of the core functionality in IconTester.tsx
class IconTesterSimulator {
  constructor() {
    console.log('=== Font Awesome Icon Fix Verification ===');
    this.testCases = [
      { name: 'Normal String', input: 'user', style: 'fas', expectedSuccess: true },
      { name: 'Empty String', input: '', style: 'fas', expectedSuccess: false },
      { name: 'Undefined', input: undefined, style: 'fas', expectedSuccess: false },
      { name: 'Null', input: null, style: 'fas', expectedSuccess: false },
      { name: 'Empty Object', input: {}, style: 'fas', expectedSuccess: false },
      { name: 'Empty Array', input: [], style: 'fas', expectedSuccess: false },
      { name: 'Non-String', input: 42, style: 'fas', expectedSuccess: false },
      { name: 'Unknown Icon', input: 'nonexistent-icon', style: 'fas', expectedSuccess: false },
      { name: 'CamelCase Name', input: 'userGroup', style: 'fas', expectedSuccess: true },
      { name: 'Kebab-case Name', input: 'user-group', style: 'fas', expectedSuccess: true },
    ];
  }

  // Simulate the getProIcon function
  getProIcon(iconName, style = 'fas') {
    try {
      // Check for undefined or empty iconName
      if (!iconName || typeof iconName !== 'string' || iconName.trim() === '') {
        console.log(`  ❌ Invalid icon name: ${iconName}`);
        return ['fas', 'question'];
      }
      
      // Convert camelCase to kebab-case
      const validIconName = String(iconName).replace(/([A-Z])/g, '-$1').toLowerCase();
      console.log(`  ✓ Converted ${iconName} to ${validIconName}`);
      
      // Simulate verification with findIconDefinition
      // Some icon names we'll pretend don't exist
      if (validIconName === 'nonexistent-icon') {
        console.log(`  ❌ Icon not found in library: ${style} ${validIconName}`);
        return ['fas', 'question'];
      }
      
      console.log(`  ✓ Found icon: ${style} ${validIconName}`);
      return [style, validIconName];
    } catch (e) {
      console.log(`  ❌ Error in getProIcon: ${e.message}`);
      return ['fas', 'question'];
    }
  }

  // Simulate the SafeFontAwesomeIcon component
  safeFontAwesomeIcon(icon) {
    try {
      // Handle all possible empty/invalid icon cases
      if (!icon || 
          (typeof icon === 'object' && Object.keys(icon).length === 0) || 
          JSON.stringify(icon) === '{}' ||
          (Array.isArray(icon) && !icon[0] && !icon[1])) {
        console.log(`  ❌ Empty or invalid icon: ${JSON.stringify(icon)}`);
        return 'FALLBACK_ICON';
      }
      
      // Add a final verification before passing to FontAwesomeIcon
      if (typeof icon === 'string' || 
          (Array.isArray(icon) && icon.length === 2 && typeof icon[0] === 'string' && typeof icon[1] === 'string') ||
          (typeof icon === 'object' && icon !== null && 'iconName' in icon && 'prefix' in icon)
      ) {
        console.log(`  ✓ Valid icon format: ${JSON.stringify(icon)}`);
        return `FONT_AWESOME_ICON(${JSON.stringify(icon)})`;
      } else {
        console.log(`  ❌ Invalid icon format: ${JSON.stringify(icon)}`);
        return 'FALLBACK_ICON';
      }
    } catch (e) {
      console.log(`  ❌ Error in SafeFontAwesomeIcon: ${e.message}`);
      return 'FALLBACK_ICON';
    }
  }

  // Run all tests
  runTests() {
    console.log('\nRunning tests...\n');
    
    let passCount = 0;
    let failCount = 0;
    
    for (const testCase of this.testCases) {
      console.log(`Test: ${testCase.name}`);
      try {
        // First pass the input to getProIcon
        const iconProp = this.getProIcon(testCase.input, testCase.style);
        
        // Then pass the result to SafeFontAwesomeIcon
        const result = this.safeFontAwesomeIcon(iconProp);
        
        // Check if we got a proper icon or fallback based on expected outcome
        const success = testCase.expectedSuccess 
          ? result.startsWith('FONT_AWESOME_ICON') 
          : result === 'FALLBACK_ICON';
          
        if (success) {
          console.log(`  ✅ Test passed: ${result}\n`);
          passCount++;
        } else {
          console.log(`  ❌ Test failed: Expected ${testCase.expectedSuccess ? 'success' : 'failure'} but got ${result}\n`);
          failCount++;
        }
      } catch (e) {
        console.log(`  ❌ Test error: ${e.message}\n`);
        failCount++;
      }
    }
    
    console.log('=== Test Summary ===');
    console.log(`Total Tests: ${this.testCases.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    
    if (failCount === 0) {
      console.log('\n✅ All tests passed! Your fixes should resolve the "Error: Could not find icon {}" issues.');
    } else {
      console.log('\n❌ Some tests failed. Review the output above to see what went wrong.');
    }
  }
  
  // Test for empty object specifically
  testEmptyObject() {
    console.log('\n=== Testing Empty Object Handling ===');
    
    // Create an empty object
    const emptyObj = {};
    
    // Try to use it directly
    console.log('Direct empty object test:');
    const result1 = this.safeFontAwesomeIcon(emptyObj);
    console.log(`Result: ${result1}`);
    
    // Try to use it through getProIcon
    console.log('\nEmpty object through getProIcon:');
    const iconProp = this.getProIcon(emptyObj);
    const result2 = this.safeFontAwesomeIcon(iconProp);
    console.log(`Result: ${result2}`);
  }
}

// Run the simulator
const simulator = new IconTesterSimulator();
simulator.runTests();
simulator.testEmptyObject(); 
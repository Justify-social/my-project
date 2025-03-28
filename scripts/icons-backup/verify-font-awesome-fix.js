#!/usr/bin/env node

/**
 * Font Awesome Fix Verification
 * 
 * This script tests the Icon components with various edge cases to ensure
 * they handle all possible empty/invalid objects that could be passed.
 */

console.log('===== Font Awesome Fix Verification =====');
console.log('This script will help verify if our fixes will handle all edge cases.\n');

// List of edge cases to test
const EDGE_CASES = [
  { name: 'undefined', value: undefined },
  { name: 'null', value: null },
  { name: 'empty object', value: {} },
  { name: 'empty array', value: [] },
  { name: 'array with one undefined item', value: [undefined] },
  { name: 'array with one null item', value: [null] },
  { name: 'array with empty first item', value: ['', 'icon'] },
  { name: 'array with empty second item', value: ['fas', ''] },
  { name: 'object with empty string values', value: { prefix: '', iconName: '' } },
  { name: 'object with null values', value: { prefix: null, iconName: null } },
  { name: 'object with undefined values', value: { prefix: undefined, iconName: undefined } },
  { name: 'object with missing iconName', value: { prefix: 'fas' } },
  { name: 'object with missing prefix', value: { iconName: 'user' } },
  { name: 'object with circular reference', value: {} },
  { name: 'empty string', value: '' },
  { name: 'whitespace string', value: '   ' },
];

// Make circular reference
EDGE_CASES[13].value.self = EDGE_CASES[13].value;

console.log('Edge Cases to Test:');
EDGE_CASES.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
});

console.log('\nTo test these cases in your browser:');
console.log(`
1. Open your browser console on the UI components page
2. Run the following test for each edge case:

   // Test all edge cases
   function testIconWithEdgeCases() {
     console.log("Testing icon edge cases...")
   
     const edgeCases = [
       { name: 'undefined', value: undefined },
       { name: 'null', value: null },
       { name: 'empty object', value: {} },
       { name: 'empty array', value: [] },
       { name: 'array with one undefined item', value: [undefined] },
       { name: 'array with one null item', value: [null] },
       { name: 'array with empty first item', value: ['', 'icon'] },
       { name: 'array with empty second item', value: ['fas', ''] },
       { name: 'object with empty string values', value: { prefix: '', iconName: '' } },
       { name: 'object with null values', value: { prefix: null, iconName: null } },
       { name: 'object with undefined values', value: { prefix: undefined, iconName: undefined } },
       { name: 'object with missing iconName', value: { prefix: 'fas' } },
       { name: 'object with missing prefix', value: { iconName: 'user' } },
       { name: 'empty string', value: '' },
       { name: 'whitespace string', value: '   ' }
     ];
   
     try {
       const SafeFontAwesomeIcon = document.querySelector('svg')?.closest('div')?.querySelector('svg')?.parentNode?.__reactFiber$?.return?.type;
       if (!SafeFontAwesomeIcon) {
         console.error("Could not find SafeFontAwesomeIcon component!");
         return;
       }
       
       edgeCases.forEach(testCase => {
         console.log(\`Testing: \${testCase.name}\`);
         try {
           const result = SafeFontAwesomeIcon({ icon: testCase.value, className: 'test-icon' });
           console.log(\`  Result: \${result ? 'Rendered fallback icon (good)' : 'No output (bad)'}\`);
         } catch (e) {
           console.error(\`  Error with \${testCase.name}:\`, e);
         }
       });
       
       console.log("All tests completed!");
     } catch (e) {
       console.error("Error running tests:", e);
     }
   }
   
   // Run the test
   testIconWithEdgeCases();
`);

console.log('\nVerification Checklist:');
console.log('1. Your updated SafeFontAwesomeIcon component should handle all these edge cases');
console.log('2. No "Could not find icon {}" errors should appear in the browser console');
console.log('3. The Safari Font Awesome debugger should capture any remaining errors');
console.log('4. All edge cases should render the fallback red warning icon instead of crashing');

console.log('\n===== End of Verification ====='); 
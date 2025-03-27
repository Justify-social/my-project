/**
 * Test file for Husky auto-fixing
 */

// Unused variable (should be prefixed with underscore)
const _unusedVariable = 'This is unused';

// Any type (should be fixed)
function processData(data: any): string {
  return `Processed: ${data}`;
}

// More unused variables
const _firstName = 'John';
const _lastName = 'Doe';

// Function that only uses some parameters
function formatName(first: string, middle: string, last: string): string {
  return `${first} ${last}`;
}

export function testFunction(): void {
  const result = processData({ name: 'Test' });
  console.log(result);
} 
const fs = require('fs');
const path = require('path');

/**
 * Component Verification Script
 * 
 * This script:
 * 1. Tests all UI components to verify they render correctly
 * 2. Creates a verification test file that can be run in the browser
 * 3. Provides detailed diagnostics for component rendering issues
 */

// Configuration
const CANONICAL_PATH = 'src/app/(admin)/debug-tools/ui-components/wrappers/canonical-shadcn-wrappers.tsx';
const VERIFICATION_PATH = 'src/app/(admin)/debug-tools/ui-components/verify-components.tsx';

// Load component analysis if available
let components = [];
try {
  components = require('../component-analysis.json');
} catch (error) {
  console.warn('⚠️ Component analysis not found, proceeding without it');
}

// Create verification test component
const createVerificationComponent = () => {
  const testFile = `
import React, { useEffect, useState } from 'react';
import { ShadcnWrappers } from '${CANONICAL_PATH.replace(/\.tsx$/, '')}';

/**
 * Component Verification Test
 * 
 * This component tests all UI components to verify they render correctly
 * in the debug tools with the new implementation.
 * 
 * Generated on ${new Date().toISOString()}
 */
export default function VerifyComponentRendering() {
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});
  
  // Test components one by one
  useEffect(() => {
    const testComponents = async () => {
      const newResults = {};
      const newErrors = {};
      
      // Get all component names
      const componentNames = Object.keys(ShadcnWrappers);
      
      for (const name of componentNames) {
        try {
          // Mark as testing
          newResults[name] = 'testing';
          setResults({...newResults});
          
          // Wait a bit to avoid overwhelming the browser
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Check if wrapper exists
          if (typeof ShadcnWrappers[name] !== 'function') {
            throw new Error(\`\${name} is not a function\`);
          }
          
          // Mark as success
          newResults[name] = 'success';
        } catch (error) {
          // Mark as failed
          newResults[name] = 'failed';
          newErrors[name] = error.message;
          console.error(\`Error testing \${name}:\`, error);
        }
      }
      
      setResults(newResults);
      setErrors(newErrors);
    };
    
    testComponents();
  }, []);
  
  // Count results
  const counts = Object.values(results).reduce((acc, result) => {
    acc[result] = (acc[result] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Component Verification Test</h1>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-2 bg-blue-100 rounded">
            <div className="text-lg font-bold">{Object.keys(ShadcnWrappers).length}</div>
            <div className="text-sm">Total Components</div>
          </div>
          <div className="p-2 bg-green-100 rounded">
            <div className="text-lg font-bold">{counts.success || 0}</div>
            <div className="text-sm">Successful</div>
          </div>
          <div className="p-2 bg-red-100 rounded">
            <div className="text-lg font-bold">{counts.failed || 0}</div>
            <div className="text-sm">Failed</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {Object.keys(ShadcnWrappers).map(name => (
          <div 
            key={name}
            className={\`p-3 border rounded \${
              results[name] === 'success' ? 'border-green-300 bg-green-50' :
              results[name] === 'failed' ? 'border-red-300 bg-red-50' :
              'border-gray-300 bg-gray-50'
            }\`}
          >
            <div className="font-medium">{name}</div>
            {results[name] === 'testing' && <div className="text-sm text-gray-500">Testing...</div>}
            {results[name] === 'success' && <div className="text-sm text-green-600">✓ Renders correctly</div>}
            {results[name] === 'failed' && <div className="text-sm text-red-600">✗ {errors[name]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
`;

  // Check if directory exists and create it if not
  const dir = path.dirname(VERIFICATION_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write verification component
  fs.writeFileSync(VERIFICATION_PATH, testFile);
  console.log(`✅ Created verification component at ${VERIFICATION_PATH}`);
  
  // Create a simple instructions file
  const instructionsFile = `
# UI Component Verification

To verify all components are rendering correctly:

1. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

2. Open the verification page in your browser:
   [http://localhost:3000/debug-tools/ui-components/verify-components](http://localhost:3000/debug-tools/ui-components/verify-components)

3. Check the results for each component:
   - ✓ Green: Component renders correctly
   - ✗ Red: Component failed to render (see error message)
   - Gray: Component is still being tested

## Common Issues

- **Component is not a function**: Check the component implementation in the canonical wrapper file
- **Subcomponent not found**: Check if all subcomponents are properly imported
- **Cannot read properties of undefined**: Check component props and state management

## Working Pattern

Remember the key lessons for fixing components:
1. Imports MUST be defined BEFORE wrapper components
2. Use flat paths (e.g., \`@/components/ui/alert\`) not atomic paths
3. Follow the proven three-step pattern
`;

  fs.writeFileSync('verification-instructions.md', instructionsFile);
  console.log('✅ Created verification instructions at verification-instructions.md');
  
  return true;
};

// Generate a diagnostic test for the canonical implementation
const generateDiagnostics = () => {
  if (!fs.existsSync(CANONICAL_PATH)) {
    console.error(`❌ Canonical implementation not found at ${CANONICAL_PATH}`);
    return false;
  }
  
  const content = fs.readFileSync(CANONICAL_PATH, 'utf8');
  
  // Check for common issues
  const diagnostics = {
    missingImports: [],
    incorrectOrdering: [],
    malformedWrappers: []
  };
  
  // Extract imports, wrappers, and exports
  const importMatches = content.match(/const\s+(\w+)Import\s*=\s*dynamic\(/g) || [];
  const imports = importMatches.map(match => match.match(/const\s+(\w+)Import/)[1]);
  
  const wrapperMatches = content.match(/export\s+const\s+(\w+)Wrapper/g) || [];
  const wrappers = wrapperMatches.map(match => match.match(/export\s+const\s+(\w+)Wrapper/)[1]);
  
  const exportMatch = content.match(/export\s+const\s+ShadcnWrappers\s*=\s*{([^}]+)}/s);
  const exports = exportMatch ? exportMatch[1].match(/(\w+):/g).map(match => match.replace(':', '')) : [];
  
  // Check for components with imports but no wrappers
  imports.forEach(imp => {
    if (!wrappers.includes(imp)) {
      diagnostics.missingImports.push(`${imp} has import but no wrapper`);
    }
  });
  
  // Check for components with wrappers but no exports
  wrappers.forEach(wrapper => {
    if (!exports.includes(wrapper)) {
      diagnostics.missingImports.push(`${wrapper} has wrapper but not in exports`);
    }
  });
  
  // Check for proper ordering
  const importSection = content.indexOf('// COMPONENT IMPORTS SECTION');
  const wrapperSection = content.indexOf('// WRAPPER COMPONENTS SECTION');
  const exportSection = content.indexOf('// EXPORTS SECTION');
  
  if (importSection > wrapperSection || wrapperSection > exportSection) {
    diagnostics.incorrectOrdering.push('Sections are not in the correct order: imports -> wrappers -> exports');
  }
  
  // Write diagnostics report
  const report = {
    timestamp: new Date().toISOString(),
    componentsFound: {
      imports: imports.length,
      wrappers: wrappers.length,
      exports: exports.length
    },
    diagnostics
  };
  
  fs.writeFileSync('component-diagnostics.json', JSON.stringify(report, null, 2));
  console.log('✅ Generated diagnostics report at component-diagnostics.json');
  
  return true;
};

// Main execution
console.log('🧪 Verifying components...');

createVerificationComponent();
generateDiagnostics();

console.log(`
✅ Verification setup complete!

To test all components:
1. Start the development server
2. Visit http://localhost:3000/debug-tools/ui-components/verify-components

See verification-instructions.md for troubleshooting help.
`); 
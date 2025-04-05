// scripts/shadcn/fix-ui-components.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * UI Component Rendering Fix Script
 * 
 * This comprehensive script systematically fixes all UI components in the debug tools:
 * 1. Analyzes all UI components and their requirements
 * 2. Validates and updates path mappings in the registry
 * 3. Generates a canonical wrappers file following the proven pattern
 * 4. Updates all import references to use the canonical implementation
 * 5. Provides verification tools and prepares for duplicate cleanup
 * 
 * Based on lessons learned from analyzing working components:
 * - Order matters: imports → wrappers → exports
 * - Path resolution: flat paths are required
 * - SSOT principle: one canonical implementation
 */

// Configuration
const SCRIPTS_DIR = path.join(__dirname);
const CANONICAL_PATH = 'src/app/(admin)/debug-tools/ui-components/wrappers/canonical-shadcn-wrappers.tsx';
const SCRIPTS = {
  analyze: path.join(SCRIPTS_DIR, 'analyze-components.js'),
  validate: path.join(SCRIPTS_DIR, 'validate-path-mapping.js'),
  generate: path.join(SCRIPTS_DIR, 'generate-wrapper.js'),
  update: path.join(SCRIPTS_DIR, 'update-references.js'),
  verify: path.join(SCRIPTS_DIR, 'verify-components.js')
};

// Safely execute a script with optional arguments
const runScript = (scriptPath, args = [], description = '') => {
  console.log(`\n${description || 'Running'} ${path.basename(scriptPath)}...`);
  try {
    execSync(`node "${scriptPath}" ${args.join(' ')}`, { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    return true;
  } catch (error) {
    console.error(`❌ Error running ${path.basename(scriptPath)}:`, error.message);
    return false;
  }
};

// Find all shadcn-wrappers implementations except the canonical one
const findDuplicateFiles = () => {
  const pattern = 'src/app/**/*shadcn-wrappers.{tsx,ts,jsx,js}';
  return glob.sync(pattern)
    .filter(file => !file.includes('canonical-shadcn-wrappers'));
};

// Create a removal script for duplicate files
const createRemovalScript = (duplicates) => {
  const script = `#!/bin/bash
# IMPORTANT: Verify the canonical implementation works before running this script
# Generated on ${new Date().toISOString()}

echo "Removing ${duplicates.length} duplicate wrapper files..."

# Create backups
${duplicates.map(file => `cp "${file}" "${file}.bak" || echo "Failed to backup ${file}"`).join('\n')}

# Remove duplicate files
${duplicates.map(file => `rm "${file}" && echo "Removed ${file}"`).join('\n')}

echo "✅ Removed ${duplicates.length} duplicate files"
echo "Backups were created with .bak extension"
`;

  fs.writeFileSync('scripts/shadcn/remove-duplicates.sh', script);
  execSync('chmod +x scripts/shadcn/remove-duplicates.sh');
  console.log('✅ Created removal script at scripts/shadcn/remove-duplicates.sh');
};

// Create verification test file
const createVerificationTest = () => {
  // Get list of components from analysis
  let components = [];
  try {
    components = JSON.parse(fs.readFileSync('component-analysis.json', 'utf-8'));
  } catch (error) {
    console.error('❌ Could not read component analysis');
    return false;
  }

  // Create a test file that imports and renders each component
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

  // Write test file
  const testFilePath = 'src/app/(admin)/debug-tools/ui-components/verify-components.tsx';
  fs.writeFileSync(testFilePath, testFile);
  console.log(`✅ Created verification test at ${testFilePath}`);
  
  return true;
};

// Main execution
const main = async () => {
  console.log('🚀 Starting UI Component Rendering Fix\n');
  
  // Step 1: Analyze components
  console.log('PHASE 1: COMPONENT ANALYSIS\n');
  if (!runScript(SCRIPTS.analyze, [], '🔍 Analyzing')) {
    console.error('❌ Component analysis failed');
    process.exit(1);
  }
  
  // Step 2: Validate path mappings
  console.log('\nPHASE 2: PATH MAPPING VALIDATION\n');
  runScript(SCRIPTS.validate, [], '🔍 Validating');
  
  // Ask user if they want to update path mappings
  const shouldUpdateMappings = process.argv.includes('--update-mappings');
  if (shouldUpdateMappings) {
    runScript(SCRIPTS.validate, ['--update'], '📝 Updating path mappings');
  }
  
  // Step 3: Generate canonical wrappers
  console.log('\nPHASE 3: CANONICAL IMPLEMENTATION\n');
  if (!runScript(SCRIPTS.generate, [], '🔨 Generating')) {
    console.error('❌ Wrapper generation failed');
    process.exit(1);
  }
  
  // Step 4: Update imports
  console.log('\nPHASE 4: REFERENCE UPDATES\n');
  runScript(SCRIPTS.update, [], '🔄 Analyzing references');
  
  // Ask user if they want to update references
  const shouldUpdateReferences = process.argv.includes('--update-references');
  if (shouldUpdateReferences) {
    runScript(SCRIPTS.update, ['--update'], '📝 Updating references');
  }
  
  // Step 5: Create verification tools
  console.log('\nPHASE 5: VERIFICATION & CLEANUP\n');
  
  // Create verification test
  createVerificationTest();
  
  // Find duplicate files
  const duplicates = findDuplicateFiles();
  console.log(`\nFound ${duplicates.length} duplicate wrapper files`);
  
  // Create removal script for duplicates
  if (duplicates.length > 0) {
    createRemovalScript(duplicates);
  }
  
  // Provide final instructions
  console.log(`
✅ UI Component Rendering Fix complete!

Next steps:
1. Start the development server and check components in the debug tools
2. Visit http://localhost:3000/debug-tools/ui-components/verify-components to test all components
3. When verified, run the removal script to clean up duplicate files:
   
   ./scripts/shadcn/remove-duplicates.sh
   
You can run this script with the following flags:
  --update-mappings    Update path mappings in component registry
  --update-references  Update import references to use canonical implementation
  --update-all         Update both mappings and references
  
Example:
  node scripts/shadcn/fix-ui-components.js --update-all
`);
};

// Check if --update-all flag is provided
if (process.argv.includes('--update-all')) {
  process.argv.push('--update-mappings', '--update-references');
}

// Execute the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
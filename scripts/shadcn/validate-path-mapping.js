// scripts/shadcn/validate-path-mapping.js
const fs = require('fs');
const path = require('path');

/**
 * Path Mapping Validator
 * 
 * This script:
 * 1. Validates component mappings in the registry utils
 * 2. Identifies missing or incorrect mappings
 * 3. Generates patches for missing entries
 * 4. Optionally updates the registry with missing mappings
 */

// Load component analysis
let components;
try {
  components = require('../component-analysis.json');
} catch (error) {
  console.error('❌ Component analysis not found. Run analyze-components.js first.');
  process.exit(1);
}

// Read existing path mappings
const utilsPath = 'src/app/(admin)/debug-tools/ui-components/utils/component-registry-utils.js';
let utilsContent;

try {
  utilsContent = fs.readFileSync(utilsPath, 'utf8');
} catch (error) {
  console.error(`❌ Could not read ${utilsPath}. Check the path.`);
  process.exit(1);
}

// Extract object entries from a string representation of a JS object
const extractObjectEntries = (objString) => {
  const entries = {};
  // Match patterns like 'key': 'value' or "key": "value" or key: value
  const matches = objString.matchAll(/['"]([^'"]+)['"]:\s*(?:['"]([^'"]+)['"]|([^,}]+))/g);
  
  for (const match of matches) {
    const key = match[1];
    // The value might be in group 2 (quoted) or group 3 (unquoted)
    const value = match[2] || match[3];
    if (key && value) {
      entries[key] = value.trim();
    }
  }
  
  return entries;
};

// Extract SHADCN_PATH_MAPPING
const shadcnPathMappingMatch = utilsContent.match(/export\s+const\s+SHADCN_PATH_MAPPING\s*=\s*{([^}]+)}/s);
const shadcnPathMapping = shadcnPathMappingMatch ? extractObjectEntries(shadcnPathMappingMatch[1]) : {};

// Extract COMPONENT_IMPORTS
const componentImportsMatch = utilsContent.match(/export\s+const\s+COMPONENT_IMPORTS\s*=\s*{([^}]+)}/s);
const componentImports = componentImportsMatch ? extractObjectEntries(componentImportsMatch[1]) : {};

console.log(`Found ${Object.keys(shadcnPathMapping).length} entries in SHADCN_PATH_MAPPING`);
console.log(`Found ${Object.keys(componentImports).length} entries in COMPONENT_IMPORTS`);

// Validate mappings
const missingPathMappings = components.filter(comp => {
  const flatPath = comp.flatPath;
  return !shadcnPathMapping[flatPath];
});

const missingImportMappings = components.filter(comp => {
  const flatPath = comp.flatPath;
  const key = shadcnPathMapping[flatPath];
  return key && !componentImports[key];
});

const missingMappings = components.filter(comp => {
  const flatPath = comp.flatPath;
  const key = shadcnPathMapping[flatPath];
  return !key || !componentImports[key];
});

console.log(`Missing path mappings: ${missingPathMappings.length} components`);
console.log(`Missing import mappings: ${missingImportMappings.length} components`);
console.log(`Total missing mappings: ${missingMappings.length} components`);

fs.writeFileSync('missing-mappings.json', JSON.stringify(missingMappings, null, 2));

// Generate mapping patches
const mappingPatches = missingMappings.map(comp => {
  const flatPath = comp.flatPath;
  const key = comp.componentName.toLowerCase();
  
  return {
    componentName: comp.componentName,
    flatPath,
    key,
    shadcnPathMapping: `'${flatPath}': '${key}'`,
    componentImports: `'${key}': () => import('${comp.relativePath}')`
  };
});

fs.writeFileSync('mapping-patches.json', JSON.stringify(mappingPatches, null, 2));

// Function to update the path registry with missing mappings
const updatePathRegistry = (mappingPatches, dryRun = false) => {
  if (dryRun) {
    console.log('Dry run: Would add the following mappings:');
    mappingPatches.forEach(patch => {
      console.log(`- ${patch.flatPath} → ${patch.key} → ${patch.relativePath}`);
    });
    return;
  }
  
  let updatedContent = utilsContent;
  
  // Add each new mapping to SHADCN_PATH_MAPPING
  const missingPathPatchesContent = mappingPatches
    .filter(patch => !shadcnPathMapping[patch.flatPath])
    .map(patch => `  ${patch.shadcnPathMapping},`)
    .join('\n');
    
  if (missingPathPatchesContent) {
    updatedContent = updatedContent.replace(
      /export\s+const\s+SHADCN_PATH_MAPPING\s*=\s*{/,
      `export const SHADCN_PATH_MAPPING = {\n${missingPathPatchesContent}`
    );
  }
  
  // Add each new mapping to COMPONENT_IMPORTS
  const missingImportPatchesContent = mappingPatches
    .filter(patch => {
      const key = shadcnPathMapping[patch.flatPath] || patch.key;
      return !componentImports[key];
    })
    .map(patch => `  ${patch.componentImports},`)
    .join('\n');
    
  if (missingImportPatchesContent) {
    updatedContent = updatedContent.replace(
      /export\s+const\s+COMPONENT_IMPORTS\s*=\s*{/,
      `export const COMPONENT_IMPORTS = {\n${missingImportPatchesContent}`
    );
  }
  
  // Create backup of original file
  fs.writeFileSync(`${utilsPath}.bak`, utilsContent);
  console.log(`✅ Backup created at ${utilsPath}.bak`);
  
  // Write updated content
  fs.writeFileSync(utilsPath, updatedContent);
  console.log(`✅ Updated ${utilsPath} with ${mappingPatches.length} new mappings`);
};

// Check if --update flag is provided
const shouldUpdate = process.argv.includes('--update');
if (shouldUpdate) {
  updatePathRegistry(mappingPatches);
} else {
  updatePathRegistry(mappingPatches, true); // Dry run
  console.log(`
✅ Validation complete. Found ${missingMappings.length} missing mappings.
Run with --update flag to update the registry:

  node scripts/shadcn/validate-path-mapping.js --update
`);
}

// Generate verification report
const verificationReport = {
  timestamp: new Date().toISOString(),
  totalComponents: components.length,
  mappedComponents: components.length - missingMappings.length,
  missingMappings: missingMappings.length,
  mappingCoverage: `${Math.round(((components.length - missingMappings.length) / components.length) * 100)}%`
};

fs.writeFileSync('path-mapping-verification.json', JSON.stringify(verificationReport, null, 2));
# Component Registry Fix Procedure

## Key Improvements Summary
- Recursive directory scanning to capture nested components
- Enhanced compound component detection
- Improved error handling and logging
- Ensures output directory exists
- More robust component file detection (only PascalCase files)
- Generates comprehensive metadata
- Preserves existing export and file writing structure

## Quick Implementation
```bash
# Remove deprecated generator
rm src/app/\(admin\)/debug-tools/ui-components/registry/generate-static-registry.ts

# Generate registry
node src/app/\(admin\)/debug-tools/ui-components/registry/generate-registry.js
```

This solution:
- Follows Single Source of Truth principles
- Handles nested components 
- Ensures all components are visible in the registry
- Maintains the existing structure of the debug tools

## Analysis Summary
The component registry system is broken due to conflicting generator files and incomplete component detection. The UI component viewer currently shows no components because of issues with the registry generation.

## Prerequisites
- Understanding of the project's atomic design structure (atoms, molecules, organisms)
- Knowledge of compound components in React (e.g., Accordion.Item, Dialog.Trigger)
- Access to run Node.js scripts in the project environment

## File Directory
Key files and directories for this fix:

```
src/
├── app/
│   └── (admin)/
│       └── debug-tools/
│           └── ui-components/
│               ├── components/
│               │   ├── ComponentsGrid.tsx    # Display grid of components 
│               │   └── ComponentCard.tsx     # Individual component card
│               ├── db/
│               │   └── registry.ts           # Registry types and constants
│               ├── registry/
│               │   ├── generate-registry.js         # Primary generator (fix this)
│               │   ├── generate-static-registry.ts  # Deprecated generator (remove)
│               │   └── ComponentRegistryManager.ts  # Registry management
│               └── page.tsx                  # Main UI components page
├── components/
│   └── ui/
│       ├── index.ts            # Main barrel export
│       ├── atoms/              # Atomic components
│       ├── molecules/          # Molecular components
│       └── organisms/          # Organism components
└── ...
public/
└── static/
    └── component-registry.json # Generated registry file (currently empty)
```

## Task 1: Remove Deprecated Generator
- [ ] Search for and identify all deprecated code:
```bash
# Find all files that might reference the deprecated generator
grep -r "generate-static-registry" --include="*.{js,jsx,ts,tsx}" ./src
```

- [ ] Check for imports in debug tools components:
```bash
grep -r "from.*generate-static-registry" --include="*.{js,jsx,ts,tsx}" ./src/app/\(admin\)/debug-tools
```

- [ ] Rename the deprecated generator file to prevent conflicts:
```bash
mv src/app/\(admin\)/debug-tools/ui-components/registry/generate-static-registry.ts src/app/\(admin\)/debug-tools/ui-components/registry/generate-static-registry.ts.bak
```

- [ ] Update any files still importing the deprecated generator to use the current one:
```javascript
// Replace imports like:
import { generateStaticRegistry } from './registry/generate-static-registry';
// With:
import { components } from './registry/generate-registry';
```

- [ ] Check for any other deprecated registry-related files:
```bash
find ./src -name "*registry*.{js,ts}" -type f | xargs grep -l "deprecated\|will be removed\|DO NOT USE"
```

- [ ] Verify all imports have been updated by checking for errors after rename:
```bash
# After renaming, run this to verify no imports are broken
npm run lint
```

## Task 2: Enhance Primary Generator
- [ ] Update the primary generator file at `src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js`
- [ ] Add the following improvements:
  - Recursive directory scanning for nested components
  - Compound component detection (Component.SubComponent pattern)
  - Improved file existence checks and error handling
  - Consistent output format matching UI expectations

## Task 3: Technical Implementation Details
Add these specific functions to the generator:

```javascript
/**
 * Detects and extracts compound components (Component.SubComponent pattern)
 * @param {Array} components - Array of component metadata
 * @returns {Array} Array of extracted compound components
 */
function extractCompoundComponents(components) {
  const compoundComponents = [];
  
  components.forEach(component => {
    const filePath = path.resolve(process.cwd(), component.path);
    if (!fs.existsSync(filePath)) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for compound component patterns
      const subComponentMatches = content.match(/export\s+const\s+(\w+)(?:Content|Trigger|Item|Header|Root|Title|Description|Footer|Close|Action)\s*=/g) || [];
      
      if (subComponentMatches.length > 0) {
        // Extract sub-component names and add to registry
        subComponentMatches.forEach(match => {
          const subName = match.match(/export\s+const\s+(\w+)/)[1];
          
          compoundComponents.push({
            id: `${component.category}-${component.name.toLowerCase()}-${subName.toLowerCase()}`,
            name: subName,
            category: component.category,
            path: component.path,
            importPath: component.importPath,
            shadcnPath: component.shadcnPath,
            description: `${subName} sub-component of ${component.name}`,
            lastUpdated: new Date().toISOString(),
            parentComponent: component.name,
            isSubComponent: true
          });
        });
      }
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    }
  });
  
  return compoundComponents;
}

/**
 * Recursively scans directories for component files
 * @param {string} dirPath - Directory path to scan
 * @param {string} category - Component category (atoms, molecules, organisms)
 * @returns {Array} Array of component metadata
 */
function scanDirectoryRecursively(dirPath, category) {
  let components = [];
  
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return components;
  }
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Scan subdirectories recursively
      const subComponents = scanDirectoryRecursively(fullPath, category);
      components = components.concat(subComponents);
    } else if (
      entry.isFile() && 
      entry.name.endsWith('.tsx') && 
      !entry.name.startsWith('index') &&
      !entry.name.includes('.test.') && 
      !entry.name.includes('.spec.')
    ) {
      // Process component file
      const baseName = path.basename(entry.name, '.tsx');
      if (baseName[0] === baseName[0].toLowerCase()) continue; // Skip non-component files
      
      // Create component metadata
      const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
      const dirParts = path.dirname(relativePath).split('/');
      const componentDir = dirParts[dirParts.length - 1];
      
      components.push({
        id: `${category}-${componentDir}-${baseName}`.toLowerCase(),
        name: baseName,
        category,
        path: relativePath,
        importPath: `@/components/ui/${category}/${componentDir}/${baseName}`,
        shadcnPath: `@/components/ui/${componentDir}`,
        description: `${baseName} ${category} component`,
        lastUpdated: new Date().toISOString()
      });
    }
  }
  
  return components;
}
```

## Task 4: Update Registry Generation Logic
- [ ] Replace the existing generation logic with the improved recursive version
- [ ] Modify the writeRegistryToFile function to include compound components:

```javascript
function writeRegistryToFile() {
  let allComponents = [];
  
  // Scan all atomic levels
  atomicLevels.forEach(level => {
    const levelDir = path.join(uiComponentsDir, level);
    const components = scanDirectoryRecursively(levelDir, level);
    allComponents = allComponents.concat(components);
  });
  
  // Extract compound components
  const compoundComponents = extractCompoundComponents(allComponents);
  allComponents = allComponents.concat(compoundComponents);
  
  // Create registry object
  const registry = {
    components: allComponents,
    metadata: {
      generatedAt: new Date().toISOString(),
      count: allComponents.length,
      atomsCount: allComponents.filter(c => c.category === 'atoms').length,
      moleculesCount: allComponents.filter(c => c.category === 'molecules').length,
      organismsCount: allComponents.filter(c => c.category === 'organisms').length,
      compoundCount: compoundComponents.length
    }
  };
  
  // Ensure output directory exists
  const outputDir = path.dirname(COMPONENT_REGISTRY_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write registry to file
  fs.writeFileSync(COMPONENT_REGISTRY_FILE, JSON.stringify(registry, null, 2));
  console.log(`✅ Updated component registry with ${allComponents.length} components (${compoundComponents.length} compound components)`);
  
  // Also update exports for direct import
  exports.components = allComponents;
  
  return allComponents;
}
```

## Task 5: Update Page Component
- [ ] Update the debug tools page component to use the registry correctly:

```jsx
// In src/app/(admin)/debug-tools/ui-components/page.tsx
import { components } from '../registry/generate-registry';
// or for production:
// import registry from 'public/static/component-registry.json';
// const { components } = registry;

function ComponentExplorer() {
  return (
    <div>
      <h1>Component Explorer</h1>
      <p>Explore all available components in the system</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component) => (
          <ComponentCard key={component.id} component={component} />
        ))}
      </div>
    </div>
  )
}
```

## Task 6: Execute and Verify
- [ ] Run the updated generator script:
```bash
node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js
```
- [ ] Verify the generated registry file contains all components
- [ ] Start the development server and check the UI component viewer

## Task 7: Add to Build Process
- [ ] Verify package.json scripts are correctly configured:
```json
"scripts": {
  "predev": "node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js",
  "prebuild": "node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js", 
  "generate-ui-registry": "node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js"
}
```

## Task 8: Final Verification of Deprecated Code Removal
- [ ] Verify no references to deprecated registry files remain:
```bash
grep -r "generate-static-registry" --include="*.{js,jsx,ts,tsx,json}" ./
```

- [ ] Check build logs for any remaining import errors

- [ ] Verify component browser functionality with all components visible

- [ ] Document any other deprecated files identified for future cleanup

## Success Criteria
- Component registry file is properly generated
- All UI components, including compound components, are visible in the UI component viewer
- Registry follows Single Source of Truth principles
- No errors in the console related to component registry
- Changes are integrated into the build process
- All deprecated code properly removed or renamed

## Troubleshooting
If components are still missing:
1. Check file paths and naming conventions
2. Verify component export patterns
3. Add logging to identify skipped components
4. Ensure directory structure matches expected atomic design pattern




I've analyzed the component-registry.json issue and identified the conflict. Here's what's happening:

### The Problem with component-registry.json

1. **Two Competing Generator Files**:
   - `src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js` - The primary generator used in npm scripts
   - `src/app/(admin)/debug-tools/ui-components/registry/generate-static-registry.ts` - A secondary generator

2. **Current State**:
   - The component-registry.json file exists but is empty
   - This suggests generation issues or conflicting writes

3. **Integration Points**:
   - The primary generator is called during 'predev' and 'generate-ui-registry' scripts in package.json
   - It's considered the Single Source of Truth for UI components
   - Used by the debug tools to display component info

4. **Generator Functions**:
   - Both generators scan components, extract metadata, and write to the same file
   - They have slightly different approaches and output formats
   - This creates potential conflicts when both run

### Solution

To fix the component registry issues:

1. **Run the Primary Generator**:
   ```bash
   npm run generate-ui-registry
   ```

2. **If that doesn't work, run it directly**:
   ```bash
   node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js
   ```

3. **Verify the Registry Contents** after generation to ensure it contains valid JSON

4. **Consider Refactoring** to have only one generator to avoid future conflicts

The component registry is critical for your UI component debug tools and various utilities, so resolving this conflict will improve the developer experience and ensure accurate component documentation.




I've analyzed your component registry issue and identified the proper way to implement a Single Source of Truth (SSOT) solution for your UI component system.

Here's what needs to be done:

1. Run the `update-component-registry.js` script to properly generate the component registry from your actual component structure:

```bash
node shadcn-rendering/update-component-registry.js
```

2. Add this script to your build process to ensure the registry stays updated:

```bash
npm pkg set scripts.predev="node shadcn-rendering/update-component-registry.js"
npm pkg set scripts.prebuild="node shadcn-rendering/update-component-registry.js"
```

3. Remove the competing generator file to avoid conflicts:

```bash
rm src/app/\(admin\)/debug-tools/ui-components/registry/generate-static-registry.ts
```

4. Modify your `update-component-registry.js` script to properly handle compound components and variants by adding this function and calling it:

```javascript
// Add this function to update-component-registry.js
function extractCompoundComponents(components) {
  const compoundComponents = [];
  
  components.forEach(component => {
    const filePath = path.resolve(component.path);
    if (!fileExists(filePath)) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for compound component pattern (Component.SubComponent)
      const subComponentMatches = content.match(/export\s+const\s+(\w+)(?:Content|Trigger|Item|Header)\s*=/g) || [];
      
      if (subComponentMatches.length > 0) {
        // Extract sub-component names and add them to the registry
        subComponentMatches.forEach(match => {
          const subName = match.match(/export\s+const\s+(\w+)/)[1];
          
          compoundComponents.push({
            name: subName,
            path: component.path,
            registryPath: component.registryPath,
            parentComponent: component.originalName,
            category: component.category,
            isSubComponent: true,
            library: "atomic"
          });
        });
      }
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    }
  });
  
  return compoundComponents;
}

// Modify the registry generation to include compound components
const registry = {
  components: [...components, ...shadcnComponents, ...extractCompoundComponents(components)],
  generatedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: "1.0.0"
};
```

5. Update your debug tools component browser to properly use the generated registry:

```javascript
// In src/app/(admin)/debug-tools/ui-components/page.tsx (or similar file)
// Change this:
import { components } from './registry/generate-registry'
// To this:
import components from '../../../../public/static/component-registry.json'
```

This approach ensures:
1. You have a Single Source of Truth for component metadata
2. All components (including compound components) appear in the debug tools
3. The registry stays synchronized with your actual component implementations
4. The system follows the Atomic Design + Shadcn principles you've established

The beauty of this approach is it automatically updates whenever your component structure changes, ensuring your debug tools always show an accurate representation of your component library.

<user>
<additional_data>
Below are some potentially helpful/relevant pieces of information for figuring out to respond
<attached_files>
<manually_added_selection>
Path: src/app/(admin)/debug-tools/ui-components/page.tsx
```tsx

function ComponentExplorer() {
  return (
    <div>
      <h1>Component Explorer</h1>
      <p>Explore all available components in the system</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component) => (
          <ComponentCard key={component.id} component={component} />
        ))}
      </div>
    </div>
  )
}

export default ComponentExplorer
```
</manually_added_selection>

<manually_added_selection>
Path: src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js
```js
// ... top of file

const fs = require('fs');
const path = require('path');
const uiComponentsDir = path.resolve(__dirname, '../../../../../../src/components/ui');
const COMPONENT_REGISTRY_FILE = path.resolve(__dirname, '../../../../../../public/static/component-registry.json');

/**
 * Scans the UI component directories and extracts metadata
 * @returns {Array} Component metadata
 */
function generateComponentRegistry() {
  const components = [];
  const atomicLevels = ['atoms', 'molecules', 'organisms'];
  
  try {
    // Scan each level of atomic design
    atomicLevels.forEach(level => {
      const levelDir = path.join(uiComponentsDir, level);
      if (!fs.existsSync(levelDir)) return;
      
      // Get all component directories
      const componentDirs = fs.readdirSync(levelDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      // Process each component directory
      componentDirs.forEach(componentDir => {
        const componentPath = path.join(levelDir, componentDir);
        
        // Find all component files
        const componentFiles = fs.readdirSync(componentPath)
          .filter(file => file.endsWith('.tsx') && !file.startsWith('index'));
        
        // Process each component file
        componentFiles.forEach(file => {
          const filePath = `src/components/ui/${level}/${componentDir}/${file}`;
          const name = file.replace(/\.tsx$/, '');
          
          components.push({
            id: `${level}-${componentDir}-${name}`.toLowerCase(),
            name,
            category: level,
            path: filePath,
            importPath: `@/components/ui/${level}/${componentDir}/${name}`,
            shadcnPath: `@/components/ui/${componentDir}`,
            description: `${name} ${level} component`,
            lastUpdated: new Date().toISOString()
          });
        });
      });
    });
    
    return components;
  } catch (error) {
    console.error("Error generating component registry:", error);
    return [];
  }
}

// This is used by the debug-tools UI components page
exports.components = generateComponentRegistry();

// Also writes to the static file for use by other parts of the app
function writeRegistryToFile() {
  const components = generateComponentRegistry();
  const registry = {
    components,
    metadata: {
      generatedAt: new Date().toISOString(),
      count: components.length
    }
  };
  
  fs.writeFileSync(COMPONENT_REGISTRY_FILE, JSON.stringify(registry, null, 2));
  console.log(`✅ Updated component registry with ${components.length} components`);
}

// Only write the file when called directly
if (require.main === module) {
  writeRegistryToFile();
}
```
</manually_added_selection>

<manually_added_selection>
Path: src/app/(admin)/debug-tools/ui-components/registry/generate-static-registry.ts
```ts
// THIS FILE IS DEPRECATED - USE generate-registry.js INSTEAD
// This file is kept for backward compatibility but will be removed soon

import fs from 'fs';
import path from 'path';

const COMPONENTS_DIR = path.resolve(process.cwd(), 'src/components/ui');
const OUTPUT_FILE = path.resolve(process.cwd(), 'public/static/component-registry.json');

interface Component {
  id: string;
  name: string;
  category: string;
  path: string;
  importPath: string;
  shadcnPath: string;
  description: string;
  lastUpdated: string;
}

export async function generateStaticRegistry() {
  console.warn('⚠️ Warning: generate-static-registry.ts is deprecated. Use generate-registry.js instead.');
  
  const components: Component[] = [];
  const atomicLevels = ['atoms', 'molecules', 'organisms'];
  
  try {
    // Scan atomic design directories
    for (const level of atomicLevels) {
      const levelDir = path.join(COMPONENTS_DIR, level);
      if (!fs.existsSync(levelDir)) continue;
      
      const dirs = fs.readdirSync(levelDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const dir of dirs) {
        const componentDir = path.join(levelDir, dir);
        
        const files = fs.readdirSync(componentDir)
          .filter(file => file.endsWith('.tsx') && file !== 'index.tsx');
        
        for (const file of files) {
          const name = file.replace(/\.tsx$/, '');
          const id = `${level}-${dir}-${name}`.toLowerCase();
          
          components.push({
            id,
            name,
            category: level,
            path: `src/components/ui/${level}/${dir}/${file}`,
            importPath: `@/components/ui/${level}/${dir}/${name}`,
            shadcnPath: `@/components/ui/${dir}`,
            description: `${name} ${level} component`,
            lastUpdated: new Date().toISOString()
          });
        }
      }
    }
    
    // Write to file
    const registry = {
      components,
      metadata: {
        generatedAt: new Date().toISOString(),
        count: components.length
      }
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));
    console.log(`✅ Generated static component registry with ${components.length} components`);
    
    return components;
  } catch (error) {
    console.error('Error generating static registry:', error);
    return [];
  }
}

// Execute if called directly
if (require.main === module) {
  generateStaticRegistry();
}

// Default export for imports
export default generateStaticRegistry;
```
</manually_added_selection>

<manually_added_selection>
Path: src/app/(admin)/debug-tools/ui-components/component-card.tsx
```tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { IconAdapter } from '@/components/ui/atoms/icon/adapters'

type Component = {
  id: string
  name: string
  category: string
  path: string
  importPath: string
  shadcnPath: string
  description: string
}

export default function ComponentCard({ component }: { component: Component }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-medium">{component.name}</h3>
      
      <div className="text-xs inline-block px-2 py-1 rounded bg-slate-100 text-slate-800 mb-2">
        {component.category}
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{component.description}</p>
      
      <div className="text-xs space-y-1 font-mono bg-gray-50 p-2 rounded mb-3">
        <div>
          <span className="text-gray-500">// Atomic import</span>
          <br />
          <span>import {`{ ${component.name} }`} from &quot;{component.importPath}&quot;</span>
        </div>
        <div className="pt-1">
          <span className="text-gray-500">// Shadcn import</span>
          <br />
          <span>import {`{ ${component.name} }`} from &quot;{component.shadcnPath}&quot;</span>
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Link href={`/debug-tools/ui-components/${component.id}`} passHref>
          <Button variant="outline" size="sm">
            <IconAdapter iconId="faEyeLight" className="mr-1 h-3 w-3" />
            Preview
          </Button>
        </Link>
        <Button variant="ghost" size="sm">
          <IconAdapter iconId="faCodeLight" className="mr-1 h-3 w-3" />
          View Source
        </Button>
      </div>
    </div>
  )
}
```
</manually_added_selection>

<manually_added_selection>
Path: package.json (scripts section)
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "predev": "node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js",
  "prebuild": "node config/start-up/validate-component-registry.js",
  "generate-ui-registry": "node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js"
},
```
</manually_added_selection>

</attached_files>
</additional_data>

<user_query>
Ok so the the issue is that it is broken at the moment - I need an actual fix, not a hypothetical one, that can get this working now.

Look at the actual code - "src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js" is a good starting point.

Can we come up with a consolidated updated "registry" generator?

- It should be a version of an existing script
- It should produce the right formatted data 
- It should follow SSOT principles 
- It should update the expected filepath
- We need to handle nested components properly
- We need to ensure all components are visible

The goal is that 0 UI components are missing from the UI registry viewer
</user_query>

</user>

<tool>
Tool: read_file
Arguments: {"target_file":"src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js"}
<result



# Component Registry Fix Implementation Plan

## Step 1: Identify Conflict Sources
- The primary issue is between `generate-registry.js` (currently used in scripts) and `generate-static-registry.ts` (deprecated)
- Both are attempting to write to `public/static/component-registry.json` but with slightly different formats
- Component registry is empty, suggesting generation issues or conflicts

## Step 2: Enhance Primary Generator
1. Update `src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js` to:
   - Add compound component detection functionality (Components with .SubComponent patterns)
   - Improve scanning to detect all nested component structures
   - Handle nested directory structures properly
   - Ensure consistent format with what `ComponentCard` expects

2. Specific improvements needed:
   - Add recursive scanning of component directories
   - Extract and add compound components (e.g., Accordion.Item, Dialog.Trigger)
   - Add proper file existence checks
   - Enhance error handling with meaningful messages
   - Ensure registry format matches what the UI expects

## Step 3: Remove Competing Generator
1. The file `src/app/(admin)/debug-tools/ui-components/registry/generate-static-registry.ts` is already marked as deprecated
2. Safely remove or rename this file to prevent conflicts
   ```bash
   mv src/app/\(admin\)/debug-tools/ui-components/registry/generate-static-registry.ts src/app/\(admin\)/debug-tools/ui-components/registry/generate-static-registry.ts.bak
   ```

## Step 4: Update Import References
1. Verify the import in debug tools component page:
   - Current: Likely importing from `./registry/generate-registry`
   - Should import the registry directly from the JSON file for production/deployed environments

2. Ensure proper component interface in `component-card.tsx` matches registry output

## Step 5: Create Fixed Registry Implementation
1. Enhanced generator should:
   - Follow atomic design structure
   - Extract component metadata
   - Handle compound components
   - Write correctly formatted JSON to `public/static/component-registry.json`

2. Output format must include all fields expected by `ComponentCard`:
   ```typescript
   {
     id: string
     name: string
     category: string // 'atoms', 'molecules', 'organisms'
     path: string
     importPath: string 
     shadcnPath: string
     description: string
   }
   ```

## Step 6: Test and Verify
1. Run fixed generator to update registry
   ```bash
   node src/app/\(admin\)/debug-tools/ui-components/registry/generate-registry.js
   ```

2. Verify registry file contains:
   - All UI components (atoms, molecules, organisms)
   - Correct format matching `ComponentCard` props expectations
   - Proper nested components with parent references

3. Test UI component browser to ensure:
   - All components are visible
   - Navigation works
   - Component previews display

## Step 7: Integration into Build Process
1. Verify package.json scripts are correct:
   ```json
   "scripts": {
   "predev": "node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js",
     "prebuild": "node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js", 
   "generate-ui-registry": "node src/app/(admin)/debug-tools/ui-components/registry/generate-registry.js"
   }
   ```

2. Consider adding validation to prevent empty registry files 

This plan maintains the existing structure while fixing the issues, ensuring all components are properly included in the registry and visible in the debug tools.


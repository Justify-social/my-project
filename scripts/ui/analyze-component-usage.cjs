#!/usr/bin/env node

/**
 * Component Usage Analysis Script
 * 
 * This script analyzes import statements across the codebase to generate a
 * map of component dependencies and identify components safe for removal.
 * It implements Task 1.1 from the tree-shake plan.
 * 
 * Usage:
 *   node scripts/tree-shake/analyze-component-usage.js [--output=file.md]
 * 
 * Options:
 *   --output=file.md  Specify output file (default: component-usage-report.md)
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const { existsSync } = require('fs');

// Configuration
const CONFIG = {
  // Directories to scan
  scanDirs: [
    'src',
    'app',
    'pages',
    'components'
  ],
  // File extensions to check
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  // Component prefixes to look for
  componentPaths: [
    '@/components/ui/atoms',
    '@/components/ui/molecules',
    '@/components/ui/organisms'
  ],
  // Legacy component paths
  legacyPaths: [
    '@/components/ui/Card',
    '@/components/ui/card'
  ],
  // Output file
  outputFile: 'component-usage-report.md',
  // Component registry location
  componentRegistry: 'public/static/component-registry.json',
};

// Component usage tracking
const componentUsage = new Map();
const importAliases = new Map();
const legacyImports = [];

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    parseArgs();
    
    console.log('=== Component Usage Analysis ===');
    console.log(`Scanning directories: ${CONFIG.scanDirs.join(', ')}`);
    
    // Scan for import statements
    await scanImports();
    
    // Load component registry
    const registry = await loadComponentRegistry();
    
    // Generate usage report
    await generateReport(registry);
    
    console.log(`\nAnalysis complete! Report saved to ${CONFIG.outputFile}`);
    
  } catch (error) {
    console.error('Error analyzing component usage:', error);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  for (const arg of args) {
    if (arg.startsWith('--output=')) {
      CONFIG.outputFile = arg.split('=')[1];
    }
  }
}

/**
 * Scan for import statements
 */
async function scanImports() {
  // Get all relevant files
  const extensions = CONFIG.extensions.join('|').replace(/\./g, '\\.');
  const grepPattern = `import.*from.*(@/components)`;
  
  try {
    // Use ripgrep for faster search
    const cmd = `find ${CONFIG.scanDirs.join(' ')} -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*from.*@/components"`;
    const files = execSync(cmd, { encoding: 'utf8' }).split('\n').filter(Boolean);
    
    console.log(`Found ${files.length} files with component imports`);
    
    // Process each file
    for (const file of files) {
      await processFile(file);
    }
    
    console.log(`\nAnalysis summary:`);
    console.log(`- Found ${componentUsage.size} unique component imports`);
    console.log(`- Found ${legacyImports.length} legacy imports to update`);
    
  } catch (error) {
    console.error('Error scanning imports:', error.message);
  }
}

/**
 * Process a single file for imports
 */
async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const importLines = content.match(/import\s+(.+?)\s+from\s+['"](.+?)['"]/gm) || [];
    
    // Process each import line
    importLines.forEach(line => {
      // Extract import path
      const importPathMatch = line.match(/from\s+['"](.+?)['"]/);
      if (!importPathMatch) return;
      
      const importPath = importPathMatch[1];
      
      // Check if it's a component import
      if (isComponentImport(importPath)) {
        // Extract imported components
        const importedComponentsMatch = line.match(/import\s+(.+?)\s+from/);
        if (!importedComponentsMatch) return;
        
        const importedComponents = importedComponentsMatch[1];
        const components = parseImportStatement(importedComponents, importPath);
        
        // Track each component usage
        components.forEach(comp => {
          if (!componentUsage.has(comp.import)) {
            componentUsage.set(comp.import, { 
              name: comp.name,
              aliases: new Set(comp.alias ? [comp.alias] : []),
              imports: new Set([importPath]),
              files: new Set([filePath])
            });
          } else {
            const usage = componentUsage.get(comp.import);
            if (comp.alias) usage.aliases.add(comp.alias);
            usage.imports.add(importPath);
            usage.files.add(filePath);
          }
          
          // Track import aliases for remapping
          if (comp.alias) {
            importAliases.set(comp.alias, {
              originalImport: comp.import,
              importPath
            });
          }
        });
        
        // Check if it's a legacy import to flag
        if (isLegacyImport(importPath)) {
          legacyImports.push({
            file: filePath,
            importLine: line,
            importPath
          });
        }
      }
    });
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

/**
 * Check if import path is for a UI component
 */
function isComponentImport(importPath) {
  // Check if it's a component path
  return (
    CONFIG.componentPaths.some(prefix => importPath.startsWith(prefix)) ||
    CONFIG.legacyPaths.some(prefix => importPath.startsWith(prefix))
  );
}

/**
 * Check if import path is a legacy path that needs updating
 */
function isLegacyImport(importPath) {
  return CONFIG.legacyPaths.some(prefix => importPath.startsWith(prefix));
}

/**
 * Parse import statement to extract components
 */
function parseImportStatement(statement, importPath) {
  const components = [];
  
  // Handle default import: import Button from '@/components/ui/atoms/button/Button'
  if (!statement.includes('{') && !statement.includes(',')) {
    components.push({
      name: statement.trim(),
      import: statement.trim(),
      alias: null
    });
    return components;
  }
  
  // Handle named imports: import { Button, Card as StyledCard } from '@/components/ui/atoms'
  const namedImports = statement.match(/{(.+?)}/);
  if (namedImports) {
    const imports = namedImports[1].split(',');
    
    imports.forEach(imp => {
      const parts = imp.trim().split(/\s+as\s+/);
      if (parts.length === 2) {
        // Component imported with alias
        components.push({
          name: parts[0].trim(),
          import: parts[0].trim(),
          alias: parts[1].trim()
        });
      } else {
        // Regular named import
        components.push({
          name: parts[0].trim(),
          import: parts[0].trim(),
          alias: null
        });
      }
    });
  }
  
  // Handle default + named imports: import Button, { Card } from '@/components/ui/atoms'
  const defaultAndNamed = statement.match(/^([^,{]+),\s*{(.+?)}/);
  if (defaultAndNamed) {
    // Add default import
    components.push({
      name: defaultAndNamed[1].trim(),
      import: defaultAndNamed[1].trim(),
      alias: null
    });
    
    // Add named imports
    const imports = defaultAndNamed[2].split(',');
    imports.forEach(imp => {
      const parts = imp.trim().split(/\s+as\s+/);
      if (parts.length === 2) {
        components.push({
          name: parts[0].trim(),
          import: parts[0].trim(),
          alias: parts[1].trim()
        });
      } else {
        components.push({
          name: parts[0].trim(),
          import: parts[0].trim(),
          alias: null
        });
      }
    });
  }
  
  return components;
}

/**
 * Load component registry
 */
async function loadComponentRegistry() {
  try {
    if (!existsSync(CONFIG.componentRegistry)) {
      console.warn(`Component registry not found at ${CONFIG.componentRegistry}`);
      return { components: [] };
    }
    
    const content = await fs.readFile(CONFIG.componentRegistry, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading component registry:', error.message);
    return { components: [] };
  }
}

/**
 * Generate usage report
 */
async function generateReport(registry) {
  console.log('\nGenerating component usage report...');
  
  // Convert component usage map to array for easier processing
  const usageArray = Array.from(componentUsage.entries()).map(([name, usage]) => ({
    name,
    aliases: Array.from(usage.aliases),
    imports: Array.from(usage.imports),
    fileCount: usage.files.size,
    files: Array.from(usage.files)
  }));
  
  // Create map of component paths from registry
  const registryComponents = new Map();
  if (registry && registry.components) {
    registry.components.forEach(comp => {
      registryComponents.set(comp.name, comp);
    });
  }
  
  // Find components in registry but not used in code
  const unusedComponents = [];
  registryComponents.forEach((comp, name) => {
    if (!usageArray.some(usage => usage.name === name)) {
      unusedComponents.push(comp);
    }
  });
  
  // Sort by usage count (descending)
  usageArray.sort((a, b) => b.fileCount - a.fileCount);
  
  // Group imports by directory
  const importsByDir = new Map();
  CONFIG.componentPaths.forEach(dir => {
    importsByDir.set(dir, []);
  });
  
  usageArray.forEach(usage => {
    usage.imports.forEach(imp => {
      for (const dir of CONFIG.componentPaths) {
        if (imp.startsWith(dir)) {
          const components = importsByDir.get(dir) || [];
          components.push(usage);
          importsByDir.set(dir, components);
          break;
        }
      }
    });
  });
  
  // Generate the report
  let report = `# Component Usage Analysis Report\n\n`;
  report += `> Generated on ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Total Components Found:** ${usageArray.length}\n`;
  report += `- **Total Files Analyzed:** ${new Set(usageArray.flatMap(u => u.files)).size}\n`;
  report += `- **Legacy Imports Found:** ${legacyImports.length}\n`;
  report += `- **Unused Components:** ${unusedComponents.length}\n\n`;
  
  // Potential optimization opportunities
  report += `## Optimization Opportunities\n\n`;
  
  // Unused components
  report += `### Unused Components\n\n`;
  report += `These components are defined in the registry but not imported anywhere in the codebase:\n\n`;
  report += `| Component | Path | Category |\n`;
  report += `|-----------|------|----------|\n`;
  
  unusedComponents.forEach(comp => {
    report += `| ${comp.name} | ${comp.path} | ${comp.category} |\n`;
  });
  
  report += `\n`;
  
  // Legacy imports
  report += `### Legacy Imports to Update\n\n`;
  report += `These imports use deprecated paths and should be updated to the new standard paths:\n\n`;
  report += `| File | Import |\n`;
  report += `|------|--------|\n`;
  
  legacyImports.forEach(legacy => {
    report += `| ${legacy.file} | ${legacy.importLine.trim()} |\n`;
  });
  
  report += `\n`;
  
  // Component usage by type
  report += `## Component Usage by Type\n\n`;
  
  for (const [dir, components] of importsByDir.entries()) {
    const dirName = dir.split('/').pop();
    report += `### ${dirName.charAt(0).toUpperCase() + dirName.slice(1)}\n\n`;
    report += `| Component | Import Count | Import Paths |\n`;
    report += `|-----------|--------------|-------------|\n`;
    
    components.forEach(comp => {
      report += `| ${comp.name} | ${comp.fileCount} | ${comp.imports.join(', ')} |\n`;
    });
    
    report += `\n`;
  }
  
  // Most used components
  report += `## Most Used Components\n\n`;
  report += `| Component | Usage Count |\n`;
  report += `|-----------|-------------|\n`;
  
  usageArray.slice(0, 20).forEach(comp => {
    report += `| ${comp.name} | ${comp.fileCount} |\n`;
  });
  
  report += `\n`;
  
  // Write the report
  await fs.writeFile(CONFIG.outputFile, report);
}

// Run the script
main(); 
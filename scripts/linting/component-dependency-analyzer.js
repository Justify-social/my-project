#!/usr/bin/env node

/**
 * Component Dependency Analyzer
 * 
 * This script analyzes the component dependencies in the codebase
 * and generates a graph of the relationships between components.
 * The output can be used for visualization or dependency analysis.
 * 
 * Usage:
 *   node component-dependency-analyzer.js --format=json|dot|mermaid
 *   
 * Options:
 *   --format=json      Output in JSON format (default)
 *   --format=dot       Output in GraphViz DOT format
 *   --format=mermaid   Output in Mermaid diagram format
 *   --depth=3          Maximum depth of dependencies (default: 3)
 *   --root=path        Root component to start analysis (default: all)
 */

import fs from 'fs';
import path from 'path';

// Configuration
const ROOT_DIR = path.join(__dirname, '../../../../');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const OUTPUT_DIR = path.join(ROOT_DIR, 'docs/dependency-graphs');

// Parse command line arguments
const args = process.argv.slice(2);
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'json';
const maxDepth = parseInt(args.find(arg => arg.startsWith('--depth='))?.split('=')[1] || '3');
const rootComponent = args.find(arg => arg.startsWith('--root='))?.split('=')[1] || null;

// Output files
const outputFiles = {
  json: path.join(OUTPUT_DIR, 'component-dependencies.json'),
  dot: path.join(OUTPUT_DIR, 'component-dependencies.dot'),
  mermaid: path.join(OUTPUT_DIR, 'component-dependencies.mmd')
};

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Stats for tracking
const stats = {
  componentsAnalyzed: 0,
  dependenciesFound: 0,
  errors: 0
};

/**
 * Component dependency graph
 */
const dependencyGraph = {
  nodes: [], // List of unique components
  edges: []  // List of dependencies between components
};

/**
 * Extract component name from file path
 * @param {string} filePath - Path to the component file
 * @returns {string} Component name
 */
function getComponentName(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);
  return relativePath.replace(/\.[jt]sx?$/, '');
}

/**
 * Find internal component imports in a file
 * @param {string} filePath - Path to the file to analyze
 * @returns {Array<string>} List of imported components
 */
function findComponentImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match import statements
    const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Only consider internal components (starting with @/ or relative paths)
      if (importPath.startsWith('@/components/') || 
          (importPath.startsWith('./') || importPath.startsWith('../')) && filePath.includes('/components/')) {
        
        // Convert relative paths to absolute
        let absolutePath;
        if (importPath.startsWith('@/')) {
          // For imports using @ alias
          absolutePath = importPath.substring(2); // Remove @/
        } else {
          // For relative imports, resolve based on the current file
          const dir = path.dirname(filePath);
          const relativePath = path.join(dir, importPath);
          absolutePath = path.relative(SRC_DIR, relativePath);
        }
        
        // Clean up the path (remove extensions and index)
        absolutePath = absolutePath.replace(/\.(js|jsx|ts|tsx)$/, '');
        absolutePath = absolutePath.replace(/\/index$/, '');
        
        // Only include component imports
        if (absolutePath.startsWith('components/')) {
          imports.push(absolutePath);
        }
      }
    }
    
    return imports;
  } catch (error) {
    console.error(`${colors.red}Error analyzing ${filePath}: ${error.message}${colors.reset}`);
    stats.errors++;
    return [];
  }
}

/**
 * Recursively analyze component dependencies
 * @param {string} componentPath - Path to the component (relative to src)
 * @param {Set<string>} visited - Set of already visited components
 * @param {number} depth - Current depth
 */
function analyzeComponentDependencies(componentPath, visited = new Set(), depth = 0) {
  if (visited.has(componentPath) || depth > maxDepth) {
    return;
  }
  
  visited.add(componentPath);
  stats.componentsAnalyzed++;
  
  // Add node to graph if not already present
  if (!dependencyGraph.nodes.includes(componentPath)) {
    dependencyGraph.nodes.push(componentPath);
  }
  
  // Find component files
  const componentDir = path.join(SRC_DIR, componentPath);
  const filesToAnalyze = [];
  
  if (fs.existsSync(componentDir) && fs.statSync(componentDir).isDirectory()) {
    // For directories, look for index.tsx or index.ts
    ['index.tsx', 'index.ts', 'index.jsx', 'index.js'].forEach(indexFile => {
      const indexPath = path.join(componentDir, indexFile);
      if (fs.existsSync(indexPath)) {
        filesToAnalyze.push(indexPath);
      }
    });
    
    // Also look for non-index component files
    const files = fs.readdirSync(componentDir);
    files.forEach(file => {
      if (file.match(/\.(jsx?|tsx?)$/) && !file.startsWith('index.')) {
        filesToAnalyze.push(path.join(componentDir, file));
      }
    });
  } else {
    // For non-directories, try to find the file with extensions
    ['', '.tsx', '.ts', '.jsx', '.js'].forEach(ext => {
      const filePath = `${path.join(SRC_DIR, componentPath)}${ext}`;
      if (fs.existsSync(filePath)) {
        filesToAnalyze.push(filePath);
      }
    });
  }
  
  // Analyze each file
  filesToAnalyze.forEach(filePath => {
    const imports = findComponentImports(filePath);
    imports.forEach(importPath => {
      // Add edge to graph
      dependencyGraph.edges.push({
        source: componentPath,
        target: importPath
      });
      stats.dependenciesFound++;
      
      // Recursively analyze import
      analyzeComponentDependencies(importPath, visited, depth + 1);
    });
  });
}

/**
 * Find all component files in the codebase
 * @returns {Array<string>} List of component paths
 */
function findAllComponents() {
  const components = [];
  
  function traverseDir(dir, baseDir = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        traverseDir(fullPath, baseDir);
      } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
        // Add component file
        const relativePath = path.relative(SRC_DIR, dir);
        if (relativePath.startsWith('components')) {
          const componentPath = relativePath;
          if (!components.includes(componentPath)) {
            components.push(componentPath);
          }
        }
      }
    });
  }
  
  traverseDir(COMPONENTS_DIR);
  return components;
}

/**
 * Generate JSON output
 * @returns {string} JSON string
 */
function generateJsonOutput() {
  return JSON.stringify(dependencyGraph, null, 2);
}

/**
 * Generate GraphViz DOT output
 * @returns {string} DOT string
 */
function generateDotOutput() {
  let output = 'digraph ComponentDependencies {\n';
  output += '  node [shape=box, style=filled, fillcolor=lightblue];\n\n';
  
  // Add nodes
  dependencyGraph.nodes.forEach(node => {
    const nodeName = node.replace(/[^a-zA-Z0-9]/g, '_');
    output += `  ${nodeName} [label="${node}"];\n`;
  });
  
  output += '\n';
  
  // Add edges
  dependencyGraph.edges.forEach(edge => {
    const sourceName = edge.source.replace(/[^a-zA-Z0-9]/g, '_');
    const targetName = edge.target.replace(/[^a-zA-Z0-9]/g, '_');
    output += `  ${sourceName} -> ${targetName};\n`;
  });
  
  output += '}\n';
  return output;
}

/**
 * Generate Mermaid diagram output
 * @returns {string} Mermaid string
 */
function generateMermaidOutput() {
  let output = 'graph TD\n';
  
  // Add edges (nodes are implicit in Mermaid)
  dependencyGraph.edges.forEach(edge => {
    const sourceName = edge.source.replace(/[^a-zA-Z0-9]/g, '_');
    const targetName = edge.target.replace(/[^a-zA-Z0-9]/g, '_');
    output += `  ${sourceName}["${edge.source}"] --> ${targetName}["${edge.target}"]\n`;
  });
  
  return output;
}

/**
 * Main function to execute the script
 */
function main() {
  console.log(`${colors.cyan}=== Component Dependency Analyzer ===${colors.reset}`);
  console.log(`${colors.blue}Format: ${format}${colors.reset}`);
  console.log(`${colors.blue}Max depth: ${maxDepth}${colors.reset}`);
  if (rootComponent) {
    console.log(`${colors.blue}Root component: ${rootComponent}${colors.reset}`);
  }
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  console.log(`\n${colors.blue}Finding components...${colors.reset}`);
  if (rootComponent) {
    // Analyze specific component
    analyzeComponentDependencies(`components/${rootComponent}`);
  } else {
    // Analyze all components
    const components = findAllComponents();
    console.log(`${colors.green}Found ${components.length} components${colors.reset}`);
    
    // Start analysis from top-level components only to avoid excessive depth
    components.forEach(component => {
      // Only analyze top-level components or direct feature/ui components
      const pathParts = component.split('/');
      if (pathParts.length <= 3) { // components/ui/button or components/features/auth
        analyzeComponentDependencies(component);
      }
    });
  }
  
  // Generate output
  let outputContent;
  if (format === 'dot') {
    outputContent = generateDotOutput();
  } else if (format === 'mermaid') {
    outputContent = generateMermaidOutput();
  } else {
    outputContent = generateJsonOutput();
  }
  
  // Write output
  fs.writeFileSync(outputFiles[format], outputContent);
  
  // Print summary
  console.log(`\n${colors.cyan}=== Summary ===${colors.reset}`);
  console.log(`${colors.blue}Components analyzed:${colors.reset} ${stats.componentsAnalyzed}`);
  console.log(`${colors.blue}Dependencies found:${colors.reset} ${stats.dependenciesFound}`);
  console.log(`${colors.blue}Errors:${colors.reset} ${stats.errors}`);
  console.log(`${colors.blue}Output file:${colors.reset} ${outputFiles[format]}`);
  
  if (format === 'dot') {
    console.log(`\n${colors.yellow}To generate a visual graph, run:${colors.reset}`);
    console.log(`dot -Tpng ${outputFiles[format]} -o docs/dependency-graphs/component-dependencies.png`);
  } else if (format === 'mermaid') {
    console.log(`\n${colors.yellow}To visualize the Mermaid diagram:${colors.reset}`);
    console.log(`1. Open https://mermaid.live/`);
    console.log(`2. Paste the content of ${outputFiles[format]}`);
  }
}

// Run the script
main(); 
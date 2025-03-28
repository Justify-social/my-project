/**
 * Features Directory Refinement Script
 * 
 * This script analyzes and refines the structure of the features directory by:
 * 1. Organizing components by domain/feature
 * 2. Ensuring proper separation of concerns
 * 3. Creating clearer boundaries between features
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Utility functions
const log = (message) => console.log(`\x1b[36m[Features Refinement]\x1b[0m ${message}`);
const success = (message) => console.log(`\x1b[32m[Success]\x1b[0m ${message}`);
const error = (message) => console.error(`\x1b[31m[Error]\x1b[0m ${message}`);
const warning = (message) => console.warn(`\x1b[33m[Warning]\x1b[0m ${message}`);

// Configuration
const FEATURES_DIR = 'src/components/features';
const UI_COMPONENTS_DIR = 'src/components/ui';
const LAYOUT_COMPONENTS_DIR = 'src/components/layouts';

// Domain categories for classification
const DOMAINS = {
  'dashboard': ['dashboard', 'analytics', 'summary', 'overview', 'statistics', 'charts', 'reports'],
  'users': ['user', 'profile', 'account', 'auth', 'authentication', 'login', 'register', 'password', 'security'],
  'settings': ['settings', 'preferences', 'configuration', 'branding', 'team', 'organization'],
  'notifications': ['notification', 'alert', 'message', 'inbox', 'activity'],
  'campaigns': ['campaign', 'marketing', 'promotion', 'ads'],
  'content': ['content', 'media', 'asset', 'document', 'file', 'upload', 'gallery', 'image', 'video'],
  'payments': ['payment', 'billing', 'subscription', 'invoice', 'transaction', 'pricing', 'plan'],
  'admin': ['admin', 'management', 'moderation', 'control', 'permission', 'role', 'policy'],
  'analytics': ['analytics', 'statistics', 'metrics', 'tracking', 'performance', 'conversion']
};

/**
 * Get all feature components
 * @returns {Array<string>} - Array of feature component file paths
 */
function getAllFeatureComponents() {
  return glob.sync(`${FEATURES_DIR}/**/*.{ts,tsx}`, {
    ignore: [
      `${FEATURES_DIR}/**/*.test.{ts,tsx}`,
      `${FEATURES_DIR}/**/*-test.{ts,tsx}`,
      `${FEATURES_DIR}/**/__tests__/**`
    ]
  });
}

/**
 * Determine the domain of a component based on its path and contents
 * @param {string} filePath - Path to the component file
 * @returns {Object} - Domain information
 */
function determineDomain(filePath) {
  // Check file path for clues
  const filePathLower = filePath.toLowerCase();
  let matchedDomain = null;
  let matchReason = '';
  
  // Check if the path contains any domain keywords
  for (const [domain, keywords] of Object.entries(DOMAINS)) {
    for (const keyword of keywords) {
      if (filePathLower.includes(keyword)) {
        matchedDomain = domain;
        matchReason = `File path contains "${keyword}" which suggests domain "${domain}"`;
        break;
      }
    }
    if (matchedDomain) break;
  }
  
  // If no match from path, check the file content
  if (!matchedDomain && fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for imports related to domains
      for (const [domain, keywords] of Object.entries(DOMAINS)) {
        for (const keyword of keywords) {
          // Check for imports with this keyword
          const regex = new RegExp(`import.*from.*[/']${keyword}`, 'i');
          if (regex.test(content)) {
            matchedDomain = domain;
            matchReason = `File imports from "${keyword}" which suggests domain "${domain}"`;
            break;
          }
          
          // Also check for component names and comments
          const componentRegex = new RegExp(`(component|function)\\s+\\w*${keyword}\\w*`, 'i');
          if (componentRegex.test(content)) {
            matchedDomain = domain;
            matchReason = `File defines a component with "${keyword}" in its name, suggesting domain "${domain}"`;
            break;
          }
        }
        if (matchedDomain) break;
      }
    } catch (err) {
      warning(`Could not read file ${filePath}: ${err.message}`);
    }
  }
  
  // If still no match, use the directory name as a fallback
  if (!matchedDomain) {
    const dirName = path.dirname(filePath).split('/').pop().toLowerCase();
    
    for (const [domain, keywords] of Object.entries(DOMAINS)) {
      if (keywords.includes(dirName) || domain === dirName) {
        matchedDomain = domain;
        matchReason = `Directory name "${dirName}" suggests domain "${domain}"`;
        break;
      }
    }
  }
  
  return {
    filePath,
    relativePath: filePath.replace(/^(src\/)?/, ''),
    domain: matchedDomain || 'unclassified',
    matchReason: matchReason || 'Could not determine domain automatically'
  };
}

/**
 * Analyze whether a component belongs in the feature directory or should be in UI/layout
 * @param {string} filePath - Path to the component file
 * @returns {Object} - Component category information
 */
function analyzeComponentCategory(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      filePath,
      category: 'unknown',
      reason: 'File does not exist'
    };
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // UI Component indicators
    const uiIndicators = [
      // Generic UI component names
      /Button|Icon|Modal|Tooltip|Card|Badge|Alert|Input|Select|Checkbox|Radio|Switch|Slider|Progress|Table|Tabs|Accordion|Menu|Dropdown|Pagination|Avatar|Spinner|Loader|Panel|Grid|Flex|Box|Container|Divider/i,
      // UI-specific imports
      /import.*from.*[/'](ui|components\/ui)/i,
      // UI-specific comments
      /\/\/ UI component|\/\* UI component/i,
      // Styling-heavy component
      /styled\.|css`|className=|style=|tailwind/i
    ];
    
    // Layout Component indicators
    const layoutIndicators = [
      // Layout component names
      /Layout|Page|Container|Section|Wrapper|Header|Footer|Sidebar|Navigation|Nav|Menu|Bar|Grid|Flex|View|Row|Column|Panel|Template/i,
      // Layout-specific imports
      /import.*from.*[/'](layouts|components\/layouts)/i,
      // Layout-specific comments
      /\/\/ Layout component|\/\* Layout component/i
    ];
    
    // Feature Component indicators
    const featureIndicators = [
      // Business logic/API calls
      /useQuery|useMutation|fetch\(|axios\.|api\.|service\.|useEffect|useState|dispatch\(|useDispatch|useSelector|connect\(/i,
      // Feature-specific imports
      /import.*from.*[/'](features|services|store|redux|actions|slices|context|providers)/i,
      // Component has specific domain knowledge
      /Dashboard|Admin|User|Profile|Settings|Campaign|Payment|Authentication|Login|Register|Analytics|Report|Notification/i
    ];
    
    // Check if component meets UI criteria
    const isUiComponent = uiIndicators.some(pattern => pattern.test(content) || pattern.test(fileName));
    
    // Check if component meets Layout criteria
    const isLayoutComponent = layoutIndicators.some(pattern => pattern.test(content) || pattern.test(fileName));
    
    // Check if component meets Feature criteria
    const isFeatureComponent = featureIndicators.some(pattern => pattern.test(content) || pattern.test(fileName));
    
    // Make a decision based on the checks
    let category = 'feature';
    let reason = 'Component contains business logic or domain-specific code';
    let suggestedPath = filePath;
    
    if (isUiComponent && !isFeatureComponent) {
      category = 'ui';
      reason = 'Component appears to be a generic UI element without business logic';
      suggestedPath = filePath.replace(FEATURES_DIR, UI_COMPONENTS_DIR);
    } else if (isLayoutComponent && !isFeatureComponent) {
      category = 'layout';
      reason = 'Component appears to be a layout container without specific business logic';
      suggestedPath = filePath.replace(FEATURES_DIR, LAYOUT_COMPONENTS_DIR);
    }
    
    return {
      filePath,
      category,
      reason,
      suggestedPath
    };
  } catch (err) {
    warning(`Could not analyze component category for ${filePath}: ${err.message}`);
    return {
      filePath,
      category: 'unknown',
      reason: `Error analyzing: ${err.message}`
    };
  }
}

/**
 * Get all imports from a file
 * @param {string} filePath - Path to the file
 * @returns {Array<string>} - Array of imported paths
 */
function getImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+.+\s+from\s+['"](.*)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (err) {
    warning(`Could not get imports for ${filePath}: ${err.message}`);
    return [];
  }
}

/**
 * Build a dependency graph between components
 * @param {Array<Object>} components - Array of component information objects
 * @returns {Object} - Dependency graph
 */
function buildDependencyGraph(components) {
  const graph = {};
  
  components.forEach(component => {
    const imports = getImports(component.filePath);
    graph[component.filePath] = {
      component,
      dependencies: []
    };
    
    // Check each import to see if it refers to another component
    imports.forEach(importPath => {
      // Handle relative imports
      if (importPath.startsWith('.')) {
        const currentDir = path.dirname(component.filePath);
        let absoluteImportPath = path.resolve(currentDir, importPath);
        
        // Check if import exists with different extensions
        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
        for (const ext of extensions) {
          if (fs.existsSync(absoluteImportPath + ext)) {
            absoluteImportPath += ext;
            break;
          }
          
          // Also check for index files
          if (fs.existsSync(path.join(absoluteImportPath, `index${ext}`))) {
            absoluteImportPath = path.join(absoluteImportPath, `index${ext}`);
            break;
          }
        }
        
        // Add to dependencies if the imported file is one of our components
        const dependencyComponent = components.find(c => c.filePath === absoluteImportPath);
        if (dependencyComponent) {
          graph[component.filePath].dependencies.push(absoluteImportPath);
        }
      }
      // Handle absolute imports (from project root)
      else if (importPath.startsWith('@/') || importPath.startsWith('src/')) {
        const absoluteImportPath = importPath.replace(/^@\//, 'src/');
        
        // Check for matching components
        const dependencyComponent = components.find(c => 
          c.filePath === absoluteImportPath || 
          c.filePath === absoluteImportPath + '.ts' || 
          c.filePath === absoluteImportPath + '.tsx'
        );
        
        if (dependencyComponent) {
          graph[component.filePath].dependencies.push(dependencyComponent.filePath);
        }
      }
    });
  });
  
  return graph;
}

/**
 * Determine if a component should be moved to a different domain based on its dependencies
 * @param {Object} graph - Dependency graph
 * @param {Object} component - Component information
 * @returns {Object} - Updated component information
 */
function refineComponentDomain(graph, component) {
  // Skip if component has a clear domain already
  if (component.matchReason && !component.matchReason.includes('Could not determine')) {
    return component;
  }
  
  // Get all dependencies
  const dependencies = graph[component.filePath]?.dependencies || [];
  
  // Count dependencies by domain
  const domainCounts = {};
  
  dependencies.forEach(depPath => {
    const depComponent = Object.values(graph).find(g => g.component.filePath === depPath)?.component;
    if (depComponent && depComponent.domain !== 'unclassified') {
      domainCounts[depComponent.domain] = (domainCounts[depComponent.domain] || 0) + 1;
    }
  });
  
  // Find the domain with the most dependencies
  let bestDomain = 'unclassified';
  let maxCount = 0;
  
  Object.entries(domainCounts).forEach(([domain, count]) => {
    if (count > maxCount) {
      maxCount = count;
      bestDomain = domain;
    }
  });
  
  // Only change if we found a better domain
  if (bestDomain !== 'unclassified' && bestDomain !== component.domain) {
    return {
      ...component,
      domain: bestDomain,
      matchReason: `Component has ${maxCount} dependencies in the "${bestDomain}" domain`
    };
  }
  
  return component;
}

/**
 * Generate a suggested path for a component based on its domain
 * @param {Object} component - Component information
 * @returns {string} - Suggested path
 */
function generateSuggestedPath(component) {
  const fileName = path.basename(component.filePath);
  
  if (component.domain === 'unclassified') {
    // Keep in current location if unclassified
    return component.filePath;
  }
  
  // Create path based on domain
  return path.join(FEATURES_DIR, component.domain, fileName);
}

/**
 * Move a component to its suggested path
 * @param {Object} component - Component information
 * @returns {Object} - Result of the operation
 */
async function moveComponent(component) {
  const suggestedPath = generateSuggestedPath(component);
  
  // Skip if the component is already in the right place
  if (component.filePath === suggestedPath) {
    return {
      component,
      success: true,
      skipped: true,
      message: 'Component already in the correct location'
    };
  }
  
  try {
    // Create parent directory if it doesn't exist
    const targetDir = path.dirname(suggestedPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy the component file
    fs.copyFileSync(component.filePath, suggestedPath);
    
    // Update paths in the new file (for imports)
    updateImportPaths(component.filePath, suggestedPath);
    
    // Don't remove the original file yet - we'll do that after we've updated all references
    
    success(`Moved component: ${component.filePath} -> ${suggestedPath}`);
    
    return {
      component,
      originalPath: component.filePath,
      newPath: suggestedPath,
      success: true
    };
  } catch (err) {
    error(`Failed to move component ${component.filePath}: ${err.message}`);
    
    return {
      component,
      success: false,
      error: err.message
    };
  }
}

/**
 * Update import paths in a file after moving it
 * @param {string} oldPath - Original file path
 * @param {string} newPath - New file path
 */
function updateImportPaths(oldPath, newPath) {
  if (!fs.existsSync(newPath)) return;
  
  try {
    let content = fs.readFileSync(newPath, 'utf8');
    const oldDir = path.dirname(oldPath);
    const newDir = path.dirname(newPath);
    
    // Find relative imports
    const importRegex = /import\s+.+\s+from\s+['"]([^'"]*)['"]/g;
    let match;
    let updated = false;
    
    // Replace each import with the updated path
    const updatedContent = content.replace(importRegex, (importStmt, importPath) => {
      // Only process relative imports
      if (importPath.startsWith('.')) {
        // Resolve absolute paths of import relative to old and new locations
        const absoluteImportPath = path.resolve(oldDir, importPath);
        const newRelativePath = path.relative(newDir, absoluteImportPath);
        
        // Ensure path starts with ./ or ../
        const formattedPath = newRelativePath.startsWith('.')
          ? newRelativePath
          : `./${newRelativePath}`;
        
        // Replace in the import statement
        updated = true;
        return importStmt.replace(importPath, formattedPath.replace(/\\/g, '/'));
      }
      
      return importStmt;
    });
    
    if (updated) {
      fs.writeFileSync(newPath, updatedContent);
      log(`Updated imports in ${newPath}`);
    }
  } catch (err) {
    warning(`Error updating imports in ${newPath}: ${err.message}`);
  }
}

/**
 * Update all references to a moved component
 * @param {Object} movedComponent - Information about the moved component
 * @param {Array<Object>} components - All components
 */
function updateReferences(movedComponent, components) {
  // Skip if component wasn't actually moved
  if (movedComponent.originalPath === movedComponent.newPath) return;
  
  components.forEach(component => {
    try {
      if (!fs.existsSync(component.filePath)) return;
      
      const content = fs.readFileSync(component.filePath, 'utf8');
      const dirPath = path.dirname(component.filePath);
      
      // Calculate relative paths from this component to the old and new locations
      const relativeOldPath = path.relative(dirPath, movedComponent.originalPath).replace(/\\/g, '/');
      const relativeNewPath = path.relative(dirPath, movedComponent.newPath).replace(/\\/g, '/');
      
      // Ensure paths start with ./ or ../
      const formattedOldPath = relativeOldPath.startsWith('.')
        ? relativeOldPath
        : `./${relativeOldPath}`;
      
      const formattedNewPath = relativeNewPath.startsWith('.')
        ? relativeNewPath
        : `./${relativeNewPath}`;
      
      // Replace imports
      const importRegex = new RegExp(`(from\\s+['"])${formattedOldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g');
      const updatedContent = content.replace(importRegex, `$1${formattedNewPath}$2`);
      
      if (updatedContent !== content) {
        fs.writeFileSync(component.filePath, updatedContent);
        log(`Updated references in ${component.filePath}`);
      }
    } catch (err) {
      warning(`Error updating references in ${component.filePath}: ${err.message}`);
    }
  });
}

/**
 * Create a report of the feature directory refinement
 * @param {Array<Object>} components - Component information
 * @param {Array<Object>} results - Results of the component moves
 */
function createReport(components, results) {
  // Count components by domain
  const domainCounts = {};
  components.forEach(component => {
    domainCounts[component.domain] = (domainCounts[component.domain] || 0) + 1;
  });
  
  // Get category analysis
  const categoryAnalysis = components.map(component => analyzeComponentCategory(component.filePath));
  
  const categoryCounts = {
    feature: categoryAnalysis.filter(a => a.category === 'feature').length,
    ui: categoryAnalysis.filter(a => a.category === 'ui').length,
    layout: categoryAnalysis.filter(a => a.category === 'layout').length,
    unknown: categoryAnalysis.filter(a => a.category === 'unknown').length
  };
  
  const reportContent = `# Features Directory Refinement Report

## Domain Analysis

Total components analyzed: ${components.length}

### Components by Domain
${Object.entries(domainCounts)
  .map(([domain, count]) => `- ${domain}: ${count} components`)
  .join('\n')}

### Category Analysis
${Object.entries(categoryCounts)
  .map(([category, count]) => `- ${category}: ${count} components`)
  .join('\n')}

## Move Results
- Total moves attempted: ${results.length}
- Successfully moved: ${results.filter(r => r.success && !r.skipped).length}
- Skipped: ${results.filter(r => r.skipped).length}
- Failed: ${results.filter(r => !r.success).length}

### Successfully Moved Components
${results.filter(r => r.success && !r.skipped)
  .map(r => `- ✅ \`${r.originalPath}\` -> \`${r.newPath}\``)
  .join('\n')}

### Skipped Components
${results.filter(r => r.skipped)
  .map(r => `- ⏩ \`${r.component.filePath}\`: ${r.message}`)
  .join('\n')}

### Failed Moves
${results.filter(r => !r.success)
  .map(r => `- ❌ \`${r.component.filePath}\`: ${r.error}`)
  .join('\n')}

## Components that Should be Moved to UI
${categoryAnalysis.filter(a => a.category === 'ui')
  .map(a => `- \`${a.filePath}\` -> \`${a.suggestedPath}\`\n  Reason: ${a.reason}`)
  .join('\n')}

## Components that Should be Moved to Layouts
${categoryAnalysis.filter(a => a.category === 'layout')
  .map(a => `- \`${a.filePath}\` -> \`${a.suggestedPath}\`\n  Reason: ${a.reason}`)
  .join('\n')}
`;

  fs.writeFileSync('docs/project-history/features-refinement-report.md', reportContent);
  success(`Report written to docs/project-history/features-refinement-report.md`);
}

/**
 * Main function to run the script
 */
async function main() {
  // Create git backup before making changes
  try {
    execSync('git branch -D features-refinement-backup 2>/dev/null || true', { stdio: 'pipe' });
    execSync('git checkout -b features-refinement-backup', { stdio: 'pipe' });
    execSync('git checkout -', { stdio: 'pipe' });
    success(`Created backup branch: features-refinement-backup`);
  } catch (err) {
    warning(`Could not create git backup branch: ${err.message}`);
  }
  
  // Find all feature components
  const featureComponentPaths = getAllFeatureComponents();
  log(`Found ${featureComponentPaths.length} feature components to analyze`);
  
  // Analyze each component to determine its domain
  let components = featureComponentPaths.map(determineDomain);
  log(`Domain analysis complete`);
  
  // Build dependency graph
  const dependencyGraph = buildDependencyGraph(components);
  log(`Dependency graph built`);
  
  // Refine domain assignments based on dependencies
  components = components.map(component => refineComponentDomain(dependencyGraph, component));
  log(`Domain refinement complete`);
  
  // Move components to their suggested domains
  const moveResults = [];
  for (const component of components) {
    const result = await moveComponent(component);
    moveResults.push(result);
  }
  
  // Update references to moved components
  for (const result of moveResults.filter(r => r.success && !r.skipped)) {
    updateReferences(result, components);
  }
  
  // Remove original files for successfully moved components
  for (const result of moveResults.filter(r => r.success && !r.skipped)) {
    try {
      fs.unlinkSync(result.originalPath);
      log(`Removed original file: ${result.originalPath}`);
    } catch (err) {
      warning(`Could not remove original file ${result.originalPath}: ${err.message}`);
    }
  }
  
  // Create a report
  createReport(components, moveResults);
  
  // Final summary
  const movedCount = moveResults.filter(r => r.success && !r.skipped).length;
  const skippedCount = moveResults.filter(r => r.skipped).length;
  const failCount = moveResults.filter(r => !r.success).length;
  
  log(`Features directory refinement completed.`);
  success(`Successfully moved ${movedCount} components.`);
  warning(`Skipped ${skippedCount} components (already in the right place).`);
  if (failCount > 0) {
    error(`Failed to move ${failCount} components. See the report for details.`);
  }
}

// Run the script
main().catch(err => {
  error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 
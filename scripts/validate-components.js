#!/usr/bin/env node

/**
 * UI Component Validation Script
 * 
 * This script validates UI components against a set of criteria:
 * 1. File structure (index.ts exports, naming conventions)
 * 2. Style guide compliance (uses design tokens, follows patterns)
 * 3. Technical quality (TypeScript typing, documentation)
 * 4. Basic rendering (loads without errors)
 * 
 * Usage:
 *   npm run validate:components
 *   npm run validate:components -- --component=Button
 *   npm run validate:components -- --category=atoms
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk'); // You may need to install this: npm install chalk

// Base paths
const UI_COMPONENTS_PATH = path.join(process.cwd(), 'src/components/ui');
const REGISTRY_PATH = path.join(process.cwd(), 'public/static/component-registry.json');

// Define categories and their paths
const CATEGORIES = {
  atoms: path.join(UI_COMPONENTS_PATH, 'atoms'),
  molecules: path.join(UI_COMPONENTS_PATH, 'molecules'),
  organisms: path.join(UI_COMPONENTS_PATH, 'organisms')
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  component: null,
  category: null,
  verbose: false
};

args.forEach(arg => {
  if (arg.startsWith('--component=')) {
    options.component = arg.split('=')[1];
  } else if (arg.startsWith('--category=')) {
    options.category = arg.split('=')[1];
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
});

/**
 * Main validation function
 */
async function validateComponents() {
  console.log(chalk.blue.bold('\n🔍 UI Component Validation'));
  console.log(chalk.blue('============================\n'));
  
  // Check if registry file exists
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(chalk.red('❌ Component registry file not found. Generate it first with: npm run generate:ui-registry'));
    process.exit(1);
  }
  
  // Load component registry
  let registry;
  try {
    const registryData = fs.readFileSync(REGISTRY_PATH, 'utf8');
    registry = JSON.parse(registryData);
    console.log(chalk.green(`✅ Registry loaded with ${registry.components ? registry.components.length : 0} components`));
  } catch (error) {
    console.error(chalk.red(`❌ Error loading registry: ${error.message}`));
    process.exit(1);
  }
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    components: {}
  };
  
  // Filter components to validate based on CLI options
  const componentsToValidate = [];
  
  // Get components to validate
  if (options.component) {
    // Find the component by name (case-insensitive)
    const componentName = options.component.toLowerCase();
    
    for (const category in CATEGORIES) {
      const categoryPath = CATEGORIES[category];
      
      if (fs.existsSync(categoryPath)) {
        const dirs = fs.readdirSync(categoryPath).filter(dir => 
          fs.statSync(path.join(categoryPath, dir)).isDirectory() && 
          dir.toLowerCase() === componentName.toLowerCase()
        );
        
        if (dirs.length > 0) {
          componentsToValidate.push({
            name: dirs[0],
            category,
            path: path.join(categoryPath, dirs[0])
          });
          break;
        }
      }
    }
    
    if (componentsToValidate.length === 0) {
      console.error(chalk.red(`❌ Component "${options.component}" not found in any category`));
      process.exit(1);
    }
  } else if (options.category) {
    // Validate all components in a specific category
    if (!CATEGORIES[options.category]) {
      console.error(chalk.red(`❌ Invalid category: ${options.category}. Valid categories: atoms, molecules, organisms`));
      process.exit(1);
    }
    
    const categoryPath = CATEGORIES[options.category];
    if (fs.existsSync(categoryPath)) {
      const dirs = fs.readdirSync(categoryPath).filter(dir => 
        fs.statSync(path.join(categoryPath, dir)).isDirectory()
      );
      
      dirs.forEach(dir => {
        componentsToValidate.push({
          name: dir,
          category: options.category,
          path: path.join(categoryPath, dir)
        });
      });
    }
  } else {
    // Validate all components in all categories
    for (const category in CATEGORIES) {
      const categoryPath = CATEGORIES[category];
      
      if (fs.existsSync(categoryPath)) {
        const dirs = fs.readdirSync(categoryPath).filter(dir => 
          fs.statSync(path.join(categoryPath, dir)).isDirectory()
        );
        
        dirs.forEach(dir => {
          componentsToValidate.push({
            name: dir,
            category,
            path: path.join(categoryPath, dir)
          });
        });
      }
    }
  }
  
  console.log(chalk.blue(`\nValidating ${componentsToValidate.length} components...\n`));
  
  // Validate each component
  for (const component of componentsToValidate) {
    const componentName = component.name;
    const componentPath = component.path;
    const category = component.category;
    
    console.log(chalk.cyan(`\n🔍 Validating ${componentName} (${category})...`));
    
    results.total++;
    results.components[componentName] = {
      category,
      results: {
        fileStructure: { passed: false, details: [] },
        styleGuide: { passed: false, details: [] },
        technicalQuality: { passed: false, details: [] },
        functionality: { passed: false, details: [] }
      },
      status: 'Not Verified'
    };
    
    // 1. Check file structure
    const fileStructureResult = validateFileStructure(componentName, componentPath);
    results.components[componentName].results.fileStructure = fileStructureResult;
    
    // 2. Check if component is in registry
    const registryResult = validateRegistry(componentName, componentPath, registry);
    results.components[componentName].results.technicalQuality.details.push({
      test: 'Registry Presence',
      passed: registryResult.passed,
      message: registryResult.message
    });
    
    // 3. Check style guide compliance (color tokens, etc.)
    const styleGuideResult = validateStyleGuide(componentName, componentPath);
    results.components[componentName].results.styleGuide = styleGuideResult;
    
    // 4. Check technical quality
    const technicalResult = validateTechnicalQuality(componentName, componentPath);
    
    // Merge registry check with other technical quality checks
    results.components[componentName].results.technicalQuality.details = [
      ...results.components[componentName].results.technicalQuality.details,
      ...technicalResult.details
    ];
    
    results.components[componentName].results.technicalQuality.passed = 
      registryResult.passed && 
      technicalResult.details.every(detail => detail.passed);
    
    // 5. We cannot check functionality automatically, mark as manual verification needed
    results.components[componentName].results.functionality = {
      passed: null,
      details: [{
        test: 'Manual Verification Required',
        passed: null,
        message: 'Functionality needs to be manually verified in browser'
      }]
    };
    
    // Determine overall status
    const fileStructurePassed = results.components[componentName].results.fileStructure.passed;
    const styleGuidePassed = results.components[componentName].results.styleGuide.passed;
    const technicalQualityPassed = results.components[componentName].results.technicalQuality.passed;
    
    if (fileStructurePassed && styleGuidePassed && technicalQualityPassed) {
      results.components[componentName].status = 'Partially Verified';
      console.log(chalk.yellow(`✓ ${componentName} is partially verified (manual checks needed)`));
      results.passed++;
    } else {
      results.components[componentName].status = 'Not Verified';
      console.log(chalk.red(`✗ ${componentName} has issues that need to be fixed`));
      results.failed++;
    }
  }
  
  // Print summary
  console.log(chalk.blue.bold('\n\n📊 Validation Summary'));
  console.log(chalk.blue('====================\n'));
  console.log(chalk.white(`Total components: ${results.total}`));
  console.log(chalk.green(`Passed: ${results.passed}`));
  console.log(chalk.red(`Failed: ${results.failed}`));
  console.log(chalk.yellow(`Skipped: ${results.skipped}`));
  
  // Generate detailed report
  generateReport(results);
  
  // Exit with appropriate code
  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

/**
 * Validate file structure of a component
 */
function validateFileStructure(componentName, componentPath) {
  const result = {
    passed: true,
    details: []
  };
  
  // Check for index.ts export file
  const indexPath = path.join(componentPath, 'index.ts');
  const hasIndexFile = fs.existsSync(indexPath);
  result.details.push({
    test: 'Index File',
    passed: hasIndexFile,
    message: hasIndexFile ? 'Has index.ts export file' : 'Missing index.ts export file'
  });
  
  // Check for main component file (PascalCase)
  const componentFileName = `${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.tsx`;
  const componentFilePath = path.join(componentPath, componentFileName);
  const hasComponentFile = fs.existsSync(componentFilePath);
  result.details.push({
    test: 'Component File',
    passed: hasComponentFile,
    message: hasComponentFile ? `Has ${componentFileName}` : `Missing ${componentFileName}`
  });
  
  // Check directory naming follows lowercase convention
  const dirNameCorrect = componentPath.split(path.sep).pop() === componentName.toLowerCase();
  result.details.push({
    test: 'Directory Naming',
    passed: dirNameCorrect,
    message: dirNameCorrect ? 'Directory name follows convention' : 'Directory name does not follow lowercase convention'
  });
  
  // Update overall result
  result.passed = result.details.every(detail => detail.passed);
  
  return result;
}

/**
 * Validate if component is in registry
 */
function validateRegistry(componentName, componentPath, registry) {
  const relativePath = path.relative(process.cwd(), componentPath).replace(/\\/g, '/');
  
  if (!registry || !registry.components || !Array.isArray(registry.components)) {
    return {
      passed: false,
      message: 'Registry is invalid or empty'
    };
  }
  
  // Try to find component in registry by path or name
  const matchingComponent = registry.components.find(comp => {
    const compPath = comp.path || '';
    return compPath.includes(relativePath) || 
           comp.name?.toLowerCase() === componentName.toLowerCase();
  });
  
  if (matchingComponent) {
    return {
      passed: true,
      message: 'Component found in registry'
    };
  } else {
    return {
      passed: false,
      message: 'Component not found in registry'
    };
  }
}

/**
 * Validate style guide compliance
 */
function validateStyleGuide(componentName, componentPath) {
  const result = {
    passed: true,
    details: []
  };
  
  try {
    // Get all tsx/ts files in the component directory
    const files = getComponentFiles(componentPath);
    
    // Check for proper color token usage
    const colorCheckResult = checkColorTokens(files);
    result.details.push(colorCheckResult);
    
    // Check for spacing variables
    const spacingCheckResult = checkSpacingTokens(files);
    result.details.push(spacingCheckResult);
    
    // Check for typography tokens
    const typographyCheckResult = checkTypographyTokens(files);
    result.details.push(typographyCheckResult);
    
    // Check for responsive design patterns
    const responsiveCheckResult = checkResponsivePatterns(files);
    result.details.push(responsiveCheckResult);
    
    // Check for accessibility attributes
    const a11yCheckResult = checkAccessibility(files);
    result.details.push(a11yCheckResult);
    
    // Update overall result
    result.passed = result.details.every(detail => detail.passed);
  } catch (error) {
    result.passed = false;
    result.details.push({
      test: 'Style Guide Check',
      passed: false,
      message: `Error checking style guide compliance: ${error.message}`
    });
  }
  
  return result;
}

/**
 * Validate technical quality
 */
function validateTechnicalQuality(componentName, componentPath) {
  const result = {
    passed: true,
    details: []
  };
  
  try {
    // Get all tsx/ts files in the component directory
    const files = getComponentFiles(componentPath);
    
    // Check for TypeScript interfaces
    const typesCheckResult = checkTypeScriptInterfaces(files);
    result.details.push(typesCheckResult);
    
    // Check for JSDoc documentation
    const docCheckResult = checkJSDocComments(files);
    result.details.push(docCheckResult);
    
    // Check for test files
    const testCheckResult = checkTestFiles(componentPath);
    result.details.push(testCheckResult);
  } catch (error) {
    result.details.push({
      test: 'Technical Quality Check',
      passed: false,
      message: `Error checking technical quality: ${error.message}`
    });
  }
  
  return result;
}

/**
 * Helper function to get all component files
 */
function getComponentFiles(componentPath) {
  const files = [];
  
  const dirEntries = fs.readdirSync(componentPath, { withFileTypes: true });
  
  dirEntries.forEach(entry => {
    if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      const filePath = path.join(componentPath, entry.name);
      const content = fs.readFileSync(filePath, 'utf8');
      files.push({ path: filePath, content });
    } else if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      // Recursively get files from subdirectories
      const subFiles = getComponentFiles(path.join(componentPath, entry.name));
      files.push(...subFiles);
    }
  });
  
  return files;
}

/**
 * Check if component uses color tokens
 */
function checkColorTokens(files) {
  const colorTokens = [
    '333333', '4A5568', '00BFFF', // Direct hex values
    'primary', 'secondary', 'accent', // Token names
    'theme', 'colors.', 'tokens.' // Possible token patterns
  ];
  
  let hasColorTokens = false;
  let hasHardcodedColors = false;
  
  for (const file of files) {
    // Check for color token usage
    if (colorTokens.some(token => file.content.includes(token))) {
      hasColorTokens = true;
    }
    
    // Check for hardcoded colors (common formats)
    const hexColorRegex = /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g;
    const rgbColorRegex = /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;
    const hslColorRegex = /hsl\s*\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)/g;
    
    if (hexColorRegex.test(file.content) || 
        rgbColorRegex.test(file.content) || 
        hslColorRegex.test(file.content)) {
      hasHardcodedColors = true;
    }
  }
  
  return {
    test: 'Color Tokens',
    passed: hasColorTokens && !hasHardcodedColors,
    message: hasColorTokens && !hasHardcodedColors
      ? 'Uses color tokens properly'
      : hasColorTokens
        ? 'Uses color tokens but also has hardcoded colors'
        : 'No color tokens found'
  };
}

/**
 * Check if component uses spacing tokens
 */
function checkSpacingTokens(files) {
  const spacingTokens = [
    'spacing.', 'space-', 'spacing(', 'gap: ',
    'margin', 'padding', 'theme.spacing'
  ];
  
  // Look for hardcoded pixel values in spacing properties
  const hardcodedSpacingRegex = /(margin|padding|gap|top|bottom|left|right|inset):\s*\d+px/g;
  
  let hasSpacingTokens = false;
  let hasHardcodedSpacing = false;
  
  for (const file of files) {
    // Check for spacing token usage
    if (spacingTokens.some(token => file.content.includes(token))) {
      hasSpacingTokens = true;
    }
    
    // Check for hardcoded spacing
    if (hardcodedSpacingRegex.test(file.content)) {
      hasHardcodedSpacing = true;
    }
  }
  
  return {
    test: 'Spacing Tokens',
    passed: hasSpacingTokens && !hasHardcodedSpacing,
    message: hasSpacingTokens && !hasHardcodedSpacing
      ? 'Uses spacing tokens properly'
      : hasSpacingTokens
        ? 'Uses spacing tokens but also has hardcoded spacing'
        : 'No spacing tokens found'
  };
}

/**
 * Check if component uses typography tokens
 */
function checkTypographyTokens(files) {
  const typographyTokens = [
    'typography.', 'fontSize', 'fontWeight', 'lineHeight',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
    'font-normal', 'font-medium', 'font-semibold', 'font-bold'
  ];
  
  let hasTypographyTokens = false;
  
  for (const file of files) {
    // Check for typography token usage
    if (typographyTokens.some(token => file.content.includes(token))) {
      hasTypographyTokens = true;
      break;
    }
  }
  
  return {
    test: 'Typography Tokens',
    passed: hasTypographyTokens,
    message: hasTypographyTokens
      ? 'Uses typography tokens'
      : 'No typography tokens found'
  };
}

/**
 * Check if component has responsive patterns
 */
function checkResponsivePatterns(files) {
  const responsivePatterns = [
    '@media', 'sm:', 'md:', 'lg:', 'xl:', '2xl:',
    'useMediaQuery', 'useBreakpoint',
    'flex-col', 'flex-row',
    'responsive', 'mobile', 'desktop'
  ];
  
  let hasResponsivePatterns = false;
  
  for (const file of files) {
    // Check for responsive pattern usage
    if (responsivePatterns.some(pattern => file.content.includes(pattern))) {
      hasResponsivePatterns = true;
      break;
    }
  }
  
  return {
    test: 'Responsive Patterns',
    passed: hasResponsivePatterns,
    message: hasResponsivePatterns
      ? 'Uses responsive design patterns'
      : 'No responsive design patterns found'
  };
}

/**
 * Check if component has accessibility attributes
 */
function checkAccessibility(files) {
  const a11yPatterns = [
    'aria-', 'role=', 'tabIndex', 'onKeyDown', 'onKeyPress',
    'alt=', 'htmlFor=', 'accessibilityLabel', 'screen-reader',
    'visually-hidden', 'focusable'
  ];
  
  let hasA11yFeatures = false;
  
  for (const file of files) {
    // Check for accessibility features
    if (a11yPatterns.some(pattern => file.content.includes(pattern))) {
      hasA11yFeatures = true;
      break;
    }
  }
  
  return {
    test: 'Accessibility',
    passed: hasA11yFeatures,
    message: hasA11yFeatures
      ? 'Uses accessibility attributes'
      : 'No accessibility attributes found'
  };
}

/**
 * Check if component has TypeScript interfaces for props
 */
function checkTypeScriptInterfaces(files) {
  let hasInterfaces = false;
  
  for (const file of files) {
    // Look for interface/type declarations for props
    if (file.content.includes('interface') && file.content.includes('Props') ||
        file.content.includes('type') && file.content.includes('Props =')) {
      hasInterfaces = true;
      break;
    }
  }
  
  return {
    test: 'TypeScript Interfaces',
    passed: hasInterfaces,
    message: hasInterfaces
      ? 'Has TypeScript interfaces for props'
      : 'No TypeScript interfaces found'
  };
}

/**
 * Check if component has proper JSDoc comments
 */
function checkJSDocComments(files) {
  let hasJSDoc = false;
  
  for (const file of files) {
    // Look for JSDoc comments
    if (file.content.includes('/**') && 
        file.content.includes('*/') && 
        (file.content.includes('@param') || file.content.includes('@returns'))) {
      hasJSDoc = true;
      break;
    }
  }
  
  return {
    test: 'JSDoc Documentation',
    passed: hasJSDoc,
    message: hasJSDoc
      ? 'Has JSDoc documentation'
      : 'No JSDoc documentation found'
  };
}

/**
 * Check if component has test files
 */
function checkTestFiles(componentPath) {
  // Look for test files with common patterns
  const testPatterns = ['spec.tsx', 'spec.ts', 'test.tsx', 'test.ts', '__tests__'];
  let hasTestFiles = false;
  
  // Check in component directory
  const dirEntries = fs.readdirSync(componentPath, { withFileTypes: true });
  
  for (const entry of dirEntries) {
    if (entry.isFile() && testPatterns.some(pattern => entry.name.includes(pattern))) {
      hasTestFiles = true;
      break;
    }
    
    if (entry.isDirectory() && entry.name === '__tests__') {
      hasTestFiles = true;
      break;
    }
  }
  
  // If not found, check if there's a parent __tests__ directory
  if (!hasTestFiles) {
    const parentDir = path.dirname(componentPath);
    const testDir = path.join(parentDir, '__tests__');
    
    if (fs.existsSync(testDir)) {
      // Check if any tests mention this component
      const componentName = path.basename(componentPath);
      const testFiles = fs.readdirSync(testDir).filter(file => 
        file.includes(componentName) && 
        (file.endsWith('.test.tsx') || file.endsWith('.test.ts') || 
         file.endsWith('.spec.tsx') || file.endsWith('.spec.ts'))
      );
      
      hasTestFiles = testFiles.length > 0;
    }
  }
  
  return {
    test: 'Test Files',
    passed: hasTestFiles,
    message: hasTestFiles
      ? 'Has test files'
      : 'No test files found'
  };
}

/**
 * Generate a detailed report
 */
function generateReport(results) {
  const reportPath = path.join(process.cwd(), 'validation-report.md');
  
  let reportContent = `# UI Component Validation Report\n\n`;
  reportContent += `Generated on: ${new Date().toISOString()}\n\n`;
  reportContent += `## Summary\n\n`;
  reportContent += `- Total components: ${results.total}\n`;
  reportContent += `- Passed: ${results.passed}\n`;
  reportContent += `- Failed: ${results.failed}\n`;
  reportContent += `- Skipped: ${results.skipped}\n\n`;
  
  reportContent += `## Component Details\n\n`;
  
  // Group by category
  const categorizedComponents = {};
  
  for (const [name, data] of Object.entries(results.components)) {
    if (!categorizedComponents[data.category]) {
      categorizedComponents[data.category] = [];
    }
    categorizedComponents[data.category].push({ name, ...data });
  }
  
  // Generate report for each category
  for (const [category, components] of Object.entries(categorizedComponents)) {
    reportContent += `### ${category}\n\n`;
    
    components.forEach(component => {
      const status = component.status === 'Partially Verified' ? '🟠' : '🔴';
      reportContent += `#### ${component.name} ${status}\n\n`;
      
      // File Structure
      reportContent += `##### File Structure\n\n`;
      component.results.fileStructure.details.forEach(detail => {
        const icon = detail.passed ? '✅' : '❌';
        reportContent += `- ${icon} **${detail.test}**: ${detail.message}\n`;
      });
      reportContent += '\n';
      
      // Style Guide
      reportContent += `##### Style Guide\n\n`;
      component.results.styleGuide.details.forEach(detail => {
        const icon = detail.passed ? '✅' : detail.passed === null ? '⚠️' : '❌';
        reportContent += `- ${icon} **${detail.test}**: ${detail.message}\n`;
      });
      reportContent += '\n';
      
      // Technical Quality
      reportContent += `##### Technical Quality\n\n`;
      component.results.technicalQuality.details.forEach(detail => {
        const icon = detail.passed ? '✅' : detail.passed === null ? '⚠️' : '❌';
        reportContent += `- ${icon} **${detail.test}**: ${detail.message}\n`;
      });
      reportContent += '\n';
      
      // Functionality
      reportContent += `##### Functionality\n\n`;
      component.results.functionality.details.forEach(detail => {
        const icon = detail.passed ? '✅' : detail.passed === null ? '⚠️' : '❌';
        reportContent += `- ${icon} **${detail.test}**: ${detail.message}\n`;
      });
      reportContent += '\n';
    });
  }
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(chalk.green(`\n✅ Detailed report generated at ${reportPath}`));
}

// Execute the validation
validateComponents().catch(error => {
  console.error(chalk.red(`❌ Validation failed: ${error.message}`));
  process.exit(1);
}); 
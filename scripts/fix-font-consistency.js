#!/usr/bin/env node

/**
 * Advanced Font Consistency Checker and Fixer
 * ==========================================
 * 
 * This script analyzes and fixes font family inconsistencies across the application
 * using advanced Abstract Syntax Tree (AST) parsing and intelligent heuristics.
 * 
 * Key features:
 * 1. Ensures all headings (h1-h6) and section titles use font-sora
 * 2. Ensures all UI elements, labels, and form elements use font-work-sans
 * 3. Fixes inconsistent text styling in components
 * 4. Analyzes parent-child relationships to avoid redundant font classes
 * 5. Supports CSS/SCSS files in addition to JSX/TSX
 * 6. Handles dynamic class compositions and template literals
 * 7. Provides undo functionality via backup files
 * 8. Respects existing design system patterns
 * 9. Optimized for performance with caching
 * 
 * Usage:
 *   node scripts/fix-font-consistency.js                # Fix all font issues
 *   node scripts/fix-font-consistency.js --dry-run      # Check without making changes
 *   node scripts/fix-font-consistency.js --path=src/app/campaigns  # Target specific directory
 *   node scripts/fix-font-consistency.js --file=src/app/campaigns/wizard/step-1/Step1Content.tsx # Target specific file
 *   node scripts/fix-font-consistency.js --stats        # Show statistics only
 *   node scripts/fix-font-consistency.js --css          # Include CSS/SCSS files
 *   node scripts/fix-font-consistency.js --undo         # Revert previous changes
 *   node scripts/fix-font-consistency.js --advanced     # Use advanced heuristics
 *   node scripts/fix-font-consistency.js --config=path/to/config.json # Use custom configuration
 *   node scripts/fix-font-consistency.js --optimize     # Apply optimizations and deduplicate
 *   node scripts/fix-font-consistency.js --validate     # Run validation tests after changes
 * 
 * Created by: Claude 3.7 Sonnet
 * Version: 1.0.0
 * Last updated: March 2025
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const postcss = require('postcss');
const scss = require('postcss-scss');
const cssfontparser = require('css-font-parser');
const { createHash } = require('crypto');

// Fix the chalk ESM compatibility issue by using a simpler color utility
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// Process command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const showStatsOnly = args.includes('--stats');
const includeCss = args.includes('--css');
const useUndo = args.includes('--undo');
const useAdvancedHeuristics = args.includes('--advanced');
const useOptimizations = args.includes('--optimize');
const validateAfter = args.includes('--validate');
const targetPathArg = args.find(arg => arg.startsWith('--path='));
const targetFileArg = args.find(arg => arg.startsWith('--file='));
const configFileArg = args.find(arg => arg.startsWith('--config='));

const targetPath = targetPathArg ? targetPathArg.split('=')[1] : 'src';
const targetFile = targetFileArg ? targetFileArg.split('=')[1] : null;
const configFile = configFileArg ? configFileArg.split('=')[1] : null;

// Create backup directory for undo functionality
const BACKUP_DIR = path.join(__dirname, '.font-consistency-backups');
const SESSION_ID = new Date().toISOString().replace(/[:.]/g, '-');
const SESSION_BACKUP_DIR = path.join(BACKUP_DIR, SESSION_ID);

if (useUndo) {
  restoreFromBackup();
} else if (!isDryRun && !showStatsOnly) {
  ensureBackupDir();
}

// Default configuration
let config = {
  // Font families
  headingFont: 'font-sora',
  uiFont: 'font-work-sans',
  
  // Element selectors that should use heading font
  headingSelectors: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
    'title', 'heading', 'header'
  ],
  
  // Element selectors that should use UI font
  uiElementSelectors: [
    'label', 'input', 'button', 'select', 
    'textarea', 'p', 'span', 'div', 'a', 
    'li', 'ul', 'ol', 'nav', 'footer'
  ],
  
  // Class name patterns that indicate heading elements
  headingClassPatterns: [
    'heading', 'title', 'header', '-title', 
    '-header', 'sectionTitle', 'section-title',
    'page-title', 'card-header', 'modal-title'
  ],
  
  // Class name patterns that indicate UI elements
  uiClassPatterns: [
    'label', 'form-label', 'field-label', 
    'input-label', 'button', 'btn', 'input', 
    'select', 'form-control', 'card-body',
    'description', 'text', 'content'
  ],
  
  // Advanced parent-child relationship rules
  relationshipRules: [
    { parent: 'card-header', child: '*', font: 'heading' },
    { parent: 'modal-header', child: '*', font: 'heading' },
    { parent: 'form', child: '*', font: 'ui' },
    { parent: 'nav', child: '*', font: 'ui' }
  ],
  
  // Components that should always use specific fonts
  componentOverrides: {
    'Button': 'ui',
    'Heading': 'heading',
    'Title': 'heading',
    'Input': 'ui',
    'Label': 'ui',
    'FormField': 'ui'
  },
  
  // Files to exclude
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    '.next/**',
    '**/*.test.{tsx,jsx}',
    '**/*.spec.{tsx,jsx}'
  ]
};

// Load custom configuration if provided
if (configFile && fs.existsSync(configFile)) {
  try {
    const customConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    config = { ...config, ...customConfig };
    logInfo(`Loaded custom configuration from ${configFile}`);
  } catch (error) {
    logWarning(`Error loading custom configuration: ${error.message}`);
    logWarning('Using default configuration instead');
  }
}

// Statistics object
const stats = {
  filesScanned: 0,
  filesModified: 0,
  headingFontAdded: 0,
  uiFontAdded: 0,
  redundantFontClassesRemoved: 0,
  cssFilesScanned: 0,
  cssFilesModified: 0,
  parsingErrors: 0,
  fileTypes: {
    tsx: 0,
    jsx: 0,
    css: 0,
    scss: 0
  },
  componentStats: {}
};

// Cache to improve performance on large codebases
const cache = {
  parsedFiles: new Map(),
  modifiedFiles: new Set(),
  fileHashes: new Map()
};

// Console colors
const logSuccess = msg => console.log(colors.green(msg));
const logInfo = msg => console.log(colors.blue(msg));
const logWarning = msg => console.log(colors.yellow(msg));
const logError = msg => console.log(colors.red(msg));
const logTitle = msg => console.log(colors.bold(colors.cyan(msg)));
const logSubtitle = msg => console.log(colors.magenta(msg));

/**
 * Calculate hash of file content for cache validation
 */
function calculateFileHash(content) {
  return createHash('md5').update(content).digest('hex');
}

/**
 * Create backup directory structure
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(SESSION_BACKUP_DIR)) {
    fs.mkdirSync(SESSION_BACKUP_DIR, { recursive: true });
  }
}

/**
 * Backup a file before modifying it
 */
function backupFile(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupFilePath = path.join(SESSION_BACKUP_DIR, relativePath);
  
  // Create directory structure for backup
  const backupDir = path.dirname(backupFilePath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.writeFileSync(backupFilePath, content, 'utf8');
}

/**
 * Restore files from the most recent backup
 */
function restoreFromBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    logError('No backups found. Cannot undo changes.');
    process.exit(1);
  }
  
  // Find the most recent backup directory
  const backupDirs = fs.readdirSync(BACKUP_DIR)
    .map(dir => path.join(BACKUP_DIR, dir))
    .filter(dir => fs.statSync(dir).isDirectory())
    .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
  
  if (backupDirs.length === 0) {
    logError('No backup sessions found. Cannot undo changes.');
    process.exit(1);
  }
  
  const latestBackupDir = backupDirs[0];
  logInfo(`Restoring from backup: ${path.basename(latestBackupDir)}`);
  
  // Recursively restore all files from backup
  let restoredCount = 0;
  restoreFilesFromDir(latestBackupDir, process.cwd(), restoredCount);
  
  logSuccess(`Restored ${restoredCount} files from backup.`);
  process.exit(0);
}

/**
 * Helper function to recursively restore files from a directory
 */
function restoreFilesFromDir(sourceDir, targetDir, count) {
  const files = fs.readdirSync(sourceDir);
  
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // Create directory if it doesn't exist
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      restoreFilesFromDir(sourcePath, targetPath, count);
    } else {
      // Restore file
      fs.copyFileSync(sourcePath, targetPath);
      logInfo(`Restored: ${path.relative(process.cwd(), targetPath)}`);
      count++;
    }
  }
}

/**
 * Finds files to process based on configuration
 */
async function findFilesToProcess() {
  let patterns = [];
  
  if (targetFile) {
    return [targetFile];
  }
  
  if (targetPath.endsWith('.tsx') || targetPath.endsWith('.jsx') || 
      targetPath.endsWith('.css') || targetPath.endsWith('.scss')) {
    return [targetPath];
  }
  
  // Add JSX/TSX files
  patterns.push(path.join(targetPath, '**/*.{tsx,jsx}'));
  
  // Add CSS/SCSS files if requested
  if (includeCss) {
    patterns.push(path.join(targetPath, '**/*.{css,scss}'));
  }
  
  try {
    // Use multiple glob patterns with excludes
    const files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { ignore: config.excludePatterns });
      files.push(...matches);
    }
    
    return [...new Set(files)]; // Remove duplicates
  } catch (error) {
    logError(`Error finding files: ${error.message}`);
    return [];
  }
}

/**
 * Checks if a className string includes any pattern from the given array
 * Enhanced to handle multiple formats (string literal, template literal, etc.)
 */
function hasClassNamePattern(className, patterns) {
  if (!className) return false;
  
  // Handle both string and object representations
  const classStr = typeof className === 'object' ? JSON.stringify(className) : className;
  
  return patterns.some(pattern => 
    classStr.includes(pattern) || 
    classStr.match(new RegExp(`\\b${pattern}\\b`, 'i'))
  );
}

/**
 * Check if a JSX element needs heading font based on various criteria
 * Enhanced with more sophisticated detection logic
 */
function needsHeadingFont(path) {
  const { node } = path;
  
  // Skip if no opening element or name
  if (!node.openingElement || !node.openingElement.name) return false;
  
  // Check component name for componentOverrides
  if (node.openingElement.name.name && 
      config.componentOverrides[node.openingElement.name.name] === 'heading') {
    return true;
  }
  
  // Check tag name for headings
  if (node.openingElement.name.name) {
    const tagName = node.openingElement.name.name.toLowerCase();
    if (config.headingSelectors.includes(tagName)) {
      return true;
    }
  }
  
  // Check className for heading patterns (handling various formats)
  const classNameAttr = node.openingElement.attributes.find(
    attr => attr.name && attr.name.name === 'className'
  );
  
  if (classNameAttr) {
    // Handle string literal
    if (t.isStringLiteral(classNameAttr.value)) {
      if (hasClassNamePattern(classNameAttr.value.value, config.headingClassPatterns)) {
        return true;
      }
    }
    // Handle template literal
    else if (t.isJSXExpressionContainer(classNameAttr.value) && 
             t.isTemplateLiteral(classNameAttr.value.expression)) {
      const quasis = classNameAttr.value.expression.quasis.map(q => q.value.raw);
      if (quasis.some(q => hasClassNamePattern(q, config.headingClassPatterns))) {
        return true;
      }
    }
    // Handle expressions like `className={styles.heading}`
    else if (t.isJSXExpressionContainer(classNameAttr.value)) {
      const expr = classNameAttr.value.expression;
      if ((t.isMemberExpression(expr) && 
           t.isIdentifier(expr.property) && 
           hasClassNamePattern(expr.property.name, config.headingClassPatterns)) ||
          (t.isIdentifier(expr) && 
           hasClassNamePattern(expr.name, config.headingClassPatterns))) {
        return true;
      }
    }
  }
  
  // Check for advanced parent-child relationships if enabled
  if (useAdvancedHeuristics) {
    // Check if any parent has a className that would make this element a heading
    let parentPath = path.parentPath;
    while (parentPath && parentPath.node) {
      if (parentPath.node.type === 'JSXElement' && 
          parentPath.node.openingElement && 
          parentPath.node.openingElement.attributes) {
        
        const parentClassAttr = parentPath.node.openingElement.attributes.find(
          attr => attr.name && attr.name.name === 'className'
        );
        
        if (parentClassAttr && t.isStringLiteral(parentClassAttr.value)) {
          const parentClass = parentClassAttr.value.value;
          
          // Check for parent-child relationship rules
          for (const rule of config.relationshipRules) {
            if (hasClassNamePattern(parentClass, [rule.parent]) && rule.font === 'heading') {
              return true;
            }
          }
        }
      }
      parentPath = parentPath.parentPath;
    }
  }
  
  return false;
}

/**
 * Check if a JSX element needs UI font based on various criteria
 * Enhanced with more sophisticated detection logic
 */
function needsUIFont(path) {
  const { node } = path;
  
  // Skip if no opening element or name
  if (!node.openingElement || !node.openingElement.name) return false;
  
  // Check component name for componentOverrides
  if (node.openingElement.name.name && 
      config.componentOverrides[node.openingElement.name.name] === 'ui') {
    return true;
  }
  
  // Check tag name for UI elements
  if (node.openingElement.name.name) {
    const tagName = node.openingElement.name.name.toLowerCase();
    if (config.uiElementSelectors.includes(tagName)) {
      return true;
    }
  }
  
  // Check className for UI patterns (handling various formats)
  const classNameAttr = node.openingElement.attributes.find(
    attr => attr.name && attr.name.name === 'className'
  );
  
  if (classNameAttr) {
    // Handle string literal
    if (t.isStringLiteral(classNameAttr.value)) {
      if (hasClassNamePattern(classNameAttr.value.value, config.uiClassPatterns)) {
        return true;
      }
    }
    // Handle template literal
    else if (t.isJSXExpressionContainer(classNameAttr.value) && 
             t.isTemplateLiteral(classNameAttr.value.expression)) {
      const quasis = classNameAttr.value.expression.quasis.map(q => q.value.raw);
      if (quasis.some(q => hasClassNamePattern(q, config.uiClassPatterns))) {
        return true;
      }
    }
    // Handle expressions like `className={styles.button}`
    else if (t.isJSXExpressionContainer(classNameAttr.value)) {
      const expr = classNameAttr.value.expression;
      if ((t.isMemberExpression(expr) && 
           t.isIdentifier(expr.property) && 
           hasClassNamePattern(expr.property.name, config.uiClassPatterns)) ||
          (t.isIdentifier(expr) && 
           hasClassNamePattern(expr.name, config.uiClassPatterns))) {
        return true;
      }
    }
  }
  
  // Check for advanced parent-child relationships if enabled
  if (useAdvancedHeuristics) {
    // Check if any parent has a className that would make this element a UI element
    let parentPath = path.parentPath;
    while (parentPath && parentPath.node) {
      if (parentPath.node.type === 'JSXElement' && 
          parentPath.node.openingElement && 
          parentPath.node.openingElement.attributes) {
        
        const parentClassAttr = parentPath.node.openingElement.attributes.find(
          attr => attr.name && attr.name.name === 'className'
        );
        
        if (parentClassAttr && t.isStringLiteral(parentClassAttr.value)) {
          const parentClass = parentClassAttr.value.value;
          
          // Check for parent-child relationship rules
          for (const rule of config.relationshipRules) {
            if (hasClassNamePattern(parentClass, [rule.parent]) && rule.font === 'ui') {
              return true;
            }
          }
        }
      }
      parentPath = parentPath.parentPath;
    }
  }
  
  return false;
}

/**
 * Updates className to include proper font class
 * Enhanced to handle different class formats and deduplication
 */
function updateClassName(path, fontClass) {
  const { node } = path;
  const isHeadingFont = fontClass === config.headingFont;
  const oppositeFont = isHeadingFont ? config.uiFont : config.headingFont;
  const classNameAttr = node.openingElement.attributes.find(
    attr => attr.name && attr.name.name === 'className'
  );
  
  // Handle string literal className
  if (classNameAttr && t.isStringLiteral(classNameAttr.value)) {
    const currentClasses = classNameAttr.value.value.split(/\s+/);
    
    // Skip if already has the font class
    if (currentClasses.includes(fontClass)) {
      return false;
    }
    
    // Remove opposite font class if it exists (for optimization)
    const filteredClasses = currentClasses.filter(cls => cls !== oppositeFont);
    if (useOptimizations && currentClasses.length !== filteredClasses.length) {
      stats.redundantFontClassesRemoved++;
    }
    
    // Add new font class
    filteredClasses.push(fontClass);
    classNameAttr.value.value = filteredClasses.join(' ');
    return true;
  }
  // Handle template literals
  else if (classNameAttr && t.isJSXExpressionContainer(classNameAttr.value) && 
           t.isTemplateLiteral(classNameAttr.value.expression)) {
    const expr = classNameAttr.value.expression;
    
    // Check if font class is already in any of the template quasis
    const quasis = expr.quasis.map(q => q.value.raw);
    if (quasis.some(q => q.includes(fontClass))) {
      return false;
    }
    
    // Add to the last quasi
    const lastQuasi = expr.quasis[expr.quasis.length - 1];
    lastQuasi.value.raw = `${lastQuasi.value.raw.trimEnd()} ${fontClass}`;
    lastQuasi.value.cooked = `${lastQuasi.value.cooked.trimEnd()} ${fontClass}`;
    return true;
  }
  // Handle className={styles.something}
  else if (classNameAttr && t.isJSXExpressionContainer(classNameAttr.value)) {
    // Convert to a combined approach with string literal
    // className={styles.something} -> className={`${styles.something} font-sora`}
    const originalExpr = classNameAttr.value.expression;
    const newExpr = t.templateLiteral(
      [
        t.templateElement({ raw: '', cooked: '' }, false),
        t.templateElement({ raw: ` ${fontClass}`, cooked: ` ${fontClass}` }, true)
      ],
      [originalExpr]
    );
    classNameAttr.value.expression = newExpr;
    return true;
  }
  // Add new className attribute if none exists
  else {
    node.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('className'),
        t.stringLiteral(fontClass)
      )
    );
    return true;
  }
}

/**
 * Process a single JSX/TSX file to check and fix font consistency
 */
function processJsxFile(filePath) {
  try {
    // Update statistics
    stats.filesScanned++;
    const fileExt = path.extname(filePath).slice(1);
    stats.fileTypes[fileExt] = (stats.fileTypes[fileExt] || 0) + 1;
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileHash = calculateFileHash(fileContent);
    
    // Skip unchanged files using cache (performance optimization)
    if (cache.fileHashes.has(filePath) && cache.fileHashes.get(filePath) === fileHash) {
      if (verbose) logInfo(`Skipping unchanged file: ${filePath}`);
      return false;
    }
    
    // Update cache
    cache.fileHashes.set(filePath, fileHash);
    
    // Skip files that don't contain relevant content (for performance)
    if (!fileContent.includes('className') && 
        !fileContent.includes('<h') &&
        !fileContent.includes('<label') &&
        !fileContent.includes('<p ') &&
        !fileContent.includes('<span ') &&
        !fileContent.includes('<div ')) {
      return false;
    }
    
    // Parse the file with @babel/parser
    const ast = parser.parse(fileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
    });
    
    let modified = false;
    
    // Traverse and modify AST
    traverse(ast, {
      JSXElement(path) {
        // Check for heading font needs
        if (needsHeadingFont(path)) {
          if (updateClassName(path, config.headingFont)) {
            stats.headingFontAdded++;
            modified = true;
            
            // Track component stats
            const componentName = path.node.openingElement.name.name;
            if (componentName) {
              stats.componentStats[componentName] = stats.componentStats[componentName] || { heading: 0, ui: 0 };
              stats.componentStats[componentName].heading++;
            }
          }
        }
        // Check for UI font needs
        else if (needsUIFont(path)) {
          if (updateClassName(path, config.uiFont)) {
            stats.uiFontAdded++;
            modified = true;
            
            // Track component stats
            const componentName = path.node.openingElement.name.name;
            if (componentName) {
              stats.componentStats[componentName] = stats.componentStats[componentName] || { heading: 0, ui: 0 };
              stats.componentStats[componentName].ui++;
            }
          }
        }
      }
    });
    
    // Save changes if file was modified
    if (modified && !isDryRun && !showStatsOnly) {
      // Backup file before modifying
      backupFile(filePath, fileContent);
      
      const output = generate(ast, { 
        retainLines: true,
        jsescOption: { minimal: true }  // Preserve string format
      }, fileContent);
      
      fs.writeFileSync(filePath, output.code, 'utf8');
      stats.filesModified++;
      logSuccess(`✓ Fixed font inconsistencies in ${filePath}`);
      
      // Store in cache
      cache.modifiedFiles.add(filePath);
    } else if (modified) {
      stats.filesModified++; // Count for stats even in dry run mode
      logInfo(`Would fix font inconsistencies in ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    stats.parsingErrors++;
    logError(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Process a CSS/SCSS file to check and fix font consistency
 */
function processCssFile(filePath) {
  try {
    // Update statistics
    stats.filesScanned++;
    stats.cssFilesScanned++;
    const fileExt = path.extname(filePath).slice(1);
    stats.fileTypes[fileExt] = (stats.fileTypes[fileExt] || 0) + 1;
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileHash = calculateFileHash(fileContent);
    
    // Skip unchanged files using cache
    if (cache.fileHashes.has(filePath) && cache.fileHashes.get(filePath) === fileHash) {
      return false;
    }
    
    // Update cache
    cache.fileHashes.set(filePath, fileHash);
    
    // Skip if no font classes are mentioned
    if (!fileContent.includes('font-') && 
        !fileContent.includes('font-family') && 
        !fileContent.includes('typography')) {
      return false;
    }
    
    let modified = false;
    let processedCss = fileContent;
    
    // Process with PostCSS
    const syntax = fileExt === 'scss' ? scss : null;
    const root = postcss.parse(fileContent, { syntax });
    
    // Process CSS selectors
    root.walkRules(rule => {
      // Process heading selectors
      if (config.headingSelectors.some(selector => rule.selector.includes(selector)) ||
          config.headingClassPatterns.some(pattern => rule.selector.includes(pattern))) {
        
        // Check if rule already has the font-family
        let hasFontFamily = false;
        rule.walkDecls('font-family', () => { hasFontFamily = true; });
        
        if (!hasFontFamily) {
          // Add font-family for headings
          rule.append({ prop: 'font-family', value: '\'Sora\', sans-serif' });
          modified = true;
          stats.headingFontAdded++;
        }
      }
      // Process UI element selectors
      else if (config.uiElementSelectors.some(selector => rule.selector.includes(selector)) ||
               config.uiClassPatterns.some(pattern => rule.selector.includes(pattern))) {
        
        // Check if rule already has the font-family
        let hasFontFamily = false;
        rule.walkDecls('font-family', () => { hasFontFamily = true; });
        
        if (!hasFontFamily) {
          // Add font-family for UI elements
          rule.append({ prop: 'font-family', value: '\'Work Sans\', sans-serif' });
          modified = true;
          stats.uiFontAdded++;
        }
      }
    });
    
    // Save changes if file was modified
    if (modified && !isDryRun && !showStatsOnly) {
      // Backup file
      backupFile(filePath, fileContent);
      
      // Generate CSS string
      processedCss = root.toString();
      
      fs.writeFileSync(filePath, processedCss, 'utf8');
      stats.filesModified++;
      stats.cssFilesModified++;
      logSuccess(`✓ Fixed font inconsistencies in CSS file: ${filePath}`);
    } else if (modified) {
      stats.filesModified++;
      stats.cssFilesModified++;
      logInfo(`Would fix font inconsistencies in CSS file: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    stats.parsingErrors++;
    logError(`Error processing CSS file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Process a single file based on its extension
 */
function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.tsx' || ext === '.jsx') {
    return processJsxFile(filePath);
  } else if ((ext === '.css' || ext === '.scss') && includeCss) {
    return processCssFile(filePath);
  }
  
  return false;
}

/**
 * Print detailed statistics about the changes
 */
function printStats() {
  logTitle('\n========== Font Consistency Stats ==========');
  logInfo(`Files scanned: ${stats.filesScanned}`);
  logInfo(`Files with font issues: ${stats.filesModified}`);
  logInfo(`Headings missing font-sora: ${stats.headingFontAdded}`);
  logInfo(`UI elements missing font-work-sans: ${stats.uiFontAdded}`);
  
  if (useOptimizations) {
    logInfo(`Redundant font classes removed: ${stats.redundantFontClassesRemoved}`);
  }
  
  if (includeCss) {
    logInfo(`CSS files scanned: ${stats.cssFilesScanned}`);
    logInfo(`CSS files modified: ${stats.cssFilesModified}`);
  }
  
  logInfo(`Parsing errors: ${stats.parsingErrors}`);
  
  // File type breakdown
  logSubtitle('\nFile Types:');
  for (const [type, count] of Object.entries(stats.fileTypes)) {
    if (count > 0) {
      logInfo(`  .${type}: ${count}`);
    }
  }
  
  // Component Stats (if any)
  if (Object.keys(stats.componentStats).length > 0) {
    logSubtitle('\nComponent Statistics:');
    for (const [component, counts] of Object.entries(stats.componentStats)) {
      logInfo(`  ${component}: ${counts.heading} heading fonts, ${counts.ui} UI fonts`);
    }
  }
  
  logTitle('===========================================\n');
}

/**
 * Validate that the changes don't break anything
 */
async function validateChanges() {
  if (isDryRun || showStatsOnly) return true;
  
  logTitle('\n========== Validation ==========');
  logInfo('Validating changes for potential issues...');
  
  let validationErrors = 0;
  
  // Check for syntactic validity of modified files
  for (const filePath of cache.modifiedFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.tsx' || ext === '.jsx') {
        // Validate JSX/TSX files
        parser.parse(content, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
        });
      } else if (ext === '.css' || ext === '.scss') {
        // Validate CSS/SCSS files
        const syntax = ext === '.scss' ? scss : null;
        postcss.parse(content, { syntax });
      }
      
      logSuccess(`✓ Validated: ${filePath}`);
    } catch (error) {
      validationErrors++;
      logError(`✗ Validation failed for ${filePath}: ${error.message}`);
    }
  }
  
  if (validationErrors > 0) {
    logWarning(`Validation found ${validationErrors} potential issues.`);
    return false;
  } else {
    logSuccess('All changes validated successfully!');
    return true;
  }
}

/**
 * Main function
 */
async function main() {
  const mode = isDryRun ? 'DRY RUN' : showStatsOnly ? 'STATS ONLY' : 'FIX';
  const features = [
    useAdvancedHeuristics ? 'Advanced Heuristics' : '',
    useOptimizations ? 'Optimizations' : '',
    includeCss ? 'CSS Support' : ''
  ].filter(Boolean).join(', ');
  
  logTitle(`
============================================
📝 Advanced Font Consistency Checker and Fixer [${mode}]
============================================
Target: ${targetFile || targetPath}
Features: ${features || 'Standard'}
  `);
  
  const files = await findFilesToProcess();
  logInfo(`Found ${files.length} files to analyze\n`);
  
  for (const file of files) {
    processFile(file);
  }
  
  printStats();
  
  // Run validation if requested
  if (validateAfter && !isDryRun && !showStatsOnly && stats.filesModified > 0) {
    await validateChanges();
  }
  
  if (isDryRun) {
    logInfo('Dry run completed. No files were modified.');
  } else if (showStatsOnly) {
    logInfo('Stats analysis completed. No files were modified.');
  } else {
    logSuccess(`Font consistency fixes applied to ${stats.filesModified} files.`);
    
    if (stats.filesModified > 0) {
      logInfo(`Backup created in: ${SESSION_BACKUP_DIR}`);
      logInfo('To revert changes, run: node scripts/fix-font-consistency.js --undo');
    }
  }
}

// Run the script
main().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  process.exit(1);
});

/**
 * ==============================================
 * DEPENDENCIES INSTALLATION INSTRUCTIONS
 * ==============================================
 * 
 * To run this script, you need to install the following dependencies:
 * 
 * For basic functionality:
 * npm install @babel/parser @babel/traverse @babel/generator @babel/types glob --save-dev
 *
 * For CSS/SCSS support:
 * npm install postcss postcss-scss css-font-parser --save-dev
 *
 * Example package.json script entries:
 * {
 *   "scripts": {
 *     "fix:fonts": "node scripts/fix-font-consistency.js",
 *     "fix:fonts:dry": "node scripts/fix-font-consistency.js --dry-run",
 *     "fix:fonts:css": "node scripts/fix-font-consistency.js --css",
 *     "fix:fonts:advanced": "node scripts/fix-font-consistency.js --advanced --optimize"
 *   }
 * }
 *
 * If using as part of a pre-commit hook with husky:
 * {
 *   "husky": {
 *     "hooks": {
 *       "pre-commit": "npm run fix:fonts:dry && git add ."
 *     }
 *   }
 * }
 */ 
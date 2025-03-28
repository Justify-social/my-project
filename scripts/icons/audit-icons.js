#!/usr/bin/env node

/**
 * Unified Icon Audit & Validation Tool
 * 
 * This comprehensive script analyzes and validates the entire icon system:
 * 1. Audits icon usage patterns across the codebase
 * 2. Identifies any problematic FontAwesome imports or patterns
 * 3. Validates icon files for consistency and proper structure
 * 4. Verifies the icon data matches physical SVG files
 * 5. Checks for missing or broken icon references
 * 6. Provides comprehensive reporting on the icon system health
 * 
 * Usage:
 *   node scripts/icons/audit-icons.js [options]
 * 
 * Options:
 *   --verbose    Show detailed information about each finding
 *   --json       Output results in JSON format
 *   --fix        Attempt to automatically fix simple issues
 *   --verify     Include verification of icon SVG files
 *   --paths      Check icon import paths
 *   --all        Run all checks (equivalent to --verify --paths)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// Configuration
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const outputJson = args.includes('--json');
const shouldFix = args.includes('--fix');
const verifyFiles = args.includes('--verify') || args.includes('--all');
const checkPaths = args.includes('--paths') || args.includes('--all');

// Constants
const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const APP_DIR = path.join(ROOT_DIR, 'app');
const ICON_DIR = path.join(ROOT_DIR, 'src', 'components', 'ui', 'icons');
const REPORT_FILE = path.join(ROOT_DIR, 'icon-audit-report.json');

// Icon directories and files
const ICON_FOLDERS = {
  'solid': path.join(ROOT_DIR, 'public', 'icons', 'solid'),
  'light': path.join(ROOT_DIR, 'public', 'icons', 'light'),
  'brands': path.join(ROOT_DIR, 'public', 'icons', 'brands'),
  'regular': path.join(ROOT_DIR, 'public', 'icons', 'regular'),
  'app': path.join(ROOT_DIR, 'public', 'icons', 'app'),
  'kpis': path.join(ROOT_DIR, 'public', 'icons', 'kpis')
};

const ICON_DATA_FILE = path.join(ICON_DIR, 'data', 'icon-data.ts');
const ICON_COMPONENTS_DIR = path.join(ICON_DIR, 'components');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// File patterns to include in the audit
const SOURCE_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'app/**/*.{ts,tsx,js,jsx}'
];

// Patterns to exclude from the audit
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/scripts/**',
  '**/public/**',
  '**/test/**',
  '**/__tests__/**',
  '**/icon-unification.md'
];

// Audit patterns
const AUDIT_PATTERNS = {
  fontAwesomeImports: [
    /from\s+['"]([@]fortawesome\/[^'"]+)['"]/g,
    /import\s+\{[^}]*\}\s+from\s+['"]([@]fortawesome\/[^'"]+)['"]/g
  ],
  fontAwesomeClasses: [
    /className\s*=\s*['"]([^'"]*fa-[^'"]*)['"]/g,
    /<i\s+className\s*=\s*['"]([^'"]*fa-[^'"]*)['"]/g
  ],
  reactIcons: [
    /from\s+['"]react-icons\/([^'"]+)['"]/g,
    /import\s+\{[^}]*\}\s+from\s+['"]react-icons\/([^'"]+)['"]/g
  ],
  fontAwesomeIcon: [
    /<FontAwesomeIcon\s/g,
    /component\s*=\s*\{FontAwesomeIcon\}/g
  ],
  unifiedIconUsage: [
    /<Icon\s+name\s*=\s*['"](fa[^'"]+)['"]/g,
    /<Icon\s+name\s*=\s*\{['"](fa[^'"]+)['"]\}/g,
    /<(StaticIcon|ButtonIcon|DeleteIcon|WarningIcon|SuccessIcon)\s+name\s*=\s*['"](fa[^'"]+)['"]/g
  ],
  wrongIconImportPaths: [
    /from\s+['"]@\/components\/ui\/icons\/core['"]/g,
    /from\s+['"]@\/components\/ui\/icons\/variants['"]/g,
    /import\s+\{[^}]*\}\s+from\s+['"]@\/components\/ui\/icons\/core['"]/g,
    /import\s+\{[^}]*\}\s+from\s+['"]@\/components\/ui\/icons\/variants['"]/g
  ]
};

// Results storage
const results = {
  summary: {
    fontAwesomeImports: 0,
    fontAwesomeClasses: 0,
    reactIcons: 0,
    fontAwesomeIcon: 0,
    unifiedIconUsage: 0,
    wrongIconImportPaths: 0,
    totalFiles: 0,
    filesWithIcons: 0,
    uniqueIcons: new Set(),
    missingIcons: [],
    invalidSvgFiles: []
  },
  details: {
    fontAwesomeImports: [],
    fontAwesomeClasses: [],
    reactIcons: [],
    fontAwesomeIcon: [],
    unifiedIconUsage: [],
    wrongIconImportPaths: [],
    missingIcons: [],
    invalidSvgFiles: []
  },
  verification: {
    totalSvgFiles: 0,
    validSvgFiles: 0,
    invalidSvgFiles: 0,
    missingDataEntries: [],
    extraDataEntries: []
  }
};

/**
 * Get all files to audit based on patterns
 */
function getFilesToAudit() {
  console.log(`${colors.cyan}📂 Finding files to audit...${colors.reset}`);
  let allFiles = [];
  
  SOURCE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: EXCLUDE_PATTERNS });
    allFiles = [...allFiles, ...files];
  });
  
  console.log(`${colors.cyan}🔍 Found ${allFiles.length} files to audit${colors.reset}`);
  return allFiles;
}

/**
 * Audit a single file for all patterns
 * @param {string} filePath - Path to the file to audit
 */
function auditFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fileHasIcons = false;
    
    // For each pattern category
    Object.entries(AUDIT_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        let match;
        pattern.lastIndex = 0; // Reset regex state
        
        while ((match = pattern.exec(content)) !== null) {
          fileHasIcons = true;
          results.summary[category]++;
          
          // Add detail to results
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = content.split('\n')[lineNumber - 1].trim();
          
          if (category === 'unifiedIconUsage' && match[2]) {
            results.summary.uniqueIcons.add(match[2]);
          } else if (category === 'unifiedIconUsage' && match[1]) {
            results.summary.uniqueIcons.add(match[1]);
          }
          
          results.details[category].push({
            file: filePath,
            line: lineNumber,
            match: match[0],
            context: line,
            targetValue: match[1] || match[2] || ''
          });
        }
      });
    });
    
    if (fileHasIcons) {
      results.summary.filesWithIcons++;
    }
    
    results.summary.totalFiles++;
    
    // Show progress periodically
    if (results.summary.totalFiles % 100 === 0) {
      process.stdout.write('.');
    }
    
  } catch (error) {
    console.error(`${colors.red}⚠️ Error processing file ${filePath}:${colors.reset}`, error.message);
  }
}

/**
 * Verify icon SVG files match the icon data definitions
 */
function verifyIconFiles() {
  console.log(`\n${colors.cyan}📊 Verifying icon files...${colors.reset}`);
  
  try {
    // Extract icon data entries from the TypeScript file
    const iconDataContent = fs.readFileSync(ICON_DATA_FILE, 'utf8');
    
    // Simple regex to extract icon entries (not perfect but works for our format)
    const iconEntries = [...iconDataContent.matchAll(/['"]([^'"]+)['"]\s*:\s*\{/g)]
      .map(match => match[1]);
    
    console.log(`${colors.cyan}📊 Found ${iconEntries.length} icon entries in icon-data.ts${colors.reset}`);
    
    // Track physical SVG files
    const svgFiles = new Map();
    
    // Check each icon folder
    Object.entries(ICON_FOLDERS).forEach(([style, folder]) => {
      if (fs.existsSync(folder)) {
        const files = glob.sync('*.svg', { cwd: folder });
        
        files.forEach(file => {
          const baseName = path.basename(file, '.svg');
          const prefix = style === 'solid' ? 'fas' : 
                         style === 'light' ? 'fal' : 
                         style === 'brands' ? 'fab' : 'far';
          
          // Convert from kebab-case file name to camelCase icon name
          const iconName = `fa${baseName.split('-').map((part, index) => 
            index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join('')}`;
          
          // For light icons, check both with and without the Light suffix
          if (style === 'light') {
            svgFiles.set(iconName, { file, path: path.join(folder, file), style, prefix });
            svgFiles.set(`${iconName}Light`, { file, path: path.join(folder, file), style, prefix });
          } else {
            svgFiles.set(iconName, { file, path: path.join(folder, file), style, prefix });
          }
          
          // Validate SVG content
          try {
            const svgContent = fs.readFileSync(path.join(folder, file), 'utf8');
            
            // Basic validation checks
            const isValid = 
              svgContent.includes('<svg') && 
              svgContent.includes('viewBox') &&
              svgContent.includes('<path');
            
            if (!isValid) {
              results.verification.invalidSvgFiles++;
              results.details.invalidSvgFiles.push({
                file: path.join(folder, file),
                style,
                reason: 'Invalid SVG format (missing required elements)'
              });
            } else {
              results.verification.validSvgFiles++;
            }
          } catch (e) {
            results.verification.invalidSvgFiles++;
            results.details.invalidSvgFiles.push({
              file: path.join(folder, file),
              style,
              reason: `Error reading file: ${e.message}`
            });
          }
        });
      }
    });
    
    results.verification.totalSvgFiles = svgFiles.size;
    
    // Find icons in the data file that are missing physical SVG files
    iconEntries.forEach(iconName => {
      if (!svgFiles.has(iconName)) {
        results.verification.missingDataEntries.push(iconName);
      }
    });
    
    // Find SVG files that aren't in the data file
    svgFiles.forEach((fileInfo, iconName) => {
      if (!iconEntries.includes(iconName)) {
        results.verification.extraDataEntries.push({
          name: iconName,
          file: fileInfo.file,
          style: fileInfo.style
        });
      }
    });
    
    // Check if icons used in the codebase exist as SVG files
    Array.from(results.summary.uniqueIcons).forEach(iconName => {
      if (!svgFiles.has(iconName)) {
        results.summary.missingIcons.push(iconName);
        results.details.missingIcons.push({
          name: iconName,
          reason: 'No matching SVG file found'
        });
      }
    });
    
  } catch (error) {
    console.error(`${colors.red}⚠️ Error verifying icon files:${colors.reset}`, error.message);
  }
}

/**
 * Generate and display a report from audit results
 */
function generateReport() {
  console.log(`\n\n${colors.bold}${colors.cyan}📊 Icon Audit Report${colors.reset}`);
  console.log('=================');
  
  // Convert Set to Array for serialization
  results.summary.uniqueIconsCount = results.summary.uniqueIcons.size;
  results.summary.uniqueIconsList = Array.from(results.summary.uniqueIcons);
  delete results.summary.uniqueIcons;
  
  console.log('\nSummary:');
  console.log(`- Total files audited: ${results.summary.totalFiles}`);
  console.log(`- Files with icons: ${results.summary.filesWithIcons}`);
  console.log(`- FontAwesome direct imports: ${colors.yellow}${results.summary.fontAwesomeImports}${colors.reset}`);
  console.log(`- FontAwesome class-based patterns: ${colors.yellow}${results.summary.fontAwesomeClasses}${colors.reset}`);
  console.log(`- React-icons usage: ${colors.yellow}${results.summary.reactIcons}${colors.reset}`);
  console.log(`- FontAwesomeIcon component usage: ${colors.yellow}${results.summary.fontAwesomeIcon}${colors.reset}`);
  console.log(`- Unified Icon component usage: ${colors.green}${results.summary.unifiedIconUsage}${colors.reset}`);
  console.log(`- Wrong icon import paths: ${colors.yellow}${results.summary.wrongIconImportPaths}${colors.reset}`);
  console.log(`- Unique icons used: ${results.summary.uniqueIconsCount}`);
  
  if (verifyFiles) {
    console.log(`\n${colors.cyan}SVG File Verification:${colors.reset}`);
    console.log(`- Total SVG files: ${results.verification.totalSvgFiles}`);
    console.log(`- Valid SVG files: ${colors.green}${results.verification.validSvgFiles}${colors.reset}`);
    console.log(`- Invalid SVG files: ${colors.red}${results.verification.invalidSvgFiles}${colors.reset}`);
    console.log(`- Icons in data but missing files: ${colors.yellow}${results.verification.missingDataEntries.length}${colors.reset}`);
    console.log(`- SVG files not in data: ${colors.yellow}${results.verification.extraDataEntries.length}${colors.reset}`);
    console.log(`- Referenced icons missing files: ${colors.red}${results.summary.missingIcons.length}${colors.reset}`);
    
    if (isVerbose && results.verification.missingDataEntries.length > 0) {
      console.log(`\n${colors.yellow}Icon data entries missing SVG files:${colors.reset}`);
      results.verification.missingDataEntries.slice(0, 20).forEach(icon => {
        console.log(`  - ${icon}`);
      });
      if (results.verification.missingDataEntries.length > 20) {
        console.log(`  - ...and ${results.verification.missingDataEntries.length - 20} more`);
      }
    }
    
    if (isVerbose && results.verification.extraDataEntries.length > 0) {
      console.log(`\n${colors.yellow}SVG files not in icon data:${colors.reset}`);
      results.verification.extraDataEntries.slice(0, 20).forEach(entry => {
        console.log(`  - ${entry.name} (${entry.style}/${entry.file})`);
      });
      if (results.verification.extraDataEntries.length > 20) {
        console.log(`  - ...and ${results.verification.extraDataEntries.length - 20} more`);
      }
    }
    
    if (isVerbose && results.summary.missingIcons.length > 0) {
      console.log(`\n${colors.red}Icons used but missing files:${colors.reset}`);
      results.summary.missingIcons.forEach(icon => {
        console.log(`  - ${icon}`);
      });
    }
  }
  
  if (isVerbose || results.summary.fontAwesomeImports > 0) {
    console.log(`\n${colors.yellow}⚠️ Files with direct FontAwesome imports:${colors.reset}`);
    const grouped = groupByFile(results.details.fontAwesomeImports);
    Object.entries(grouped).forEach(([file, entries]) => {
      console.log(`- ${file} (${entries.length} instances)`);
      if (isVerbose) {
        entries.slice(0, 5).forEach(entry => {
          console.log(`  - Line ${entry.line}: ${entry.context}`);
        });
        if (entries.length > 5) {
          console.log(`  - ...and ${entries.length - 5} more`);
        }
      }
    });
  }
  
  if (isVerbose || results.summary.fontAwesomeClasses > 0) {
    console.log(`\n${colors.yellow}⚠️ Files with FontAwesome class-based patterns:${colors.reset}`);
    const grouped = groupByFile(results.details.fontAwesomeClasses);
    Object.entries(grouped).forEach(([file, entries]) => {
      console.log(`- ${file} (${entries.length} instances)`);
      if (isVerbose) {
        entries.slice(0, 5).forEach(entry => {
          console.log(`  - Line ${entry.line}: ${entry.context}`);
        });
        if (entries.length > 5) {
          console.log(`  - ...and ${entries.length - 5} more`);
        }
      }
    });
  }
  
  if (isVerbose || results.summary.reactIcons > 0) {
    console.log(`\n${colors.yellow}⚠️ Files with React-icons usage:${colors.reset}`);
    const grouped = groupByFile(results.details.reactIcons);
    Object.entries(grouped).forEach(([file, entries]) => {
      console.log(`- ${file} (${entries.length} instances)`);
      if (isVerbose) {
        entries.slice(0, 5).forEach(entry => {
          console.log(`  - Line ${entry.line}: ${entry.context}`);
        });
        if (entries.length > 5) {
          console.log(`  - ...and ${entries.length - 5} more`);
        }
      }
    });
  }
  
  if (isVerbose || results.summary.fontAwesomeIcon > 0) {
    console.log(`\n${colors.yellow}⚠️ Files with FontAwesomeIcon component usage:${colors.reset}`);
    const grouped = groupByFile(results.details.fontAwesomeIcon);
    Object.entries(grouped).forEach(([file, entries]) => {
      console.log(`- ${file} (${entries.length} instances)`);
      if (isVerbose) {
        entries.slice(0, 5).forEach(entry => {
          console.log(`  - Line ${entry.line}: ${entry.context}`);
        });
        if (entries.length > 5) {
          console.log(`  - ...and ${entries.length - 5} more`);
        }
      }
    });
  }
  
  if (checkPaths && (isVerbose || results.summary.wrongIconImportPaths > 0)) {
    console.log(`\n${colors.yellow}⚠️ Files with wrong icon import paths:${colors.reset}`);
    const grouped = groupByFile(results.details.wrongIconImportPaths);
    Object.entries(grouped).forEach(([file, entries]) => {
      console.log(`- ${file} (${entries.length} instances)`);
      if (isVerbose) {
        entries.slice(0, 5).forEach(entry => {
          console.log(`  - Line ${entry.line}: ${entry.context}`);
        });
        if (entries.length > 5) {
          console.log(`  - ...and ${entries.length - 5} more`);
        }
      }
    });
  }
  
  if (outputJson) {
    fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n${colors.green}💾 Full report saved to ${REPORT_FILE}${colors.reset}`);
  }
  
  // Final assessment
  const deprecatedPatternsCount = 
    results.summary.fontAwesomeImports + 
    results.summary.fontAwesomeClasses + 
    results.summary.reactIcons + 
    results.summary.fontAwesomeIcon +
    results.summary.wrongIconImportPaths;
  
  const fileIssuesCount = verifyFiles ? 
    results.verification.invalidSvgFiles + 
    results.verification.missingDataEntries.length + 
    results.summary.missingIcons.length : 0;
  
  if (deprecatedPatternsCount === 0 && fileIssuesCount === 0) {
    console.log(`\n${colors.bold}${colors.green}✅ Icon System Health: EXCELLENT${colors.reset}`);
    console.log(`${colors.green}No deprecated patterns found. Icon system is clean and organized.${colors.reset}`);
  } else if (deprecatedPatternsCount < 10 && fileIssuesCount < 10) {
    console.log(`\n${colors.bold}${colors.cyan}✅ Icon System Health: GOOD${colors.reset}`);
    console.log(`${colors.cyan}Found only a few issues. The icon system is mostly clean.${colors.reset}`);
  } else {
    console.log(`\n${colors.bold}${colors.yellow}❌ Icon System Health: NEEDS IMPROVEMENT${colors.reset}`);
    console.log(`${colors.yellow}Found ${deprecatedPatternsCount} deprecated patterns and ${fileIssuesCount} file issues.${colors.reset}`);
    console.log(`${colors.yellow}Consider running with --fix to address some of these issues.${colors.reset}`);
  }
  
  if (shouldFix && (deprecatedPatternsCount > 0 || fileIssuesCount > 0)) {
    console.log(`\n${colors.cyan}🔧 Attempting to fix issues...${colors.reset}`);
    attemptToFixIssues();
  }
}

/**
 * Group results by file for better reporting
 * @param {Array} items - List of result items to group
 * @returns {Object} - Grouped results by file
 */
function groupByFile(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.file]) {
      acc[item.file] = [];
    }
    acc[item.file].push(item);
    return acc;
  }, {});
}

/**
 * Attempt to fix common issues automatically
 */
function attemptToFixIssues() {
  if (results.summary.wrongIconImportPaths > 0) {
    console.log(`${colors.cyan}🔧 Fixing wrong icon import paths...${colors.reset}`);
    try {
      // Create a temporary script to fix the imports
      const fixScript = `
        const fs = require('fs');
        const files = ${JSON.stringify(Object.keys(groupByFile(results.details.wrongIconImportPaths)))};
        
        files.forEach(file => {
          try {
            let content = fs.readFileSync(file, 'utf8');
            
            // Replace core imports
            content = content.replace(
              /from\\s+['"]@\\/components\\/ui\\/icons\\/core['"]/g, 
              "from '@/components/ui/icons'"
            );
            
            // Replace variants imports
            content = content.replace(
              /from\\s+['"]@\\/components\\/ui\\/icons\\/variants['"]/g, 
              "from '@/components/ui/icons'"
            );
            
            fs.writeFileSync(file, content, 'utf8');
            console.log(\`Fixed imports in \${file}\`);
          } catch (err) {
            console.error(\`Error fixing \${file}: \${err.message}\`);
          }
        });
      `;
      
      const fixScriptPath = path.join(ROOT_DIR, 'tmp-fix-imports.js');
      fs.writeFileSync(fixScriptPath, fixScript, 'utf8');
      
      // Execute the fix script
      execSync(`node ${fixScriptPath}`, { stdio: 'inherit' });
      
      // Clean up
      fs.unlinkSync(fixScriptPath);
      
      console.log(`${colors.green}✅ Fixed ${results.summary.wrongIconImportPaths} import paths${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}⚠️ Error fixing import paths:${colors.reset}`, error.message);
    }
  }
  
  if (verifyFiles && results.verification.extraDataEntries.length > 0) {
    console.log(`${colors.cyan}🔧 Adding missing entries to icon data...${colors.reset}`);
    console.log(`${colors.yellow}This feature requires manual intervention. Please run the generate-icon-data.js script.${colors.reset}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.bold}${colors.cyan}🔍 Starting Unified Icon Audit...${colors.reset}`);
  
  // Part 1: Audit codebase for icon usage
  const files = getFilesToAudit();
  let processedFiles = 0;
  
  // Process files
  files.forEach(file => {
    auditFile(file);
    processedFiles++;
    
    // Show progress
    if (processedFiles % 200 === 0) {
      console.log(`Progress: ${processedFiles}/${files.length} files processed`);
    }
  });
  
  // Part 2: Verify icon files if requested
  if (verifyFiles) {
    verifyIconFiles();
  }
  
  // Generate comprehensive report
  generateReport();
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Error running icon audit:${colors.reset}`, error);
  process.exit(1);
});

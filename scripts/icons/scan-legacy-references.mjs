#!/usr/bin/env node

/**
 * Legacy Icon References Scanner
 * 
 * This script scans the codebase for components still using the legacy icon
 * naming approach (name="faIcon") instead of the new standardized iconId approach.
 * 
 * Usage:
 *   node scripts/icons/scan-legacy-references.mjs
 * 
 * Output:
 *   - Console report of files using legacy references
 *   - JSON report saved to reports/legacy-icon-scan.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const reportDir = path.join(rootDir, 'reports');

// Ensure reports directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Patterns to search for
const PATTERNS = {
  // Legacy icon name prop pattern
  LEGACY_NAME: /\bname=["']fa[A-Za-z]+["']/g,
  // Legacy solid prop pattern 
  LEGACY_SOLID: /\bsolid=\{(true|false)\}/g,
  // Modern iconId prop pattern - to find files already migrated
  MODERN_ID: /\biconId=["']fa[A-Za-z]+(Light|Solid)["']/g,
  // Icon component import pattern
  ICON_IMPORT: /import\s+{\s*Icon\s*}|import\s+.*\s+from\s+['"].*icon/g,
}

console.log('🔍 Scanning codebase for legacy icon references...');

// Find all TSX/JSX files that might contain icons
const findTsxFiles = () => {
  try {
    const cmd = `find ${rootDir}/src -type f -name "*.tsx" -o -name "*.jsx"`;
    return execSync(cmd, { encoding: 'utf8' }).trim().split('\n');
  } catch (error) {
    console.error('Error finding TSX/JSX files:', error);
    return [];
  }
}

// Analyze a single file for icon patterns
const analyzeFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(rootDir, filePath);
  
  // Skip files that don't import Icon
  if (!PATTERNS.ICON_IMPORT.test(content)) {
    return null;
  }
  
  // Find matches for each pattern
  const legacyNameMatches = [...content.matchAll(PATTERNS.LEGACY_NAME)].map(m => m[0]);
  const legacySolidMatches = [...content.matchAll(PATTERNS.LEGACY_SOLID)].map(m => m[0]);
  const modernIdMatches = [...content.matchAll(PATTERNS.MODERN_ID)].map(m => m[0]);
  
  const legacyCount = legacyNameMatches.length;
  const modernCount = modernIdMatches.length;
  const totalCount = legacyCount + modernCount;
  
  if (totalCount === 0) {
    return null; // No icon references found
  }
  
  // Calculate migration percentage
  const migrationPercent = totalCount > 0 
    ? Math.round((modernCount / totalCount) * 100) 
    : 0;
  
  return {
    file: relPath,
    stats: {
      legacyCount,
      modernCount,
      totalCount,
      migrationPercent,
    },
    examples: {
      legacyNames: [...new Set(legacyNameMatches)].slice(0, 5),
      legacySolid: [...new Set(legacySolidMatches)].slice(0, 3),
      modernIds: [...new Set(modernIdMatches)].slice(0, 5),
    }
  };
}

// Main execution
const files = findTsxFiles();
console.log(`Found ${files.length} TSX/JSX files to analyze`);

const results = [];
let totalLegacy = 0;
let totalModern = 0;
let filesToMigrate = 0;
let filesFullyMigrated = 0;
let filesPartiallyMigrated = 0;

files.forEach((file, index) => {
  if (index % 50 === 0) {
    process.stdout.write(`Processing file ${index}/${files.length}...\r`);
  }
  
  const result = analyzeFile(file);
  if (result) {
    results.push(result);
    
    totalLegacy += result.stats.legacyCount;
    totalModern += result.stats.modernCount;
    
    if (result.stats.legacyCount > 0 && result.stats.modernCount === 0) {
      filesToMigrate++;
    } else if (result.stats.legacyCount === 0 && result.stats.modernCount > 0) {
      filesFullyMigrated++;
    } else if (result.stats.legacyCount > 0 && result.stats.modernCount > 0) {
      filesPartiallyMigrated++;
    }
  }
});

// Sort results by migration percentage (ascending)
results.sort((a, b) => a.stats.migrationPercent - b.stats.migrationPercent);

// Generate report
const report = {
  summary: {
    totalFiles: files.length,
    filesWithIcons: results.length,
    filesToMigrate,
    filesPartiallyMigrated,
    filesFullyMigrated,
    totalLegacyReferences: totalLegacy,
    totalModernReferences: totalModern,
    overallMigrationPercent: Math.round((totalModern / (totalLegacy + totalModern)) * 100),
  },
  files: results,
};

// Save report to disk
const reportPath = path.join(reportDir, 'legacy-icon-scan.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// Print summary to console
console.log('\n\n📊 Icon Migration Status Report');
console.log('===========================');
console.log(`Total files scanned: ${report.summary.totalFiles}`);
console.log(`Files with icon usage: ${report.summary.filesWithIcons}`);
console.log('\nMigration Progress:');
console.log(`- Files fully migrated: ${report.summary.filesFullyMigrated}`);
console.log(`- Files partially migrated: ${report.summary.filesPartiallyMigrated}`);
console.log(`- Files not yet migrated: ${report.summary.filesToMigrate}`);
console.log(`\nTotal references: ${totalLegacy + totalModern}`);
console.log(`- Legacy references: ${totalLegacy}`);
console.log(`- Modern references: ${totalModern}`);
console.log(`\nOverall migration: ${report.summary.overallMigrationPercent}% complete`);

console.log('\n⚠️ Files that need migration:');
console.log('---------------------------');
results
  .filter(r => r.stats.legacyCount > 0)
  .slice(0, 10)
  .forEach(result => {
    console.log(`- ${result.file}: ${result.stats.legacyCount} references (${result.stats.migrationPercent}% migrated)`);
    if (result.examples.legacyNames.length > 0) {
      console.log(`  Example: ${result.examples.legacyNames[0]}`);
    }
  });

console.log(`\n📝 Full report saved to: ${reportPath}`);
console.log(`Run migration tool on specific files with: node scripts/icons/migrate-icons.mjs [file-path]`); 
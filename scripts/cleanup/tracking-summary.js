#!/usr/bin/env node

/**
 * ESLint Cleanup Progress Tracker
 * 
 * This script generates weekly progress reports for the lint cleanup process,
 * tracking the reduction in errors and warnings over time.
 * 
 * Usage:
 *   node scripts/consolidated/cleanup/tracking-summary.js [--save] [--compare <baseline-file>]
 * 
 * Options:
 *   --save         Save the current lint state as a baseline
 *   --compare      Compare current state with a saved baseline
 */

// Import required modules
import fs from 'fs';
import path from 'path';
import execSync from 'child_process';

// Simple color functions
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// Configuration
const CODEBASE_ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_DIR = path.join(CODEBASE_ROOT, 'docs/verification/tracking');
const BASELINE_DIR = path.join(OUTPUT_DIR, 'baselines');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  save: args.includes('--save'),
  compare: args.includes('--compare') ? args[args.indexOf('--compare') + 1] : null
};

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

if (!fs.existsSync(BASELINE_DIR)) {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
}

// Logger
function log(message, type = 'info') {
  const prefix = {
    info: colors.blue('INFO'),
    success: colors.green('SUCCESS'),
    warning: colors.yellow('WARNING'),
    error: colors.red('ERROR'),
    progress: colors.cyan('PROGRESS')
  }[type];
  
  console.log(`${prefix}: ${message}`);
}

// Run ESLint and get results
async function getLintResults() {
  log('Running ESLint to check current status...', 'info');
  
  // Run ESLint and capture output
  let eslintOutput;
  try {
    eslintOutput = execSync(
      'npx eslint --config eslint.config.mjs --format json .', 
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
  } catch (error) {
    // ESLint returns non-zero exit code when issues are found
    eslintOutput = error.stdout;
  }
  
  // Parse JSON output
  let results;
  try {
    results = JSON.parse(eslintOutput);
  } catch (error) {
    log('Failed to parse ESLint output as JSON', 'error');
    throw error;
  }
  
  // Process results
  let errorCount = 0;
  let warningCount = 0;
  let filesWithIssues = 0;
  const totalFiles = results.length;
  
  // Count by error type
  const errorTypes = {};
  
  results.forEach(fileResult => {
    errorCount += fileResult.errorCount;
    warningCount += fileResult.warningCount;
    
    if (fileResult.errorCount > 0 || fileResult.warningCount > 0) {
      filesWithIssues++;
      
      // Track error types
      fileResult.messages.forEach(message => {
        const ruleId = message.ruleId || 'syntax-error';
        if (!errorTypes[ruleId]) {
          errorTypes[ruleId] = {
            rule: ruleId,
            errors: 0,
            warnings: 0
          };
        }
        
        if (message.severity === 2) {
          errorTypes[ruleId].errors++;
        } else {
          errorTypes[ruleId].warnings++;
        }
      });
    }
  });
  
  // Sort error types by count
  const sortedErrorTypes = Object.values(errorTypes).sort((a, b) => 
    (b.errors - a.errors) || (b.warnings - a.warnings)
  );
  
  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles,
      filesWithIssues,
      errorCount,
      warningCount,
      totalIssues: errorCount + warningCount
    },
    errorTypes: sortedErrorTypes
  };
}

// Save current lint state as baseline
function saveBaseline(results) {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const baselinePath = path.join(BASELINE_DIR, `baseline-${formattedDate}.json`);
  
  fs.writeFileSync(baselinePath, JSON.stringify(results, null, 2), 'utf8');
  log(`Saved current lint state as baseline: ${baselinePath}`, 'success');
  
  // Also save as latest
  const latestPath = path.join(BASELINE_DIR, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(results, null, 2), 'utf8');
  
  return baselinePath;
}

// Compare current results with baseline
function compareWithBaseline(current, baselineFile) {
  let baseline;
  const baselinePath = path.join(BASELINE_DIR, baselineFile);
  
  if (!fs.existsSync(baselinePath)) {
    log(`Baseline file not found: ${baselinePath}`, 'error');
    return null;
  }
  
  try {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  } catch (error) {
    log(`Failed to parse baseline file: ${error.message}`, 'error');
    return null;
  }
  
  const baselineDate = new Date(baseline.timestamp);
  const currentDate = new Date(current.timestamp);
  
  const daysDiff = Math.round((currentDate - baselineDate) / (1000 * 60 * 60 * 24));
  
  const comparison = {
    baselineDate: baseline.timestamp,
    currentDate: current.timestamp,
    daysSinceBaseline: daysDiff,
    
    errors: {
      baseline: baseline.summary.errorCount,
      current: current.summary.errorCount,
      difference: baseline.summary.errorCount - current.summary.errorCount,
      percentChange: calculatePercentChange(baseline.summary.errorCount, current.summary.errorCount)
    },
    
    warnings: {
      baseline: baseline.summary.warningCount,
      current: current.summary.warningCount,
      difference: baseline.summary.warningCount - current.summary.warningCount,
      percentChange: calculatePercentChange(baseline.summary.warningCount, current.summary.warningCount)
    },
    
    filesWithIssues: {
      baseline: baseline.summary.filesWithIssues,
      current: current.summary.filesWithIssues,
      difference: baseline.summary.filesWithIssues - current.summary.filesWithIssues,
      percentChange: calculatePercentChange(baseline.summary.filesWithIssues, current.summary.filesWithIssues)
    },
    
    totalIssues: {
      baseline: baseline.summary.totalIssues,
      current: current.summary.totalIssues,
      difference: baseline.summary.totalIssues - current.summary.totalIssues,
      percentChange: calculatePercentChange(baseline.summary.totalIssues, current.summary.totalIssues)
    },
    
    // Calculate progress rate
    progressRate: {
      errorsPerDay: daysDiff > 0 ? 
        (baseline.summary.errorCount - current.summary.errorCount) / daysDiff : 0,
      totalIssuesPerDay: daysDiff > 0 ? 
        (baseline.summary.totalIssues - current.summary.totalIssues) / daysDiff : 0
    },
    
    // Calculate estimated completion
    estimatedCompletion: {
      daysToZeroErrors: current.summary.errorCount > 0 && daysDiff > 0 && 
        (baseline.summary.errorCount - current.summary.errorCount) > 0 ? 
        Math.ceil(current.summary.errorCount / 
          ((baseline.summary.errorCount - current.summary.errorCount) / daysDiff)) : null,
      
      daysToHalfWarnings: current.summary.warningCount > baseline.summary.warningCount / 2 && 
        daysDiff > 0 && (baseline.summary.warningCount - current.summary.warningCount) > 0 ?
        Math.ceil((current.summary.warningCount - baseline.summary.warningCount / 2) / 
          ((baseline.summary.warningCount - current.summary.warningCount) / daysDiff)) : null
    }
  };
  
  return comparison;
}

// Calculate percent change between two values
function calculatePercentChange(oldValue, newValue) {
  if (oldValue === 0) return newValue === 0 ? 0 : Infinity;
  return ((oldValue - newValue) / oldValue) * 100;
}

// Generate markdown progress report
function generateProgressReport(current, comparison = null) {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let markdown = `# ESLint Cleanup Progress Report
  
## Summary

**Report Date**: ${formattedDate}
**Total Issues**: ${current.summary.totalIssues}
**Error Count**: ${current.summary.errorCount}
**Warning Count**: ${current.summary.warningCount}
**Files with Issues**: ${current.summary.filesWithIssues} of ${current.summary.totalFiles} (${Math.round(current.summary.filesWithIssues / current.summary.totalFiles * 100)}%)

`;

  // Add comparison if available
  if (comparison) {
    markdown += `## Progress Since Baseline

**Baseline Date**: ${new Date(comparison.baselineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
**Days Since Baseline**: ${comparison.daysSinceBaseline}

| Metric | Baseline | Current | Difference | Change |
|--------|----------|---------|------------|--------|
| Errors | ${comparison.errors.baseline} | ${comparison.errors.current} | ${comparison.errors.difference > 0 ? '-' : ''}${Math.abs(comparison.errors.difference)} | ${comparison.errors.percentChange > 0 ? '↓' : '↑'} ${Math.abs(Math.round(comparison.errors.percentChange))}% |
| Warnings | ${comparison.warnings.baseline} | ${comparison.warnings.current} | ${comparison.warnings.difference > 0 ? '-' : ''}${Math.abs(comparison.warnings.difference)} | ${comparison.warnings.percentChange > 0 ? '↓' : '↑'} ${Math.abs(Math.round(comparison.warnings.percentChange))}% |
| Files with Issues | ${comparison.filesWithIssues.baseline} | ${comparison.filesWithIssues.current} | ${comparison.filesWithIssues.difference > 0 ? '-' : ''}${Math.abs(comparison.filesWithIssues.difference)} | ${comparison.filesWithIssues.percentChange > 0 ? '↓' : '↑'} ${Math.abs(Math.round(comparison.filesWithIssues.percentChange))}% |
| Total Issues | ${comparison.totalIssues.baseline} | ${comparison.totalIssues.current} | ${comparison.totalIssues.difference > 0 ? '-' : ''}${Math.abs(comparison.totalIssues.difference)} | ${comparison.totalIssues.percentChange > 0 ? '↓' : '↑'} ${Math.abs(Math.round(comparison.totalIssues.percentChange))}% |

### Progress Rate

- **Errors fixed per day**: ${comparison.progressRate.errorsPerDay.toFixed(1)}
- **Total issues fixed per day**: ${comparison.progressRate.totalIssuesPerDay.toFixed(1)}

### Estimated Completion

${comparison.estimatedCompletion.daysToZeroErrors !== null ? 
    `- **Zero errors**: Approximately ${comparison.estimatedCompletion.daysToZeroErrors} more days (around ${new Date(Date.now() + comparison.estimatedCompletion.daysToZeroErrors * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})` :
    '- **Zero errors**: Cannot estimate (insufficient progress data)'}
${comparison.estimatedCompletion.daysToHalfWarnings !== null ?
    `- **50% warnings reduction**: Approximately ${comparison.estimatedCompletion.daysToHalfWarnings} more days (around ${new Date(Date.now() + comparison.estimatedCompletion.daysToHalfWarnings * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})` :
    '- **50% warnings reduction**: Cannot estimate (insufficient progress data)'}

`;
  }

  markdown += `## Current Top Issues

| Rule | Errors | Warnings | Total |
|------|--------|----------|-------|
`;

  // Add top 10 error types
  current.errorTypes.slice(0, 10).forEach(errorType => {
    markdown += `| \`${errorType.rule}\` | ${errorType.errors} | ${errorType.warnings} | ${errorType.errors + errorType.warnings} |\n`;
  });
  
  markdown += `\n*Showing top 10 of ${current.errorTypes.length} rule violations*\n`;

  markdown += `
## Next Steps

1. Focus on eliminating critical errors, particularly:
   ${current.errorTypes.filter(e => e.errors > 0).slice(0, 3).map(e => `- \`${e.rule}\``).join('\n   ')}

2. Run automated fixer for common issues:
   \`\`\`bash
   node scripts/consolidated/linting/lint-fixer.js
   \`\`\`

3. Update baselines weekly to track progress:
   \`\`\`bash
   node scripts/consolidated/cleanup/tracking-summary.js --save
   \`\`\`

## Conclusion

${comparison ? 
   comparison.totalIssues.difference > 0 ? 
     `The cleanup is progressing well with a ${Math.abs(Math.round(comparison.totalIssues.percentChange))}% reduction in total issues since the baseline. At the current rate, we expect to eliminate all critical errors in approximately ${comparison.estimatedCompletion.daysToZeroErrors || 'N/A'} days.` :
     `Progress has stalled with a ${Math.abs(Math.round(comparison.totalIssues.percentChange))}% increase in issues since the baseline. This requires immediate attention to get back on track.` :
   'This is the initial baseline for tracking lint cleanup progress. Future reports will show progress comparisons.'}
`;

  return markdown;
}

// Main execution function
async function main() {
  try {
    // Create directories if they don't exist
    if (options.save && !fs.existsSync(BASELINE_DIR)) {
      fs.mkdirSync(BASELINE_DIR, { recursive: true });
    }
    
    // Get current lint results
    const current = await getLintResults();
    
    log(`Current state: ${current.summary.errorCount} errors, ${current.summary.warningCount} warnings`, 'info');
    
    let comparison = null;
    let baselineFile = options.compare;
    
    // If --compare is not specified but --save is not, try to compare with latest
    if (!baselineFile && !options.save) {
      const latestPath = path.join(BASELINE_DIR, 'latest.json');
      if (fs.existsSync(latestPath)) {
        baselineFile = 'latest.json';
      }
    }
    
    // Compare with baseline if available
    if (baselineFile) {
      log(`Comparing with baseline: ${baselineFile}`, 'info');
      comparison = compareWithBaseline(current, baselineFile);
      
      if (comparison) {
        log(`Since baseline: ${comparison.errors.difference > 0 ? '-' : '+'}${Math.abs(comparison.errors.difference)} errors, ${comparison.warnings.difference > 0 ? '-' : '+'}${Math.abs(comparison.warnings.difference)} warnings`, 'progress');
        
        if (comparison.estimatedCompletion.daysToZeroErrors !== null) {
          log(`Estimated completion (zero errors): ${comparison.estimatedCompletion.daysToZeroErrors} days`, 'progress');
        }
      }
    }
    
    // Save current state as baseline if requested
    if (options.save) {
      const savedPath = saveBaseline(current);
      log(`Baseline saved: ${savedPath}`, 'success');
    }
    
    // Generate progress report
    const report = generateProgressReport(current, comparison);
    
    // Save report
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const reportPath = path.join(OUTPUT_DIR, `progress-report-${formattedDate}.md`);
    
    fs.writeFileSync(reportPath, report, 'utf8');
    log(`Progress report saved: ${reportPath}`, 'success');
    
    // Also save as latest
    const latestReportPath = path.join(OUTPUT_DIR, 'latest-report.md');
    fs.writeFileSync(latestReportPath, report, 'utf8');
    
    // Output report to console
    console.log('\n' + report);
    
    return {
      current,
      comparison,
      report
    };
  } catch (error) {
    log(`Error generating progress report: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run script if executed directly
if (require.main === module) {
  main();
} else {
  // Export for use in other scripts
  module.exports = {
    getLintResults,
    saveBaseline,
    compareWithBaseline,
    generateProgressReport,
    main
  };
} 
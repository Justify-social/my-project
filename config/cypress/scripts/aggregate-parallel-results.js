const fs = require('fs');
const path = require('path');

/**
 * Aggregate Parallel Test Results
 *
 * This script combines results from multiple parallel test containers
 * into a single comprehensive report.
 */

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const CONTAINERS_DIR = path.join(REPORTS_DIR, 'containers');
const PERFORMANCE_DIR = path.join(REPORTS_DIR, 'performance');

function aggregateContainerResults() {
  console.log('🔄 Aggregating parallel test results...');

  if (!fs.existsSync(CONTAINERS_DIR)) {
    console.log('❌ No container results found');
    return null;
  }

  const containerFiles = fs
    .readdirSync(CONTAINERS_DIR)
    .filter(file => file.startsWith('container-') && file.endsWith('-results.json'));

  if (containerFiles.length === 0) {
    console.log('❌ No container result files found');
    return null;
  }

  console.log(`📊 Found ${containerFiles.length} container results`);

  const aggregatedResults = {
    timestamp: new Date().toISOString(),
    totalContainers: containerFiles.length,
    summary: {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalDuration: 0,
    },
    containers: [],
    specs: {},
    performance: {
      fastestContainer: null,
      slowestContainer: null,
      averageDuration: 0,
    },
  };

  const containerResults = [];

  for (const file of containerFiles) {
    try {
      const filePath = path.join(CONTAINERS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      containerResults.push(data);

      // Add to summary
      aggregatedResults.summary.totalTests += data.results.totalTests || 0;
      aggregatedResults.summary.totalPassed += data.results.totalPassed || 0;
      aggregatedResults.summary.totalFailed += data.results.totalFailed || 0;
      aggregatedResults.summary.totalDuration += data.results.totalDuration || 0;

      // Track container info
      aggregatedResults.containers.push({
        containerId: data.containerId,
        timestamp: data.timestamp,
        tests: data.results.totalTests || 0,
        passed: data.results.totalPassed || 0,
        failed: data.results.totalFailed || 0,
        duration: data.results.totalDuration || 0,
        specs: data.results.specs || [],
      });

      // Track specs
      if (data.results.specs) {
        data.results.specs.forEach(spec => {
          if (!aggregatedResults.specs[spec.spec]) {
            aggregatedResults.specs[spec.spec] = {
              spec: spec.spec,
              containers: [],
              totalTests: 0,
              totalPassed: 0,
              totalFailed: 0,
              totalDuration: 0,
            };
          }

          aggregatedResults.specs[spec.spec].containers.push({
            containerId: data.containerId,
            stats: spec.stats,
          });

          if (spec.stats) {
            aggregatedResults.specs[spec.spec].totalTests += spec.stats.tests || 0;
            aggregatedResults.specs[spec.spec].totalPassed += spec.stats.passes || 0;
            aggregatedResults.specs[spec.spec].totalFailed += spec.stats.failures || 0;
            aggregatedResults.specs[spec.spec].totalDuration += spec.stats.duration || 0;
          }
        });
      }

      console.log(
        `✅ Container ${data.containerId}: ${data.results.totalTests} tests, ${data.results.totalDuration}ms`
      );
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error.message);
    }
  }

  // Calculate performance metrics
  if (containerResults.length > 0) {
    const durations = containerResults.map(r => r.results.totalDuration || 0);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    aggregatedResults.performance.fastestContainer = containerResults.find(
      r => (r.results.totalDuration || 0) === minDuration
    )?.containerId;

    aggregatedResults.performance.slowestContainer = containerResults.find(
      r => (r.results.totalDuration || 0) === maxDuration
    )?.containerId;

    aggregatedResults.performance.averageDuration = Math.round(
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    );

    // Calculate parallel efficiency
    const totalSequentialTime = durations.reduce((sum, duration) => sum + duration, 0);
    const parallelTime = maxDuration;
    const efficiency = Math.round((totalSequentialTime / parallelTime) * 100) / 100;

    aggregatedResults.performance.sequentialTime = totalSequentialTime;
    aggregatedResults.performance.parallelTime = parallelTime;
    aggregatedResults.performance.efficiency = efficiency;
    aggregatedResults.performance.speedup = `${efficiency}x faster`;
  }

  return aggregatedResults;
}

function aggregatePerformanceData() {
  console.log('📈 Aggregating performance data...');

  if (!fs.existsSync(PERFORMANCE_DIR)) {
    console.log('📈 No performance data found');
    return null;
  }

  const perfFiles = fs
    .readdirSync(PERFORMANCE_DIR)
    .filter(file => file.startsWith('perf-') && file.endsWith('.json'));

  if (perfFiles.length === 0) {
    console.log('📈 No performance files found');
    return null;
  }

  console.log(`📈 Found ${perfFiles.length} performance data files`);

  const performanceData = {
    timestamp: new Date().toISOString(),
    totalEntries: perfFiles.length,
    entries: [],
    summary: {
      averageLoadTime: 0,
      budgetViolations: 0,
      totalPageLoads: 0,
    },
  };

  for (const file of perfFiles) {
    try {
      const filePath = path.join(PERFORMANCE_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      performanceData.entries.push(data);

      if (data.loadTime) {
        performanceData.summary.totalPageLoads++;
        performanceData.summary.averageLoadTime += data.loadTime;

        if (data.budgetViolation) {
          performanceData.summary.budgetViolations++;
        }
      }
    } catch (error) {
      console.error(`❌ Error reading performance file ${file}:`, error.message);
    }
  }

  if (performanceData.summary.totalPageLoads > 0) {
    performanceData.summary.averageLoadTime = Math.round(
      performanceData.summary.averageLoadTime / performanceData.summary.totalPageLoads
    );
  }

  return performanceData;
}

function generateSummaryReport(aggregatedResults, performanceData) {
  console.log('\n🎯 PARALLEL EXECUTION SUMMARY');
  console.log('================================');

  if (aggregatedResults) {
    console.log(`📊 Total Tests: ${aggregatedResults.summary.totalTests}`);
    console.log(`✅ Passed: ${aggregatedResults.summary.totalPassed}`);
    console.log(`❌ Failed: ${aggregatedResults.summary.totalFailed}`);
    console.log(`⏱️  Total Duration: ${aggregatedResults.summary.totalDuration}ms`);
    console.log(`🚀 Containers: ${aggregatedResults.totalContainers}`);

    if (aggregatedResults.performance.efficiency) {
      console.log(`⚡ Parallel Efficiency: ${aggregatedResults.performance.speedup}`);
      console.log(`🏃 Sequential Time: ${aggregatedResults.performance.sequentialTime}ms`);
      console.log(`🏁 Parallel Time: ${aggregatedResults.performance.parallelTime}ms`);
    }

    console.log('\n📋 Container Performance:');
    aggregatedResults.containers.forEach(container => {
      const status = container.failed > 0 ? '❌' : '✅';
      console.log(
        `  ${status} Container ${container.containerId}: ${container.tests} tests in ${container.duration}ms`
      );
    });
  }

  if (performanceData) {
    console.log('\n📈 Performance Summary:');
    console.log(`📄 Page Loads: ${performanceData.summary.totalPageLoads}`);
    console.log(`⚡ Average Load Time: ${performanceData.summary.averageLoadTime}ms`);
    console.log(`⚠️  Budget Violations: ${performanceData.summary.budgetViolations}`);

    if (performanceData.summary.budgetViolations > 0) {
      console.log('⚠️  Some pages exceeded performance budget!');
    }
  }

  console.log('\n================================');
}

function saveAggregatedReport(aggregatedResults, performanceData) {
  const reportDir = REPORTS_DIR;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save aggregated results
  if (aggregatedResults) {
    const resultsFile = path.join(reportDir, `parallel-results-${timestamp}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(aggregatedResults, null, 2));
    console.log(`💾 Aggregated results saved: ${resultsFile}`);
  }

  // Save performance data
  if (performanceData) {
    const perfFile = path.join(reportDir, `performance-summary-${timestamp}.json`);
    fs.writeFileSync(perfFile, JSON.stringify(performanceData, null, 2));
    console.log(`💾 Performance summary saved: ${perfFile}`);
  }

  // Save combined report
  const combinedReport = {
    timestamp: new Date().toISOString(),
    testResults: aggregatedResults,
    performanceData: performanceData,
  };

  const combinedFile = path.join(reportDir, `combined-report-${timestamp}.json`);
  fs.writeFileSync(combinedFile, JSON.stringify(combinedReport, null, 2));
  console.log(`📋 Combined report saved: ${combinedFile}`);
}

function cleanupOldReports() {
  console.log('🧹 Cleaning up old reports...');

  const dirs = [CONTAINERS_DIR, PERFORMANCE_DIR];

  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error(`Error deleting ${file}:`, error.message);
        }
      });
      console.log(`✅ Cleaned up ${files.length} files from ${path.basename(dir)}`);
    }
  });
}

// Main execution
function main() {
  console.log('🚀 Starting parallel results aggregation...\n');

  try {
    // Aggregate container results
    const aggregatedResults = aggregateContainerResults();

    // Aggregate performance data
    const performanceData = aggregatePerformanceData();

    // Generate summary report
    generateSummaryReport(aggregatedResults, performanceData);

    // Save aggregated reports
    saveAggregatedReport(aggregatedResults, performanceData);

    // Clean up temporary files
    cleanupOldReports();

    console.log('\n✅ Parallel results aggregation completed successfully!');

    // Exit with appropriate code
    if (aggregatedResults && aggregatedResults.summary.totalFailed > 0) {
      console.log('❌ Some tests failed');
      process.exit(1);
    } else {
      console.log('✅ All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during aggregation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  aggregateContainerResults,
  aggregatePerformanceData,
  generateSummaryReport,
  saveAggregatedReport,
};

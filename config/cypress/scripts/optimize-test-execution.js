const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Test Execution Optimization Engine
 *
 * Analyzes test suite performance and provides optimizations:
 * - Identifies slow tests and bottlenecks
 * - Suggests parallelization strategies
 * - Optimizes test organization
 * - Provides performance recommendations
 */

const CYPRESS_DIR = path.join(__dirname, '..');
const E2E_DIR = path.join(CYPRESS_DIR, 'e2e');
const REPORTS_DIR = path.join(CYPRESS_DIR, 'reports');

class TestOptimizer {
  constructor() {
    this.testFiles = [];
    this.performanceData = {};
    this.optimizations = [];
    this.recommendations = [];
  }

  async analyze() {
    console.log('🔍 Analyzing test suite for optimization opportunities...');

    // 1. Scan all test files
    await this.scanTestFiles();

    // 2. Analyze performance data
    await this.analyzePerformanceData();

    // 3. Identify optimization opportunities
    await this.identifyOptimizations();

    // 4. Generate recommendations
    await this.generateRecommendations();

    // 5. Create optimization report
    await this.createOptimizationReport();

    console.log('✅ Test optimization analysis complete!');
  }

  async scanTestFiles() {
    console.log('📁 Scanning test files...');

    const pattern = path.join(E2E_DIR, '**/*.cy.{js,ts}');
    const files = glob.sync(pattern);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const stats = fs.statSync(file);

      const analysis = {
        path: file,
        relativePath: path.relative(CYPRESS_DIR, file),
        size: stats.size,
        lines: content.split('\n').length,

        // Test structure analysis
        describeCounts: (content.match(/describe\(/g) || []).length,
        itCounts: (content.match(/\bit\(/g) || []).length,
        beforeEachCounts: (content.match(/beforeEach\(/g) || []).length,
        afterEachCounts: (content.match(/afterEach\(/g) || []).length,

        // Performance indicators
        hasStaticWaits: content.includes('cy.wait(') && /cy\.wait\(\d+\)/.test(content),
        hasAPIIntercepts: content.includes('cy.intercept('),
        hasPageObjects: content.includes('import') && content.includes('Page'),
        usesDataCy: content.includes('data-cy'),

        // Quality indicators
        hasErrorHandling: content.includes('catch') || content.includes('should'),
        hasCleanup: content.includes('afterEach') || content.includes('resetPageState'),
        hasPerformanceMonitoring:
          content.includes('measurePageLoadTime') || content.includes('checkMemoryUsage'),

        // Complexity metrics
        cyclomaticComplexity: this.calculateComplexity(content),
        testDepth: this.calculateTestDepth(content),

        lastModified: stats.mtime,
      };

      this.testFiles.push(analysis);
    }

    console.log(`📊 Found ${this.testFiles.length} test files`);
  }

  calculateComplexity(content) {
    // Simple complexity calculation based on control structures
    const patterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\btry\b/g,
      /\bcatch\b/g,
      /\.\bthen\b/g,
      /\.\bcatch\b/g,
    ];

    let complexity = 1; // Base complexity
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      complexity += matches.length;
    });

    return complexity;
  }

  calculateTestDepth(content) {
    // Calculate maximum nesting depth of describe/it blocks
    let maxDepth = 0;
    let currentDepth = 0;

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('describe(') || line.includes('context(')) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (line.includes('});') && currentDepth > 0) {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  async analyzePerformanceData() {
    console.log('⚡ Analyzing performance data...');

    // Look for recent performance reports
    const perfFiles = glob.sync(path.join(REPORTS_DIR, 'performance/*.json'));
    const containerFiles = glob.sync(path.join(REPORTS_DIR, 'containers/*.json'));

    for (const file of perfFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (data.url && data.loadTime) {
          const url = data.url;
          if (!this.performanceData[url]) {
            this.performanceData[url] = [];
          }
          this.performanceData[url].push(data);
        }
      } catch (error) {
        console.warn(`Failed to parse performance file: ${file}`);
      }
    }

    // Analyze container performance
    for (const file of containerFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (data.results && data.results.specs) {
          data.results.specs.forEach(spec => {
            const specName = spec.spec;
            if (!this.performanceData[specName]) {
              this.performanceData[specName] = [];
            }
            this.performanceData[specName].push({
              type: 'spec',
              duration: spec.stats?.duration || 0,
              tests: spec.stats?.tests || 0,
              passes: spec.stats?.passes || 0,
              failures: spec.stats?.failures || 0,
            });
          });
        }
      } catch (error) {
        console.warn(`Failed to parse container file: ${file}`);
      }
    }

    console.log(
      `📊 Analyzed performance data for ${Object.keys(this.performanceData).length} entities`
    );
  }

  async identifyOptimizations() {
    console.log('🎯 Identifying optimization opportunities...');

    // 1. Identify slow tests
    this.identifySlowTests();

    // 2. Find static waits
    this.identifyStaticWaits();

    // 3. Check for missing optimizations
    this.identifyMissingOptimizations();

    // 4. Analyze test organization
    this.analyzeTestOrganization();

    // 5. Check parallelization opportunities
    this.identifyParallelizationOpportunities();
  }

  identifySlowTests() {
    const slowTests = this.testFiles.filter(test => {
      // Check if test has performance data
      const perfData = this.performanceData[test.relativePath];
      if (perfData && perfData.length > 0) {
        const avgDuration =
          perfData.reduce((sum, p) => sum + (p.duration || 0), 0) / perfData.length;
        return avgDuration > 30000; // Tests taking more than 30 seconds
      }

      // Heuristic: Large files or high complexity might be slow
      return test.lines > 500 || test.cyclomaticComplexity > 20;
    });

    if (slowTests.length > 0) {
      this.optimizations.push({
        type: 'performance',
        severity: 'high',
        title: 'Slow Tests Identified',
        description: `Found ${slowTests.length} potentially slow tests that could benefit from optimization.`,
        tests: slowTests.map(t => t.relativePath),
        recommendations: [
          'Break down large test files into smaller, focused test suites',
          'Use API calls instead of UI interactions where possible',
          'Implement more aggressive timeouts for faster feedback',
          'Consider running slow tests in separate parallel containers',
        ],
      });
    }
  }

  identifyStaticWaits() {
    const testsWithStaticWaits = this.testFiles.filter(test => test.hasStaticWaits);

    if (testsWithStaticWaits.length > 0) {
      this.optimizations.push({
        type: 'reliability',
        severity: 'high',
        title: 'Static Waits Found',
        description: `Found ${testsWithStaticWaits.length} test files using static waits (cy.wait(number)).`,
        tests: testsWithStaticWaits.map(t => t.relativePath),
        recommendations: [
          'Replace cy.wait(number) with dynamic waits using cy.intercept() and cy.wait(@alias)',
          'Use element-based waits: cy.get(selector).should("be.visible")',
          'Implement proper API mocking and interception',
          'Use waitUntil for custom conditions',
        ],
      });
    }
  }

  identifyMissingOptimizations() {
    const testsWithoutPageObjects = this.testFiles.filter(test => !test.hasPageObjects);
    const testsWithoutDataCy = this.testFiles.filter(test => !test.usesDataCy);
    const testsWithoutPerformanceMonitoring = this.testFiles.filter(
      test => !test.hasPerformanceMonitoring
    );

    if (testsWithoutPageObjects.length > 0) {
      this.optimizations.push({
        type: 'maintainability',
        severity: 'medium',
        title: 'Missing Page Object Pattern',
        description: `${testsWithoutPageObjects.length} tests not using Page Object Model.`,
        tests: testsWithoutPageObjects.map(t => t.relativePath),
        recommendations: [
          'Implement Page Object Model for better test maintainability',
          'Use centralized element selectors and actions',
          'Extend BasePage for consistent patterns',
        ],
      });
    }

    if (testsWithoutDataCy.length > 0) {
      this.optimizations.push({
        type: 'reliability',
        severity: 'medium',
        title: 'Missing data-cy Attributes',
        description: `${testsWithoutDataCy.length} tests not using data-cy selectors.`,
        tests: testsWithoutDataCy.map(t => t.relativePath),
        recommendations: [
          'Use data-cy attributes for stable element selection',
          'Avoid CSS class and ID selectors that may change',
          'Implement consistent data-cy naming convention',
        ],
      });
    }

    if (testsWithoutPerformanceMonitoring.length > 3) {
      // Only flag if many tests lack monitoring
      this.optimizations.push({
        type: 'performance',
        severity: 'low',
        title: 'Limited Performance Monitoring',
        description: `${testsWithoutPerformanceMonitoring.length} tests not using performance monitoring.`,
        recommendations: [
          'Add performance budget enforcement to critical user journeys',
          'Monitor page load times and interaction responsiveness',
          'Track memory usage for long-running test suites',
        ],
      });
    }
  }

  analyzeTestOrganization() {
    // Check for test files that might benefit from reorganization
    const largeTestFiles = this.testFiles.filter(test => test.lines > 300 || test.itCounts > 20);
    const deeplyNestedTests = this.testFiles.filter(test => test.testDepth > 4);

    if (largeTestFiles.length > 0) {
      this.optimizations.push({
        type: 'organization',
        severity: 'medium',
        title: 'Large Test Files',
        description: `${largeTestFiles.length} test files are quite large and could be split.`,
        tests: largeTestFiles.map(t => t.relativePath),
        recommendations: [
          'Split large test files by feature or user journey',
          'Keep test files focused on single responsibilities',
          'Use shared setup in beforeEach hooks',
        ],
      });
    }

    if (deeplyNestedTests.length > 0) {
      this.optimizations.push({
        type: 'organization',
        severity: 'low',
        title: 'Deeply Nested Tests',
        description: `${deeplyNestedTests.length} test files have deep nesting that might impact readability.`,
        tests: deeplyNestedTests.map(t => t.relativePath),
        recommendations: [
          'Consider flattening test structure for better readability',
          'Use descriptive test names to reduce need for deep nesting',
          'Group related tests in separate files instead of deep describes',
        ],
      });
    }
  }

  identifyParallelizationOpportunities() {
    // Analyze test distribution for parallel execution
    const totalTests = this.testFiles.reduce((sum, file) => sum + file.itCounts, 0);
    const averageTestsPerFile = totalTests / this.testFiles.length;

    // Check if tests are well-distributed for parallelization
    const unbalancedFiles = this.testFiles.filter(
      file => file.itCounts > averageTestsPerFile * 2 || file.itCounts < averageTestsPerFile * 0.5
    );

    if (unbalancedFiles.length > this.testFiles.length * 0.3) {
      this.optimizations.push({
        type: 'parallelization',
        severity: 'medium',
        title: 'Unbalanced Test Distribution',
        description: `Test suite has uneven distribution that may impact parallel execution efficiency.`,
        recommendations: [
          'Rebalance test files to have similar numbers of tests',
          'Consider moving tests between files for better parallel distribution',
          'Use test tagging to create balanced parallel groups',
        ],
      });
    }
  }

  async generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');

    // Priority recommendations based on identified optimizations
    const highPriorityOptimizations = this.optimizations.filter(o => o.severity === 'high');
    const mediumPriorityOptimizations = this.optimizations.filter(o => o.severity === 'medium');
    const lowPriorityOptimizations = this.optimizations.filter(o => o.severity === 'low');

    // Generate actionable recommendations
    if (highPriorityOptimizations.length > 0) {
      this.recommendations.push({
        priority: 'immediate',
        title: '🚨 Critical Optimizations',
        description:
          'These optimizations should be addressed immediately for better test reliability and performance.',
        actions: highPriorityOptimizations.flatMap(o => o.recommendations || []),
      });
    }

    if (mediumPriorityOptimizations.length > 0) {
      this.recommendations.push({
        priority: 'soon',
        title: '⚡ Performance Improvements',
        description: 'These optimizations will improve test execution speed and maintainability.',
        actions: mediumPriorityOptimizations.flatMap(o => o.recommendations || []),
      });
    }

    if (lowPriorityOptimizations.length > 0) {
      this.recommendations.push({
        priority: 'future',
        title: '🔧 Enhancement Opportunities',
        description: 'These improvements can be addressed in future iterations.',
        actions: lowPriorityOptimizations.flatMap(o => o.recommendations || []),
      });
    }

    // Add general best practices
    this.recommendations.push({
      priority: 'ongoing',
      title: '📋 Best Practices',
      description: 'Continuous improvements to maintain test quality.',
      actions: [
        'Regularly review and update test execution times',
        'Monitor flaky test patterns and address root causes',
        'Keep test dependencies up to date',
        'Implement automated test health monitoring',
        'Regular code reviews focusing on test quality',
      ],
    });
  }

  async createOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTestFiles: this.testFiles.length,
        totalOptimizations: this.optimizations.length,
        totalRecommendations: this.recommendations.length,
        highPriorityIssues: this.optimizations.filter(o => o.severity === 'high').length,
        estimatedImpact: this.calculateEstimatedImpact(),
      },
      testFileAnalysis: this.testFiles,
      optimizations: this.optimizations,
      recommendations: this.recommendations,
      performanceData: this.performanceData,
    };

    // Save detailed report
    const reportFile = path.join(
      REPORTS_DIR,
      `optimization-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Create summary report
    this.createSummaryReport(report);

    console.log(`📊 Optimization report saved: ${reportFile}`);
  }

  calculateEstimatedImpact() {
    // Estimate potential time savings from optimizations
    const staticWaitOptimizations = this.optimizations.filter(o => o.title.includes('Static Wait'));
    const slowTestOptimizations = this.optimizations.filter(o => o.title.includes('Slow Test'));

    let estimatedSavings = 0;

    // Static waits: assume 5 seconds average savings per occurrence
    staticWaitOptimizations.forEach(opt => {
      estimatedSavings += (opt.tests?.length || 0) * 5000;
    });

    // Slow tests: assume 30% time reduction
    slowTestOptimizations.forEach(opt => {
      estimatedSavings += (opt.tests?.length || 0) * 10000; // 10 seconds average
    });

    return {
      estimatedTimeSavingsMs: estimatedSavings,
      estimatedTimeSavingsMinutes: Math.round(estimatedSavings / 60000),
      potentialSpeedImprovement:
        estimatedSavings > 0
          ? `${Math.round((estimatedSavings / (this.testFiles.length * 30000)) * 100)}%`
          : '0%',
    };
  }

  createSummaryReport(report) {
    console.log('\n🎯 TEST OPTIMIZATION SUMMARY');
    console.log('============================');
    console.log(`📊 Total Test Files: ${report.summary.totalTestFiles}`);
    console.log(`🎯 Optimizations Found: ${report.summary.totalOptimizations}`);
    console.log(`⚠️  High Priority Issues: ${report.summary.highPriorityIssues}`);
    console.log(
      `⚡ Estimated Time Savings: ${report.summary.estimatedImpact.estimatedTimeSavingsMinutes} minutes`
    );
    console.log(
      `🚀 Potential Speed Improvement: ${report.summary.estimatedImpact.potentialSpeedImprovement}`
    );

    console.log('\n📋 RECOMMENDATIONS BY PRIORITY:');
    report.recommendations.forEach(rec => {
      console.log(`\n${rec.title}`);
      console.log(`Priority: ${rec.priority.toUpperCase()}`);
      console.log(`${rec.description}`);
      rec.actions.forEach((action, index) => {
        console.log(`  ${index + 1}. ${action}`);
      });
    });

    if (report.optimizations.length > 0) {
      console.log('\n🔍 DETAILED OPTIMIZATIONS:');
      report.optimizations.forEach(opt => {
        console.log(`\n${opt.title} (${opt.severity.toUpperCase()})`);
        console.log(`${opt.description}`);
        if (opt.tests && opt.tests.length > 0) {
          console.log(
            `Affected files: ${opt.tests.slice(0, 3).join(', ')}${opt.tests.length > 3 ? ` and ${opt.tests.length - 3} more` : ''}`
          );
        }
      });
    }

    console.log('\n============================');
  }
}

// Main execution
async function main() {
  try {
    const optimizer = new TestOptimizer();
    await optimizer.analyze();
    console.log('\n✅ Test optimization analysis completed successfully!');
  } catch (error) {
    console.error('❌ Error during test optimization analysis:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { TestOptimizer, main };

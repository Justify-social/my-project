const fs = require('fs');
const path = require('path');

/**
 * Comprehensive HTML Report Generator
 *
 * Generates beautiful, interactive HTML reports combining:
 * - Test results from parallel execution
 * - Performance metrics and budgets
 * - Coverage statistics
 * - Trend analysis
 */

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const TEMPLATE_DIR = path.join(__dirname, 'templates');

function generateHTMLReport() {
  console.log('📊 Generating comprehensive HTML report...');

  // Find the latest combined report
  const reportFiles = fs
    .readdirSync(REPORTS_DIR)
    .filter(file => file.startsWith('combined-report-') && file.endsWith('.json'))
    .sort()
    .reverse();

  if (reportFiles.length === 0) {
    console.log('❌ No combined reports found');
    return;
  }

  const latestReport = reportFiles[0];
  const reportPath = path.join(REPORTS_DIR, latestReport);
  const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  console.log(`📋 Processing report: ${latestReport}`);

  // Generate HTML content
  const htmlContent = generateHTMLContent(reportData);

  // Save HTML report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlFile = path.join(REPORTS_DIR, `cypress-report-${timestamp}.html`);

  fs.writeFileSync(htmlFile, htmlContent);
  console.log(`✅ HTML report generated: ${htmlFile}`);

  // Create latest symlink
  const latestSymlink = path.join(REPORTS_DIR, 'latest-report.html');
  if (fs.existsSync(latestSymlink)) {
    fs.unlinkSync(latestSymlink);
  }
  fs.symlinkSync(path.basename(htmlFile), latestSymlink);
  console.log(`🔗 Latest report symlink created: ${latestSymlink}`);

  return htmlFile;
}

function generateHTMLContent(reportData) {
  const { testResults, performanceData } = reportData;

  // Calculate summary metrics
  const summary = calculateSummaryMetrics(testResults, performanceData);

  // Generate sections
  const headerSection = generateHeaderSection(summary);
  const overviewSection = generateOverviewSection(testResults);
  const performanceSection = generatePerformanceSection(performanceData);
  const parallelSection = generateParallelSection(testResults);
  const trendsSection = generateTrendsSection(reportData);
  const recommendationsSection = generateRecommendations(summary);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cypress Test Report - ${new Date().toLocaleDateString()}</title>
    <style>
        ${getReportCSS()}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        ${headerSection}
        ${overviewSection}
        ${performanceSection}
        ${parallelSection}
        ${trendsSection}
        ${recommendationsSection}
    </div>
    <script>
        ${getReportJS()}
    </script>
</body>
</html>`;
}

function calculateSummaryMetrics(testResults, performanceData) {
  const summary = {
    totalTests: testResults?.summary?.totalTests || 0,
    totalPassed: testResults?.summary?.totalPassed || 0,
    totalFailed: testResults?.summary?.totalFailed || 0,
    totalDuration: testResults?.summary?.totalDuration || 0,
    successRate: 0,
    averageTestTime: 0,
    parallelEfficiency: testResults?.performance?.efficiency || 1,
    performanceViolations: performanceData?.summary?.budgetViolations || 0,
    averagePageLoad: performanceData?.summary?.averageLoadTime || 0,
    grade: 'A',
    status: 'passing',
  };

  if (summary.totalTests > 0) {
    summary.successRate = Math.round((summary.totalPassed / summary.totalTests) * 100);
    summary.averageTestTime = Math.round(summary.totalDuration / summary.totalTests);
  }

  // Calculate overall grade
  if (summary.successRate < 80 || summary.performanceViolations > 5) {
    summary.grade = 'F';
    summary.status = 'failing';
  } else if (summary.successRate < 90 || summary.performanceViolations > 2) {
    summary.grade = 'C';
    summary.status = 'warning';
  } else if (summary.successRate < 95 || summary.performanceViolations > 0) {
    summary.grade = 'B';
    summary.status = 'good';
  } else {
    summary.grade = 'A';
    summary.status = 'excellent';
  }

  return summary;
}

function generateHeaderSection(summary) {
  const statusIcon = {
    excellent: '🎉',
    good: '✅',
    warning: '⚠️',
    failing: '❌',
  }[summary.status];

  const statusColor = {
    excellent: '#10b981',
    good: '#059669',
    warning: '#f59e0b',
    failing: '#ef4444',
  }[summary.status];

  return `
    <header class="header">
        <div class="header-content">
            <h1 class="title">
                ${statusIcon} Cypress Test Report
                <span class="grade" style="background-color: ${statusColor}">Grade: ${summary.grade}</span>
            </h1>
            <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>
        </div>
        <div class="header-stats">
            <div class="stat-card">
                <div class="stat-value">${summary.totalTests}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #10b981">${summary.totalPassed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #ef4444">${summary.totalFailed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>
    </header>`;
}

function generateOverviewSection(testResults) {
  if (!testResults) return '<div class="section"><h2>No test results available</h2></div>';

  const containers = testResults.containers || [];
  const specs = testResults.specs || {};

  return `
    <section class="section">
        <h2>📊 Test Execution Overview</h2>
        <div class="grid">
            <div class="card">
                <h3>Container Distribution</h3>
                <canvas id="containerChart"></canvas>
                <script>
                    window.containerData = ${JSON.stringify(containers)};
                </script>
            </div>
            <div class="card">
                <h3>Spec Results</h3>
                <div class="spec-list">
                    ${Object.entries(specs)
                      .map(
                        ([specName, specData]) => `
                        <div class="spec-item">
                            <div class="spec-name">${specName.replace('config/cypress/e2e/', '')}</div>
                            <div class="spec-stats">
                                <span class="stat-badge success">${specData.totalPassed} passed</span>
                                ${specData.totalFailed > 0 ? `<span class="stat-badge failure">${specData.totalFailed} failed</span>` : ''}
                                <span class="stat-badge duration">${specData.totalDuration}ms</span>
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
        </div>
    </section>`;
}

function generatePerformanceSection(performanceData) {
  if (!performanceData) return '<div class="section"><h2>No performance data available</h2></div>';

  const summary = performanceData.summary || {};
  const entries = performanceData.entries || [];

  return `
    <section class="section">
        <h2>⚡ Performance Analysis</h2>
        <div class="grid">
            <div class="card">
                <h3>Performance Summary</h3>
                <div class="metric-grid">
                    <div class="metric">
                        <div class="metric-value">${summary.averageLoadTime || 0}ms</div>
                        <div class="metric-label">Average Load Time</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${summary.totalPageLoads || 0}</div>
                        <div class="metric-label">Page Loads</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value ${summary.budgetViolations > 0 ? 'warning' : 'success'}">${summary.budgetViolations || 0}</div>
                        <div class="metric-label">Budget Violations</div>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>Performance Timeline</h3>
                <canvas id="performanceChart"></canvas>
                <script>
                    window.performanceData = ${JSON.stringify(entries)};
                </script>
            </div>
        </div>
    </section>`;
}

function generateParallelSection(testResults) {
  if (!testResults?.performance) return '';

  const perf = testResults.performance;

  return `
    <section class="section">
        <h2>🚀 Parallel Execution Efficiency</h2>
        <div class="grid">
            <div class="card">
                <h3>Efficiency Metrics</h3>
                <div class="efficiency-display">
                    <div class="efficiency-value">${perf.speedup || '1x faster'}</div>
                    <div class="efficiency-details">
                        <div>Sequential Time: ${perf.sequentialTime || 0}ms</div>
                        <div>Parallel Time: ${perf.parallelTime || 0}ms</div>
                        <div>Efficiency: ${perf.efficiency || 1}x</div>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>Container Performance</h3>
                <div class="container-list">
                    ${(testResults.containers || [])
                      .map(
                        container => `
                        <div class="container-item">
                            <div class="container-id">Container ${container.containerId}</div>
                            <div class="container-stats">
                                <span>${container.tests} tests</span>
                                <span>${container.duration}ms</span>
                                <span class="${container.failed > 0 ? 'failure' : 'success'}">${container.failed > 0 ? 'Failed' : 'Passed'}</span>
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
        </div>
    </section>`;
}

function generateTrendsSection(reportData) {
  // This would typically show trends over time
  // For now, we'll show a placeholder for future implementation
  return `
    <section class="section">
        <h2>📈 Performance Trends</h2>
        <div class="card">
            <div class="trend-placeholder">
                <p>📊 Trend analysis will be available after collecting data from multiple test runs.</p>
                <p>Features coming soon:</p>
                <ul>
                    <li>Test execution time trends</li>
                    <li>Performance regression detection</li>
                    <li>Success rate over time</li>
                    <li>Flaky test identification</li>
                </ul>
            </div>
        </div>
    </section>`;
}

function generateRecommendations(summary) {
  const recommendations = [];

  if (summary.totalFailed > 0) {
    recommendations.push({
      type: 'error',
      title: 'Failed Tests',
      message: `${summary.totalFailed} tests failed. Review and fix failing tests to improve reliability.`,
    });
  }

  if (summary.performanceViolations > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Performance Issues',
      message: `${summary.performanceViolations} performance budget violations detected. Consider optimizing page load times.`,
    });
  }

  if (summary.parallelEfficiency < 2) {
    recommendations.push({
      type: 'info',
      title: 'Parallel Efficiency',
      message: 'Consider adding more test containers to improve parallel execution efficiency.',
    });
  }

  if (summary.averageTestTime > 5000) {
    recommendations.push({
      type: 'info',
      title: 'Test Duration',
      message:
        'Average test time is high. Consider optimizing test execution or using more aggressive timeouts.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      title: 'Excellent Results',
      message: 'All tests are passing with good performance. Great job! 🎉',
    });
  }

  return `
    <section class="section">
        <h2>💡 Recommendations</h2>
        <div class="recommendations">
            ${recommendations
              .map(
                rec => `
                <div class="recommendation ${rec.type}">
                    <h3>${rec.title}</h3>
                    <p>${rec.message}</p>
                </div>
            `
              )
              .join('')}
        </div>
    </section>`;
}

function getReportCSS() {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
        color: #374151;
        background-color: #f9fafb;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .header-content {
        text-align: center;
        margin-bottom: 2rem;
    }

    .title {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }

    .grade {
        font-size: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 50px;
        color: white;
        font-weight: bold;
    }

    .subtitle {
        opacity: 0.9;
        font-size: 1.1rem;
    }

    .header-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }

    .stat-card {
        text-align: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 8px;
        backdrop-filter: blur(10px);
    }

    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
    }

    .stat-label {
        font-size: 0.875rem;
        opacity: 0.9;
    }

    .section {
        margin-bottom: 2rem;
    }

    .section h2 {
        font-size: 1.75rem;
        margin-bottom: 1rem;
        color: #1f2937;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
    }

    .card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
    }

    .card h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #374151;
    }

    .metric-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }

    .metric {
        text-align: center;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;
    }

    .metric-value {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
    }

    .metric-value.warning {
        color: #f59e0b;
    }

    .metric-value.success {
        color: #10b981;
    }

    .metric-label {
        font-size: 0.875rem;
        color: #6b7280;
    }

    .spec-list, .container-list {
        space-y: 0.5rem;
    }

    .spec-item, .container-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }

    .spec-name, .container-id {
        font-weight: 500;
        flex: 1;
    }

    .spec-stats, .container-stats {
        display: flex;
        gap: 0.5rem;
    }

    .stat-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .stat-badge.success {
        background: #d1fae5;
        color: #065f46;
    }

    .stat-badge.failure {
        background: #fee2e2;
        color: #991b1b;
    }

    .stat-badge.duration {
        background: #e0e7ff;
        color: #3730a3;
    }

    .efficiency-display {
        text-align: center;
    }

    .efficiency-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: #059669;
        margin-bottom: 1rem;
    }

    .efficiency-details {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        text-align: center;
    }

    .recommendations {
        display: grid;
        gap: 1rem;
    }

    .recommendation {
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid;
    }

    .recommendation.error {
        background: #fef2f2;
        border-color: #ef4444;
    }

    .recommendation.warning {
        background: #fffbeb;
        border-color: #f59e0b;
    }

    .recommendation.info {
        background: #eff6ff;
        border-color: #3b82f6;
    }

    .recommendation.success {
        background: #f0fdf4;
        border-color: #10b981;
    }

    .recommendation h3 {
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }

    .trend-placeholder {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }

    .trend-placeholder ul {
        text-align: left;
        display: inline-block;
        margin-top: 1rem;
    }

    canvas {
        max-height: 300px;
    }

    @media (max-width: 768px) {
        .grid {
            grid-template-columns: 1fr;
        }
        
        .header-stats {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .title {
            font-size: 2rem;
            flex-direction: column;
        }
    }
  `;
}

function getReportJS() {
  return `
    // Initialize charts when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Container performance chart
        if (window.containerData && document.getElementById('containerChart')) {
            const ctx = document.getElementById('containerChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: window.containerData.map(c => \`Container \${c.containerId}\`),
                    datasets: [{
                        data: window.containerData.map(c => c.tests),
                        backgroundColor: [
                            '#3b82f6',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Performance timeline chart
        if (window.performanceData && document.getElementById('performanceChart')) {
            const ctx = document.getElementById('performanceChart').getContext('2d');
            const perfData = window.performanceData.filter(d => d.loadTime);
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: perfData.map((_, i) => \`Test \${i + 1}\`),
                    datasets: [{
                        label: 'Load Time (ms)',
                        data: perfData.map(d => d.loadTime),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Budget (ms)',
                        data: perfData.map(d => d.performanceBudget),
                        borderColor: '#ef4444',
                        borderDash: [5, 5],
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Time (ms)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    });
  `;
}

// Main execution
function main() {
  try {
    const htmlFile = generateHTMLReport();
    console.log('\n✅ HTML report generation completed successfully!');
    console.log(`📁 Report location: ${htmlFile}`);
    return htmlFile;
  } catch (error) {
    console.error('❌ Error generating HTML report:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateHTMLReport,
  main,
};

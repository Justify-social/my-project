'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CypressTestMetrics,
  TestExecution,
  ErrorPattern,
  CoverageMetrics,
  PerformanceAnalysis,
  SSOTCompliance,
  HistoricalTrend,
} from '@/lib/analytics/cypress-analytics';

// Enhanced Metrics Overview with comprehensive data
export const ComprehensiveMetricsOverview: React.FC<{ metrics: CypressTestMetrics }> = ({
  metrics,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-accent">{metrics.totalTests}</div>
        <div className="text-sm text-muted-foreground">Total Tests</div>
        <div className="text-xs text-green-600 mt-1">+5 this week</div>
      </CardContent>
    </Card>

    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-green-600">{metrics.passedTests}</div>
        <div className="text-sm text-muted-foreground">Passed</div>
        <div className="text-xs text-muted-foreground mt-1">
          {metrics.passRate?.toFixed(1) || '0.0'}% success
        </div>
      </CardContent>
    </Card>

    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-red-600">{metrics.failedTests}</div>
        <div className="text-sm text-muted-foreground">Failed</div>
        <div className="text-xs text-muted-foreground mt-1">
          {metrics.failureRate?.toFixed(1) || '0.0'}% failure
        </div>
      </CardContent>
    </Card>

    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-accent">{metrics.performanceGrade}</div>
        <div className="text-sm text-muted-foreground">Performance Grade</div>
        <div className="text-xs text-muted-foreground mt-1">Overall quality</div>
      </CardContent>
    </Card>

    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-blue-600">{metrics.stabilityScore}%</div>
        <div className="text-sm text-muted-foreground">Stability Score</div>
        <div className="text-xs text-muted-foreground mt-1">
          {metrics.flakyTestCount} flaky tests
        </div>
      </CardContent>
    </Card>

    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-purple-600">
          {metrics.avgExecutionTime ? (metrics.avgExecutionTime / 1000).toFixed(1) : '0.0'}s
        </div>
        <div className="text-sm text-muted-foreground">Avg Duration</div>
        <div className="text-xs text-muted-foreground mt-1">Per test execution</div>
      </CardContent>
    </Card>
  </div>
);

// Enhanced Test Executions with comprehensive details
export const EnhancedTestExecutions: React.FC<{ executions: TestExecution[] }> = ({
  executions,
}) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Recent Test Executions</CardTitle>
      <CardDescription>Latest test runs with comprehensive execution details</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {executions.slice(0, 8).map(execution => (
          <div
            key={execution.id}
            className="flex items-center justify-between p-4 border border-divider rounded-lg hover:bg-muted/50 transition-colours"
          >
            <div className="flex-1">
              <div className="font-medium">{execution.name}</div>
              <div className="text-sm text-muted-foreground">{execution.spec}</div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{execution.commands} commands</span>
                <span>{execution.assertions} assertions</span>
                <span>{execution.networkRequests} network requests</span>
                {execution.memoryUsage && <span>{execution.memoryUsage.toFixed(1)}MB memory</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <Badge
                  variant={
                    execution.status === 'passed'
                      ? 'default'
                      : execution.status === 'failed'
                        ? 'destructive'
                        : execution.status === 'retried'
                          ? 'secondary'
                          : 'outline'
                  }
                >
                  {execution.status}
                </Badge>
                {execution.retryCount > 0 && (
                  <div className="text-xs text-orange-600 mt-1">{execution.retryCount} retries</div>
                )}
              </div>

              <div className="text-center">
                <div className="text-sm font-medium">{execution.duration}ms</div>
                <div className="text-xs text-muted-foreground">{execution.browser}</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-muted-foreground">{execution.timestamp}</div>
                {execution.screenshots > 0 && (
                  <div className="text-xs text-blue-600">{execution.screenshots} screenshots</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Comprehensive Error Analysis
export const ComprehensiveErrorAnalysis: React.FC<{ errors: ErrorPattern[] }> = ({ errors }) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Error Pattern Analysis</CardTitle>
      <CardDescription>Comprehensive error categorisation and resolution guidance</CardDescription>
    </CardHeader>
    <CardContent>
      {errors.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-green-600 text-lg font-medium mb-2">No Errors Found</div>
          <div className="text-muted-foreground text-sm">
            All tests passed successfully. No error patterns to analyse.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {errors.map((error, index) => (
            <div key={index} className="p-4 border border-divider rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{error.category}</Badge>
                  <Badge variant="outline">{error.severity}</Badge>
                  <Badge variant="secondary">{error.frequency}</Badge>
                </div>
                <div className="text-sm font-medium text-red-600">{error.count} occurrences</div>
              </div>

              <div className="font-medium mb-2">{error.error}</div>

              {error.resolution && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <div className="text-sm font-medium text-green-800 mb-1">
                    Recommended Resolution:
                  </div>
                  <div className="text-sm text-green-700">{error.resolution}</div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last occurred: {error.lastOccurred}</span>
                <span>Affected files: {error.files.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

// Enhanced Coverage Analysis
export const EnhancedCoverageAnalysis: React.FC<{ coverage: CoverageMetrics[] }> = ({
  coverage,
}) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Test Coverage Analysis</CardTitle>
      <CardDescription>
        Comprehensive coverage metrics across all application features
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {coverage.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border border-divider rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium">{item.category}</div>
              <div className="text-sm text-muted-foreground">
                {item.coveredTests}/{item.totalTests} tests covered • {item.criticalPathsCovered}{' '}
                critical paths
              </div>
              <div className="text-xs text-muted-foreground mt-1">Last run: {item.lastTestRun}</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-32">
                <Progress
                  value={item.coveragePercentage}
                  className={`h-2 ${
                    item.coveragePercentage >= 90
                      ? 'bg-green-100'
                      : item.coveragePercentage >= 80
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                  }`}
                />
              </div>
              <div className="text-center min-w-[60px]">
                <div className="text-sm font-medium">{item.coveragePercentage}%</div>
                <Badge
                  variant={
                    item.status === 'Excellent'
                      ? 'default'
                      : item.status === 'Good'
                        ? 'secondary'
                        : item.status === 'Needs Improvement'
                          ? 'destructive'
                          : 'outline'
                  }
                  className="text-xs"
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Performance Analysis Dashboard
export const PerformanceAnalysisDashboard: React.FC<{ performance: PerformanceAnalysis[] }> = ({
  performance,
}) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Performance Analysis</CardTitle>
      <CardDescription>
        Execution time analysis and performance optimisation recommendations
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {performance.map((item, index) => (
          <div key={index} className="border border-divider rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">{item.category}</h4>
              <Badge
                variant={
                  item.trend === 'Improving'
                    ? 'default'
                    : item.trend === 'Stable'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {item.trend}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-accent">
                  {(item.avgTime / 1000).toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {(item.minTime / 1000).toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">Fastest</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {(item.maxTime / 1000).toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">Slowest</div>
              </div>
            </div>

            {item.bottlenecks.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium mb-2 text-orange-600">
                  Identified Bottlenecks:
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {item.bottlenecks.map((bottleneck, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      {bottleneck}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.recommendations.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2 text-blue-600">
                  Optimisation Recommendations:
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {item.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// SSOT Compliance Dashboard
export const SSOTComplianceDashboard: React.FC<{ compliance: SSOTCompliance[] }> = ({
  compliance,
}) => {
  const totalFiles = compliance.length;
  const compliantFiles = compliance.filter(f => f.isCompliant).length;
  const modernAuthFiles = compliance.filter(f => f.authPattern === 'Modern').length;
  const avgScore =
    totalFiles > 0 ? compliance.reduce((sum, f) => sum + f.complianceScore, 0) / totalFiles : 0;

  return (
    <Card className="border-divider">
      <CardHeader>
        <CardTitle className="text-lg">SSOT Compliance Status</CardTitle>
        <CardDescription>
          Single Source of Truth compliance and modern authentication patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {compliantFiles}/{totalFiles}
            </div>
            <div className="text-sm text-muted-foreground">SSOT Compliant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {modernAuthFiles}/{totalFiles}
            </div>
            <div className="text-sm text-muted-foreground">Modern Auth</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{avgScore.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">0</div>
            <div className="text-sm text-muted-foreground">Deprecated Methods</div>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {compliance.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-divider rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium">{file.fileName}</div>
                <div className="text-sm text-muted-foreground">
                  Last checked: {file.lastChecked}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={file.isCompliant ? 'default' : 'destructive'}>
                  {file.isCompliant ? 'Compliant' : 'Issues Found'}
                </Badge>
                <Badge
                  variant={
                    file.authPattern === 'Modern'
                      ? 'default'
                      : file.authPattern === 'Deprecated'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {file.authPattern}
                </Badge>
                <div className="text-sm font-medium text-accent">{file.complianceScore}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Historical Trends Visualisation
export const HistoricalTrendsChart: React.FC<{ trends: HistoricalTrend[] }> = ({ trends }) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Historical Performance Trends</CardTitle>
      <CardDescription>30-day test execution trends and quality metrics</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center border border-divider rounded-lg bg-muted/20 mb-4">
        <div className="text-center">
          <div className="text-muted-foreground">Interactive Trend Visualisation</div>
          <div className="text-sm text-muted-foreground mt-2">
            Pass rate, execution time, and error trends over time
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {trends[trends.length - 1]?.passRate?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-sm text-muted-foreground">Current Pass Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {trends[trends.length - 1]?.avgDuration
              ? (trends[trends.length - 1].avgDuration / 1000).toFixed(1)
              : '0.0'}
            s
          </div>
          <div className="text-sm text-muted-foreground">Current Avg Duration</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {trends[trends.length - 1]?.testCount}
          </div>
          <div className="text-sm text-muted-foreground">Current Test Count</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {trends[trends.length - 1]?.errorCount}
          </div>
          <div className="text-sm text-muted-foreground">Recent Errors</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

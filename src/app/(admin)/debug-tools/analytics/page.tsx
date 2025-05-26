'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - replace with real API calls
interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  avgExecutionTime: number;
  totalExecutionTime: number;
  lastUpdated: string;
}

interface TestExecution {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running';
  duration: number;
  timestamp: string;
  spec: string;
}

interface ErrorPattern {
  error: string;
  count: number;
  lastOccurred: string;
  files: string[];
}

// Components for different sections
const MetricsOverview: React.FC<{ metrics: TestMetrics }> = ({ metrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-accent">{metrics.totalTests}</div>
        <div className="text-sm text-muted-foreground">Total Tests</div>
      </CardContent>
    </Card>
    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-green-600">{metrics.passedTests}</div>
        <div className="text-sm text-muted-foreground">Passed</div>
      </CardContent>
    </Card>
    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-red-600">{metrics.failedTests}</div>
        <div className="text-sm text-muted-foreground">Failed</div>
      </CardContent>
    </Card>
    <Card className="border-divider">
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-accent">{metrics.passRate.toFixed(1)}%</div>
        <div className="text-sm text-muted-foreground">Pass Rate</div>
      </CardContent>
    </Card>
  </div>
);

const RecentExecutions: React.FC<{ executions: TestExecution[] }> = ({ executions }) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Recent Test Executions</CardTitle>
      <CardDescription>Latest test runs with status and timing</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {executions.map(execution => (
          <div
            key={execution.id}
            className="flex items-center justify-between p-3 border border-divider rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium">{execution.name}</div>
              <div className="text-sm text-muted-foreground">{execution.spec}</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  execution.status === 'passed'
                    ? 'default'
                    : execution.status === 'failed'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {execution.status}
              </Badge>
              <div className="text-sm text-muted-foreground">{execution.duration}ms</div>
              <div className="text-xs text-muted-foreground">{execution.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ErrorAnalysis: React.FC<{ errors: ErrorPattern[] }> = ({ errors }) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Common Error Patterns</CardTitle>
      <CardDescription>Most frequent test failures requiring attention</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {errors.map((error, index) => (
          <div key={index} className="p-3 border border-divider rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-red-600">Error #{index + 1}</div>
              <Badge variant="destructive">{error.count} occurrences</Badge>
            </div>
            <div className="text-sm mb-2">{error.error}</div>
            <div className="text-xs text-muted-foreground">
              Last occurred: {error.lastOccurred} | Files: {error.files.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const TestCoverage: React.FC = () => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Test Coverage Analysis</CardTitle>
      <CardDescription>Coverage metrics across different test categories</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Authentication Tests</span>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
            <span className="text-sm">95%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>Campaign Tests</span>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
            <span className="text-sm">87%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>Dashboard Tests</span>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
            <span className="text-sm">72%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>Marketplace Tests</span>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <span className="text-sm">68%</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PerformanceMetrics: React.FC = () => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">Performance Metrics</CardTitle>
      <CardDescription>Test execution performance and bottleneck analysis</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">2.3s</div>
          <div className="text-sm text-muted-foreground">Avg Execution Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">45.2s</div>
          <div className="text-sm text-muted-foreground">Total Suite Time</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Fastest: auth-official-simple.cy.js</span>
          <span>0.8s</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Slowest: campaigns-comprehensive.cy.js</span>
          <span>12.4s</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Most Flaky: marketplace-minimal.cy.js</span>
          <span>3 retries</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function CypressAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<TestMetrics>({
    totalTests: 59,
    passedTests: 56,
    failedTests: 3,
    passRate: 94.9,
    avgExecutionTime: 2345,
    totalExecutionTime: 45234,
    lastUpdated: new Date().toLocaleString(),
  });

  const [recentExecutions] = useState<TestExecution[]>([
    {
      id: '1',
      name: 'Authentication Flow Complete',
      status: 'passed',
      duration: 2340,
      timestamp: '2 min ago',
      spec: 'auth-official-simple.cy.js',
    },
    {
      id: '2',
      name: 'Campaign Creation Workflow',
      status: 'passed',
      duration: 5120,
      timestamp: '5 min ago',
      spec: 'campaigns-with-page-objects.cy.js',
    },
    {
      id: '3',
      name: 'Dashboard Navigation',
      status: 'failed',
      duration: 3450,
      timestamp: '8 min ago',
      spec: 'dashboard-with-page-objects.cy.js',
    },
    {
      id: '4',
      name: 'Marketplace Search',
      status: 'passed',
      duration: 1890,
      timestamp: '12 min ago',
      spec: 'marketplace-minimal.cy.js',
    },
  ]);

  const [errorPatterns] = useState<ErrorPattern[]>([
    {
      error: 'Element not found: [data-cy="campaign-submit-button"]',
      count: 8,
      lastOccurred: '15 min ago',
      files: ['campaigns-with-page-objects.cy.js', 'campaign-wizard.cy.js'],
    },
    {
      error: 'Timeout waiting for navigation to complete',
      count: 5,
      lastOccurred: '1 hour ago',
      files: ['dashboard-with-page-objects.cy.js'],
    },
    {
      error: 'AssertionError: expected "Loading..." to not exist',
      count: 3,
      lastOccurred: '2 hours ago',
      files: ['marketplace-minimal.cy.js', 'settings-comprehensive.cy.js'],
    },
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const refreshMetrics = () => {
    setIsLoading(true);
    // Simulate API refresh
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        lastUpdated: new Date().toLocaleString(),
      }));
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Loading Cypress analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Cypress Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive test monitoring, performance insights, and quality metrics
          </p>
        </div>
        <Button onClick={refreshMetrics} variant="outline" disabled={isLoading}>
          {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Overview - Top Priority */}
      <MetricsOverview metrics={metrics} />

      {/* Tabbed Analytics Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Test Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RecentExecutions executions={recentExecutions} />

          <Card className="border-divider">
            <CardHeader>
              <CardTitle className="text-lg">Test Status Summary</CardTitle>
              <CardDescription>Current state of all Cypress test files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">
                Last updated: {metrics.lastUpdated}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">✅ SSOT Compliant Files (12/12)</h4>
                  <div className="text-sm space-y-1 text-green-600">
                    <div>• auth-official-simple.cy.js</div>
                    <div>• campaigns-with-page-objects.cy.js</div>
                    <div>• dashboard-with-page-objects.cy.js</div>
                    <div>• marketplace-minimal.cy.js</div>
                    <div>• performance-monitoring.cy.js</div>
                    <div>• settings-comprehensive.cy.js</div>
                    <div>• admin-tools-comprehensive.cy.js</div>
                    <div>• brand-lift-comprehensive.cy.js</div>
                    <div>• marketplace-comprehensive.cy.js</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🎯 Performance Stats</h4>
                  <div className="text-sm space-y-1">
                    <div>• Total Test Files: 59</div>
                    <div>• Modern Auth Pattern: 100%</div>
                    <div>• Avg Test Duration: 2.3s</div>
                    <div>• Zero Deprecated Methods</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetrics />

          <Card className="border-divider">
            <CardHeader>
              <CardTitle className="text-lg">Performance Trends</CardTitle>
              <CardDescription>Test execution performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-divider rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="text-muted-foreground">Performance Chart Visualization</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Real-time test execution timing trends
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-6">
          <TestCoverage />

          <Card className="border-divider">
            <CardHeader>
              <CardTitle className="text-lg">Coverage by Feature</CardTitle>
              <CardDescription>Test coverage breakdown by application features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-divider rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="text-muted-foreground">Coverage Visualization</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Interactive coverage heatmap
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <ErrorAnalysis errors={errorPatterns} />

          <Card className="border-divider">
            <CardHeader>
              <CardTitle className="text-lg">Error Trend Analysis</CardTitle>
              <CardDescription>Historical error patterns and resolution tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-divider rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="text-muted-foreground">Error Trend Chart</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Error frequency and resolution patterns
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="border-divider">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common analytics and testing actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Export Test Report
            </Button>
            <Button variant="outline" size="sm">
              Run All Tests
            </Button>
            <Button variant="outline" size="sm">
              View Test Logs
            </Button>
            <Button variant="outline" size="sm">
              Coverage Report
            </Button>
            <Button variant="outline" size="sm">
              Performance Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

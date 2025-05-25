'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';

interface TestResult {
    id: string;
    name: string;
    status: 'passed' | 'failed' | 'running' | 'pending';
    duration: number;
    lastRun: string;
    module: string;
    coverage: number;
    flakiness: number;
}

interface TestSuite {
    name: string;
    totalTests: number;
    passed: number;
    failed: number;
    running: number;
    coverage: number;
    avgDuration: number;
    lastRun: string;
    status: 'healthy' | 'warning' | 'critical';
}

interface CypressMetrics {
    totalTests: number;
    totalSuites: number;
    overallCoverage: number;
    avgExecutionTime: number;
    successRate: number;
    flakiness: number;
    lastFullRun: string;
    dailyRuns: number;
    activeMonitoring: boolean;
}

export default function CypressMonitoringPanel() {
    const [metrics, setMetrics] = useState<CypressMetrics>({
        totalTests: 145,
        totalSuites: 21,
        overallCoverage: 85,
        avgExecutionTime: 90,
        successRate: 98.5,
        flakiness: 0.8,
        lastFullRun: '2025-01-25T10:30:00Z',
        dailyRuns: 24,
        activeMonitoring: true
    });

    const [testSuites, setTestSuites] = useState<TestSuite[]>([
        {
            name: 'Authentication',
            totalTests: 10,
            passed: 10,
            failed: 0,
            running: 0,
            coverage: 100,
            avgDuration: 15,
            lastRun: '2025-01-25T10:30:00Z',
            status: 'healthy'
        },
        {
            name: 'Dashboard',
            totalTests: 15,
            passed: 15,
            failed: 0,
            running: 0,
            coverage: 100,
            avgDuration: 22,
            lastRun: '2025-01-25T10:28:00Z',
            status: 'healthy'
        },
        {
            name: 'Campaigns',
            totalTests: 20,
            passed: 19,
            failed: 1,
            running: 0,
            coverage: 95,
            avgDuration: 35,
            lastRun: '2025-01-25T10:25:00Z',
            status: 'warning'
        },
        {
            name: 'Settings',
            totalTests: 35,
            passed: 35,
            failed: 0,
            running: 0,
            coverage: 100,
            avgDuration: 45,
            lastRun: '2025-01-25T10:20:00Z',
            status: 'healthy'
        },
        {
            name: 'Brand Lift',
            totalTests: 40,
            passed: 40,
            failed: 0,
            running: 0,
            coverage: 100,
            avgDuration: 55,
            lastRun: '2025-01-25T10:15:00Z',
            status: 'healthy'
        },
        {
            name: 'Admin Tools',
            totalTests: 25,
            passed: 25,
            failed: 0,
            running: 0,
            coverage: 100,
            avgDuration: 30,
            lastRun: '2025-01-25T10:10:00Z',
            status: 'healthy'
        },
        {
            name: 'Marketplace',
            totalTests: 0,
            passed: 0,
            failed: 0,
            running: 0,
            coverage: 0,
            avgDuration: 0,
            lastRun: 'Never',
            status: 'critical'
        }
    ]);

    const [isRunning, setIsRunning] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdate(new Date());

            // Simulate occasional test runs
            if (Math.random() < 0.1 && !isRunning) {
                setIsRunning(true);
                setTimeout(() => setIsRunning(false), 5000);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isRunning]);

    const handleRunTests = useCallback(() => {
        setIsRunning(true);
        // Simulate test execution
        setTimeout(() => {
            setIsRunning(false);
            setMetrics(prev => ({
                ...prev,
                lastFullRun: new Date().toISOString(),
                dailyRuns: prev.dailyRuns + 1
            }));
        }, 30000); // 30 second simulation
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <Icon iconId="faCircleCheckLight" className="h-4 w-4 text-green-500" />;
            case 'warning':
                return <Icon iconId="faCircleInfoLight" className="h-4 w-4 text-yellow-500" />;
            case 'critical':
                return <Icon iconId="faCircleXmarkLight" className="h-4 w-4 text-red-500" />;
            default:
                return <Icon iconId="faClockLight" className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        if (timestamp === 'Never') return 'Never';
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <div className="space-y-6" data-cy="cypress-monitoring-panel">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Cypress Test Monitoring</h2>
                    <p className="text-muted-foreground">
                        Real-time test status and coverage monitoring for application stability
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant={metrics.activeMonitoring ? 'default' : 'secondary'}>
                        {metrics.activeMonitoring ? 'Active Monitoring' : 'Monitoring Disabled'}
                    </Badge>
                    <Button
                        onClick={handleRunTests}
                        disabled={isRunning}
                        size="sm"
                        data-cy="run-tests-button"
                    >
                        {isRunning ? (
                            <>
                                <Icon iconId="faSquareLight" className="h-4 w-4 mr-2" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Icon iconId="faPlayLight" className="h-4 w-4 mr-2" />
                                Run Tests
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="sm" data-cy="refresh-button">
                        <Icon iconId="faClockRotateLeftLight" className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Status Alert */}
            {metrics.successRate < 95 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                    <Icon iconId="faCircleInfoLight" className="h-4 w-4" />
                    <AlertTitle>Test Quality Alert</AlertTitle>
                    <AlertDescription>
                        Success rate is below 95% ({metrics.successRate}%). Please review failing tests.
                    </AlertDescription>
                </Alert>
            )}

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card data-cy="metric-overall-coverage">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Coverage</CardTitle>
                        <Icon iconId="faBullseyeLight" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.overallCoverage}%</div>
                        <Progress value={metrics.overallCoverage} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {metrics.totalTests} tests across {metrics.totalSuites} modules
                        </p>
                    </CardContent>
                </Card>

                <Card data-cy="metric-success-rate">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Icon iconId="faArrowTrendUpLight" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{metrics.successRate}%</div>
                        <Progress value={metrics.successRate} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            Target: 98.5% | Flakiness: {metrics.flakiness}%
                        </p>
                    </CardContent>
                </Card>

                <Card data-cy="metric-execution-time">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Execution</CardTitle>
                        <Icon iconId="faClockLight" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.avgExecutionTime}s</div>
                        <Progress value={(180 - metrics.avgExecutionTime) / 180 * 100} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            Target: &lt;180s | Parallel: 4x
                        </p>
                    </CardContent>
                </Card>

                <Card data-cy="metric-daily-runs">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Runs</CardTitle>
                        <Icon iconId="faUsersLight" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.dailyRuns}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Last run: {formatTimeAgo(metrics.lastFullRun)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Test Status */}
            <Tabs defaultValue="suites" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="suites">Test Suites</TabsTrigger>
                    <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="history">Test History</TabsTrigger>
                </TabsList>

                <TabsContent value="suites" className="space-y-4">
                    <div className="grid gap-4">
                        {testSuites.map((suite) => (
                            <Card key={suite.name} data-cy={`suite-${suite.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(suite.status)}
                                            <CardTitle className="text-lg">{suite.name}</CardTitle>
                                            <Badge className={getStatusColor(suite.status)} variant="outline">
                                                {suite.status}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{suite.coverage}% Coverage</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatTimeAgo(suite.lastRun)}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{suite.passed}</p>
                                            <p className="text-xs text-muted-foreground">Passed</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-red-600">{suite.failed}</p>
                                            <p className="text-xs text-muted-foreground">Failed</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{suite.running}</p>
                                            <p className="text-xs text-muted-foreground">Running</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-600">{suite.avgDuration}s</p>
                                            <p className="text-xs text-muted-foreground">Avg Duration</p>
                                        </div>
                                    </div>
                                    {suite.coverage > 0 && (
                                        <Progress value={suite.coverage} className="mt-4" />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="coverage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Coverage Breakdown</CardTitle>
                            <CardDescription>
                                Detailed coverage analysis by application area
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { area: 'Authentication & Security', coverage: 100, critical: true },
                                    { area: 'Dashboard & Navigation', coverage: 100, critical: true },
                                    { area: 'Campaign Management', coverage: 95, critical: true },
                                    { area: 'Settings & Configuration', coverage: 100, critical: true },
                                    { area: 'Brand Lift Surveys', coverage: 100, critical: false },
                                    { area: 'Admin Tools & Debug', coverage: 100, critical: false },
                                    { area: 'Marketplace & Discovery', coverage: 0, critical: true },
                                    { area: 'Analytics & Reporting', coverage: 0, critical: true },
                                    { area: 'Asset Management', coverage: 30, critical: false },
                                    { area: 'Payment Processing', coverage: 60, critical: true }
                                ].map((item) => (
                                    <div key={item.area} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium">{item.area}</span>
                                            {item.critical && (
                                                <Badge variant="destructive" className="text-xs">Critical</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={item.coverage} className="w-32" />
                                            <span className="text-sm font-mono w-12">{item.coverage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Parallel Execution Efficiency</span>
                                        <span className="font-mono">4x speedup</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Test Flakiness Rate</span>
                                        <span className="font-mono text-green-600">{metrics.flakiness}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>CI/CD Integration</span>
                                        <Badge variant="default">Active</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Auto-healing Tests</span>
                                        <Badge variant="default">Enabled</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quality Gates</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Performance Budget</span>
                                        <Badge variant="default">Enforced</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>WCAG Compliance</span>
                                        <Badge variant="default">AA Standard</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Security Testing</span>
                                        <Badge variant="default">Active</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Visual Regression</span>
                                        <Badge variant="secondary">Planned</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Test Runs</CardTitle>
                            <CardDescription>
                                Last updated: {lastUpdate.toLocaleTimeString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[
                                    { time: '10:30', status: 'passed', duration: '1m 30s', tests: '145/145' },
                                    { time: '09:15', status: 'passed', duration: '1m 28s', tests: '145/145' },
                                    { time: '08:45', status: 'failed', duration: '45s', tests: '120/145' },
                                    { time: '07:30', status: 'passed', duration: '1m 32s', tests: '145/145' },
                                    { time: '06:15', status: 'passed', duration: '1m 29s', tests: '145/145' }
                                ].map((run, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                                        <div className="flex items-center space-x-3">
                                            {run.status === 'passed' ? (
                                                <Icon iconId="faCircleCheckLight" className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Icon iconId="faCircleXmarkLight" className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className="font-mono text-sm">{run.time}</span>
                                            <span className="text-sm">{run.tests} tests</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {run.duration}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
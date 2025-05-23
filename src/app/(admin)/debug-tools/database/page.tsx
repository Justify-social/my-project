'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Icon } from '@/components/ui/icon/icon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface DocFile {
  name: string;
  path: string;
  description: string;
  category: 'database' | 'linter' | 'api' | 'general';
  icon: React.ReactNode;
}

// Define a specific type for performance metrics
interface PerformanceMetrics {
  totalSlowQueries: number;
  criticalSlowQueries: number;
  verySlowQueries: number;
  slowQueries: number;
}

// Update DbHealthData to use the specific type
interface DbHealthData {
  status: string;
  database: {
    connected: boolean;
    responseTime: number;
    timestamp: string;
  };
  performance: PerformanceMetrics; // Use the defined interface
  errors: string[];
}

// Extended interfaces for enhanced monitoring
interface TransactionMetrics {
  total: number;
  succeeded: number;
  failed: number;
  avgDuration: number;
  byOperation: Record<
    string,
    {
      count: number;
      avgDuration: number;
    }
  >;
  recentTransactions: Array<{
    id: string;
    operation: string;
    model: string;
    duration: number;
    status: 'success' | 'error';
    timestamp: string;
  }>;
}

// Define timing details for transactions
interface TransactionTiming {
  durationMs: number;
  startTime?: number | string; // Allow for timestamp number or string
  endTime?: number | string;
}

// Define a type for the transaction test result
interface TransactionTestResult {
  success?: boolean; // Indicate success/failure
  message?: string; // Optional message
  data?: Record<string, unknown>; // Use a more specific type than any
  error?: string; // Error message if failed
  timing?: TransactionTiming; // Include timing details
}

interface SlowQueryDetail {
  operation: string;
  model: string;
  duration: number;
  timestamp: string;
  query?: string;
}

interface ExtendedDbHealthData extends DbHealthData {
  transactions?: TransactionMetrics;
  connectionPool?: {
    size: number;
    active: number;
    idle: number;
    waitingClients: number;
  };
  slowQueries?: SlowQueryDetail[];
  tableStats?: Array<{
    table: string;
    rowCount: number;
    sizeBytes: number;
    lastUpdated: string;
  }>;
}

export default function DatabaseHealthPage() {
  const { isLoaded: isAuthLoaded } = useAuth();

  const [dbHealth, setDbHealth] = useState<ExtendedDbHealthData | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [healthCheckError, setHealthCheckError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeDocTab, setActiveDocTab] = useState<string>('all');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [transactionTestResult, setTransactionTestResult] = useState<TransactionTestResult | null>(
    null
  );

  // Documentation files
  const docs: DocFile[] = [
    {
      name: 'schema.prisma',
      path: '/schema.prisma',
      description: 'Database schema and model definitions',
      category: 'database',
      icon: <Icon iconId="faServerLight" className="h-5 w-5 text-blue-600" />,
    },
    {
      name: 'Prisma Documentation',
      path: 'https://www.prisma.io/docs',
      description: 'Official Prisma ORM documentation',
      category: 'database',
      icon: <Icon iconId="faFileLight" className="h-5 w-5 text-blue-600" />,
    },
    {
      name: 'README.md',
      path: '/README.md',
      description: 'Project setup and overview',
      category: 'general',
      icon: <Icon iconId="faInfoLight" className="h-5 w-5 text-blue-600" />,
    },
    {
      name: 'eslint.config.mjs',
      path: '/eslint.config.mjs',
      description: 'ESLint configuration for code quality',
      category: 'linter',
      icon: <Icon iconId="faCodeLight" className="h-5 w-5 text-green-600" />,
    },
    {
      name: 'package.json',
      path: '/package.json',
      description: 'Project dependencies and scripts',
      category: 'general',
      icon: <Icon iconId="faFileLight" className="h-5 w-5 text-purple-600" />,
    },
    {
      name: 'next.config.js',
      path: '/next.config.js',
      description: 'Next.js framework configuration',
      category: 'general',
      icon: <Icon iconId="faCogLight" className="h-5 w-5 text-grey-600" />,
    },
    {
      name: 'Jest Configuration',
      path: '/jest.config.js',
      description: 'Testing framework setup',
      category: 'api',
      icon: <Icon iconId="faCheckLight" className="h-5 w-5 text-red-600" />,
    },
    {
      name: 'TypeScript Config',
      path: '/tsconfig.json',
      description: 'TypeScript compiler options',
      category: 'linter',
      icon: <Icon iconId="faFileLight" className="h-5 w-5 text-blue-500" />,
    },
    {
      name: 'Tailwind Config',
      path: '/tailwind.config.js',
      description: 'Tailwind CSS configuration',
      category: 'general',
      icon: <Icon iconId="faPaletteLight" className="h-5 w-5 text-teal-600" />,
    },
    {
      name: 'Prettier Config',
      path: '/.prettierrc.json',
      description: 'Code formatting rules',
      category: 'linter',
      icon: <Icon iconId="faPaintbrushLight" className="h-5 w-5 text-pink-600" />,
    },
    {
      name: 'Vercel Config',
      path: '/vercel.json',
      description: 'Deployment configuration',
      category: 'api',
      icon: <Icon iconId="faRocketLight" className="h-5 w-5 text-black" />,
    },
    {
      name: 'Environment Example',
      path: '/.env.example',
      description: 'Environment variables template',
      category: 'api',
      icon: <Icon iconId="faTriangleExclamationLight" className="h-5 w-5 text-yellow-600" />,
    },
  ];

  // Fetch database health information
  useEffect(() => {
    async function fetchDbHealth() {
      setIsLoadingHealth(true);
      setHealthCheckError(null);
      try {
        const response = await fetch('/api/health/db?extended=true');
        if (!response.ok) {
          throw new Error(`Failed to fetch database health: ${response.statusText}`);
        }
        const data = await response.json();
        setDbHealth(data);
      } catch (error) {
        setHealthCheckError(error instanceof Error ? error.message : String(error));
        console.error('Error fetching database health:', error);
      } finally {
        setIsLoadingHealth(false);
      }
    }

    fetchDbHealth();
  }, []);

  // Run database transaction test
  const runTransactionTest = async (testType: string) => {
    setIsRunningTest(true);
    setTransactionTestResult(null);
    try {
      const response = await fetch('/api/test/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: testType === 'batch' ? 'batch' : 'create',
          name: `Test Campaign ${Date.now()}`,
          testId: crypto.randomUUID(),
          isolation: testType === 'isolation' ? 'SERIALIZABLE' : undefined,
        }),
      });
      const data = await response.json();
      setTransactionTestResult(data);
    } catch (error) {
      setTransactionTestResult({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Clear slow queries
  const clearSlowQueries = async () => {
    try {
      await fetch('/api/health/db/clear-slow-queries', {
        method: 'POST',
      });
      // Refresh data
      const response = await fetch('/api/health/db?extended=true');
      const data = await response.json();
      setDbHealth(data);
    } catch (error) {
      console.error('Error clearing slow queries:', error);
    }
  };

  // Filter docs based on active tab
  const filteredDocs =
    activeDocTab === 'all' ? docs : docs.filter(doc => doc.category === activeDocTab);

  // Show loading state while Clerk is loading
  if (!isAuthLoaded) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Icon
              iconId="faCircleNotchLight"
              className="h-8 w-8 animate-spin text-blue-600 mx-auto"
            />
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database Health</h1>
          <p className="text-muted-foreground mt-1">
            System documentation and health monitoring for administrators
          </p>
        </div>
        <Link
          href="/debug-tools"
          className="mt-4 md:mt-0 flex items-center text-blue-600 hover:underline"
        >
          <Icon iconId="faChevronRightLight" className="h-4 w-4 mr-1 rotate-180" />
          Back to Debug Tools
        </Link>
      </div>

      {/* Database Health Section */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl">Database Health</CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="test">Test DB</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoadingHealth ? (
            <div className="flex items-center justify-center h-24">
              <LoadingSpinner />
              <p className="ml-2 text-muted-foreground">Checking database health...</p>
            </div>
          ) : healthCheckError ? (
            <div className="p-4 text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <h3 className="font-medium mb-2">Error Checking Database Health</h3>
              <p>{healthCheckError}</p>
            </div>
          ) : dbHealth ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card
                    className={cn(
                      dbHealth.status === 'healthy'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Overall Status</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex items-center">
                        <Badge
                          variant={dbHealth.status === 'healthy' ? 'default' : 'destructive'}
                          className="mr-2 capitalise"
                        >
                          {dbHealth.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Connected:</span>
                        <span>{dbHealth.database.connected ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{dbHealth.database.responseTime.toFixed(2)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Checked:</span>
                        <span>{new Date(dbHealth.database.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Query Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      {dbHealth.performance && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Slow Queries:</span>
                            <span>{dbHealth.performance.totalSlowQueries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Critical Slow Queries:</span>
                            <span
                              className={
                                dbHealth.performance.criticalSlowQueries > 0 ? 'text-red-600' : ''
                              }
                            >
                              {dbHealth.performance.criticalSlowQueries}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Very Slow Queries:</span>
                            <span
                              className={
                                dbHealth.performance.verySlowQueries > 0 ? 'text-orange-600' : ''
                              }
                            >
                              {dbHealth.performance.verySlowQueries}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Slow Queries:</span>
                            <span
                              className={
                                dbHealth.performance.slowQueries > 0 ? 'text-yellow-600' : ''
                              }
                            >
                              {dbHealth.performance.slowQueries}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="mt-4">
                        <Button
                          onClick={() =>
                            fetch('/api/health/db?extended=true')
                              .then(r => r.json())
                              .then(data => setDbHealth(data))
                          }
                          variant="default"
                          size="sm"
                        >
                          Refresh Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {dbHealth.connectionPool && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Connection Pool</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Pool Size:</span>
                          <span>{dbHealth.connectionPool.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Connections:</span>
                          <span>{dbHealth.connectionPool.active}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Idle Connections:</span>
                          <span>{dbHealth.connectionPool.idle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={
                              dbHealth.connectionPool.waitingClients > 0 ? 'text-orange-600' : ''
                            }
                          >
                            Waiting Clients:
                          </span>
                          <span
                            className={
                              dbHealth.connectionPool.waitingClients > 0 ? 'text-orange-600' : ''
                            }
                          >
                            {dbHealth.connectionPool.waitingClients}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {dbHealth.errors && dbHealth.errors.length > 0 && (
                    <Card className="bg-red-50 border-red-200 text-red-800">
                      <CardHeader>
                        <CardTitle className="text-lg">Errors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside text-sm">
                          {dbHealth.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-lg">Slow Queries</CardTitle>
                    <Button variant="outline" size="sm" onClick={clearSlowQueries}>
                      Clear Log
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {dbHealth.slowQueries && dbHealth.slowQueries.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Operation</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Timestamp</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dbHealth.slowQueries.map((query, index) => (
                            <TableRow key={index}>
                              <TableCell>{query.operation}</TableCell>
                              <TableCell>{query.model}</TableCell>
                              <TableCell
                                className={cn(
                                  query.duration > 1000
                                    ? 'text-red-600'
                                    : query.duration > 500
                                      ? 'text-orange-600'
                                      : 'text-yellow-600'
                                )}
                              >
                                {query.duration.toFixed(2)}ms
                              </TableCell>
                              <TableCell>{new Date(query.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-sm">No slow queries recorded.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                {dbHealth.transactions ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Transaction Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Total Transactions:</span>
                            <span>{dbHealth.transactions.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Succeeded:</span>
                            <span className="text-green-600">
                              {dbHealth.transactions.succeeded}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failed:</span>
                            <span
                              className={dbHealth.transactions.failed > 0 ? 'text-red-600' : ''}
                            >
                              {dbHealth.transactions.failed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Duration:</span>
                            <span>{dbHealth.transactions.avgDuration.toFixed(2)}ms</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg">By Operation Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(dbHealth.transactions.byOperation).map(
                              ([op, stats]) => (
                                <div key={op} className="bg-muted p-2 rounded">
                                  <div className="font-medium text-sm mb-1">{op}</div>
                                  <div className="text-xs">
                                    <div className="flex justify-between">
                                      <span>Count:</span>
                                      <span>{stats.count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Avg:</span>
                                      <span>{stats.avgDuration.toFixed(1)}ms</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dbHealth.transactions.recentTransactions.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Operation</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Timestamp</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dbHealth.transactions.recentTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                  <TableCell className="font-mono">
                                    {tx.id.substring(0, 8)}...
                                  </TableCell>
                                  <TableCell>{tx.operation}</TableCell>
                                  <TableCell>{tx.model}</TableCell>
                                  <TableCell>{tx.duration.toFixed(2)}ms</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={tx.status === 'success' ? 'default' : 'destructive'}
                                    >
                                      {tx.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            No recent transactions recorded.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
                    <h3 className="font-medium mb-2">Transaction Monitoring Not Available</h3>
                    <p className="text-sm">
                      Transaction monitoring data is not currently available. This may be because
                      the feature is not enabled or no transactions have been recorded yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tables" className="space-y-6">
                {dbHealth.tableStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Table Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Table</TableHead>
                            <TableHead>Rows</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Last Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dbHealth.tableStats.map((table, index) => (
                            <TableRow key={index}>
                              <TableCell>{table.table}</TableCell>
                              <TableCell>{table.rowCount.toLocaleString()}</TableCell>
                              <TableCell>{(table.sizeBytes / 1024).toFixed(2)} KB</TableCell>
                              <TableCell>{new Date(table.lastUpdated).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Run simple database operations to test connectivity and transaction handling.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Transaction Test</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tests a simple database transaction for creating a campaign with default
                        isolation level.
                      </p>
                      <Button
                        onClick={() => runTransactionTest('basic')}
                        disabled={isRunningTest}
                        className="w-full"
                        variant="default"
                      >
                        {isRunningTest ? 'Running...' : 'Run Test'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Serialisable Transaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tests a database transaction with SERIALIZABLE isolation level, the most
                        strict level.
                      </p>
                      <Button
                        onClick={() => runTransactionTest('isolation')}
                        disabled={isRunningTest}
                        className="w-full"
                        variant="secondary"
                      >
                        {isRunningTest ? 'Running...' : 'Run Test'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Batch Operations Test</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tests creating multiple related records in a single transaction.
                      </p>
                      <Button
                        onClick={() => runTransactionTest('batch')}
                        disabled={isRunningTest}
                        className="w-full"
                        variant="default"
                      >
                        {isRunningTest ? 'Running...' : 'Run Test'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {transactionTestResult && (
                  <Card
                    className={cn(
                      'mt-6',
                      transactionTestResult.error
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-green-50 border-green-200 text-green-800'
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {transactionTestResult.error ? (
                        <div>
                          <p className="font-medium">Error:</p>
                          <pre className="text-sm bg-red-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(transactionTestResult.error, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium">Transaction Details:</p>
                              <div className="text-sm mt-1">
                                <div className="flex justify-between mb-1">
                                  <span>Duration:</span>
                                  <span>
                                    {transactionTestResult.timing?.durationMs.toFixed(2)}ms
                                  </span>
                                </div>
                                <div className="flex justify-between mb-1">
                                  <span>Start Time:</span>
                                  <span>
                                    {transactionTestResult.timing?.startTime
                                      ? new Date(
                                          transactionTestResult.timing.startTime
                                        ).toLocaleTimeString()
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div className="flex justify-between mb-1">
                                  <span>End Time:</span>
                                  <span>
                                    {transactionTestResult.timing?.endTime
                                      ? new Date(
                                          transactionTestResult.timing.endTime
                                        ).toLocaleTimeString()
                                      : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">Created Record:</p>
                              <pre className="text-sm bg-green-100 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(transactionTestResult.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Could not load database health data.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">System Documentation</CardTitle>
          <CardDescription>Access relevant system and database documentation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDocTab} onValueChange={setActiveDocTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="linter">Linter Reports</TabsTrigger>
              <TabsTrigger value="api">API Documentation</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <TabsContent value={activeDocTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map(doc => (
                  <Link
                    key={doc.path}
                    href={doc.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colours"
                  >
                    <div className="flex items-start mb-2">
                      {doc.icon}
                      <h4 className="ml-2 font-medium text-foreground">{doc.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug mb-3">
                      {doc.description}
                    </p>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {doc.category === 'database'
                          ? 'Database'
                          : doc.category === 'linter'
                            ? 'Linter Report'
                            : doc.category === 'api'
                              ? 'API Docs'
                              : 'General'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Refresh Scripts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Linter Report Scripts</CardTitle>
          <CardDescription>
            Generate fresh linter reports for the application. These scripts will scan the codebase
            and update the corresponding report files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RunScriptButton
              scriptName="scripts/debug/database/find-hook-issues.js"
              label="Generate Hook Issues Report"
              description="Scan for React Hook dependency issues"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for running a script with loading state and feedback
function RunScriptButton({
  scriptName,
  label,
  description,
}: {
  scriptName: string;
  label: string;
  description: string;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    reportPath?: string;
  } | null>(null);

  const runScript = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const response = await fetch('/api/debug/run-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptName,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || 'Failed to run script',
        });
        return;
      }
      setResult({
        success: true,
        message: data.message,
        reportPath: data.reportPath,
      });

      // Reload the page after 2 seconds to show the updated report
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setResult({
        success: false,
        error: 'An error occurred while running the script',
      });
      console.error('Error running script:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg p-4">
      <div className="flex-grow">
        <h3 className="font-medium mb-1">{label}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      </div>

      {isRunning ? (
        <div className="flex items-center justify-center py-2">
          <Icon iconId="faCircleNotchLight" className="h-5 w-5 animate-spin text-blue-600" />
          <span className="ml-2 text-muted-foreground">Running...</span>
        </div>
      ) : result ? (
        <div
          className={cn(
            'py-2 px-3 rounded-md text-sm',
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          )}
        >
          {result.success ? (
            <>
              <p>✅ {result.message}</p>
              <p className="mt-1 text-xs">Reloading page...</p>
            </>
          ) : (
            <p>❌ {result.error}</p>
          )}
        </div>
      ) : (
        <Button onClick={runScript} className="mt-auto">
          Run Script
        </Button>
      )}
    </div>
  );
}

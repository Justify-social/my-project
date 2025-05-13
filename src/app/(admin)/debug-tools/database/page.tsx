'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Define expected structure for Clerk publicMetadata
interface PublicMetadata {
  role?: string;
}

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
  const { user, isLoaded } = useUser();
  const { isLoaded: isAuthLoaded, sessionClaims } = useAuth();
  const router = useRouter();
  const [dbHealth, setDbHealth] = useState<ExtendedDbHealthData | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [healthCheckError, setHealthCheckError] = useState<string | null>(null);
  const [transactionTestResult, setTransactionTestResult] = useState<TransactionTestResult | null>(
    null
  ); // Use defined type
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeDocTab, setActiveDocTab] = useState('all');

  // Documentation files available in the system
  const docs: DocFile[] = [
    {
      name: 'Database Schema',
      path: '/docs/DATABASE_SCHEMA.md',
      description: 'Comprehensive documentation of the database schema and entity relationships',
      category: 'database',
      icon: <Icon iconId="faServerLight" className="h-5 w-5 text-blue-600 font-body" />,
    },
    {
      name: 'Database Schema Audit',
      path: '/docs/schema-audit-summary.md',
      description: 'Database schema validation and audit results',
      category: 'database',
      icon: <Icon iconId="faChartBarLight" className="h-5 w-5 text-blue-600 font-body" />,
    },
    {
      name: 'Project Progress',
      path: '/docs/PROGRESS.md',
      description: 'Development progress and roadmap for the application',
      category: 'general',
      icon: <Icon iconId="faFileLight" className="h-5 w-5 text-green-600 font-body" />,
    },
    {
      name: 'User Flow',
      path: '/docs/User-Flow.md',
      description: 'User journey and application flow documentation',
      category: 'general',
      icon: <Icon iconId="faFileLight" className="h-5 w-5 text-green-600 font-body" />,
    },
    {
      name: 'Campaign Wizard Validation',
      path: '/docs/campaign-wizard-validation.md',
      description: 'Validation rules and requirements for the campaign wizard',
      category: 'general',
      icon: <Icon iconId="faFileLight" className="h-5 w-5 text-green-600 font-body" />,
    },
    {
      name: 'Cint API Documentation',
      path: '/docs/Cint_API_info.md',
      description: 'Integration documentation for the Cint API',
      category: 'api',
      icon: <Icon iconId="faFileLight" className="h-5 w-5 text-purple-600 font-body" />,
    },
    {
      name: 'Any Type Usage Report',
      path: '/docs/any-type-usage-report.md',
      description: 'ESLint report on any type usage in the codebase',
      category: 'linter',
      icon: <Icon iconId="faWarningLight" className="h-5 w-5 text-yellow-600 font-body" />,
    },
    {
      name: 'Image Tag Usage Report',
      path: '/docs/img-tag-usage-report.md',
      description: 'Report on <img> tag usage instead of Next.js Image component',
      category: 'linter',
      icon: <Icon iconId="faWarningLight" className="h-5 w-5 text-yellow-600 font-body" />,
    },
    {
      name: 'Hook Dependency Issues Report',
      path: '/docs/hook-dependency-issues-report.md',
      description: 'Report on React Hook dependency issues in the codebase',
      category: 'linter',
      icon: <Icon iconId="faWarningLight" className="h-5 w-5 text-yellow-600 font-body" />,
    },
    {
      name: 'API Documentation',
      path: '/docs/API.md',
      description: 'API endpoints, parameters, and example responses',
      category: 'api',
      icon: <Icon iconId="faFileLight" className="h-5 w-5 text-green-600 font-body" />,
    },
    {
      name: 'Data Models',
      path: '/docs/MODELS.md',
      description: 'Database models and their relationships',
      category: 'database',
      icon: <Icon iconId="faWarningLight" className="h-5 w-5 text-yellow-600 font-body" />,
    },
  ];

  // Check if user is admin using Clerk metadata
  const isAdmin = useMemo(() => {
    if (!isLoaded || !user) return false;
    const metadata = user.publicMetadata as PublicMetadata;
    const claimsRole = sessionClaims?.['metadata.role'];
    const userRole = metadata?.role || claimsRole;
    return userRole === 'ADMIN' || userRole === 'super_admin';
  }, [isLoaded, user, sessionClaims]);

  const isDevelopment = process.env.NODE_ENV === 'development';
  const canAccess = isAdmin || isDevelopment;

  // Redirect if not authorized after Clerk loads
  useEffect(() => {
    if (isLoaded && !canAccess) {
      console.warn('Redirecting non-admin user from Database Debug page');
      router.push('/debug-tools');
    }
  }, [isLoaded, canAccess, router]);

  // Fetch database health information - only if user can access
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
    if (isLoaded && canAccess) {
      fetchDbHealth();
    }
  }, [isLoaded, canAccess]);

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
  if (!isLoaded || !isAuthLoaded) {
    return (
      <div className="container mx-auto p-6 max-w-5xl font-body">
        <div className="flex items-center justify-center h-64 font-body">
          <div className="text-center font-body">
            <Icon
              iconId="faCircleNotchLight"
              className="h-8 w-8 animate-spin text-[var(--accent-color)]"
            />
            <p className="mt-2 text-[var(--secondary-color)] font-body">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show Access Denied message if user is loaded but not authorized
  if (!canAccess) {
    return (
      <div className="container mx-auto p-6 max-w-5xl font-body">
        <div className="flex items-center justify-center h-64 font-body">
          <div className="text-center font-body">
            <p className="text-[var(--error-color)] font-medium text-lg font-body">Access Denied</p>
            <p className="mt-2 text-[var(--secondary-color)] font-body">
              Admin access required for this page.
            </p>
            <Button asChild className="mt-4" variant="default">
              <Link href="/debug-tools">Return to Debug Tools</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 font-body">
        <div className="font-body">
          <h1 className="text-3xl font-bold text-[var(--primary-color)] font-heading">
            Database Health
          </h1>
          <p className="text-[var(--secondary-color)] mt-1 font-body">
            System documentation and health monitoring for administrators
          </p>
        </div>
        <Link
          href="/debug-tools"
          className="mt-4 md:mt-0 flex items-center text-[var(--accent-color)] hover:underline font-body"
        >
          <Icon iconId="faChevronRightLight" className="h-4 w-4 mr-1 rotate-180" />
          Back to Debug Tools
        </Link>
      </div>
      {/* Database Health Section */}
      <Card className="border-[var(--divider-color)] font-body">
        <CardHeader className="flex flex-row justify-between items-center font-body">
          <CardTitle className="text-xl text-[var(--primary-color)] font-heading">
            Database Health
          </CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto font-body">
            <TabsList className="font-body">
              <TabsTrigger value="overview" className="font-body">
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="font-body">
                Performance
              </TabsTrigger>
              <TabsTrigger value="transactions" className="font-body">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="tables" className="font-body">
                Tables
              </TabsTrigger>
              <TabsTrigger value="test" className="font-body">
                Test DB
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="mt-4 font-body">
          {isLoadingHealth ? (
            <div className="flex items-center justify-center h-24 font-body">
              <LoadingSpinner />
              <p className="ml-2 text-[var(--secondary-color)] font-body">
                Checking database health...
              </p>
            </div>
          ) : healthCheckError ? (
            <div className="p-4 text-[var(--error-color)] bg-[var(--error-light-color)] border border-[var(--error-divider-color)] rounded-md font-body">
              <h3 className="font-medium mb-2 font-heading">Error Checking Database Health</h3>
              <p className="font-body">{healthCheckError}</p>
            </div>
          ) : dbHealth ? (
            <div className="space-y-6 font-body">
              {/* Overview Content */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-body">
                  <Card
                    className={cn(
                      'border',
                      dbHealth.status === 'healthy'
                        ? 'bg-[var(--success-light-color)] border-[var(--success-divider-color)] text-[var(--success-color)]'
                        : 'bg-[var(--error-light-color)] border-[var(--error-divider-color)] text-[var(--error-color)]',
                      'font-body'
                    )}
                  >
                    <CardHeader className="font-body">
                      <CardTitle className="text-lg font-heading">Overall Status</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 font-body">
                      <div className="flex items-center font-body">
                        <Badge
                          variant={dbHealth.status === 'healthy' ? 'default' : 'destructive'}
                          className="mr-2 capitalize font-body"
                        >
                          {dbHealth.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between font-body">
                        <span className="font-body">Connected:</span>
                        <span className="font-body">
                          {dbHealth.database.connected ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span className="font-body">Response Time:</span>
                        <span className="font-body">
                          {dbHealth.database.responseTime.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span className="font-body">Last Checked:</span>
                        <span className="font-body">
                          {new Date(dbHealth.database.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-[var(--divider-color)] bg-[var(--background-color)] font-body">
                    <CardHeader className="font-body">
                      <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                        Query Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 font-body">
                      {dbHealth.performance && (
                        <div className="space-y-1 font-body">
                          <div className="flex justify-between font-body">
                            <span className="font-body">Total Slow Queries:</span>
                            <span className="font-body">
                              {dbHealth.performance.totalSlowQueries}
                            </span>
                          </div>
                          <div className="flex justify-between font-body">
                            <span className="font-body">Critical Slow Queries:</span>
                            <span
                              className={
                                dbHealth.performance.criticalSlowQueries > 0
                                  ? 'text-[var(--error-color)]'
                                  : ''
                              }
                            >
                              {dbHealth.performance.criticalSlowQueries}
                            </span>
                          </div>
                          <div className="flex justify-between font-body">
                            <span className="font-body">Very Slow Queries:</span>
                            <span
                              className={
                                dbHealth.performance.verySlowQueries > 0
                                  ? 'text-[var(--warning-color)]'
                                  : ''
                              }
                            >
                              {dbHealth.performance.verySlowQueries}
                            </span>
                          </div>
                          <div className="flex justify-between font-body">
                            <span className="font-body">Slow Queries:</span>
                            <span
                              className={
                                dbHealth.performance.slowQueries > 0
                                  ? 'text-[var(--caution-color)]'
                                  : ''
                              }
                            >
                              {dbHealth.performance.slowQueries}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="mt-4 font-body">
                        <Button
                          onClick={() =>
                            fetch('/api/health/db?extended=true')
                              .then(r => r.json())
                              .then(data => setDbHealth(data))
                          }
                          variant="default"
                          size="sm"
                          className="px-3 py-1 bg-[var(--accent-color)] text-[var(--background-color)] hover:bg-[var(--accent-hover-color)] transition-opacity font-body"
                        >
                          Refresh Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  {dbHealth.connectionPool && (
                    <Card className="border-[var(--divider-color)] bg-[var(--background-color)] font-body">
                      <CardHeader className="font-body">
                        <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                          Connection Pool
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1 font-body">
                        <div className="flex justify-between font-body">
                          <span className="font-body">Pool Size:</span>
                          <span className="font-body">{dbHealth.connectionPool.size}</span>
                        </div>
                        <div className="flex justify-between font-body">
                          <span className="font-body">Active Connections:</span>
                          <span className="font-body">{dbHealth.connectionPool.active}</span>
                        </div>
                        <div className="flex justify-between font-body">
                          <span className="font-body">Idle Connections:</span>
                          <span className="font-body">{dbHealth.connectionPool.idle}</span>
                        </div>
                        <div className="flex justify-between font-body">
                          <span
                            className={
                              dbHealth.connectionPool.waitingClients > 0
                                ? 'text-[var(--warning-color)]'
                                : ''
                            }
                          >
                            Waiting Clients:
                          </span>
                          <span
                            className={
                              dbHealth.connectionPool.waitingClients > 0
                                ? 'text-[var(--warning-color)]'
                                : ''
                            }
                          >
                            {dbHealth.connectionPool.waitingClients}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {dbHealth.errors && dbHealth.errors.length > 0 && (
                    <Card className="border-[var(--error-divider-color)] bg-[var(--error-light-color)] text-[var(--error-color)] font-body">
                      <CardHeader className="font-body">
                        <CardTitle className="text-lg text-[var(--error-dark-color)] font-heading">
                          Errors
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="font-body">
                        <ul className="list-disc list-inside text-sm font-body">
                          {dbHealth.errors.map((error, index) => (
                            <li key={index} className="font-body">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              {/* Performance Content */}
              {activeTab === 'performance' && (
                <div className="space-y-6 font-body">
                  <Card className="border-[var(--divider-color)] bg-[var(--background-color)] font-body">
                    <CardHeader className="flex flex-row justify-between items-center font-body">
                      <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                        Slow Queries
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSlowQueries}
                        className="px-3 py-1 bg-[var(--accent-color)] text-[var(--background-color)] hover:bg-[var(--accent-hover-color)] transition-opacity font-body"
                      >
                        Clear Log
                      </Button>
                    </CardHeader>
                    <CardContent className="font-body">
                      {dbHealth.slowQueries && dbHealth.slowQueries.length > 0 ? (
                        <Table className="font-body">
                          <TableHeader className="font-body">
                            <TableRow className="font-body">
                              <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                Operation
                              </TableHead>
                              <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                Model
                              </TableHead>
                              <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                Duration
                              </TableHead>
                              <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                Timestamp
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="font-body">
                            {dbHealth.slowQueries.map((query, index) => (
                              <TableRow
                                key={index}
                                className={
                                  index % 2 === 0
                                    ? 'bg-[var(--background-color)]'
                                    : 'bg-[var(--background-light-color)]'
                                }
                              >
                                <TableCell className="px-3 py-2 text-sm font-body">
                                  {query.operation}
                                </TableCell>
                                <TableCell className="px-3 py-2 text-sm font-body">
                                  {query.model}
                                </TableCell>
                                <TableCell
                                  className={`px-3 py-2 text-sm ${query.duration > 1000 ? 'text-[var(--error-color)]' : query.duration > 500 ? 'text-[var(--warning-color)]' : 'text-[var(--caution-color)]'} font-body`}
                                >
                                  {query.duration.toFixed(2)}ms
                                </TableCell>
                                <TableCell className="px-3 py-2 text-sm font-body">
                                  {new Date(query.timestamp).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-[var(--secondary-color)] text-sm font-body">
                          No slow queries recorded.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* Transactions Content */}
              {activeTab === 'transactions' && (
                <div className="space-y-6 font-body">
                  {dbHealth.transactions ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
                        <Card className="border-[var(--divider-color)] bg-[var(--background-color)] font-body">
                          <CardHeader className="font-body">
                            <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                              Transaction Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1 font-body">
                            <div className="flex justify-between font-body">
                              <span className="font-body">Total Transactions:</span>
                              <span className="font-body">{dbHealth.transactions.total}</span>
                            </div>
                            <div className="flex justify-between font-body">
                              <span className="font-body">Succeeded:</span>
                              <span className="text-[var(--success-color)] font-body">
                                {dbHealth.transactions.succeeded}
                              </span>
                            </div>
                            <div className="flex justify-between font-body">
                              <span className="font-body">Failed:</span>
                              <span
                                className={
                                  dbHealth.transactions.failed > 0
                                    ? 'text-[var(--error-color)]'
                                    : ''
                                }
                              >
                                {dbHealth.transactions.failed}
                              </span>
                            </div>
                            <div className="flex justify-between font-body">
                              <span className="font-body">Avg Duration:</span>
                              <span className="font-body">
                                {dbHealth.transactions.avgDuration.toFixed(2)}ms
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="md:col-span-2 border-[var(--divider-color)] bg-[var(--background-color)] font-body">
                          <CardHeader className="font-body">
                            <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                              By Operation Type
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="font-body">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-body">
                              {Object.entries(dbHealth.transactions.byOperation).map(
                                ([op, stats]) => (
                                  <div
                                    key={op}
                                    className="bg-[var(--background-light-color)] p-2 rounded font-body"
                                  >
                                    <div className="font-medium text-sm mb-1 font-body">{op}</div>
                                    <div className="text-xs font-body">
                                      <div className="flex justify-between font-body">
                                        <span className="font-body">Count:</span>
                                        <span className="font-body">{stats.count}</span>
                                      </div>
                                      <div className="flex justify-between font-body">
                                        <span className="font-body">Avg:</span>
                                        <span className="font-body">
                                          {stats.avgDuration.toFixed(1)}ms
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <Card className="border-[var(--divider-color)] bg-[var(--background-color)] font-body">
                        <CardHeader className="font-body">
                          <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                            Recent Transactions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="font-body">
                          {dbHealth.transactions.recentTransactions.length > 0 ? (
                            <Table className="font-body">
                              <TableHeader className="font-body">
                                <TableRow className="font-body">
                                  <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                    ID
                                  </TableHead>
                                  <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                    Operation
                                  </TableHead>
                                  <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                    Model
                                  </TableHead>
                                  <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                    Duration
                                  </TableHead>
                                  <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                    Status
                                  </TableHead>
                                  <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                    Timestamp
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody className="font-body">
                                {dbHealth.transactions.recentTransactions.map((tx, index) => (
                                  <TableRow
                                    key={tx.id}
                                    className={
                                      index % 2 === 0
                                        ? 'bg-[var(--background-color)]'
                                        : 'bg-[var(--background-light-color)]'
                                    }
                                  >
                                    <TableCell className="px-3 py-2 text-sm font-mono font-body">
                                      {tx.id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-sm font-body">
                                      {tx.operation}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-sm font-body">
                                      {tx.model}
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-sm font-body">
                                      {tx.duration.toFixed(2)}ms
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-sm font-body">
                                      <Badge
                                        variant={
                                          tx.status === 'success' ? 'default' : 'destructive'
                                        }
                                      >
                                        {tx.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="px-3 py-2 text-sm font-body">
                                      {new Date(tx.timestamp).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <p className="text-[var(--secondary-color)] text-sm font-body">
                              No recent transactions recorded.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="bg-[var(--warning-light-color)] border border-[var(--warning-divider-color)] text-[var(--warning-color)] p-4 rounded font-body">
                      <h3 className="font-medium mb-2 font-heading">
                        Transaction Monitoring Not Available
                      </h3>
                      <p className="text-sm font-body">
                        Transaction monitoring data is not currently available. This may be because
                        the feature is not enabled or no transactions have been recorded yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {/* Table Stats Content */}
              {activeTab === 'tables' && dbHealth.tableStats && (
                <Card className="border-[var(--divider-color)] bg-[var(--background-color)] font-body">
                  <CardHeader className="font-body">
                    <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                      Table Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-body">
                    <Table className="font-body">
                      <TableHeader className="font-body">
                        <TableRow className="font-body">
                          <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                            Table
                          </TableHead>
                          <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                            Rows
                          </TableHead>
                          <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                            Size
                          </TableHead>
                          <TableHead className="px-3 py-2 text-xs text-[var(--secondary-color)] uppercase tracking-wider font-body">
                            Last Updated
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-body">
                        {dbHealth.tableStats.map((table, index) => (
                          <TableRow
                            key={index}
                            className={
                              index % 2 === 0
                                ? 'bg-[var(--background-color)]'
                                : 'bg-[var(--background-light-color)]'
                            }
                          >
                            <TableCell className="px-3 py-2 text-sm font-body">
                              {table.table}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm font-body">
                              {table.rowCount.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm font-body">
                              {(table.sizeBytes / 1024).toFixed(2)} KB
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm font-body">
                              {new Date(table.lastUpdated).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              {/* Test DB Content */}
              {activeTab === 'test' && (
                <div className="space-y-4 font-body">
                  <p className="text-sm text-[var(--secondary-color)] font-body">
                    Run simple database operations to test connectivity and transaction handling.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
                    <Card className="border-[var(--divider-color)] bg-[var(--background-color)] hover:shadow-md transition-shadow font-body">
                      <CardHeader className="font-body">
                        <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                          Basic Transaction Test
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="font-body">
                        <p className="text-sm text-[var(--secondary-color)] mb-4 font-body">
                          Tests a simple database transaction for creating a campaign with default
                          isolation level.
                        </p>
                        <Button
                          onClick={() => runTransactionTest('basic')}
                          disabled={isRunningTest}
                          className="w-full disabled:opacity-50 font-body"
                          variant="default"
                        >
                          {isRunningTest ? 'Running...' : 'Run Test'}
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="border-[var(--divider-color)] bg-[var(--background-color)] hover:shadow-md transition-shadow font-body">
                      <CardHeader className="font-body">
                        <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                          Serializable Transaction
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="font-body">
                        <p className="text-sm text-[var(--secondary-color)] mb-4 font-body">
                          Tests a database transaction with SERIALIZABLE isolation level, the most
                          strict level.
                        </p>
                        <Button
                          onClick={() => runTransactionTest('isolation')}
                          disabled={isRunningTest}
                          className="w-full disabled:opacity-50 font-body"
                          variant="secondary"
                        >
                          {isRunningTest ? 'Running...' : 'Run Test'}
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="border-[var(--divider-color)] bg-[var(--background-color)] hover:shadow-md transition-shadow font-body">
                      <CardHeader className="font-body">
                        <CardTitle className="text-lg text-[var(--primary-color)] font-heading">
                          Batch Operations Test
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="font-body">
                        <p className="text-sm text-[var(--secondary-color)] mb-4 font-body">
                          Tests creating multiple related records in a single transaction.
                        </p>
                        <Button
                          onClick={() => runTransactionTest('batch')}
                          disabled={isRunningTest}
                          className="w-full disabled:opacity-50 font-body"
                          variant="default"
                        >
                          {isRunningTest ? 'Running...' : 'Run Test'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  {transactionTestResult && (
                    <Card
                      className={`mt-6 border ${transactionTestResult.error ? 'bg-[var(--error-light-color)] border-[var(--error-divider-color)] text-[var(--error-color)]' : 'bg-[var(--success-light-color)] border-[var(--success-divider-color)] text-[var(--success-color)]'} font-body`}
                    >
                      <CardHeader className="font-body">
                        <CardTitle className="text-lg font-heading">Test Results</CardTitle>
                      </CardHeader>
                      <CardContent className="font-body">
                        {transactionTestResult.error ? (
                          <div className="font-body">
                            <p className="font-medium font-body">Error:</p>
                            <pre className="text-sm bg-[var(--error-light-color)] p-2 rounded mt-1 overflow-x-auto font-body">
                              {JSON.stringify(transactionTestResult.error, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="font-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body">
                              <div className="font-body">
                                <p className="font-medium font-body">Transaction Details:</p>
                                <div className="text-sm mt-1 font-body">
                                  <div className="flex justify-between mb-1 font-body">
                                    <span className="font-body">Duration:</span>
                                    <span className="font-body">
                                      {transactionTestResult.timing?.durationMs.toFixed(2)}ms
                                    </span>
                                  </div>
                                  <div className="flex justify-between mb-1 font-body">
                                    <span className="font-body">Start Time:</span>
                                    <span className="font-body">
                                      {transactionTestResult.timing?.startTime
                                        ? new Date(
                                            transactionTestResult.timing.startTime
                                          ).toLocaleTimeString()
                                        : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between mb-1 font-body">
                                    <span className="font-body">End Time:</span>
                                    <span className="font-body">
                                      {transactionTestResult.timing?.endTime
                                        ? new Date(
                                            transactionTestResult.timing.endTime
                                          ).toLocaleTimeString()
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="font-body">
                                <p className="font-medium font-body">Created Record:</p>
                                <pre className="text-sm bg-[var(--success-light-color)] p-2 rounded mt-1 overflow-x-auto font-body">
                                  {JSON.stringify(transactionTestResult.data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-[var(--secondary-color)] py-8 font-body">
              Could not load database health data.
            </p>
          )}
        </CardContent>
      </Card>
      {/* Documentation Filter Tabs */}
      <Card className="border-[var(--divider-color)] font-body">
        <CardHeader className="font-body">
          <CardTitle className="text-xl text-[var(--primary-color)] font-heading">
            System Documentation
          </CardTitle>
          <CardDescription className="font-body">
            Access relevant system and database documentation.
          </CardDescription>
          <Tabs
            value={activeDocTab}
            onValueChange={setActiveDocTab}
            className="w-full mt-4 font-body"
          >
            <TabsList className="font-body">
              <TabsTrigger value="all" className="font-body">
                All Documents
              </TabsTrigger>
              <TabsTrigger value="database" className="font-body">
                Database
              </TabsTrigger>
              <TabsTrigger value="linter" className="font-body">
                Linter Reports
              </TabsTrigger>
              <TabsTrigger value="api" className="font-body">
                API Documentation
              </TabsTrigger>
              <TabsTrigger value="general" className="font-body">
                General
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="font-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-body">
            {filteredDocs.map(doc => (
              <Link
                key={doc.path}
                href={doc.path}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-[var(--divider-color)] rounded-md hover:bg-[var(--background-light-color)] transition-colors font-body"
              >
                <div className="flex items-start mb-2 font-body">
                  {doc.icon}
                  <h4 className="ml-2 font-medium text-[var(--primary-color)] font-heading">
                    {doc.name}
                  </h4>
                </div>
                <p className="text-xs text-[var(--secondary-color)] leading-snug font-body">
                  {doc.description}
                </p>
                <div className="mt-4 text-right font-body">
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
        </CardContent>
      </Card>
      {/* Refresh Scripts Section */}
      <Card className="border-[var(--divider-color)] font-body">
        <CardHeader className="font-body">
          <CardTitle className="text-xl text-[var(--primary-color)] font-heading">
            Linter Report Scripts
          </CardTitle>
          <CardDescription className="font-body">
            Generate fresh linter reports for the application. These scripts will scan the codebase
            and update the corresponding report files.
          </CardDescription>
        </CardHeader>
        <CardContent className="font-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
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
    <div className="flex flex-col h-full bg-[var(--background-color)] border border-[var(--divider-color)] rounded-md p-4 font-body">
      <div className="flex-grow font-body">
        <h3 className="font-medium text-[var(--primary-color)] mb-1 font-heading">{label}</h3>
        <p className="text-sm text-[var(--secondary-color)] mb-4 font-body">{description}</p>
      </div>

      {isRunning ? (
        <div className="flex items-center justify-center py-2 font-body">
          <Icon
            iconId="faCircleNotchLight"
            className="h-5 w-5 animate-spin text-[var(--accent-color)]"
          />
          <span className="ml-2 text-[var(--secondary-color)] font-body">Running...</span>
        </div>
      ) : result ? (
        <div
          className={`py-2 px-3 rounded-md text-sm ${result.success ? 'bg-[var(--success-light-color)] text-[var(--success-color)]' : 'bg-[var(--error-light-color)] text-[var(--error-color)]'} font-body`}
        >
          {result.success ? (
            <>
              <p className="font-body">✅ {result.message}</p>
              <p className="mt-1 text-xs font-body">Reloading page...</p>
            </>
          ) : (
            <p className="font-body">❌ {result.error}</p>
          )}
        </div>
      ) : (
        <Button
          onClick={runScript}
          className="mt-auto px-4 py-2 bg-[var(--accent-color)] text-[var(--background-color)] rounded hover:bg-[var(--accent-hover-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover-color)] focus:ring-offset-2 font-body"
        >
          Run Script
        </Button>
      )}
    </div>
  );
}

// Updated import paths via tree-shake script - 2025-04-01T17:13:32.200Z
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Icon } from '@/components/ui/icon';
interface DocFile {
  name: string;
  path: string;
  description: string;
  category: 'database' | 'linter' | 'api' | 'general';
  icon: React.ReactNode;
}
interface DbHealthData {
  status: string;
  database: {
    connected: boolean;
    responseTime: number;
    timestamp: string;
  };
  performance: any;
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
export default function DatabasePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [dbHealth, setDbHealth] = useState<ExtendedDbHealthData | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeSection, setActiveSection] = useState('overview');
  const [healthCheckError, setHealthCheckError] = useState<string | null>(null);
  const [transactionTestResult, setTransactionTestResult] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

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

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && user) {
      // Get user roles from Auth0 user metadata
      const userRoles = (user['https://justify.social/roles'] || ['USER']) as string[];

      // Check if user has admin role
      const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');

      // In development, allow access for all users for testing purposes
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (!isAdmin && !isDevelopment) {
        router.push('/debug-tools');
      }
    }
  }, [user, isLoading, router]);

  // Fetch database health information - enhanced
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
  const filteredDocs = activeTab === 'all' ? docs : docs.filter(doc => doc.category === activeTab);

  // If loading or not an admin, show loading state
  if (isLoading || !user) {
    return (
      <div className="container mx-auto p-6 max-w-5xl font-body">
        <div className="flex items-center justify-center h-64 font-body">
          <div className="text-center font-body">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent-color)] font-body"></div>
            <p className="mt-2 text-[var(--secondary-color)] font-body">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get user roles from Auth0 user metadata
  const userRoles = (user['https://justify.social/roles'] || ['USER']) as string[];

  // Check if user has admin role
  const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isAdmin && !isDevelopment) {
    return (
      <div className="container mx-auto p-6 max-w-5xl font-body">
        <div className="flex items-center justify-center h-64 font-body">
          <div className="text-center font-body">
            <p className="text-red-600 font-medium text-lg font-body">Access Denied</p>
            <p className="mt-2 text-[var(--secondary-color)] font-body">
              You don't have permission to view this page.
            </p>
            <Link
              href="/debug-tools"
              className="mt-4 inline-block px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:opacity-90 font-body"
            >
              Return to Debug Tools
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6 max-w-5xl font-body">
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
          {<Icon iconId="faChevronRightLight" className="h-4 w-4 mr-1 rotate-180" />}
          Back to Debug Tools
        </Link>
      </div>

      {/* Database Health Section */}
      <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm mb-8 font-body">
        <div className="flex flex-wrap items-center justify-between mb-4 font-body">
          <h2 className="text-xl font-semibold text-[var(--primary-color)] font-heading">
            Database Health
          </h2>

          <div className="flex mt-2 md:mt-0 font-body">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-3 py-1.5 mr-2 text-sm rounded ${activeSection === 'overview' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 text-[var(--secondary-color)]'} font-body`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('performance')}
              className={`px-3 py-1.5 mr-2 text-sm rounded ${activeSection === 'performance' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 text-[var(--secondary-color)]'} font-body`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveSection('transactions')}
              className={`px-3 py-1.5 mr-2 text-sm rounded ${activeSection === 'transactions' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 text-[var(--secondary-color)]'} font-body`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveSection('test')}
              className={`px-3 py-1.5 text-sm rounded ${activeSection === 'test' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 text-[var(--secondary-color)]'} font-body`}
            >
              Test DB
            </button>
          </div>
        </div>

        {isLoadingHealth ? (
          <div className="flex items-center justify-center h-24 font-body">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--accent-color)] font-body"></div>
            <p className="ml-2 text-[var(--secondary-color)] font-body">
              Checking database health...
            </p>
          </div>
        ) : healthCheckError ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md font-body">
            <h3 className="font-medium mb-2 font-heading">Error Checking Database Health</h3>
            <p className="font-body">{healthCheckError}</p>
          </div>
        ) : dbHealth ? (
          <>
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-body">
                {/* Status Card */}
                <div
                  className={`rounded-lg p-4 border ${dbHealth.status === 'healthy' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} font-body`}
                >
                  <h3 className="font-medium text-lg mb-2 font-heading">Overall Status</h3>
                  <div className="flex items-center font-body">
                    <div
                      className={`h-3 w-3 rounded-full mr-2 ${dbHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'} font-body`}
                    ></div>
                    <span className="capitalize font-body">{dbHealth.status}</span>
                  </div>

                  <div className="mt-4 text-sm font-body">
                    <div className="flex justify-between mb-1 font-body">
                      <span className="font-body">Connected:</span>
                      <span className="font-body">
                        {dbHealth.database.connected ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1 font-body">
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
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="rounded-lg p-4 bg-[var(--background-color)] border border-[var(--divider-color)] font-body">
                  <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-heading">
                    Query Performance
                  </h3>

                  {dbHealth.performance && (
                    <div className="text-sm font-body">
                      <div className="flex justify-between mb-1 font-body">
                        <span className="font-body">Total Slow Queries:</span>
                        <span className="font-body">
                          {dbHealth.performance.totalSlowQueries}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1 font-body">
                        <span className="font-body">Critical Slow Queries:</span>
                        <span
                          className={`${dbHealth.performance.criticalSlowQueries > 0 ? 'text-red-600' : ''} font-body`}
                        >
                          {dbHealth.performance.criticalSlowQueries}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1 font-body">
                        <span className="font-body">Very Slow Queries:</span>
                        <span
                          className={`${dbHealth.performance.verySlowQueries > 0 ? 'text-amber-600' : ''} font-body`}
                        >
                          {dbHealth.performance.verySlowQueries}
                        </span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span className="font-body">Slow Queries:</span>
                        <span
                          className={`${dbHealth.performance.slowQueries > 0 ? 'text-yellow-600' : ''} font-body`}
                        >
                          {dbHealth.performance.slowQueries}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 font-body">
                    <button
                      onClick={() =>
                        fetch('/api/health/db?extended=true')
                          .then(r => r.json())
                          .then(data => setDbHealth(data))
                      }
                      className="px-3 py-1 bg-[var(--accent-color)] text-white text-sm rounded hover:opacity-90 transition-opacity font-body"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>

                {/* Connection Pool */}
                {dbHealth.connectionPool && (
                  <div className="rounded-lg p-4 bg-[var(--background-color)] border border-[var(--divider-color)] font-body">
                    <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-heading">
                      Connection Pool
                    </h3>

                    <div className="text-sm font-body">
                      <div className="flex justify-between mb-1 font-body">
                        <span className="font-body">Pool Size:</span>
                        <span className="font-body">{dbHealth.connectionPool.size}</span>
                      </div>
                      <div className="flex justify-between mb-1 font-body">
                        <span className="font-body">Active Connections:</span>
                        <span className="font-body">{dbHealth.connectionPool.active}</span>
                      </div>
                      <div className="flex justify-between mb-1 font-body">
                        <span className="font-body">Idle Connections:</span>
                        <span className="font-body">{dbHealth.connectionPool.idle}</span>
                      </div>
                      <div className="flex justify-between font-body">
                        <span className="font-body">Waiting Clients:</span>
                        <span
                          className={`${dbHealth.connectionPool.waitingClients > 0 ? 'text-amber-600' : ''} font-body`}
                        >
                          {dbHealth.connectionPool.waitingClients}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {dbHealth.errors && dbHealth.errors.length > 0 && (
                  <div className="rounded-lg p-4 bg-red-50 border border-red-200 font-body">
                    <h3 className="font-medium text-lg mb-2 text-red-700 font-heading">Errors</h3>
                    <ul className="text-sm text-red-600 font-body">
                      {dbHealth.errors.map((error, index) => (
                        <li key={index} className="mb-1 font-body">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Performance Details Section */}
            {activeSection === 'performance' && (
              <div className="space-y-6 font-body">
                {/* Slow Queries */}
                <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 font-body">
                  <div className="flex justify-between items-center mb-4 font-body">
                    <h3 className="font-medium text-lg text-[var(--primary-color)] font-heading">
                      Slow Queries
                    </h3>
                    <button
                      onClick={clearSlowQueries}
                      className="px-3 py-1 bg-[var(--accent-color)] text-white text-sm rounded hover:opacity-90 transition-opacity font-body"
                    >
                      Clear Log
                    </button>
                  </div>

                  {dbHealth.slowQueries && dbHealth.slowQueries.length > 0 ? (
                    <div className="overflow-x-auto font-body">
                      <table className="min-w-full divide-y divide-[var(--divider-color)]">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                              Operation
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                              Model
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                              Duration
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                              Timestamp
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider-color)]">
                          {dbHealth.slowQueries.map((query, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? 'bg-[var(--background-color)]'
                                  : 'bg-[var(--background-light-color)]'
                              }
                            >
                              <td className="px-3 py-2 text-sm font-body">
                                {query.operation}
                              </td>
                              <td className="px-3 py-2 text-sm font-body">{query.model}</td>
                              <td
                                className={`px-3 py-2 text-sm ${query.duration > 1000 ? 'text-red-600' : query.duration > 500 ? 'text-amber-600' : 'text-yellow-600'} font-body`}
                              >
                                {query.duration.toFixed(2)}ms
                              </td>
                              <td className="px-3 py-2 text-sm font-body">
                                {new Date(query.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-[var(--secondary-color)] text-sm font-body">
                      No slow queries recorded.
                    </p>
                  )}
                </div>

                {/* Table Statistics */}
                {dbHealth.tableStats && (
                  <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 font-body">
                    <h3 className="font-medium text-lg mb-4 text-[var(--primary-color)] font-heading">
                      Table Statistics
                    </h3>

                    <div className="overflow-x-auto font-body">
                      <table className="min-w-full divide-y divide-[var(--divider-color)]">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                              Table
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                              Rows
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                              Size
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                              Last Updated
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider-color)]">
                          {dbHealth.tableStats.map((table, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? 'bg-[var(--background-color)]'
                                  : 'bg-[var(--background-light-color)]'
                              }
                            >
                              <td className="px-3 py-2 text-sm font-body">{table.table}</td>
                              <td className="px-3 py-2 text-sm font-body">
                                {table.rowCount.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-sm font-body">
                                {(table.sizeBytes / 1024).toFixed(2)} KB
                              </td>
                              <td className="px-3 py-2 text-sm font-body">
                                {new Date(table.lastUpdated).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Section */}
            {activeSection === 'transactions' && (
              <div className="space-y-6 font-body">
                {/* Transaction Summary */}
                {dbHealth.transactions ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
                      <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 font-body">
                        <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-heading">
                          Transaction Summary
                        </h3>
                        <div className="text-sm font-body">
                          <div className="flex justify-between mb-1 font-body">
                            <span className="font-body">Total Transactions:</span>
                            <span className="font-body">{dbHealth.transactions.total}</span>
                          </div>
                          <div className="flex justify-between mb-1 font-body">
                            <span className="font-body">Succeeded:</span>
                            <span className="text-green-600 font-body">
                              {dbHealth.transactions.succeeded}
                            </span>
                          </div>
                          <div className="flex justify-between mb-1 font-body">
                            <span className="font-body">Failed:</span>
                            <span
                              className={`${dbHealth.transactions.failed > 0 ? 'text-red-600' : ''} font-body`}
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
                        </div>
                      </div>

                      <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 md:col-span-2 font-body">
                        <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-heading">
                          By Operation Type
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-body">
                          {Object.entries(dbHealth.transactions.byOperation).map(([op, stats]) => (
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
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 font-body">
                      <h3 className="font-medium text-lg mb-4 text-[var(--primary-color)] font-heading">
                        Recent Transactions
                      </h3>

                      {dbHealth.transactions.recentTransactions.length > 0 ? (
                        <div className="overflow-x-auto font-body">
                          <table className="min-w-full divide-y divide-[var(--divider-color)]">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                  ID
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                  Operation
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                  Model
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                  Duration
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                  Status
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                                  Timestamp
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--divider-color)]">
                              {dbHealth.transactions.recentTransactions.map((tx, index) => (
                                <tr
                                  key={tx.id}
                                  className={
                                    index % 2 === 0
                                      ? 'bg-[var(--background-color)]'
                                      : 'bg-[var(--background-light-color)]'
                                  }
                                >
                                  <td className="px-3 py-2 text-sm font-mono font-body">
                                    {tx.id.substring(0, 8)}...
                                  </td>
                                  <td className="px-3 py-2 text-sm font-body">
                                    {tx.operation}
                                  </td>
                                  <td className="px-3 py-2 text-sm font-body">{tx.model}</td>
                                  <td className="px-3 py-2 text-sm font-body">
                                    {tx.duration.toFixed(2)}ms
                                  </td>
                                  <td className="px-3 py-2 text-sm font-body">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} font-body`}
                                    >
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-sm font-body">
                                    {new Date(tx.timestamp).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-[var(--secondary-color)] text-sm font-body">
                          No recent transactions recorded.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded font-body">
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

            {/* Test Database Operations Section */}
            {activeSection === 'test' && (
              <div className="space-y-6 font-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
                  <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 hover:shadow-md transition-shadow font-body">
                    <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-heading">
                      Basic Transaction Test
                    </h3>
                    <p className="text-sm text-[var(--secondary-color)] mb-4 font-body">
                      Tests a simple database transaction for creating a campaign with default
                      isolation level.
                    </p>
                    <button
                      onClick={() => runTransactionTest('basic')}
                      disabled={isRunningTest}
                      className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 font-body"
                    >
                      {isRunningTest ? 'Running...' : 'Run Test'}
                    </button>
                  </div>

                  <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 hover:shadow-md transition-shadow font-body">
                    <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-heading">
                      Serializable Transaction
                    </h3>
                    <p className="text-sm text-[var(--secondary-color)] mb-4 font-body">
                      Tests a database transaction with SERIALIZABLE isolation level, the most
                      strict level.
                    </p>
                    <button
                      onClick={() => runTransactionTest('isolation')}
                      disabled={isRunningTest}
                      className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50 font-body"
                    >
                      {isRunningTest ? 'Running...' : 'Run Test'}
                    </button>
                  </div>

                  <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 hover:shadow-md transition-shadow font-body">
                    <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)] font-heading">
                      Batch Operations Test
                    </h3>
                    <p className="text-sm text-[var(--secondary-color)] mb-4 font-body">
                      Tests creating multiple related records in a single transaction.
                    </p>
                    <button
                      onClick={() => runTransactionTest('batch')}
                      disabled={isRunningTest}
                      className="w-full px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50 font-body"
                    >
                      {isRunningTest ? 'Running...' : 'Run Test'}
                    </button>
                  </div>
                </div>

                {/* Test Results */}
                {transactionTestResult && (
                  <div
                    className={`mt-6 p-4 rounded-lg border ${transactionTestResult.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} font-body`}
                  >
                    <h3 className="font-medium text-lg mb-2 font-heading">Test Results</h3>

                    {transactionTestResult.error ? (
                      <div className="font-body">
                        <p className="font-medium font-body">Error:</p>
                        <pre className="text-sm bg-red-100 p-2 rounded mt-1 overflow-x-auto font-body">
                          {JSON.stringify(transactionTestResult.error, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="font-body">
                        <div className="grid grid-cols-2 gap-4 font-body">
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
                                  {new Date(
                                    transactionTestResult.timing?.startTime
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="flex justify-between mb-1 font-body">
                                <span className="font-body">End Time:</span>
                                <span className="font-body">
                                  {new Date(
                                    transactionTestResult.timing?.endTime
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="font-body">
                            <p className="font-medium font-body">Created Record:</p>
                            <pre className="text-sm bg-green-100 p-2 rounded mt-1 overflow-x-auto font-body">
                              {JSON.stringify(transactionTestResult.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="font-body">No health data available</p>
        )}
      </div>

      {/* Documentation Filter Tabs */}
      <div className="mb-6 font-body">
        <div className="flex flex-wrap gap-2 border-b border-[var(--divider-color)] font-body">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'} font-body`}
          >
            All Documents
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 ${activeTab === 'database' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'} font-body`}
          >
            Database
          </button>
          <button
            onClick={() => setActiveTab('linter')}
            className={`px-4 py-2 ${activeTab === 'linter' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'} font-body`}
          >
            Linter Reports
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 ${activeTab === 'api' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'} font-body`}
          >
            API Documentation
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 ${activeTab === 'general' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'} font-body`}
          >
            General
          </button>
        </div>
      </div>

      {/* Documentation List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-body">
        {filteredDocs.map(doc => (
          <a
            key={doc.path}
            href={doc.path}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm hover:shadow transition-shadow font-body"
          >
            <div className="flex items-start font-body">
              <div className="mr-3 mt-1 font-body">{doc.icon}</div>
              <div className="font-body">
                <h3 className="font-semibold text-[var(--primary-color)] mb-1 font-heading">
                  {doc.name}
                </h3>
                <p className="text-sm text-[var(--secondary-color)] font-body">
                  {doc.description}
                </p>
              </div>
            </div>
            <div className="mt-4 text-right font-body">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-[var(--secondary-color)] font-body">
                {doc.category === 'database'
                  ? 'Database'
                  : doc.category === 'linter'
                    ? 'Linter Report'
                    : doc.category === 'api'
                      ? 'API Docs'
                      : 'General'}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Refresh Scripts Section */}
      <div className="mt-12 bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm font-body">
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)] font-heading">
          Linter Report Scripts
        </h2>
        <p className="text-[var(--secondary-color)] mb-6 font-body">
          Generate fresh linter reports for the application. These scripts will scan the codebase
          and update the corresponding report files.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
          <RunScriptButton
            scriptName="find-any-types.js"
            label="Generate Any Type Report"
            description="Scan for 'any' type usage in TypeScript files"
          />

          <RunScriptButton
            scriptName="find-img-tags.js"
            label="Generate Img Tag Report"
            description="Scan for <img> tag usage instead of Next.js Image"
          />

          <RunScriptButton
            scriptName="find-hook-issues.js"
            label="Generate Hook Issues Report"
            description="Scan for React Hook dependency issues"
          />
        </div>
      </div>
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
    <div className="flex flex-col h-full bg-amber-50 border border-amber-200 rounded-md p-4 font-body">
      <div className="flex-grow font-body">
        <h3 className="font-medium text-amber-800 mb-1 font-heading">{label}</h3>
        <p className="text-sm text-amber-700 mb-4 font-body">{description}</p>
      </div>

      {isRunning ? (
        <div className="flex items-center justify-center py-2 font-body">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-700 font-body"></div>
          <span className="ml-2 text-amber-700 font-body">Running...</span>
        </div>
      ) : result ? (
        <div
          className={`py-2 px-3 rounded-md text-sm ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} font-body`}
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
        <button
          onClick={runScript}
          className="mt-auto px-4 py-2 bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 font-body"
        >
          Run Script
        </button>
      )}
    </div>
  );
}

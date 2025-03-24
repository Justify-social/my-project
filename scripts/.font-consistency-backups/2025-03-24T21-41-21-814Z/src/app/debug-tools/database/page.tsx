"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Icon } from '@/components/ui/icons';
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
  byOperation: Record<string, {
    count: number;
    avgDuration: number;
  }>;
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
  const {
    user,
    isLoading
  } = useUser();
  const router = useRouter();
  const [dbHealth, setDbHealth] = useState<ExtendedDbHealthData | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeSection, setActiveSection] = useState('overview');
  const [healthCheckError, setHealthCheckError] = useState<string | null>(null);
  const [transactionTestResult, setTransactionTestResult] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Documentation files available in the system
  const docs: DocFile[] = [{
    name: 'Database Schema',
    path: '/docs/DATABASE_SCHEMA.md',
    description: 'Comprehensive documentation of the database schema and entity relationships',
    category: 'database',
    icon: <Icon name="faServer" className="h-5 w-5 text-blue-600" solid={false} />
  }, {
    name: 'Database Schema Audit',
    path: '/docs/schema-audit-summary.md',
    description: 'Database schema validation and audit results',
    category: 'database',
    icon: <Icon name="faChartBar" className="h-5 w-5 text-blue-600" solid={false} />
  }, {
    name: 'Project Progress',
    path: '/docs/PROGRESS.md',
    description: 'Development progress and roadmap for the application',
    category: 'general',
    icon: <Icon name="faDocumentText" className="h-5 w-5 text-green-600" solid={false} />
  }, {
    name: 'User Flow',
    path: '/docs/User-Flow.md',
    description: 'User journey and application flow documentation',
    category: 'general',
    icon: <Icon name="faDocumentText" className="h-5 w-5 text-green-600" solid={false} />
  }, {
    name: 'Campaign Wizard Validation',
    path: '/docs/campaign-wizard-validation.md',
    description: 'Validation rules and requirements for the campaign wizard',
    category: 'general',
    icon: <Icon name="faDocumentText" className="h-5 w-5 text-green-600" solid={false} />
  }, {
    name: 'Cint API Documentation',
    path: '/docs/Cint_API_info.md',
    description: 'Integration documentation for the Cint API',
    category: 'api',
    icon: <Icon name="faDocumentText" className="h-5 w-5 text-purple-600" solid={false} />
  }, {
    name: 'Any Type Usage Report',
    path: '/docs/any-type-usage-report.md',
    description: 'ESLint report on any type usage in the codebase',
    category: 'linter',
    icon: <Icon name="faWarning" className="h-5 w-5 text-yellow-600" solid={false} />
  }, {
    name: 'Image Tag Usage Report',
    path: '/docs/img-tag-usage-report.md',
    description: 'Report on <img> tag usage instead of Next.js Image component',
    category: 'linter',
    icon: <Icon name="faWarning" className="h-5 w-5 text-yellow-600" solid={false} />
  }, {
    name: 'Hook Dependency Issues Report',
    path: '/docs/hook-dependency-issues-report.md',
    description: 'Report on React Hook dependency issues in the codebase',
    category: 'linter',
    icon: <Icon name="faWarning" className="h-5 w-5 text-yellow-600" solid={false} />
  }, {
    name: 'API Documentation',
    path: '/docs/API.md',
    description: 'API endpoints, parameters, and example responses',
    category: 'api',
    icon: <Icon name="faDocumentText" className="h-5 w-5 text-green-600" solid={false} />
  }, {
    name: 'Data Models',
    path: '/docs/MODELS.md',
    description: 'Database models and their relationships',
    category: 'database',
    icon: <Icon name="faWarning" className="h-5 w-5 text-yellow-600" solid={false} />
  }];

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: testType === 'batch' ? 'batch' : 'create',
          name: `Test Campaign ${Date.now()}`,
          testId: crypto.randomUUID(),
          isolation: testType === 'isolation' ? 'SERIALIZABLE' : undefined
        })
      });
      const data = await response.json();
      setTransactionTestResult(data);
    } catch (error) {
      setTransactionTestResult({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Clear slow queries
  const clearSlowQueries = async () => {
    try {
      await fetch('/api/health/db/clear-slow-queries', {
        method: 'POST'
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
    return <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
            <p className="mt-2 text-[var(--secondary-color)]">Loading...</p>
          </div>
        </div>
      </div>;
  }

  // Get user roles from Auth0 user metadata
  const userRoles = (user['https://justify.social/roles'] || ['USER']) as string[];

  // Check if user has admin role
  const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isAdmin && !isDevelopment) {
    return <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-medium text-lg">Access Denied</p>
            <p className="mt-2 text-[var(--secondary-color)]">You don't have permission to view this page.</p>
            <Link href="/debug-tools" className="mt-4 inline-block px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:opacity-90">

              Return to Debug Tools
            </Link>
          </div>
        </div>
      </div>;
  }
  return <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">Database Health</h1>
          <p className="text-[var(--secondary-color)] mt-1">System documentation and health monitoring for administrators</p>
        </div>
        <Link href="/debug-tools" className="mt-4 md:mt-0 flex items-center text-[var(--accent-color)] hover:underline">

          {<Icon name="faChevronRight" className="h-4 w-4 mr-1 rotate-180" solid={false} />}
          Back to Debug Tools
        </Link>
      </div>

      {/* Database Health Section */}
      <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--primary-color)]">Database Health</h2>
          
          <div className="flex mt-2 md:mt-0">
            <button onClick={() => setActiveSection('overview')} className={`px-3 py-1.5 mr-2 text-sm rounded ${activeSection === 'overview' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 text-[var(--secondary-color)]'}`}>

              Overview
            </button>
            <button onClick={() => setActiveSection('performance')} className={`px-3 py-1.5 mr-2 text-sm rounded ${activeSection === 'performance' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 text-[var(--secondary-color)]'}`}>

              Performance
            </button>
            <button onClick={() => setActiveSection('transactions')} className={`px-3 py-1.5 mr-2 text-sm rounded ${activeSection === 'transactions' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 text-[var(--secondary-color)]'}`}>

              Transactions
            </button>
            <button onClick={() => setActiveSection('test')} className={`px-3 py-1.5 text-sm rounded ${activeSection === 'test' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 text-[var(--secondary-color)]'}`}>

              Test DB
            </button>
          </div>
        </div>
        
        {isLoadingHealth ? <div className="flex items-center justify-center h-24">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
            <p className="ml-2 text-[var(--secondary-color)]">Checking database health...</p>
          </div> : healthCheckError ? <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
            <h3 className="font-medium mb-2">Error Checking Database Health</h3>
            <p>{healthCheckError}</p>
          </div> : dbHealth ? <>
            {/* Overview Section */}
            {activeSection === 'overview' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className={`rounded-lg p-4 border ${dbHealth.status === 'healthy' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <h3 className="font-medium text-lg mb-2">Overall Status</h3>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${dbHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="capitalize">{dbHealth.status}</span>
                  </div>
                  
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Connected:</span>
                      <span>{dbHealth.database.connected ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Response Time:</span>
                      <span>{dbHealth.database.responseTime.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Checked:</span>
                      <span>{new Date(dbHealth.database.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="rounded-lg p-4 bg-[var(--background-color)] border border-[var(--divider-color)]">
                  <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Query Performance</h3>
                  
                  {dbHealth.performance && <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Total Slow Queries:</span>
                        <span>{dbHealth.performance.totalSlowQueries}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Critical Slow Queries:</span>
                        <span className={dbHealth.performance.criticalSlowQueries > 0 ? 'text-red-600' : ''}>
                          {dbHealth.performance.criticalSlowQueries}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Very Slow Queries:</span>
                        <span className={dbHealth.performance.verySlowQueries > 0 ? 'text-amber-600' : ''}>
                          {dbHealth.performance.verySlowQueries}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slow Queries:</span>
                        <span className={dbHealth.performance.slowQueries > 0 ? 'text-yellow-600' : ''}>
                          {dbHealth.performance.slowQueries}
                        </span>
                      </div>
                    </div>}
                  
                  <div className="mt-4">
                    <button onClick={() => fetch('/api/health/db?extended=true').then(r => r.json()).then(data => setDbHealth(data))} className="px-3 py-1 bg-[var(--accent-color)] text-white text-sm rounded hover:opacity-90 transition-opacity">

                      Refresh Data
                    </button>
                  </div>
                </div>
                
                {/* Connection Pool */}
                {dbHealth.connectionPool && <div className="rounded-lg p-4 bg-[var(--background-color)] border border-[var(--divider-color)]">
                    <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Connection Pool</h3>
                    
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Pool Size:</span>
                        <span>{dbHealth.connectionPool.size}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Active Connections:</span>
                        <span>{dbHealth.connectionPool.active}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Idle Connections:</span>
                        <span>{dbHealth.connectionPool.idle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Waiting Clients:</span>
                        <span className={dbHealth.connectionPool.waitingClients > 0 ? 'text-amber-600' : ''}>
                          {dbHealth.connectionPool.waitingClients}
                        </span>
                      </div>
                    </div>
                  </div>}
                
                {/* Errors */}
                {dbHealth.errors && dbHealth.errors.length > 0 && <div className="rounded-lg p-4 bg-red-50 border border-red-200">
                    <h3 className="font-medium text-lg mb-2 text-red-700">Errors</h3>
                    <ul className="text-sm text-red-600">
                      {dbHealth.errors.map((error, index) => <li key={index} className="mb-1">{error}</li>)}
                    </ul>
                  </div>}
              </div>}

            {/* Performance Details Section */}
            {activeSection === 'performance' && <div className="space-y-6">
                {/* Slow Queries */}
                <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg text-[var(--primary-color)]">Slow Queries</h3>
                    <button onClick={clearSlowQueries} className="px-3 py-1 bg-[var(--accent-color)] text-white text-sm rounded hover:opacity-90 transition-opacity">

                      Clear Log
                    </button>
                  </div>

                  {dbHealth.slowQueries && dbHealth.slowQueries.length > 0 ? <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[var(--divider-color)]">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Operation</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Model</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Duration</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider-color)]">
                          {dbHealth.slowQueries.map((query, index) => <tr key={index} className={index % 2 === 0 ? 'bg-[var(--background-color)]' : 'bg-[var(--background-light-color)]'}>
                              <td className="px-3 py-2 text-sm">{query.operation}</td>
                              <td className="px-3 py-2 text-sm">{query.model}</td>
                              <td className={`px-3 py-2 text-sm ${query.duration > 1000 ? 'text-red-600' : query.duration > 500 ? 'text-amber-600' : 'text-yellow-600'}`}>
                                {query.duration.toFixed(2)}ms
                              </td>
                              <td className="px-3 py-2 text-sm">{new Date(query.timestamp).toLocaleString()}</td>
                            </tr>)}
                        </tbody>
                      </table>
                    </div> : <p className="text-[var(--secondary-color)] text-sm">No slow queries recorded.</p>}
                </div>

                {/* Table Statistics */}
                {dbHealth.tableStats && <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4">
                    <h3 className="font-medium text-lg mb-4 text-[var(--primary-color)]">Table Statistics</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[var(--divider-color)]">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Table</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Rows</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Size</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider-color)]">
                          {dbHealth.tableStats.map((table, index) => <tr key={index} className={index % 2 === 0 ? 'bg-[var(--background-color)]' : 'bg-[var(--background-light-color)]'}>
                              <td className="px-3 py-2 text-sm">{table.table}</td>
                              <td className="px-3 py-2 text-sm">{table.rowCount.toLocaleString()}</td>
                              <td className="px-3 py-2 text-sm">{(table.sizeBytes / 1024).toFixed(2)} KB</td>
                              <td className="px-3 py-2 text-sm">{new Date(table.lastUpdated).toLocaleString()}</td>
                            </tr>)}
                        </tbody>
                      </table>
                    </div>
                  </div>}
              </div>}

            {/* Transactions Section */}
            {activeSection === 'transactions' && <div className="space-y-6">
                {/* Transaction Summary */}
                {dbHealth.transactions ? <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4">
                        <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Transaction Summary</h3>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Total Transactions:</span>
                            <span>{dbHealth.transactions.total}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Succeeded:</span>
                            <span className="text-green-600">{dbHealth.transactions.succeeded}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Failed:</span>
                            <span className={dbHealth.transactions.failed > 0 ? 'text-red-600' : ''}>
                              {dbHealth.transactions.failed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Duration:</span>
                            <span>{dbHealth.transactions.avgDuration.toFixed(2)}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 md:col-span-2">
                        <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">By Operation Type</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(dbHealth.transactions.byOperation).map(([op, stats]) => <div key={op} className="bg-[var(--background-light-color)] p-2 rounded">
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
                            </div>)}
                        </div>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4">
                      <h3 className="font-medium text-lg mb-4 text-[var(--primary-color)]">Recent Transactions</h3>
                      
                      {dbHealth.transactions.recentTransactions.length > 0 ? <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-[var(--divider-color)]">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Operation</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Model</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Duration</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--divider-color)]">
                              {dbHealth.transactions.recentTransactions.map((tx, index) => <tr key={tx.id} className={index % 2 === 0 ? 'bg-[var(--background-color)]' : 'bg-[var(--background-light-color)]'}>
                                  <td className="px-3 py-2 text-sm font-mono">{tx.id.substring(0, 8)}...</td>
                                  <td className="px-3 py-2 text-sm">{tx.operation}</td>
                                  <td className="px-3 py-2 text-sm">{tx.model}</td>
                                  <td className="px-3 py-2 text-sm">{tx.duration.toFixed(2)}ms</td>
                                  <td className="px-3 py-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-sm">{new Date(tx.timestamp).toLocaleString()}</td>
                                </tr>)}
                            </tbody>
                          </table>
                        </div> : <p className="text-[var(--secondary-color)] text-sm">No recent transactions recorded.</p>}
                    </div>
                  </> : <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded">
                    <h3 className="font-medium mb-2">Transaction Monitoring Not Available</h3>
                    <p className="text-sm">Transaction monitoring data is not currently available. This may be because the feature is not enabled or no transactions have been recorded yet.</p>
                  </div>}
              </div>}

            {/* Test Database Operations Section */}
            {activeSection === 'test' && <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 hover:shadow-md transition-shadow">

                    <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Basic Transaction Test</h3>
                    <p className="text-sm text-[var(--secondary-color)] mb-4">
                      Tests a simple database transaction for creating a campaign with default isolation level.
                    </p>
                    <button onClick={() => runTransactionTest('basic')} disabled={isRunningTest} className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50">

                      {isRunningTest ? 'Running...' : 'Run Test'}
                    </button>
                  </div>

                  <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 hover:shadow-md transition-shadow">

                    <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Serializable Transaction</h3>
                    <p className="text-sm text-[var(--secondary-color)] mb-4">
                      Tests a database transaction with SERIALIZABLE isolation level, the most strict level.
                    </p>
                    <button onClick={() => runTransactionTest('isolation')} disabled={isRunningTest} className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50">

                      {isRunningTest ? 'Running...' : 'Run Test'}
                    </button>
                  </div>

                  <div className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-4 hover:shadow-md transition-shadow">

                    <h3 className="font-medium text-lg mb-2 text-[var(--primary-color)]">Batch Operations Test</h3>
                    <p className="text-sm text-[var(--secondary-color)] mb-4">
                      Tests creating multiple related records in a single transaction.
                    </p>
                    <button onClick={() => runTransactionTest('batch')} disabled={isRunningTest} className="w-full px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50">

                      {isRunningTest ? 'Running...' : 'Run Test'}
                    </button>
                  </div>
                </div>

                {/* Test Results */}
                {transactionTestResult && <div className={`mt-6 p-4 rounded-lg border ${transactionTestResult.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    <h3 className="font-medium text-lg mb-2">Test Results</h3>
                    
                    {transactionTestResult.error ? <div>
                        <p className="font-medium">Error:</p>
                        <pre className="text-sm bg-red-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(transactionTestResult.error, null, 2)}
                        </pre>
                      </div> : <div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">Transaction Details:</p>
                            <div className="text-sm mt-1">
                              <div className="flex justify-between mb-1">
                                <span>Duration:</span>
                                <span>{transactionTestResult.timing?.durationMs.toFixed(2)}ms</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Start Time:</span>
                                <span>{new Date(transactionTestResult.timing?.startTime).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>End Time:</span>
                                <span>{new Date(transactionTestResult.timing?.endTime).toLocaleTimeString()}</span>
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
                      </div>}
                  </div>}
              </div>}
          </> : <p>No health data available</p>}
      </div>

      {/* Documentation Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-[var(--divider-color)]">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'}`}>

            All Documents
          </button>
          <button onClick={() => setActiveTab('database')} className={`px-4 py-2 ${activeTab === 'database' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'}`}>

            Database
          </button>
          <button onClick={() => setActiveTab('linter')} className={`px-4 py-2 ${activeTab === 'linter' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'}`}>

            Linter Reports
          </button>
          <button onClick={() => setActiveTab('api')} className={`px-4 py-2 ${activeTab === 'api' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'}`}>

            API Documentation
          </button>
          <button onClick={() => setActiveTab('general')} className={`px-4 py-2 ${activeTab === 'general' ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' : 'text-[var(--secondary-color)]'}`}>

            General
          </button>
        </div>
      </div>

      {/* Documentation List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => <a key={doc.path} href={doc.path} target="_blank" rel="noopener noreferrer" className="bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm hover:shadow transition-shadow">

            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {doc.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--primary-color)] mb-1">{doc.name}</h3>
                <p className="text-sm text-[var(--secondary-color)]">{doc.description}</p>
              </div>
            </div>
            <div className="mt-4 text-right">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-[var(--secondary-color)]">
                {doc.category === 'database' ? 'Database' : doc.category === 'linter' ? 'Linter Report' : doc.category === 'api' ? 'API Docs' : 'General'}
              </span>
            </div>
          </a>)}
      </div>

      {/* Refresh Scripts Section */}
      <div className="mt-12 bg-[var(--background-color)] rounded-lg border border-[var(--divider-color)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)]">Linter Report Scripts</h2>
        <p className="text-[var(--secondary-color)] mb-6">
          Generate fresh linter reports for the application. These scripts will scan the codebase and update the corresponding report files.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RunScriptButton scriptName="find-any-types.js" label="Generate Any Type Report" description="Scan for 'any' type usage in TypeScript files" />

          <RunScriptButton scriptName="find-img-tags.js" label="Generate Img Tag Report" description="Scan for <img> tag usage instead of Next.js Image" />

          <RunScriptButton scriptName="find-hook-issues.js" label="Generate Hook Issues Report" description="Scan for React Hook dependency issues" />

        </div>
      </div>
    </div>;
}

// Component for running a script with loading state and feedback
function RunScriptButton({
  scriptName,
  label,
  description
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptName
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || 'Failed to run script'
        });
        return;
      }
      setResult({
        success: true,
        message: data.message,
        reportPath: data.reportPath
      });

      // Reload the page after 2 seconds to show the updated report
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setResult({
        success: false,
        error: 'An error occurred while running the script'
      });
      console.error('Error running script:', error);
    } finally {
      setIsRunning(false);
    }
  };
  return <div className="flex flex-col h-full bg-amber-50 border border-amber-200 rounded-md p-4">
      <div className="flex-grow">
        <h3 className="font-medium text-amber-800 mb-1">{label}</h3>
        <p className="text-sm text-amber-700 mb-4">{description}</p>
      </div>
      
      {isRunning ? <div className="flex items-center justify-center py-2">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-700"></div>
          <span className="ml-2 text-amber-700">Running...</span>
        </div> : result ? <div className={`py-2 px-3 rounded-md text-sm ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {result.success ? <>
              <p>✅ {result.message}</p>
              <p className="mt-1 text-xs">Reloading page...</p>
            </> : <p>❌ {result.error}</p>}
        </div> : <button onClick={runScript} className="mt-auto px-4 py-2 bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">

          Run Script
        </button>}
    </div>;
}
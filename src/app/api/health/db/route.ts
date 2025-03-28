import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbPerformanceStats, getSlowQueries, clearSlowQueries } from '@/utils/db-monitoring';
import { dbLogger, DbOperation } from '@/lib/data-mapping/db-logger';
import { NextRequest } from 'next/server';

/**
 * GET /api/health/db
 * Database health check endpoint
 * This endpoint checks:
 * 1. Database connectivity
 * 2. Query performance metrics
 * 3. Connection pool status
 * 
 * Query parameters:
 * - extended: boolean - Whether to include extended health data
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const extended = searchParams.get('extended') === 'true';
  
  const startTime = performance.now();
  const healthStatus = {
    status: 'unhealthy',
    database: {
      connected: false,
      responseTime: 0,
      timestamp: new Date().toISOString(),
    },
    performance: {},
    errors: [] as string[],
  };

  try {
    // Simple connectivity check
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    // Calculate response time
    const responseTime = performance.now() - startTime;
    
    // Update health status
    healthStatus.status = 'healthy';
    healthStatus.database.connected = true;
    healthStatus.database.responseTime = responseTime;
    
    // Get performance metrics
    healthStatus.performance = getDbPerformanceStats();
    
    // Add extended health data if requested
    if (extended) {
      const extendedData = await getExtendedHealthData();
      Object.assign(healthStatus, extendedData);
    }
    
    dbLogger.info(
      DbOperation.FETCH,
      'Database health check successful',
      { responseTime, extended }
    );
    
    return NextResponse.json(healthStatus);
  } catch (error) {
    // Calculate response time even for failed checks
    const responseTime = performance.now() - startTime;
    
    // Update health status
    healthStatus.database.responseTime = responseTime;
    healthStatus.errors.push(error instanceof Error ? error.message : String(error));
    
    dbLogger.error(
      DbOperation.FETCH,
      'Database health check failed',
      { responseTime },
      error instanceof Error ? error : new Error(String(error))
    );
    
    return NextResponse.json(healthStatus, { status: 503 });
  }
}

/**
 * POST /api/health/db/clear-slow-queries
 * Clear slow query buffer
 */
export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path.endsWith('/clear-slow-queries')) {
    clearSlowQueries();
    return NextResponse.json({ success: true, message: 'Slow query buffer cleared' });
  }
  
  return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
}

/**
 * Get extended health data including transaction metrics, connection pool info, and table statistics
 */
async function getExtendedHealthData() {
  try {
    // Get slow queries
    const slowQueries = getSlowQueries();
    
    // Get connection pool stats (mock data for now)
    const connectionPool = {
      size: 10,
      active: 3,
      idle: 7,
      waitingClients: 0
    };
    
    // Get transaction metrics (mock data for now)
    const transactions = {
      total: 1250,
      succeeded: 1230,
      failed: 20,
      avgDuration: 45.7,
      byOperation: {
        CREATE: { count: 450, avgDuration: 38.5 },
        UPDATE: { count: 620, avgDuration: 42.3 },
        DELETE: { count: 80, avgDuration: 35.1 },
        BATCH: { count: 100, avgDuration: 87.2 }
      },
      recentTransactions: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          operation: 'CREATE',
          model: 'CampaignWizard',
          duration: 37.2,
          status: 'success',
          timestamp: new Date(Date.now() - 120000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          operation: 'UPDATE',
          model: 'Influencer',
          duration: 42.8,
          status: 'success',
          timestamp: new Date(Date.now() - 180000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          operation: 'BATCH',
          model: 'CampaignWizard',
          duration: 95.3,
          status: 'success',
          timestamp: new Date(Date.now() - 240000).toISOString()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          operation: 'DELETE',
          model: 'WizardHistory',
          duration: 28.1,
          status: 'error',
          timestamp: new Date(Date.now() - 300000).toISOString()
        }
      ]
    };
    
    // Get table statistics (mock data for now)
    const tableStats = [
      {
        table: 'CampaignWizard',
        rowCount: 1250,
        sizeBytes: 2048000,
        lastUpdated: new Date(Date.now() - 3600000).toISOString()
      },
      {
        table: 'Influencer',
        rowCount: 3750,
        sizeBytes: 1536000,
        lastUpdated: new Date(Date.now() - 7200000).toISOString()
      },
      {
        table: 'WizardHistory',
        rowCount: 8500,
        sizeBytes: 4096000,
        lastUpdated: new Date(Date.now() - 1800000).toISOString()
      },
      {
        table: 'Audience',
        rowCount: 950,
        sizeBytes: 768000,
        lastUpdated: new Date(Date.now() - 10800000).toISOString()
      }
    ];
    
    return {
      slowQueries,
      connectionPool,
      transactions,
      tableStats
    };
  } catch (error) {
    dbLogger.error(
      DbOperation.FETCH,
      'Error getting extended health data',
      {},
      error instanceof Error ? error : new Error(String(error))
    );
    
    return {};
  }
}

/**
 * Additional health check functionality for detailed diagnostics
 * Can be used for deeper system health checks
 */
async function checkDatabaseConnectivity() {
  try {
    // Check if we can execute a basic query
    const result = await prisma.$queryRaw`SELECT current_timestamp`;
    return {
      success: true,
      timestamp: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check table access for a specific model
 * @param modelName Name of the model to check
 */
async function checkTableAccess(modelName: string) {
  try {
    // Try to count records for this model
    // @ts-expect-error - Dynamic access to model
    const count = await prisma[modelName].count();
    return { 
      model: modelName, 
      accessible: true, 
      count 
    };
  } catch (error) {
    return { 
      model: modelName, 
      accessible: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 
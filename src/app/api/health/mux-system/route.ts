import { NextRequest, NextResponse } from 'next/server';
import { getMuxSystemMetrics, isMuxSystemHealthy } from '@/lib/utils/mux-resilience';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';

/**
 * 🔍 MUX SYSTEM HEALTH ENDPOINT
 *
 * Provides comprehensive health metrics for monitoring:
 * - Circuit breaker state and metrics
 * - Retry budget usage
 * - Processing state summary
 * - Database connectivity
 * - System performance indicators
 */

export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get resilience system metrics
    const resilienceMetrics = getMuxSystemMetrics();
    const isSystemHealthy = isMuxSystemHealthy();

    // Get database metrics
    const dbMetrics = await getDatabaseMetrics();

    // Get recent processing stats
    const processingStats = await getProcessingStats();

    const responseTime = Date.now() - startTime;

    const healthData = {
      status: isSystemHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime,
      resilience: {
        systemHealth: isSystemHealthy,
        circuitBreaker: resilienceMetrics.circuitBreaker,
        retryBudget: resilienceMetrics.retryBudget,
        processingStates: resilienceMetrics.processingStates.length,
      },
      database: dbMetrics,
      processing: processingStats,
      uptime: process.uptime(),
    };

    logger.info('Health check completed', {
      service: 'mux-health-check',
      status: healthData.status,
      responseTime,
      circuitState: resilienceMetrics.circuitBreaker.state,
      retryBudgetRemaining: resilienceMetrics.retryBudget.remainingBudget,
    });

    return NextResponse.json(healthData, {
      status: isSystemHealthy ? 200 : 503,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.error('Health check failed', {
      service: 'mux-health-check',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    });

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        responseTime,
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Get database connectivity and performance metrics
 */
async function getDatabaseMetrics() {
  const dbStartTime = Date.now();

  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Get asset counts by status
    const statusCounts = await prisma.creativeAsset.groupBy({
      by: ['muxProcessingStatus'],
      _count: {
        id: true,
      },
      where: {
        muxProcessingStatus: {
          in: ['MUX_PROCESSING', 'READY', 'ERROR', 'UPLOAD_PENDING'],
        },
      },
    });

    const dbResponseTime = Date.now() - dbStartTime;

    return {
      connected: true,
      responseTime: dbResponseTime,
      statusCounts: statusCounts.reduce(
        (acc, item) => {
          if (item.muxProcessingStatus) {
            acc[item.muxProcessingStatus] = item._count.id;
          }
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  } catch (error) {
    const dbResponseTime = Date.now() - dbStartTime;

    return {
      connected: false,
      responseTime: dbResponseTime,
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

/**
 * Get recent processing statistics
 */
async function getProcessingStats() {
  try {
    // Get assets processed in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentlyUpdated = await prisma.creativeAsset.count({
      where: {
        updatedAt: {
          gte: oneHourAgo,
        },
        muxProcessingStatus: {
          in: ['READY', 'ERROR'],
        },
      },
    });

    // Get assets currently processing
    const currentlyProcessing = await prisma.creativeAsset.count({
      where: {
        muxProcessingStatus: 'MUX_PROCESSING',
      },
    });

    // Get assets with errors
    const errorCount = await prisma.creativeAsset.count({
      where: {
        muxProcessingStatus: 'ERROR',
        updatedAt: {
          gte: oneHourAgo,
        },
      },
    });

    return {
      recentlyProcessed: recentlyUpdated,
      currentlyProcessing,
      recentErrors: errorCount,
      errorRate: recentlyUpdated > 0 ? errorCount / recentlyUpdated : 0,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get processing stats',
    };
  }
}

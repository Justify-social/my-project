import { prisma } from '@/lib/prisma';
import { DbOperation, dbLogger } from '@/lib/data-mapping/db-logger';

// Interface for query performance metrics
export interface QueryMetrics {
  operation: string;
  model: string;
  duration: number;
  timestamp: Date;
  query?: string;
}

// Interface for query statistics
interface QueryStats {
  model: string;
  operation: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}

// Keep track of the last N slow queries
const SLOW_QUERY_BUFFER_SIZE = 100;
const slowQueries: QueryMetrics[] = [];

// Configure thresholds for slow query detection (in milliseconds)
const SLOW_QUERY_THRESHOLD = 100;
const VERY_SLOW_QUERY_THRESHOLD = 500;
const CRITICAL_QUERY_THRESHOLD = 1000;

/**
 * Add metrics to the PrismaClient to track query performance
 * @returns A Prisma client with performance monitoring
 */
export function createPrismaWithMetrics() {
  return prisma.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const startTime = performance.now();
        try {
          const result = await query(args);
          
          // Calculate query duration
          const duration = performance.now() - startTime;
          
          // Record metrics for slow queries
          if (duration > SLOW_QUERY_THRESHOLD) {
            const metrics: QueryMetrics = {
              operation,
              model: model || 'unknown',
              duration,
              timestamp: new Date(),
              query: JSON.stringify(args)
            };
            
            // Add to slow query buffer
            slowQueries.push(metrics);
            if (slowQueries.length > SLOW_QUERY_BUFFER_SIZE) {
              slowQueries.shift();
            }
            
            // Log slow queries based on severity
            if (duration > CRITICAL_QUERY_THRESHOLD) {
              dbLogger.warn(
                DbOperation.FETCH,
                `CRITICAL SLOW QUERY: ${model}.${operation} took ${duration.toFixed(2)}ms`,
                { metrics }
              );
            } else if (duration > VERY_SLOW_QUERY_THRESHOLD) {
              dbLogger.warn(
                DbOperation.FETCH,
                `VERY SLOW QUERY: ${model}.${operation} took ${duration.toFixed(2)}ms`,
                { metrics }
              );
            } else {
              dbLogger.info(
                DbOperation.FETCH,
                `SLOW QUERY: ${model}.${operation} took ${duration.toFixed(2)}ms`,
                { metrics }
              );
            }
          }
          
          return result;
        } catch (error) {
          // Log failed queries
          const duration = performance.now() - startTime;
          dbLogger.error(
            DbOperation.FETCH,
            `FAILED QUERY: ${model}.${operation} failed after ${duration.toFixed(2)}ms`,
            { args },
            error instanceof Error ? error : new Error(String(error))
          );
          
          throw error;
        }
      }
    }
  });
}

/**
 * Get the list of recent slow queries
 */
export function getSlowQueries(): QueryMetrics[] {
  return [...slowQueries];
}

/**
 * Clear the slow query buffer
 */
export function clearSlowQueries(): void {
  slowQueries.length = 0;
}

/**
 * Get statistics about database performance
 */
export function getDbPerformanceStats() {
  // Group by model and operation
  const statsByModelAndOperation = slowQueries.reduce((acc, query) => {
    const key = `${query.model}.${query.operation}`;
    if (!acc[key]) {
      acc[key] = {
        model: query.model,
        operation: query.operation,
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity
      };
    }
    
    acc[key].count++;
    acc[key].totalDuration += query.duration;
    acc[key].avgDuration = acc[key].totalDuration / acc[key].count;
    acc[key].maxDuration = Math.max(acc[key].maxDuration, query.duration);
    acc[key].minDuration = Math.min(acc[key].minDuration, query.duration);
    
    return acc;
  }, {} as Record<string, QueryStats>);
  
  return {
    totalSlowQueries: slowQueries.length,
    criticalSlowQueries: slowQueries.filter(q => q.duration > CRITICAL_QUERY_THRESHOLD).length,
    verySlowQueries: slowQueries.filter(q => q.duration > VERY_SLOW_QUERY_THRESHOLD && q.duration <= CRITICAL_QUERY_THRESHOLD).length,
    slowQueries: slowQueries.filter(q => q.duration > SLOW_QUERY_THRESHOLD && q.duration <= VERY_SLOW_QUERY_THRESHOLD).length,
    statsByModelAndOperation: Object.values(statsByModelAndOperation)
  };
}

/**
 * Create optimized select clauses for Prisma queries
 * This helps reduce the amount of data transferred from the database
 * 
 * @param fields Array of field names to include in the select
 * @returns A select object for use in Prisma queries
 */
export function createSelectClause(fields: string[]): Record<string, boolean> {
  return fields.reduce((select, field) => {
    select[field] = true;
    return select;
  }, {} as Record<string, boolean>);
} 
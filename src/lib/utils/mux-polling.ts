/**
 * 🎯 ENHANCED MUX POLLING SERVICE
 * Harvard-level resilient polling for video processing status
 *
 * Features:
 * - Circuit breaker protection against API failures
 * - Adaptive polling intervals based on system health
 * - Exponential backoff on errors
 * - Graceful degradation during failures
 * - Comprehensive observability and metrics
 * - Automatic cleanup and resource management
 */

import { executeResilientMuxOperation, isMuxSystemHealthy } from './mux-resilience';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface PollingOptions {
  baseIntervalMs: number;
  maxIntervalMs: number;
  healthyIntervalMs: number;
  degradedIntervalMs: number;
  maxPollingDuration: number;
  onStatusUpdate?: (assets: AssetStatus[]) => void;
  onError?: (error: Error) => void;
  onComplete?: (completedAssets: AssetStatus[]) => void;
}

interface AssetStatus {
  id: string | number;
  internalAssetId?: number;
  muxAssetId?: string;
  muxProcessingStatus: string;
  name?: string;
  muxPlaybackId?: string;
  url?: string;
  lastUpdated: Date;
}

interface PollingSession {
  id: string;
  startTime: Date;
  assetIds: (string | number)[];
  isActive: boolean;
  pollCount: number;
  lastPollTime?: Date;
  completedAssets: AssetStatus[];
  errors: string[];
}

// =============================================================================
// ENHANCED MUX POLLING MANAGER
// =============================================================================

export class MuxPollingManager {
  private activeSessions = new Map<string, PollingSession>();
  private pollTimeouts = new Map<string, NodeJS.Timeout>();
  private defaultOptions: PollingOptions = {
    baseIntervalMs: 3000, // 3 seconds base
    maxIntervalMs: 30000, // 30 seconds max
    healthyIntervalMs: 2000, // 2 seconds when healthy
    degradedIntervalMs: 5000, // 5 seconds when degraded
    maxPollingDuration: 600000, // 10 minutes maximum
  };

  constructor(private options: Partial<PollingOptions> = {}) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Start polling for asset processing status with resilience
   */
  async startPolling(
    assetIds: (string | number)[],
    reloadDataCallback: () => Promise<AssetStatus[]>,
    options: Partial<PollingOptions> = {}
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    const mergedOptions = { ...this.defaultOptions, ...options };

    const session: PollingSession = {
      id: sessionId,
      startTime: new Date(),
      assetIds: [...assetIds],
      isActive: true,
      pollCount: 0,
      completedAssets: [],
      errors: [],
    };

    this.activeSessions.set(sessionId, session);

    logger.info('Starting enhanced Mux polling session', {
      service: 'mux-polling',
      sessionId,
      assetCount: assetIds.length,
      options: mergedOptions,
    });

    // Start the polling loop
    this.pollLoop(sessionId, reloadDataCallback, mergedOptions);

    return sessionId;
  }

  /**
   * Stop polling session
   */
  stopPolling(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      logger.warn('Attempted to stop non-existent polling session', {
        service: 'mux-polling',
        sessionId,
      });
      return;
    }

    session.isActive = false;
    this.activeSessions.delete(sessionId);

    const timeout = this.pollTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.pollTimeouts.delete(sessionId);
    }

    const duration = Date.now() - session.startTime.getTime();
    logger.info('Stopped Mux polling session', {
      service: 'mux-polling',
      sessionId,
      duration,
      pollCount: session.pollCount,
      completedAssets: session.completedAssets.length,
      totalErrors: session.errors.length,
    });
  }

  /**
   * Stop all active polling sessions
   */
  stopAllPolling(): void {
    logger.info('Stopping all Mux polling sessions', {
      service: 'mux-polling',
      activeSessionCount: this.activeSessions.size,
    });

    const sessionIds = Array.from(this.activeSessions.keys());
    sessionIds.forEach(sessionId => this.stopPolling(sessionId));
  }

  /**
   * Get active polling sessions for monitoring
   */
  getActiveSessions(): PollingSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Check if any assets are being polled
   */
  hasActivePolling(): boolean {
    return this.activeSessions.size > 0;
  }

  /**
   * Main polling loop with resilience patterns
   */
  private async pollLoop(
    sessionId: string,
    reloadDataCallback: () => Promise<AssetStatus[]>,
    options: PollingOptions
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      return;
    }

    // Check maximum polling duration
    const duration = Date.now() - session.startTime.getTime();
    if (duration > options.maxPollingDuration) {
      logger.warn('Polling session exceeded maximum duration', {
        service: 'mux-polling',
        sessionId,
        duration,
        maxDuration: options.maxPollingDuration,
      });
      this.stopPolling(sessionId);
      return;
    }

    try {
      // Execute polling with resilience patterns
      const assets = await executeResilientMuxOperation(
        async () => {
          logger.info('Polling for asset status updates', {
            service: 'mux-polling',
            sessionId,
            pollCount: session.pollCount + 1,
          });

          return await reloadDataCallback();
        },
        'poll-asset-status',
        sessionId
      );

      session.pollCount++;
      session.lastPollTime = new Date();

      // Process polling results
      const { completed, stillProcessing } = this.processPollingResults(sessionId, assets, options);

      // Check if all assets are complete
      if (stillProcessing.length === 0) {
        logger.info('All assets completed processing', {
          service: 'mux-polling',
          sessionId,
          completedCount: completed.length,
          totalPolls: session.pollCount,
          duration: Date.now() - session.startTime.getTime(),
        });

        // Call completion callback
        if (options.onComplete) {
          options.onComplete(completed);
        }

        this.stopPolling(sessionId);
        return;
      }

      // Schedule next poll with adaptive interval
      const nextInterval = this.calculateNextInterval(sessionId, options);
      this.scheduleNextPoll(sessionId, reloadDataCallback, options, nextInterval);
    } catch (error) {
      session.errors.push(error instanceof Error ? error.message : 'Unknown polling error');

      logger.error('Polling iteration failed', {
        service: 'mux-polling',
        sessionId,
        pollCount: session.pollCount,
        error: error instanceof Error ? error.message : 'Unknown error',
        totalErrors: session.errors.length,
      });

      // Call error callback
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error('Polling failed'));
      }

      // Continue polling with backoff, unless circuit breaker is open
      if (isMuxSystemHealthy()) {
        const backoffInterval = this.calculateBackoffInterval(session.pollCount);
        this.scheduleNextPoll(sessionId, reloadDataCallback, options, backoffInterval);
      } else {
        logger.warn('Mux system unhealthy, stopping polling session', {
          service: 'mux-polling',
          sessionId,
        });
        this.stopPolling(sessionId);
      }
    }
  }

  /**
   * Process polling results and categorize assets
   */
  private processPollingResults(
    sessionId: string,
    assets: AssetStatus[],
    options: PollingOptions
  ): { completed: AssetStatus[]; stillProcessing: AssetStatus[] } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { completed: [], stillProcessing: [] };
    }

    const completed: AssetStatus[] = [];
    const stillProcessing: AssetStatus[] = [];

    assets.forEach(asset => {
      const isComplete = this.isAssetComplete(asset.muxProcessingStatus);

      if (isComplete) {
        completed.push(asset);
        // Track newly completed assets
        const wasCompleted = session.completedAssets.some(
          ca => ca.id === asset.id || ca.internalAssetId === asset.internalAssetId
        );
        if (!wasCompleted) {
          session.completedAssets.push(asset);
          logger.info('Asset completed processing', {
            service: 'mux-polling',
            sessionId,
            assetId: asset.id,
            status: asset.muxProcessingStatus,
            name: asset.name,
          });
        }
      } else {
        stillProcessing.push(asset);
      }
    });

    // Call status update callback
    if (options.onStatusUpdate) {
      options.onStatusUpdate(assets);
    }

    return { completed, stillProcessing };
  }

  /**
   * Calculate adaptive polling interval based on system health
   */
  private calculateNextInterval(sessionId: string, options: PollingOptions): number {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return options.baseIntervalMs;
    }

    // Use health-based intervals
    const isSystemHealthy = isMuxSystemHealthy();
    if (isSystemHealthy) {
      return options.healthyIntervalMs;
    } else {
      return options.degradedIntervalMs;
    }
  }

  /**
   * Calculate exponential backoff interval for errors
   */
  private calculateBackoffInterval(pollCount: number): number {
    const baseBackoff = 1000; // 1 second
    const maxBackoff = 30000; // 30 seconds
    const backoff = Math.min(baseBackoff * Math.pow(2, pollCount), maxBackoff);

    // Add jitter to prevent thundering herd
    const jitter = backoff * 0.1 * Math.random();
    return backoff + jitter;
  }

  /**
   * Schedule next polling iteration
   */
  private scheduleNextPoll(
    sessionId: string,
    reloadDataCallback: () => Promise<AssetStatus[]>,
    options: PollingOptions,
    intervalMs: number
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      return;
    }

    logger.info('Scheduling next poll', {
      service: 'mux-polling',
      sessionId,
      intervalMs,
      nextPollTime: new Date(Date.now() + intervalMs).toISOString(),
    });

    const timeout = setTimeout(() => {
      this.pollLoop(sessionId, reloadDataCallback, options);
    }, intervalMs);

    this.pollTimeouts.set(sessionId, timeout);
  }

  /**
   * Check if asset processing is complete
   */
  private isAssetComplete(status: string): boolean {
    return ['READY', 'ERROR', 'ERROR_NO_PLAYBACK_ID'].includes(status);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get metrics for monitoring
   */
  getMetrics() {
    return {
      activeSessions: this.activeSessions.size,
      activeTimeouts: this.pollTimeouts.size,
      sessions: Array.from(this.activeSessions.values()).map(session => ({
        id: session.id,
        startTime: session.startTime,
        duration: Date.now() - session.startTime.getTime(),
        pollCount: session.pollCount,
        assetCount: session.assetIds.length,
        completedCount: session.completedAssets.length,
        errorCount: session.errors.length,
        isActive: session.isActive,
      })),
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let muxPollingManager: MuxPollingManager | null = null;

export function getMuxPollingManager(): MuxPollingManager {
  if (!muxPollingManager) {
    muxPollingManager = new MuxPollingManager();
  }
  return muxPollingManager;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Start resilient polling for assets
 */
export async function startResilientPolling(
  assetIds: (string | number)[],
  reloadDataCallback: () => Promise<AssetStatus[]>,
  options: Partial<PollingOptions> = {}
): Promise<string> {
  const manager = getMuxPollingManager();
  return manager.startPolling(assetIds, reloadDataCallback, options);
}

/**
 * Stop resilient polling
 */
export function stopResilientPolling(sessionId: string): void {
  const manager = getMuxPollingManager();
  manager.stopPolling(sessionId);
}

/**
 * Stop all polling sessions
 */
export function stopAllResilientPolling(): void {
  const manager = getMuxPollingManager();
  manager.stopAllPolling();
}

/**
 * Get polling metrics for monitoring
 */
export function getPollingMetrics() {
  const manager = getMuxPollingManager();
  return manager.getMetrics();
}

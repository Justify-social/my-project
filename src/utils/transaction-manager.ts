/**
 * Transaction Manager Utility
 * 
 * This utility provides a robust wrapper for Prisma transactions with:
 * - Configurable isolation levels
 * - Automatic retry for transient failures
 * - Detailed transaction logging
 * - Consistent error handling
 * - Performance tracking
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Define isolation levels based on PostgreSQL's support
export enum IsolationLevel {
  ReadUncommitted = 'READ UNCOMMITTED',
  ReadCommitted = 'READ COMMITTED',
  RepeatableRead = 'REPEATABLE READ',
  Serializable = 'SERIALIZABLE'
}

// Transaction operation types for logging and monitoring
export enum TransactionOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  BATCH = 'BATCH',
  CUSTOM = 'CUSTOM'
}

// Transaction metadata for logging
export interface TransactionMetadata {
  operation: TransactionOperation;
  modelName: string;
  recordIds?: string[] | number[];
  userId?: string;
  description?: string;
  additionalInfo?: Record<string, unknown>;
}

// Transaction result with timing information
export interface TransactionResult<T> {
  data: T;
  timing: {
    startTime: Date;
    endTime: Date;
    durationMs: number;
  };
  metadata: TransactionMetadata;
}

// Transaction error types
export enum TransactionErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  UNIQUE_CONSTRAINT = 'UNIQUE_CONSTRAINT_VIOLATION',
  FOREIGN_KEY = 'FOREIGN_KEY_VIOLATION',
  CONNECTION = 'CONNECTION_FAILURE',
  TIMEOUT = 'TRANSACTION_TIMEOUT',
  DEADLOCK = 'DEADLOCK_DETECTED',
  SERIALIZATION = 'SERIALIZATION_FAILURE',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// Enhanced transaction error
export class TransactionError extends Error {
  type: TransactionErrorType;
  cause?: Error;
  transactionId?: string;
  metadata?: TransactionMetadata;
  attemptCount?: number;
  query?: string;
  params?: unknown;

  constructor(message: string, type: TransactionErrorType, options?: {
    cause?: Error;
    transactionId?: string;
    metadata?: TransactionMetadata;
    attemptCount?: number;
    query?: string;
    params?: unknown;
  }) {
    super(message);
    this.name = 'TransactionError';
    this.type = type;
    this.cause = options?.cause;
    this.transactionId = options?.transactionId;
    this.metadata = options?.metadata;
    this.attemptCount = options?.attemptCount;
    this.query = options?.query;
    this.params = options?.params;
  }
}

// Transaction options
export interface TransactionOptions {
  isolation?: IsolationLevel;
  maxRetries?: number;
  retryDelayMs?: number;
  timeout?: number; // in milliseconds
  logging?: boolean;
  metadata?: TransactionMetadata;
}

// Default transaction options
const DEFAULT_TRANSACTION_OPTIONS: TransactionOptions = {
  isolation: IsolationLevel.ReadCommitted,
  maxRetries: 3,
  retryDelayMs: 100,
  timeout: 30000, // 30 seconds
  logging: true,
  metadata: {
    operation: TransactionOperation.CUSTOM,
    modelName: 'unknown'
  }
};

/**
 * Transaction manager class that provides methods for executing database
 * transactions with proper error handling, retries, and logging.
 */
export class TransactionManager {
  private prisma: PrismaClient;
  private transactionCount = 0;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || prisma;
  }

  /**
   * Execute a function within a transaction with configurable options
   * @param fn The function to execute within the transaction
   * @param options Transaction options
   * @returns Promise with the transaction result
   */
  async executeTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<TransactionResult<T>> {
    // Merge default options with provided options
    const txOptions: TransactionOptions = {
      ...DEFAULT_TRANSACTION_OPTIONS,
      ...options,
      metadata: {
        ...DEFAULT_TRANSACTION_OPTIONS.metadata!,
        ...options.metadata
      }
    };

    const transactionId = `tx_${Date.now()}_${++this.transactionCount}`;
    let attemptCount = 0;
    const startTime = new Date();

    // Log transaction start if logging is enabled
    if (txOptions.logging) {
      logger.info({
        message: 'Transaction started',
        transactionId,
        isolation: txOptions.isolation,
        operation: txOptions.metadata?.operation,
        model: txOptions.metadata?.modelName,
        userContext: txOptions.metadata?.userId ? { userId: txOptions.metadata.userId } : undefined
      });
    }

    // Execute with retries
    while (true) {
      attemptCount++;
      
      try {
        // Set up a timeout if specified
        const timeoutPromise = txOptions.timeout
          ? new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new TransactionError(
                  `Transaction timed out after ${txOptions.timeout}ms`,
                  TransactionErrorType.TIMEOUT,
                  { transactionId, metadata: txOptions.metadata, attemptCount }
                ));
              }, txOptions.timeout);
            })
          : null;
          
        // Execute the transaction with the specified isolation level
        const txResult = await Promise.race([
          this.prisma.$transaction(
            async (tx) => {
              // Set the isolation level if provided
              if (txOptions.isolation) {
                await tx.$executeRawUnsafe(`SET TRANSACTION ISOLATION LEVEL ${txOptions.isolation}`);
              }
              
              return await fn(tx);
            },
            {
              maxWait: txOptions.timeout, // Maximum time to acquire a connection
              timeout: txOptions.timeout   // Maximum time for the transaction
            }
          ),
          ...(timeoutPromise ? [timeoutPromise] : [])
        ]);
        
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();
        
        // Log successful transaction completion
        if (txOptions.logging) {
          logger.info({
            message: 'Transaction completed successfully',
            transactionId,
            durationMs,
            attempts: attemptCount,
            operation: txOptions.metadata?.operation,
            model: txOptions.metadata?.modelName
          });
        }
        
        return {
          data: txResult,
          timing: {
            startTime,
            endTime,
            durationMs
          },
          metadata: txOptions.metadata || { 
            operation: TransactionOperation.CUSTOM, 
            modelName: 'unknown' 
          }
        };
      } catch (error) {
        const errorInfo = this.parseError(error);
        
        // Determine if this error is retryable
        const isRetryable = this.isRetryableError(errorInfo.type) && 
                            attemptCount < (txOptions.maxRetries || 3);
        
        // Log the error
        if (txOptions.logging) {
          logger.error({
            message: `Transaction error: ${errorInfo.message}`,
            transactionId,
            errorType: errorInfo.type,
            attempt: attemptCount,
            willRetry: isRetryable,
            operation: txOptions.metadata?.operation,
            model: txOptions.metadata?.modelName,
            error: error instanceof Error ? error.stack : String(error)
          });
        }
        
        // Retry if possible, otherwise throw
        if (isRetryable) {
          const delayMs = this.calculateRetryDelay(attemptCount, txOptions.retryDelayMs || 100);
          
          if (txOptions.logging) {
            logger.info({
              message: `Retrying transaction in ${delayMs}ms`,
              transactionId,
              attempt: attemptCount,
              nextAttempt: attemptCount + 1,
              delayMs
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        // Throw a standardized transaction error
        throw new TransactionError(
          errorInfo.message,
          errorInfo.type,
          {
            cause: error instanceof Error ? error : undefined,
            transactionId,
            metadata: txOptions.metadata,
            attemptCount
          }
        );
      }
    }
  }
  
  /**
   * Parse Prisma and other errors into standardized transaction error types
   */
  private parseError(error: unknown): { type: TransactionErrorType; message: string } {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      switch (error.code) {
        case 'P2002':
          return {
            type: TransactionErrorType.UNIQUE_CONSTRAINT,
            message: `Unique constraint violation: ${error.meta?.target as string || 'unknown field'}`
          };
        case 'P2003':
          return {
            type: TransactionErrorType.FOREIGN_KEY,
            message: `Foreign key constraint violation: ${error.meta?.field_name as string || 'unknown field'}`
          };
        case 'P2025':
          return {
            type: TransactionErrorType.VALIDATION,
            message: 'Record not found'
          };
        default:
          return {
            type: TransactionErrorType.UNKNOWN,
            message: `Prisma error: ${error.message}`
          };
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      return {
        type: TransactionErrorType.VALIDATION,
        message: `Validation error: ${error.message}`
      };
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
      return {
        type: TransactionErrorType.CONNECTION,
        message: 'Database client panic error'
      };
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        type: TransactionErrorType.CONNECTION,
        message: `Connection initialization error: ${error.message}`
      };
    } else if (error instanceof TransactionError) {
      return {
        type: error.type,
        message: error.message
      };
    }
    
    // Handle generic errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for common PostgreSQL error patterns
    if (errorMessage.includes('deadlock detected')) {
      return {
        type: TransactionErrorType.DEADLOCK,
        message: 'Deadlock detected in transaction'
      };
    } else if (errorMessage.includes('serialization failure')) {
      return {
        type: TransactionErrorType.SERIALIZATION,
        message: 'Serialization failure in transaction'
      };
    } else if (errorMessage.includes('timeout')) {
      return {
        type: TransactionErrorType.TIMEOUT,
        message: 'Transaction timeout'
      };
    }
    
    return {
      type: TransactionErrorType.UNKNOWN,
      message: `Unknown error: ${errorMessage}`
    };
  }
  
  /**
   * Determine if an error is retryable
   */
  private isRetryableError(errorType: TransactionErrorType): boolean {
    return [
      TransactionErrorType.CONNECTION,
      TransactionErrorType.TIMEOUT,
      TransactionErrorType.DEADLOCK,
      TransactionErrorType.SERIALIZATION
    ].includes(errorType);
  }
  
  /**
   * Calculate exponential backoff delay for retries
   */
  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    // Exponential backoff with jitter: (2^attempt * baseDelay) + random jitter
    const exponentialDelay = Math.pow(2, attempt - 1) * baseDelay;
    const jitter = Math.random() * baseDelay;
    return Math.min(exponentialDelay + jitter, 10000); // Cap at 10 seconds
  }
  
  /**
   * Helper method for common create operations
   */
  async create<T, D>(
    model: string,
    data: D,
    options?: Omit<TransactionOptions, 'metadata'> & {
      userId?: string;
      description?: string;
    }
  ): Promise<T> {
    return this.executeTransaction<T>(
      async (tx) => {
        // @ts-expect-error - Dynamic access to Prisma model
        return await tx[model].create({ data });
      },
      {
        ...options,
        metadata: {
          operation: TransactionOperation.CREATE,
          modelName: model,
          userId: options?.userId,
          description: options?.description
        }
      }
    ).then(result => result.data);
  }
  
  /**
   * Helper method for common update operations with string or number ID
   */
  async update<T, D>(
    model: string,
    id: string | number,
    data: D,
    options?: Omit<TransactionOptions, 'metadata'> & {
      userId?: string;
      description?: string;
    }
  ): Promise<T> {
    return this.executeTransaction<T>(
      async (tx) => {
        // Dynamically access the Prisma model and handle both string and number IDs
        // @ts-expect-error - Dynamic access to Prisma model
        return await tx[model].update({
          where: { id },
          data
        });
      },
      {
        ...options,
        metadata: {
          operation: TransactionOperation.UPDATE,
          modelName: model,
          recordIds: [id],
          userId: options?.userId,
          description: options?.description
        }
      }
    ).then(result => result.data);
  }
  
  /**
   * Helper method for common delete operations with string or number ID
   */
  async delete<T>(
    model: string,
    id: string | number,
    options?: Omit<TransactionOptions, 'metadata'> & {
      userId?: string;
      description?: string;
    }
  ): Promise<T> {
    return this.executeTransaction<T>(
      async (tx) => {
        // Dynamically access the Prisma model and handle both string and number IDs
        // @ts-expect-error - Dynamic access to Prisma model
        return await tx[model].delete({
          where: { id }
        });
      },
      {
        ...options,
        metadata: {
          operation: TransactionOperation.DELETE,
          modelName: model,
          recordIds: [id],
          userId: options?.userId,
          description: options?.description
        }
      }
    ).then(result => result.data);
  }
  
  /**
   * Helper method for batch operations within a single transaction
   */
  async batch<T>(
    operations: Array<(tx: Prisma.TransactionClient) => Promise<unknown>>,
    options?: TransactionOptions
  ): Promise<T> {
    return this.executeTransaction<T>(
      async (tx) => {
        const results = [];
        for (const operation of operations) {
          results.push(await operation(tx));
        }
        return results as T;
      },
      {
        ...options,
        metadata: {
          operation: TransactionOperation.BATCH,
          modelName: options?.metadata?.modelName || 'multiple',
          ...options?.metadata
        }
      }
    ).then(result => result.data);
  }
}

// Export singleton instance
export const transactionManager = new TransactionManager();

// Usage example:
/*
import { transactionManager, TransactionOperation, IsolationLevel } from '@/utils/transaction-manager';

// Example 1: Simple create with default options
const campaign = await transactionManager.create('campaignWizard', {
  name: 'Test Campaign',
  // ... other fields
});

// Example 2: Custom transaction with specific isolation level
const result = await transactionManager.executeTransaction(
  async (tx) => {
    // Create campaign
    const campaign = await tx.campaignWizard.create({
      data: {
        name: 'Complex Campaign',
        // ... other fields
      }
    });
    
    // Create related records
    const influencer = await tx.influencer.create({
      data: {
        campaignWizardId: campaign.id,
        platform: 'INSTAGRAM',
        // ... other fields
      }
    });
    
    return { campaign, influencer };
  },
  {
    isolation: IsolationLevel.Serializable,
    metadata: {
      operation: TransactionOperation.CREATE,
      modelName: 'campaignWizard',
      description: 'Create campaign with influencer',
      userId: '123'
    }
  }
);

// Example 3: Batch operations
const batchResult = await transactionManager.batch([
  tx => tx.user.update({ where: { id: 1 }, data: { name: 'Updated Name' } }),
  tx => tx.notification.create({ data: { userId: 1, message: 'Profile updated' } })
]);
*/ 
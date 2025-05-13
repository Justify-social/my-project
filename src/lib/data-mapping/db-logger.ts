/**
 * Database Operation Logger
 * Provides structured logging for database operations with a focus on data persistence
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Log entry structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  operation: string;
  campaignId?: number;
  data?: unknown;
  message: string;
  error?: unknown;
}

// Database operation types
export enum DbOperation {
  FETCH = 'FETCH',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  TRANSACTION = 'TRANSACTION',
  VALIDATION = 'VALIDATION',
}

// Type for log data that might contain a campaignId
interface LogData {
  [key: string]: unknown;
  campaignId?: string | number | undefined;
}

// Define structure for formatted errors
interface FormattedError {
  message: string;
  stack?: string;
  name?: string;
  code?: string | number;
}

class DbLogger {
  private enabled: boolean = process.env.NODE_ENV !== 'production';
  private logToConsole: boolean = true;
  private logToStorage: boolean = false;
  private logs: LogEntry[] = [];
  private maxLogSize: number = 100;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    // Only log initialization message if not in test environment to avoid cluttering test output
    if (process.env.NODE_ENV !== 'test') {
      // console.log('[DbLogger] Initialized in ' + process.env.NODE_ENV + ' mode');
    }
  }

  /**
   * Log a database operation
   */
  public log(
    level: LogLevel,
    operation: DbOperation | string,
    message: string,
    data?: LogData,
    error?: unknown
  ): void {
    if (!this.enabled) return;

    // Process campaign ID from data if it exists
    let campaignId: number | undefined = undefined;

    if (data && 'campaignId' in data) {
      // Convert campaignId to number if it exists
      const rawCampaignId = data.campaignId;
      if (rawCampaignId !== undefined && rawCampaignId !== null) {
        if (typeof rawCampaignId === 'number') {
          campaignId = rawCampaignId;
        } else if (typeof rawCampaignId === 'string') {
          campaignId = parseInt(rawCampaignId, 10);
        } else {
          // Try to convert to number as a last resort
          campaignId = Number(rawCampaignId);
        }

        // Ensure it's actually a valid number
        if (isNaN(campaignId)) {
          campaignId = undefined;
        }
      }
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      message,
      campaignId,
      data: this.sanitizeData(data),
      error: error ? this.formatError(error) : undefined,
    };

    // Add to in-memory log
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift(); // Remove oldest log entry if we exceed max size
    }

    // Output to console based on log level
    if (this.logToConsole) {
      this.outputToConsole(logEntry);
    }

    // Store logs if enabled
    if (this.logToStorage) {
      this.storeLog(logEntry);
    }
  }

  /**
   * Log a debug message
   */
  public debug(operation: DbOperation | string, message: string, data?: LogData): void {
    this.log(LogLevel.DEBUG, operation, message, data);
  }

  /**
   * Log an info message
   */
  public info(operation: DbOperation | string, message: string, data?: LogData): void {
    this.log(LogLevel.INFO, operation, message, data);
  }

  /**
   * Log a warning message
   */
  public warn(
    operation: DbOperation | string,
    message: string,
    data?: LogData,
    error?: unknown
  ): void {
    this.log(LogLevel.WARN, operation, message, data, error);
  }

  /**
   * Log an error message
   */
  public error(
    operation: DbOperation | string,
    message: string,
    data?: LogData,
    error?: unknown
  ): void {
    this.log(LogLevel.ERROR, operation, message, data, error);
  }

  /**
   * Get all logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs for a specific campaign
   */
  public getCampaignLogs(campaignId: number): LogEntry[] {
    return this.logs.filter(log => log.campaignId === campaignId);
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Enable or disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Enable or disable console output
   */
  public setLogToConsole(enabled: boolean): void {
    this.logToConsole = enabled;
  }

  /**
   * Enable or disable storage of logs
   */
  public setLogToStorage(enabled: boolean): void {
    this.logToStorage = enabled;
  }

  /**
   * Format error for logging
   */
  private formatError(error: unknown): FormattedError | null {
    if (!error) return null;

    // Initialize properties
    let message = 'Unknown error';
    let stack: string | undefined;
    let name: string | undefined;
    let code: string | number | undefined;

    // Attempt to extract properties safely from unknown type
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      name = error.name;
      // Attempt to get code if it exists (common in Node errors like ECONNREFUSED)
      if ('code' in error) {
        code = (error as { code?: string | number }).code;
      }
    } else if (typeof error === 'object' && error !== null) {
      // Handle plain objects that might represent errors
      message = (error as { message?: string }).message || JSON.stringify(error);
      stack = (error as { stack?: string }).stack;
      name = (error as { name?: string }).name;
      code = (error as { code?: string | number }).code;
    } else {
      // Handle primitives (string, number, etc.)
      message = String(error);
    }

    return { message, stack, name, code };
  }

  /**
   * Sanitize data for logging to remove sensitive information
   */
  private sanitizeData(data: unknown): unknown {
    if (!data) return null;

    // Deep clone to avoid modifying original data
    let clonedData: unknown;
    try {
      // Ensure deep cloning doesn't modify original object on failure
      try {
        clonedData = JSON.parse(JSON.stringify(data));
      } catch (_error) {
        // Renamed error to _error
        // Log the error using the logger, include context if available
        this.error(
          DbOperation.VALIDATION, // Assuming validation context if clone fails
          `Failed to deep clone data for sanitization`,
          { entityName: 'unknown', operation: 'clone' }, // Provide some context
          _error instanceof Error ? _error : new Error(String(_error))
        );
        // Return original data if cloning fails to avoid breaking flow
        console.warn(
          '[DbLogger] Warning: Failed to deep clone data for sanitization. Returning original data.'
        );
        return data;
      }
    } catch (error) {
      // Log the error using the logger, include context if available
      // Prefix error with _ if not used directly
      this.error(
        DbOperation.VALIDATION, // Assuming validation context if clone fails
        `Failed to deep clone data for sanitization`,
        { entityName: 'unknown', operation: 'clone' }, // Provide some context
        error instanceof Error ? error : new Error(String(error))
      );
      // Return original data if cloning fails to avoid breaking flow
      console.warn(
        '[DbLogger] Warning: Failed to deep clone data for sanitization. Returning original data.'
      );
      return data;
    }

    // List of sensitive fields to redact
    const sensitiveFields = [
      'password',
      'secret',
      'token',
      'key',
      'auth',
      'credential',
      'credit',
      'email',
      'phone',
      'address',
      'social',
      'ssn',
      'identifier',
    ];

    // Recursively sanitize the data
    const sanitize = (obj: unknown): unknown => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        // Ensure map result is unknown[]
        return obj.map(item => sanitize(item)); // No assertion needed, map preserves unknown
      }

      // Assert obj is a Record for safe iteration and access
      const recordObj = obj as Record<string, unknown>;
      const sanitized: Record<string, unknown> = {};

      for (const key in recordObj) {
        if (Object.prototype.hasOwnProperty.call(recordObj, key)) {
          const value = recordObj[key];
          // Check if this key contains sensitive information
          const isFieldSensitive = sensitiveFields.some(field =>
            key.toLowerCase().includes(field.toLowerCase())
          );

          if (isFieldSensitive) {
            // Redact sensitive fields but retain the type information (using unknown)
            sanitized[key] = '[REDACTED]'; // Simple redaction for unknown
          } else if (typeof value === 'object' && value !== null) {
            // Recursively sanitize nested objects
            sanitized[key] = sanitize(value);
          } else {
            // Keep non-sensitive fields as is
            sanitized[key] = value;
          }
        }
      }
      return sanitized;
    };

    return sanitize(clonedData);
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(log: LogEntry): void {
    const timestamp = log.timestamp.split('T')[1].split('.')[0]; // Extract time only
    const prefix = `[${timestamp}][${log.level}][${log.operation}]`;

    switch (log.level) {
      case LogLevel.DEBUG:
        console.debug(
          `${prefix} ${log.message}`,
          log.campaignId ? `(Campaign ID: ${log.campaignId})` : '',
          log.data ? log.data : ''
        );
        break;
      case LogLevel.INFO:
        console.info(
          `${prefix} ${log.message}`,
          log.campaignId ? `(Campaign ID: ${log.campaignId})` : '',
          log.data ? log.data : ''
        );
        break;
      case LogLevel.WARN:
        console.warn(
          `${prefix} ${log.message}`,
          log.campaignId ? `(Campaign ID: ${log.campaignId})` : '',
          log.data ? log.data : '',
          log.error ? log.error : ''
        );
        break;
      case LogLevel.ERROR:
        console.error(
          `${prefix} ${log.message}`,
          log.campaignId ? `(Campaign ID: ${log.campaignId})` : '',
          log.data ? log.data : '',
          log.error ? log.error : ''
        );
        break;
    }
  }

  /**
   * Store log entry in persistent storage
   * (currently just stores in localStorage, but could be expanded to use a backend service)
   */
  private storeLog(log: LogEntry): void {
    if (typeof window === 'undefined') return; // Skip if not in browser

    try {
      const storedLogs = localStorage.getItem('dbLogs');
      let logs: LogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];

      logs.push(log);

      // Keep only the latest 1000 logs
      if (logs.length > 1000) {
        logs = logs.slice(logs.length - 1000);
      }

      localStorage.setItem('dbLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }
}

// Create singleton instance
export const dbLogger = new DbLogger();

// Export as default
export default dbLogger;

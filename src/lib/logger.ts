/**
 * Application Logger
 * 
 * This module provides a consistent logging interface for the entire application.
 * It supports different log levels, structured logging, and can be configured
 * to output to different destinations (console, file, etc.).
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LoggerOptions {
  // Minimum level to log
  minLevel?: LogLevel;
  // Include timestamp in logs
  includeTimestamp?: boolean;
  // Include stack trace for errors
  includeStackTrace?: boolean;
  // Silent mode (no console output)
  silent?: boolean;
}

export type LogPayload = Record<string, unknown>;

/**
 * Logger class that provides consistent logging with different levels
 * and structured data capabilities.
 */
export class Logger {
  private options: LoggerOptions;
  
  constructor(options: LoggerOptions = {}) {
    this.options = {
      minLevel: LogLevel.INFO,
      includeTimestamp: true,
      includeStackTrace: true,
      silent: process.env.NODE_ENV === 'test',
      ...options
    };
  }
  
  /**
   * Log a debug message
   */
  debug(messageOrPayload: string | LogPayload, payload?: LogPayload): void {
    this.log(LogLevel.DEBUG, messageOrPayload, payload);
  }
  
  /**
   * Log an info message
   */
  info(messageOrPayload: string | LogPayload, payload?: LogPayload): void {
    this.log(LogLevel.INFO, messageOrPayload, payload);
  }
  
  /**
   * Log a warning message
   */
  warn(messageOrPayload: string | LogPayload, payload?: LogPayload): void {
    this.log(LogLevel.WARN, messageOrPayload, payload);
  }
  
  /**
   * Log an error message
   */
  error(messageOrPayload: string | LogPayload | Error, payload?: LogPayload): void {
    this.log(LogLevel.ERROR, messageOrPayload, payload);
  }
  
  /**
   * Generic log method that all other methods call
   */
  private log(level: LogLevel, messageOrPayload: string | LogPayload | Error, additionalPayload?: LogPayload): void {
    // Skip logging if level is below minimum
    if (!this.shouldLog(level)) {
      return;
    }
    
    let message: string;
    let payload: LogPayload = {};
    
    // Handle different input types
    if (typeof messageOrPayload === 'string') {
      message = messageOrPayload;
      payload = additionalPayload || {};
    } else if (messageOrPayload instanceof Error) {
      message = messageOrPayload.message;
      payload = {
        ...additionalPayload,
        name: messageOrPayload.name,
        ...(this.options.includeStackTrace && { stack: messageOrPayload.stack })
      };
    } else {
      message = messageOrPayload.message as string || 'Log entry';
      payload = { ...messageOrPayload };
      delete payload.message;
    }
    
    // Prepare log data
    const logData: LogPayload = {
      level,
      message,
      ...(this.options.includeTimestamp && { timestamp: new Date().toISOString() }),
      ...payload
    };
    
    // Output log if not in silent mode
    if (!this.options.silent) {
      this.output(level, logData);
    }
  }
  
  /**
   * Check if a log level should be logged based on the minimum level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minLevelIndex = levels.indexOf(this.options.minLevel || LogLevel.INFO);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= minLevelIndex;
  }
  
  /**
   * Output log data to the appropriate destination
   */
  private output(level: LogLevel, data: LogPayload): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(JSON.stringify(data, null, 2));
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(data, null, 2));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(data, null, 2));
        break;
      case LogLevel.ERROR:
        console.error(JSON.stringify(data, null, 2));
        break;
    }
  }
  
  /**
   * Create a child logger with some context pre-populated
   */
  child(context: LogPayload): Logger {
    const childLogger = new Logger(this.options);
    
    // Override log methods to include context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level: LogLevel, messageOrPayload: string | LogPayload | Error, additionalPayload?: LogPayload): void => {
      const mergedPayload = {
        ...context,
        ...(additionalPayload || {})
      };
      originalLog(level, messageOrPayload, mergedPayload);
    };
    
    return childLogger;
  }
}

// Create and export default logger instance
export const logger = new Logger();

// Export default for convenience
export default logger; 
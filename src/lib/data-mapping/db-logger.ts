/**
 * Database Operation Logger
 * Provides structured logging for database operations with a focus on data persistence
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Log entry structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  operation: string;
  campaignId?: number;
  data?: any;
  message: string;
  error?: any;
}

// Database operation types
export enum DbOperation {
  FETCH = 'FETCH',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  TRANSACTION = 'TRANSACTION',
  VALIDATION = 'VALIDATION'
}

// Type for log data that might contain a campaignId
interface LogData {
  [key: string]: any;
  campaignId?: any; // We'll handle type conversion internally
}

class DbLogger {
  private enabled: boolean = process.env.NODE_ENV !== 'production';
  private logToConsole: boolean = true;
  private logToStorage: boolean = false;
  private logs: LogEntry[] = [];
  private maxLogSize: number = 100;

  constructor() {
    // Initialize logger
    console.log('[DbLogger] Initialized in ' + process.env.NODE_ENV + ' mode');
  }

  /**
   * Log a database operation
   */
  public log(
    level: LogLevel,
    operation: DbOperation | string,
    message: string,
    data?: LogData,
    error?: any
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
      error: error ? this.formatError(error) : undefined
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
  public warn(operation: DbOperation | string, message: string, data?: LogData, error?: any): void {
    this.log(LogLevel.WARN, operation, message, data, error);
  }

  /**
   * Log an error message
   */
  public error(operation: DbOperation | string, message: string, data?: LogData, error?: any): void {
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
  private formatError(error: any): any {
    if (!error) return null;
    
    return {
      message: error.message || String(error),
      stack: error.stack,
      name: error.name,
      code: error.code
    };
  }

  /**
   * Sanitize data for logging to remove sensitive information
   */
  private sanitizeData(data: any): any {
    if (!data) return null;
    
    // Deep clone to avoid modifying original data
    let clonedData: any;
    try {
      clonedData = JSON.parse(JSON.stringify(data));
    } catch (e) {
      // If data can't be stringified (e.g., circular references),
      // create a simplified object with the keys
      clonedData = {};
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'function') {
          clonedData[key] = '[Function]';
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          clonedData[key] = '[Object]';
        } else {
          clonedData[key] = data[key];
        }
      });
    }
    
    // List of sensitive fields to redact
    const sensitiveFields = [
      'password', 'secret', 'token', 'key', 'auth', 'credential', 'credit',
      'email', 'phone', 'address', 'social', 'ssn', 'identifier'
    ];
    
    // Recursively sanitize the data
    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
      }
      
      const sanitized: any = {};
      
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // Check if this key contains sensitive information
          const isFieldSensitive = sensitiveFields.some(field => 
            key.toLowerCase().includes(field.toLowerCase())
          );
          
          if (isFieldSensitive) {
            // Redact sensitive fields but retain the type information
            if (typeof obj[key] === 'string') {
              sanitized[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'number') {
              sanitized[key] = 0;
            } else if (typeof obj[key] === 'boolean') {
              sanitized[key] = false;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              sanitized[key] = '[REDACTED_OBJECT]';
            } else {
              sanitized[key] = '[REDACTED]';
            }
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively sanitize nested objects
            sanitized[key] = sanitize(obj[key]);
          } else {
            // Keep non-sensitive fields as is
            sanitized[key] = obj[key];
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
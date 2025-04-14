 
/**
 * Simple Logger Utility
 * Controls log output based on NEXT_PUBLIC_LOG_LEVEL environment variable.
 * Levels: error (0), warn (1), info (2), debug (3)
 */

const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
} as const;

type LogLevelName = keyof typeof LOG_LEVELS;
type LogLevelNumber = typeof LOG_LEVELS[LogLevelName];

// Determine the current log level from environment variable
// Default to 'info' if not set or invalid
const getLogLevel = (): LogLevelNumber => {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevelName | undefined;
    if (envLevel && envLevel in LOG_LEVELS) {
        return LOG_LEVELS[envLevel];
    }
    // Default level for production might be 'warn' or 'error'
    // Defaulting to 'info' here for broader visibility unless explicitly set lower
    return process.env.NODE_ENV === 'production' ? LOG_LEVELS.warn : LOG_LEVELS.info;
};

const CURRENT_LOG_LEVEL: LogLevelNumber = getLogLevel();

/** Logs messages if current level is >= DEBUG */
const debug = (...args: any[]): void => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.debug) {
        console.debug("[DEBUG]", ...args);
    }
};

/** Logs messages if current level is >= INFO */
const info = (...args: any[]): void => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.info) {
        console.info("[INFO]", ...args);
    }
};

/** Logs messages if current level is >= WARN */
const warn = (...args: any[]): void => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.warn) {
        console.warn("[WARN]", ...args);
    }
};

/** Always logs error messages (level >= ERROR) */
const error = (...args: any[]): void => {
    // Errors are always logged regardless of level, but we check anyway for consistency
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.error) {
        console.error("[ERROR]", ...args);
    }
};

export const logger = {
    debug,
    info,
    warn,
    error,
}; 
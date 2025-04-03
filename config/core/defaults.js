/**
 * Default Configuration Values
 * 
 * This file contains default configuration values that can be overridden by
 * environment-specific configurations. These defaults represent the base state
 * of the application.
 */

import { LIMITS, FEATURES } from './constants.js';

/**
 * Default database configuration
 */
const DATABASE_DEFAULTS = {
  HOST: 'localhost',
  PORT: 5432,
  MAX_CONNECTIONS: 20,
  IDLE_TIMEOUT: 10000,
  CONNECTION_TIMEOUT: 5000,
  SSL: false,
};

/**
 * Default caching configuration
 */
const CACHE_DEFAULTS = {
  TTL: 300, // 5 minutes
  ENABLE_MEMORY_CACHE: true,
  ENABLE_REDIS_CACHE: false,
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
  CACHE_NULLS: false,
};

/**
 * Default logging configuration
 */
const LOGGING_DEFAULTS = {
  LEVEL: 'info',
  FORMAT: 'json',
  CONSOLE_LOGGING: true,
  FILE_LOGGING: false,
  ERROR_LOGGING: true,
  PERFORMANCE_LOGGING: false,
  QUERY_LOGGING: false,
  REDACT_SENSITIVE_DATA: true,
  INCLUDE_TIMESTAMPS: true,
};

/**
 * Default API configuration
 */
const API_DEFAULTS = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
  BATCH_SIZE: LIMITS.DEFAULT_PAGE_SIZE,
  RATE_LIMIT: {
    WINDOW: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
};

/**
 * Default UI/UX configuration
 */
const UI_DEFAULTS = {
  THEME: 'light',
  ANIMATION_SPEED: 'normal',
  ENABLE_SOUND: false,
  ENABLE_NOTIFICATIONS: true,
  DEFAULT_TIMEZONE: 'UTC',
  PAGINATION: {
    ITEMS_PER_PAGE: LIMITS.DEFAULT_PAGE_SIZE,
    SHOW_TOTAL: true,
    PAGINATION_RANGE: 5,
  },
};

/**
 * Default feature flag values
 * These can be overridden by environment-specific configurations
 */
const FEATURE_DEFAULTS = {
  ...FEATURES,
  ENABLE_BETA_FEATURES: false,
  ENABLE_EXPERIMENTAL: false,
  ENABLE_DEV_TOOLS: false,
  ENABLE_PERFORMANCE_MONITORING: true,
};

/**
 * Default error handling configuration
 */
const ERROR_HANDLING_DEFAULTS = {
  SHOW_DETAILED_ERRORS: false,
  LOG_CLIENT_ERRORS: true,
  AUTO_RETRY_OPERATIONS: true,
  MAX_ERROR_DEPTH: 3,
};

export {
  DATABASE_DEFAULTS,
  CACHE_DEFAULTS,
  LOGGING_DEFAULTS,
  API_DEFAULTS,
  UI_DEFAULTS,
  FEATURE_DEFAULTS,
  ERROR_HANDLING_DEFAULTS,
}; 
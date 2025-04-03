/**
 * Production Environment Configuration
 * 
 * Configuration overrides specific to the production environment.
 * Security sensitive values should be loaded from environment variables.
 */

import { 
  DATABASE_DEFAULTS, 
  LOGGING_DEFAULTS, 
  ERROR_HANDLING_DEFAULTS,
  FEATURE_DEFAULTS,
  CACHE_DEFAULTS
} from '../core/defaults.js';

/**
 * Production database configuration
 */
export const DATABASE = {
  ...DATABASE_DEFAULTS,
  HOST: process.env.DB_HOST,
  PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DATABASE: process.env.DB_NAME,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  SSL: true,
  MAX_CONNECTIONS: 50,
  CONNECTION_TIMEOUT: 10000,
};

/**
 * Production logging configuration
 */
export const LOGGING = {
  ...LOGGING_DEFAULTS,
  LEVEL: 'warn',
  FILE_LOGGING: true,
  CONSOLE_LOGGING: false,
  PERFORMANCE_LOGGING: true,
  LOG_TO_SERVICE: true,
  SERVICE_ENDPOINT: process.env.LOGGING_ENDPOINT,
};

/**
 * Production error handling configuration
 */
export const ERROR_HANDLING = {
  ...ERROR_HANDLING_DEFAULTS,
  LOG_CLIENT_ERRORS: true,
  REPORT_ERRORS: true,
  ERROR_REPORTING_SERVICE: process.env.ERROR_REPORTING_SERVICE,
};

/**
 * Production caching configuration
 */
export const CACHE = {
  ...CACHE_DEFAULTS,
  ENABLE_REDIS_CACHE: true,
  REDIS_URL: process.env.REDIS_URL,
  TTL: 3600, // 1 hour
};

/**
 * Production feature flags
 */
export const FEATURES = {
  ...FEATURE_DEFAULTS,
  ENABLE_DEV_TOOLS: false,
  ENABLE_EXPERIMENTAL: false,
  ENABLE_SERVICE_WORKER: true,
};

/**
 * Production specific API configuration
 */
export const API = {
  BASE_URL: process.env.API_BASE_URL,
  TIMEOUT: 60000, // 60 seconds
};

/**
 * Production specific server configuration
 */
export const SERVER = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: '0.0.0.0',
  HTTPS: true,
  TRUST_PROXY: true,
};

/**
 * Production security configuration
 */
export const SECURITY = {
  HSTS_MAX_AGE: 63072000, // 2 years
  ENABLE_CSP: true,
  ENABLE_RATE_LIMITING: true,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
};

/**
 * Export the full production environment configuration
 */
export default {
  ENV: 'production',
  DATABASE,
  LOGGING,
  ERROR_HANDLING,
  CACHE,
  FEATURES,
  API,
  SERVER,
  SECURITY,
}; 
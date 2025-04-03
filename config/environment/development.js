/**
 * Development Environment Configuration
 * 
 * Configuration overrides specific to the development environment.
 */

import { 
  DATABASE_DEFAULTS, 
  LOGGING_DEFAULTS, 
  ERROR_HANDLING_DEFAULTS,
  FEATURE_DEFAULTS
} from '../core/defaults.js';

/**
 * Development database configuration
 */
export const DATABASE = {
  ...DATABASE_DEFAULTS,
  DATABASE: 'my_project_dev',
  USER: 'dev_user',
  PASSWORD: 'dev_password',
};

/**
 * Development logging configuration
 */
export const LOGGING = {
  ...LOGGING_DEFAULTS,
  LEVEL: 'debug',
  QUERY_LOGGING: true,
  PERFORMANCE_LOGGING: true,
};

/**
 * Development error handling configuration
 */
export const ERROR_HANDLING = {
  ...ERROR_HANDLING_DEFAULTS,
  SHOW_DETAILED_ERRORS: true,
};

/**
 * Development feature flags
 */
export const FEATURES = {
  ...FEATURE_DEFAULTS,
  ENABLE_DEV_TOOLS: true,
  ENABLE_HOT_RELOADING: true,
  ENABLE_MOCK_API: true,
};

/**
 * Development specific API configuration
 */
export const API = {
  BASE_URL: 'http://localhost:3000/api',
  MOCK_DELAY: 500, // ms delay for mock API responses
};

/**
 * Development specific server configuration
 */
export const SERVER = {
  PORT: 3000,
  HOST: 'localhost',
  HTTPS: false,
};

/**
 * Export the full development environment configuration
 */
export default {
  ENV: 'development',
  DATABASE,
  LOGGING,
  ERROR_HANDLING,
  FEATURES,
  API,
  SERVER,
}; 
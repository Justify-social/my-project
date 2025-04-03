/**
 * Testing Environment Configuration
 * 
 * Configuration overrides specific to the testing environment.
 */

import { 
  DATABASE_DEFAULTS, 
  LOGGING_DEFAULTS, 
  ERROR_HANDLING_DEFAULTS,
  FEATURE_DEFAULTS
} from '../core/defaults.js';

/**
 * Testing database configuration
 */
export const DATABASE = {
  ...DATABASE_DEFAULTS,
  DATABASE: 'my_project_test',
  USER: 'test_user',
  PASSWORD: 'test_password',
};

/**
 * Testing logging configuration
 */
export const LOGGING = {
  ...LOGGING_DEFAULTS,
  LEVEL: 'error',
  CONSOLE_LOGGING: false,
  FILE_LOGGING: true,
  LOG_TO_FILE: './logs/test.log',
};

/**
 * Testing error handling configuration
 */
export const ERROR_HANDLING = {
  ...ERROR_HANDLING_DEFAULTS,
  THROW_ON_ERROR: true, // Ensures tests fail fast when errors occur
};

/**
 * Testing feature flags
 */
export const FEATURES = {
  ...FEATURE_DEFAULTS,
  ENABLE_DEV_TOOLS: false,
  ENABLE_MOCK_API: true,
  ENABLE_SERVICE_WORKER: false,
};

/**
 * Testing specific API configuration
 */
export const API = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 5000, // 5 seconds - fast timeouts for tests
  USE_MOCKS: true,
};

/**
 * Testing specific server configuration
 */
export const SERVER = {
  PORT: 3001,
  HOST: 'localhost',
  HTTPS: false,
};

/**
 * Testing specific timeouts
 */
export const TIMEOUTS = {
  DEFAULT_TEST_TIMEOUT: 5000, // 5 seconds
  API_CALL_TIMEOUT: 1000, // 1 second
  ANIMATION_SPEED: 0, // Disable animations in tests
};

/**
 * Export the full testing environment configuration
 */
export default {
  ENV: 'testing',
  DATABASE,
  LOGGING,
  ERROR_HANDLING,
  FEATURES,
  API,
  SERVER,
  TIMEOUTS,
}; 
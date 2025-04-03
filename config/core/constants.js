/**
 * Core Application Constants
 * 
 * This file defines application-wide constants that are used throughout the system.
 * These values are considered static and shouldn't change between environments.
 */

/**
 * Application metadata constants
 */
const APP_METADATA = {
  NAME: 'MyProject',
  VERSION: process.env.npm_package_version || '1.0.0',
  DESCRIPTION: 'Enterprise Next.js Application',
  REPOSITORY: 'https://github.com/organization/my-project',
};

/**
 * Formatting and display constants
 */
const FORMAT_CONSTANTS = {
  DATE_FORMAT: 'yyyy-MM-dd',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  CURRENCY: 'USD',
  DEFAULT_LOCALE: 'en-US',
  SUPPORTED_LOCALES: ['en-US', 'es-ES', 'fr-FR'],
};

/**
 * Application limits and thresholds
 */
const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_UPLOAD_COUNT: 10,
  MAX_BATCH_SIZE: 100,
  MAX_QUERY_ITEMS: 500,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

/**
 * Directory and path constants
 */
const PATHS = {
  PUBLIC_DIR: './public',
  STATIC_ASSETS: './public/static',
  TEMP_DIR: './tmp',
  LOG_DIR: './logs',
};

/**
 * Feature flags and capabilities
 * This section defines stable feature flags that are available across all environments
 * Environment-specific feature flags should be in the environment files
 */
const FEATURES = {
  ENABLE_SSR: true,
  ENABLE_ANALYTICS: true,
  ENABLE_SERVICE_WORKER: true,
};

/**
 * Authentication and security constants
 */
const SECURITY = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  CSRF_PROTECTION: true,
};

export {
  APP_METADATA,
  FORMAT_CONSTANTS,
  LIMITS,
  PATHS,
  FEATURES,
  SECURITY,
}; 
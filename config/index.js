/**
 * Configuration System
 * 
 * This is the main entry point for the application configuration.
 * It loads the appropriate environment configuration and applies defaults.
 */

import { mergeConfigurations, validateConfiguration } from './utils.js';

// Import environment configurations
import developmentConfig from './environment/development.js';
import productionConfig from './environment/production.js';
import testingConfig from './environment/testing.js';

// Import core configuration
import * as constants from './core/constants.js';

/**
 * Determine the current environment
 * Priority: 
 * 1. Environment variable 
 * 2. NODE_ENV 
 * 3. Default to development
 */
const ENV = process.env.APP_ENV || process.env.NODE_ENV || 'development';

/**
 * Get the appropriate environment configuration
 */
function getEnvironmentConfig(env) {
  switch (env.toLowerCase()) {
    case 'production':
    case 'prod':
      return productionConfig;
    case 'test':
    case 'testing':
      return testingConfig;
    case 'development':
    case 'dev':
    default:
      return developmentConfig;
  }
}

/**
 * Create the final configuration object
 */
const environmentConfig = getEnvironmentConfig(ENV);

/**
 * Compose the final configuration
 */
const config = {
  // Include environment name for reference
  ENV,
  
  // Include core constants
  ...constants,
  
  // Include environment-specific configuration
  ...environmentConfig,
  
  // Add configuration system metadata
  _meta: {
    generatedAt: new Date().toISOString(),
    environment: ENV,
    version: '1.0.0',
  }
};

/**
 * Configuration schema for validation
 * This is a simple schema that checks required top-level properties
 */
const configSchema = {
  type: 'object',
  required: ['ENV', 'APP_METADATA', 'FEATURES'],
  properties: {
    ENV: { type: 'string' },
    APP_METADATA: {
      type: 'object',
      required: ['NAME', 'VERSION'],
      properties: {
        NAME: { type: 'string' },
        VERSION: { type: 'string' },
      }
    },
    FEATURES: { type: 'object' },
    DATABASE: { type: 'object' },
    LOGGING: { type: 'object' },
    API: { type: 'object' },
    SERVER: { type: 'object' },
  }
};

/**
 * Validate the configuration
 */
const validationResult = validateConfiguration(config, configSchema);

if (!validationResult.isValid) {
  console.error('Configuration validation failed:');
  validationResult.errors.forEach(error => console.error(`- ${error}`));
  
  if (ENV === 'production') {
    throw new Error('Invalid configuration in production environment');
  }
}

/**
 * Export the configuration
 */
export default config;

/**
 * Export individual configuration sections for convenience
 */
export const {
  APP_METADATA,
  FORMAT_CONSTANTS,
  LIMITS,
  PATHS,
  FEATURES,
  SECURITY,
  DATABASE,
  LOGGING,
  ERROR_HANDLING,
  API,
  SERVER
} = config; 
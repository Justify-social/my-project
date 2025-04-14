/**
 * Application Configuration Entrypoint
 *
 * This file exports the central configuration system to be used throughout
 * the application. It's the single entry point for all configuration needs.
 *
 * Import from this file instead of directly accessing the config system:
 * import { config } from '@/config';
 */

import config from '../config/index.js';

// Export the entire configuration object
export { config };

// Named exports for commonly used configuration sections
export const {
  appName,
  appVersion,
  environment,
  database,
  logging,
  errorHandling,
  features,
  api,
  server,
  security,
} = config;

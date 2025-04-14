/**
 * Next.js Webpack Configuration Module
 *
 * This module contains the webpack-specific configuration for Next.js.
 */

/**
 * Webpack configuration for Next.js
 * @param {Object} config - The existing webpack configuration
 * @param {Object} options - Next.js webpack options (isServer, dev, buildId, etc.)
 * @returns {Object} - The modified webpack configuration
 */
function configureWebpack(config, options) {
  const { isServer, dev } = options;

  // Development-specific configuration
  if (dev) {
    // Add development-specific webpack plugins or settings
    // Removed devtool setting as Next.js handles it and warns against overrides
    // config.devtool = 'eval-source-map';
  } else {
    // Production optimizations
    config.optimization = {
      ...config.optimization,
      minimize: true,
      // Additional optimization options can be added here
    };
  }

  return config;
}

/**
 * Export the webpack configuration module
 */
module.exports = {
  webpack: configureWebpack,
};

/**
 * Next.js Platform Configuration
 * 
 * This file composes all Next.js specific configurations from modules
 * into a single configuration object that can be used by next.config.js
 */

// Use require() for CommonJS compatibility
const { webpack: configureWebpack } = require('./module/webpack.js');
const { images: imagesConfig } = require('./module/images.js');
const pathsConfig = require('./module/paths.js');
const { mergeConfigurations } = require('../../utils.js');

/**
 * Base Next.js configuration
 */
const baseNextConfig = {
  // Basic settings
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: '.next',

  // Include images config directly in base as it's not a function
  images: imagesConfig,

  // ESLint and TypeScript settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
};

/**
 * Configuration parts that need merging or special handling
 * Webpack config is a function, Paths config has webpack function and experimental part
 */
const mergeableConfigs = {
  // Webpack function needs to be applied later
  webpack: configureWebpack,

  // Paths config structure needs careful merging
  experimental: pathsConfig.experimental,
  // We'll manually apply the webpack part of pathsConfig later
};

// Create the final config object
// Start with base config (which already includes images)
const finalNextConfig = { ...baseNextConfig };

// Apply the webpack configuration function
if (mergeableConfigs.webpack) {
  const originalWebpack = finalNextConfig.webpack || ((config) => config);
  finalNextConfig.webpack = (config, options) => {
    // First apply the webpack part from pathsConfig
    const configWithPathAliases = pathsConfig.webpack(config, options);
    // Then apply the main custom webpack config
    return mergeableConfigs.webpack(configWithPathAliases, options);
  };
}

// Apply experimental config from paths
if (mergeableConfigs.experimental) {
  finalNextConfig.experimental = {
    ...finalNextConfig.experimental,
    ...mergeableConfigs.experimental,
  };
}

// Use module.exports for CommonJS
module.exports = finalNextConfig; 
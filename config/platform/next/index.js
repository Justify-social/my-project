/**
 * Next.js Platform Configuration
 * 
 * This file composes all Next.js specific configurations from modules
 * into a single configuration object that can be used by next.config.js
 */

const webpackConfig = require('./module/webpack.js');
const imagesConfig = require('./module/images.js');
const pathsConfig = require('./module/paths.js');
const { mergeConfigurations } = require('../../utils.js');

/**
 * Base Next.js configuration
 */
const baseNextConfig = {
  // Next.js production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Error handling
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Output configuration
  distDir: '.next',
  
  // Misc options
  eslint: {
    ignoreDuringBuilds: true, // We run this in a separate step
  },
  typescript: {
    ignoreBuildErrors: false, // Never ignore TS errors
    tsconfigPath: './tsconfig.json',
  },
  
  // Analytics and telemetry
  analyticsId: process.env.NEXT_TELEMETRY_DISABLED ? null : process.env.NEXT_PUBLIC_ANALYTICS_ID,
};

/**
 * Compose the final Next.js configuration by merging all module configurations
 */
const nextConfig = mergeConfigurations(
  baseNextConfig,
  webpackConfig,
  imagesConfig,
  pathsConfig
);

module.exports = nextConfig; 
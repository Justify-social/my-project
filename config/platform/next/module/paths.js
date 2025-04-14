/**
 * Next.js Path Aliases Configuration Module
 *
 * This module contains the path alias configuration for Next.js.
 * These aliases are used to simplify imports throughout the application.
 */

const path = require('path');

// Base directory - paths should be relative to project root
const ROOT_DIR = process.cwd();

/**
 * Path aliases for the application
 * These must match the paths in tsconfig.json
 */
const pathAliases = {
  // Component aliases
  '@/components': path.join(ROOT_DIR, 'src/components'),
  '@/components/ui': path.join(ROOT_DIR, 'src/components/ui'),
  '@/components/ui/accordion': path.join(ROOT_DIR, 'src/components/ui/molecules/accordion'),
  '@/components/ui/alert': path.join(ROOT_DIR, 'src/components/ui/molecules/feedback/alert'),
  '@/components/ui/badge': path.join(ROOT_DIR, 'src/components/ui/atoms/badge'),
  '@/components/ui/button': path.join(ROOT_DIR, 'src/components/ui/atoms/button'),
  '@/components/ui/card': path.join(ROOT_DIR, 'src/components/ui/atoms/card'),
  '@/components/ui/input': path.join(ROOT_DIR, 'src/components/ui/atoms/input'),
  '@/components/ui/label': path.join(ROOT_DIR, 'src/components/ui/atoms/label'),
  '@/components/ui/scroll-area': path.join(ROOT_DIR, 'src/components/ui/molecules/scroll-area'),
  '@/components/ui/select': path.join(ROOT_DIR, 'src/components/ui/molecules/select'),
  '@/components/ui/slider': path.join(ROOT_DIR, 'src/components/ui/atoms/slider'),
  '@/components/ui/switch': path.join(ROOT_DIR, 'src/components/ui/atoms/switch'),
  '@/components/ui/tabs': path.join(ROOT_DIR, 'src/components/ui/molecules/tabs'),

  // Shared code and utilities
  '@/lib': path.join(ROOT_DIR, 'src/lib'),
  '@/lib/types': path.join(ROOT_DIR, 'src/lib/types'),
  '@/lib/types/component-registry': path.join(ROOT_DIR, 'src/lib/types/component-registry'),
  '@/lib/server': path.join(ROOT_DIR, 'src/lib/server'),
  '@/lib/server/component-registry': path.join(ROOT_DIR, 'src/lib/server/component-registry'),
  '@/utils': path.join(ROOT_DIR, 'src/utils'),
  '@/hooks': path.join(ROOT_DIR, 'src/hooks'),
  '@/api': path.join(ROOT_DIR, 'src/api'),
  '@/constants': path.join(ROOT_DIR, 'src/constants'),

  // Application areas
  '@/app': path.join(ROOT_DIR, 'src/app'),
  '@/pages': path.join(ROOT_DIR, 'src/pages'),
  '@/styles': path.join(ROOT_DIR, 'src/styles'),
  '@/public': path.join(ROOT_DIR, 'public'),

  // Configuration
  '@/config': path.join(ROOT_DIR, 'config'),

  // Root level imports
  '@': path.join(ROOT_DIR, 'src'),
};

/**
 * Export the path aliases configuration
 */
const pathsConfig = {
  // Turbo setting to address Webpack/Turbopack warning
  experimental: {
    turbo: {
      resolveAlias: pathAliases,
    },
  },
  webpack: config => {
    // Apply aliases to webpack config if it exists
    if (config.resolve && config.resolve.alias) {
      Object.assign(config.resolve.alias, pathAliases);
    }
    return config;
  },
};

module.exports = pathsConfig;

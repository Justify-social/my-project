// This file is a redirect to the configuration in config/next/
// For backward compatibility
const baseConfig = require('./config/next/next.config.js');
const path = require('path');
const ComponentRegistryPlugin = require('./scripts/plugins/ComponentRegistryPlugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...baseConfig, // Inherit all settings from the base config
  
  // Override or extend settings as needed
  images: {
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      // Include any other domains from base config if needed
      ...(baseConfig.images?.remotePatterns || [])
    ],
  },
  
  webpack: (config, { dev, isServer, buildId, webpack }) => {
    // Apply base webpack config if it exists
    if (baseConfig.webpack) {
      config = baseConfig.webpack(config, { isServer });
    }
    
    // Polyfill Node.js modules
    if (!isServer) {
      // Handle Node.js modules when running in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false
      };
    }
    
    // Fix DEP_WEBPACK_COMPILATION_ASSETS deprecation warning
    // by handling asset modifications in the proper stage
    
    class AssetsProcessPlugin {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap('AssetsProcessPlugin', (compilation) => {
          // Use the proper stage for asset modifications
          compilation.hooks.processAssets.tap(
            {
              name: 'AssetsProcessPlugin',
              // Use one of the following stages depending on when you need to modify assets
              stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS, // for adding assets
              // Other stages: PROCESS_ASSETS_STAGE_DEV_TOOLING, PROCESS_ASSETS_STAGE_OPTIMIZE,
              // PROCESS_ASSETS_STAGE_OPTIMIZE_HASH, PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
              // PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE, PROCESS_ASSETS_STAGE_SUMMARIZE, PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY
            },
            (assets) => {
              // Your asset modifications can go here
              // This replaces direct modifications to compilation.assets
            }
          );
        });
      }
    }
    
    // Add the plugin to webpack
    config.plugins.push(new AssetsProcessPlugin());
    
    // Handle Node.js module polyfills for client-side
    if (!isServer) {
      // Properly handle all Node.js built-in modules for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        'fs/promises': false,
        stream: false,
        util: false,
        buffer: false,
        crypto: false,
        'node:fs': false,
        'node:fs/promises': false,
        'node:path': false,
        'node:os': false,
        'node:util': false,
        'node:stream': false,
        'node:buffer': false,
        'node:crypto': false,
        'node:url': false,
        'node:process': false,
      };
      
      // Mark Node.js modules as external to prevent them from being bundled
      config.externals = [
        ...(config.externals || []),
        { 'better-sqlite3': 'better-sqlite3' },
        'chokidar',
        'bindings',
        'node:fs/promises',
        'path-scurry',
        'glob',
        'minimatch',
        // Fix for syntax errors - change how we handle Babel parser externals
        function({ context, request }, callback) {
          if (request === '@babel/parser' || 
              request === '@babel/traverse' || 
              request === '@babel/types') {
            // Tell webpack to treat it as an external
            return callback(null, 'commonjs ' + request);
          }
          callback();
        }
      ];
      
      // Add a dummy global for process.cwd() in the browser
      // Use the webpack parameter directly instead of importing it
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.cwd': () => '""',
        })
      );
    }
    
    // Apply the ComponentRegistryPlugin for both development and production
    if (!isServer) {
      // Configure based on environment
      const pluginOptions = {
        componentPaths: ['./src/components/ui'],
        outputPath: './public/static/component-registry.json',
        cache: true,                      // Enable caching for better performance
        logLevel: dev ? 'verbose' : 'info', // More logging in development
      };
      
      // Add development-specific options
      if (dev) {
        // Development mode: Include incremental/watch features
        Object.assign(pluginOptions, {
          incremental: true,              // Enable incremental mode in development
          watch: true,                    // Enable file watching in development
        });
        console.info('Added ComponentRegistryPlugin to webpack development build with incremental updates');
      } else {
        // Production mode: Include optimizations
        Object.assign(pluginOptions, {
          minify: true,                   // Minify output in production
          buildId: buildId || undefined,  // Use buildId for versioning in production
        });
        console.info('Added ComponentRegistryPlugin to webpack production build with optimizations');
      }
      
      // Add the plugin to webpack
      config.plugins.push(new ComponentRegistryPlugin(pluginOptions));
    }
    
    // Add aliases for both webpack and turbo
    const uiAliases = {
      '@/components/ui/accordion': path.join(__dirname, 'src/components/ui/molecules/accordion'),
      '@/components/ui/alert': path.join(__dirname, 'src/components/ui/molecules/feedback/alert'),
      '@/components/ui/assets': path.join(__dirname, 'src/components/ui/atoms/assets'),
      '@/components/ui/badge': path.join(__dirname, 'src/components/ui/atoms/badge'),
      '@/components/ui/button': path.join(__dirname, 'src/components/ui/atoms/button'),
      '@/components/ui/card': path.join(__dirname, 'src/components/ui/atoms/card'),
      '@/components/ui/Card': path.join(__dirname, 'src/components/ui/atoms/card'), // Add case-sensitive alias
      '@/components/ui/input': path.join(__dirname, 'src/components/ui/atoms/input'),
      '@/components/ui/label': path.join(__dirname, 'src/components/ui/atoms/label'),
      '@/components/ui/scroll-area': path.join(__dirname, 'src/components/ui/molecules/scroll-area'),
      '@/components/ui/select': path.join(__dirname, 'src/components/ui/molecules/select'),
      '@/components/ui/skeleton': path.join(__dirname, 'src/components/ui/molecules/skeleton'),
      '@/components/ui/slider': path.join(__dirname, 'src/components/ui/atoms/slider'),
      '@/components/ui/spinner': path.join(__dirname, 'src/components/ui/atoms/spinner'),
      '@/components/ui/switch': path.join(__dirname, 'src/components/ui/atoms/switch'),
      '@/components/ui/tabs': path.join(__dirname, 'src/components/ui/molecules/tabs'),
    };
    
    // Add aliases to webpack config
    if (config.resolve && config.resolve.alias) {
      Object.assign(config.resolve.alias, uiAliases);
    }
    
    return config;
  },
  
  // TurboSetting to address Webpack/Turbopack warning
  experimental: {
    turbo: {
      resolveAlias: {
        // Fixed path resolution for Turbopack using relative paths
        '@/components/ui/accordion': path.join(__dirname, 'src/components/ui/molecules/accordion'),
        '@/components/ui/alert': path.join(__dirname, 'src/components/ui/molecules/feedback/alert'),
        '@/components/ui/assets': path.join(__dirname, 'src/components/ui/atoms/assets'),
        '@/components/ui/badge': path.join(__dirname, 'src/components/ui/atoms/badge'),
        '@/components/ui/button': path.join(__dirname, 'src/components/ui/atoms/button'),
        '@/components/ui/card': path.join(__dirname, 'src/components/ui/atoms/card'),
        '@/components/ui/Card': path.join(__dirname, 'src/components/ui/atoms/card'), // Add case-sensitive alias
        '@/components/ui/input': path.join(__dirname, 'src/components/ui/atoms/input'),
        '@/components/ui/label': path.join(__dirname, 'src/components/ui/atoms/label'),
        '@/components/ui/scroll-area': path.join(__dirname, 'src/components/ui/molecules/scroll-area'),
        '@/components/ui/select': path.join(__dirname, 'src/components/ui/molecules/select'),
        '@/components/ui/skeleton': path.join(__dirname, 'src/components/ui/molecules/skeleton'),
        '@/components/ui/slider': path.join(__dirname, 'src/components/ui/atoms/slider'),
        '@/components/ui/spinner': path.join(__dirname, 'src/components/ui/atoms/spinner'),
        '@/components/ui/switch': path.join(__dirname, 'src/components/ui/atoms/switch'),
        '@/components/ui/tabs': path.join(__dirname, 'src/components/ui/molecules/tabs'),
        ...(baseConfig.experimental?.turbo?.resolveAlias || {})
      },
      rules: {
        // Add custom rules for Turbopack if needed
        ...(baseConfig.experimental?.turbo?.rules || {})
      },
    },
  },
  
  // Add runtime configuration for static file paths
  publicRuntimeConfig: {
    staticFolder: '/static',
    componentRegistry: '/static/component-registry.json',
    iconRegistry: '/static/icon-registry.json'
  },
};

module.exports = nextConfig;
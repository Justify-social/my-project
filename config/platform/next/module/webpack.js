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
  
  // Add support for "use server" directive in server components
  if (isServer) {
    // Ensure server files are properly processed
    config.externals = config.externals.map((external) => {
      if (typeof external !== 'function') return external;
      return (ctx, req, cb) => {
        // Don't externalize internal server modules marked with 'use server'
        if (req.includes('?use-server')) {
          return cb();
        }
        return external(ctx, req, cb);
      };
    });
  }
  
  // Handle Node.js modules when running in the browser
  if (!isServer) {
    // Use the resolve.fallback option to provide polyfills or empty modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      'fs/promises': false,
      'node:fs': false,
      'node:path': false,
      'node:os': false,
      'node:crypto': false,
      'node:stream': false,
      'node:http': false,
      'node:https': false,
      'node:zlib': false,
      'node:fs/promises': false,
      '@babel/parser': false,
      '@babel/traverse': false,
      '@babel/types': false,
      glob: false,
    };
    
    // Ignore server-only modules to prevent client-side errors
    config.externals = [
      ...(config.externals || []),
      { 'better-sqlite3': 'better-sqlite3' },
      'chokidar',
      'bindings',
      'path-scurry',
      'glob',
      'minimatch',
      '@babel/parser',
      '@babel/traverse',
      '@babel/types',
    ];
  }
  
  // Development-specific configuration
  if (dev) {
    // Add development-specific webpack plugins or settings
    config.devtool = 'eval-source-map';
    
    // Add processing for "use server" directive in development
    config.module = config.module || { rules: [] };
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'],
            plugins: [
              // This helps process "use server" directives
              function handleServerDirectives() {
                return {
                  visitor: {
                    Program(path) {
                      const serverDirective = path.node.directives
                        ?.find(directive => directive.value.value === 'use server');
                      
                      if (serverDirective && !isServer) {
                        // Add server directive marker for client-side code
                        path.unshiftContainer('body', {
                          type: 'ExpressionStatement',
                          expression: {
                            type: 'StringLiteral',
                            value: 'use server directive detected - this should only run on server'
                          }
                        });
                      }
                    }
                  }
                };
              }
            ]
          }
        }
      ]
    });
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
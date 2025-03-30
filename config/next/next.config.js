// This file contains the Next.js configuration
// Remove the circular reference

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com']
  },
  // Webpack configuration to handle Node.js modules in browser
  webpack: (config, { isServer }) => {
    // Handle Node.js modules when running in the browser
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
      };
      
      // Mark Node.js modules as external to prevent them from being bundled
      config.externals = [
        ...(config.externals || []),
        { 'better-sqlite3': 'better-sqlite3' },
        'chokidar',
        'bindings',
        'node:fs/promises',
      ];
    }
    
    // Add path alias resolution for UI components
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components/ui/accordion': path.resolve(__dirname, '../../src/components/ui/molecules/accordion'),
      '@/components/ui/alert': path.resolve(__dirname, '../../src/components/ui/molecules/feedback/alert'),
      '@/components/ui/badge': path.resolve(__dirname, '../../src/components/ui/atoms/badge'),
      '@/components/ui/button': path.resolve(__dirname, '../../src/components/ui/atoms/button'),
      '@/components/ui/card': path.resolve(__dirname, '../../src/components/ui/atoms/card'),
      '@/components/ui/input': path.resolve(__dirname, '../../src/components/ui/atoms/input'),
      '@/components/ui/label': path.resolve(__dirname, '../../src/components/ui/atoms/label'),
      '@/components/ui/scroll-area': path.resolve(__dirname, '../../src/components/ui/molecules/scroll-area'),
      '@/components/ui/select': path.resolve(__dirname, '../../src/components/ui/molecules/select'),
      '@/components/ui/slider': path.resolve(__dirname, '../../src/components/ui/atoms/slider'),
      '@/components/ui/spinner': path.resolve(__dirname, '../../src/components/ui/atoms/spinner'),
      '@/components/ui/switch': path.resolve(__dirname, '../../src/components/ui/atoms/switch'),
      '@/components/ui/tabs': path.resolve(__dirname, '../../src/components/ui/molecules/tabs'),
    };
    
    return config;
  },
  
  // TurboSetting to address Webpack/Turbopack warning
  experimental: {
    turbo: {
      resolveAlias: {
        // Mirror the webpack aliases for Turbopack
        '@/components/ui/accordion': path.resolve(__dirname, '../../src/components/ui/molecules/accordion'),
        '@/components/ui/alert': path.resolve(__dirname, '../../src/components/ui/molecules/feedback/alert'),
        '@/components/ui/badge': path.resolve(__dirname, '../../src/components/ui/atoms/badge'),
        '@/components/ui/button': path.resolve(__dirname, '../../src/components/ui/atoms/button'),
        '@/components/ui/card': path.resolve(__dirname, '../../src/components/ui/atoms/card'),
        '@/components/ui/input': path.resolve(__dirname, '../../src/components/ui/atoms/input'),
        '@/components/ui/label': path.resolve(__dirname, '../../src/components/ui/atoms/label'),
        '@/components/ui/scroll-area': path.resolve(__dirname, '../../src/components/ui/molecules/scroll-area'),
        '@/components/ui/select': path.resolve(__dirname, '../../src/components/ui/molecules/select'),
        '@/components/ui/slider': path.resolve(__dirname, '../../src/components/ui/atoms/slider'),
        '@/components/ui/spinner': path.resolve(__dirname, '../../src/components/ui/atoms/spinner'),
        '@/components/ui/switch': path.resolve(__dirname, '../../src/components/ui/atoms/switch'),
        '@/components/ui/tabs': path.resolve(__dirname, '../../src/components/ui/molecules/tabs'),
      }
    }
  }
};

module.exports = nextConfig;
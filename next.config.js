/**
 * Next.js Configuration
 *
 * This file contains the configuration for Next.js.
 */

module.exports = {
  // Basic settings
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: '.next',

  // Add redirects function
  async redirects() {
    return [
      {
        source: '/billing',
        destination: '/account/billing',
        permanent: true, // Use true for permanent redirects (308)
      },
    ];
  },

  // Images config
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all hosts - you can restrict this to specific domains
      },
    ],
  },

  // ESLint and TypeScript settings
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // Experimental features
  experimental: {
    // Enable Turbopack for faster builds (experimental). Remove or comment out this line if issues arise.
    // turbopack: {
    //   logLevel: 'error',
    // },
  },
};

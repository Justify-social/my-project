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

  // Security headers following OWASP best practices
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.clerk.accounts.dev https://*.clerk.dev https://challenges.cloudflare.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.clerk.dev https://*.clerk.accounts.dev https://clerk.dev https://*.vercel.live https://vercel.live wss://*.pusher.com wss://ws.pusher.com https://vitals.vercel-insights.com https://api.insightiq.ai https://api.mux.com https://api.ipgeolocation.io https://api.giphy.com https://inferred.litix.io https://clerk-telemetry.com https://stream.mux.com https://api.sandbox.insightiq.ai",
              "media-src 'self' blob: https: https://stream.mux.com",
              "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          // Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy (Feature Policy)
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'payment=()',
              'usb=()',
            ].join(', '),
          },
          // Cross-Origin Embedder Policy
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          // Cross-Origin Opener Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          // Cross-Origin Resource Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // Origin-Agent-Cluster
          {
            key: 'Origin-Agent-Cluster',
            value: '?1',
          },
          // X-DNS-Prefetch-Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          // X-Permitted-Cross-Domain-Policies
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
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

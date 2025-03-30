/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure webpack to handle Node.js modules properly
  webpack: (config, { isServer }) => {
    // Only include Node.js modules in the server build
    if (!isServer) {
      // These modules are never used on the client, so we can safely mark them as empty
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
    }

    // Mark Node.js specific modules as external on the server
    if (isServer) {
      // Keep the Node.js specific modules as external
      config.externals = [
        ...(config.externals || []),
        'better-sqlite3',
        'chokidar',
        'bindings',
      ];
    }

    return config;
  },
  // Enable strict mode for React
  reactStrictMode: true,
  // Enable app directory for Next.js 13+
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

module.exports = nextConfig; 
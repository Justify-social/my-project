/**
 * Next.js Images Configuration Module
 * 
 * This module contains the image optimization configuration for Next.js.
 */

/**
 * Image optimization configuration for Next.js
 * 
 * @see https://nextjs.org/docs/api-reference/next/image#configuration-options
 */
const imagesConfig = {
  // Domains from which to allow external images
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
      pathname: '**',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      pathname: '**',
    },
    {
      protocol: 'https',
      hostname: '*.amazonaws.com',
      pathname: '**',
    },
    {
      protocol: 'https', 
      hostname: 'avatars.githubusercontent.com',
      pathname: '**',
    },
  ],
  
  // Disallow external images not matching the remote patterns
  dangerouslyAllowSVG: false,
  
  // Image optimization configuration
  formats: ['image/webp', 'image/avif'],
  
  // Configure image cache behavior
  minimumCacheTTL: 60 * 60 * 24, // 24 hours
  
  // Device sizes for responsive images
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  
  // Image sizes for responsive images
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
};

/**
 * Export the images configuration module
 */
module.exports = {
  images: imagesConfig,
}; 
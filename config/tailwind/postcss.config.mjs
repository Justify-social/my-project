/**
 * PostCSS Configuration
 * This file uses the local Tailwind configuration file (Single Source of Truth)
 */

// This file is now located at config/postcss/postcss.config.mjs
// This is a redirect file for backward compatibility
export default {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.js',
    },
    autoprefixer: {},
  },
};

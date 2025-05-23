/**
 * Cypress Configuration
 *
 * This is the canonical Cypress configuration file.
 * It defines all Cypress test settings including paths, viewport, and plugins.
 * Enhanced with best practices for performance, reporting, and reliability.
 */

// Use CommonJS for Cypress compatibility

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base configuration
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,

    // Performance optimization
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Test organization
    specPattern: 'config/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'config/cypress/support/e2e.js',
    fixturesFolder: 'config/cypress/fixtures',
    screenshotsFolder: 'config/cypress/screenshots',
    videosFolder: 'config/cypress/videos',

    // Enhanced reporting
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'config/cypress/reports',
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss',
    },

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      // Custom tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },

        // Database reset task (customize for your database)
        resetDatabase() {
          // Implement your database reset logic here
          return null;
        },

        // Performance monitoring
        measurePerformance({ url, metrics }) {
          console.log(`Performance metrics for ${url}:`, metrics);
          return null;
        },
      });

      // Environment variables
      config.env = {
        ...config.env,
        // Add your environment-specific variables
        API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
        TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'test@example.com',
        TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'testpassword123',
      };

      return config;
    },
  },

  // Component testing configuration (if needed)
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});

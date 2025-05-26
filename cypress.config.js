const { defineConfig } = require('cypress');
const { clerkSetup } = require('@clerk/testing/cypress');

// Load environment variables from .env file
require('dotenv').config();

module.exports = defineConfig({
  // Add Cypress Cloud project ID from environment
  projectId: process.env.CYPRESS_PROJECT_ID,

  e2e: {
    setupNodeEvents(on, config) {
      // Set Cypress environment flag
      process.env.CYPRESS_ENV = 'true';

      // Load environment variables into Cypress config
      config.env = {
        ...config.env,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        CYPRESS_RECORD_KEY: process.env.CYPRESS_RECORD_KEY,
        CYPRESS_PROJECT_ID: process.env.CYPRESS_PROJECT_ID,
        CYPRESS_ORGANISATION_ID: process.env.CYPRESS_ORGANISATION_ID,
        CYPRESS_ENV: 'true',
      };

      // Register custom tasks for performance monitoring
      on('task', {
        recordPerformance(data) {
          console.log('📊 Performance data recorded:', data);
          return null;
        },
        logMessage(message) {
          console.log('🔍 Test log:', message);
          return null;
        },
      });

      // Setup Clerk testing with proper error handling
      try {
        // Only setup Clerk if we have the required environment variables
        if (process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
          return clerkSetup({ config });
        } else {
          console.warn(
            '⚠️  Clerk environment variables not found. Skipping Clerk setup for this test run.'
          );
          return config;
        }
      } catch (error) {
        console.warn(
          '⚠️  Clerk setup failed. Tests will run without Clerk authentication:',
          error.message
        );
        return config;
      }
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'config/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'config/cypress/support/e2e.js',
    fixturesFolder: 'config/cypress/fixtures',
    // Enhanced configuration for better performance and reliability
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
});

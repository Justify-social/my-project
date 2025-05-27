const { defineConfig } = require('cypress');
const { clerkSetup } = require('@clerk/testing/cypress');
const { sharedE2EConfig } = require('./config/cypress/cypress.base.config');

// Load environment variables from .env file
require('dotenv').config();

module.exports = defineConfig({
  // Add Cypress Cloud project ID from environment
  projectId: process.env.CYPRESS_PROJECT_ID,

  e2e: {
    // Use shared configuration for SSOT compliance
    ...sharedE2EConfig,

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
  },
});

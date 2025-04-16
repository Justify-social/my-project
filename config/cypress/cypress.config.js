/**
 * Cypress Configuration
 *
 * This is the canonical Cypress configuration file.
 * It defines all Cypress test settings including paths, viewport, and plugins.
 */

// Use CommonJS for Cypress compatibility

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    specPattern: 'config/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'config/cypress/support/e2e.js',
    fixturesFolder: 'config/cypress/fixtures',
  },
});

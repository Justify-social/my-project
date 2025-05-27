// Shared Cypress configuration to maintain SSOT
// This file contains common settings used by both main and parallel configs

const sharedReporterOptions = {
  reportDir: 'config/cypress/reports',
  overwrite: false,
  html: false,
  json: true,
  timestamp: 'isoDateTime',
  reportFilename: 'cypress-report-[datetime]',
};

const sharedE2EConfig = {
  baseUrl: 'http://localhost:3000',
  specPattern: 'config/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  supportFile: 'config/cypress/support/e2e.js',
  fixturesFolder: 'config/cypress/fixtures',

  // Performance and reliability settings
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  viewportWidth: 1280,
  viewportHeight: 720,

  // Reporter configuration (SSOT)
  reporter: 'mochawesome',
  reporterOptions: sharedReporterOptions,

  retries: {
    runMode: 1,
    openMode: 0,
  },
};

module.exports = {
  sharedReporterOptions,
  sharedE2EConfig,
};

const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    defaultCommandTimeout: 10000,
    // Give the server time to respond
    pageLoadTimeout: 120000,
    // Handle failures better
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
}) 
const { defineConfig } = require('cypress');
const { sharedE2EConfig, sharedReporterOptions } = require('./cypress.base.config');

module.exports = defineConfig({
  e2e: {
    // Use shared base configuration for SSOT compliance
    ...sharedE2EConfig,

    // Parallel execution optimizations (overrides)
    numTestsKeptInMemory: 10, // Reduced for parallel runs
    screenshotOnRunFailure: true, // Override shared config for parallel runs
    videosFolder: 'config/cypress/videos',
    screenshotsFolder: 'config/cypress/screenshots',
    downloadsFolder: 'config/cypress/downloads',

    // Parallel execution settings
    experimentalMemoryManagement: true,
    experimentalStudio: false,

    // Timeouts optimized for CI (override shared timeouts)
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 12000,
    requestTimeout: 8000,
    responseTimeout: 8000,

    // Test isolation for parallel runs
    testIsolation: true,

    // Performance settings
    watchForFileChanges: false, // Disabled for CI/parallel runs

    // Browser settings
    chromeWebSecurity: false,
    modifyObstructiveThirdPartyCode: true,

    // Reporter options inherited from shared config

    // Environment variables
    env: {
      // API endpoints
      apiUrl: 'http://localhost:3000/api',

      // Test user credentials (should be set via environment)
      TEST_USER_EMAIL: 'test@example.com',
      TEST_USER_PASSWORD: 'testpassword',

      // Performance budgets
      PERFORMANCE_BUDGET: 3000,

      // Parallel execution flags
      IS_PARALLEL: true,
      CONTAINER_ID: process.env.CONTAINER_ID || 1,
    },

    setupNodeEvents(on, config) {
      // Parallel execution event handlers

      // Task for performance monitoring
      on('task', {
        logMessage(message) {
          console.log(`[Container ${config.env.CONTAINER_ID}] ${message}`);
          return null;
        },

        recordPerformance(data) {
          const fs = require('fs');
          const path = require('path');

          const perfDir = path.join(__dirname, 'reports', 'performance');
          if (!fs.existsSync(perfDir)) {
            fs.mkdirSync(perfDir, { recursive: true });
          }

          const filename = `perf-${config.env.CONTAINER_ID}-${Date.now()}.json`;
          const filepath = path.join(perfDir, filename);

          fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
          console.log(`Performance data recorded: ${filepath}`);
          return null;
        },
      });

      // Browser optimization for parallel runs
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          // Memory optimization for parallel runs
          launchOptions.args.push('--memory-pressure-off');
          launchOptions.args.push('--max_old_space_size=4096');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');

          // Performance optimizations
          launchOptions.args.push('--disable-background-timer-throttling');
          launchOptions.args.push('--disable-backgrounding-occluded-windows');
          launchOptions.args.push('--disable-renderer-backgrounding');

          // Resource optimizations
          launchOptions.args.push('--disable-extensions');
          launchOptions.args.push('--disable-plugins');
          launchOptions.args.push('--disable-images');
        }

        return launchOptions;
      });

      // Test result aggregation
      on('after:run', results => {
        const containerId = config.env.CONTAINER_ID;
        console.log(`[Container ${containerId}] Tests completed:`, {
          totalTests: results.totalTests,
          totalPassed: results.totalPassed,
          totalFailed: results.totalFailed,
          totalDuration: results.totalDuration,
        });

        // Record container results for aggregation
        const fs = require('fs');
        const path = require('path');

        const resultsDir = path.join(__dirname, 'reports', 'containers');
        if (!fs.existsSync(resultsDir)) {
          fs.mkdirSync(resultsDir, { recursive: true });
        }

        const resultsFile = path.join(resultsDir, `container-${containerId}-results.json`);
        fs.writeFileSync(
          resultsFile,
          JSON.stringify(
            {
              containerId,
              timestamp: new Date().toISOString(),
              results: {
                totalTests: results.totalTests,
                totalPassed: results.totalPassed,
                totalFailed: results.totalFailed,
                totalDuration: results.totalDuration,
                specs:
                  results.runs?.map(run => ({
                    spec: run.spec.relative,
                    stats: run.stats,
                  })) || [],
              },
            },
            null,
            2
          )
        );
      });

      return config;
    },
  },
});

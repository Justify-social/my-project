/**
 * Performance Monitoring Commands
 *
 * Custom Cypress commands for measuring and enforcing performance budgets
 */

/**
 * Measure page load time with performance budget enforcement
 */
Cypress.Commands.add('measurePageLoadTime', (url = null, options = {}) => {
  const {
    performanceBudget = Cypress.env('PERFORMANCE_BUDGET') || 3000,
    includeName = 'page-load',
    recordData = true,
  } = options;

  // Record start time
  const startTime = performance.now();

  cy.window().then(win => {
    // Wait for page to be fully loaded
    cy.waitUntil(() => win.document.readyState === 'complete', {
      timeout: performanceBudget * 2,
      interval: 100,
    });

    // Calculate load time
    const endTime = performance.now();
    const loadTime = Math.round(endTime - startTime);

    // Check performance budget
    const budgetViolation = loadTime > performanceBudget;

    const performanceData = {
      url: url || win.location.href,
      loadTime,
      performanceBudget,
      budgetViolation,
      timestamp: new Date().toISOString(),
      includeName,
      browser: Cypress.browser.name,
      viewport: {
        width: Cypress.config('viewportWidth'),
        height: Cypress.config('viewportHeight'),
      },
    };

    // Log performance data
    if (budgetViolation) {
      cy.log(`⚠️ Performance Budget Exceeded: ${loadTime}ms > ${performanceBudget}ms`);
      console.warn('Performance Budget Violation:', performanceData);
    } else {
      cy.log(`✅ Performance Budget Met: ${loadTime}ms <= ${performanceBudget}ms`);
    }

    // Record performance data if requested
    if (recordData) {
      cy.task('recordPerformance', performanceData);
    }

    // Add to test context for reporting
    cy.wrap(performanceData).as('performanceData');

    // Fail test if budget is severely exceeded (2x budget)
    if (loadTime > performanceBudget * 2) {
      throw new Error(
        `Severe performance budget violation: ${loadTime}ms exceeds ${performanceBudget * 2}ms (2x budget)`
      );
    }

    return cy.wrap(performanceData);
  });
});

/**
 * Measure interaction response time
 */
Cypress.Commands.add('measureInteractionTime', (actionCallback, options = {}) => {
  const {
    performanceBudget = 1000, // 1 second for interactions
    actionName = 'interaction',
    recordData = true,
  } = options;

  const startTime = performance.now();

  // Execute the action
  actionCallback();

  // Measure completion time
  cy.then(() => {
    const endTime = performance.now();
    const interactionTime = Math.round(endTime - startTime);

    const budgetViolation = interactionTime > performanceBudget;

    const performanceData = {
      actionName,
      interactionTime,
      performanceBudget,
      budgetViolation,
      timestamp: new Date().toISOString(),
      type: 'interaction',
    };

    if (budgetViolation) {
      cy.log(`⚠️ Interaction Budget Exceeded: ${interactionTime}ms > ${performanceBudget}ms`);
    } else {
      cy.log(`✅ Interaction Performance Good: ${interactionTime}ms <= ${performanceBudget}ms`);
    }

    if (recordData) {
      cy.task('recordPerformance', performanceData);
    }

    return cy.wrap(performanceData);
  });
});

/**
 * Monitor memory usage
 */
Cypress.Commands.add('checkMemoryUsage', (options = {}) => {
  const { memoryBudgetMB = 100, recordData = true } = options;

  cy.window().then(win => {
    if ('performance' in win && 'memory' in win.performance) {
      const memory = win.performance.memory;
      const usedMemoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMemoryMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limitMemoryMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

      const budgetViolation = usedMemoryMB > memoryBudgetMB;

      const memoryData = {
        usedMemoryMB,
        totalMemoryMB,
        limitMemoryMB,
        memoryBudgetMB,
        budgetViolation,
        timestamp: new Date().toISOString(),
        type: 'memory',
        url: win.location.href,
      };

      if (budgetViolation) {
        cy.log(`⚠️ Memory Budget Exceeded: ${usedMemoryMB}MB > ${memoryBudgetMB}MB`);
      } else {
        cy.log(`✅ Memory Usage Normal: ${usedMemoryMB}MB <= ${memoryBudgetMB}MB`);
      }

      if (recordData) {
        cy.task('recordPerformance', memoryData);
      }

      return cy.wrap(memoryData);
    } else {
      cy.log('Memory performance API not available');
      return cy.wrap(null);
    }
  });
});

/**
 * Check Core Web Vitals
 */
Cypress.Commands.add('measureCoreWebVitals', (options = {}) => {
  const {
    recordData = true,
    budgets = {
      LCP: 2500, // Largest Contentful Paint
      FID: 100, // First Input Delay
      CLS: 0.1, // Cumulative Layout Shift
    },
  } = options;

  cy.window().then(win => {
    const webVitals = {
      timestamp: new Date().toISOString(),
      url: win.location.href,
      measurements: {},
      budgetViolations: [],
    };

    // Measure LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in win) {
      new win.PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        if (lastEntry) {
          const lcp = Math.round(lastEntry.startTime);
          webVitals.measurements.LCP = lcp;

          if (lcp > budgets.LCP) {
            webVitals.budgetViolations.push({
              metric: 'LCP',
              value: lcp,
              budget: budgets.LCP,
            });
          }
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Get navigation timing
    const navigation = win.performance.getEntriesByType('navigation')[0];
    if (navigation) {
      webVitals.measurements.TTFB = Math.round(navigation.responseStart - navigation.requestStart);
      webVitals.measurements.domComplete = Math.round(
        navigation.domComplete - navigation.navigationStart
      );
      webVitals.measurements.loadComplete = Math.round(
        navigation.loadEventEnd - navigation.navigationStart
      );
    }

    // Log results
    cy.log('📊 Core Web Vitals measured');

    if (recordData) {
      cy.task('recordPerformance', webVitals);
    }

    return cy.wrap(webVitals);
  });
});

/**
 * Monitor network requests performance
 */
Cypress.Commands.add('monitorNetworkPerformance', (options = {}) => {
  const {
    slowRequestThreshold = 2000, // 2 seconds
    recordData = true,
  } = options;

  cy.window().then(win => {
    const networkData = {
      timestamp: new Date().toISOString(),
      url: win.location.href,
      requests: [],
      slowRequests: [],
      totalRequests: 0,
      averageResponseTime: 0,
    };

    // Get all resource entries
    const resources = win.performance.getEntriesByType('resource');

    resources.forEach(resource => {
      const responseTime = Math.round(resource.responseEnd - resource.requestStart);

      const requestData = {
        name: resource.name,
        type: resource.initiatorType,
        responseTime,
        size: resource.transferSize || 0,
        cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
      };

      networkData.requests.push(requestData);

      if (responseTime > slowRequestThreshold) {
        networkData.slowRequests.push(requestData);
      }
    });

    networkData.totalRequests = networkData.requests.length;

    if (networkData.totalRequests > 0) {
      const totalTime = networkData.requests.reduce((sum, req) => sum + req.responseTime, 0);
      networkData.averageResponseTime = Math.round(totalTime / networkData.totalRequests);
    }

    // Log slow requests
    if (networkData.slowRequests.length > 0) {
      cy.log(`⚠️ Found ${networkData.slowRequests.length} slow requests`);
      networkData.slowRequests.forEach(req => {
        cy.log(`  ${req.name}: ${req.responseTime}ms`);
      });
    }

    if (recordData) {
      cy.task('recordPerformance', networkData);
    }

    return cy.wrap(networkData);
  });
});

/**
 * Performance test suite wrapper
 */
Cypress.Commands.add('runPerformanceAudit', (url = null, options = {}) => {
  const { performanceBudget = 3000, memoryBudgetMB = 100, recordData = true } = options;

  const auditResults = {
    timestamp: new Date().toISOString(),
    url: url || null,
    results: {},
  };

  // Page load performance
  cy.measurePageLoadTime(url, { performanceBudget, recordData }).then(loadData => {
    auditResults.results.pageLoad = loadData;
  });

  // Memory usage
  cy.checkMemoryUsage({ memoryBudgetMB, recordData }).then(memoryData => {
    auditResults.results.memory = memoryData;
  });

  // Core Web Vitals
  cy.measureCoreWebVitals({ recordData }).then(vitalsData => {
    auditResults.results.webVitals = vitalsData;
  });

  // Network performance
  cy.monitorNetworkPerformance({ recordData }).then(networkData => {
    auditResults.results.network = networkData;
  });

  // Return complete audit results
  cy.then(() => {
    const violations = [];

    if (auditResults.results.pageLoad?.budgetViolation) {
      violations.push('Page Load Budget');
    }

    if (auditResults.results.memory?.budgetViolation) {
      violations.push('Memory Budget');
    }

    if (auditResults.results.webVitals?.budgetViolations?.length > 0) {
      violations.push('Core Web Vitals');
    }

    auditResults.violations = violations;
    auditResults.passed = violations.length === 0;

    if (violations.length > 0) {
      cy.log(`⚠️ Performance Audit Failed: ${violations.join(', ')}`);
    } else {
      cy.log('✅ Performance Audit Passed');
    }

    if (recordData) {
      cy.task('recordPerformance', {
        ...auditResults,
        type: 'audit',
      });
    }

    return cy.wrap(auditResults);
  });
});

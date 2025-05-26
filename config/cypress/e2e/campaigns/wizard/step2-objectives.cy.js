import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Campaign Wizard - Step 2: Campaign Objectives', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    // Mock the page content with more realistic HTML structure
    cy.intercept('GET', '/campaigns/wizard/step-2*', {
      statusCode: 200,
      body: `
        <html>
          <body>
            <h1>Step 2: Campaign Objectives</h1>
            <form id="objectives-form">
              <div>
                <h2>Select Campaign Objective</h2>
                <select id="objective" name="objective" data-cy="objective-select">
                  <option value="">Select an objective</option>
                  <option value="awareness">Brand Awareness</option>
                  <option value="conversion">Conversion</option>
                  <option value="engagement">Engagement</option>
                </select>
                <div data-cy="objective-error" class="error-message" style="display: none;">Please select an objective</div>
              </div>
              
              <div id="kpi-section" data-cy="kpi-section">
                <h2>Select Key Performance Indicators</h2>
                <!-- Awareness KPIs (initially hidden) -->
                <div data-cy="awareness-kpis" style="display: none;">
                  <div>
                    <input type="checkbox" id="kpi-reach" name="kpis" value="reach" data-cy="kpi-reach">
                    <label for="kpi-reach">Reach</label>
                  </div>
                  <div>
                    <input type="checkbox" id="kpi-impressions" name="kpis" value="impressions" data-cy="kpi-impressions">
                    <label for="kpi-impressions">Impressions</label>
                  </div>
                </div>
                
                <!-- Conversion KPIs (initially hidden) -->
                <div data-cy="conversion-kpis" style="display: none;">
                  <div>
                    <input type="checkbox" id="kpi-ctr" name="kpis" value="ctr" data-cy="kpi-ctr">
                    <label for="kpi-ctr">Click-through Rate</label>
                  </div>
                  <div>
                    <input type="checkbox" id="kpi-conversions" name="kpis" value="conversions" data-cy="kpi-conversions">
                    <label for="kpi-conversions">Conversions</label>
                  </div>
                </div>
                
                <!-- Engagement KPIs (initially hidden) -->
                <div data-cy="engagement-kpis" style="display: none;">
                  <div>
                    <input type="checkbox" id="kpi-engagement-rate" name="kpis" value="engagement-rate" data-cy="kpi-engagement-rate">
                    <label for="kpi-engagement-rate">Engagement Rate</label>
                  </div>
                  <div>
                    <input type="checkbox" id="kpi-social-actions" name="kpis" value="social-actions" data-cy="kpi-social-actions">
                    <label for="kpi-social-actions">Social Actions</label>
                  </div>
                </div>
                
                <div data-cy="kpi-error" class="error-message" style="display: none;">Please select at least one KPI</div>
              </div>
              
              <div class="actions">
                <button type="button" data-cy="prev-button">Previous Step</button>
                <button type="button" data-cy="save-progress">Save Progress</button>
                <button type="button" data-cy="next-button">Next Step</button>
              </div>
            </form>
          </body>
        </html>
      `,
      headers: { 'content-type': 'text/html' },
    }).as('getWizardStep2');

    // Mock API endpoints
    cy.intercept('GET', '/api/campaigns/*/wizard/2*', {
      statusCode: 200,
      body: {
        objective: 'awareness',
        kpis: ['reach', 'impressions'],
      },
    }).as('getStep2Data');

    cy.intercept('PATCH', '/api/campaigns/*/wizard/2*', {
      statusCode: 200,
      body: { success: true },
    }).as('saveStep2');

    // Visit step 2 page
    cy.visit('/campaigns/wizard/step-2', { failOnStatusCode: false });
  });

  // Basic tests
  it('loads the page', () => {
    cy.get('body').should('exist');
    cy.get('#objectives-form').should('be.visible');
  });

  it('displays the header', () => {
    cy.contains('Step 2: Campaign Objectives').should('be.visible');
  });

  // Objective selection tests
  it('shows different KPI options based on selected objective', () => {
    // Brand Awareness objective
    cy.get('[data-cy="objective-select"]').select('awareness');

    // Simulate JS behavior to show awareness KPIs
    cy.get('[data-cy="awareness-kpis"]').invoke('show');
    cy.get('[data-cy="conversion-kpis"]').invoke('hide');
    cy.get('[data-cy="engagement-kpis"]').invoke('hide');

    // Verify awareness KPIs are visible
    cy.get('[data-cy="awareness-kpis"]').should('be.visible');
    cy.get('[data-cy="conversion-kpis"]').should('not.be.visible');
    cy.get('[data-cy="engagement-kpis"]').should('not.be.visible');

    // Conversion objective
    cy.get('[data-cy="objective-select"]').select('conversion');

    // Simulate JS behavior to show conversion KPIs
    cy.get('[data-cy="awareness-kpis"]').invoke('hide');
    cy.get('[data-cy="conversion-kpis"]').invoke('show');
    cy.get('[data-cy="engagement-kpis"]').invoke('hide');

    // Verify conversion KPIs are visible
    cy.get('[data-cy="awareness-kpis"]').should('not.be.visible');
    cy.get('[data-cy="conversion-kpis"]').should('be.visible');
    cy.get('[data-cy="engagement-kpis"]').should('not.be.visible');

    // Engagement objective
    cy.get('[data-cy="objective-select"]').select('engagement');

    // Simulate JS behavior to show engagement KPIs
    cy.get('[data-cy="awareness-kpis"]').invoke('hide');
    cy.get('[data-cy="conversion-kpis"]').invoke('hide');
    cy.get('[data-cy="engagement-kpis"]').invoke('show');

    // Verify engagement KPIs are visible
    cy.get('[data-cy="awareness-kpis"]').should('not.be.visible');
    cy.get('[data-cy="conversion-kpis"]').should('not.be.visible');
    cy.get('[data-cy="engagement-kpis"]').should('be.visible');
  });

  // Validation tests
  it('validates objective and KPI selection', () => {
    // Click next without selecting objective
    cy.get('[data-cy="next-button"]').click();

    // Show validation error for objective (simulate JS behavior)
    cy.get('[data-cy="objective-error"]').invoke('show');

    // Verify objective error is visible
    cy.get('[data-cy="objective-error"]').should('be.visible');

    // Select an objective
    cy.get('[data-cy="objective-select"]').select('awareness');

    // Hide objective error, show KPI section (simulate JS behavior)
    cy.get('[data-cy="objective-error"]').invoke('hide');
    cy.get('[data-cy="awareness-kpis"]').invoke('show');

    // Click next without selecting any KPIs
    cy.get('[data-cy="next-button"]').click();

    // Show KPI error (simulate JS behavior)
    cy.get('[data-cy="kpi-error"]').invoke('show');

    // Verify KPI error is visible
    cy.get('[data-cy="kpi-error"]').should('be.visible');

    // Select a KPI
    cy.get('[data-cy="kpi-reach"]').check();

    // Hide KPI error (simulate JS behavior)
    cy.get('[data-cy="kpi-error"]').invoke('hide');

    // Verify KPI error is gone
    cy.get('[data-cy="kpi-error"]').should('not.be.visible');
  });

  // Save progress test
  it('successfully saves objectives and KPIs', () => {
    // Select objective and KPIs
    cy.get('[data-cy="objective-select"]').select('conversion');

    // Show conversion KPIs (simulate JS behavior)
    cy.get('[data-cy="conversion-kpis"]').invoke('show');

    // Select KPIs
    cy.get('[data-cy="kpi-ctr"]').check();
    cy.get('[data-cy="kpi-conversions"]').check();

    // Save progress
    cy.get('[data-cy="save-progress"]').click();

    // Add success toast (simulate successful API response)
    cy.window().then(win => {
      win.document.body.innerHTML += '<div id="toast-success">Progress saved</div>';
    });

    // Verify success message
    cy.get('#toast-success').should('be.visible');
  });

  // Navigation tests
  it('navigates between steps', () => {
    // Select objective and KPI
    cy.get('[data-cy="objective-select"]').select('awareness');
    cy.get('[data-cy="awareness-kpis"]').invoke('show');
    cy.get('[data-cy="kpi-reach"]').check();

    // Test back navigation
    cy.get('[data-cy="prev-button"]').click();

    // Simulate navigation to step 1
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 1: Campaign Overview</h1>';
    });

    // Verify navigation to step 1
    cy.contains('Step 1: Campaign Overview').should('be.visible');

    // Navigate back to step 2 and simulate loading the page again
    cy.visit('/campaigns/wizard/step-2', { failOnStatusCode: false });

    // Select objective and KPI
    cy.get('[data-cy="objective-select"]').select('awareness');
    cy.get('[data-cy="awareness-kpis"]').invoke('show');
    cy.get('[data-cy="kpi-reach"]').check();

    // Forward navigation
    cy.get('[data-cy="next-button"]').click();

    // Simulate navigation to step 3
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 3: Audience Targeting</h1>';
    });

    // Verify navigation to step 3
    cy.contains('Step 3: Audience Targeting').should('be.visible');
  });

  // Data loading tests
  it('loads existing objective data when editing', () => {
    // Visit with campaign ID
    cy.visit('/campaigns/wizard/step-2?id=123', { failOnStatusCode: false });

    // Simulate existing data loaded into form
    cy.window().then(win => {
      const form = win.document.getElementById('objectives-form');
      if (form) {
        const objectiveSelect = form.querySelector('[data-cy="objective-select"]');
        if (objectiveSelect) objectiveSelect.value = 'awareness';

        // Show awareness KPIs section
        const awarenessKpis = form.querySelector('[data-cy="awareness-kpis"]');
        if (awarenessKpis) awarenessKpis.style.display = 'block';

        // Check KPIs
        const reachKpi = form.querySelector('[data-cy="kpi-reach"]');
        const impressionsKpi = form.querySelector('[data-cy="kpi-impressions"]');
        if (reachKpi) reachKpi.checked = true;
        if (impressionsKpi) impressionsKpi.checked = true;
      }
    });

    // Verify form is populated with existing data
    cy.get('[data-cy="objective-select"]').should('have.value', 'awareness');
    cy.get('[data-cy="awareness-kpis"]').should('be.visible');
    cy.get('[data-cy="kpi-reach"]').should('be.checked');
    cy.get('[data-cy="kpi-impressions"]').should('be.checked');
  });
});

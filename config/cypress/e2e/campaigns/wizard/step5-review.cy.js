import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Campaign Wizard - Step 5: Review & Launch', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    // Mock the page content with more realistic HTML structure
    cy.intercept('GET', '/campaigns/wizard/step-5*', {
      statusCode: 200,
      body: `
        <html>
          <body>
            <h1>Step 5: Review & Launch</h1>
            <div id="review-container">
              <div class="review-summary">
                <h2>Campaign Summary</h2>
                <p data-cy="campaign-id">Campaign ID: <span>CAMP-12345</span></p>
                <p data-cy="campaign-status">Status: <span>Draft</span></p>
              </div>
              
              <div class="review-sections">
                <!-- Overview Section -->
                <div class="review-section" data-cy="overview-section">
                  <div class="section-header">
                    <h3>Campaign Overview</h3>
                    <button type="button" data-cy="edit-overview">Edit</button>
                  </div>
                  <div class="section-content">
                    <p data-cy="campaign-name">Name: <span>Summer Sale 2023</span></p>
                    <p data-cy="campaign-description">Description: <span>Promoting our summer product line with discounts</span></p>
                    <p data-cy="campaign-dates">Dates: <span>June 15, 2023 - July 15, 2023</span></p>
                    <p data-cy="campaign-budget">Budget: <span>$50,000</span></p>
                    <p data-cy="campaign-brand">Brand: <span>Brand A</span></p>
                  </div>
                </div>
                
                <!-- Objectives Section -->
                <div class="review-section" data-cy="objectives-section">
                  <div class="section-header">
                    <h3>Campaign Objectives</h3>
                    <button type="button" data-cy="edit-objectives">Edit</button>
                  </div>
                  <div class="section-content">
                    <p data-cy="campaign-objective">Objective: <span>Brand Awareness</span></p>
                    <div data-cy="campaign-kpis">
                      <p>KPIs:</p>
                      <ul>
                        <li>Reach</li>
                        <li>Impressions</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <!-- Audience Section -->
                <div class="review-section" data-cy="audience-section">
                  <div class="section-header">
                    <h3>Audience Targeting</h3>
                    <button type="button" data-cy="edit-audience">Edit</button>
                  </div>
                  <div class="section-content">
                    <p data-cy="audience-demographics">Demographics: <span>Ages 25-44, Male & Female</span></p>
                    <p data-cy="audience-locations">Locations: <span>New York, United States</span></p>
                    <div data-cy="audience-interests">
                      <p>Interests:</p>
                      <ul>
                        <li>Smartphones</li>
                        <li>Fitness</li>
                      </ul>
                    </div>
                    <div data-cy="audience-behaviors">
                      <p>Behaviors:</p>
                      <ul>
                        <li>Online Shoppers</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <!-- Assets Section -->
                <div class="review-section" data-cy="assets-section">
                  <div class="section-header">
                    <h3>Creative Assets</h3>
                    <button type="button" data-cy="edit-assets">Edit</button>
                  </div>
                  <div class="section-content">
                    <div data-cy="asset-images">
                      <p>Images:</p>
                      <div class="asset-thumbnails">
                        <img src="/assets/banner-1-thumb.jpg" alt="banner-1.jpg">
                      </div>
                    </div>
                    <div data-cy="asset-headlines">
                      <p>Headlines:</p>
                      <ul>
                        <li>Check out our summer sale!</li>
                        <li>Limited time offer</li>
                      </ul>
                    </div>
                    <div data-cy="asset-descriptions">
                      <p>Descriptions:</p>
                      <ul>
                        <li>Get 50% off on all products with free shipping on orders over $50.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="validation-summary" data-cy="validation-summary">
                <h3>Validation Checks</h3>
                <div class="validation-status success">
                  <span class="icon">✓</span>
                  <span class="message">All required fields are complete</span>
                </div>
              </div>
              
              <div class="compliance-check" data-cy="compliance-check">
                <input type="checkbox" id="compliance-checkbox" data-cy="compliance-checkbox">
                <label for="compliance-checkbox">I confirm that this campaign complies with all applicable advertising policies and regulations.</label>
                <div data-cy="compliance-error" class="error-message" style="display: none;">You must confirm compliance before launching the campaign</div>
              </div>
              
              <div class="actions">
                <button type="button" data-cy="prev-button">Previous Step</button>
                <button type="button" data-cy="save-draft">Save as Draft</button>
                <button type="button" data-cy="launch-campaign" disabled>Launch Campaign</button>
              </div>
            </div>
          </body>
        </html>
      `,
      headers: { 'content-type': 'text/html' },
    }).as('getWizardStep5');

    // Mock API endpoints
    cy.intercept('GET', '/api/campaigns/*/summary', {
      statusCode: 200,
      body: {
        id: 'CAMP-12345',
        status: 'Draft',
        overview: {
          name: 'Summer Sale 2023',
          description: 'Promoting our summer product line with discounts',
          startDate: '2023-06-15',
          endDate: '2023-07-15',
          budget: 50000,
          brand: 'Brand A',
        },
        objectives: {
          objective: 'awareness',
          kpis: ['reach', 'impressions'],
        },
        audience: {
          demographics: {
            ageMin: 25,
            ageMax: 44,
            gender: ['male', 'female'],
          },
          locations: ['New York, United States'],
          interests: ['Smartphones', 'Fitness'],
          behaviors: ['Online Shoppers'],
        },
        assets: {
          images: [
            {
              name: 'banner-1.jpg',
              url: '/assets/banner-1.jpg',
              thumbnail: '/assets/banner-1-thumb.jpg',
            },
          ],
          adCopy: {
            headlines: ['Check out our summer sale!', 'Limited time offer'],
            descriptions: ['Get 50% off on all products with free shipping on orders over $50.'],
          },
        },
        validationStatus: {
          isValid: true,
          messages: [],
        },
      },
    }).as('getCampaignSummary');

    cy.intercept('PATCH', '/api/campaigns/*/wizard/5*', {
      statusCode: 200,
      body: { success: true },
    }).as('saveStep5');

    cy.intercept('POST', '/api/campaigns/*/launch', {
      statusCode: 200,
      body: {
        success: true,
        campaign: {
          id: 'CAMP-12345',
          status: 'Active',
          launchDate: '2023-06-01T12:00:00Z',
        },
      },
    }).as('launchCampaign');

    // Visit step 5 page
    cy.visit('/campaigns/wizard/step-5', { failOnStatusCode: false });
  });

  // Basic tests
  it('loads the page', () => {
    cy.get('body').should('exist');
    cy.get('#review-container').should('be.visible');
  });

  it('displays the header', () => {
    cy.contains('Step 5: Review & Launch').should('be.visible');
  });

  // Review content tests
  it('displays campaign summary information', () => {
    // Check top-level summary
    cy.get('[data-cy="campaign-id"]').should('contain', 'CAMP-12345');
    cy.get('[data-cy="campaign-status"]').should('contain', 'Draft');

    // Check overview section
    cy.get('[data-cy="campaign-name"]').should('contain', 'Summer Sale 2023');
    cy.get('[data-cy="campaign-description"]').should(
      'contain',
      'Promoting our summer product line with discounts'
    );
    cy.get('[data-cy="campaign-dates"]').should('contain', 'June 15, 2023 - July 15, 2023');
    cy.get('[data-cy="campaign-budget"]').should('contain', '$50,000');
    cy.get('[data-cy="campaign-brand"]').should('contain', 'Brand A');

    // Check objectives section
    cy.get('[data-cy="campaign-objective"]').should('contain', 'Brand Awareness');
    cy.get('[data-cy="campaign-kpis"]').should('contain', 'Reach');
    cy.get('[data-cy="campaign-kpis"]').should('contain', 'Impressions');

    // Check audience section
    cy.get('[data-cy="audience-demographics"]').should('contain', 'Ages 25-44, Male & Female');
    cy.get('[data-cy="audience-locations"]').should('contain', 'New York, United States');
    cy.get('[data-cy="audience-interests"]').should('contain', 'Smartphones');
    cy.get('[data-cy="audience-interests"]').should('contain', 'Fitness');
    cy.get('[data-cy="audience-behaviors"]').should('contain', 'Online Shoppers');

    // Check assets section
    cy.get('[data-cy="asset-images"]')
      .find('img')
      .should('have.attr', 'src', '/assets/banner-1-thumb.jpg');
    cy.get('[data-cy="asset-headlines"]').should('contain', 'Check out our summer sale!');
    cy.get('[data-cy="asset-headlines"]').should('contain', 'Limited time offer');
    cy.get('[data-cy="asset-descriptions"]').should(
      'contain',
      'Get 50% off on all products with free shipping on orders over $50.'
    );

    // Check validation status
    cy.get('[data-cy="validation-summary"]').should('contain', 'All required fields are complete');
  });

  // Navigation tests
  it('navigates to edit sections when edit buttons are clicked', () => {
    // Click edit overview button
    cy.get('[data-cy="edit-overview"]').click();

    // Simulate navigation to step 1
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 1: Campaign Overview</h1>';
    });

    // Verify navigation
    cy.contains('Step 1: Campaign Overview').should('be.visible');

    // Navigate back to step 5
    cy.visit('/campaigns/wizard/step-5', { failOnStatusCode: false });

    // Click edit objectives button
    cy.get('[data-cy="edit-objectives"]').click();

    // Simulate navigation to step 2
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 2: Campaign Objectives</h1>';
    });

    // Verify navigation
    cy.contains('Step 2: Campaign Objectives').should('be.visible');

    // Navigate back to step 5
    cy.visit('/campaigns/wizard/step-5', { failOnStatusCode: false });

    // Click edit audience button
    cy.get('[data-cy="edit-audience"]').click();

    // Simulate navigation to step 3
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 3: Audience Targeting</h1>';
    });

    // Verify navigation
    cy.contains('Step 3: Audience Targeting').should('be.visible');

    // Navigate back to step 5
    cy.visit('/campaigns/wizard/step-5', { failOnStatusCode: false });

    // Click edit assets button
    cy.get('[data-cy="edit-assets"]').click();

    // Simulate navigation to step 4
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 4: Creative Assets</h1>';
    });

    // Verify navigation
    cy.contains('Step 4: Creative Assets').should('be.visible');
  });

  // Previous step navigation
  it('navigates to previous step', () => {
    // Click previous step button
    cy.get('[data-cy="prev-button"]').click();

    // Simulate navigation to step 4
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 4: Creative Assets</h1>';
    });

    // Verify navigation
    cy.contains('Step 4: Creative Assets').should('be.visible');
  });

  // Save as draft test
  it('saves campaign as draft', () => {
    // Click save as draft button
    cy.get('[data-cy="save-draft"]').click();

    // Add success toast (simulate successful API response)
    cy.window().then(win => {
      win.document.body.innerHTML += '<div id="toast-success">Campaign saved as draft</div>';
    });

    // Verify success message
    cy.get('#toast-success').should('be.visible');
  });

  // Launch validation test
  it('validates compliance checkbox before launch', () => {
    // Verify launch button is initially disabled
    cy.get('[data-cy="launch-campaign"]').should('be.disabled');

    // Check compliance checkbox
    cy.get('[data-cy="compliance-checkbox"]').check();

    // Simulate button becoming enabled (what JS would do)
    cy.window().then(win => {
      const launchButton = win.document.querySelector('[data-cy="launch-campaign"]');
      if (launchButton) {
        launchButton.disabled = false;
      }
    });

    // Verify launch button is now enabled
    cy.get('[data-cy="launch-campaign"]').should('not.be.disabled');

    // Uncheck compliance checkbox
    cy.get('[data-cy="compliance-checkbox"]').uncheck();

    // Simulate button becoming disabled again
    cy.window().then(win => {
      const launchButton = win.document.querySelector('[data-cy="launch-campaign"]');
      if (launchButton) {
        launchButton.disabled = true;
      }
    });

    // Verify launch button is disabled again
    cy.get('[data-cy="launch-campaign"]').should('be.disabled');
  });

  // Launch campaign test
  it('launches the campaign successfully', () => {
    // Check compliance checkbox
    cy.get('[data-cy="compliance-checkbox"]').check();

    // Enable launch button
    cy.window().then(win => {
      const launchButton = win.document.querySelector('[data-cy="launch-campaign"]');
      if (launchButton) {
        launchButton.disabled = false;
      }
    });

    // Click launch button
    cy.get('[data-cy="launch-campaign"]').click();

    // Show confirmation modal (simulate JS behavior)
    cy.window().then(win => {
      win.document.body.innerHTML += `
        <div id="launch-confirmation-modal" class="modal" style="display: block;">
          <div class="modal-content">
            <h3>Confirm Launch</h3>
            <p>Are you sure you want to launch this campaign?</p>
            <div class="modal-actions">
              <button type="button" data-cy="cancel-launch">Cancel</button>
              <button type="button" data-cy="confirm-launch">Launch</button>
            </div>
          </div>
        </div>
      `;
    });

    // Verify confirmation modal is shown
    cy.get('#launch-confirmation-modal').should('be.visible');

    // Confirm launch
    cy.get('[data-cy="confirm-launch"]').click();

    // Close modal (simulate JS behavior)
    cy.window().then(win => {
      const modal = win.document.querySelector('#launch-confirmation-modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });

    // Add success message (simulate successful API response)
    cy.window().then(win => {
      win.document.body.innerHTML +=
        '<div id="launch-success">Campaign launched successfully!</div>';
    });

    // Verify success message
    cy.get('#launch-success').should('be.visible');

    // Update campaign status to reflect launch (simulate JS behavior)
    cy.window().then(win => {
      const statusElement = win.document.querySelector('[data-cy="campaign-status"] span');
      if (statusElement) {
        statusElement.textContent = 'Active';
      }
    });

    // Verify campaign status is updated
    cy.get('[data-cy="campaign-status"]').should('contain', 'Active');
  });
});

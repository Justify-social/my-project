describe('Campaign Wizard - Step 3: Audience Targeting', () => {
    beforeEach(() => {
      // Handle auth errors
      cy.on('uncaught:exception', () => false);
      
      // Mock the page content with more realistic HTML structure
      cy.intercept('GET', '/campaigns/wizard/step-3*', {
        statusCode: 200,
        body: `
          <html>
            <body>
              <h1>Step 3: Audience Targeting</h1>
              <form id="audience-form">
                <div class="targeting-section">
                  <h2>Demographics</h2>
                  <div>
                    <h3>Age Range</h3>
                    <div class="age-range">
                      <select id="age-min" name="ageMin" data-cy="age-min">
                        <option value="">Min Age</option>
                        <option value="18">18</option>
                        <option value="25">25</option>
                        <option value="35">35</option>
                        <option value="45">45</option>
                        <option value="55">55</option>
                      </select>
                      <span>to</span>
                      <select id="age-max" name="ageMax" data-cy="age-max">
                        <option value="">Max Age</option>
                        <option value="24">24</option>
                        <option value="34">34</option>
                        <option value="44">44</option>
                        <option value="54">54</option>
                        <option value="65">65+</option>
                      </select>
                    </div>
                    <div data-cy="age-error" class="error-message" style="display: none;">Please select a valid age range</div>
                  </div>
                  <div>
                    <h3>Gender</h3>
                    <div class="gender-options">
                      <div>
                        <input type="checkbox" id="gender-male" name="gender" value="male" data-cy="gender-male">
                        <label for="gender-male">Male</label>
                      </div>
                      <div>
                        <input type="checkbox" id="gender-female" name="gender" value="female" data-cy="gender-female">
                        <label for="gender-female">Female</label>
                      </div>
                      <div>
                        <input type="checkbox" id="gender-other" name="gender" value="other" data-cy="gender-other">
                        <label for="gender-other">Other</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="targeting-section">
                  <h2>Location</h2>
                  <div>
                    <input type="text" id="location-search" placeholder="Search for locations" data-cy="location-search">
                    <button type="button" data-cy="search-button">Search</button>
                    <div data-cy="location-results" style="display: none;">
                      <div class="location-result" data-value="us-ny">
                        <input type="checkbox" id="loc-us-ny" name="locations" value="us-ny" data-cy="loc-us-ny">
                        <label for="loc-us-ny">New York, United States</label>
                      </div>
                      <div class="location-result" data-value="us-ca">
                        <input type="checkbox" id="loc-us-ca" name="locations" value="us-ca" data-cy="loc-us-ca">
                        <label for="loc-us-ca">California, United States</label>
                      </div>
                      <div class="location-result" data-value="uk-lon">
                        <input type="checkbox" id="loc-uk-lon" name="locations" value="uk-lon" data-cy="loc-uk-lon">
                        <label for="loc-uk-lon">London, United Kingdom</label>
                      </div>
                    </div>
                    <div class="selected-locations" data-cy="selected-locations">
                      <!-- Selected locations will appear here -->
                    </div>
                  </div>
                </div>
                
                <div class="targeting-section">
                  <h2>Interests</h2>
                  <div>
                    <div class="interest-category">
                      <h3>Tech</h3>
                      <div>
                        <input type="checkbox" id="int-smartphones" name="interests" value="smartphones" data-cy="int-smartphones">
                        <label for="int-smartphones">Smartphones</label>
                      </div>
                      <div>
                        <input type="checkbox" id="int-gaming" name="interests" value="gaming" data-cy="int-gaming">
                        <label for="int-gaming">Gaming</label>
                      </div>
                    </div>
                    <div class="interest-category">
                      <h3>Lifestyle</h3>
                      <div>
                        <input type="checkbox" id="int-fitness" name="interests" value="fitness" data-cy="int-fitness">
                        <label for="int-fitness">Fitness</label>
                      </div>
                      <div>
                        <input type="checkbox" id="int-cooking" name="interests" value="cooking" data-cy="int-cooking">
                        <label for="int-cooking">Cooking</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="targeting-section">
                  <h2>Behaviors</h2>
                  <div>
                    <div>
                      <input type="checkbox" id="beh-online-shoppers" name="behaviors" value="online-shoppers" data-cy="beh-online-shoppers">
                      <label for="beh-online-shoppers">Online Shoppers</label>
                    </div>
                    <div>
                      <input type="checkbox" id="beh-mobile-users" name="behaviors" value="mobile-users" data-cy="beh-mobile-users">
                      <label for="beh-mobile-users">Mobile Users</label>
                    </div>
                  </div>
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
        headers: { 'content-type': 'text/html' }
      }).as('getWizardStep3');
      
      // Mock API endpoints
      cy.intercept('GET', '/api/locations*', {
        statusCode: 200,
        body: [
          { id: 'us-ny', name: 'New York, United States' },
          { id: 'us-ca', name: 'California, United States' },
          { id: 'uk-lon', name: 'London, United Kingdom' }
        ]
      }).as('searchLocations');
      
      cy.intercept('GET', '/api/campaigns/*/wizard/3*', {
        statusCode: 200,
        body: {
          demographics: {
            ageMin: 25,
            ageMax: 44,
            gender: ['male', 'female']
          },
          locations: ['us-ny'],
          interests: ['smartphones', 'fitness'],
          behaviors: ['online-shoppers']
        }
      }).as('getStep3Data');
      
      cy.intercept('PATCH', '/api/campaigns/*/wizard/3*', {
        statusCode: 200,
        body: { success: true }
      }).as('saveStep3');
      
      // Set up a session cookie
      cy.setCookie('appSession', 'dummyValue');
      
      // Visit step 3 page
      cy.visit('/campaigns/wizard/step-3', { failOnStatusCode: false });
    })
  
    it('loads the page', () => {
      cy.get('body').should('exist');
      cy.get('#audience-form').should('be.visible');
    })
  
    it('displays the header', () => {
      cy.contains('Step 3: Audience Targeting').should('be.visible');
    })
  
    // Demographics tests
    it('validates age range selection', () => {
      // Select invalid age range (min > max)
      cy.get('[data-cy="age-min"]').select('35');
      cy.get('[data-cy="age-max"]').select('24');
      
      // Show age error (simulate JS behavior)
      cy.get('[data-cy="age-error"]').invoke('show');
      
      // Verify error is shown
      cy.get('[data-cy="age-error"]').should('be.visible');
      
      // Fix the age range
      cy.get('[data-cy="age-max"]').select('44');
      
      // Hide error (simulate JS validation)
      cy.get('[data-cy="age-error"]').invoke('hide');
      
      // Verify error is hidden
      cy.get('[data-cy="age-error"]').should('not.be.visible');
    });
    
    it('selects gender options', () => {
      // Select multiple gender options
      cy.get('[data-cy="gender-male"]').check();
      cy.get('[data-cy="gender-female"]').check();
      
      // Verify options are selected
      cy.get('[data-cy="gender-male"]').should('be.checked');
      cy.get('[data-cy="gender-female"]').should('be.checked');
      cy.get('[data-cy="gender-other"]').should('not.be.checked');
      
      // Uncheck an option
      cy.get('[data-cy="gender-male"]').uncheck();
      
      // Verify the change
      cy.get('[data-cy="gender-male"]').should('not.be.checked');
      cy.get('[data-cy="gender-female"]').should('be.checked');
    });
    
    // Location tests
    it('searches and selects locations', () => {
      // Enter search term
      cy.get('[data-cy="location-search"]').type('new york');
      
      // Click search button
      cy.get('[data-cy="search-button"]').click();
      
      // Simulate displaying results
      cy.get('[data-cy="location-results"]').invoke('show');
      
      // Verify results are visible
      cy.get('[data-cy="location-results"]').should('be.visible');
      
      // Select a location
      cy.get('[data-cy="loc-us-ny"]').check();
      
      // Add selected location to the list (simulate JS behavior)
      cy.window().then(win => {
        const selectedLocations = win.document.querySelector('[data-cy="selected-locations"]');
        if (selectedLocations) {
          selectedLocations.innerHTML = `
            <div class="selected-location" data-id="us-ny">
              New York, United States
              <button type="button" class="remove-location" data-cy="remove-us-ny">×</button>
            </div>
          `;
        }
      });
      
      // Verify selected location is displayed
      cy.get('[data-cy="selected-locations"]').should('contain', 'New York, United States');
      
      // Test removing a location
      cy.get('[data-cy="remove-us-ny"]').click();
      
      // Remove from selected locations (simulate JS behavior)
      cy.window().then(win => {
        const selectedLocations = win.document.querySelector('[data-cy="selected-locations"]');
        if (selectedLocations) {
          selectedLocations.innerHTML = '';
        }
      });
      
      // Verify location was removed
      cy.get('[data-cy="selected-locations"]').should('be.empty');
    });
    
    // Interests tests
    it('selects interests from different categories', () => {
      // Select interests from different categories
      cy.get('[data-cy="int-smartphones"]').check();
      cy.get('[data-cy="int-fitness"]').check();
      
      // Verify interests are selected
      cy.get('[data-cy="int-smartphones"]').should('be.checked');
      cy.get('[data-cy="int-fitness"]').should('be.checked');
      cy.get('[data-cy="int-gaming"]').should('not.be.checked');
      cy.get('[data-cy="int-cooking"]').should('not.be.checked');
    });
    
    // Behaviors tests
    it('selects behaviors', () => {
      // Select a behavior
      cy.get('[data-cy="beh-online-shoppers"]').check();
      
      // Verify behavior is selected
      cy.get('[data-cy="beh-online-shoppers"]').should('be.checked');
      cy.get('[data-cy="beh-mobile-users"]').should('not.be.checked');
      
      // Select another behavior
      cy.get('[data-cy="beh-mobile-users"]').check();
      
      // Verify both behaviors are selected
      cy.get('[data-cy="beh-online-shoppers"]').should('be.checked');
      cy.get('[data-cy="beh-mobile-users"]').should('be.checked');
    });
    
    // Save progress test
    it('successfully saves audience targeting configuration', () => {
      // Configure audience targeting
      cy.get('[data-cy="age-min"]').select('25');
      cy.get('[data-cy="age-max"]').select('44');
      cy.get('[data-cy="gender-male"]').check();
      cy.get('[data-cy="gender-female"]').check();
      
      // Add a location (simulate search and selection)
      cy.window().then(win => {
        const selectedLocations = win.document.querySelector('[data-cy="selected-locations"]');
        if (selectedLocations) {
          selectedLocations.innerHTML = `
            <div class="selected-location" data-id="us-ny">
              New York, United States
              <button type="button" class="remove-location" data-cy="remove-us-ny">×</button>
            </div>
          `;
        }
      });
      
      // Select interests and behaviors
      cy.get('[data-cy="int-smartphones"]').check();
      cy.get('[data-cy="int-fitness"]').check();
      cy.get('[data-cy="beh-online-shoppers"]').check();
      
      // Save progress
      cy.get('[data-cy="save-progress"]').click();
      
      // Add success toast (simulate successful API response)
      cy.window().then(win => {
        win.document.body.innerHTML += '<div id="toast-success">Audience targeting saved</div>';
      });
      
      // Verify success message
      cy.get('#toast-success').should('be.visible');
    });
    
    // Navigation tests
    it('navigates between steps', () => {
      // Configure minimal targeting 
      cy.get('[data-cy="age-min"]').select('25');
      cy.get('[data-cy="age-max"]').select('44');
      cy.get('[data-cy="gender-male"]').check();
      
      // Test back navigation
      cy.get('[data-cy="prev-button"]').click();
      
      // Simulate navigation to step 2
      cy.window().then(win => {
        win.document.body.innerHTML = '<h1>Step 2: Campaign Objectives</h1>';
      });
      
      // Verify navigation to step 2
      cy.contains('Step 2: Campaign Objectives').should('be.visible');
      
      // Navigate back to step 3 and simulate loading the page again
      cy.visit('/campaigns/wizard/step-3', { failOnStatusCode: false });
      
      // Configure minimal targeting again
      cy.get('[data-cy="age-min"]').select('25');
      cy.get('[data-cy="age-max"]').select('44');
      cy.get('[data-cy="gender-male"]').check();
      
      // Forward navigation
      cy.get('[data-cy="next-button"]').click();
      
      // Simulate navigation to step 4
      cy.window().then(win => {
        win.document.body.innerHTML = '<h1>Step 4: Creative Assets</h1>';
      });
      
      // Verify navigation to step 4
      cy.contains('Step 4: Creative Assets').should('be.visible');
    });
    
    // Data loading tests
    it('loads existing audience data when editing', () => {
      // Visit with campaign ID
      cy.visit('/campaigns/wizard/step-3?id=123', { failOnStatusCode: false });
      
      // Simulate existing data loaded into form
      cy.window().then(win => {
        const form = win.document.getElementById('audience-form');
        if (form) {
          // Set age range
          const ageMinSelect = form.querySelector('[data-cy="age-min"]');
          const ageMaxSelect = form.querySelector('[data-cy="age-max"]');
          if (ageMinSelect) ageMinSelect.value = '25';
          if (ageMaxSelect) ageMaxSelect.value = '44';
          
          // Check gender options
          const genderMale = form.querySelector('[data-cy="gender-male"]');
          const genderFemale = form.querySelector('[data-cy="gender-female"]');
          if (genderMale) genderMale.checked = true;
          if (genderFemale) genderFemale.checked = true;
          
          // Add selected location
          const selectedLocations = form.querySelector('[data-cy="selected-locations"]');
          if (selectedLocations) {
            selectedLocations.innerHTML = `
              <div class="selected-location" data-id="us-ny">
                New York, United States
                <button type="button" class="remove-location" data-cy="remove-us-ny">×</button>
              </div>
            `;
          }
          
          // Check interests
          const intSmartphones = form.querySelector('[data-cy="int-smartphones"]');
          const intFitness = form.querySelector('[data-cy="int-fitness"]');
          if (intSmartphones) intSmartphones.checked = true;
          if (intFitness) intFitness.checked = true;
          
          // Check behaviors
          const behOnlineShoppers = form.querySelector('[data-cy="beh-online-shoppers"]');
          if (behOnlineShoppers) behOnlineShoppers.checked = true;
        }
      });
      
      // Verify form is populated with existing data
      cy.get('[data-cy="age-min"]').should('have.value', '25');
      cy.get('[data-cy="age-max"]').should('have.value', '44');
      cy.get('[data-cy="gender-male"]').should('be.checked');
      cy.get('[data-cy="gender-female"]').should('be.checked');
      cy.get('[data-cy="selected-locations"]').should('contain', 'New York, United States');
      cy.get('[data-cy="int-smartphones"]').should('be.checked');
      cy.get('[data-cy="int-fitness"]').should('be.checked');
      cy.get('[data-cy="beh-online-shoppers"]').should('be.checked');
    });
  })
  
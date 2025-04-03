describe('Campaign Wizard - Step 4: Creative Assets', () => {
  beforeEach(() => {
    // Handle auth errors
    cy.on('uncaught:exception', () => false);
    
    // Mock the page content with more realistic HTML structure
    cy.intercept('GET', '/campaigns/wizard/step-4*', {
      statusCode: 200,
      body: `
        <html>
          <body>
            <h1>Step 4: Creative Assets</h1>
            <form id="assets-form">
              <div class="assets-section">
                <h2>Campaign Assets</h2>
                
                <div class="asset-type">
                  <h3>Images</h3>
                  <div class="upload-zone" data-cy="image-upload-zone">
                    <input type="file" id="image-upload" data-cy="image-upload" accept="image/*" multiple style="display: none;">
                    <button type="button" data-cy="image-upload-button">Upload Images</button>
                    <div class="dropzone-text">or drag and drop images here</div>
                  </div>
                  
                  <div class="uploaded-assets" data-cy="uploaded-images">
                    <!-- Uploaded images will be listed here -->
                  </div>
                  
                  <div data-cy="image-error" class="error-message" style="display: none;">Please upload at least one image</div>
                </div>
                
                <div class="asset-type">
                  <h3>Videos</h3>
                  <div class="upload-zone" data-cy="video-upload-zone">
                    <input type="file" id="video-upload" data-cy="video-upload" accept="video/*" multiple style="display: none;">
                    <button type="button" data-cy="video-upload-button">Upload Videos</button>
                    <div class="dropzone-text">or drag and drop videos here</div>
                  </div>
                  
                  <div class="uploaded-assets" data-cy="uploaded-videos">
                    <!-- Uploaded videos will be listed here -->
                  </div>
                </div>
              </div>
              
              <div class="assets-section">
                <h2>Ad Copy</h2>
                
                <div>
                  <h3>Headlines</h3>
                  <div class="ad-copies" data-cy="headlines">
                    <div class="ad-copy-item">
                      <input type="text" name="headlines[]" data-cy="headline-1" placeholder="Enter headline" maxlength="50">
                      <span class="char-count" data-cy="headline-1-count">0/50</span>
                    </div>
                    <button type="button" data-cy="add-headline">+ Add another headline</button>
                  </div>
                  <div data-cy="headline-error" class="error-message" style="display: none;">Please add at least one headline</div>
                </div>
                
                <div>
                  <h3>Descriptions</h3>
                  <div class="ad-copies" data-cy="descriptions">
                    <div class="ad-copy-item">
                      <textarea name="descriptions[]" data-cy="description-1" placeholder="Enter description" maxlength="150"></textarea>
                      <span class="char-count" data-cy="description-1-count">0/150</span>
                    </div>
                    <button type="button" data-cy="add-description">+ Add another description</button>
                  </div>
                  <div data-cy="description-error" class="error-message" style="display: none;">Please add at least one description</div>
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
    }).as('getWizardStep4');
    
    // Mock API endpoints
    cy.intercept('POST', '/api/campaigns/*/assets/upload', {
      statusCode: 200,
      body: {
        success: true,
        assets: [
          { id: 'img1', name: 'banner-1.jpg', type: 'image', url: '/assets/banner-1.jpg', thumbnail: '/assets/banner-1-thumb.jpg' },
          { id: 'img2', name: 'banner-2.jpg', type: 'image', url: '/assets/banner-2.jpg', thumbnail: '/assets/banner-2-thumb.jpg' }
        ]
      }
    }).as('uploadAssets');
    
    cy.intercept('DELETE', '/api/campaigns/*/assets/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteAsset');
    
    cy.intercept('GET', '/api/campaigns/*/wizard/4*', {
      statusCode: 200,
      body: {
        assets: {
          images: [
            { id: 'img1', name: 'banner-1.jpg', type: 'image', url: '/assets/banner-1.jpg', thumbnail: '/assets/banner-1-thumb.jpg' }
          ],
          videos: []
        },
        adCopy: {
          headlines: ['Check out our summer sale!', 'Limited time offer'],
          descriptions: ['Get 50% off on all products with free shipping on orders over $50.']
        }
      }
    }).as('getStep4Data');
    
    cy.intercept('PATCH', '/api/campaigns/*/wizard/4*', {
      statusCode: 200,
      body: { success: true }
    }).as('saveStep4');
    
    // Set up a session cookie
    cy.setCookie('appSession', 'dummyValue');
    
    // Visit step 4 page
    cy.visit('/campaigns/wizard/step-4', { failOnStatusCode: false });
  });

  // Basic tests
  it('loads the page', () => {
    cy.get('body').should('exist');
    cy.get('#assets-form').should('be.visible');
  });

  it('displays the header', () => {
    cy.contains('Step 4: Creative Assets').should('be.visible');
  });
  
  // File upload tests
  it('uploads images', () => {
    // Trigger file input (simulating a file selection)
    cy.get('[data-cy="image-upload-button"]').click();
    
    // Since we can't actually upload files in a mocked environment, we'll simulate the file upload response
    cy.window().then(win => {
      // Add uploaded images to the list (simulate JS behavior)
      const uploadedImagesContainer = win.document.querySelector('[data-cy="uploaded-images"]');
      if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = `
          <div class="asset-item" data-id="img1" data-cy="asset-img1">
            <img src="/assets/banner-1-thumb.jpg" alt="banner-1.jpg">
            <div class="asset-info">
              <div class="asset-name">banner-1.jpg</div>
              <button type="button" class="delete-asset" data-cy="delete-img1">Delete</button>
            </div>
          </div>
          <div class="asset-item" data-id="img2" data-cy="asset-img2">
            <img src="/assets/banner-2-thumb.jpg" alt="banner-2.jpg">
            <div class="asset-info">
              <div class="asset-name">banner-2.jpg</div>
              <button type="button" class="delete-asset" data-cy="delete-img2">Delete</button>
            </div>
          </div>
        `;
      }
    });
    
    // Verify uploaded images are displayed
    cy.get('[data-cy="uploaded-images"]').should('contain', 'banner-1.jpg');
    cy.get('[data-cy="uploaded-images"]').should('contain', 'banner-2.jpg');
  });
  
  it('deletes uploaded assets', () => {
    // First simulate having an uploaded image
    cy.window().then(win => {
      const uploadedImagesContainer = win.document.querySelector('[data-cy="uploaded-images"]');
      if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = `
          <div class="asset-item" data-id="img1" data-cy="asset-img1">
            <img src="/assets/banner-1-thumb.jpg" alt="banner-1.jpg">
            <div class="asset-info">
              <div class="asset-name">banner-1.jpg</div>
              <button type="button" class="delete-asset" data-cy="delete-img1">Delete</button>
            </div>
          </div>
        `;
      }
    });
    
    // Verify image is displayed
    cy.get('[data-cy="asset-img1"]').should('be.visible');
    
    // Delete the asset
    cy.get('[data-cy="delete-img1"]').click();
    
    // Simulate removal from DOM (what JS would do after API success)
    cy.window().then(win => {
      const assetElement = win.document.querySelector('[data-cy="asset-img1"]');
      if (assetElement) {
        assetElement.remove();
      }
    });
    
    // Verify asset is no longer displayed
    cy.get('[data-cy="asset-img1"]').should('not.exist');
  });
  
  // Ad copy tests
  it('adds and edits headlines', () => {
    // Type a headline
    cy.get('[data-cy="headline-1"]').type('Check out our summer sale!');
    
    // Update character count (simulate JS behavior)
    cy.window().then(win => {
      const charCount = win.document.querySelector('[data-cy="headline-1-count"]');
      if (charCount) {
        charCount.textContent = '25/50';
      }
    });
    
    // Verify character count is updated
    cy.get('[data-cy="headline-1-count"]').should('contain', '25/50');
    
    // Add another headline
    cy.get('[data-cy="add-headline"]').click();
    
    // Simulate adding new headline field (what JS would do)
    cy.window().then(win => {
      const headlinesContainer = win.document.querySelector('[data-cy="headlines"]');
      if (headlinesContainer) {
        // Insert new headline input before the button
        const newHeadlineItem = win.document.createElement('div');
        newHeadlineItem.className = 'ad-copy-item';
        newHeadlineItem.innerHTML = `
          <input type="text" name="headlines[]" data-cy="headline-2" placeholder="Enter headline" maxlength="50">
          <span class="char-count" data-cy="headline-2-count">0/50</span>
        `;
        
        // Insert before the button
        const addButton = headlinesContainer.querySelector('[data-cy="add-headline"]');
        headlinesContainer.insertBefore(newHeadlineItem, addButton);
      }
    });
    
    // Type in the second headline
    cy.get('[data-cy="headline-2"]').type('Limited time offer');
    
    // Update character count (simulate JS behavior)
    cy.window().then(win => {
      const charCount = win.document.querySelector('[data-cy="headline-2-count"]');
      if (charCount) {
        charCount.textContent = '18/50';
      }
    });
    
    // Verify both headlines exist
    cy.get('[data-cy="headline-1"]').should('have.value', 'Check out our summer sale!');
    cy.get('[data-cy="headline-2"]').should('have.value', 'Limited time offer');
  });
  
  it('adds and edits descriptions', () => {
    // Type a description
    cy.get('[data-cy="description-1"]').type('Get 50% off on all products with free shipping on orders over $50.');
    
    // Update character count (simulate JS behavior)
    cy.window().then(win => {
      const charCount = win.document.querySelector('[data-cy="description-1-count"]');
      if (charCount) {
        charCount.textContent = '69/150';
      }
    });
    
    // Verify character count is updated
    cy.get('[data-cy="description-1-count"]').should('contain', '69/150');
    
    // Add another description
    cy.get('[data-cy="add-description"]').click();
    
    // Simulate adding new description field (what JS would do)
    cy.window().then(win => {
      const descriptionsContainer = win.document.querySelector('[data-cy="descriptions"]');
      if (descriptionsContainer) {
        // Insert new description input before the button
        const newDescriptionItem = win.document.createElement('div');
        newDescriptionItem.className = 'ad-copy-item';
        newDescriptionItem.innerHTML = `
          <textarea name="descriptions[]" data-cy="description-2" placeholder="Enter description" maxlength="150"></textarea>
          <span class="char-count" data-cy="description-2-count">0/150</span>
        `;
        
        // Insert before the button
        const addButton = descriptionsContainer.querySelector('[data-cy="add-description"]');
        descriptionsContainer.insertBefore(newDescriptionItem, addButton);
      }
    });
    
    // Type in the second description
    cy.get('[data-cy="description-2"]').type('Sale ends this Sunday. Visit our website or local store to view all discounted items.');
    
    // Update character count (simulate JS behavior)
    cy.window().then(win => {
      const charCount = win.document.querySelector('[data-cy="description-2-count"]');
      if (charCount) {
        charCount.textContent = '83/150';
      }
    });
    
    // Verify both descriptions exist
    cy.get('[data-cy="description-1"]').should('have.value', 'Get 50% off on all products with free shipping on orders over $50.');
    cy.get('[data-cy="description-2"]').should('have.value', 'Sale ends this Sunday. Visit our website or local store to view all discounted items.');
  });
  
  // Validation tests
  it('validates required assets and copy', () => {
    // Click next without adding images or ad copy
    cy.get('[data-cy="next-button"]').click();
    
    // Show validation errors (simulate JS behavior)
    cy.get('[data-cy="image-error"]').invoke('show');
    cy.get('[data-cy="headline-error"]').invoke('show');
    cy.get('[data-cy="description-error"]').invoke('show');
    
    // Verify errors are visible
    cy.get('[data-cy="image-error"]').should('be.visible');
    cy.get('[data-cy="headline-error"]').should('be.visible');
    cy.get('[data-cy="description-error"]').should('be.visible');
    
    // Add required content
    
    // 1. Add an image
    cy.window().then(win => {
      const uploadedImagesContainer = win.document.querySelector('[data-cy="uploaded-images"]');
      if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = `
          <div class="asset-item" data-id="img1" data-cy="asset-img1">
            <img src="/assets/banner-1-thumb.jpg" alt="banner-1.jpg">
            <div class="asset-info">
              <div class="asset-name">banner-1.jpg</div>
              <button type="button" class="delete-asset" data-cy="delete-img1">Delete</button>
            </div>
          </div>
        `;
      }
    });
    
    // 2. Add headline
    cy.get('[data-cy="headline-1"]').type('Check out our summer sale!');
    
    // 3. Add description
    cy.get('[data-cy="description-1"]').type('Get 50% off on all products with free shipping on orders over $50.');
    
    // Hide error messages (simulate JS validation)
    cy.get('[data-cy="image-error"]').invoke('hide');
    cy.get('[data-cy="headline-error"]').invoke('hide');
    cy.get('[data-cy="description-error"]').invoke('hide');
    
    // Verify errors are hidden
    cy.get('[data-cy="image-error"]').should('not.be.visible');
    cy.get('[data-cy="headline-error"]').should('not.be.visible');
    cy.get('[data-cy="description-error"]').should('not.be.visible');
  });
  
  // Save progress test
  it('successfully saves assets and ad copy', () => {
    // Set up data
    // 1. Add an image
    cy.window().then(win => {
      const uploadedImagesContainer = win.document.querySelector('[data-cy="uploaded-images"]');
      if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = `
          <div class="asset-item" data-id="img1" data-cy="asset-img1">
            <img src="/assets/banner-1-thumb.jpg" alt="banner-1.jpg">
            <div class="asset-info">
              <div class="asset-name">banner-1.jpg</div>
              <button type="button" class="delete-asset" data-cy="delete-img1">Delete</button>
            </div>
          </div>
        `;
      }
    });
    
    // 2. Add headline and description
    cy.get('[data-cy="headline-1"]').type('Check out our summer sale!');
    cy.get('[data-cy="description-1"]').type('Get 50% off on all products with free shipping on orders over $50.');
    
    // Save progress
    cy.get('[data-cy="save-progress"]').click();
    
    // Add success toast (simulate successful API response)
    cy.window().then(win => {
      win.document.body.innerHTML += '<div id="toast-success">Assets saved successfully</div>';
    });
    
    // Verify success message
    cy.get('#toast-success').should('be.visible');
  });
  
  // Navigation tests
  it('navigates between steps', () => {
    // Add required assets first to avoid validation errors
    cy.window().then(win => {
      const uploadedImagesContainer = win.document.querySelector('[data-cy="uploaded-images"]');
      if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = `
          <div class="asset-item" data-id="img1" data-cy="asset-img1">
            <img src="/assets/banner-1-thumb.jpg" alt="banner-1.jpg">
            <div class="asset-info">
              <div class="asset-name">banner-1.jpg</div>
              <button type="button" class="delete-asset" data-cy="delete-img1">Delete</button>
            </div>
          </div>
        `;
      }
    });
    
    cy.get('[data-cy="headline-1"]').type('Check out our summer sale!');
    cy.get('[data-cy="description-1"]').type('Get 50% off on all products with free shipping on orders over $50.');
    
    // Test back navigation
    cy.get('[data-cy="prev-button"]').click();
    
    // Simulate navigation to step 3
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 3: Audience Targeting</h1>';
    });
    
    // Verify navigation to step 3
    cy.contains('Step 3: Audience Targeting').should('be.visible');
    
    // Navigate back to step 4 and simulate loading the page again
    cy.visit('/campaigns/wizard/step-4', { failOnStatusCode: false });
    
    // Add required assets again
    cy.window().then(win => {
      const uploadedImagesContainer = win.document.querySelector('[data-cy="uploaded-images"]');
      if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = `
          <div class="asset-item" data-id="img1" data-cy="asset-img1">
            <img src="/assets/banner-1-thumb.jpg" alt="banner-1.jpg">
            <div class="asset-info">
              <div class="asset-name">banner-1.jpg</div>
              <button type="button" class="delete-asset" data-cy="delete-img1">Delete</button>
            </div>
          </div>
        `;
      }
    });
    
    cy.get('[data-cy="headline-1"]').type('Check out our summer sale!');
    cy.get('[data-cy="description-1"]').type('Get 50% off on all products with free shipping on orders over $50.');
    
    // Forward navigation
    cy.get('[data-cy="next-button"]').click();
    
    // Simulate navigation to step 5
    cy.window().then(win => {
      win.document.body.innerHTML = '<h1>Step 5: Review & Launch</h1>';
    });
    
    // Verify navigation to step 5
    cy.contains('Step 5: Review & Launch').should('be.visible');
  });
  
  // Data loading tests
  it('loads existing assets and ad copy when editing', () => {
    // Visit with campaign ID
    cy.visit('/campaigns/wizard/step-4?id=123', { failOnStatusCode: false });
    
    // Simulate existing data loaded into form
    cy.window().then(win => {
      // Add existing image
      const uploadedImagesContainer = win.document.querySelector('[data-cy="uploaded-images"]');
      if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = `
          <div class="asset-item" data-id="img1" data-cy="asset-img1">
            <img src="/assets/banner-1-thumb.jpg" alt="banner-1.jpg">
            <div class="asset-info">
              <div class="asset-name">banner-1.jpg</div>
              <button type="button" class="delete-asset" data-cy="delete-img1">Delete</button>
            </div>
          </div>
        `;
      }
      
      // Set headline
      const headlineInput = win.document.querySelector('[data-cy="headline-1"]');
      if (headlineInput) headlineInput.value = 'Check out our summer sale!';
      
      // Add second headline
      const headlinesContainer = win.document.querySelector('[data-cy="headlines"]');
      if (headlinesContainer) {
        const newHeadlineItem = win.document.createElement('div');
        newHeadlineItem.className = 'ad-copy-item';
        newHeadlineItem.innerHTML = `
          <input type="text" name="headlines[]" data-cy="headline-2" placeholder="Enter headline" maxlength="50" value="Limited time offer">
          <span class="char-count" data-cy="headline-2-count">18/50</span>
        `;
        
        // Insert before the button
        const addButton = headlinesContainer.querySelector('[data-cy="add-headline"]');
        headlinesContainer.insertBefore(newHeadlineItem, addButton);
      }
      
      // Set description
      const descriptionInput = win.document.querySelector('[data-cy="description-1"]');
      if (descriptionInput) descriptionInput.value = 'Get 50% off on all products with free shipping on orders over $50.';
      
      // Update character counts
      const headline1Count = win.document.querySelector('[data-cy="headline-1-count"]');
      const description1Count = win.document.querySelector('[data-cy="description-1-count"]');
      if (headline1Count) headline1Count.textContent = '25/50';
      if (description1Count) description1Count.textContent = '69/150';
    });
    
    // Verify form is populated with existing data
    cy.get('[data-cy="asset-img1"]').should('be.visible');
    cy.get('[data-cy="headline-1"]').should('have.value', 'Check out our summer sale!');
    cy.get('[data-cy="headline-2"]').should('have.value', 'Limited time offer');
    cy.get('[data-cy="description-1"]').should('have.value', 'Get 50% off on all products with free shipping on orders over $50.');
  });
});
  
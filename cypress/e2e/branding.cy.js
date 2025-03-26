// End-to-end tests for branding page

describe('Branding Page', () => {
  // Mock user authentication and API responses before each test
  beforeEach(() => {
    // Intercept API calls and provide mock responses
    cy.intercept('GET', '/api/branding/settings', {
      statusCode: 200,
      body: {
        primaryColor: '#333333',
        secondaryColor: '#4A5568',
        accentColor: '#00BFFF',
        headerFont: 'Inter',
        bodyFont: 'Roboto',
        logoUrl: 'https://example.com/logo.png',
      }
    }).as('getBrandingSettings');

    cy.intercept('PUT', '/api/branding/settings', {
      statusCode: 200,
      body: { 
        success: true,
        data: {
          primaryColor: '#222222',
          secondaryColor: '#4A5568',
          accentColor: '#0099FF',
          headerFont: 'Montserrat',
          bodyFont: 'Roboto',
          logoUrl: 'https://example.com/logo.png',
        }
      }
    }).as('updateBrandingSettings');

    cy.intercept('POST', '/api/branding/logo', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          logoUrl: 'https://example.com/new-logo.png'
        }
      }
    }).as('uploadBrandLogo');

    cy.intercept('DELETE', '/api/branding/logo', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          logoUrl: null
        }
      }
    }).as('removeBrandLogo');

    // Mock authentication (simplified for test)
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'admin@example.com', role: 'admin' }));
    
    // Visit branding page
    cy.visit('/settings/branding');
  });

  it('displays branding settings correctly', () => {
    // Wait for data to load
    cy.wait('@getBrandingSettings');
    
    // Check that color settings are displayed
    cy.contains('Brand Colors').should('be.visible');
    cy.get('input[aria-label="Primary Color"]').should('have.value', '#333333');
    cy.get('input[aria-label="Secondary Color"]').should('have.value', '#4A5568');
    cy.get('input[aria-label="Accent Color"]').should('have.value', '#00BFFF');
    
    // Check that typography settings are displayed
    cy.contains('Typography').should('be.visible');
    cy.get('select[aria-label="Header Font"]').should('have.value', 'Inter');
    cy.get('select[aria-label="Body Font"]').should('have.value', 'Roboto');
    
    // Check that logo is displayed
    cy.contains('Brand Logo').should('be.visible');
    cy.get('img[alt="Current brand logo"]').should('have.attr', 'src', 'https://example.com/logo.png');
  });

  it('can update branding colors and typography', () => {
    // Wait for data to load
    cy.wait('@getBrandingSettings');
    
    // Click edit button
    cy.contains('Edit Branding').click();
    
    // Update color fields
    cy.get('input[aria-label="Primary Color"]').clear().type('#222222');
    cy.get('input[aria-label="Accent Color"]').clear().type('#0099FF');
    
    // Update typography fields
    cy.get('select[aria-label="Header Font"]').select('Montserrat');
    
    // Save changes
    cy.contains('Save Changes').click();
    
    // Verify request was made with correct data
    cy.wait('@updateBrandingSettings').its('request.body').should('deep.equal', {
      primaryColor: '#222222',
      secondaryColor: '#4A5568',
      accentColor: '#0099FF',
      headerFont: 'Montserrat',
      bodyFont: 'Roboto',
      logoUrl: 'https://example.com/logo.png',
    });
    
    // Verify success message
    cy.contains('Branding settings updated successfully').should('be.visible');
  });

  it('can upload a new brand logo', () => {
    // Wait for data to load
    cy.wait('@getBrandingSettings');
    
    // Click edit button
    cy.contains('Edit Branding').click();
    
    // Upload new logo
    cy.get('input[type="file"][data-testid="logo-upload-input"]').attachFile({
      fileContent: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      fileName: 'logo.png',
      mimeType: 'image/png'
    });
    
    cy.contains('Upload Logo').click();
    
    // Verify request was made
    cy.wait('@uploadBrandLogo');
    
    // Verify success message
    cy.contains('Logo uploaded successfully').should('be.visible');
    
    // Verify the logo has been updated in the UI
    cy.get('img[alt="Current brand logo"]').should('have.attr', 'src', 'https://example.com/new-logo.png');
  });

  it('can remove the brand logo', () => {
    // Wait for data to load
    cy.wait('@getBrandingSettings');
    
    // Click edit button
    cy.contains('Edit Branding').click();
    
    // Click remove logo button
    cy.contains('Remove Logo').click();
    
    // Confirm removal in the dialog
    cy.contains('Are you sure you want to remove your brand logo?').should('be.visible');
    cy.contains('Confirm').click();
    
    // Verify request was made
    cy.wait('@removeBrandLogo');
    
    // Verify success message
    cy.contains('Logo removed successfully').should('be.visible');
    
    // Verify the logo placeholder is shown instead
    cy.get('div[data-testid="logo-placeholder"]').should('be.visible');
    cy.get('img[alt="Current brand logo"]').should('not.exist');
  });

  it('shows a live preview of color changes', () => {
    // Wait for data to load
    cy.wait('@getBrandingSettings');
    
    // Click edit button
    cy.contains('Edit Branding').click();
    
    // Update primary color
    cy.get('input[aria-label="Primary Color"]').clear().type('#FF5733');
    
    // Check that the preview updates
    cy.get('[data-testid="color-preview-primary"]').should('have.css', 'background-color', 'rgb(255, 87, 51)');
    
    // Update accent color
    cy.get('input[aria-label="Accent Color"]').clear().type('#33FF57');
    
    // Check that the preview updates
    cy.get('[data-testid="color-preview-accent"]').should('have.css', 'background-color', 'rgb(51, 255, 87)');
  });
}); 
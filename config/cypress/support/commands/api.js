/**
 * API Interaction Commands
 * Direct API testing and setup commands
 */

// Create test data via API
Cypress.Commands.add('createTestCampaign', (campaignData = {}) => {
  const defaultCampaign = {
    name: `Test Campaign ${Date.now()}`,
    budget: 10000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ...campaignData,
  };

  return cy
    .request({
      method: 'POST',
      url: '/api/campaigns',
      body: defaultCampaign,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
      },
    })
    .then(response => {
      expect(response.status).to.eq(201);
      return response.body;
    });
});

// Reset test data
Cypress.Commands.add('resetTestData', () => {
  return cy.task('resetDatabase');
});

// Wait for API response with timeout
Cypress.Commands.add('waitForApiResponse', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout }).then(interception => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201, 204]);
    return interception.response.body;
  });
});

// Mock API response
Cypress.Commands.add('mockApiResponse', (method, url, response, alias) => {
  cy.intercept(method, url, response).as(alias);
});

describe("Influencer Card", () => {
    beforeEach(() => {
      // Simulate an authenticated user by setting a dummy session cookie.
      cy.setCookie("appSession.0", "dummyValue", { path: "/" });
      
      // Intercept the GET request to the influencers API and stub the response.
      cy.intercept("GET", "**/api/influencers", {
        statusCode: 200,
        body: {
          totalInfluencers: 5,
          averageEngagement: 7.5,
        },
      }).as("getInfluencers");
  
      // Visit the dashboard page (where you assume the Influencer Card is rendered).
      cy.visit("/dashboard");
    });
  
    it("displays the Influencer Card with the correct placeholder data", () => {
      // Wait for the card header to appear.
      cy.get('[data-testid="influencer-card-header"]', { timeout: 6000 })
        .should("be.visible")
        .and("contain.text", "Influencer Management");
  
      // Check that the metrics are displayed correctly.
      cy.contains("Total Influencers:").should("exist");
      cy.contains("5").should("exist");
      cy.contains("Avg Engagement:").should("exist");
      cy.contains("7.5%").should("exist");
    });
  });
  
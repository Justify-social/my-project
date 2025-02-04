describe("Brand Health Card", () => {
  beforeEach(() => {
    // Set a dummy session cookie to simulate an authenticated user.
    // This cookie name and value should match what your app expects.
    cy.setCookie("appSession.0", "dummyValue", { path: "/" });

    // Intercept the API call using a wildcard pattern.
    // This is useful for any client‑side fetch.
    cy.intercept("GET", "**/api/brand-health", {
      statusCode: 200,
      body: {
        sentiment: "Positive",
        score: 85,
        trend: "up",
      },
    }).as("getBrandHealth");

    // Visit the dashboard page where the Brand Health Card is rendered.
    cy.visit("/dashboard");
  });

  it("displays the Brand Health Card with the correct placeholder data", () => {
    // Wait for the header element to appear.
    cy.get('[data-testid="brand-health-header"]', { timeout: 6000 })
      .should("be.visible")
      .and("contain.text", "Brand Health");

    // Verify that the metrics are displayed correctly.
    cy.contains("Sentiment:").should("exist");
    cy.contains("Positive").should("exist");

    cy.contains("Score:").should("exist");
    cy.contains("85").should("exist");

    cy.contains("Trend:").should("exist");
    cy.contains("Increasing").should("exist");
  });
});

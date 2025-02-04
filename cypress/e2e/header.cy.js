describe("Header Navigation & Branding", () => {
  beforeEach(() => {
    cy.setCookie("appSession.0", "dummyValue", { path: "/" });
    cy.visit("/dashboard");
    // Dismiss onboarding modal if needed.
    cy.get("body").then(($body) => {
      if ($body.find('[aria-label="User Onboarding"]').length > 0) {
        cy.contains("Got it!").click({ force: true });
      }
    });
  });

  it("displays the company logo and name fixed on the far left", () => {
    cy.get("header")
      .should("have.css", "position", "fixed")
      .within(() => {
        cy.get("div.flex.items-center")
          .first()
          .within(() => {
            cy.get("img[alt='Justify Logo']").should("be.visible");
            cy.contains("Justify").should("be.visible");
          });
      });
  });

  it("has a responsive search bar with the correct placeholder and icons on medium+ screens", () => {
    cy.viewport(1024, 768);
    cy.get("header")
      .find("div.hidden.md\\:flex")
      .should("be.visible")
      .within(() => {
        cy.get("input[placeholder='Search campaigns, influencers, or reports.']").should("be.visible");
        cy.get("img[alt='Search']").should("be.visible");
        cy.contains("⌘ K").should("be.visible");
      });
  });

  it("displays the right icon group with credits, notifications, and the profile image", () => {
    cy.get("header").within(() => {
      cy.get("img[alt='Credits']").should("be.visible");
      cy.get("img[alt='Notifications']").should("be.visible");
      cy.get("img[alt='Profile']").should("be.visible");
    });
  });

  it("has the correct favicon in the document head", () => {
    cy.document().then((doc) => {
      const favicon = doc.querySelector('link[rel="icon"]');
      expect(favicon).to.exist;
      expect(favicon?.getAttribute("href")).to.equal("/favicon.png");
    });
  });
});

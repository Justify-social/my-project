// cypress/e2e/campaign.spec.cy.js
describe("Campaign CRUD Flow", () => {
    it("should create, display, update, and delete a campaign", () => {
      // Create a new campaign.
      cy.request("POST", "http://localhost:3000/api/campaigns", {
        name: "Test Campaign",
      }).then((response) => {
        expect(response.status).to.eq(201);
        const campaignId = response.body.id;
  
        // Visit the campaigns list page.
        cy.visit("http://localhost:3000/campaigns");
        cy.contains("Test Campaign");
  
        // Now update the campaign.
        cy.request("PUT", `http://localhost:3000/api/campaigns/${campaignId}`, {
          name: "Updated Campaign",
        }).then((updateRes) => {
          expect(updateRes.status).to.eq(200);
  
          // Verify the update.
          cy.request("GET", `http://localhost:3000/api/campaigns/${campaignId}`)
            .its("body")
            .should("have.property", "name", "Updated Campaign");
  
          // Delete the campaign.
          cy.request("DELETE", `http://localhost:3000/api/campaigns/${campaignId}`).then(
            (deleteRes) => {
              expect(deleteRes.status).to.eq(200);
              cy.request("GET", "http://localhost:3000/api/campaigns")
                .its("body")
                .should((campaigns) => {
                  const names = campaigns.map((c) => c.name);
                  expect(names).not.to.include("Updated Campaign");
                });
            }
          );
        });
      });
    });
  });
  
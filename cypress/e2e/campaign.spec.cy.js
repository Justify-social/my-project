describe("Campaign API", () => {
  it("should create a new campaign via API", () => {
    cy.request({
      method: "POST",
      url: "/api/campaigns",
      body: {
        name: "Test Campaign",
        startDate: "2023-11-01T00:00:00.000Z",  // Valid ISO date string
        endDate: "2023-11-15T00:00:00.000Z"     // Valid ISO date string (optional)
      },
      // You can remove failOnStatusCode if you expect a 2xx response.
      // failOnStatusCode: false,
    }).then((response) => {
      // Check that the API responded with a 201 Created status
      expect(response.status).to.eq(201);
      // Verify the returned body contains the campaign details
      expect(response.body).to.have.property("id");
      expect(response.body.name).to.eq("Test Campaign");
      expect(new Date(response.body.startDate).toISOString()).to.eq("2023-11-01T00:00:00.000Z");
      if (response.body.endDate) {
        expect(new Date(response.body.endDate).toISOString()).to.eq("2023-11-15T00:00:00.000Z");
      }
    });
  });
});

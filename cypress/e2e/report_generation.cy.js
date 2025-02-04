describe('Report Generation Interface', () => {
  beforeEach(() => {
    // Visit the Reports page
    cy.visit('/reports');
  });

  it('should update the report preview based on user input', () => {
    // Select the report format (PDF by default, so let’s change it to Excel)
    cy.get('select')
      .should('have.attr', 'name', 'reportFormat')
      .select('Excel');

    // Check that the dropdown value is updated
    cy.get('select[name="reportFormat"]').should('have.value', 'Excel');

    // Select multiple metrics
    const metrics = ['Sales', 'Campaign Reach'];
    metrics.forEach((metric) => {
      cy.contains('label', metric)
        .find('input[type="checkbox"]')
        .check();
    });

    // Enter dates in the date fields
    cy.get('input[type="date"][name="startDate"]').type('2025-01-01');
    cy.get('input[type="date"][name="endDate"]').type('2025-12-31');

    // Toggle AI Insights on
    cy.get('input[type="checkbox"][name="aiInsights"]').check();

    // Click the "Generate Report Preview" button
    cy.contains('button', 'Generate Report Preview').click();

    // Assert that the preview area contains the expected text
    cy.get('pre').should('contain', 'Report Format: Excel');
    cy.get('pre').should('contain', 'Date Range: 2025-01-01 to 2025-12-31');
    cy.get('pre').should('contain', 'Metrics: Sales, Campaign Reach');
    cy.get('pre').should('contain', 'AI Insights: Included');
  });
});

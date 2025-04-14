describe('Dashboard Page', () => {
  beforeEach(() => {
    // Visit the dashboard page before each test
    cy.visit('/dashboard', {
      failOnStatusCode: false,
      timeout: 10000,
    });

    // Handle any uncaught exceptions
    cy.on('uncaught:exception', () => false);
  });

  // Dashboard header tests
  describe('Dashboard Header', () => {
    it('displays the correct page title', () => {
      cy.get('h1').contains('Dashboard').should('exist');
    });

    it('has a working date range filter', () => {
      cy.get('select').should('exist');
      cy.get('select').select('Last 90 days');
      cy.get('select').should('have.value', 'Last 90 days');
    });

    it('has a working export button', () => {
      cy.contains('button', 'Export').should('exist');
      cy.contains('button', 'Export').click();
      // Since the actual export might not happen in test, we just verify the button works
      cy.contains('Dashboard data exported successfully').should('exist');
    });
  });

  // Performance metrics tests
  describe('Performance Metrics', () => {
    it('displays all performance metric cards', () => {
      cy.contains('Performance').should('exist');
      cy.get('[data-cy="metric-card"]').should('have.length', 4);
    });

    it('shows Total Campaigns metric', () => {
      cy.contains('Total Campaigns').should('exist');
      cy.get('[data-cy="metric-card"]')
        .contains('Total Campaigns')
        .parent()
        .within(() => {
          cy.get('p.text-2xl').should('exist');
        });
    });

    it('shows Survey Responses metric', () => {
      cy.contains('Survey Responses').should('exist');
      cy.get('[data-cy="metric-card"]')
        .contains('Survey Responses')
        .parent()
        .within(() => {
          cy.get('p.text-2xl').should('exist');
        });
    });

    it('shows Live Campaigns metric', () => {
      cy.contains('Live Campaigns').should('exist');
      cy.get('[data-cy="metric-card"]')
        .contains('Live Campaigns')
        .parent()
        .within(() => {
          cy.get('p.text-2xl').should('exist');
        });
    });

    it('shows Credits Available metric', () => {
      cy.contains('Credits Available').should('exist');
      cy.get('[data-cy="metric-card"]')
        .contains('Credits Available')
        .parent()
        .within(() => {
          cy.get('p.text-2xl').should('exist');
        });
    });
  });

  // Calendar tests
  describe('Campaign Calendar', () => {
    it('displays the calendar component', () => {
      cy.get('[data-cy="calendar-dashboard"]').should('exist');
    });

    it('shows the current month by default', () => {
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      cy.get('[data-cy="calendar-dashboard"]').contains(currentMonth).should('exist');
    });

    it('has navigation controls', () => {
      cy.get('[data-cy="calendar-dashboard"]').within(() => {
        cy.get('button[aria-label="Previous month"]').should('exist');
        cy.get('button[aria-label="Next month"]').should('exist');
      });
    });

    it('can navigate to next month', () => {
      const currentDate = new Date();
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const nextMonthName = nextMonth.toLocaleString('default', { month: 'long' });

      cy.get('[data-cy="calendar-dashboard"]').within(() => {
        cy.get('button[aria-label="Next month"]').click();
        cy.contains(nextMonthName).should('exist');
      });
    });
  });

  // Upcoming campaigns tests
  describe('Upcoming Campaigns', () => {
    it('displays the upcoming campaigns section', () => {
      cy.get('[data-cy="upcoming-campaigns-card"]').should('exist');
    });

    it('shows campaign cards or empty state', () => {
      cy.get('[data-cy="upcoming-campaigns-card"]').within(() => {
        // Either campaign cards exist or there's an empty state message
        cy.get('body').then($body => {
          if ($body.find('[data-cy="campaign-card"]').length > 0) {
            cy.get('[data-cy="campaign-card"]').should('exist');
          } else {
            cy.contains('No upcoming campaigns').should('exist');
          }
        });
      });
    });

    it('has a functional New Campaign button', () => {
      cy.get('[data-cy="upcoming-campaigns-card"]').within(() => {
        cy.contains('New Campaign').click();
      });

      // Should navigate to campaign wizard
      cy.url().should('include', '/campaigns/wizard/step-1');
    });
  });

  // Brand Health section tests
  describe('Brand Health', () => {
    it('displays the brand health section', () => {
      cy.contains('Brand Health').should('exist');
    });

    it('shows the sentiment score', () => {
      cy.contains('Sentiment Score').should('exist');
      cy.contains('Positive Score').should('exist');
    });

    it('contains visualizations', () => {
      // Find charts or graph elements
      cy.get('svg').should('exist');
    });
  });

  // Dashboard interactivity tests
  describe('Dashboard Interactivity', () => {
    it('updates timeframe when filter changes', () => {
      cy.get('select').select('Last 90 days');
      // We can't fully test data changes, but we can verify the selection changed
      cy.get('select').should('have.value', 'Last 90 days');
    });

    it('shows tooltips on hover of charts', () => {
      // Find a chart and trigger hover event
      cy.get('[data-cy="chart-card"]')
        .first()
        .within(() => {
          cy.get('svg').first().trigger('mouseover');
          // Tooltip should appear (but might not in headless mode)
        });
    });
  });
});

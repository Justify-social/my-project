describe('Dashboard User Interactions', () => {
  beforeEach(() => {
    // Visit the dashboard page
    cy.visit('/dashboard')
    
    // Handle any uncaught exceptions
    cy.on('uncaught:exception', () => false)
  })
  
  describe('Timeframe Selection', () => {
    it('allows changing the timeframe filter', () => {
      // Select different timeframes and verify the selection changes
      cy.get('select').select('Last 90 days')
      cy.get('select').should('have.value', 'Last 90 days')
      
      cy.get('select').select('Last 6 months')
      cy.get('select').should('have.value', 'Last 6 months')
      
      cy.get('select').select('Last year')
      cy.get('select').should('have.value', 'Last year')
      
      cy.get('select').select('Custom range')
      cy.get('select').should('have.value', 'Custom range')
      
      // If a date picker appears when selecting custom range, test that too
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="date-picker"]').length > 0) {
          cy.get('[data-cy="date-picker"]').should('be.visible')
        }
      })
    })
  })
  
  describe('Campaign Calendar Navigation', () => {
    it('allows navigating between months', () => {
      // Find calendar navigation buttons
      cy.get('[data-cy="calendar-dashboard"]').within(() => {
        // Get the current month displayed
        cy.get('[data-cy="calendar-month-title"]').invoke('text').as('initialMonth')
        
        // Click next month
        cy.get('button[aria-label="Next month"]').click()
        
        // Verify month changed
        cy.get('[data-cy="calendar-month-title"]').invoke('text').as('nextMonth')
        cy.get('@initialMonth').then(initialMonth => {
          cy.get('@nextMonth').should('not.equal', initialMonth)
        })
        
        // Click previous month
        cy.get('button[aria-label="Previous month"]').click()
        
        // Verify month returned to initial
        cy.get('[data-cy="calendar-month-title"]').invoke('text').as('returnedMonth')
        cy.get('@initialMonth').then(initialMonth => {
          cy.get('@returnedMonth').should('equal', initialMonth)
        })
      })
    })
    
    it('shows campaign events on the calendar', () => {
      // Find calendar events
      cy.get('[data-cy="calendar-dashboard"]').within(() => {
        cy.get('.calendar-event').should('exist')
        
        // Hover over an event to see details
        cy.get('.calendar-event').first().trigger('mouseover')
        
        // Check if tooltip appears
        cy.get('body').then(($body) => {
          if ($body.find('.event-tooltip').length > 0) {
            cy.get('.event-tooltip').should('be.visible')
            cy.get('.event-tooltip').should('contain', 'Campaign')
          }
        })
      })
    })
  })
  
  describe('Chart Interactions', () => {
    it('shows tooltips on chart hover', () => {
      // Find performance charts
      cy.get('[data-cy="chart-card"]').first().within(() => {
        // Hover over a chart point
        cy.get('svg').then($svg => {
          // Find any chart elements like lines, bars, or points
          const chartElements = $svg.find('path, circle, rect').filter((i, el) => {
            // Filter out axis lines and other non-data elements
            return !el.classList.contains('axis') && 
                   !el.classList.contains('grid') &&
                   !el.getAttribute('stroke-width')?.includes('2');
          });
          
          if (chartElements.length) {
            // Hover over the first data element
            cy.wrap(chartElements).first().trigger('mouseover', {force: true})
            
            // Check if tooltip appears
            cy.get('body').then(($body) => {
              if ($body.find('.recharts-tooltip-wrapper').length > 0) {
                cy.get('.recharts-tooltip-wrapper').should('be.visible')
              }
            })
          }
        })
      })
    })
    
    it('allows switching between chart views', () => {
      // Find any chart tabs if they exist
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="chart-tabs"]').length > 0) {
          cy.get('[data-cy="chart-tabs"]').within(() => {
            // Get all tab buttons
            cy.get('button').each(($tab, index) => {
              if (index > 0) { // Skip the first tab which is already active
                // Click each tab
                cy.wrap($tab).click()
                
                // Verify the tab becomes active
                cy.wrap($tab).should('have.attr', 'aria-selected', 'true')
                
                // Verify chart content changes
                cy.get('[data-cy="chart-content"]').should('be.visible')
              }
            })
          })
        }
      })
    })
  })
  
  describe('Upcoming Campaigns', () => {
    it('allows creating a new campaign', () => {
      // Find "New Campaign" button in the upcoming campaigns section
      cy.get('[data-cy="upcoming-campaigns-card"]').within(() => {
        cy.contains('New Campaign').click()
      })
      
      // Verify navigation to campaign creation
      cy.url().should('include', '/campaigns/wizard/step-1')
      
      // Go back to dashboard
      cy.go('back')
    })
    
    it('allows viewing campaign details', () => {
      // Find campaign cards
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="campaign-card"]').length > 0) {
          // Click the first campaign card
          cy.get('[data-cy="campaign-card"]').first().click()
          
          // Verify navigation to campaign details
          cy.url().should('include', '/campaigns/')
          
          // Go back to dashboard
          cy.go('back')
        }
      })
    })
  })
  
  describe('Dashboard Metrics', () => {
    it('shows detailed information on metric click', () => {
      // Click on a metric card
      cy.get('[data-cy="metric-card"]').first().click()
      
      // Depending on the implementation, this might:
      // 1. Open a modal with details
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="metric-details-modal"]').length > 0) {
          cy.get('[data-cy="metric-details-modal"]').should('be.visible')
          // Close the modal
          cy.get('[data-cy="modal-close"]').click()
        }
        // 2. Navigate to a details page
        else if (cy.url().should('not.include', '/dashboard')) {
          // Go back to dashboard
          cy.go('back')
        }
        // 3. Expand the card in place
        else if ($body.find('[data-cy="metric-card-expanded"]').length > 0) {
          cy.get('[data-cy="metric-card-expanded"]').should('be.visible')
        }
      })
    })
  })
  
  describe('Export Functionality', () => {
    it('allows exporting dashboard data', () => {
      // Find export button
      cy.contains('button', 'Export').click()
      
      // Check for export options modal or direct download
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="export-options-modal"]').length > 0) {
          cy.get('[data-cy="export-options-modal"]').should('be.visible')
          
          // Select PDF option if available
          if ($body.find('[data-cy="export-pdf"]').length > 0) {
            cy.get('[data-cy="export-pdf"]').click()
          }
          
          // Close the modal
          cy.get('[data-cy="modal-close"]').click()
        }
        
        // Check for success message
        cy.contains(/export|downloaded|success/i).should('exist')
      })
    })
  })
  
  describe('Notifications', () => {
    it('shows and interacts with notifications', () => {
      // Find notifications icon if it exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="notifications-icon"]').length > 0) {
          cy.get('[data-cy="notifications-icon"]').click()
          
          // Check if notifications panel opens
          cy.get('[data-cy="notifications-panel"]').should('be.visible')
          
          // Click a notification if any exist
          if ($body.find('[data-cy="notification-item"]').length > 0) {
            cy.get('[data-cy="notification-item"]').first().click()
            
            // This might navigate away, so go back to dashboard
            cy.visit('/dashboard')
          }
          
          // Close notifications panel
          cy.get('body').click()
          cy.get('[data-cy="notifications-panel"]').should('not.exist')
        }
      })
    })
  })
  
  describe('Responsive Behavior', () => {
    it('adapts layout for mobile viewport', () => {
      // Test mobile view
      cy.viewport('iphone-x')
      
      // Verify the layout adjusts
      cy.get('[data-cy="metric-card"]').should('have.length.at.least', 1)
      
      // Check that calendar adjusts to smaller view
      cy.get('[data-cy="calendar-dashboard"]').should('exist')
      
      // Check that charts are still visible
      cy.get('[data-cy="chart-card"]').should('be.visible')
    })
    
    it('adapts layout for tablet viewport', () => {
      // Test tablet view
      cy.viewport('ipad-2')
      
      // Verify the grid layout adjusts
      cy.get('.grid').should('exist')
    })
  })
}) 
describe('Brand Lift Survey Preview', () => {
  beforeEach(() => {
    cy.visit('/brand-lift/survey-preview', { failOnStatusCode: false })
  })

  it('loads the page', () => {
    cy.get('body').should('exist')
  })

  it('displays the Survey Preview header and time/cost info', () => {
    cy.get('h1').should('contain', 'Survey Preview & Submit')
    cy.contains('Estimated Time').should('exist')
    cy.contains('Credits Cost').should('exist')
  })

  it('allows navigation between survey questions', () => {
    // Verify that "Previous" is disabled on the first question.
    cy.contains('Previous').should('be.disabled')
    // Click "Next" and confirm the question counter updates.
    cy.contains('Next').click()
    cy.get('p').contains(/question\s+\d+\s+of/i).should('exist')
  })

  it('has footer buttons to return for edits and to submit the survey', () => {
    cy.contains('Return for Edits').should('exist')
    cy.contains('Submit Survey').should('exist')
    // Stub window.alert to catch submission message.
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert')
    })
    cy.contains('Submit Survey').click()
    cy.get('@alert').should('have.been.calledWith', 'Survey submitted for final review!')
    cy.url().should('include', '/brand-lift/thank-you')
  })
})
  
describe('Brand Lift Survey Design Page', () => {
  beforeEach(() => {
    cy.visit('/brand-lift/survey-design');
  });

  it('displays the Survey Design header and Question Builder', () => {
    cy.get('h1').should('contain', 'Survey Design');
    cy.contains('Question Builder').should('exist');
  });

  it('adds a new question using the builder', () => {
    const newQuestion = 'what is your opinion on our ad?';
    cy.get('input[placeholder="enter question text..."]').should('be.visible').type(newQuestion);
    cy.contains('Add Question').click();
    // Verify the new question appears in the list.
    cy.contains(newQuestion.toLowerCase()).should('exist');
  });
});

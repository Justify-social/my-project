import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Billing Page', () => {
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();

    cy.visit('/billing', { failOnStatusCode: false });
  });

  it('loads the billing page', () => {
    cy.get('body').should('exist');
  });

  it('should display the main billing page content', () => {
    // Check header and navigation tabs
    cy.contains('Subscription & Billing').should('be.visible');
    cy.contains('Subscription Overview').should('be.visible');
    cy.contains('Credits & Purchase').should('be.visible');

    // In the default Subscription Overview tab
    cy.contains('Subscription Plan').should('be.visible');
    cy.contains('Credits Balance').should('be.visible');
    cy.contains('Payment Methods').should('be.visible');
    cy.contains('Billing History').should('be.visible');
  });

  it('should scroll to Billing History when "Billing History" button is clicked', () => {
    cy.contains('button', 'Billing History').click();
    // Check that the Billing History section (with id "billingHistory") is visible
    cy.get('#billingHistory').should('be.visible');
  });

  it('should open the Update Payment Method modal when "Update" is clicked', () => {
    cy.contains('button', 'Update').click();
    // The modal should appear with the title "Update Payment Method"
    cy.contains('Update Payment Method').should('be.visible');
  });

  it('should scroll to Plan Upgrade section when "Change" is clicked', () => {
    cy.contains('button', 'Change').click();
    // Check that one of the plan options appears, e.g., "Normal Plan"
    cy.contains('Normal Plan').should('be.visible');
  });

  it('should remove a payment method and warn when attempting to remove the last one', () => {
    // Initially, there are two payment methods.
    // Remove the first payment method.
    cy.get('button[aria-label="Remove payment method"]').first().click();
    // Now, only one payment method remains.
    cy.get('button[aria-label="Remove payment method"]').should('have.length', 1);

    // Stub window.alert to catch the warning.
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    // Attempt to remove the last remaining payment method.
    cy.get('button[aria-label="Remove payment method"]')
      .click()
      .then(() => {
        expect(alertStub).to.have.been.calledWith(
          'Warning: No active payment methods. Add a card to continue.'
        );
      });
  });

  it('should open the Add Payment Method modal, validate input, and add a new payment method', () => {
    // Open the Add Payment Method modal.
    cy.contains('button', 'Add').click();
    cy.contains('Add Payment Method').should('be.visible');

    // Enter invalid card number to trigger validation error.
    cy.get('input[aria-label="Card Number"]').type('1234');
    cy.get('input[aria-label="Expiry Date"]').type('12/30');
    cy.get('input[aria-label="CVV"]').type('123');
    cy.get('button[aria-label="Add Payment Method"]').click();
    cy.contains('Error: Please enter a valid card number.').should('be.visible');

    // Clear invalid input and enter valid card details.
    cy.get('input[aria-label="Card Number"]').clear().type('4242424242424242');
    cy.get('input[aria-label="Expiry Date"]').clear().type('12/30');
    cy.get('input[aria-label="CVV"]').clear().type('123');
    cy.get('button[aria-label="Add Payment Method"]').click();

    // Check that a success toast appears.
    cy.contains('Payment method added successfully!').should('be.visible');
    // Ensure the modal is closed.
    cy.contains('Add Payment Method').should('not.exist');
    // Verify that the new payment method appears in the list (last 4 digits "4242").
    cy.contains('VISA').parent().should('contain.text', '4242');
  });

  it('should open and confirm the Upgrade Plan modal', () => {
    // Click one of the "Upgrade" buttons (for example, the first one).
    cy.contains('button', 'Upgrade').first().click();
    // Modal with "Confirm Upgrade" should appear.
    cy.contains('Confirm Upgrade').should('be.visible');

    // Confirm the upgrade.
    cy.get('button[aria-label="Confirm Upgrade"]').click();
    // Check that the toast message appears.
    cy.contains('Plan upgraded successfully!').should('be.visible');
  });

  it('should open the Buy Credits modal, require a selection, and complete the purchase', () => {
    // Switch to the "Credits & Purchase" tab.
    cy.contains('Credits & Purchase').click();
    // Click the Buy button.
    cy.contains('button', 'Buy').click();
    // Without selecting a package, click Confirm Purchase and expect an alert.
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);
    cy.get('button[aria-label="Confirm Purchase"]')
      .click()
      .then(() => {
        expect(alertStub).to.have.been.calledWith('Please select a credit package.');
      });
    // Select a credit package (assume one with aria-label containing "50 Credits").
    cy.get('input[type="radio"][aria-label*="50 Credits"]').check();
    // Confirm the purchase.
    cy.get('button[aria-label="Confirm Purchase"]').click();
    // Verify the success toast.
    cy.contains('Credits added successfully!').should('be.visible');
  });

  it('should trigger alerts for Download and Retry actions in Billing History', () => {
    // Stub alert for Download action.
    const downloadAlertStub = cy.stub();
    cy.on('window:alert', downloadAlertStub);
    // Click the first "Download" button in the Billing History table.
    cy.get('table')
      .contains('Download')
      .first()
      .click()
      .then(() => {
        expect(downloadAlertStub).to.have.been.calledWith('Downloading invoice...');
      });

    // Stub alert for Retry action (for pending transactions).
    const retryAlertStub = cy.stub();
    cy.on('window:alert', retryAlertStub);
    // Click the "Retry" button (present only on pending transactions).
    cy.get('table')
      .contains('Retry')
      .click()
      .then(() => {
        expect(retryAlertStub).to.have.been.calledWith('Retrying payment...');
      });
  });
});

import { setupClerkTestingToken } from '@clerk/testing/cypress';

// End-to-end tests for team management page

describe('Team Management Page', () => {
  // Mock user authentication and API responses before each test
  beforeEach(() => {
    // Setup authenticated test environment
    setupClerkTestingToken();
    // Intercept API calls and provide mock responses
    cy.intercept('GET', '/api/team/members', {
      statusCode: 200,
      body: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'editor',
          status: 'active',
        },
        {
          id: '3',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          role: 'viewer',
          status: 'active',
        },
      ],
    }).as('getTeamMembers');

    cy.intercept('GET', '/api/team/invitations', {
      statusCode: 200,
      body: [
        {
          id: 'inv1',
          email: 'pending@example.com',
          role: 'editor',
          invitedAt: '2023-05-10T12:00:00Z',
        },
      ],
    }).as('getInvitations');

    cy.intercept('POST', '/api/team/invitations', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 'inv2',
          email: 'new@example.com',
          role: 'viewer',
          invitedAt: new Date().toISOString(),
        },
      },
    }).as('inviteTeamMember');

    cy.intercept('DELETE', '/api/team/members/*', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteTeamMember');

    cy.intercept('DELETE', '/api/team/invitations/*', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteInvitation');

    cy.intercept('PUT', '/api/team/members/*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          status: 'active',
        },
      },
    }).as('updateMemberRole');

    // Visit team management page
    cy.visit('/settings/team-management');
  });

  it('displays team members and invitations correctly', () => {
    // Wait for data to load
    cy.wait('@getTeamMembers');
    cy.wait('@getInvitations');

    // Check that team members are displayed
    cy.contains('John Doe').should('be.visible');
    cy.contains('jane@example.com').should('be.visible');
    cy.contains('Alice Johnson').should('be.visible');

    // Check that roles are displayed correctly
    cy.contains('td', 'John Doe').parent('tr').contains('Admin');
    cy.contains('td', 'Jane Smith').parent('tr').contains('Editor');
    cy.contains('td', 'Alice Johnson').parent('tr').contains('Viewer');

    // Check that pending invitations are displayed
    cy.contains('Pending Invitations').should('be.visible');
    cy.contains('pending@example.com').should('be.visible');
  });

  it('can invite a new team member', () => {
    // Wait for data to load
    cy.wait('@getTeamMembers');
    cy.wait('@getInvitations');

    // Click invite button
    cy.contains('Invite Team Member').click();

    // Modal should be visible
    cy.contains('Invite New Team Member').should('be.visible');

    // Fill in invitation form
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('select[name="role"]').select('viewer');

    // Submit the form
    cy.contains('Send Invitation').click();

    // Verify request was made
    cy.wait('@inviteTeamMember');

    // Verify success message
    cy.contains('Invitation sent successfully').should('be.visible');
  });

  it('can delete a team member', () => {
    // Wait for data to load
    cy.wait('@getTeamMembers');
    cy.wait('@getInvitations');

    // Find Jane Smith's row and click delete
    cy.contains('td', 'Jane Smith').parent('tr').find('[aria-label="Delete member"]').click();

    // Confirm deletion in modal
    cy.contains('Are you sure you want to remove this team member?').should('be.visible');
    cy.contains('Confirm').click();

    // Verify request was made
    cy.wait('@deleteTeamMember');

    // Verify success message
    cy.contains('Team member removed successfully').should('be.visible');
  });

  it('can cancel a pending invitation', () => {
    // Wait for data to load
    cy.wait('@getTeamMembers');
    cy.wait('@getInvitations');

    // Find pending invitation and click cancel
    cy.contains('td', 'pending@example.com')
      .parent('tr')
      .find('[aria-label="Cancel invitation"]')
      .click();

    // Confirm cancellation in modal
    cy.contains('Are you sure you want to cancel this invitation?').should('be.visible');
    cy.contains('Confirm').click();

    // Verify request was made
    cy.wait('@deleteInvitation');

    // Verify success message
    cy.contains('Invitation cancelled successfully').should('be.visible');
  });

  it("can change a team member's role", () => {
    // Wait for data to load
    cy.wait('@getTeamMembers');

    // Find Jane Smith's row and click the role selector
    cy.contains('td', 'Jane Smith').parent('tr').contains('Editor').click();

    // Select Admin role from dropdown
    cy.contains('Admin').click();

    // Confirm role change in modal
    cy.contains('Change Role').should('be.visible');
    cy.contains('Change to Admin').should('be.visible');
    cy.contains('Confirm').click();

    // Verify request was made
    cy.wait('@updateMemberRole');

    // Verify success message
    cy.contains('Role updated successfully').should('be.visible');
  });
});

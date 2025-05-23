/**
 * Authentication Commands for Clerk
 * Programmatic authentication following Cypress best practices for Clerk
 */

// Programmatic login command for Clerk
Cypress.Commands.add('login', (email, password, options = {}) => {
  const userEmail = email || Cypress.env('TEST_USER_EMAIL') || 'admin@example.com';
  const userPassword = password || Cypress.env('TEST_USER_PASSWORD') || 'password';

  cy.log(`Logging in with Clerk as ${userEmail}`);

  // For Clerk, we need to use UI-based login since Clerk doesn't expose direct API login
  // This is the recommended approach for Clerk testing
  if (options.method === 'ui' || !options.method) {
    cy.visit('/sign-in');

    // Wait for Clerk sign-in form to load
    cy.get('[name="identifier"]', { timeout: 10000 }).should('be.visible');

    // Fill in email
    cy.get('[name="identifier"]').clear().type(userEmail);
    cy.get('button[type="submit"]').click();

    // Wait for password field (Clerk's two-step process)
    cy.get('[name="password"]', { timeout: 10000 }).should('be.visible');

    // Fill in password
    cy.get('[name="password"]').clear().type(userPassword);
    cy.get('button[type="submit"]').click();

    // Wait for successful login - should redirect to dashboard
    cy.url({ timeout: 15000 }).should('not.include', '/sign-in');
    cy.url().should('include', '/dashboard');

    // Verify Clerk session exists
    cy.window().then(win => {
      // Clerk stores session data in localStorage with __clerk prefix
      const clerkSession = Object.keys(win.localStorage).find(key =>
        key.startsWith('__clerk_db_jwt')
      );
      expect(clerkSession).to.exist;
    });
  } else if (options.method === 'session') {
    // Option 2: Mock Clerk session (simplified approach for testing)
    cy.log('Using simplified mock session for testing');

    // Skip Clerk entirely and go directly to dashboard with a flag
    cy.window().then(win => {
      // Set a simple test flag that your middleware can recognize
      win.localStorage.setItem(
        'CYPRESS_TEST_USER',
        JSON.stringify({
          id: 'test-user-id',
          email: userEmail,
          role: options.role || 'admin',
        })
      );

      // Set minimal Clerk-like data (for UI components that might check)
      win.localStorage.setItem(
        '__clerk_user',
        JSON.stringify({
          id: 'test-user-id',
          email: userEmail,
          firstName: 'Test',
          lastName: 'User',
        })
      );
    });

    // For now, let's test without going through auth middleware
    // Navigate directly and check if we can load the page
    cy.visit('/dashboard');

    // Check if page loads (even if redirected, we'll know middleware is working)
    cy.url({ timeout: 10000 }).then(url => {
      if (url.includes('/sign-in')) {
        cy.log('Mock session not recognized - falling back to UI login');
        // Fall back to UI-based login
        cy.login(userEmail, userPassword, { method: 'ui' });
      } else {
        cy.log('Mock session successful');
      }
    });
  }
});

// Logout command for Clerk
Cypress.Commands.add('logout', () => {
  cy.log('Logging out from Clerk');

  // Method 1: Use Clerk's sign out (most realistic)
  cy.visit('/dashboard'); // Ensure we're on an authenticated page

  // Look for user menu/profile button (adjust selector based on your UI)
  cy.get('[data-cy="user-menu"], .cl-userButtonTrigger', { timeout: 5000 })
    .should('be.visible')
    .click();

  // Click sign out option (adjust selector based on your UI)
  cy.get('[data-cy="sign-out"], .cl-userButtonPopoverActionButton', { timeout: 5000 })
    .contains(/sign out|logout/i)
    .click();

  // Verify redirect to sign-in page
  cy.url({ timeout: 10000 }).should('include', '/sign-in');

  // Alternative method: Clear all Clerk data manually
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Check Clerk authentication state
Cypress.Commands.add('checkAuthState', (expectedState = 'authenticated') => {
  if (expectedState === 'authenticated') {
    cy.window().then(win => {
      // Check for Clerk session indicators
      const hasClerkSession = Object.keys(win.localStorage).some(
        key => key.startsWith('__clerk_db_jwt') || key.startsWith('__clerk_session')
      );
      expect(hasClerkSession, 'Should have Clerk session data').to.be.true;
    });

    // Verify we can access protected routes
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.url().should('not.include', '/sign-in');
  } else {
    cy.window().then(win => {
      // Check that Clerk session data is cleared
      const hasClerkSession = Object.keys(win.localStorage).some(
        key => key.startsWith('__clerk_db_jwt') || key.startsWith('__clerk_session')
      );
      expect(hasClerkSession, 'Should not have Clerk session data').to.be.false;
    });

    // Verify redirect to sign-in for protected routes
    cy.visit('/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/sign-in');
  }
});

// Login as specific role (for Clerk with role metadata)
Cypress.Commands.add('loginAs', role => {
  const roleCredentials = {
    admin: {
      email: Cypress.env('TEST_ADMIN_EMAIL') || 'admin@example.com',
      password: Cypress.env('TEST_ADMIN_PASSWORD') || 'admin123',
    },
    user: {
      email: Cypress.env('TEST_USER_EMAIL') || 'user@example.com',
      password: Cypress.env('TEST_USER_PASSWORD') || 'user123',
    },
    super_admin: {
      email: Cypress.env('TEST_SUPER_ADMIN_EMAIL') || 'superadmin@example.com',
      password: Cypress.env('TEST_SUPER_ADMIN_PASSWORD') || 'superadmin123',
    },
  };

  const credentials = roleCredentials[role];
  if (!credentials) {
    throw new Error(
      `Unknown role: ${role}. Available roles: ${Object.keys(roleCredentials).join(', ')}`
    );
  }

  cy.login(credentials.email, credentials.password, { role });
});

// Fast login for test setup (bypasses UI)
Cypress.Commands.add('fastLogin', (userEmail, options = {}) => {
  const email = userEmail || Cypress.env('TEST_USER_EMAIL') || 'admin@example.com';

  cy.log(`Fast login for ${email}`);

  // Use session method for speed in test setup
  cy.login(email, 'password', { method: 'session', ...options });
});

// Check if user has specific role (for Clerk metadata)
Cypress.Commands.add('checkUserRole', expectedRole => {
  // Make API call to check role
  cy.request({
    method: 'GET',
    url: '/api/auth/check-super-admin',
    failOnStatusCode: false,
  }).then(response => {
    if (expectedRole === 'super_admin') {
      expect(response.body.isSuperAdmin).to.be.true;
    } else {
      expect(response.body.isSuperAdmin).to.be.false;
    }
  });
});

import { initAuth0 } from '@auth0/nextjs-auth0';

// Add debug logging for Auth0 configuration
console.log('🔐 Auth0 Configuration:', {
  baseURLConfigured: !!process.env.AUTH0_BASE_URL,
  issuerURLConfigured: !!process.env.AUTH0_ISSUER_BASE_URL,
  clientIDConfigured: !!process.env.AUTH0_CLIENT_ID,
  clientSecretConfigured: !!process.env.AUTH0_CLIENT_SECRET,
  secretConfigured: !!process.env.AUTH0_SECRET,
  audienceConfigured: !!process.env.AUTH0_AUDIENCE,
});

export const auth0 = initAuth0({
  baseURL: process.env.AUTH0_BASE_URL,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  clockTolerance: 60,
  httpTimeout: 5000,
  authorizationParams: {
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
  },
});

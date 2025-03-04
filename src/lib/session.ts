// src/lib/session.ts
import { getSession as getAuth0Session } from '@auth0/nextjs-auth0';

// Mock session for development when Auth0 is not set up
const MOCK_SESSION = {
  user: {
    sub: 'mock-user-id',
    email: 'dev@example.com',
    name: 'Development User'
  }
};

export async function getSession() {
  try {
    // Try to get the Auth0 session
    const session = await getAuth0Session();
    
    if (session) {
      return session;
    }
    
    // In development, provide a mock session when Auth0 is not set up
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock session for development');
      return MOCK_SESSION;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    
    // In development, fall back to mock session
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock session after Auth0 error');
      return MOCK_SESSION;
    }
    
    return null;
  }
}

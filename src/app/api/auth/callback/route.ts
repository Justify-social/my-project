import { handleAuth, handleCallback, Session } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

// Define the afterCallback handler separately for clarity
const afterCallback = async (req: NextRequest, session: Session): Promise<Session> => {
  try {
    // // Log raw token data - Removed as accessToken/idToken are likely strings
    // console.log('Token data:', {
    //   accessTokenClaims: session?.accessToken?.claims,
    //   idTokenClaims: session?.idToken?.claims
    // });

    // Get roles primarily from session.user where decoded claims are typically added
    const roles = [
      // ...(session?.accessToken?.claims?.roles || []), // Removed: Access token is likely string
      // ...(session?.idToken?.claims?.roles || []),    // Removed: ID token is likely string
      ...(session?.user?.roles || []), // Existing roles on user object
      ...(session?.user?.['https://justify.social/roles'] || []) // Custom namespaced roles
    ];

    // Remove duplicates and filter out nulls/undefined
    const uniqueRoles = Array.from(new Set(roles.filter(Boolean)));

    console.log('Processing roles in afterCallback:', { // Clarified log message
      email: session?.user?.email,
      foundRoles: uniqueRoles,
      accessTokenProvided: !!session?.accessToken,
      idTokenProvided: !!session?.idToken
    });

    // Update the session user object
    if (session?.user) {
      session.user.roles = uniqueRoles;
      session.user.isSuperAdmin = uniqueRoles.includes('super_admin');
    }

    return session;
  } catch (error) {
    console.error('Auth callback error:', error);
    throw error;
  }
};

// Export GET using handleAuth with the specific callback handler
export const GET = handleAuth({
  callback: handleCallback({ afterCallback })
}); 
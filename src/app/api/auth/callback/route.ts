import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleCallback({
  afterCallback: async (req: NextRequest, session: any) => {
    try {
      // Log raw token data
      console.log('Token data:', {
        accessTokenClaims: session?.accessToken?.claims,
        idTokenClaims: session?.idToken?.claims
      });

      // Get roles from all possible locations
      const roles = [
        ...(session?.accessToken?.claims?.roles || []),
        ...(session?.idToken?.claims?.roles || []),
        ...(session?.user?.roles || []),
        ...(session?.user?.['https://justify.social/roles'] || [])
      ];

      // Remove duplicates and filter out nulls/undefined
      const uniqueRoles = Array.from(new Set(roles.filter(Boolean)));
      
      console.log('Processing roles:', {
        email: session?.user?.email,
        foundRoles: uniqueRoles,
        accessToken: !!session?.accessToken,
        idToken: !!session?.idToken
      });

      // Update the session
      if (session?.user) {
        session.user.roles = uniqueRoles;
        session.user.isSuperAdmin = uniqueRoles.includes('super_admin');
      }

      return session;
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    }
  }
}); 
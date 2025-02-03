// src/app/api/auth/login/route.ts
import { handleLogin } from '@auth0/nextjs-auth0';

export const GET = async (request: Request) => {
  try {
    // This handles the login logic and redirects to Auth0’s login page.
    return await handleLogin(request);
  } catch (error) {
    console.error('Error in login route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

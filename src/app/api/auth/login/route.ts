// src/app/api/auth/login/route.ts
import { handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // This handles the login logic and redirects to Auth0's login page.
    return await handleLogin(req);
  } catch (error) {
    console.error('Login error:', error);
    return new Response(`Login error: ${error.message}`, { status: 500 });
  }
}

// src/lib/session.ts
import { auth } from '@clerk/nextjs/server';

/**
 * Retrieves the current user session using Clerk's auth() helper.
 * Meant for server-side usage (Server Components, API routes, etc.).
 * @returns {Promise<object | null>} A promise that resolves to the session object { user: { id: userId, ...sessionClaims } } or null if not authenticated.
 */
export async function getSession() {
  try {
    // Await the result of the auth() call
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      // User is not authenticated
      return null;
    }

    // Return a session object compatible with previous structure if needed,
    // primarily containing the user ID and any claims.
    // You might augment this with data fetched from your own database based on userId.
    return {
      user: {
        id: userId,
        // Spread claims like email, name, metadata, etc.
        ...(sessionClaims || {}),
      },
    };
  } catch (error) {
    // Log the error but avoid throwing to prevent breaking server-side rendering
    console.error('[getSession] Error fetching Clerk session:', error);
    // Return null in case of any unexpected errors during auth() call
    return null;
  }
}

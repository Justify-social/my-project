// TODO: Reinstate and fix the GET handler which was removed due to persistent build errors related to type signatures.

// import { clerkClient, auth } from "@clerk/nextjs/server"; // Removed unused imports
// import { prisma } from '@/lib/prisma'; // Unused import

// Define expected structure for sessionClaims metadata
/* // Removed unused interface SessionClaimsMetadata
interface SessionClaimsMetadata {
  role?: string;
}
*/

// Unused helper function
/*
async function isSuperAdmin() {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;

    // Check role in Clerk metadata
    const metadata = (sessionClaims as CustomSessionClaims | null)?.metadata;
    return metadata?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}
*/

// Define interface for the GET route context parameters
/* // Interface potentially related to the removed GET handler
interface RouteContext {
  params: {
    id: string; // Ensure clean definition
  };
}
*/

// Unused interface
/*
interface SelectedUserData {
  id: string;
  email: string | null;
  firstName: string | null;
  surname: string | null;
  companyName: string | null;
  profilePictureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string | null; // Assuming role is optional/string
}
*/

// The GET function previously here was removed due to build errors.
// See TODO at the top of the file.

export {};

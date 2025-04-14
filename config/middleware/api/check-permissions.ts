import { NextApiRequest, NextApiResponse } from 'next';
import { Permission, ROLE_PERMISSIONS, UserRole } from '@/utils/roles';
// Import Clerk auth helper
import { auth } from '@clerk/nextjs/server';

// Define expected structure for sessionClaims metadata if possible
interface SessionClaimsMetadata {
  roles?: UserRole[]; // Expect roles to be an array of UserRole
}

interface CustomSessionClaims {
  metadata?: SessionClaimsMetadata;
}

/**
 * Checks if the currently authenticated user (via Clerk) has the required permissions.
 * Intended for use in server-side contexts like API routes or Server Components.
 *
 * @param {Permission[]} requiredPermissions - An array of permissions required for the action.
 * @returns {Promise<boolean>} True if the user has all required permissions, false otherwise.
 */
export async function checkPermissions(requiredPermissions: Permission[]): Promise<boolean> {
  try {
    // Get session claims using Clerk's auth()
    const { userId, sessionClaims } = await auth();

    // If no userId, user is not authenticated
    if (!userId) {
      return false;
    }

    // Get user roles from Clerk's session claims metadata
    const metadata = (sessionClaims as CustomSessionClaims | null)?.metadata;
    // Default to ['USER'] role if no roles are found in metadata
    const userRoles = metadata?.roles || ['USER'];

    // Check if user has any of the required roles that grant the permissions
    const hasPermission = userRoles.some(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      return requiredPermissions.every(permission => rolePermissions.includes(permission));
    });

    return hasPermission;
  } catch (error) {
    console.error('Server-side permission check error:', error);
    return false;
  }
}

// The withPermissions middleware factory can remain largely the same,
// but it should now call the updated checkPermissions function.
// Note: This factory pattern might be less common with Next.js App Router;
// often checks are done directly within route handlers or using middleware.ts.
export function withPermissions(permissions: Permission[]) {
  return async function checkPermissionsMiddleware(
    req: NextApiRequest, // Keep types for compatibility if used in Pages Router
    res: NextApiResponse,
    next: (err?: any) => void // Standard middleware next function signature
  ) {
    // Call the updated checkPermissions function (no req/res needed)
    const hasPermission = await checkPermissions(permissions);

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action',
      });
    }

    // Proceed to the next middleware or route handler
    return next();
  };
}

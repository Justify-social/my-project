import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { Permission, ROLE_PERMISSIONS, UserRole } from '@/utils/roles';

export async function checkPermissions(
  req: NextApiRequest,
  res: NextApiResponse,
  requiredPermissions: Permission[]
) {
  try {
    const session = await getSession(req, res);
    
    if (!session?.user) {
      return false;
    }

    // Get user roles from Auth0 user metadata
    const userRoles = (session.user['https://justify.social/roles'] || ['USER']) as UserRole[];
    
    // Check if user has any of the required roles that grant the permissions
    const hasPermission = userRoles.some((role) => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      return requiredPermissions.every(permission => 
        rolePermissions.includes(permission)
      );
    });

    return hasPermission;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export function withPermissions(permissions: Permission[]) {
  return async function checkPermissionsMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    const hasPermission = await checkPermissions(req, res, permissions);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You do not have permission to perform this action' 
      });
    }
    
    return next();
  };
} 
import { useUser } from '@auth0/nextjs-auth0/client';
import { Permission, ROLE_PERMISSIONS, UserRole } from '@/utils/roles';

export function usePermissions() {
  const { user, isLoading } = useUser();
  
  const checkPermission = (requiredPermissions: Permission[]) => {
    if (isLoading || !user) return false;

    // Get user roles from Auth0 user metadata
    const userRoles = (user['https://justify.social/roles'] || ['USER']) as UserRole[];
    
    return userRoles.some((role) => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      return requiredPermissions.every(permission => 
        rolePermissions.includes(permission)
      );
    });
  };

  return {
    checkPermission,
    isLoading,
    userRoles: user?.['https://justify.social/roles'] as UserRole[] | undefined,
  };
} 
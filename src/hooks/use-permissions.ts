import { useAuth, useUser } from '@clerk/nextjs';
import { Permission, ROLE_PERMISSIONS, UserRole } from '@/utils/roles';

// Define expected structure for Clerk publicMetadata
interface PublicMetadata {
  roles?: UserRole[]; // Expect roles to be an array of UserRole in publicMetadata
  // Add other public metadata properties if needed
}

export function usePermissions() {
  // Use useAuth for loading state and useUser for user data (including metadata)
  const { isLoaded } = useAuth();
  const { user } = useUser(); // user object contains publicMetadata

  const checkPermission = (requiredPermissions: Permission[]) => {
    // Wait until Clerk is loaded and user data is available
    if (!isLoaded || !user) return false;

    // Get user roles from Clerk's user.publicMetadata
    // Cast publicMetadata to our defined type
    const publicMetadata = user.publicMetadata as PublicMetadata;
    // Default to ['USER'] role if no roles are found in publicMetadata
    const userRoles = publicMetadata?.roles || ['USER'];

    // Check if any of the user's roles grant all required permissions
    return userRoles.some(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      return requiredPermissions.every(permission => rolePermissions.includes(permission));
    });
  };

  // Get roles directly from user metadata
  const userRoles = (user?.publicMetadata as PublicMetadata | undefined)?.roles;

  // Return the permission checking function, loading state, and roles
  return {
    checkPermission,
    isLoading: !isLoaded, // isLoading is true until Clerk is loaded
    userRoles,
  };
}

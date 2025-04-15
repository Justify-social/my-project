import { Permission, ROLE_PERMISSIONS, UserRole } from '@/utils/roles';
import { dbLogger, DbOperation, LogLevel } from '@/lib/data-mapping/db-logger';

/**
 * Checks if the given user roles grant all the required permissions.
 *
 * @param userRoles - An array of roles assigned to the user.
 * @param requiredPermissions - An array of permissions required for the action.
 * @returns true if the user has the required permissions, false otherwise.
 */
export function checkPermissions(
  userRoles: UserRole[],
  requiredPermissions: Permission[]
): boolean {
  if (!userRoles || userRoles.length === 0) {
    console.warn('Permission check failed: User has no roles assigned.');
    // Log the warning
    dbLogger.log(
      LogLevel.WARN,
      DbOperation.VALIDATION, // Use VALIDATION for permission checks
      'Permission check failed: User has no roles assigned.',
      { requiredPermissions } // Include required permissions in data
    );
    return false; // No roles, no permissions
  }

  // Check if user has *any* role that grants *all* required permissions
  const hasPermission = userRoles.some(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] as Permission[];
    if (!rolePermissions) {
      console.warn(`Permission check: Role '${role}' not found in ROLE_PERMISSIONS.`);
      // Log the warning about the missing role definition
      dbLogger.log(
        LogLevel.WARN,
        DbOperation.VALIDATION,
        `Permission check: Role '${role}' not found in ROLE_PERMISSIONS.`,
        { userRoles, requiredPermissions }
      );
      return false; // Role definition missing
    }
    return requiredPermissions.every(permission => rolePermissions.includes(permission));
  });

  if (!hasPermission) {
    const message = `Permission check failed: User roles [${userRoles.join(', ')}] do not grant required permissions [${requiredPermissions.join(', ')}]`;
    console.warn(message);
    // Correctly call dbLogger.log with positional arguments
    dbLogger.log(
      LogLevel.WARN,
      DbOperation.VALIDATION, // Use VALIDATION for permission checks
      message,
      { // Pass details as the data argument
        required: requiredPermissions,
        userRoles: userRoles,
      }
    );
  }

  return hasPermission;
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
        message: 'You do not have permission to perform this action',
      });
    }

    return next();
  };
}

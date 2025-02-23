export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // Campaign permissions
  CREATE_CAMPAIGN: 'CREATE_CAMPAIGN',
  READ_CAMPAIGN: 'READ_CAMPAIGN',
  UPDATE_CAMPAIGN: 'UPDATE_CAMPAIGN',
  DELETE_CAMPAIGN: 'DELETE_CAMPAIGN',
  
  // Analytics permissions
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  EXPORT_ANALYTICS: 'EXPORT_ANALYTICS',
  
  // User management permissions
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  
  // Billing permissions
  VIEW_BILLING: 'VIEW_BILLING',
  MANAGE_BILLING: 'MANAGE_BILLING',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS) as Permission[],
  MANAGER: [
    PERMISSIONS.CREATE_CAMPAIGN,
    PERMISSIONS.READ_CAMPAIGN,
    PERMISSIONS.UPDATE_CAMPAIGN,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.VIEW_BILLING,
  ],
  USER: [
    PERMISSIONS.READ_CAMPAIGN,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_BILLING,
  ],
}; 
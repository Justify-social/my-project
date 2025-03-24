"use client";

import { useUser } from '@auth0/nextjs-auth0/client';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/utils/roles';

export default function TestPage() {
  const { user, error, isLoading } = useUser();
  const { checkPermission, userRoles } = usePermissions();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Auth0 & RBAC Test Page</h1>
      
      {/* User Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        {user ? (
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Roles:</strong> {userRoles?.join(', ') || 'No roles assigned'}</p>
          </div>
        ) : (
          <p>Not logged in</p>
        )}
      </div>

      {/* Permissions Test */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Permissions Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campaign Permissions */}
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Campaign Permissions</h3>
            <ul className="space-y-2">
              <li className={checkPermission([PERMISSIONS.CREATE_CAMPAIGN]) ? 'text-green-600' : 'text-red-600'}>
                ✦ Create Campaign: {checkPermission([PERMISSIONS.CREATE_CAMPAIGN]) ? '✓' : '✗'}
              </li>
              <li className={checkPermission([PERMISSIONS.READ_CAMPAIGN]) ? 'text-green-600' : 'text-red-600'}>
                ✦ Read Campaign: {checkPermission([PERMISSIONS.READ_CAMPAIGN]) ? '✓' : '✗'}
              </li>
              <li className={checkPermission([PERMISSIONS.UPDATE_CAMPAIGN]) ? 'text-green-600' : 'text-red-600'}>
                ✦ Update Campaign: {checkPermission([PERMISSIONS.UPDATE_CAMPAIGN]) ? '✓' : '✗'}
              </li>
              <li className={checkPermission([PERMISSIONS.DELETE_CAMPAIGN]) ? 'text-green-600' : 'text-red-600'}>
                ✦ Delete Campaign: {checkPermission([PERMISSIONS.DELETE_CAMPAIGN]) ? '✓' : '✗'}
              </li>
            </ul>
          </div>

          {/* Analytics Permissions */}
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Analytics Permissions</h3>
            <ul className="space-y-2">
              <li className={checkPermission([PERMISSIONS.VIEW_ANALYTICS]) ? 'text-green-600' : 'text-red-600'}>
                ✦ View Analytics: {checkPermission([PERMISSIONS.VIEW_ANALYTICS]) ? '✓' : '✗'}
              </li>
              <li className={checkPermission([PERMISSIONS.EXPORT_ANALYTICS]) ? 'text-green-600' : 'text-red-600'}>
                ✦ Export Analytics: {checkPermission([PERMISSIONS.EXPORT_ANALYTICS]) ? '✓' : '✗'}
              </li>
            </ul>
          </div>

          {/* User Management Permissions */}
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">User Management</h3>
            <ul className="space-y-2">
              <li className={checkPermission([PERMISSIONS.MANAGE_USERS]) ? 'text-green-600' : 'text-red-600'}>
                ✦ Manage Users: {checkPermission([PERMISSIONS.MANAGE_USERS]) ? '✓' : '✗'}
              </li>
              <li className={checkPermission([PERMISSIONS.MANAGE_ROLES]) ? 'text-green-600' : 'text-red-600'}>
                ✦ Manage Roles: {checkPermission([PERMISSIONS.MANAGE_ROLES]) ? '✓' : '✗'}
              </li>
            </ul>
          </div>

          {/* Billing Permissions */}
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Billing</h3>
            <ul className="space-y-2">
              <li className={checkPermission([PERMISSIONS.VIEW_BILLING]) ? 'text-green-600' : 'text-red-600'}>
                ✦ View Billing: {checkPermission([PERMISSIONS.VIEW_BILLING]) ? '✓' : '✗'}
              </li>
              <li className={checkPermission([PERMISSIONS.MANAGE_BILLING]) ? 'text-green-600' : 'text-red-600'}>
                ✦ Manage Billing: {checkPermission([PERMISSIONS.MANAGE_BILLING]) ? '✓' : '✗'}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="space-x-4">
          {checkPermission([PERMISSIONS.CREATE_CAMPAIGN]) && (
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Create Campaign
            </button>
          )}
          {checkPermission([PERMISSIONS.MANAGE_USERS]) && (
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Manage Users
            </button>
          )}
          {checkPermission([PERMISSIONS.EXPORT_ANALYTICS]) && (
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Export Analytics
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
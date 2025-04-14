'use client';

// Data fetching optimization
export const dynamic = 'force-dynamic'; // Force dynamic rendering

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useRouter } from 'next/navigation';
import { LoadingSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';

// Define expected structure for Clerk publicMetadata
interface PublicMetadata {
  role?: string;
}

// Interfaces for UserData, Company (keep as is for now, assuming API returns this)
interface Company {
  id: string;
  name: string;
  createdAt: string;
  userCount: number;
  status: 'active' | 'inactive';
  subscription: string;
}
interface UserData {
  id: string; // This might need to change to clerkId depending on your API response
  name: string;
  email: string;
  companyId: string;
  role: string;
  lastLogin: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export default function AdminDashboard() {
  // Use Clerk's useUser hook
  const { user, isLoaded, isSignedIn } = useUser();
  const [users, setUsers] = useState<UserData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  // Rename loading state
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const router = useRouter();

  const [suspendedUserIds, setSuspendedUserIds] = useState<Set<string>>(new Set());
  const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<UserData | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  // Determine admin status directly from Clerk user object
  const isSuperAdmin = isLoaded && user ? (user.publicMetadata as PublicMetadata)?.role === 'super_admin' : false;

  // Fetch users data - only if user is loaded and is a super admin
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingData(true);
      setError('');
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          if (response.status === 403) throw new Error('Forbidden: Admin access required.');
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setUsers(data.users || []);
        } else {
          throw new Error(data.error || 'Failed to parse users data');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
        // Add mock data only if strictly needed for isolated development
        // if (process.env.NODE_ENV === 'development') { setUsers([...]); }
      } finally {
        setIsLoadingData(false);
      }
    };

    // Fetch only when Clerk is loaded and user is confirmed super admin
    if (isLoaded && isSuperAdmin) {
      fetchUsers();
    } else if (isLoaded && !isSuperAdmin) {
      // If loaded but not admin, stop loading and show access denied later
      setIsLoadingData(false);
      setError('Access Denied: Super Admin role required.');
    }
  }, [isLoaded, isSuperAdmin]); // Depend on isLoaded and derived isSuperAdmin state

  // Handler for updating a user's role
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }), // Assuming API needs internal DB ID
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  // Handler for viewing user details
  const handleViewUser = async (userData: UserData) => {
    setSelectedUser(userData);
    setUserModalOpen(true);
    setIsUserDetailLoading(true);
    setUserDetailError(null);
    try {
      // Assuming API expects internal DB ID
      const response = await fetch(`/api/admin/users/${userData.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user details');
      }
      const data = await response.json();
      setSelectedUser(data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserDetailError(error instanceof Error ? error.message : 'Failed to load user details');
    } finally {
      setIsUserDetailLoading(false);
    }
  };

  // Handler for suspending a user
  const handleSuspendUser = async () => {
    if (!userToSuspend) return;
    setIsSuspending(true);
    try {
      // Assuming API expects internal DB ID
      const response = await fetch('/api/admin/users/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToSuspend.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suspend user');
      }
      setSuspendedUserIds(prev => { const newSet = new Set(prev); newSet.add(userToSuspend.id); return newSet; });
      setShowSuspendConfirm(false);
      setUserToSuspend(null);
      toast.success('User suspended successfully');
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to suspend user');
    } finally {
      setIsSuspending(false);
    }
  };

  // Check if a user is suspended
  const isUserSuspended = (userId: string) => {
    return suspendedUserIds.has(userId);
  };

  // Loading state based on Clerk loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen font-body">
        <LoadingSkeleton className="h-12 w-12" />
      </div>
    );
  }

  // Handle case where user is loaded but not signed in (AuthCheck should handle redirect)
  if (isLoaded && !isSignedIn) {
    return <div className="p-4 text-center">Redirecting to sign in...</div>;
  }

  // Handle case where user is loaded, signed in, but not super admin
  if (isLoaded && !isSuperAdmin) {
    return (
      <div className="text-center py-8 font-body">
        <h2 className="text-2xl font-bold text-red-500 mb-4 font-heading">Access Denied</h2>
        <p className="mb-4 font-body">
          You do not have permission to access the admin panel.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors font-body"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Main content render (only if loaded and super admin)
  return (
    <main className="min-h-screen bg-[var(--background-color)] p-8">
      {/* Show loading state for data fetching */}
      {isLoadingData && (
        <p className="text-center py-8 font-body">Loading admin data...</p>
      )}

      {/* Show error state for data fetching */}
      {!isLoadingData && error && (
        <p className="text-center py-8 text-red-500 font-body">{error}</p>
      )}

      {/* Show content only when not loading data and no error */}
      {!isLoadingData && !error && isSuperAdmin && (
        <div className="space-y-8 font-body">
          <header className="flex justify-between items-center font-heading">
            <div className="font-body">
              <h1 className="text-3xl font-bold text-[var(--primary-color)] font-heading">
                Admin Dashboard
              </h1>
              <p className="text-[var(--secondary-color)] font-body">
                Manage users, roles, and system settings
              </p>
            </div>
            <div className="flex gap-3 font-body">
              <button
                onClick={() => router.push('/debug-tools')}
                className="px-4 py-2 flex items-center gap-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-body"
              >
                {<Icon iconId="faBugLight" className="h-5 w-5" />}
                Debug Tools
              </button>
            </div>
          </header>

          {/* User Management */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center font-body">
                  <h2 className="text-2xl font-semibold text-[var(--primary-color)] font-heading">
                    User Management
                  </h2>
                  <div className="flex gap-2 font-body">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="px-3 py-1 border border-[var(--divider-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-body"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto font-body">
                  <table className="min-w-full divide-y divide-[var(--divider-color)]">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                          Last Login
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-body">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider-color)]">
                      {users.map(userData => (
                        <tr key={userData.id} className="hover:bg-[var(--background-color)]">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center font-body">
                              <div className="ml-3 font-body">
                                <div className="text-sm font-medium text-[var(--primary-color)] font-body">
                                  {userData.name}
                                </div>
                                <div className="text-sm text-[var(--secondary-color)] font-body">
                                  {userData.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--primary-color)] font-body">
                            {userData.companyId}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              className="text-sm rounded-md border border-[var(--divider-color)] px-2 py-1 font-body"
                              value={userData.role}
                              onChange={e => handleUpdateUserRole(userData.id, e.target.value)}
                              disabled={isUserSuspended(userData.id)}
                            >
                              <option value="OWNER">Owner</option>
                              <option value="ADMIN">Admin</option>
                              <option value="MEMBER">Member</option>
                              <option value="VIEWER">Viewer</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--primary-color)] font-body">
                            {new Date(userData.lastLogin).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium font-body">
                            <button
                              className="text-[var(--accent-color)] hover:text-blue-800 mr-3 font-body"
                              onClick={() => handleViewUser(userData)}
                            >
                              View
                            </button>
                            {!isUserSuspended(userData.id) && (
                              <button
                                className="text-red-600 hover:text-red-800 font-body"
                                onClick={() => {
                                  setUserToSuspend(userData);
                                  setShowSuspendConfirm(true);
                                }}
                              >
                                Suspend
                              </button>
                            )}
                            {isUserSuspended(userData.id) && (
                              <span className="text-gray-400 font-body">Suspended</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && !isLoadingData && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-sm text-[var(--secondary-color)] font-body"
                          >
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* User Details Modal */}
          {userModalOpen && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-body">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden font-body">
                <div className="px-6 py-4 border-b border-[var(--divider-color)] flex justify-between items-center font-body">
                  <h3 className="text-lg font-medium font-heading">User Details</h3>
                  <button
                    className="text-[var(--secondary-color)] hover:text-[var(--primary-color)] font-body"
                    onClick={() => setUserModalOpen(false)}
                  >
                    {<Icon iconId="faXCircleLight" className="h-6 w-6" />}
                  </button>
                </div>

                <div className="px-6 py-4 font-body">
                  {isUserDetailLoading ? (
                    <div className="flex justify-center py-8 font-body">
                      <div className="animate-spin h-8 w-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full font-body"></div>
                    </div>
                  ) : userDetailError ? (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md font-body">
                      {userDetailError}
                    </div>
                  ) : (
                    <div className="space-y-4 font-body">
                      {isUserSuspended(selectedUser.id) && (
                        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 font-body">
                          This user is currently suspended
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body">
                        <div className="font-body">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-body">
                            Name
                          </label>
                          <div className="mt-1 text-sm font-body">
                            {selectedUser.name || 'N/A'}
                          </div>
                        </div>
                        <div className="font-body">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-body">
                            Email
                          </label>
                          <div className="mt-1 text-sm font-body">{selectedUser.email}</div>
                        </div>
                        <div className="font-body">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-body">
                            Company
                          </label>
                          <div className="mt-1 text-sm font-body">
                            {selectedUser.companyId || 'N/A'}
                          </div>
                        </div>
                        <div className="font-body">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-body">
                            Role
                          </label>
                          <div className="mt-1 text-sm font-body">{selectedUser.role}</div>
                        </div>
                        <div className="font-body">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-body">
                            User ID
                          </label>
                          <div className="mt-1 text-sm font-body">{selectedUser.id}</div>
                        </div>
                        <div className="font-body">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-body">
                            Last Login
                          </label>
                          <div className="mt-1 text-sm font-body">
                            {new Date(selectedUser.lastLogin).toLocaleString()}
                          </div>
                        </div>
                        <div className="font-body">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-body">
                            Created At
                          </label>
                          <div className="mt-1 text-sm font-body">
                            {selectedUser.createdAt
                              ? new Date(selectedUser.createdAt).toLocaleString()
                              : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[var(--divider-color)] pt-4 mt-4 font-body">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body">
                          <div className="font-body">
                            <label className="block text-xs font-medium text-[var(--secondary-color)] font-body">
                              Updated At
                            </label>
                            <div className="mt-1 text-sm font-body">
                              {selectedUser.updatedAt
                                ? new Date(selectedUser.updatedAt).toLocaleString()
                                : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-[var(--divider-color)] flex justify-end font-body">
                  <button
                    className="px-4 py-2 bg-[var(--background-color)] text-[var(--primary-color)] rounded-md hover:bg-gray-200 font-body"
                    onClick={() => setUserModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Suspend User Confirmation Modal */}
          {showSuspendConfirm && userToSuspend && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-body">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden font-body">
                <div className="px-6 py-4 border-b border-[var(--divider-color)] font-body">
                  <h3 className="text-lg font-medium text-red-600 font-heading">Suspend User</h3>
                </div>

                <div className="px-6 py-4 font-body">
                  <p className="text-sm text-[var(--primary-color)] font-body">
                    Are you sure you want to suspend <strong>{userToSuspend.name}</strong> (
                    {userToSuspend.email})?
                  </p>
                  <p className="mt-2 text-sm text-[var(--secondary-color)] font-body">
                    This action will prevent the user from accessing the system. It can be reversed
                    later.
                  </p>
                </div>

                <div className="px-6 py-4 border-t border-[var(--divider-color)] flex justify-end space-x-3 font-body">
                  <button
                    className="px-4 py-2 bg-[var(--background-color)] text-[var(--primary-color)] rounded-md hover:bg-gray-200 font-body"
                    onClick={() => {
                      setShowSuspendConfirm(false);
                      setUserToSuspend(null);
                    }}
                    disabled={isSuspending}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center font-body"
                    onClick={handleSuspendUser}
                    disabled={isSuspending}
                  >
                    {isSuspending && (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 font-body"></div>
                    )}
                    Suspend User
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

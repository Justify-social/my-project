'use client';

// Data fetching optimization
export const dynamic = 'force-dynamic'; // Force dynamic rendering
export const revalidate = 60; // Revalidate every 60 seconds

import React, { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { toast } from 'react-hot-toast';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { Tabs, TabList, TabPanel, TabPanels } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/atoms/icons';
import { useRouter } from 'next/navigation';
import { getSession } from '@auth0/nextjs-auth0';
import type { UserProfile } from '@auth0/nextjs-auth0/client';
interface Company {
  id: string;
  name: string;
  createdAt: string;
  userCount: number;
  status: 'active' | 'inactive';
  subscription: string;
}
interface UserData {
  id: string;
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
  const {
    user,
    error: userError,
    isLoading: userLoading
  } = useUser();
  const [users, setUsers] = useState<UserData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const router = useRouter();

  // Track suspended users in local state
  const [suspendedUserIds, setSuspendedUserIds] = useState<Set<string>>(new Set());

  // Add state for the user details modal
  const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);

  // Add state for the suspend user confirmation modal
  const [userToSuspend, setUserToSuspend] = useState<UserData | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  // Helper function to check if user is super admin
  const checkIsSuperAdmin = (userToCheck: any): boolean => {
    if (!userToCheck) return false;
    const userRoles = userToCheck['https://justify.social/roles'] as string[] || [];
    return userRoles.includes('super_admin');
  };

  // Fetch users data for Super Admins
  const fetchUsers = async () => {
    if (user && checkIsSuperAdmin(user)) {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
        // Add some mock data for development
        if (process.env.NODE_ENV === 'development') {
          setUsers([{
            id: '1',
            name: 'Alice Smith',
            email: 'alice@example.com',
            companyId: 'comp1',
            role: 'admin',
            lastLogin: '2023-01-15T10:30:00Z'
          }, {
            id: '2',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            companyId: 'comp1',
            role: 'editor',
            lastLogin: '2023-01-10T09:15:00Z'
          }]);
        }
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    // Only fetch data if the user is loaded and is a super admin
    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Handler for updating a user's role
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      // Make API request to update user role
      const response = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          role: newRole
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }

      // Update local state
      setUsers(users.map((u) => u.id === userId ? {
        ...u,
        role: newRole
      } : u));

      // Success notification
      console.log(`Updated role for user ${userId} to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  // Handler for viewing user details
  const handleViewUser = async (userData: UserData) => {
    setSelectedUser(userData);
    setUserModalOpen(true);
    setIsUserDetailLoading(true);
    setUserDetailError(null);
    try {
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
      const response = await fetch('/api/admin/users/suspend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userToSuspend.id
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suspend user');
      }

      // Track suspended users in our local state
      setSuspendedUserIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(userToSuspend.id);
        return newSet;
      });

      // Close confirmation modal
      setShowSuspendConfirm(false);
      setUserToSuspend(null);

      // Show success notification
      alert('User suspended successfully');
    } catch (error) {
      console.error('Error suspending user:', error);
      alert(error instanceof Error ? error.message : 'Failed to suspend user');
    } finally {
      setIsSuspending(false);
    }
  };

  // Check if a user is suspended
  const isUserSuspended = (userId: string) => {
    return suspendedUserIds.has(userId);
  };
  if (userLoading) {
    return <div className="flex items-center justify-center min-h-screen font-work-sans">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[var(--accent-color)] font-work-sans"></div>
      </div>;
  }
  if (userError) {
    return <div className="flex items-center justify-center min-h-screen font-work-sans">
        <div className="bg-red-50 text-red-800 rounded-lg p-4 border border-red-200 font-work-sans">
          Error loading dashboard: {userError instanceof Error ? userError.message : 'Unknown error'}
        </div>
      </div>;
  }
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen font-work-sans">
        <div className="bg-yellow-50 text-yellow-800 rounded-lg p-4 border border-yellow-200 font-work-sans">
          Please log in to access the admin dashboard
        </div>
      </div>;
  }

  // Safely access user roles
  const userRoles = user ? user['https://justify.social/roles'] as string[] || [] : [];
  const isSuperAdmin = userRoles.includes('super_admin');
  return <main className="min-h-screen bg-[var(--background-color)] p-8">
      {/* Error Alert */}
      {showAlertError && <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-50 font-work-sans" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline font-work-sans">{alertMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 font-work-sans" onClick={() => setShowAlertError(false)}>
            {<Icon name="faXCircle" className="h-6 w-6 text-red-500 font-work-sans" solid={false} />}
          </span>
        </div>}

      {/* Success Alert */}
      {showAlertSuccess && <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative z-50 font-work-sans" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline font-work-sans">{alertMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 font-work-sans" onClick={() => setShowAlertSuccess(false)}>
            {<Icon name="faXCircle" className="h-6 w-6 text-green-500 font-work-sans" solid={false} />}
          </span>
        </div>}

      {userLoading ? <p className="text-center py-8 font-work-sans">Loading admin panel...</p> : userError ? <p className="text-center py-8 text-red-500 font-work-sans">Error loading user: {typeof userError === 'object' && userError !== null ? (userError as any).message || 'Unknown error' : 'Unknown error'}</p> : !user || !checkIsSuperAdmin(user) ? <div className="text-center py-8 font-work-sans">
          <h2 className="text-2xl font-bold text-red-500 mb-4 font-sora">Access Denied</h2>
          <p className="mb-4 font-work-sans">You do not have permission to access the admin panel.</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors font-work-sans">

            Return to Dashboard
          </button>
        </div> : <div className="space-y-8 font-work-sans">
          <header className="flex justify-between items-center font-sora">
            <div className="font-work-sans">
              <h1 className="text-3xl font-bold text-[var(--primary-color)] font-sora">Admin Dashboard</h1>
              <p className="text-[var(--secondary-color)] font-work-sans">Manage users, roles, and system settings</p>
            </div>
            <div className="flex gap-3 font-work-sans">
              <button onClick={() => router.push('/debug-tools')} className="px-4 py-2 flex items-center gap-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-work-sans">

                {<Icon name="faBug" className="h-5 w-5" solid={false} />}
                Debug Tools
              </button>
            </div>
          </header>

          {/* User Management */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center font-work-sans">
                  <h2 className="text-2xl font-semibold text-[var(--primary-color)] font-sora">User Management</h2>
                  <div className="flex gap-2 font-work-sans">
                    <input type="text" placeholder="Search users..." className="px-3 py-1 border border-[var(--divider-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-work-sans" />

                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto font-work-sans">
                  <table className="min-w-full divide-y divide-[var(--divider-color)]">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">
                          Last Login
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider font-work-sans">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--divider-color)]">
                      {users.map((user) => <tr key={user.id} className="hover:bg-[var(--background-color)]">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center font-work-sans">
                              <div className="ml-3 font-work-sans">
                                <div className="text-sm font-medium text-[var(--primary-color)] font-work-sans">
                                  {user.name}
                                </div>
                                <div className="text-sm text-[var(--secondary-color)] font-work-sans">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--primary-color)] font-work-sans">
                            {user.companyId}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select className="text-sm rounded-md border border-[var(--divider-color)] px-2 py-1 font-work-sans" value={user.role} onChange={(e) => handleUpdateUserRole(user.id, e.target.value)} disabled={isUserSuspended(user.id)}>

                              <option value="OWNER">Owner</option>
                              <option value="ADMIN">Admin</option>
                              <option value="MEMBER">Member</option>
                              <option value="VIEWER">Viewer</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--primary-color)] font-work-sans">
                            {new Date(user.lastLogin).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium font-work-sans">
                            <button className="text-[var(--accent-color)] hover:text-blue-800 mr-3 font-work-sans" onClick={() => handleViewUser(user)}>

                              View
                            </button>
                            {!isUserSuspended(user.id) && <button className="text-red-600 hover:text-red-800 font-work-sans" onClick={() => {
                        setUserToSuspend(user);
                        setShowSuspendConfirm(true);
                      }}>

                                Suspend
                              </button>}
                            {isUserSuspended(user.id) && <span className="text-gray-400 font-work-sans">Suspended</span>}
                          </td>
                        </tr>)}
                      {users.length === 0 && !userLoading && <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--secondary-color)] font-work-sans">
                            No users found
                          </td>
                        </tr>}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* User Details Modal */}
          {userModalOpen && selectedUser && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-work-sans">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden font-work-sans">
                <div className="px-6 py-4 border-b border-[var(--divider-color)] flex justify-between items-center font-work-sans">
                  <h3 className="text-lg font-medium font-sora">User Details</h3>
                  <button className="text-[var(--secondary-color)] hover:text-[var(--primary-color)] font-work-sans" onClick={() => setUserModalOpen(false)}>

                    {<Icon name="faXCircle" className="h-6 w-6" solid={false} />}
                  </button>
                </div>
                
                <div className="px-6 py-4 font-work-sans">
                  {isUserDetailLoading ? <div className="flex justify-center py-8 font-work-sans">
                      <div className="animate-spin h-8 w-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full font-work-sans"></div>
                    </div> : userDetailError ? <div className="bg-red-50 text-red-800 p-4 rounded-md font-work-sans">
                      {userDetailError}
                    </div> : <div className="space-y-4 font-work-sans">
                      {isUserSuspended(selectedUser.id) && <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 font-work-sans">
                          This user is currently suspended
                        </div>}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
                        <div className="font-work-sans">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-work-sans">
                            Name
                          </label>
                          <div className="mt-1 text-sm font-work-sans">{selectedUser.name || 'N/A'}</div>
                        </div>
                        <div className="font-work-sans">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-work-sans">
                            Email
                          </label>
                          <div className="mt-1 text-sm font-work-sans">{selectedUser.email}</div>
                        </div>
                        <div className="font-work-sans">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-work-sans">
                            Company
                          </label>
                          <div className="mt-1 text-sm font-work-sans">{selectedUser.companyId || 'N/A'}</div>
                        </div>
                        <div className="font-work-sans">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-work-sans">
                            Role
                          </label>
                          <div className="mt-1 text-sm font-work-sans">{selectedUser.role}</div>
                        </div>
                        <div className="font-work-sans">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-work-sans">
                            User ID
                          </label>
                          <div className="mt-1 text-sm font-work-sans">{selectedUser.id}</div>
                        </div>
                        <div className="font-work-sans">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-work-sans">
                            Last Login
                          </label>
                          <div className="mt-1 text-sm font-work-sans">
                            {new Date(selectedUser.lastLogin).toLocaleString()}
                          </div>
                        </div>
                        <div className="font-work-sans">
                          <label className="block text-xs font-medium text-[var(--secondary-color)] font-work-sans">
                            Created At
                          </label>
                          <div className="mt-1 text-sm font-work-sans">
                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-[var(--divider-color)] pt-4 mt-4 font-work-sans">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-work-sans">
                          <div className="font-work-sans">
                            <label className="block text-xs font-medium text-[var(--secondary-color)] font-work-sans">
                              Updated At
                            </label>
                            <div className="mt-1 text-sm font-work-sans">
                              {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>}
                </div>
                
                <div className="px-6 py-4 border-t border-[var(--divider-color)] flex justify-end font-work-sans">
                  <button className="px-4 py-2 bg-[var(--background-color)] text-[var(--primary-color)] rounded-md hover:bg-gray-200 font-work-sans" onClick={() => setUserModalOpen(false)}>

                    Close
                  </button>
                </div>
              </div>
            </div>}

          {/* Suspend User Confirmation Modal */}
          {showSuspendConfirm && userToSuspend && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-work-sans">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden font-work-sans">
                <div className="px-6 py-4 border-b border-[var(--divider-color)] font-work-sans">
                  <h3 className="text-lg font-medium text-red-600 font-sora">Suspend User</h3>
                </div>
                
                <div className="px-6 py-4 font-work-sans">
                  <p className="text-sm text-[var(--primary-color)] font-work-sans">
                    Are you sure you want to suspend <strong>{userToSuspend.name}</strong> ({userToSuspend.email})?
                  </p>
                  <p className="mt-2 text-sm text-[var(--secondary-color)] font-work-sans">
                    This action will prevent the user from accessing the system. It can be reversed later.
                  </p>
                </div>
                
                <div className="px-6 py-4 border-t border-[var(--divider-color)] flex justify-end space-x-3 font-work-sans">
                  <button className="px-4 py-2 bg-[var(--background-color)] text-[var(--primary-color)] rounded-md hover:bg-gray-200 font-work-sans" onClick={() => {
              setShowSuspendConfirm(false);
              setUserToSuspend(null);
            }} disabled={isSuspending}>

                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center font-work-sans" onClick={handleSuspendUser} disabled={isSuspending}>

                    {isSuspending && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 font-work-sans"></div>}
                    Suspend User
                  </button>
                </div>
              </div>
            </div>}
        </div>}

      {/* Debug Information */}
      <details className="bg-white rounded-xl shadow-sm border border-[var(--divider-color)]">
        <summary className="cursor-pointer bg-[var(--background-color)] px-6 py-3 text-lg font-medium text-[var(--primary-color)] hover:bg-opacity-80 rounded-t-xl font-work-sans">
          Debug Information
        </summary>
        <div className="p-6 font-work-sans">
          <pre className="bg-[var(--background-color)] p-4 rounded-md overflow-auto text-sm text-[var(--primary-color)] font-work-sans">
            {JSON.stringify({
            user: {
              email: user.email,
              roles: userRoles,
              isSuperAdmin
            },
            auth: {
              isAuthenticated: !!user,
              lastUpdated: new Date().toISOString()
            },
            environment: {
              nodeEnv: process.env.NODE_ENV,
              buildTime: new Date().toISOString()
            }
          }, null, 2)}
          </pre>
        </div>
      </details>
    </main>;
}
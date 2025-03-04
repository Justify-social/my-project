'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { getSession } from '@auth0/nextjs-auth0';
import {
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ClockIcon,
  ServerIcon,
  BellIcon,
  DocumentTextIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';

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

interface MetricCardProps {
  icon: any;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard = ({ icon: Icon, title, value, change, trend, color }: MetricCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-[var(--accent-color)]',
      text: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-900'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-900'
    }
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`${colorClasses[color].bg} rounded-xl p-6 shadow-sm border border-[var(--divider-color)] hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].icon}`} />
        </div>
        <div className={`text-sm font-medium ${trend ? trendColors[trend] : ''}`}>
          {change && trend && (
            <span className="bg-white px-2 py-1 rounded-md border border-[var(--divider-color)]">
              {trendIcons[trend]} {change}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-lg font-medium text-[var(--primary-color)] mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color].text}`}>{value}</p>
    </div>
  );
};

interface ActivityLogProps {
  activities: {
    id: string;
    user: string;
    action: string;
    timestamp: string;
    type: 'auth' | 'system' | 'user' | 'error';
  }[];
}

const ActivityLog = ({ activities }: ActivityLogProps) => {
  const typeStyles = {
    auth: 'bg-blue-50 text-[var(--accent-color)] border border-blue-200',
    system: 'bg-purple-50 text-purple-700 border border-purple-200',
    user: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[var(--divider-color)]">
      <div className="flex items-center mb-6">
        <div className="bg-[var(--background-color)] p-3 rounded-lg">
          <ClockIcon className="w-6 h-6 text-[var(--accent-color)]" />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-[var(--primary-color)]">Recent Activity</h2>
          <p className="text-sm text-[var(--secondary-color)]">Latest system events</p>
        </div>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--background-color)] hover:bg-opacity-80 transition-all">
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${typeStyles[activity.type]}`}>
                {activity.type.toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--primary-color)]">{activity.user}</p>
                <p className="text-sm text-[var(--secondary-color)]">{activity.action}</p>
              </div>
            </div>
            <span className="text-sm text-[var(--secondary-color)] bg-white px-2 py-1 rounded-md">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SystemStatusProps {
  services: {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    uptime: string;
    lastIncident: string | undefined;
  }[];
}

const SystemStatus = ({ services }: SystemStatusProps) => {
  const statusStyles = {
    operational: 'bg-green-50 text-green-700 border border-green-200',
    degraded: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    down: 'bg-red-50 text-red-700 border border-red-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[var(--divider-color)]">
      <div className="flex items-center mb-6">
        <div className="bg-[var(--background-color)] p-3 rounded-lg">
          <ServerIcon className="w-6 h-6 text-[var(--accent-color)]" />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-[var(--primary-color)]">System Status</h2>
          <p className="text-sm text-[var(--secondary-color)]">Current service health</p>
        </div>
      </div>
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--background-color)] hover:bg-opacity-80 transition-all">
            <div>
              <p className="text-sm font-medium text-[var(--primary-color)]">{service.name}</p>
              <p className="text-sm text-[var(--secondary-color)]">Uptime: {service.uptime}</p>
            </div>
            <span className={`px-3 py-1 rounded-md text-sm font-medium ${statusStyles[service.status]}`}>
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add type for Auth0 user with extended properties
interface Auth0User {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
  [key: string]: any; // Allow for custom Auth0 claims like roles
}

export default function AdminDashboard() {
  const { user, isLoading, error } = useUser() as { 
    user: Auth0User | undefined;
    isLoading: boolean;
    error: Error | undefined;
  };
  const [activities, setActivities] = useState<ActivityLogProps['activities']>([]);
  const [services, setServices] = useState<SystemStatusProps['services']>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  
  // Track suspended users in local state
  const [suspendedUserIds, setSuspendedUserIds] = useState<Set<string>>(new Set());
  
  // Add state for the user details modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);

  // Add state for suspend confirmation
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserData | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    // Mock data - replace with real API calls
    setActivities([
      {
        id: '1',
        user: 'System',
        action: 'Daily backup completed',
        timestamp: new Date().toISOString(),
        type: 'system'
      },
      {
        id: '2',
        user: 'ed@justify.social',
        action: 'Updated user permissions',
        timestamp: new Date().toISOString(),
        type: 'auth'
      },
      {
        id: '3',
        user: 'API',
        action: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
        type: 'error'
      }
    ]);

    setServices([
      {
        name: 'Authentication API',
        status: 'operational',
        uptime: '99.99%',
        lastIncident: undefined
      },
      {
        name: 'Database Cluster',
        status: 'operational',
        uptime: '99.95%',
        lastIncident: '2024-02-20'
      },
      {
        name: 'Storage Service',
        status: 'operational',
        uptime: '99.99%',
        lastIncident: undefined
      }
    ]);

    // Fetch users data for Super Admins
    const fetchUsers = async () => {
      // Check if user exists and has super_admin role
      const userRoles = user?.['https://justify.social/roles'] as string[] || [];
      
      if (user && userRoles.includes('super_admin')) {
        setIsLoadingUsers(true);
        setUserError(null);
        try {
          const response = await fetch('/api/admin/users');
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          const data = await response.json();
          setUsers(data.users || []);
        } catch (err) {
          console.error('Error fetching users:', err);
          setUserError(err instanceof Error ? err.message : 'Failed to load users');
          // Add some mock data for development
          if (process.env.NODE_ENV === 'development') {
            setUsers([
              {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                companyId: 'comp1',
                role: 'MEMBER',
                lastLogin: '2024-03-10T12:00:00Z'
              },
              {
                id: '2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                companyId: 'comp1',
                role: 'ADMIN',
                lastLogin: '2024-03-09T14:30:00Z'
              }
            ]);
          }
        } finally {
          setIsLoadingUsers(false);
        }
      }
    };

    fetchUsers();
  }, [user]);

  // Handler for updating user role
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));

      // Add to activity log
      setActivities([
        {
          id: Date.now().toString(),
          user: user?.email || 'Admin',
          action: `Updated role for user ${userId} to ${newRole}`,
          timestamp: new Date().toISOString(),
          type: 'auth'
        },
        ...activities.slice(0, 9) // Keep only 10 most recent
      ]);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  // Handler for viewing user details
  const handleViewUser = async (userData: UserData) => {
    setSelectedUser(userData);
    setIsUserModalOpen(true);
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userToSuspend.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suspend user');
      }

      // Add to activity log
      setActivities([
        {
          id: Date.now().toString(),
          user: user?.email || 'Admin',
          action: `Suspended user ${userToSuspend.email}`,
          timestamp: new Date().toISOString(),
          type: 'auth'
        },
        ...activities.slice(0, 9) // Keep only 10 most recent
      ]);

      // Track suspended users in our local state
      setSuspendedUserIds(prev => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-800 rounded-lg p-4 border border-red-200">
          Error loading dashboard: {error.message}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 text-yellow-800 rounded-lg p-4 border border-yellow-200">
          Please log in to access the admin dashboard
        </div>
      </div>
    );
  }

  // Safely access user roles
  const userRoles = user ? (user['https://justify.social/roles'] as string[] || []) : [];
  const isSuperAdmin = userRoles.includes('super_admin');

  return (
    <div className="p-6 bg-white rounded-xl border border-[var(--divider-color)] shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--divider-color)]">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">Admin Dashboard</h1>
          <p className="text-[var(--secondary-color)] mt-1">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-[var(--background-color)] rounded-full text-[var(--secondary-color)] hover:text-[var(--accent-color)] transition-colors">
            <BellIcon className="w-6 h-6" />
          </button>
          <button className="p-2 bg-[var(--background-color)] rounded-full text-[var(--secondary-color)] hover:text-[var(--accent-color)] transition-colors">
            <CogIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={UserGroupIcon}
          title="Total Users"
          value="1,234"
          change="+12.3%"
          trend="up"
          color="blue"
        />
        <MetricCard
          icon={ChartBarIcon}
          title="Active Sessions"
          value="456"
          change="+5.2%"
          trend="up"
          color="green"
        />
        <MetricCard
          icon={ShieldCheckIcon}
          title="Security Score"
          value="98%"
          change="No Change"
          trend="neutral"
          color="purple"
        />
        <MetricCard
          icon={DocumentTextIcon}
          title="API Requests"
          value="789k"
          change="-2.1%"
          trend="down"
          color="orange"
        />
      </div>

      {/* Super Admin: User Management Section */}
      {isSuperAdmin && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--primary-color)] mb-4">
            User & Team Management
          </h2>
          
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Access Management</h3>
                {isLoadingUsers && (
                  <div className="animate-spin h-5 w-5 border-2 border-[var(--accent-color)] border-t-transparent rounded-full"></div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {userError && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm">
                  {userError}
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--divider-color)]">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--secondary-color)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--divider-color)]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[var(--background-color)]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <div className="text-sm font-medium text-[var(--primary-color)]">
                                {user.name}
                              </div>
                              <div className="text-sm text-[var(--secondary-color)]">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--primary-color)]">
                          {user.companyId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            className="text-sm rounded-md border border-[var(--divider-color)] px-2 py-1"
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                            disabled={isUserSuspended(user.id)}
                          >
                            <option value="OWNER">Owner</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MEMBER">Member</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--primary-color)]">
                          {new Date(user.lastLogin).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-[var(--accent-color)] hover:text-blue-800 mr-3"
                            onClick={() => handleViewUser(user)}
                          >
                            View
                          </button>
                          {!isUserSuspended(user.id) && (
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setUserToSuspend(user);
                                setShowSuspendConfirm(true);
                              }}
                            >
                              Suspend
                            </button>
                          )}
                          {isUserSuspended(user.id) && (
                            <span className="text-gray-400">Suspended</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && !isLoadingUsers && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--secondary-color)]">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ActivityLog activities={activities} />
        <SystemStatus services={services} />
      </div>

      {/* User Details Modal */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--divider-color)] flex justify-between items-center">
              <h3 className="text-lg font-medium">User Details</h3>
              <button 
                className="text-[var(--secondary-color)] hover:text-[var(--primary-color)]"
                onClick={() => setIsUserModalOpen(false)}
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              {isUserDetailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full"></div>
                </div>
              ) : userDetailError ? (
                <div className="bg-red-50 text-red-800 p-4 rounded-md">
                  {userDetailError}
                </div>
              ) : (
                <div className="space-y-4">
                  {isUserSuspended(selectedUser.id) && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
                      This user is currently suspended
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--secondary-color)]">
                        Name
                      </label>
                      <div className="mt-1 text-sm">{selectedUser.name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--secondary-color)]">
                        Email
                      </label>
                      <div className="mt-1 text-sm">{selectedUser.email}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--secondary-color)]">
                        Company
                      </label>
                      <div className="mt-1 text-sm">{selectedUser.companyId || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--secondary-color)]">
                        Role
                      </label>
                      <div className="mt-1 text-sm">{selectedUser.role}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--secondary-color)]">
                        User ID
                      </label>
                      <div className="mt-1 text-sm">{selectedUser.id}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--secondary-color)]">
                        Last Login
                      </label>
                      <div className="mt-1 text-sm">
                        {new Date(selectedUser.lastLogin).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--secondary-color)]">
                        Created At
                      </label>
                      <div className="mt-1 text-sm">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-[var(--divider-color)] pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[var(--secondary-color)]">
                          Updated At
                        </label>
                        <div className="mt-1 text-sm">
                          {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-[var(--divider-color)] flex justify-end">
              <button
                className="px-4 py-2 bg-[var(--background-color)] text-[var(--primary-color)] rounded-md hover:bg-gray-200"
                onClick={() => setIsUserModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Confirmation Modal */}
      {showSuspendConfirm && userToSuspend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--divider-color)]">
              <h3 className="text-lg font-medium text-red-600">Suspend User</h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-[var(--primary-color)]">
                Are you sure you want to suspend <strong>{userToSuspend.name}</strong> ({userToSuspend.email})?
              </p>
              <p className="mt-2 text-sm text-[var(--secondary-color)]">
                This action will prevent the user from accessing the system. It can be reversed later.
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-[var(--divider-color)] flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-[var(--background-color)] text-[var(--primary-color)] rounded-md hover:bg-gray-200"
                onClick={() => {
                  setShowSuspendConfirm(false);
                  setUserToSuspend(null);
                }}
                disabled={isSuspending}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                onClick={handleSuspendUser}
                disabled={isSuspending}
              >
                {isSuspending && (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                )}
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug Information */}
      <details className="bg-white rounded-xl shadow-sm border border-[var(--divider-color)]">
        <summary className="cursor-pointer bg-[var(--background-color)] px-6 py-3 text-lg font-medium text-[var(--primary-color)] hover:bg-opacity-80 rounded-t-xl">
          Debug Information
        </summary>
        <div className="p-6">
          <pre className="bg-[var(--background-color)] p-4 rounded-md overflow-auto text-sm text-[var(--primary-color)]">
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
    </div>
  );
} 
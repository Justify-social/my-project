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
  DocumentTextIcon
} from '@heroicons/react/24/solid';

interface Company {
  id: string;
  name: string;
  createdAt: string;
  userCount: number;
  status: 'active' | 'inactive';
  subscription: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: string;
  lastLogin: string;
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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

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
                            onClick={() => {/* View user details */}}
                          >
                            View
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {/* Suspend user */}}
                          >
                            Suspend
                          </button>
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
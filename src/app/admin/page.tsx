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
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-white/80" />
        <div className={`text-sm font-medium ${trend ? trendColors[trend] : ''}`}>
          {change && (
            <span className="bg-white/10 px-2 py-1 rounded">
              {change}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
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
    auth: 'bg-blue-100 text-blue-800',
    system: 'bg-purple-100 text-purple-800',
    user: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-6 flex items-center">
        <ClockIcon className="w-6 h-6 mr-2 text-gray-500" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles[activity.type]}`}>
                {activity.type.toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-500">{activity.action}</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">
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
    operational: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-6 flex items-center">
        <ServerIcon className="w-6 h-6 mr-2 text-gray-500" />
        System Status
      </h3>
      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{service.name}</p>
              <p className="text-sm text-gray-500">Uptime: {service.uptime}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[service.status]}`}>
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { user, isLoading, error } = useUser();
  const [activities, setActivities] = useState<ActivityLogProps['activities']>([]);
  const [services, setServices] = useState<SystemStatusProps['services']>([]);

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
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-800 rounded-lg p-4">
          Error loading dashboard: {error.message}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 text-yellow-800 rounded-lg p-4">
          Please log in to access the admin dashboard
        </div>
      </div>
    );
  }

  // Safely access user roles
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  const isSuperAdmin = userRoles.includes('super_admin');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <BellIcon className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <CogIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityLog activities={activities} />
        <SystemStatus services={services} />
      </div>

      {/* Debug Information */}
      <details className="bg-white rounded-lg shadow-sm mt-8">
        <summary className="cursor-pointer bg-gray-50 px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100">
          Debug Information
        </summary>
        <div className="p-6">
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
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
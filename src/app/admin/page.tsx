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
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
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
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Card,
  Spinner,
  Button,
  Alert,
} from '@/components/ui';
import { format } from 'date-fns';

// Types for telemetry data
interface TelemetryRecord {
  timestamp: number;
  sessionId: string;
  action: 'check' | 'bypass' | 'block' | 'complete';
  taskType?: string;
  success: boolean;
}

interface SessionState {
  sessionId: string;
  lastUpdated: string;
  hasCheckedGraphiti: boolean;
  taskType?: string;
  queryCount: number;
}

interface TelemetryData {
  activeSessions: SessionState[];
  telemetry: TelemetryRecord[];
}

interface TelemetryStats {
  activeSessions: number;
  checkCount: number;
  blockCount: number;
  completeCount: number;
  bypassCount: number;
  successRate: number;
}

interface TelemetryResponse {
  telemetry: TelemetryData;
  stats: TelemetryStats;
  timestamp: string;
}

/**
 * GraphitiDashboard - Admin component for monitoring Graphiti integration
 */
export default function GraphitiDashboard() {
  const [activeTab, setActiveTab] = useState<string>("sessions");
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds

  // Fetch telemetry data
  const { data, isLoading, error, refetch } = useQuery<TelemetryResponse>({
    queryKey: ['graphiti-telemetry'],
    queryFn: async () => {
      const response = await axios.get<TelemetryResponse>('/api/internal/graphiti-telemetry');
      return response.data;
    },
    refetchInterval: refreshInterval,
  });

  // Auto refresh control
  const toggleAutoRefresh = () => {
    setRefreshInterval(prev => prev ? 0 : 30000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Graphiti Integration Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            aria-label="Refresh data"
          >
            Refresh
          </Button>
          <Button 
            variant={refreshInterval ? 'secondary' : 'outline'}
            onClick={toggleAutoRefresh}
            aria-label={refreshInterval ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {refreshInterval ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <Alert 
          status="error"
          variant="default"
          message="Error loading telemetry data"
        >
          <p>
            {error instanceof Error 
              ? error.message 
              : 'Unknown error occurred. You may not have sufficient permissions.'}
          </p>
        </Alert>
      )}

      {data && (
        <div className="space-y-6">
          <div className="text-sm text-gray-500">
            Last updated: {format(new Date(data.timestamp), 'PPpp')}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Active Sessions" 
              value={data.stats.activeSessions} 
              icon="users"
            />
            <StatCard 
              title="Success Rate" 
              value={`${data.stats.successRate}%`} 
              icon="chart-line"
              color={data.stats.successRate > 90 ? 'green' : data.stats.successRate > 75 ? 'yellow' : 'red'}
            />
            <StatCard 
              title="Blocked Requests" 
              value={data.stats.blockCount} 
              icon="shield-xmark"
              color={data.stats.blockCount > 10 ? 'red' : 'gray'}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab("sessions")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "sessions" 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Active Sessions ({data.telemetry.activeSessions.length})
              </button>
              
              <button
                onClick={() => setActiveTab("activity")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "activity" 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Recent Activity ({data.telemetry.telemetry.length})
              </button>
              
              <button
                onClick={() => setActiveTab("analytics")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics" 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "sessions" && <SessionsTable sessions={data.telemetry.activeSessions} />}
            {activeTab === "activity" && <ActivityTable records={data.telemetry.telemetry} />}
            {activeTab === "analytics" && <AnalyticsView stats={data.stats} telemetry={data.telemetry.telemetry} />}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function StatCard({ title, value, icon, color = 'blue' }: { 
  title: string; 
  value: string | number; 
  icon: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <i className={`fa-light fa-${icon} text-xl`}></i>
        </div>
      </div>
    </Card>
  );
}

function SessionsTable({ sessions }: { sessions: SessionState[] }) {
  if (sessions.length === 0) {
    return <div className="py-8 text-center text-gray-500">No active sessions</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left">Session ID</th>
            <th className="px-4 py-3 text-left">Last Active</th>
            <th className="px-4 py-3 text-left">Task Type</th>
            <th className="px-4 py-3 text-left">Query Count</th>
            <th className="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sessions.map((session) => (
            <tr key={session.sessionId} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{session.sessionId}</td>
              <td className="px-4 py-3">{format(new Date(session.lastUpdated), 'Pp')}</td>
              <td className="px-4 py-3">{session.taskType || 'unknown'}</td>
              <td className="px-4 py-3">{session.queryCount}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  session.hasCheckedGraphiti ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {session.hasCheckedGraphiti ? 'Compliant' : 'Pending Check'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityTable({ records }: { records: TelemetryRecord[] }) {
  if (records.length === 0) {
    return <div className="py-8 text-center text-gray-500">No activity recorded</div>;
  }

  // Only show the most recent 50 records
  const recentRecords = [...records].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left">Time</th>
            <th className="px-4 py-3 text-left">Session ID</th>
            <th className="px-4 py-3 text-left">Action</th>
            <th className="px-4 py-3 text-left">Task Type</th>
            <th className="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {recentRecords.map((record, idx) => (
            <tr key={`${record.sessionId}-${record.timestamp}-${idx}`} className="hover:bg-gray-50">
              <td className="px-4 py-3">{format(new Date(record.timestamp), 'Pp')}</td>
              <td className="px-4 py-3 font-mono text-xs">{record.sessionId}</td>
              <td className="px-4 py-3 capitalize">{record.action}</td>
              <td className="px-4 py-3">{record.taskType || 'unknown'}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  record.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {record.success ? 'Success' : 'Failed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsView({ stats, telemetry }: { stats: TelemetryStats, telemetry: TelemetryRecord[] }) {
  // Calculate action distribution
  const actionCounts = {
    check: stats.checkCount,
    block: stats.blockCount,
    complete: stats.completeCount,
    bypass: stats.bypassCount,
  };

  // Calculate success rate over time (simplified)
  const successByDay: Record<string, { success: number, total: number }> = {};
  
  telemetry.forEach(record => {
    const day = format(new Date(record.timestamp), 'yyyy-MM-dd');
    if (!successByDay[day]) {
      successByDay[day] = { success: 0, total: 0 };
    }
    
    successByDay[day].total += 1;
    if (record.success) {
      successByDay[day].success += 1;
    }
  });

  const successRateByDay = Object.entries(successByDay).map(([day, counts]) => ({
    day,
    rate: Math.round((counts.success / counts.total) * 100)
  }));

  return (
    <div className="space-y-8 py-4">
      {/* Action Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Action Distribution</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(actionCounts).map(([action, count]) => (
            <div key={action} className="text-center">
              <div className="text-3xl font-bold">{count}</div>
              <div className="text-sm text-gray-500 capitalize">{action}s</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Success Rate Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Success Rate Trend</h3>
        {successRateByDay.length === 0 ? (
          <div className="py-4 text-center text-gray-500">Not enough data to show trends</div>
        ) : (
          <div className="h-64 flex items-end justify-around">
            {successRateByDay.map(({ day, rate }) => (
              <div key={day} className="flex flex-col items-center">
                <div className="text-xs mb-1">{rate}%</div>
                <div 
                  className={`w-12 ${
                    rate > 90 ? 'bg-green-500' : rate > 75 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${rate}%` }}
                ></div>
                <div className="text-xs mt-1">{format(new Date(day), 'MMM d')}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 
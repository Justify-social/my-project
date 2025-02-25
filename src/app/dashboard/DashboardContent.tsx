"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend as RechartsLegend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ChartBarIcon,
  MegaphoneIcon,
  HeartIcon,
  HashtagIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
  SignalIcon,
  BellAlertIcon,
  ChartPieIcon,
  MapIcon,
  CogIcon,
  DocumentMagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import useSWR from 'swr';

// Import dynamically loaded components and ensure they are exported correctly.
const CalendarUpcoming = dynamic(() => import("../../components/CalendarUpcoming"), {
  ssr: false,
});

// -----------------------
// Helper Components
// -----------------------

// Spinner for loading states
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 opacity-30"></div>
    </div>
  </div>
);

// Toast component for non-blocking notifications
interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
}

const Toast: React.FC<ToastProps> = ({ message, type = "info" }) => {
  const config = {
    error: {
      bg: "bg-gradient-to-r from-red-600 to-red-700",
      icon: XCircleIcon
    },
    success: {
      bg: "bg-gradient-to-r from-green-600 to-green-700",
      icon: CheckCircleIcon
    },
    info: {
      bg: "bg-gradient-to-r from-blue-600 to-blue-700",
      icon: BellAlertIcon
    }
  }[type];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 right-4 ${config.bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};

// Card component to wrap modules in a modern, "card" style
interface CardProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, icon: Icon, children, actions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        {Icon && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg mr-4">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 font-sora">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex space-x-2">
          {actions}
        </div>
      )}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const config = {
    live: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircleIcon,
      label: "Live"
    },
    paused: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: ClockIcon,
      label: "Paused"
    },
    completed: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircleIcon,
      label: "Completed"
    },
    scheduled: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: CalendarDaysIcon,
      label: "Scheduled"
    }
  }[status.toLowerCase()] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: ClockIcon,
    label: status
  };

  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium 
      ${config.color} border shadow-sm`}>
      <Icon className={size === "sm" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-1.5"} />
      {config.label}
    </span>
  );
};

// Campaign Card Component
interface CampaignCardProps {
  campaign: Campaign;
  onClick?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          <h4 className="font-semibold text-gray-900">{campaign.campaignName}</h4>
          <StatusBadge status={campaign.submissionStatus} size="sm" />
        </div>
        <p className="text-sm text-gray-600">
          {new Date(campaign.startDate).toLocaleDateString()} - {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          Budget: ${campaign.totalBudget?.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          ROI: {campaign.roi}x
        </p>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-4">
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">Engagement</p>
        <p className="text-lg font-semibold text-gray-900">{campaign.performance?.engagement}%</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">Reach</p>
        <p className="text-lg font-semibold text-gray-900">{campaign.performance?.reach}K</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">Conversion</p>
        <p className="text-lg font-semibold text-gray-900">{campaign.performance?.conversion}%</p>
      </div>
    </div>
  </motion.div>
);

// Reusable Components
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  format?: "number" | "currency" | "percent";
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon: Icon, description, format = "number" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center text-sm font-medium ${
          trend >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend >= 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
          )}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1 font-sora">{title}</h3>
    <div className="flex items-baseline">
      <p className="text-3xl font-bold text-gray-900">
        {format === "currency" && "$"}
        {typeof value === "number" ? value.toLocaleString() : value}
        {format === "percent" && "%"}
      </p>
    </div>
    {description && (
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    )}
  </motion.div>
);

// -----------------------
// Type Definitions
// -----------------------
interface Campaign {
  id: number;
  campaignName: string;
  submissionStatus: "draft" | "submitted";
  platform: "Instagram" | "YouTube" | "TikTok";
  startDate: string;
  endDate: string;
  totalBudget: number;
  primaryKPI: string;
  primaryContact: {
    firstName: string;
    surname: string;
  };
  createdAt: string;
  audience?: {
    locations: { location: string }[];
  };
  performance?: {
    engagement: number;
    sentiment: number;
    reach: number;
    conversion: number;
  };
  status?: string;
  roi?: number;
  usersEngaged?: {
    current: number;
    total: number;
  };
}

interface Insight {
  title: string;
  description: string;
  actionText: string;
}

interface PerformanceMetrics {
  totalCampaigns: number;
  campaignChange: number;
  surveyResponses: number;
  surveyChange: number;
  liveCampaigns: number;
  liveChange: number;
  creditsAvailable: number;
  creditsChange: number;
}

interface DashboardMetrics {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    totalSpent: number;
    averageROI: number;
    campaignSuccess: number;
  };
  performance: {
    engagement: {
      current: number;
      trend: number;
      byChannel: Array<{ channel: string; value: number }>;
    };
    reach: {
      current: number;
      trend: number;
      byDemographic: Array<{ group: string; value: number }>;
    };
    sentiment: {
      current: number;
      trend: number;
      distribution: Array<{ type: string; value: number }>;
    };
    conversion: {
      current: number;
      trend: number;
      bySource: Array<{ source: string; value: number }>;
    };
  };
  trends: {
    daily: Array<{
      date: string;
      engagement: number;
      reach: number;
      sentiment: number;
      conversion: number;
    }>;
    weekly: Array<{
      week: string;
      engagement: number;
      reach: number;
      sentiment: number;
      conversion: number;
    }>;
  };
  insights: Array<{
    id: string;
    category: "Performance" | "Opportunity" | "Risk" | "Trend";
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    action: string;
    metrics?: {
      current: number;
      previous: number;
      trend: number;
    };
  }>;
}

interface DashboardContentProps {
  user: {
    id: string;
    name: string;
    role: string;
  };
}

// Add CalendarUpcoming props interface
interface CalendarUpcomingProps {
  events: Array<{
    id: number;
    title: string;
    start: Date;
    end?: Date;
    platform: string;
    budget: number;
    kpi: string;
  }>;
}

// Update the API response type
interface CampaignsResponse {
  success: boolean;
  campaigns: Campaign[];
  metrics?: DashboardMetrics;
}

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  actions?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, children, icon: Icon, actions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
  >
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg mr-4">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 font-sora">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  </motion.div>
);

// Add new interfaces for Brand Health and Influencer components
interface BrandHealthMetrics {
  awareness: number;
  consideration: number;
  preference: number;
  satisfaction: number;
  nps: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trends: {
    date: string;
    value: number;
  }[];
}

interface InfluencerMetrics {
  totalInfluencers: number;
  activeCollaborations: number;
  averageEngagement: number;
  reachGenerated: number;
  topPerformers: Array<{
    name: string;
    platform: string;
    engagement: number;
    reach: number;
  }>;
}

// -----------------------
// DashboardContent Component
// -----------------------
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Calendar component with month view
const CalendarMonthView: React.FC<{ month: Date, events: CalendarUpcomingProps['events'] }> = ({ month, events }) => {
  const [currentMonth, setCurrentMonth] = useState(month);
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 text-center text-gray-400"></div>);
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const hasEvent = events.some(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
    
    days.push(
      <div 
        key={`day-${day}`} 
        className={`h-8 flex items-center justify-center rounded-full w-8 mx-auto ${
          hasEvent 
            ? 'bg-blue-100 text-blue-800 font-medium' 
            : 'text-gray-700'
        }`}
      >
        {day}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-medium text-gray-900">{monthName} {year}</h3>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Switch to Timeline
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-xs text-center text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('7d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Update the SWR hook type
  const { data: campaignsData, error: fetchError, isLoading: isLoadingCampaigns } = useSWR<CampaignsResponse>(
    '/api/campaigns',
    fetcher,
    {
      onError: (error) => {
        handleError(new Error('Failed to fetch campaign data'));
      }
    }
  );

  // Process campaigns for different views
  const activeCampaigns = useMemo(() => {
    return campaignsData?.campaigns?.filter(campaign => 
      campaign.submissionStatus === "submitted" && 
      new Date(campaign.startDate) <= new Date() &&
      (!campaign.endDate || new Date(campaign.endDate) >= new Date())
    ) || [];
  }, [campaignsData?.campaigns]);

  const upcomingCampaigns = useMemo(() => {
    return campaignsData?.campaigns?.filter(campaign => 
      new Date(campaign.startDate) > new Date()
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3) || [];
  }, [campaignsData?.campaigns]);

  // Calendar events for the upcoming campaigns
  const calendarEvents = useMemo(() => {
    return upcomingCampaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.campaignName,
      start: new Date(campaign.startDate),
      end: campaign.endDate ? new Date(campaign.endDate) : undefined,
      platform: campaign.platform,
      budget: campaign.totalBudget,
      kpi: campaign.primaryKPI
    }));
  }, [upcomingCampaigns]);

  const metrics = useMemo(() => ({
    ...campaignsData?.metrics || {
      trends: { daily: [] },
      performance: { engagement: { byChannel: [] } }
    },
    stats: {
      totalCampaigns: 154,
      campaignChange: 10,
      surveyResponses: 3000,
      surveyChange: -81,
      liveCampaigns: 31,
      liveChange: 5,
      creditsAvailable: 135,
      creditsChange: -47
    }
  }), [campaignsData?.metrics]);

  // Add new metrics
  const brandHealth = useMemo(() => ({
    awareness: 78,
    consideration: 65,
    preference: 42,
    satisfaction: 88,
    nps: 72,
    sentiment: {
      positive: 65,
      neutral: 25,
      negative: 10
    },
    trends: [
      { date: "2024-01", value: 75 },
      { date: "2024-02", value: 78 },
      { date: "2024-03", value: 72 }
    ]
  }), []);

  const influencerMetrics = useMemo(() => ({
    totalInfluencers: 125,
    activeCollaborations: 45,
    averageEngagement: 8.5,
    reachGenerated: 2500000,
    topPerformers: [
      { name: "Sarah Johnson", platform: "Instagram", engagement: 12.3, reach: 500000 },
      { name: "Mike Chen", platform: "TikTok", engagement: 15.7, reach: 750000 },
      { name: "Emma Davis", platform: "YouTube", engagement: 9.8, reach: 350000 }
    ]
  }), []);

  const handleNewCampaign = () => {
    router.push('/campaigns/wizard/step-1');
  };

  const handleError = (error: Error) => {
    setToastMessage(error.message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToastMessage('Dashboard data exported successfully');
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Export failed'));
    } finally {
      setIsExporting(false);
    }
  };

  // Static data
  const insights: Insight[] = [
    {
      title: "Youth Momentum: Boosting Performance Among 18-24-Year-Olds",
      description:
        "Campaign 'NextGen Focus: Amplify Impact' is performing 20% better among 18-24-year-olds. Consider allocating more budget to this segment.",
      actionText: "Read",
    },
    {
      title: "Low Engagement on 'NextGen Focus: Amplify Impact'",
      description: "Engagement rate is 15% below average. Consider revising the call-to-action.",
      actionText: "View All Insights",
    },
  ];

  const engagementData = [
    { date: "01 Aug", engagement: 20 },
    { date: "05 Aug", engagement: 35 },
    { date: "10 Aug", engagement: 50 },
    { date: "15 Aug", engagement: 45 },
    { date: "20 Aug", engagement: 30 },
    { date: "25 Aug", engagement: 25 },
    { date: "30 Aug", engagement: 20 },
  ];

  const InsightCard: React.FC<{
    insight: DashboardMetrics['insights'][0];
    onAction: (action: string) => void;
  }> = ({ insight, onAction }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg hover:bg-gray-50 transition-all duration-300"
    >
      {/* ... existing InsightCard implementation ... */}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toastMessage && <Toast message={toastMessage} type="info" />}

        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 mb-2 font-sora"
            >
              Campaign Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600"
            >
              Real-time campaign performance and insights
            </motion.p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
              <option value="1y">Last Year</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewCampaign}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
            >
              <RocketLaunchIcon className="w-5 h-5" />
              <span>New Campaign</span>
            </motion.button>
          </div>
        </div>

        {/* Top Row - Calendar and Upcoming Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Interactive Calendar */}
          <Card
            title="Campaign Calendar"
            description="Interactive view of campaign schedule"
            icon={CalendarDaysIcon}
            actions={
              <button
                onClick={() => router.push('/calendar')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Full Calendar
              </button>
            }
          >
            <CalendarMonthView month={new Date()} events={calendarEvents} />
          </Card>

          {/* Upcoming Campaigns */}
          <Card
            title="Upcoming Campaigns"
            description="Scheduled campaigns starting soon"
            icon={RocketLaunchIcon}
          >
            {isLoadingCampaigns ? (
              <Spinner />
            ) : fetchError ? (
              <div className="text-center py-8">
                <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{fetchError instanceof Error ? fetchError.message : 'Failed to load campaigns'}</p>
              </div>
            ) : upcomingCampaigns.length > 0 ? (
              <div className="space-y-4">
                {upcomingCampaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{campaign.campaignName}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Starts {new Date(campaign.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {campaign.submissionStatus === "draft" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            draft
                          </span>
                        )}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          ${campaign.totalBudget?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div className="text-center pt-2">
                  <button
                    onClick={() => router.push('/campaigns')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Campaigns →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming campaigns</p>
              </div>
            )}
          </Card>
        </div>

        {/* Second Row - Brand Health, Influencer Management, Active Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand Health Card */}
          <Card
            title="Brand Health"
            description="Overall brand performance metrics"
            icon={HeartIcon}
            actions={
              <button
                onClick={() => router.push('/brand-health')}
                className="text-blue-600 hover:text-blue-800"
              >
                View Details
              </button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Brand NPS</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{brandHealth.nps}</p>
                    <span className="ml-2 text-green-600 text-sm flex items-center">
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      +5%
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Awareness</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-900">{brandHealth.awareness}%</p>
                    <span className="ml-2 text-blue-600 text-sm flex items-center">
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      +3%
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={brandHealth.trends}>
                    <defs>
                      <linearGradient id="colorBrandHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorBrandHealth)"
                      name="Brand Health"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Influencer Management Card */}
          <Card
            title="Influencer Management"
            description="Influencer performance and metrics"
            icon={UserGroupIcon}
            actions={
              <button
                onClick={() => router.push('/influencers')}
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Active Collabs</p>
                  <p className="text-2xl font-bold text-gray-900">{influencerMetrics.activeCollaborations}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Avg Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">{influencerMetrics.averageEngagement}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Top Performers</p>
                {influencerMetrics.topPerformers.map((influencer, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-lg p-3 border border-gray-100"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{influencer.name}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {influencer.platform}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{influencer.engagement}% Engagement</p>
                        <p className="text-sm text-gray-600">{(influencer.reach / 1000000).toFixed(1)}M Reach</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* Active Campaigns Card */}
          <Card
            title="Active Campaigns"
            description="Currently running campaign performance"
            icon={RocketLaunchIcon}
            actions={
              <button
                onClick={() => router.push('/campaigns')}
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            }
          >
            {isLoadingCampaigns ? (
              <Spinner />
            ) : fetchError ? (
              <div className="text-center py-8">
                <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{fetchError instanceof Error ? fetchError.message : 'Failed to load campaigns'}</p>
              </div>
            ) : activeCampaigns.length > 0 ? (
              <div className="space-y-4">
                {activeCampaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{campaign.campaignName}</h4>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            Live
                          </span>
                          <p className="text-sm text-gray-600">
                            {campaign.platform}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end">
                          <svg className="w-4 h-4 text-gray-500 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <p className="text-sm text-gray-600">
                            {new Date(campaign.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ${campaign.totalBudget?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-8">
                  <RocketLaunchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No active campaigns</p>
                  <button
                    onClick={handleNewCampaign}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start a new campaign
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Performance Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Trends */}
          <Card
            title="Performance Trends"
            description="Campaign metrics over time"
            icon={ChartBarIcon}
            actions={
              <button
                onClick={() => router.push('/analytics')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View All
              </button>
            }
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.trends.daily}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <RechartsLegend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingBottom: '10px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorEngagement)"
                    name="Engagement"
                  />
                  <Area
                    type="monotone"
                    dataKey="reach"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorReach)"
                    name="Reach"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Channel Performance */}
          <Card
            title="Channel Performance"
            description="Engagement by platform"
            icon={SignalIcon}
            actions={
              <button
                onClick={() => router.push('/analytics/channels')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Details
              </button>
            }
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.performance.engagement.byChannel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="channel" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]} 
                    name="Engagement"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

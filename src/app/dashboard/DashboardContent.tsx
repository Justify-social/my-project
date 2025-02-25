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
  PlusIcon,
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-color)]"></div>
      <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-t-2 border-[var(--accent-color)] opacity-30"></div>
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
      bg: "bg-red-600",
      icon: XCircleIcon
    },
    success: {
      bg: "bg-green-600",
      icon: CheckCircleIcon
    },
    info: {
      bg: "bg-[var(--accent-color)]",
      icon: BellAlertIcon
    }
  }[type];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 right-4 ${config.bg} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="font-medium text-sm">{message}</span>
    </motion.div>
  );
};

// Error display component for sections
const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
    <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
      <XCircleIcon className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-medium text-[var(--primary-color)] mb-2">Something went wrong!</h3>
    <p className="text-sm text-[var(--secondary-color)] mb-4">
      {message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        <ArrowPathIcon className="w-4 h-4 mr-2" />
        <span>Try again</span>
      </button>
    )}
    </div>
  );

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
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white shadow-sm rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-[var(--divider-color)]"
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
      <div className="flex items-center">
        {Icon && (
          <div className="bg-[var(--accent-color)] bg-opacity-10 p-2.5 rounded-lg mr-3">
            <Icon className="w-5 h-5 text-[var(--accent-color)]" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-[var(--primary-color)]">{title}</h2>
          {description && (
            <p className="text-sm text-[var(--secondary-color)] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex space-x-2 ml-auto sm:ml-0">
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
    color: "bg-gray-100 text-[var(--secondary-color)] border-gray-200",
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

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-lg border border-[var(--divider-color)] p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => router.push(`/campaigns/${campaign.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-50 rounded-lg mr-3 flex items-center justify-center overflow-hidden">
            {campaign.platform === "Instagram" && (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 6.5H17.51" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {campaign.platform === "YouTube" && (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16135 5.19941C1.82072 5.55057 1.57879 5.98541 1.46 6.46C1.14521 8.20556 0.991235 9.97631 1 11.75C0.988687 13.537 1.14266 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17814 18.2945C2.51798 18.6308 2.93882 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 22.9965 13.5103 23 11.75C23.0113 9.96295 22.8573 8.1787 22.54 6.42Z" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {campaign.platform === "TikTok" && (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 12C8.34315 12 7 13.3431 7 15C7 16.6569 8.34315 18 10 18C11.6569 18 13 16.6569 13 15V6C13.3333 7 14.6 9 17 9" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-[var(--primary-color)]">{campaign.campaignName}</h4>
              <StatusBadge status={campaign.status || "scheduled"} size="sm" />
            </div>
            <div className="flex items-center mt-1">
              <svg className="w-3 h-3 text-[var(--secondary-color)] mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-xs text-[var(--secondary-color)]">
                {new Date(campaign.startDate).toLocaleDateString()} - {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-sm font-medium text-[var(--primary-color)]">
            ${campaign.totalBudget?.toLocaleString()}
          </p>
          <div className="flex space-x-1 mt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/campaigns/${campaign.id}/edit`);
              }}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <svg className="w-4 h-4 text-[var(--secondary-color)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/campaigns/${campaign.id}`);
              }}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <svg className="w-4 h-4 text-[var(--secondary-color)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.45825 12C3.73253 7.94288 7.52281 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {campaign.performance && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-[var(--secondary-color)]">Engagement</p>
            <p className="text-sm font-semibold text-[var(--primary-color)]">{campaign.performance.engagement}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-[var(--secondary-color)]">Reach</p>
            <p className="text-sm font-semibold text-[var(--primary-color)]">{campaign.performance.reach}K</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-[var(--secondary-color)]">Conversion</p>
            <p className="text-sm font-semibold text-[var(--primary-color)]">{campaign.performance.conversion}%</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

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
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6 border border-[var(--divider-color)]"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="bg-[var(--accent-color)] bg-opacity-10 p-3 rounded-lg">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-color)]" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center text-xs sm:text-sm font-medium ${
          trend >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend >= 0 ? (
            <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
          )}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-sm text-[var(--secondary-color)] mb-1 font-medium">{title}</h3>
    <div className="flex items-baseline">
      <p className="text-2xl sm:text-3xl font-bold text-[var(--primary-color)]">
        {format === "currency" && "$"}
        {typeof value === "number" ? value.toLocaleString() : value}
        {format === "percent" && "%"}
      </p>
    </div>
    {description && (
      <p className="mt-2 text-xs sm:text-sm text-[var(--secondary-color)]">{description}</p>
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
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--divider-color)]"
  >
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center">
          <div className="bg-[var(--accent-color)] bg-opacity-10 p-3 rounded-lg mr-4">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-color)]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--primary-color)]">{title}</h3>
            {description && (
              <p className="text-xs sm:text-sm text-[var(--secondary-color)] mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex space-x-2 ml-auto sm:ml-0">
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

// Enhanced fetcher with better error handling
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    
    // Log the response status for debugging
    console.log(`API response status for ${url}:`, response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate the response structure
    if (!data || (data.campaigns === undefined && !data.success)) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid data format received from server');
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Return mock data to prevent dashboard from breaking
    return {
      success: true,
      campaigns: mockCampaigns,
      metrics: mockMetrics
    };
  }
};

// Mock data for fallback when API fails
const mockCampaigns = [
  {
    id: 1,
    campaignName: "New Beginnings",
    submissionStatus: "submitted",
    platform: "Instagram",
    startDate: "2024-08-01",
    endDate: "2024-08-15",
    totalBudget: 12314,
    primaryKPI: "brandAwareness",
    primaryContact: {
      firstName: "John",
      surname: "Doe"
    },
    createdAt: "2024-07-15",
    status: "scheduled",
    performance: {
      engagement: 4.2,
      sentiment: 78,
      reach: 15.4,
      conversion: 2.1
    }
  },
  {
    id: 2,
    campaignName: "Letters of Love",
    submissionStatus: "submitted",
    platform: "YouTube",
    startDate: "2024-08-10",
    endDate: "2024-08-20",
    totalBudget: 10461,
    primaryKPI: "consideration",
    primaryContact: {
      firstName: "Jane",
      surname: "Smith"
    },
    createdAt: "2024-07-20",
    status: "scheduled",
    performance: {
      engagement: 5.7,
      sentiment: 82,
      reach: 22.1,
      conversion: 3.4
    }
  },
  {
    id: 3,
    campaignName: "Women Who Inspire",
    submissionStatus: "submitted",
    platform: "TikTok",
    startDate: "2024-08-05",
    endDate: "2024-08-25",
    totalBudget: 8125,
    primaryKPI: "messageAssociation",
    primaryContact: {
      firstName: "Robert",
      surname: "Johnson"
    },
    createdAt: "2024-07-18",
    status: "scheduled",
    performance: {
      engagement: 6.8,
      sentiment: 91,
      reach: 35.2,
      conversion: 4.7
    }
  },
  {
    id: 4,
    campaignName: "Words for the Earth",
    submissionStatus: "submitted",
    platform: "Instagram",
    startDate: "2024-07-20",
    endDate: "2024-08-05",
    totalBudget: 9315,
    primaryKPI: "brandAwareness",
    primaryContact: {
      firstName: "Sarah",
      surname: "Williams"
    },
    createdAt: "2024-07-10",
    status: "live",
    performance: {
      engagement: 3.9,
      sentiment: 75,
      reach: 18.6,
      conversion: 2.8
    }
  },
  {
    id: 5,
    campaignName: "Graduation Milestones",
    submissionStatus: "submitted",
    platform: "YouTube",
    startDate: "2024-07-25",
    endDate: "2024-08-10",
    totalBudget: 7450,
    primaryKPI: "consideration",
    primaryContact: {
      firstName: "Michael",
      surname: "Brown"
    },
    createdAt: "2024-07-12",
    status: "live",
    performance: {
      engagement: 4.5,
      sentiment: 80,
      reach: 20.3,
      conversion: 3.2
    }
  },
  {
    id: 6,
    campaignName: "Back to Inspiration",
    submissionStatus: "submitted",
    platform: "TikTok",
    startDate: "2024-07-15",
    endDate: "2024-08-01",
    totalBudget: 11250,
    primaryKPI: "messageAssociation",
    primaryContact: {
      firstName: "Emily",
      surname: "Davis"
    },
    createdAt: "2024-07-05",
    status: "live",
    performance: {
      engagement: 5.2,
      sentiment: 85,
      reach: 25.7,
      conversion: 3.9
    }
  }
];

const mockMetrics = {
  stats: {
    totalCampaigns: 154,
    campaignChange: 10,
    surveyResponses: 3000,
    surveyChange: -8,
    liveCampaigns: 31,
    liveChange: 5,
    creditsAvailable: 135,
    creditsChange: -47
  },
  overview: {
    totalCampaigns: 154,
    activeCampaigns: 31,
    totalBudget: 1250000,
    totalSpent: 750000,
    averageROI: 3.2,
    campaignSuccess: 87
  },
  performance: {
    engagement: {
      current: 4.8,
      trend: 12,
      byChannel: [
        { channel: "Instagram", value: 5.2 },
        { channel: "YouTube", value: 4.1 },
        { channel: "TikTok", value: 6.3 },
        { channel: "Facebook", value: 3.7 },
        { channel: "Twitter", value: 2.9 }
      ]
    },
    reach: {
      current: 1250000,
      trend: 8,
      byDemographic: [
        { group: "18-24", value: 35 },
        { group: "25-34", value: 28 },
        { group: "35-44", value: 20 },
        { group: "45-54", value: 12 },
        { group: "55+", value: 5 }
      ]
    },
    sentiment: {
      current: 82,
      trend: 5,
      distribution: [
        { type: "Positive", value: 76 },
        { type: "Neutral", value: 18 },
        { type: "Negative", value: 6 }
      ]
    },
    conversion: {
      current: 3.4,
      trend: 15,
      bySource: [
        { source: "Direct", value: 42 },
        { source: "Social", value: 35 },
        { source: "Email", value: 15 },
        { source: "Other", value: 8 }
      ]
    }
  },
  trends: {
    daily: [
      { date: "Aug 01", engagement: 4.2, reach: 15, sentiment: 78, conversion: 2.1 },
      { date: "Aug 05", engagement: 4.5, reach: 18, sentiment: 80, conversion: 2.3 },
      { date: "Aug 10", engagement: 4.8, reach: 20, sentiment: 82, conversion: 2.7 },
      { date: "Aug 15", engagement: 5.1, reach: 22, sentiment: 83, conversion: 3.0 },
      { date: "Aug 20", engagement: 5.3, reach: 25, sentiment: 85, conversion: 3.2 },
      { date: "Aug 25", engagement: 5.5, reach: 28, sentiment: 86, conversion: 3.5 },
      { date: "Aug 30", engagement: 5.7, reach: 30, sentiment: 87, conversion: 3.8 }
    ],
    weekly: [
      { week: "Week 1", engagement: 4.3, reach: 16, sentiment: 79, conversion: 2.2 },
      { week: "Week 2", engagement: 4.7, reach: 19, sentiment: 81, conversion: 2.5 },
      { week: "Week 3", engagement: 5.2, reach: 23, sentiment: 84, conversion: 3.1 },
      { week: "Week 4", engagement: 5.6, reach: 27, sentiment: 86, conversion: 3.6 }
    ]
  },
  insights: [
    {
      id: "1",
      category: "Performance",
      title: "Youth Momentum: Boosting Performance Among 18-24-Year-Olds",
      description: "Campaign 'NextGen Focus: Amplify Impact' is performing 20% better among 18-24-year-olds. Consider allocating more budget to this segment.",
      impact: "High",
      action: "Increase budget allocation",
      metrics: {
        current: 20,
        previous: 15,
        trend: 33
      }
    },
    {
      id: "2",
      category: "Risk",
      title: "Low Engagement on 'NextGen Focus: Amplify Impact'",
      description: "Engagement rate is 15% below average. Consider revising the call-to-action.",
      impact: "Medium",
      action: "Revise content strategy",
      metrics: {
        current: 3.2,
        previous: 3.8,
        trend: -15
      }
    }
  ]
};

// Calendar component with month view
const CalendarMonthView: React.FC<{ month: Date, events: CalendarUpcomingProps['events'] }> = ({ month, events }) => {
  const [currentMonth, setCurrentMonth] = useState(month);
  const router = useRouter();
  
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
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 text-center text-[var(--secondary-color)]"></div>);
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const eventsOnDay = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
    
    const hasEvent = eventsOnDay.length > 0;
    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === currentMonth.getMonth() && 
                    new Date().getFullYear() === currentMonth.getFullYear();
    
    days.push(
      <div 
        key={`day-${day}`}
        onClick={() => hasEvent && router.push('/calendar')}
        className={`relative h-8 flex items-center justify-center rounded-full w-8 mx-auto cursor-pointer
          ${isToday ? 'border border-[var(--accent-color)]' : ''}
          ${hasEvent 
            ? 'bg-[var(--accent-color)] bg-opacity-10 text-[var(--accent-color)] font-medium hover:bg-opacity-20' 
            : 'text-[var(--primary-color)] hover:bg-gray-50'
          }`}
      >
        {day}
        {hasEvent && eventsOnDay.length > 1 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-color)] text-[10px] text-white">
            {eventsOnDay.length}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 border border-[var(--divider-color)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-[var(--divider-color)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--secondary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-base sm:text-lg font-medium text-[var(--primary-color)]">{monthName} {year}</h3>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-[var(--divider-color)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--secondary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button 
          onClick={() => router.push('/calendar')}
          className="text-xs sm:text-sm text-[var(--accent-color)] hover:underline font-medium"
        >
          Switch to Timeline
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-xs text-center text-[var(--secondary-color)] font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      <div className="mt-4 pt-3 border-t border-[var(--divider-color)]">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--secondary-color)]">Upcoming events</span>
          <span className="text-xs text-[var(--accent-color)] cursor-pointer hover:underline" onClick={() => router.push('/calendar')}>View all</span>
        </div>
        <div className="mt-2 space-y-2">
          {events.slice(0, 2).map((event, idx) => (
            <div key={idx} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/campaigns/${event.id}`)}>
              <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] mr-2"></div>
              <div className="flex-1 truncate">
                <p className="text-xs font-medium text-[var(--primary-color)] truncate">{event.title}</p>
                <p className="text-xs text-[var(--secondary-color)]">{new Date(event.start).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Above the DashboardContent component, right after all interface declarations
// Helper function to generate SVG path data from chart points
const generateChartPath = (dataPoints: Array<{type?: string, value: number}> | Array<{date?: string, value: number}> | undefined): string => {
  if (!dataPoints || dataPoints.length === 0) {
    // Default fallback path if no data is available
    return "M0,90 C20,85 40,60 60,62 C80,64 100,40 120,30 C140,20 160,60 180,40 C200,20 220,10 240,15 C260,20 280,25 300,20";
  }

  // Normalize the values to fit within our SVG viewport (0-100)
  const maxValue = Math.max(...dataPoints.map(point => point.value));
  const normalizedPoints = dataPoints.map((point, index) => {
    const x = (index / (dataPoints.length - 1)) * 300;
    // Invert Y axis and scale to 80% of height, leaving space at top and bottom
    const y = 100 - ((point.value / (maxValue || 1)) * 80);
    return { x, y };
  });

  // Generate the SVG path data
  let pathData = `M${normalizedPoints[0].x},${normalizedPoints[0].y}`;
  
  for (let i = 1; i < normalizedPoints.length; i++) {
    // Use cubic bezier curves for smooth lines
    const prevPoint = normalizedPoints[i - 1];
    const currPoint = normalizedPoints[i];
    
    // Control points for curve (simplified)
    const cp1x = prevPoint.x + (currPoint.x - prevPoint.x) / 3;
    const cp1y = prevPoint.y;
    const cp2x = prevPoint.x + 2 * (currPoint.x - prevPoint.x) / 3;
    const cp2y = currPoint.y;
    
    pathData += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${currPoint.x},${currPoint.y}`;
  }
  
  return pathData;
};

// Helper to generate area path (for filled area under the line)
const generateAreaPath = (linePath: string): string => {
  return `${linePath} L300,100 L0,100 Z`;
};

export default function DashboardContent({ user = { id: '', name: 'User', role: '' } }: DashboardContentProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('7d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update the SWR hook type with improved configuration
  const { data: campaignsData, error: fetchError, isLoading: isLoadingCampaigns } = useSWR<CampaignsResponse>(
    '/api/campaigns',
    fetcher,
    {
      onError: (error) => {
        console.error('SWR error:', error);
        handleError(new Error('Failed to fetch campaign data. Please try refreshing the page.'));
      },
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
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
    console.error('Dashboard error:', error);
    
    // Provide more helpful error messages based on the error
    let message = error.message;
    
    if (message.includes('Failed to fetch')) {
      message = 'Network error: Please check your internet connection and try again.';
    } else if (message.includes('API error: 500')) {
      message = 'Server error: Our team has been notified and is working on a fix.';
    } else if (message.includes('API error: 401') || message.includes('API error: 403')) {
      message = 'Authentication error: Please log in again to continue.';
    } else if (message.includes('API error: 404')) {
      message = 'Resource not found: The requested data could not be found.';
    }
    
    setToastMessage(message);
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
      className="p-4 border border-[var(--divider-color)] rounded-lg bg-white hover:shadow-md transition-all duration-300"
    >
      {/* ... existing InsightCard implementation ... */}
    </motion.div>
  );

  // Return the JSX for the dashboard
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {toastMessage && <Toast message={toastMessage} type="info" />}

        {/* Dashboard Header */}
        <div className="flex flex-col mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-[var(--primary-color)]">Dashboard</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/reports')}
                className="px-3 sm:px-4 py-2 border border-[var(--divider-color)] bg-white text-[var(--primary-color)] rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
              >
                <DocumentChartBarIcon className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
              <button 
                onClick={() => router.push('/campaigns/creative-test')}
                className="px-3 sm:px-4 py-2 border border-[var(--divider-color)] bg-white text-[var(--primary-color)] rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Start Creative Test</span>
              </button>
              <button 
                onClick={() => router.push('/campaigns/wizard/step-1')}
                className="px-3 sm:px-4 py-2 bg-[#0ea5e9] text-white rounded-lg hover:bg-opacity-90 shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create New Campaign</span>
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns Overview Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Campaigns Overview</h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-[var(--divider-color)] rounded-lg overflow-hidden">
                <button 
                  onClick={() => setDateRange('7d')}
                  className={`px-3 py-1.5 text-sm font-medium ${dateRange === '7d' ? 'bg-[#0ea5e9] text-white' : 'bg-white text-[var(--secondary-color)]'}`}
                >
                  Last 30 Days
                </button>
                <div className="h-6 w-px bg-[var(--divider-color)]"></div>
                <button
                  onClick={() => setDateRange('30d')}
                  className={`px-3 py-1.5 text-sm font-medium ${dateRange === '30d' ? 'bg-[#0ea5e9] text-white' : 'bg-white text-[var(--secondary-color)]'}`}
                >
                  All channels
                </button>
              </div>
              <div className="flex items-center border border-[var(--divider-color)] rounded-lg bg-white px-3 py-2">
                <span className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  1 Survey Live
                </span>
              </div>
            </div>
          </div>
          
          {/* Campaign Tabs */}
          <div className="flex border-b border-[var(--divider-color)] mb-6">
            <button 
              className="px-6 py-3 border-b-2 border-[#0ea5e9] text-[#0ea5e9] font-medium"
            >
              Upcoming
            </button>
            <button 
              className="px-6 py-3 text-[var(--secondary-color)] hover:text-[var(--primary-color)]"
            >
              Finished
            </button>
          </div>
          
          {/* Calendar and Campaign Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar */}
            <div className="col-span-12 lg:col-span-6">
              <CalendarMonthView month={currentDate} events={calendarEvents} />
            </div>
            
            {/* Campaign Cards */}
            <div className="lg:col-span-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Upcoming</h3>
                
                {isLoadingCampaigns ? (
                  <div className="text-center py-8">
                    <Spinner />
                    <p className="mt-2 text-sm text-gray-500">Loading campaigns...</p>
                  </div>
                ) : upcomingCampaigns.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-500">No upcoming campaigns</p>
                    <button
                      onClick={handleNewCampaign}
                      className="mt-3 px-3 py-1.5 bg-[#0ea5e9] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors"
                    >
                      Create Your First Campaign
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingCampaigns.map((campaign) => (
                      <div 
                        key={campaign.id}
                        className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                              campaign.platform === 'Instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                              campaign.platform === 'TikTok' ? 'bg-black' : 
                              'bg-red-600'
                            }`}>
                              {campaign.platform === 'Instagram' ? (
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                              ) : campaign.platform === 'TikTok' ? (
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>
                              ) : (
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
                              )}
                            </div>
                            <div className="ml-3">
                              <h4 className="font-medium text-sm">{campaign.campaignName}</h4>
                              <p className="text-xs text-gray-500">
                                {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                              </p>
                            </div>
                          </div>
                          
                          <StatusBadge status="Upcoming" size="sm" />
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Budget: ${campaign.totalBudget.toLocaleString()}</span>
                          <span>KPI: {campaign.primaryKPI}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Influencers Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Influencers Overview</h2>
            <button
              onClick={() => router.push('/influencers/reports')}
              className="px-4 py-2 bg-[#0ea5e9] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors"
            >
              View Detailed Report
            </button>
          </div>
          
          {/* Social Profiles */}
          <div className="bg-white rounded-lg border border-[var(--divider-color)] p-4">
            {/* Social profiles content */}
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Social Profiles</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500"></th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Engagement</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Likes</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ethan Edge */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">EE</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Ethan Edge</p>
                          <div className="flex items-center mt-1">
                            <svg className="w-4 h-4 text-[#0ea5e9] mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs text-gray-500">Back to Inspiration</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#0ea5e9] h-1.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sm">3K</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">561</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">12</td>
                  </tr>
                  
                  {/* Olivia Wave */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">OW</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Olivia Wave</p>
                          <div className="flex items-center mt-1">
                            <svg className="w-4 h-4 text-[#0ea5e9] mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 12C8.34315 12 7 13.3431 7 15C7 16.6569 8.34315 18 10 18C11.6569 18 13 16.6569 13 15V6C13.3333 7 14.6 9 17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs text-gray-500">New Beginnings</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#0ea5e9] h-1.5 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sm">3K</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">652</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">52</td>
                  </tr>
                  
                  {/* James Reach */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">JR</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">James Reach</p>
                          <div className="flex items-center mt-1">
                            <svg className="w-4 h-4 text-[#0ea5e9] mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 12C8.34315 12 7 13.3431 7 15C7 16.6569 8.34315 18 10 18C11.6569 18 13 16.6569 13 15V6C13.3333 7 14.6 9 17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs text-gray-500">Letters of Love</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#0ea5e9] h-1.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sm">7K</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">761</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">156</td>
                  </tr>
                  
                  {/* Liam Focus */}
                  <tr>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium">LF</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Liam Focus</p>
                          <div className="flex items-center mt-1">
                            <svg className="w-4 h-4 text-[#0ea5e9] mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs text-gray-500">Women Who Inspire</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#0ea5e9] h-1.5 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sm">17K</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">913</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">384</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Security check box */}
            <div className="mt-5 border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Security Check</p>
                  <p className="text-xs text-gray-500 mt-1">Maintain safety. Complete your security check on time.</p>
                </div>
                <div className="flex space-x-3">
                  <div className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-md">Next in 5 Days</div>
                  <button className="bg-[#0ea5e9] text-white text-xs font-medium px-3 py-1 rounded-md">Run Check</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Latest Campaigns List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Latest Campaigns List</h2>
            <button
              className="px-4 py-2 bg-[#0ea5e9] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors"
            >
              Manage
            </button>
          </div>
          
          {/* Campaigns table */}
          <div className="bg-white rounded-lg border border-[var(--divider-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider">Campaign</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider">Budget</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoadingCampaigns ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <Spinner />
                        <p className="mt-2 text-sm text-gray-500">Loading campaigns...</p>
                      </td>
                    </tr>
                  ) : campaignsData?.campaigns && campaignsData.campaigns.length > 0 ? (
                    campaignsData.campaigns.slice(0, 5).map((campaign) => (
                      <tr 
                        key={campaign.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{campaign.campaignName}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge 
                            status={
                              campaign.status ||
                              (new Date(campaign.startDate) > new Date() ? 'Upcoming' :
                              !campaign.endDate || new Date(campaign.endDate) >= new Date() ? 'Live' :
                              'Completed')
                            } 
                            size="sm" 
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">Budget</div>
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-[#0ea5e9] h-1.5 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(100, ((campaign.performance?.engagement || 0) / 100) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">${campaign.totalBudget.toLocaleString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900">
                            {campaign.usersEngaged ? 
                              `${campaign.usersEngaged.current} of ${campaign.usersEngaged.total} Users` : 
                              `${Math.floor(Math.random() * 100)} of ${Math.floor(Math.random() * 500 + 100)} Users`}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <p className="text-sm text-gray-500">No campaigns found</p>
                        <button
                          onClick={handleNewCampaign}
                          className="mt-3 px-3 py-1.5 bg-[#0ea5e9] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors"
                        >
                          Create Your First Campaign
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
        
        {/* Brand Health Snapshot */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Brand Health Snapshot</h2>
            <button
              onClick={() => router.push('/brand-health')}
              className="px-4 py-2 bg-[#0ea5e9] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors"
            >
              View Brand Health
            </button>
          </div>
          
          {/* Brand health card */}
          <div className="bg-white rounded-lg border border-[var(--divider-color)] p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side - Sentiment Score */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm text-gray-500 mb-1">Sentiment Score</h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">76% Positive Score</span>
                    <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">90D 3M</span>
                  </div>
                </div>
                
                {/* Chart */}
                <div className="mt-4 h-48 relative">
                  {/* Simulated chart with lines */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="relative w-full h-full">
                      {/* Y-axis labels */}
                      <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                        <span>20%</span>
                        <span>15%</span>
                        <span>10%</span>
                        <span>5%</span>
                        <span>1%</span>
                        <span>0</span>
                      </div>
                      
                      {/* X-axis grid lines */}
                      <div className="absolute left-0 top-0 w-full h-full border-b border-gray-200">
                        <div className="absolute left-0 top-0 w-full h-1/5 border-b border-gray-100"></div>
                        <div className="absolute left-0 top-1/5 w-full h-1/5 border-b border-gray-100"></div>
                        <div className="absolute left-0 top-2/5 w-full h-1/5 border-b border-gray-100"></div>
                        <div className="absolute left-0 top-3/5 w-full h-1/5 border-b border-gray-100"></div>
                        <div className="absolute left-0 top-4/5 w-full h-1/5 border-b border-gray-100"></div>
                      </div>
                      
                      {/* Line chart with actual data */}
                      <svg className="absolute left-0 top-0 w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <path
                          d={generateChartPath(brandHealth.sentiment && [
                            { type: 'positive', value: brandHealth.sentiment.positive },
                            { type: 'neutral', value: brandHealth.sentiment.neutral },
                            { type: 'negative', value: brandHealth.sentiment.negative }
                          ])}
                          stroke="#0ea5e9"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d={generateAreaPath(generateChartPath(brandHealth.sentiment && [
                            { type: 'positive', value: brandHealth.sentiment.positive },
                            { type: 'neutral', value: brandHealth.sentiment.neutral },
                            { type: 'negative', value: brandHealth.sentiment.negative }
                          ]))}
                          fill="url(#blue-gradient)"
                          fillOpacity="0.2"
                        />
                      </svg>
                      
                      {/* Gradient definition - MOVING THIS INSIDE THE SVG */}
                      <svg width="0" height="0" style={{ position: 'absolute' }}>
                        <defs>
                          <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Highlight marker */}
                      <div className="absolute right-1/4 top-2/5 w-3 h-3 bg-white border-2 border-[#0ea5e9] rounded-full"></div>
                      
                      {/* X-axis labels */}
                      <div className="absolute left-0 bottom-0 w-full flex justify-between text-xs text-gray-500 mt-2">
                        <span>01 Aug</span>
                        <span>05 Aug</span>
                        <span>10 Aug</span>
                        <span>15 Aug</span>
                        <span>20 Aug</span>
                        <span>25 Aug</span>
                        <span>30 Aug</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Event marker */}
                <div className="mt-6 flex items-center">
                  <div className="px-2 py-1 bg-[#e6f7ff] text-[#0ea5e9] text-xs rounded flex items-center">
                    <span className="w-2 h-2 bg-[#0ea5e9] rounded-full mr-1"></span>
                    <span>Senior Travellers Campaign launch</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Latest mentions */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm text-gray-500 mb-1">Latest Mentions</h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">1,561 Mentions</span>
                    <span className="ml-2 text-xs text-green-600">+47% More than last week</span>
                  </div>
                </div>
                
                {/* Chart */}
                <div className="mt-4 h-48 relative">
                  {/* Simulated chart with lines */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="relative w-full h-full">
                      {/* Y-axis labels */}
                      <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                        <span>20k</span>
                        <span>15k</span>
                        <span>10k</span>
                        <span>5k</span>
                        <span>1k</span>
                        <span>0</span>
                      </div>
                      
                      {/* X-axis grid lines */}
                      <div className="absolute left-0 top-0 w-full h-full border-b border-gray-200">
                        <div className="absolute left-0 top-0 w-full h-1/5 border-b border-gray-100"></div>
                        <div className="absolute left-0 top-1/5 w-full h-1/5 border-b border-gray-100"></div>
                        <div className="absolute left-0 top-2/5 w-full h-1/5 border-b border-gray-100"></div>
                        <div className="absolute left-0 top-3/5 w-full h-1/5 border-b border-gray-100"></div>
                        <div className="absolute left-0 top-4/5 w-full h-1/5 border-b border-gray-100"></div>
                      </div>
                      
                      {/* Line chart (simulated with SVG path) */}
                      <svg className="absolute left-0 top-0 w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="blue-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0ea5e9" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,80 C20,75 40,70 60,80 C80,90 100,60 120,50 C140,40 160,30 180,20 C200,10 220,5 240,15 C260,25 280,20 300,15 L300,100 L0,100 Z"
                          stroke="#0ea5e9"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M0,80 C20,75 40,70 60,80 C80,90 100,60 120,50 C140,40 160,30 180,20 C200,10 220,5 240,15 C260,25 280,20 300,15 L300,100 L0,100 Z"
                          fill="url(#blue-gradient-2)"
                          fillOpacity="0.2"
                        />
                      </svg>
                      
                      {/* X-axis labels */}
                      <div className="absolute left-0 bottom-0 w-full flex justify-between text-xs text-gray-500 mt-2">
                        <span>01 Aug</span>
                        <span>05 Aug</span>
                        <span>10 Aug</span>
                        <span>15 Aug</span>
                        <span>20 Aug</span>
                        <span>25 Aug</span>
                        <span>30 Aug</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend as RechartsLegend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Icon, IconName } from '@/components/ui/icon';
import { iconComponentFactory } from '@/components/ui/icons';
import useSWR from 'swr';
import Image from 'next/image';
import { Tabs, TabList, TabPanel, TabPanels } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// Import dynamically loaded components and ensure they are exported correctly.
const CalendarUpcoming = dynamic(() => import("../../components/CalendarUpcoming"), {
  ssr: false
});

// -----------------------
// Helper Components
// -----------------------

// Define Icon props type
interface IconProps {
  className?: string;
  solid?: boolean;
  name?: string;
  iconType?: string;
  [key: string]: any;
}

// Spinner for loading states
const Spinner: React.FC = () => <div className="flex justify-center items-center py-8">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-color)]"></div>
      <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-t-2 border-[var(--accent-color)] opacity-30"></div>
    </div>
  </div>;

// Toast component for non-blocking notifications
interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
}
const Toast: React.FC<ToastProps> = ({
  message,
  type = "info"
}) => {
  const config = {
    error: {
      bg: "bg-red-600",
      icon: (props: IconProps) => <Icon name="faXCircle" {...props} solid={false} className="text-[var(--secondary-color)]" />
    },
    success: {
      bg: "bg-green-600",
      icon: (props: IconProps) => <Icon name="faCheckCircle" {...props} solid={false} className="text-[var(--secondary-color)]" />
    },
    info: {
      bg: "bg-[var(--accent-color)]",
      icon: (props: IconProps) => <Icon name="faBellAlert" {...props} solid={false} className="text-[var(--secondary-color)]" />
    }
  }[type];
  const Icon = config.icon;
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: 20
  }} className={`fixed bottom-4 right-4 ${config.bg} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50`}>

      <Icon className="w-4 h-4 sm:w-5 sm:h-5" solid={false} />
      <span className="font-medium text-sm">{message}</span>
    </motion.div>;
};

// Error display component for sections
const ErrorDisplay: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({
  message,
  onRetry
}) => <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
    <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
      <Icon name="faXCircle" className="w-8 h-8 text-red-500" solid={false} />
    </div>
    <h3 className="text-lg font-medium text-[var(--primary-color)] mb-2">Something went wrong!</h3>
    <p className="text-sm text-[var(--secondary-color)] mb-4">
      {message}
    </p>
    {onRetry && <button onClick={onRetry} className="group inline-flex items-center px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition-colors">

        <Icon name="faArrowRight" className="w-4 h-4 mr-2" iconType="button" />
        <span>Try again</span>
      </button>}
    </div>;

// Card component to wrap modules in a modern, "card" style
interface CardProps {
  title: string;
  description?: string;
  iconName?: IconName; // Changed from icon component to iconName string
  children: React.ReactNode;
  actions?: React.ReactNode;
}
const Card: React.FC<CardProps> = ({
  title,
  description,
  iconName,
  children,
  actions
}) => <motion.div initial={{
  opacity: 0,
  y: 10
}} animate={{
  opacity: 1,
  y: 0
}} className="bg-white shadow-sm rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-[var(--divider-color)]">

    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
      <div className="flex items-center">
        {iconName && <div className="bg-[var(--accent-color)] bg-opacity-10 p-2.5 rounded-lg mr-3">
            <Icon name={iconName} className="w-5 h-5 text-[var(--accent-color)]" solid={false} />
          </div>}
        <div>
          <h2 className="text-lg font-semibold text-[var(--primary-color)]">{title}</h2>
          {description && <p className="text-sm text-[var(--secondary-color)] mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex space-x-2 ml-auto sm:ml-0">
          {actions}
        </div>}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>;

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md"
}) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  // Map status to config (icon, color, label)
  const config = {
    draft: {
      iconName: "edit" as IconName,
      color: "bg-gray-100 text-gray-800",
      label: "Draft"
    },
    active: {
      iconName: "check" as IconName,
      color: "bg-green-100 text-green-800",
      label: "Active"
    },
    paused: {
      iconName: "info" as IconName,
      color: "bg-yellow-100 text-yellow-800",
      label: "Paused"
    },
    completed: {
      iconName: "check" as IconName,
      color: "bg-blue-100 text-blue-800",
      label: "Completed"
    },
    error: {
      iconName: "close" as IconName,
      color: "bg-red-100 text-red-800",
      label: "Error"
    }
  }[status.toLowerCase()] || {
    iconName: "info" as IconName,
    color: "bg-gray-100 text-gray-800",
    label: status
  };
  return <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium 
      ${config.color} border shadow-sm`}>
      <Icon name={config.iconName} className={size === "sm" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-1.5"} solid={false} />
      {config.label}
    </span>;
};

// Campaign Card Component
interface CampaignCardProps {
  campaign: Campaign;
  onClick?: () => void;
}

// KPI mapping for display purposes
const kpiMapping = {
  adRecall: {
    title: "Ad Recall",
    icon: "/KPIs/Ad_Recall.svg"
  },
  brandAwareness: {
    title: "Brand Awareness",
    icon: "/KPIs/Brand_Awareness.svg"
  },
  consideration: {
    title: "Consideration",
    icon: "/KPIs/Consideration.svg"
  },
  messageAssociation: {
    title: "Message Association",
    icon: "/KPIs/Message_Association.svg"
  },
  brandPreference: {
    title: "Brand Preference",
    icon: "/KPIs/Brand_Preference.svg"
  },
  purchaseIntent: {
    title: "Purchase Intent",
    icon: "/KPIs/Purchase_Intent.svg"
  },
  actionIntent: {
    title: "Action Intent",
    icon: "/KPIs/Action_Intent.svg"
  },
  recommendationIntent: {
    title: "Recommendation Intent",
    icon: "/KPIs/Brand_Preference.svg"
  },
  advocacy: {
    title: "Advocacy",
    icon: "/KPIs/Advocacy.svg"
  }
};
const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onClick
}) => {
  const router = useRouter();

  // Get the KPI display info or use fallback if not found
  const kpiInfo = kpiMapping[campaign.primaryKPI as keyof typeof kpiMapping] || {
    title: campaign.primaryKPI,
    icon: "/KPIs/Brand_Awareness.svg"
  };
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="bg-white rounded-lg border border-[var(--divider-color)] overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => onClick ? onClick() : router.push(`/campaigns/${campaign.id}`)}>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-2">
            <h3 className="text-sm sm:text-base font-medium text-[var(--primary-color)]">{campaign.campaignName}</h3>
            <p className="text-xs text-[var(--secondary-color)] mt-1">
              {new Date(campaign.startDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short'
            })}
              {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short'
            })}`}
            </p>
          </div>
          <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center ${campaign.platform === 'Instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : campaign.platform === 'TikTok' ? 'bg-black' : 'bg-red-600'}`}>
            {campaign.platform === 'Instagram' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>}
            {campaign.platform === 'TikTok' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path></svg>}
            {campaign.platform === 'YouTube' && <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>}
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-4 text-xs">
          <div>
            <p className="text-[var(--secondary-color)]">Budget</p>
            <p className="font-medium text-[var(--primary-color)]">
              {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(campaign.totalBudget)}
            </p>
          </div>
          <div>
            <p className="text-[var(--secondary-color)]">Primary KPI</p>
            <div className="flex items-center gap-1.5">
              <img src={kpiInfo.icon} alt={kpiInfo.title} className="w-4 h-4" />

              <p className="font-medium text-[var(--primary-color)]">{kpiInfo.title}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>;
};

// Reusable Components
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: number;
  iconName?: IconName; // Changed from icon component to iconName string
  imageSrc?: string; // Add support for direct SVG images
  description?: string;
  format?: "number" | "currency" | "percent";
}

// Update the MetricCard component to apply a white filter to SVG images
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  iconName,
  imageSrc,
  description,
  format = "number"
}) => <div className="bg-white rounded-xl border border-[var(--divider-color)] shadow p-4">
    <div className="flex justify-between items-start">
      <div className="flex items-center">
        <div className="mr-3 p-2 bg-[var(--accent-color)] rounded-lg flex items-center justify-center w-9 h-9">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={title} 
              className="w-5 h-5" 
              style={{ filter: 'brightness(0) invert(1)' }} 
            />
          ) : (
            <Icon name={iconName!} className="w-5 h-5 text-white" solid={true} />
          )}
        </div>
        <h3 className="text-sm font-medium text-[var(--secondary-color)]">{title}</h3>
      </div>
      
      {trend !== undefined && <span className={`inline-flex items-center mr-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <Icon name="faChevronUp" className="w-3 h-3 mr-1" solid={false} /> : <Icon name="faChevronDown" className="w-3 h-3 mr-1" solid={false} />}
          {Math.abs(trend)}%
        </span>}
    </div>
    
    <div className="mt-1 pl-11">
      <div className="text-2xl font-bold text-[var(--primary-color)]">
        {format === "currency" && "$"}
        {typeof value === "number" ? value.toLocaleString() : value}
        {format === "percent" && "%"}
      </div>
      {description && <div className="text-xs text-[var(--tertiary-color)] mt-1">{description}</div>}
    </div>
  </div>;

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
    locations: {
      location: string;
    }[];
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
      byChannel: Array<{
        channel: string;
        value: number;
      }>;
    };
    reach: {
      current: number;
      trend: number;
      byDemographic: Array<{
        group: string;
        value: number;
      }>;
    };
    sentiment: {
      current: number;
      trend: number;
      distribution: Array<{
        type: string;
        value: number;
      }>;
    };
    conversion: {
      current: number;
      trend: number;
      bySource: Array<{
        source: string;
        value: number;
      }>;
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
  iconName: IconName; // Changed from icon component to iconName string
  actions?: React.ReactNode;
}
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  iconName,
  actions
}) => <div className="bg-white rounded-xl border border-[var(--divider-color)] shadow-sm p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
      <div className="flex items-center">
        <div className="p-2 bg-[var(--light-background)] rounded-lg mr-3">
          <Icon name={iconName} className="w-5 h-5 text-[var(--accent-color)]" solid={false} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--primary-color)]">{title}</h3>
          {description && <p className="text-sm text-[var(--secondary-color)]">{description}</p>}
        </div>
      </div>
      {actions && <div className="sm:ml-auto">{actions}</div>}
    </div>
    {children}
  </div>;

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

      // Instead of throwing error, return fallback data with empty campaigns
      return {
        success: true,
        campaigns: []
      };
    }
    try {
      const data = await response.json();

      // Validate and ensure we always have campaigns array
      if (!data) {
        return {
          success: true,
          campaigns: []
        };
      }

      // Ensure campaigns is always an array
      if (!data.campaigns) {
        data.campaigns = [];
      }
      return data;
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      return {
        success: true,
        campaigns: []
      };
    }
  } catch (fetchError) {
    console.error('Fetch error:', fetchError);
    // Return fallback data with empty campaigns
    return {
      success: true,
      campaigns: []
    };
  }
};

// Mock data for fallback when API fails
const mockCampaigns = [{
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
}, {
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
}, {
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
}, {
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
}, {
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
}, {
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
}];
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
      byChannel: [{
        channel: "Instagram",
        value: 5.2
      }, {
        channel: "YouTube",
        value: 4.1
      }, {
        channel: "TikTok",
        value: 6.3
      }, {
        channel: "Facebook",
        value: 3.7
      }, {
        channel: "Twitter",
        value: 2.9
      }]
    },
    reach: {
      current: 1250000,
      trend: 8,
      byDemographic: [{
        group: "18-24",
        value: 35
      }, {
        group: "25-34",
        value: 28
      }, {
        group: "35-44",
        value: 20
      }, {
        group: "45-54",
        value: 12
      }, {
        group: "55+",
        value: 5
      }]
    },
    sentiment: {
      current: 82,
      trend: 5,
      distribution: [{
        type: "Positive",
        value: 76
      }, {
        type: "Neutral",
        value: 18
      }, {
        type: "Negative",
        value: 6
      }]
    },
    conversion: {
      current: 3.4,
      trend: 15,
      bySource: [{
        source: "Direct",
        value: 42
      }, {
        source: "Social",
        value: 35
      }, {
        source: "Email",
        value: 15
      }, {
        source: "Other",
        value: 8
      }]
    }
  },
  trends: {
    daily: [{
      date: "Aug 01",
      engagement: 4.2,
      reach: 15,
      sentiment: 78,
      conversion: 2.1
    }, {
      date: "Aug 05",
      engagement: 4.5,
      reach: 18,
      sentiment: 80,
      conversion: 2.3
    }, {
      date: "Aug 10",
      engagement: 4.8,
      reach: 20,
      sentiment: 82,
      conversion: 2.7
    }, {
      date: "Aug 15",
      engagement: 5.1,
      reach: 22,
      sentiment: 83,
      conversion: 3.0
    }, {
      date: "Aug 20",
      engagement: 5.3,
      reach: 25,
      sentiment: 85,
      conversion: 3.2
    }, {
      date: "Aug 25",
      engagement: 5.5,
      reach: 28,
      sentiment: 86,
      conversion: 3.5
    }, {
      date: "Aug 30",
      engagement: 5.7,
      reach: 30,
      sentiment: 87,
      conversion: 3.8
    }],
    weekly: [{
      week: "Week 1",
      engagement: 4.3,
      reach: 16,
      sentiment: 79,
      conversion: 2.2
    }, {
      week: "Week 2",
      engagement: 4.7,
      reach: 19,
      sentiment: 81,
      conversion: 2.5
    }, {
      week: "Week 3",
      engagement: 5.2,
      reach: 23,
      sentiment: 84,
      conversion: 3.1
    }, {
      week: "Week 4",
      engagement: 5.6,
      reach: 27,
      sentiment: 86,
      conversion: 3.6
    }]
  },
  insights: [{
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
  }, {
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
  }]
};

// Calendar component with month view
const CalendarMonthView: React.FC<{
  month: Date;
  events: CalendarUpcomingProps['events'];
}> = ({
  month,
  events
}) => {
  const [currentMonth, setCurrentMonth] = useState(month);
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthName = monthStart.toLocaleString('default', {
    month: 'long'
  });
  const year = monthStart.getFullYear();

  // Generate calendar days
  const days = [];
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    const dayEvents = events.filter(event => new Date(event.start).getDate() === i && new Date(event.start).getMonth() === currentMonth.getMonth() && new Date(event.start).getFullYear() === currentMonth.getFullYear());
    days.push({
      day: i,
      events: dayEvents,
      date: currentDate
    });
  }
  return <div className="bg-white rounded-lg border border-[var(--divider-color)] overflow-hidden h-full">
      <div className="p-4 flex items-center justify-between border-b border-[var(--divider-color)]">
        <h3 className="text-base font-semibold text-center">{format(month, 'MMMM yyyy')}</h3>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="group p-1 rounded-md hover:bg-[var(--background-color)]">
            <Icon name="faChevronLeft" className="w-5 h-5 text-[var(--secondary-color)]" iconType="button" />
          </button>
          <button onClick={nextMonth} className="group p-1 rounded-md hover:bg-[var(--background-color)]">
            <Icon name="faChevronRight" className="w-5 h-5 text-[var(--secondary-color)]" iconType="button" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {/* Day headers with consistent width */}
        <div className="min-w-full grid grid-cols-7 text-center py-2 px-1 text-xs font-medium text-[var(--secondary-color)]">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <div key={day} className="flex justify-center items-center py-1">{day}</div>)}
        </div>
        
        {/* Calendar grid with fixed size cells for consistent spacing */}
        <div className="min-w-full grid grid-cols-7 gap-1 px-1 pb-2">
          {/* Placeholder cells for days before the 1st of the month */}
          {Array.from({
          length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() === 0 ? 6 : new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() - 1
        }).map((_, index) => <div key={`empty-${index}`} className="aspect-square w-full h-[30px] min-h-[30px] sm:h-[40px] sm:min-h-[40px]"></div>)}
          
          {/* Actual days of the month */}
          {days.map(({
          day,
          events,
          date
        }) => {
          const isToday = new Date().toDateString() === date.toDateString();
          return <div key={day} className={`relative p-1 text-center w-full h-[30px] min-h-[30px] sm:h-[40px] sm:min-h-[40px] flex flex-col items-center justify-center
                ${isToday ? 'bg-[var(--accent-color)] bg-opacity-5 rounded-md' : ''}`}>

                <div className="flex justify-center items-center">
                  <div className={`text-xs w-7 h-7 flex items-center justify-center rounded-full 
                    ${isToday ? 'font-bold bg-[var(--accent-color)] text-white' : 'text-[var(--primary-color)]'}`}>
                    {day}
                  </div>
                </div>
                
                {events.length > 0 && <div className="mt-0.5 w-full space-y-0.5 overflow-hidden">
                    {events.slice(0, 2).map(event => <div key={event.id} className="text-[8px] sm:text-[9px] truncate rounded px-0.5 py-px bg-[var(--accent-color)] bg-opacity-10 text-[var(--accent-color)]" title={event.title}>

                        {event.title.length > 8 ? `${event.title.substring(0, 6)}...` : event.title}
                      </div>)}
                    {events.length > 2 && <div className="text-[8px] text-[var(--secondary-color)]">+{events.length - 2} more</div>}
                  </div>}
              </div>;
        })}
        </div>
      </div>
    </div>;
};

// Above the DashboardContent component, right after all interface declarations
// Helper function to generate SVG path data from chart points
const generateChartPath = (dataPoints: Array<{
  type?: string;
  value: number;
}> | Array<{
  date?: string;
  value: number;
}> | undefined): string => {
  if (!dataPoints || dataPoints.length === 0) {
    // Default fallback path if no data is available
    return "M0,90 C20,85 40,60 60,62 C80,64 100,40 120,30 C140,20 160,60 180,40 C200,20 220,10 240,15 C260,20 280,25 300,20";
  }

  // Normalize the values to fit within our SVG viewport (0-100)
  const maxValue = Math.max(...dataPoints.map(point => point.value));
  const normalizedPoints = dataPoints.map((point, index) => {
    const x = index / (dataPoints.length - 1) * 300;
    // Invert Y axis and scale to 80% of height, leaving space at top and bottom
    const y = 100 - point.value / (maxValue || 1) * 80;
    return {
      x,
      y
    };
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

// Make sure the helper functions for styling are properly defined 
// (if they were removed, add them back)
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Performance': return 'bg-blue-500';
    case 'Audience': return 'bg-purple-500';
    case 'Content': return 'bg-green-500';
    case 'Strategy': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const getCategoryTextColor = (category: string) => {
  switch (category) {
    case 'Performance': return 'text-blue-500 bg-blue-100';
    case 'Audience': return 'text-purple-500 bg-purple-100';
    case 'Content': return 'text-green-500 bg-green-100';
    case 'Strategy': return 'text-yellow-500 bg-yellow-100';
    default: return 'text-gray-500 bg-gray-100';
  }
};

const getImpactBadgeColor = (impact: string) => {
  switch (impact) {
    case 'High': return 'bg-red-100 text-red-700';
    case 'Medium': return 'bg-yellow-100 text-yellow-700';
    case 'Low': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function DashboardContent({
  user = {
    id: '',
    name: 'User',
    role: ''
  }
}: DashboardContentProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('7d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update the SWR hook type with improved configuration
  const {
    data: campaignsData,
    error: fetchError,
    isLoading: isLoadingCampaigns
  } = useSWR<CampaignsResponse>('/api/campaigns', fetcher, {
    onError: error => {
      console.error('SWR error:', error);
      handleError(new Error('Failed to fetch campaign data. Please try refreshing the page.'));
    },
    revalidateOnFocus: false,
    revalidateIfStale: true,
    revalidateOnReconnect: true
  });

  // Process campaigns for different views
  const activeCampaigns = useMemo(() => {
    return campaignsData?.campaigns?.filter(campaign => campaign.submissionStatus === "submitted" && new Date(campaign.startDate) <= new Date() && (!campaign.endDate || new Date(campaign.endDate) >= new Date())) || [];
  }, [campaignsData?.campaigns]);
  const upcomingCampaigns = useMemo(() => {
    return campaignsData?.campaigns?.filter(campaign =>
    // Include any campaign with a status that is not "DRAFT" (case-insensitive)
    campaign.status && campaign.status.toUpperCase() !== "DRAFT" ||
    // Also keep the existing logic for backward compatibility 
    new Date(campaign.startDate) > new Date()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 3) || [];
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
    ...(campaignsData?.metrics || {
      trends: {
        daily: []
      },
      performance: {
        engagement: {
          byChannel: []
        }
      }
    }),
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
    trends: [{
      date: "2024-01",
      value: 75
    }, {
      date: "2024-02",
      value: 78
    }, {
      date: "2024-03",
      value: 72
    }]
  }), []);
  const influencerMetrics = useMemo(() => ({
    totalInfluencers: 125,
    activeCollaborations: 45,
    averageEngagement: 8.5,
    reachGenerated: 2500000,
    topPerformers: [{
      name: "Sarah Johnson",
      platform: "Instagram",
      engagement: 12.3,
      reach: 500000
    }, {
      name: "Mike Chen",
      platform: "TikTok",
      engagement: 15.7,
      reach: 750000
    }, {
      name: "Emma Davis",
      platform: "YouTube",
      engagement: 9.8,
      reach: 350000
    }]
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
  const insights: Insight[] = [{
    title: "Youth Momentum: Boosting Performance Among 18-24-Year-Olds",
    description: "Campaign 'NextGen Focus: Amplify Impact' is performing 20% better among 18-24-year-olds. Consider allocating more budget to this segment.",
    actionText: "Read"
  }, {
    title: "Low Engagement on 'NextGen Focus: Amplify Impact'",
    description: "Engagement rate is 15% below average. Consider revising the call-to-action.",
    actionText: "View All Insights"
  }];
  const engagementData = [{
    date: "01 Aug",
    engagement: 20
  }, {
    date: "05 Aug",
    engagement: 35
  }, {
    date: "10 Aug",
    engagement: 50
  }, {
    date: "15 Aug",
    engagement: 45
  }, {
    date: "20 Aug",
    engagement: 30
  }, {
    date: "25 Aug",
    engagement: 25
  }, {
    date: "30 Aug",
    engagement: 20
  }];
  const InsightCard: React.FC<{
    insight: DashboardMetrics['insights'][0];
    onAction: (action: string) => void;
  }> = ({
    insight,
    onAction
  }) => <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} className="bg-white rounded-xl border border-[var(--divider-color)] overflow-hidden shadow-sm">
    <div className={`h-2 ${getCategoryColor(insight.category)}`} />
    <div className="p-5">
      <div className="flex items-center mb-3">
        <span className={`${getCategoryTextColor(insight.category)} text-xs font-medium px-2.5 py-0.5 rounded-full bg-opacity-15`}>
          {insight.category}
        </span>
        <span className={`ml-2 ${getImpactBadgeColor(insight.impact)} text-xs font-medium px-2 py-0.5 rounded-full`}>
          {insight.impact} Impact
        </span>
      </div>
      <h3 className="text-base font-semibold text-[var(--primary-color)] mb-2">{insight.title}</h3>
      <p className="text-sm text-[var(--secondary-color)] mb-4">{insight.description}</p>
      <button onClick={() => onAction(insight.action)} className="group w-full px-4 py-2 bg-[var(--accent-color)] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center">
        <span>Take Action</span>
        <Icon name="faArrowRight" className="w-4 h-4 ml-2" iconType="button" />
      </button>
    </div>
  </motion.div>;

  // Return the JSX for the dashboard
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6">
        {toastMessage && <Toast message={toastMessage} type="info" />}

        {/* Campaigns Overview Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-3 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--primary-color)]">
              <span className="block sm:hidden">Overview</span>
              <span className="hidden sm:block">Campaigns Overview</span>
            </h2>
            <button onClick={() => router.push('/campaigns/wizard/step-1')} className="group px-3 sm:px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 shadow-sm hover:shadow-md transition-all">
              <Icon name="faPlus" className="w-4 h-4 mr-2" iconType="button" />
              <span>New Campaign</span>
            </button>
          </div>
          
          {/* Calendar and Campaign Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Calendar */}
            <div className="col-span-12 lg:col-span-6">
              <CalendarMonthView month={currentDate} events={calendarEvents} />
            </div>
            
            {/* Campaign Cards - Align with calendar */}
            <div className="col-span-12 lg:col-span-6">
              <div className="h-full border border-[var(--divider-color)] rounded-lg bg-white overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-[var(--divider-color)]">
                  <h3 className="text-sm font-medium text-[var(--secondary-color)]">Upcoming</h3>
                </div>
                
                <div className="p-3 sm:p-4">
                  {isLoadingCampaigns ? (
                    <div className="text-center py-4 sm:py-6">
                      <Spinner />
                      <p className="mt-2 text-sm text-[var(--secondary-color)]">Loading campaigns...</p>
                    </div>
                  ) : upcomingCampaigns.length === 0 ? (
                    <div className="text-center py-4 sm:py-6 border border-dashed border-[var(--divider-color)] rounded-lg">
                      <p className="text-sm text-[var(--secondary-color)]">No upcoming campaigns</p>
                      <button onClick={handleNewCampaign} className="group mt-3 px-3 py-1.5 bg-[var(--accent-color)] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors">
                        <Icon name="faPlus" className="w-3 h-3 mr-1" iconType="button" />
                        <span>Create Your First Campaign</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[300px]">
                      {upcomingCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} onClick={() => router.push(`/campaigns/${campaign.id}`)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Performance Metrics Section */}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--primary-color)]">Performance</h2>
          </div>
          
          {/* Performance Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard 
              title="Total Campaigns" 
              value={metrics.stats.totalCampaigns} 
              trend={metrics.stats.campaignChange} 
              imageSrc="/app/Campaigns.svg" 
              description={`+${metrics.stats.campaignChange} campaigns`} 
            />
            
            <MetricCard 
              title="Survey Responses" 
              value={metrics.stats.surveyResponses} 
              trend={metrics.stats.surveyChange} 
              iconName="faCommentDots" 
              description={`${metrics.stats.surveyChange < 0 ? '' : '+'}${metrics.stats.surveyChange} responses`} 
            />
            
            <MetricCard 
              title="Live Campaigns" 
              value={metrics.stats.liveCampaigns} 
              trend={metrics.stats.liveChange} 
              iconName="faPlay" 
              description={`${metrics.stats.liveChange > 0 ? '+' : ''}${metrics.stats.liveChange} active`} 
            />
            
            <MetricCard 
              title="Credits Available" 
              value={metrics.stats.creditsAvailable} 
              trend={metrics.stats.creditsChange} 
              imageSrc="/coins.svg" 
              description={`${metrics.stats.creditsChange > 0 ? '+' : ''}${metrics.stats.creditsChange} credits`} 
            />
          </div>
        </div>

        {/* Influencers Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Influencers Overview</h2>
            <div className="flex space-x-3">
              <button onClick={() => router.push('/influencers/reports')} className="group px-4 py-2 bg-[var(--accent-color)] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors">
                <Icon name="faArrowRight" className="w-4 h-4 mr-2" iconType="button" />
                <span>View Detailed Report</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-[var(--divider-color)]">
            <div className="flex border-b border-[var(--divider-color)]">
              <button className="group px-4 py-3 text-sm font-medium text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]">
                <span>Social Profiles</span>
              </button>
              <button className="group px-4 py-3 text-sm font-medium text-gray-500 hover:text-[var(--primary-color)]">
                <span>Engagement</span>
              </button>
              <button className="group px-4 py-3 text-sm font-medium text-gray-500 hover:text-[var(--primary-color)]">
                <span>Likes</span>
              </button>
              <button className="group px-4 py-3 text-sm font-medium text-gray-500 hover:text-[var(--primary-color)]">
                <span>Comments</span>
              </button>
            </div>
            
            {/* Social profiles content */}
            <div className="overflow-hidden p-4">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="font-medium text-gray-900">Ethan Edge</div>
                            <svg className="ml-1 w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8.21 10.08c-.02 0-.04 0-.06-.02-.67-.9-.84-2.44-.89-3.03 0-.11-.13-.18-.23-.12C4.93 8.08 3 10.86 3 13.54 3 18.14 6.2 22 11.7 22c5.15 0 8.7-3.98 8.7-8.46 0-5.87-4.2-9.77-7.93-11.53a.13.13 0 0 0-.19.14c.48 3.16-.18 6.6-4.07 7.93z" fill="#38bdf8" />
                            </svg>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Back to Inspiration</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[var(--accent-color)] h-1.5 rounded-full" style={{
                        width: '90%'
                      }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sm">3K</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">12</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">Olivia Wave</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="none" stroke="currentColor" strokeWidth="1.5"></path>
                            </svg>
                            <span>New Beginnings</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[var(--accent-color)] h-1.5 rounded-full" style={{
                        width: '85%'
                      }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-sm">3K</td>
                    <td className="py-3 px-4 text-right font-medium text-sm">52</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Security check box */}
            <div className="mt-1 border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Security Check</p>
                  <p className="text-xs text-gray-500 mt-1">Maintain safety. Complete your security check on time.</p>
                </div>
                <div className="flex space-x-3">
                  <div className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-md">Next in 5 Days</div>
                  <button className="group bg-[var(--accent-color)] text-white text-xs font-medium px-3 py-1 rounded-md">
                    <span>Run Check</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Summary Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Insights Summary</h2>
            <a href="#" className="group text-[var(--accent-color)] text-sm font-medium flex items-center hover:underline">
              <span>View All Insights</span>
              <Icon name="faArrowRight" className="w-4 h-4 ml-1" iconType="button" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Youth Momentum Insight Card */}
            <div className="bg-[#e6f7ff] border border-[#bae6fd] rounded-lg p-5 relative overflow-hidden">
              <div className="flex items-start mb-3">
                <div className="bg-[var(--accent-color)] p-2 rounded-md mr-3">
                  <Icon name="faChartLine" className="w-5 h-5 text-white" solid={false} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[#0c4a6e]">Youth Momentum: Boosting Performance Among 18-24-Year-Olds</h3>
                </div>
              </div>
              <p className="text-sm text-[#0c4a6e] mb-4">
                Campaign "NextGen Focus: Amplify Impact" is performing 20% better among 18-24-year-olds. Consider allocating more budget to this segment.
              </p>
              <div className="flex justify-end">
                <button className="group bg-[var(--accent-color)] text-white text-xs font-medium px-4 py-1.5 rounded-md hover:bg-opacity-90">
                  <span>Read</span>
                </button>
              </div>
            </div>
            
            {/* Low Engagement Alert Card */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1">
                <button className="group text-gray-400 hover:text-gray-600">
                  <Icon name="faXmark" className="w-4 h-4" iconType="button" />
                </button>
              </div>
              <div className="flex items-start mb-3">
                <div className="bg-gray-300 p-2 rounded-md mr-3">
                  <Icon name="faTriangleExclamation" className="w-5 h-5 text-gray-600" solid={false} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-700">Low Engagement on "NextGen Focus: Amplify Impact"</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Engagement rate is 15% below average. Consider revising the call-to-action.
              </p>
            </div>
          </div>
        </div>

        {/* Latest Campaigns List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Latest Campaigns List</h2>
            <button className="group px-4 py-2 bg-[var(--accent-color)] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors">
              <span>Manage</span>
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
                  ) : (
                    <>
                      <tr className="hover:bg-gray-50 cursor-pointer">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">Clicks & Connections</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Live
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <div className="text-xs font-medium text-gray-600">Budget</div>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div className="bg-[var(--accent-color)] h-1.5 rounded-full" style={{
                              width: '75%'
                            }}></div>
                              </div>
                              <span className="text-xs font-medium">12,314$</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium">12 of 100 Users</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 cursor-pointer">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">Beyond the Horizon</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Live
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <div className="text-xs font-medium text-gray-600">Budget</div>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div className="bg-[var(--accent-color)] h-1.5 rounded-full" style={{
                              width: '60%'
                            }}></div>
                              </div>
                              <span className="text-xs font-medium">10,461$</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium">46 of 413 Users</div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Brand health card - Moved to bottom of page */}
        <div className="bg-white rounded-lg border border-[var(--divider-color)] p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Brand Health</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Sentiment Score */}
            <div>
              <div className="mb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Sentiment Score</h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">76% Positive Score</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium">90D</span>
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 font-medium ml-1 rounded-md">3M</span>
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
                    
                    {/* Line chart with actual data */}
                    <svg className="absolute left-0 top-0 w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,80 C20,70 40,60 60,50 C80,40 100,30 120,35 C140,40 160,30 180,20 C200,10 220,5 240,15 C260,20 280,25 300,20" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                      <path d="M0,80 C20,70 40,60 60,50 C80,40 100,30 120,35 C140,40 160,30 180,20 C200,10 220,5 240,15 C260,25 280,20 300,15 L300,100 L0,100 Z" fill="url(#blue-gradient)" />
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
              <div className="mb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Latest Mentions</h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">1,561 Mentions</span>
                    <span className="ml-2 text-xs text-green-600 font-medium">+47% More than last week</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium">90D</span>
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 font-medium ml-1 rounded-md">3M</span>
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
                          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,80 C20,75 40,70 60,80 C80,90 100,60 120,50 C140,40 160,30 180,20 C200,10 220,5 240,15 C260,25 280,20 300,15" stroke="#0ea5e9" strokeWidth="2" fill="none" />
                      <path d="M0,80 C20,75 40,70 60,80 C80,90 100,60 120,50 C140,40 160,30 180,20 C200,10 220,5 240,15 C260,25 280,20 300,15 L300,100 L0,100 Z" fill="url(#blue-gradient-2)" />
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
  );
}
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend as RechartsLegend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Skeleton, Card, Icon } from "@/components/ui";
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import useSWR from 'swr';
import Image from 'next/image';
import { Button } from '@/components/ui/button/Button'
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/ui/loading-skeleton';

// Define IconName type locally if it's not available
type IconName = string;

// Import dynamically loaded components and ensure they are exported correctly.
const CalendarUpcoming = dynamic(() => import("@/components/features/dashboard/CalendarUpcoming"), {
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
const Spinner: React.FC = () =>
<div className="animate-pulse space-y-2 w-full font-work-sans">
    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2 font-work-sans"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 font-work-sans"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mt-2 font-work-sans"></div>
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
      icon: (props: IconProps) => <Icon iconId="faXCircleLight" {...props}  className="text-[var(--secondary-color)] font-work-sans" />
    },
    success: {
      bg: "bg-green-600",
      icon: (props: IconProps) => <Icon iconId="faCheckCircleLight" {...props}  className="text-[var(--secondary-color)] font-work-sans" />
    },
    info: {
      bg: "bg-[var(--accent-color)]",
      icon: (props: IconProps) => <Icon iconId="faBellAlertLight" {...props}  className="text-[var(--secondary-color)] font-work-sans" />
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
  }} className={`fixed bottom-4 right-4 ${config.bg} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 font-work-sans`}>

      <Icon className="w-4 h-4 sm:w-5 sm:h-5" solid={false} />
      <span className="font-medium text-sm font-work-sans">{message}</span>
    </motion.div>;
};

// Error display component for sections
const ErrorDisplay: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({
  message,
  onRetry
}) => <div className="bg-white rounded-lg border border-red-200 p-6 text-center font-work-sans">
    <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4 font-work-sans">
      <Icon iconId="faXCircleLight" className="w-8 h-8 text-red-500 font-work-sans"  />
    </div>
    <h3 className="text-lg font-medium text-[var(--primary-color)] mb-2 font-sora">Something went wrong!</h3>
    <p className="text-sm text-[var(--secondary-color)] mb-4 font-work-sans">
      {message}
    </p>
    {onRetry && <button onClick={onRetry} className="group inline-flex items-center px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition-colors font-work-sans">

        <Icon iconId="faArrowRightLight" className="w-4 h-4 mr-2" />
        <span className="font-work-sans">Try again</span>
      </button>}
    </div>;

// Card component to wrap modules in a modern, "card" style
interface CardProps {
  title: string;
  description?: string;
  iconName?: IconName; // @deprecated - use iconId instead
  iconId?: string; // New property for explicit icon ID with variant suffix
  children: React.ReactNode;
  actions?: React.ReactNode;
}
const DashboardCard: React.FC<CardProps> = ({
  title,
  description,
  iconName,
  iconId,
  children,
  actions
}) => <motion.div initial={{
  opacity: 0,
  y: 10
}} animate={{
  opacity: 1,
  y: 0
}} className="bg-white shadow-sm rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-[var(--divider-color)]">

    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3 font-work-sans">
      <div className="flex items-center font-work-sans">
        {(iconName || iconId) && <div className="bg-[var(--accent-color)] bg-opacity-10 p-2.5 rounded-lg mr-3 font-work-sans">
            <Icon 
              {... (iconId ? { iconId } : { name: iconName })} 
              className="w-5 h-5 text-[var(--accent-color)] font-work-sans" 
              solid={false} 
            />
          </div>}
        <div className="font-work-sans">
          <h2 className="text-lg font-semibold text-[var(--primary-color)] font-sora">{title}</h2>
          {description && <p className="text-sm text-[var(--secondary-color)] mt-0.5 font-work-sans">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex space-x-2 ml-auto sm:ml-0 font-work-sans">
          {actions}
        </div>}
    </div>
    <div className="space-y-4 font-work-sans">
      {children}
    </div>
  </motion.div>;

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}
// We previously used DashboardStatusBadge, so let's use it consistently
const DashboardStatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md"
}) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  // Map status to config (icon, color, label)
  const config = {
    draft: {
      iconName: "edit" as IconName,
      iconId: "faEditLight",
      color: "bg-gray-100 text-gray-800",
      label: "Draft"
    },
    active: {
      iconName: "check" as IconName,
      iconId: "faCheckLight",
      color: "bg-green-100 text-green-800",
      label: "Active"
    },
    paused: {
      iconName: "info" as IconName,
      iconId: "faInfoLight",
      color: "bg-yellow-100 text-yellow-800",
      label: "Paused"
    },
    completed: {
      iconName: "check" as IconName,
      iconId: "faCheckLight",
      color: "bg-blue-100 text-blue-800",
      label: "Completed"
    },
    error: {
      iconName: "close" as IconName,
      iconId: "faXmarkLight",
      color: "bg-red-100 text-red-800",
      label: "Error"
    }
  }[status.toLowerCase()] || {
    iconName: "info" as IconName,
    iconId: "faInfoLight",
    color: "bg-gray-100 text-gray-800",
    label: status
  };
  return <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium 
      ${config.color} border shadow-sm font-work-sans`}>
      <Icon 
        iconId={config.iconId} 
        className={size === "sm" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-1.5"} 
        solid={false} 
      />
      {config.label}
    </span>;
};

// Reusable Components
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: number;
  iconName?: IconName; // @deprecated - use iconId instead
  iconId?: string; // New property for explicit icon ID with variant suffix
  imageSrc?: string; // Add support for direct SVG images
  description?: string;
  format?: "number" | "currency" | "percent";
}

// Update the MetricCard component to apply a white filter to SVG images
const DashboardMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  iconName,
  iconId,
  imageSrc,
  description,
  format = "number"
}) => (
  <div className="bg-white rounded-xl border border-[var(--divider-color)] shadow p-4 font-work-sans" data-cy="metric-card">
    <div className="flex justify-between items-start font-work-sans">
      <div className="flex items-center font-work-sans">
        <div className="mr-3 p-2 bg-[var(--accent-color)] rounded-lg flex items-center justify-center w-9 h-9 font-work-sans">
          {imageSrc ?
        <img
          src={imageSrc}
          alt={title}
          className="w-5 h-5"
          style={{ filter: 'brightness(0) invert(1)' }} /> :

        /* Use iconId if provided, fall back to legacy iconName if not */
        <Icon 
          {... (iconId ? { iconId } : { name: iconName })}
          className="w-5 h-5 text-white font-work-sans" 
          solid={true} 
        />
        }
        </div>
        <h3 className="text-sm font-medium text-[var(--secondary-color)] font-sora">{title}</h3>
      </div>
      
      {trend !== undefined && <span className={`inline-flex items-center mr-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'} font-work-sans`}>
          {trend >= 0 ? <Icon iconId="faChevronUpLight" className="w-3 h-3 mr-1"  /> : <Icon iconId="faChevronDownLight" className="w-3 h-3 mr-1"  />}
          {Math.abs(trend)}%
        </span>}
    </div>
    
    <div className="mt-1 pl-11 font-work-sans">
      <div className="text-2xl font-bold text-[var(--primary-color)] font-work-sans">
        {format === "currency" && "$"}
        {typeof value === "number" ? value.toLocaleString() : value}
        {format === "percent" && "%"}
      </div>
      {description && <div className="text-xs text-[var(--tertiary-color)] mt-1 font-work-sans">{description}</div>}
    </div>
  </div>
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
    id: number | string;
    title: string;
    start: Date;
    end?: Date;
    platform?: string;
    budget?: number;
    kpi?: string;
    status?: string;
    color?: string;
  }>;
  onEventClick?: (eventId: number | string) => void;
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
  iconName?: IconName; // @deprecated - use iconId instead
  iconId?: string; // New property for explicit icon ID with variant suffix
  actions?: React.ReactNode;
}
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  iconName,
  iconId,
  actions
}) => <div className="bg-white rounded-xl border border-[var(--divider-color)] shadow-sm p-4 sm:p-6 font-work-sans" data-cy="chart-card">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 font-work-sans">
      <div className="flex items-center font-work-sans">
        {(iconName || iconId) && <div className="bg-[var(--accent-color)] bg-opacity-10 p-2 rounded-lg mr-3 font-work-sans">
            <Icon 
              {... (iconId ? { iconId } : { name: iconName })}
              className="w-5 h-5 text-[var(--accent-color)] font-work-sans" 
              solid={false} 
            />
          </div>}
        <div className="font-work-sans">
          <h3 className="text-lg font-semibold text-[var(--primary-color)] font-sora">{title}</h3>
          {description && <p className="text-sm text-[var(--secondary-color)] font-work-sans">{description}</p>}
        </div>
      </div>
      {actions && <div className="sm:ml-auto font-work-sans">{actions}</div>}
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
    
    // Check for non-OK response
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: true,
        campaigns: []
      };
    }
    
    try {
      const data = await response.json();
      
      // Transform based on response format
      let transformedCampaigns = [];
      
      if (data.success && Array.isArray(data.data)) {
        // Standard format
        transformedCampaigns = data.data.map(mapCampaign);
      } else if (Array.isArray(data)) {
        // Direct array format
        transformedCampaigns = data.map(mapCampaign);
      } else if (data.campaigns && Array.isArray(data.campaigns)) {
        // Campaigns property format
        transformedCampaigns = data.campaigns;
      }
      
      return {
        success: true,
        campaigns: transformedCampaigns
      };
    } catch (jsonError) {
      return {
        success: true,
        campaigns: []
      };
    }
  } catch (fetchError) {
    return {
      success: true,
      campaigns: []
    };
  }
};

// Helper function to map campaign data consistently
const mapCampaign = (campaign: any, index: number) => {
  // Parse budget safely
  let budgetTotal = 0;
  if (campaign.budget) {
    try {
      if (typeof campaign.budget === 'string') {
        const budgetObj = JSON.parse(campaign.budget);
        budgetTotal = budgetObj.total || 0;
      } else if (typeof campaign.budget === 'object') {
        budgetTotal = campaign.budget.total || 0;
      }
    } catch (e) {
      // Error handling
    }
  }
  
  // Parse primary contact safely
  let contactData = { firstName: '', surname: '' };
  if (campaign.primaryContact) {
    try {
      if (typeof campaign.primaryContact === 'string') {
        contactData = JSON.parse(campaign.primaryContact);
      } else if (typeof campaign.primaryContact === 'object') {
        contactData = campaign.primaryContact;
      }
    } catch (e) {
      // Error handling
    }
  }
  
  // Ensure valid dates
  const processDate = (dateInput: any): string => {
    if (!dateInput) return new Date().toISOString();
    
    // If it's already a string ISO date
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      return dateInput;
    }
    
    // If it's a date object
    if (dateInput instanceof Date) {
      return dateInput.toISOString();
    }
    
    // If it's a string but not ISO format (convert to ISO)
    if (typeof dateInput === 'string') {
      try {
        const parsedDate = new Date(dateInput);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString();
        }
      } catch (e) {
        // Error handling
      }
    }
    
    // Default fallback
    return new Date().toISOString();
  };
  
  const mappedCampaign = {
    id: campaign.id || `temp-${index}`,
    campaignName: campaign.name || campaign.campaignName || 'Untitled Campaign',
    submissionStatus: (campaign.status || campaign.submissionStatus || 'draft').toLowerCase(),
    platform: campaign.platform || 'Instagram',
    startDate: processDate(campaign.startDate),
    endDate: processDate(campaign.endDate),
    totalBudget: budgetTotal,
    primaryKPI: campaign.primaryKPI || '',
    primaryContact: contactData,
    createdAt: processDate(campaign.createdAt),
    status: (campaign.status || 'draft').toLowerCase()
  };
  
  return mappedCampaign;
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
        channel: "X",
        value: 3.7
      }, {
        channel: "linkedin",
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
  // Define the event type to include all necessary properties
  type CalendarEvent = {
    id: string | number;
    title: string;
    start: Date;
    end?: Date;
    platform?: string;
    budget?: number;
    kpi?: string;
    status?: string;
    statusText?: string;
    statusClass?: string;
    color?: string;
  };

  const [currentMonth, setCurrentMonth] = useState(month);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Also add validation for events to prevent errors
  const validEvents = useMemo(() => {
    return events.filter(event => 
      event && 
      event.id && 
      event.title && 
      event.start instanceof Date && 
      !isNaN(event.start.getTime())
    ) as CalendarEvent[];
  }, [events]);
  
  // Calculate campaign positions for timeline bars
  const calculateCampaignRows = (events: CalendarEvent[]) => {
    if (!events || events.length === 0) return { rows: [], eventPositions: {} };
    
    // Sort events by start date and duration
    const sortedEvents = [...events].sort((a, b) => {
      const aStart = new Date(a.start).getTime();
      const bStart = new Date(b.start).getTime();
      
      // First sort by start date
      if (aStart !== bStart) {
        return aStart - bStart;
      }
      
      // If start dates are the same, sort by duration (shorter first)
      const aEnd = a.end ? new Date(a.end).getTime() : aStart + 86400000;
      const bEnd = b.end ? new Date(b.end).getTime() : bStart + 86400000;
      return (aEnd - aStart) - (bEnd - bStart);
    });
    
    // Assign row positions (track occupied slots)
    const rows: Array<Array<CalendarEvent>> = [];
    const eventPositions: Record<string | number, number> = {};
    
    sortedEvents.forEach(event => {
      // Skip invalid events
      if (!event || !event.id) return;
      
      // Find the first available row
      let rowIndex = 0;
      let foundRow = false;
      
      while (!foundRow) {
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }
        
        // Check if this row has space for the event
        const hasOverlap = rows[rowIndex].some(existingEvent => {
          const eventStart = new Date(event.start);
          const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 86400000);
          const existingStart = new Date(existingEvent.start);
          const existingEnd = existingEvent.end ? new Date(existingEvent.end) : new Date(existingStart.getTime() + 86400000);
          
          return (eventStart < existingEnd && eventEnd > existingStart);
        });
        
        if (!hasOverlap) {
          rows[rowIndex].push(event);
          eventPositions[event.id] = rowIndex;
          foundRow = true;
        } else {
          rowIndex++;
        }
      }
    });
    
    return { rows, eventPositions };
  };
  
  // Calculate event positions
  const { rows, eventPositions } = useMemo(() => 
    calculateCampaignRows(validEvents), 
    [validEvents]
  );
  
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
  
  // Get the first day of the month (0-6, where 0 is Sunday)
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  // Adjust to make Monday the first day (0-6, where 0 is Monday)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Create day objects
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    const isToday = new Date().toDateString() === currentDate.toDateString();
    
    days.push({
      day: i,
      isToday,
      date: currentDate
    });
  }
  
  // Helper function for positioning event bars
  const getEventBarStyle = (event: CalendarEvent, rowIndex: number) => {
    if (!calendarRef.current) return {};
    
    // Get event dates
    const eventStart = new Date(event.start);
    const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 86400000);
    
    // Adjust dates to calendar view
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const displayStart = eventStart < monthStart ? monthStart : eventStart;
    const displayEnd = eventEnd > monthEnd ? monthEnd : eventEnd;
    
    // Get day cells for calculating positions later
    return {
      startDay: displayStart.getDate(),
      endDay: displayEnd.getDate(),
      rowIndex: rowIndex,
      color: event.color || getCampaignColor(event.platform || 'other')
    };
  };
  
  // Helper function for getting colors based on platform
  const getCampaignColor = (platform: string): string => {
    const colors: Record<string, string> = {
      'instagram': '#E1306C',
      'facebook': '#3b5998',
      'twitter': '#1DA1F2',
      'tiktok': '#000000',
      'youtube': '#FF0000',
      'linkedin': '#0077B5',
      'other': '#00BFFF',
      'x-twitter': '#000000' // X (formerly Twitter) color
    };
    
    return colors[platform.toLowerCase()] || colors.other;
  };
  
  // Add this state at the component level (around line 1445)
  const [barPositions, setBarPositions] = useState<Record<string, { left: number; top: number; width: number }>>({});

  // Add this useEffect at the component level
  useEffect(() => {
    if (!calendarRef.current) return;
    
    const newPositions: Record<string, { left: number; top: number; width: number }> = {};
    
    validEvents.forEach((event) => {
      const barStyle = getEventBarStyle(event, eventPositions[event.id] || 0);
      
      // Skip if required data is missing
      if (!barStyle.startDay || !barStyle.endDay) return;
      
      const startCell = calendarRef.current!.querySelector(`[data-day="${barStyle.startDay}"]`);
      const endCell = calendarRef.current!.querySelector(`[data-day="${barStyle.endDay}"]`);
      
      if (!startCell || !endCell) return;
      
      const calendarRect = calendarRef.current!.getBoundingClientRect();
      const startRect = startCell.getBoundingClientRect();
      const endRect = endCell.getBoundingClientRect();
      
      newPositions[String(event.id)] = {
        left: startRect.left - calendarRect.left + 2,
        top: startRect.top - calendarRect.top + 18 + (barStyle.rowIndex * 5),
        width: (endRect.right - startRect.left) - 4
      };
    });
    
    setBarPositions(newPositions);
  }, [validEvents, eventPositions]);
  
  return (
    <div 
      className="bg-white rounded-lg border border-[var(--divider-color)] overflow-hidden h-full flex flex-col font-work-sans"
      ref={calendarRef}
    >
      <div className="p-4 flex items-center justify-between border-b border-[var(--divider-color)] font-work-sans">
        <h3 className="text-base font-semibold text-center font-sora">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex space-x-2 font-work-sans">
          <button onClick={prevMonth} className="group p-1 rounded-md hover:bg-[var(--background-color)] font-work-sans">
            <Icon iconId="faChevronLeftLight" className="w-5 h-5 text-[var(--secondary-color)] font-work-sans" />
          </button>
          <button onClick={nextMonth} className="group p-1 rounded-md hover:bg-[var(--background-color)] font-work-sans">
            <Icon iconId="faChevronRightLight" className="w-5 h-5 text-[var(--secondary-color)] font-work-sans" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-grow font-work-sans">
        {/* Day headers with consistent width */}
        <div className="grid grid-cols-7 text-center py-2 px-1 text-xs font-medium text-[var(--secondary-color)] font-work-sans">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
            <div key={day} className="flex justify-center items-center py-1 font-work-sans">{day}</div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 px-1 pb-2 font-work-sans relative" style={{ minHeight: '300px' }}>
          {/* Empty cells for days not in this month at the beginning */}
          {Array.from({ length: adjustedFirstDay }).map((_, index) => (
            <div key={`empty-start-${index}`} className="calendar-cell h-20 bg-gray-50 rounded-md"></div>
          ))}
          
          {/* Actual days in the month */}
          {days.map((day, dayIndex) => (
            <div 
              key={`day-${day.day}`} 
              className={`calendar-cell h-20 p-1 rounded-md relative ${
                day.isToday ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-white hover:bg-gray-50'
              }`}
              data-day={day.day}
              data-date={day.date.toISOString()}
              style={{ minHeight: '80px' }}
            >
              <div className="text-xs font-medium text-[var(--secondary-color)]">{day.day}</div>
            </div>
          ))}
          
          {/* Empty cells for days not in this month at the end */}
          {Array.from({ length: (7 - ((adjustedFirstDay + daysInMonth) % 7)) % 7 }).map((_, index) => (
            <div key={`empty-end-${index}`} className="calendar-cell h-20 bg-gray-50 rounded-md"></div>
          ))}
          
          {/* Event bars layer */}
          {validEvents.map((event) => {
            const barPosition = barPositions[String(event.id)];
            if (!barPosition) return null;
            
            const barStyle = getEventBarStyle(event, eventPositions[event.id] || 0);
            
            return (
              <div
                key={`event-${event.id}`}
                className={`absolute z-10 rounded-sm px-1 py-0.5 text-xs font-medium text-white overflow-hidden whitespace-nowrap cursor-pointer
                           ${event.status === 'completed' ? 'bg-gray-500' : 
                             event.status === 'active' ? 'bg-green-500' : 
                             event.status === 'upcoming' ? 'bg-blue-500' : 'bg-[var(--accent-color)]'}`}
                style={{
                  left: `${barPosition.left}px`,
                  top: `${barPosition.top}px`,
                  width: `${barPosition.width}px`,
                  backgroundColor: barStyle.color
                }}
                onClick={() => handleEventClick(event)}
                onMouseEnter={(e) => {
                  setHoveredEvent(String(event.id));
                  setTooltipPosition({ 
                    x: e.clientX, 
                    y: e.clientY 
                  });
                }}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {event.title}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Tooltip for event details */}
      {hoveredEvent && (
        <div 
          className="fixed z-50 bg-white rounded-md shadow-lg border border-[var(--divider-color)] p-3 max-w-xs"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`
          }}
        >
          {(() => {
            const event = validEvents.find(e => String(e.id) === hoveredEvent);
            if (!event) return null;
            
            return (
              <>
                <h4 className="font-semibold text-sm font-sora">{event.title}</h4>
                <div className="text-xs text-[var(--secondary-color)] mt-1 font-work-sans">
                  <div className="flex items-center font-work-sans">
                    <Icon iconId="faCalendarLight" className="w-3 h-3 mr-1 text-[var(--secondary-color)]" />
                    <span>
                      {format(new Date(event.start), 'MMM d, yyyy')} 
                      {event.end && ` - ${format(new Date(event.end), 'MMM d, yyyy')}`}
                    </span>
                  </div>
                  {event.platform && (
                    <div className="flex items-center mt-1 font-work-sans">
                      <Icon iconId="faHashtagLight" className="w-3 h-3 mr-1 text-[var(--secondary-color)]" />
                      <span>{event.platform}</span>
                    </div>
                  )}
                  {event.budget && (
                    <div className="flex items-center mt-1 font-work-sans">
                      <Icon iconId="faDollarSignLight" className="w-3 h-3 mr-1 text-[var(--secondary-color)]" />
                      <span>${event.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {event.status && (
                    <div className="mt-2 font-work-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${event.statusClass || 'bg-gray-100'}`}>
                        {event.statusText || event.status}
                      </span>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
      
      {/* Status legend */}
      <div className="p-2 flex flex-wrap gap-2 border-t border-[var(--divider-color)]">
        <div className="flex items-center text-xs text-[var(--secondary-color)]">
          <span className="w-3 h-3 inline-block mr-1 bg-blue-100 border border-blue-400 rounded-sm"></span>
          <span>Draft</span>
        </div>
        <div className="flex items-center text-xs text-[var(--secondary-color)]">
          <span className="w-3 h-3 inline-block mr-1 bg-green-100 border border-green-400 rounded-sm"></span>
          <span>Active</span>
        </div>
        <div className="flex items-center text-xs text-[var(--secondary-color)]">
          <span className="w-3 h-3 inline-block mr-1 bg-yellow-100 border border-yellow-400 rounded-sm"></span>
          <span>In Review</span>
        </div>
        <div className="flex items-center text-xs text-[var(--secondary-color)]">
          <span className="w-3 h-3 inline-block mr-1 bg-gray-100 border border-gray-400 rounded-sm"></span>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
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
  const maxValue = Math.max(...dataPoints.map((point) => point.value));
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
    case 'Performance':return 'bg-blue-500';
    case 'Audience':return 'bg-purple-500';
    case 'Content':return 'bg-green-500';
    case 'Strategy':return 'bg-yellow-500';
    default:return 'bg-gray-500';
  }
};

const getCategoryTextColor = (category: string) => {
  switch (category) {
    case 'Performance':return 'text-blue-500 bg-blue-100';
    case 'Audience':return 'text-purple-500 bg-purple-100';
    case 'Content':return 'text-green-500 bg-green-100';
    case 'Strategy':return 'text-yellow-500 bg-yellow-100';
    default:return 'text-gray-500 bg-gray-100';
  }
};

const getImpactBadgeColor = (impact: string) => {
  switch (impact) {
    case 'High':return 'bg-red-100 text-red-700';
    case 'Medium':return 'bg-yellow-100 text-yellow-700';
    case 'Low':return 'bg-green-100 text-green-700';
    default:return 'bg-gray-100 text-gray-700';
  }
};

// Add a helper function to get colors based on platform
const getCampaignColor = (platform: string) => {
  const colorMap: Record<string, string> = {
    'instagram': '#E1306C',
    'facebook': '#1877F2',
    'twitter': '#1DA1F2',
    'tiktok': '#000000',
    'linkedin': '#0A66C2',
    'youtube': '#FF0000',
    'other': '#00BFFF',
    'x-twitter': '#000000' // X (formerly Twitter) color
  };
  return colorMap[platform.toLowerCase()] || colorMap.other;
};

// Helper to get status color and text
const getStatusInfo = (status: string) => {
  // Normalize status to lowercase for case-insensitive matching
  const normalizedStatus = (status || '').toLowerCase();
  switch (normalizedStatus) {
    case 'approved':
      return {
        class: 'bg-green-100 text-green-800 border-green-200',
        text: 'Approved'
      };
    case 'active':
      return {
        class: 'bg-green-100 text-green-800 border-green-200',
        text: 'Active'
      };
    case 'submitted':
      return {
        class: 'bg-green-100 text-green-800 border-green-200',
        text: 'Submitted'
      };
    case 'in_review':
    case 'in-review':
    case 'inreview':
      return {
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'In Review'
      };
    case 'paused':
      return {
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Paused'
      };
    case 'completed':
      return {
        class: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Completed'
      };
    case 'draft':
    default:
      return {
        class: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Draft'
      };
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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('performance');
  const [timeframe, setTimeframe] = useState('7d');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [currentDate] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const [barPositions, setBarPositions] = useState<Record<string, { left: number; top: number; width: number }>>({});
  
  // Update the SWR hook type with improved configuration
  const {
    data: campaignsData,
    error: fetchError,
    isLoading: isLoadingCampaigns
  } = useSWR<CampaignsResponse>('/api/campaigns', fetcher, {
    onError: (error) => {
      handleError(new Error('Failed to fetch campaign data. Please try refreshing the page.'));
    },
    revalidateOnFocus: false,
    revalidateIfStale: true,
    revalidateOnReconnect: true
  });
  
  // Process campaigns for different views
  const activeCampaigns = useMemo(() => {
    return campaignsData?.campaigns?.filter((campaign) => campaign.submissionStatus === "submitted" && new Date(campaign.startDate) <= new Date() && (!campaign.endDate || new Date(campaign.endDate) >= new Date())) || [];
  }, [campaignsData?.campaigns]);

  // Process campaign data for the calendar
  const calendarEvents = useMemo(() => {
    if (!campaignsData || !campaignsData.campaigns || !campaignsData.campaigns.length) return [];
    
    // Helper function to get status text
    const getStatusText = (status: string): string => {
      const normalizedStatus = status?.toLowerCase() || 'draft';
      
      switch (normalizedStatus) {
        case 'draft':
          return 'Draft';
        case 'in_review':
        case 'in-review':
        case 'inreview':
          return 'In Review';
        case 'active':
        case 'approved':
        case 'submitted':
          return 'Active';
        case 'completed':
          return 'Completed';
        default:
          return status || 'Draft';
      }
    };
    
    // Calendar events for the upcoming campaigns - include ALL campaigns for the calendar
    return campaignsData.campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.campaignName,
      start: new Date(campaign.startDate),
      end: campaign.endDate ? new Date(campaign.endDate) : undefined,
      platform: campaign.platform,
      budget: campaign.totalBudget,
      status: campaign.submissionStatus,
      statusText: getStatusText(campaign.submissionStatus)
    }));
  }, [campaignsData]);
  
  // No need to maintain separate upcomingCampaigns here since they are filtered in the UpcomingCampaignsCard component

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
    setError(message);
    setTimeout(() => setError(null), 5000);
  };
  const handleExport = async () => {
    try {
      setIsAddingNew(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setError('Dashboard data exported successfully');
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Export failed'));
    } finally {
      setIsAddingNew(false);
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
    <div className={`h-2 ${getCategoryColor(insight.category)} font-work-sans`} />
    <div className="p-5 font-work-sans">
      <div className="flex items-center mb-3 font-work-sans">
        <span className={`${getCategoryTextColor(insight.category)} text-xs font-medium px-2.5 py-0.5 rounded-full bg-opacity-15 font-work-sans`}>
          {insight.category}
        </span>
        <span className={`ml-2 ${getImpactBadgeColor(insight.impact)} text-xs font-medium px-2 py-0.5 rounded-full font-work-sans`}>
          {insight.impact} Impact
        </span>
      </div>
      <h3 className="text-base font-semibold text-[var(--primary-color)] mb-2 font-sora">{insight.title}</h3>
      <p className="text-sm text-[var(--secondary-color)] mb-4 font-work-sans">{insight.description}</p>
      <button onClick={() => onAction(insight.action)} className="group w-full px-4 py-2 bg-[var(--accent-color)] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center font-work-sans">
        <span className="font-work-sans">Take Action</span>
        <Icon iconId="faArrowRightLight" className="w-4 h-4 ml-2" />
      </button>
    </div>
  </motion.div>;

  // Return the JSX for the dashboard
  return (
    <div className="space-y-8 font-work-sans" data-cy="dashboard-content">
      {/* Campaigns Overview Section */}
      <div className="mb-4 sm:mb-6 font-work-sans">
        <div className="flex justify-between items-center mb-3 sm:mb-5 font-work-sans">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--primary-color)] font-sora">
            Campaigns Overview
          </h2>
          <div className="flex space-x-3 font-work-sans">
            <select
              className="rounded-lg border border-[var(--divider-color)] pl-3 pr-8 py-2 text-sm text-[var(--primary-color)] focus:ring-[var(--accent-color)] font-work-sans" 
              defaultValue="30"
              data-cy="time-period-select"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center rounded-lg border border-[var(--divider-color)] px-4 py-2 text-sm text-[var(--primary-color)] hover:bg-gray-50 transition-colors font-work-sans"
              data-cy="export-button"
            >
              <Icon iconId="faDownloadLight" className="w-4 h-4 mr-2 text-[var(--secondary-color)]"  />
              Export
            </button>
            
            <button
              onClick={handleNewCampaign}
              className="bg-[var(--accent-color)] hover:bg-[#0096cc] text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200 font-work-sans"
              data-cy="new-campaign-button"
            >
              <Icon iconId="faPlusLight" className="w-4 h-4 mr-2"  />
              <span className="font-work-sans">New Campaign</span>
            </button>
          </div>
        </div>
        
        {/* Calendar and Campaign Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 font-work-sans">
          {/* Calendar */}
          <div className="col-span-12 lg:col-span-6 font-work-sans">
            <CalendarDashboard month={currentDate} events={calendarEvents} />
          </div>
          
          {/* Campaign Cards - Align with calendar */}
          <div className="col-span-12 lg:col-span-6 font-work-sans">
            <ErrorBoundary
              fallback={
                <div className="h-full border border-[var(--divider-color)] rounded-lg bg-white overflow-hidden p-4">
                  <h3 className="text-sm font-medium text-[var(--secondary-color)] mb-3">Upcoming</h3>
                  <div className="text-center py-4 border border-dashed border-[var(--divider-color)] rounded-lg">
                    <p className="text-sm text-red-500 mb-2">Unable to display campaigns</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="text-xs px-3 py-1.5 bg-[var(--accent-color)] text-white rounded-md"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              }
            >
              <UpcomingCampaignsCard 
                campaigns={Array.isArray(campaignsData?.campaigns) ? 
                  campaignsData.campaigns.map(c => ({
                    ...c,
                    id: c.id,
                    campaignName: c.campaignName,
                    submissionStatus: c.submissionStatus,
                    platform: c.platform,
                    startDate: c.startDate,
                    endDate: c.endDate,
                    totalBudget: c.totalBudget,
                    primaryKPI: c.primaryKPI
                  })) : []
                }
                isLoading={isLoadingCampaigns}
                onNewCampaign={handleNewCampaign}
                onSelectCampaign={(id: number | string) => router.push(`/campaigns/${id}`)}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
      
      {/* Performance Metrics Section */}
      <div className="mb-5 sm:mb-8 font-work-sans">
        <div className="flex items-center justify-between mb-3 sm:mb-4 font-work-sans">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--primary-color)] font-sora">Performance</h2>
        </div>
        
        {/* Performance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-work-sans">
          <DashboardMetricCard
            title="Total Campaigns"
            value={metrics.stats.totalCampaigns}
            trend={metrics.stats.campaignChange}
            iconId="faMegaphoneLight"
            description={`+${metrics.stats.campaignChange} campaigns`} />

          
          <DashboardMetricCard
            title="Survey Responses"
            value={metrics.stats.surveyResponses}
            trend={metrics.stats.surveyChange}
            iconId="faCommentDotsLight"
            description={`${metrics.stats.surveyChange < 0 ? '' : '+'}${metrics.stats.surveyChange} responses`} />

          
          <DashboardMetricCard
            title="Live Campaigns"
            value={metrics.stats.liveCampaigns}
            trend={metrics.stats.liveChange}
            iconId="faPlayLight"
            description={`${metrics.stats.liveChange > 0 ? '+' : ''}${metrics.stats.liveChange} active`} />

          
          <DashboardMetricCard
            title="Credits Available"
            value={metrics.stats.creditsAvailable}
            trend={metrics.stats.creditsChange}
            iconId="faCoinsLight"
            description={`${metrics.stats.creditsChange > 0 ? '+' : ''}${metrics.stats.creditsChange} credits`} />

        </div>
      </div>

      {/* Influencers Overview */}
      <div className="mb-8 font-work-sans">
        <div className="flex justify-between items-center mb-4 font-work-sans">
          <h2 className="text-xl font-semibold text-gray-900 font-sora">Influencers Overview</h2>
          <div className="flex space-x-3 font-work-sans">
            <button onClick={() => router.push('/influencers/reports')} className="group px-4 py-2 bg-[var(--accent-color)] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors font-work-sans">
              <Icon iconId="faArrowRightLight" className="w-4 h-4 mr-2" />
              <span className="font-work-sans">View Detailed Report</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-[var(--divider-color)] font-work-sans">
          <div className="flex border-b border-[var(--divider-color)] font-work-sans">
            <button className="group px-4 py-3 text-sm font-medium text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] font-work-sans">
              <span className="font-work-sans">Social Profiles</span>
            </button>
            <button className="group px-4 py-3 text-sm font-medium text-gray-500 hover:text-[var(--primary-color)] font-work-sans">
              <span className="font-work-sans">Engagement</span>
            </button>
            <button className="group px-4 py-3 text-sm font-medium text-gray-500 hover:text-[var(--primary-color)] font-work-sans">
              <span className="font-work-sans">Likes</span>
            </button>
            <button className="group px-4 py-3 text-sm font-medium text-gray-500 hover:text-[var(--primary-color)] font-work-sans">
              <span className="font-work-sans">Comments</span>
            </button>
          </div>
          
          {/* Social profiles content */}
          <div className="overflow-hidden p-4 font-work-sans">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center font-work-sans">
                      <div className="h-10 w-10 flex-shrink-0 font-work-sans">
                        <img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
                      </div>
                      <div className="ml-4 font-work-sans">
                        <div className="flex items-center font-work-sans">
                          <div className="font-medium text-gray-900 font-work-sans">Ethan Edge</div>
                          <svg className="ml-1 w-4 h-4 text-blue-500 font-work-sans" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.21 10.08c-.02 0-.04 0-.06-.02-.67-.9-.84-2.44-.89-3.03 0-.11-.13-.18-.23-.12C4.93 8.08 3 10.86 3 13.54 3 18.14 6.2 22 11.7 22c5.15 0 8.7-3.98 8.7-8.46 0-5.87-4.2-9.77-7.93-11.53a.13.13 0 0 0-.19.14c.48 3.16-.18 6.6-4.07 7.93z" fill="#38bdf8" />
                          </svg>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center font-work-sans">
                          <svg className="w-3.5 h-3.5 mr-1 text-gray-400 font-work-sans" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="font-work-sans">Back to Inspiration</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-work-sans">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 font-work-sans">
                      <div className="bg-[var(--accent-color)] h-1.5 rounded-full font-work-sans" style={{
                        width: '90%'
                      }}></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-sm font-work-sans">3K</td>
                  <td className="py-3 px-4 text-right font-medium text-sm font-work-sans">12</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center font-work-sans">
                      <div className="h-10 w-10 flex-shrink-0 font-work-sans">
                        <img className="h-10 w-10 rounded-full" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
                      </div>
                      <div className="ml-4 font-work-sans">
                        <div className="font-medium text-gray-900 font-work-sans">Olivia Wave</div>
                        <div className="text-sm text-gray-500 flex items-center font-work-sans">
                          <svg className="w-3.5 h-3.5 mr-1 text-gray-400 font-work-sans" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="none" stroke="currentColor" strokeWidth="1.5"></path>
                          </svg>
                          <span className="font-work-sans">New Beginnings</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-work-sans">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 font-work-sans">
                      <div className="bg-[var(--accent-color)] h-1.5 rounded-full font-work-sans" style={{
                        width: '85%'
                      }}></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-sm font-work-sans">3K</td>
                  <td className="py-3 px-4 text-right font-medium text-sm font-work-sans">52</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Security check box */}
          <div className="mt-1 border-t border-gray-200 p-4 font-work-sans">
            <div className="flex justify-between items-center font-work-sans">
              <div className="font-work-sans">
                <p className="text-sm font-medium font-work-sans">Security Check</p>
                <p className="text-xs text-gray-500 mt-1 font-work-sans">Maintain safety. Complete your security check on time.</p>
              </div>
              <div className="flex space-x-3 font-work-sans">
                <div className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-md font-work-sans">Next in 5 Days</div>
                <button className="group bg-[var(--accent-color)] text-white text-xs font-medium px-3 py-1 rounded-md font-work-sans">
                  <span className="font-work-sans">Run Check</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Summary Section */}
      <div className="mb-8 font-work-sans">
        <div className="flex justify-between items-center mb-4 font-work-sans">
          <h2 className="text-xl font-semibold text-gray-900 font-sora">Insights Summary</h2>
          <a href="#" className="group text-[var(--accent-color)] text-sm font-medium flex items-center hover:underline font-work-sans">
            <span className="font-work-sans">View All Insights</span>
            <Icon iconId="faArrowRightLight" className="w-4 h-4 ml-1" />
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
          {/* Youth Momentum Insight Card */}
          <div className="bg-[#e6f7ff] border border-[#bae6fd] rounded-lg p-5 relative overflow-hidden font-work-sans">
            <div className="flex items-start mb-3 font-work-sans">
              <div className="bg-[var(--accent-color)] p-2 rounded-md mr-3 font-work-sans">
                <Icon iconId="faChartLineLight" className="w-5 h-5 text-white font-work-sans"  />
              </div>
              <div className="flex-1 font-work-sans">
                <h3 className="text-base font-semibold text-[#0c4a6e] font-sora">Youth Momentum: Boosting Performance Among 18-24-Year-Olds</h3>
              </div>
            </div>
            <p className="text-sm text-[#0c4a6e] mb-4 font-work-sans">
              Campaign "NextGen Focus: Amplify Impact" is performing 20% better among 18-24-year-olds. Consider allocating more budget to this segment.
            </p>
            <div className="flex justify-end font-work-sans">
              <button className="group bg-[var(--accent-color)] text-white text-xs font-medium px-4 py-1.5 rounded-md hover:bg-opacity-90 font-work-sans">
                <span className="font-work-sans">Read</span>
              </button>
            </div>
          </div>
          
          {/* Low Engagement Alert Card */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-5 relative overflow-hidden font-work-sans">
            <div className="absolute top-0 right-0 p-1 font-work-sans">
              <button className="group text-gray-400 hover:text-gray-600 font-work-sans">
                <Icon iconId="faXmarkLight" className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-start mb-3 font-work-sans">
              <div className="bg-gray-300 p-2 rounded-md mr-3 font-work-sans">
                <Icon iconId="faTriangleExclamationLight" className="w-5 h-5 text-gray-600 font-work-sans"  />
              </div>
              <div className="flex-1 font-work-sans">
                <h3 className="text-base font-semibold text-gray-700 font-sora">Low Engagement on "NextGen Focus: Amplify Impact"</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 font-work-sans">
              Engagement rate is 15% below average. Consider revising the call-to-action.
            </p>
          </div>
        </div>
      </div>

      {/* Latest Campaigns List */}
      <div className="mb-8 font-work-sans">
        <div className="flex justify-between items-center mb-4 font-work-sans">
          <h2 className="text-xl font-semibold text-gray-900 font-sora">Latest Campaigns List</h2>
          <button className="group px-4 py-2 bg-[var(--accent-color)] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors font-work-sans">
            <span className="font-work-sans">Manage</span>
          </button>
        </div>
        
        {/* Campaigns table */}
        <div className="bg-white rounded-lg border border-[var(--divider-color)] overflow-hidden font-work-sans">
          <div className="overflow-x-auto font-work-sans">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider font-work-sans">Campaign</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider font-work-sans">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider font-work-sans">Budget</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider font-work-sans">Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingCampaigns ?
                <tr>
                    <td colSpan={4} className="py-8">
                      <TableSkeleton rows={3} cols={4} hasHeader={false} />
                    </td>
                  </tr> :

                <>
                    <tr className="hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 px-4">
                        <div className="flex items-center font-work-sans">
                          <div className="text-sm font-medium text-gray-900 font-work-sans">Clicks & Connections</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 font-work-sans">
                          Live
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col font-work-sans">
                          <div className="text-xs font-medium text-gray-600 font-work-sans">Budget</div>
                          <div className="flex items-center font-work-sans">
                            <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2 font-work-sans">
                              <div className="bg-[var(--accent-color)] h-1.5 rounded-full font-work-sans" style={{
                              width: '75%'
                            }}></div>
                            </div>
                            <span className="text-xs font-medium font-work-sans">12,314$</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium font-work-sans">12 of 100 Users</div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 px-4">
                        <div className="flex items-center font-work-sans">
                          <div className="text-sm font-medium text-gray-900 font-work-sans">Beyond the Horizon</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 font-work-sans">
                          Live
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col font-work-sans">
                          <div className="text-xs font-medium text-gray-600 font-work-sans">Budget</div>
                          <div className="flex items-center font-work-sans">
                            <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2 font-work-sans">
                              <div className="bg-[var(--accent-color)] h-1.5 rounded-full font-work-sans" style={{
                              width: '60%'
                            }}></div>
                            </div>
                            <span className="text-xs font-medium font-work-sans">10,461$</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium font-work-sans">46 of 413 Users</div>
                      </td>
                    </tr>
                  </>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Brand health card - Moved to bottom of page */}
      <div className="bg-white rounded-lg border border-[var(--divider-color)] p-5 mb-6 font-work-sans">
        <div className="flex justify-between items-center mb-4 font-work-sans">
          <h2 className="text-xl font-semibold text-gray-900 font-sora">Brand Health</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
          {/* Left side - Sentiment Score */}
          <div className="font-work-sans">
            <div className="mb-3 flex justify-between items-center font-work-sans">
              <div className="font-work-sans">
                <h3 className="text-sm text-gray-500 mb-1 font-sora">Sentiment Score</h3>
                <div className="flex items-baseline font-work-sans">
                  <span className="text-2xl font-bold font-work-sans">76% Positive Score</span>
                </div>
              </div>
              <div className="flex items-center font-work-sans">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium font-work-sans">90D</span>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 font-medium ml-1 rounded-md font-work-sans">3M</span>
              </div>
            </div>
            
            {/* Chart */}
            <div className="mt-4 h-48 relative font-work-sans">
              {/* Simulated chart with lines */}
              <div className="absolute top-0 left-0 w-full h-full font-work-sans">
                <div className="relative w-full h-full font-work-sans">
                  {/* Y-axis labels */}
                  <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-gray-500 font-work-sans">
                    <span className="font-work-sans">20k</span>
                    <span className="font-work-sans">15k</span>
                    <span className="font-work-sans">10k</span>
                    <span className="font-work-sans">5k</span>
                    <span className="font-work-sans">1k</span>
                    <span className="font-work-sans">0</span>
                  </div>
                  
                  {/* X-axis grid lines */}
                  <div className="absolute left-0 top-0 w-full h-full border-b border-gray-200 font-work-sans">
                    <div className="absolute left-0 top-0 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
                    <div className="absolute left-0 top-1/5 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
                    <div className="absolute left-0 top-2/5 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
                    <div className="absolute left-0 top-3/5 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
                    <div className="absolute left-0 top-4/5 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
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
                  <div className="absolute left-0 bottom-0 w-full flex justify-between text-xs text-gray-500 mt-2 font-work-sans">
                    <span className="font-work-sans">01 Aug</span>
                    <span className="font-work-sans">05 Aug</span>
                    <span className="font-work-sans">10 Aug</span>
                    <span className="font-work-sans">15 Aug</span>
                    <span className="font-work-sans">20 Aug</span>
                    <span className="font-work-sans">25 Aug</span>
                    <span className="font-work-sans">30 Aug</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Event marker */}
            <div className="mt-6 flex items-center font-work-sans">
              <div className="px-2 py-1 bg-[#e6f7ff] text-[#0ea5e9] text-xs rounded flex items-center font-work-sans">
                <span className="w-2 h-2 bg-[#0ea5e9] rounded-full mr-1 font-work-sans"></span>
                <span className="font-work-sans">Senior Travellers Campaign launch</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Latest mentions */}
          <div className="font-work-sans">
            <div className="mb-3 flex justify-between items-center font-work-sans">
              <div className="font-work-sans">
                <h3 className="text-sm text-gray-500 mb-1 font-sora">Latest Mentions</h3>
                <div className="flex items-baseline font-work-sans">
                  <span className="text-2xl font-bold font-work-sans">1,561 Mentions</span>
                  <span className="ml-2 text-xs text-green-600 font-medium font-work-sans">+47% More than last week</span>
                </div>
              </div>
              <div className="flex items-center font-work-sans">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium font-work-sans">90D</span>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 font-medium ml-1 rounded-md font-work-sans">3M</span>
              </div>
            </div>
            
            {/* Chart */}
            <div className="mt-4 h-48 relative font-work-sans">
              {/* Simulated chart with lines */}
              <div className="absolute top-0 left-0 w-full h-full font-work-sans">
                <div className="relative w-full h-full font-work-sans">
                  {/* Y-axis labels */}
                  <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-gray-500 font-work-sans">
                    <span className="font-work-sans">20k</span>
                    <span className="font-work-sans">15k</span>
                    <span className="font-work-sans">10k</span>
                    <span className="font-work-sans">5k</span>
                    <span className="font-work-sans">1k</span>
                    <span className="font-work-sans">0</span>
                  </div>
                  
                  {/* X-axis grid lines */}
                  <div className="absolute left-0 top-0 w-full h-full border-b border-gray-200 font-work-sans">
                    <div className="absolute left-0 top-0 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
                    <div className="absolute left-0 top-1/5 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
                    <div className="absolute left-0 top-2/5 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
                    <div className="absolute left-0 top-3/5 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
                    <div className="absolute left-0 top-4/5 w-full h-1/5 border-b border-gray-100 font-work-sans"></div>
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
                  <div className="absolute left-0 bottom-0 w-full flex justify-between text-xs text-gray-500 mt-2 font-work-sans">
                    <span className="font-work-sans">01 Aug</span>
                    <span className="font-work-sans">05 Aug</span>
                    <span className="font-work-sans">10 Aug</span>
                    <span className="font-work-sans">15 Aug</span>
                    <span className="font-work-sans">20 Aug</span>
                    <span className="font-work-sans">25 Aug</span>
                    <span className="font-work-sans">30 Aug</span>
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

const handleEventClick = (event: any) => {
  console.log('Event clicked:', event);
  // Add your event handling logic here
};

const handleVoteChange = (id: string, value: number) => {
  // Function implementation
};
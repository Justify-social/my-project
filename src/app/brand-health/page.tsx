"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter,
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
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
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
  CheckIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

// Enhanced data structures for enterprise metrics
interface BrandMetrics {
  currentPeriod: {
    // Brand Performance
    overallScore: number;
    trend: string;
    brandValue: number;
    brandValueGrowth: string;
    brandEquity: {
      trust: number;
      quality: number;
      innovation: number;
      value: number;
    };
    nps: {
      overall: number;
      bySegment: {
        enterprise: number;
        midMarket: number;
        smallBusiness: number;
      };
      trend: string;
    };
    
    // Market Position
    marketShare: number;
    marketShareGrowth: string;
    categoryGrowth: number;
    pricePremium: number;
    distribution: {
      coverage: number;
      effectiveness: number;
    };
    
    // Sentiment & Engagement
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
      byChannel: {
        social: number;
        news: number;
        reviews: number;
      };
    };
    engagement: {
      total: number;
      growth: string;
      byChannel: {
        website: number;
        social: number;
        email: number;
        events: number;
      };
    };
    
    // Financial Impact
    revenue: {
      attributed: number;
      growth: string;
      byChannel: {
        direct: number;
        indirect: number;
        digital: number;
      };
    };
    roi: {
      overall: number;
      byChannel: {
        digital: number;
        traditional: number;
        events: number;
      };
    };
    
    // Customer Metrics
    customerAcquisition: {
      cost: number;
      rate: number;
      trend: string;
    };
    customerRetention: {
      rate: number;
      trend: string;
      bySegment: {
        enterprise: number;
        midMarket: number;
        smallBusiness: number;
      };
    };
    
    // Digital Presence
    digitalScore: {
      overall: number;
      seo: number;
      social: number;
      content: number;
    };
    
    // Risk & Reputation
    riskScore: {
      overall: number;
      sentiment: number;
      media: number;
      social: number;
    };
  };
  
  historical: {
    weekly: Array<{
      date: string;
      score: number;
      engagement: number;
      sentiment: number;
      awareness: number;
      revenue: number;
      marketShare: number;
      nps: number;
    }>;
    
    quarterly: Array<{
      period: string;
      brandValue: number;
      marketShare: number;
      revenue: number;
      roi: number;
      customerRetention: number;
    }>;
  };
  
  competitors: Array<{
    name: string;
    sentiment: number;
    engagement: number;
    shareOfVoice: number;
    awareness: number;
    marketShare: number;
    digitalPresence: number;
    pricing: {
      premium: number;
      positioning: string;
    };
    strengths: string[];
    weaknesses: string[];
  }>;
  
  audience: {
    segments: Array<{
      name: string;
      size: number;
      growth: string;
      engagement: number;
      sentiment: number;
      lifetime_value: number;
    }>;
    demographics: Array<{
      category: string;
      distribution: Array<{
        label: string;
        value: number;
      }>;
    }>;
    journey: {
      awareness: number;
      consideration: number;
      preference: number;
      purchase: number;
      loyalty: number;
    };
  };
  
  channels: Array<{
    name: string;
    performance: number;
    growth: string;
    engagement: number;
    roi: number;
    sentiment: number;
    reach: number;
    conversion: number;
  }>;
  
  campaigns: Array<{
    name: string;
    status: string;
    reach: number;
    engagement: number;
    conversion: number;
    roi: number;
    sentiment: number;
    budget: number;
    start_date: string;
    end_date: string;
  }>;
  
  content: {
    performance: Array<{
      type: string;
      engagement: number;
      reach: number;
      conversion: number;
      sentiment: number;
    }>;
    trending: Array<{
      title: string;
      type: string;
      engagement: number;
      sentiment: number;
    }>;
  };
  
  risks: Array<{
    category: string;
    level: number;
    trend: string;
    impact: number;
    mitigation: string;
  }>;
  
  predictions: {
    brandHealth: Array<{
      date: string;
      predicted: number;
      confidence: number;
    }>;
    marketShare: Array<{
      date: string;
      predicted: number;
      confidence: number;
    }>;
    risks: Array<{
      category: string;
      probability: number;
      impact: number;
      timeframe: string;
    }>;
  };
}

// Sample data structure implementation
const brandMetrics: BrandMetrics = {
  currentPeriod: {
    overallScore: 85,
    trend: "+5.2",
    brandValue: 1250000000,
    brandValueGrowth: "+12.5%",
    brandEquity: {
      trust: 87,
      quality: 92,
      innovation: 84,
      value: 88,
    },
    nps: {
      overall: 65,
      bySegment: {
        enterprise: 72,
        midMarket: 68,
        smallBusiness: 61,
      },
      trend: "+2",
    },
    marketShare: 28.5,
    marketShareGrowth: "+1.5%",
    categoryGrowth: 4.2,
    pricePremium: 15,
    distribution: {
      coverage: 92,
      effectiveness: 87,
    },
    sentiment: {
      positive: 72,
      neutral: 20,
      negative: 8,
      byChannel: {
        social: 75,
        news: 82,
        reviews: 78,
      },
    },
    engagement: {
      total: 250000,
      growth: "+12%",
      byChannel: {
        website: 120000,
        social: 85000,
        email: 35000,
        events: 10000,
      },
    },
    revenue: {
      attributed: 75000000,
      growth: "+15%",
      byChannel: {
        direct: 45000000,
        indirect: 20000000,
        digital: 10000000,
      },
    },
    roi: {
      overall: 3.8,
      byChannel: {
        digital: 4.2,
        traditional: 2.8,
        events: 3.5,
      },
    },
    customerAcquisition: {
      cost: 1200,
      rate: 12.5,
      trend: "-5%",
    },
    customerRetention: {
      rate: 85,
      trend: "+2%",
      bySegment: {
        enterprise: 92,
        midMarket: 85,
        smallBusiness: 78,
      },
    },
    digitalScore: {
      overall: 82,
      seo: 85,
      social: 88,
      content: 79,
    },
    riskScore: {
      overall: 15,
      sentiment: 12,
      media: 18,
      social: 14,
    },
  },
  historical: {
    weekly: [
      { date: "Week 1", score: 80, engagement: 220000, sentiment: 68, awareness: 74, revenue: 15000000, marketShare: 27.8, nps: 63 },
      { date: "Week 2", score: 82, engagement: 230000, sentiment: 70, awareness: 75, revenue: 16500000, marketShare: 28.1, nps: 64 },
      { date: "Week 3", score: 83, engagement: 240000, sentiment: 71, awareness: 76, revenue: 17200000, marketShare: 28.3, nps: 64 },
      { date: "Week 4", score: 85, engagement: 250000, sentiment: 72, awareness: 78, revenue: 18500000, marketShare: 28.5, nps: 65 },
    ],
    quarterly: [
      { period: "Q1", brandValue: 1150000000, marketShare: 27.5, revenue: 65000000, roi: 3.5, customerRetention: 83 },
      { period: "Q2", brandValue: 1200000000, marketShare: 28.0, revenue: 70000000, roi: 3.6, customerRetention: 84 },
      { period: "Q3", brandValue: 1250000000, marketShare: 28.5, revenue: 75000000, roi: 3.8, customerRetention: 85 },
    ],
  },
  competitors: [
    {
      name: "Our Brand",
      sentiment: 72,
      engagement: 250000,
      shareOfVoice: 52,
      awareness: 78,
      marketShare: 28.5,
      digitalPresence: 82,
      pricing: { premium: 15, positioning: "Premium" },
      strengths: ["Innovation", "Customer Service", "Brand Trust"],
      weaknesses: ["Price Point", "Regional Coverage"],
    },
    {
      name: "Competitor A",
      sentiment: 64,
      engagement: 220000,
      shareOfVoice: 44,
      awareness: 70,
      marketShare: 25.5,
      digitalPresence: 75,
      pricing: { premium: 10, positioning: "Premium" },
      strengths: ["Price Point", "Distribution"],
      weaknesses: ["Innovation", "Digital Presence"],
    },
    {
      name: "Competitor B",
      sentiment: 52,
      engagement: 180000,
      shareOfVoice: 35,
      awareness: 65,
      marketShare: 22.0,
      digitalPresence: 68,
      pricing: { premium: 5, positioning: "Value" },
      strengths: ["Price Point", "Market Coverage"],
      weaknesses: ["Brand Perception", "Product Quality"],
    },
  ],
  audience: {
    segments: [
      { name: "Enterprise", size: 2500, growth: "+5%", engagement: 85, sentiment: 72, lifetime_value: 250000 },
      { name: "Mid-Market", size: 12000, growth: "+8%", engagement: 78, sentiment: 68, lifetime_value: 75000 },
      { name: "Small Business", size: 45000, growth: "+12%", engagement: 72, sentiment: 65, lifetime_value: 15000 },
    ],
    demographics: [
      {
        category: "Industry",
        distribution: [
          { label: "Technology", value: 35 },
          { label: "Finance", value: 25 },
          { label: "Healthcare", value: 20 },
          { label: "Retail", value: 15 },
          { label: "Other", value: 5 },
        ],
      },
    ],
    journey: {
      awareness: 78,
      consideration: 45,
      preference: 35,
      purchase: 12,
      loyalty: 85,
    },
  },
  channels: [
    { name: "Website", performance: 88, growth: "+7.5%", engagement: 120000, roi: 4.2, sentiment: 85, reach: 500000, conversion: 2.8 },
    { name: "LinkedIn", performance: 82, growth: "+5.5%", engagement: 40000, roi: 3.8, sentiment: 82, reach: 250000, conversion: 1.8 },
    { name: "Email", performance: 75, growth: "+3.2%", engagement: 35000, roi: 4.5, sentiment: 78, reach: 150000, conversion: 3.2 },
  ],
  campaigns: [
    {
      name: "Enterprise Solutions Launch",
      status: "Active",
      reach: 250000,
      engagement: 85000,
      conversion: 2.8,
      roi: 4.2,
      sentiment: 85,
      budget: 500000,
      start_date: "2024-01-01",
      end_date: "2024-03-31",
    },
  ],
  content: {
    performance: [
      { type: "Whitepapers", engagement: 15000, reach: 75000, conversion: 3.5, sentiment: 85 },
      { type: "Case Studies", engagement: 12000, reach: 60000, conversion: 4.2, sentiment: 88 },
      { type: "Blog Posts", engagement: 25000, reach: 150000, conversion: 1.8, sentiment: 82 },
    ],
    trending: [
      { title: "Digital Transformation Guide", type: "Whitepaper", engagement: 5000, sentiment: 88 },
      { title: "ROI Calculator", type: "Tool", engagement: 4500, sentiment: 92 },
    ],
  },
  risks: [
    { category: "Competitive", level: 15, trend: "-2", impact: 8, mitigation: "Innovation pipeline acceleration" },
    { category: "Market", level: 12, trend: "+1", impact: 7, mitigation: "Market diversification strategy" },
    { category: "Reputation", level: 8, trend: "-1", impact: 9, mitigation: "Proactive PR campaign" },
  ],
  predictions: {
    brandHealth: [
      { date: "2024-Q2", predicted: 87, confidence: 85 },
      { date: "2024-Q3", predicted: 89, confidence: 80 },
      { date: "2024-Q4", predicted: 90, confidence: 75 },
    ],
    marketShare: [
      { date: "2024-Q2", predicted: 29.2, confidence: 85 },
      { date: "2024-Q3", predicted: 29.8, confidence: 80 },
      { date: "2024-Q4", predicted: 30.5, confidence: 75 },
    ],
    risks: [
      { category: "Market Disruption", probability: 25, impact: 8, timeframe: "6-12 months" },
      { category: "Competitive Entry", probability: 35, impact: 7, timeframe: "3-6 months" },
    ],
  },
};

type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface MetricCardProps {
  title: string;
  value: number;
  trend?: string;
  icon: HeroIcon;
  description?: string;
  isPositive?: boolean;
  format?: "number" | "percent" | "text" | "currency";
}

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon: HeroIcon;
  actions?: React.ReactNode;
}

// Component for displaying hashtag metrics
interface HashtagMetricProps {
  tag: string;
  reach: string;
  engagement: string;
  sentiment: number;
}

const HashtagMetric: React.FC<HashtagMetricProps> = ({ tag, reach, engagement, sentiment }) => (
  <div className="p-4 border rounded-lg hover:bg-gray-50">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-900">{tag}</h4>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        sentiment >= 85 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {sentiment}% Positive
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-500">Reach</p>
        <p className="font-medium">{reach}</p>
    </div>
      <div>
        <p className="text-gray-500">Engagement</p>
        <p className="font-medium">{engagement}</p>
    </div>
    </div>
  </div>
);

// Reusable Components
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon: Icon,
  description,
  isPositive = true,
  format = "number"
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      {trend && (
        <span className={`flex items-center text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? (
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
          )}
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-sm font-semibold text-gray-500 mb-1 font-work-sans">{title}</h3>
    <div className="flex items-baseline">
      <p className="text-3xl font-bold text-gray-900 font-sora">
        {format === "percent" ? `${value}%` : format === "currency" ? `$${value}M` : format === "number" ? value.toLocaleString() : value}
      </p>
    </div>
    {description && (
      <p className="mt-2 text-sm text-gray-500 font-work-sans">{description}</p>
    )}
  </motion.div>
);

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  description, 
  children,
  icon: Icon,
  actions,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="bg-blue-50 p-3 rounded-lg mr-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 font-sora">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 font-work-sans">{description}</p>
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
  </motion.div>
);

// Additional component interfaces
interface RadarChartCardProps {
  title: string;
  description?: string;
  icon: HeroIcon;
  data: Array<{
    subject: string;
    value: number;
    fullMark: number;
  }>;
}

interface SegmentCardProps {
  segment: {
    name: string;
    size: number;
    growth: string;
    engagement: number;
    sentiment: number;
    lifetime_value: number;
  };
}

// Reusable chart components
const RadarChartCard: React.FC<RadarChartCardProps> = ({ title, description, icon: Icon, data }) => (
  <ChartCard title={title} description={description} icon={Icon}>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Brand Score" dataKey="value" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
  </div>
  </ChartCard>
);

const SegmentCard: React.FC<SegmentCardProps> = ({ segment }) => (
  <div className="p-4 border rounded-lg hover:bg-gray-50">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-medium text-gray-900">{segment.name}</h4>
      <span className="text-sm text-green-600 font-medium">{segment.growth}</span>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-500">Size</p>
        <p className="font-medium">{segment.size.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-gray-500">LTV</p>
        <p className="font-medium">${segment.lifetime_value.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-gray-500">Engagement</p>
        <p className="font-medium">{segment.engagement}%</p>
      </div>
      <div>
        <p className="text-gray-500">Sentiment</p>
        <p className="font-medium">{segment.sentiment}%</p>
      </div>
    </div>
  </div>
);

// Main Component
export default function BrandHealthDashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('pdf');
  const [exportComplete, setExportComplete] = useState(false);
  
  // Handler for exporting data
  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsExporting(false);
    setShowExportModal(true);
  };
  
  const handleDownload = (format: string) => {
    setSelectedExportFormat(format);
    setExportComplete(true);
    
    // Simulate download completion
    setTimeout(() => {
      setExportComplete(false);
      setShowExportModal(false);
    }, 3000);
  };

  // Transform data for radar chart
  const brandEquityData = [
    { subject: 'Trust', value: brandMetrics.currentPeriod.brandEquity.trust, fullMark: 100 },
    { subject: 'Quality', value: brandMetrics.currentPeriod.brandEquity.quality, fullMark: 100 },
    { subject: 'Innovation', value: brandMetrics.currentPeriod.brandEquity.innovation, fullMark: 100 },
    { subject: 'Value', value: brandMetrics.currentPeriod.brandEquity.value, fullMark: 100 },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-white border-r border-gray-100 flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center">
            <img src="/logo.svg" alt="The Write Company" className="h-8" />
            <span className="ml-2 text-lg font-sora font-semibold hidden md:block">The Write Company</span>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a href="/home" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Home</span>
              </a>
            </li>
            <li>
              <a href="/campaigns" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Campaigns</span>
              </a>
            </li>
            <li>
              <a href="/content-testing" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Content Testing</span>
              </a>
            </li>
            <li>
              <a href="/brand-lift" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Brand Lift</span>
              </a>
            </li>
            <li>
              <a href="/brand-health" className="flex items-center p-2 bg-blue-50 text-blue-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Brand Health</span>
              </a>
            </li>
            <li>
              <a href="/notifications" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Notifications</span>
              </a>
            </li>
            <li>
              <a href="/social-listening" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Social Listening</span>
              </a>
            </li>
            <li>
              <a href="/reports" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Reports</span>
              </a>
            </li>
            <li>
              <a href="/settings" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Settings</span>
              </a>
            </li>
            <li>
              <a href="/help" className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="ml-3 hidden md:block font-work-sans text-sm">Help</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        {/* Top navigation bar */}
        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-sora font-semibold">Brand Health Monitoring</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">EA</span>
            </div>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
              <button 
                onClick={() => setShowExportModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              
              {exportComplete ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sora">Export Complete</h3>
                  <p className="text-gray-600 mb-6 font-work-sans">Your {selectedExportFormat.toUpperCase()} report has been generated successfully.</p>
                  <button 
                    className="px-4 py-2 bg-var(--accent-color) text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Download Report
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sora">Export Brand Health Report</h3>
                  <p className="text-gray-600 mb-6 font-work-sans">Choose from the available formats below:</p>
                  
                  <div className="space-y-3">
                    <div 
                      onClick={() => handleDownload('pdf')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                        <DocumentTextIcon className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Complete Brand Health Analysis</h4>
                        <p className="text-sm text-gray-500">Comprehensive report with all metrics and insights</p>
                      </div>
                      <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">PDF</div>
                    </div>
                    
                    <div 
                      onClick={() => handleDownload('pptx')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <PresentationChartBarIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Executive Summary</h4>
                        <p className="text-sm text-gray-500">Key highlights for executive stakeholders</p>
                      </div>
                      <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">PPTX</div>
                    </div>
                    
                    <div 
                      onClick={() => handleDownload('csv')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <TableCellsIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Raw Data Export</h4>
                        <p className="text-sm text-gray-500">Raw metrics for custom analysis</p>
                      </div>
                      <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">CSV</div>
                    </div>
                    
                    <div 
                      onClick={() => handleDownload('xlsx')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <ChartBarIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Competitor Analysis</h4>
                        <p className="text-sm text-gray-500">Detailed competitive benchmarking</p>
                      </div>
                      <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">XLSX</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="p-6">
          {/* Header Section with description and export button */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-gray-500 font-work-sans mb-1">
                Sentiment across brand activity in your campaigns: measurements prioritize the net positive brand mentions.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-var(--accent-color) focus:border-transparent font-work-sans text-sm"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last Quarter</option>
                <option value="1y">Last Year</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center px-5 py-2.5 bg-var(--accent-color) text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm hover:shadow-md text-sm font-medium"
              >
                {isExporting ? (
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                )}
                Export
              </motion.button>
            </div>
          </div>

          {/* Main Dashboard Grid - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Sentiment Score */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-sora">Overall Sentiment Score</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 bg-white font-work-sans">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last Quarter</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900 font-sora">{brandMetrics.currentPeriod.sentiment.positive}</span>
                      <span className="text-4xl font-bold text-gray-400 font-sora">/100</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium mt-1 flex items-center">
                      <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      +4% from previous period
                    </span>
                  </div>
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: brandMetrics.currentPeriod.sentiment.positive },
                            { name: 'Neutral', value: brandMetrics.currentPeriod.sentiment.neutral },
                            { name: 'Negative', value: brandMetrics.currentPeriod.sentiment.negative },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={50}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill="#4F46E5" />
                          <Cell fill="#E2E8F0" />
                          <Cell fill="#EF4444" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                      <span className="text-sm font-semibold text-gray-700">Positive</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{brandMetrics.currentPeriod.sentiment.positive}%</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                      <span className="text-sm font-semibold text-gray-700">Neutral</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{brandMetrics.currentPeriod.sentiment.neutral}%</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm font-semibold text-gray-700">Negative</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{brandMetrics.currentPeriod.sentiment.negative}%</span>
                  </div>
                </div>
              </div>

              {/* Sentiment Over Time */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-sora">Sentiment Over Time</h3>
                  <div className="flex space-x-2">
                    <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">Daily</button>
                    <button className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">Weekly</button>
                    <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">Monthly</button>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={brandMetrics.historical.weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="sentiment" 
                        stroke="#4F46E5" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: "#4F46E5" }} 
                        name="Positive" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="nps" 
                        stroke="#9CA3AF" 
                        strokeWidth={2} 
                        dot={{ r: 3, fill: "#9CA3AF" }} 
                        name="Neutral" 
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Mentions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-sora">Top Mentions</h3>
                  <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 bg-white font-work-sans">
                    <option>All Platforms</option>
                    <option>Twitter</option>
                    <option>LinkedIn</option>
                    <option>News</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {/* Sample mentions */}
                  <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">@TechAnalyst</span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm text-gray-500">2 days ago</span>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Positive</span>
                        </div>
                        <p className="mt-1 text-gray-700">The new Enterprise AI integration from @TheWriteCompany is impressive - finally a tool that genuinely helps content teams be more productive! #productivity #AI</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="flex items-center mr-4">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            256
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            42
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">Sarah Johnson, Content Director</span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm text-gray-500">3 days ago</span>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Positive</span>
                        </div>
                        <p className="mt-1 text-gray-700">Just implemented @TheWriteCompany's brand health monitoring tools across our marketing department. The insights are helping us pivot our messaging strategy in real-time. Highly recommend for enterprise marketing teams.</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="flex items-center mr-4">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            187
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            32
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                    View all mentions
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Sentiment by Platform */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 font-sora mb-4">Sentiment by Platform</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">Twitter</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">LinkedIn</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">82%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "82%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">Facebook</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7.826 10.083a.784.784 0 0 0-.468-.175h-.701v4.198h.701a.786.786 0 0 0 .469-.175c.155-.117.233-.292.233-.525v-2.798c.001-.233-.079-.408-.234-.525zM19.4 3H4.6C3.714 3 3 3.714 3 4.6v14.8c0 .884.715 1.6 1.6 1.6h14.8c.884 0 1.6-.715 1.6-1.6V4.6c0-.886-.716-1.6-1.6-1.6zm-9.583 8.583h-1.11v3.758H7.67v-3.758H6.5V10.5h3.317v1.083zm2.15 3.767h-.942v-.525c-.09.34-.374.609-.847.609-.275 0-.492-.09-.642-.258-.225-.225-.308-.617-.308-1.125v-2.983h.941v2.708c0 .406.067.542.367.542.3 0 .434-.208.434-.542V10h.942v5.35h.055zm3.191-1.85c0 .566-.108.967-.333 1.208-.225.25-.567.367-.967.367-.417 0-.75-.125-.25-.25-.333-.642-.333-1.208v-1.85c0-.567.108-.967.333-1.208.225-.242.55-.367.967-.367.4 0 .742.125.967.367.225.25.333.642.333 1.208v1.85zm2.267-2.175c0-.333-.083-.583-.25-.75a.937.937 0 0 0-.65-.25c-.4 0-.733.158-.925.483v-1.95h-.941v6.708h.941v-.391c.192.325.525.483.925.483.284 0 .5-.083.65-.25.167-.167.25-.417.25-.75v-3.333z"/>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">YouTube</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
              </div>

              {/* Competitor Benchmarking */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 font-sora mb-4">Competitor Benchmarking</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={brandMetrics.competitors}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                      <RechartsTooltip />
                      <Bar dataKey="sentiment" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div>
                      <span className="text-xs text-gray-500 block">Overall Position</span>
                      <span className="text-lg font-bold text-gray-900">#1 in Sentiment</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">Ahead by</span>
                      <span className="text-lg font-bold text-green-600">+8%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mentions Count */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 font-sora mb-4">Mentions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Total Mentions</h4>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900 mr-2">24,521</span>
                      <span className="text-sm text-green-600 font-medium">+12%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Positive</h4>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900 mr-2">18,391</span>
                      <span className="text-sm text-green-600 font-medium">+15%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Neutral</h4>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900 mr-2">4,904</span>
                      <span className="text-sm text-yellow-600 font-medium">+5%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Negative</h4>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900 mr-2">1,226</span>
                      <span className="text-sm text-red-600 font-medium">+2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Track Competition Section */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-sora">Track Competition</h3>
                <p className="text-sm text-gray-500 font-work-sans">Monitor your brand performance against key competitors</p>
              </div>
              <div className="flex space-x-4">
                <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 bg-white font-work-sans">
                  <option>All Regions</option>
                  <option>North America</option>
                  <option>Europe</option>
                  <option>Asia Pacific</option>
                </select>
                <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 bg-white font-work-sans">
                  <option>Last Quarter</option>
                  <option>Last 6 Months</option>
                  <option>Year to Date</option>
                  <option>Last Year</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Market Share Trends */}
              <div>
                <h4 className="text-base font-medium text-gray-800 mb-4">Market Share Trends</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={brandMetrics.historical.quarterly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 40]} axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <RechartsLegend />
                      <Line 
                        type="monotone" 
                        dataKey="marketShare" 
                        stroke="#4F46E5" 
                        strokeWidth={3} 
                        dot={{ r: 4 }} 
                        name="Your Brand" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="competitorShare1" 
                        stroke="#EC4899" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        name="Competitor A" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="competitorShare2" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        name="Competitor B" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Share of Voice Comparison */}
              <div>
                <h4 className="text-base font-medium text-gray-800 mb-4">Share of Voice</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { channel: 'Twitter', you: 42, competitorA: 30, competitorB: 25 },
                        { channel: 'LinkedIn', you: 58, competitorA: 40, competitorB: 28 },
                        { channel: 'Industry News', you: 45, competitorA: 50, competitorB: 35 },
                        { channel: 'Forums', you: 30, competitorA: 25, competitorB: 40 },
                        { channel: 'YouTube', you: 35, competitorA: 30, competitorB: 20 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="channel" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <RechartsLegend />
                      <Bar dataKey="you" fill="#4F46E5" name="Your Brand" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="competitorA" fill="#EC4899" name="Competitor A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="competitorB" fill="#10B981" name="Competitor B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Position vs Competitors</h5>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 mr-2">#1</span>
                  <span className="text-sm text-green-600 font-medium">Leader in 3 of 5 channels</span>
                </div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Growth Rate Difference</h5>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 mr-2">+12%</span>
                  <span className="text-sm text-green-600 font-medium">vs competitor average</span>
                </div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Brand Strength Index</h5>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 mr-2">72/100</span>
                  <span className="text-sm text-green-600 font-medium">+4 pts this quarter</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Insights Section */}
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 font-sora">AI-Powered Strategic Insights</h3>
                <ul className="space-y-3 font-work-sans">
                  <li className="flex items-start">
                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Your brand sentiment is consistently higher on LinkedIn (82%) than other platforms. Consider shifting more resources to this channel for enterprise messaging.</span>
                  </li>
                  <li className="flex items-start">
                    <UserGroupIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Product announcements receive 3.2x more positive engagement than industry news. Recommend incorporating more product-focused content in your social media mix.</span>
                  </li>
                  <li className="flex items-start">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Competitor B is gaining traction in Forums (40% share of voice). Consider strengthening your presence in developer and technical communities.</span>
                  </li>
                  <li className="flex items-start">
                    <ChartBarIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Your recent Enterprise AI campaign drove a 15% increase in positive mentions. This messaging resonates strongly with your target audience.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300"
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
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <div className="flex items-baseline">
      <p className="text-3xl font-bold text-gray-900">
        {format === "percent" ? `${value}%` : format === "number" ? value.toLocaleString() : value}
      </p>
    </div>
    {description && (
      <p className="mt-2 text-sm text-gray-500">{description}</p>
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
    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="bg-blue-50 p-3 rounded-lg mr-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
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
  // State for filters
  const [dateRange, setDateRange] = useState("7d");
  const [selectedChannels, setSelectedChannels] = useState(["all"]);
  const [isExporting, setIsExporting] = useState(false);

  // Handler for exporting data
  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    // In real app, implement actual export functionality
    alert("Report exported successfully!");
  };

  // Transform data for radar chart
  const brandEquityData = [
    { subject: 'Trust', value: brandMetrics.currentPeriod.brandEquity.trust, fullMark: 100 },
    { subject: 'Quality', value: brandMetrics.currentPeriod.brandEquity.quality, fullMark: 100 },
    { subject: 'Innovation', value: brandMetrics.currentPeriod.brandEquity.innovation, fullMark: 100 },
    { subject: 'Value', value: brandMetrics.currentPeriod.brandEquity.value, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Brand Health Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500"
            >
              Real-time insights and analytics for your brand's performance
            </motion.p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isExporting ? (
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              )}
              Export Report
            </motion.button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Overall Brand Score"
            value={brandMetrics.currentPeriod.overallScore}
            trend={brandMetrics.currentPeriod.trend}
            icon={SparklesIcon}
            description="Composite score based on sentiment, engagement, and awareness"
            format="percent"
          />
          <MetricCard
            title="Brand Sentiment"
            value={brandMetrics.currentPeriod.sentiment.positive}
            trend={`+${brandMetrics.currentPeriod.sentiment.positive - brandMetrics.historical.weekly[0].sentiment}%`}
            icon={HeartIcon}
            description="Percentage of positive brand mentions"
            format="percent"
          />
          <MetricCard
            title="Market Share"
            value={brandMetrics.currentPeriod.marketShare}
            trend={brandMetrics.currentPeriod.marketShareGrowth}
            icon={ChartPieIcon}
            description="Your brand's market share in the target segment"
            format="percent"
          />
          <MetricCard
            title="Brand Value"
            value={brandMetrics.currentPeriod.brandValue / 1000000}
            trend={brandMetrics.currentPeriod.brandValueGrowth}
            icon={CurrencyDollarIcon}
            description="Estimated brand value in millions"
            format="currency"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Equity Analysis */}
          <RadarChartCard
            title="Brand Equity Analysis"
            description="Key brand perception metrics"
            icon={ChartPieIcon}
            data={brandEquityData}
          />

          {/* Market Performance */}
          <ChartCard
            title="Market Performance"
            description="Revenue and market share trends"
            icon={CurrencyDollarIcon}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={brandMetrics.historical.quarterly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <RechartsLegend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue (M)" />
                  <Line yAxisId="right" type="monotone" dataKey="marketShare" stroke="#10b981" name="Market Share %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Customer Segments */}
          <ChartCard
            title="Customer Segments"
            description="Performance across customer segments"
            icon={UserGroupIcon}
          >
            <div className="space-y-4">
              {brandMetrics.audience.segments.map((segment, index) => (
                <SegmentCard key={index} segment={segment} />
              ))}
            </div>
          </ChartCard>

          {/* Risk Analysis */}
          <ChartCard
            title="Risk Analysis"
            description="Current risk levels and trends"
            icon={ShieldCheckIcon}
          >
            <div className="space-y-4">
              {brandMetrics.risks.map((risk, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{risk.category}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      risk.level > 15 ? 'bg-red-100 text-red-800' :
                      risk.level > 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Risk Level: {risk.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{risk.mitigation}</p>
                  <div className="flex items-center text-sm">
                    <span className={`font-medium ${
                      risk.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {risk.trend}
                    </span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-500">Impact: {risk.impact}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Channel Performance */}
          <ChartCard
            title="Channel Performance"
            description="Engagement and growth across social platforms"
            icon={DocumentChartBarIcon}
          >
            <div className="space-y-4">
              {brandMetrics.channels.map((channel, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{channel.name}</h4>
                    <p className="text-sm text-gray-500">
                      {channel.engagement.toLocaleString()} engagements
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{channel.performance}%</p>
                    <p className={`text-sm ${
                      channel.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {channel.growth}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Campaign Performance */}
          <ChartCard
            title="Campaign Performance"
            description="Active campaign metrics and ROI"
            icon={RocketLaunchIcon}
          >
            <div className="space-y-4">
              {brandMetrics.campaigns.map((campaign, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">ROI</p>
                      <p className="font-medium">{campaign.roi}x</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversion</p>
                      <p className="font-medium">{campaign.conversion}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Predictive Analytics Section */}
        <div className="mt-8">
          <ChartCard
            title="Predictive Analytics"
            description="AI-powered forecasts and trends"
            icon={SparklesIcon}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80">
                <h4 className="text-lg font-medium mb-4">Brand Health Forecast</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={brandMetrics.predictions.brandHealth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip />
                    <RechartsLegend />
                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" name="Predicted Score" />
                    <Line type="monotone" dataKey="confidence" stroke="#10b981" name="Confidence %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-medium mb-4">Emerging Risks</h4>
                {brandMetrics.predictions.risks.map((risk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{risk.category}</h5>
                      <span className="text-sm text-gray-500">{risk.timeframe}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Probability</p>
                        <p className="font-medium">{risk.probability}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Impact</p>
                        <p className="font-medium">{risk.impact}/10</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Strategic Insights</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <ArrowTrendingUpIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-1" />
                  <span>Brand value has grown by {brandMetrics.currentPeriod.brandValueGrowth} this quarter, driven by strong performance in enterprise segments.</span>
                </li>
                <li className="flex items-start">
                  <UserGroupIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-1" />
                  <span>Enterprise segment shows highest LTV at ${brandMetrics.audience.segments[0].lifetime_value.toLocaleString()}, recommend increasing focus on this segment.</span>
                </li>
                <li className="flex items-start">
                  <ShieldCheckIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-1" />
                  <span>Emerging competitive risk detected in Q3 2024. Consider accelerating innovation pipeline.</span>
                </li>
                <li className="flex items-start">
                  <ChartBarIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-1" />
                  <span>Digital channels showing highest ROI at {brandMetrics.currentPeriod.roi.byChannel.digital}x. Opportunity to optimize budget allocation.</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

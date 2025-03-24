"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter } from "recharts";
import { Icon } from '@/components/ui/icon';
import { iconComponentFactory } from '@/components/ui/icons';

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
      value: 88
    },
    nps: {
      overall: 65,
      bySegment: {
        enterprise: 72,
        midMarket: 68,
        smallBusiness: 61
      },
      trend: "+2"
    },
    marketShare: 28.5,
    marketShareGrowth: "+1.5%",
    categoryGrowth: 4.2,
    pricePremium: 15,
    distribution: {
      coverage: 92,
      effectiveness: 87
    },
    sentiment: {
      positive: 72,
      neutral: 20,
      negative: 8,
      byChannel: {
        social: 75,
        news: 82,
        reviews: 78
      }
    },
    engagement: {
      total: 250000,
      growth: "+12%",
      byChannel: {
        website: 120000,
        social: 85000,
        email: 35000,
        events: 10000
      }
    },
    revenue: {
      attributed: 75000000,
      growth: "+15%",
      byChannel: {
        direct: 45000000,
        indirect: 20000000,
        digital: 10000000
      }
    },
    roi: {
      overall: 3.8,
      byChannel: {
        digital: 4.2,
        traditional: 2.8,
        events: 3.5
      }
    },
    customerAcquisition: {
      cost: 1200,
      rate: 12.5,
      trend: "-5%"
    },
    customerRetention: {
      rate: 85,
      trend: "+2%",
      bySegment: {
        enterprise: 92,
        midMarket: 85,
        smallBusiness: 78
      }
    },
    digitalScore: {
      overall: 82,
      seo: 85,
      social: 88,
      content: 79
    },
    riskScore: {
      overall: 15,
      sentiment: 12,
      media: 18,
      social: 14
    }
  },
  historical: {
    weekly: [{
      date: "Week 1",
      score: 80,
      engagement: 220000,
      sentiment: 68,
      awareness: 74,
      revenue: 15000000,
      marketShare: 27.8,
      nps: 63
    }, {
      date: "Week 2",
      score: 82,
      engagement: 230000,
      sentiment: 70,
      awareness: 75,
      revenue: 16500000,
      marketShare: 28.1,
      nps: 64
    }, {
      date: "Week 3",
      score: 83,
      engagement: 240000,
      sentiment: 71,
      awareness: 76,
      revenue: 17200000,
      marketShare: 28.3,
      nps: 64
    }, {
      date: "Week 4",
      score: 85,
      engagement: 250000,
      sentiment: 72,
      awareness: 78,
      revenue: 18500000,
      marketShare: 28.5,
      nps: 65
    }],
    quarterly: [{
      period: "Q1",
      brandValue: 1150000000,
      marketShare: 27.5,
      revenue: 65000000,
      roi: 3.5,
      customerRetention: 83
    }, {
      period: "Q2",
      brandValue: 1200000000,
      marketShare: 28.0,
      revenue: 70000000,
      roi: 3.6,
      customerRetention: 84
    }, {
      period: "Q3",
      brandValue: 1250000000,
      marketShare: 28.5,
      revenue: 75000000,
      roi: 3.8,
      customerRetention: 85
    }]
  },
  competitors: [{
    name: "Our Brand",
    sentiment: 72,
    engagement: 250000,
    shareOfVoice: 52,
    awareness: 78,
    marketShare: 28.5,
    digitalPresence: 82,
    pricing: {
      premium: 15,
      positioning: "Premium"
    },
    strengths: ["Innovation", "Customer Service", "Brand Trust"],
    weaknesses: ["Price Point", "Regional Coverage"]
  }, {
    name: "Competitor A",
    sentiment: 64,
    engagement: 220000,
    shareOfVoice: 44,
    awareness: 70,
    marketShare: 25.5,
    digitalPresence: 75,
    pricing: {
      premium: 10,
      positioning: "Premium"
    },
    strengths: ["Price Point", "Distribution"],
    weaknesses: ["Innovation", "Digital Presence"]
  }, {
    name: "Competitor B",
    sentiment: 52,
    engagement: 180000,
    shareOfVoice: 35,
    awareness: 65,
    marketShare: 22.0,
    digitalPresence: 68,
    pricing: {
      premium: 5,
      positioning: "Value"
    },
    strengths: ["Price Point", "Market Coverage"],
    weaknesses: ["Brand Perception", "Product Quality"]
  }],
  audience: {
    segments: [{
      name: "Enterprise",
      size: 2500,
      growth: "+5%",
      engagement: 85,
      sentiment: 72,
      lifetime_value: 250000
    }, {
      name: "Mid-Market",
      size: 12000,
      growth: "+8%",
      engagement: 78,
      sentiment: 68,
      lifetime_value: 75000
    }, {
      name: "Small Business",
      size: 45000,
      growth: "+12%",
      engagement: 72,
      sentiment: 65,
      lifetime_value: 15000
    }],
    demographics: [{
      category: "Industry",
      distribution: [{
        label: "Technology",
        value: 35
      }, {
        label: "Finance",
        value: 25
      }, {
        label: "Healthcare",
        value: 20
      }, {
        label: "Retail",
        value: 15
      }, {
        label: "Other",
        value: 5
      }]
    }],
    journey: {
      awareness: 78,
      consideration: 45,
      preference: 35,
      purchase: 12,
      loyalty: 85
    }
  },
  channels: [{
    name: "Website",
    performance: 88,
    growth: "+7.5%",
    engagement: 120000,
    roi: 4.2,
    sentiment: 85,
    reach: 500000,
    conversion: 2.8
  }, {
    name: "LinkedIn",
    performance: 82,
    growth: "+5.5%",
    engagement: 40000,
    roi: 3.8,
    sentiment: 82,
    reach: 250000,
    conversion: 1.8
  }, {
    name: "Email",
    performance: 75,
    growth: "+3.2%",
    engagement: 35000,
    roi: 4.5,
    sentiment: 78,
    reach: 150000,
    conversion: 3.2
  }],
  campaigns: [{
    name: "Enterprise Solutions Launch",
    status: "Active",
    reach: 250000,
    engagement: 85000,
    conversion: 2.8,
    roi: 4.2,
    sentiment: 85,
    budget: 500000,
    start_date: "2024-01-01",
    end_date: "2024-03-31"
  }],
  content: {
    performance: [{
      type: "Whitepapers",
      engagement: 15000,
      reach: 75000,
      conversion: 3.5,
      sentiment: 85
    }, {
      type: "Case Studies",
      engagement: 12000,
      reach: 60000,
      conversion: 4.2,
      sentiment: 88
    }, {
      type: "Blog Posts",
      engagement: 25000,
      reach: 150000,
      conversion: 1.8,
      sentiment: 82
    }],
    trending: [{
      title: "Digital Transformation Guide",
      type: "Whitepaper",
      engagement: 5000,
      sentiment: 88
    }, {
      title: "ROI Calculator",
      type: "Tool",
      engagement: 4500,
      sentiment: 92
    }]
  },
  risks: [{
    category: "Competitive",
    level: 15,
    trend: "-2",
    impact: 8,
    mitigation: "Innovation pipeline acceleration"
  }, {
    category: "Market",
    level: 12,
    trend: "+1",
    impact: 7,
    mitigation: "Market diversification strategy"
  }, {
    category: "Reputation",
    level: 8,
    trend: "-1",
    impact: 9,
    mitigation: "Proactive PR campaign"
  }],
  predictions: {
    brandHealth: [{
      date: "2024-Q2",
      predicted: 87,
      confidence: 85
    }, {
      date: "2024-Q3",
      predicted: 89,
      confidence: 80
    }, {
      date: "2024-Q4",
      predicted: 90,
      confidence: 75
    }],
    marketShare: [{
      date: "2024-Q2",
      predicted: 29.2,
      confidence: 85
    }, {
      date: "2024-Q3",
      predicted: 29.8,
      confidence: 80
    }, {
      date: "2024-Q4",
      predicted: 30.5,
      confidence: 75
    }],
    risks: [{
      category: "Market Disruption",
      probability: 25,
      impact: 8,
      timeframe: "6-12 months"
    }, {
      category: "Competitive Entry",
      probability: 35,
      impact: 7,
      timeframe: "3-6 months"
    }]
  }
};

// Remove the conflicting type declaration
// type IconName = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'none';
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  format?: 'number' | 'percent' | 'currency';
}
interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconName?: IconName;
  actions?: React.ReactNode;
}

// Component for displaying hashtag metrics
interface HashtagMetricProps {
  tag: string;
  reach: string;
  engagement: string;
  sentiment: number;
}
const HashtagMetric: React.FC<HashtagMetricProps> = ({
  tag,
  reach,
  engagement,
  sentiment
}) => <div className="p-4 border rounded-lg hover:bg-gray-50 font-work-sans">
    <div className="flex items-center justify-between mb-2 font-work-sans">
      <h4 className="font-medium text-gray-900 font-sora">{tag}</h4>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sentiment >= 85 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} font-work-sans`}>
        {sentiment}% Positive
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm font-work-sans">
      <div className="font-work-sans">
        <p className="text-gray-500 font-work-sans">Reach</p>
        <p className="font-medium font-work-sans">{reach}</p>
    </div>
      <div className="font-work-sans">
        <p className="text-gray-500 font-work-sans">Engagement</p>
        <p className="font-medium font-work-sans">{engagement}</p>
    </div>
    </div>
  </div>;

// Reusable Components
const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  format
}: MetricCardProps) => {
  const formattedValue = useMemo(() => {
    if (format === 'percent') return `${value}%`;
    if (format === 'currency') return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  }, [value, format]);
  return <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 font-work-sans">
      <div className="flex items-center mb-4 font-work-sans">
        <div className="bg-[var(--background-color)] bg-opacity-50 p-3 rounded-lg font-work-sans">
          {icon ? icon({
          className: "w-6 h-6 text-[var(--accent-color)]"
        }) : <Icon name="faInfo" className="w-6 h-6 text-[var(--accent-color)] font-work-sans" solid={false} />}
        </div>
        <h3 className="text-lg font-semibold ml-3 font-sora">{title}</h3>
      </div>
      <div className="flex items-baseline justify-between font-work-sans">
        <span className="text-3xl font-bold font-work-sans">{formattedValue}</span>
        {change !== undefined && <div className={`flex items-center ${changeType === 'increase' ? 'text-green-500' : changeType === 'decrease' ? 'text-red-500' : 'text-gray-500'} font-work-sans`}>
            {changeType === 'increase' ? <Icon name="faArrowUp" className="w-4 h-4" solid={false} /> : changeType === 'decrease' ? <Icon name="faArrowDown" className="w-4 h-4" solid={false} /> : <Icon name="faMinus" className="w-4 h-4" solid={false} />}
            <span className="text-sm font-medium font-work-sans">{Math.abs(change)}%</span>
          </div>}
      </div>
    </div>;
};
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  icon: Icon,
  iconName,
  actions
}) => <motion.div initial={{
  opacity: 0,
  y: 20
}} animate={{
  opacity: 1,
  y: 0
}} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300" style={{
  border: '1px solid var(--divider-color)'
}}>

    <div className="flex items-center justify-between mb-6 font-work-sans">
      <div className="flex items-center font-work-sans">
        <div className="rounded-lg mr-4 p-3 font-work-sans" style={{
        backgroundColor: 'rgba(0, 191, 255, 0.1)'
      }}>
          <Icon className="w-6 h-6" style={{
          color: 'var(--accent-color)'
        }} solid={false} />
        </div>
        <div className="font-work-sans">
          <h3 className="text-lg font-semibold font-sora" style={{
          color: 'var(--primary-color)'
        }}>{title}</h3>
          {description && <p className="text-sm font-work-sans" style={{
          color: 'var(--secondary-color)'
        }}>{description}</p>}
        </div>
      </div>
      {actions && <div className="flex space-x-2 font-work-sans">
          {actions}
        </div>}
    </div>
    {children}
  </motion.div>;

// Additional component interfaces
interface RadarChartCardProps {
  title: string;
  description?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
const RadarChartCard: React.FC<RadarChartCardProps> = ({
  title,
  description,
  icon: Icon,
  data
}) => <ChartCard title={title} description={description} icon={Icon}>
    <div className="h-80 font-work-sans">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Brand Score" dataKey="value" stroke="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
  </div>
  </ChartCard>;
const SegmentCard: React.FC<SegmentCardProps> = ({
  segment
}) => <div className="p-4 border rounded-lg hover:bg-gray-50 font-work-sans">
    <div className="flex items-center justify-between mb-4 font-work-sans">
      <h4 className="font-medium text-gray-900 font-sora">{segment.name}</h4>
      <span className="text-sm text-green-600 font-medium font-work-sans">{segment.growth}</span>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm font-work-sans">
      <div className="font-work-sans">
        <p className="text-gray-500 font-work-sans">Size</p>
        <p className="font-medium font-work-sans">{segment.size.toLocaleString()}</p>
      </div>
      <div className="font-work-sans">
        <p className="text-gray-500 font-work-sans">LTV</p>
        <p className="font-medium font-work-sans">${segment.lifetime_value.toLocaleString()}</p>
      </div>
      <div className="font-work-sans">
        <p className="text-gray-500 font-work-sans">Engagement</p>
        <p className="font-medium font-work-sans">{segment.engagement}%</p>
      </div>
      <div className="font-work-sans">
        <p className="text-gray-500 font-work-sans">Sentiment</p>
        <p className="font-medium font-work-sans">{segment.sentiment}%</p>
      </div>
    </div>
  </div>;

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
    await new Promise((resolve) => setTimeout(resolve, 1500));
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
  const brandEquityData = [{
    subject: 'Trust',
    value: brandMetrics.currentPeriod.brandEquity.trust,
    fullMark: 100
  }, {
    subject: 'Quality',
    value: brandMetrics.currentPeriod.brandEquity.quality,
    fullMark: 100
  }, {
    subject: 'Innovation',
    value: brandMetrics.currentPeriod.brandEquity.innovation,
    fullMark: 100
  }, {
    subject: 'Value',
    value: brandMetrics.currentPeriod.brandEquity.value,
    fullMark: 100
  }];
  return <div className="min-h-screen bg-white font-work-sans">
      {/* Export Modal */}
      {showExportModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-work-sans">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative font-work-sans">
            <button onClick={() => setShowExportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-work-sans">

              <Icon name="faClose" className="w-5 h-5" solid={false} />
            </button>
            
            {exportComplete ? <div className="text-center py-6 font-work-sans">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 font-work-sans">
                  <Icon name="faCheck" className="w-8 h-8 text-green-600 font-work-sans" solid={false} />
                </div>
                <h3 className="text-xl font-semibold text-var(--primary-color) mb-2 font-sora">Export Complete</h3>
                <p className="text-var(--secondary-color) mb-6 font-work-sans">Your {selectedExportFormat.toUpperCase()} report has been generated successfully.</p>
                <button className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-work-sans font-medium flex items-center text-sm" style={{
            backgroundColor: 'var(--accent-color)'
          }}>

                  {isExporting ? <>
                      <Icon name="faArrowRight" className="w-4 h-4 mr-2 animate-spin" solid={false} />
                      Exporting...
                    </> : <>
                      <Icon name="faArrowDown" className="w-4 h-4 mr-2" solid={false} />
                      Export
                    </>}
                </button>
              </div> : <>
                <h3 className="text-xl font-semibold text-var(--primary-color) mb-2 font-sora">Export Brand Health Report</h3>
                <p className="text-var(--secondary-color) mb-6 font-work-sans">Choose from the available formats below:</p>
                
                <div className="space-y-3 font-work-sans">
                  <div onClick={() => handleDownload('pdf')} className="flex items-center p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>

                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-work-sans" style={{
                backgroundColor: 'rgba(0, 191, 255, 0.1)'
              }}>
                      <Icon name="faDocumentText" className="w-6 h-6" style={{
                  color: 'var(--accent-color)'
                }} solid={false} />
                    </div>
                    <div className="flex-1 font-work-sans">
                      <h4 className="font-medium font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Complete Brand Health Analysis</h4>
                      <p className="text-sm font-work-sans" style={{
                  color: 'var(--secondary-color)'
                }}>Comprehensive report with all metrics and insights</p>
                    </div>
                  </div>
                  
                  <div onClick={() => handleDownload('pptx')} className="flex items-center p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>

                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-work-sans" style={{
                backgroundColor: 'rgba(0, 191, 255, 0.1)'
              }}>
                      <Icon name="faPresentationChartBar" className="w-6 h-6" style={{
                  color: 'var(--accent-color)'
                }} solid={false} />
                    </div>
                    <div className="flex-1 font-work-sans">
                      <h4 className="font-medium font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Executive Summary</h4>
                      <p className="text-sm font-work-sans" style={{
                  color: 'var(--secondary-color)'
                }}>Key highlights for executive stakeholders</p>
                    </div>
                  </div>
                  
                  <div onClick={() => handleDownload('csv')} className="flex items-center p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>

                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-work-sans" style={{
                backgroundColor: 'rgba(0, 191, 255, 0.1)'
              }}>
                      <Icon name="faTableCells" className="w-6 h-6" style={{
                  color: 'var(--accent-color)'
                }} solid={false} />
                    </div>
                    <div className="flex-1 font-work-sans">
                      <h4 className="font-medium font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Raw Data Export</h4>
                      <p className="text-sm font-work-sans" style={{
                  color: 'var(--secondary-color)'
                }}>Raw metrics for custom analysis</p>
                    </div>
                  </div>
                  
                  <div onClick={() => handleDownload('xlsx')} className="flex items-center p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>

                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-work-sans" style={{
                backgroundColor: 'rgba(0, 191, 255, 0.1)'
              }}>
                      <Icon name="faChartBar" className="w-6 h-6" style={{
                  color: 'var(--accent-color)'
                }} solid={false} />
                    </div>
                    <div className="flex-1 font-work-sans">
                      <h4 className="font-medium font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Competitor Analysis</h4>
                      <p className="text-sm font-work-sans" style={{
                  color: 'var(--secondary-color)'
                }}>Detailed competitive benchmarking</p>
                    </div>
                  </div>
                </div>
              </>}
          </div>
        </div>}

      {/* Dashboard Content */}
      <div className="p-6 md:p-8 font-work-sans">
        {/* Header */}
        <div id="overview" className="mb-10 font-work-sans">
          <div className="flex justify-between items-center mb-4 font-work-sans">
            <div className="font-work-sans">
              <h1 className="text-2xl font-semibold font-sora text-var(--primary-color)">Brand Health Monitoring</h1>
              <p className="text-var(--secondary-color) font-work-sans">Sentiment across brand activity in your campaign. Recommendations pinpoint what to amplify and where trends.</p>
            </div>
            <div className="flex items-center space-x-4 font-work-sans">
              <select className="border border-var(--divider-color) rounded-lg px-3 py-2 bg-white text-var(--secondary-color) font-work-sans text-sm focus:outline-none focus:ring-1 focus:ring-var(--accent-color)" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>

                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last Quarter</option>
                <option value="custom">Custom Range</option>
              </select>
              <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-work-sans font-medium flex items-center text-sm" style={{
              backgroundColor: 'var(--accent-color)'
            }}>

                {isExporting ? <>
                    <Icon name="faArrowRight" className="w-4 h-4 mr-2 animate-spin" solid={false} />
                    Exporting...
                  </> : <>
                    <Icon name="faArrowDown" className="w-4 h-4 mr-2" solid={false} />
                    Export
                  </>}
              </button>
            </div>
          </div>
        </div>

        {/* Track Individual Campaigns */}
        <div id="overview" className="mb-12 font-work-sans">
          {/* Main Dashboard Grid - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-work-sans">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6 font-work-sans">
              {/* Overall Sentiment Score */}
              <div id="sentiment" className="bg-white rounded-xl shadow-sm p-6 font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>
                <div className="flex justify-between items-center mb-4 font-work-sans">
                  <h3 className="text-lg font-semibold font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Brand Sentiment Overview</h3>
                  <div className="flex space-x-2 font-work-sans">
                    <select className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 bg-white font-work-sans">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last Quarter</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 font-work-sans">
                  <div className="flex flex-col font-work-sans">
                    <div className="flex items-baseline font-work-sans">
                      <span className="text-4xl font-bold font-work-sans" style={{
                      color: 'var(--primary-color)'
                    }}>{brandMetrics.currentPeriod.sentiment.positive}</span>
                      <span className="text-4xl font-bold font-work-sans" style={{
                      color: 'var(--secondary-color)'
                    }}>/100</span>
                    </div>
                    <span className="text-sm font-medium mt-1 flex items-center font-work-sans" style={{
                    color: '#22C55E'
                  }}>
                      <Icon name="faArrowUp" className="w-4 h-4 mr-1" solid={false} />
                      +4% from previous period
                    </span>
                  </div>
                  <div className="w-32 h-32 font-work-sans">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{
                        name: 'Positive',
                        value: brandMetrics.currentPeriod.sentiment.positive
                      }, {
                        name: 'Neutral',
                        value: brandMetrics.currentPeriod.sentiment.neutral
                      }, {
                        name: 'Negative',
                        value: brandMetrics.currentPeriod.sentiment.negative
                      }]} cx="50%" cy="50%" innerRadius={35} outerRadius={50} startAngle={90} endAngle={-270} dataKey="value">

                          <Cell fill="var(--accent-color)" />
                          <Cell fill="var(--divider-color)" />
                          <Cell fill="#EF4444" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 font-work-sans">
                  <div className="rounded-lg p-3 font-work-sans" style={{
                  backgroundColor: 'rgba(0, 191, 255, 0.05)'
                }}>
                    <div className="flex items-center mb-1 font-work-sans">
                      <div className="w-3 h-3 rounded-full mr-2 font-work-sans" style={{
                      backgroundColor: 'var(--accent-color)'
                    }}></div>
                      <span className="text-sm font-semibold font-work-sans" style={{
                      color: 'var(--secondary-color)'
                    }}>Positive</span>
                    </div>
                    <span className="text-xl font-bold font-work-sans" style={{
                    color: 'var(--primary-color)'
                  }}>{brandMetrics.currentPeriod.sentiment.positive}%</span>
                  </div>
                  <div className="rounded-lg p-3 font-work-sans" style={{
                  backgroundColor: 'rgba(0, 191, 255, 0.05)'
                }}>
                    <div className="flex items-center mb-1 font-work-sans">
                      <div className="w-3 h-3 rounded-full mr-2 font-work-sans" style={{
                      backgroundColor: 'var(--divider-color)'
                    }}></div>
                      <span className="text-sm font-semibold font-work-sans" style={{
                      color: 'var(--secondary-color)'
                    }}>Neutral</span>
                    </div>
                    <span className="text-xl font-bold font-work-sans" style={{
                    color: 'var(--primary-color)'
                  }}>{brandMetrics.currentPeriod.sentiment.neutral}%</span>
                  </div>
                  <div className="rounded-lg p-3 font-work-sans" style={{
                  backgroundColor: 'rgba(0, 191, 255, 0.05)'
                }}>
                    <div className="flex items-center mb-1 font-work-sans">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2 font-work-sans"></div>
                      <span className="text-sm font-semibold font-work-sans" style={{
                      color: 'var(--secondary-color)'
                    }}>Negative</span>
                    </div>
                    <span className="text-xl font-bold font-work-sans" style={{
                    color: 'var(--primary-color)'
                  }}>{brandMetrics.currentPeriod.sentiment.negative}%</span>
                  </div>
                </div>
              </div>

              {/* Sentiment Over Time */}
              <div id="sentiment" className="bg-white rounded-xl shadow-sm p-6 font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>
                <div className="flex justify-between items-center mb-4 font-work-sans">
                  <h3 className="text-lg font-semibold font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Sentiment Over Time</h3>
                  <div className="flex space-x-2 font-work-sans">
                    <button className="text-xs px-3 py-1 rounded-full font-medium font-work-sans" style={{
                    backgroundColor: 'rgba(0, 191, 255, 0.1)',
                    color: 'var(--secondary-color)'
                  }}>Daily</button>
                    <button className="text-xs px-3 py-1 rounded-full font-medium font-work-sans" style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'white'
                  }}>Weekly</button>
                    <button className="text-xs px-3 py-1 rounded-full font-medium font-work-sans" style={{
                    backgroundColor: 'rgba(0, 191, 255, 0.1)',
                    color: 'var(--secondary-color)'
                  }}>Monthly</button>
                  </div>
                </div>
                <div className="h-64 font-work-sans">
              <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={brandMetrics.historical.weekly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--divider-color)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                        <Line type="monotone" dataKey="sentiment" stroke="var(--accent-color)" strokeWidth={3} dot={{
                      r: 4,
                      fill: "var(--accent-color)"
                    }} name="Positive" />

                        <Line type="monotone" dataKey="nps" stroke="var(--secondary-color)" strokeWidth={2} dot={{
                      r: 3,
                      fill: "var(--secondary-color)"
                    }} name="Neutral" strokeDasharray="5 5" />

                      </LineChart>
              </ResponsiveContainer>
            </div>
            </div>

                {/* Top Mentions */}
                <div id="mentions" className="bg-white rounded-xl shadow-sm p-6 font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>
                  <div className="flex justify-between items-center mb-4 font-work-sans">
                    <h3 className="text-lg font-semibold font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Top Mentions</h3>
                    <button className="text-sm font-medium font-work-sans flex items-center" style={{
                  color: 'var(--accent-color)'
                }}>
                      View All 
                      <Icon name="faChevronRight" className="w-4 h-4 ml-1" solid={false} />
                    </button>
                  </div>
            <div className="space-y-4 font-work-sans">
                    {/* Sample mentions */}
                    <div className="p-4 rounded-lg hover:bg-gray-50 transition-colors font-work-sans" style={{
                  border: '1px solid var(--divider-color)'
                }}>
                      <div className="flex items-start font-work-sans">
                        <div className="flex-shrink-0 mr-3 font-work-sans">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-work-sans" style={{
                        backgroundColor: 'rgba(0, 191, 255, 0.1)'
                      }}>
                            <Icon name="faCheck" className="w-6 h-6" solid={false} />
                          </div>
                        </div>
                        <div className="flex-1 font-work-sans">
                          <div className="flex items-center justify-between font-work-sans">
                            <div className="flex items-center font-work-sans">
                              <span className="font-medium font-work-sans" style={{
                            color: 'var(--primary-color)'
                          }}>@TechAnalyst</span>
                              <span className="mx-2 text-gray-500 font-work-sans">•</span>
                              <span className="text-sm font-work-sans" style={{
                            color: 'var(--secondary-color)'
                          }}>2 days ago</span>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium rounded-full font-work-sans" style={{
                          backgroundColor: 'rgba(0, 191, 255, 0.1)',
                          color: 'var(--accent-color)'
                        }}>Positive</span>
                          </div>
                          <p className="mt-1 font-work-sans" style={{
                        color: 'var(--secondary-color)'
                      }}>The new Enterprise AI integration from @TheWriteCompany is impressive - finally a tool that genuinely helps content teams be more productive! #productivity #AI</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500 font-work-sans">
                            <span className="flex items-center mr-4 font-work-sans">
                              <Icon name="faCheck" className="w-4 h-4 mr-1" solid={false} />
                              256
                    </span>
                            <span className="flex items-center font-work-sans">
                              <Icon name="faUserGroup" className="w-4 h-4 mr-1" solid={false} />
                              42
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg hover:bg-gray-50 transition-colors font-work-sans" style={{
                  border: '1px solid var(--divider-color)'
                }}>
                      <div className="flex items-start font-work-sans">
                        <div className="flex-shrink-0 mr-3 font-work-sans">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-work-sans" style={{
                        backgroundColor: 'rgba(0, 191, 255, 0.1)'
                      }}>
                            <Icon name="faCheck" className="w-6 h-6" solid={false} />
                          </div>
                        </div>
                        <div className="flex-1 font-work-sans">
                          <div className="flex items-center justify-between font-work-sans">
                            <div className="flex items-center font-work-sans">
                              <span className="font-medium font-work-sans" style={{
                            color: 'var(--primary-color)'
                          }}>Sarah Johnson, Content Director</span>
                    <span className="mx-2 text-gray-500 font-work-sans">•</span>
                              <span className="text-sm font-work-sans" style={{
                            color: 'var(--secondary-color)'
                          }}>3 days ago</span>
                  </div>
                            <span className="px-2 py-1 text-xs font-medium rounded-full font-work-sans" style={{
                          backgroundColor: 'rgba(0, 191, 255, 0.1)',
                          color: 'var(--accent-color)'
                        }}>Positive</span>
                </div>
                          <p className="mt-1 font-work-sans" style={{
                        color: 'var(--secondary-color)'
                      }}>Just implemented @TheWriteCompany&apos;s brand health monitoring tools across our marketing department. The insights are helping us pivot our messaging strategy in real-time. Highly recommend for enterprise marketing teams.</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500 font-work-sans">
                            <span className="flex items-center mr-4 font-work-sans">
                              <Icon name="faCheck" className="w-4 h-4 mr-1" solid={false} />
                              187
                            </span>
                            <span className="flex items-center font-work-sans">
                              <Icon name="faUserGroup" className="w-4 h-4 mr-1" solid={false} />
                              32
                            </span>
            </div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors font-work-sans">
                      View all mentions
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6 font-work-sans">
                {/* Sentiment by Platform */}
                <div id="platforms" className="bg-white rounded-xl shadow-sm p-6 font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>
                  <div className="flex justify-between items-center mb-4 font-work-sans">
                    <h3 className="text-lg font-semibold font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Sentiment by Platform</h3>
                    <select className="border rounded-lg text-sm px-3 py-1.5 bg-white font-work-sans" style={{
                  borderColor: 'var(--divider-color)',
                  color: 'var(--secondary-color)'
                }}>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last Quarter</option>
                    </select>
                  </div>
            <div className="space-y-4 font-work-sans">
                    <div className="flex items-center justify-between font-work-sans">
                      <div className="flex items-center font-work-sans">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 font-work-sans" style={{
                      backgroundColor: 'rgba(0, 191, 255, 0.1)'
                    }}>
                          <Icon name="faLightning" solid className="w-6 h-6 text-white font-work-sans" />
                        </div>
                        <span className="font-medium text-gray-900 font-work-sans">X</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 font-work-sans">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 font-work-sans">
                      <div className="h-2.5 rounded-full font-work-sans" style={{
                    width: "75%",
                    backgroundColor: 'var(--accent-color)'
                  }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between font-work-sans">
                      <div className="flex items-center font-work-sans">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 font-work-sans" style={{
                      backgroundColor: 'rgba(0, 191, 255, 0.1)'
                    }}>
                          <Icon name="faCheck" className="w-6 h-6" solid={false} />
                        </div>
                        <span className="font-medium text-gray-900 font-work-sans">Instagram</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 font-work-sans">82%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 font-work-sans">
                      <div className="h-2.5 rounded-full font-work-sans" style={{
                    width: "82%",
                    backgroundColor: 'var(--accent-color)'
                  }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between font-work-sans">
                      <div className="flex items-center font-work-sans">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 font-work-sans">
                          <Icon name="faCheck" className="w-5 h-5 text-blue-500 font-work-sans" solid={false} />
                        </div>
                        <span className="font-medium text-gray-900 font-work-sans">YouTube</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 font-work-sans">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 font-work-sans">
                      <div className="bg-indigo-600 h-2.5 rounded-full font-work-sans" style={{
                    width: "68%"
                  }}></div>
                    </div>
                  </div>
                </div>

                {/* Competitor Benchmarking */}
                <div id="competitors" className="bg-white rounded-xl shadow-sm p-6 font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>
                  <div className="flex justify-between items-center mb-4 font-work-sans">
                    <h3 className="text-lg font-semibold font-sora" style={{
                  color: 'var(--primary-color)'
                }}>Competitor Benchmarking</h3>
                    <select className="border rounded-lg text-sm px-3 py-1.5 bg-white font-work-sans" style={{
                  borderColor: 'var(--divider-color)',
                  color: 'var(--secondary-color)'
                }}>
                      <option>Last Quarter</option>
                      <option>Last 6 Months</option>
                      <option>YTD</option>
                    </select>
                  </div>
                  <div className="h-64 font-work-sans">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={brandMetrics.competitors} margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5
                  }} layout="vertical">

                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                        <RechartsTooltip />
                        <Bar dataKey="sentiment" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 font-work-sans">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg font-work-sans">
                  <div className="font-work-sans">
                        <span className="text-xs text-gray-500 block font-work-sans">Overall Position</span>
                        <span className="text-lg font-bold text-gray-900 font-work-sans">#1 in Sentiment</span>
                  </div>
                  <div className="text-right font-work-sans">
                        <span className="text-xs text-gray-500 block font-work-sans">Ahead by</span>
                        <span className="text-lg font-bold text-green-600 font-work-sans">+8%</span>
                  </div>
                </div>
            </div>
                </div>

                {/* Mentions count */}
                <div id="trends" className="bg-white rounded-xl shadow-sm p-6 font-work-sans" style={{
              border: '1px solid var(--divider-color)'
            }}>
                  <h3 className="text-lg font-semibold text-gray-900 font-sora mb-4">Mentions</h3>
                  <div className="grid grid-cols-2 gap-4 font-work-sans">
                    <div className="bg-gray-50 rounded-lg p-4 font-work-sans">
                      <h4 className="text-sm font-medium text-gray-500 mb-1 font-sora">Total Mentions</h4>
                      <div className="flex items-baseline font-work-sans">
                        <span className="text-2xl font-bold text-gray-900 mr-2 font-work-sans">24,521</span>
                        <span className="text-sm text-green-600 font-medium font-work-sans">+12%</span>
                  </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 font-work-sans">
                      <h4 className="text-sm font-medium text-gray-500 mb-1 font-sora">Positive</h4>
                      <div className="flex items-baseline font-work-sans">
                        <span className="text-2xl font-bold text-gray-900 mr-2 font-work-sans">18,391</span>
                        <span className="text-sm text-green-600 font-medium font-work-sans">+15%</span>
                    </div>
                  </div>
                    <div className="bg-gray-50 rounded-lg p-4 font-work-sans">
                      <h4 className="text-sm font-medium text-gray-500 mb-1 font-sora">Neutral</h4>
                      <div className="flex items-baseline font-work-sans">
                        <span className="text-2xl font-bold text-gray-900 mr-2 font-work-sans">4,904</span>
                        <span className="text-sm text-yellow-600 font-medium font-work-sans">+5%</span>
                </div>
            </div>
                    <div className="bg-gray-50 rounded-lg p-4 font-work-sans">
                      <h4 className="text-sm font-medium text-gray-500 mb-1 font-sora">Negative</h4>
                      <div className="flex items-baseline font-work-sans">
                        <span className="text-2xl font-bold text-gray-900 mr-2 font-work-sans">1,226</span>
                        <span className="text-sm text-red-600 font-medium font-work-sans">+2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

          {/* Track Competition */}
          <div id="competition" className="mb-12 font-work-sans">
            <div className="flex justify-between items-center mb-6 font-work-sans">
              <div className="font-work-sans">
                <h3 className="text-lg font-semibold text-gray-900 font-sora">Track Competition</h3>
                <p className="text-sm text-gray-500 font-work-sans">Monitor your brand performance against key competitors</p>
              </div>
              <div className="flex space-x-4 font-work-sans">
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
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 font-work-sans">
              {/* Market Share Trends */}
              <div className="font-work-sans">
                <h4 className="text-base font-medium text-gray-800 mb-4 font-sora">Market Share Trends</h4>
              <div className="h-80 font-work-sans">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={brandMetrics.historical.quarterly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--divider-color)" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 40]} axisLine={false} tickLine={false} />
                    <RechartsTooltip />
                    <RechartsLegend />
                      <Line type="monotone" dataKey="marketShare" stroke="var(--accent-color)" strokeWidth={3} dot={{
                    r: 4,
                    fill: "var(--accent-color)"
                  }} name="Your Brand" />

                      <Line type="monotone" dataKey="competitorShare1" stroke="#EC4899" strokeWidth={2} dot={{
                    r: 3,
                    fill: "#EC4899"
                  }} name="Competitor A" />

                      <Line type="monotone" dataKey="competitorShare2" stroke="#10B981" strokeWidth={2} dot={{
                    r: 3,
                    fill: "#10B981"
                  }} name="Competitor B" />

                  </LineChart>
                </ResponsiveContainer>
              </div>
                    </div>
              
              {/* Share of Voice Comparison */}
                      <div className="font-work-sans">
                <h4 className="text-base font-medium text-gray-800 mb-4 font-sora">Share of Voice</h4>
                <div className="h-80 font-work-sans">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{
                  channel: 'X',
                  you: 42,
                  competitorA: 30,
                  competitorB: 25
                }, {
                  channel: 'Instagram',
                  you: 58,
                  competitorA: 40,
                  competitorB: 28
                }, {
                  channel: 'YouTube',
                  you: 35,
                  competitorA: 30,
                  competitorB: 20
                }]} margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20
                }}>

                      <CartesianGrid strokeDasharray="3 3" stroke="var(--divider-color)" />
                      <XAxis dataKey="channel" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <RechartsLegend />
                      <Bar dataKey="you" fill="var(--accent-color)" name="Your Brand" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="competitorA" fill="#EC4899" name="Competitor A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="competitorB" fill="#10B981" name="Competitor B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                      </div>
                      </div>
                    </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-work-sans">
              <div className="bg-indigo-50 rounded-lg p-4 font-work-sans">
                <h5 className="text-sm font-medium text-gray-700 mb-1 font-sora">Position vs Competitors</h5>
                <div className="flex items-center font-work-sans">
                  <span className="text-2xl font-bold text-gray-900 mr-2 font-work-sans">#1</span>
                  <span className="text-sm text-green-600 font-medium font-work-sans">Leader in 3 of 5 channels</span>
                  </div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 font-work-sans">
                <h5 className="text-sm font-medium text-gray-700 mb-1 font-sora">Growth Rate Difference</h5>
                <div className="flex items-center font-work-sans">
                  <span className="text-2xl font-bold text-gray-900 mr-2 font-work-sans">+12%</span>
                  <span className="text-sm text-green-600 font-medium font-work-sans">vs competitor average</span>
            </div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 font-work-sans">
                <h5 className="text-sm font-medium text-gray-700 mb-1 font-sora">Brand Strength Index</h5>
                <div className="flex items-center font-work-sans">
                  <span className="text-2xl font-bold text-gray-900 mr-2 font-work-sans">72/100</span>
                  <span className="text-sm text-green-600 font-medium font-work-sans">+4 pts this quarter</span>
                </div>
              </div>
            </div>
        </div>

        {/* AI Insights Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white font-work-sans">
          <div className="flex items-start space-x-4 font-work-sans">
            <div className="bg-white/10 p-3 rounded-lg font-work-sans">
              <Icon name="faLightning" solid className="w-6 h-6 text-white font-work-sans" />
            </div>
            <div className="font-work-sans">
              <h3 className="text-lg font-semibold mb-2 font-sora">AI-Powered Strategic Insights</h3>
              <ul className="space-y-3 font-work-sans">
                <li className="flex items-start font-work-sans">
                  <Icon name="faArrowUp" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" solid={false} />
                  <span className="font-work-sans">Your brand sentiment is consistently higher on Instagram (82%) than other platforms. Consider shifting more resources to this channel for enterprise messaging.</span>
                </li>
                <li className="flex items-start font-work-sans">
                  <Icon name="faUserGroup" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" solid={false} />
                  <span className="font-work-sans">Product announcements receive 3.2x more positive engagement than industry news. Recommend incorporating more product-focused content in your social media mix.</span>
                </li>
                <li className="flex items-start font-work-sans">
                  <Icon name="faShield" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" solid={false} />
                  <span className="font-work-sans">Competitor B is gaining traction in Forums (40% share of voice). Consider strengthening your presence in developer and technical communities.</span>
                </li>
                <li className="flex items-start font-work-sans">
                  <Icon name="faChartBar" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" solid={false} />
                  <span className="font-work-sans">Your recent Enterprise AI campaign drove a 15% increase in positive mentions. This messaging resonates strongly with your target audience.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
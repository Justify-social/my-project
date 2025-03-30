'use client';

import React, { useEffect, useState, Suspense, useMemo, useCallback, useRef } from 'react';
import T from '../../../../../middlewares/validate-request';
import SVGSVGElement from '../../../../../components/ui/icons/variants/IconVariants';
import StatusBadge from '../../../../../components/ui/feedback/Badge';
import MetricCard from '../../../../../components/ui/card/types/index';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from '@/src/components/features/core/error-handling/ErrorBoundary';
import { Analytics } from '@/lib/analytics/analytics';
import { ErrorFallback } from '@/components/ui/organisms/error-fallback/ErrorFallback'
import { CampaignDetailSkeleton } from '@/components/ui/loading-skeleton';
import { useSidebar } from '@/providers/SidebarProvider';
import Image from 'next/image';
import { Icon } from '@/components/ui/atoms/icons'
import { iconComponentFactory } from '@/components/ui/atoms/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
// Import Currency from shared types
import { Currency, Platform, Position } from '@/components/features/campaigns/wizard/shared/types';

// Remove local enum definitions that conflict with imported ones
// Only keep non-conflicting enums
enum KPI {
  adRecall = 'adRecall',
  brandAwareness = 'brandAwareness',
  consideration = 'consideration',
  messageAssociation = 'messageAssociation',
  brandPreference = 'brandPreference',
  purchaseIntent = 'purchaseIntent',
  actionIntent = 'actionIntent',
  recommendationIntent = 'recommendationIntent',
  advocacy = 'advocacy',
}
enum Feature {
  CREATIVE_ASSET_TESTING = 'CREATIVE_ASSET_TESTING',
  BRAND_LIFT = 'BRAND_LIFT',
  BRAND_HEALTH = 'BRAND_HEALTH',
  MIXED_MEDIA_MODELLING = 'MIXED_MEDIA_MODELLING',
}

// Update interface to match properties used in components
interface CampaignDetail {
  id: string;
  campaignName: string;
  description?: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  currency: Currency;
  totalBudget: number;
  socialMediaBudget?: number;
  platform: Platform;
  influencerHandle?: string;
  website?: string;

  // Contact Information
  primaryContact: {
    firstName: string;
    surname: string;
    email: string;
    position: Position;
    phone: string;
  };
  secondaryContact?: {
    firstName: string;
    surname: string;
    email: string;
    position: Position;
    phone: string;
  };

  // Campaign Details
  brandName: string;
  category: string;
  product: string;
  targetMarket: string;
  submissionStatus: string;
  primaryKPI: string;
  secondaryKPIs: KPI[];

  // Campaign Objectives
  mainMessage: string;
  hashtags: string;
  memorability: string;
  keyBenefits: string;
  expectedAchievements: string;
  purchaseIntent: string;
  brandPerception: string;
  features: string[];

  // Audience
  audience: {
    demographics: {
      ageRange: string[];
      gender: string[];
      education: string[];
      income: string[];
      interests: string[];
      locations: string[];
      languages: string[];
    };
  };

  // Creative Assets
  creativeAssets: Array<{
    name: string;
    type: "image" | "video";
    url: string;
    size?: number;
    duration?: number;
    influencerHandle?: string;
    description?: string;
    budget?: number;
  }>;
  creativeRequirements: Array<{
    requirement: string;
    description?: string;
  }>;

  // Status and timestamps
  createdAt: string;
  updatedAt: string;
}

// Update the interface to match the exact API response structure
interface APICampaignResponse {
  id: number;
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  contacts: string;
  currency: string;
  totalBudget: number;
  socialMediaBudget: number;
  platform: string;
  influencerHandle: string;
  primaryContactId: number;
  secondaryContactId: number;
  mainMessage: string;
  hashtags: string;
  memorability: string;
  keyBenefits: string;
  expectedAchievements: string;
  purchaseIntent: string;
  brandPerception: string;
  primaryKPI: string;
  secondaryKPIs: string[];
  features: string[];
  submissionStatus: string;
  createdAt: string;
  primaryContact: {
    id: number;
    firstName: string;
    surname: string;
    email: string;
    position: string;
  };
  secondaryContact: {
    id: number;
    firstName: string;
    surname: string;
    email: string;
    position: string;
  };
  audience: null | {


    // ... audience fields if needed ...
  };creativeAssets: any[];
  creativeRequirements: any[];
}

// Animation variants
const fadeIn = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -20
  }
};
const slideIn = {
  initial: {
    x: -20,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1
  },
  exit: {
    x: 20,
    opacity: 0
  }
};

// Add a KPI mapping with icons
const kpiIconsMap = {
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
    icon: "/KPIs/Brand_Preference.svg" // Using Brand Preference icon as a fallback
  },
  advocacy: {
    title: "Advocacy",
    icon: "/KPIs/Advocacy.svg"
  }
};

// Feature icons mapping
const featureIconsMap = {
  CREATIVE_ASSET_TESTING: {
    title: "Creative Asset Testing",
    icon: "/Creative_Asset_Testing.svg"
  },
  BRAND_LIFT: {
    title: "Brand Lift",
    icon: "/Brand_Lift.svg"
  },
  BRAND_HEALTH: {
    title: "Brand Health",
    icon: "/Brand_Health.svg"
  },
  MIXED_MEDIA_MODELLING: {
    title: "Mixed Media Modelling",
    icon: "/MMM.svg"
  }
};

// Format feature name for display
const formatFeatureName = (feature: string): string => {
  if (!feature) return "N/A";
  return featureIconsMap[feature as keyof typeof featureIconsMap]?.title || feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

// Format KPI name for display
const formatKpiName = (kpi: string): string => {
  if (!kpi) return "N/A";
  // Get from map or format manually
  return kpiIconsMap[kpi as keyof typeof kpiIconsMap]?.title || kpi.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

// Updated MetricCard component
interface MetricCardProps {
  title: string;
  value: string | number;
  iconName: string;
  trend?: "up" | "down" | "none";
  subtext?: string;
  format?: "number" | "currency" | "percent" | "text";
}
const MetricCard = ({
  title,
  value,
  iconName,
  trend = "none",
  subtext,
  format = "text"
}: MetricCardProps) => {
  // Format the value based on the format prop
  let formattedValue = value;
  if (format === "currency" && typeof value === "number") {
    formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  } else if (format === "percent" && typeof value === "number") {
    formattedValue = formatPercentage(value);
  } else if (format === "number" && typeof value === "number") {
    formattedValue = new Intl.NumberFormat('en-US').format(value);
  }

  // Determine trend arrow and color
  let trendIcon = null;
  let trendColor = "text-gray-500";
  if (trend === "up") {
    trendIcon = <Icon name="faChartLine" className="inline-block h-4 w-4 ml-1" solid={false} />;
    trendColor = "text-green-600";
  } else if (trend === "down") {
    trendIcon = <Icon name="faChartLine" className="inline-block h-4 w-4 ml-1" solid={false} />;
    trendColor = "text-red-600";
  }
  return <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--divider-color)] font-work-sans">
      <div className="flex justify-between items-start font-work-sans">
        <div className="font-work-sans">
          <div className="text-[var(--secondary-color)] text-sm mb-2 font-work-sans">{title}</div>
          <div className="text-2xl font-semibold text-[var(--primary-color)] flex items-center font-work-sans">
            {formattedValue}
            <span className={`${trendColor} font-work-sans`}>{trendIcon}</span>
          </div>
          {subtext && <div className="text-xs text-[var(--secondary-color)] mt-1 font-work-sans">{subtext}</div>}
        </div>
        <div className="p-3 bg-[var(--accent-light)] rounded-full font-work-sans">
          <Icon name={iconName} className="h-5 w-5 text-[var(--accent-color)] font-work-sans" solid={false} />
        </div>
      </div>
    </div>;
};

// Enhanced components for better data display
interface DataCardProps {
  title: string;
  description?: string;
  iconName: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}
const DataCard: React.FC<DataCardProps> = ({
  title,
  description,
  iconName,
  children,
  className = '',
  actions
}) => <div className={`bg-white rounded-lg border border-[var(--divider-color)] shadow-sm overflow-hidden ${className} font-work-sans`}>
    <div className="border-b border-[var(--divider-color)] bg-white px-4 py-4 sm:px-6 flex items-center justify-between font-work-sans">
      <div className="flex items-center font-work-sans">
        <div className="bg-[rgba(0,191,255,0.1)] p-2 rounded-md mr-3 font-work-sans">
          <Icon name={iconName} className="h-5 w-5 text-[var(--accent-color)] font-work-sans" aria-hidden="true" solid={false} />
        </div>
        <div className="font-work-sans">
          <h3 className="text-[var(--primary-color)] font-semibold font-sora">{title}</h3>
          {description && <p className="text-[var(--secondary-color)] text-sm mt-1 font-work-sans">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex space-x-2 font-work-sans">
          {actions}
        </div>}
    </div>
    <div className="px-4 py-5 sm:p-6 bg-white font-work-sans">
      {children}
    </div>
  </div>;

// Add DataRow component before the main CampaignDetail component
interface DataRowProps {
  label: string;
  value: React.ReactNode;
  iconName?: string;
  tooltip?: string;
  featured?: boolean;
}
const DataRow = ({
  label,
  value,
  iconName,
  tooltip,
  featured = false
}: DataRowProps) => <div className={`flex ${featured ? 'py-3' : 'py-2'} font-work-sans`}>
    <div className="w-1/3 flex-shrink-0 font-work-sans">
      <div className="flex items-center text-[var(--secondary-color)] font-work-sans">
        {iconName && <span className="mr-2 font-work-sans">
            <Icon name={iconName} className="h-4 w-4" solid={false} />
          </span>}
        <span className={`${featured ? 'font-medium' : ''} font-work-sans`}>{label}</span>
        {tooltip && <span className="ml-1 font-work-sans" title={tooltip}>
            {<Icon name="faCircleInfo" className="h-4 w-4 text-gray-400 font-work-sans" solid={false} />}
          </span>}
      </div>
    </div>
    <div className={`w-2/3 ${featured ? 'font-semibold text-[var(--primary-color)]' : 'text-[var(--secondary-color)]'} font-work-sans`}>
      {value}
    </div>
  </div>;

// Add new components for enhanced sections
const AudienceSection: React.FC<{
  audience: CampaignDetail['audience'] | null;
}> = ({
  audience
}) => {
  if (!audience) return null;
  const getNumericValue = (value: string): number => {
    if (value.includes('+')) {
      return parseInt(value.replace('+', ''));
    }
    const parts = value.split('-');
    if (parts.length === 2) {
      return (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    return 0;
  };

  // Sorting age ranges by their numeric value
  const sortedAgeRanges = [...(audience.demographics.ageRange || [])].sort((a, b) => getNumericValue(a) - getNumericValue(b));
  return <DataCard title="Audience Demographics" iconName="userGroup" description="Target audience information for this campaign">

      <div className="space-y-5 font-work-sans">
        <div className="font-work-sans">
          <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Location</h4>
          <div className="flex flex-wrap gap-2 font-work-sans">
            {audience.demographics.locations.map((location, index) => <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm font-work-sans">
                {location}
              </span>)}
            {audience.demographics.locations.length === 0 && <span className="text-[var(--secondary-color)] font-work-sans">No locations specified</span>}
          </div>
        </div>

        <div className="font-work-sans">
          <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Age Range</h4>
          <div className="grid grid-cols-6 gap-1 mb-2 font-work-sans">
            {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((range) => <div key={range} className={`text-center py-1.5 text-xs rounded ${sortedAgeRanges.includes(range) ? 'bg-[var(--accent-color)] text-white font-medium' : 'bg-gray-100 text-gray-500'} font-work-sans`}>

                {range}
              </div>)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 font-work-sans">
          <div className="font-work-sans">
            <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Gender</h4>
            <div className="flex flex-wrap gap-2 font-work-sans">
              {audience.demographics.gender.map((gender, index) => <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm font-work-sans">
                  {gender}
                </span>)}
            </div>
          </div>

          <div className="font-work-sans">
            <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Languages</h4>
            <div className="flex flex-wrap gap-2 font-work-sans">
              {audience.demographics.languages.map((language, index) => <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm font-work-sans">
                  {language}
                </span>)}
            </div>
          </div>
        </div>

        <div className="font-work-sans">
          <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Education Level</h4>
          <div className="flex flex-wrap gap-2 font-work-sans">
            {audience.demographics.education.map((education, index) => <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm font-work-sans">
                {education === 'some_college' ? 'Some College' : education === 'professional' ? 'Professional Degree' : education === 'bachelors' ? 'Bachelor\'s Degree' : education === 'associates' ? 'Associate\'s Degree' : education === 'high_school' ? 'High School' : education === 'graduate' ? 'Graduate Degree' : education}
              </span>)}
          </div>
        </div>

        {audience.demographics.interests.length > 0 && <div className="font-work-sans">
            <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Interests/Job Titles</h4>
            <div className="flex flex-wrap gap-2 font-work-sans">
              {audience.demographics.interests.map((interest, index) => <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm font-work-sans">
                  {interest}
                </span>)}
            </div>
          </div>}
      </div>
    </DataCard>;
};

// Add this Step5-style Asset Preview component 
const CampaignDetailAssetPreview = ({
  url,
  fileName,
  type,
  className = ''





}: {url: string;fileName: string;type: string;className?: string;}) => {
  const isVideo = type === 'video' || typeof type === 'string' && type.includes('video');
  const isImage = type === 'image' || typeof type === 'string' && type.includes('image');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Effect to handle video autoplay and looping
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      // Auto-play the video when component mounts
      const playVideo = () => {
        video.play().catch((error) => {
          console.warn('Auto-play was prevented:', error);
        });
      };

      // Handle video looping - restart after 5 seconds or when ended
      const handleTimeUpdate = () => {
        if (video.currentTime >= 5) {
          video.currentTime = 0;
          video.play().catch((err) => {
            console.error('Error replaying video:', err);
          });
        }
      };
      const handleEnded = () => {
        video.currentTime = 0;
        video.play().catch((err) => {
          console.error('Error replaying video:', err);
        });
      };

      // Add event listeners
      video.addEventListener('loadedmetadata', playVideo);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      // Remove event listeners on cleanup
      return () => {
        video.removeEventListener('loadedmetadata', playVideo);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [isVideo, url]);
  return <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className} font-work-sans`}>
      {/* Image preview */}
      {isImage && <img src={url} alt={fileName} className="w-full h-full object-cover" />}
      
      {/* Video preview (with autoplay and loop) */}
      {isVideo && <div className="relative font-work-sans">
          <video ref={videoRef} src={url} className="w-full h-full object-cover" muted playsInline loop autoPlay />

        </div>}
      
      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && <div className="flex items-center justify-center p-8 font-work-sans">
          {<Icon name="faDocument" className="h-12 w-12 text-gray-400 font-work-sans" solid={false} />}
        </div>}
    </div>;
};

// Add new components for missing sections
const ObjectivesSection: React.FC<{
  campaign: CampaignDetail;
}> = ({
  campaign
}) => <DataCard title="Campaign Objectives" iconName="lightning" description="Key objectives and performance indicators">

    <div className="space-y-5 font-work-sans">
      <div className="font-work-sans">
        <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Primary KPI</h4>
        <div className="flex items-center text-lg font-medium text-[var(--accent-color)] font-work-sans">
          {campaign.primaryKPI && <div className="flex items-center font-work-sans">
              <div className="w-6 h-6 mr-2 font-work-sans" style={{
            filter: 'invert(57%) sepia(94%) saturate(1752%) hue-rotate(180deg) brightness(101%) contrast(103%)'
          }}>
                <Image src={kpiIconsMap[campaign.primaryKPI as keyof typeof kpiIconsMap]?.icon || "/KPIs/Brand_Awareness.svg"} alt={formatKpiName(campaign.primaryKPI)} width={24} height={24} />

              </div>
              {formatKpiName(campaign.primaryKPI)}
            </div>}
          {!campaign.primaryKPI && "N/A"}
        </div>
      </div>

      {campaign.secondaryKPIs.length > 0 && <div className="font-work-sans">
          <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Secondary KPIs</h4>
          <div className="flex flex-wrap gap-2 font-work-sans">
            {campaign.secondaryKPIs.map((kpi, index) => <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm flex items-center font-work-sans">
                <div className="w-4 h-4 mr-1 font-work-sans" style={{
            filter: 'invert(57%) sepia(94%) saturate(1752%) hue-rotate(180deg) brightness(101%) contrast(103%)'
          }}>
                  <Image src={kpiIconsMap[kpi as keyof typeof kpiIconsMap]?.icon || "/KPIs/Brand_Awareness.svg"} alt={formatKpiName(kpi)} width={16} height={16} />

                </div>
                {formatKpiName(kpi)}
              </span>)}
          </div>
        </div>}

      <div className="space-y-3 pt-2 font-work-sans">
        <DataRow label="Main Message" value={campaign.mainMessage} />
        <DataRow label="Brand Perception" value={campaign.brandPerception} />
        <DataRow label="Hashtags" value={campaign.hashtags} iconName="hashtag" />
        <DataRow label="Key Benefits" value={campaign.keyBenefits} />
        <DataRow label="Memorability" value={campaign.memorability} />
        <DataRow label="Expected Achievements" value={campaign.expectedAchievements} />
        <DataRow label="Purchase Intent" value={campaign.purchaseIntent} />
      </div>
    </div>
  </DataCard>;
const AudienceInsightsSection: React.FC<{
  audience: CampaignDetail['audience'] | null;
}> = ({
  audience
}) => {
  if (!audience) return null; // Early return if no audience data

  return <DataCard title="Audience Insights" iconName="userCircle" className="col-span-2">
      <div className="grid grid-cols-2 gap-8 font-work-sans">
        {/* Screening Questions */}
        <div className="font-work-sans">
          <h3 className="text-lg font-medium mb-4 font-sora">Screening Questions</h3>
          <div className="space-y-2 font-work-sans">
            {audience.demographics.interests.map((interest) => <div key={interest} className="p-3 bg-gray-50 rounded-lg font-work-sans">
                {interest}
              </div>)}
          </div>
        </div>
        
        {/* Competitors */}
        <div className="font-work-sans">
          <h3 className="text-lg font-medium mb-4 font-sora">Competitors</h3>
          <div className="flex flex-wrap gap-2 font-work-sans">
            {audience.demographics.interests.map((interest) => <span key={interest} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-work-sans">
                {interest}
              </span>)}
          </div>
        </div>
      </div>
    </DataCard>;
};

// Add Creative Requirements Section
const CreativeRequirementsSection: React.FC<{
  requirements: CampaignDetail['creativeRequirements'];
}> = ({
  requirements
}) => <DataCard title="Creative Requirements" iconName="documentText" description="Campaign creative specifications">

    <div className="space-y-2 font-work-sans">
      {requirements && requirements.length > 0 ? requirements.map((req) => <div key={req.requirement} className="p-3 bg-gray-50 rounded-lg flex items-start font-work-sans">
          <Icon name="faDocumentText" className="w-5 h-5 text-gray-400 mr-3 mt-0.5 font-work-sans" solid={false} />
          <span className="text-gray-700 font-work-sans">{req.requirement}</span>
        </div>) : <div className="p-3 bg-gray-50 rounded-lg font-work-sans">
          <p className="text-gray-500 italic font-work-sans">No requirements specified</p>
        </div>}
    </div>
  </DataCard>;

// 1. Define strict types for all possible string operations
type StringOperation = {
  operation: 'toUpperCase' | 'toLowerCase' | 'trim';
  value: unknown;
  source: string;
  timestamp: number;
};

// 2. Implement operation tracking for debugging
class StringOperationTracker {
  private static operations: StringOperation[] = [];
  static track(operation: Omit<StringOperation, 'timestamp'>) {
    this.operations.push({
      ...operation,
      timestamp: Date.now()
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(`String Operation: ${operation.operation}`, {
        value: operation.value,
        source: operation.source,
        type: typeof operation.value
      });
    }
  }
  static getOperations() {
    return this.operations;
  }
}

// 3. Implement robust string handling with instrumentation
class SafeString {
  private static readonly FALLBACK = '';
  static transform(value: unknown, operation: 'toUpperCase' | 'toLowerCase', source: string): string {
    StringOperationTracker.track({
      operation,
      value,
      source
    });
    try {
      // Guard against null/undefined
      if (value == null) {
        console.warn(`Attempted ${operation} on null/undefined at ${source}`);
        return this.FALLBACK;
      }

      // Force to string
      const stringValue = String(value);

      // Perform requested operation
      return stringValue[operation]();
    } catch (error) {
      console.error(`String operation ${operation} failed:`, {
        value,
        source,
        error
      });
      return this.FALLBACK;
    }
  }
}

// Debug configuration
const DEBUG = process.env.NODE_ENV === 'development';

// Structured logging types
interface DebugEvent {
  timestamp: number;
  type: 'DATA' | 'ERROR' | 'LIFECYCLE' | 'ITERATION' | 'NETWORK';
  message: string;
  data?: unknown;
  error?: Error;
  stack?: string;
}

// Debug history
const debugHistory: DebugEvent[] = [];

// Enhanced logging utility
function debugLog(event: Omit<DebugEvent, 'timestamp'>) {
  if (!DEBUG) return;
  const logEvent: DebugEvent = {
    ...event,
    timestamp: performance.now()
  };
  debugHistory.push(logEvent);
  console.group(`🔍 [${logEvent.type}] ${logEvent.message}`);
  if (logEvent.data) console.log('Data:', logEvent.data);
  if (logEvent.error) {
    console.error('Error:', logEvent.error);
    console.log('Stack:', logEvent.stack);
  }
  console.groupEnd();
}

// Type guard utilities
function isIterable(value: unknown): value is Iterable<unknown> {
  return Boolean(value != null && typeof value === 'object' && typeof (value as any)[Symbol.iterator] === 'function');
}
function isCampaignData(data: unknown): data is CampaignDetail {
  return data != null && typeof data === 'object' && 'id' in data;
}

// Simple debug wrapper for string operations
function debugString(value: any, fieldName: string): string {
  console.log(`Attempting to process string for ${fieldName}:`, {
    value,
    type: typeof value,
    fieldName
  });
  if (value === undefined || value === null) {
    console.warn(`Warning: ${fieldName} is ${value}`);
    return '';
  }
  try {
    return String(value).toUpperCase();
  } catch (error) {
    console.error(`Error processing ${fieldName}:`, error);
    return '';
  }
}

// Add this at the very top of your file, before the component
if (typeof window !== 'undefined') {
  // Override toString and toUpperCase globally for debugging
  const originalToString = String.prototype.toString;
  const originalToUpperCase = String.prototype.toUpperCase;
  String.prototype.toString = function () {
    console.log('toString called on:', this);
    return originalToString.call(this);
  };
  String.prototype.toUpperCase = function () {
    console.log('toUpperCase called on:', this);
    return originalToUpperCase.call(this);
  };
}

// Add validation interface
interface CampaignValidation {
  isValid: boolean;
  errors: string[];
}

// Add validation function
function validateCampaignData(data: any): CampaignValidation {
  const errors: string[] = [];
  if (!data) {
    errors.push('No campaign data received');
    return {
      isValid: false,
      errors
    };
  }

  // Required fields
  const requiredFields = ['id', 'campaignName', 'startDate', 'endDate', 'currency', 'totalBudget', 'platform', 'submissionStatus'];
  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Updated StatusBadge component
interface StatusBadgeProps {
  status: string | undefined | null;
  size?: "sm" | "md";
  className?: string;
}
const StatusBadge = ({
  status = "draft",
  size = "md",
  className = ""
}: StatusBadgeProps) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let statusText = "Draft";
  const safeStatus = status?.toLowerCase() || "draft";
  switch (safeStatus) {
    case "approved":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      statusText = "Approved";
      break;
    case "active":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      statusText = "Active";
      break;
    case "submitted":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      statusText = "Submitted";
      break;
    case "in_review":
    case "in-review":
    case "inreview":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      statusText = "In Review";
      break;
    case "paused":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      statusText = "Paused";
      break;
    case "completed":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      statusText = "Completed";
      break;
    case "error":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      statusText = "DATA ERROR";
      break;
    case "draft":
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      statusText = "Draft";
      break;
  }
  return <span className={`inline-flex items-center rounded-full ${bgColor} ${textColor} ${size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"} font-medium ${className} font-work-sans`}>
      {statusText}
    </span>;
};

// Add component testing utility
// This should be placed near the top with other utility functions
const componentTester = {
  testComponentProps<T extends Record<string, any>>(componentName: string, props: T, requiredProps: Array<keyof T> = []): void {
    if (DEBUG) {
      console.group(`🧪 Testing ${componentName} props`);

      // Test for undefined required props
      const missingProps = requiredProps.filter((prop) => props[prop] === undefined);
      if (missingProps.length > 0) {
        console.warn(`⚠️ Missing required props: ${missingProps.join(', ')}`);
      }

      // Test all props for undefined/null values
      Object.entries(props).forEach(([key, value]) => {
        if (value === undefined) {
          console.warn(`⚠️ Prop "${key}" is undefined`);
        } else if (value === null) {
          console.info(`ℹ️ Prop "${key}" is null`);
        }

        // Check for property access on potentially null/undefined objects
        if (value !== null && typeof value === 'object') {
          console.info(`ℹ️ Object prop "${key}" - safe to access properties`);
        }
      });
      console.groupEnd();
    }

    // In production, we do nothing
    return;
  }
};

// Add DetailSection component
interface DetailSectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}
const DetailSection = ({
  icon: Icon,
  title,
  description,
  children,
  className = '',
  actions
}: DetailSectionProps) => <motion.section initial={{
  opacity: 0,
  y: 20
}} animate={{
  opacity: 1,
  y: 0
}} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 ${className}`}>

    <div className="p-5 font-work-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 font-work-sans">
        <div className="flex items-center font-work-sans">
          <div className="bg-blue-50 p-2.5 rounded-lg mr-3 font-work-sans">
            <Icon className="w-5 h-5 text-blue-500 font-work-sans" solid={false} />
          </div>
          <div className="font-work-sans">
            <h3 className="text-lg font-semibold text-gray-800 font-sora">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-0.5 font-work-sans">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex space-x-2 ml-auto sm:ml-0 font-work-sans">
            {actions}
          </div>}
      </div>
      <div className="space-y-4 font-work-sans">
        {children}
      </div>
    </div>
  </motion.section>;

// Add a safe access helper function
function safeAccess<T, K extends keyof T>(obj: T | null | undefined, property: K, fallback: T[K]): T[K] {
  if (obj === null || obj === undefined) {
    return fallback;
  }
  return obj[property] !== undefined ? obj[property] : fallback;
}

// Add a comprehensive testing utility for rendering safety
class ComponentSafetyTester {
  private static hasErrors = false;
  static testNullAccess(componentName: string, value: any, path: string): void {
    if (DEBUG) {
      if (value === undefined) {
        console.error(`❌ Test Failed: ${componentName} - ${path} is undefined`);
        this.hasErrors = true;
      } else if (value === null) {
        console.warn(`⚠️ Test Warning: ${componentName} - ${path} is null`);
      }
    }
  }
  static testBatchProps(componentName: string, props: Record<string, any>): void {
    if (DEBUG) {
      console.group(`🧪 Testing ${componentName} props`);
      Object.entries(props).forEach(([key, value]) => {
        this.testNullAccess(componentName, value, key);
      });
      console.groupEnd();
    }
  }
  static resetErrorState(): void {
    this.hasErrors = false;
  }
  static hasTestErrors(): boolean {
    return this.hasErrors;
  }
}

// Add a debug mode toggle at the top of the file
const ENABLE_SAFETY_MODE = true; // Set to true to enable runtime checks

// Wrap all access to potentially undefined properties in a safety check
function safe<T>(value: T | undefined | null, fallback: T): T {
  if (value === undefined || value === null) {
    if (ENABLE_SAFETY_MODE && typeof window !== 'undefined') {
      console.warn('🛡️ Safety Mode: Accessed undefined/null value, using fallback', {
        fallback
      });
    }
    return fallback;
  }
  return value;
}

// For currency specifically
function safeCurrency(value: Currency | string | undefined | null): string {
  if (value === undefined || value === null) {
    return 'USD';
  }
  return typeof value === 'string' ? value : String(Object.values(Currency)[Object.values(Currency).indexOf(value)]);
}

// Advanced runtime safety checker for component props
function safeProps<T extends Record<string, any>>(componentName: string, props: T): void {
  if (!ENABLE_SAFETY_MODE || typeof window === 'undefined') return;
  console.group(`🧪 Checking ${componentName} Props`);
  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined) {
      console.error(`⚠️ ${componentName}: Property "${key}" is undefined`);
    } else if (value === null) {
      console.warn(`ℹ️ ${componentName}: Property "${key}" is null`);
    }
  });
  console.groupEnd();
}

// Add a stress test function to simulate missing data
function stressTestWithNullValues(data: CampaignDetail, formatDate: (date: string) => string, calculateDuration: (start: string, end: string) => string, formatCurrency: (value: number | string, currency: Currency | string | undefined) => string): void {
  if (!ENABLE_SAFETY_MODE || typeof window === 'undefined') return;
  console.group('🔥 Stress Testing Component with Missing Data');
  try {
    // Create data clone with missing fields to test error handling
    const testCases = [{
      fieldName: 'submissionStatus',
      testData: {
        ...data,
        submissionStatus: undefined
      }
    }, {
      fieldName: 'campaignName',
      testData: {
        ...data,
        campaignName: undefined
      }
    }, {
      fieldName: 'brandName',
      testData: {
        ...data,
        brandName: undefined
      }
    }, {
      fieldName: 'id',
      testData: {
        ...data,
        id: undefined
      }
    }, {
      fieldName: 'totalBudget',
      testData: {
        ...data,
        totalBudget: undefined
      }
    }, {
      fieldName: 'currency',
      testData: {
        ...data,
        currency: undefined
      }
    }, {
      fieldName: 'startDate',
      testData: {
        ...data,
        startDate: undefined
      }
    }, {
      fieldName: 'endDate',
      testData: {
        ...data,
        endDate: undefined
      }
    }, {
      fieldName: 'primaryKPI',
      testData: {
        ...data,
        primaryKPI: undefined
      }
    }, {
      fieldName: 'features',
      testData: {
        ...data,
        features: undefined
      }
    }];
    console.log(`Running ${testCases.length} stress tests for null fields...`);

    // Test each case to see if it would cause errors
    testCases.forEach(({
      fieldName,
      testData
    }) => {
      try {
        // Test accessing specific properties that could cause errors
        if (fieldName === 'submissionStatus') {
          // Test status badge with undefined status
          const safeStatus = typeof testData.submissionStatus === 'string' && testData.submissionStatus ? testData.submissionStatus.toLowerCase() : 'draft';
          console.log(`Testing StatusBadge with missing ${fieldName}: ${safeStatus}`);
        }
        if (fieldName === 'id') {
          // Test ID substring that could throw error
          const idDisplay = testData.id ? testData.id.substring(0, 8) : 'N/A';
          console.log(`Testing ID substring with missing ${fieldName}: ${idDisplay}`);
        }
        if (fieldName === 'startDate' || fieldName === 'endDate') {
          // Test date formatting
          const formattedDate = fieldName === 'startDate' ? testData.startDate ? formatDate(testData.startDate) : 'Not set' : testData.endDate ? formatDate(testData.endDate) : 'Not set';
          console.log(`Testing date formatting with missing ${fieldName}: ${formattedDate}`);

          // Test duration calculation if applicable
          if (testData.startDate && testData.endDate) {
            const duration = calculateDuration(testData.startDate, testData.endDate);
            console.log(`Testing duration with ${fieldName}: ${duration}`);
          }
        }
        if (fieldName === 'totalBudget' || fieldName === 'currency') {
          // Test currency formatting
          const budget = testData.totalBudget !== undefined ? formatCurrency(testData.totalBudget, testData.currency) : 'N/A';
          console.log(`Testing currency formatting with missing ${fieldName}: ${budget}`);
        }
        if (fieldName === 'features') {
          // Test features array mapping
          const featuresDisplay = testData.features && testData.features.length > 0 ? `${testData.features.length} features` : 'No features';
          console.log(`Testing features display with missing ${fieldName}: ${featuresDisplay}`);
        }
        console.log(`✅ Test passed for missing ${fieldName}`);
      } catch (error) {
        console.error(`❌ Error with missing ${fieldName}:`, error);
      }
    });
    console.log('Stress testing complete.');
  } catch (error) {
    console.error('Error during stress testing:', error);
  }
  console.groupEnd();
}

// Format percentage for display
const formatPercentage = (value: number) => {
  return `${value > 0 ? '+' : ''}${value}%`;
};

// Add new error status badge component
const ErrorStatusBadge = ({
  message


}: {message: string;}) => <div className="text-red-600 font-medium p-3 border border-red-300 bg-red-50 rounded-md flex items-center space-x-2 font-work-sans">
    {<Icon name="faXCircle" className="h-5 w-5 text-red-600 font-work-sans" solid={false} />}
    <span className="font-work-sans">{message}</span>
  </div>;
export default function CampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const {
    isOpen
  } = useSidebar(); // Access sidebar state
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add a runtime test mode
  const [testMode, setTestMode] = useState(false);
  const [useFallbackData, setUseFallbackData] = useState(false);

  // Create an empty data object with N/A values for when API fails
  const emptyData: CampaignDetail = {
    id: "N/A",
    campaignName: "N/A",
    description: "N/A",
    startDate: "",
    endDate: "",
    timeZone: "N/A",
    currency: Currency.USD,
    totalBudget: 0,
    socialMediaBudget: 0,
    platform: Platform.Instagram,
    influencerHandle: "N/A",
    website: "N/A",
    primaryContact: {
      firstName: "N/A",
      surname: "N/A",
      email: "N/A",
      position: Position.Manager,
      phone: "N/A"
    },
    brandName: "N/A",
    category: "N/A",
    product: "N/A",
    targetMarket: "N/A",
    submissionStatus: "error",
    // Special status to indicate error
    primaryKPI: "N/A",
    secondaryKPIs: [],
    mainMessage: "N/A",
    hashtags: "N/A",
    memorability: "N/A",
    keyBenefits: "N/A",
    expectedAchievements: "N/A",
    purchaseIntent: "N/A",
    brandPerception: "N/A",
    features: [],
    audience: {
      demographics: {
        ageRange: [],
        gender: [],
        education: [],
        income: [],
        interests: [],
        locations: [],
        languages: []
      }
    },
    creativeAssets: [],
    creativeRequirements: [],
    createdAt: "",
    updatedAt: ""
  };
  useEffect(() => {
    // Check URL params for test mode
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('test') || urlParams.has('debug')) {
        setTestMode(true);
        console.info('🧪 Test mode enabled - checking for potential errors');
      }

      // Check if we should use the mock data directly
      if (urlParams.has('mock')) {
        setUseFallbackData(true);
        console.info('🔄 Using fallback mock data instead of API');
      }
    }
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      // If mock data is explicitly requested, use it
      if (useFallbackData) {
        console.log('Using mock data instead of fetching from API');
        setData(emptyData); // Use empty data instead of fallbackData
        setError("DEMO MODE: Using placeholder data.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        console.log(`Fetching campaign data for ID: ${params.id}`);
        const response = await fetch(`/api/campaigns/${params.id}`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const apiResponse = await response.json();
        console.log('API response received:', apiResponse);

        // The API returns { success: true, data: { ... } }
        // Extract the data property from the response
        const result = apiResponse.data || {};

        // Check if the result is empty
        if (!result || Object.keys(result).length === 0) {
          console.warn('Empty API response received. Using empty data.');
          setData(emptyData);
          setError('API ERROR: Empty response received');
          setLoading(false);
          return;
        }

        // Map API fields to expected format before validation
        const mappedResult = {
          id: result.id,
          campaignName: result.name || result.campaignName,
          startDate: result.startDate || '',
          endDate: result.endDate || '',
          currency: result.budget?.currency || result.currency || 'USD',
          totalBudget: result.budget?.total || result.totalBudget || 0,
          platform: result.influencers && result.influencers[0]?.platform ? result.influencers[0].platform : result.platform || 'Instagram',
          submissionStatus: result.status?.toLowerCase() || result.submissionStatus || 'draft'
        };
        console.log('Mapped result for validation:', mappedResult);

        // Validate data
        const validation = validateCampaignData(mappedResult);
        if (!validation.isValid) {
          console.error('Invalid campaign data received', result, validation.errors);

          // Use empty data instead of fallback data
          console.warn('Using empty data due to validation errors');
          setData(emptyData);
          setError(`API ERROR: Invalid data format - ${validation.errors.join(', ')}`);
          setLoading(false);
          return;
        }

        // Process the data to match expected format
        const processedData: CampaignDetail = {
          id: mappedResult.id.toString(),
          campaignName: mappedResult.campaignName,
          description: result.businessGoal || result.description || '',
          startDate: mappedResult.startDate,
          endDate: mappedResult.endDate,
          timeZone: result.timeZone || 'UTC',
          currency: mappedResult.currency as Currency,
          totalBudget: Number(mappedResult.totalBudget),
          socialMediaBudget: result.budget?.socialMedia || result.socialMediaBudget || 0,
          platform: mappedResult.platform as Platform,
          influencerHandle: result.influencerHandle || '',
          website: result.website || "",
          // Format the primary contact data
          primaryContact: {
            firstName: result.primaryContact?.firstName || '',
            surname: result.primaryContact?.surname || '',
            email: result.primaryContact?.email || '',
            position: result.primaryContact?.position || 'Manager',
            phone: result.primaryContact?.phone || "N/A"
          },
          // Format secondary contact if available
          secondaryContact: result.secondaryContact ? {
            firstName: result.secondaryContact.firstName || '',
            surname: result.secondaryContact.surname || '',
            email: result.secondaryContact.email || '',
            position: result.secondaryContact.position || 'Manager',
            phone: result.secondaryContact.phone || "N/A"
          } : undefined,
          // Campaign Details
          brandName: result.brandName || mappedResult.campaignName,
          category: result.category || "Not specified",
          product: result.product || "Not specified",
          targetMarket: result.targetMarket || "Global",
          submissionStatus: mappedResult.submissionStatus,
          primaryKPI: result.primaryKPI || '',
          secondaryKPIs: result.secondaryKPIs || [],
          // Campaign Objectives
          mainMessage: result.messaging?.mainMessage || result.mainMessage || "",
          hashtags: result.messaging?.hashtags || result.hashtags || "",
          memorability: result.messaging?.memorability || result.memorability || "",
          keyBenefits: result.messaging?.keyBenefits || result.keyBenefits || "",
          expectedAchievements: result.messaging?.expectedAchievements || result.expectedAchievements || "",
          purchaseIntent: result.messaging?.purchaseIntent || result.purchaseIntent || "",
          brandPerception: result.messaging?.brandPerception || result.brandPerception || "",
          features: result.features || [],
          // Audience data
          audience: {
            demographics: {
              ageRange: result.demographics?.ageDistribution ? Object.entries(result.demographics.ageDistribution).filter(([_, value]) => Number(value) > 0).map(([key]) => key.replace('age', '').replace('plus', '+')) : ['18-24', '25-34'],
              gender: result.demographics?.gender || ['All'],
              education: result.demographics?.educationLevel ? [result.demographics.educationLevel] : ['All'],
              income: result.demographics?.incomeLevel ? [result.demographics.incomeLevel.toString()] : ['All'],
              interests: result.demographics?.jobTitles || [],
              locations: result.locations ? result.locations.map((loc: any) => loc.location || '') : [],
              languages: result.targeting?.languages ? result.targeting.languages.map((lang: any) => lang.language || '') : ['English']
            }
          },
          // Creative Assets
          creativeAssets: result.assets || result.creativeAssets || [],
          // Creative Requirements
          creativeRequirements: result.requirements || result.creativeRequirements || [],
          // Timestamps
          createdAt: result.createdAt || new Date().toISOString(),
          updatedAt: result.updatedAt || new Date().toISOString()
        };
        setData(processedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching campaign data:', err);

        // Use empty data on error
        console.warn('Using empty data due to API error');
        setData(emptyData);
        if (err instanceof Error) {
          setError(`API ERROR: ${err.message}`);
        } else {
          setError('API ERROR: Failed to load campaign data');
        }
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchData();
    }
  }, [params.id, useFallbackData]); // Remove testMode and fallbackData to prevent extra rerenders

  // Move the format functions here, before they're used in stress testing
  // Format currency with better type handling
  const formatCurrency = (value: number | string, currencyCode: Currency | string | undefined) => {
    // Convert string to number if needed
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    // Default to 0 if NaN
    const safeValue = isNaN(numericValue) ? 0 : numericValue;

    // Get the string representation of the currency
    // Default to USD
    let currencyString = 'USD';
    if (currencyCode) {
      // If it's already a string, use it directly if valid
      if (typeof currencyCode === 'string') {
        // Validate against known currency codes
        if (['USD', 'GBP', 'EUR'].includes(currencyCode)) {
          currencyString = currencyCode;
        }
      }
      // If it's an enum value, convert it safely
      else {
        // Handle Currency enum values
        switch (currencyCode) {
          case Currency.USD:
            currencyString = 'USD';
            break;
          case Currency.GBP:
            currencyString = 'GBP';
            break;
          case Currency.EUR:
            currencyString = 'EUR';
            break;
          default:
            currencyString = 'USD';
        }
      }
    }
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyString,
        // Use the string directly
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(safeValue);
    } catch (error) {
      console.error('Error formatting currency:', error);
      // Fallback format without currency style
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(safeValue);
    }
  };

  // Format date for display with better error handling
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Calculate campaign duration with error handling
  const calculateDuration = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'N/A';
      }
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'N/A';
    }
  };

  // Test all components that will render with data
  if (DEBUG && data) {
    // Reset error state before testing
    ComponentSafetyTester.resetErrorState();

    // Test MetricCard data
    ComponentSafetyTester.testBatchProps('MetricCard - Budget', {
      'totalBudget': data.totalBudget,
      'currency': data.currency
    });
    ComponentSafetyTester.testBatchProps('MetricCard - Dates', {
      'startDate': data.startDate,
      'endDate': data.endDate
    });

    // Test header properties
    ComponentSafetyTester.testBatchProps('Campaign Header', {
      'campaignName': data.campaignName,
      'submissionStatus': data.submissionStatus,
      'brandName': data.brandName,
      'id': data.id
    });

    // Run stress tests on test mode
    if (testMode) {
      stressTestWithNullValues(data, formatDate, calculateDuration, formatCurrency);
    }

    // Log if any critical errors were found
    if (ComponentSafetyTester.hasTestErrors()) {
      console.error('⚠️ CRITICAL: Component tests detected potential runtime errors');
    }
  }

  // Component safety testing
  if (data) {
    ComponentSafetyTester.testBatchProps('MetricCard - Dates', {
      'startDate': data.startDate,
      'endDate': data.endDate
    });

    // Test header properties
    ComponentSafetyTester.testBatchProps('Campaign Header', {
      'campaignName': data.campaignName,
      'submissionStatus': data.submissionStatus,
      'brandName': data.brandName,
      'id': data.id
    });

    // Run stress tests on test mode
    if (testMode) {
      stressTestWithNullValues(data, formatDate, calculateDuration, formatCurrency);
    }

    // Test StatusBadge props
    componentTester.testComponentProps('StatusBadge', {
      status: data.submissionStatus,
      size: 'md'
    }, ['status']);
  }

  // Ensure we have data before rendering the component
  if (loading) {
    return <div className="py-10 font-work-sans">
        <CampaignDetailSkeleton />
      </div>;
  }
  if (error && !data) {
    return <div className="py-10 font-work-sans">
        <ErrorFallback error={new Error(error)} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 font-work-sans">
      {/* Header Section */}
      <div className={`${error ? 'bg-red-50' : 'bg-white'} border-b border-[var(--divider-color)] font-work-sans`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 font-work-sans">
          {error && <div className="mb-4 font-work-sans">
              <ErrorStatusBadge message={error} />
            </div>}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between font-work-sans">
            <div className="flex items-center space-x-3 font-work-sans">
              <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors font-work-sans" aria-label="Go back">

                {<Icon name="faChevronLeft" className="h-5 w-5 text-[var(--secondary-color)] font-work-sans" solid={false} />}
              </button>
              <div className="font-work-sans">
                <h1 className="text-xl font-bold text-[var(--primary-color)] sm:text-2xl font-sora">{data?.campaignName || "N/A"}</h1>
                <div className="flex items-center text-[var(--secondary-color)] text-sm mt-1 font-work-sans">
                  <StatusBadge status={error ? "error" : data?.submissionStatus} />
                  <span className="mx-2 font-work-sans">•</span>
                  <span className="font-work-sans">Created on {data?.createdAt ? formatDate(data.createdAt) : "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4 md:mt-0 font-work-sans">
              <button className="inline-flex items-center px-3 py-2 border border-[var(--divider-color)] rounded-md text-sm font-medium text-[var(--secondary-color)] bg-white hover:bg-gray-50 group font-work-sans">
                {<Icon name="faPrint" className="h-4 w-4 mr-2" solid={false} iconType="button" />}
                Print
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-[var(--divider-color)] rounded-md text-sm font-medium text-[var(--secondary-color)] bg-white hover:bg-gray-50 group font-work-sans">
                {<Icon name="faShare" className="h-4 w-4 mr-2" solid={false} iconType="button" />}
                Share
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-[var(--divider-color)] rounded-md text-sm font-medium text-[var(--secondary-color)] bg-white hover:bg-gray-50 group font-work-sans" disabled={!!error}>
                {<Icon name="faPenToSquare" className="h-4 w-4 mr-2" solid={false} iconType="button" />}
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-work-sans">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 font-work-sans">
          <MetricCard title="Total Budget" value={error ? "N/A" : data?.totalBudget || "N/A"} iconName="money" format={error ? "text" : "currency"} />

          <MetricCard title="Campaign Duration" value={error ? "N/A" : calculateDuration(data?.startDate || "", data?.endDate || "")} iconName="calendar" />

          <MetricCard title="Platform" value={error ? "N/A" : data?.platform || "N/A"} iconName="globe" />

        </div>

        {/* Campaign Details & Primary Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-work-sans">
          <DataCard title="Campaign Details" iconName="documentText" description="Basic campaign information">

            <div className="space-y-3 font-work-sans">
              <DataRow label="Campaign Name" value={error ? "N/A" : data?.campaignName || "N/A"} featured={true} />
              <DataRow label="Description" value={error ? "N/A" : data?.description || "N/A"} />
              <DataRow label="Brand Name" value={error ? "N/A" : data?.brandName || "N/A"} />
              <DataRow label="Start Date" value={error ? "N/A" : data?.startDate ? formatDate(data.startDate) : "N/A"} iconName="calendar" />
              <DataRow label="End Date" value={error ? "N/A" : data?.endDate ? formatDate(data.endDate) : "N/A"} iconName="calendar" />
              <DataRow label="Time Zone" value={error ? "N/A" : data?.timeZone || "N/A"} iconName="clock" />
              <DataRow label="Currency" value={error ? "N/A" : safeCurrency(data?.currency)} iconName="money" />
              <DataRow label="Total Budget" value={error ? "N/A" : formatCurrency(data?.totalBudget || 0, data?.currency)} iconName="money" featured={true} />

              <DataRow label="Social Media Budget" value={error ? "N/A" : formatCurrency(data?.socialMediaBudget || 0, data?.currency)} iconName="money" />

              <DataRow label="Website" value={error ? "N/A" : data?.website || "N/A"} iconName="globe" />
            </div>
          </DataCard>

          <DataCard title="Primary Contact" iconName="userCircle" description="Primary point of contact for this campaign">

            <div className="space-y-3 font-work-sans">
              <div className="flex items-center mb-4 font-work-sans">
                <div className="mr-4 bg-[var(--accent-color)] text-white rounded-full h-14 w-14 flex items-center justify-center text-lg font-semibold font-work-sans">
                  {error ? "NA" : `${data?.primaryContact?.firstName?.charAt(0) || ''}${data?.primaryContact?.surname?.charAt(0) || ''}`}
                </div>
                <div className="font-work-sans">
                  <h4 className="text-[var(--primary-color)] font-semibold font-sora">
                    {error ? "N/A" : `${data?.primaryContact?.firstName || ''} ${data?.primaryContact?.surname || ''}`}
                  </h4>
                  <p className="text-[var(--secondary-color)] text-sm font-work-sans">{error ? "N/A" : data?.primaryContact?.position || "N/A"}</p>
                </div>
              </div>
              
              <DataRow label="Email" value={error ? "N/A" : <a href={`mailto:${data?.primaryContact?.email}`} className="text-[var(--accent-color)] hover:underline font-work-sans">
                    {data?.primaryContact?.email || "N/A"}
                  </a>} iconName="mail" />

              
              <DataRow label="Position" value={error ? "N/A" : data?.primaryContact?.position || "N/A"} iconName="building" />
            </div>

            {!error && data?.secondaryContact && <div className="mt-6 pt-6 border-t border-[var(--divider-color)] font-work-sans">
                <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Secondary Contact</h4>
                <div className="space-y-3 font-work-sans">
                  <DataRow label="Name" value={`${data.secondaryContact.firstName} ${data.secondaryContact.surname}`} icon={UserCircleIcon} />

                  <DataRow label="Email" value={<a href={`mailto:${data.secondaryContact.email}`} className="text-[var(--accent-color)] hover:underline font-work-sans">
                        {data.secondaryContact.email}
                      </a>} icon={EnvelopeIcon} />

                  <DataRow label="Position" value={data.secondaryContact.position} icon={BuildingOfficeIcon} />
                </div>
              </div>}
          </DataCard>
        </div>

        {/* Objectives & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-work-sans">
          {error ? <DataCard title="Campaign Objectives" icon={SparklesIcon} description="Key objectives and performance indicators">

              <div className="space-y-5 font-work-sans">
                <div className="font-work-sans">
                  <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Primary KPI</h4>
                  <div className="text-[var(--secondary-color)] font-work-sans">N/A</div>
                </div>
                <div className="font-work-sans">
                  <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Secondary KPIs</h4>
                  <div className="text-[var(--secondary-color)] font-work-sans">N/A</div>
                </div>
                <div className="space-y-3 pt-2 font-work-sans">
                  <DataRow label="Main Message" value="N/A" />
                  <DataRow label="Brand Perception" value="N/A" />
                  <DataRow label="Hashtags" value="N/A" iconName="hashtag" />
                  <DataRow label="Key Benefits" value="N/A" />
                  <DataRow label="Memorability" value="N/A" />
                  <DataRow label="Expected Achievements" value="N/A" />
                  <DataRow label="Purchase Intent" value="N/A" />
                </div>
              </div>
            </DataCard> : data && <ObjectivesSection campaign={data} />}
          
          {error ? <DataCard title="Target Audience" icon={UsersIcon} description="Detailed audience targeting information">

              <div className="text-center py-10 text-[var(--secondary-color)] font-work-sans">
                <p className="font-work-sans">N/A</p>
              </div>
            </DataCard> : data && <AudienceSection audience={data.audience} />}
        </div>

        {/* Creative Assets */}
        <div className="mb-6 font-work-sans">
          <DataCard title="Creative Assets" icon={PhotoIcon} description="Campaign creative assets" actions={<button className="text-sm text-[var(--accent-color)] hover:text-[var(--accent-color)] hover:underline font-work-sans">View All</button>}>

            {error ? <div className="text-center py-10 text-[var(--secondary-color)] font-work-sans">
                <Icon name="faPhoto" className="h-10 w-10 mx-auto mb-2 opacity-50" solid={false} />
                <p className="font-work-sans">N/A</p>
              </div> : data && (data.creativeAssets.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-work-sans">
                  {data.creativeAssets.slice(0, 6).map((asset, index) => <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col font-work-sans">
                      {/* Asset Preview - Square/Tiled */}
                      <div className="aspect-square w-full overflow-hidden relative bg-gray-50 font-work-sans">
                        <CampaignDetailAssetPreview url={asset.url} fileName={asset.name || 'Asset preview'} type={asset.type} className="w-full h-full" />

                        
                        {/* Asset Name Overlay at Top */}
                        <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-90 py-2 px-3 border-b border-gray-200 font-work-sans">
                          <h3 className="font-medium text-gray-800 truncate text-sm font-sora">
                            {asset.name || 'Untitled Asset'}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Asset Details Section */}
                      <div className="p-4 bg-white flex-grow font-work-sans">
                        <div className="space-y-4 font-work-sans">
                          {/* Influencer */}
                          <div className="flex items-start font-work-sans">
                            <Icon name="faUserCircle" className="h-5 w-5 text-[var(--accent-color)] mr-2 mt-0.5 flex-shrink-0 font-work-sans" solid={false} />
                            <div className="font-work-sans">
                              <p className="text-xs text-gray-500 mb-1 font-work-sans">Influencer</p>
                              <p className="text-sm text-gray-800 font-medium font-work-sans">{asset.influencerHandle || 'Not specified'}</p>
                            </div>
                          </div>
                          
                          {/* Why this influencer */}
                          <div className="flex items-start font-work-sans">
                            <Icon name="faCircleInfo" className="h-5 w-5 text-[var(--accent-color)] mr-2 mt-0.5 flex-shrink-0 font-work-sans" solid={false} />
                            <div className="font-work-sans">
                              <p className="text-xs text-gray-500 mb-1 font-work-sans">Why this influencer</p>
                              <p className="text-sm text-gray-800 font-work-sans">{asset.description || 'No details provided'}</p>
                            </div>
                          </div>
                          
                          {/* Budget */}
                          <div className="flex items-start font-work-sans">
                            <Icon name="faDollarSign" className="h-5 w-5 text-[var(--accent-color)] mr-2 mt-0.5 flex-shrink-0 font-work-sans" solid={false} />
                            <div className="font-work-sans">
                              <p className="text-xs text-gray-500 mb-1 font-work-sans">Budget</p>
                              <p className="text-sm text-gray-800 font-medium font-work-sans">
                                {asset.budget ? formatCurrency(asset.budget, data.currency) : 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-10 text-[var(--secondary-color)] font-work-sans">
                  <Icon name="faPhoto" className="h-10 w-10 mx-auto mb-2 opacity-50" solid={false} />
                  <p className="font-work-sans">No creative assets available</p>
                </div>)}
          </DataCard>
        </div>

        {/* Campaign Features */}
        <div className="mb-6 font-work-sans">
          <DataCard title="Campaign Features" icon={SparklesIcon} description="Additional features enabled for this campaign">

            {error ? <div className="text-center py-8 text-[var(--secondary-color)] font-work-sans">
                <p className="font-work-sans">N/A</p>
              </div> : data?.features && data.features.length > 0 ? <div className="flex flex-wrap gap-3 font-work-sans">
                  {data.features.map((feature, index) => <div key={index} className="flex items-center bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-4 py-2 rounded-lg font-work-sans">
                      <div className="w-5 h-5 mr-2 font-work-sans" style={{
                filter: 'invert(57%) sepia(94%) saturate(1752%) hue-rotate(180deg) brightness(101%) contrast(103%)'
              }}>
                        <Image src={featureIconsMap[feature as keyof typeof featureIconsMap]?.icon || "/Brand_Lift.svg"} alt={formatFeatureName(feature)} width={20} height={20} />

                      </div>
                      <span className="font-work-sans">{formatFeatureName(feature)}</span>
                    </div>)}
                </div> : <div className="text-center py-8 text-[var(--secondary-color)] font-work-sans">
                  <p className="font-work-sans">No features specified</p>
                </div>}
          </DataCard>
        </div>
      </div>
    </div>;
}
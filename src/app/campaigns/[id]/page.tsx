'use client';

import React, { useEffect, useState, Suspense, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { Analytics } from '@/lib/analytics/analytics';
import ErrorFallback from '@/components/ErrorFallback';
import { SkeletonSection } from '@/components/ui/loading-skeleton';
import { useSidebar } from '@/providers/SidebarProvider';
import Image from 'next/image';
import { Icon, iconComponentFactory } from '@/components/ui/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
// Import Currency from shared types
import { Currency, Platform, Position } from '@/components/Wizard/shared/types';
import { UI_ICON_MAP } from '@/components/ui/icons';
import { iconConfig } from '@/components/ui/icons';
import type { IconName } from '@/components/ui/icons';

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
    icon: "/app/Creative_Asset_Testing.svg"
  },
  BRAND_LIFT: {
    title: "Brand Lift",
    icon: "/app/Brand_Lift.svg"
  },
  BRAND_HEALTH: {
    title: "Brand Health",
    icon: "/app/Brand_Health.svg"
  },
  MIXED_MEDIA_MODELLING: {
    title: "Mixed Media Modelling",
    icon: "/app/MMM.svg"
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
    trendIcon = <Icon name="faArrowUp" className="inline-block h-4 w-4 ml-1" solid={false} />;
    trendColor = "text-green-600";
  } else if (trend === "down") {
    trendIcon = <Icon name="faArrowDown" className="inline-block h-4 w-4 ml-1" solid={false} />;
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
          <Icon
          name={UI_ICON_MAP[iconName] || `fa${iconName.charAt(0).toUpperCase() + iconName.slice(1)}`}
          className="h-5 w-5 text-[var(--accent-color)] font-work-sans"
          iconType="static"
          solid={false} />

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
          <Icon
          name={UI_ICON_MAP[iconName] || `fa${iconName.charAt(0).toUpperCase() + iconName.slice(1)}`}
          className="h-5 w-5 text-[var(--accent-color)] font-work-sans"
          aria-hidden="true"
          iconType="static"
          solid={false} />

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
        {iconName && <span className="mr-2 flex-shrink-0 font-work-sans">
            <Icon
          name={UI_ICON_MAP[iconName] || `fa${iconName.charAt(0).toUpperCase() + iconName.slice(1)}`}
          className="h-4 w-4"
          iconType="static"
          solid={false} />

          </span>}
        <span className={`${featured ? 'font-medium' : ''} font-work-sans`}>{label}</span>
        {tooltip && <span className="ml-1 cursor-help font-work-sans" title={tooltip}>
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
  return <DataCard title="Audience Demographics" iconName="faUserGroup" description="Target audience information for this campaign">

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
        <DataRow label="Main Message" value={campaign.mainMessage} iconName="lightBulb" />
        <DataRow label="Brand Perception" value={campaign.brandPerception} iconName="chart" />
        <DataRow label="Hashtags" value={campaign.hashtags} iconName="tag" />
        <DataRow label="Key Benefits" value={campaign.keyBenefits} iconName="circleCheck" />
        <DataRow label="Memorability" value={campaign.memorability} iconName="bookmark" />
        <DataRow label="Expected Achievements" value={campaign.expectedAchievements} iconName="trendUp" />
        <DataRow label="Purchase Intent" value={campaign.purchaseIntent} iconName="dollarSign" />
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
            {<Icon name="faDocumentText" className="w-5 h-5 text-gray-400 mr-3 mt-0.5 font-work-sans" solid={false} />}
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

// Helper function to capitalize a string
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// StatusBadge component with semantic icons
const StatusBadge = ({ status }: {status?: string;}) => {
  let statusColor = "bg-gray-100 text-gray-700";
  let statusIcon = <Icon name="faCircleQuestion" className="h-4 w-4 mr-1" solid={false} />;

  switch (status?.toLowerCase()) {
    case 'draft':
      statusColor = "bg-yellow-50 text-yellow-700";
      statusIcon = <Icon name="faPencil" className="h-4 w-4 mr-1" solid={false} />;
      break;
    case 'submitted':
      statusColor = "bg-blue-50 text-blue-700";
      statusIcon = <Icon name="faPaperPlane" className="h-4 w-4 mr-1" solid={false} />;
      break;
    case 'pending':
      statusColor = "bg-orange-50 text-orange-700";
      statusIcon = <Icon name="faClock" className="h-4 w-4 mr-1" solid={false} />;
      break;
    case 'approved':
      statusColor = "bg-green-50 text-green-700";
      statusIcon = <Icon name="faCircleCheck" className="h-4 w-4 mr-1" solid={false} />;
      break;
    case 'rejected':
      statusColor = "bg-red-50 text-red-700";
      statusIcon = <Icon name="faCircleXmark" className="h-4 w-4 mr-1" solid={false} />;
      break;
    case 'error':
      statusColor = "bg-red-50 text-red-700";
      statusIcon = <Icon name="faTriangleExclamation" className="h-4 w-4 mr-1" solid={false} />;
      break;
    case 'active':
      statusColor = "bg-green-50 text-green-700";
      statusIcon = <Icon name="faPlay" className="h-4 w-4 mr-1" solid={false} />;
      break;
    case 'completed':
      statusColor = "bg-purple-50 text-purple-700";
      statusIcon = <Icon name="faFlag" className="h-4 w-4 mr-1" solid={false} />;
      break;
    default:
      statusColor = "bg-gray-100 text-gray-700";
      statusIcon = <Icon name="faCircleQuestion" className="h-4 w-4 mr-1" solid={false} />;
  }

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} font-work-sans`}>
      {statusIcon}
      {capitalize(status || 'Unknown')}
    </span>;
};

// Add missing utility functions
/**
 * Format file size into human readable format
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get description for a feature
 */
const getFeatureDescription = (feature: string): string => {
  switch (feature) {
    case Feature.CREATIVE_ASSET_TESTING:
      return 'Test multiple creative assets to identify top performers';
    case Feature.BRAND_LIFT:
      return 'Measure the impact of your campaign on brand metrics';
    case Feature.BRAND_HEALTH:
      return 'Monitor key brand health indicators';
    case Feature.MIXED_MEDIA_MODELLING:
      return 'Analyze effectiveness across multiple media channels';
    default:
      return 'Advanced campaign feature';
  }
};

// Format percentage for display
const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value}%`;
};

// Helper function to safely access currency values
const safeCurrency = (value: Currency | string | undefined | null): string => {
  if (value === undefined || value === null) {
    return 'USD';
  }
  return typeof value === 'string' ? value : String(Object.values(Currency)[Object.values(Currency).indexOf(value)]);
};

// Error status badge for displaying API errors
const ErrorStatusBadge = ({ message }: {message: string;}) => {
  return <div className="inline-flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-work-sans">
      <Icon name="faTriangleExclamation" className="h-4 w-4 mr-2" solid={false} />
      <span className="font-work-sans">{message}</span>
    </div>;
};

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
    console.log('Debug mode active for campaign details', data.id);
  }

  // Ensure we have data before rendering the component
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-5 animate-pulse font-work-sans">
        {/* Header Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 font-work-sans" />
        
        {/* Campaign Details Section */}
        <SkeletonSection
          title={true}
          titleWidth="w-1/4"
          actionButton={true}
          lines={3}
          className="mb-6" />


        {/* Objectives Section */}
        <SkeletonSection
          title={true}
          titleWidth="w-1/3"
          actionButton={true}
          lines={4}
          className="mb-6" />


        {/* Audience Section */}
        <SkeletonSection
          title={true}
          titleWidth="w-1/4"
          actionButton={true}
          lines={3}
          className="mb-6" />


        {/* Creative Assets Section */}
        <SkeletonSection
          title={true}
          titleWidth="w-1/4"
          actionButton={true}
          lines={3}
          className="mb-6" />

      </div>);

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
                <Icon name="faChevronLeft" className="h-5 w-5 text-[var(--secondary-color)] font-work-sans" solid={false} />
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
                <Icon name="faPrint" className="h-4 w-4 mr-2" solid={false} iconType="button" />
                <span className="font-work-sans">Print</span>
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-[var(--divider-color)] rounded-md text-sm font-medium text-[var(--secondary-color)] bg-white hover:bg-gray-50 group font-work-sans">
                <Icon name="faShare" className="h-4 w-4 mr-2" solid={false} iconType="button" />
                <span className="font-work-sans">Share</span>
              </button>
              <button onClick={() => router.push(`/campaigns/wizard/step-1?id=${data?.id}`)} className="inline-flex items-center px-3 py-2 border border-[var(--primary-color)] rounded-md text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[#222222] group font-work-sans" disabled={!!error}>
                <Icon name="faPenToSquare" className="h-4 w-4 mr-2" solid={false} iconType="button" />
                <span className="font-work-sans">Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-work-sans">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 font-work-sans">
          <MetricCard title="Total Budget" value={error ? "N/A" : data?.totalBudget || "N/A"} iconName="dollarSign" format={error ? "text" : "currency"} />
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
              <DataRow label="Currency" value={error ? "N/A" : safeCurrency(data?.currency)} iconName="dollarSign" />
              <DataRow label="Total Budget" value={error ? "N/A" : formatCurrency(data?.totalBudget || 0, data?.currency)} iconName="dollarSign" featured={true} />
              <DataRow label="Social Media Budget" value={error ? "N/A" : formatCurrency(data?.socialMediaBudget || 0, data?.currency)} iconName="dollarSign" />
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
              
              <DataRow label="Email" value={error ? "N/A" : <a href={`mailto:${data?.primaryContact?.email}`} className="text-[var(--accent-color)] hover:underline flex items-center font-work-sans">
                    {data?.primaryContact?.email || "N/A"}
                  </a>} iconName="mail" />

              <DataRow label="Position" value={error ? "N/A" : data?.primaryContact?.position || "N/A"} iconName="building" />
            </div>

            {!error && data?.secondaryContact && <div className="mt-6 pt-6 border-t border-[var(--divider-color)] font-work-sans">
                <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Secondary Contact</h4>
                <div className="space-y-3 font-work-sans">
                  <DataRow label="Name" value={`${data.secondaryContact.firstName} ${data.secondaryContact.surname}`} iconName="userCircle" />
                  <DataRow label="Email" value={<a href={`mailto:${data.secondaryContact.email}`} className="text-[var(--accent-color)] hover:underline font-work-sans">
                        {data.secondaryContact.email}
                      </a>} iconName="mail" />
                  <DataRow label="Position" value={data.secondaryContact.position} iconName="building" />
                </div>
              </div>}
          </DataCard>
        </div>

        {/* Objectives & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-work-sans">
          {error ? <DataCard title="Campaign Objectives" iconName="lightning" description="Key objectives and performance indicators">
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
                  <DataRow label="Main Message" value="N/A" iconName="lightBulb" />
                  <DataRow label="Brand Perception" value="N/A" iconName="chart" />
                  <DataRow label="Hashtags" value="N/A" iconName="tag" />
                  <DataRow label="Key Benefits" value="N/A" iconName="circleCheck" />
                  <DataRow label="Memorability" value="N/A" iconName="bookmark" />
                  <DataRow label="Expected Achievements" value="N/A" iconName="trendUp" />
                  <DataRow label="Purchase Intent" value="N/A" iconName="dollarSign" />
                </div>
              </div>
            </DataCard> : data && <ObjectivesSection campaign={data} />}
          
          {error ? <DataCard title="Target Audience" iconName="userGroup" description="Detailed audience targeting information">
              <div className="text-center py-10 text-[var(--secondary-color)] font-work-sans">
                <p className="font-work-sans">N/A</p>
              </div>
            </DataCard> : data && <AudienceSection audience={data.audience} />}
        </div>

        {/* Creative Assets */}
        <div className="mb-6 font-work-sans">
          <DataCard title="Creative Assets" iconName="photo" description="Campaign creative assets" actions={<button className="text-sm text-[var(--accent-color)] hover:text-[var(--accent-color)] hover:underline font-work-sans">View All</button>}>
            {error ? <div className="text-center py-10 text-[var(--secondary-color)] font-work-sans">
                {<Icon name="faImage" className="h-10 w-10 mx-auto mb-2 opacity-50" solid={false} />}
                <p className="font-work-sans">No creative assets available</p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-work-sans">
                  {(data?.creativeAssets || []).slice(0, 3).map((asset: any, index: number) => <div key={index} className="border border-[var(--divider-color)] rounded-md overflow-hidden font-work-sans">
                      {asset.type === "image" ? <div className="h-32 bg-gray-100 relative font-work-sans">
                          {asset.url ? <Image src={asset.url} alt={asset.name || 'Creative asset'} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" /> : <div className="flex items-center justify-center h-full font-work-sans">
                              <Icon name="faImage" className="h-10 w-10 text-gray-300 font-work-sans" solid={false} />
                            </div>}
                        </div> : <div className="h-32 bg-black flex items-center justify-center relative font-work-sans">
                          <Icon name="faVideo" className="h-10 w-10 text-white opacity-70 font-work-sans" solid={false} />
                          {asset.url && <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black to-transparent font-work-sans" />}
                        </div>}
                      <div className="p-3 font-work-sans">
                        <h4 className="font-medium text-[var(--primary-color)] truncate font-sora">{asset.name || 'Untitled'}</h4>
                        <p className="text-xs text-[var(--secondary-color)] mt-1 flex items-center font-work-sans">
                          <Icon name={asset.type === "image" ? "faImage" : "faVideo"} className="h-3 w-3 mr-1" solid={false} />
                          <span className="font-work-sans">{asset.type === "image" ? "Image" : "Video"}</span>
                          {asset.size && <span className="ml-2 font-work-sans">{formatFileSize(asset.size)}</span>}
                        </p>
                      </div>
                    </div>)}
                  {(data?.creativeAssets || []).length === 0 && <div className="col-span-3 text-center py-8 text-[var(--secondary-color)] font-work-sans">
                      <Icon name="faImage" className="h-8 w-8 mx-auto mb-2 opacity-50" solid={false} />
                      <p className="font-work-sans">No creative assets uploaded yet</p>
                    </div>}
                </div>}
          </DataCard>
        </div>

        {/* Campaign Features */}
        <div className="mb-6 font-work-sans">
          <DataCard title="Campaign Features" iconName="bolt" description="Additional features enabled for this campaign">
            {error ? <div className="text-center py-8 text-[var(--secondary-color)] font-work-sans">
                <p className="font-work-sans">N/A</p>
              </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-work-sans">
                  {data?.features && data.features.length > 0 ? data.features.map((feature: string, index: number) => {
              const featureKey = feature as keyof typeof featureIconsMap;
              return <div key={index} className="bg-[rgba(0,191,255,0.05)] p-4 rounded-lg font-work-sans">
                        <div className="flex items-start font-work-sans">
                          <div className="rounded-md flex-shrink-0 p-2 font-work-sans">
                            {featureIconsMap[featureKey] ? <Image src={featureIconsMap[featureKey].icon} width={24} height={24} alt={featureIconsMap[featureKey].title} className="w-6 h-6" /> : <Icon name="faBolt" className="h-6 w-6 text-[var(--accent-color)] font-work-sans" solid={false} />}
                          </div>
                          <div className="ml-3 font-work-sans">
                            <h4 className="font-medium text-[var(--primary-color)] font-sora">
                              {featureIconsMap[featureKey]?.title || formatFeatureName(feature)}
                            </h4>
                            <p className="text-xs text-[var(--secondary-color)] mt-1 font-work-sans">
                              {getFeatureDescription(feature)}
                            </p>
                          </div>
                        </div>
                      </div>;
            }) : <div className="col-span-3 text-center py-8 text-[var(--secondary-color)] font-work-sans">
                      <Icon name="faBolt" className="h-8 w-8 mx-auto mb-2 opacity-50" solid={false} />
                      <p className="font-work-sans">No features enabled for this campaign</p>
                    </div>}
                </div>}
          </DataCard>
        </div>
      </div>
    </div>;
}
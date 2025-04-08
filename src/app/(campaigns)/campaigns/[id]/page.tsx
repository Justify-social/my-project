// Updated import paths via tree-shake script - 2025-04-01T17:13:32.198Z
'use client';

import React, { useEffect, useState, Suspense, useMemo, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Analytics } from '@/lib/analytics/analytics';
import ErrorFallback from '@/components/error-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Icon } from '@/components/ui/icon/icon';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";

// Define types locally instead of importing
// These will be used to define our component props and state
enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

enum Platform {
  Instagram = 'Instagram',
  YouTube = 'YouTube',
  TikTok = 'TikTok'
}

enum Position {
  CEO = 'CEO',
  CTO = 'CTO',
  CMO = 'CMO',
  Marketing = 'Marketing',
  Manager = 'Manager',
  Other = 'Other'
}

// Define UI_ICON_MAP for use in the component
const UI_ICON_MAP: Record<string, string> = {
  "lightBulb": "faLightbulbLight",
  "chart": "faChartLineLight",
  "tag": "faTagLight",
  "circleCheck": "faCircleCheckLight",
  "bookmark": "faBookmark",
  "trendUp": "faTrendUp",
  "dollarSign": "faDollarSignLight",
  "calendar": "faCalendarLight",
  "documentText": "faFileLines",
  "userCircle": "faUserCircleLight",
  "mail": "faEnvelopeLight",
  "building": "faBuildingLight",
  "lightning": "faBolt",
  "userGroup": "faUserGroupLight",
  "photo": "faImage",
  "globe": "faGlobeLight",
  "bolt": "faBolt"
};

// Import the asset components
import { AssetPreview } from '@/components/ui/card/asset-card/components/AssetPreview'
import { AssetCard } from '@/components/ui/card/asset-card/AssetCard'

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
  }; creativeAssets: any[];
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
    icon: "/icons/kpis/Ad_Recall.svg"
  },
  brandAwareness: {
    title: "Brand Awareness",
    icon: "/icons/kpis/Brand_Awareness.svg"
  },
  consideration: {
    title: "Consideration",
    icon: "/icons/kpis/Consideration.svg"
  },
  messageAssociation: {
    title: "Message Association",
    icon: "/icons/kpis/Message_Association.svg"
  },
  brandPreference: {
    title: "Brand Preference",
    icon: "/icons/kpis/Brand_Preference.svg"
  },
  purchaseIntent: {
    title: "Purchase Intent",
    icon: "/icons/kpis/Purchase_Intent.svg"
  },
  actionIntent: {
    title: "Action Intent",
    icon: "/icons/kpis/Action_Intent.svg"
  },
  recommendationIntent: {
    title: "Recommendation Intent",
    icon: "/icons/kpis/Brand_Preference.svg" // Using Brand Preference icon as a fallback
  },
  advocacy: {
    title: "Advocacy",
    icon: "/icons/kpis/Advocacy.svg"
  }
};

// Feature icons mapping
const featureIconsMap = {
  CREATIVE_ASSET_TESTING: {
    title: "Creative Asset Testing",
    icon: "/icons/app/Creative_Asset_Testing.svg"
  },
  BRAND_LIFT: {
    title: "Brand Lift",
    icon: "/icons/app/Brand_Lift.svg"
  },
  BRAND_HEALTH: {
    title: "Brand Health",
    icon: "/icons/app/Brand_Health.svg"
  },
  MIXED_MEDIA_MODELLING: {
    title: "Mixed Media Modelling",
    icon: "/icons/app/MMM.svg"
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
  iconId?: string; // Made iconId primary
  trend?: "up" | "down" | "none";
  subtext?: string;
  format?: "number" | "currency" | "percent" | "text";
  platformIcon?: Platform; // Keep platform specific logic for now
}

const CampaignMetricCard = ({
  title,
  value,
  iconId, // Use iconId directly
  trend = "none",
  subtext,
  format = "text",
  platformIcon
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
    trendIcon = <Icon iconId="faArrowUpLight" className="inline-block h-4 w-4 ml-1" />;
    trendColor = "text-green-600";
  } else if (trend === "down") {
    trendIcon = <Icon iconId="faArrowDownLight" className="inline-block h-4 w-4 ml-1" />;
    trendColor = "text-red-600";
  }

  // Get platform icon for display
  const getPlatformIcon = () => {
    // Keep existing platform-specific image logic
    if (platformIcon && title === "Platform") {
      if (typeof value === 'string') {
        const platform = value.toLowerCase();
        if (platform.includes('instagram')) {
          return <Image src="/icons/brands/instagram.svg" width={24} height={24} alt="Instagram" />;
        } else if (platform.includes('facebook')) {
          return <Image src="/icons/brands/facebook.svg" width={24} height={24} alt="Facebook" />;
        } else if (platform.includes('twitter') || platform.includes('x')) {
          return <Image src="/icons/brands/x-twitter.svg" width={24} height={24} alt="Twitter" />;
        } else if (platform.includes('tiktok')) {
          return <Image src="/icons/brands/tiktok.svg" width={24} height={24} alt="TikTok" />;
        } else if (platform.includes('youtube')) {
          return <Image src="/icons/brands/youtube.svg" width={24} height={24} alt="YouTube" />;
        } else if (platform.includes('linkedin')) {
          return <Image src="/icons/brands/linkedin.svg" width={24} height={24} alt="LinkedIn" />;
        } else if (platform.includes('pinterest')) {
          return <Image src="/icons/brands/pinterest.svg" width={24} height={24} alt="Pinterest" />;
        } else if (platform.includes('reddit')) {
          return <Image src="/icons/brands/reddit.svg" width={24} height={24} alt="Reddit" />;
        }
      }
    }
    // Use iconId directly if provided, otherwise fallback
    return (
      <Icon
        // Pass iconId directly, including in the fallback case
        iconId={iconId || "faQuestionCircleLight"}
        className="h-5 w-5 text-[var(--accent-color)]"
        iconType="static" // Assuming iconType is a valid prop for Icon
      />
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--divider-color)] font-work-sans transform transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-[var(--accent-color)]">
      <div className="flex justify-between items-start font-work-sans">
        <div className="font-work-sans">
          <div className="text-[var(--secondary-color)] text-sm mb-2 font-work-sans">{title}</div>
          <div className="text-2xl font-semibold text-[var(--primary-color)] flex items-center font-sora">
            {title === "Platform" && typeof value === 'string' ? (
              <div className="flex items-center">
                {value}
                <span className={`${trendColor} font-work-sans ml-1`}>{trendIcon}</span>
              </div>
            ) : (
              <>
                {formattedValue}
                <span className={`${trendColor} font-work-sans ml-1`}>{trendIcon}</span>
              </>
            )}
          </div>
          {subtext && <div className="text-xs text-[var(--secondary-color)] mt-1 font-work-sans">{subtext}</div>}
        </div>
        <div className="p-3 bg-[rgba(0,191,255,0.1)] rounded-full font-work-sans">
          {getPlatformIcon()}
        </div>
      </div>
    </div>
  );
};

// Enhanced components for better data display
interface DataCardProps {
  title: string;
  description?: string;
  iconId?: string; // Made iconId primary
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  description,
  iconId, // Use iconId directly
  children,
  className = '',
  actions
}) => (
  <Card className={`overflow-hidden ${className}`}>
    <CardHeader className="border-b border-[var(--divider-color)] bg-white px-4 py-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-[rgba(0,191,255,0.1)] p-2 rounded-md mr-3">
          <Icon
            iconId={iconId || "faQuestionCircleLight"} // Use iconId, provide a default fallback
            className="h-5 w-5 text-[var(--accent-color)]"
            aria-hidden="true"
          />
        </div>
        <div>
          <CardTitle className="text-[var(--primary-color)] font-semibold font-sora">{title}</CardTitle>
          {description && <CardDescription className="text-[var(--secondary-color)] text-sm mt-1">{description}</CardDescription>}
        </div>
      </div>
      {actions && <div className="flex space-x-2">
        {actions}
      </div>}
    </CardHeader>
    <CardContent className="px-4 py-5 sm:p-6 bg-white">
      {children}
    </CardContent>
  </Card>
);

// Add DataRow component before the main CampaignDetail component
interface DataRowProps {
  label: string;
  value: React.ReactNode;
  iconId?: string; // Made iconId primary
  tooltip?: string;
  featured?: boolean;
}

const DataRow = ({
  label,
  value,
  iconId, // Use iconId directly
  tooltip,
  featured = false
}: DataRowProps) => <div className={`flex ${featured ? 'py-3' : 'py-2'} font-work-sans`}>
    <div className="w-1/3 flex-shrink-0 font-work-sans">
      <div className="flex items-center text-[var(--secondary-color)] font-work-sans">
        {/* Use iconId directly */}
        {iconId && <span className="mr-2 flex-shrink-0 font-work-sans">
          <Icon
            iconId={iconId}
            className="h-4 w-4"
          />
        </span>}
        <span className={`${featured ? 'font-medium' : ''} font-work-sans`}>{label}</span>
        {tooltip && <span className="ml-1 cursor-help font-work-sans" title={tooltip}>
          {/* Assuming faCircleInfoLight exists */}
          {<Icon iconId="faCircleInfoLight" className="h-4 w-4 text-gray-400 font-work-sans" />}
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

    // Helper function to get audience percentage for visualization
    const getAgePercentage = (value: string): number => {
      if (value.includes('+')) {
        return 100; // Full for 65+
      }
      const parts = value.split('-');
      if (parts.length === 2) {
        return ((parseInt(parts[0]) + parseInt(parts[1])) / 2) / 65 * 100; // Normalize to percentage
      }
      return 0;
    };

    // Sorting age ranges by their numeric value
    const sortedAgeRanges = [...(audience.demographics.ageRange || [])].sort((a, b) => {
      const aValue = parseInt(a.split('-')[0] || a.replace('+', ''));
      const bValue = parseInt(b.split('-')[0] || b.replace('+', ''));
      return aValue - bValue;
    });

    return <DataCard title="Audience Demographics" iconId="faUserGroupLight" description="Target audience information for this campaign">
      <div className="space-y-6 font-work-sans">
        {/* Demographics Section */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start mb-4">
            <Icon iconId="faUserLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5" />
            <h3 className="font-medium text-gray-800 font-sora">Demographics</h3>
          </div>

          {/* Age Range */}
          <div className="mb-5">
            <h4 className="text-gray-700 font-medium mb-3 text-sm font-sora">Age Range</h4>
            <div className="grid grid-cols-6 gap-1">
              {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((range) => (
                <div
                  key={range}
                  className={`text-center py-1.5 text-xs rounded ${sortedAgeRanges.includes(range)
                    ? 'bg-[var(--accent-color)] text-white font-medium'
                    : 'bg-gray-100 text-gray-500'}`}
                >
                  {range}
                </div>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="mb-5">
            <h4 className="text-gray-700 font-medium mb-3 text-sm font-sora">Gender</h4>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.gender && audience.demographics.gender.length > 0 ? (
                audience.demographics.gender.map((gender, idx) => (
                  <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                    {gender}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Not specified</span>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="mb-5">
            <h4 className="text-gray-700 font-medium mb-3 text-sm font-sora">Education Level</h4>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.education && audience.demographics.education.length > 0 ? (
                audience.demographics.education.map((education, idx) => (
                  <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                    {education === 'some_college' ? 'Some College' :
                      education === 'professional' ? 'Professional Degree' :
                        education === 'bachelors' ? 'Bachelor\'s Degree' :
                          education === 'associates' ? 'Associate\'s Degree' :
                            education === 'high_school' ? 'High School' :
                              education === 'graduate' ? 'Graduate Degree' : education}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Not specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start mb-4">
            <Icon iconId="faMapLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5" />
            <h3 className="font-medium text-gray-800 font-sora">Location</h3>
          </div>

          {/* Locations */}
          <div className="mb-5">
            <h4 className="text-gray-700 font-medium mb-3 text-sm font-sora">Locations</h4>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.locations && audience.demographics.locations.length > 0 ? (
                audience.demographics.locations.map((location, idx) => (
                  <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                    {location}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Not specified</span>
              )}
            </div>
          </div>

          {/* Languages */}
          <div className="mb-5">
            <h4 className="text-gray-700 font-medium mb-3 text-sm font-sora">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.languages && audience.demographics.languages.length > 0 ? (
                audience.demographics.languages.map((language, idx) => (
                  <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                    {language}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Not specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Interests Section */}
        {audience.demographics.interests && audience.demographics.interests.length > 0 && (
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start mb-4">
              <Icon iconId="faChartPieLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5" />
              <h3 className="font-medium text-gray-800 font-sora">Interests & Job Titles</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {audience.demographics.interests.map((interest, idx) => (
                <span key={idx} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DataCard>;
  };

// Add this Step5-style Asset Preview component 
const CampaignDetailAssetPreview = ({
  url,
  fileName,
  type,
  className = ''
}: { url: string; fileName: string; type: string; className?: string; }) => {
  const isVideo = type === 'video' || typeof type === 'string' && type.includes('video');
  const isImage = type === 'image' || typeof type === 'string' && type.includes('image');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Toggle play/pause when the button is clicked or video area is clicked
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .catch(error => {
          console.warn('Play was prevented:', error);
        });
      setIsPlaying(true);
    }
  };

  // Update play state based on video events
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [isVideo]);

  // Effect to handle video autoplay and looping
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      // Auto-play the video when component mounts
      const playVideo = () => {
        video.play().catch(error => {
          console.warn('Auto-play was prevented:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      };

      // Handle video looping - restart after 5 seconds or when ended
      const handleTimeUpdate = () => {
        if (video.currentTime >= 5) {
          video.currentTime = 0;
          if (isPlaying) {
            video.play().catch(err => {
              console.error('Error replaying video:', err);
              setIsPlaying(false);
            });
          }
        }
      };

      const handleEnded = () => {
        video.currentTime = 0;
        if (isPlaying) {
          video.play().catch(err => {
            console.error('Error replaying video:', err);
            setIsPlaying(false);
          });
        }
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
  }, [isVideo, url, isPlaying]);

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image preview */}
      {isImage && <img src={url} alt={fileName} className="w-full h-full object-cover" />}

      {/* Video preview with play/pause button */}
      {isVideo && (
        <div className="relative w-full h-full" onClick={togglePlayPause}>
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
            loop
          />

          {/* Play/Pause button that appears on hover */}
          {isVideo && isHovering && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-200">
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all duration-200 z-10 absolute"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <Icon
                  name={isPlaying ? "faPause" : "faPlay"}
                  className="h-6 w-6 text-white"
                  iconType="button"
                  solid={true}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && (
        <div className="flex items-center justify-center p-8">
          <Icon iconId="faInfoLight" className="h-12 w-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};

// Add new components for missing sections
const ObjectivesSection: React.FC<{
  campaign: CampaignDetail;
}> = ({
  campaign
}) => <DataCard title="Campaign Objectives" iconId="lightning" description="Key objectives and performance indicators">

      <div className="space-y-6 font-work-sans">
        {/* Primary KPI with enhanced styling */}
        <div className="bg-white rounded-lg p-4 font-work-sans border border-gray-100 shadow-sm">
          <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Primary KPI</h4>
          {campaign.primaryKPI ? (
            <div className="bg-[var(--accent-color)] text-white px-3 py-2 rounded-md inline-flex items-center">
              <div className="w-6 h-6 mr-2 filter brightness-0 invert">
                <Image
                  src={kpiIconsMap[campaign.primaryKPI as keyof typeof kpiIconsMap]?.icon || "/icons/kpis/Brand_Awareness.svg"}
                  alt={formatKpiName(campaign.primaryKPI)}
                  width={24}
                  height={24}
                />
              </div>
              <span className="font-medium">{formatKpiName(campaign.primaryKPI)}</span>
            </div>
          ) : (
            <div className="text-gray-500">Not specified</div>
          )}
        </div>

        {/* Secondary KPIs with enhanced styling */}
        {campaign.secondaryKPIs && campaign.secondaryKPIs.length > 0 && (
          <div className="bg-white rounded-lg p-4 font-work-sans border border-gray-100 shadow-sm">
            <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Secondary KPIs</h4>
            <div className="flex flex-wrap gap-2 font-work-sans">
              {campaign.secondaryKPIs.map((kpi, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md inline-flex items-center">
                  <div className="w-5 h-5 mr-2">
                    <Image
                      src={kpiIconsMap[kpi as keyof typeof kpiIconsMap]?.icon || "/icons/kpis/Brand_Awareness.svg"}
                      alt={formatKpiName(kpi)}
                      width={20}
                      height={20}
                    />
                  </div>
                  <span>{formatKpiName(kpi)}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Messaging Section with enhanced icons and styling */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="font-medium text-gray-800 mb-4 font-sora">Messaging</h3>

          {/* Main Message */}
          <div className="space-y-6">
            <div className="flex items-start">
              <Icon iconId="faCommentDotsLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 mb-1 block">Main Message</span>
                <span className="text-base text-gray-800 block">{campaign.mainMessage || 'Not specified'}</span>
              </div>
            </div>

            {/* Hashtags */}
            <div className="flex items-start">
              <Icon iconId="faTagLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 mb-1 block">Hashtags</span>
                <span className="text-base text-gray-800 block">{campaign.hashtags || 'Not specified'}</span>
              </div>
            </div>

            {/* Memorability Score */}
            <div className="flex items-start">
              <Icon iconId="faStarLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 mb-1 block">Memorability Score</span>
                <span className="text-base text-gray-800 block">{campaign.memorability || 'Not specified'}</span>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="flex items-start">
              <Icon iconId="faCircleCheckLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 mb-1 block">Key Benefits</span>
                <span className="text-base text-gray-800 block">{campaign.keyBenefits || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <h3 className="font-medium text-gray-800 mt-8 mb-4 font-sora">Expected Outcomes</h3>

          {/* Expected Achievements */}
          <div className="space-y-6">
            <div className="flex items-start">
              <Icon iconId="faArrowTrendUpLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 mb-1 block">Expected Achievements</span>
                <span className="text-base text-gray-800 block">{campaign.expectedAchievements || 'Not specified'}</span>
              </div>
            </div>

            {/* Impact on Purchase Intent */}
            <div className="flex items-start">
              <Icon iconId="faDollarSignLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 mb-1 block">Impact on Purchase Intent</span>
                <span className="text-base text-gray-800 block">{campaign.purchaseIntent || 'Not specified'}</span>
              </div>
            </div>

            {/* Brand Perception Change */}
            <div className="flex items-start">
              <Icon iconId="faChartBarLight" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 mb-1 block">Brand Perception Change</span>
                <span className="text-base text-gray-800 block">{campaign.brandPerception || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DataCard>;
const AudienceInsightsSection: React.FC<{
  audience: CampaignDetail['audience'] | null;
}> = ({
  audience
}) => {
    if (!audience) return null; // Early return if no audience data

    return <DataCard title="Audience Insights" iconId="userCircle" className="col-span-2">
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
}) => <DataCard title="Creative Requirements" iconId="documentText" description="Campaign creative specifications">

      <div className="space-y-2 font-work-sans">
        {requirements && requirements.length > 0 ? requirements.map((req) => <div key={req.requirement} className="p-3 bg-gray-50 rounded-lg flex items-start font-work-sans">
          {<Icon iconId="faFileLight" className="w-5 h-5 text-gray-400 mr-3 mt-0.5 font-work-sans" />}
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
const CampaignStatusBadge = ({ status }: { status?: string; }) => {
  let statusColor = "bg-gray-100 text-gray-700";
  let statusIcon = <Icon iconId="faCircleQuestionLight" className="h-4 w-4 mr-1" />;

  switch (status?.toLowerCase()) {
    case 'draft':
      statusColor = "bg-yellow-50 text-yellow-700";
      statusIcon = <Icon iconId="faPencilLight" className="h-4 w-4 mr-1" />;
      break;
    case 'submitted':
      statusColor = "bg-blue-50 text-blue-700";
      statusIcon = <Icon iconId="faPaperPlaneLight" className="h-4 w-4 mr-1" />;
      break;
    case 'pending':
      statusColor = "bg-orange-50 text-orange-700";
      statusIcon = <Icon iconId="faClockLight" className="h-4 w-4 mr-1" />;
      break;
    case 'approved':
      statusColor = "bg-green-50 text-green-700";
      statusIcon = <Icon iconId="faCircleCheckLight" className="h-4 w-4 mr-1" />;
      break;
    case 'rejected':
      statusColor = "bg-red-50 text-red-700";
      statusIcon = <Icon iconId="faCircleXmarkLight" className="h-4 w-4 mr-1" />;
      break;
    case 'error':
      statusColor = "bg-red-50 text-red-700";
      statusIcon = <Icon iconId="faTriangleExclamationLight" className="h-4 w-4 mr-1" />;
      break;
    case 'active':
      statusColor = "bg-green-50 text-green-700";
      statusIcon = <Icon iconId="faPlayLight" className="h-4 w-4 mr-1" />;
      break;
    case 'completed':
      statusColor = "bg-purple-50 text-purple-700";
      statusIcon = <Icon iconId="faFlagLight" className="h-4 w-4 mr-1" />;
      break;
    default:
      statusColor = "bg-gray-100 text-gray-700";
      statusIcon = <Icon iconId="faCircleQuestionLight" className="h-4 w-4 mr-1" />;
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
const ErrorStatusBadge = ({ message }: { message: string; }) => {
  return <div className="inline-flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-work-sans">
    <Icon iconId="faTriangleExclamationLight" className="h-4 w-4 mr-2" />
    <span className="font-work-sans">{message}</span>
  </div>;
};

export default function CampaignDetail() {
  const params = useParams();
  const router = useRouter();
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
      debugLog({ type: 'LIFECYCLE', message: 'fetchData called', data: { id: params?.id } });
      if (!params?.id) {
        setError(new Error('Campaign ID is missing'));
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
    if (params?.id) {
      fetchData();
    }
  }, [params?.id, useFallbackData]); // Remove testMode and fallbackData to prevent extra rerenders

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
        <Skeleton
          title={true}
          titleWidth="w-1/4"
          actionButton={true}
          lines={3}
          className="mb-6" />


        {/* Objectives Section */}
        <Skeleton
          title={true}
          titleWidth="w-1/3"
          actionButton={true}
          lines={4}
          className="mb-6" />


        {/* Audience Section */}
        <Skeleton
          title={true}
          titleWidth="w-1/4"
          actionButton={true}
          lines={3}
          className="mb-6" />


        {/* Creative Assets Section */}
        <Skeleton
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
    <div className={`${error ? 'bg-red-50' : 'bg-white'} border-b border-[var(--divider-color)] font-work-sans shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-work-sans">
        {error && <div className="mb-4 font-work-sans">
          <ErrorStatusBadge message={error} />
        </div>}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between font-work-sans">
          <div className="flex items-center space-x-4 font-work-sans">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group font-work-sans"
              aria-label="Go back"
            >
              <Icon iconId="faChevronLeftLight"
                className="h-5 w-5 text-[var(--secondary-color)] group-hover:text-[var(--primary-color)] transition-colors duration-200 font-work-sans"

              />
            </button>
            <div className="font-work-sans">
              <h1 className="text-xl font-bold text-[var(--primary-color)] sm:text-2xl font-sora">{data?.campaignName || "N/A"}</h1>
              <div className="flex items-center text-[var(--secondary-color)] text-sm mt-1 font-work-sans">
                <CampaignStatusBadge status={error ? "error" : data?.submissionStatus} />
                <span className="mx-2 font-work-sans text-gray-400">•</span>
                <span className="font-work-sans">Created on {data?.createdAt ? formatDate(data.createdAt) : "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0 font-work-sans">
            <button className="inline-flex items-center px-3 py-2 border border-[var(--divider-color)] rounded-md text-sm font-medium text-[var(--secondary-color)] bg-white hover:bg-gray-50 transition-colors duration-200 group font-work-sans">
              <Icon iconId="faPrintLight" className="h-4 w-4 mr-2 group-hover:text-[var(--accent-color)]" />
              <span className="font-work-sans">Print</span>
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-[var(--divider-color)] rounded-md text-sm font-medium text-[var(--secondary-color)] bg-white hover:bg-gray-50 transition-colors duration-200 group font-work-sans">
              <Icon iconId="faShareLight" className="h-4 w-4 mr-2 group-hover:text-[var(--accent-color)]" />
              <span className="font-work-sans">Share</span>
            </button>
            <button
              onClick={() => router.push(`/campaigns/wizard/step-1?id=${data?.id}`)}
              className="inline-flex items-center px-4 py-2 border border-[var(--primary-color)] rounded-md text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[#222222] transition-colors duration-200 group shadow-sm font-work-sans"
              disabled={!!error}
            >
              <Icon iconId="faPenToSquareSolid" className="h-4 w-4 mr-2 text-white !text-white" />
              <span className="font-work-sans">Edit Campaign</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-work-sans">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 font-work-sans">
        <CampaignMetricCard
          title="Total Budget"
          value={error ? "N/A" : data?.totalBudget || 0}
          iconId="dollarSign"
          format={error ? "text" : "currency"}
        />
        <CampaignMetricCard
          title="Campaign Duration"
          value={error ? "N/A" : calculateDuration(data?.startDate || "", data?.endDate || "")}
          iconId="calendar"
        />
      </div>

      {/* Campaign Details & Primary Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-work-sans">
        <DataCard title="Campaign Details" iconId="documentText" description="Basic campaign information">
          <div className="space-y-3 font-work-sans">
            <DataRow label="Campaign Name" value={error ? "N/A" : data?.campaignName || "N/A"} featured={true} />
            <DataRow label="Description" value={error ? "N/A" : data?.description || "N/A"} />
            <DataRow label="Brand Name" value={error ? "N/A" : data?.brandName || "N/A"} />
            <DataRow label="Start Date" value={error ? "N/A" : data?.startDate ? formatDate(data.startDate) : "N/A"} iconId="calendar" />
            <DataRow label="End Date" value={error ? "N/A" : data?.endDate ? formatDate(data.endDate) : "N/A"} iconId="calendar" />
            <DataRow label="Time Zone" value={error ? "N/A" : data?.timeZone || "N/A"} iconId="clock" />
            <DataRow label="Currency" value={error ? "N/A" : safeCurrency(data?.currency)} iconId="dollarSign" />
            <DataRow label="Total Budget" value={error ? "N/A" : formatCurrency(data?.totalBudget || 0, data?.currency)} iconId="dollarSign" featured={true} />
            <DataRow label="Social Media Budget" value={error ? "N/A" : formatCurrency(data?.socialMediaBudget || 0, data?.currency)} iconId="dollarSign" />
            <DataRow label="Website" value={error ? "N/A" : data?.website || "N/A"} iconId="globe" />
          </div>
        </DataCard>

        <DataCard title="Primary Contact" iconId="userCircle" description="Primary point of contact for this campaign">
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
            </a>} iconId="mail" />

            <DataRow label="Position" value={error ? "N/A" : data?.primaryContact?.position || "N/A"} iconId="building" />
          </div>

          {!error && data?.secondaryContact && <div className="mt-6 pt-6 border-t border-[var(--divider-color)] font-work-sans">
            <h4 className="text-[var(--primary-color)] font-medium mb-3 font-sora">Secondary Contact</h4>
            <div className="space-y-3 font-work-sans">
              <DataRow label="Name" value={`${data.secondaryContact.firstName} ${data.secondaryContact.surname}`} iconId="userCircle" />
              <DataRow label="Email" value={<a href={`mailto:${data.secondaryContact.email}`} className="text-[var(--accent-color)] hover:underline font-work-sans">
                {data.secondaryContact.email}
              </a>} iconId="mail" />
              <DataRow label="Position" value={data.secondaryContact.position} iconId="building" />
            </div>
          </div>}
        </DataCard>
      </div>

      {/* Objectives & Audience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-work-sans">
        {error ? <DataCard title="Campaign Objectives" iconId="lightning" description="Key objectives and performance indicators">
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
              <DataRow label="Main Message" value="N/A" iconId="lightBulb" />
              <DataRow label="Brand Perception" value="N/A" iconId="chart" />
              <DataRow label="Hashtags" value="N/A" iconId="tag" />
              <DataRow label="Key Benefits" value="N/A" iconId="circleCheck" />
              <DataRow label="Memorability" value="N/A" iconId="bookmark" />
              <DataRow label="Expected Achievements" value="N/A" iconId="trendUp" />
              <DataRow label="Purchase Intent" value="N/A" iconId="dollarSign" />
            </div>
          </div>
        </DataCard> : data && <ObjectivesSection campaign={data} />}

        {error ? <DataCard title="Target Audience" iconId="userGroup" description="Detailed audience targeting information">
          <div className="text-center py-10 text-[var(--secondary-color)] font-work-sans">
            <p className="font-work-sans">N/A</p>
          </div>
        </DataCard> : data && <AudienceSection audience={data.audience} />}
      </div>

      {/* Creative Assets */}
      <div className="mb-6 font-work-sans">
        <DataCard title="Creative Assets" iconId="photo" description="Campaign creative assets" actions={<button className="text-sm text-[var(--accent-color)] hover:text-[var(--accent-color)] hover:underline font-work-sans">View All</button>}>
          {error ? <div className="text-center py-10 text-[var(--secondary-color)] font-work-sans">
            {<Icon iconId="faImageLight" className="h-10 w-10 mx-auto mb-2 opacity-50" />}
            <p className="font-work-sans">No creative assets available</p>
          </div> :
            <div>
              {data && data.creativeAssets && Array.isArray(data.creativeAssets) && data.creativeAssets.length > 0 ?
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-work-sans">
                  {data.creativeAssets.map((asset: any, index: number) =>
                    <AssetCard
                      key={asset.id || index}
                      asset={{
                        id: asset.id,
                        name: asset.assetName || asset.name,
                        url: asset.url,
                        type: asset.type,
                        platform: asset.platform || data.platform,
                        influencerHandle: asset.influencerHandle || data.influencerHandle,
                        description: asset.description || asset.whyInfluencer,
                        budget: asset.budget,
                        size: asset.size,
                        duration: asset.duration
                      }}
                      currency={data.currency}
                      defaultPlatform={data.platform}
                      className="font-work-sans"
                    />
                  )}
                </div>
                :
                <div className="text-center py-8 text-[var(--secondary-color)] font-work-sans">
                  <Icon iconId="faImageLight" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-work-sans">No creative assets uploaded yet</p>
                </div>
              }
            </div>
          }
        </DataCard>
      </div>

      {/* Campaign Features */}
      <div className="mb-6 font-work-sans">
        <DataCard title="Campaign Features" iconId="bolt" description="Additional features enabled for this campaign">
          {error ? <div className="text-center py-8 text-[var(--secondary-color)] font-work-sans">
            <p className="font-work-sans">N/A</p>
          </div> :
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-work-sans">
              {data?.features && data.features.length > 0 ?
                data.features.map((feature: string, index: number) => {
                  const featureKey = feature as keyof typeof featureIconsMap;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white p-4 transform hover:-translate-y-1 duration-200 hover:border-[var(--accent-color)]">
                      <div className="flex items-start">
                        <div className="rounded-md flex-shrink-0 p-2 bg-[rgba(0,191,255,0.1)]">
                          {featureIconsMap[featureKey] ?
                            <Image
                              src={featureIconsMap[featureKey].icon}
                              width={28}
                              height={28}
                              alt={featureIconsMap[featureKey].title}
                              className="w-7 h-7"
                            /> :
                            <Icon iconId="faBoltLight"
                              className="h-7 w-7 text-[var(--accent-color)]"

                            />
                          }
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium text-[var(--primary-color)] font-sora text-lg mb-1">
                            {featureIconsMap[featureKey]?.title || formatFeatureName(feature)}
                          </h4>
                          <p className="text-sm text-[var(--secondary-color)] mt-1 font-work-sans">
                            {getFeatureDescription(feature)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }) :
                <div className="col-span-3 text-center py-8 text-[var(--secondary-color)] font-work-sans">
                  <Icon iconId="faBoltLight" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-work-sans">No features enabled for this campaign</p>
                </div>
              }
            </div>
          }
        </DataCard>
      </div>
    </div>
  </div>;
}
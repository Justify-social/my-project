'use client'

import React, { useEffect, useState, Suspense, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { Analytics } from '@/lib/analytics/analytics'
import ErrorFallback from '@/components/ErrorFallback'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { useSidebar } from '@/providers/SidebarProvider'
import { 
  CalendarIcon, 
  CurrencyDollarIcon,
  UserCircleIcon,
  ChartBarIcon,
  GlobeAltIcon,
  HashtagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  SparklesIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  PrinterIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  TagIcon,
  FolderIcon,
  CubeIcon,
  UsersIcon,
  LightBulbIcon,
  PaintBrushIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  PaperAirplaneIcon,
  PauseIcon,
  CheckBadgeIcon,
  PlayIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Image from 'next/image';
import Link from 'next/link';
// Import Currency from shared types
import { Currency, Platform, Position } from '@/components/Wizard/shared/types';

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
  advocacy = 'advocacy'
}

enum Feature {
  CREATIVE_ASSET_TESTING = 'CREATIVE_ASSET_TESTING',
  BRAND_LIFT = 'BRAND_LIFT',
  BRAND_HEALTH = 'BRAND_HEALTH',
  MIXED_MEDIA_MODELLING = 'MIXED_MEDIA_MODELLING'
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
  };
  creativeAssets: any[];
  creativeRequirements: any[];
}

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
}

// Updated MetricCard component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: "up" | "down" | "none";
  subtext?: string;
  format?: "number" | "currency" | "percent" | "text";
}

const MetricCard = ({ title, value, icon: Icon, trend = "none", subtext, format = "text" }: MetricCardProps) => {
  let formattedValue = value;
  
  if (format === "currency" && typeof value === "number") {
    formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  } else if (format === "percent" && typeof value === "number") {
    formattedValue = `${value}%`;
  } else if (format === "number" && typeof value === "number") {
    formattedValue = new Intl.NumberFormat('en-US').format(value);
  }

  return (
    <div className="bg-white rounded-lg border border-[var(--divider-color)] shadow-sm p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-[rgba(0,191,255,0.1)] p-2 rounded-md">
            <Icon className="h-5 w-5 text-[var(--accent-color)]" aria-hidden="true" />
          </div>
          <span className="text-[var(--secondary-color)] font-medium text-sm">{title}</span>
        </div>
        
        {trend !== "none" && (
          <div className={`flex items-center ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
            {trend === "up" ? 
              <ArrowTrendingUpIcon className="h-4 w-4" /> : 
              <ArrowTrendingDownIcon className="h-4 w-4" />
            }
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <div className="text-[var(--primary-color)] font-bold text-2xl">{formattedValue}</div>
        {subtext && <div className="text-[var(--secondary-color)] text-xs mt-1">{subtext}</div>}
      </div>
    </div>
  );
};

// Enhanced components for better data display
interface DataCardProps {
  title: string;
  description?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className = '',
  actions
}) => (
  <div className={`bg-white rounded-lg border border-[var(--divider-color)] shadow-sm overflow-hidden transition-all hover:shadow-md ${className}`}>
    <div className="flex justify-between items-center border-b border-[var(--divider-color)] px-5 py-4">
      <div className="flex items-center space-x-3">
        <div className="bg-[rgba(0,191,255,0.1)] p-2 rounded-md">
          <Icon className="h-5 w-5 text-[var(--accent-color)]" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-[var(--primary-color)] font-semibold text-lg">{title}</h3>
          {description && <p className="text-[var(--secondary-color)] text-sm mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex space-x-2">
          {actions}
        </div>
      )}
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Add DataRow component before the main CampaignDetail component
interface DataRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tooltip?: string;
  featured?: boolean;
}

const DataRow = ({ label, value, icon: Icon, tooltip, featured = false }: DataRowProps) => (
  <div className={`flex justify-between items-center py-3 ${featured ? 'bg-[rgba(0,191,255,0.05)] px-3 rounded-md' : ''}`}>
    <div className="flex items-center space-x-2">
      {Icon && <Icon className="h-4 w-4 text-[var(--secondary-color)]" aria-hidden="true" />}
      <span className="text-[var(--secondary-color)] font-medium text-sm">
        {label}
        {tooltip && (
          <span className="inline-block ml-1 cursor-help" title={tooltip}>
            <InformationCircleIcon className="h-4 w-4 text-[var(--secondary-color)] inline opacity-70" />
          </span>
        )}
      </span>
    </div>
    <div className={`text-[var(--primary-color)] ${featured ? 'font-semibold' : 'font-medium'}`}>
      {value || 'N/A'}
    </div>
  </div>
);

// Add new components for enhanced sections
const AudienceSection: React.FC<{ audience: CampaignDetail['audience'] | null }> = ({ audience }) => {
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
  const sortedAgeRanges = [...(audience.demographics.ageRange || [])].sort(
    (a, b) => getNumericValue(a) - getNumericValue(b)
  );

  return (
    <DataCard 
      title="Target Audience" 
      icon={UsersIcon}
      description="Detailed audience targeting information"
    >
      <div className="space-y-5">
        <div>
          <h4 className="text-[var(--primary-color)] font-medium mb-3">Location</h4>
          <div className="flex flex-wrap gap-2">
            {audience.demographics.locations.map((location, index) => (
              <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                {location}
              </span>
            ))}
            {audience.demographics.locations.length === 0 && <span className="text-[var(--secondary-color)]">No locations specified</span>}
          </div>
        </div>

        <div>
          <h4 className="text-[var(--primary-color)] font-medium mb-3">Age Range</h4>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map(range => (
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

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-[var(--primary-color)] font-medium mb-3">Gender</h4>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.gender.map((gender, index) => (
                <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                  {gender}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[var(--primary-color)] font-medium mb-3">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.languages.map((language, index) => (
                <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                  {language}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[var(--primary-color)] font-medium mb-3">Education Level</h4>
          <div className="flex flex-wrap gap-2">
            {audience.demographics.education.map((education, index) => (
              <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                {education === 'some_college' ? 'Some College' : 
                 education === 'professional' ? 'Professional Degree' :
                 education === 'bachelors' ? 'Bachelor\'s Degree' :
                 education === 'associates' ? 'Associate\'s Degree' :
                 education === 'high_school' ? 'High School' :
                 education === 'graduate' ? 'Graduate Degree' : education}
              </span>
            ))}
          </div>
        </div>

        {audience.demographics.interests.length > 0 && (
          <div>
            <h4 className="text-[var(--primary-color)] font-medium mb-3">Interests/Job Titles</h4>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.interests.map((interest, index) => (
                <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DataCard>
  );
};

const CreativeAssetsGallery: React.FC<{ assets: CampaignDetail['creativeAssets'] }> = ({ assets }) => (
  <DataCard 
    title="Creative Assets" 
    icon={PhotoIcon}
    description="Campaign creative assets"
    actions={<button className="text-sm text-[var(--accent-color)] hover:text-[var(--accent-color)] hover:underline">View All</button>}
  >
    {assets.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {assets.slice(0, 6).map((asset, index) => (
          <div key={index} className="rounded-lg overflow-hidden border border-[var(--divider-color)] bg-gray-50 aspect-square relative group">
            {asset.type === 'video' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayIcon className="h-12 w-12 text-white opacity-70" />
                <div className="absolute inset-0 bg-black opacity-40"></div>
              </div>
            ) : null}
            <img 
              src={asset.url || '/placeholder-image.jpg'} 
              alt={asset.name}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm font-medium truncate">{asset.name}</p>
              {asset.duration && <p className="text-white text-xs">{asset.duration}s</p>}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-10 text-[var(--secondary-color)]">
        <PhotoIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>No creative assets available</p>
      </div>
    )}
  </DataCard>
);

// Add new components for missing sections
const ObjectivesSection: React.FC<{ campaign: CampaignDetail }> = ({ campaign }) => (
  <DataCard 
    title="Campaign Objectives" 
    icon={SparklesIcon}
    description="Key objectives and performance indicators"
  >
    <div className="space-y-5">
      <div>
        <h4 className="text-[var(--primary-color)] font-medium mb-3">Primary KPI</h4>
        <div className={`kpi-${campaign.primaryKPI?.toLowerCase() || 'brand-awareness'} flex items-center text-lg font-medium text-[var(--accent-color)]`}>
          {campaign.primaryKPI === 'adRecall' && <SparklesIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI === 'brandAwareness' && <LightBulbIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI === 'consideration' && <ChartBarIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI === 'messageAssociation' && <HashtagIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI === 'brandPreference' && <ChartBarIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI === 'purchaseIntent' && <CurrencyDollarIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI === 'actionIntent' && <PaperAirplaneIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI === 'recommendationIntent' && <ShareIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI === 'advocacy' && <UserCircleIcon className="h-5 w-5 mr-2" />}
          {campaign.primaryKPI ? campaign.primaryKPI.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : 'Brand Awareness'}
        </div>
      </div>

      {campaign.secondaryKPIs.length > 0 && (
        <div>
          <h4 className="text-[var(--primary-color)] font-medium mb-3">Secondary KPIs</h4>
          <div className="flex flex-wrap gap-2">
            {campaign.secondaryKPIs.map((kpi, index) => (
              <span key={index} className="bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-3 py-1 rounded-full text-sm">
                {kpi.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <DataRow label="Main Message" value={campaign.mainMessage} />
        <DataRow label="Brand Perception" value={campaign.brandPerception} />
        <DataRow label="Hashtags" value={campaign.hashtags} icon={HashtagIcon} />
        <DataRow label="Key Benefits" value={campaign.keyBenefits} />
        <DataRow label="Memorability" value={campaign.memorability} />
        <DataRow label="Expected Achievements" value={campaign.expectedAchievements} />
        <DataRow label="Purchase Intent" value={campaign.purchaseIntent} />
      </div>
    </div>
  </DataCard>
);

const AudienceInsightsSection: React.FC<{ audience: CampaignDetail['audience'] | null }> = ({ audience }) => {
  if (!audience) return null; // Early return if no audience data

  return (
    <DataCard title="Audience Insights" icon={UserCircleIcon} className="col-span-2">
      <div className="grid grid-cols-2 gap-8">
        {/* Screening Questions */}
        <div>
          <h3 className="text-lg font-medium mb-4">Screening Questions</h3>
          <div className="space-y-2">
            {audience.demographics.interests.map((interest) => (
              <div key={interest} className="p-3 bg-gray-50 rounded-lg">
                {interest}
              </div>
            ))}
          </div>
        </div>
        
        {/* Competitors */}
        <div>
          <h3 className="text-lg font-medium mb-4">Competitors</h3>
          <div className="flex flex-wrap gap-2">
            {audience.demographics.interests.map((interest) => (
              <span key={interest} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DataCard>
  );
};

// Add Creative Requirements Section
const CreativeRequirementsSection: React.FC<{ requirements: CampaignDetail['creativeRequirements'] }> = ({ requirements }) => (
  <DataCard title="Creative Requirements" icon={DocumentTextIcon} className="col-span-2">
    <div className="space-y-2">
      {requirements && requirements.length > 0 ? (
        requirements.map((req) => (
          <div key={req.requirement} className="p-3 bg-gray-50 rounded-lg flex items-start">
          <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
          <span className="text-gray-700">{req.requirement}</span>
        </div>
        ))
      ) : (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-gray-500 italic">No requirements specified</p>
        </div>
      )}
    </div>
  </DataCard>
);

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
    this.operations.push({ ...operation, timestamp: Date.now() });
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
    StringOperationTracker.track({ operation, value, source });

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
  return Boolean(
    value != null && 
    typeof value === 'object' && 
    typeof (value as any)[Symbol.iterator] === 'function'
  );
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

  String.prototype.toString = function() {
    console.log('toString called on:', this);
    return originalToString.call(this);
  };

  String.prototype.toUpperCase = function() {
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
    return { isValid: false, errors };
  }

  // Required fields
  const requiredFields = [
    'id',
    'campaignName',
    'startDate',
    'endDate',
    'currency',
    'totalBudget',
    'platform',
    'submissionStatus'
  ];

  requiredFields.forEach(field => {
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

const StatusBadge = ({ status = "draft", size = "md", className = "" }: StatusBadgeProps) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";
  let icon = null;
  let statusText = "Draft";

  const safeStatus = status?.toLowerCase() || "draft";

  switch(safeStatus) {
    case "submitted":
    case "live":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
      statusText = "Live";
      break;
    case "paused":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      icon = <PauseIcon className="h-4 w-4 mr-1" />;
      statusText = "Paused";
      break;
    case "completed":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      icon = <CheckBadgeIcon className="h-4 w-4 mr-1" />;
      statusText = "Completed";
      break;
    case "draft":
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-700";
      icon = <PencilSquareIcon className="h-4 w-4 mr-1" />;
      statusText = "Draft";
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full ${bgColor} ${textColor} ${size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"} font-medium ${className}`}>
      {icon}
      {statusText}
    </span>
  );
};

// Add component testing utility
// This should be placed near the top with other utility functions
const componentTester = {
  testComponentProps<T extends Record<string, any>>(
    componentName: string,
    props: T,
    requiredProps: Array<keyof T> = []
  ): void {
    if (DEBUG) {
      console.group(`🧪 Testing ${componentName} props`);
      
      // Test for undefined required props
      const missingProps = requiredProps.filter(prop => props[prop] === undefined);
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
}: DetailSectionProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 ${className}`}
  >
    <div className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center">
          <div className="bg-blue-50 p-2.5 rounded-lg mr-3">
            <Icon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
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
    </div>
  </motion.section>
);

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
      console.warn('🛡️ Safety Mode: Accessed undefined/null value, using fallback', { fallback });
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
    const testCases = [
      { fieldName: 'submissionStatus', testData: { ...data, submissionStatus: undefined } },
      { fieldName: 'campaignName', testData: { ...data, campaignName: undefined } },
      { fieldName: 'brandName', testData: { ...data, brandName: undefined } },
      { fieldName: 'id', testData: { ...data, id: undefined } },
      { fieldName: 'totalBudget', testData: { ...data, totalBudget: undefined } },
      { fieldName: 'currency', testData: { ...data, currency: undefined } },
      { fieldName: 'startDate', testData: { ...data, startDate: undefined } },
      { fieldName: 'endDate', testData: { ...data, endDate: undefined } },
      { fieldName: 'primaryKPI', testData: { ...data, primaryKPI: undefined } },
      { fieldName: 'features', testData: { ...data, features: undefined } },
    ];
    
    console.log(`Running ${testCases.length} stress tests for null fields...`);
    
    // Test each case to see if it would cause errors
    testCases.forEach(({ fieldName, testData }) => {
      try {
        // Test accessing specific properties that could cause errors
        if (fieldName === 'submissionStatus') {
          // Test status badge with undefined status
          const safeStatus = typeof testData.submissionStatus === 'string' && testData.submissionStatus 
            ? testData.submissionStatus.toLowerCase() 
            : 'draft';
          console.log(`Testing StatusBadge with missing ${fieldName}: ${safeStatus}`);
        }
        
        if (fieldName === 'id') {
          // Test ID substring that could throw error
          const idDisplay = testData.id ? testData.id.substring(0, 8) : 'N/A';
          console.log(`Testing ID substring with missing ${fieldName}: ${idDisplay}`);
        }
        
        if (fieldName === 'startDate' || fieldName === 'endDate') {
          // Test date formatting
          const formattedDate = fieldName === 'startDate' 
            ? (testData.startDate ? formatDate(testData.startDate) : 'Not set')
            : (testData.endDate ? formatDate(testData.endDate) : 'Not set');
          console.log(`Testing date formatting with missing ${fieldName}: ${formattedDate}`);
          
          // Test duration calculation if applicable
          if (testData.startDate && testData.endDate) {
            const duration = calculateDuration(testData.startDate, testData.endDate);
            console.log(`Testing duration with ${fieldName}: ${duration}`);
          }
        }
        
        if (fieldName === 'totalBudget' || fieldName === 'currency') {
          // Test currency formatting
          const budget = testData.totalBudget !== undefined 
            ? formatCurrency(testData.totalBudget, testData.currency) 
            : 'N/A';
          console.log(`Testing currency formatting with missing ${fieldName}: ${budget}`);
        }
        
        if (fieldName === 'features') {
          // Test features array mapping
          const featuresDisplay = testData.features && testData.features.length > 0
            ? `${testData.features.length} features`
            : 'No features';
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

export default function CampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const { isOpen } = useSidebar(); // Access sidebar state
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add a runtime test mode
  const [testMode, setTestMode] = useState(false);
  const [useFallbackData, setUseFallbackData] = useState(false);

  // Create fallback mock data for when API fails
  const fallbackData: CampaignDetail = {
    id: "mock-campaign-123",
    campaignName: "Sample Campaign",
    description: "This is a sample campaign used when API data cannot be loaded",
    startDate: "2023-07-01",
    endDate: "2023-09-30",
    timeZone: "UTC",
    currency: Currency.USD,
    totalBudget: 100000,
    socialMediaBudget: 45000,
    platform: Platform.Instagram,
    influencerHandle: "sampleinfluencer",
    website: "https://example.com",
    primaryContact: {
      firstName: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      position: Position.Manager,
      phone: "+1 (555) 123-4567"
    },
    brandName: "Sample Brand",
    category: "Technology",
    product: "Software",
    targetMarket: "Global",
    submissionStatus: "draft",
    primaryKPI: "brandAwareness",
    secondaryKPIs: [KPI.adRecall, KPI.consideration],
    mainMessage: "Experience the future of technology",
    hashtags: "#SampleTech #Innovation",
    memorability: "High",
    keyBenefits: "Increased productivity, time savings",
    expectedAchievements: "Market penetration and brand awareness",
    purchaseIntent: "Increase by 15%",
    brandPerception: "Innovation leader",
    features: [Feature.BRAND_LIFT, Feature.CREATIVE_ASSET_TESTING],
    audience: {
      demographics: {
        ageRange: ["25", "35", "20", "15", "5", "0"],
        gender: ["Male", "Female"],
        education: ["College", "Graduate"],
        income: ["Middle", "Upper-middle"],
        interests: ["Technology", "Innovation", "Digital products"],
        locations: ["United States", "Europe", "Asia"],
        languages: ["English", "Spanish", "French"]
      }
    },
    creativeAssets: [
      {
        name: "Product Demo",
        type: "video",
        url: "https://example.com/demo.mp4",
        size: 5000,
        duration: 45
      },
      {
        name: "Marketing Image",
        type: "image",
        url: "https://via.placeholder.com/800x600",
        size: 250
      }
    ],
    creativeRequirements: [
      {
        requirement: "All videos must be under 60 seconds",
        description: "Keep videos concise for social media"
      },
      {
        requirement: "Brand logo must be clearly visible",
        description: "Ensure brand recognition"
      }
    ],
    createdAt: "2023-06-15T10:00:00Z",
    updatedAt: "2023-06-20T15:30:00Z"
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
        setData(fallbackData);
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
          console.warn('Empty API response received. Using fallback data.');
          setData(fallbackData);
          setError('API returned empty data. Using sample data for display purposes.');
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
          platform: (result.influencers && result.influencers[0]?.platform) 
            ? result.influencers[0].platform 
            : (result.platform || 'Instagram'),
          submissionStatus: result.status?.toLowerCase() || result.submissionStatus || 'draft'
        };
        
        console.log('Mapped result for validation:', mappedResult);
        
        // Validate data
        const validation = validateCampaignData(mappedResult);
        if (!validation.isValid) {
          console.error('Invalid campaign data received', result, validation.errors);
          
          // Use fallback data but display the validation error
          console.warn('Using fallback data due to validation errors');
          setData(fallbackData);
          setError(`Using sample data for display. API validation errors: ${validation.errors.join(', ')}`);
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
              ageRange: result.demographics?.ageDistribution 
                ? Object.entries(result.demographics.ageDistribution)
                    .filter(([_, value]) => Number(value) > 0)
                    .map(([key]) => key.replace('age', '').replace('plus', '+'))
                : ['18-24', '25-34'],
              gender: result.demographics?.gender || ['All'],
              education: result.demographics?.educationLevel ? [result.demographics.educationLevel] : ['All'],
              income: result.demographics?.incomeLevel ? [result.demographics.incomeLevel.toString()] : ['All'],
              interests: result.demographics?.jobTitles || [],
              locations: result.locations ? result.locations.map((loc: any) => loc.location || '') : [],
              languages: result.targeting?.languages 
                ? result.targeting.languages.map((lang: any) => lang.language || '')
                : ['English']
            }
          },
          
          // Creative Assets (placeholder logic)
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
        
        // Use fallback data on error
        console.warn('Using fallback data due to API error');
        setData(fallbackData);
        
        if (err instanceof Error) {
          setError(`API error: ${err.message}. Using sample data for display purposes.`);
        } else {
          setError('Failed to load campaign data. Using sample data for display purposes.');
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
        switch(currencyCode) {
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
        currency: currencyString, // Use the string directly
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(safeValue);
    } catch (error) {
      console.error('Error formatting currency:', error);
      // Fallback format without currency style
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
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

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value}%`;
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
    componentTester.testComponentProps(
      'StatusBadge', 
      { status: data.submissionStatus, size: 'md' },
      ['status']
    );
  }

  // Ensure we have data before rendering the component
  if (loading) {
    return (
      <div className="py-10">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-10">
        <ErrorFallback error={new Error(error)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-[var(--divider-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.history.back()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5 text-[var(--secondary-color)]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[var(--primary-color)] sm:text-2xl">{data?.campaignName || "Campaign Detail"}</h1>
                <div className="flex items-center text-[var(--secondary-color)] text-sm mt-1">
                  <StatusBadge status={data?.submissionStatus} />
                  <span className="mx-2">•</span>
                  <span>Created on {formatDate(data?.createdAt || "")}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button className="inline-flex items-center px-3 py-2 border border-[var(--divider-color)] rounded-md text-sm font-medium text-[var(--secondary-color)] bg-white hover:bg-gray-50">
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-[var(--divider-color)] rounded-md text-sm font-medium text-[var(--secondary-color)] bg-white hover:bg-gray-50">
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </button>
              <button 
                onClick={() => router.push(`/campaigns/wizard/step-1?id=${data?.id}`)}
                className="inline-flex items-center px-3 py-2 border border-[var(--primary-color)] rounded-md text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[#222222]"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard 
            title="Total Budget" 
            value={data?.totalBudget || 0} 
            icon={CurrencyDollarIcon} 
            format="currency" 
          />
          <MetricCard 
            title="Campaign Duration" 
            value={calculateDuration(data?.startDate || "", data?.endDate || "")} 
            icon={CalendarDaysIcon} 
          />
          <MetricCard 
            title="Platform" 
            value={data?.platform || "Instagram"} 
            icon={GlobeAltIcon} 
          />
        </div>

        {/* Campaign Details & Primary Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DataCard 
            title="Campaign Details" 
            icon={DocumentTextIcon}
            description="Basic campaign information"
          >
            <div className="space-y-3">
              <DataRow label="Campaign Name" value={data?.campaignName} featured={true} />
              <DataRow label="Description" value={data?.description || 'No description available'} />
              <DataRow label="Brand Name" value={data?.brandName} />
              <DataRow label="Start Date" value={formatDate(data?.startDate || "")} icon={CalendarIcon} />
              <DataRow label="End Date" value={formatDate(data?.endDate || "")} icon={CalendarIcon} />
              <DataRow label="Time Zone" value={data?.timeZone} icon={ClockIcon} />
              <DataRow label="Currency" value={safeCurrency(data?.currency)} icon={CurrencyDollarIcon} />
              <DataRow 
                label="Total Budget" 
                value={formatCurrency(data?.totalBudget || 0, data?.currency)} 
                icon={CurrencyDollarIcon} 
                featured={true}
              />
              <DataRow 
                label="Social Media Budget" 
                value={formatCurrency(data?.socialMediaBudget || 0, data?.currency)} 
                icon={CurrencyDollarIcon}
              />
              {data?.website && <DataRow label="Website" value={data.website} icon={GlobeAltIcon} />}
            </div>
          </DataCard>

          <DataCard 
            title="Primary Contact" 
            icon={UserCircleIcon}
            description="Primary point of contact for this campaign"
          >
            <div className="space-y-3">
              <div className="flex items-center mb-4">
                <div className="mr-4 bg-[var(--accent-color)] text-white rounded-full h-14 w-14 flex items-center justify-center text-lg font-semibold">
                  {data?.primaryContact?.firstName?.charAt(0) || ''}
                  {data?.primaryContact?.surname?.charAt(0) || ''}
                </div>
                <div>
                  <h4 className="text-[var(--primary-color)] font-semibold">
                    {data?.primaryContact?.firstName || ''} {data?.primaryContact?.surname || ''}
                  </h4>
                  <p className="text-[var(--secondary-color)] text-sm">{data?.primaryContact?.position || 'No position'}</p>
                </div>
              </div>
              
              <DataRow 
                label="Email" 
                value={
                  <a href={`mailto:${data?.primaryContact?.email}`} className="text-[var(--accent-color)] hover:underline">
                    {data?.primaryContact?.email}
                  </a>
                } 
                icon={EnvelopeIcon} 
              />
              
              <DataRow label="Position" value={data?.primaryContact?.position} icon={BuildingOfficeIcon} />
            </div>

            {data?.secondaryContact && (
              <div className="mt-6 pt-6 border-t border-[var(--divider-color)]">
                <h4 className="text-[var(--primary-color)] font-medium mb-3">Secondary Contact</h4>
                <div className="space-y-3">
                  <DataRow 
                    label="Name" 
                    value={`${data.secondaryContact.firstName} ${data.secondaryContact.surname}`} 
                    icon={UserCircleIcon} 
                  />
                  <DataRow 
                    label="Email" 
                    value={
                      <a href={`mailto:${data.secondaryContact.email}`} className="text-[var(--accent-color)] hover:underline">
                        {data.secondaryContact.email}
                      </a>
                    } 
                    icon={EnvelopeIcon} 
                  />
                  <DataRow label="Position" value={data.secondaryContact.position} icon={BuildingOfficeIcon} />
                </div>
              </div>
            )}
          </DataCard>
        </div>

        {/* Objectives & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {data && <ObjectivesSection campaign={data} />}
          {data && <AudienceSection audience={data.audience} />}
        </div>

        {/* Creative Assets */}
        <div className="mb-6">
          {data && <CreativeAssetsGallery assets={data.creativeAssets} />}
        </div>

        {/* Creative Requirements */}
        <div className="mb-6">
          <DataCard 
            title="Creative Requirements" 
            icon={PaintBrushIcon}
            description="Requirements for creative assets"
          >
            {(data?.creativeRequirements && data.creativeRequirements.length > 0) ? (
              <div className="space-y-4">
                {data.creativeRequirements.map((req, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-[var(--divider-color)]">
                    <h4 className="text-[var(--primary-color)] font-medium">{req.requirement}</h4>
                    {req.description && <p className="text-[var(--secondary-color)] text-sm mt-1">{req.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--secondary-color)]">
                <PaintBrushIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No creative requirements specified</p>
              </div>
            )}
          </DataCard>
        </div>

        {/* Campaign Features */}
        {(data?.features && data.features.length > 0) && (
          <div className="mb-6">
            <DataCard 
              title="Campaign Features" 
              icon={SparklesIcon}
              description="Additional features enabled for this campaign"
            >
              <div className="flex flex-wrap gap-3">
                {data.features.map((feature, index) => (
                  <div key={index} className="flex items-center bg-[rgba(0,191,255,0.1)] text-[var(--accent-color)] px-4 py-2 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span>
                      {feature === Feature.CREATIVE_ASSET_TESTING ? 'Creative Asset Testing' :
                       feature === Feature.BRAND_LIFT ? 'Brand Lift' :
                       feature === Feature.BRAND_HEALTH ? 'Brand Health' :
                       feature === Feature.MIXED_MEDIA_MODELLING ? 'Mixed Media Modeling' : feature}
                    </span>
                  </div>
                ))}
              </div>
            </DataCard>
          </div>
        )}

        {/* Additional Information (if needed) */}
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 

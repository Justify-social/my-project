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
  PhoneIcon,
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
  const trendConfig = {
    up: { 
      icon: ArrowTrendingUpIcon, 
      textColor: 'text-green-600' 
    },
    down: { 
      icon: ArrowTrendingDownIcon, 
      textColor: 'text-red-600' 
    },
    none: { 
      icon: null, 
      textColor: '' 
    }
  };

  const TrendIcon = trendConfig[trend].icon;
  const trendColorClass = trendConfig[trend].textColor;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-blue-50 p-2.5 rounded-lg">
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        
        {trend !== "none" && TrendIcon && (
          <span className={`flex items-center text-sm font-medium ${trendColorClass}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            Rising
          </span>
        )}
      </div>
      
      <h3 className="text-sm text-gray-500 mb-1 font-medium">{title}</h3>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold text-gray-800">
          {value}
        </p>
      </div>
      
      {subtext && (
        <p className="mt-2 text-sm text-gray-500">{subtext}</p>
      )}
    </motion.div>
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
  className,
  actions
}) => (
  <div className={`shadow-sm rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-gray-200 ${className || ''}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center">
        <div className="bg-blue-50 p-2 rounded-full mr-3">
          <Icon className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && (
        <div>
          {actions}
        </div>
      )}
    </div>
    {children}
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
  <motion.div 
    className={`flex items-center justify-between py-2.5 px-1 ${featured ? 'bg-blue-50 rounded-lg p-3' : 'border-b border-gray-100 last:border-0'}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center space-x-2">
      {Icon && (
        <div className={`rounded-full p-1.5 ${featured ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Icon className={`w-3.5 h-3.5 ${featured ? 'text-blue-600' : 'text-gray-500'}`} />
        </div>
      )}
      <span className="text-sm text-gray-600 font-medium">
        {label}
        {tooltip && (
          <span className="ml-1 text-gray-400 cursor-help" title={tooltip}>
            <InformationCircleIcon className="w-4 h-4 inline" />
          </span>
        )}
      </span>
    </div>
    <div className={`text-sm ${featured ? 'font-semibold text-blue-700' : 'font-medium text-gray-800'}`}>
      {value}
    </div>
  </motion.div>
);

// Add new components for enhanced sections
const AudienceSection: React.FC<{ audience: CampaignDetail['audience'] | null }> = ({ audience }) => {
  if (!audience) return null;

  // Convert string values to numbers for chart display
  const getNumericValue = (value: string): number => {
    // Try to extract a number from the string, default to 0 if not a number
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const ageData = [
    { name: '18-24', value: getNumericValue(audience.demographics.ageRange[0]) },
    { name: '25-34', value: getNumericValue(audience.demographics.ageRange[1]) },
    { name: '35-44', value: getNumericValue(audience.demographics.ageRange[2]) },
    { name: '45-54', value: getNumericValue(audience.demographics.ageRange[3]) },
    { name: '55-64', value: getNumericValue(audience.demographics.ageRange[4]) },
    { name: '65+', value: getNumericValue(audience.demographics.ageRange[5]) },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <DataCard title="Audience Demographics" icon={UserCircleIcon} className="col-span-2">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Age Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-6">
          {/* Add Gender Distribution */}
          <div>
            <h3 className="text-lg font-medium mb-2">Gender Distribution</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {audience.demographics.gender.map((gender) => (
                <span key={gender} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {gender}
                </span>
              ))}
            </div>
            {audience.demographics.gender.length > 2 && (
              <p className="text-sm text-gray-600">Other Gender Specifications: {audience.demographics.gender.slice(2).join(', ')}</p>
            )}
          </div>
          
          {/* Keep existing demographics sections */}
          <div>
            <h3 className="text-lg font-medium mb-2">Demographics</h3>
            <div className="space-y-2">
              <DataRow label="Education Level" value={audience.demographics.education.join(', ')} />
              <DataRow label="Income Level" value={audience.demographics.income.join(', ')} />
              <DataRow label="Interests" value={audience.demographics.interests.join(', ')} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Locations</h3>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.locations.map((loc) => (
                <span key={loc} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {loc}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {audience.demographics.languages.map((lang) => (
                <span key={lang} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DataCard>
  );
};

const CreativeAssetsGallery: React.FC<{ assets: CampaignDetail['creativeAssets'] }> = ({ assets }) => (
  <DataCard title="Creative Assets" icon={PhotoIcon} className="col-span-2">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {assets && assets.length > 0 ? (
        assets.map((asset) => (
          <div key={asset.name} className="relative group">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
              {asset.type === 'image' ? (
                <Image
                  src={asset.url}
                  alt={asset.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <video
                    src={asset.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <h4 className="font-medium text-gray-900">{asset.name}</h4>
              {asset.size && (
                <p className="text-sm text-gray-600">Size: {asset.size} KB</p>
              )}
              {asset.duration && (
                <p className="text-sm text-gray-600">Duration: {asset.duration} seconds</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-3 p-8 text-center bg-gray-50 rounded-lg">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No creative assets uploaded yet</p>
        </div>
      )}
    </div>
  </DataCard>
);

// Add new components for missing sections
const ObjectivesSection: React.FC<{ campaign: CampaignDetail }> = ({ campaign }) => (
  <DataCard title="Objectives & Messaging" icon={SparklesIcon} className="col-span-2">
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <DataRow label="Main Message" value={campaign.mainMessage || 'Not specified'} />
        <DataRow label="Hashtags" value={campaign.hashtags || 'Not specified'} />
        <DataRow label="Memorability" value={campaign.memorability || 'Not specified'} />
        <DataRow label="Key Benefits" value={campaign.keyBenefits || 'Not specified'} />
      </div>
      <div className="space-y-4">
        <DataRow label="Expected Achievements" value={campaign.expectedAchievements || 'Not specified'} />
        <DataRow label="Purchase Intent" value={campaign.purchaseIntent || 'Not specified'} />
        <DataRow label="Brand Perception" value={campaign.brandPerception || 'Not specified'} />
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Selected Features</h4>
          <div className="flex flex-wrap gap-2">
            {campaign.features && campaign.features.length > 0 ? (
              campaign.features.map((feature, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {feature}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                No features
              </span>
            )}
          </div>
        </div>
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
  // Safely get status string and convert to lowercase
  const safeStatus = typeof status === 'string' && status ? status.toLowerCase() : 'draft';
  
  // Log the status conversion if in debug mode
  if (ENABLE_SAFETY_MODE && typeof window !== 'undefined') {
    console.log(`StatusBadge: Converting "${status}" to safe status "${safeStatus}"`);
  }

  // Define configuration for each status type
  const statusConfig: Record<string, { color: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string }> = {
    "draft": { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: ClockIcon,
      label: 'Draft'
    },
    "submitted": { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: PaperAirplaneIcon,
      label: 'Submitted'
    },
    "live": { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircleIcon,
      label: 'Live'
    },
    "paused": { 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      icon: PauseIcon,
      label: 'Paused'
    },
    "completed": { 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      icon: CheckBadgeIcon,
      label: 'Completed'
    },
    "scheduled": { 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
      icon: CalendarIcon,
      label: 'Scheduled'
    },
    "rejected": { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircleIcon,
      label: 'Rejected'
    }
  };

  // Use the config for the given status, or fall back to draft if not found
  const config = statusConfig[safeStatus] || statusConfig.draft;
  const Icon = config.icon;
  
  // Set size classes based on the size prop
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-sm";

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium 
      ${config.color} border shadow-sm ${className}`}>
      <Icon className={size === "sm" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-1.5"} />
      {config.label}
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
        
        const result = await response.json();
        console.log('API response received:', result);
        
        // Check if the result is empty
        if (!result || Object.keys(result).length === 0) {
          console.warn('Empty API response received. Using fallback data.');
          setData(fallbackData);
          setError('API returned empty data. Using sample data for display purposes.');
          setLoading(false);
          return;
        }
        
        // Validate data
        const validation = validateCampaignData(result);
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
          id: result.id.toString(),
          campaignName: result.campaignName,
          description: result.description,
          startDate: result.startDate,
          endDate: result.endDate,
          timeZone: result.timeZone,
          currency: result.currency,
          totalBudget: result.totalBudget,
          socialMediaBudget: result.socialMediaBudget,
          platform: result.platform,
          influencerHandle: result.influencerHandle,
          website: result.website || "",
          
          // Format the primary contact data
          primaryContact: {
            firstName: result.primaryContact.firstName,
            surname: result.primaryContact.surname,
            email: result.primaryContact.email,
            position: result.primaryContact.position,
            phone: result.primaryContact.phone || "N/A"
          },
          
          // Format secondary contact if available
          secondaryContact: result.secondaryContact ? {
            firstName: result.secondaryContact.firstName,
            surname: result.secondaryContact.surname,
            email: result.secondaryContact.email,
            position: result.secondaryContact.position,
            phone: result.secondaryContact.phone || "N/A"
          } : undefined,
          
          // Campaign Details
          brandName: result.brandName || result.campaignName,
          category: result.category || "Not specified",
          product: result.product || "Not specified",
          targetMarket: result.targetMarket || "Global",
          submissionStatus: result.submissionStatus,
          primaryKPI: result.primaryKPI,
          secondaryKPIs: result.secondaryKPIs || [],
          
          // Campaign Objectives
          mainMessage: result.mainMessage || "",
          hashtags: result.hashtags || "",
          memorability: result.memorability || "",
          keyBenefits: result.keyBenefits || "",
          expectedAchievements: result.expectedAchievements || "",
          purchaseIntent: result.purchaseIntent || "",
          brandPerception: result.brandPerception || "",
          features: result.features || [],
          
          // Format audience data if available
          audience: result.audience ? {
            demographics: {
              ageRange: result.audience.demographics.ageRange || ["0", "0", "0", "0", "0", "0"],
              gender: result.audience.demographics.gender || ["Not specified"],
              education: result.audience.demographics.education || ["Not specified"],
              income: result.audience.demographics.income || ["Not specified"],
              interests: result.audience.demographics.interests || ["Not specified"],
              locations: result.audience.demographics.locations || ["Not specified"],
              languages: result.audience.demographics.languages || ["Not specified"]
            }
          } : {
            demographics: {
              ageRange: ["0", "0", "0", "0", "0", "0"],
              gender: ["Not specified"],
              education: ["Not specified"],
              income: ["Not specified"],
              interests: ["Not specified"],
              locations: ["Not specified"],
              languages: ["Not specified"]
            }
          },
          
          // Format creative assets
          creativeAssets: result.creativeAssets ? result.creativeAssets.map((asset: any) => ({
            name: asset.assetName || asset.fileName,
            type: asset.type.toLowerCase() === 'video' ? 'video' : 'image',
            url: asset.url,
            size: asset.fileSize,
            duration: asset.duration || null
          })) : [],
          
          // Format creative requirements
          creativeRequirements: result.creativeRequirements ? result.creativeRequirements.map((req: any) => ({
            requirement: req.requirement,
            description: req.description || ""
          })) : [],
          
          // Timestamps
          createdAt: result.createdAt,
          updatedAt: result.updatedAt
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 rounded-xl shadow-md max-w-md w-full">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-center mt-4">Error Loading Campaign</h2>
          <p className="text-gray-600 text-center mt-2">{error || 'Failed to load campaign data'}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  // At this point we know data is not null
  // This helps TypeScript know that data is definitely defined in the following JSX
  if (!data) {
    return null; // This should never happen due to earlier checks, but satisfies TypeScript
  }

  return (
    <div className="min-h-screen">
      {/* Campaign Header - Styled to match Figma */}
      <div className="border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/campaigns')}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Campaign Overview
              </h1>
            </div>
            <div>
              <button 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm 
                font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Save all drafts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Content - Styled to match Figma */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Campaign Name Section */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium text-gray-900">
                {safe(data?.campaignName, 'Campaign Name')}
              </h2>
              <StatusBadge status={safe(data?.submissionStatus, 'draft')} size="sm" className="mt-2" />
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <ShareIcon className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-3">
            <p>{safe(data?.description, 'No description provided')}</p>
          </div>
        </div>

        {/* Two-column layout for key info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Date information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Start Date</h3>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium">{data?.startDate ? formatDate(data.startDate) : 'Not set'}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">End Date</h3>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium">{data?.endDate ? formatDate(data.endDate) : 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Time Zone */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Time Zone</h3>
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium">{data?.timeZone || 'GMT (UTC+0)'}</span>
          </div>
        </div>

        {/* Currency and Budget */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Currency</h3>
          <p className="text-sm mb-4 font-medium">{safeCurrency(data?.currency)}</p>
          
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total campaign budget</h3>
          <p className="text-sm font-medium text-gray-900">
            {data?.totalBudget !== undefined ? formatCurrency(data.totalBudget, data.currency) : 'Not set'}
          </p>
          
          {data?.socialMediaBudget && (
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Budget allocated to social media</h3>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(data.socialMediaBudget, data.currency)}
              </p>
            </div>
          )}
        </div>

        {/* Influencer Information */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Influencer</h3>
          {data?.influencerHandle ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden relative">
                <Image 
                  src={`https://unavatar.io/${data.influencerHandle}`}
                  alt={data.influencerHandle}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{data.influencerHandle}</p>
                <p className="text-xs text-gray-500">@{data.influencerHandle.toLowerCase()}</p>
              </div>
              
              <div className="ml-auto flex gap-1">
                <button className="p-1 rounded text-blue-500 hover:bg-blue-50">
                  <CheckCircleIcon className="h-4 w-4" />
                </button>
                <button className="p-1 rounded text-red-500 hover:bg-red-50">
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No influencer selected</p>
          )}
        </div>

        {/* Platform */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Platform for Campaign</h3>
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-md mr-3">
              <GlobeAltIcon className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium">{data?.platform || 'Not specified'}</span>
          </div>
        </div>

        {/* Primary KPI */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Primary KPI</h3>
          <div className="p-3 bg-blue-50 rounded-lg mb-3">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-100 rounded-md mr-2">
                <ChartBarIcon className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-700">{safe(data?.primaryKPI, 'Not set')}</span>
            </div>
          </div>
          
          {data?.secondaryKPIs && data.secondaryKPIs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Secondary KPIs</h3>
              <div className="flex flex-wrap gap-2">
                {data.secondaryKPIs.map((kpi, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {kpi}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Campaign Details Section */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
          <p className="text-sm mb-4 font-medium">{safe(data?.targetMarket, 'Not specified')}</p>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">Age Range (years)</h3>
          <div className="flex items-center gap-2 mb-6">
            {data?.audience?.demographics?.ageRange ? (
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>18</span>
                  <span>24</span>
                  <span>35</span>
                  <span>44</span>
                  <span>55</span>
                  <span>65+</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not specified</p>
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">Gender</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {data?.audience?.demographics?.gender ? data.audience.demographics.gender.map((gender, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {gender}
              </span>
            )) : (
              <p className="text-sm text-gray-500">Not specified</p>
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">Language</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {data?.audience?.demographics?.languages ? data.audience.demographics.languages.map((language, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {language}
              </span>
            )) : (
              <p className="text-sm text-gray-500">Not specified</p>
            )}
          </div>
        </div>

        {/* Selected Features */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-900">Key Campaign Features</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">See all</button>
          </div>
          <div className="space-y-2">
            {data?.features && data.features.length > 0 ? (
              data.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No features selected</p>
            )}
          </div>
        </div>

        {/* Creative Assets */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Creative Assets</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>See all</span>
              <ArrowLeftIcon className="h-3 w-3 transform rotate-180" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {data?.creativeAssets && data.creativeAssets.length > 0 ? (
              data.creativeAssets.slice(0, 2).map((asset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                    {asset.type === 'image' ? (
                      <div className="h-40 w-full relative">
                        <Image
                          src={asset.url}
                          alt={asset.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 bg-gray-50">
                        <div className="p-3 bg-blue-500 rounded-full">
                          <PlayIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium">{asset.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                      {asset.size && ` • ${asset.size} KB`}
                      {asset.duration && ` • ${asset.duration}s`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center bg-gray-50 rounded-lg">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No creative assets uploaded yet</p>
                <button className="mt-3 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                  Add Assets
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Brand Lift Results - Mocked from Figma */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Brand Lift Results</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">See all</button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-2">Brand Awareness Lift</h3>
              <p className="text-2xl font-bold text-green-600">+19%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-2">Brand Consideration Lift</h3>
              <p className="text-2xl font-bold text-green-600">+24%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-2">Message Association Lift</h3>
              <p className="text-2xl font-bold text-green-600">+8%</p>
            </div>
          </div>
          
          {/* Mocked Charts Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Performance Graph</h3>
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 rounded-md">Month</span>
                <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">Week</span>
              </div>
            </div>
            <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
              <p className="text-gray-400 text-sm">Performance chart visualization would go here</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6 pb-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
          
          {data.primaryContact && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium mb-1">
                    {`${data.primaryContact.firstName || ''} ${data.primaryContact.surname || ''}`.trim() || 'Primary Contact'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{data.primaryContact.position || 'No position specified'}</p>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {data.primaryContact.email || 'No email provided'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {data.primaryContact.phone || 'No phone provided'}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 mb-auto">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {data.secondaryContact && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium mb-1">
                    {`${data.secondaryContact.firstName || ''} ${data.secondaryContact.surname || ''}`.trim() || 'Secondary Contact'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{data.secondaryContact.position || 'No position specified'}</p>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {data.secondaryContact.email || 'No email provided'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {data.secondaryContact.phone || 'No phone provided'}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 mb-auto">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {data.website && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Website</h3>
              <a 
                href={data.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline text-sm"
              >
                {(() => {
                  try {
                    return new URL(data.website).hostname;
                  } catch (e) {
                    return data.website;
                  }
                })()}
              </a>
            </div>
          )}
        </div>

      </div>

      {/* Footer actions */}
      <div className={`
        fixed
        bottom-0
        left-0
        w-full
        border-t
        border-gray-300
        shadow
        z-40
        bg-white
        flex
        justify-between
        items-center
        transition-all
        duration-300
        ease-in-out
        ${isOpen ? 'md:w-[calc(100%-12rem)] md:left-[12rem] lg:w-[calc(100%-16rem)] lg:left-[16rem]' : ''}
      `}
      style={{
        height: '65px',
      }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full px-4 sm:px-6">
          <button 
            onClick={() => router.push('/campaigns')}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
            Back to Campaigns
          </button>
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
            <CogIcon className="h-4 w-4 mr-1.5" />
            View Settings
          </button>
        </div>
      </div>
    </div>
  );
}

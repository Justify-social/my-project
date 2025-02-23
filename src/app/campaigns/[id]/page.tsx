'use client'

import React, { useEffect, useState, Suspense, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { Analytics } from '@/lib/analytics/analytics'
import ErrorFallback from '@/components/ErrorFallback'
import LoadingSkeleton from '@/components/LoadingSkeleton'
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
  ShareIcon
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Image from 'next/image';
import Link from 'next/link';

// Add proper enum types from schema
enum Currency {
  GBP = 'GBP',
  USD = 'USD',
  EUR = 'EUR'
}

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

enum Position {
  Manager = 'Manager',
  Director = 'Director',
  VP = 'VP'
}

// Add missing Platform enum
enum Platform {
  Instagram = 'Instagram',
  YouTube = 'YouTube',
  TikTok = 'TikTok'
}

// Update interface to exactly match schema
interface CampaignDetail {
  id: number;
  // Step 1: Campaign Details
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  contacts: string;
  currency: Currency;
  totalBudget: number;
  socialMediaBudget: number;
  platform: Platform;
  influencerHandle: string;

  // Contact Information
  primaryContact: {
    id: number;
    firstName: string;
    surname: string;
    email: string;
    position: Position;
  };
  secondaryContact?: {
    id: number;
    firstName: string;
    surname: string;
    email: string;
    position: Position;
  };

  // Step 2: Objectives & Messaging
  mainMessage: string;
  hashtags: string;
  memorability: string;
  keyBenefits: string;
  expectedAchievements: string;
  purchaseIntent: string;
  brandPerception: string;
  primaryKPI: KPI;
  secondaryKPIs: KPI[];
  features: Feature[];

  // Step 3: Audience
  audience: {
    id: number;
    age1824: number;
    age2534: number;
    age3544: number;
    age4554: number;
    age5564: number;
    age65plus: number;
    otherGender: string;
    educationLevel: string;
    jobTitles: string;
    incomeLevel: string;
    locations: { id: number; location: string }[];
    genders: { id: number; gender: string }[];
    screeningQuestions: { id: number; question: string }[];
    languages: { id: number; language: string }[];
    competitors: { id: number; competitor: string }[];
  };

  // Step 4: Creative Assets
  creativeAssets: {
    id: string;
    type: 'image' | 'video';
    url: string;
    fileName: string;
    fileSize: number | null;
    assetName: string;
    influencerHandle: string | null;
    influencerName: string | null;
    influencerFollowers: string | null;
    whyInfluencer: string | null;
    budget: number | null;
    createdAt: string;
    updatedAt: string;
  }[];

  creativeRequirements: {
    id: number;
    requirement: string;
  }[];

  // Status and timestamps
  submissionStatus: 'draft' | 'submitted';
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

// Reusable components
interface MetricCardProps {
  icon: any
  title: string
  value: string | number
  subtext?: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}

const MetricCard = ({ icon: Icon, title, value, subtext, color }: MetricCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <motion.div 
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg`}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center mb-2">
        <Icon className="w-6 h-6 text-white/80" />
        <p className="ml-2 text-white/80">{title}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtext && <p className="text-sm text-white/70 mt-1">{subtext}</p>}
    </motion.div>
  )
}

// Enhanced components for better data display
interface DataCardProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
}

const DataCard: React.FC<DataCardProps> = ({ title, icon: Icon, children, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-lg shadow-sm p-6 ${className}`}
  >
    <div className="flex items-center mb-4">
      <Icon className="w-6 h-6 text-gray-500 mr-2" />
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

// Add DataRow component before the main CampaignDetail component
interface DataRowProps {
  label: string;
  value: string | number | null | undefined;
}

const DataRow: React.FC<DataRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-900">
      {value ?? 'Not specified'}
    </span>
  </div>
);

// Add new components for enhanced sections
const AudienceSection: React.FC<{ audience: CampaignDetail['audience'] | null }> = ({ audience }) => {
  if (!audience) return null;

  const ageData = [
    { name: '18-24', value: audience.age1824 },
    { name: '25-34', value: audience.age2534 },
    { name: '35-44', value: audience.age3544 },
    { name: '45-54', value: audience.age4554 },
    { name: '55-64', value: audience.age5564 },
    { name: '65+', value: audience.age65plus },
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
              {audience.genders.map((gender) => (
                <span key={gender.id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {gender.gender}
                </span>
              ))}
            </div>
            {audience.otherGender && (
              <p className="text-sm text-gray-600">Other Gender Specifications: {audience.otherGender}</p>
            )}
          </div>
          
          {/* Keep existing demographics sections */}
          <div>
            <h3 className="text-lg font-medium mb-2">Demographics</h3>
            <div className="space-y-2">
              <DataRow label="Education Level" value={audience.educationLevel} />
              <DataRow label="Income Level" value={audience.incomeLevel} />
              <DataRow label="Job Titles" value={audience.jobTitles} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Locations</h3>
            <div className="flex flex-wrap gap-2">
              {audience.locations.map((loc) => (
                <span key={loc.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {loc.location}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {audience.languages.map((lang) => (
                <span key={lang.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {lang.language}
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
      {assets.map((asset) => (
        <div key={asset.id} className="relative group">
          <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
            {asset.type === 'image' ? (
              <Image
                src={asset.url}
                alt={asset.assetName}
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
            <h4 className="font-medium text-gray-900">{asset.assetName}</h4>
            <p className="text-sm text-gray-500">{asset.fileName}</p>
            {asset.influencerHandle && (
              <p className="text-sm text-blue-600">@{asset.influencerHandle}</p>
            )}
            {asset.budget && (
              <p className="text-sm text-gray-600">Budget: ${asset.budget.toLocaleString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </DataCard>
);

// Add new components for missing sections
const ObjectivesSection: React.FC<{ campaign: CampaignDetail }> = ({ campaign }) => (
  <DataCard title="Objectives & Messaging" icon={SparklesIcon} className="col-span-2">
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <DataRow label="Main Message" value={campaign.mainMessage} />
        <DataRow label="Hashtags" value={campaign.hashtags} />
        <DataRow label="Memorability" value={campaign.memorability} />
        <DataRow label="Key Benefits" value={campaign.keyBenefits} />
      </div>
      <div className="space-y-4">
        <DataRow label="Expected Achievements" value={campaign.expectedAchievements} />
        <DataRow label="Purchase Intent" value={campaign.purchaseIntent} />
        <DataRow label="Brand Perception" value={campaign.brandPerception} />
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Selected Features</h4>
          <div className="flex flex-wrap gap-2">
            {campaign.features.map((feature, index) => (
              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {feature}
              </span>
            ))}
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
            {audience.screeningQuestions.map((q) => (
              <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                {q.question}
              </div>
            ))}
          </div>
        </div>
        
        {/* Competitors */}
        <div>
          <h3 className="text-lg font-medium mb-4">Competitors</h3>
          <div className="flex flex-wrap gap-2">
            {audience.competitors.map((comp) => (
              <span key={comp.id} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                {comp.competitor}
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
      {requirements.map((req) => (
        <div key={req.id} className="p-3 bg-gray-50 rounded-lg flex items-start">
          <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
          <span className="text-gray-700">{req.requirement}</span>
        </div>
      ))}
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
  return value != null && typeof value[Symbol.iterator] === 'function';
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

// Add StatusBadge component
interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    draft: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: ClockIcon,
      label: 'Draft'
    },
    submitted: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircleIcon,
      label: 'Submitted'
    },
    rejected: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircleIcon,
      label: 'Rejected'
    }
  }[status.toLowerCase()] || { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: ClockIcon,
    label: status
  };

  const Icon = statusConfig.icon;

  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium 
      ${statusConfig.color} border shadow-sm`}>
      <Icon className="w-4 h-4 mr-2" />
      {statusConfig.label}
    </span>
  );
};

// Add DetailSection component
interface DetailSectionProps {
  icon: any;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DetailSection = ({ icon: Icon, title, children, className = '' }: DetailSectionProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${className}`}
  >
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <Icon className="w-6 h-6 mr-2 text-gray-600" />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  </motion.section>
);

export default function CampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/campaigns/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();
        
        // Extract campaign data from response
        const campaignData = rawData.data || rawData.campaign || rawData;

        // Validate the campaign data
        const validation = validateCampaignData(campaignData);

        if (!validation.isValid) {
          console.error('Campaign data validation failed:', validation.errors);
          throw new Error(`Invalid campaign data: ${validation.errors.join(', ')}`);
        }

        setData(campaignData);
        setError(null);

      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaign');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchData();
    }
  }, [params?.id]);

  // Add this temporary debug output
  useEffect(() => {
    if (data) {
      console.log('Campaign data set:', {
        id: data.id,
        name: data.campaignName,
        dataKeys: Object.keys(data)
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <motion.div 
        {...fadeIn}
        className="min-h-screen flex items-center justify-center bg-gray-50 p-6"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
          <div className="flex items-center justify-center mb-6">
            <XCircleIcon className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Error Loading Campaign
          </h2>
          <p className="text-gray-600 text-center mb-8">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/campaigns')}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Return to Campaigns
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Header */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
          {...fadeIn}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {data?.campaignName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Created on {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <StatusBadge status={data?.submissionStatus || 'draft'} />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={CurrencyDollarIcon}
            title="Total Budget"
            value={`${data?.currency || 'USD'} ${(data?.totalBudget || 0).toLocaleString()}`}
            color="blue"
          />
          <MetricCard
            icon={CalendarIcon}
            title="Campaign Duration"
            value={data?.startDate && data?.endDate ? 
              `${Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days` 
              : 'N/A'}
            color="purple"
          />
          <MetricCard
            icon={GlobeAltIcon}
            title="Platform"
            value={data?.platform || 'N/A'}
            color="green"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailSection icon={DocumentTextIcon} title="Campaign Details">
              <div className="space-y-3">
                <DataRow label="Platform" value={data.platform} />
                <DataRow 
                  label="Start Date" 
                  value={new Date(data.startDate).toLocaleDateString()} 
                />
                <DataRow 
                  label="End Date" 
                  value={new Date(data.endDate).toLocaleDateString()} 
                />
                <DataRow label="Time Zone" value={data.timeZone} />
                <DataRow label="Influencer Handle" value={data.influencerHandle} />
              </div>
            </DetailSection>

            <DetailSection icon={UserCircleIcon} title="Contact Information">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Primary Contact</h4>
                  <p className="text-gray-800">
                    {data.primaryContact.firstName} {data.primaryContact.surname}
                  </p>
                  <p className="text-blue-600">{data.primaryContact.email}</p>
                  <p className="text-gray-600">{data.primaryContact.position}</p>
                </div>
                {data.secondaryContact?.email && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Secondary Contact</h4>
                    <p className="text-gray-800">
                      {data.secondaryContact.firstName} {data.secondaryContact.surname}
                    </p>
                    <p className="text-blue-600">{data.secondaryContact.email}</p>
                    <p className="text-gray-600">{data.secondaryContact.position}</p>
                  </div>
                )}
              </div>
            </DetailSection>
          </div>

          <DetailSection icon={SparklesIcon} title="Campaign Objectives">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <DataRow label="Primary KPI" value={data.primaryKPI} />
                <DataRow 
                  label="Secondary KPIs" 
                  value={data.secondaryKPIs.join(', ') || 'None'} 
                />
                <DataRow label="Main Message" value={data.mainMessage} />
                <DataRow label="Hashtags" value={data.hashtags || 'None'} />
              </div>
              <div className="space-y-3">
                <DataRow label="Brand Perception" value={data.brandPerception} />
                <DataRow label="Key Benefits" value={data.keyBenefits} />
                <DataRow 
                  label="Expected Achievements" 
                  value={data.expectedAchievements} 
                />
              </div>
            </div>
          </DetailSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailSection icon={CheckCircleIcon} title="Selected Features">
              <div className="flex flex-wrap gap-2">
                {data.features.length > 0 ? (
                  data.features.map((feature, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {feature}
                    </motion.span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No features selected</p>
                )}
              </div>
            </DetailSection>

            <DetailSection icon={PhotoIcon} title="Creative Requirements">
              <div className="space-y-2">
                {data.creativeRequirements.length > 0 ? (
                  data.creativeRequirements.map((req, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{req.requirement}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No creative requirements specified
                  </p>
                )}
              </div>
            </DetailSection>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="mt-8 flex justify-end space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/campaigns')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 
              hover:bg-gray-50 transition-all duration-300"
          >
            Back to Campaigns
          </motion.button>
          <Link
            href={`/campaigns/wizard/step-1?id=${data.id}`}
            className="px-4 py-2 rounded border border-blue-500 text-blue-500 text-lg whitespace-nowrap"
          >
            Edit Campaign
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 

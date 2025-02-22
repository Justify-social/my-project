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

export default function CampaignDetail() {
  console.log('Component rendering');
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 4. Implement memoized string transformations
  const transformStrings = useCallback((obj: any) => {
    if (!obj) return null;

    try {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        // Only transform string values
        if (typeof value === 'string') {
          acc[key] = SafeString.transform(value, 'toUpperCase', `field:${key}`);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
    } catch (err) {
      console.error('String transformation error:', err);
      return obj;
    }
  }, []);

  // 5. Implement instrumented data fetching
  useEffect(() => {
    const fetchData = async () => {
      const startTime = performance.now();
      
      try {
        debugLog({
          type: 'NETWORK',
          message: 'Fetching campaign data',
          data: { params }
        });

        const response = await fetch(`/api/campaigns/${params.id}`);
        const rawData = await response.json();

        debugLog({
          type: 'DATA',
          message: 'Raw API response',
          data: rawData
        });

        if (!isCampaignData(rawData)) {
          throw new Error('Invalid campaign data structure');
        }

        // Validate iterables before processing
        Object.entries(rawData).forEach(([key, value]) => {
          if (Array.isArray(value) && !isIterable(value)) {
            debugLog({
              type: 'ITERATION',
              message: `Non-iterable array found`,
              data: { key, value }
            });
          }
        });

        // Transform data with instrumentation
        const processedData = transformStrings(rawData);
        setData(processedData);
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        debugLog({
          type: 'ERROR',
          message: 'Error in data fetching',
          error,
          stack: error.stack,
          data: { params, timeElapsed: performance.now() - startTime }
        });
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) fetchData();
  }, [params?.id, transformStrings]);

  // Development helper for debugging
  if (DEBUG) {
    console.log('Debug History:', debugHistory);
  }

  // Add this at the top of your component
  useEffect(() => {
    const debugAPI = async () => {
      const response = await fetch(`/api/campaigns/${params.id}`);
      const data = await response.json();
      console.log('API Response:', {
        rawData: data,
        stringFields: Object.entries(data)
          .filter(([_, v]) => typeof v === 'string')
          .map(([k, v]) => ({ key: k, value: v, type: typeof v }))
      });
    };
    debugAPI();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Campaign</h2>
          <p className="text-gray-600">{error?.message || 'Campaign not found'}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Campaigns
          </button>
        </div>
      </div>
    )
  }

  // Wrap the render in a try/catch to catch any string processing errors
  try {
    return (
      <ErrorBoundary
        FallbackComponent={({ error }) => {
          console.error('Render error:', error);
          return <div>Something went wrong: {error.message}</div>;
        }}
      >
        <div className="min-h-screen bg-white py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {/* Header Section */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{SafeString.transform(data.campaignName, 'toUpperCase', 'render:campaignName')}</h1>
                  <p className="mt-2 text-gray-600">{SafeString.transform(data.description, 'toUpperCase', 'render:description')}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      Created: {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Last updated: {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    ${SafeString.transform(data.submissionStatus, 'toUpperCase', 'render:submissionStatus').toLowerCase() === 'submitted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    {SafeString.transform(data.submissionStatus, 'toUpperCase', 'render:submissionStatus').toLowerCase() === 'submitted' ? 'Live' : 'Draft'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Platform: {SafeString.transform(data.platform, 'toUpperCase', 'render:platform')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                icon={CurrencyDollarIcon}
                title="Total Budget"
                value={`${data.currency} ${data.totalBudget.toLocaleString()}`}
                subtext={`${data.socialMediaBudget.toLocaleString()} for social`}
                color="blue"
              />
              <MetricCard
                icon={CalendarIcon}
                title="Duration"
                value={`${Math.ceil((new Date(data.endDate).getTime() - 
                  new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days`}
                subtext={data.timeZone}
                color="purple"
              />
              <MetricCard
                icon={ChartBarIcon}
                title="Primary KPI"
                value={data.primaryKPI}
                subtext={data.secondaryKPIs.join(', ')}
                color="green"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Campaign Details */}
              <DataCard title="Campaign Details" icon={DocumentTextIcon} className="col-span-2">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <DataRow label="Start Date" value={new Date(data.startDate).toLocaleDateString()} />
                    <DataRow label="End Date" value={new Date(data.endDate).toLocaleDateString()} />
                    <DataRow label="Time Zone" value={data.timeZone} />
                    <DataRow label="Platform" value={SafeString.transform(data.platform, 'toUpperCase', 'render:platform')} />
                  </div>
                  <div className="space-y-4">
                    <DataRow label="Currency" value={data.currency} />
                    <DataRow label="Total Budget" value={`${data.currency} ${data.totalBudget.toLocaleString()}`} />
                    <DataRow label="Social Budget" value={`${data.currency} ${data.socialMediaBudget.toLocaleString()}`} />
                    <DataRow label="Influencer" value={data.influencerHandle} />
                  </div>
                </div>
              </DataCard>
              
              {/* Contact Information */}
              <DataCard title="Contact Information" icon={UserCircleIcon}>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Primary Contact</h3>
                    <p>{data.primaryContact.firstName} {data.primaryContact.surname}</p>
                    <p className="text-blue-600">{data.primaryContact.email}</p>
                    <p className="text-gray-500">{data.primaryContact.position}</p>
                  </div>
                  {data.secondaryContact && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Secondary Contact</h3>
                      <p>{data.secondaryContact.firstName} {data.secondaryContact.surname}</p>
                      <p className="text-blue-600">{data.secondaryContact.email}</p>
                      <p className="text-gray-500">{data.secondaryContact.position}</p>
                    </div>
                  )}
                </div>
              </DataCard>
              
              {/* Objectives & Messaging */}
              <ObjectivesSection campaign={data} />
              
              {/* Audience Demographics */}
              {data.audience && <AudienceSection audience={data.audience} />}
              
              {/* Audience Insights */}
              {data.audience && <AudienceInsightsSection audience={data.audience} />}
              
              {/* Add Creative Requirements before Creative Assets */}
              <CreativeRequirementsSection requirements={data.creativeRequirements} />
              
              {/* Creative Assets */}
              <CreativeAssetsGallery assets={data.creativeAssets} />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4 border-t pt-8">
              <button
                onClick={() => router.push('/campaigns')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Campaigns
              </button>
              <button
                onClick={() => router.push(`/campaigns/${data.id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Campaign
              </button>
              {/* Add Share button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Campaign URL copied to clipboard');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
            </div>
          </motion.div>
        </div>

        {/* Debug panel in development */}
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-8 p-4 bg-gray-100 rounded">
            {JSON.stringify(StringOperationTracker.getOperations(), null, 2)}
          </pre>
        )}
      </ErrorBoundary>
    );
  } catch (renderError) {
    console.error('Render error:', renderError);
    return <div>Error rendering page: {String(renderError)}</div>;
  }
} 

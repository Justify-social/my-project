"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Header from "@/components/Wizard/Header";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { useWizard } from "@/context/WizardContext";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { Analytics } from "@/lib/analytics/analytics";
import AssetPreview from '@/components/AssetPreview';
import ErrorFallback from '@/components/ErrorFallback';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ObjectivesContent from '@/components/ReviewSections/ObjectivesContent';
import AudienceContent from '@/components/ReviewSections/AudienceContent';
import ReviewSection from '@/components/ReviewSections/ReviewSection';
import { Section } from '@/components/ui/section';
import { CheckCircleIcon, XCircleIcon, ClockIcon, CalendarIcon, UserGroupIcon, SparklesIcon, DocumentTextIcon, CurrencyDollarIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

// Strong type definitions
interface CampaignDetails {
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  primaryContact: {
    name: string;
    email: string;
    role: string;
  };
}

interface Objectives {
  primaryKPI: string;
  secondaryKPIs: string[];
  mainMessage: string;
  hashtags: string[];
  memorability: string;
  keyBenefits: string;
  expectedAchievements: string;
  purchaseIntent: string;
  features: string[];
}

interface AudienceTargeting {
  locations: string[];
  ageRanges: string[];
  genders: string[];
  languages: string[];
}

interface CreativeAsset {
  id: string;
  assetName: string;
  type: 'image' | 'video';
  url: string;
  influencerHandle?: string;
  budget?: number;
  whyInfluencer?: string;
}

interface WizardData {
  step1: CampaignDetails;
  step2: Objectives;
  step3: AudienceTargeting;
  step4: {
    creativeAssets: CreativeAsset[];
  };
  overview: {
    name: string;
    businessGoal: string;
    startDate: string;
    endDate: string;
    timeZone: string;
    primaryContact: {
      firstName: string;
      surname: string;
      email: string;
      position: string;
    };
    secondaryContact?: {
      firstName: string;
      surname: string;
      email: string;
      position: string;
    };
    currency: string;
    totalBudget: number;
    socialMediaBudget: number;
    platform: string;
    influencerHandle: string;
  };
}

// Review Section Components
interface ReviewSectionProps {
  title: string;
  stepNumber: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ title, stepNumber, onEdit, children }) => (
  <section 
    className="bg-white rounded-lg shadow p-6 mb-6"
    aria-labelledby={`review-section-${stepNumber}`}
  >
    <div className="flex justify-between items-start mb-4">
      <h2 id={`review-section-${stepNumber}`} className="text-xl font-semibold">{title}</h2>
      <button
        onClick={() => onEdit(stepNumber)}
        className="text-blue-600 hover:text-blue-800 flex items-center"
        aria-label={`Edit ${title}`}
      >
        <span>Edit</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
    {children}
  </section>
);

// Enhanced validation with specific error types
enum ValidationErrorType {
  MISSING_CAMPAIGN_NAME = 'MISSING_CAMPAIGN_NAME',
  MISSING_DATES = 'MISSING_DATES',
  MISSING_KPI = 'MISSING_KPI',
  MISSING_LOCATION = 'MISSING_LOCATION',
  MISSING_ASSETS = 'MISSING_ASSETS'
}

interface ValidationError {
  type: ValidationErrorType;
  message: string;
}

// Enhanced validation utility
const validateCampaignData = (data: Partial<WizardData>): { 
  isValid: boolean; 
  errors: ValidationError[] 
} => {
  const errors: ValidationError[] = [];

  if (!data.step1?.campaignName) {
    errors.push({
      type: ValidationErrorType.MISSING_CAMPAIGN_NAME,
      message: "Campaign name is required"
    });
  }
  if (!data.step1?.startDate || !data.step1?.endDate) {
    errors.push({
      type: ValidationErrorType.MISSING_DATES,
      message: "Campaign dates are required"
    });
  }
  if (!data.step2?.primaryKPI) {
    errors.push({
      type: ValidationErrorType.MISSING_KPI,
      message: "Primary KPI is required"
    });
  }
  if (!data.step3?.locations?.length) {
    errors.push({
      type: ValidationErrorType.MISSING_LOCATION,
      message: "At least one location is required"
    });
  }
  if (!data.step4?.creativeAssets?.length) {
    errors.push({
      type: ValidationErrorType.MISSING_ASSETS,
      message: "At least one creative asset is required"
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

interface MetricCardProps {
  icon: any;
  title: string;
  value: string;
  color: 'blue' | 'purple' | 'green';
}

const MetricCard = ({ icon: Icon, title, value, color }: MetricCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white`}>
      <div className="flex items-center mb-2">
        <Icon className="w-6 h-6 text-white/80" />
        <p className="ml-2 text-white/80">{title}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

interface DetailSectionProps {
  icon: any;
  title: string;
  content: React.ReactNode;
}

const DetailSection = ({ icon: Icon, title, content }: DetailSectionProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
  >
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <Icon className="w-6 h-6 mr-2 text-gray-600" />
        {title}
      </h3>
      <div className="space-y-4">{content}</div>
    </div>
  </motion.section>
);

const CampaignDetails = ({ data }: { data: any }) => (
  <div className="space-y-3">
    <DataRow label="Platform" value={data.platform} />
    <DataRow label="Start Date" value={new Date(data.startDate).toLocaleDateString()} />
    <DataRow label="End Date" value={new Date(data.endDate).toLocaleDateString()} />
    <DataRow label="Time Zone" value={data.timeZone} />
    <DataRow label="Influencer Handle" value={data.influencerHandle} />
  </div>
);

const ContactInfo = ({ data }: { data: any }) => (
  <div className="space-y-4">
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-700 mb-2">Primary Contact</h4>
      <p>{data.primaryContact.firstName} {data.primaryContact.surname}</p>
      <p className="text-blue-600">{data.primaryContact.email}</p>
      <p className="text-gray-500">{data.primaryContact.position}</p>
    </div>
    {data.secondaryContact?.email && (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-2">Secondary Contact</h4>
        <p>{data.secondaryContact.firstName} {data.secondaryContact.surname}</p>
        <p className="text-blue-600">{data.secondaryContact.email}</p>
        <p className="text-gray-500">{data.secondaryContact.position}</p>
      </div>
    )}
  </div>
);

const CampaignObjectives = ({ data }: { data: any }) => (
  <div className="grid grid-cols-2 gap-6">
    <div>
      <DataRow label="Primary KPI" value={data.primaryKPI} />
      <DataRow label="Secondary KPIs" value={data.secondaryKPIs?.join(', ') || 'None'} />
      <DataRow label="Main Message" value={data.mainMessage} />
    </div>
    <div>
      <DataRow label="Brand Perception" value={data.brandPerception} />
      <DataRow label="Key Benefits" value={data.keyBenefits} />
      <DataRow label="Expected Achievements" value={data.expectedAchievements} />
    </div>
  </div>
);

const FeaturesList = ({ features }: { features: string[] }) => (
  <div>
    {features?.length > 0 ? (
      <ul className="space-y-2">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center text-gray-700">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 italic">No features selected</p>
    )}
  </div>
);

const RequirementsList = ({ requirements }: { requirements: any[] }) => (
  <div>
    {requirements?.length > 0 ? (
      <ul className="space-y-2">
        {requirements.map((req: any, index: number) => (
          <li key={index} className="flex items-center text-gray-700">
            <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2" />
            {req.requirement}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 italic">No creative requirements specified</p>
    )}
  </div>
);

const DataRow = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="flex items-center py-2 border-b border-gray-100 last:border-0">
    <span className="font-medium text-gray-600 w-1/3">{label}</span>
    <span className="text-gray-800">{value || 'Not specified'}</span>
  </div>
);

// Main component with performance optimizations
function CampaignStep5Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle both correct and incorrect URL formats
  const campaignId = searchParams.get('id') || searchParams.toString().match(/id(\d+)/)?.[1];
  
  console.log('URL:', window.location.href);
  console.log('Search Params:', searchParams.toString());
  console.log('Extracted Campaign ID:', campaignId);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        if (!campaignId) {
          // If we detect the wrong URL format, let's fix it
          const wrongFormatMatch = searchParams.toString().match(/id(\d+)/);
          if (wrongFormatMatch) {
            const correctId = wrongFormatMatch[1];
            router.replace(`/campaigns/wizard/step-5?id=${correctId}`);
            return;
          }
          setError('Campaign ID is required');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/campaigns?id=${campaignId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load campaign');
        }

        setCampaignData(result.campaign);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaign');
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, [campaignId, router, searchParams]);

  const StatusBadge = ({ status }: { status: string }) => {
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

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium 
        ${statusConfig.color} border shadow-sm`}>
        <statusConfig.icon className="w-4 h-4 mr-2" />
        {statusConfig.label}
      </span>
    );
  };

  const SectionCard = ({ title, children, id }: { title: string; children: React.ReactNode; id: string }) => (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden
        ${activeSection === id ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => setActiveSection(id)}
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          {title}
        </h3>
        <div className="space-y-4">{children}</div>
      </div>
    </motion.section>
  );

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit this campaign?')) {
      try {
        setIsSubmitting(true);
        const response = await fetch(`/api/campaigns/${campaignId}/submit`, {
          method: 'POST',
        });
        const result = await response.json();
        if (response.ok) {
          alert('Campaign submitted successfully!');
          router.push('/campaigns');
        } else {
          throw new Error(result.error || 'Failed to submit campaign');
        }
      } catch (error) {
        console.error('Error submitting campaign:', error);
        alert('Failed to submit campaign. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        {...fadeIn}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex items-center">
            <XCircleIcon className="w-6 h-6 text-red-400 mr-3" />
            <h3 className="text-red-800 font-medium">Error Loading Campaign</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 text-red-600 hover:text-red-500 font-medium"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <motion.h1 
              className="text-4xl font-bold text-gray-900 mb-2"
              {...fadeIn}
            >
              {campaignData.campaignName}
            </motion.h1>
            <motion.p 
              className="text-gray-500"
              {...fadeIn}
              transition={{ delay: 0.1 }}
            >
              Created on {new Date(campaignData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </motion.p>
          </div>
          <StatusBadge status={campaignData.submissionStatus} />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MetricCard
            icon={CurrencyDollarIcon}
            title="Total Budget"
            value={`${campaignData.currency} ${campaignData.totalBudget.toLocaleString()}`}
            color="blue"
          />
          <MetricCard
            icon={CalendarIcon}
            title="Campaign Duration"
            value={`${Math.ceil((new Date(campaignData.endDate).getTime() - 
              new Date(campaignData.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days`}
            color="purple"
          />
          <MetricCard
            icon={UserGroupIcon}
            title="Platform"
            value={campaignData.platform}
            color="green"
          />
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DetailSection
            icon={DocumentTextIcon}
            title="Campaign Details"
            content={<CampaignDetails data={campaignData} />}
          />
          <DetailSection
            icon={UserGroupIcon}
            title="Contact Information"
            content={<ContactInfo data={campaignData} />}
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <DetailSection
            icon={SparklesIcon}
            title="Campaign Objectives"
            content={<CampaignObjectives data={campaignData} />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DetailSection
            icon={CheckCircleIcon}
            title="Selected Features"
            content={<FeaturesList features={campaignData.features} />}
          />
          <DetailSection
            icon={PhotoIcon}
            title="Creative Requirements"
            content={<RequirementsList requirements={campaignData.creativeRequirements} />}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`
              px-8 py-3 rounded-lg font-medium text-white
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'}
              shadow-lg hover:shadow-xl transition-all duration-300
            `}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Campaign'}
          </motion.button>
        </div>

        {/* Debug Information */}
        <motion.div 
          className="mt-16 border-t pt-8"
          {...fadeIn}
          transition={{ delay: 0.3 }}
        >
          <details className="bg-gray-50 rounded-lg overflow-hidden">
            <summary className="cursor-pointer bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 transition-colors">
              Debug Information
            </summary>
            <div className="p-4">
              <pre className="bg-white p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(campaignData, null, 2)}
              </pre>
            </div>
          </details>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Add proper test coverage
if (process.env.NODE_ENV === 'test') {
  CampaignStep5Content.displayName = 'CampaignStep5Content';
}

export default function CampaignStep5() {
  return (
    <ErrorBoundary 
      fallback={<ErrorFallback />}
      onError={(error) => {
        console.error('Campaign Step 5 Error:', error);
        Analytics.track('Campaign_Step5_Error', { error: error.message });
      }}
    >
      <React.Suspense fallback={<LoadingSkeleton />}>
        <CampaignStep5Content />
      </React.Suspense>
    </ErrorBoundary>
  );
}

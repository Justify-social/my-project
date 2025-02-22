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

// Main component with performance optimizations
function CampaignStep5Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const { data: wizardData, loading, error } = useWizard<WizardData>();
  const [campaignData, setCampaignData] = useState(null);

  // Load campaign data
  useEffect(() => {
    const loadCampaignData = async () => {
      if (campaignId) {
        try {
          const response = await fetch(`/api/campaigns/${campaignId}`);
          const data = await response.json();
          if (data.success) {
            setCampaignData(data.campaign);
            reset(data.campaign);
          }
        } catch (error) {
          console.error('Error loading campaign:', error);
        }
      }
    };

    loadCampaignData();
  }, [campaignId]);

  // Memoized computations with proper dependencies
  const { isValid, errors } = useMemo(() => 
    validateCampaignData(wizardData || {}),
    [wizardData]
  );

  const formattedAssets = useMemo(() => 
    wizardData?.step4?.creativeAssets?.map(asset => ({
      ...asset,
      budget: asset.budget ? new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
      }).format(asset.budget) : 'N/A'
    })) || [],
    [wizardData?.step4?.creativeAssets]
  );

  // Enhanced error handling with retry logic
  const handleSubmit = async (data: FormData) => {
    const retryCount = 3;
    let attempt = 0;

    while (attempt < retryCount) {
      try {
        Analytics.track('Campaign_Submit_Started', { 
          campaignId,
          attempt: attempt + 1 
        });

        if (!isValid) {
          errors.forEach(error => 
            toast.error(error.message, {
              id: error.type,
              duration: 5000
            })
          );
          return;
        }

        // First update the campaign data
        const updateResponse = await fetch(`/api/campaigns/${campaignId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const updateResult = await updateResponse.json();

        if (updateResult.success) {
          // Then submit the campaign
          const submitResponse = await fetch(`/api/campaigns/${campaignId}/submit`, {
            method: 'POST',
          });

          const submitResult = await submitResponse.json();

          if (submitResult.success) {
            Analytics.track('Campaign_Submit_Success', { campaignId });
            toast.success('Campaign submitted successfully!');
            router.push(`/campaigns/wizard/submission?campaignId=${campaignId}`);
            return;
          }
        }

      } catch (error) {
        attempt++;
        console.error(`Submission attempt ${attempt} failed:`, error);
        
        if (attempt === retryCount) {
          Analytics.track('Campaign_Submit_Error', { 
            campaignId, 
            error: error instanceof Error ? error.message : 'Unknown error',
            attempts: attempt
          });
          toast.error('Failed to submit campaign after multiple attempts');
        }
      }
    }
  };

  const handleSaveDraft = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(wizardData),
      });

      if (!response.ok) throw new Error('Failed to save draft');
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Draft save error:', error);
      toast.error('Failed to save draft');
    }
  };

  const handleEdit = (step: number) => {
    router.push(`/campaigns/wizard/step-${step}?campaignId=${campaignId}`);
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !wizardData) {
    return (
      <div className="text-center p-8" role="alert">
        <h2 className="text-xl font-bold text-red-600">Error Loading Campaign</h2>
        <p className="mt-2">{error || 'Failed to load campaign data'}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-4xl mx-auto p-5">
      <Header currentStep={5} totalSteps={5} />
      
      {/* Campaign Details Section */}
      <ReviewSection title="Campaign Details" stepNumber={1} onEdit={handleEdit}>
        <div className="space-y-3">
          <div><span className="font-medium">Campaign Name: </span>{wizardData?.step1?.campaignName}</div>
          <div><span className="font-medium">Description: </span>{wizardData?.step1?.description}</div>
          <div><span className="font-medium">Start Date: </span>{wizardData?.step1?.startDate}</div>
          <div><span className="font-medium">End Date: </span>{wizardData?.step1?.endDate}</div>
          <div><span className="font-medium">Time Zone: </span>{wizardData?.step1?.timeZone}</div>
          <div className="mt-4">
            <span className="font-medium">Primary Contact:</span>
            <div className="ml-4">
              <div>Name: {wizardData?.step1?.primaryContact?.name}</div>
              <div>Email: {wizardData?.step1?.primaryContact?.email}</div>
              <div>Role: {wizardData?.step1?.primaryContact?.role}</div>
            </div>
          </div>
        </div>
      </ReviewSection>

      {/* Objectives Section */}
      <ReviewSection title="Objectives & Messaging" stepNumber={2} onEdit={handleEdit}>
        <div className="space-y-3">
          <div><span className="font-medium">Primary KPI: </span>{wizardData?.step2?.primaryKPI}</div>
          <div>
            <span className="font-medium">Secondary KPIs: </span>
            <ul className="list-disc ml-5">
              {wizardData?.step2?.secondaryKPIs?.map((kpi, index) => (
                <li key={index}>{kpi}</li>
              ))}
            </ul>
          </div>
          <div><span className="font-medium">Main Message: </span>{wizardData?.step2?.mainMessage}</div>
          <div>
            <span className="font-medium">Hashtags: </span>
            {wizardData?.step2?.hashtags?.join(', ')}
          </div>
          <div><span className="font-medium">Memorability: </span>{wizardData?.step2?.memorability}</div>
          <div><span className="font-medium">Key Benefits: </span>{wizardData?.step2?.keyBenefits}</div>
          <div><span className="font-medium">Expected Achievements: </span>{wizardData?.step2?.expectedAchievements}</div>
          <div><span className="font-medium">Purchase Intent: </span>{wizardData?.step2?.purchaseIntent}</div>
        </div>
      </ReviewSection>

      {/* Audience Section */}
      <ReviewSection title="Audience Targeting" stepNumber={3} onEdit={handleEdit}>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Locations: </span>
            {wizardData?.step3?.locations?.join(', ')}
          </div>
          <div>
            <span className="font-medium">Age Ranges: </span>
            {wizardData?.step3?.ageRanges?.join(', ')}
          </div>
          <div>
            <span className="font-medium">Genders: </span>
            {wizardData?.step3?.genders?.join(', ')}
          </div>
          <div>
            <span className="font-medium">Languages: </span>
            {wizardData?.step3?.languages?.join(', ')}
          </div>
        </div>
      </ReviewSection>

      {/* Creative Assets Section */}
      <ReviewSection title="Creative Assets" stepNumber={4} onEdit={handleEdit}>
        <div className="space-y-6">
          {wizardData?.step4?.creativeAssets?.map((asset, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Asset Name: </span>
                  {asset.assetName}
                </div>
                <div>
                  <span className="font-medium">Type: </span>
                  {asset.type}
                </div>
                <div>
                  <span className="font-medium">Influencer Handle: </span>
                  {asset.influencerHandle || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Budget: </span>
                  {new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: 'GBP'
                  }).format(asset.budget || 0)}
                </div>
              </div>
              <div className="mt-4">
                <span className="font-medium">Why This Influencer: </span>
                <p className="mt-1 text-gray-600">{asset.whyInfluencer || 'Not specified'}</p>
              </div>
              <AssetPreview
                type={asset.type}
                url={asset.url}
                title={asset.assetName}
                className="mt-4"
              />
            </div>
          ))}
        </div>
      </ReviewSection>

      {/* Progress Bar */}
      <div className="mt-8">
        <ProgressBar
          currentStep={5}
          onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?campaignId=${campaignId}`)}
          onBack={() => router.push(`/campaigns/wizard/step-4?campaignId=${campaignId}`)}
          onNext={handleSubmit}
          disableNext={!isValid}
        />
      </div>
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

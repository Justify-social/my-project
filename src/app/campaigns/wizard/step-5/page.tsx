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
  const campaignId = searchParams.get('id');
  const { data: wizardData, updateData } = useWizard();
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  useEffect(() => {
    const loadCampaignData = async () => {
      if (campaignId && !hasLoadedInitialData) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/campaigns/${campaignId}`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to load campaign');
          }

          if (result.success) {
            const mappedData = {
              overview: result.campaign.overview || {},
              objectives: result.campaign.objectives || {},
              audience: result.campaign.audience || {},
              assets: {
                creativeAssets: result.campaign.creativeAssets || []
              }
            };

            updateData(mappedData);
            setHasLoadedInitialData(true);
          }
        } catch (error) {
          console.error('Error loading campaign:', error);
          toast.error('Failed to load campaign data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCampaignData();
  }, [campaignId, hasLoadedInitialData, updateData]);

  const handleSubmit = async () => {
    try {
      // Your submit logic here
      router.push(`/campaigns/wizard/submission?id=${campaignId}`);
    } catch (error) {
      console.error('Error submitting campaign:', error);
      toast.error('Failed to submit campaign');
    }
  };

  // Enhanced helper functions
  const safeJoin = (arr: any[] | undefined | null, separator: string = ', ') => {
    if (!Array.isArray(arr)) return 'N/A';
    return arr.length > 0 ? arr.join(separator) : 'N/A';
  };

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value || 'N/A';
    if (typeof value === 'number') return value.toString();
    if (Array.isArray(value)) return safeJoin(value);
    if (typeof value === 'object') {
      // Handle nested objects carefully
      return 'N/A';
    }
    return 'N/A';
  };

  const formatContact = (contact: any) => {
    if (!contact) return 'N/A';
    const name = [contact.firstName, contact.surname].filter(Boolean).join(' ');
    return {
      name: name || 'N/A',
      email: contact.email || 'N/A',
      position: contact.position || 'N/A'
    };
  };

  if (isLoading || !wizardData) {
    return <LoadingSkeleton />;
  }

  const primaryContact = formatContact(wizardData?.overview?.primaryContact);

  return (
    <div className="max-w-4xl mx-auto p-5">
      <Header currentStep={5} totalSteps={5} />
      
      {/* Campaign Details Section */}
      <ReviewSection title="Campaign Details" stepNumber={1} onEdit={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}>
        <div className="space-y-3">
          <div><span className="font-medium">Campaign Name: </span>{safeString(wizardData?.overview?.name)}</div>
          <div><span className="font-medium">Description: </span>{safeString(wizardData?.overview?.businessGoal)}</div>
          <div><span className="font-medium">Start Date: </span>{safeString(wizardData?.overview?.startDate)}</div>
          <div><span className="font-medium">End Date: </span>{safeString(wizardData?.overview?.endDate)}</div>
          <div><span className="font-medium">Time Zone: </span>{safeString(wizardData?.overview?.timeZone)}</div>
          <div className="mt-4">
            <span className="font-medium">Primary Contact:</span>
            <div className="ml-4">
              <div>Name: {primaryContact.name}</div>
              <div>Email: {primaryContact.email}</div>
              <div>Role: {primaryContact.position}</div>
            </div>
          </div>
        </div>
      </ReviewSection>

      {/* Objectives Section */}
      <ReviewSection title="Objectives & Messaging" stepNumber={2} onEdit={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}>
        <div className="space-y-3">
          <div><span className="font-medium">Primary KPI: </span>{safeString(wizardData?.objectives?.primaryKPI)}</div>
          <div>
            <span className="font-medium">Secondary KPIs: </span>
            {safeJoin(wizardData?.objectives?.secondaryKPIs)}
          </div>
          <div><span className="font-medium">Main Message: </span>{safeString(wizardData?.objectives?.mainMessage)}</div>
          <div><span className="font-medium">Hashtags: </span>{safeJoin(wizardData?.objectives?.hashtags)}</div>
        </div>
      </ReviewSection>

      {/* Audience Section */}
      <ReviewSection title="Audience Targeting" stepNumber={3} onEdit={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}>
        <div className="space-y-3">
          <div><span className="font-medium">Locations: </span>{safeJoin(wizardData?.audience?.locations)}</div>
          <div><span className="font-medium">Age Ranges: </span>{safeJoin(wizardData?.audience?.ageRanges)}</div>
          <div><span className="font-medium">Genders: </span>{safeJoin(wizardData?.audience?.genders)}</div>
          <div><span className="font-medium">Languages: </span>{safeJoin(wizardData?.audience?.languages)}</div>
        </div>
      </ReviewSection>

      {/* Creative Assets Section */}
      <ReviewSection title="Creative Assets" stepNumber={4} onEdit={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}>
        <div className="space-y-6">
          {Array.isArray(wizardData?.assets?.creativeAssets) && wizardData.assets.creativeAssets.length > 0 ? (
            wizardData.assets.creativeAssets.map((asset, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium">Asset Name: </span>{safeString(asset.assetName)}</div>
                  <div><span className="font-medium">Type: </span>{safeString(asset.type)}</div>
                  <div><span className="font-medium">Influencer: </span>{safeString(asset.influencerHandle)}</div>
                  <div>
                    <span className="font-medium">Budget: </span>
                    {typeof asset.budget === 'number' ? 
                      new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(asset.budget) 
                      : 'N/A'}
                  </div>
                </div>
                {asset.url && (
                  <AssetPreview
                    type={asset.type}
                    url={safeString(asset.url)}
                    title={safeString(asset.assetName)}
                    className="mt-4"
                  />
                )}
              </div>
            ))
          ) : (
            <p>No creative assets added</p>
          )}
        </div>
      </ReviewSection>

      <ProgressBar
        currentStep={5}
        onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`)}
        onBack={() => router.push(`/campaigns/wizard/step-4?id=${campaignId}`)}
        onNext={handleSubmit}
        disableNext={false}
        isFormValid={true}
        isDirty={false}
      />
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

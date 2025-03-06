"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { useWizard } from "@/context/WizardContext";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ErrorFallback from '@/components/ErrorFallback';
import { 
  CheckCircleIcon, 
  ChevronRightIcon,
  PencilIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import Link from "next/link";
import { EnumTransformers } from '@/utils/enum-transformers';

// Type Definitions
interface CreativeAsset {
  id: string;
  assetName: string;
  type: string;
  url: string;
  fileName: string;
  fileSize?: number;
  influencerHandle?: string;
  influencerName?: string;
  influencerFollowers?: string;
  whyInfluencer?: string;
  budget?: number;
}

// Additional type definitions aligned with WizardContext
type KPI = string;
type Feature = string;

// Summary Section Component for displaying each step's data
interface SummarySectionProps {
  title: string;
  stepNumber: number;
  onEdit: () => void;
  children: React.ReactNode;
}

const SummarySection: React.FC<SummarySectionProps> = ({ 
  title, 
  stepNumber, 
  onEdit, 
  children 
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3 font-semibold">
            {stepNumber}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
        aria-label={`Edit ${title}`}
      >
          <PencilIcon className="h-4 w-4 mr-1" />
        <span>Edit</span>
      </button>
    </div>
      <div className="pl-11">
    {children}
      </div>
    </div>
  );
};

// Data Item Component for displaying individual data points
interface DataItemProps {
  label: string;
  value: string | number | null;
}

const DataItem: React.FC<DataItemProps> = ({ label, value }) => {
  // Convert objects or other non-primitive values to strings
  const displayValue = () => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    
    // If value is an object, convert to a string representation
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return 'Complex Object';
      }
    }
    
    return value;
  };

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500 mb-1 font-medium">{label}</p>
      <p className="font-medium text-gray-800">{displayValue()}</p>
    </div>
  );
};

// Add a type for merged data
interface MergedData {
  [key: string]: any;
  overview?: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    timeZone?: string;
    currency?: string;
    totalBudget?: number;
    socialMediaBudget?: number;
    primaryContact?: {
      firstName?: string;
      surname?: string;
      email?: string;
      position?: string;
    };
    secondaryContact?: {
      firstName?: string;
      surname?: string;
      email?: string;
      position?: string;
    };
    influencerName?: string;
    influencerHandle?: string;
  };
  objectives?: {
    primaryKPI?: string;
    secondaryKPIs?: string[];
    features?: string[];
    mainMessage?: string;
    hashtags?: string;
    keyBenefits?: string;
    expectedAchievements?: string;
  };
  audience?: {
    age1824?: number;
    age2534?: number;
    age3544?: number;
    age4554?: number;
    age5564?: number;
    age65plus?: number;
    genders?: {gender: string}[];
    locations?: {location: string}[];
    languages?: {language: string}[];
    educationLevel?: string;
    incomeLevel?: string;
    jobTitles?: string;
    screeningQuestions?: {question: string}[];
    competitors?: {competitor: string}[];
    brandPerception?: string;
  };
  creativeAssets?: CreativeAsset[];
  creativeRequirements?: {requirement: string}[];
  campaignName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  currency?: string;
  totalBudget?: number;
  socialMediaBudget?: number;
  primaryContact?: any;
  secondaryContact?: any;
  influencerName?: string;
  influencerHandle?: string;
  primaryKPI?: string;
  secondaryKPIs?: string[];
  features?: string[];
  mainMessage?: string;
  hashtags?: string;
  keyBenefits?: string;
  expectedAchievements?: string;
  brandPerception?: string;
}

// Main Component
function Step5Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const { 
    data, 
    loading: wizardLoading,
    reloadCampaignData 
  } = useWizard();
  
  const [isLoading, setIsLoading] = useState(wizardLoading);
  const [error, setError] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState<Record<string, any>>(null);
  const [validationState, setValidationState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [showAssets, setShowAssets] = useState(false);
  const hasFetchedRef = useRef(false);
  
  // useMemo for displayData
  const displayData = useMemo(() => {
    // Skip detailed logging to avoid console pollution
    const hasSourceData = Boolean(campaignData || data);
    
    if (!campaignData && !data) {
      // Only log once, not on every render
      console.warn("No data available from any source");
      return {} as MergedData;
    }
    
    // Create a deep merged object that combines data from both sources
    const mergedData: MergedData = {};
    
    // First add all properties from context data (data)
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        mergedData[key] = data[key as keyof typeof data];
      });
    }
    
    // Then add/override with campaignData properties (from direct API call)
    if (campaignData && typeof campaignData === 'object') {
      Object.keys(campaignData).forEach(key => {
        // For nested objects like overview, objectives, etc., merge instead of override
        if (
          typeof campaignData[key] === 'object' && 
          campaignData[key] !== null && 
          typeof mergedData[key] === 'object' && 
          mergedData[key] !== null
        ) {
          mergedData[key] = { ...mergedData[key], ...campaignData[key] };
        } else {
          mergedData[key] = campaignData[key];
        }
      });
    }
    
    if (Object.keys(mergedData).length > 0) {
      // Log success but only if we have data and only once
      console.log("Successfully merged data from all sources");
    }
    
    return mergedData;
  }, [campaignData, data]);
  
  // Check if we have minimal data
  const hasMinimalData = Boolean(
    displayData && 
    Object.keys(displayData).length > 0 && 
    (displayData.campaignName || (displayData.overview && displayData.overview.name))
  );

  // Use data from WizardContext if available
  useEffect(() => {
    if (campaignData && !campaignData) {
      setCampaignData(campaignData);
      validateCampaignData(campaignData);
    }
    setIsLoading(wizardLoading);
  }, [campaignData, wizardLoading]);
  
  // Load campaign data if needed
  useEffect(() => {
    // Skip if we've already attempted to fetch or if data is already available from WizardContext
    if (hasFetchedRef.current || campaignData) {
      console.log("Skipping fetch - already attempted or data available from context");
      return;
    }
    
    // Mark that we've attempted to fetch
    hasFetchedRef.current = true;

    // Use reloadCampaignData from WizardContext instead of implementing our own fetch
    if (campaignId) {
      reloadCampaignData();
    } else {
      setError("Campaign ID is missing");
      setIsLoading(false);
    }
  }, [campaignId, campaignData, reloadCampaignData]);

  // Check for valid data
  useEffect(() => {
    if (data) {
      console.log("Current data in Step 5:", data);
      
      // Log specific sections to help diagnose what's missing
      if (data.overview) console.log("Overview data:", data.overview);
      if (data.objectives) console.log("Objectives data:", data.objectives);
      if (data.audience) console.log("Audience data:", data.audience);
      if (data.assets) console.log("Assets data:", data.assets);
      
      // Reset validation messages to avoid duplicates
      setValidationState({});
    }
  }, [data]);

  // Check for empty data after loading
  useEffect(() => {
    // Only run this check once loading is complete and there's no error already set
    if (!isLoading && !error) {
      const isEmpty = !displayData || Object.keys(displayData).length === 0;
      if (isEmpty && hasFetchedRef.current) {
        console.error("Data loading completed but no data was found");
        setError("Campaign data was loaded but appears to be empty. Please try resetting the page.");
      }
    }
  }, [isLoading, error, displayData]);

  // Navigate to edit a specific step
  const navigateToStep = (step: number) => {
    router.push(`/campaigns/wizard/step-${step}?id=${campaignId}`);
  };

  // Handle final submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/campaigns/${campaignId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No request body needed, but if any is added in the future:
        // body: JSON.stringify(EnumTransformers.transformObjectToBackend(requestBody)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit campaign");
      }

      toast.success("Campaign submitted successfully!");
      router.push(`/campaigns/wizard/submission?id=${campaignId}`);
    } catch (error) {
      console.error("Error submitting campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionStatus: 'draft'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save draft');
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // Modify the reset button to properly clear the fetch attempt flag
  const handleReset = () => {
    // Clear fetch attempt tracking
    hasFetchedRef.current = false;
    
    // Clear session storage for this campaign
    if (campaignId) {
      try {
        sessionStorage.removeItem(`fetch_limit_${campaignId}`);
        console.log("Cleared fetch counter for campaign", campaignId);
      } catch (e) {
        console.warn("Could not clear sessionStorage - may be in private browsing mode");
      }
    }
    
    // Reset component state
    setError(null);
    setIsLoading(true);
    setCampaignData(null);
    
    // Force hard reload after a short delay
    setTimeout(() => window.location.reload(), 500);
  };

  // Define a simple validation function in the file
  const validateCampaignData = (data: any): void => {
    // Reset validation messages to avoid duplicates
    setValidationMessages([]);
    
    // Check for missing critical sections
    const missingKeys: string[] = [];
    if (!data.overview || Object.keys(data.overview).length === 0) missingKeys.push('overview');
    if (!data.objectives || Object.keys(data.objectives).length === 0) missingKeys.push('objectives');
    if (!data.audience || Object.keys(data.audience).length === 0) missingKeys.push('audience');
    if (!data.assets || Object.keys(data.assets).length === 0) missingKeys.push('assets');
    
    // Basic validation checks
    if (!data) {
      setValidationMessages(['Campaign data is empty or invalid']);
      return;
    }
    
    // Add any missing sections to validation messages
    if (missingKeys.length > 0) {
      setValidationMessages([
        `Some campaign data is missing (${missingKeys.join(', ')}). Please complete all steps before submission.`
      ]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading campaign data...</p>
      </div>
    );
  }

  if (error) {
    // Special handling for "not found" errors
    const isNotFoundError = error.includes("404 Not Found") || error.includes("not found");
    
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Campaign</h3>
        <p className="text-red-600 mb-4">{error}</p>
        
        {/* Add a reset button to clear any cached state */}
          <button 
          onClick={handleReset}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Reset Cache & Reload
          </button>
        
        {isNotFoundError ? (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h4 className="text-lg font-medium mb-3">Campaign Not Found</h4>
            <p className="mb-4">
              The campaign with ID {campaignId} couldn't be found in the database. It may have been deleted or never existed.
            </p>
            <div className="flex flex-col space-y-4">
              <Link 
                href="/campaigns"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 w-full md:w-auto"
              >
                View All Campaigns
              </Link>
              
              <Link 
                href="/campaigns/wizard/step-1"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full md:w-auto"
              >
                Create New Campaign
              </Link>
          </div>
          </div>
        ) : (
          <div className="bg-red-100 p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2">Debugging Information:</h4>
            <p className="text-sm">Campaign ID: {campaignId || 'Not provided'}</p>
            <p className="text-sm">Data loaded: {Object.keys(data || {}).length > 0 ? 'Yes, from context' : 'No'}</p>
            <p className="text-sm">Direct API data loaded: {Object.keys(campaignData || {}).length > 0 ? 'Yes' : 'No'}</p>
            
            {/* Add a debugging tool to check database connection */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Troubleshooting Steps:</p>
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>Check that campaign ID {campaignId} exists in your database</li>
                <li>Verify API route <code>/api/campaigns/{campaignId}</code> is working correctly</li>
                <li>Check browser console logs for detailed API responses and errors</li>
                <li>Inspect your server logs for backend errors</li>
              </ol>
            </div>
          </div>
        )}
        
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              setTimeout(() => {
                if (campaignId) {
                  window.location.href = `/campaigns/wizard/step-5?id=${campaignId}`;
                } else {
                  router.push('/campaigns');
                }
              }, 500);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/campaigns')}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
          >
            Return to Campaigns
          </button>
          
          {/* Add a button to manually test the API */}
          <button
            onClick={async () => {
              try {
                console.log("Testing API endpoint manually...");
                // Use the corrected endpoint format with query parameter
                const response = await fetch(`/api/campaigns?id=${campaignId}`);
                console.log("Manual test response status:", response.status);
                
                if (!response.ok) {
                  console.error("API test failed with status:", response.status);
                  alert(`API test failed: ${response.status} ${response.statusText}`);
                  return;
                }
                
                const data = await response.json();
                console.log("Manual API test result:", data);
                alert(`API test success! Check console for details.`);
              } catch (err) {
                console.error("Manual API test error:", err);
                alert(`API test error: ${err instanceof Error ? err.message : String(err)}`);
              }
            }}
            className="px-4 py-2 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md hover:bg-yellow-100"
          >
            Test API Endpoint
          </button>
        </div>
    </div>
  );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Add Reset Button at top when we have campaign ID but no/minimal data */}
      {campaignId && (!hasMinimalData || error) && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-medium text-blue-800 mb-2">Having trouble viewing this campaign?</h3>
          <p className="text-blue-700 mb-3">
            {!hasMinimalData 
              ? "Campaign data is not loading properly. You can try resetting the page cache."
              : "Some campaign data may be missing. You can try resetting to reload all data."}
          </p>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reset & Reload Page
          </button>
        </div>
      )}

      {/* Warning if we have some data but it's incomplete */}
      {hasMinimalData && Object.keys(displayData).length < 5 && !error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Limited Campaign Data</h3>
          <p className="text-yellow-700 mb-3">
            We found some basic information for this campaign, but detailed data might be missing.
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Campaign Creation</h1>
        <p className="text-gray-600">Review your campaign details and submit</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Campaign Details */}
        <SummarySection
          title="Campaign Details"
          stepNumber={1}
          onEdit={() => navigateToStep(1)}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
          <div>
                <h3 className="font-medium text-gray-700">Campaign Name</h3>
                <p className="text-gray-900 font-semibold mt-1 text-lg">
                  {displayData.campaignName || displayData?.overview?.name || 'Not specified'}
                </p>
              </div>
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="px-4 py-5">
            <h3 className="font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-800">
              {displayData.description || displayData?.overview?.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-3">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Start Date</h3>
              <p className="text-gray-800 mt-1 font-medium">
                {displayData.startDate 
                  ? new Date(displayData.startDate).toLocaleDateString() 
                  : displayData?.overview?.startDate 
                    ? new Date(displayData?.overview?.startDate).toLocaleDateString()
                    : 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">End Date</h3>
              <p className="text-gray-800 mt-1 font-medium">
                {displayData.endDate 
                  ? new Date(displayData.endDate).toLocaleDateString()
                  : displayData?.overview?.endDate
                    ? new Date(displayData?.overview?.endDate).toLocaleDateString()
                    : 'Not specified'}
              </p>
            </div>
          </div>

          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-gray-600">Time Zone</h3>
            <p className="text-gray-800 mt-1 font-medium">
              {displayData.timeZone || displayData?.overview?.timeZone || 'Not specified'}
            </p>
          </div>

          <div className="px-4 py-4 border-t border-b border-gray-100 bg-gray-50 rounded-md my-3">
            <div className="mb-5">
              <h3 className="font-medium text-gray-700 mb-3">Primary Contact</h3>
              {(displayData.primaryContact || displayData?.overview?.primaryContact) ? (
                <div>
                  <p className="font-medium text-gray-800">
                    {displayData.primaryContact?.firstName || displayData?.overview?.primaryContact?.firstName || ''} 
                    {' '}
                    {displayData.primaryContact?.surname || displayData?.overview?.primaryContact?.surname || ''}
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-700 text-sm">
                      {displayData.primaryContact?.email || displayData?.overview?.primaryContact?.email || ''}
                    </p>
                    <span className="ml-3 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md font-medium">
                      {displayData.primaryContact?.position || displayData?.overview?.primaryContact?.position || ''}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No primary contact specified</p>
              )}
            </div>

            {(displayData.secondaryContact?.email || displayData?.overview?.secondaryContact?.email) && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Secondary Contact</h3>
                <div>
                  <p className="font-medium text-gray-800">
                    {displayData.secondaryContact?.firstName || displayData?.overview?.secondaryContact?.firstName || ''} 
                    {' '}
                    {displayData.secondaryContact?.surname || displayData?.overview?.secondaryContact?.surname || ''}
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-700 text-sm">
                      {displayData.secondaryContact?.email || displayData?.overview?.secondaryContact?.email || ''}
                    </p>
                    <span className="ml-3 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md font-medium">
                      {displayData.secondaryContact?.position || displayData?.overview?.secondaryContact?.position || ''}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Currency</h3>
              <p className="text-gray-800 font-medium mt-1">
                {displayData.currency || displayData?.overview?.currency || 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total campaign budget</h3>
              <p className="text-gray-800 font-medium mt-1">
                {displayData.totalBudget 
                  ? `${displayData.currency || '£'} ${displayData.totalBudget}`
                  : displayData?.overview?.totalBudget
                    ? `${displayData?.overview?.currency || '£'} ${displayData?.overview?.totalBudget}`
                    : 'Not specified'}
              </p>
            </div>
          </div>

          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-gray-600">Budget allocated to social media</h3>
            <p className="text-gray-800 font-medium mt-1">
              {displayData.socialMediaBudget 
                ? `${displayData.currency || '£'} ${displayData.socialMediaBudget}`
                : displayData?.overview?.socialMediaBudget
                  ? `${displayData?.overview?.currency || '£'} ${displayData?.overview?.socialMediaBudget}`
                  : 'Not specified'}
            </p>
          </div>

          <div className="px-4 py-4 border-t border-gray-100 mt-2">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Influencer</h3>
              <div className="flex items-center mt-1">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3">
                  {/* Default profile icon if no image */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {displayData.influencerName || displayData?.overview?.influencerName || 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {displayData.influencerHandle || displayData?.overview?.influencerHandle || '@influencer'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SummarySection>

        {/* Step 2: Objectives & Messaging */}
        <SummarySection
          title="Objectives & Messaging"
          stepNumber={2}
          onEdit={() => navigateToStep(2)}
        >
          {/* Campaign Objectives Section */}
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="px-4 py-4">
              <h3 className="font-medium text-gray-700 mb-4">Objectives</h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataItem 
                    label="Primary KPI" 
                    value={displayData.primaryKPI || displayData?.objectives?.primaryKPI || 'Not specified'} 
                  />
                  
                  <DataItem 
                    label="Secondary KPIs" 
                    value={
                      (displayData.secondaryKPIs && displayData.secondaryKPIs.length > 0)
                        ? displayData.secondaryKPIs.join(', ')
                        : (displayData?.objectives?.secondaryKPIs && Array.isArray(displayData?.objectives?.secondaryKPIs) && displayData?.objectives?.secondaryKPIs.length > 0)
                          ? displayData.objectives.secondaryKPIs.join(', ')
                          : 'None'
                    } 
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {(displayData.features && Array.isArray(displayData.features) && displayData.features.length > 0) ? (
                      displayData.features.map((feature: string, idx: number) => (
                        <span 
                          key={idx}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {feature.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (displayData?.objectives?.features && Array.isArray(displayData?.objectives?.features) && displayData?.objectives?.features.length > 0) ? (
                      displayData.objectives.features.map((feature: string, idx: number) => (
                        <span 
                          key={idx}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {typeof feature === 'string' ? feature.replace(/_/g, ' ') : feature}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No features specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Main Message</h4>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-100">
                    {displayData.mainMessage || displayData?.objectives?.mainMessage || 'No main message provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Hashtags</h4>
                  <p className="text-gray-800">
                    {displayData.hashtags || displayData?.objectives?.hashtags || 'No hashtags provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Benefits</h4>
                  <p className="text-gray-800">
                    {displayData.keyBenefits || displayData?.objectives?.keyBenefits || 'No key benefits provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Achievements</h4>
                  <p className="text-gray-800">
                    {displayData.expectedAchievements || displayData?.objectives?.expectedAchievements || 'No expected achievements provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SummarySection>

        {/* Step 3: Audience & Competitors */}
        <SummarySection
          title="Audience Targeting"
          stepNumber={3}
          onEdit={() => navigateToStep(3)}
        >
          {displayData.audience || displayData?.audience ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-4">Demographics</h3>
                  
                  <DataItem 
                    label="Age Distribution" 
                    value={
                      displayData.audience?.age1824 !== undefined ? 
                        `18-24: ${displayData.audience.age1824}%, 25-34: ${displayData.audience.age2534}%, 35-44: ${displayData.audience.age3544}%, 45-54: ${displayData.audience.age4554}%, 55-64: ${displayData.audience.age5564}%, 65+: ${displayData.audience.age65plus}%`
                      : 'Not specified'
                    } 
                  />
                  
                  <DataItem 
                    label="Genders" 
                    value={
                      displayData.audience?.genders && Array.isArray(displayData.audience.genders) && displayData.audience.genders.length > 0 ?
                        displayData.audience.genders.map((g: any) => g.gender).join(', ')
                      : 'Not specified'
                    } 
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-gray-700 mb-4">Location</h3>
                  
                  <DataItem 
                    label="Locations" 
                    value={
                      displayData.audience?.locations && Array.isArray(displayData.audience.locations) && displayData.audience.locations.length > 0 ?
                        displayData.audience.locations.map((l: any) => l.location).join(', ')
                      : 'Not specified'
                    } 
                  />
                  
                  <DataItem 
                    label="Languages" 
                    value={
                      displayData.audience?.languages && Array.isArray(displayData.audience.languages) && displayData.audience.languages.length > 0 ?
                        displayData.audience.languages.map((l: any) => l.language).join(', ')
                      : 'Not specified'
                    } 
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                <h3 className="font-medium text-gray-700 mb-4">Advanced Targeting</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DataItem 
                    label="Education Level" 
                    value={displayData.audience?.educationLevel || 'Not specified'} 
                  />
                  
                  <DataItem 
                    label="Income Level" 
                    value={
                      displayData.audience?.incomeLevel ? 
                        `${displayData.currency || '$'}${displayData.audience.incomeLevel}`
                      : 'Not specified'
                    } 
                  />
                  
                  <DataItem 
                    label="Job Titles" 
                    value={displayData.audience?.jobTitles || 'Not specified'} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500">Audience data not available. Please complete Step 3.</p>
            </div>
          )}

          <div className="space-y-6">
            {displayData.audience?.screeningQuestions && Array.isArray(displayData.audience.screeningQuestions) && 
              displayData.audience.screeningQuestions.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Screening Questions</h3>
                <ul className="space-y-2">
                  {displayData.audience.screeningQuestions.map((item: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-sm bg-gray-50 rounded-md p-3 inline-block border border-gray-100">
                        {item.question}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayData.audience?.competitors && Array.isArray(displayData.audience.competitors) && 
              displayData.audience.competitors.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-3">Competitors</h3>
                <div className="flex flex-wrap gap-2">
                  {displayData.audience.competitors.map((item: any, index: number) => (
                    <span key={index} className="inline-block px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium">
                      {item.competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-3">
              <h3 className="font-medium text-gray-700 mb-2">Brand Perception</h3>
              <p className="text-gray-800">
                {displayData.brandPerception || displayData?.audience?.brandPerception || 'Not specified'}
              </p>
            </div>
          </div>
        </SummarySection>

        {/* Step 4: Creative Assets */}
        <SummarySection
          title="Creative Assets"
          stepNumber={4}
          onEdit={() => navigateToStep(4)}
        >
          <div className="mb-4">
            <button
              onClick={() => setShowAssets(!showAssets)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>{showAssets ? 'Hide' : 'Show'} uploaded assets</span>
              <ChevronRightIcon 
                className={`h-5 w-5 ml-1 transition-transform duration-200 ${showAssets ? 'rotate-90' : ''}`} 
              />
            </button>
          </div>

          {showAssets && displayData.creativeAssets && Array.isArray(displayData.creativeAssets) && displayData.creativeAssets.length > 0 && (
            <div className="space-y-4">
              {displayData.creativeAssets.map((asset: CreativeAsset, index: number) => (
                <div key={asset.id || index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                    <h3 className="font-medium text-gray-800">{asset.assetName}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                      {asset.type}
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">File Name</p>
                      <div className="flex items-center">
                        <DocumentIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="font-medium text-gray-800">{asset.fileName}</p>
                      </div>
                    </div>
                    {asset.influencerHandle && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Influencer</p>
                        <p className="font-medium text-gray-800">{asset.influencerHandle}</p>
                      </div>
                    )}
                    {asset.budget !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Budget</p>
                        <p className="font-medium text-gray-800">
                          {displayData.currency || '$'}{asset.budget}
                        </p>
                      </div>
                    )}
                    {asset.whyInfluencer && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Why this influencer?</p>
                        <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">{asset.whyInfluencer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!displayData.creativeAssets || !Array.isArray(displayData.creativeAssets) || displayData.creativeAssets.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
              <p className="text-yellow-800">No assets have been uploaded yet.</p>
            </div>
          )}

          {/* Creative Requirements */}
          {displayData.creativeRequirements && Array.isArray(displayData.creativeRequirements) && displayData.creativeRequirements.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3">Creative Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-800">
                {displayData.creativeRequirements.map((req: any, index: number) => (
                  <li key={index}>{req.requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </SummarySection>

        {/* Validation Messages */}
        <div className="mt-8">
          <div className="bg-green-50 border border-green-100 rounded-md p-5 flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800 text-lg">All required information has been provided</h3>
              <p className="text-green-700 mt-1">Your campaign is ready to be submitted. Review all details before final submission.</p>
            </div>
          </div>
        </div>

        {/* Add ProgressBar component at the bottom */}
        <div className="mt-12 mb-8">
          <ProgressBar
            currentStep={5}
            onStepClick={(step) => navigateToStep(step)}
            onBack={() => navigateToStep(4)}
            onNext={handleSubmit}
            onSaveDraft={handleSaveDraft}
            disableNext={validationMessages.length > 0}
            isFormValid={validationMessages.length === 0}
            isDirty={false}
            isSaving={isSaving || isSubmitting}
            />
          </div>
      </div>
    </div>
  );
}

export default function Step5() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Step5Content />
    </ErrorBoundary>
  );
}
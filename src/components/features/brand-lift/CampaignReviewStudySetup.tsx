'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Actual Shadcn UI imports (paths might vary based on project setup)
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { InfoCircledIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons"; // Example icons

interface CampaignDetails {
  id: string | number;
  campaignName: string;
  primaryObjective?: string; // From CampaignWizardSubmission or CampaignWizard
  audienceSummary?: string; // Could be constructed or from a specific field
  platforms?: string[]; // e.g., ["Instagram", "TikTok"]
  // Add other relevant campaign fields to display
  primaryObjectiveDetails?: string; // Potentially a more descriptive field for the objective
  audienceSummaryDetails?: string; // Potentially a more descriptive field for audience
}

interface BrandLiftStudySetupData {
  studyName: string;
  funnelStage: string; // e.g., "TOP_FUNNEL", "MID_FUNNEL", "BOTTOM_FUNNEL"
  primaryKpi: string; // e.g., "BRAND_AWARENESS"
  secondaryKpis?: string[];
}

interface CampaignReviewStudySetupProps {
  campaignId: string | number;
}

// --- Start of UI component placeholders ---
// These would be actual imports from Shadcn in a real scenario.
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 border-b border-gray-200">{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-gray-800">{children}</h2>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500 mt-1">{children}</p>
);
const CardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;
const CardFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
    {children}
  </div>
);

const Button = (props: any) => (
  <button
    {...props}
    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${props.variant === 'outline' ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' : props.disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}`}
  />
);
const Input = (props: any) => (
  <input
    {...props}
    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
);
const SelectPrimitive = ({ children, ...props }: any) => (
  <select
    {...props}
    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  >
    {children}
  </select>
);
const SelectItemPrimitive = (props: any) => <option {...props} />;
const LabelPrimitive = (props: any) => (
  <label {...props} className="block text-sm font-medium text-gray-700 mb-1" />
);
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className || 'h-6 w-full'}`}></div>
);
const Alert = ({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) => (
  <div
    className={`p-4 rounded-md ${variant === 'destructive' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50 border-blue-300 text-blue-700'} ${className || ''}`}
  >
    {children}
  </div>
);
const AlertTitle = ({ children }: any) => <h3 className="font-medium mb-1">{children}</h3>;
const AlertDescription = ({ children }: any) => <p className="text-sm">{children}</p>;

// Basic Tooltip placeholder
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const Tooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="relative inline-block">{children}</div>
);
const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
  asChild ? children : <span className="cursor-help">{children}</span>;
const TooltipContent = ({ children, side }: { children: React.ReactNode; side?: string }) => (
  <div className="absolute z-10 p-2 text-xs bg-gray-900 text-white rounded-md shadow-lg invisible group-hover:visible">
    {children}
  </div>
);
// --- End of UI component placeholders ---

export const CampaignReviewStudySetup: React.FC<CampaignReviewStudySetupProps> = ({
  campaignId,
}) => {
  const router = useRouter();
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);
  const [studySetupData, setStudySetupData] = useState<BrandLiftStudySetupData>({
    studyName: '',
    funnelStage: '',
    primaryKpi: '',
    secondaryKpis: [],
  });
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignId) {
      const fetchCampaignDetails = async () => {
        setIsLoadingCampaign(true);
        setError(null);
        try {
          const response = await fetch(`/api/campaigns/${campaignId}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `Failed to fetch campaign details: ${response.statusText} - ${errorData.error || 'Server error'}`
            );
          }
          const data = await response.json();
          // Assuming the API returns { success: true, data: campaignData } or just campaignData
          // Adjust based on actual API structure
          if ('data' in data && (data as any).success === true) {
            // Common wrapper pattern
            setCampaignDetails((data as any).data as CampaignDetails);
          } else if (Object.keys(data).length > 0 && !('success' in data)) {
            // Direct data object
            setCampaignDetails(data);
          } else {
            throw new Error('Campaign data not found in response or response format unexpected.');
          }
        } catch (err: any) {
          setError(err.message || 'Could not load campaign details.');
          setCampaignDetails(null); // Clear details on error
        }
        setIsLoadingCampaign(false);
      };
      fetchCampaignDetails();
    }
  }, [campaignId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudySetupData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecondaryKpiChange = (kpi: string) => {
    setStudySetupData(prev => {
      const currentKpis = prev.secondaryKpis || [];
      if (currentKpis.includes(kpi)) {
        return { ...prev, secondaryKpis: currentKpis.filter(item => item !== kpi) };
      } else {
        return { ...prev, secondaryKpis: [...currentKpis, kpi] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/brand-lift/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaignId.toString(), // Ensure campaignId is string for API
          name: studySetupData.studyName,
          funnelStage: studySetupData.funnelStage,
          primaryKpi: studySetupData.primaryKpi,
          secondaryKpis: studySetupData.secondaryKpis?.length
            ? studySetupData.secondaryKpis
            : undefined,
          // status: 'DRAFT' // API should set default status
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create study: ${response.statusText}`);
      }
      const newStudy = await response.json();
      router.push(`/brand-lift/survey-design/${newStudy.id}`);
    } catch (err: any) {
      setError(err.message || 'Could not create Brand Lift study.');
    }
    setIsSubmitting(false);
  };

  const FunnelStageOptions = [
    { value: 'TOP_FUNNEL', label: 'Top Funnel (e.g., Awareness, Recall)' },
    { value: 'MID_FUNNEL', label: 'Mid Funnel (e.g., Consideration, Perception)' },
    { value: 'BOTTOM_FUNNEL', label: 'Bottom Funnel (e.g., Purchase Intent, Action)' },
  ];
  const AllKpiOptions = [
    {
      value: 'BRAND_AWARENESS',
      label: 'Brand Awareness',
      description: 'Measures if respondents are aware of your brand.',
    },
    {
      value: 'AD_RECALL',
      label: 'Ad Recall',
      description: 'Measures if respondents remember seeing your ad.',
    },
    {
      value: 'MESSAGE_ASSOCIATION',
      label: 'Message Association',
      description: 'Measures if respondents associate key messages with your brand.',
    },
    {
      value: 'BRAND_PERCEPTION',
      label: 'Brand Perception',
      description: 'Measures how respondents perceive your brand on key attributes.',
    },
    {
      value: 'CONSIDERATION',
      label: 'Consideration',
      description: 'Measures if respondents would consider your brand for a future need.',
    },
    {
      value: 'PURCHASE_INTENT',
      label: 'Purchase Intent',
      description: 'Measures the likelihood of respondents purchasing your product/service.',
    },
    {
      value: 'BRAND_PREFERENCE',
      label: 'Brand Preference',
      description: 'Measures if respondents prefer your brand over competitors.',
    },
    {
      value: 'ACTION_INTENT',
      label: 'Action Intent',
      description: 'Measures likelihood to take a specific action (e.g., visit website).',
    },
    {
      value: 'RECOMMENDATION_INTENT',
      label: 'Recommendation Intent',
      description: 'Measures likelihood to recommend your brand.',
    },
  ];

  // Filter secondary KPIs to not include the selected primary KPI
  const availableSecondaryKpis = AllKpiOptions.filter(
    kpi => kpi.value !== studySetupData.primaryKpi
  );

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Review Campaign & Define Brand Lift Study</CardTitle>
        {campaignDetails && (
          <CardDescription>
            Setting up a new Brand Lift study for the campaign:{' '}
            <strong>{campaignDetails.campaignName}</strong> (ID: {campaignDetails.id})
          </CardDescription>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          {isLoadingCampaign ? (
            <div className="space-y-4 p-4 border rounded-md bg-gray-50">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error && !campaignDetails ? (
            <Alert variant="destructive">
              <AlertTitle>Error Loading Campaign</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : campaignDetails ? (
            <div className="p-4 border rounded-lg bg-slate-50 space-y-2">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Campaign Details Overview</h4>
              <p>
                <strong className="text-gray-600">Name:</strong> {campaignDetails.campaignName}
              </p>
              <p>
                <strong className="text-gray-600">Primary Objective:</strong>{' '}
                {campaignDetails.primaryObjective ||
                  campaignDetails.primaryObjectiveDetails ||
                  'N/A'}
              </p>
              <p>
                <strong className="text-gray-600">Audience Summary:</strong>{' '}
                {campaignDetails.audienceSummary || campaignDetails.audienceSummaryDetails || 'N/A'}
              </p>
              <p>
                <strong className="text-gray-600">Platforms:</strong>{' '}
                {campaignDetails.platforms?.join(', ') || 'N/A'}
              </p>
              {/* TODO: Add a "View Full Campaign Details" button/link if applicable, linking to existing campaign view page */}
              {/* <Button variant="outline" size="sm" className="mt-2">View Full Details</Button> */}
            </div>
          ) : null}

          <div className="space-y-6 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-700">New Brand Lift Study Details</h4>
            <div>
              <LabelPrimitive htmlFor="studyName">Study Name *</LabelPrimitive>
              <Input
                id="studyName"
                name="studyName"
                value={studySetupData.studyName}
                onChange={handleInputChange}
                placeholder="e.g., Q1 Awareness Study for Product X"
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Name this study so you can differentiate it later.
              </p>
            </div>

            <div>
              <LabelPrimitive htmlFor="funnelStage">
                Define Your Test Goals: Funnel Stage *
              </LabelPrimitive>
              <SelectPrimitive
                id="funnelStage"
                name="funnelStage"
                value={studySetupData.funnelStage}
                onChange={handleInputChange}
                required
                className="mt-1"
              >
                <SelectItemPrimitive value="" disabled>
                  Choose Funnel Stage...
                </SelectItemPrimitive>
                {FunnelStageOptions.map(stage => (
                  <SelectItemPrimitive key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItemPrimitive>
                ))}
              </SelectPrimitive>
            </div>

            <div>
              <LabelPrimitive htmlFor="primaryKpi">Primary KPI *</LabelPrimitive>
              <div className="flex items-center space-x-2 mt-1">
                <SelectPrimitive
                  id="primaryKpi"
                  name="primaryKpi"
                  value={studySetupData.primaryKpi}
                  onChange={handleInputChange}
                  required
                  className="flex-grow"
                >
                  <SelectItemPrimitive value="" disabled>
                    Select Primary KPI...
                  </SelectItemPrimitive>
                  {AllKpiOptions.map(kpi => (
                    <SelectItemPrimitive key={kpi.value} value={kpi.value}>
                      {kpi.label}
                    </SelectItemPrimitive>
                  ))}
                </SelectPrimitive>
                {studySetupData.primaryKpi && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="p-2 h-full aspect-square group"
                        >
                          {/* Replace with actual Radix or Lucide icon component */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                            />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>
                          {
                            AllKpiOptions.find(kpi => kpi.value === studySetupData.primaryKpi)
                              ?.description
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Measuring brand lift vs. a control group.
              </p>
              {/* TODO: Add "Suggested Improvement" banner if logic exists */}
            </div>

            <div>
              <LabelPrimitive>Add More KPIs? (Optional)</LabelPrimitive>
              {/* TODO: This could be an expandable section or link to a modal if list is very long */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2 p-3 border rounded-md bg-gray-50">
                {availableSecondaryKpis.map(kpi => (
                  <div key={kpi.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`kpi-${kpi.value}`}
                      name={kpi.value}
                      checked={studySetupData.secondaryKpis?.includes(kpi.value)}
                      onChange={() => handleSecondaryKpiChange(kpi.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                    />
                    <LabelPrimitive htmlFor={`kpi-${kpi.value}`} className="font-normal text-sm">
                      {kpi.label}
                      {/* Basic tooltip for secondary KPIs */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-1 text-gray-400 group-hover:text-gray-600 cursor-help">
                              {/* Replace with actual Radix or Lucide icon component */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="w-3 h-3 inline-block"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0-10.5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1ZM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{kpi.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </LabelPrimitive>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && !isLoadingCampaign && (
            <Alert variant="destructive" className="mt-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingCampaign ||
              !campaignDetails ||
              !studySetupData.studyName ||
              !studySetupData.funnelStage ||
              !studySetupData.primaryKpi
            }
          >
            {isSubmitting ? 'Continuing...' : 'Continue'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CampaignReviewStudySetup;

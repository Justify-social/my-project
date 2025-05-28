'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
  DraftCampaignData,
  SubmissionPayloadData as _SubmissionPayloadData,
  StatusEnum as _StatusEnum,
} from '@/components/features/campaigns/types';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { InfluencerCard } from '@/components/ui/card-influencer';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { AssetCard } from '@/components/ui/card-asset';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import { toast as _toast } from 'react-hot-toast';

// --- Utility Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatCurrency = (
  amount: number | null | undefined,
  currency: string | null | undefined
): string => {
  if (amount === null || amount === undefined || !currency) return 'N/A';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return String(amount); // Fallback
  }
};

// --- KPI & Feature Utilities (adapted from campaign profile page) ---
const kpiDisplayNames: Record<string, string> = {
  adRecall: 'Ad Recall',
  brandAwareness: 'Brand Awareness',
  consideration: 'Consideration',
  messageAssociation: 'Message Association',
  brandPreference: 'Brand Preference',
  purchaseIntent: 'Purchase Intent',
  actionIntent: 'Action Intent',
  recommendationIntent: 'Recommendation Intent',
  advocacy: 'Advocacy',
};

const kpiTooltips: Record<string, string> = {
  adRecall: 'Measures how well consumers remember seeing your ad after exposure',
  brandAwareness: 'Tracks the percentage of your target audience that recognizes your brand',
  consideration:
    'Measures if consumers would consider your product when making a purchase decision',
  messageAssociation: 'Tracks how strongly consumers associate your brand with specific messaging',
  brandPreference:
    'Measures if consumers prefer your brand over competitors for specific attributes',
  purchaseIntent: 'Tracks likelihood of consumers to purchase your product after campaign exposure',
  actionIntent: 'Measures likelihood of consumers taking a specific action (signing up, etc.)',
  recommendationIntent: 'Tracks if consumers would recommend your brand/product to others',
  advocacy: 'Measures how likely consumers are to actively advocate for your brand',
};

const formatKpiName = (kpiKey: string | null | undefined): string => {
  if (!kpiKey) return 'N/A';
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return (
    kpiDisplayNames[normalizedKey] ||
    kpiKey
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  );
};

const getKpiTooltipText = (kpiKey: string | null | undefined): string | undefined => {
  if (!kpiKey) return undefined;
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return kpiTooltips[normalizedKey];
};

const formatFeatureName = (featureKey: string | null | undefined): string => {
  if (!featureKey) return 'N/A';
  return featureKey
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

// --- KPI Icon Map (from kpis-icon-registry.json) ---
const kpiIconMap: Record<string, string> = {
  actionIntent: '/icons/kpis/kpisActionIntent.svg',
  adRecall: '/icons/kpis/kpisAdRecall.svg',
  advocacy: '/icons/kpis/kpisAdvocacy.svg',
  brandAwareness: '/icons/kpis/kpisBrandAwareness.svg',
  brandPreference: '/icons/kpis/kpisBrandPreference.svg',
  consideration: '/icons/kpis/kpisConsideration.svg',
  messageAssociation: '/icons/kpis/kpisMessageAssociation.svg',
  purchaseIntent: '/icons/kpis/kpisPurchaseIntent.svg',
  recommendationIntent: '/icons/kpis/kpisRecommendationIntent.svg',
};

// Helper to get KPI icon path (normalized key)
const getKpiIconPath = (kpiKey: string | null | undefined): string => {
  if (!kpiKey) return '';
  const normalizedKey = kpiKey.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  return kpiIconMap[normalizedKey] || '';
};

// Language mapping (from campaign profile page)
const TOP_LANGUAGES_MAP: Array<{ value: string; label: string }> = [
  { value: 'ar', label: 'Arabic' },
  { value: 'bn', label: 'Bengali' },
  { value: 'zh', label: 'Chinese (Mandarin)' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'es', label: 'Spanish' },
  { value: 'tr', label: 'Turkish' },
  { value: 'vi', label: 'Vietnamese' },
  // Add more or use a more comprehensive list/library if needed
];

const getLanguageName = (langCode: string | null | undefined): string => {
  if (!langCode) return 'N/A';
  const lang = TOP_LANGUAGES_MAP.find(l => l.value.toLowerCase() === langCode.toLowerCase());
  return lang ? lang.label : langCode.toUpperCase(); // Fallback to uppercase code
};

// Age brackets for audience display (from campaign profile page)
const AGE_BRACKETS = [
  { key: 'age18_24', label: '18-24' },
  { key: 'age25_34', label: '25-34' },
  { key: 'age35_44', label: '35-44' },
  { key: 'age45_54', label: '45-54' },
  { key: 'age55_64', label: '55-64' },
  { key: 'age65plus', label: '65+' },
] as const;

// --- Data Display Components ---

interface SummarySectionProps {
  title: string;
  stepNumber: number;
  onEdit: () => void;
  children: React.ReactNode;
  isComplete?: boolean;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  title,
  stepNumber,
  onEdit,
  children,
  isComplete,
}) => {
  return (
    <AccordionItem value={`step-${stepNumber}`} className="group border rounded-lg mb-2">
      <div
        className={cn(
          'flex justify-between items-center w-full p-4 cursor-pointer hover:bg-accent/10',
          isComplete ? 'bg-green-50/50' : 'bg-card'
        )}
        onClick={() => {
          // Toggle accordion state manually if needed, or rely on AccordionItem's internal state
        }}
      >
        <div className="flex flex-1 items-center text-left text-lg font-semibold text-primary p-0 mr-4">
          <div className="flex items-center">
            <Badge
              variant={isComplete ? 'default' : 'secondary'}
              className={cn('mr-3 h-6 w-6 justify-center', isComplete && 'bg-green-600 text-white')}
            >
              {stepNumber}
            </Badge>
            <span>{title}</span>
            {isComplete && (
              <Icon
                iconId="faCircleCheckSolid"
                className="ml-2 h-4 w-4 text-green-600 flex-shrink-0"
              />
            )}
          </div>
        </div>

        <div className="flex items-center flex-shrink-0">
          <IconButtonAction
            iconBaseName="faPenToSquare"
            hoverColorClass="text-accent"
            ariaLabel={`Edit ${title}`}
            className="mr-2"
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
          />
        </div>
      </div>
      <AccordionContent className="p-4 pt-0 border-t overflow-visible">
        <div className="pl-[calc(1rem_+_1.5rem_+_0.75rem)] mt-2">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Restore correct definition for DataItemProps
interface DataItemProps {
  label: string;
  value?: string | number | string[] | null;
  children?: React.ReactNode; // Allow passing complex children
  className?: string;
}

// Restore correct definition for DataItem component
const DataItem: React.FC<DataItemProps> = ({ label, value, children, className }) => {
  const displayValue = useMemo(() => {
    if (children) return children;
    if (value === null || value === undefined || value === '')
      return <span className="text-muted-foreground italic">Not provided</span>;
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic">None</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    return String(value);
  }, [value, children]);

  return (
    <div className={cn('mb-3', className)}>
      <p className="text-sm font-medium text-muted-foreground mb-0.5">{label}</p>
      <div className="text-sm text-foreground">{displayValue}</div>
    </div>
  );
};

// --- KpiBadge Component (adapted from campaign profile) ---
const KpiBadge = ({ kpi, isPrimary = false }: { kpi: string; isPrimary?: boolean }) => {
  const iconPath = getKpiIconPath(kpi);
  const displayName = formatKpiName(kpi); // Use existing formatter
  const tooltipText = getKpiTooltipText(kpi); // Use existing getter

  const badgeContent = (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border',
        isPrimary
          ? 'bg-accent/15 border-accent/30 px-4 py-3' // Style for primary KPI
          : 'bg-accent/10 border-accent/20 px-3 py-2' // Style for secondary KPIs
      )}
    >
      {iconPath && (
        <div className={cn('flex-shrink-0 relative', isPrimary ? 'h-5 w-5' : 'h-4 w-4')}>
          {' '}
          {/* Adjusted size slightly */}
          <Image
            src={iconPath}
            alt={displayName}
            fill
            className="object-contain"
            style={{
              filter:
                'invert(47%) sepia(98%) saturate(1776%) hue-rotate(179deg) brightness(104%) contrast(105%)', // Preserving the accent color filter
            }}
          />
        </div>
      )}
      <span
        className={cn('font-medium text-accent', isPrimary ? 'text-base font-semibold' : 'text-sm')}
      >
        {displayName}
      </span>
    </div>
  );

  if (!tooltipText) {
    return badgeContent; // Render badge without tooltip if no text
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
      <TooltipContent>
        <p className="whitespace-normal">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// --- Review Sub-Components ---

const Step1Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
    <DataItem label="Campaign Name" value={data.name} />
    <DataItem label="Business Goal" value={data.businessGoal} className="md:col-span-2" />
    <DataItem label="Campaign Duration">
      {data.startDate && data.endDate
        ? `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`
        : 'N/A'}
    </DataItem>
    <DataItem label="Timezone" value={data.timeZone} />
    <DataItem
      label="Total Budget"
      value={formatCurrency(data.budget?.total, data.budget?.currency)}
    />
    <DataItem
      label="Social Budget"
      value={formatCurrency(data.budget?.socialMedia, data.budget?.currency)}
    />
    <DataItem
      label="Primary Contact Name"
      value={
        `${data.primaryContact?.firstName || ''} ${data.primaryContact?.surname || ''}`.trim() ||
        'N/A'
      }
    />
    <DataItem label="Primary Contact Email" value={data.primaryContact?.email} />
    <DataItem label="Primary Contact Position" value={data.primaryContact?.position} />
    {data.secondaryContact && (
      <>
        <DataItem
          label="Secondary Contact Name"
          value={
            `${data.secondaryContact?.firstName || ''} ${data.secondaryContact?.surname || ''}`.trim() ||
            'N/A'
          }
        />
        <DataItem label="Secondary Contact Email" value={data.secondaryContact?.email} />
        <DataItem label="Secondary Contact Position" value={data.secondaryContact?.position} />
      </>
    )}
    <div className="md:col-span-2">
      <p className="text-sm font-medium text-muted-foreground mb-1">Influencers</p>
      {data.Influencer && data.Influencer.length > 0 ? (
        <div className="space-y-2">
          {data.Influencer.map((inf, idx) => (
            <InfluencerCard
              key={idx}
              platform={inf.platform}
              handle={inf.handle}
              className="bg-muted/30 max-w-sm"
            />
          ))}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground italic">None added</span>
      )}
    </div>
  </div>
);

const Step2Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
    <DataItem label="Primary KPI">
      {data.primaryKPI ? (
        <KpiBadge kpi={data.primaryKPI} isPrimary={true} />
      ) : (
        <span className="text-muted-foreground italic">Not provided</span>
      )}
    </DataItem>
    <DataItem label="Secondary KPIs">
      {data.secondaryKPIs && data.secondaryKPIs.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.secondaryKPIs.map((kpi, idx) => (
            <KpiBadge key={idx} kpi={kpi} isPrimary={false} />
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None</span>
      )}
    </DataItem>
    <DataItem label="Features">
      {data.features && data.features.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.features.map((feature, idx) => (
            <Badge key={idx} variant="outline" className="py-1 px-2 text-sm">
              {formatFeatureName(feature)}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None</span>
      )}
    </DataItem>
    <DataItem label="Main Message" value={data.messaging?.mainMessage} className="md:col-span-2" />
    <DataItem label="Hashtags">
      {data.messaging?.hashtags && data.messaging.hashtags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.messaging.hashtags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="py-1 px-2 text-sm flex items-center">
              {tag}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None</span>
      )}
    </DataItem>
    <DataItem label="Key Benefits" value={data.messaging?.keyBenefits} />
    <DataItem label="Memorability" value={data.expectedOutcomes?.memorability} />
    <DataItem label="Purchase Intent" value={data.expectedOutcomes?.purchaseIntent} />
    <DataItem label="Brand Perception" value={data.expectedOutcomes?.brandPerception} />
  </div>
);

const Step3Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => {
  // Calculate max age value for highlighting (similar to profile page)
  const ageValues = AGE_BRACKETS.map(bracket => data.demographics?.[bracket.key] ?? 0);
  const maxAgeValue = Math.max(...ageValues);
  const hasAgeData = ageValues.some(v => v > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <DataItem label="Genders" value={data.demographics?.genders} />
      <DataItem label="Languages">
        {data.demographics?.languages && data.demographics.languages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.demographics.languages.map((langCode, idx) => (
              <Badge key={idx} variant="secondary" className="py-1 px-2 text-sm">
                {getLanguageName(langCode)}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground italic">None</span>
        )}
      </DataItem>
      <div className="md:col-span-2 pt-2">
        <p className="text-sm font-medium text-muted-foreground mb-2">Age Ranges</p>
        {hasAgeData ? (
          <div className="flex flex-wrap gap-3">
            {AGE_BRACKETS.map(bracket => {
              const value = data.demographics?.[bracket.key];
              if (value === undefined || value === null || value === 0) return null; // Skip if 0 or undefined
              const isMax = value === maxAgeValue;
              const borderColorClass = isMax ? 'border-accent' : 'border-gray-300';

              return (
                <div
                  key={bracket.key}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border min-w-[70px] text-center',
                    borderColorClass,
                    isMax ? 'bg-accent/10' : 'bg-gray-50'
                  )}
                >
                  <span
                    className={cn(
                      'text-lg font-semibold block mb-0.5',
                      isMax ? 'text-accent' : 'text-foreground'
                    )}
                  >
                    {value}%
                  </span>
                  <span className="text-xs text-muted-foreground">{bracket.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Not specified</p>
        )}
      </div>
      <DataItem label="Interests" value={data.targeting?.interests} />
      <DataItem label="Keywords" value={data.targeting?.keywords} />
      <DataItem label="Locations" className="md:col-span-2">
        {data.locations && data.locations.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {data.locations.map((loc, idx) => (
              <Badge key={idx} variant="outline">
                {[loc.city, loc.region, loc.country].filter(Boolean).join(', ') ||
                  'Invalid Location'}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground italic">None specified</span>
        )}
      </DataItem>
      <DataItem label="Competitors" value={data.competitors} />
    </div>
  );
};

const Step4Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
  <div className="space-y-4">
    <DataItem label="Uploaded Assets">
      {data.assets && data.assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {data.assets.map((asset, idx) => {
            console.log(
              `[Step5Review] Processing asset for card:`,
              JSON.parse(JSON.stringify(asset))
            );
            console.log(
              `[Step5Review] Asset budget from wizardState.assets: ${asset.budget}, type: ${typeof asset.budget}`
            );
            console.log(
              `[Step5Review] wizardState.Influencer:`,
              JSON.parse(JSON.stringify(data.Influencer))
            );
            console.log(
              `[Step5Review] asset.associatedInfluencerIds:`,
              JSON.parse(JSON.stringify(asset.associatedInfluencerIds))
            );

            // Get associated influencer handles for this asset
            let associatedInfluencerHandles: string[] = [];
            if (
              Array.isArray(asset.associatedInfluencerIds) &&
              asset.associatedInfluencerIds.length > 0 &&
              Array.isArray(data.Influencer)
            ) {
              associatedInfluencerHandles = data.Influencer.filter(
                inf =>
                  inf &&
                  typeof inf.id === 'string' &&
                  (asset.associatedInfluencerIds as string[]).includes(inf.id)
              ).map(inf => inf.handle);
            }
            console.log(`[Step5Review] Matched influencer handles:`, associatedInfluencerHandles);

            // Map the asset data for AssetCard with all needed fields for video playback and display
            const assetCardData = {
              id: asset.id || idx,
              name: asset.name || asset.fileName || `Asset ${idx + 1}`,
              url: asset.url,
              type: asset.type,
              // Use description field if rationale is not available (since we store rationale in description)
              description: asset.rationale || asset.description || '',
              budget: typeof asset.budget === 'number' ? asset.budget : undefined, // More explicit handling
              muxPlaybackId: asset.muxPlaybackId,
              muxProcessingStatus: asset.muxProcessingStatus || 'READY',
              muxAssetId: asset.muxAssetId,
              fileName: asset.fileName,
              // Pass first associated influencer as handle (the card only shows one)
              influencerHandle:
                associatedInfluencerHandles.length > 0 ? associatedInfluencerHandles[0] : '',
              // Include missing fields
              rationale: asset.rationale || asset.description || '',
            };
            console.log(
              `[Step5Review] assetCardData being passed to AssetCard:`,
              JSON.parse(JSON.stringify(assetCardData))
            );

            return (
              <div key={assetCardData.id} className="flex flex-col h-full">
                <AssetCard
                  asset={assetCardData}
                  currency={data.budget?.currency ?? 'USD'}
                  cardClassName="h-full"
                  className="p-0"
                />

                {/* Add additional details below the card if not shown in the AssetCard */}
                {associatedInfluencerHandles.length > 1 && (
                  <div className="mt-2 p-3 border rounded-md bg-muted/10">
                    {/* Show all associated influencers if more than one */}
                    {associatedInfluencerHandles.length > 1 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Associated Influencers:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {associatedInfluencerHandles.map((handle: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {handle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None uploaded</span>
      )}
    </DataItem>
  </div>
);

// --- Final Confirmation Schema ---
const ConfirmationSchema = z.object({
  confirm: z.boolean().refine(val => val === true, {
    message: 'You must confirm the details before submitting.',
  }),
});
type ConfirmationFormData = z.infer<typeof ConfirmationSchema>;

// --- Main Step 5 Component ---
function Step5Content() {
  const router = useRouter();
  const wizard = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ConfirmationFormData>({
    resolver: zodResolver(ConfirmationSchema),
    defaultValues: { confirm: false },
  });

  // Submit Handler (Uses validated payload)
  const onSubmit: SubmitHandler<ConfirmationFormData> = async formData => {
    if (!formData.confirm) {
      showErrorToast('Please confirm the details before submitting.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    if (!wizard.campaignId) {
      showErrorToast('Campaign ID is missing. Cannot submit.');
      setIsSubmitting(false);
      return;
    }

    console.log('[Step 5] Attempting final campaign submission for ID:', wizard.campaignId);

    try {
      // const saveSuccess = await wizard.saveProgress(payload); // OLD LOGIC
      const response = await fetch(`/api/campaigns/${wizard.campaignId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The body for the submit endpoint might be empty if all data is read from the CampaignWizard on the backend
        // Or it might expect a minimal payload, e.g., just a confirmation.
        // For now, sending an empty body as the backend submit route should fetch the wizard data itself.
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const submissionData = await response.json(); // Contains the new CampaignWizardSubmission
        showSuccessToast('Campaign submitted successfully!');
        console.log(
          '[Step5Content] Actual submission to POST .../submit successful. Data:',
          submissionData
        );
        // Navigate to the campaign submission page using the ID from the submission data
        if (submissionData && submissionData.id) {
          // Redirect to the submission page using the original CampaignWizard's UUID (wizard.campaignId)
          // and the query parameter 'id' as expected by SubmissionContent.tsx
          if (wizard.campaignId) {
            router.push(`/campaigns/wizard/submission?id=${wizard.campaignId}`);
          } else {
            // Fallback if wizard.campaignId is somehow null (should not happen here)
            console.error(
              '[Step5Content] wizard.campaignId is null, cannot redirect to submission page correctly.'
            );
            router.push('/dashboard'); // Or a generic error page
          }
        } else {
          // Fallback or error handling if submissionData.id is not available
          console.error(
            '[Step5Content] Submission ID not found in response, redirecting to dashboard.'
          );
          router.push(`/dashboard?campaignSubmitted=${wizard.campaignId}`);
        }
        console.log('[Step5Content] Navigation after successful POST .../submit initiated.');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Failed to submit campaign.';
        showErrorToast(errorMessage);
        setSubmitError(errorMessage);
        console.error('[Step5Content] POST .../submit failed:', errorData);
      }
    } catch (err: unknown) {
      console.error('Submission Error (catch block):', err);
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setSubmitError(message);
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  const { wizardState, isLoading, stepsConfig } = wizard;

  if (isLoading && !wizardState && wizard.campaignId) return <WizardSkeleton step={5} />;
  if (!wizardState) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Campaign data not found.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const handleStepClick = (step: number) => {
    if (wizard.campaignId) router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
  };
  const handleBack = () => {
    if (wizard.campaignId) router.push(`/campaigns/wizard/step-4?id=${wizard.campaignId}`);
  };
  const handleNext = form.handleSubmit(onSubmit);

  return (
    <div className="space-y-8">
      <ProgressBarWizard
        currentStep={5}
        steps={stepsConfig}
        onStepClick={handleStepClick}
        onBack={handleBack}
        onNext={handleNext}
        isNextDisabled={!form.formState.isValid || isSubmitting}
        isNextLoading={isSubmitting}
        submitButtonText="Submit Campaign"
        getCurrentFormData={() => null}
      />

      <h1 className="text-2xl font-semibold">Review Campaign Details</h1>

      <TooltipProvider>
        <Accordion
          type="multiple"
          defaultValue={['step-1', 'step-2', 'step-3', 'step-4']}
          className="w-full space-y-2"
        >
          <SummarySection
            title="Basic Information & Contacts"
            stepNumber={1}
            onEdit={() => handleStepClick(1)}
            isComplete={wizardState.step1Complete}
          >
            <Step1Review data={wizardState} />
          </SummarySection>
          <SummarySection
            title="Expected Outcomes & Messaging"
            stepNumber={2}
            onEdit={() => handleStepClick(2)}
            isComplete={wizardState.step2Complete}
          >
            <Step2Review data={wizardState} />
          </SummarySection>
          <SummarySection
            title="Audience Targeting"
            stepNumber={3}
            onEdit={() => handleStepClick(3)}
            isComplete={wizardState.step3Complete}
          >
            <Step3Review data={wizardState} />
          </SummarySection>
          <SummarySection
            title="Assets & Guidelines"
            stepNumber={4}
            onEdit={() => handleStepClick(4)}
            isComplete={wizardState.step4Complete}
          >
            <Step4Review data={wizardState} />
          </SummarySection>
        </Accordion>
      </TooltipProvider>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Confirmation</CardTitle>
          <CardDescription>
            Please review all campaign details carefully before submitting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id={field.name}
                      />
                    </FormControl>
                    <label
                      htmlFor={field.name}
                      className="space-y-1 leading-none cursor-pointer flex-grow"
                    >
                      <FormLabel>Confirm Campaign Details</FormLabel>
                      <FormDescription>
                        I have reviewed all the campaign information and confirm it is accurate.
                      </FormDescription>
                      <FormMessage />
                    </label>
                  </FormItem>
                )}
              />
              {submitError && (
                <p className="mt-4 text-sm font-medium text-destructive">
                  <Icon iconId="faExclamationTriangleLight" className="inline h-4 w-4 mr-1" />{' '}
                  {submitError}
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Step5Content;

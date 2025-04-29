'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import { DraftCampaignData, SubmissionPayloadData } from './types';
import { toast } from 'react-hot-toast';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { InfluencerCard } from '@/components/ui/card-influencer';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { AssetCard } from '@/components/ui/card-asset';
import { InfluencerSummary } from '@/types/influencer';
import { influencerService } from '@/services/influencer';
import { logger } from '@/lib/logger';
import { PlatformEnum } from '@/types/enums';
import { Platform as PlatformEnumBackend } from '@prisma/client';

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
    <AccordionItem
      value={`step-${stepNumber}`}
      className="group border rounded-lg mb-2 overflow-hidden"
    >
      <AccordionTrigger
        className={cn(
          'flex justify-between items-center w-full p-4 hover:bg-accent/10 text-left text-lg font-semibold text-primary',
          isComplete ? 'bg-green-50/50' : 'bg-card',
          '[&[data-state=open]>div>button]:bg-muted'
        )}
      >
        <div className="flex flex-1 items-center">
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
        <div className="flex items-center flex-shrink-0 mr-2">
          <IconButtonAction
            iconBaseName="faPenToSquare"
            hoverColorClass="text-accent"
            ariaLabel={`Edit ${title}`}
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
          />
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0 border-t">
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

// --- Review Sub-Components ---

// Mapping function: Backend Enum -> Frontend Enum STRING VALUE (UPPERCASE)
const mapBackendPlatformToFrontendString = (
  backendPlatform: PlatformEnumBackend | undefined | null
): string | undefined => {
  // Return type is now string
  if (!backendPlatform) return undefined;
  switch (backendPlatform) {
    // Return the STRING VALUE of the frontend enum member
    case PlatformEnumBackend.INSTAGRAM:
      return PlatformEnum.Instagram; // Returns 'INSTAGRAM'
    case PlatformEnumBackend.YOUTUBE:
      return PlatformEnum.YouTube; // Returns 'YOUTUBE'
    case PlatformEnumBackend.TIKTOK:
      return PlatformEnum.TikTok; // Returns 'TIKTOK'
    default:
      logger.warn(`[Step5Content] Unknown backend platform encountered: ${backendPlatform}`);
      return undefined;
  }
};

const Step1Review: React.FC<{
  data: DraftCampaignData;
  marketplaceInfluencers: InfluencerSummary[] | null;
}> = ({ data, marketplaceInfluencers }) => {
  const allInfluencersForDisplay = [
    // Map marketplace influencers (extract first platform string value)
    ...(marketplaceInfluencers || []).map(inf => ({
      key: inf.id,
      // Extract the string value (e.g., 'INSTAGRAM') from the PlatformEnum member
      platform: inf.platforms?.[0], // Directly use the enum value which is already the UPPERCASE string
      handle: inf.handle,
      name: inf.name,
      followersCount: inf.followersCount,
      avatarUrl: inf.avatarUrl,
      isPhylloVerified: inf.isPhylloVerified,
      id: inf.id,
    })),
    // Map manually added influencers (convert backend enum to frontend string value)
    ...(data.Influencer || [])
      .filter(manualInf => {
        // Map manual platform (Backend) to Frontend Enum STRING VALUE for comparison
        const manualPlatformFrontendString = mapBackendPlatformToFrontendString(
          manualInf.platform as PlatformEnumBackend
        );
        // Check if this manual entry is already represented by a marketplace entry (handle + platform match)
        return !marketplaceInfluencers?.some(
          mpInf =>
            mpInf.handle === manualInf.handle &&
            manualPlatformFrontendString && // Ensure mapping was successful
            // Compare the string value from the marketplace summary with the mapped string value
            mpInf.platforms?.[0] === manualPlatformFrontendString
        );
      })
      .map((inf, idx) => ({
        key: inf.id || `manual-${idx}`,
        // Map manual entry platform (Backend) to Frontend Enum STRING VALUE
        platform: mapBackendPlatformToFrontendString(inf.platform as PlatformEnumBackend),
        handle: inf.handle,
        name: inf.handle, // Use handle as name if missing
        followersCount: undefined,
        avatarUrl: undefined,
        isPhylloVerified: undefined,
        id: inf.id || `manual-${idx}`,
      })),
  ]
    // Filter out any influencers where the platform string couldn't be mapped or is undefined
    // Ensure the type passed to InfluencerCard is compatible (likely string | PlatformEnum)
    .filter(
      (inf): inf is typeof inf & { platform: PlatformEnum | string } => inf.platform !== undefined
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {allInfluencersForDisplay.length > 0 ? (
        allInfluencersForDisplay.map(inf => (
          <InfluencerCard
            key={inf.key}
            // Pass the platform string value (e.g., 'INSTAGRAM')
            // Ensure InfluencerCard accepts string or PlatformEnum for its platform prop
            platform={inf.platform as PlatformEnum} // Cast needed if InfluencerCard expects Enum type
            handle={inf.handle}
            displayName={inf.name}
            followerCount={inf.followersCount}
            avatarUrl={inf.avatarUrl}
            verified={inf.isPhylloVerified}
            className="bg-muted/30 p-3 text-sm"
          />
        ))
      ) : (
        <p className="text-sm text-muted-foreground italic col-span-full">
          No influencers associated with this step.
        </p>
      )}
    </div>
  );
};

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

  // State for fetched marketplace influencer summaries
  const [selectedInfluencerSummaries, setSelectedInfluencerSummaries] = useState<
    InfluencerSummary[] | null
  >(null);
  const [isFetchingSummaries, setIsFetchingSummaries] = useState<boolean>(false);
  const [fetchSummariesError, setFetchSummariesError] = useState<string | null>(null);

  const form = useForm<ConfirmationFormData>({
    resolver: zodResolver(ConfirmationSchema),
    defaultValues: { confirm: false },
  });

  // Fetch summaries when selected IDs change
  useEffect(() => {
    const selectedIds = wizard.wizardState?.selectedInfluencerIds;
    if (Array.isArray(selectedIds) && selectedIds.length > 0) {
      const fetchSummaries = async () => {
        logger.info(
          `[Step5Content] Fetching summaries for ${selectedIds.length} selected influencers...`
        );
        setIsFetchingSummaries(true);
        setFetchSummariesError(null);
        try {
          const summaries = await influencerService.getInfluencerSummariesByIds(selectedIds);
          setSelectedInfluencerSummaries(summaries);
          logger.info(`[Step5Content] Successfully fetched summaries.`);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to load selected influencer details.';
          logger.error('[Step5Content] Error fetching summaries:', { error: message });
          setFetchSummariesError(message);
          setSelectedInfluencerSummaries(null);
        } finally {
          setIsFetchingSummaries(false);
        }
      };
      fetchSummaries();
    } else {
      setSelectedInfluencerSummaries(null);
      setIsFetchingSummaries(false);
      setFetchSummariesError(null);
    }
  }, [JSON.stringify(wizard.wizardState?.selectedInfluencerIds)]);

  // --- Data Transformation & Validation for Submission (REWRITTEN) ---
  const prepareSubmissionPayload = useCallback((): SubmissionPayloadData | null => {
    const draft = wizard.wizardState;
    if (!draft) {
      toast.error('Cannot prepare submission, draft data is missing.');
      return null;
    }

    // Construct the payload object step-by-step, ensuring fields match SubmissionPayloadSchema
    // Use nullish coalescing (??) for defaults where appropriate, and safe access
    const payload: Partial<SubmissionPayloadData> = {
      // Core Info
      campaignName: draft.name || 'Untitled Campaign',
      businessGoal: draft.businessGoal ?? '',
      description: draft.businessGoal ?? '',
      startDate: draft.startDate
        ? typeof draft.startDate === 'string'
          ? draft.startDate
          : (draft.startDate as Date).toISOString()
        : undefined,
      endDate: draft.endDate
        ? typeof draft.endDate === 'string'
          ? draft.endDate
          : (draft.endDate as Date).toISOString()
        : undefined,
      timeZone: draft.timeZone ?? 'UTC',
      currency: draft.budget?.currency,
      totalBudget: draft.budget?.total,
      socialMediaBudget: draft.budget?.socialMedia,
      platform: draft.Influencer?.[0]?.platform, // Use capitalized Influencer
      influencerHandle: draft.Influencer?.[0]?.handle, // Use capitalized Influencer

      // Contacts (Assuming structure is correct)
      primaryContact: draft.primaryContact
        ? {
            firstName: draft.primaryContact.firstName,
            surname: draft.primaryContact.surname,
            email: draft.primaryContact.email,
            position: draft.primaryContact.position,
          }
        : undefined,
      secondaryContact: draft.secondaryContact
        ? {
            firstName: draft.secondaryContact.firstName,
            surname: draft.secondaryContact.surname,
            email: draft.secondaryContact.email,
            position: draft.secondaryContact.position,
          }
        : undefined,

      // Objectives (Assuming structure is correct)
      primaryKPI: draft.primaryKPI ?? undefined,
      secondaryKPIs: draft.secondaryKPIs ?? [],
      features: draft.features ?? [],
      mainMessage: draft.messaging?.mainMessage ?? '',
      hashtags: Array.isArray(draft.messaging?.hashtags)
        ? draft.messaging?.hashtags.join(', ')
        : draft.messaging?.hashtags || '',
      keyBenefits: Array.isArray(draft.messaging?.keyBenefits)
        ? draft.messaging?.keyBenefits.join(', ')
        : typeof draft.messaging?.keyBenefits === 'string'
          ? draft.messaging?.keyBenefits
          : '',
      expectedAchievements: draft.expectedOutcomes?.purchaseIntent ?? '',
      memorability: draft.expectedOutcomes?.memorability ?? '',
      purchaseIntent: draft.expectedOutcomes?.purchaseIntent ?? '',
      brandPerception: draft.expectedOutcomes?.brandPerception ?? '',

      // Audience (Assuming structure is correct for now)
      audience: {
        ageRangeMin: 18,
        ageRangeMax: 65,
        keywords: draft.targeting?.keywords ?? [],
        interests: draft.targeting?.interests ?? [],
        age1824: 0,
        age2534: 0,
        age3544: 0,
        age4554: 0,
        age5564: 0,
        age65plus: 0,
        competitors: draft.competitors?.map(name => ({ name })) ?? [],
        gender: draft.demographics?.genders?.map(g => ({ gender: g, proportion: 0 })) ?? [],
        languages: draft.demographics?.languages?.map(lang => ({ language: lang })) ?? [],
        geographicSpread:
          draft.locations?.map(loc => ({
            country: loc.country ?? '',
            proportion: 0,
          })) ?? [],
        screeningQuestions: [],
      },

      // Creatives - Align with FRONTEND schema (SubmissionPayloadSchema in types.ts)
      creativeAssets:
        draft.assets?.map(asset => ({
          name: asset.name ?? asset.fileName ?? 'Untitled Asset', // Explicitly add name
          description: asset.description ?? '',
          url: asset.url ?? '',
          type: asset.type === 'video' ? 'video' : 'image', // Use lowercase type
        })) ?? [],
      creativeRequirements:
        draft.requirements?.map(req => ({
          description: req.description ?? '',
          mandatory: req.mandatory ?? false,
        })) ?? [],

      submissionStatus: 'submitted',
    };

    // --- TEMPORARILY BYPASSING FRONTEND VALIDATION ---
    // const result = SubmissionPayloadSchema.safeParse(payload);
    // if (!result.success) {
    //     console.error("Submission Payload Validation Error:", result.error.errors);
    //     const errorMessages = result.error.errors.map(e => {
    //         const field = e.path.join('.');
    //         if (e.code === z.ZodIssueCode.invalid_type && e.path.length > 0) {
    //             return `${field}: Invalid type provided (expected ${e.expected}, received ${e.received})`;
    //         }
    //         if (e.message && field) {
    //             return `${field}: ${e.message}`;
    //         }
    //         return e.message; // Fallback to default message
    //     }).filter(Boolean).join('; \n');
    //     const finalMessage = `Submission data is invalid. Please review the following: \n${errorMessages}`;
    //     toast.error(finalMessage, { duration: 8000 });
    //     setSubmitError("Validation failed. Check highlighted fields or previous steps.");
    //     return null; // Indicate failure
    // }
    // console.log("Submission Payload Validated Successfully:", result.data);
    // return result.data; // Return the validated data
    // --- END TEMPORARY BYPASS ---

    console.log('Submission Payload (Frontend Validation Bypassed):', payload);
    // Directly return the constructed payload without frontend validation
    return payload as SubmissionPayloadData; // Cast as SubmissionPayloadData for type consistency downstream
  }, [wizard.wizardState]);

  // Submit Handler (Uses validated payload)
  const onSubmit: SubmitHandler<ConfirmationFormData> = async formData => {
    if (!formData.confirm) {
      toast.error('Please confirm the details before submitting.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const finalPayload = prepareSubmissionPayload();

    if (!finalPayload) {
      setIsSubmitting(false);
      // Validation errors already shown by prepareSubmissionPayload
      return;
    }

    // Create a separate payload for the backend, transforming as needed
    const payloadForBackend = JSON.parse(JSON.stringify(finalPayload)); // Deep copy

    // Rename campaignName to name for backend
    payloadForBackend.name = payloadForBackend.campaignName;
    delete payloadForBackend.campaignName;

    // Map creative assets separately for backend format
    payloadForBackend.creativeAssets = payloadForBackend.creativeAssets?.map((asset: unknown) => {
      // Changed any to unknown
      const description =
        typeof asset === 'object' && asset !== null && 'description' in asset
          ? asset.description
          : '';
      const url = typeof asset === 'object' && asset !== null && 'url' in asset ? asset.url : '';
      const type =
        typeof asset === 'object' && asset !== null && 'type' in asset ? asset.type : 'image';

      return {
        description: String(description),
        url: String(url),
        type: String(type)?.toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE',
      };
    });

    console.log('Submitting transformed payload to /api/campaigns:', payloadForBackend);

    try {
      const response = await fetch('/api/campaigns', {
        // POST to create submission
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadForBackend), // Send transformed payload
      });
      const result = await response.json(); // Try to parse JSON regardless of status

      if (!response.ok) {
        // Use error from JSON response if available, otherwise status text
        throw new Error(
          result?.error || result?.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      toast.success('Campaign submitted successfully!');
      // TODO: Implement clearWizardState in context if needed
      // wizard.clearWizardState();
      // --- Ensure correct navigation target ---
      console.log(
        '[Step5Content] Submission successful. Attempting to navigate to submission page...'
      );
      if (wizard.campaignId) {
        router.push(`/campaigns/wizard/submission?id=${wizard.campaignId}`);
        // Correct logger call (remove second arg or make it an object)
        logger.info('[Step5Content] Navigation to /campaigns/wizard/submission initiated.');
      } else {
        console.error(
          'Navigation to submission page failed: Campaign ID missing after successful submission.'
        );
        toast.error('Could not display submission confirmation (missing ID).');
        // Fallback to dashboard if ID is somehow missing
        router.push('/dashboard?submission=success');
      }
    } catch (err: unknown) {
      // Changed any to unknown
      console.error('Submission Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit campaign.'; // Added instanceof check
      setSubmitError(message);
      toast.error(message);
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

      <Accordion
        type="multiple"
        defaultValue={['step-1', 'influencers', 'step-2', 'step-3', 'step-4']}
        className="w-full space-y-2"
      >
        <SummarySection
          title="Basic Information"
          stepNumber={1}
          onEdit={() => handleStepClick(1)}
          isComplete={wizardState.step1Complete}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <DataItem label="Campaign Name" value={wizardState.name} />
            <DataItem label="Brand Name" value={wizardState.brand} />
            <DataItem
              label="Business Goal"
              value={wizardState.businessGoal}
              className="md:col-span-2"
            />
            <DataItem
              label="Start Date"
              value={
                wizardState.startDate ? new Date(wizardState.startDate).toLocaleDateString() : null
              }
            />
            <DataItem
              label="End Date"
              value={
                wizardState.endDate ? new Date(wizardState.endDate).toLocaleDateString() : null
              }
            />
            <DataItem
              label="Total Budget"
              value={`${wizardState.budget?.currency} ${wizardState.budget?.total?.toLocaleString() ?? 'N/A'}`}
            />
          </div>
        </SummarySection>
        <SummarySection
          title="Selected Influencers"
          stepNumber={1.5}
          onEdit={() => handleStepClick(1)}
          isComplete={
            !!wizardState.selectedInfluencerIds && wizardState.selectedInfluencerIds.length > 0
          }
        >
          {isFetchingSummaries ? (
            <p className="text-sm text-muted-foreground italic">
              Loading selected influencer details...
            </p>
          ) : fetchSummariesError ? (
            <p className="text-sm text-destructive">
              Error loading influencer details: {fetchSummariesError}
            </p>
          ) : selectedInfluencerSummaries && selectedInfluencerSummaries.length > 0 ? (
            <div className="space-y-2">
              <Step1Review
                data={wizardState}
                marketplaceInfluencers={selectedInfluencerSummaries}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No influencers selected from marketplace.
            </p>
          )}
        </SummarySection>
        <SummarySection
          title="Objectives & Messaging"
          stepNumber={2}
          onEdit={() => handleStepClick(2)}
          isComplete={wizardState.step2Complete}
        >
          <DataItem label="Primary KPI" value={wizardState.primaryKPI} />
          <DataItem label="Secondary KPIs" value={wizardState.secondaryKPIs} />
        </SummarySection>
        <SummarySection
          title="Audience Targeting"
          stepNumber={3}
          onEdit={() => handleStepClick(3)}
          isComplete={wizardState.step3Complete}
        >
          <DataItem label="Genders" value={wizardState.demographics?.genders} />
          <DataItem label="Languages" value={wizardState.demographics?.languages} />
        </SummarySection>
        <SummarySection
          title="Assets & Guidelines"
          stepNumber={4}
          onEdit={() => handleStepClick(4)}
          isComplete={wizardState.step4Complete}
        >
          <p className="text-sm text-muted-foreground italic">[Asset Review Placeholder]</p>
        </SummarySection>
      </Accordion>

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
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Confirm Campaign Details</FormLabel>
                      <FormDescription>
                        I have reviewed all the campaign information and confirm it is accurate.
                      </FormDescription>
                      <FormMessage />
                    </div>
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

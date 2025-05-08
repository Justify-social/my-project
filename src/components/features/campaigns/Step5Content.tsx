'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
  DraftCampaignData,
  SubmissionPayloadData,
  StatusEnum,
} from '@/components/features/campaigns/types';
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
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { InfluencerCard } from '@/components/ui/card-influencer';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { AssetCard } from '@/components/ui/card-asset';

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

const Step1Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
    <DataItem label="Campaign Name" value={data.name} />
    <DataItem label="Business Goal" value={data.businessGoal} className="md:col-span-2" />
    <DataItem
      label="Start Date"
      value={data.startDate ? new Date(data.startDate).toLocaleDateString() : null}
    />
    <DataItem
      label="End Date"
      value={data.endDate ? new Date(data.endDate).toLocaleDateString() : null}
    />
    <DataItem label="Timezone" value={data.timeZone} />
    <DataItem label="Currency" value={data.budget?.currency} />
    <DataItem label="Total Budget" value={data.budget?.total?.toLocaleString()} />
    <DataItem label="Social Media Budget" value={data.budget?.socialMedia?.toLocaleString()} />
    <DataItem
      label="Primary Contact Name"
      value={`${data.primaryContact?.firstName} ${data.primaryContact?.surname}`}
    />
    <DataItem label="Primary Contact Email" value={data.primaryContact?.email} />
    <DataItem label="Primary Contact Position" value={data.primaryContact?.position} />
    {data.secondaryContact && (
      <>
        <DataItem
          label="Secondary Contact Name"
          value={`${data.secondaryContact?.firstName} ${data.secondaryContact?.surname}`}
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
              className="bg-muted/30"
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
    <DataItem label="Primary KPI" value={data.primaryKPI} />
    <DataItem label="Secondary KPIs" value={data.secondaryKPIs?.join(', ')} />
    <DataItem label="Features" value={data.features?.join(', ')} />
    <DataItem label="Main Message" value={data.messaging?.mainMessage} className="md:col-span-2" />
    <DataItem label="Hashtags" value={data.messaging?.hashtags} />
    <DataItem label="Key Benefits" value={data.messaging?.keyBenefits} />
    <DataItem label="Memorability Hypothesis" value={data.expectedOutcomes?.memorability} />
    <DataItem label="Purchase Intent Hypothesis" value={data.expectedOutcomes?.purchaseIntent} />
    <DataItem label="Brand Perception Hypothesis" value={data.expectedOutcomes?.brandPerception} />
  </div>
);

const Step3Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
    {/* <DataItem label="Age Range" value={data.demographics?.ageRange?.join(' - ')} /> */}
    <DataItem label="Genders" value={data.demographics?.genders} />
    <DataItem label="Languages" value={data.demographics?.languages} />
    <DataItem label="Interests" value={data.targeting?.interests} />
    <DataItem label="Keywords" value={data.targeting?.keywords} />
    <DataItem label="Locations" className="md:col-span-2">
      {data.locations && data.locations.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {data.locations.map((loc, idx) => (
            <Badge key={idx} variant="outline">
              {[loc.city, loc.region, loc.country].filter(Boolean).join(', ') || 'Invalid Location'}
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

const Step4Review: React.FC<{ data: DraftCampaignData }> = ({ data }) => (
  <div className="space-y-4">
    {/* Remove deprecated fields */}
    {/* <DataItem label="Brand Guidelines Summary" value={data.guidelines} /> */}
    {/* <DataItem label="Mandatory Requirements">
            {data.requirements && data.requirements.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                    {data.requirements.map((req, idx) => (
                        <li key={idx}>{req.description} {req.mandatory ? "(Mandatory)" : "(Optional)"}</li>
                    ))}
                </ul>
            ) : <span className="text-muted-foreground italic">None</span>}
        </DataItem> */}
    <DataItem label="Uploaded Assets">
      {data.assets && data.assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {data.assets.map((asset, idx) => {
            // Map the asset data for AssetCard
            const assetCardData = {
              id: asset.id || idx, // Use asset ID or index as key
              name: asset.name || asset.fileName || `Asset ${idx + 1}`,
              url: asset.url,
              type: asset.type,
              description: asset.rationale, // Map rationale to description for display
              budget: asset.budget,
              // associatedInfluencerIds are not directly displayed by AssetCard
              // but could be added if AssetCard is extended
            };
            return (
              <AssetCard
                key={assetCardData.id}
                asset={assetCardData}
                currency={data.budget?.currency ?? 'USD'}
                cardClassName="h-full" // Ensure cards fill height in grid
                className="p-0" // Adjust padding if needed
              />
            );
          })}
        </div>
      ) : (
        <span className="text-muted-foreground italic">None uploaded</span>
      )}
    </DataItem>
    {/* <DataItem label="Additional Notes" value={data.notes} /> */}
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
      toast.error('Please confirm the details before submitting.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    // --- REVISED LOGIC ---
    // Instead of preparing a full submission payload for POST,
    // we prepare a smaller payload for PATCH via saveProgress.
    const payload: Partial<DraftCampaignData> = {
      currentStep: 5,
      status: StatusEnum.Values.REVIEW, // Set desired final status to REVIEW
      isComplete: true, // Mark the campaign as complete
      submittedAt: new Date(),
      // We don't need to resend all previous step data,
      // the PATCH endpoint for step 5 should only handle status/completion update.
    };

    console.log('[Step 5] Payload prepared for final submission (PATCH):', payload);

    try {
      const saveSuccess = await wizard.saveProgress(payload); // Use saveProgress for PATCH

      if (saveSuccess) {
        toast.success('Campaign submitted successfully!');
        console.log(
          '[Step5Content] Submission save successful. Attempting to navigate to submission page...'
        );
        if (wizard.campaignId) {
          // Navigate to a confirmation/summary page (adjust URL if needed)
          router.push(`/campaigns/wizard/submission?id=${wizard.campaignId}`);
          console.log('[Step5Content] Navigation to /campaigns/wizard/submission initiated.');
        } else {
          console.error(
            'Navigation to submission page failed: Campaign ID missing after successful submission.'
          );
          toast.error('Could not display submission confirmation (missing ID).');
          router.push('/dashboard?submission=success'); // Fallback
        }
      } else {
        // saveProgress already shows specific errors via toast
        setSubmitError('Failed to submit campaign. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Submission Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit campaign.';
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
          title="Objectives & Messaging"
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

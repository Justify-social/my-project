'use client';

import React, { useEffect, useState, useMemo as _useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller as _Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import { toast as _toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button as _Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';
import {
  Step2ValidationSchema,
  Step2FormData,
  DraftCampaignData,
  KPIEnum as _KPIEnum,
  FeatureEnum as _FeatureEnum,
} from '@/components/features/campaigns/types';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { RemovableBadge } from '@/components/ui/removable-badge';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import { KPI as PrismaKPI, Feature as PrismaFeature } from '@prisma/client';
import {
  Select as _Select,
  SelectContent as _SelectContent,
  SelectItem as _SelectItem,
  SelectTrigger as _SelectTrigger,
  SelectValue as _SelectValue,
} from '@/components/ui/select';

// --- Constants for Display ---
const kpis = [
  {
    key: PrismaKPI.AD_RECALL,
    title: 'Ad Recall',
    iconId: 'kpisAdRecall',
    description: 'The percentage of people who remember seeing your advertisement.',
    example: "After a week, 60% of viewers can recall your ad's main message.",
  },
  {
    key: PrismaKPI.BRAND_AWARENESS,
    title: 'Brand Awareness',
    iconId: 'kpisBrandAwareness',
    description: 'The increase in recognition of your brand.',
    example: 'Your brand name is recognised by 30% more people after the campaign.',
  },
  {
    key: PrismaKPI.CONSIDERATION,
    title: 'Consideration',
    iconId: 'kpisConsideration',
    description: 'The percentage of people considering purchasing from your brand.',
    example: '25% of your audience considers buying your product after seeing your campaign.',
  },
  {
    key: PrismaKPI.MESSAGE_ASSOCIATION,
    title: 'Message Association',
    iconId: 'kpisMessageAssociation',
    description: 'How well people link your key messages to your brand.',
    example: 'When hearing your slogan, 70% of people associate it directly with your brand.',
  },
  {
    key: PrismaKPI.BRAND_PREFERENCE,
    title: 'Brand Preference',
    iconId: 'kpisBrandPreference',
    description: "Preference for your brand over competitors'.",
    example: '40% of customers prefer your brand when choosing between similar products.',
  },
  {
    key: PrismaKPI.PURCHASE_INTENT,
    title: 'Purchase Intent',
    iconId: 'kpisPurchaseIntent',
    description: 'Likelihood of purchasing your product or service.',
    example: '50% of viewers intend to buy your product after seeing the ad.',
  },
  {
    key: PrismaKPI.ACTION_INTENT,
    title: 'Action Intent',
    iconId: 'kpisActionIntent',
    description:
      'Likelihood of taking a specific action related to your brand (e.g., visiting your website).',
    example: '35% of people are motivated to visit your website after the campaign.',
  },
  {
    key: PrismaKPI.RECOMMENDATION_INTENT,
    title: 'Recommendation Intent',
    iconId: 'kpisRecommendationIntent',
    description: 'Likelihood of recommending your brand to others.',
    example: '45% of customers are willing to recommend your brand to friends and family.',
  },
  {
    key: PrismaKPI.ADVOCACY,
    title: 'Advocacy',
    iconId: 'kpisAdvocacy',
    description: 'Willingness to actively promote your brand.',
    example:
      '20% of your customers regularly share your brand on social media or write positive reviews.',
  },
];

const features = [
  {
    key: PrismaFeature.CREATIVE_ASSET_TESTING,
    title: 'Creative Asset Testing',
    icon: '/icons/app/appCreativeAssetTesting.svg',
    disabled: true,
    description:
      'A/B test different versions of campaign creative assets (images, videos) to compare performance and audience reactions.',
  },
  {
    key: PrismaFeature.BRAND_LIFT,
    title: 'Brand Lift',
    icon: '/icons/app/appBrandLift.svg',
    disabled: false,
    description:
      'Measure the direct impact of your marketing campaign on key brand metrics such as awareness, consideration, and purchase intent through surveys.',
  },
  {
    key: PrismaFeature.BRAND_HEALTH,
    title: 'Brand Health',
    icon: '/icons/app/appBrandHealth.svg',
    disabled: true,
    description:
      'Track metrics like audience sentiment, competitive share of voice, and brand loyalty indicators over time.',
  },
  {
    key: PrismaFeature.MIXED_MEDIA_MODELING,
    title: 'Mixed Media Modelling',
    icon: '/icons/app/appMmm.svg',
    disabled: true,
    description:
      'Analyse the impact of different marketing channels (social, search, TV, etc.) on sales and optimise budget allocation.',
  },
  {
    key: 'INFLUENCERS' as const, // String literal type - not in Feature enum yet
    title: 'Influencers',
    icon: '/icons/app/appInfluencers.svg',
    disabled: false,
    description:
      'Track how your campaigns perform with influencers without specific measurement requirements - perfect for basic campaign monitoring.',
  },
];

// --- Main Step 2 Component ---
function Step2Content() {
  const router = useRouter();
  const wizard = useWizard();

  const form = useForm<Step2FormData>({
    resolver: zodResolver(Step2ValidationSchema),
    mode: 'onChange',
    defaultValues: {
      primaryKPI: wizard.wizardState?.primaryKPI ?? undefined,
      secondaryKPIs: wizard.wizardState?.secondaryKPIs ?? [],
      features: wizard.wizardState?.features ?? [],
      messaging: {
        mainMessage: wizard.wizardState?.messaging?.mainMessage ?? '',
        hashtags: wizard.wizardState?.messaging?.hashtags ?? [],
        keyBenefits: wizard.wizardState?.messaging?.keyBenefits ?? [],
      },
      expectedOutcomes: {
        memorability: wizard.wizardState?.expectedOutcomes?.memorability ?? '',
        purchaseIntent: wizard.wizardState?.expectedOutcomes?.purchaseIntent ?? '',
        brandPerception: wizard.wizardState?.expectedOutcomes?.brandPerception ?? '',
      },
    },
  });

  // Effect to reset form when context data loads/changes
  useEffect(() => {
    if (wizard.wizardState && !form.formState.isDirty && !wizard.isLoading) {
      const messaging = wizard.wizardState.messaging ?? {};
      const outcomes = wizard.wizardState.expectedOutcomes ?? {};
      form.reset({
        primaryKPI: wizard.wizardState.primaryKPI ?? undefined,
        secondaryKPIs: wizard.wizardState.secondaryKPIs ?? [],
        features: wizard.wizardState.features ?? [],
        messaging: {
          mainMessage: messaging.mainMessage ?? '',
          hashtags: messaging.hashtags ?? [],
          keyBenefits: messaging.keyBenefits ?? [],
        },
        expectedOutcomes: {
          memorability: outcomes.memorability ?? '',
          purchaseIntent: outcomes.purchaseIntent ?? '',
          brandPerception: outcomes.brandPerception ?? '',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.wizardState, wizard.isLoading, form.reset, form.formState.isDirty]);

  // State for the hashtag input field
  const [hashtagInput, setHashtagInput] = useState('');
  // State for the key benefit input field
  const [keyBenefitInput, setKeyBenefitInput] = useState('');

  // Watch form values for autosave (COMMENTED OUT - not currently used)
  // const watchedValues = form.watch();

  // --- Autosave Logic (COMMENTED OUT) ---
  /*
        const handleAutosave = useCallback(async () => {
            if (!wizard.campaignId || !form.formState.isDirty || !wizard.autosaveEnabled || wizard.isLoading) return;
            const isValid = await form.trigger();
            if (!isValid) return;
            const currentData = form.getValues();
    
            const payload: Partial<DraftCampaignData> = {
                primaryKPI: currentData.primaryKPI,
                secondaryKPIs: currentData.secondaryKPIs,
                messaging: {
                    mainMessage: currentData.messaging?.mainMessage,
                    hashtags: currentData.messaging?.hashtags ?? [],
                    keyBenefits: currentData.messaging?.keyBenefits,
                },
                expectedOutcomes: currentData.expectedOutcomes,
                features: currentData.features,
                step2Complete: form.formState.isValid,
                currentStep: 2,
            };
            try {
                wizard.updateWizardState(payload);
                const success = await wizard.saveProgress();
                if (success) {
                    form.reset(currentData, { keepValues: true, keepDirty: false, keepErrors: true });
                } else {
                    toast.error("Failed to save draft.");
                }
            } catch (error) {
                console.error("Autosave error:", error);
                toast.error("An error occurred saving draft.");
            }
        }, [wizard, form, wizard.autosaveEnabled]);
    
        const debouncedAutosaveRef = useRef(debounce(handleAutosave, 2000));
        useEffect(() => {
            if (!wizard.isLoading && form.formState.isDirty && wizard.autosaveEnabled) {
                debouncedAutosaveRef.current();
            }
            return () => { debouncedAutosaveRef.current.cancel(); };
        }, [watchedValues, wizard.isLoading, form.formState.isDirty, wizard.autosaveEnabled]);
    */
  // Removed unused onSubmit function

  // --- Render Logic ---
  // Removed internal loading check
  /* 
  if (wizard.isLoading && !wizard.wizardState && wizard.campaignId) {
    return <LoadingSkeleton />;
  }
  */

  // Handle case where wizardState might still be null briefly after loading
  // or if campaignId was invalid - though WizardProvider might handle this upstream.
  // A simple check here prevents errors accessing wizardState properties.
  if (!wizard.wizardState) {
    // Optionally return a minimal skeleton or null, or rely on parent handling
    console.warn('[Step2Content] Wizard state is null during render.');
    return null; // Or return a basic placeholder
  }

  // Watch necessary values for conditional rendering
  const primaryKPIValue = form.watch('primaryKPI');
  const secondaryKPIValues = form.watch('secondaryKPIs') ?? []; // Ensure it's an array

  const handleStepClick = (step: number) => {
    if (wizard.campaignId && step < 3) {
      router.push(`/campaigns/wizard/step-${step}?id=${wizard.campaignId}`);
    } else {
      console.log(
        `Navigation to step ${step} from step 2 not implemented or allowed via progress bar.`
      );
    }
  };

  const handleBack = () => {
    if (wizard.campaignId) {
      router.push(`/campaigns/wizard/step-1?id=${wizard.campaignId}`);
    }
  };
  // Handle Next combines validation, save, and navigation
  const onSubmitAndNavigate = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      showErrorToast('Please fix the errors before proceeding.');
      return;
    }
    const data = form.getValues();
    const payload: Partial<DraftCampaignData> = {
      primaryKPI: data.primaryKPI,
      secondaryKPIs: data.secondaryKPIs,
      messaging: data.messaging,
      expectedOutcomes: data.expectedOutcomes,
      features: data.features,
      step2Complete: true,
      currentStep: 2,
    };
    // wizard.updateWizardState(payload); // Commented out immediate state update

    // Log the payload being sent when clicking Next
    console.log(
      '[Step 2] Payload prepared for onSubmitAndNavigate, sending to saveProgress:',
      payload
    );

    const saved = await wizard.saveProgress(payload); // Save Step 2 data first
    if (saved) {
      // Only navigate AFTER successful save
      form.reset(data, { keepValues: true, keepDirty: false });
      if (wizard.campaignId) {
        router.push(`/campaigns/wizard/step-3?id=${wizard.campaignId}`); // Navigate to Step 3
      } else {
        showErrorToast('Could not navigate: campaign ID not found.');
      }
    } else {
      showErrorToast('Failed to save progress before navigating.');
    }
  };

  // Determine Autosave Status from context (COMMENTED OUT - not currently used)
  // const getAutosaveStatus = () => {
  //     if (wizard.isLoading) return 'saving';
  //     if (wizard.lastSaved) return 'success';
  //     return 'idle';
  // };

  // Watch hashtag array for UI updates
  const currentHashtags = form.watch('messaging.hashtags') ?? [];
  // Watch key benefits array for UI updates
  const currentKeyBenefits = form.watch('messaging.keyBenefits') ?? [];

  // --- Hashtag Input Handlers ---
  const handleAddHashtag = () => {
    const newHashtag = hashtagInput.trim().replace(/^#/, ''); // Remove leading # if present
    if (newHashtag && !currentHashtags.includes(newHashtag)) {
      form.setValue('messaging.hashtags', [...currentHashtags, newHashtag], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setHashtagInput(''); // Clear input
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    form.setValue(
      'messaging.hashtags',
      currentHashtags.filter(tag => tag !== tagToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleAddHashtag();
    }
  };

  // --- Key Benefit Input Handlers ---
  const handleAddKeyBenefit = () => {
    const newBenefit = keyBenefitInput.trim();
    if (newBenefit && !currentKeyBenefits.includes(newBenefit)) {
      form.setValue('messaging.keyBenefits', [...currentKeyBenefits, newBenefit], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setKeyBenefitInput(''); // Clear input
    }
  };

  const handleRemoveKeyBenefit = (benefitToRemove: string) => {
    form.setValue(
      'messaging.keyBenefits',
      currentKeyBenefits.filter(b => b !== benefitToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handleKeyBenefitKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleAddKeyBenefit();
    }
  };

  // NEW: Handler for the manual Save button
  const handleSave = async (): Promise<boolean> => {
    console.log('[Step 2] Attempting Manual Save...');
    const isValid = await form.trigger();
    if (!isValid) {
      console.warn('[Step 2] Validation failed for manual save.');
      showErrorToast('Please fix the errors before saving.');
      return false;
    }
    const data = form.getValues();
    console.log('[Step 2] Form data is valid for manual save.');

    // Prepare payload, keeping currentStep as 2
    const payload: Partial<DraftCampaignData> = {
      primaryKPI: data.primaryKPI,
      secondaryKPIs: data.secondaryKPIs,
      messaging: {
        mainMessage: data.messaging?.mainMessage,
        hashtags: data.messaging?.hashtags ?? [],
        keyBenefits: data.messaging?.keyBenefits,
      },
      expectedOutcomes: data.expectedOutcomes,
      features: data.features,
      step2Complete: form.formState.isValid, // Use current validation state
      currentStep: 2,
    };

    console.log('[Step 2] Payload prepared for manual save:', payload);

    try {
      // Only call saveProgress, do not update local state or navigate
      const saveSuccess = await wizard.saveProgress(payload);

      if (saveSuccess) {
        console.log('[Step 2] Manual save successful!');
        showSuccessToast('Progress saved!');
        // Optionally reset dirty state if needed after successful save
        // form.reset(data, { keepValues: true, keepDirty: false, keepErrors: true });
        return true;
      } else {
        console.error('[Step 2] Manual save failed.');
        // saveProgress should show specific error
        return false;
      }
    } catch (error) {
      console.error('[Step 2] Error during manual save:', error);
      showErrorToast('An unexpected error occurred during save.');
      return false;
    }
    // No finally block to change isSubmitting, handled by ProgressBarWizard now
  };

  return (
    <div className="space-y-8">
      <ProgressBarWizard
        currentStep={2}
        steps={wizard.stepsConfig}
        onPrevious={handleBack}
        canGoPrevious={true}
        onNext={onSubmitAndNavigate}
        onSave={handleSave}
        isLoadingNext={form.formState.isSubmitting || wizard.isLoading}
        onStepClick={handleStepClick}
        onBack={handleBack}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitAndNavigate)}
          className="space-y-8 pb-[var(--footer-height)]"
        >
          {/* KPIs Card - REVISED LAYOUT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon iconId="faChartBarLight" className="w-5 h-5 mr-2 text-accent" />
                Key Performance Indicators (KPIs)
              </CardTitle>
              <CardDescription>
                Select 1 Primary KPI and up to 4 Secondary KPIs. Hover over titles for details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TooltipProvider delayDuration={300}>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[50%] pl-4">Explanation</TableHead>
                        <TableHead className="text-center w-[120px]">Primary</TableHead>
                        <TableHead className="text-center w-[120px]">Secondary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.map(kpi => {
                        const isPrimarySelected = primaryKPIValue === kpi.key;
                        const isSecondarySelected = secondaryKPIValues.includes(kpi.key);
                        const canSelectSecondary =
                          !isPrimarySelected &&
                          (secondaryKPIValues.length < 4 || isSecondarySelected);
                        const secondaryIsDisabled = isPrimarySelected || !canSelectSecondary;

                        return (
                          <TableRow
                            key={kpi.key}
                            className={cn(
                              'transition-colors',
                              isPrimarySelected
                                ? 'bg-primary/10 hover:bg-primary/20 border-l-4 border-l-primary'
                                : 'hover:bg-muted/50'
                            )}
                            onClick={() => {
                              const kpiKey = kpi.key;
                              // Check if the selected KPI is currently in the secondary list
                              const currentSecondaryKPIs = form.getValues('secondaryKPIs') || [];
                              if (currentSecondaryKPIs.includes(kpiKey)) {
                                // Remove it from secondary list if selecting as primary
                                const updatedSecondaryKPIs = currentSecondaryKPIs.filter(
                                  key => key !== kpiKey
                                );
                                form.setValue('secondaryKPIs', updatedSecondaryKPIs, {
                                  shouldDirty: true,
                                }); // Update secondary first
                              }
                              // Set the new primary KPI
                              form.setValue('primaryKPI', kpiKey, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Explanation Cell - Revised for vertical icon span */}
                            <TableCell className="font-medium align-top py-3 pl-4 flex items-start space-x-4">
                              {' '}
                              {/* Increased space-x */}
                              {/* Icon as direct child - Larger size */}
                              <Icon
                                iconId={kpi.iconId}
                                className="h-8 w-8 flex-shrink-0 text-muted-foreground"
                              />{' '}
                              {/* Increased size, removed mt-0.5 */}
                              {/* Container for text content */}
                              <div className="flex-grow pt-1">
                                {' '}
                                {/* Added slight top padding to text container for better alignment with larger icon center */}
                                <div className="flex items-center space-x-2 mb-0.5">
                                  {' '}
                                  {/* Title row */}
                                  {/* Icon removed from here */}
                                  <span className="font-semibold">{kpi.title}</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      {/* Wrap icon in a span to allow TooltipTrigger to work */}
                                      <span className="cursor-help">
                                        <Icon
                                          iconId="faCircleInfoLight"
                                          className={cn(
                                            'h-3.5 w-3.5',
                                            isPrimarySelected
                                              ? 'text-primary'
                                              : 'text-muted-foreground opacity-70'
                                          )}
                                        />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="whitespace-normal">{kpi.example}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                {/* Description row - remove padding */}
                                <p className="text-xs text-muted-foreground">{kpi.description}</p>
                              </div>
                            </TableCell>

                            <TableCell className="text-center align-middle py-3">
                              <div
                                className={cn(
                                  'mx-auto w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                  isPrimarySelected
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                )}
                              >
                                {isPrimarySelected && (
                                  <Icon
                                    iconId="faCheckSolid"
                                    className="h-2.5 w-2.5 text-primary-foreground"
                                  />
                                )}
                              </div>
                            </TableCell>

                            <TableCell
                              className="text-center align-middle py-3"
                              onClick={e => e.stopPropagation()}
                            >
                              <FormItem
                                className={cn(
                                  'flex justify-center items-center',
                                  secondaryIsDisabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                )}
                              >
                                <FormControl>
                                  <Checkbox
                                    id={`secondary-${kpi.key}`}
                                    checked={isSecondarySelected}
                                    onCheckedChange={checked => {
                                      if (secondaryIsDisabled && checked) return;
                                      const currentValues = form.getValues('secondaryKPIs') || [];
                                      const updatedValues = checked
                                        ? [...currentValues, kpi.key]
                                        : currentValues.filter(value => value !== kpi.key);
                                      form.setValue('secondaryKPIs', updatedValues, {
                                        shouldValidate: true,
                                      });
                                    }}
                                    disabled={secondaryIsDisabled}
                                    aria-label={`Select ${kpi.title} as Secondary KPI`}
                                  />
                                </FormControl>
                              </FormItem>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="pt-2 px-1 text-xs min-h-[20px]">
                  {form.formState.errors.primaryKPI && (
                    <FormMessage>{form.formState.errors.primaryKPI?.message}</FormMessage>
                  )}
                  {form.formState.errors.secondaryKPIs && (
                    <FormMessage>
                      {form.formState.errors.secondaryKPIs?.message ||
                        form.formState.errors.secondaryKPIs?.root?.message}
                    </FormMessage>
                  )}
                </div>
                <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-6">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Primary KPI:</span>
                    <div>
                      {primaryKPIValue ? (
                        <Badge variant="default" className="text-sm px-3 py-1">
                          <Icon
                            iconId={
                              kpis.find(k => k.key === primaryKPIValue)?.iconId ||
                              'faQuestionCircleLight'
                            }
                            className="mr-1.5 h-4 w-4"
                          />
                          {kpis.find(k => k.key === primaryKPIValue)?.title}
                        </Badge>
                      ) : (
                        <span className="text-sm italic text-muted-foreground">Not Selected</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Secondary KPIs:{' '}
                      {secondaryKPIValues.length >= 4
                        ? '(Max 4)'
                        : `(${secondaryKPIValues.length}/4)`}
                    </span>
                    <div className="flex flex-wrap gap-1 min-h-[28px] items-center">
                      {secondaryKPIValues.length > 0 ? (
                        secondaryKPIValues.map(key => {
                          const kpiInfo = kpis.find(k => k.key === key);
                          return (
                            <Badge key={key} variant="secondary" className="px-2.5 py-0.5">
                              <Icon
                                iconId={kpiInfo?.iconId || 'faQuestionCircleLight'}
                                className="mr-1.5 h-4 w-4"
                              />
                              {kpiInfo?.title}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-sm italic text-muted-foreground">None Selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Messaging Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon iconId="faCommentsLight" className="w-5 h-5 mr-2 text-accent" />
                Messaging
              </CardTitle>
              <CardDescription>Define the key messages and value propositions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TooltipProvider delayDuration={300}>
                <FormField
                  control={form.control}
                  name="messaging.mainMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Main Message</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              <Icon
                                iconId="faCircleInfoLight"
                                className="h-3.5 w-3.5 text-muted-foreground opacity-70"
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="whitespace-normal">
                              The single most important thing you want your audience to remember
                              about your brand or product after seeing your campaign.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Single most important takeaway..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- Hashtag Input - REVISED --- */}
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <span>Campaign Hashtags</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <Icon
                            iconId="faCircleInfoLight"
                            className="h-3.5 w-3.5 text-muted-foreground opacity-70"
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="whitespace-normal">
                          Social media hashtags that will help people discover your campaign content
                          and connect with your brand message across platforms.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  {/* Input first */}
                  <FormControl>
                    <Input
                      placeholder="Type a hashtag and press Enter..."
                      value={hashtagInput}
                      onChange={e => setHashtagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </FormControl>
                  {/* Badges display below input */}
                  <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                    {' '}
                    {/* Added pt-2 */}
                    {currentHashtags.map(tag => (
                      <RemovableBadge
                        key={tag}
                        variant="secondary"
                        size="md"
                        onRemove={() => handleRemoveHashtag(tag)}
                        removeAriaLabel={`Remove hashtag ${tag}`}
                      >
                        #{tag}
                      </RemovableBadge>
                    ))}
                  </div>
                  <FormMessage>{form.formState.errors.messaging?.hashtags?.message}</FormMessage>
                </FormItem>
                {/* --- End Hashtag Input --- */}

                {/* --- Key Benefit Input - REVISED --- */}
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <span>Key Benefits / Value Proposition</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <Icon
                            iconId="faCircleInfoLight"
                            className="h-3.5 w-3.5 text-muted-foreground opacity-70"
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="whitespace-normal">
                          The main advantages or positive outcomes customers will experience from
                          choosing your product or service over competitors.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  {/* Input first */}
                  <FormControl>
                    <Input
                      placeholder="Type a key benefit and press Enter..."
                      value={keyBenefitInput}
                      onChange={e => setKeyBenefitInput(e.target.value)}
                      onKeyDown={handleKeyBenefitKeyDown}
                    />
                  </FormControl>
                  {/* Badges display below input */}
                  <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem] items-center">
                    {' '}
                    {/* Added pt-2 */}
                    {currentKeyBenefits.map(benefit => (
                      <RemovableBadge
                        key={benefit}
                        variant="secondary"
                        size="md"
                        onRemove={() => handleRemoveKeyBenefit(benefit)}
                        removeAriaLabel={`Remove key benefit ${benefit}`}
                      >
                        {benefit}
                      </RemovableBadge>
                    ))}
                  </div>
                  <FormMessage>{form.formState.errors.messaging?.keyBenefits?.message}</FormMessage>
                </FormItem>
                {/* --- End Key Benefit Input --- */}
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Expected Outcomes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon iconId="faLightbulbLight" className="w-5 h-5 mr-2 text-accent" />
                Expected Outcomes
              </CardTitle>
              <CardDescription>
                Outline expected outcomes based on objectives and KPIs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TooltipProvider delayDuration={300}>
                <FormField
                  control={form.control}
                  name="expectedOutcomes.memorability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Memorability / Ad Recall</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              <Icon
                                iconId="faCircleInfoLight"
                                className="h-3.5 w-3.5 text-muted-foreground opacity-70"
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="whitespace-normal">
                              How well you expect people to remember seeing your advert after the
                              campaign. For example, "We expect 70% of viewers to recall our brand
                              message after one week."
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="We expect Ad Recall to increase by 15%..."
                          {...field}
                          value={(field.value as string) ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedOutcomes.purchaseIntent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Purchase/Action Intent</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              <Icon
                                iconId="faCircleInfoLight"
                                className="h-3.5 w-3.5 text-muted-foreground opacity-70"
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="whitespace-normal">
                              How likely people will be to buy your product or take a specific
                              action (like visiting your website) after seeing your campaign.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Purchase intent will rise by 10%..."
                          {...field}
                          value={(field.value as string) ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedOutcomes.brandPerception"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Brand Perception</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              <Icon
                                iconId="faCircleInfoLight"
                                className="h-3.5 w-3.5 text-muted-foreground opacity-70"
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="whitespace-normal">
                              How you expect people's opinion or feelings about your brand to change
                              after seeing your campaign. For example, more trustworthy, innovative,
                              or affordable.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Campaign will shift perception towards..."
                          {...field}
                          value={(field.value as string) ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon iconId="faListLight" className="w-5 h-5 mr-2 text-accent" />
                Features to Include
              </CardTitle>
              <CardDescription>Select features to enable for this campaign.</CardDescription>
            </CardHeader>
            <CardContent>
              <TooltipProvider
                delayDuration={200}
                skipDelayDuration={100}
                disableHoverableContent={false}
              >
                {/* Single FormField for the features array */}
                <FormField
                  control={form.control}
                  name="features"
                  render={(
                    { field } // Use the field object from the outer FormField
                  ) => (
                    <FormItem>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {features.map(feature => {
                          const isSelected = field.value?.includes(feature.key);
                          const isDisabled = feature.disabled;

                          return (
                            // Clickable FormItem directly updates the field array value
                            <FormItem
                              key={feature.key}
                              className={cn(
                                'flex flex-col items-center justify-between rounded-lg border p-4 transition-all relative',
                                isDisabled
                                  ? 'bg-muted/50 border-muted cursor-not-allowed opacity-60'
                                  : isSelected
                                    ? 'bg-accent text-accent-foreground border-accent/40 shadow-md cursor-pointer'
                                    : 'bg-background hover:bg-accent/5 cursor-pointer'
                              )}
                              onClick={() => {
                                if (isDisabled) return;

                                const currentValues = field.value || [];
                                const updatedValues = isSelected
                                  ? currentValues.filter(f => f !== feature.key)
                                  : [...currentValues, feature.key];
                                // Use setValue to update the array
                                form.setValue('features', updatedValues, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }}
                            >
                              {/* Coming Soon badge for disabled features */}
                              {isDisabled && (
                                <div className="absolute -top-2 -right-2 bg-muted-foreground text-background text-xs px-2 py-1 rounded-full font-medium">
                                  Coming Soon
                                </div>
                              )}

                              {/* Remove redundant FormControl and sr-only Checkbox */}
                              <div className="flex items-center mb-3">
                                <div className="mr-3 w-6 h-6 flex items-center justify-center">
                                  {/* Remove filter, rely on parent text color */}
                                  <Image src={feature.icon} alt="" width={28} height={28} />
                                </div>
                                {/* Add text-accent-foreground when selected */}
                                <div className="flex items-center space-x-2">
                                  <FormLabel
                                    className={cn(
                                      'font-medium cursor-pointer',
                                      isSelected && !isDisabled && 'text-accent-foreground',
                                      isDisabled && 'cursor-not-allowed'
                                    )}
                                  >
                                    {feature.title}
                                  </FormLabel>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help">
                                        <Icon
                                          iconId="faCircleInfoLight"
                                          className={cn(
                                            'h-4 w-4',
                                            isDisabled
                                              ? 'text-interactive'
                                              : 'text-muted-foreground opacity-70'
                                          )}
                                        />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent usePortal={true} forceHighZ={true}>
                                      <p className="whitespace-normal font-medium">
                                        {feature.description}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                              <div className="flex justify-end w-full mt-auto pt-2">
                                {/* Visual indicator - Use correct icon ID and color */}
                                {isSelected && !isDisabled ? (
                                  <Icon
                                    iconId="faCircleCheckSolid"
                                    className="w-5 h-5 text-accent-foreground"
                                  />
                                ) : (
                                  <div
                                    className={cn(
                                      'w-5 h-5 border-2 rounded-full',
                                      isDisabled ? 'border-muted' : 'border-muted'
                                    )}
                                  ></div>
                                )}
                              </div>
                            </FormItem>
                          );
                        })}
                      </div>
                      {/* Error message for the features array field */}
                      <FormMessage>{form.formState.errors.features?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </TooltipProvider>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default Step2Content;

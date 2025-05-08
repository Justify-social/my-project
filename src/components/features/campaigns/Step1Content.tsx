'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  useForm,
  useFieldArray,
  UseFormReturn,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import {
  Step1ValidationSchema,
  Step1FormData,
  DraftCampaignData,
  CurrencyEnum,
  PositionEnum,
  BudgetSchema,
} from '@/components/features/campaigns/types';
import { PlatformEnum } from '@/types/enums';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
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
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { differenceInDays, isValid as isValidDate } from 'date-fns';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { logger } from '@/lib/logger';
import { toast } from 'react-hot-toast';
import { convertCurrencyUsingApi } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { useLocalization } from '@/hooks/useLocalization';
import timezonesData from '@/lib/timezones.json';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';

// --- Formatting Helpers ---

/** Parses a formatted currency string back into a raw number string. */
const parseCurrencyInput = (formattedValue: string): string => {
  return formattedValue.replace(/[^\d]/g, ''); // Remove non-digits (commas, etc.)
};

// --- Influencer Entry Component ---
interface InfluencerEntryProps {
  index: number;
  control: UseFormReturn<Step1FormData>['control'];
  errors: UseFormReturn<Step1FormData>['formState']['errors'];
  remove: (index: number) => void;
}

const InfluencerEntry: React.FC<InfluencerEntryProps> = ({ index, control, errors, remove }) => {
  const { watch } = useFormContext<Step1FormData>();

  const watchedPlatform = watch(`Influencer.${index}.platform`);
  const watchedHandle = watch(`Influencer.${index}.handle`);

  return (
    <Card className="mb-4 border-border bg-card/50 relative overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-end absolute top-2 right-2">
          <IconButtonAction
            iconBaseName="faTrashCan"
            hoverColorClass="text-destructive"
            ariaLabel="Remove Influencer"
            className="h-7 w-7"
            onClick={() => remove(index)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <FormField
            control={control}
            name={`Influencer.${index}.platform`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(PlatformEnum).map(platformValue => (
                      <SelectItem key={platformValue} value={platformValue}>
                        {getPlatformDisplayName(platformValue)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage>{errors.Influencer?.[index]?.platform?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`Influencer.${index}.handle`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handle / Username *</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl className="flex-grow">
                    <Input placeholder="@username or channel_name" {...field} />
                  </FormControl>
                </div>
                <FormMessage>{errors.Influencer?.[index]?.handle?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Helper types
// Type for influencer data within the Step 1 form (MUST align with Step1FormData -> InfluencerSchema -> PlatformEnumBackend)
// type Step1Influencer = z.infer<typeof InfluencerSchema>; // REMOVED Unused Type
// Type for influencer data when preparing payload for context/API (already uses Backend enum)
// type PayloadInfluencer = z.infer<typeof InfluencerSchema>; // REMOVED Unused Type
// Type for influencer data coming from the context (uses Backend enum)
// type ContextInfluencer = z.infer<typeof InfluencerSchema>;

// --- Duration Helper ---
const calculateDuration = (
  startStr: string | null | undefined,
  endStr: string | null | undefined
): string | null => {
  if (!startStr || !endStr) return null;
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  if (!isValidDate(startDate) || !isValidDate(endDate) || endDate < startDate) {
    return null;
  }
  const days = differenceInDays(endDate, startDate) + 1; // Inclusive
  return `${days} day${days !== 1 ? 's' : ''}`;
};

async function preparePayload(
  data: Step1FormData,
  currentStep: number
): Promise<Partial<DraftCampaignData>> {
  // Payload preparation logic extracted
  return {
    name: data.name,
    businessGoal: data.businessGoal,
    brand: data.brand,
    website: data.website,
    startDate: data.startDate,
    endDate: data.endDate,
    timeZone: data.timeZone,
    primaryContact: {
      firstName: data.primaryContact?.firstName || '',
      surname: data.primaryContact?.surname || '',
      email: data.primaryContact?.email || '',
      position: data.primaryContact?.position || PositionEnum.Values.Director,
    },
    secondaryContact: data.secondaryContact?.email
      ? {
          firstName: data.secondaryContact?.firstName || '',
          surname: data.secondaryContact?.surname || '',
          email: data.secondaryContact?.email || '',
          position: data.secondaryContact?.position || PositionEnum.Values.Director,
        }
      : null,
    additionalContacts:
      data.additionalContacts
        ?.filter(c => c.email)
        .map(c => ({
          firstName: c.firstName || '',
          surname: c.surname || '',
          email: c.email || '',
          position: c.position || PositionEnum.Values.Director,
        })) || [],
    budget: data.budget
      ? {
          currency: data.budget.currency || CurrencyEnum.Values.USD,
          total: parseFloat(parseCurrencyInput(data.budget.total?.toString() || '0')) || 0,
          socialMedia:
            parseFloat(parseCurrencyInput(data.budget.socialMedia?.toString() || '0')) || 0,
        }
      : ({
          currency: CurrencyEnum.Values.USD,
          total: 0,
          socialMedia: 0,
        } as z.infer<typeof BudgetSchema>),
    Influencer:
      data.Influencer?.filter(inf => inf.platform && inf.handle).map(inf => ({
        id: inf.id, // Keep ID
        platform: inf.platform,
        handle: inf.handle,
      })) || [],
    step1Complete: true,
    currentStep: currentStep, // Use passed currentStep
  };
}

// --- Formatting & Parsing Helpers ---
const formatNumberWithCommas = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '0'; // Default to '0' for empty/null/undefined
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(num)) return '0'; // Default to '0' if parsing fails
  // Use toLocaleString for robust formatting
  return num.toLocaleString('en-US'); // Use appropriate locale
};

const parseFormattedNumber = (value: string): number | undefined => {
  const cleaned = value.replace(/[^\d.-]/g, ''); // Allow digits, decimal, negative sign
  if (cleaned === '' || cleaned === '-') return undefined; // Return undefined if empty or just negative sign
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num; // Return undefined if parsing fails
};

// --- Currency Symbol Helper ---
const getCurrencySymbol = (currencyCode?: string | null): string => {
  switch (currencyCode) {
    case 'GBP':
      return '£';
    case 'EUR':
      return '€';
    case 'USD':
    default:
      return '$';
  }
};

// Helper function to get display name for PlatformEnum
const getPlatformDisplayName = (platform: PlatformEnum): string => {
  switch (platform) {
    case PlatformEnum.Instagram:
      return 'Instagram';
    case PlatformEnum.YouTube:
      return 'YouTube';
    case PlatformEnum.TikTok:
      return 'TikTok';
    case PlatformEnum.Twitter:
      return 'Twitter/X';
    case PlatformEnum.Facebook:
      return 'Facebook';
    case PlatformEnum.Twitch:
      return 'Twitch';
    case PlatformEnum.Pinterest:
      return 'Pinterest';
    case PlatformEnum.LinkedIn:
      return 'LinkedIn';
    default:
      return platform; // Fallback to the key name
  }
};

function Step1Content() {
  const {
    wizardState,
    updateWizardState,
    isLoading: isWizardLoading,
    saveProgress,
    stepsConfig,
  } = useWizard();
  const router = useRouter();
  const initialDataLoaded = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const localization = useLocalization();
  const [_convertedTotalBudget, _setConvertedTotalBudget] = useState<string | null>(null);
  const [_convertedSocialMediaBudget, _setConvertedSocialMediaBudget] = useState<string | null>(
    null
  );
  const [campaignDuration, setCampaignDuration] = useState<string | null>(null);
  const [initialFormState, setInitialFormState] = useState<Step1FormData | null>(null);

  const form = useForm<Step1FormData>({
    resolver: zodResolver(Step1ValidationSchema),
    defaultValues: {
      timeZone: 'UTC',
      budget: { currency: 'USD', total: 0, socialMedia: 0 },
      name: '',
      brand: '',
      primaryContact: {
        firstName: '',
        surname: '',
        email: '',
        position: PositionEnum.Values.Director,
      },
      additionalContacts: [],
      Influencer: [{ id: uuidv4(), platform: PlatformEnum.Instagram, handle: '' }],
    },
    mode: 'onChange',
  });

  // --- Initial Value Calculation Effect (Updated) ---
  useEffect(() => {
    logger.debug('[Initial Value Calc Effect] Running Check...', {
      isWizardLoading,
      isLocationLoading: localization.isLoading,
      hasWizardState: !!wizardState,
      isExistingCampaign: !!wizardState?.id, // Add check for existing campaign
      initialFormStateExists: !!initialFormState,
      localizedTz: localization.timezone,
      localizedCurrency: localization.currency,
    });

    if (!isWizardLoading && !localization.isLoading && wizardState && initialFormState === null) {
      logger.info('[Initial Value Calc Effect] Conditions met. Calculating initial values...');

      const isExistingCampaign = !!wizardState.id; // Explicitly check if it's an existing campaign
      let timezoneToUse: string | null = null;
      let currencyToUse: z.infer<typeof CurrencyEnum> | null = null;

      // Determine Timezone: Prioritize saved only if it's an existing campaign
      const savedTimezone = wizardState.timeZone;
      if (isExistingCampaign && savedTimezone) {
        timezoneToUse = savedTimezone;
        logger.info(
          `[Initial Value Calc Effect] Existing campaign: Using saved timezone: ${timezoneToUse}`
        );
      } else {
        // For new campaigns OR existing ones without a saved TZ, use localized
        timezoneToUse = localization.timezone;
        logger.info(
          `[Initial Value Calc Effect] ${isExistingCampaign ? 'Existing campaign (no saved TZ)' : 'New campaign'}: Using localized timezone: ${timezoneToUse}`
        );
      }

      // Determine Currency: Prioritize saved only if it's an existing campaign
      const savedCurrency = wizardState.budget?.currency;
      if (isExistingCampaign && savedCurrency && CurrencyEnum.safeParse(savedCurrency).success) {
        currencyToUse = savedCurrency;
        logger.info(
          `[Initial Value Calc Effect] Existing campaign: Using saved currency: ${currencyToUse}`
        );
      } else {
        // For new campaigns OR existing ones without a saved currency, use localized
        currencyToUse = localization.currency;
        logger.info(
          `[Initial Value Calc Effect] ${isExistingCampaign ? 'Existing campaign (no saved currency)' : 'New campaign'}: Using localized currency: ${currencyToUse}`
        );
      }

      // Final fallbacks remain the same (belt-and-suspenders)
      const finalTimezone = timezoneToUse || 'UTC';
      const finalCurrency = currencyToUse || CurrencyEnum.Values.USD;

      logger.info('[Initial Value Calc Effect] Determined final initial values:', {
        finalTimezone,
        finalCurrency,
      });

      // Construct the full initial data object (structure remains the same)
      const initialData: Step1FormData = {
        name: wizardState.name || '',
        businessGoal: wizardState.businessGoal ?? null,
        brand: wizardState.brand || '',
        website: wizardState.website ?? null,
        startDate: wizardState.startDate || null,
        endDate: wizardState.endDate || null,
        timeZone: finalTimezone,
        primaryContact: wizardState.primaryContact ?? {
          firstName: '',
          surname: '',
          email: '',
          position: PositionEnum.Values.Director,
        },
        secondaryContact: wizardState.secondaryContact ?? null,
        additionalContacts: wizardState.additionalContacts ?? [],
        budget: {
          currency: finalCurrency, // Removed 'as any' - check if TS error returns
          total: parseFloat(wizardState.budget?.total?.toString() || '0') || 0,
          socialMedia: parseFloat(wizardState.budget?.socialMedia?.toString() || '0') || 0,
        },
        Influencer:
          wizardState.Influencer && wizardState.Influencer.length > 0
            ? wizardState.Influencer
            : [{ id: uuidv4(), platform: PlatformEnum.Instagram, handle: '' }], // Ensure it's just the array
      };

      setInitialFormState(initialData);
    }
    // Dependencies remain largely the same, adding wizardState.id implicitly via wizardState dependency
  }, [
    isWizardLoading,
    localization.isLoading,
    localization.timezone,
    localization.currency,
    wizardState, // Includes wizardState.id
    initialFormState,
  ]);

  // --- Form Reset Effect (Updated) ---
  useEffect(() => {
    logger.debug('[Form Reset Effect] Running Check...', {
      initialFormStateExists: !!initialFormState,
      initialDataLoaded: initialDataLoaded.current,
      isLocationLoading: localization.isLoading, // Check localization loading
    });

    // Only run ONCE when initialFormState is set AND localization detection is finished
    if (initialFormState && !initialDataLoaded.current && !localization.isLoading) {
      logger.info(
        '[Form Reset Effect] Conditions met. Applying calculated initial values to form:',
        initialFormState
      );
      form.reset(initialFormState);
      initialDataLoaded.current = true;
    }
    // Depend on initialFormState, form.reset, form object, and localization.isLoading
  }, [initialFormState, form.reset, form, localization.isLoading]); // Add form dependency

  const {
    fields: influencerFields,
    append: appendInfluencer,
    remove: removeInfluencer,
  } = useFieldArray({
    control: form.control,
    name: 'Influencer',
    keyName: 'fieldId',
  });

  // Prefix unused contact useFieldArray results
  const {
    fields: _contactFields,
    append: _appendContact,
    remove: _removeContact,
  } = useFieldArray({
    control: form.control,
    name: 'additionalContacts',
  });

  const handleStepClick = (step: number) => {
    // Only allow clicking if the step has been completed or is the current step
    // This depends on having completion status in wizardState or stepsConfig
    console.log('Navigate to step', step);
    // router.push(`/campaigns/wizard/step-${step}?id=${wizardState?.campaignId}`);
  };

  const onSubmitAndNavigate = async () => {
    setIsSubmitting(true);
    logger.info('[Step 1] Attempting Next...');
    const isValid = await form.trigger();
    if (!isValid) {
      logger.warn('[Step 1] Validation failed.');
      // Use imported helper
      showErrorToast('Please fix the errors before proceeding.');
      setIsSubmitting(false);
      return;
    }
    const formData = form.getValues();
    logger.info('[Step 1] Form data is valid.');

    try {
      const payload = await preparePayload(formData, 2);
      logger.info('[Step 1] Payload prepared for save.');

      updateWizardState(payload);
      const saveSuccess = await saveProgress(payload);

      if (saveSuccess) {
        logger.info('[Step 1] Save successful, navigating to Step 2');
        router.push(`/campaigns/wizard/step-2?id=${wizardState?.campaignId || saveSuccess}`); // Use returned ID if new
      } else {
        logger.error('[Step 1] Save failed after validation.');
        // saveProgress should have shown an error toast
      }
    } catch (error) {
      logger.error('[Step 1] Error during submission:', {
        error: error instanceof Error ? error : String(error),
      });
      // Use imported helper
      showErrorToast('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Handler for the manual Save button
  const handleSave = async (): Promise<boolean> => {
    setIsSubmitting(true);
    logger.info('[Step 1] Attempting Manual Save...');
    const isValid = await form.trigger();
    if (!isValid) {
      logger.warn('[Step 1] Validation failed for manual save.');
      // Use imported helper
      showErrorToast('Please fix the errors before saving.');
      setIsSubmitting(false);
      return false;
    }
    const formData = form.getValues();
    logger.info('[Step 1] Form data is valid for manual save.');

    try {
      const payload = await preparePayload(formData, 1);
      logger.info('[Step 1] Payload prepared for manual save.');

      const saveSuccess = await saveProgress(payload);

      if (saveSuccess) {
        logger.info('[Step 1] Manual save successful!');
        // Use imported helper (default icon is floppy disk)
        showSuccessToast('Progress saved!');
        return true;
      } else {
        logger.error('[Step 1] Manual save failed.');
        // saveProgress should show specific error
        // Use imported helper (default icon is triangle exclamation)
        showErrorToast('An unexpected error occurred during save.');
        return false;
      }
    } catch (error) {
      logger.error('[Step 1] Error during manual save:', {
        error: error instanceof Error ? error : String(error),
      });
      // Use imported helper
      showErrorToast('An unexpected error occurred during save.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Currency Conversion Effect ---
  // Watch the specific budget fields
  const [watchedTotal, watchedSocial, watchedCurrency] = form.watch([
    'budget.total',
    'budget.socialMedia',
    'budget.currency',
  ]);
  // Process watched values
  const totalBudgetRaw = parseFloat(parseCurrencyInput(String(watchedTotal || '0')));
  const socialMediaBudgetRaw = parseFloat(parseCurrencyInput(String(watchedSocial || '0')));
  const selectedCurrencyForConversion = watchedCurrency || CurrencyEnum.Values.USD;

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component

    const updateConvertedValues = async () => {
      if (selectedCurrencyForConversion === 'USD') {
        if (isMounted) {
          _setConvertedTotalBudget(null);
          _setConvertedSocialMediaBudget(null);
        }
        return;
      }

      // Convert Total Budget
      if (!isNaN(totalBudgetRaw) && totalBudgetRaw > 0) {
        const convertedTotal = await convertCurrencyUsingApi(
          totalBudgetRaw,
          selectedCurrencyForConversion,
          'USD'
        );
        if (isMounted) {
          _setConvertedTotalBudget(
            convertedTotal !== null
              ? `Approx. $${convertedTotal.toLocaleString()} USD`
              : 'Conversion unavailable'
          );
        }
      } else {
        if (isMounted) _setConvertedTotalBudget(null);
      }

      // Convert Social Media Budget
      if (!isNaN(socialMediaBudgetRaw) && socialMediaBudgetRaw > 0) {
        const convertedSocial = await convertCurrencyUsingApi(
          socialMediaBudgetRaw,
          selectedCurrencyForConversion,
          'USD'
        );
        if (isMounted) {
          _setConvertedSocialMediaBudget(
            convertedSocial !== null
              ? `Approx. $${convertedSocial.toLocaleString()} USD`
              : 'Conversion unavailable'
          );
        }
      } else {
        if (isMounted) _setConvertedSocialMediaBudget(null);
      }
    };

    updateConvertedValues();

    return () => {
      isMounted = false;
    }; // Cleanup function
    // Rerun effect when raw values or currency change
  }, [totalBudgetRaw, socialMediaBudgetRaw, selectedCurrencyForConversion]);

  // --- Duration Calculation Effect (Add back) ---
  const watchedStartDate = form.watch('startDate');
  const watchedEndDate = form.watch('endDate');
  useEffect(() => {
    const duration = calculateDuration(watchedStartDate, watchedEndDate);
    setCampaignDuration(duration);
  }, [watchedStartDate, watchedEndDate]);

  // Get the currency symbol based on the watched currency value
  const currencySymbol = getCurrencySymbol(watchedCurrency);

  if (isWizardLoading || localization.isLoading || !initialDataLoaded.current) {
    // Show skeleton while wizard context is loading OR localization is loading OR initial form data hasn't been loaded yet
    return <WizardSkeleton step={1} />;
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={e => e.preventDefault()} className="space-y-8 pb-[var(--footer-height)]">
          {/* === Basic Info Section === */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the fundamental details for your campaign.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Skincare Launch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="businessGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Goal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Increase brand awareness by 15%"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Brand Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://brandname.com"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* === Schedule & Timezone Section === */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Timezone</CardTitle>
              <CardDescription>
                Set the campaign dates and select the relevant timezone.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date: Date | undefined) => {
                            field.onChange(date ? date.toISOString() : null);
                            form.trigger('endDate');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date: Date | undefined) => {
                            field.onChange(date ? date.toISOString() : null);
                          }}
                          disabled={(date: Date) => {
                            const currentStartDateStr = form.getValues('startDate') as
                              | string
                              | null;
                            if (!currentStartDateStr) return false;
                            const currentStartDate = new Date(currentStartDateStr);
                            return isValidDate(currentStartDate) && date < currentStartDate;
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2 flex items-center min-h-[2.25rem] pt-2">
                {campaignDuration && (
                  <Badge variant="outline" className="font-normal">
                    <Icon iconId="faCalendarDaysLight" className="mr-1.5 h-3 w-3" />
                    Duration: {campaignDuration}
                  </Badge>
                )}
              </div>
              <div className="md:col-span-1 pt-4">
                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Time Zone *{/* Use localization hook's loading state */}
                        {localization.isLoading && (
                          <Icon
                            iconId="faCircleNotchLight"
                            className="animate-spin h-3 w-3 ml-2 text-muted-foreground"
                          />
                        )}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''} // Default value might need adjustment if field.value can be null
                        // Disable while localization is loading
                        disabled={localization.isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            {/* Ensure SelectValue has a valid value or placeholder displays */}
                            <SelectValue placeholder="Select timezone..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Populate from static data */}
                          {/* Add type for option */}
                          {timezonesData.map((option: { value: string; label: string }) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Please select the primary timezone for this campaign.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* === Contacts Section === */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Specify the primary and secondary points of contact for this campaign.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Contact */}
              <div className="p-4 border rounded-md bg-muted/30">
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                  Primary Contact *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryContact.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primaryContact.surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surname</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primaryContact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primaryContact.position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PositionEnum.options.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Secondary Contact */}
              <div className="p-4 border rounded-md bg-muted/30">
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">
                  Secondary Contact (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="secondaryContact.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryContact.surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surname</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryContact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryContact.position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PositionEnum.options.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Contacts */}
              {/* TODO: Add logic for _contactFields, _appendContact, _removeContact if this section is uncommented */}
              {/*
               <div className="p-4 border rounded-md">
                 <h4 className="font-medium mb-3 text-sm text-muted-foreground">Additional Contacts</h4>
                 {_contactFields.map((field, index) => (
                   <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end">
                     <FormField control={form.control} name={`additionalContacts.${index}.firstName`} render={({ field }) => (<FormItem className="md:col-span-1"><FormLabel>First</FormLabel><FormControl><Input {...field} value={field.value ?? ''}/></FormControl></FormItem>)} />
                     <FormField control={form.control} name={`additionalContacts.${index}.surname`} render={({ field }) => (<FormItem className="md:col-span-1"><FormLabel>Surname</FormLabel><FormControl><Input {...field} value={field.value ?? ''}/></FormControl></FormItem>)} />
                     <FormField control={form.control} name={`additionalContacts.${index}.email`} render={({ field }) => (<FormItem className="md:col-span-1"><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name={`additionalContacts.${index}.position`} render={({ field }) => (<FormItem className="md:col-span-1"><FormLabel>Position</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger /></FormControl><SelectContent>{PositionEnum.options.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}</SelectContent></Select></FormItem>)} />
                     <IconButtonAction iconBaseName="faTrashCan" hoverColorClass="text-destructive" ariaLabel="Remove Contact" onClick={() => _removeContact(index)} />
                   </div>
                 ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => _appendContact({ firstName: '', surname: '', email: '', position: PositionEnum.Values.Director })}> <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" /> Add Contact</Button>
               </div>
               */}
            </CardContent>
          </Card>

          {/* === Budget Section === */}
          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
              <CardDescription>Set the budget for the campaign.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency Selection */}
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="budget.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CurrencyEnum.options.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1"></div> {/* Placeholder */}
              {/* Total Budget */}
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="budget.total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget *</FormLabel>
                      <div className="relative">
                        {/* Add symbol as an absolutely positioned element */}
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <FormControl>
                          <Input
                            type="text" // Change type to text
                            placeholder="0"
                            // Add padding to the left to avoid overlapping the symbol
                            className="pl-7" // Adjust padding as needed
                            {...field}
                            value={formatNumberWithCommas(field.value)} // Display formatted value
                            onChange={e => {
                              // Update form state with parsed number
                              field.onChange(parseFormattedNumber(e.target.value));
                            }}
                            onFocus={e => {
                              // Select content if it's "0"
                              if (e.target.value === '0') {
                                e.target.select();
                              }
                            }}
                          />
                        </FormControl>
                      </div>
                      {/* Display converted value from state */}
                      {_convertedTotalBudget && (
                        <FormDescription>{_convertedTotalBudget}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Social Media Budget */}
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="budget.socialMedia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media Budget *</FormLabel>
                      <div className="relative">
                        {/* Add symbol */}
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <FormControl>
                          <Input
                            type="text" // Change type to text
                            placeholder="0"
                            className="pl-7" // Add padding
                            {...field}
                            value={formatNumberWithCommas(field.value)} // Display formatted value
                            onChange={e => {
                              // Update form state with parsed number
                              field.onChange(parseFormattedNumber(e.target.value));
                            }}
                            onFocus={e => {
                              // Select content if it's "0"
                              if (e.target.value === '0') {
                                e.target.select();
                              }
                            }}
                          />
                        </FormControl>
                      </div>
                      {/* Display converted value from state */}
                      {_convertedSocialMediaBudget && (
                        <FormDescription>{_convertedSocialMediaBudget}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* === Influencer Section === */}
          <Card>
            <CardHeader>
              <CardTitle>Influencer Selection</CardTitle>
              <CardDescription>
                Add the social media platform and handle for each influencer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {influencerFields.map((field, index) => (
                <InfluencerEntry
                  key={field.fieldId} // Use fieldId provided by useFieldArray
                  index={index}
                  control={form.control}
                  errors={form.formState.errors}
                  remove={removeInfluencer}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  appendInfluencer({
                    id: `new-${Date.now()}`,
                    platform: PlatformEnum.Instagram,
                    handle: '',
                  })
                }
              >
                <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" />
                Add Influencer
              </Button>
            </CardContent>
          </Card>

          {/* Error Summary */}
          {Object.keys(form.formState.errors).length > 0 && (
            <Alert variant="destructive">
              <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
              <AlertDescription>
                Please correct the errors above before proceeding.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>

      <ProgressBarWizard
        currentStep={1}
        steps={stepsConfig}
        onNext={onSubmitAndNavigate}
        onSave={handleSave}
        isLoadingNext={isSubmitting}
        onStepClick={handleStepClick}
        onBack={null}
      />
    </FormProvider>
  );
}

export default Step1Content;

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
  PlatformEnumFrontend,
  PlatformEnumBackend,
  CurrencyEnum,
  PositionEnum,
  platformToFrontend,
  PlatformSchema,
  InfluencerSchema,
} from '@/components/features/campaigns/types';
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
import timezonesData from '@/lib/timezones.json'; // Import the static timezone data
import { logger } from '@/lib/logger';
import { toast } from 'react-hot-toast';
import { convertCurrencyUsingApi } from '@/utils/currency'; // Import the new utility
import { InfluencerCard } from '@/components/ui/card-influencer'; // Import InfluencerCard

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

// Define proper type for Phyllo validation data
interface PhylloValidationData {
  id: string;
  displayName: string;
  platform: z.infer<typeof PlatformEnumBackend>; // Use specific type
  handle: string;
  followerCount?: number;
  avatarUrl?: string;
  verified?: boolean;
}

const InfluencerEntry: React.FC<InfluencerEntryProps> = ({ index, control, errors, remove }) => {
  const { watch } = useFormContext<Step1FormData>();
  // State for Phyllo validation
  const [isValidating, setIsValidating] = useState(false);
  // Use the defined interface instead of any
  const [validationData, setValidationData] = useState<PhylloValidationData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const watchedPlatform = watch(`Influencer.${index}.platform`);
  const watchedHandle = watch(`Influencer.${index}.handle`);

  // Placeholder function for Phyllo API call
  const handleVerifyInfluencer = async () => {
    if (!watchedPlatform || !watchedHandle) {
      toast.error('Platform and handle are required.');
      return;
    }
    setIsValidating(true);
    setValidationError(null);
    setValidationData(null);
    logger.info('Verifying influencer via Phyllo...', {
      platform: watchedPlatform,
      handle: watchedHandle,
    });

    try {
      // TODO: Implement actual fetch to backend API endpoint
      // const response = await fetch('/api/phyllo/validate-influencer', { ... });
      // const result = await response.json();
      // if (response.ok && result.success) {
      //   setValidationData(result.data);
      // } else {
      //   throw new Error(result.error || 'Failed to validate influencer');
      // }

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulate success/failure based on handle for testing
      if (watchedHandle.includes('fail')) {
        throw new Error('Simulated Phyllo API validation failure.');
      } else {
        // Simulate successful validation data
        setValidationData({
          id: `phyllo-${Date.now()}`,
          displayName: `User ${watchedHandle}`,
          platform: watchedPlatform,
          handle: watchedHandle,
          followerCount: Math.floor(Math.random() * 100000),
          avatarUrl: 'https://via.placeholder.com/150',
          verified: Math.random() > 0.5,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Phyllo validation failed.', { error: message });
      setValidationError(message);
      toast.error(`Verification failed: ${message}`);
    } finally {
      setIsValidating(false);
    }
  };

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
                <Select
                  onValueChange={frontendValue => {
                    try {
                      const backendValue = PlatformSchema.parse(frontendValue);
                      field.onChange(backendValue);
                    } catch {
                      field.onChange(undefined);
                    }
                  }}
                  value={field.value ? platformToFrontend(field.value) : undefined}
                  disabled={isValidating} // Disable while validating
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PlatformEnumFrontend.options.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
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
                    <Input
                      placeholder="@username or channel_name"
                      {...field}
                      disabled={isValidating} // Disable while validating
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleVerifyInfluencer}
                    disabled={isValidating || !watchedPlatform || !watchedHandle}
                  >
                    {isValidating ? (
                      <Icon iconId="faCircleNotchLight" className="animate-spin h-4 w-4" />
                    ) : (
                      <Icon iconId="faCheckLight" className="h-4 w-4" />
                    )}
                    <span className="ml-1.5">{isValidating ? 'Verifying...' : 'Verify'}</span>
                  </Button>
                </div>
                <FormMessage>{errors.Influencer?.[index]?.handle?.message}</FormMessage>
                {/* Restore Error description - Display API error */}
                {!isValidating && validationError && (
                  <p className="text-sm text-destructive mt-1">{validationError}</p>
                )}
              </FormItem>
            )}
          />
        </div>
        {/* Restore InfluencerCard display - Show card on successful validation */}
        {!isValidating && validationData && (
          <div className="mt-4 border-t pt-4">
            <InfluencerCard
              platform={validationData.platform}
              handle={validationData.handle}
              displayName={validationData.displayName}
              followerCount={validationData.followerCount}
              avatarUrl={validationData.avatarUrl}
              verified={validationData.verified}
            />
          </div>
        )}
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
// const calculateDuration = (
//   startStr: string | null | undefined,
//   endStr: string | null | undefined
// ): string => {
//   // Explicitly handle null/undefined/empty inputs
//   if (!startStr || !endStr) return '...';
//
//   const startDate = new Date(startStr);
//   const endDate = new Date(endStr);
//
//   // Check for invalid date parsing
//   if (!isValidDate(startDate) || !isValidDate(endDate) || endDate < startDate) {
//     return '...';
//   }
//
//   const days = differenceInDays(endDate, startDate) + 1; // Inclusive
//   return `${days} day${days !== 1 ? 's' : ''}`;
// };

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
    budget: {
      currency: data.budget?.currency || CurrencyEnum.Values.USD,
      total: parseFloat(parseCurrencyInput(data.budget?.total?.toString() || '0')) || 0,
      socialMedia: parseFloat(parseCurrencyInput(data.budget?.socialMedia?.toString() || '0')) || 0,
    },
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

function Step1Content() {
  const { wizardState, updateWizardState, isLoading, saveProgress, stepsConfig } = useWizard();
  const router = useRouter();
  const initialDataLoaded = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Prefix unused state variables with _
  const [_detectedTimezone, _setDetectedTimezone] = useState<string | null>(null);
  const [_isDetectingTimezone, _setIsDetectingTimezone] = useState<boolean>(false);
  const [_convertedTotalBudget, _setConvertedTotalBudget] = useState<string | null>(null);
  const [_convertedSocialMediaBudget, _setConvertedSocialMediaBudget] = useState<string | null>(
    null
  );

  const form = useForm<Step1FormData>({
    resolver: zodResolver(Step1ValidationSchema),
    defaultValues: {
      name: '',
      businessGoal: '',
      brand: '',
      website: '',
      startDate: null,
      endDate: null,
      timeZone: 'UTC',
      primaryContact: {
        firstName: '',
        surname: '',
        email: '',
        position: PositionEnum.Values.Director,
      },
      secondaryContact: {
        firstName: '',
        surname: '',
        email: '',
        position: PositionEnum.Values.Director,
      },
      additionalContacts: [],
      budget: {
        currency: CurrencyEnum.Values.USD,
        total: 0,
        socialMedia: 0,
      },
      Influencer: [
        { id: `new-${Date.now()}`, platform: PlatformEnumBackend.Values.INSTAGRAM, handle: '' },
      ],
    },
    mode: 'onChange',
  });

  // --- Timezone Detection Effect ---
  useEffect(() => {
    async function performTimezoneDetection() {
      _setIsDetectingTimezone(true);
      logger.info('[Step 1] Attempting automatic timezone detection...');
      let detectedTz: string | null = null;
      let source: string = 'default';

      // 1. Try external API (ipgeolocation.io) first (RECOMMENDED FOR PROD ACCURACY)
      const apiKey = process.env.NEXT_PUBLIC_IPGEOLOCATION_API_KEY;
      if (apiKey) {
        source = 'ipgeolocation.io';
        try {
          const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`, {
            signal: AbortSignal.timeout(3000),
          });
          if (!response.ok) throw new Error(`API Error: ${response.status}`);
          const data = await response.json();
          if (data?.time_zone?.name && timezonesData.some(tz => tz.value === data.time_zone.name)) {
            detectedTz = data.time_zone.name;
            logger.info(`[Step 1] Detected timezone via ${source}.`, { detected: detectedTz });
          } else {
            logger.warn(`[Step 1] ${source} returned invalid timezone: ${data?.time_zone?.name}`);
          }
        } catch (error) {
          logger.warn(`[Step 1] Failed to detect timezone via ${source}.`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else {
        logger.warn(
          '[Step 1] Skipping ipgeolocation.io check: NEXT_PUBLIC_IPGEOLOCATION_API_KEY not set.'
        );
      }

      // 2. If external API failed or key missing, try Intl API
      if (!detectedTz) {
        source = 'Intl API';
        try {
          const intlTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          // Validate against our list
          if (intlTz && timezonesData.some(tz => tz.value === intlTz)) {
            detectedTz = intlTz;
            logger.info(`[Step 1] Detected timezone via ${source}.`, { detected: detectedTz });
          } else {
            logger.warn(`[Step 1] Intl timezone not valid or not found in local list: ${intlTz}`);
          }
        } catch (error) {
          logger.warn(`[Step 1] Failed to detect timezone via ${source}.`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // 3. Fallback (already default, just log)
      if (!detectedTz) {
        source = 'fallback';
        logger.info('[Step 1] Using fallback timezone UTC.');
      }

      logger.info('[Step 1] Timezone detection process complete.', {
        finalDetected: detectedTz,
        source,
      });
      _setDetectedTimezone(detectedTz);
      _setIsDetectingTimezone(false);
    }

    // Trigger condition: Only run if not currently loading and NOT already detecting
    // This runs once when isLoading becomes false. Subsequent state updates don't re-trigger.
    if (!isLoading && !_isDetectingTimezone) {
      logger.debug('[Timezone Detection Effect] Triggering detection.');
      performTimezoneDetection();
    }
    // Depend only on isLoading to trigger once when loading finishes
  }, [isLoading]);

  // --- Form Reset Effect (Modified dependencies) ---
  useEffect(() => {
    logger.debug('[Timezone Reset Effect] Running...', {
      isLoading,
      _isDetectingTimezone,
      initialDataLoaded: initialDataLoaded.current,
    });
    // Wait for wizard state loading AND timezone detection to be FINISHED
    if (!isLoading && !_isDetectingTimezone && wizardState && !initialDataLoaded.current) {
      // --- This block now runs only AFTER detection is complete ---
      logger.info('[Timezone Reset Effect] Conditions met for form reset.');
      let timezoneToUse = 'UTC';
      const savedTimezone = wizardState?.timeZone;
      // Use the detected timezone state variable which is now set
      const isValidDetectedTz =
        _detectedTimezone && timezonesData.some(tz => tz.value === _detectedTimezone);
      logger.debug('[Timezone Reset Effect] Determining timezone:', {
        savedTimezone,
        _detectedTimezone,
        isValidDetectedTz,
      });
      if (savedTimezone) {
        timezoneToUse = savedTimezone;
        logger.info('[Timezone Reset Effect] Using saved timezone.', { timezoneToUse });
      } else if (isValidDetectedTz) {
        timezoneToUse = _detectedTimezone; // Apply detected timezone
        logger.info('[Timezone Reset Effect] Using detected timezone.', { timezoneToUse });
      } else {
        logger.info('[Timezone Reset Effect] Using default timezone (UTC).');
      }
      const formattedData: Step1FormData = {
        name: wizardState?.name || '',
        businessGoal: wizardState?.businessGoal || '',
        brand: wizardState?.brand || '',
        website: wizardState?.website || '',
        startDate: wizardState?.startDate || null,
        endDate: wizardState?.endDate || null,
        timeZone: timezoneToUse,
        // Restore detailed mapping for complex types
        primaryContact: {
          firstName: wizardState?.primaryContact?.firstName || '',
          surname: wizardState?.primaryContact?.surname || '',
          email: wizardState?.primaryContact?.email || '',
          position: (wizardState?.primaryContact?.position &&
          PositionEnum.safeParse(wizardState.primaryContact.position).success
            ? wizardState.primaryContact.position
            : PositionEnum.Values.Director) as z.infer<typeof PositionEnum>,
        },
        secondaryContact: {
          firstName: wizardState?.secondaryContact?.firstName || '',
          surname: wizardState?.secondaryContact?.surname || '',
          email: wizardState?.secondaryContact?.email || '',
          position: (wizardState?.secondaryContact?.position &&
          PositionEnum.safeParse(wizardState.secondaryContact.position).success
            ? wizardState.secondaryContact.position
            : PositionEnum.Values.Director) as z.infer<typeof PositionEnum>,
        },
        additionalContacts: Array.isArray(wizardState?.additionalContacts)
          ? wizardState.additionalContacts.map(contact => ({
              firstName: contact?.firstName || '',
              surname: contact?.surname || '',
              email: contact?.email || '',
              position: (contact?.position && PositionEnum.safeParse(contact.position).success
                ? contact.position
                : PositionEnum.Values.Director) as z.infer<typeof PositionEnum>,
            }))
          : [],
        budget: {
          currency: (wizardState?.budget?.currency &&
          CurrencyEnum.safeParse(wizardState.budget.currency).success
            ? wizardState.budget.currency
            : CurrencyEnum.Values.USD) as z.infer<typeof CurrencyEnum>,
          total: parseFloat(wizardState?.budget?.total?.toString() || '0') || 0,
          socialMedia: parseFloat(wizardState?.budget?.socialMedia?.toString() || '0') || 0,
        },
        Influencer:
          Array.isArray(wizardState?.Influencer) && wizardState.Influencer.length > 0
            ? wizardState.Influencer.map((inf: unknown) => {
                const id =
                  typeof inf === 'object' &&
                  inf !== null &&
                  'id' in inf &&
                  typeof inf.id === 'string'
                    ? inf.id
                    : `new-${Date.now()}`;
                const platformValue =
                  typeof inf === 'object' && inf !== null && 'platform' in inf
                    ? inf.platform
                    : undefined;
                const handleValue =
                  typeof inf === 'object' &&
                  inf !== null &&
                  'handle' in inf &&
                  typeof inf.handle === 'string'
                    ? inf.handle
                    : '';
                return {
                  id: id,
                  platform: (platformValue && PlatformEnumBackend.safeParse(platformValue).success
                    ? platformValue
                    : PlatformEnumBackend.Values.INSTAGRAM) as z.infer<typeof PlatformEnumBackend>,
                  handle: handleValue,
                };
              })
            : [
                {
                  id: `new-${Date.now()}`,
                  platform: PlatformEnumBackend.Values.INSTAGRAM,
                  handle: '',
                },
              ],
      };
      logger.info('[Timezone Reset Effect] Calling form.reset with formatted data:', formattedData);
      form.reset(formattedData as Step1FormData);
      initialDataLoaded.current = true; // Mark initial load as complete here
    }
    // Depend on detection state change as well
  }, [isLoading, wizardState, form.reset, _isDetectingTimezone, _detectedTimezone]);

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
    // fields: contactFields, // Prefix if unused
    // append: appendContact, // Prefix if unused
    // remove: removeContact, // Prefix if unused
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
      toast.error('Please fix the errors before proceeding.');
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
      toast.error('An unexpected error occurred. Please try again.');
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
      toast.error('Please fix the errors before saving.');
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
        toast.success('Progress saved!');
        return true;
      } else {
        logger.error('[Step 1] Manual save failed.');
        // saveProgress should show specific error
        return false;
      }
    } catch (error) {
      logger.error('[Step 1] Error during manual save:', {
        error: error instanceof Error ? error : String(error),
      });
      toast.error('An unexpected error occurred during save.');
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
  const selectedCurrency = watchedCurrency || CurrencyEnum.Values.USD;

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component

    const updateConvertedValues = async () => {
      if (selectedCurrency === 'USD') {
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
          selectedCurrency,
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
          selectedCurrency,
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
  }, [totalBudgetRaw, socialMediaBudgetRaw, selectedCurrency]);

  if (isLoading || !initialDataLoaded.current) {
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
                        <Input placeholder="E.g., Summer Skincare Launch" {...field} />
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
                          placeholder="E.g., Increase brand awareness by 15%"
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
                        <Input placeholder="Your Brand Name" {...field} />
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
                          placeholder="https://yourbrand.com"
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
              <div className="md:col-span-1 pt-4">
                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Time Zone *
                        {_isDetectingTimezone && ( // Use prefixed state
                          <Icon
                            iconId="faCircleNotchLight"
                            className="animate-spin h-3 w-3 ml-2 text-muted-foreground"
                          />
                        )}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={_isDetectingTimezone}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select timezone..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezonesData.map(option => (
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

              {/* Placeholder for alignment */}
              <div className="md:col-span-1"></div>

              {/* Total Budget */}
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="budget.total"
                  render={({ field: { onChange, ...fieldProps } }) => {
                    const displayValue = String(fieldProps.value ?? ''); // Display raw number for now
                    // const displayValue = formatCurrencyInput(fieldProps.value); // Use this if helper is restored
                    return (
                      <FormItem>
                        <FormLabel>Total Budget *</FormLabel>
                        <FormControl>
                          <Input
                            type="number" // Use number type
                            placeholder="0"
                            {...fieldProps}
                            value={fieldProps.value ?? ''} // Bind directly to number value
                            onChange={e => {
                              const value = e.target.value;
                              // Allow empty input or convert to number
                              onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        {/* Display converted value from state */}
                        {_convertedTotalBudget && (
                          <FormDescription>{_convertedTotalBudget}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Social Media Budget */}
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="budget.socialMedia"
                  render={({ field: { onChange, ...fieldProps } }) => {
                    const displayValue = String(fieldProps.value ?? ''); // Display raw number
                    // const displayValue = formatCurrencyInput(fieldProps.value); // Use this if helper is restored
                    return (
                      <FormItem>
                        <FormLabel>Social Media Budget *</FormLabel>
                        <FormControl>
                          <Input
                            type="number" // Use number type
                            placeholder="0"
                            {...fieldProps}
                            value={fieldProps.value ?? ''} // Bind directly to number value
                            onChange={e => {
                              const value = e.target.value;
                              onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        {/* Display converted value from state */}
                        {_convertedSocialMediaBudget && (
                          <FormDescription>{_convertedSocialMediaBudget}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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
                    platform: PlatformEnumBackend.Values.INSTAGRAM, // Default platform
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

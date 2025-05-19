'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
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
  BudgetSchema,
} from '@/components/features/campaigns/types';
import { Currency as PrismaCurrency, Position as PrismaPosition } from '@prisma/client';
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
import { checkCampaignNameExists } from '@/lib/actions/campaigns';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// --- Define Toast Helper Functions Locally ---
const showSuccessToast = (message: string, iconId?: string) => {
  const finalIconId = iconId || 'faFloppyDiskLight';
  const successIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-success" />;
  toast.success(message, {
    duration: 3000,
    className: 'toast-success-custom', // Defined in globals.css
    icon: successIcon,
  });
};

const showErrorToast = (message: string, iconId?: string) => {
  const finalIconId = iconId || 'faTriangleExclamationLight';
  const errorIcon = <Icon iconId={finalIconId} className="h-5 w-5 text-destructive" />;
  toast.error(message, {
    duration: 5000,
    className: 'toast-error-custom', // Defined in globals.css
    icon: errorIcon,
  });
};
// --- End Toast Helper Functions ---

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
      position: data.primaryContact?.position || PrismaPosition.Director,
    },
    secondaryContact: data.secondaryContact?.email
      ? {
          firstName: data.secondaryContact?.firstName || '',
          surname: data.secondaryContact?.surname || '',
          email: data.secondaryContact?.email || '',
          position: data.secondaryContact?.position || PrismaPosition.Director,
        }
      : null,
    additionalContacts:
      data.additionalContacts
        ?.filter(c => c.email)
        .map(c => ({
          firstName: c.firstName || '',
          surname: c.surname || '',
          email: c.email || '',
          position: c.position || PrismaPosition.Director,
        })) || [],
    budget: data.budget
      ? {
          currency: data.budget.currency || PrismaCurrency.USD,
          total: parseFloat(parseCurrencyInput(data.budget.total?.toString() || '0')) || 0,
          socialMedia:
            parseFloat(parseCurrencyInput(data.budget.socialMedia?.toString() || '0')) || 0,
        }
      : ({
          currency: PrismaCurrency.USD,
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

// --- TimeZone FormField Internal Component ---
const TimeZoneFormFieldContent: React.FC<{
  field: any; // Adjust type as per react-hook-form FieldRenderProps if available
  localizationLoading: boolean;
}> = ({ field, localizationLoading }) => {
  const [open, setOpen] = React.useState(false);
  const selectedTimezoneLabel = timezonesData.find(tz => tz.value === field.value)?.label;

  return (
    <FormItem className="flex flex-col">
      <FormLabel className="flex items-center">
        Time Zone *
        {localizationLoading && (
          <Icon
            iconId="faCircleNotchLight"
            className="animate-spin h-3 w-3 ml-2 text-muted-foreground"
          />
        )}
      </FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={localizationLoading}
              className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
            >
              {field.value ? selectedTimezoneLabel : 'Select timezone...'}
              <Icon iconId="faChevronDownLight" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search timezone..." />
            <CommandList>
              <CommandEmpty>No timezone found.</CommandEmpty>
              <CommandGroup>
                {timezonesData.map(tz => (
                  <CommandItem
                    key={tz.value}
                    value={tz.value}
                    onSelect={currentValue => {
                      field.onChange(currentValue === field.value ? '' : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Icon
                      iconId="faCheckLight"
                      className={cn(
                        'mr-2 h-4 w-4',
                        field.value === tz.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {tz.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormDescription>Please select the primary timezone for this campaign.</FormDescription>
      <FormMessage />
    </FormItem>
  );
};
// --- End TimeZone FormField Internal Component ---

// --- Main Component ---
function Step1Content() {
  const {
    wizardState,
    updateWizardState,
    isLoading: isWizardLoading,
    saveProgress,
    stepsConfig,
    campaignId,
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
  const [isNameChecking, setIsNameChecking] = useState(false);

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
        position: PrismaPosition.Director,
      },
      additionalContacts: [],
      Influencer: [{ id: uuidv4(), platform: PlatformEnum.Instagram, handle: '' }],
    },
    mode: 'onChange',
  });

  // Debounced validation trigger specifically for the name field
  const debouncedNameCheck = useDebouncedCallback(async (nameValue: string) => {
    if (!nameValue || nameValue.trim().length === 0) {
      form.clearErrors('name');
      setIsNameChecking(false);
      return;
    }

    setIsNameChecking(true);
    logger.debug(`[Debounce] Triggering Zod validation for name: ${nameValue}`);
    await form.trigger('name');
    setIsNameChecking(false);
  }, 750);

  // --- Initial Value Calculation Effect (Updated) ---
  useEffect(() => {
    logger.debug('[Initial Value Calc Effect] Running Check...', {
      isWizardLoading,
      isLocationLoading: localization.isLoading,
      hasWizardState: !!wizardState,
      isExistingCampaign: !!wizardState?.id,
      initialFormStateExists: !!initialFormState,
      localizedTz: localization.timezone,
      localizedCurrency: localization.currency,
    });

    if (!isWizardLoading && !localization.isLoading && wizardState && initialFormState === null) {
      logger.info('[Initial Value Calc Effect] Conditions met. Calculating initial values...');

      const isExistingCampaign = !!wizardState.id;
      let timezoneToUse: string | null = null;
      let currencyToUse: PrismaCurrency | null = null;

      const savedTimezone = wizardState.timeZone;
      if (isExistingCampaign && savedTimezone) {
        timezoneToUse = savedTimezone;
        logger.info(
          `[Initial Value Calc Effect] Existing campaign: Using saved timezone: ${timezoneToUse}`
        );
      } else {
        timezoneToUse = localization.timezone;
        logger.info(
          `[Initial Value Calc Effect] ${isExistingCampaign ? 'Existing campaign (no saved TZ)' : 'New campaign'}: Using localized timezone: ${timezoneToUse}`
        );
      }

      const savedWizardCurrency = wizardState.budget?.currency;
      if (isExistingCampaign && savedWizardCurrency) {
        currencyToUse = savedWizardCurrency;
        logger.info(
          `[Initial Value Calc Effect] Existing campaign: Using saved currency: ${currencyToUse}`
        );
      } else if (!isExistingCampaign && localization.currency) {
        currencyToUse = localization.currency as PrismaCurrency;
        logger.info(
          `[Initial Value Calc Effect] New campaign: Using localized currency: ${currencyToUse}`
        );
      } else if (isExistingCampaign && !savedWizardCurrency && localization.currency) {
        currencyToUse = localization.currency as PrismaCurrency;
        logger.info(
          `[Initial Value Calc Effect] Existing campaign (no saved currency): Using localized currency: ${currencyToUse}`
        );
      }

      const finalTimezone = timezoneToUse || 'UTC';
      const finalCurrency = currencyToUse || PrismaCurrency.USD;

      logger.info('[Initial Value Calc Effect] Determined final initial values:', {
        finalTimezone,
        finalCurrency,
      });

      const initialData: Step1FormData = {
        name: typeof wizardState.name === 'string' ? wizardState.name : '',
        businessGoal:
          typeof wizardState.businessGoal === 'string' ? wizardState.businessGoal : null,
        brand: typeof wizardState.brand === 'string' ? wizardState.brand : '',
        website: typeof wizardState.website === 'string' ? wizardState.website : null,
        startDate: typeof wizardState.startDate === 'string' ? wizardState.startDate : null,
        endDate: typeof wizardState.endDate === 'string' ? wizardState.endDate : null,
        timeZone: finalTimezone,
        primaryContact:
          wizardState.primaryContact && Object.keys(wizardState.primaryContact).length > 0
            ? wizardState.primaryContact
            : { firstName: '', surname: '', email: '', position: PrismaPosition.Director },
        secondaryContact:
          wizardState.secondaryContact &&
          typeof wizardState.secondaryContact === 'object' &&
          Object.keys(wizardState.secondaryContact).length > 0
            ? wizardState.secondaryContact
            : null,
        additionalContacts: Array.isArray(wizardState.additionalContacts)
          ? wizardState.additionalContacts
          : [],
        budget:
          wizardState.budget &&
          typeof wizardState.budget === 'object' &&
          Object.keys(wizardState.budget).length > 0
            ? {
                currency: wizardState.budget.currency || finalCurrency,
                total: parseFloat(wizardState.budget.total?.toString() || '0') || 0,
                socialMedia: parseFloat(wizardState.budget.socialMedia?.toString() || '0') || 0,
              }
            : { currency: finalCurrency, total: 0, socialMedia: 0 },
        Influencer:
          wizardState.Influencer &&
          Array.isArray(wizardState.Influencer) &&
          wizardState.Influencer.length > 0
            ? wizardState.Influencer
            : [{ id: uuidv4(), platform: PlatformEnum.Instagram, handle: '' }],
      };

      setInitialFormState(initialData);
    }
  }, [
    isWizardLoading,
    localization.isLoading,
    localization.timezone,
    localization.currency,
    wizardState,
    initialFormState,
  ]);

  // --- Form Reset Effect (Updated) ---
  useEffect(() => {
    logger.debug('[Form Reset Effect] Running Check...', {
      initialFormStateExists: !!initialFormState,
      initialDataLoaded: initialDataLoaded.current,
      isLocationLoading: localization.isLoading,
    });

    if (initialFormState && !initialDataLoaded.current && !localization.isLoading) {
      logger.info(
        '[Form Reset Effect] Conditions met. Applying calculated initial values to form:',
        initialFormState
      );
      form.reset(initialFormState);
      initialDataLoaded.current = true;
    }
  }, [initialFormState, form.reset, form, localization.isLoading]);

  const {
    fields: influencerFields,
    append: appendInfluencer,
    remove: removeInfluencer,
  } = useFieldArray({
    control: form.control,
    name: 'Influencer',
    keyName: 'fieldId',
  });

  const {
    fields: _contactFields,
    append: _appendContact,
    remove: _removeContact,
  } = useFieldArray({
    control: form.control,
    name: 'additionalContacts',
  });

  const handleStepClick = (step: number) => {
    console.log('Navigate to step', step);
  };

  const onSubmitAndNavigate = async () => {
    setIsSubmitting(true);
    logger.info('[Step 1] Attempting Next...');

    // --- START NEW EXPLICIT CHECK ---
    const currentName = form.getValues('name');
    if (currentName && currentName.trim().length > 0) {
      setIsNameChecking(true); // Show loading indicator for the button potentially
      // Clear previous manual name error before re-checking
      // Check if form.clearErrors can take a specific field, otherwise let Zod handle it or use setError with no message
      // For now, we rely on setError below to override or Zod to clear if it becomes valid.

      try {
        const nameExists = await checkCampaignNameExists(currentName, campaignId || undefined);
        if (nameExists) {
          const msg = 'A campaign with this name already exists. Please choose a different name.';
          form.setError('name', {
            type: 'manual',
            message: msg,
          });
          showErrorToast(msg);
          setIsNameChecking(false);
          setIsSubmitting(false);
          return; // Block submission
        }
      } catch (apiError) {
        logger.error(
          '[Submit] API Error checking campaign name:',
          apiError instanceof Error
            ? { message: apiError.message, stack: apiError.stack }
            : { error: String(apiError) }
        );
        const msg = 'Could not verify campaign name due to a server issue. Please try again.';
        form.setError('name', {
          type: 'manual',
          message: msg,
        });
        showErrorToast(msg);
        setIsNameChecking(false);
        setIsSubmitting(false);
        return; // Block submission
      } finally {
        setIsNameChecking(false); // Ensure it's always turned off
      }
    }
    // --- END NEW EXPLICIT CHECK ---

    const isValid = await form.trigger(); // This will run all other Zod validations
    if (!isValid || form.formState.errors.name) {
      // Also check specifically for name error after trigger
      logger.warn('[Step 1] Validation failed or name error still present after trigger.', {
        errors: form.formState.errors,
      });
      showErrorToast('Please fix the errors before proceeding.');
      setIsSubmitting(false);
      return;
    }

    const formData = form.getValues();
    logger.info('[Step 1] Form data is valid.');

    try {
      // Prepare payload for the CURRENT step (Step 1)
      const payload = await preparePayload(formData, 1);
      logger.info('[Step 1] Payload prepared for save before navigating.');

      // It's generally better to let saveProgress handle the wizardState update upon successful API response.
      // updateWizardState(payload); // Consider if this immediate update is needed or if saveProgress handles it.
      const savedCampaignId = await saveProgress(payload);

      if (savedCampaignId) {
        logger.info('[Step 1] Save successful, navigating to Step 2');
        // Use the campaignId from the context, which should be updated by saveProgress if it was a new campaign
        // or use the returned savedCampaignId which confirms the ID used for the save.
        const navigationId = wizardState?.id || savedCampaignId;
        if (navigationId) {
          router.push(`/campaigns/wizard/step-2?id=${navigationId}`);
        } else {
          showErrorToast('Could not determine campaign ID for navigation after save.');
        }
      } else {
        logger.error('[Step 1] Save failed after validation.');
      }
    } catch (error) {
      logger.error('[Step 1] Error during submission:', {
        error: error instanceof Error ? error : String(error),
      });
      showErrorToast('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (): Promise<boolean> => {
    setIsSubmitting(true);
    logger.info('[Step 1] Attempting Manual Save...');

    // --- START NEW EXPLICIT NAME CHECK for SAVE ---
    const currentName = form.getValues('name');
    if (currentName && currentName.trim().length > 0) {
      setIsNameChecking(true); // Show visual cue if any tied to this
      try {
        const nameExists = await checkCampaignNameExists(currentName, campaignId || undefined);
        if (nameExists) {
          const msg =
            'A campaign with this name already exists. Please update the name before saving.';
          form.setError('name', {
            type: 'manual',
            message: msg,
          });
          showErrorToast(msg);
          setIsNameChecking(false);
          setIsSubmitting(false);
          return false; // Indicate save failed
        }
      } catch (apiError) {
        logger.error(
          '[Save] API Error checking campaign name:',
          apiError instanceof Error
            ? { message: apiError.message, stack: apiError.stack }
            : { error: String(apiError) }
        );
        const msg =
          'Could not verify campaign name due to a server issue. Please try again before saving.';
        form.setError('name', {
          type: 'manual',
          message: msg,
        });
        showErrorToast(msg);
        setIsNameChecking(false);
        setIsSubmitting(false);
        return false; // Indicate save failed
      } finally {
        setIsNameChecking(false);
      }
    }
    // --- END NEW EXPLICIT NAME CHECK for SAVE ---

    const isValid = await form.trigger(); // Validate other fields
    if (!isValid || form.formState.errors.name) {
      // Re-check name error after trigger, in case Zod caught something else
      logger.warn('[Step 1] Validation failed for manual save, or name error exists.', {
        errors: form.formState.errors,
      });
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
        showSuccessToast('Progress saved!');
        return true;
      } else {
        logger.error('[Step 1] Manual save failed.');
        showErrorToast('An unexpected error occurred during save.');
        return false;
      }
    } catch (error) {
      logger.error('[Step 1] Error during manual save:', {
        error: error instanceof Error ? error : String(error),
      });
      showErrorToast('An unexpected error occurred during save.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const [watchedTotal, watchedSocial, watchedCurrency] = form.watch([
    'budget.total',
    'budget.socialMedia',
    'budget.currency',
  ]);
  const totalBudgetRaw = parseFloat(parseCurrencyInput(String(watchedTotal || '0')));
  const socialMediaBudgetRaw = parseFloat(parseCurrencyInput(String(watchedSocial || '0')));
  const selectedCurrencyForConversion = watchedCurrency || PrismaCurrency.USD;

  useEffect(() => {
    let isMounted = true;

    const updateConvertedValues = async () => {
      if (selectedCurrencyForConversion === 'USD') {
        if (isMounted) {
          _setConvertedTotalBudget(null);
          _setConvertedSocialMediaBudget(null);
        }
        return;
      }

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
    };
  }, [totalBudgetRaw, socialMediaBudgetRaw, selectedCurrencyForConversion]);

  const watchedStartDate = form.watch('startDate');
  const watchedEndDate = form.watch('endDate');
  useEffect(() => {
    const duration = calculateDuration(watchedStartDate, watchedEndDate);
    setCampaignDuration(duration);
  }, [watchedStartDate, watchedEndDate]);

  const currencySymbol = getCurrencySymbol(watchedCurrency);

  if (isWizardLoading || !initialDataLoaded.current || localization.isLoading) {
    return <WizardSkeleton step={1} />;
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitAndNavigate)}
          className="space-y-8"
          id={`wizard-step-1-form`}
        >
          {/* Campaign Details Card */}
          <Card className="mb-6 border border-gray-300 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Please provide the core details for your new campaign.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Summer Skincare Launch"
                          {...field}
                          onChange={e => {
                            field.onChange(e);
                            debouncedNameCheck(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {isNameChecking && <FormDescription>Checking name...</FormDescription>}
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1">
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

          {/* Schedule & Timezone Card */}
          <Card className="mb-6 border border-gray-300 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle>Schedule & Timezone</CardTitle>
              <CardDescription>
                Set the campaign dates and select the relevant timezone.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Row 1: Start Date and End Date */}
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

              {/* Row 2: Duration Badge and Empty Cell */}
              <div className="md:col-span-1 flex items-center min-h-[2.25rem] pt-1">
                {campaignDuration && (
                  <Badge variant="outline" className="font-normal">
                    <Icon iconId="faCalendarDaysLight" className="mr-1.5 h-3 w-3" />
                    Duration: {campaignDuration}
                  </Badge>
                )}
              </div>
              <div className="md:col-span-1"></div>

              {/* Row 3: Time Zone */}
              <div className="md:col-span-2 pt-2">
                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => {
                    return (
                      <TimeZoneFormFieldContent
                        field={field}
                        localizationLoading={localization.isLoading}
                      />
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="mb-6 border border-gray-300 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Specify the primary and secondary points of contact for this campaign.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                            {Object.values(PrismaPosition).map(option => (
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
                            {Object.values(PrismaPosition).map(option => (
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
            </CardContent>
          </Card>

          {/* Budget Card */}
          <Card className="mb-6 border border-gray-300 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle>Budget</CardTitle>
              <CardDescription>Set the budget for the campaign.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="budget.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PrismaCurrency).map(option => (
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
              <div className="md:col-span-1"></div>
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="budget.total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget *</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            className="pl-7"
                            {...field}
                            value={formatNumberWithCommas(field.value)}
                            onChange={e => {
                              field.onChange(parseFormattedNumber(e.target.value));
                            }}
                            onFocus={e => {
                              if (e.target.value === '0') {
                                e.target.select();
                              }
                            }}
                          />
                        </FormControl>
                      </div>
                      {_convertedTotalBudget && (
                        <FormDescription>{_convertedTotalBudget}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="budget.socialMedia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media Budget *</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            className="pl-7"
                            {...field}
                            value={formatNumberWithCommas(field.value)}
                            onChange={e => {
                              field.onChange(parseFormattedNumber(e.target.value));
                            }}
                            onFocus={e => {
                              if (e.target.value === '0') {
                                e.target.select();
                              }
                            }}
                          />
                        </FormControl>
                      </div>
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

          {/* Influencer Selection Card */}
          <Card className="mb-6 border border-gray-300 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle>Influencer Selection</CardTitle>
              <CardDescription>
                Add the social media platform and handle for each influencer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {influencerFields.map((field, index) => (
                <InfluencerEntry
                  key={field.fieldId}
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

          {/* Error Alert */}
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
        isNextDisabled={!!form.formState.errors.name || isNameChecking}
        onStepClick={handleStepClick}
        onBack={null}
      />
    </FormProvider>
  );
}

export default Step1Content;
